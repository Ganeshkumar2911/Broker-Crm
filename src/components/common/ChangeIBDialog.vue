<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <h2 class="text-sm font-semibold text-primary-text">Change IB</h2>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
          @click="closeDialog"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">

        <!-- Client Info -->
        <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
          <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-2">Client</p>
          <p class="text-sm font-semibold text-primary-text">{{ client.name }}</p>
          <p class="text-[11px] text-secondary-text mt-0.5">{{ client.email }}</p>
        </div>

        <!-- Current IB -->
        <div class="bg-background border border-primary-border rounded-xl px-4 py-3 space-y-2">
          <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1">Current IB</p>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Name</span>
            <span class="text-xs font-medium text-primary-text">{{ currentIb.ib_name }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Email</span>
            <span class="text-xs font-medium text-primary-text">{{ currentIb.ib_email }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Referral Code</span>
            <span class="text-xs font-medium text-primary-text">{{ currentIb.ib_referral_code }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Active Accounts</span>
            <span class="text-xs font-medium text-primary-text">{{ currentIb.active_accounts }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-secondary-text">Active Followings</span>
            <span class="text-xs font-medium text-primary-text">{{ currentIb.active_followings }}</span>
          </div>
        </div>

        <!-- New IB Search — NOT inside overflow container -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Select New IB</p>
          <BaseSelect
            v-model="selectedNewIb"
            :options="newIbOptions"
            :isLoading="searchLoading"
            placeholder="Search for an IB..."
            searchable
            @search="onIbSearch"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          :disabled="!hasValidSelection || isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Changing...' : 'Change IB' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open:   { type: Boolean, default: false },
  client: { type: Object,  default: () => ({}) },
})

const emit = defineEmits(['close', 'success'])

const snackbar = useSnackbarStore()

const currentIb = reactive({
  ib_name:          '',
  ib_referral_code: '',
  ib_email:         '',
  active_accounts:  0,
  active_followings: 0,
})

const newIbOptions   = ref([])
const selectedNewIb  = ref(null)
const searchLoading  = ref(false)
const isSubmitting   = ref(false)

let ibSearchTimer = null

const hasValidSelection = computed(() =>
  selectedNewIb.value !== null && selectedNewIb.value !== props.client.ib_id
)

watch(
  () => [props.open, props.client?.id],
  ([isOpen]) => {
    if (isOpen && props.client) populateCurrentIb()
  },
  { immediate: true }
)

const populateCurrentIb = () => {
  currentIb.ib_name          = props.client.ib_name          || '—'
  currentIb.ib_referral_code = props.client.ib_referral_code || '—'
  currentIb.ib_email         = props.client.ib_email         || '—'
  currentIb.active_accounts  = props.client.active_accounts  || 0
  currentIb.active_followings = props.client.active_followings || 0
  newIbOptions.value  = []
  selectedNewIb.value = null
}

const onIbSearch = (query) => {
  clearTimeout(ibSearchTimer)
  ibSearchTimer = setTimeout(() => searchIbs(query), 350)
}

const searchIbs = (query = '') => {
  if (!query.trim()) { newIbOptions.value = []; return }
  searchLoading.value = true

  apiRequest(urls.KEYS.GET, urls.ibLedger.allIbs, {
    params: { search: query.trim() },
    isTokenRequired: true,
    onSuccess: (res) => {
      newIbOptions.value = (res?.data || []).map((ib) => ({
        label: ib.label_name ?? ib.name ?? ib.ib_name ?? ib.email ?? `IB ${ib.ib_id ?? ib.id}`,
        value: ib.ib_id ?? ib.id ?? ib.user_id,
      }))
      searchLoading.value = false
    },
    onFailure: (err) => {
      newIbOptions.value  = []
      searchLoading.value = false
      snackbar.show(err?.message || 'Failed to fetch IBs.', 'error')
    },
  })
}

const handleSubmit = () => {
  if (!hasValidSelection.value || !props.client.id) return
  isSubmitting.value = true

  apiRequest(urls.KEYS.PUT, urls.clientList.changeIB, {
    data: { client_id: props.client.id, new_ib_user_id: selectedNewIb.value },
    isTokenRequired: true,
    onSuccess: () => {
      snackbar.show('IB changed successfully.', 'success')
      isSubmitting.value = false
      emit('success')
      closeDialog()
    },
    onFailure: (err) => {
      snackbar.show(err?.message || 'Failed to change IB.', 'error')
      isSubmitting.value = false
    },
  })
}

const closeDialog = () => {
  emit('close')
  setTimeout(() => {
    newIbOptions.value  = []
    selectedNewIb.value = null
  }, 100)
}
</script>