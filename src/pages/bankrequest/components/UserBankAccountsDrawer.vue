<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
    @click="handleClose"
  >
    <div
      class="bg-card-background border-l border-primary-border w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      @click.stop
    >
      <!-- Drawer Header -->
      <div class="px-6 py-5 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <HugeIcon :icon="Building02Icon" :size="22" />
          </div>
          <div>
            <h3 class="text-base font-bold text-primary-text">
              User Saved Bank Accounts
            </h3>
            <p class="text-xs text-secondary-text mt-0.5">
              User #{{ userId }} • {{ store.userBankAccounts.length }} / 3 Active Accounts
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="refresh"
            :disabled="store.userAccountsLoading"
            class="btn-icon p-2"
            title="Refresh user accounts"
          >
            <HugeIcon :icon="RefreshCwIcon" :size="16" :class="{ 'animate-spin': store.userAccountsLoading }" />
          </button>

          <button
            type="button"
            @click="handleClose"
            class="btn-icon p-2"
          >
            <HugeIcon :icon="Cancel01Icon" :size="18" />
          </button>
        </div>
      </div>

      <!-- Drawer Content -->
      <div class="p-6 overflow-y-auto flex-1 space-y-4 no-scrollbar">
        <!-- Loading Skeleton -->
        <div v-if="store.userAccountsLoading" class="space-y-4 animate-pulse">
          <div v-for="i in 3" :key="i" class="p-4 bg-background rounded-xl border border-primary-border space-y-3">
            <div class="h-4 w-32 bg-card-background rounded" />
            <div class="h-3 w-48 bg-card-background rounded" />
            <div class="h-8 w-full bg-card-background rounded" />
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!store.userBankAccounts.length"
          class="p-12 text-center text-secondary-text space-y-3 bg-background/50 border border-dashed border-primary-border rounded-2xl"
        >
          <HugeIcon :icon="Building02Icon" :size="32" class="mx-auto text-secondary-text/40" />
          <p class="font-bold text-primary-text text-sm">No Bank Accounts Found</p>
          <p class="text-xs text-secondary-text max-w-xs mx-auto">
            This user has not registered any saved bank accounts yet.
          </p>
        </div>

        <!-- Accounts List -->
        <div v-else class="space-y-4">
          <div
            v-for="acc in store.userBankAccounts"
            :key="acc.id"
            class="bg-background border border-primary-border rounded-2xl p-4.5 space-y-3 shadow-xs hover:border-primary/40 transition-colors"
          >
            <!-- Account Top Info -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-primary-text text-sm">{{ acc.bank }}</h4>
                  <span v-if="acc.label" class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold border border-primary/20">
                    {{ acc.label }}
                  </span>
                  <span v-if="acc.is_default" class="text-[10px] bg-primary-green/10 text-primary-green px-2 py-0.5 rounded-md font-bold border border-primary-green/20">
                    Default
                  </span>
                </div>
                <p class="text-xs text-secondary-text mt-0.5 font-medium">
                  {{ acc.account_name }} • {{ acc.account_number }}
                </p>
              </div>

              <!-- Status Badge -->
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize shrink-0 border"
                :class="getStatusClass(acc.approval_status)"
              >
                {{ acc.approval_status }}
              </span>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-primary-border/60 text-xs">
              <div>
                <p class="text-[10px] text-secondary-text uppercase font-semibold">IFSC / Code</p>
                <p class="font-bold text-primary-text mt-0.5">{{ acc.bank_branch_code || '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] text-secondary-text uppercase font-semibold">Type</p>
                <p class="font-medium text-primary-text mt-0.5 uppercase">{{ acc.account_type || 'Savings' }}</p>
              </div>
              <div>
                <p class="text-[10px] text-secondary-text uppercase font-semibold">Branch</p>
                <p class="font-medium text-primary-text mt-0.5 truncate" :title="acc.bank_branch">{{ acc.bank_branch || '—' }}</p>
              </div>
            </div>

            <!-- Rejection Reason if present -->
            <div
              v-if="acc.approval_status === 'rejected' && acc.rejection_reason"
              class="p-2.5 rounded-xl bg-primary-red/10 border border-primary-red/20 text-xs space-y-1"
            >
              <p class="font-bold text-primary-red text-[11px] uppercase tracking-wider">Rejection Reason</p>
              <p class="text-primary-text leading-relaxed">{{ acc.rejection_reason }}</p>
            </div>

            <!-- Actions & Edit Lock Toolbar -->
            <div class="pt-2 border-t border-primary-border/60 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <!-- View Proof Button -->
                <button
                  v-if="acc.document_proof_url || acc.document_proof"
                  type="button"
                  @click="emit('preview-proof', acc)"
                  class="btn-secondary px-3 py-1.5"
                >
                  <HugeIcon :icon="FileAttachmentIcon" :size="13" class="text-primary" />
                  <span>View Proof</span>
                </button>

                <!-- Enable/Disable Edit Manual Unlock -->
                <button
                  v-if="hasPermission('user_bank_account.enable_edit')"
                  type="button"
                  @click="handleToggleEdit(acc)"
                  :disabled="store.actionLoading"
                  :class="acc.flag_enable_edit ? 'btn-warning px-3 py-1.5' : 'btn-secondary px-3 py-1.5'"
                  :title="acc.flag_enable_edit ? 'Click to disable editing' : 'Click to allow client editing'"
                >
                  <HugeIcon :icon="acc.flag_enable_edit ? PencilEdit01Icon : LockPasswordIcon" :size="13" />
                  <span>{{ acc.flag_enable_edit ? 'Edit Unlocked' : 'Edit Locked' }}</span>
                </button>
              </div>

              <!-- Pending Approval Decision Buttons -->
              <div v-if="acc.approval_status === 'pending'" class="flex items-center gap-2">
                <button
                  v-if="hasPermission('user_bank_account.reject')"
                  type="button"
                  @click="emit('reject', acc)"
                  class="btn-danger px-3 py-1.5"
                >
                  <HugeIcon :icon="Cancel01Icon" :size="13" />
                  <span>Reject</span>
                </button>

                <button
                  v-if="hasPermission('user_bank_account.approve')"
                  type="button"
                  @click="emit('approve', acc)"
                  class="btn-success px-3 py-1.5"
                >
                  <HugeIcon :icon="CheckmarkCircle02Icon" :size="13" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="px-6 py-4 border-t border-primary-border bg-background/50 flex justify-end">
        <button
          type="button"
          @click="handleClose"
          class="btn-secondary"
        >
          Close Drawer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Building02Icon,
  Cancel01Icon,
  RefreshCwIcon,
  FileAttachmentIcon,
  CheckmarkCircle02Icon,
  LockPasswordIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { useBankRequestStore } from "@/stores/bankRequest/bankRequest";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(["close", "preview-proof", "approve", "reject"]);

const store = useBankRequestStore();
const { hasPermission } = usePermissionCheck();

const refresh = () => {
  if (props.userId) {
    store.fetchUserBankAccounts(props.userId, true);
  }
};

const handleClose = () => {
  emit("close");
};

const handleToggleEdit = (acc) => {
  store.toggleEnableEdit(acc.user_id, acc.id, !acc.flag_enable_edit);
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-primary-green/10 text-primary-green border-primary-green/20";
    case "rejected":
      return "bg-primary-red/10 text-primary-red border-primary-red/20";
    case "pending":
      return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
    default:
      return "bg-background text-secondary-text border-primary-border";
  }
};
</script>
