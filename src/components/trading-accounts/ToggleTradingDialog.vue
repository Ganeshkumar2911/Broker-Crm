<script setup>
import { computed, ref, watch } from 'vue'
import { AlertTriangle, Power, X, Loader2 } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open: { type: Boolean, default: false },
  account: { type: Object, default: null },
})

const emit = defineEmits(['close', 'success'])

const snackbar = useSnackbarStore()
const loading = ref(false)

const userId = computed(() => props.account?.user_id)
const tradingAccountId = computed(() => props.account?.account_id)
const accountNumber = computed(() => props.account?.account_number ?? '—')
const accountType = computed(() => props.account?.trading_type ?? props.account?.account_type ?? '—')
const platform = computed(() => props.account?.broker ?? props.account?.server ?? '—')
const isActive = computed(() => Boolean(props.account?.is_active))

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      loading.value = false
    }
  }
)

const closeDialog = () => {
  if (loading.value) return
  emit('close')
}

const handleToggleTrading = () => {
  if (loading.value || !tradingAccountId.value || !userId.value) return

  loading.value = true

  const willDisable = isActive.value

  const successHandler = (res) => {
    loading.value = false
    snackbar.show(
      res?.message || `Trading ${willDisable ? 'disabled' : 'enabled'} successfully.`,
      'success'
    )
    emit('success')
    emit('close')
  }

  const failureHandler = (err) => {
    loading.value = false
    snackbar.show(
      err?.message || err?.error || 'Failed to toggle trading status.',
      'error'
    )
  }

  apiRequest(urls.KEYS.POST, urls.tradingAccounts.toggleTrading, {
    data: {
      user_id: userId.value,
      trading_account_id: tradingAccountId.value,
      disable_trade: willDisable,
    },
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-primary-border bg-card-background shadow-xl overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-primary-border px-6 py-4">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="isActive ? 'bg-primary-red/10 text-primary-red' : 'bg-primary-green/10 text-primary-green'"
          >
            <Power class="h-4 w-4" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-primary-text">Toggle Trading Status</h2>
            <p class="text-[11px] text-secondary-text">Confirm action for account #{{ accountNumber }}</p>
          </div>
        </div>
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-background cursor-pointer"
          @click="closeDialog"
        >
          <X class="h-4 w-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4 px-6 py-5">
        <div class="flex items-start gap-3 p-3 rounded-xl border border-primary-border bg-background/50">
          <AlertTriangle class="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p class="text-xs text-primary-text leading-relaxed">
            Are you sure you want to
            <span class="font-semibold" :class="isActive ? 'text-primary-red' : 'text-primary-green'">
              {{ isActive ? 'disable' : 'enable' }}
            </span>
            trading for this account?
          </p>
        </div>

        <!-- Account details card -->
        <div class="rounded-xl border border-primary-border bg-background p-4 space-y-2.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-secondary-text">Account Number</span>
            <span class="font-semibold text-primary-text tabular-nums">#{{ accountNumber }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-secondary-text">Trading Type</span>
            <span class="font-medium text-primary-text capitalize">{{ accountType }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-secondary-text">Platform</span>
            <span class="font-medium text-primary-text">{{ platform }}</span>
          </div>
          <div class="flex items-center justify-between text-xs pt-1 border-t border-primary-border">
            <span class="text-secondary-text">Current Status</span>
            <span
              class="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize"
              :class="isActive ? 'bg-primary-green/20 text-primary-green border border-primary-green/30' : 'bg-primary-red/20 text-primary-red border border-primary-red/30'"
            >
              {{ isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-secondary-text">New Status</span>
            <span
              class="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize"
              :class="!isActive ? 'bg-primary-green/20 text-primary-green border border-primary-green/30' : 'bg-primary-red/20 text-primary-red border border-primary-red/30'"
            >
              {{ !isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 border-t border-primary-border px-6 py-4">
        <button
          type="button"
          class="flex-1 rounded-lg border border-primary-border px-4 py-2.5 text-xs font-medium text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          :disabled="loading"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg px-4 py-2.5 text-xs font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
          :class="isActive ? 'bg-primary-red hover:bg-red-600' : 'bg-primary-green hover:bg-green-600'"
          :disabled="loading"
          @click="handleToggleTrading"
        >
          <Loader2 v-if="loading" class="h-3.5 w-3.5 animate-spin" />
          <span>{{ loading ? 'Updating...' : (isActive ? 'Disable Trading' : 'Enable Trading') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
