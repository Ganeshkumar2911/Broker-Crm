<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border">
        <div>
          <h3 class="text-base font-bold text-primary-text">Start MT5 History Backfill</h3>
          <p class="text-xs text-secondary-text">Scan closed MT5 trades and award loyalty points.</p>
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
      <form class="p-6 space-y-4 text-xs" @submit.prevent="handleSubmit">
        <!-- Trading Account ID -->
        <div class="space-y-1">
          <label class="font-semibold text-primary-text">Trading Account ID</label>
          <input
            v-model.number="form.trading_account_id"
            type="number"
            placeholder="e.g. 88"
            required
            class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
          />
          <p class="text-[10px] text-secondary-text">The account must already be enrolled in the loyalty program.</p>
        </div>

        <!-- From Date / Time -->
        <div class="space-y-1">
          <label class="font-semibold text-primary-text">From Date (ISO format)</label>
          <input
            v-model="form.from_at"
            type="text"
            placeholder="2026-01-01T00:00:00"
            required
            class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
          />
        </div>

        <!-- To Date / Time -->
        <div class="space-y-1">
          <label class="font-semibold text-primary-text">To Date (ISO format)</label>
          <input
            v-model="form.to_at"
            type="text"
            placeholder="2026-03-01T23:59:59"
            required
            class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
          />
        </div>

        <div class="p-3 bg-background/50 border border-primary-border rounded-xl text-secondary-text text-[11px] leading-relaxed">
          <p>⚠️ Maximum range is <strong>366 days</strong>. The job executes asynchronously in the background. Duplicate deals will be safely skipped.</p>
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
            <span>Queue Backfill Job</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { X, Loader2 } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "queued"]);
const store = useLoyaltyStore();

const form = reactive({
  trading_account_id: "",
  from_at: "",
  to_at: "",
});

const handleSubmit = async () => {
  const payload = {
    trading_account_id: Number(form.trading_account_id),
    from_at: form.from_at.trim(),
    to_at: form.to_at.trim(),
  };

  await store.startBackfill(payload);
  form.trading_account_id = "";
  form.from_at = "";
  form.to_at = "";
  emit("queued");
  emit("close");
};
</script>
