<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sticky Header -->
        <div class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/90 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <History class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                Start MT5 History Backfill
              </h3>
              <p class="text-[11px] text-secondary-text">
                Audit and award points for closed trades in a date window
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="$emit('close')"
          >
            <X class="w-4.5 h-4.5" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form id="backfill-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs" @submit.prevent="handleSubmit">
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Target Account & Timeline</span>

            <div class="space-y-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Enrolled Trading Account ID</label>
                <input
                  v-model.number="form.trading_account_id"
                  type="number"
                  placeholder="e.g. 88"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
                <p class="text-[10px] text-secondary-text">Must be enrolled in the loyalty program first</p>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Backfill Date Range (From & To)</label>
                <BaseDatePicker
                  v-model="dateRange"
                  :range="true"
                  :enableTime="true"
                  valueFormat="YYYY-MM-DD HH:mm:ss"
                  placeholder="Select backfill date & time range"
                />
              </div>
            </div>
          </div>

          <!-- Process Info Banner -->
          <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2 text-[11px] text-secondary-text leading-relaxed">
            <div class="flex items-center gap-1.5 font-bold text-amber-500 text-xs">
              <AlertCircle class="w-4 h-4" />
              <span>Execution Guidelines</span>
            </div>
            <ul class="space-y-1 list-disc list-inside">
              <li>Maximum supported range is <strong>366 days</strong>.</li>
              <li>Job executes asynchronously in the background.</li>
              <li>Existing processed trades are automatically deduplicated and skipped.</li>
            </ul>
          </div>
        </form>

        <!-- Sticky Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 bg-card-background shrink-0">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="backfill-form"
            :disabled="store.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>{{ store.actionLoading ? 'Queuing...' : 'Queue Backfill Job' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import { X, Loader2, History, AlertCircle } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";

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

const dateRange = computed({
  get() {
    if (form.from_at || form.to_at) {
      return {
        start: form.from_at || null,
        end: form.to_at || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      form.from_at = "";
      form.to_at = "";
    } else if (Array.isArray(val)) {
      form.from_at = val[0] || "";
      form.to_at = val[1] || "";
    } else if (typeof val === "object") {
      form.from_at = val.start || val.from || "";
      form.to_at = val.end || val.to || "";
    }
  },
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

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
