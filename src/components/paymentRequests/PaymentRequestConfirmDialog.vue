<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click="handleClose"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-primary-border bg-card-background shadow-2xl overflow-hidden"
      @click.stop
    >
      <div class="flex items-start justify-between gap-4 border-b border-primary-border px-5 py-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border"
            :class="dialogTone.wrapper"
          >
            <component :is="dialogTone.icon" class="h-4 w-4" :class="dialogTone.iconClass" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-primary-text">
              {{ title }}
            </h2>
            <p class="mt-0.5 text-xs text-secondary-text">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <button
          class="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          :disabled="loading"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="space-y-4 px-5 py-5 max-h-[70vh] overflow-y-auto">
        <!-- Details Card -->
        <div class="rounded-xl border border-primary-border bg-background/60 p-4">
          <p class="text-[11px] uppercase tracking-[0.2em] text-secondary-text font-bold">
            Request Summary
          </p>
          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p class="text-[11px] text-secondary-text">Request ID</p>
              <p class="text-sm font-medium text-primary-text">#{{ request?.id ?? '—' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Type</p>
              <p class="text-sm font-medium capitalize text-primary-text">
                {{ request?.type ?? '—' }}
              </p>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <p class="text-[11px] text-secondary-text">Amount</p>
                <button
                  v-if="canEdit"
                  type="button"
                  class="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                  title="Edit Bank Transfer Amount"
                  @click="handleEdit"
                >
                  <Pencil class="w-2.5 h-2.5" />
                  <span>Edit</span>
                </button>
              </div>
              <p class="text-sm font-medium text-primary-text">
                {{ formattedAmount }}
              </p>
              <p v-if="request?.paid_amount != null && request?.paid_currency" class="text-xs text-emerald-400 font-medium mt-0.5">
                Paid: {{ request.paid_amount }} {{ request.paid_currency }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Gateway & Method</p>
              <p class="text-sm font-medium capitalize text-primary-text">
                {{ request?.gateway ?? '—' }}
                <span v-if="request?.method" class="text-secondary-text text-xs">
                  · {{ request.method }}
                </span>
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">User</p>
              <p class="text-sm font-medium text-primary-text">
                {{ request?.user_name ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Email</p>
              <p class="text-sm font-medium text-primary-text truncate" :title="request?.user_email">
                {{ request?.user_email ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-secondary-text">Account</p>
              <p class="text-sm font-medium text-primary-text">
                {{ request?.trading_account_number ?? 'IB Wallet Withdrawal' }}
                <span v-if="request?.account_type" class="text-xs text-secondary-text capitalize">
                  ({{ request.account_type }})
                </span>
              </p>
            </div>
            <div v-if="request?.txid || request?.external_payment_id || request?.utr">
              <p class="text-[11px] text-secondary-text">
                {{ request?.utr ? 'UTR / Ref' : (request?.txid ? 'TX ID' : 'Reference ID') }}
              </p>
              <p class="text-xs font-mono text-primary-text truncate" :title="request?.utr || request?.txid || request?.external_payment_id">
                {{ request?.utr || request?.txid || request?.external_payment_id }}
              </p>
            </div>
          </div>

          <!-- Bank Details Section (if available) -->
          <div v-if="bankInfo" class="mt-3 pt-3 border-t border-primary-border">
            <p class="text-[11px] uppercase tracking-wider text-secondary-text font-semibold mb-2">
              {{ bankInfo.isCompanyBank ? 'Company Bank Details' : 'User Beneficiary Bank Details' }}
            </p>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div v-if="bankInfo.account_name">
                <span class="text-secondary-text text-[10px]">Name:</span>
                <p class="font-medium text-primary-text">{{ bankInfo.account_name }}</p>
              </div>
              <div v-if="bankInfo.account_number">
                <span class="text-secondary-text text-[10px]">Account No:</span>
                <p class="font-mono font-medium text-primary-text">{{ bankInfo.account_number }}</p>
              </div>
              <div v-if="bankInfo.bank">
                <span class="text-secondary-text text-[10px]">Bank:</span>
                <p class="font-medium text-primary-text">{{ bankInfo.bank }}</p>
              </div>
              <div v-if="bankInfo.bank_branch_code">
                <span class="text-secondary-text text-[10px]">IFSC / Code:</span>
                <p class="font-mono font-medium text-primary-text">{{ bankInfo.bank_branch_code }}</p>
              </div>
              <div v-if="bankInfo.bank_branch">
                <span class="text-secondary-text text-[10px]">Branch:</span>
                <p class="font-medium text-primary-text">{{ bankInfo.bank_branch }}</p>
              </div>
              <div v-if="bankInfo.account_type">
                <span class="text-secondary-text text-[10px]">Type:</span>
                <p class="font-medium text-primary-text uppercase">{{ bankInfo.account_type }}</p>
              </div>
            </div>
          </div>

          <!-- User Deposit Proof Link (if available) -->
          <div v-if="request?.proof_url" class="mt-3 pt-3 border-t border-primary-border flex items-center justify-between text-xs">
            <span class="text-secondary-text text-[11px]">User Payment Proof:</span>
            <a
              :href="request.proof_url"
              target="_blank"
              class="text-primary hover:underline font-medium inline-flex items-center gap-1 text-xs"
            >
              <Paperclip class="w-3.5 h-3.5" />
              View User Proof
            </a>
          </div>
        </div>

        <!-- Rejection / Cancellation Reason Input -->
        <div v-if="action === 'reject' || action === 'cancelPaymaxis'" class="space-y-1.5">
          <label class="block text-xs font-semibold text-primary-text">
            {{ action === 'cancelPaymaxis' ? 'Reason (Optional)' : 'Rejection Reason' }} <span v-if="action === 'reject'" class="text-primary-red">*</span>
          </label>
          <textarea
            v-model="rejectionReason"
            rows="2"
            :placeholder="action === 'cancelPaymaxis' ? 'Enter reason for cancelling this deposit...' : 'Enter reason for rejecting this payment request...'"
            class="w-full rounded-xl border border-primary-border bg-background p-3 text-xs text-primary-text outline-none focus:border-primary placeholder:text-secondary-text transition-colors"
          />
          <p v-if="reasonError" class="text-[11px] text-primary-red">
            Please specify a rejection reason.
          </p>
        </div>


        <div class="rounded-xl border px-4 py-3" :class="dialogTone.notice">
          <div class="flex items-start gap-2">
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" :class="dialogTone.iconClass" />
            <p class="text-xs leading-5" :class="dialogTone.text">
              {{ confirmationText }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 border-t border-primary-border px-5 py-4">
        <button
          class="flex-1 rounded-lg border border-primary-border px-4 py-2.5 text-xs font-medium text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          :disabled="loading"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-sm"
          :class="dialogTone.button"
          :disabled="loading"
          @click="handleSubmit"
        >
          <Loader2 v-if="loading" class="h-3.5 w-3.5 animate-spin" />
          <span>{{ loading ? loadingLabel : confirmLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { AlertTriangle, CheckCircle2, Loader2, X, Paperclip, Pencil } from 'lucide-vue-next'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const props = defineProps({
  open: { type: Boolean, default: false },
  request: { type: Object, default: null },
  action: { type: String, default: 'approve' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'confirm', 'edit'])

const { hasPermission } = usePermissionCheck()

const rejectionReason = ref('')
const reasonError = ref(false)

const canEdit = computed(() => {
  if (!props.request) return false
  if (!hasPermission('payment_requests.approve')) return false

  const gateway = (props.request.gateway || '').trim().toLowerCase().replace(/[\s_-]+/g, '_')
  const method = (props.request.method || '').trim().toLowerCase().replace(/[\s_-]+/g, ' ')
  const status = (props.request.approval_status || '').trim().toLowerCase()
  const type = (props.request.type || '').trim().toLowerCase()

  const isBankTransfer = gateway === 'bank_transfer' || gateway === 'banktransfer'
  const isBankTransaction = method === 'bank transaction' || method === 'bank transfer'
  const isPending = status === 'pending'
  const isValidType = type === 'deposit' || type === 'withdrawal'

  return isBankTransfer && isBankTransaction && isPending && isValidType
})

const handleEdit = () => {
  emit('close')
  emit('edit', props.request)
}

const actionMeta = {
  approve: {
    title: 'Approve Payment Request',
    subtitle: 'Confirm this action before continuing.',
    confirmLabel: 'Approve',
    loadingLabel: 'Approving...',
    button: 'bg-primary-green hover:bg-primary-green/90',
    wrapper: 'border-primary-green/20 bg-primary-green/10',
    iconClass: 'text-primary-green',
    notice: 'border-primary-green/20 bg-primary-green/10',
    text: 'text-primary-green',
    icon: CheckCircle2,
    confirmationText: 'This payment request will be approved immediately. Please confirm that you want to continue.',
  },
  reject: {
    title: 'Reject Payment Request',
    subtitle: 'Confirm this action before continuing.',
    confirmLabel: 'Reject',
    loadingLabel: 'Rejecting...',
    button: 'bg-primary-red hover:bg-primary-red/90',
    wrapper: 'border-primary-red/20 bg-primary-red/10',
    iconClass: 'text-primary-red',
    notice: 'border-primary-red/20 bg-primary-red/10',
    text: 'text-primary-red',
    icon: AlertTriangle,
    confirmationText: 'This payment request will be rejected immediately. Please confirm that you want to continue.',
  },
  cancelPaymaxis: {
    title: 'Cancel Paymaxis Deposit',
    subtitle: 'Cancel this deposit so the user can try again.',
    confirmLabel: 'Cancel Deposit',
    loadingLabel: 'Cancelling...',
    button: 'bg-primary-red hover:bg-primary-red/90 text-white',
    wrapper: 'border-primary-red/20 bg-primary-red/10',
    iconClass: 'text-primary-red',
    notice: 'border-primary-red/20 bg-primary-red/10',
    text: 'text-primary-red',
    icon: AlertTriangle,
    confirmationText: 'This Paymaxis deposit will be cancelled so the user can try again. Please confirm that you want to continue.',
  },
}

const dialogTone = computed(() => actionMeta[props.action] ?? actionMeta.approve)
const title = computed(() => dialogTone.value.title)
const subtitle = computed(() => dialogTone.value.subtitle)
const confirmLabel = computed(() => dialogTone.value.confirmLabel)
const loadingLabel = computed(() => dialogTone.value.loadingLabel)
const confirmationText = computed(() => dialogTone.value.confirmationText)

const formattedAmount = computed(() => {
  const amount = Number(props.request?.amount ?? 0)
  if (Number.isNaN(amount)) return '—'
  return `${props.request?.currency ?? ''} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`.trim()
})

const bankInfo = computed(() => {
  if (!props.request) return null
  let raw = props.request.raw_payload
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      raw = null
    }
  }

  const direct = props.request?.bank_details || props.request?.bank_account || props.request?.user_bank_account || null
  const source = raw || direct
  if (!source) return null

  if (source.company_bank) {
    return {
      isCompanyBank: true,
      account_name: source.company_bank.account_name,
      account_number: source.company_bank.account_number,
      bank: source.company_bank.bank_name,
      bank_branch_code: source.company_bank.ifsc_code || source.company_bank.swift_code,
      bank_branch: source.company_bank.branch_name,
      account_type: '',
    }
  }

  return {
    isCompanyBank: false,
    account_name: source.account_name || direct?.account_name || direct?.account_holder_name || props.request?.user_name || '',
    account_number: source.account_number || direct?.account_number || direct?.account_no || '',
    bank: source.bank || source.bank_name || direct?.bank || '',
    bank_branch_code: source.bank_branch_code || source.ifsc_code || direct?.bank_branch_code || direct?.ifsc_code || '',
    bank_branch: source.bank_branch || direct?.bank_branch || direct?.branch || '',
    account_type: source.account_type || direct?.account_type || '',
  }
})

const handleSubmit = () => {
  if (props.action === 'reject' && !rejectionReason.value.trim()) {
    reasonError.value = true
    return
  }
  reasonError.value = false

  if (props.action === 'reject' && rejectionReason.value.trim()) {
    const formData = new FormData()
    formData.append('reason', rejectionReason.value.trim())
    emit('confirm', formData)
  } else if (props.action === 'cancelPaymaxis') {
    const reason = rejectionReason.value.trim()
    const payload = reason ? { reason } : {}
    emit('confirm', payload)
  } else {
    emit('confirm', null)
  }
}

const handleClose = () => {
  if (props.loading) return
  emit('close')
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      rejectionReason.value = ''
      reasonError.value = false
    }
  }
)
</script>
