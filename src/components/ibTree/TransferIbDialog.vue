<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click="handleClose"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md shadow-xl"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ArrowLeftRight class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-semibold text-primary-text">Transfer Parent IB</h2>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
          @click="handleClose"
          :disabled="submitting"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <!-- Selected IB details -->
        <div class="bg-background/40 border border-primary-border/30 rounded-xl px-4 py-3 space-y-1">
          <p class="text-[10px] uppercase tracking-wide text-secondary-text">IB to Transfer</p>
          <p class="text-sm font-semibold text-primary-text">{{ ib?.name || '—' }}</p>
          <div class="flex items-center gap-3 text-xs text-secondary-text">
            <span>Code: <span class="font-mono text-primary-text">{{ ib?.referral_code || '—' }}</span></span>
            <span>·</span>
            <span>Split: <span class="text-primary-text">{{ ib?.split ?? 0 }}%</span></span>
          </div>
        </div>

        <!-- Current Parent details -->
        <div class="bg-background/40 border border-primary-border/30 rounded-xl px-4 py-3 space-y-2">
          <p class="text-[10px] uppercase tracking-wide text-secondary-text">Current Parent</p>
          <div v-if="currentParent" class="space-y-1">
            <p class="text-sm font-semibold text-primary-text">{{ currentParent.name }}</p>
            <div class="flex items-center gap-3 text-xs text-secondary-text">
              <span>Code: <span class="font-mono text-primary-text">{{ currentParent.referral_code || '—' }}</span></span>
              <span>·</span>
              <span>Split: <span class="text-primary-text">{{ currentParent.split ?? 0 }}%</span></span>
            </div>
          </div>
          <p v-else class="text-xs text-primary-text font-medium italic">
            None (Root level IB)
          </p>
        </div>

        <!-- Dropdown select new parent -->
        <div>
          <label class="block text-xs font-medium text-secondary-text mb-1.5">Select New Parent</label>
          <BaseSelect
            v-model="selectedNewParent"
            :options="newParentOptions"
            :isLoading="searchLoading"
            placeholder="Search and select new parent..."
            searchable
            :disabled="submitting"
            @search="onIbSearch"
          />
          <p class="text-[10px] text-primary-red mt-1.5">
            Note: You cannot select this IB itself or any of its sub-IBs to prevent hierarchy loops.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          :disabled="submitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          :disabled="submitting || !hasValidSelection"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ submitting ? 'Transferring...' : 'Transfer' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowLeftRight, X, Loader2 } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { useIbTreeStore } from '@/stores/ibTree/ibTree'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  ib: { type: Object, default: null }
})

const emit = defineEmits(['close', 'success'])

const snackbar = useSnackbarStore()
const store = useIbTreeStore()

const submitting = ref(false)
const searchLoading = ref(false)
const selectedNewParent = ref(null)
const newParentOptions = ref([])
let searchTimer = null

// Helper to recursively find a node by ID in the tree
const findNodeById = (nodes, id) => {
  if (!id) return null
  for (const node of nodes) {
    if (node.ib_id === id) return node
    if (node.children?.length) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// Find current parent node in the locally cached tree data
const currentParent = computed(() => {
  if (!props.ib || !props.ib.parent_ib_id) return null
  return findNodeById(store.data, props.ib.parent_ib_id)
})

// Collect current node ID + all its descendant IDs to prevent cyclic parenting
const disallowedIds = computed(() => {
  if (!props.ib) return []
  const ids = [props.ib.ib_id]

  const collectChildren = (node) => {
    if (node.children?.length) {
      for (const child of node.children) {
        ids.push(child.ib_id)
        collectChildren(child)
      }
    }
  }
  
  collectChildren(props.ib)
  return ids
})

const hasValidSelection = computed(() => {
  if (!props.ib || selectedNewParent.value === null) return false
  
  // If moving to root, that is always a valid change unless already at root
  if (selectedNewParent.value === '__root__') {
    return props.ib.parent_ib_id !== null
  }
  
  // Cannot select current parent
  return selectedNewParent.value !== props.ib.parent_ib_id
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    selectedNewParent.value = null
    newParentOptions.value = []
    // Initialize default option to move to Root (if not already at root)
    if (props.ib && props.ib.parent_ib_id !== null) {
      newParentOptions.value = [
        { label: 'None (Move to Root Level)', value: '__root__' }
      ]
    }
  }
})

const handleClose = () => {
  if (submitting.value) return
  emit('close')
}

const onIbSearch = (query) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchIbs(query)
  }, 350)
}

const searchIbs = (query = '') => {
  if (!query.trim()) {
    newParentOptions.value = props.ib?.parent_ib_id !== null
      ? [{ label: 'None (Move to Root Level)', value: '__root__' }]
      : []
    return
  }

  searchLoading.value = true

  apiRequest(urls.KEYS.GET, urls.ibLedger.allIbs, {
    params: { search: query.trim() },
    isTokenRequired: true,
    onSuccess: (res) => {
      const results = (res?.data || [])
        .filter((item) => {
          const id = item.ib_id ?? item.id ?? item.user_id
          return !disallowedIds.value.includes(id)
        })
        .map((item) => ({
          label: item.label_name ?? item.name ?? item.ib_name ?? item.email ?? `IB ${item.ib_id ?? item.id}`,
          value: item.ib_id ?? item.id ?? item.user_id
        }))

      // Prepend "Move to Root" option if the IB is not already at root
      if (props.ib && props.ib.parent_ib_id !== null) {
        newParentOptions.value = [
          { label: 'None (Move to Root Level)', value: '__root__' },
          ...results
        ]
      } else {
        newParentOptions.value = results
      }
      searchLoading.value = false
    },
    onFailure: (err) => {
      newParentOptions.value = props.ib?.parent_ib_id !== null
        ? [{ label: 'None (Move to Root Level)', value: '__root__' }]
        : []
      searchLoading.value = false
      snackbar.show(err?.message || 'Failed to search IBs.', 'error')
    }
  })
}

const submit = () => {
  if (!props.ib || !hasValidSelection.value) return

  submitting.value = true
  const newParentId = selectedNewParent.value === '__root__' ? null : selectedNewParent.value

  const payload = {
    ib_id: props.ib.ib_id,
    new_parent_ib_id: newParentId
  }

  apiRequest(urls.KEYS.POST, urls.ibTree.transfer, {
    data: payload,
    isTokenRequired: true,
    onSuccess: (res) => {
      snackbar.show(res?.message || 'IB parent transferred successfully.', 'success')
      submitting.value = false
      emit('success')
      emit('close')
    },
    onFailure: (err) => {
      snackbar.show(err?.message || 'Failed to transfer IB parent.', 'error')
      submitting.value = false
    }
  })
}
</script>
