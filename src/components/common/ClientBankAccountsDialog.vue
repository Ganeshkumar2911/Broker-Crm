<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click="handleClose"
  >
    <div
      class="w-full max-w-2xl rounded-2xl border border-primary-border bg-card-background shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-primary-border px-5 py-4 shrink-0">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Landmark class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-primary-text">
              Bank Accounts — {{ client?.name || 'Client' }}
            </h2>
            <p class="text-xs text-secondary-text mt-0.5">
              Client ID: #{{ client?.id }} · {{ client?.email }}
            </p>
          </div>
        </div>

        <button
          class="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-text hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-5 overflow-y-auto flex-1 space-y-4">
        <!-- Loading State -->
        <div v-if="loading" class="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 class="w-7 h-7 text-primary animate-spin" />
          <p class="text-xs text-secondary-text">Fetching client bank accounts...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!accounts.length" class="py-12 flex flex-col items-center justify-center gap-3 text-center">
          <div class="w-12 h-12 rounded-2xl bg-background border border-primary-border flex items-center justify-center text-secondary-text">
            <CreditCard class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm font-semibold text-primary-text">No Saved Bank Accounts</p>
            <p class="text-xs text-secondary-text mt-1 max-w-sm">
              This client has not saved any bank accounts yet.
            </p>
          </div>
        </div>

        <!-- Accounts List -->
        <div v-else class="space-y-3">
          <div
            v-for="acc in accounts"
            :key="acc.id"
            class="p-4 rounded-xl border border-primary-border bg-background/50 hover:bg-background/80 transition-colors space-y-3"
          >
            <!-- Card Top Row -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-bold text-primary-text">{{ acc.bank || 'Bank Account' }}</span>
                  <span
                    v-if="acc.is_default"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    Default
                  </span>
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-medium border"
                    :class="acc.is_active ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-background text-secondary-text border-primary-border'"
                  >
                    {{ acc.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p v-if="acc.label" class="text-xs text-secondary-text mt-0.5 font-medium">{{ acc.label }}</p>
              </div>

              <!-- Enable Edit Flag Toggle for Admin -->
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-secondary-text font-medium">Allow Client Edit:</span>
                <button
                  type="button"
                  :disabled="togglingMap[acc.id] || !canToggleEdit"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="acc.flag_enable_edit ? 'bg-primary' : 'bg-secondary-text/30'"
                  :title="canToggleEdit ? (acc.flag_enable_edit ? 'Click to disable editing for client' : 'Click to enable editing for client') : 'Permission required: user_bank_accounts.enable_edit'"
                  @click="toggleEnableEdit(acc)"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                    :class="acc.flag_enable_edit ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-card-background/60 p-3 rounded-lg border border-primary-border">
              <div>
                <span class="text-[10px] uppercase text-secondary-text font-semibold tracking-wider block">Account Name</span>
                <span class="font-medium text-primary-text">{{ acc.account_name || '—' }}</span>
              </div>
              <div>
                <span class="text-[10px] uppercase text-secondary-text font-semibold tracking-wider block">Account Number</span>
                <span class="font-mono font-bold text-primary-text">{{ acc.account_number || '—' }}</span>
              </div>
              <div>
                <span class="text-[10px] uppercase text-secondary-text font-semibold tracking-wider block">IFSC / Branch Code</span>
                <span class="font-mono font-medium text-primary-text">{{ acc.bank_branch_code || acc.ifsc_code || '—' }}</span>
              </div>
              <div>
                <span class="text-[10px] uppercase text-secondary-text font-semibold tracking-wider block">Account Type</span>
                <span class="font-medium text-primary-text capitalize">{{ acc.account_type || '—' }}</span>
              </div>
              <div>
                <span class="text-[10px] uppercase text-secondary-text font-semibold tracking-wider block">Branch Name</span>
                <span class="font-medium text-primary-text">{{ acc.bank_branch || '—' }}</span>
              </div>
              <div>
                <span class="text-[10px] uppercase text-secondary-text font-semibold tracking-wider block">Client Edit Status</span>
                <span
                  class="font-semibold"
                  :class="acc.flag_enable_edit ? 'text-primary-green' : 'text-secondary-text'"
                >
                  {{ acc.flag_enable_edit ? 'Unlocked for 1 edit' : 'Locked' }}
                </span>
              </div>
            </div>

            <!-- Document Proof Attachment -->
            <div
              v-if="acc.document_proof_url || acc.document_proof"
              class="flex items-center justify-between pt-2 px-1 text-xs border-t border-primary-border/60"
            >
              <span class="text-secondary-text font-medium flex items-center gap-1.5 text-[11px]">
                <Paperclip class="w-3.5 h-3.5 text-primary shrink-0" />
                Document Proof Attachment:
              </span>
              <a
                :href="acc.document_proof_url || acc.document_proof"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:underline font-semibold flex items-center gap-1 text-xs"
              >
                <span>View Document Proof</span>
                <ExternalLink class="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-primary-border px-5 py-3.5 bg-card-background/40 flex items-center justify-between shrink-0">
        <p class="text-[11px] text-secondary-text flex items-center gap-1.5">
          <Info class="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Toggling 'Allow Client Edit' unlocks the account for 1 update cycle in the client portal.</span>
        </p>
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-background border border-primary-border text-xs font-medium text-primary-text hover:bg-card-background transition-colors cursor-pointer"
          @click="handleClose"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Landmark, CreditCard, X, Loader2, Info, Paperclip, ExternalLink } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: null },
})

const emit = defineEmits(['close'])
const snackbar = useSnackbarStore()
const { hasPermission } = usePermissionCheck()

const accounts = ref([])
const loading = ref(false)
const togglingMap = ref({})

const canToggleEdit = computed(() => {
  return hasPermission('user_bank_accounts.enable_edit') || hasPermission('client.update')
})

const fetchBankAccounts = () => {
  if (!props.client?.id) return
  loading.value = true
  accounts.value = []

  apiRequest(urls.KEYS.GET, urls.bankAccounts.adminList(props.client.id), {
    isTokenRequired: true,
    onSuccess: (res) => {
      accounts.value = res?.data || []
      loading.value = false
    },
    onFailure: (err) => {
      loading.value = false
      snackbar.show(err?.message || 'Failed to fetch client bank accounts.', 'error')
    },
  })
}

const toggleEnableEdit = (account) => {
  if (!props.client?.id || !account?.id || !canToggleEdit.value) return

  const targetState = !account.flag_enable_edit
  togglingMap.value[account.id] = true

  apiRequest(urls.KEYS.PATCH, urls.bankAccounts.enableEdit(props.client.id, account.id), {
    data: {
      flag_enable_edit: targetState,
    },
    isTokenRequired: true,
    onSuccess: (res) => {
      togglingMap.value[account.id] = false
      account.flag_enable_edit = targetState
      snackbar.show(
        res?.message || `Bank account edit ${targetState ? 'enabled' : 'disabled'} for client.`,
        'success'
      )
    },
    onFailure: (err) => {
      togglingMap.value[account.id] = false
      snackbar.show(err?.message || 'Failed to update bank account edit permission.', 'error')
    },
  })
}

const handleClose = () => {
  emit('close')
}

watch(
  () => [props.open, props.client],
  ([newOpen, newClient]) => {
    if (newOpen && newClient?.id) {
      fetchBankAccounts()
    }
  },
  { immediate: true }
)
</script>
