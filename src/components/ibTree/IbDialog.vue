<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { X, Loader2, Eye, EyeOff } from 'lucide-vue-next'
import { useIbTreeStore } from '@/stores/ibTree/ibTree'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  parentIbId: { type: Number, default: null },
})

const emit = defineEmits(['close'])

const store = useIbTreeStore()
const snackbar = useSnackbarStore()

const form = ref({
  client_id: null,
  password: '',
  split_percentage: null,
})

const showPassword = ref(false)
const searchLoading = ref(false)
const clientOptions = ref([])

const isEdit = computed(() => !!props.editData)

const title = computed(() => {
  if (isEdit.value) return 'Edit IB'
  return props.parentIbId ? 'Add Sub-IB' : 'Add IB'
})

const isValid = computed(() => {
  if (isEdit.value) {
    return (
      form.value.split_percentage !== null &&
      form.value.split_percentage !== '' &&
      form.value.split_percentage >= 0 &&
      form.value.split_percentage <= 100
    )
  } else {
    return (
      form.value.client_id !== null &&
      form.value.split_percentage !== null &&
      form.value.split_percentage !== '' &&
      form.value.split_percentage >= 0 &&
      form.value.split_percentage <= 100 &&
      form.value.password &&
      form.value.password.trim().length > 0
    )
  }
})

// Recursive search helper to find the parent node in the IB tree
const findIbInTree = (nodes, id) => {
  for (const node of nodes) {
    if (node.ib_id === id) return node
    if (node.children?.length) {
      const found = findIbInTree(node.children, id)
      if (found) return found
    }
  }
  return null
}

const parentIbNode = computed(() => {
  if (!props.parentIbId) return null
  return findIbInTree(store.data, props.parentIbId)
})

let clientSearchTimer = null

const onClientSearch = (query) => {
  clearTimeout(clientSearchTimer)
  clientSearchTimer = setTimeout(() => searchClients(query), 350)
}

const searchClients = (query = '') => {
  if (!query.trim()) {
    clientOptions.value = []
    return
  }
  searchLoading.value = true

  apiRequest(urls.KEYS.GET, urls.clientLedger.allClients, {
    params: { search: query.trim() },
    isTokenRequired: true,
    onSuccess: (res) => {
      clientOptions.value = (res?.data || []).map((client) => {
        const isIb = client.is_ib === true
        return {
          label: isIb ? `${client.name || client.email} (Already IB)` : (client.name || client.email),
          value: client.id,
          disabled: isIb,
        }
      })
      searchLoading.value = false
    },
    onFailure: (err) => {
      clientOptions.value = []
      searchLoading.value = false
      snackbar.show(err?.message || 'Failed to fetch clients.', 'error')
    },
  })
}

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let pass = ''
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const nums = '0123456789'
  const specials = '!@#$%^&*'
  pass += upper[Math.floor(Math.random() * upper.length)]
  pass += lower[Math.floor(Math.random() * lower.length)]
  pass += nums[Math.floor(Math.random() * nums.length)]
  pass += specials[Math.floor(Math.random() * specials.length)]
  
  for (let i = 4; i < 12; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }
  pass = pass.split('').sort(() => 0.5 - Math.random()).join('')
  form.value.password = pass
  showPassword.value = true
}

watch(() => props.open, (val) => {
  if (val) {
    if (isEdit.value) {
      form.value = {
        client_id: props.editData?.ib_id ?? null,
        password: '',
        split_percentage: props.editData?.split ?? null,
      }
    } else {
      form.value = {
        client_id: null,
        password: '',
        split_percentage: null,
      }
      clientOptions.value = []
    }
    showPassword.value = false
  }
})

const submit = () => {
  if (isEdit.value) {
    store.saveIb({
      email: props.editData?.email || props.editData?.name,
      password: form.value.password || undefined,
      split_percentage: form.value.split_percentage,
      parent_ib_id: props.parentIbId ?? undefined,
      ib_id: props.editData?.ib_id ?? undefined,
    })
  } else {
    store.createIbFromClient({
      clientId: form.value.client_id,
      parentIbId: props.parentIbId ?? null,
      splitPercentage: form.value.split_percentage,
      affiliatePassword: form.value.password,
    })
  }

  // close after action — watch actionLoading transition
  const unwatch = watch(() => store.actionLoading, (val) => {
    if (!val) {
      emit('close')
      unwatch()
    }
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md shadow-2xl overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <h2 class="text-sm font-semibold text-primary-text">{{ title }}</h2>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">
        <!-- Static Client Reference (when editing) -->
        <div v-if="isEdit && editData" class="bg-background border border-primary-border rounded-xl px-4 py-3">
          <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1 font-medium">Client Reference</p>
          <p class="text-xs font-semibold text-primary-text">{{ editData.name || '—' }} (ID: {{ editData.ib_id }})</p>
          <p class="text-[11px] text-secondary-text mt-0.5">{{ editData.email || '—' }}</p>
        </div>

        <!-- Static Parent IB Reference (when adding/non-edit) -->
        <div v-else-if="!isEdit" class="bg-background border border-primary-border rounded-xl px-4 py-3">
          <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1 font-medium">Parent IB</p>
          <p v-if="parentIbNode" class="text-xs font-semibold text-primary-text">{{ parentIbNode.name || '—' }} (ID: {{ parentIbNode.ib_id }})</p>
          <p v-if="parentIbNode" class="text-[11px] text-secondary-text mt-0.5">{{ parentIbNode.email || '—' }}</p>
          <p v-else class="text-xs font-semibold text-primary-text">None (Set as Master IB)</p>
        </div>

        <!-- Client Search Dropdown (only when creating/non-edit) -->
        <div v-if="!isEdit" class="flex flex-col gap-1">
          <label class="text-secondary-text text-[11px] font-semibold">Select Client <span class="text-red-500">*</span></label>
          <BaseSelect
            v-model="form.client_id"
            :options="clientOptions"
            :isLoading="searchLoading"
            placeholder="Search client by name or email..."
            searchable
            @search="onClientSearch"
            variant="surface"
          />
        </div>

        <!-- Split Percentage -->
        <div class="flex flex-col gap-1">
          <label class="text-secondary-text text-[11px] font-semibold">Split Percentage (%) <span class="text-red-500">*</span></label>
          <input
            v-model.number="form.split_percentage"
            type="number"
            min="0"
            max="100"
            placeholder="e.g., 50"
            :disabled="store.actionLoading"
            class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <label class="text-secondary-text text-[11px] font-semibold">
              Password <span v-if="isEdit" class="text-secondary-text">(optional)</span><span v-else class="text-red-500">*</span>
            </label>
            <button 
              v-if="!isEdit"
              type="button" 
              class="text-[10px] text-primary hover:underline font-medium focus:outline-none"
              @click="generateRandomPassword"
            >
              Generate Password
            </button>
          </div>
          <div class="relative flex items-center">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :disabled="store.actionLoading"
              class="w-full bg-background border border-primary-border rounded-lg pl-3 pr-10 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors font-mono disabled:opacity-50"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 text-secondary-text hover:text-primary-text transition-colors focus:outline-none"
            >
              <Eye v-if="!showPassword" class="w-3.5 h-3.5" />
              <EyeOff v-else class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          :disabled="store.actionLoading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ store.actionLoading ? 'Saving...' : 'Save' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>