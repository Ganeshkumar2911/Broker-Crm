<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click="handleClose"
  >
    <div
      class="w-full max-w-xl rounded-2xl border border-primary-border bg-card-background shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 border-b border-primary-border px-5 py-4 shrink-0">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
          >
            <Landmark class="h-5 w-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-primary-text">
                Bank Transaction Details
              </h2>
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
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize"
                :class="approvalStatusBadgeClass"
              >
                {{ request?.approval_status || 'Pending' }}
              </span>
            </div>
            <p class="mt-0.5 text-xs text-secondary-text">
              Request #{{ request?.id ?? '—' }} · {{ request?.user_name || 'Client' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-background hover:text-primary-text cursor-pointer"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="space-y-4 px-5 py-5 overflow-y-auto flex-1">
        <!-- Payout / Deposit Amount Highlight Card -->
        <div class="rounded-xl border border-primary-border bg-background/70 p-4 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold">
                {{ isDeposit ? 'Deposit Received' : 'Payout Amount (To Transfer)' }}
              </p>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight tabular-nums">
                  {{ payoutAmountFormatted }}
                </span>
                <span class="text-xs font-semibold text-secondary-text uppercase">
                  {{ payoutCurrency }}
                </span>
              </div>
              <p v-if="accountAmountFormatted" class="text-xs text-secondary-text mt-1">
                Equivalent to:
                <span class="font-medium text-primary-text">{{ accountAmountFormatted }}</span>
                <span v-if="conversionRateText" class="text-[11px] text-secondary-text/80 ml-1">
                  ({{ conversionRateText }})
                </span>
              </p>
            </div>

            <!-- Quick copy payout amount -->
            <button
              v-if="payoutAmountRaw"
              type="button"
              class="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-primary-text transition-colors cursor-pointer shrink-0"
              title="Copy amount"
              @click="copyText(String(payoutAmountRaw), 'payout_amount')"
            >
              <Check v-if="copiedMap['payout_amount']" class="w-3.5 h-3.5 text-emerald-400" />
              <Copy v-else class="w-3.5 h-3.5 text-secondary-text" />
              <span>{{ copiedMap['payout_amount'] ? 'Copied' : 'Copy Amount' }}</span>
            </button>
          </div>
        </div>

        <!-- Withdrawal: User Bank Account Details -->
        <div v-if="!isDeposit || userBankDetails" class="rounded-xl border border-primary-border bg-card-background p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Building class="w-4 h-4 text-primary shrink-0" />
              <p class="text-xs font-bold uppercase tracking-wider text-primary-text">
                User Beneficiary Bank Account
              </p>
            </div>
            <button
              v-if="userBankDetails"
              type="button"
              class="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
              @click="copyAllBankDetails"
            >
              <Check v-if="copiedMap['all_details']" class="w-3 h-3 text-emerald-400" />
              <Copy v-else class="w-3 h-3" />
              <span>{{ copiedMap['all_details'] ? 'All Copied!' : 'Copy All Details' }}</span>
            </button>
          </div>

          <div v-if="userBankDetails" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <!-- Account Holder Name -->
            <div class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Account Name</span>
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-semibold text-primary-text break-all">
                  {{ userBankDetails.account_name || '—' }}
                </span>
                <button
                  v-if="userBankDetails.account_name"
                  type="button"
                  class="p-1 text-secondary-text hover:text-primary transition-colors cursor-pointer shrink-0"
                  title="Copy Account Name"
                  @click="copyText(userBankDetails.account_name, 'acc_name')"
                >
                  <Check v-if="copiedMap['acc_name']" class="w-3.5 h-3.5 text-emerald-400" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Account Number -->
            <div class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Account Number</span>
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-mono font-bold text-primary tracking-wider break-all">
                  {{ userBankDetails.account_number || '—' }}
                </span>
                <button
                  v-if="userBankDetails.account_number"
                  type="button"
                  class="p-1 text-secondary-text hover:text-primary transition-colors cursor-pointer shrink-0"
                  title="Copy Account Number"
                  @click="copyText(userBankDetails.account_number, 'acc_no')"
                >
                  <Check v-if="copiedMap['acc_no']" class="w-3.5 h-3.5 text-emerald-400" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Bank Name -->
            <div class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Bank Name</span>
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-semibold text-primary-text break-all">
                  {{ userBankDetails.bank || '—' }}
                </span>
                <button
                  v-if="userBankDetails.bank"
                  type="button"
                  class="p-1 text-secondary-text hover:text-primary transition-colors cursor-pointer shrink-0"
                  title="Copy Bank Name"
                  @click="copyText(userBankDetails.bank, 'bank_name')"
                >
                  <Check v-if="copiedMap['bank_name']" class="w-3.5 h-3.5 text-emerald-400" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- IFSC / Branch Code -->
            <div class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">IFSC / Branch Code</span>
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-mono font-bold text-primary-text break-all">
                  {{ userBankDetails.bank_branch_code || userBankDetails.ifsc_code || '—' }}
                </span>
                <button
                  v-if="userBankDetails.bank_branch_code || userBankDetails.ifsc_code"
                  type="button"
                  class="p-1 text-secondary-text hover:text-primary transition-colors cursor-pointer shrink-0"
                  title="Copy IFSC / Code"
                  @click="copyText(userBankDetails.bank_branch_code || userBankDetails.ifsc_code, 'ifsc')"
                >
                  <Check v-if="copiedMap['ifsc']" class="w-3.5 h-3.5 text-emerald-400" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Branch -->
            <div v-if="userBankDetails.bank_branch" class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Branch</span>
              <p class="text-xs font-medium text-primary-text break-all">
                {{ userBankDetails.bank_branch }}
              </p>
            </div>

            <!-- Account Type -->
            <div v-if="userBankDetails.account_type" class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Account Type</span>
              <p class="text-xs font-medium text-primary-text uppercase">
                {{ userBankDetails.account_type }}
              </p>
            </div>

            <!-- Bank Code (if present) -->
            <div v-if="userBankDetails.bank_code" class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Bank Code</span>
              <p class="text-xs font-mono font-medium text-primary-text">
                {{ userBankDetails.bank_code }}
              </p>
            </div>

            <!-- User Bank Account ID -->
            <div v-if="userBankDetails.user_bank_account_id" class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Saved Account ID</span>
              <p class="text-xs font-mono font-medium text-secondary-text">
                #{{ userBankDetails.user_bank_account_id }}
              </p>
            </div>
          </div>

          <div v-else class="py-4 text-center text-xs text-secondary-text">
            No bank account details provided in payload.
          </div>
        </div>

        <!-- Deposit: Company Bank & UTR Reference Details -->
        <div v-if="isDeposit && companyBankDetails" class="rounded-xl border border-primary-border bg-card-background p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Building class="w-4 h-4 text-primary shrink-0" />
              <p class="text-xs font-bold uppercase tracking-wider text-primary-text">
                Company Receiving Bank Account
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Account Name</span>
              <p class="text-xs font-semibold text-primary-text break-all">
                {{ companyBankDetails.account_name || '—' }}
              </p>
            </div>

            <div class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Account Number</span>
              <p class="text-xs font-mono font-bold text-primary tracking-wider break-all">
                {{ companyBankDetails.account_number || '—' }}
              </p>
            </div>

            <div class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Bank Name</span>
              <p class="text-xs font-semibold text-primary-text break-all">
                {{ companyBankDetails.bank_name || '—' }}
              </p>
            </div>

            <div class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">IFSC / Swift</span>
              <p class="text-xs font-mono font-bold text-primary-text break-all">
                {{ companyBankDetails.ifsc_code || companyBankDetails.swift_code || '—' }}
              </p>
            </div>

            <div v-if="companyBankDetails.branch_name" class="rounded-lg border border-primary-border bg-background/50 p-2.5 space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-secondary-text font-medium">Branch</span>
              <p class="text-xs font-medium text-primary-text break-all">
                {{ companyBankDetails.branch_name }}
              </p>
            </div>
          </div>
        </div>

        <!-- UTR / TXID Reference (For Deposit or Withdrawal) -->
        <div v-if="utrReference" class="rounded-xl border border-primary-border bg-card-background p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase tracking-wider text-secondary-text font-bold">
              UTR / Transaction Reference
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
              @click="copyText(utrReference, 'utr')"
            >
              <Check v-if="copiedMap['utr']" class="w-3 h-3 text-emerald-400" />
              <Copy v-else class="w-3 h-3" />
              <span>{{ copiedMap['utr'] ? 'Copied' : 'Copy UTR' }}</span>
            </button>
          </div>
          <p class="text-xs font-mono font-bold text-primary-text bg-background/60 p-2.5 rounded-lg border border-primary-border break-all">
            {{ utrReference }}
          </p>
        </div>

        <!-- Payment Proof Attachment (if any) -->
        <div v-if="request?.proof_url || parsedPayload?.proof_url" class="rounded-xl border border-primary-border bg-card-background p-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Paperclip class="w-4 h-4 text-primary shrink-0" />
            <div>
              <p class="text-xs font-semibold text-primary-text">Payment Proof Attached</p>
              <p class="text-[11px] text-secondary-text">User uploaded confirmation document</p>
            </div>
          </div>
          <a
            :href="request?.proof_url || parsedPayload?.proof_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
          >
            <span>View Proof</span>
            <ExternalLink class="w-3 h-3" />
          </a>
        </div>

        <!-- User & Trading Account Summary -->
        <div class="rounded-xl border border-primary-border bg-background/40 p-4">
          <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-2">
            Request Context
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span class="text-secondary-text text-[10px]">Client</span>
              <p class="font-medium text-primary-text truncate" :title="request?.user_name">
                {{ request?.user_name || '—' }}
              </p>
            </div>
            <div>
              <span class="text-secondary-text text-[10px]">Email</span>
              <p class="font-medium text-primary-text truncate font-mono text-[11px]" :title="request?.user_email">
                {{ request?.user_email || '—' }}
              </p>
            </div>
            <div>
              <span class="text-secondary-text text-[10px]">Account</span>
              <p class="font-mono font-medium text-primary-text">
                {{ request?.trading_account_number ? `#${request.trading_account_number}` : 'IB Wallet' }}
                <span v-if="request?.account_type" class="text-[10px] text-secondary-text capitalize">
                  ({{ request.account_type }})
                </span>
              </p>
            </div>
            <div>
              <span class="text-secondary-text text-[10px]">Gateway & Method</span>
              <p class="font-medium text-primary-text capitalize">
                {{ request?.gateway ?? 'Bank Transfer' }} · {{ request?.method ?? 'Bank Transaction' }}
              </p>
            </div>
            <div>
              <span class="text-secondary-text text-[10px]">Created At</span>
              <p class="font-medium text-primary-text text-[11px]">
                {{ formatDate(request?.created_at) }}
              </p>
            </div>
            <div v-if="request?.approved_at">
              <span class="text-secondary-text text-[10px]">Approved At</span>
              <p class="font-medium text-primary-text text-[11px]">
                {{ formatDate(request?.approved_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between gap-3 border-t border-primary-border px-5 py-4 shrink-0 bg-card-background">
        <button
          type="button"
          class="rounded-lg border border-primary-border px-4 py-2 text-xs font-medium text-secondary-text transition-colors hover:bg-background hover:text-primary-text cursor-pointer"
          @click="handleClose"
        >
          Close
        </button>

        <div class="flex items-center gap-2">
          <!-- Edit Amount Button (if pending) -->
          <button
            v-if="canEdit"
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
            title="Edit Amount"
            @click="handleEdit"
          >
            <Pencil class="w-3.5 h-3.5" />
            <span>Edit Amount</span>
          </button>

          <!-- Reject Button (if pending) -->
          <button
            v-if="isPending && hasPermission('payment_requests.reject')"
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border bg-primary-red/10 text-primary-red border-primary-red/20 hover:bg-primary-red/20 transition-colors cursor-pointer"
            @click="handleReject"
          >
            <X class="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <!-- Approve Button (if pending) -->
          <button
            v-if="isPending && hasPermission('payment_requests.approve')"
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border bg-primary-green/10 text-primary-green border-primary-green/20 hover:bg-primary-green/20 transition-colors cursor-pointer"
            @click="handleApprove"
          >
            <Check class="w-3.5 h-3.5" />
            <span>Approve Request</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Landmark,
  X,
  Copy,
  Check,
  Building,
  ExternalLink,
  Paperclip,
  Pencil,
} from 'lucide-vue-next'
import { formatDate } from '@/utils/timeFormatter'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const props = defineProps({
  open: { type: Boolean, default: false },
  request: { type: Object, default: null },
})

const emit = defineEmits(['close', 'approve', 'reject', 'edit'])

const snackbar = useSnackbarStore()
const { hasPermission } = usePermissionCheck()

const copiedMap = ref({})

const isDeposit = computed(() => {
  return props.request?.type?.toLowerCase() === 'deposit'
})

const isPending = computed(() => {
  return props.request?.approval_status?.toLowerCase() === 'pending'
})

const parsedPayload = computed(() => {
  if (!props.request?.raw_payload) return null
  if (typeof props.request.raw_payload === 'object') {
    return props.request.raw_payload
  }
  try {
    return JSON.parse(props.request.raw_payload)
  } catch {
    return null
  }
})

// User bank details extraction (supports raw_payload, bank_details, bank_account, etc.)
const userBankDetails = computed(() => {
  const payload = parsedPayload.value
  const req = props.request
  const directBank = req?.bank_details || req?.bank_account || req?.user_bank_account

  if (!payload && !directBank) return null

  return {
    account_name: payload?.account_name || directBank?.account_name || directBank?.account_holder_name || req?.user_name || '',
    account_number: payload?.account_number || directBank?.account_number || directBank?.account_no || '',
    bank: payload?.bank || payload?.bank_name || directBank?.bank || directBank?.bank_name || '',
    bank_branch_code: payload?.bank_branch_code || payload?.ifsc_code || directBank?.bank_branch_code || directBank?.ifsc_code || '',
    bank_branch: payload?.bank_branch || payload?.branch_name || directBank?.bank_branch || directBank?.branch || '',
    account_type: payload?.account_type || directBank?.account_type || 'SAVINGS',
    bank_code: payload?.bank_code || directBank?.bank_code || '',
    user_bank_account_id: payload?.user_bank_account_id || directBank?.id || null,
  }
})

// Company bank details (for deposits)
const companyBankDetails = computed(() => {
  const payload = parsedPayload.value
  if (!payload?.company_bank) return null
  return payload.company_bank
})

// UTR / Transaction Reference
const utrReference = computed(() => {
  const payload = parsedPayload.value
  return (
    payload?.utr ||
    props.request?.txid ||
    props.request?.external_payment_id ||
    props.request?.utr ||
    null
  )
})

// Payout Amount (INR or paid currency)
const payoutAmountRaw = computed(() => {
  const payload = parsedPayload.value
  if (payload?.payoutAmount != null) return payload.payoutAmount
  if (payload?.inr_amount != null) return payload.inr_amount
  if (props.request?.paid_amount != null) return props.request.paid_amount
  return null
})

const payoutCurrency = computed(() => {
  const payload = parsedPayload.value
  return payload?.payoutCurrency || props.request?.paid_currency || 'INR'
})

const payoutAmountFormatted = computed(() => {
  const amount = payoutAmountRaw.value
  if (amount == null) return '—'
  const num = Number(amount)
  if (Number.isNaN(num)) return '—'
  const sym = payoutCurrency.value === 'INR' ? '₹' : ''
  return `${sym}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
})

// Account Amount (USD)
const accountAmountRaw = computed(() => {
  const payload = parsedPayload.value
  if (payload?.accountAmountUsd != null) return payload.accountAmountUsd
  if (props.request?.amount != null) return props.request.amount
  return null
})

const accountCurrency = computed(() => {
  const payload = parsedPayload.value
  return payload?.accountCurrency || props.request?.currency || 'USD'
})

const accountAmountFormatted = computed(() => {
  const amount = accountAmountRaw.value
  if (amount == null) return ''
  const num = Number(amount)
  if (Number.isNaN(num)) return ''
  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })} ${accountCurrency.value}`
})

// Conversion rate text
const conversionRateText = computed(() => {
  const payload = parsedPayload.value
  const rateObj = payload?.conversionRate || props.request?.conversion_rate
  if (!rateObj?.units_per_usd) return ''
  return `1 ${rateObj.account_currency || 'USD'} = ${rateObj.units_per_usd} ${rateObj.payment_currency || 'INR'}`
})

const approvalStatusBadgeClass = computed(() => {
  const s = (props.request?.approval_status || '').toLowerCase()
  return (
    {
      pending: 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20',
      approved: 'bg-primary-green/10 text-primary-green border-primary-green/20',
      rejected: 'bg-primary-red/10 text-primary-red border-primary-red/20',
      processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    }[s] || 'bg-background text-secondary-text border-primary-border'
  )
})

const canEdit = computed(() => {
  const req = props.request
  if (!req) return false
  if (!hasPermission('payment_requests.approve')) return false

  const gateway = (req.gateway || '').trim().toLowerCase().replace(/[\s_-]+/g, '_')
  const method = (req.method || '').trim().toLowerCase().replace(/[\s_-]+/g, ' ')
  const status = (req.approval_status || '').trim().toLowerCase()
  const type = (req.type || '').trim().toLowerCase()

  const isBankTransfer = gateway === 'bank_transfer' || gateway === 'banktransfer'
  const isBankTransaction = method === 'bank transaction' || method === 'bank transfer'
  const isPendingStatus = status === 'pending'
  const isValidType = type === 'deposit' || type === 'withdrawal'

  return isBankTransfer && isBankTransaction && isPendingStatus && isValidType
})

const copyText = (text, key) => {
  if (!text) return
  const str = String(text).trim()

  const onSuccess = () => {
    copiedMap.value[key] = true
    snackbar.show('Copied to clipboard', 'success')
    setTimeout(() => {
      copiedMap.value[key] = false
    }, 2000)
  }

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard
      .writeText(str)
      .then(onSuccess)
      .catch(() => fallbackCopy(str, onSuccess))
  } else {
    fallbackCopy(str, onSuccess)
  }
}

const fallbackCopy = (str, onSuccess) => {
  try {
    const el = document.createElement('textarea')
    el.value = str
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    el.style.top = '-9999px'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(el)
    if (successful) onSuccess()
    else snackbar.show('Unable to copy', 'error')
  } catch {
    snackbar.show('Unable to copy', 'error')
  }
}

const copyAllBankDetails = () => {
  const b = userBankDetails.value
  if (!b) return

  const lines = [
    `Beneficiary Name: ${b.account_name || '—'}`,
    `Account Number: ${b.account_number || '—'}`,
    `Bank Name: ${b.bank || '—'}`,
    `IFSC / Code: ${b.bank_branch_code || '—'}`,
  ]

  if (b.bank_branch) lines.push(`Branch: ${b.bank_branch}`)
  if (b.account_type) lines.push(`Account Type: ${b.account_type}`)
  if (payoutAmountRaw.value) {
    lines.push(`Amount: ${payoutAmountRaw.value} ${payoutCurrency.value}`)
  }

  copyText(lines.join('\n'), 'all_details')
}

const handleClose = () => {
  emit('close')
}

const handleEdit = () => {
  emit('edit', props.request)
}

const handleApprove = () => {
  emit('approve', props.request)
}

const handleReject = () => {
  emit('reject', props.request)
}
</script>
