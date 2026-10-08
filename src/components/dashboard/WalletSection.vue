<script setup>
/**
 * WalletSection — Wallet & Capital Flow (Section 5)
 * API: dashboard.wallet_summary + dashboard.wallet_breakdown
 *
 * wallet_summary:   { client_wallet_balance, fm_wallet_balance, ib_wallet_balance,
 *                     net_flow, total_deposits, total_withdrawals }
 * wallet_breakdown: { deposits, withdrawals, fm_payouts, ib_commissions }
 */
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend)

const props = defineProps({
  summary:   { type: Object,  default: () => ({}) },
  breakdown: { type: Object,  default: () => ({}) },
  loading:   { type: Boolean, default: false },
})

function fmt(v, d = 2) {
  return `$${Number(v ?? 0).toLocaleString('en', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

// ─── Donut chart ────────────────────────────────────────────────
const clientBal = computed(() => props.summary.client_wallet_balance ?? 0)
const fmBal     = computed(() => props.summary.fm_wallet_balance ?? 0)
const ibBal     = computed(() => props.summary.ib_wallet_balance ?? 0)
const totalBal  = computed(() => clientBal.value + fmBal.value + ibBal.value)

const isEmpty   = computed(() => totalBal.value === 0)

const donutData = computed(() => ({
  labels: ['Client', 'FM', 'IB'],
  datasets: [{
    data: isEmpty.value ? [1, 1, 1] : [clientBal.value, fmBal.value, ibBal.value],
    backgroundColor: isEmpty.value
      ? ['rgba(30,33,48,0.8)', 'rgba(30,33,48,0.5)', 'rgba(30,33,48,0.3)']
      : ['rgba(91,106,248,0.9)', 'rgba(52,211,153,0.85)', 'rgba(251,191,36,0.85)'],
    borderWidth: 0,
    hoverOffset: 4,
  }],
}))

const donutOptions = {
  responsive:          true,
  maintainAspectRatio: false,
  cutout:              '72%',
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled:         !isEmpty.value,
      backgroundColor: 'rgba(15,17,23,0.96)',
      borderColor:     'rgba(30,33,48,1)',
      borderWidth:     1,
      titleColor:      '#e8eaf0',
      bodyColor:       '#9ca3af',
      padding:         10,
      cornerRadius:    8,
      callbacks: { label: ctx => ` ${fmt(ctx.parsed)}` },
    },
  },
}

// ─── Legend ─────────────────────────────────────────────────────
const walletLegend = computed(() => [
  { label: 'Client Wallet', value: fmt(clientBal.value), dot: 'bg-primary' },
  { label: 'FM Wallet',     value: fmt(fmBal.value),     dot: 'bg-emerald-400' },
  { label: 'IB Wallet',     value: fmt(ibBal.value),     dot: 'bg-amber-400' },
])

// ─── Flow stats ─────────────────────────────────────────────────
const flowCards = computed(() => [
  { label: 'Total Deposits',     value: fmt(props.summary.total_deposits),    dot: 'bg-emerald-400' },
  { label: 'Total Withdrawals',  value: fmt(props.summary.total_withdrawals),  dot: 'bg-rose-400' },
  { label: 'Net Flow',           value: fmt(props.summary.net_flow),           dot: 'bg-primary' },
  { label: 'FM Payouts',         value: fmt(props.breakdown.fm_payouts),       dot: 'bg-emerald-400' },
  { label: 'IB Commissions',     value: fmt(props.breakdown.ib_commissions),   dot: 'bg-amber-400' },
])
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-4">
      <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text">Wallet &amp; Capital Flow</p>
      <span class="flex-1 h-px bg-primary-border" />
    </div>

    <div class="bg-card-background border border-primary-border rounded-2xl p-6 hover:border-primary/20 transition-all duration-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

        <!-- Donut + legend -->
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text mb-4">Wallet Distribution</p>

          <template v-if="loading">
            <div class="animate-pulse w-36 h-36 rounded-full bg-primary-border mx-auto" />
          </template>
          <template v-else>
            <div class="relative h-40 w-40 mx-auto">
              <Doughnut :data="donutData" :options="donutOptions" />
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p class="text-[9px] text-secondary-text uppercase tracking-wider">Total</p>
                <p class="text-base font-bold text-primary-text">{{ fmt(totalBal, 0) }}</p>
              </div>
            </div>

            <div class="mt-4 space-y-2">
              <div v-for="leg in walletLegend" :key="leg.label" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span :class="['w-1.5 h-1.5 rounded-full', leg.dot]" />
                  <span class="text-[11px] text-secondary-text">{{ leg.label }}</span>
                </div>
                <span class="text-[11px] font-semibold text-primary-text font-mono">{{ leg.value }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Flow cards -->
        <div class="md:col-span-2">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text mb-4">Capital Movement</p>

          <template v-if="loading">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div v-for="i in 5" :key="i" class="bg-background border border-primary-border rounded-2xl p-4 animate-pulse">
                <div class="h-2.5 w-20 bg-primary-border rounded-full" />
                <div class="h-6 w-24 bg-primary-border rounded-full mt-3" />
              </div>
            </div>
          </template>
          <template v-else>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="card in flowCards"
                :key="card.label"
                class="bg-background border border-primary-border rounded-2xl p-4 hover:border-primary/20 transition-all duration-150"
              >
                <div class="flex items-center gap-1.5 mb-2">
                  <span :class="['w-1.5 h-1.5 rounded-full', card.dot]" />
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-secondary-text">{{ card.label }}</p>
                </div>
                <p class="text-xl font-bold text-primary-text">{{ card.value }}</p>
              </div>
            </div>
          </template>
        </div>

      </div>
    </div>
  </section>
</template>