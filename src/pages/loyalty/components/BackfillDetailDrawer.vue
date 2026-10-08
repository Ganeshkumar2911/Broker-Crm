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
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
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
                Backfill Job #{{ job?.id }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                Execution status, counters, and skip samples
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

        <!-- Scrollable Content -->
        <div v-if="job" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          <!-- Status Banner -->
          <div class="p-4 rounded-2xl bg-background/60 border border-primary-border flex items-center justify-between gap-3 shadow-2xs">
            <div class="flex items-center gap-2.5">
              <span class="text-secondary-text font-medium">Job Status:</span>
              <span
                class="px-2.5 py-1 rounded-full text-xs font-bold uppercase font-mono tracking-wider"
                :class="getStatusBadgeClass(job.status)"
              >
                {{ job.status }}
              </span>
            </div>

            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text font-medium transition cursor-pointer shadow-2xs"
              @click="handleRefresh"
            >
              <RefreshCw class="w-3.5 h-3.5 text-primary" :class="isRefreshing ? 'animate-spin' : ''" />
              <span>Refresh Status</span>
            </button>
          </div>

          <!-- Error Alert if failed -->
          <div v-if="job.error_message" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 space-y-1">
            <span class="font-bold uppercase text-[10px]">Error Trace:</span>
            <p class="font-mono text-xs">{{ job.error_message }}</p>
          </div>

          <!-- Counter Cards Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div class="p-3 bg-background/50 border border-primary-border rounded-xl text-center space-y-1">
              <p class="text-[9px] text-secondary-text uppercase font-bold">Seen</p>
              <p class="text-lg font-bold text-primary-text font-mono">{{ job.deals_seen ?? 0 }}</p>
            </div>
            <div class="p-3 bg-primary-green/5 border border-primary-green/20 rounded-xl text-center space-y-1">
              <p class="text-[9px] text-primary-green uppercase font-bold">Awarded</p>
              <p class="text-lg font-bold text-primary-green font-mono">{{ job.awarded ?? 0 }}</p>
            </div>
            <div class="p-3 bg-background/50 border border-primary-border rounded-xl text-center space-y-1">
              <p class="text-[9px] text-secondary-text uppercase font-bold">Existing</p>
              <p class="text-lg font-bold text-secondary-text font-mono">{{ job.skipped_existing ?? 0 }}</p>
            </div>
            <div class="p-3 bg-background/50 border border-primary-border rounded-xl text-center space-y-1">
              <p class="text-[9px] text-secondary-text uppercase font-bold">Ineligible</p>
              <p class="text-lg font-bold text-secondary-text font-mono">{{ job.skipped_ineligible ?? 0 }}</p>
            </div>
            <div class="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl text-center space-y-1">
              <p class="text-[9px] text-rose-400 uppercase font-bold">Errors</p>
              <p class="text-lg font-bold text-rose-400 font-mono">{{ job.errors ?? 0 }}</p>
            </div>
          </div>

          <!-- Meta Grid -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-2.5 text-secondary-text">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block">Job Meta & Timestamps</span>
            <div class="grid grid-cols-2 gap-2.5">
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px] text-secondary-text">Trading Account:</span>
                <span class="font-mono font-bold text-primary-text">#{{ job.trading_account_id }}</span>
              </div>
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px] text-secondary-text">Enrollment ID:</span>
                <span class="font-mono font-bold text-primary-text">#{{ job.enrollment_id }}</span>
              </div>
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px] text-secondary-text">Scan Range Start:</span>
                <span class="font-sans text-primary-text">{{ formatDate(job.from_at) }}</span>
              </div>
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px] text-secondary-text">Scan Range End:</span>
                <span class="font-sans text-primary-text">{{ formatDate(job.to_at) }}</span>
              </div>
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px] text-secondary-text">Started At:</span>
                <span class="font-sans text-primary-text">{{ formatDate(job.started_at) }}</span>
              </div>
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px] text-secondary-text">Finished At:</span>
                <span class="font-sans text-primary-text">{{ formatDate(job.finished_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Skip Samples if any -->
          <div v-if="job.result_json?.skip_samples && job.result_json.skip_samples.length > 0" class="space-y-2">
            <h4 class="font-bold text-primary-text flex items-center gap-1.5">
              <span>Skip Sample Records</span>
            </h4>
            <div class="border border-primary-border rounded-xl overflow-hidden font-mono shadow-2xs">
              <table class="w-full text-left text-xs">
                <thead class="bg-background/80 text-secondary-text border-b border-primary-border font-semibold">
                  <tr>
                    <th class="py-2.5 px-3">MT5 Deal ID</th>
                    <th class="py-2.5 px-3">Reason</th>
                    <th class="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-primary-border">
                  <tr v-for="(sample, idx) in job.result_json.skip_samples" :key="idx" class="hover:bg-background/40">
                    <td class="py-2 px-3 text-primary-text">#{{ sample.mt5_deal_id }}</td>
                    <td class="py-2 px-3 text-secondary-text">{{ sample.reason }}</td>
                    <td class="py-2 px-3">{{ sample.eligibility_status }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sticky Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center justify-end bg-card-background shrink-0">
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
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
import { ref } from "vue";
import { X, RefreshCw, History } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { formatDate } from "@/utils/timeFormatter";

const props = defineProps({
  open: { type: Boolean, default: false },
  job: { type: Object, default: null },
});

defineEmits(["close"]);
const store = useLoyaltyStore();
const isRefreshing = ref(false);

const handleRefresh = async () => {
  if (!props.job?.id) return;
  isRefreshing.value = true;
  await store.fetchBackfillJobStatus(props.job.id);
  isRefreshing.value = false;
};

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-primary-green/10 text-primary-green border border-primary-green/20";
    case "running":
      return "bg-primary/10 text-primary border border-primary/20 animate-pulse";
    case "queued":
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    case "failed":
      return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    case "cancelled":
      return "bg-secondary-text/10 text-secondary-text border border-primary-border";
    default:
      return "bg-secondary-text/10 text-secondary-text border border-primary-border";
  }
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
