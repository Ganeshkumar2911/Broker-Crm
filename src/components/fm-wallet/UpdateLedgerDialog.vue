<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-all duration-300"
    @click="closeDialog"
  >
    <div
      class="bg-card-background border border-primary-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform scale-100 transition-all duration-300 relative"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background">
        <div class="flex items-center gap-2">
          <Wallet class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-semibold text-primary-text">Update FM Ledger</h2>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors text-secondary-text hover:text-primary-text cursor-pointer"
          @click="closeDialog"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 bg-card-background">
        
        <!-- Transaction Type Toggle -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-primary-text">Transaction Type</label>
          <div class="flex border border-primary-border rounded-xl bg-background p-1 gap-1">
            <button
              type="button"
              class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              :class="form.type === 'deposit' 
                ? 'bg-green-600 text-white shadow-xs' 
                : 'text-secondary-text hover:text-primary-text hover:bg-card-background/50'"
              @click="form.type = 'deposit'"
            >
              Deposit
            </button>
            <button
              type="button"
              class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              :class="form.type === 'withdrawal' 
                ? 'bg-red-600 text-white shadow-xs' 
                : 'text-secondary-text hover:text-primary-text hover:bg-card-background/50'"
              @click="form.type = 'withdrawal'"
            >
              Withdrawal
            </button>
          </div>
        </div>

        <!-- FM Selection -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-primary-text">Select Fund Manager</label>
          <BaseSelect
            v-model="form.user_id"
            :options="fmOptions"
            :isLoading="isFetchingFms"
            placeholder="Search or select FM..."
            searchable
            clearable
            :isShowMail="true"
            class="w-full"
          />
        </div>

        <!-- Selected FM Details -->
        <div v-if="selectedFm" class="p-3.5 bg-background border border-primary-border rounded-xl space-y-1.5 text-xs text-secondary-text">
          <div class="flex justify-between items-center text-[9px] font-bold text-primary-text uppercase tracking-widest">
            <span>Selected FM Info</span>
            <span class="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 normal-case font-medium font-mono">
              User ID: {{ selectedFm.value }}
            </span>
          </div>
          <p class="font-medium text-primary-text text-sm truncate">{{ selectedFm.label }}</p>
          <p v-if="selectedFm.email" class="text-xs text-secondary-text truncate font-mono">{{ selectedFm.email }}</p>
          
          <div v-if="selectedFm.available_balance != null" class="flex justify-between items-center pt-2 border-t border-primary-border">
            <span class="font-medium">Available Balance:</span>
            <span class="font-bold text-primary-text text-sm">${{ formatNum(selectedFm.available_balance) }}</span>
          </div>
        </div>

        <!-- Amount -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-primary-text">Amount ($)</label>
          <input
            v-model.number="form.amount"
            type="number"
            step="any"
            min="0.01"
            placeholder="0.00"
            class="w-full bg-background border border-primary-border rounded-xl px-3 py-2 text-sm text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:border-primary transition"
            required
          />
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-primary-text">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Enter reason or reference details (Default: Admin Wallet Adjustment)..."
            class="w-full bg-background border border-primary-border rounded-xl px-3 py-2 text-sm text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:border-primary transition resize-none"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            :disabled="isSubmitting"
            class="flex-1 px-4 py-2.5 border border-primary-border text-secondary-text hover:text-primary-text bg-background hover:bg-background rounded-lg text-xs font-semibold tracking-wide transition active:scale-[0.98] disabled:opacity-40 cursor-pointer"
            @click="closeDialog"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!form.user_id || !form.amount || isSubmitting"
            class="flex-1 px-4 py-2.5 text-white rounded-lg text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            :class="form.type === 'deposit'
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-600/40'
              : 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/40'"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmitting ? 'Processing...' : (form.type === 'deposit' ? 'Submit Deposit' : 'Submit Withdrawal') }}</span>
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { X, Loader2, Wallet } from 'lucide-vue-next'
import BaseSelect from '@/components/common/BaseSelect.vue'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'success'])

const snackbar = useSnackbarStore()

const isSubmitting = ref(false)
const isFetchingFms = ref(false)
const fmOptions = ref([])

const form = reactive({
  type: 'deposit', // 'deposit' or 'withdrawal'
  user_id: null,
  amount: null,
  description: '',
})

// Mapped selected FM Details from fmOptions
const selectedFm = computed(() => {
  return fmOptions.value.find((fm) => fm.value === form.user_id) || null
})

// Fetch FM simple list (from /fm-list as in settlements/index.vue)
const fetchFms = async () => {
  try {
    isFetchingFms.value = true
    const res = await apiRequest('get', urls.fm.simpleList, { params: { page: 1, per_page: 1000 } })
    if (res?.data) {
      fmOptions.value = res.data.map((fm) => {
        const labelName = fm.label_name || 'FM'
        const name = fm.name || ''
        const displayName = labelName === name || !name ? labelName : `${labelName} (${name})`
        const targetUserId = fm.user_id != null ? fm.user_id : fm.id
        return {
          label: `${displayName} (#${targetUserId})`,
          email: fm.email,
          value: targetUserId,
          user_id: targetUserId,
          fm_id: fm.id,
          available_balance: fm.available_balance ?? fm.wallet_balance ?? fm.balance ?? null,
          raw: fm,
        }
      })
    }
  } catch (err) {
    console.error('Failed to load fund managers list:', err)
  } finally {
    isFetchingFms.value = false
  }
}

// Watch open state to reset form fields and load FM options
watch(() => props.open, (newVal) => {
  if (newVal) {
    form.type = 'deposit'
    form.user_id = null
    form.amount = null
    form.description = ''
    if (!fmOptions.value.length) {
      fetchFms()
    }
  }
})

onMounted(() => {
  if (props.open && !fmOptions.value.length) {
    fetchFms()
  }
})

const formatNum = (val) =>
  (val ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const handleSubmit = () => {
  if (!form.user_id || !form.amount) return
  isSubmitting.value = true

  // Adjust amount based on type
  const targetAmount = form.type === 'withdrawal' ? -Math.abs(form.amount) : Math.abs(form.amount)

  const payload = {
    user_id: Number(form.user_id),
    amount: targetAmount,
    description: form.description?.trim() || 'Admin Wallet Adjustment',
  }

  apiRequest(urls.KEYS.POST, urls.fmLedger.update, {
    data: payload,
    isTokenRequired: true,
    onSuccess: (res) => {
      snackbar.show(res?.message || 'FM wallet adjusted successfully.', 'success')
      isSubmitting.value = false
      emit('success')
      closeDialog()
    },
    onFailure: (err) => {
      snackbar.show(err?.message || 'Failed to update FM ledger.', 'error')
      isSubmitting.value = false
    },
  })
}

const closeDialog = () => {
  emit('close')
}
</script>
