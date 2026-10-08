<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border bg-card-background/90 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <HugeIcon :icon="Activity01Icon" :size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-primary-text">Transaction Details</h3>
                <span class="px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-background border border-primary-border text-primary-text">
                  #{{ transaction?.id }}
                </span>
              </div>
              <p class="text-[11px] text-secondary-text mt-0.5">
                {{ formatDateTime(transaction?.created_at) }}
              </p>
            </div>
          </div>

          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            title="Close Drawer"
            @click="$emit('close')"
          >
            <HugeIcon :icon="Cancel01Icon" :size="18" />
          </button>
        </div>

        <!-- Body Content -->
        <div v-if="transaction" class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          
          <!-- Payout & Status Highlight -->
          <div class="p-4 rounded-xl border border-primary-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-xs font-semibold text-secondary-text uppercase tracking-wider block mb-1">Cashback Amount</span>
              <div class="flex items-baseline gap-2">
                <span
                  class="text-2xl font-black"
                  :class="Number(transaction.amount) >= 0 ? 'text-primary-green' : 'text-primary-red'"
                >
                  {{ formatCurrency(transaction.amount) }}
                </span>
                <span v-if="transaction.balance_after != null" class="text-xs text-secondary-text">
                  (Wallet Balance: <strong class="text-primary-text">{{ formatCurrency(transaction.balance_after) }}</strong>)
                </span>
              </div>
            </div>

            <div class="flex flex-col sm:items-end gap-1.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-md font-mono uppercase bg-primary/10 text-primary border border-primary/20">
                  {{ transaction.transaction_type || 'TX' }}
                </span>
                <StatusBadge :status="transaction.status" />
              </div>
              <span v-if="transaction.status === 'SKIPPED' && (transaction.skip_reason || transaction.metadata?.skip_reason)" class="text-xs font-semibold text-primary-red">
                Reason: {{ getSkipReasonLabel(transaction.skip_reason || transaction.metadata?.skip_reason) }}
              </span>
            </div>
          </div>

          <!-- Duration Alert (if skipped due to duration filter) -->
          <div
            v-if="isDurationSkip"
            class="p-4 rounded-xl border border-primary-red/30 bg-primary-red/10 text-primary-text space-y-2"
          >
            <div class="flex items-center gap-2 text-primary-red font-semibold text-xs">
              <HugeIcon :icon="Clock01Icon" :size="16" />
              <span>Trade Hold Duration Filter Triggered</span>
            </div>
            <p class="text-xs text-secondary-text leading-relaxed">
              This closed trade was held for <strong>{{ transaction.metadata?.duration_seconds ?? 'N/A' }} seconds</strong>, which does not strictly exceed the program's minimum duration requirement of <strong>{{ transaction.metadata?.min_duration_seconds_applied ?? 120 }} seconds</strong>.
            </p>
          </div>

          <!-- Trade & Deal Details -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-secondary-text uppercase tracking-wider">Trading Deal Information</h4>
            <div class="bg-background rounded-xl border border-primary-border divide-y divide-primary-border text-xs">
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">MT5 Deal ID</span>
                <span class="font-mono font-semibold text-primary-text">{{ transaction.mt5_deal_id || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Symbol</span>
                <span class="font-mono font-bold text-primary-text">{{ transaction.symbol || transaction.metadata?.symbol || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Trade Volume (Lots)</span>
                <span class="font-semibold text-primary-text">{{ transaction.lots != null ? transaction.lots : 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Closed Trade Profit / Loss</span>
                <span
                  class="font-semibold"
                  :class="Number(transaction.profit) > 0 ? 'text-primary-green' : (Number(transaction.profit) < 0 ? 'text-primary-red' : 'text-primary-text')"
                >
                  {{ transaction.profit != null ? formatCurrency(transaction.profit) : 'N/A' }}
                </span>
              </div>
              <div v-if="transaction.metadata?.side" class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Order Side</span>
                <span class="font-medium text-primary-text uppercase">{{ transaction.metadata.side }}</span>
              </div>
              <div v-if="transaction.metadata?.duration_seconds != null" class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Trade Hold Duration</span>
                <span class="font-medium text-primary-text">{{ transaction.metadata.duration_seconds }}s (Min: {{ transaction.metadata.min_duration_seconds_applied ?? 120 }}s)</span>
              </div>
            </div>
          </div>

          <!-- Plan & Program Details -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-secondary-text uppercase tracking-wider">Plan & Calculation</h4>
            <div class="bg-background rounded-xl border border-primary-border divide-y divide-primary-border text-xs">
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Plan Code / ID</span>
                <span class="font-mono font-semibold text-primary-text">{{ transaction.plan_code || ('Plan #' + transaction.plan_id) || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Rate Applied</span>
                <span class="font-semibold text-primary-text">{{ transaction.rate_per_lot ? formatCurrency(transaction.rate_per_lot) + ' / lot' : 'N/A' }}</span>
              </div>
              <div v-if="transaction.metadata?.qualify_on" class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Qualify Condition</span>
                <span class="font-semibold capitalize text-primary-text">{{ transaction.metadata.qualify_on }}</span>
              </div>
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Enrollment ID</span>
                <span class="font-mono text-primary-text">{{ transaction.enrollment_id || 'N/A' }}</span>
              </div>
              <div v-if="transaction.redemption_id" class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Redemption ID</span>
                <span class="font-mono font-semibold text-primary text-xs">#{{ transaction.redemption_id }}</span>
              </div>
            </div>
          </div>

          <!-- User & Account Details -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-secondary-text uppercase tracking-wider">Account & User</h4>
            <div class="bg-background rounded-xl border border-primary-border divide-y divide-primary-border text-xs">
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">User Name</span>
                <span class="font-semibold text-primary-text">{{ transaction.user_name || transaction.user?.name || '-' }}</span>
              </div>
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">User Email</span>
                <span class="font-mono text-primary-text">{{ transaction.user_email || transaction.user?.email || '-' }}</span>
              </div>
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">User ID</span>
                <span class="font-mono text-primary-text">{{ transaction.user_id }}</span>
              </div>
              <div class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Trading Account</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-primary-text font-mono">
                    {{ transaction.account_number || transaction.trading_account?.account_number || transaction.trading_account_id }}
                  </span>
                  <span v-if="transaction.trading_account?.trading_type" class="px-1.5 py-0.2 bg-card-background border border-primary-border rounded text-[10px] uppercase font-semibold text-secondary-text">
                    {{ transaction.trading_account.trading_type }}
                  </span>
                </div>
              </div>
              <div v-if="transaction.trading_account?.broker_currency" class="flex justify-between items-center p-3">
                <span class="text-secondary-text">Account Currency</span>
                <span class="font-medium text-primary-text">{{ transaction.trading_account.broker_currency }}</span>
              </div>
            </div>
          </div>

          <!-- Raw Metadata JSON -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-secondary-text uppercase tracking-wider">Raw Metadata Payload</h4>
              <button
                type="button"
                @click="copyMetadata"
                class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <HugeIcon :icon="Copy01Icon" :size="12" />
                {{ copied ? 'Copied!' : 'Copy JSON' }}
              </button>
            </div>
            <pre class="p-3.5 rounded-xl bg-background border border-primary-border font-mono text-[11px] text-secondary-text overflow-x-auto leading-relaxed max-h-48">{{ JSON.stringify(transaction.metadata || {}, null, 2) }}</pre>
          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-primary-border bg-card-background flex justify-end shrink-0">
          <button
            type="button"
            class="px-4 py-2 text-xs font-medium text-secondary-text hover:text-primary-text border border-primary-border rounded-lg cursor-pointer transition hover:bg-background"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  Cancel01Icon,
  Activity01Icon,
  Clock01Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import StatusBadge from "@/components/common/StatusBadge.vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  transaction: {
    type: Object,
    default: null,
  },
});

defineEmits(["close"]);

const copied = ref(false);

const isDurationSkip = computed(() => {
  const reason = props.transaction?.skip_reason || props.transaction?.metadata?.skip_reason;
  return reason === "duration";
});

const getSkipReasonLabel = (reason) => {
  if (!reason) return "-";
  switch (reason) {
    case "duration":
      return "Trade Duration Below Minimum";
    case "plan_not_qualified":
      return "Plan Conditions Not Qualified (P&L Mismatch)";
    case "ineligible_symbol":
      return "Ineligible Trading Symbol";
    default:
      return reason.replace(/_/g, " ");
  }
};

const formatCurrency = (val) => {
  if (val == null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
};

const formatDateTime = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const copyMetadata = () => {
  if (!props.transaction?.metadata) return;
  navigator.clipboard.writeText(JSON.stringify(props.transaction.metadata, null, 2));
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s ease-out;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
