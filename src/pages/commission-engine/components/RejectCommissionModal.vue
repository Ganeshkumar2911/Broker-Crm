<script setup>
import { ref, watch } from "vue";
import {
  Cancel01Icon,
  Loading03Icon,
  Delete02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  commission: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "rejected"]);

const store = useCommissionEngineStore();

const reason = ref("");

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      reason.value = "";
    }
  }
);

const closeModal = () => {
  emit("update:modelValue", false);
};

const handleReject = async () => {
  if (!props.commission?.id) return;
  try {
    await store.rejectCommission(props.commission.id, reason.value.trim());
    closeModal();
    emit("rejected");
  } catch (err) {
    // Handled in store
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-md bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center border border-primary-red/20"
              >
                <HugeIcon :icon="Delete02Icon" :size="18" />
              </div>
              <div>
                <h3 class="title-text text-base text-primary-text font-semibold">
                  Reject Commission #{{ commission?.id }}
                </h3>
                <p class="text-xs text-secondary-text">
                  Disallow wallet payout for this trade entry
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="closeModal"
            >
              <HugeIcon :icon="Cancel01Icon" :size="16" />
            </button>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="handleReject" class="p-5 space-y-4">
            <!-- Warning -->
            <div
              class="p-3.5 rounded-xl bg-primary-red/10 border border-primary-red/20 flex items-start gap-2.5"
            >
              <HugeIcon :icon="Alert02Icon" :size="18" class="text-primary-red shrink-0 mt-0.5" />
              <div class="text-xs space-y-1">
                <p class="font-semibold text-primary-text">
                  Commission Rejection Notice
                </p>
                <p class="text-secondary-text leading-relaxed">
                  Rejecting this entry will permanently mark the commission record as <span class="font-semibold text-primary-red">Rejected</span> and no wallet credit will occur.
                </p>
              </div>
            </div>

            <!-- Trade Summary -->
            <div v-if="commission" class="p-3.5 rounded-xl bg-background border border-primary-border space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-secondary-text">IB Partner:</span>
                <span class="font-semibold text-primary-text">
                  {{ commission.ib_name || `IB #${commission.ib_id}` }}
                  <span class="text-secondary-text font-mono text-[11px] font-normal">(#{{ commission.ib_id }})</span>
                </span>
              </div>
              <div v-if="commission.user_name" class="flex items-center justify-between">
                <span class="text-secondary-text">Trader / Client:</span>
                <span class="text-primary-text font-medium">
                  {{ commission.user_name }}
                  <span class="text-secondary-text font-mono text-[11px]">(#{{ commission.user_id || commission.trade?.user_id || 'N/A' }})</span>
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-secondary-text">Amount:</span>
                <span class="font-mono font-bold text-primary-red">
                  ${{ Number(commission.total_commission || 0).toFixed(4) }} {{ commission.account_currency || "USD" }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-secondary-text">Symbol & Lots:</span>
                <span class="font-mono text-primary-text">
                  {{ commission.trade?.symbol || "N/A" }} ({{ commission.closed_volume_lots ?? commission.volume_lots ?? '-' }} lots)
                </span>
              </div>
            </div>

            <!-- Reason Input -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-primary-text">
                Rejection Reason
                <span class="text-[10px] text-secondary-text font-normal ml-1">(Optional audit log note)</span>
              </label>
              <textarea
                v-model="reason"
                rows="3"
                placeholder="e.g. Out of policy, cancelled trade, invalid account..."
                class="input-field w-full px-3 py-2 text-xs resize-none"
              />
            </div>

            <!-- Modal Footer -->
            <div class="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                class="px-4 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background border border-primary-border rounded-xl transition-all cursor-pointer"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="store.actionLoading || !commission"
                class="flex items-center gap-2 px-4 py-2 bg-primary-red hover:bg-primary-red/90 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HugeIcon
                  v-if="store.actionLoading"
                  :icon="Loading03Icon"
                  :size="14"
                  class="animate-spin"
                />
                <HugeIcon v-else :icon="Delete02Icon" :size="14" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
