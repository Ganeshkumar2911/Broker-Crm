<script setup>
/**
 * OverviewSection — Executive KPI Cards (Section 1)
 * API: dashboard.overview
 */
import { computed } from 'vue'
import MetricCard from '@/components/common/MetricCard.vue'

const props = defineProps({
  data:    { type: Object,  default: () => ({}) },
  loading: { type: Boolean, default: false },
})

function fmt(v, decimals = 2) {
  return `$${Number(v ?? 0).toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}
function num(v) {
  return Number(v ?? 0).toLocaleString()
}

const cards = computed(() => [
  {
    title:   'Platform Revenue',
    value:   fmt(props.data.platform_revenue),
    subtext: 'Total net revenue',
    change:  props.data.platform_revenue_change ?? null,
  },
  {
    title:   'Transaction Volume',
    value:   fmt(props.data.wallet_transaction_volume),
    subtext: 'Wallet movement',
    change:  props.data.wallet_volume_change ?? null,
  },
  {
    title:   'Trading Accounts',
    value:   num(props.data.active_trading_accounts),
    subtext: 'Active accounts',
    change:  null,
  },
  {
    title:   'Total Clients',
    value:   num(props.data.total_clients),
    subtext: 'Registered clients',
    change:  null,
  },
  {
    title:   'Fund Managers',
    value:   num(props.data.total_fund_managers),
    subtext: `${props.data.active_fund_managers ?? 0} active`,
    change:  null,
  },
  {
    title:   'IB Networks',
    value:   num(props.data.total_ib_networks),
    subtext: `${props.data.total_ibs ?? 0} total IBs`,
    change:  null,
  },
  {
    title:   'Pending FM Requests',
    value:   num(props.data.pending_fm_requests),
    subtext: 'Awaiting review',
    change:  null,
  },
])
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-4">
      <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text">Executive Overview</p>
      <span class="flex-1 h-px bg-primary-border" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <MetricCard
        v-for="(card, i) in cards"
        :key="i"
        v-bind="card"
        :loading="loading"
      />
    </div>
  </section>
</template>