<script setup>
/**
 * RevenueIntelligence — Stacked Area Chart Hero Section (Section 2)
 * API: revenueAnalytics → { chart[], summary{}, filters{} }
 *
 * Filters call store.setRevenueFilters + store.applyRevenueFilters
 */
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard/dashboard'
import { TrendingUp } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const store = useDashboardStore()
const { revenueAnalytics, revenueLoading, revenueFilters } = storeToRefs(store)

// ─── Filters ───────────────────────────────────────────────────────
const filters = [
  { key: 'daily',     label: 'D' },
  { key: 'weekly',    label: 'W' },
  { key: 'monthly',   label: 'M' },
  { key: 'quarterly', label: 'Q' },
]

function setFilter(key) {
  store.setRevenueFilters({ range: key })
  store.applyRevenueFilters()
}

// ─── Data slices ───────────────────────────────────────────────────
const chartRows = computed(() => revenueAnalytics.value?.chart ?? [])
const summary   = computed(() => revenueAnalytics.value?.summary ?? {})

const isEmpty = computed(() =>
  chartRows.value.length === 0 ||
  chartRows.value.every(d => d.fm_share === 0 && d.ib_pool === 0 && d.broker_net === 0)
)

// ─── Chart config ─────────────────────────────────────────────────
const chartData = computed(() => ({
  labels: chartRows.value.map(d => d.label),
  datasets: [
    {
      label:            'FM Share',
      data:             chartRows.value.map(d => d.fm_share),
      fill:             true,
      tension:          0.4,
      borderColor:      'rgba(91,106,248,0.9)',
      backgroundColor:  'rgba(91,106,248,0.10)',
      borderWidth:      2,
      pointRadius:      0,
      pointHoverRadius: 4,
    },
    {
      label:            'IB Pool',
      data:             chartRows.value.map(d => d.ib_pool),
      fill:             true,
      tension:          0.4,
      borderColor:      'rgba(52,211,153,0.9)',
      backgroundColor:  'rgba(52,211,153,0.07)',
      borderWidth:      2,
      pointRadius:      0,
      pointHoverRadius: 4,
    },
    {
      label:            'Broker Net',
      data:             chartRows.value.map(d => d.broker_net),
      fill:             true,
      tension:          0.4,
      borderColor:      'rgba(251,191,36,0.9)',
      backgroundColor:  'rgba(251,191,36,0.06)',
      borderWidth:      2,
      pointRadius:      0,
      pointHoverRadius: 4,
    },
  ],
}))

const chartOptions = {
  responsive:          true,
  maintainAspectRatio: false,
  interaction:         { mode: 'index', intersect: false },
  plugins: {
    legend: {
      display:  true,
      position: 'bottom',
      labels: {
        color:        '#6b7280',
        boxWidth:     10,
        boxHeight:    10,
        borderRadius: 3,
        font:         { size: 11 },
        padding:      20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15,17,23,0.96)',
      borderColor:     'rgba(30,33,48,1)',
      borderWidth:     1,
      titleColor:      '#e8eaf0',
      bodyColor:       '#9ca3af',
      padding:         12,
      cornerRadius:    10,
      callbacks: {
        label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid:  { color: 'rgba(30,33,48,0.5)', drawBorder: false },
      ticks: { color: '#6b7280', font: { size: 10 }, maxTicksLimit: 8 },
    },
    y: {
      stacked: true,
      grid:    { color: 'rgba(30,33,48,0.5)', drawBorder: false },
      ticks:   { color: '#6b7280', font: { size: 10 }, callback: v => `$${v}` },
    },
  },
}

// ─── Summary pills ────────────────────────────────────────────────
function fmt(v) {
  return `$${Number(v ?? 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const pills = computed(() => [
  {
    label:  'FM Share',
    value:  fmt(summary.value.total_fm_share),
    change: summary.value.fm_share_change ?? null,
    dot:    'bg-primary',
    cls:    'border-primary/20',
  },
  {
    label:  'IB Pool',
    value:  fmt(summary.value.total_ib_pool),
    change: summary.value.ib_pool_change ?? null,
    dot:    'bg-emerald-400',
    cls:    'border-emerald-500/20',
  },
  {
    label:  'Broker Net',
    value:  fmt(summary.value.total_broker_net),
    change: summary.value.broker_net_change ?? null,
    dot:    'bg-amber-400',
    cls:    'border-amber-500/20',
  },
])
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-4">
      <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text">Revenue Intelligence</p>
      <span class="flex-1 h-px bg-primary-border" />
    </div>

    <div class="bg-card-background border border-primary-border rounded-2xl p-6">
      <!-- Header row -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-sm font-semibold text-primary-text">Revenue Breakdown</h2>
          <p class="text-[11px] text-secondary-text mt-0.5">Platform revenue streams over time</p>
        </div>

        <!-- Filter tabs -->
        <div class="flex items-center gap-1 bg-background border border-primary-border rounded-xl p-1">
          <button
            v-for="f in filters"
            :key="f.key"
            @click="setFilter(f.key)"
            :class="[
              'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150',
              revenueFilters.range === f.key
                ? 'bg-primary text-white'
                : 'text-secondary-text hover:text-primary-text',
            ]"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Chart skeleton -->
      <template v-if="revenueLoading">
        <div class="animate-pulse h-64 bg-primary-border rounded-xl" />
      </template>

      <!-- Empty state -->
      <template v-else-if="isEmpty">
        <div class="flex flex-col items-center justify-center h-64 gap-3 text-secondary-text">
          <TrendingUp :size="40" class="opacity-25" />
          <p class="text-xs font-medium">No revenue data for this period</p>
        </div>
      </template>

      <!-- Chart -->
      <div v-else class="h-64">
        <Line :data="chartData" :options="chartOptions" />
      </div>

      <!-- Summary pills -->
      <div class="mt-6 grid grid-cols-3 gap-3">
        <div
          v-for="pill in pills"
          :key="pill.label"
          :class="['flex flex-col items-center gap-2 border rounded-xl py-3 px-4 bg-background', pill.cls]"
        >
          <div class="flex items-center gap-1.5">
            <span :class="['w-1.5 h-1.5 rounded-full', pill.dot]" />
            <span class="text-[10px] font-semibold uppercase tracking-wider text-secondary-text">{{ pill.label }}</span>
          </div>
          <p class="text-base font-bold text-primary-text">{{ pill.value }}</p>
          <span
            v-if="pill.change !== null"
            :class="[
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-md',
              pill.change > 0  ? 'bg-emerald-500/10 text-emerald-400' :
              pill.change < 0  ? 'bg-rose-500/10 text-rose-400'       :
                                 'bg-primary-border text-secondary-text',
            ]"
          >
            {{ pill.change > 0 ? '↑' : pill.change < 0 ? '↓' : '—' }} {{ Math.abs(pill.change) }}%
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
