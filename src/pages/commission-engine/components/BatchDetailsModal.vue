<script setup>
import {
  Cancel01Icon,
  Invoice01Icon,
  Coins01Icon,
  CheckmarkCircle02Icon,
  Wallet01Icon,
  Calendar01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  batch: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const closeModal = () => {
  emit("update:modelValue", false);
};

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue && batch"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-lg bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20"
              >
                <HugeIcon :icon="Invoice01Icon" :size="20" />
              </div>
              <div>
                <h3 class="title-text text-base text-primary-text font-semibold flex items-center gap-2">
                  <span>Settlement Batch #{{ batch.id }}</span>
                </h3>
                <p class="text-xs text-secondary-text">
                  Settlement details and commission entry mapping
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

          <!-- Body -->
          <div class="p-6 space-y-4 overflow-y-auto">
            <!-- Key Metric Cards -->
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3.5 rounded-xl bg-background border border-primary-border">
                <span class="text-xs text-secondary-text block mb-1">Total Payout</span>
                <span class="text-lg font-bold text-primary-green font-mono">
                  ${{ Number(batch.total_amount || 0).toFixed(2) }}
                  <span class="text-xs text-secondary-text">{{ batch.account_currency || 'USD' }}</span>
                </span>
              </div>
              <div class="p-3.5 rounded-xl bg-background border border-primary-border">
                <span class="text-xs text-secondary-text block mb-1">Payable Entries</span>
                <span class="text-lg font-bold text-primary-text font-mono">
                  {{ batch.entry_count ?? 0 }}
                </span>
              </div>
            </div>

            <!-- Meta Details Grid -->
            <div class="p-4 rounded-xl border border-primary-border bg-card-background space-y-3 text-xs">
              <div class="flex justify-between py-1 border-b border-primary-border/60">
                <span class="text-secondary-text">IB Partner:</span>
                <span class="font-bold text-primary-text font-mono">IB #{{ batch.ib_id }} (User #{{ batch.ib_user_id || 'N/A' }})</span>
              </div>
              <div class="flex justify-between py-1 border-b border-primary-border/60">
                <span class="text-secondary-text">Period Type:</span>
                <span class="font-semibold text-primary-text capitalize">{{ batch.period_type }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-primary-border/60">
                <span class="text-secondary-text">Period Key:</span>
                <span class="font-bold text-primary font-mono">{{ batch.period_key }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-primary-border/60">
                <span class="text-secondary-text">Status:</span>
                <span
                  class="px-2 py-0.5 rounded-md text-[11px] font-semibold border inline-block"
                  :class="
                    batch.status === 'paid'
                      ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                      : batch.status === 'empty'
                      ? 'bg-background text-secondary-text border-primary-border'
                      : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                  "
                >
                  {{ batch.status?.toUpperCase() || 'UNKNOWN' }}
                </span>
              </div>
              <div class="flex justify-between py-1 border-b border-primary-border/60">
                <span class="text-secondary-text">Wallet Transaction ID:</span>
                <span class="font-mono font-semibold" :class="batch.wallet_transaction_id ? 'text-primary-blue' : 'text-secondary-text'">
                  {{ batch.wallet_transaction_id ? `#${batch.wallet_transaction_id}` : 'None (Empty)' }}
                </span>
              </div>
              <div class="flex justify-between py-1 border-b border-primary-border/60">
                <span class="text-secondary-text">Paid At:</span>
                <span class="text-primary-text font-mono">{{ formatDate(batch.paid_at) }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-secondary-text">Created At:</span>
                <span class="text-primary-text font-mono">{{ formatDate(batch.created_at) }}</span>
              </div>
            </div>

            <!-- Meta Data JSON Breakdown -->
            <div v-if="batch.meta_data" class="space-y-2">
              <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider">
                Batch Metadata Breakdown
              </h4>
              <div class="p-3.5 rounded-xl bg-background border border-primary-border space-y-2 text-xs">
                <div v-if="batch.meta_data.payable_count !== undefined" class="flex justify-between">
                  <span class="text-secondary-text">Payable Count:</span>
                  <span class="font-mono font-semibold text-primary-text">{{ batch.meta_data.payable_count }}</span>
                </div>
                <div v-if="batch.meta_data.zero_count !== undefined" class="flex justify-between">
                  <span class="text-secondary-text">Zero-Value Count:</span>
                  <span class="font-mono font-semibold text-secondary-text">{{ batch.meta_data.zero_count }}</span>
                </div>
                <div v-if="batch.meta_data.gross_total !== undefined" class="flex justify-between">
                  <span class="text-secondary-text">Gross Total:</span>
                  <span class="font-mono font-bold text-primary-green">${{ Number(batch.meta_data.gross_total || 0).toFixed(2) }}</span>
                </div>
                <div v-if="batch.meta_data.entry_ids && batch.meta_data.entry_ids.length" class="space-y-1 pt-1 border-t border-primary-border/60">
                  <span class="text-secondary-text block">Settled Commission Entry IDs:</span>
                  <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    <span
                      v-for="entryId in batch.meta_data.entry_ids"
                      :key="entryId"
                      class="px-1.5 py-0.5 rounded bg-card-background border border-primary-border font-mono text-[11px] text-primary-text"
                    >
                      #{{ entryId }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
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
