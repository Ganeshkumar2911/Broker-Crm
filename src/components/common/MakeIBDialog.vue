<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-all duration-300"
    @click="closeDialog"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md shadow-2xl overflow-hidden transform scale-100 transition-all duration-300"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0">
        <div class="flex items-center gap-2">
          <UserPlus class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-semibold text-primary-text">Make Introducing Broker (IB)</h2>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
          @click="closeDialog"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4 bg-card-background">
        <!-- Client Info Header -->
        <div class="bg-background border border-primary-border rounded-xl px-4 py-3">
          <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-1 font-medium">Client Reference</p>
          <p class="text-xs font-semibold text-primary-text">{{ client.name || '—' }} (ID: {{ client.id }})</p>
          <p class="text-[11px] text-secondary-text mt-0.5">{{ client.email || '—' }}</p>
        </div>

        <!-- Form fields stack -->
        <div class="space-y-4">
          <!-- Parent IB ID (Dropdown) -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-semibold">Parent IB</label>
            <BaseSelect
              v-model="form.parent_ib_id"
              :options="ibOptions"
              :isLoading="searchLoading"
              placeholder="Search Parent IB..."
              searchable
              @search="onIbSearch"
              variant="surface"
            />
            <p class="text-[10px] text-secondary-text mt-1 leading-relaxed">
              * Note: If the Parent IB is not selected, this client will be set as a Master IB.
            </p>
          </div>

          <!-- Split Percentage -->
          <div class="flex flex-col gap-1">
            <label class="text-secondary-text text-[11px] font-semibold">Split Percentage (%) <span class="text-red-500">*</span></label>
            <input
              v-model.number="form.split_percentage"
              type="number"
              min="0"
              max="100"
              class="w-full bg-background border border-primary-border rounded-lg px-3 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors"
              placeholder="e.g., 20"
            />
          </div>

          <!-- Affiliate Password -->
          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <label class="text-secondary-text text-[11px] font-semibold">Affiliate Password <span class="text-red-500">*</span></label>
              <button 
                type="button" 
                class="text-[10px] text-primary hover:underline font-medium focus:outline-none"
                @click="generateRandomPassword"
              >
                Generate Password
              </button>
            </div>
            <div class="relative flex items-center">
              <input
                v-model="form.affiliate_password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full bg-background border border-primary-border rounded-lg pl-3 pr-10 py-2 text-primary-text text-xs outline-none focus:border-primary transition-colors font-mono"
                placeholder="e.g., Test@123"
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
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background">
        <button
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          :disabled="!isValid || isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Creating...' : 'Make IB' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { X, Loader2, UserPlus, Eye, EyeOff } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close', 'success'])

const snackbar = useSnackbarStore()

const form = reactive({
  parent_ib_id: null,
  split_percentage: null,
  affiliate_password: '',
})

const newIbOptions = ref([])
const searchLoading = ref(false)
const isSubmitting = ref(false)
const showPassword = ref(false)

let ibSearchTimer = null

const ibOptions = computed(() => {
  return [
    { label: 'None (Set as Master IB)', value: null },
    ...newIbOptions.value
  ]
})

const isValid = computed(() => {
  return (
    form.split_percentage !== null &&
    form.split_percentage !== '' &&
    form.split_percentage >= 0 &&
    form.split_percentage <= 100 &&
    form.affiliate_password &&
    form.affiliate_password.trim().length > 0
  )
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  }
)

const resetForm = () => {
  form.parent_ib_id = null
  form.split_percentage = null
  form.affiliate_password = ''
  newIbOptions.value = []
  searchLoading.value = false
  isSubmitting.value = false
  showPassword.value = false
}

const onIbSearch = (query) => {
  clearTimeout(ibSearchTimer)
  ibSearchTimer = setTimeout(() => searchIbs(query), 350)
}

const searchIbs = (query = '') => {
  if (!query.trim()) {
    newIbOptions.value = []
    return
  }
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
      newIbOptions.value = []
      searchLoading.value = false
      snackbar.show(err?.message || 'Failed to fetch IBs.', 'error')
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
  form.affiliate_password = pass
  showPassword.value = true
}

const handleSubmit = () => {
  if (!isValid.value || !props.client.id) return
  isSubmitting.value = true

  const payload = {
    parent_ib_id: form.parent_ib_id,
    split_percentage: Number(form.split_percentage),
    affiliate_password: form.affiliate_password.trim(),
  }

  const url = `${urls.clientList.createIB}/${props.client.id}`

  apiRequest(urls.KEYS.POST, url, {
    data: payload,
    isTokenRequired: true,
    onSuccess: () => {
      snackbar.show('Client successfully converted to IB.', 'success')
      isSubmitting.value = false
      emit('success')
      closeDialog()
    },
    onFailure: (err) => {
      snackbar.show(err?.message || 'Failed to convert client to IB.', 'error')
      isSubmitting.value = false
    },
  })
}

const closeDialog = () => {
  emit('close')
}
</script>
