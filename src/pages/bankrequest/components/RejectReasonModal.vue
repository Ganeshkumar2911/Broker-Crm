<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    @click="handleClose"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      @click.stop
    >
      <!-- Modal Header (Fixed) -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary-red/10 border border-primary-red/20 flex items-center justify-center text-primary-red shrink-0">
            <HugeIcon :icon="Alert02Icon" :size="20" />
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-primary-text">Reject Bank Account</h3>
            <p class="text-xs text-secondary-text mt-0.5">
              Specify the reason for rejecting this bank account.
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="text-secondary-text hover:text-primary-text p-1 rounded-lg transition-colors cursor-pointer"
        >
          <HugeIcon :icon="Cancel01Icon" :size="18" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-6 overflow-y-auto flex-1 space-y-4 no-scrollbar">
        <!-- Account Summary Banner -->
        <div v-if="account" class="p-3.5 bg-background border border-primary-border rounded-xl flex items-center justify-between text-xs">
          <div class="min-w-0 pr-2">
            <p class="font-bold text-primary-text truncate">{{ account.account_name || 'Account Holder' }}</p>
            <p class="text-secondary-text mt-0.5 truncate">
              {{ account.bank }} • {{ account.account_number }} (User #{{ account.user_id }})
            </p>
          </div>
          <span class="bg-primary-red/10 text-primary-red border border-primary-red/20 font-bold px-2.5 py-0.5 rounded-full text-[10px] shrink-0">
            Pending Approval
          </span>
        </div>

        <!-- Manual Rejection Reason Input -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-primary-text">
              Rejection Reason <span class="text-primary-red">*</span>
            </label>
            <span class="text-[11px] text-secondary-text" :class="{ 'text-primary-red font-semibold': reason.length > 500 }">
              {{ reason.length }}/500
            </span>
          </div>
          <textarea
            v-model="reason"
            rows="5"
            maxlength="500"
            placeholder="Enter the reason why this bank account was rejected (e.g. Account name mismatch with KYC, invalid branch IFSC code, etc.)..."
            class="input-field p-3.5 text-xs resize-none"
            :class="{ 'border-primary-red focus:border-primary-red': hasError }"
          />
          <p v-if="hasError" class="text-xs text-primary-red mt-1">
            Please enter a rejection reason (minimum 5 characters).
          </p>
        </div>

        <!-- Info Note -->
        <p class="text-[11px] text-secondary-text leading-relaxed bg-primary-yellow/10 border border-primary-yellow/20 p-3 rounded-xl">
          <strong class="text-primary-text font-semibold">Note:</strong> Rejecting this request will automatically unlock editing (<code class="text-[10px] bg-background px-1 py-0.5 rounded font-mono">flag_enable_edit: true</code>) so the user can update their details and re-upload required proof.
        </p>
      </div>

      <!-- Modal Footer (Fixed) -->
      <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between bg-background/50 shrink-0">
        <button
          type="button"
          @click="handleClose"
          :disabled="loading"
          class="btn-secondary"
        >
          Cancel
        </button>

        <button
          type="button"
          @click="handleSubmit"
          :disabled="loading || !reason.trim()"
          class="btn-danger px-5 py-2"
        >
          <HugeIcon v-if="loading" :icon="Loading03Icon" :size="14" class="animate-spin" />
          <span>{{ loading ? 'Rejecting...' : 'Reject Account' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import {
  Alert02Icon,
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  account: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const reason = ref("");
const hasError = ref(false);

watch(
  () => props.open,
  (val) => {
    if (val) {
      reason.value = "";
      hasError.value = false;
    }
  }
);

const handleClose = () => {
  if (props.loading) return;
  emit("close");
};

const handleSubmit = () => {
  if (!reason.value || reason.value.trim().length < 5) {
    hasError.value = true;
    return;
  }
  hasError.value = false;
  emit("submit", reason.value.trim());
};
</script>
