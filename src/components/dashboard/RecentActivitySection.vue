<script setup>
/**
 * RecentActivitySection — Activity Feed (Section 7)
 * API: dashboard.recent_activity
 *   [{ activity_type, type, title, created_at }]
 *
 *   activity_type: 'settlement_completed' | 'ib_commission' | ...
 *   type:          'settlement' | 'wallet' | ...
 */
import SkeletonCard from '@/components/common/SkeletonCard.vue'

defineProps({
  activities: { type: Array,   default: () => [] },
  loading:    { type: Boolean, default: false },
})

// ─── Icon & style per activity_type ────────────────────────────
const activityStyle = {
  settlement_completed: {
    bg:    'bg-primary/10',
    color: 'text-primary',
    svg:   `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5h9M7.5 2l4 4.5-4 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
  },
  ib_commission: {
    bg:    'bg-emerald-500/10',
    color: 'text-emerald-400',
    svg:   `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 2v9M2 6.5l4.5-4.5 4.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
  },
  fm_request: {
    bg:    'bg-amber-500/10',
    color: 'text-amber-400',
    svg:   `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1.5" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M4 5.5h5M4 8h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>`,
  },
  wallet_credit: {
    bg:    'bg-emerald-500/10',
    color: 'text-emerald-400',
    svg:   `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 2v9M2 6.5l4.5-4.5 4.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
  },
  wallet_debit: {
    bg:    'bg-rose-500/10',
    color: 'text-rose-400',
    svg:   `<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 2v9M2 6.5l4.5 4.5 4.5-4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
  },
}

// Fallback by generic type
const typeFallback = {
  settlement: activityStyle.settlement_completed,
  wallet:     activityStyle.ib_commission,
}

function getStyle(activity) {
  return activityStyle[activity.activity_type]
    ?? typeFallback[activity.type]
    ?? activityStyle.settlement_completed
}

// ─── Time formatting ────────────────────────────────────────────
function formatRelative(dateStr) {
  if (!dateStr) return ''
  const date  = new Date(dateStr)
  const now   = new Date()
  const diffH = Math.floor((now - date) / 3600000)
  const diffD = Math.floor(diffH / 24)
  if (diffH < 1)  return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  if (diffD < 7)  return `${diffD}d ago`
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function formatFull(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-4">
      <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text">Recent Activity</p>
      <span class="flex-1 h-px bg-primary-border" />
    </div>

    <div class="bg-card-background border border-primary-border rounded-2xl p-5">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-sm font-semibold text-primary-text">Platform Activity</h2>
        <span class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span class="text-[10px] text-secondary-text">Live</span>
        </span>
      </div>

      <!-- Skeleton -->
      <template v-if="loading">
        <div class="space-y-4">
          <div v-for="i in 6" :key="i" class="flex items-start gap-3 animate-pulse">
            <div class="w-7 h-7 rounded-xl bg-primary-border shrink-0" />
            <div class="flex-1 space-y-2 pt-0.5">
              <div class="h-3 w-48 bg-primary-border rounded-full" />
              <div class="h-2 w-28 bg-primary-border rounded-full" />
            </div>
            <div class="h-2 w-10 bg-primary-border rounded-full" />
          </div>
        </div>
      </template>

      <!-- Empty -->
      <template v-else-if="!activities.length">
        <div class="flex flex-col items-center justify-center py-12 gap-2 text-secondary-text">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" class="opacity-20">
            <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.5"/>
            <path d="M16 10v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <p class="text-xs">No recent activity</p>
        </div>
      </template>

      <!-- Feed -->
      <template v-else>
        <div class="relative">
          <div class="space-y-0.5">
            <div
              v-for="(activity, i) in activities"
              :key="i"
              class="group relative flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-background transition-all duration-150 cursor-default"
            >
              <!-- Icon -->
              <div
                :class="[
                  'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 relative z-10',
                  getStyle(activity).bg,
                  getStyle(activity).color,
                ]"
                v-html="getStyle(activity).svg"
              />

              <!-- Content -->
              <div class="flex-1 min-w-0 pt-0.5">
                <p class="text-xs font-medium text-primary-text truncate group-hover:text-primary transition-colors duration-150">
                  {{ activity.title }}
                </p>
                <p class="text-[10px] text-secondary-text mt-0.5">{{ formatFull(activity.created_at) }}</p>
              </div>

              <!-- Relative time -->
              <span class="text-[10px] text-secondary-text shrink-0 pt-0.5">
                {{ formatRelative(activity.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>