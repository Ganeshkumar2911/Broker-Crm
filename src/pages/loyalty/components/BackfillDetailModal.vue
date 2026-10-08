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
          <h3 class="text-base font-bold text-primary-text">Backfill Job #{{ job?.id }}</h3>
          <p class="text-xs text-secondary-text">Live status, metrics, and skip logs for this MT5 backfill task.</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
          @click="$emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div v-if="job" class="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
        <!-- Status Row -->
        <div class="flex items-center justify-between p-4 bg-background border border-primary-border rounded-xl">
          <div class="flex items-center gap-3">
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

        <!-- Error Banner -->
        <div v-if="job.error_message" class="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 space-y-1">
          <span class="font-bold uppercase text-[10px]">Error Message:</span>
          <p class="font-mono">{{ job.error_message }}</p>
        </div>

        <!-- Metric Counters Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div class="p-3 bg-background border border-primary-border rounded-xl text-center space-y-1">
            <p class="text-[10px] text-secondary-text uppercase font-semibold">Deals Seen</p>
            <p class="text-lg font-bold text-primary-text font-mono">{{ job.deals_seen ?? 0 }}</p>
          </div>
          <div class="p-3 bg-primary-green/5 border border-primary-green/20 rounded-xl text-center space-y-1">
            <p class="text-[10px] text-primary-green uppercase font-semibold">Awarded</p>
            <p class="text-lg font-bold text-primary-green font-mono">{{ job.awarded ?? 0 }}</p>
          </div>
          <div class="p-3 bg-background border border-primary-border rounded-xl text-center space-y-1">
            <p class="text-[10px] text-secondary-text uppercase font-semibold">Skipped Existing</p>
            <p class="text-lg font-bold text-primary-text font-mono">{{ job.skipped_existing ?? 0 }}</p>
          </div>
          <div class="p-3 bg-background border border-primary-border rounded-xl text-center space-y-1">
            <p class="text-[10px] text-secondary-text uppercase font-semibold">Ineligible</p>
            <p class="text-lg font-bold text-secondary-text font-mono">{{ job.skipped_ineligible ?? 0 }}</p>
          </div>
          <div class="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl text-center space-y-1">
            <p class="text-[10px] text-rose-400 uppercase font-semibold">Errors</p>
            <p class="text-lg font-bold text-rose-400 font-mono">{{ job.errors ?? 0 }}</p>
          </div>
        </div>

        <!-- Meta Grid -->
        <div class="p-4 bg-background/50 border border-primary-border rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-secondary-text">
          <div><span class="text-primary-text font-medium">Trading Account:</span> <span class="font-mono text-primary-text">#{{ job.trading_account_id }}</span></div>
          <div><span class="text-primary-text font-medium">Enrollment ID:</span> <span class="font-mono text-primary-text">#{{ job.enrollment_id }}</span></div>
          <div><span class="text-primary-text font-medium">Date Range From:</span> {{ formatDate(job.from_at) }}</div>
          <div><span class="text-primary-text font-medium">Date Range To:</span> {{ formatDate(job.to_at) }}</div>
          <div><span class="text-primary-text font-medium">Started At:</span> {{ formatDate(job.started_at) }}</div>
          <div><span class="text-primary-text font-medium">Finished At:</span> {{ formatDate(job.finished_at) }}</div>
        </div>

        <!-- Skip Samples if any -->
        <div v-if="job.result_json?.skip_samples && job.result_json.skip_samples.length > 0" class="space-y-2">
          <h4 class="font-bold text-primary-text">Skip Samples</h4>
          <div class="border border-primary-border rounded-xl overflow-hidden font-mono">
            <table class="w-full text-left text-xs">
              <thead class="bg-background/80 text-secondary-text border-b border-primary-border">
                <tr>
                  <th class="py-2 px-3">MT5 Deal ID</th>
                  <th class="py-2 px-3">Reason</th>
                  <th class="py-2 px-3">Status</th>
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

      <!-- Action Footer -->
      <div class="flex items-center justify-end px-6 py-4 border-t border-primary-border">
        <button
          type="button"
          class="px-4 py-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer text-xs"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { X, RefreshCw } from "lucide-vue-next";
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
