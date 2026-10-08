<script setup>
import { ref } from "vue";
import {
  Cancel01Icon,
  Loading03Icon,
  Coins01Icon,
  CalculatorIcon,
  CheckmarkCircle02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "calculated"]);

const store = useCommissionEngineStore();

const limit = ref(500);
const login = ref("");
const reclaimSkipped = ref(true);

const calculationResult = ref(null);

const closeModal = () => {
  calculationResult.value = null;
  emit("update:modelValue", false);
};

const handleCalculate = async () => {
  try {
    const loginVal = login.value != null ? String(login.value).trim() : "";
    const payload = {
      limit: Number(limit.value) || 500,
      login: loginVal ? Number(loginVal) : null,
      reclaim_skipped: !!reclaimSkipped.value,
    };
    const res = await store.calculateCommissions(payload);
    if (res?.data) {
      calculationResult.value = res.data;
      // Auto-close modal after 3 seconds so user can see the result banner
      setTimeout(() => {
        if (calculationResult.value) closeModal();
      }, 3000);
    }
    emit("calculated");
  } catch (err) {
    console.error("Calculate commissions error:", err);
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
          class="w-full max-w-lg bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20"
              >
                <HugeIcon :icon="Coins01Icon" :size="20" />
              </div>
              <div>
                <h3 class="title-text text-base text-primary-text font-semibold">
                  Calculate IB Commissions
                </h3>
                <p class="text-xs text-secondary-text">
                  Process closed MT5 trades according to rate matrix rules
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
          <div class="p-6 space-y-4 overflow-y-auto">
            <!-- Calculation Result Banner if Available -->
            <div
              v-if="calculationResult"
              class="p-4 rounded-xl bg-primary-green/10 border border-primary-green/20 space-y-2.5 animate-in fade-in duration-200"
            >
              <div class="flex items-center gap-2 text-primary-green font-semibold text-xs">
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="16" />
                <span>Calculation Completed Successfully</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div class="p-2.5 rounded-lg bg-background border border-primary-border">
                  <span class="text-secondary-text block text-[10px]">Trades Processed</span>
                  <strong class="font-mono text-sm text-primary-text">{{ calculationResult.trades_processed ?? 0 }}</strong>
                </div>
                <div class="p-2.5 rounded-lg bg-background border border-primary-border">
                  <span class="text-secondary-text block text-[10px]">Entries Created</span>
                  <strong class="font-mono text-sm text-primary">{{ calculationResult.entries_created ?? 0 }}</strong>
                </div>
                <div class="p-2.5 rounded-lg bg-background border border-primary-border">
                  <span class="text-secondary-text block text-[10px]">
                    {{ calculationResult.auto_wallet_credit ? "Auto Credited" : "Pending Approval" }}
                  </span>
                  <strong class="font-mono text-sm text-primary-green">
                    {{ calculationResult.auto_wallet_credit ? (calculationResult.auto_wallet_credited ?? 0) : (calculationResult.pending_entries ?? 0) }}
                  </strong>
                </div>
              </div>

              <div
                v-if="calculationResult.skipped_missing_mapping || calculationResult.skipped_no_rates"
                class="pt-1 text-[11px] text-secondary-text space-y-0.5"
              >
                <p v-if="calculationResult.skipped_missing_mapping">
                  &bull; Skipped without mapping: <span class="font-mono font-semibold">{{ calculationResult.skipped_missing_mapping }}</span>
                </p>
                <p v-if="calculationResult.skipped_no_rates">
                  &bull; Skipped without rates: <span class="font-mono font-semibold">{{ calculationResult.skipped_no_rates }}</span>
                </p>
              </div>
            </div>

            <!-- Notice -->
            <div
              v-else
              class="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-secondary-text leading-relaxed"
            >
              Scans newly closed trades without commission calculations, maps active referral links and rates, and produces payable commission records.
            </div>

            <!-- Form Options -->
            <div class="space-y-3.5">
              <!-- Limit -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-primary-text">
                  Max Batch Size (Trades Limit)
                </label>
                <input
                  v-model.number="limit"
                  type="number"
                  min="10"
                  max="5000"
                  step="50"
                  class="input-field w-full px-3 py-2 text-xs font-mono"
                />
                <p class="text-[11px] text-secondary-text">
                  Number of uncalculated trades to process in this run (e.g. 500).
                </p>
              </div>

              <!-- Optional Login Filter -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-primary-text">
                  Specific MT5 Login
                  <span class="text-[10px] text-secondary-text font-normal ml-1">(Optional single account)</span>
                </label>
                <input
                  v-model="login"
                  type="number"
                  placeholder="e.g. 671169"
                  class="input-field w-full px-3 py-2 text-xs font-mono"
                />
              </div>

              <!-- Reclaim Skipped -->
              <div class="pt-1">
                <label class="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    v-model="reclaimSkipped"
                    type="checkbox"
                    class="custom-checkbox h-4 w-4 rounded text-primary focus:ring-0"
                  />
                  <div class="text-xs">
                    <span class="font-semibold text-primary-text">Reclaim Previously Skipped Trades</span>
                    <p class="text-[11px] text-secondary-text">
                      Re-evaluate trades that previously had missing rates or symbol group mappings.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 flex items-center justify-end gap-2.5 border-t border-primary-border">
              <button
                type="button"
                class="px-4 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background border border-primary-border rounded-xl transition-all cursor-pointer"
                @click="closeModal"
              >
                {{ calculationResult ? "Done" : "Cancel" }}
              </button>
              <button
                type="button"
                :disabled="store.actionLoading"
                class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleCalculate"
              >
                <HugeIcon
                  v-if="store.actionLoading"
                  :icon="Loading03Icon"
                  :size="14"
                  class="animate-spin"
                />
                <HugeIcon v-else :icon="Coins01Icon" :size="14" />
                <span>{{ calculationResult ? "Run Again" : "Calculate Now" }}</span>
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
