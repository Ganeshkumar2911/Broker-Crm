<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click="handleClose"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-primary-border bg-card-background shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 border-b border-primary-border px-5 py-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
          >
            <Pencil class="h-4 w-4" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-primary-text">
              Edit Payment Request Amount
            </h2>
            <p class="mt-0.5 text-xs text-secondary-text">
              Update the INR amount for this bank transfer {{ isDeposit ? 'deposit' : 'withdrawal' }}.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4 px-5 py-5 max-h-[75vh] overflow-y-auto">
        <!-- Request Summary Card -->
        <div class="rounded-xl border border-primary-border bg-background/60 p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] uppercase tracking-[0.15em] text-secondary-text font-bold">
              Request Details
            </span>
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize"
              :class="
                isDeposit
                  ? 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                  : 'bg-primary-red/10 text-primary-red border-primary-red/20'
              "
            >
              {{ request?.type }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p class="text-[11px] text-secondary-text">Request ID</p>
              <p class="font-mono font-medium text-primary-text">#{{ request?.id ?? '—' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">User</p>
              <p class="font-medium text-primary-text truncate" :title="request?.user_name">
                {{ request?.user_name ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Trading Account</p>
              <p class="font-mono font-medium text-primary-text">
                {{ request?.trading_account_number ? `#${request.trading_account_number}` : 'IB Wallet' }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Method</p>
              <p class="font-medium text-primary-text capitalize">
                {{ request?.gateway ?? 'Bank Transfer' }} · {{ request?.method ?? 'Bank Transaction' }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Current Paid Amount</p>
              <p class="font-semibold text-emerald-400 tabular-nums">
                {{ fmtCurrency(currentPaidAmount, currentPaidCurrency) }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Current Account Amount</p>
              <p class="font-semibold text-primary-text tabular-nums">
                {{ fmtCurrency(currentAccountAmount, currentAccountCurrency, 3) }}
              </p>
            </div>
          </div>

          <!-- Locked Conversion Rate -->
          <div
            v-if="conversionRate"
            class="mt-3 pt-3 border-t border-primary-border flex items-center justify-between text-xs"
          >
            <span class="text-secondary-text text-[11px]">Locked Exchange Rate:</span>
            <span class="font-mono font-medium text-primary-text bg-background px-2 py-0.5 rounded border border-primary-border text-[11px]">
              1 {{ currentAccountCurrency }} = {{ conversionRate }} {{ currentPaidCurrency }}
            </span>
          </div>
        </div>

        <!-- Amount Input Field -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-primary-text">
            New Amount ({{ currentPaidCurrency }}) <span class="text-primary-red">*</span>
          </label>
          <div class="relative rounded-xl border transition-colors" :class="inputError ? 'border-primary-red' : 'border-primary-border focus-within:border-primary'">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-text font-semibold text-xs">
              {{ currentPaidCurrency === 'INR' ? '₹' : currentPaidCurrency }}
            </div>
            <input
              v-model="amountInput"
              type="number"
              step="any"
              min="0.01"
              placeholder="e.g. 83000"
              :disabled="isSubmitting"
              class="w-full rounded-xl bg-background py-2.5 pl-9 pr-14 text-sm font-semibold text-primary-text outline-none placeholder:text-secondary-text/50 tabular-nums"
              @input="validateInput"
              @keydown.enter.prevent="handleSubmit"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-secondary-text text-[11px] font-medium">
              {{ currentPaidCurrency }}
            </div>
          </div>
          <p v-if="inputError" class="text-[11px] text-primary-red">
            {{ inputError }}
          </p>
        </div>

        <!-- Real-Time Calculation & Comparison Card -->
        <div
          v-if="isValidAmount && calculatedAccountAmount !== null"
          class="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-primary flex items-center gap-1">
              <Calculator class="w-3.5 h-3.5" />
              Recalculated Equivalent (USD)
            </span>
            <span class="text-sm font-bold text-primary tabular-nums">
              ${{ fmt(calculatedAccountAmount, 3) }} USD
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10 text-xs">
            <div>
              <span class="text-[10px] text-secondary-text block">New Paid Amount</span>
              <span class="font-semibold text-emerald-400 tabular-nums">
                {{ fmtCurrency(parsedAmount, currentPaidCurrency) }}
              </span>
            </div>
            <div>
              <span class="text-[10px] text-secondary-text block">Account Credit/Debit</span>
              <span class="font-semibold text-primary-text tabular-nums">
                ${{ fmt(calculatedAccountAmount, 3) }} {{ currentAccountCurrency }}
              </span>
            </div>
          </div>

          <!-- Difference preview -->
          <div
            v-if="usdDifference !== 0"
            class="text-[11px] pt-1.5 flex items-center justify-between text-secondary-text"
          >
            <span>Difference from current:</span>
            <span
              class="font-mono font-medium"
              :class="usdDifference > 0 ? 'text-primary-green' : 'text-primary-yellow'"
            >
              {{ usdDifference > 0 ? '+' : '' }}${{ fmt(usdDifference, 3) }} USD
              ({{ inrDifference > 0 ? '+' : '' }}{{ fmt(inrDifference, 2) }} {{ currentPaidCurrency }})
            </span>
          </div>
        </div>

        <!-- Explanatory Notice Based on Type -->
        <div
          class="rounded-xl border p-3 flex items-start gap-2.5 text-xs"
          :class="
            isDeposit
              ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
              : 'border-primary-yellow/20 bg-primary-yellow/10 text-primary-yellow'
          "
        >
          <Info v-if="isDeposit" class="w-4 h-4 shrink-0 mt-0.5" />
          <AlertTriangle v-else class="w-4 h-4 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="font-semibold">
              {{ isDeposit ? 'Deposit Request Notice' : 'Withdrawal Adjustment Warning' }}
            </p>
            <p class="text-[11px] opacity-90 leading-relaxed">
              <template v-if="isDeposit">
                Editing this deposit only updates the request amounts. USD funds will be credited to the client's trading account upon approval.
              </template>
              <template v-else>
                Editing this withdrawal will immediately adjust the client's trading account USD balance by the difference.
              </template>
            </p>
          </div>
        </div>

        <!-- API Error Alert -->
        <div
          v-if="apiError"
          class="rounded-xl border border-primary-red/20 bg-primary-red/10 p-3 flex items-start gap-2 text-xs text-primary-red"
        >
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <div class="space-y-0.5">
            <p class="font-semibold">Failed to update amount</p>
            <p class="text-[11px]">{{ apiError }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex gap-3 border-t border-primary-border px-5 py-4 bg-card-background">
        <button
          type="button"
          class="flex-1 rounded-lg border border-primary-border px-4 py-2.5 text-xs font-medium text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-sm"
          :disabled="isSubmitting || !canSubmit"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Updating...' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Pencil, X, Loader2, Info, AlertTriangle, AlertCircle, Calculator } from 'lucide-vue-next'
import { usePaymentRequestsStore } from '@/stores/paymentRequests/paymentRequests'

const props = defineProps({
  open: { type: Boolean, default: false },
  request: { type: Object, default: null },
})

const emit = defineEmits(['close', 'success'])

const store = usePaymentRequestsStore()

const amountInput = ref('')
const inputError = ref('')
const apiError = ref('')
const isSubmitting = ref(false)

const isDeposit = computed(() => {
  return (props.request?.type || '').toLowerCase() === 'deposit'
})

const currentPaidCurrency = computed(() => {
  return props.request?.paid_currency || props.request?.conversion_rate?.payment_currency || 'INR'
})

const currentAccountCurrency = computed(() => {
  return props.request?.currency || props.request?.conversion_rate?.account_currency || 'USD'
})

const currentPaidAmount = computed(() => {
  return props.request?.paid_amount ?? props.request?.amount ?? 0
})

const currentAccountAmount = computed(() => {
  return props.request?.amount ?? 0
})

const conversionRate = computed(() => {
  const rate = props.request?.conversion_rate?.units_per_usd
  return rate != null && Number(rate) > 0 ? Number(rate) : null
})

const parsedAmount = computed(() => {
  if (amountInput.value === '' || amountInput.value === null || amountInput.value === undefined) {
    return null
  }
  const num = Number(amountInput.value)
  return Number.isNaN(num) ? null : num
})

const isValidAmount = computed(() => {
  return parsedAmount.value !== null && parsedAmount.value > 0
})

const calculatedAccountAmount = computed(() => {
  if (!isValidAmount.value || !conversionRate.value) return null
  // USD = INR / units_per_usd, rounded to 3 decimals
  const rawUsd = parsedAmount.value / conversionRate.value
  return Number(rawUsd.toFixed(3))
})

const inrDifference = computed(() => {
  if (!isValidAmount.value) return 0
  return Number((parsedAmount.value - Number(currentPaidAmount.value)).toFixed(2))
})

const usdDifference = computed(() => {
  if (calculatedAccountAmount.value === null) return 0
  return Number((calculatedAccountAmount.value - Number(currentAccountAmount.value)).toFixed(3))
})

const canSubmit = computed(() => {
  return isValidAmount.value && !inputError.value && !isSubmitting.value
})

const validateInput = () => {
  apiError.value = ''
  if (amountInput.value === '' || amountInput.value === null || amountInput.value === undefined) {
    inputError.value = 'Amount is required'
    return false
  }
  const num = Number(amountInput.value)
  if (Number.isNaN(num)) {
    inputError.value = 'Amount must be a valid number'
    return false
  }
  if (num <= 0) {
    inputError.value = 'Amount must be greater than zero'
    return false
  }
  inputError.value = ''
  return true
}

const fmt = (v, maxDigits = 2) => {
  const num = Number(v ?? 0)
  if (Number.isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigits,
  })
}

const fmtCurrency = (v, curr = 'INR', maxDigits = 2) => {
  const formatted = fmt(v, maxDigits)
  if (curr === 'INR') return `₹${formatted} ${curr}`
  if (curr === 'USD') return `$${formatted} ${curr}`
  return `${formatted} ${curr}`
}

const handleClose = () => {
  if (isSubmitting.value) return
  emit('close')
}

const handleSubmit = async () => {
  if (!validateInput() || !props.request?.id) return

  isSubmitting.value = true
  apiError.value = ''

  try {
    const res = await store.updateRequestAmount(props.request.id, parsedAmount.value)
    emit('success', res)
    emit('close')
  } catch (err) {
    apiError.value = err?.message || 'Failed to update payment request amount. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => [props.open, props.request],
  ([newOpen, newReq]) => {
    if (newOpen && newReq) {
      inputError.value = ''
      apiError.value = ''
      // Pre-fill with existing paid_amount (INR)
      if (newReq.paid_amount != null) {
        amountInput.value = newReq.paid_amount
      } else if (newReq.amount != null && !newReq.conversion_rate) {
        amountInput.value = newReq.amount
      } else {
        amountInput.value = ''
      }
    }
  },
  { immediate: true }
)
</script>
