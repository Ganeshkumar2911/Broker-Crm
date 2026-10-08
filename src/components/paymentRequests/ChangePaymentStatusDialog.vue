<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-xs"
  >
    <div
      class="w-full max-w-md border border-primary-border bg-card-background  shadow-2xl"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0">
        <div class="flex items-center gap-2">
          <Receipt class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-semibold text-primary-text">Update Approval Status</h2>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer focus:outline-none"
          :disabled="isSubmitting"
          @click="closeDialog"
        >
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="px-6 py-5 space-y-4 bg-card-background overflow-visible">
        <!-- Request Details -->
        <div class="bg-background border border-primary-border rounded-xl px-4 py-3 text-xs space-y-2">
          <p class="text-[10px] uppercase tracking-wide text-secondary-text font-semibold">Request Details</p>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <p class="text-secondary-text">Request ID</p>
              <p class="font-medium text-primary-text">#{{ request?.id ?? '—' }}</p>
            </div>
            <div>
              <p class="text-secondary-text">Type</p>
              <p class="font-medium capitalize text-primary-text">{{ request?.type ?? '—' }}</p>
            </div>
            <div>
              <p class="text-secondary-text">Amount</p>
              <p class="font-medium text-primary-text">{{ formattedAmount }}</p>
              <p v-if="request?.paid_amount != null && request?.paid_currency" class="text-[11px] text-emerald-400 font-medium">
                Paid: {{ request.paid_amount }} {{ request.paid_currency }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text">Gateway / Method</p>
              <p class="font-medium text-primary-text capitalize truncate" :title="request?.gateway">
                {{ request?.gateway ?? '—' }} {{ request?.method ? `· ${request.method}` : '' }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text">User</p>
              <p class="font-medium text-primary-text truncate" :title="request?.user_name">
                {{ request?.user_name ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text">Account</p>
              <p class="font-medium text-primary-text">
                {{ request?.trading_account_number ?? 'IB Wallet Withdrawal' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Approval Status Selection -->
        <div class="flex flex-col gap-1.5">
          <label class="text-secondary-text text-[11px] font-semibold">Approval Status</label>
          <BaseSelect
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="Select Status"
            class="w-full"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background shrink-0">
        <button
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { X, Loader2, Receipt } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const { hasPermission } = usePermissionCheck()

const statusOptions = computed(() => {
  const opts = []
  if (hasPermission('payment_requests.approve')) {
    opts.push({ label: 'Approved', value: 'approved' })
    opts.push({ label: 'Processing', value: 'processing' })
  }
  if (hasPermission('payment_requests.reject')) {
    opts.push({ label: 'Rejected', value: 'rejected' })
  }
  return opts
})

const props = defineProps({
  open: { type: Boolean, default: false },
  request: { type: Object, default: null },
})

const emit = defineEmits(['close', 'success'])

const snackbar = useSnackbarStore()
const isSubmitting = ref(false)
const selectedStatus = ref('pending')

watch(
  () => [props.request, statusOptions.value],
  ([newVal, opts]) => {
    if (newVal && opts && opts.length > 0) {
      if (!opts.some(o => o.value === selectedStatus.value)) {
        selectedStatus.value = opts[0].value
      }
    }
  },
  { immediate: true }
)

const formattedAmount = computed(() => {
  const amount = Number(props.request?.amount ?? 0)
  if (Number.isNaN(amount)) return '—'
  return `${props.request?.currency ?? ''} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`.trim()
})

const handleSubmit = () => {
  if (!props.request?.id) return
  isSubmitting.value = true

  const payload = {
    approval_status: selectedStatus.value,
  }

  const successHandler = (res) => {
    snackbar.show(res?.message || 'Approval status updated successfully.', 'success')
    emit('success')
    emit('close')
  }

  const failureHandler = (err) => {
    snackbar.show(err?.message || 'Failed to update approval status.', 'error')
  }

  apiRequest(urls.KEYS.PUT, urls.paymentRequests.list, {
    look_up_key: props.request.id,
    data: payload,
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
    onFinally: () => {
      isSubmitting.value = false
    },
  })
}

const closeDialog = () => {
  if (isSubmitting.value) return
  emit('close')
}
</script>
