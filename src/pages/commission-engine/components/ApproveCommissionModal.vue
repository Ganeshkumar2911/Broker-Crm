<script setup>
import { computed } from "vue";
import {
  Cancel01Icon,
  Loading03Icon,
  CheckmarkCircle02Icon,
  Coins01Icon,
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
  commissions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "approved"]);

const store = useCommissionEngineStore();

const isBulk = computed(() => !props.commission && props.commissions.length > 0);

const itemsCount = computed(() => {
  if (isBulk.value) return props.commissions.length;
  return props.commission ? 1 : 0;
});

const totalAmount = computed(() => {
  if (isBulk.value) {
    return props.commissions.reduce((sum, c) => sum + (Number(c.total_commission) || 0), 0);
  }
  return Number(props.commission?.total_commission) || 0;
});

const closeModal = () => {
  emit("update:modelValue", false);
};

const handleApprove = async () => {
  try {
    if (isBulk.value) {
      const ids = props.commissions.map((c) => c.id);
      await store.bulkApproveCommissions(ids);
    } else if (props.commission?.id) {
      await store.approveCommission(props.commission.id);
    }
    closeModal();
    emit("approved");
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
                class="w-9 h-9 rounded-xl bg-primary-green/10 text-primary-green flex items-center justify-center border border-primary-green/20"
              >
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="18" />
              </div>
              <div>
                <h3 class="title-text text-base text-primary-text font-semibold">
                  {{ isBulk ? `Approve ${itemsCount} Commissions` : `Approve Commission #${commission?.id}` }}
                </h3>
                <p class="text-xs text-secondary-text">
                  Confirm wallet credit authorization
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
          <div class="p-5 space-y-4">
            <!-- Notice -->
            <div
              class="p-3.5 rounded-xl bg-primary-green/10 border border-primary-green/20 flex items-start gap-2.5"
            >
              <HugeIcon :icon="Coins01Icon" :size="18" class="text-primary-green shrink-0 mt-0.5" />
              <div class="text-xs space-y-1">
                <p class="font-semibold text-primary-text">
                  Wallet Credit Confirmation
                </p>
                <p class="text-secondary-text leading-relaxed">
                  Approving this commission will immediately credit the corresponding IB wallet and mark the record as <span class="font-semibold text-primary-green">Approved</span>.
                </p>
              </div>
            </div>

            <!-- Details Summary -->
            <div class="p-4 rounded-xl bg-background border border-primary-border space-y-2.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-secondary-text">Total Credit Amount:</span>
                <span class="font-mono font-bold text-sm text-primary-green">
                  ${{ totalAmount.toFixed(4) }} {{ !isBulk ? (commission?.account_currency || "USD") : "" }}
                </span>
              </div>

              <div v-if="!isBulk && commission" class="pt-2 border-t border-primary-border space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-secondary-text">IB Partner:</span>
                  <span class="font-semibold text-primary-text">
                    {{ commission.ib_name || `IB #${commission.ib_id}` }}
                    <span class="text-secondary-text font-mono text-[11px] font-normal">
                      (#{{ commission.ib_id }})
                    </span>
                  </span>
                </div>
                <div v-if="commission.user_name" class="flex items-center justify-between">
                  <span class="text-secondary-text">Trader / Client:</span>
                  <span class="text-primary-text font-medium">
                    {{ commission.user_name }}
                    <span class="text-secondary-text font-mono text-[11px]">
                      (#{{ commission.user_id || commission.trade?.user_id || 'N/A' }})
                    </span>
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-secondary-text">Trading Account Login:</span>
                  <span class="font-mono text-primary-text">
                    {{ commission.trade?.login || "N/A" }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-secondary-text">Symbol & Lots:</span>
                  <span class="font-mono text-primary-text">
                    {{ commission.trade?.symbol || "N/A" }} &middot; {{ commission.closed_volume_lots ?? commission.volume_lots ?? '-' }} lots
                  </span>
                </div>
              </div>

              <div v-else-if="isBulk" class="pt-2 border-t border-primary-border flex items-center justify-between">
                <span class="text-secondary-text">Selected Entries:</span>
                <span class="font-semibold text-primary-text">{{ itemsCount }} items</span>
              </div>
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
                type="button"
                :disabled="store.actionLoading || itemsCount === 0"
                class="flex items-center gap-2 px-4 py-2 bg-primary-green hover:bg-primary-green/90 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleApprove"
              >
                <HugeIcon
                  v-if="store.actionLoading"
                  :icon="Loading03Icon"
                  :size="14"
                  class="animate-spin"
                />
                <HugeIcon v-else :icon="CheckmarkCircle02Icon" :size="14" />
                <span>{{ isBulk ? `Approve ${itemsCount} Commissions` : "Confirm & Credit Wallet" }}</span>
              </button>
            </div>
          </div>
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
