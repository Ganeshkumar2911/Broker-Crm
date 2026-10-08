<script setup>
import { computed, reactive, ref } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'

import apiRequest from '@/api/request'
import urls from '@/api/urls'

import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const snackbar = useSnackbarStore()

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  accountData: {
    type: Object,
    default: null,
  },

  mode: {
    type: String,
    default: 'deposit',
  },
})

const emit = defineEmits([
  'close',
  'success',
])

const loading = ref(false)

const form = reactive({
  amount: '',
  description: 'Adjustment by admin',
})

const title = computed(() =>
  props.mode === 'deposit'
    ? 'Deposit Funds'
    : 'Withdraw Funds'
)

const submitLabel = computed(() =>
  props.mode === 'deposit'
    ? 'Submit Deposit'
    : 'Submit Withdrawal'
)

const resetForm = () => {
  form.amount = ''
  form.description = 'Adjustment by admin'
}

const closeDialog = () => {
  if (loading.value) return

  resetForm()

  emit('close')
}

const handleSubmit = () => {
  if (!form.amount || Number(form.amount) <= 0) {
    snackbar.show(
      'Please enter a valid amount.',
      'error'
    )

    return
  }

  loading.value = true

  const payload = {
    user_id: props.accountData.user_id,
    trading_account_id: props.accountData.account_id,
    amount: Number(form.amount),
    description: form.description,
  }

  const successHandler = (res) => {
    snackbar.show(
      res?.message ||
        `${props.mode} completed successfully.`,
      'success'
    )

    loading.value = false

    resetForm()

    emit('success')

    emit('close')
  }

  const failureHandler = (err) => {
    loading.value = false

    snackbar.show(
      err?.message ||
        `Failed to ${props.mode} funds.`,
      'error'
    )
  }

  apiRequest(
    urls.KEYS.POST,
    props.mode === 'deposit'
      ? urls.tradingAccounts.deposit
      : urls.tradingAccounts.withdraw,
    {
      data: payload,

      isTokenRequired: true,

      onSuccess: successHandler,

      onFailure: failureHandler,
    }
  )
}
</script>
<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click="closeDialog"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-primary-border bg-card-background"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-primary-text">{{ title }}</h2>
          <p class="text-[11px] text-secondary-text mt-0.5">Account #{{ accountData?.account_number }}</p>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
          @click="closeDialog"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Account Info Card -->
      <div class="px-6 pt-5">
        <div class="bg-background border border-primary-border rounded-xl p-4 grid grid-cols-2 gap-3">
          <div>
            <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-0.5">Client</p>
            <p class="text-xs font-semibold text-primary-text">{{ accountData?.client_name ?? '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-0.5">Broker</p>
            <p class="text-xs font-semibold text-primary-text">{{ accountData?.broker ?? '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-0.5">Balance</p>
            <p class="text-xs font-semibold text-primary-text">
              {{ accountData?.balance }} {{ accountData?.broker_currency }}
            </p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wide text-secondary-text mb-0.5">Type</p>
            <p class="text-xs font-semibold text-primary-text capitalize">{{ accountData?.trading_type ?? '—' }}</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="px-6 pt-4 pb-2 space-y-4">
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Amount</p>
          <input
            v-model="form.amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
          <p class="text-xs text-primary-text mt-1.5">Please Enter the Amount in Dollers</p>
        </div>
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Description</p>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors resize-none"
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
          :disabled="loading"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="handleSubmit"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ loading ? 'Processing...' : submitLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
