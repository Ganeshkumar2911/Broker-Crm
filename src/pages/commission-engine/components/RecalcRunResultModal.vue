<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  RefreshCwIcon,
  Coins01Icon,
  Activity01Icon,
  UserIcon,
  Calendar01Icon,
  ArrowRight01Icon,
  Layers01Icon,
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
const router = useRouter();

const closeModal = () => {
  emit("update:modelValue", false);
};

const data = computed(() => props.result?.data || props.result || {});

const resultsList = computed(() => {
  return Array.isArray(data.value.results) ? data.value.results : [];
});

const tradesProcessed = computed(() => {
  if (resultsList.value.length > 0) {
    return resultsList.value.reduce(
      (acc, r) => acc + (Number(r.trades_processed ?? r.trades_matched ?? 0) || 0),
      0
    );
  }
  return Number(data.value.trades_processed ?? data.value.positions_evaluated ?? data.value.trades_count ?? 0) || 0;
});

const entriesCreated = computed(() => {
  if (resultsList.value.length > 0) {
    return resultsList.value.reduce(
      (acc, r) => acc + (Number(r.entries_created ?? 0) || 0),
      0
    );
  }
  return Number(data.value.entries_created ?? data.value.pending_entries ?? data.value.commissions_created ?? 0) || 0;
});

const entriesRejected = computed(() => {
  if (resultsList.value.length > 0) {
    return resultsList.value.reduce(
      (acc, r) => acc + (Number(r.pending_rejected ?? 0) || 0),
      0
    );
  }
  return Number(data.value.entries_rejected ?? data.value.stale_rejected ?? data.value.rejected_entries ?? 0) || 0;
});

const unlockedTrades = computed(() => {
  if (resultsList.value.length > 0) {
    return resultsList.value.reduce(
      (acc, r) => acc + (Number(r.trades_unlocked ?? 0) || 0),
      0
    );
  }
  return Number(data.value.unlocked_trades ?? data.value.trades_unlocked ?? data.value.unlocked_count ?? 0) || 0;
});

const effectiveFromDate = computed(() => {
  if (data.value.from_date_override) return data.value.from_date_override;
  if (data.value.from_date) return data.value.from_date;
  if (resultsList.value.length === 1 && resultsList.value[0].from_date) {
    return resultsList.value[0].from_date;
  }
  if (resultsList.value.length > 1) {
    const dates = [...new Set(resultsList.value.map((r) => r.from_date).filter(Boolean))];
    if (dates.length === 1) return dates[0];
    if (dates.length > 1) return "Multiple Dates";
  }
  return null;
});

const targetIbLabel = computed(() => {
  if (data.value.ib_id) return `IB #${data.value.ib_id}`;
  if (resultsList.value.length === 1 && resultsList.value[0].ib_id) {
    return `IB #${resultsList.value[0].ib_id}`;
  }
  if (data.value.scope === "all") return "All Active IBs";
  if (data.value.scope) return String(data.value.scope).toUpperCase();
  return null;
});

