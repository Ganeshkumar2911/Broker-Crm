<script setup>
/**
 * FundManagerSection — FM Intelligence (Section 3)
 * API: dashboard.fund_manager_insights
 *   top_fm: { fm_id, fm_name, followers, aum, generated_revenue, performance_fee }
 *   pending_withdrawals: number
 *   recent_fm_requests: [{ request_id, settlement_type, status, user_email }]
 */
import { computed } from 'vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

const props = defineProps({
  data:    { type: Object,  default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const topFm            = computed(() => props.data.top_fm ?? {})
const recentRequests   = computed(() => props.data.recent_fm_requests ?? [])
const pendingWithdraws = computed(() => props.data.pending_withdrawals ?? 0)

function fmt(v) {
  return `$${Number(v ?? 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const statusCls = {
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  pending:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
}
const typeLabel = { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly' }
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-4">
      <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text">Fund Manager Intelligence</p>
      <span class="flex-1 h-px bg-primary-border" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- Top FM Card -->
      <div class="lg:col-span-2 bg-card-background border border-primary-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-200">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text mb-4">Top Performing Manager</p>

        <template v-if="loading">
          <SkeletonCard :rows="['w-36 h-5', 'w-24 h-3', 'w-full h-px my-2', 'w-20 h-5', 'w-20 h-5']" />
        </template>
        <template v-else>
          <!-- Identity row -->
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span class="text-sm font-bold text-primary">{{ (topFm.fm_name ?? 'FM')[0] }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-primary-text">{{ topFm.fm_name ?? '—' }}</p>
              <p class="text-[10px] text-secondary-text">ID #{{ topFm.fm_id ?? '—' }}</p>
            </div>
            <div class="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
              <span class="text-[10px] font-semibold text-primary">{{ topFm.performance_fee ?? 0 }}% fee</span>
            </div>
          </div>

          <!-- Stats grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-primary-border">
            <div>
              <p class="text-[10px] uppercase tracking-wider text-secondary-text">Followers</p>
              <p class="text-xl font-bold text-primary-text mt-1">{{ topFm.followers ?? 0 }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-secondary-text">Revenue</p>
              <p class="text-xl font-bold text-primary-text mt-1">{{ fmt(topFm.generated_revenue) }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-secondary-text">AUM</p>
              <p class="text-xl font-bold text-primary-text mt-1">{{ fmt(topFm.aum) }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-secondary-text">Pending W/D</p>
              <p
                class="text-xl font-bold mt-1"
                :class="pendingWithdraws > 0 ? 'text-amber-400' : 'text-primary-text'"
              >{{ pendingWithdraws }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Recent FM Requests -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-200">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text mb-4">Recent FM Requests</p>

        <template v-if="loading">
          <div class="space-y-2.5">
            <SkeletonCard v-for="i in 3" :key="i" :rows="['w-full h-3', 'w-28 h-2']" />
          </div>
        </template>
        <template v-else>
          <div v-if="!recentRequests.length" class="flex flex-col items-center justify-center h-32 gap-2 text-secondary-text">
            <span class="text-2xl opacity-30">📋</span>
            <p class="text-[11px]">No recent requests</p>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="req in recentRequests"
              :key="req.request_id"
              class="flex items-start justify-between py-2.5 px-3 rounded-xl bg-background border border-primary-border hover:border-primary/30 transition-all duration-150"
            >
              <div class="min-w-0">
                <p class="text-xs font-medium text-primary-text truncate">{{ req.user_email }}</p>
                <p class="text-[10px] text-secondary-text mt-0.5">
                  #{{ req.request_id }} · {{ typeLabel[req.settlement_type] ?? req.settlement_type }}
                </p>
              </div>
              <span
                :class="[
                  'shrink-0 ml-2 text-[10px] font-semibold px-2 py-1 rounded-lg border capitalize',
                  statusCls[req.status] ?? statusCls.pending,
                ]"
              >
                {{ req.status }}
              </span>
            </div>
          </div>
        </template>
      </div>

    </div>
  </section>
</template>