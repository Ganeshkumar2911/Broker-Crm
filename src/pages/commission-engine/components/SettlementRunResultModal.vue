<script setup>
import { computed } from "vue";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  InformationCircleIcon,
  Coins01Icon,
  RefreshCwIcon,
  UserIcon,
  Clock01Icon,
  Invoice01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  result: {
    type: Object,
    default: null,
  },
  isDryRun: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const closeModal = () => {
  emit("update:modelValue", false);
};

const isSingleIb = computed(() => {
  return props.result && (props.result.ib_id !== undefined || Array.isArray(props.result.batches));
});

const isMultiIb = computed(() => {
  return props.result && (props.result.settled_count !== undefined || Array.isArray(props.result.settled) || Array.isArray(props.result.skipped));
});

const singleBatches = computed(() => {
  if (!props.result) return [];
  if (Array.isArray(props.result.batches)) return props.result.batches;
  if (Array.isArray(props.result.settled)) return props.result.settled;
  return [];
});

const getStatusBadge = (status) => {
  switch (status) {
    case "paid":
      return { label: "Paid & Credited", class: "bg-primary-green/10 text-primary-green border-primary-green/20" };
    case "dry_run":
      return { label: "Dry Run Preview", class: "bg-primary-blue/10 text-primary-blue border-primary-blue/20" };
    case "empty":
      return { label: "Empty (0 Payable)", class: "bg-background text-secondary-text border-primary-border" };
    case "already_settled":
      return { label: "Already Settled", class: "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20" };
    case "failed":
      return { label: "Failed", class: "bg-primary-red/10 text-primary-red border-primary-red/20" };
    default:
      return { label: status || "Unknown", class: "bg-background text-secondary-text border-primary-border" };
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
          class="w-full max-w-2xl bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                :class="
                  isDryRun
                    ? 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                    : 'bg-primary-green/10 text-primary-green border-primary-green/20'
                "
              >
                <HugeIcon :icon="isDryRun ? InformationCircleIcon : CheckmarkCircle02Icon" :size="20" />
              </div>
              <div>
                <h3 class="title-text text-base text-primary-text font-semibold flex items-center gap-2">
                  <span>{{ isDryRun ? "Settlement Dry Run Preview" : "Settlement Execution Results" }}</span>
                  <span
                    v-if="isDryRun"
                    class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20"
                  >
                    PREVIEW ONLY
                  </span>
                </h3>
                <p class="text-xs text-secondary-text">
                  {{ isDryRun ? "Simulated settlement calculation without wallet credit or status changes" : "Settlement batch summary and transaction output" }}
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
          <div class="p-6 space-y-5 overflow-y-auto">
            <!-- Single IB View -->
            <template v-if="isSingleIb">
              <!-- Summary Card -->
              <div class="p-4 rounded-xl bg-background border border-primary-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-secondary-text block mb-0.5">IB Identifier</span>
                  <span class="font-bold text-primary-text font-mono">IB #{{ result.ib_id }}</span>
                </div>
                <div>
                  <span class="text-secondary-text block mb-0.5">Period Type</span>
                  <span class="font-semibold text-primary-text capitalize">{{ result.period_type || "N/A" }}</span>
                </div>
                <div>
                  <span class="text-secondary-text block mb-0.5">Period Key</span>
                  <span class="font-bold text-primary font-mono">{{ result.period_key || "N/A" }}</span>
                </div>
                <div>
                  <span class="text-secondary-text block mb-0.5">Time Range</span>
                  <span class="text-primary-text font-mono text-[11px]">
                    {{ result.start ? result.start.split('T')[0] : '' }} → {{ result.end ? result.end.split('T')[0] : '' }}
                  </span>
                </div>
              </div>

              <!-- Batches List -->
              <div class="space-y-3">
                <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
                  <HugeIcon :icon="Invoice01Icon" :size="14" class="text-secondary-text" />
                  <span>Generated Settlement Batches ({{ singleBatches.length }})</span>
                </h4>

                <div v-if="singleBatches.length === 0" class="p-6 text-center rounded-xl bg-background border border-primary-border">
                  <p class="text-xs text-secondary-text">No pending entries payable for this period.</p>
                </div>

                <div v-else class="space-y-2.5">
                  <div
                    v-for="(batch, idx) in singleBatches"
                    :key="batch.batch_id || idx"
                    class="p-4 rounded-xl border border-primary-border bg-card-background space-y-3"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold text-primary-text">
                          Batch #{{ batch.batch_id || 'Preview' }}
                        </span>
                        <span
                          class="px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                          :class="getStatusBadge(batch.status).class"
                        >
                          {{ getStatusBadge(batch.status).label }}
                        </span>
                      </div>
                      <div class="text-right">
                        <span class="text-sm font-bold text-primary-green font-mono">
                          ${{ Number(batch.total_amount || 0).toFixed(2) }}
                        </span>
                        <span class="text-[11px] text-secondary-text font-mono ml-1">{{ batch.account_currency || 'USD' }}</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-primary-border/60 text-xs">
                      <div>
                        <span class="text-secondary-text">Entries Payable:</span>
                        <span class="ml-1.5 font-semibold text-primary-text font-mono">{{ batch.entry_count ?? 0 }}</span>
                      </div>
                      <div v-if="batch.wallet_transaction_id">
                        <span class="text-secondary-text">Wallet Tx:</span>
                        <span class="ml-1.5 font-semibold text-primary-blue font-mono">#{{ batch.wallet_transaction_id }}</span>
                      </div>
                      <div>
                        <span class="text-secondary-text">Period:</span>
                        <span class="ml-1.5 text-primary-text font-mono">{{ batch.period_key }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Multi IB / Due Run View -->
            <template v-else-if="isMultiIb">
              <!-- Summary Badges -->
              <div class="grid grid-cols-3 gap-3">
                <div class="p-3 rounded-xl bg-primary-green/10 border border-primary-green/20 text-center">
                  <span class="text-xs text-primary-green block">Settled IBs</span>
                  <span class="text-lg font-bold text-primary-green font-mono">{{ result.settled_count ?? 0 }}</span>
                </div>
                <div class="p-3 rounded-xl bg-background border border-primary-border text-center">
                  <span class="text-xs text-secondary-text block">Skipped IBs</span>
                  <span class="text-lg font-bold text-primary-text font-mono">{{ result.skipped_count ?? 0 }}</span>
                </div>
                <div class="p-3 rounded-xl bg-primary-red/10 border border-primary-red/20 text-center">
                  <span class="text-xs text-primary-red block">Errors</span>
                  <span class="text-lg font-bold text-primary-red font-mono">{{ result.error_count ?? 0 }}</span>
                </div>
              </div>

              <!-- Settled List -->
              <div v-if="result.settled && result.settled.length" class="space-y-2">
                <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider">Settled Batches ({{ result.settled.length }})</h4>
                <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  <div
                    v-for="(item, idx) in result.settled"
                    :key="idx"
                    class="p-2.5 rounded-lg border border-primary-border bg-card-background flex items-center justify-between text-xs"
                  >
                    <span class="font-mono font-semibold text-primary-text">IB #{{ item.ib_id }} ({{ item.period_key }})</span>
                    <span class="font-mono font-bold text-primary-green">${{ Number(item.total_amount || 0).toFixed(2) }} {{ item.account_currency || 'USD' }}</span>
                  </div>
                </div>
              </div>

              <!-- Skipped List -->
              <div v-if="result.skipped && result.skipped.length" class="space-y-2">
                <h4 class="text-xs font-bold text-secondary-text uppercase tracking-wider">Skipped IBs ({{ result.skipped.length }})</h4>
                <div class="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  <div
                    v-for="(item, idx) in result.skipped"
                    :key="idx"
                    class="p-2.5 rounded-lg border border-primary-border bg-background flex items-center justify-between text-xs"
                  >
                    <span class="font-mono text-primary-text">IB #{{ item.ib_id }}</span>
                    <span class="text-secondary-text text-[11px]">{{ item.reason?.replace(/_/g, ' ') || 'Not due' }}</span>
                  </div>
                </div>
              </div>

              <!-- Errors List -->
              <div v-if="result.errors && result.errors.length" class="space-y-2">
                <h4 class="text-xs font-bold text-primary-red uppercase tracking-wider">Errors ({{ result.errors.length }})</h4>
                <div class="space-y-1.5">
                  <div
                    v-for="(err, idx) in result.errors"
                    :key="idx"
                    class="p-2.5 rounded-lg border border-primary-red/20 bg-primary-red/10 text-primary-red text-xs font-mono"
                  >
                    {{ err.message || err }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Raw / Fallback View -->
            <template v-else>
              <pre class="p-4 rounded-xl bg-background border border-primary-border text-xs font-mono text-primary-text overflow-x-auto">
{{ JSON.stringify(result, null, 2) }}
              </pre>
            </template>
          </div>

          <!-- Modal Footer -->
          <div
            class="flex items-center justify-end px-6 py-3.5 border-t border-primary-border bg-card-background"
          >
            <button
              type="button"
              class="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
              @click="closeModal"
            >
              Close
            </button>
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