const navigateToPendingCommissions = () => {
  closeModal();
  router.push({
    path: "/commission-engine/commissions",
    query: { status: "pending" },
  });
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
          class="w-full max-w-xl bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-card-background">
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
                  <span>{{ isDryRun ? "Recalculation Dry Run Preview" : "Recalculation Completed" }}</span>
                  <span
                    v-if="isDryRun"
                    class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary-blue/10 text-primary-blue border border-primary-blue/20 font-medium"
                  >
                    PREVIEW ONLY
                  </span>
                </h3>
                <p class="sub-text text-secondary-text">
                  {{
                    isDryRun
                      ? "Match preview evaluated without writing database modifications"
                      : "Retroactive trades recalculated & commissions updated successfully"
                  }}
                </p>
              </div>
            </div>
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
              @click="closeModal"
            >
              <HugeIcon :icon="Cancel01Icon" :size="18" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-5 overflow-y-auto custom-scrollbar">
            <!-- Run Meta Banner -->
            <div
              class="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              :class="
                isDryRun
                  ? 'bg-primary-blue/5 border-primary-blue/20 text-primary-text'
                  : 'bg-primary-green/5 border-primary-green/20 text-primary-text'
              "
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-secondary-text">Date Kind:</span>
                  <span class="font-mono uppercase font-bold text-primary">{{ data.kind || "next" }}</span>
                </div>
                <div v-if="effectiveFromDate" class="flex items-center gap-2">
                  <span class="font-semibold text-secondary-text">Effective From Date:</span>
                  <span class="font-mono font-medium">{{ effectiveFromDate }}</span>
                </div>
                <div v-if="targetIbLabel" class="flex items-center gap-2">
                  <span class="font-semibold text-secondary-text">Target IB:</span>
                  <span class="font-mono font-medium">{{ targetIbLabel }}</span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card-background border border-primary-border shadow-xs text-secondary-text">
                <HugeIcon :icon="RefreshCwIcon" :size="14" class="text-primary" />
                <span>{{ isDryRun ? "No changes written" : "Live data modified" }}</span>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3.5">
              <!-- Trades Processed -->
              <div class="p-4 rounded-xl bg-background border border-primary-border flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-primary-text font-semibold">Trades Processed</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-secondary-text">trades_processed</span>
                  </div>
                  <HugeIcon :icon="Activity01Icon" :size="16" class="text-primary" />
                </div>
                <div class="text-xl font-bold font-mono text-primary-text mt-1">
                  {{ tradesProcessed }}
                </div>
                <span class="text-[11px] text-secondary-text font-mono">sum(trades_processed)</span>
              </div>

              <!-- Entries Created -->
              <div class="p-4 rounded-xl bg-background border border-primary-border flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-primary-green font-semibold">Entries Created</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-secondary-text">entries_created</span>
                  </div>
                  <HugeIcon :icon="Coins01Icon" :size="16" class="text-primary-green" />
                </div>
                <div class="text-xl font-bold font-mono text-primary-green mt-1">
                  {{ entriesCreated }}
                </div>
                <span class="text-[11px] text-secondary-text font-mono">sum(entries_created)</span>
              </div>

              <!-- Pending Rejected -->
              <div class="p-4 rounded-xl bg-background border border-primary-border flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-primary-yellow font-semibold">Pending Rejected</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-secondary-text">pending_rejected</span>
                  </div>
                  <HugeIcon :icon="Alert02Icon" :size="16" class="text-primary-yellow" />
                </div>
                <div class="text-xl font-bold font-mono text-primary-yellow mt-1">
                  {{ entriesRejected }}
                </div>
                <span class="text-[11px] text-secondary-text font-mono">sum(pending_rejected)</span>
              </div>

              <!-- Trades Unlocked -->
              <div class="p-4 rounded-xl bg-background border border-primary-border flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-primary-blue font-semibold">Trades Unlocked</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-secondary-text">trades_unlocked</span>
                  </div>
                  <HugeIcon :icon="Layers01Icon" :size="16" class="text-primary-blue" />
                </div>
                <div class="text-xl font-bold font-mono text-primary-blue mt-1">
                  {{ unlockedTrades }}
                </div>
                <span class="text-[11px] text-secondary-text font-mono">sum(trades_unlocked)</span>
              </div>
            </div>

            <!-- Hint Message -->
            <div class="p-3.5 rounded-xl bg-card-background border border-primary-border flex items-start gap-2.5 text-xs text-secondary-text">
              <HugeIcon :icon="InformationCircleIcon" :size="18" class="text-primary shrink-0 mt-0.5" />
              <div>
                <span v-if="isDryRun">
                  This was a simulation dry-run. No trades or pending commissions were modified. Click <strong>Run Recalculation</strong> when ready to execute.
                </span>
                <span v-else>
                  Commissions have been calculated based on live IB hierarchy and customer assignments. You can review and approve them in the <strong>Commissions</strong> tab.
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-primary-border bg-card-background gap-3">
            <button
              class="px-4 py-2 rounded-lg border border-primary-border text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
              @click="closeModal"
            >
              Close
            </button>

            <button
              v-if="!isDryRun && entriesCreated > 0"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors"
              @click="navigateToPendingCommissions"
            >
              <span>View Pending Commissions</span>
              <HugeIcon :icon="ArrowRight01Icon" :size="14" />
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
