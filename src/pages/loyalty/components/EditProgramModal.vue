<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border">
        <div>
          <h3 class="text-base font-bold text-primary-text">Edit Program Rules</h3>
          <p class="text-xs text-secondary-text">Configure loyalty rules, durations, and thresholds.</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
          @click="$emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Content -->
      <form class="flex-1 overflow-y-auto p-6 space-y-4 text-xs" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Program Name -->
          <div class="sm:col-span-2 space-y-1">
            <label class="font-semibold text-primary-text">Program Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
            />
          </div>

          <!-- Status -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Status</label>
            <BaseSelect
              v-model="form.status"
              :options="statusOptions"
              placeholder="Select status..."
              variant="surface"
            />
          </div>

          <!-- Terms Version -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Terms Version</label>
            <input
              v-model="form.terms_version"
              type="text"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
            />
          </div>

          <!-- Start Date -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Start Date / Time (ISO)</label>
            <input
              v-model="form.start_at"
              type="text"
              placeholder="2026-01-01T00:00:00"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- End Date -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">End Date / Time (ISO)</label>
            <input
              v-model="form.end_at"
              type="text"
              placeholder="2026-12-31T23:59:59"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Base Points Per Lot -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Base Points Per Lot</label>
            <input
              v-model.number="form.base_points_per_lot"
              type="number"
              step="any"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Min Redemption Points -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Min Redemption Points</label>
            <input
              v-model.number="form.min_redemption_points"
              type="number"
              step="any"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Min Trade Duration Seconds -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Min Trade Duration (Seconds)</label>
            <input
              v-model.number="form.min_trade_duration_seconds"
              type="number"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Point Validity Days -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Point Validity (Days)</label>
            <input
              v-model.number="form.point_validity_days"
              type="number"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Tier Window Days -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Tier Qualification Window (Days)</label>
            <input
              v-model.number="form.tier_window_days"
              type="number"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Grace Period Days -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Tier Downgrade Grace Period (Days)</label>
            <input
              v-model.number="form.grace_period_days"
              type="number"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Dormant Days -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Dormant Account Days</label>
            <input
              v-model.number="form.dormant_days"
              type="number"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Carry Over Enrollments -->
          <div class="flex items-center gap-2 pt-5">
            <input
              id="carry_over"
              v-model="form.carry_over_enrollments"
              type="checkbox"
              class="w-4 h-4 rounded text-primary border-primary-border focus:ring-0 cursor-pointer"
            />
            <label for="carry_over" class="font-semibold text-primary-text cursor-pointer">
              Carry Over Enrollments to Next Cycle
            </label>
          </div>

          <!-- Allow General Wallet Transfer -->
          <div class="flex items-center gap-2 pt-2">
            <input
              id="allow_general_wallet"
              v-model="form.allow_general_wallet_transfer"
              type="checkbox"
              class="w-4 h-4 rounded text-primary border-primary-border focus:ring-0 cursor-pointer"
            />
            <label for="allow_general_wallet" class="font-semibold text-primary-text cursor-pointer">
              Allow General Wallet Transfer (to any eligible trading account)
            </label>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-primary-border">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="store.actionLoading"
            class="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { X, Loader2 } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  program: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "saved"]);
const store = useLoyaltyStore();

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Paused", value: "paused" },
  { label: "Ended", value: "ended" },
];

const form = reactive({
  name: "",
  status: "active",
  start_at: "",
  end_at: "",
  base_points_per_lot: 5,
  min_redemption_points: 100,
  min_trade_duration_seconds: 120,
  point_validity_days: 180,
  tier_window_days: 90,
  dormant_days: 90,
  grace_period_days: 14,
  terms_version: "1.0",
  carry_over_enrollments: false,
  allow_general_wallet_transfer: false,
});

watch(
  () => props.program,
  (p) => {
    if (p) {
      form.name = p.name ?? "";
      form.status = p.status ?? "active";
      form.start_at = p.start_at ?? "";
      form.end_at = p.end_at ?? "";
      form.base_points_per_lot = p.base_points_per_lot !== undefined ? Number(p.base_points_per_lot) : 5;
      form.min_redemption_points = p.min_redemption_points !== undefined ? Number(p.min_redemption_points) : 100;
      form.min_trade_duration_seconds = p.min_trade_duration_seconds ?? 120;
      form.point_validity_days = p.point_validity_days ?? 180;
      form.tier_window_days = p.tier_window_days ?? 90;
      form.dormant_days = p.dormant_days ?? 90;
      form.grace_period_days = p.grace_period_days ?? 14;
      form.terms_version = p.terms_version ?? "1.0";
      form.carry_over_enrollments = Boolean(p.carry_over_enrollments);
      form.allow_general_wallet_transfer = Boolean(p.allow_general_wallet_transfer);
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  if (!props.program?.id) return;
  await store.updateProgram(props.program.id, form);
  emit("saved");
  emit("close");
};
</script>
