<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border">
        <div>
          <h3 class="text-base font-bold text-primary-text">Enrollment Details</h3>
          <p class="text-xs text-secondary-text">Summary of member points, tier status, and recent activity.</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
          @click="$emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="store.detailLoading" class="p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 class="w-7 h-7 text-primary animate-spin" />
        <p class="text-xs text-secondary-text">Loading enrollment details...</p>
      </div>

      <!-- Content -->
      <div v-else-if="detail" class="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
        <!-- Overview Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 bg-background border border-primary-border rounded-xl space-y-1">
            <span class="text-[10px] uppercase font-semibold text-secondary-text">User ID</span>
            <p class="text-sm font-bold text-primary-text font-mono">#{{ detail.user_id }}</p>
          </div>
          <div class="p-3.5 bg-background border border-primary-border rounded-xl space-y-1">
            <span class="text-[10px] uppercase font-semibold text-secondary-text">Trading A/C</span>
            <p class="text-sm font-bold text-primary-text font-mono">#{{ detail.trading_account_id }}</p>
          </div>
          <div class="p-3.5 bg-background border border-primary-border rounded-xl space-y-1">
            <span class="text-[10px] uppercase font-semibold text-secondary-text">Current Tier</span>
            <div>
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-xs font-bold border"
                :style="detail.current_tier?.color ? {
                  backgroundColor: `${detail.current_tier.color}20`,
                  color: detail.current_tier.color,
                  borderColor: `${detail.current_tier.color}40`
                } : {}"
                :class="!detail.current_tier?.color ? 'text-primary bg-primary/10 border-primary/20' : ''"
              >
                <span
                  v-if="detail.current_tier?.color"
                  class="w-1.5 h-1.5 rounded-full shrink-0"
                  :style="{ backgroundColor: detail.current_tier.color }"
                />
                {{ detail.current_tier?.name || detail.current_tier?.code || '—' }}
              </span>
            </div>
          </div>
          <div class="p-3.5 bg-background border border-primary-border rounded-xl space-y-1">
            <span class="text-[10px] uppercase font-semibold text-secondary-text">Status</span>
            <div>
              <StatusBadge :status="detail.status" />
            </div>
          </div>
        </div>

        <!-- Balances Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
            <span class="text-[10px] uppercase font-semibold text-primary">Available Points</span>
            <p class="text-xl font-bold text-primary font-mono">{{ detail.available_points ?? '0.00' }}</p>
          </div>
          <div class="p-4 bg-background border border-primary-border rounded-xl space-y-1">
            <span class="text-[10px] uppercase font-semibold text-secondary-text">Lifetime Earned</span>
            <p class="text-xl font-bold text-primary-text font-mono">{{ detail.lifetime_earned_points ?? '0.00' }}</p>
          </div>
          <div class="p-4 bg-background border border-primary-border rounded-xl space-y-1">
            <span class="text-[10px] uppercase font-semibold text-secondary-text">Active Point Lots</span>
            <p class="text-xl font-bold text-primary-text font-mono">{{ detail.summary?.active_point_lots ?? 0 }}</p>
          </div>
        </div>

        <!-- Details List -->
        <div class="p-4 bg-background/50 border border-primary-border rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-secondary-text">
          <div><span class="text-primary-text font-medium">Opted-in At:</span> {{ formatDate(detail.opted_in_at) }}</div>
          <div><span class="text-primary-text font-medium">Last Trade At:</span> {{ formatDate(detail.last_trade_at) }}</div>
          <div><span class="text-primary-text font-medium">Abuse Status:</span> <span class="font-mono font-semibold uppercase text-primary-text">{{ detail.abuse_status || 'clear' }}</span></div>
          <div><span class="text-primary-text font-medium">Points on Hold:</span> <span class="font-mono text-primary-text">{{ detail.points_on_hold ? 'YES' : 'NO' }}</span></div>
        </div>

        <!-- Recent Deals Table -->
        <div class="space-y-2">
          <h4 class="font-bold text-primary-text">Recent Deals</h4>
          <div v-if="detail.summary?.recent_deals && detail.summary.recent_deals.length > 0" class="border border-primary-border rounded-xl overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-background/80 text-secondary-text font-medium border-b border-primary-border">
                <tr>
                  <th class="py-2.5 px-3">MT5 Deal ID</th>
                  <th class="py-2.5 px-3">Symbol</th>
                  <th class="py-2.5 px-3">Side</th>
                  <th class="py-2.5 px-3">Lots</th>
                  <th class="py-2.5 px-3">Points</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3">Close Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary-border font-mono">
                <tr v-for="deal in detail.summary.recent_deals" :key="deal.id" class="hover:bg-background/40">
                  <td class="py-2.5 px-3 text-primary-text">#{{ deal.mt5_deal_id || deal.id }}</td>
                  <td class="py-2.5 px-3 font-sans font-semibold text-primary-text">{{ deal.symbol }}</td>
                  <td class="py-2.5 px-3">
                    <span :class="deal.side === 'BUY' ? 'text-primary-green' : 'text-primary-red'" class="font-bold">
                      {{ deal.side }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-primary-text">{{ deal.lots }}</td>
                  <td class="py-2.5 px-3 text-primary font-bold">{{ deal.points_awarded }}</td>
                  <td class="py-2.5 px-3 font-sans">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      :class="deal.eligibility_status === 'awarded' ? 'bg-primary-green/10 text-primary-green' : 'bg-secondary-text/10 text-secondary-text'"
                    >
                      {{ deal.eligibility_status }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 font-sans text-secondary-text">{{ formatDate(deal.close_time) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-6 text-center text-secondary-text bg-background/30 rounded-xl border border-primary-border">
            No recent deals recorded for this enrollment.
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-12 text-center text-secondary-text">
        No enrollment details available.
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
import { computed } from "vue";
import { X, Loader2 } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { formatDate } from "@/utils/timeFormatter";
import StatusBadge from "@/components/common/StatusBadge.vue";

defineProps({
  open: { type: Boolean, default: false },
});

defineEmits(["close"]);
const store = useLoyaltyStore();

const detail = computed(() => store.enrollmentDetail);
</script>
