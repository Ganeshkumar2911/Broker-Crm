<template>
  <div class="px-4 pb-8 space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <template v-if="store.loading && !store.records?.length">
        <div v-for="n in 3" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2">
          <div class="h-3 w-24 bg-background rounded" />
          <div class="h-6 w-32 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Total Fees</span>
            <DollarSign class="w-4 h-4 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">{{ topCurrencySymbol }}{{ formatNum(store.summary.total_fees) }}</p>
            <p class="text-[10px] text-secondary-text mt-0.5">Aggregated performance fees</p>
          </div>
        </div>

        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">Broker Net</span>
            <Building2 class="w-4 h-4 text-primary-green" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-green tabular-nums">{{ topCurrencySymbol }}{{ formatNum(store.summary.broker_net) }}</p>
            <p class="text-[10px] text-secondary-text mt-0.5">Net broker commission</p>
          </div>
        </div>

        <div class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-secondary-text">IB Pool</span>
            <GitBranch class="w-4 h-4 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-2xl font-bold text-primary-text tabular-nums">{{ topCurrencySymbol }}{{ formatNum(store.summary.ib_pool ?? store.summary.ib_distributed) }}</p>
            <p class="text-[10px] text-secondary-text mt-0.5">Distributed to partner network</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card-background border border-primary-border rounded-xl p-2.5">
      <div class="flex items-center gap-2 flex-wrap flex-1">
        <!-- FM ID Filter -->
        <BaseSelect
          v-model="fmIdInput"
          :options="fmOptions"
          :isLoading="isFetchingFms"
          searchable
          clearable
          allowAll
          allLabel="All FMs"
          :isShowMail="true"
          placeholder="Filter by FM..."
          class="w-full sm:w-44"
          customClass="h-9"
          @update:modelValue="handleApplyFmFilter"
        />

        <!-- Apply FM button -->
        <button
          v-if="fmIdInput && String(fmIdInput) !== String(store.filters.fm_id)"
          @click="handleApplyFmFilter"
          class="px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Apply
        </button>

        <!-- Amount View Toggle -->
        <div v-if="store.currency?.available_views?.length" class="flex items-center rounded-lg border border-primary-border bg-card-background overflow-hidden h-9">
          <button
            v-for="v in store.currency.available_views"
            :key="v.key"
            :disabled="store.loading"
            class="px-3 h-full text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            :class="store.filters.amount_view === v.key ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
            :title="v.description"
            @click="store.setAmountView(v.key)"
          >
            {{ v.label }}
          </button>
        </div>

        <!-- Per page selector -->
        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per page..."
          class="w-20 sm:w-20"
          @update:modelValue="store.updatePerPage"
        />

        <!-- Reset Button -->
        <button
          v-if="store.filters.fm_id || fmIdInput"
          type="button"
          class="rounded-lg px-2.5 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors cursor-pointer flex items-center gap-1.5"
          @click="clearFmFilter"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Reset Filter
        </button>
      </div>

      <!-- Refresh Button -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="store.loading"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border p-2 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          title="Refresh"
          @click="() => store.fetchSettlements()"
        >
          <RotateCw class="h-3.5 w-3.5" :class="{ 'animate-spin': store.loading }" />
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-2xl overflow-hidden bg-card-background shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-primary-border bg-background/50">
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">ID</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">FM Details</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Executed / Period</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Type</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Net Profit</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Gross Fee</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">FM Share</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">IB's Share</th>
              <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Broker Net</th>
              <th class="text-center text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Followers</th>
              <th class="text-center text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Trades</th>
              <th class="text-center text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Status</th>
              <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3 w-36">Actions</th>
            </tr>
          </thead>

          <!-- Skeleton -->
          <tbody v-if="store.loading">
            <tr v-for="n in 8" :key="n" class="border-b border-primary-border animate-pulse">
              <td class="p-3"><div class="h-3 w-10 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-28 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-28 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-16 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-12 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-14 bg-background rounded" /></td>
              <td class="p-3"><div class="h-3 w-10 bg-background rounded mx-auto" /></td>
              <td class="p-3"><div class="h-3 w-10 bg-background rounded mx-auto" /></td>
              <td class="p-3"><div class="h-5 w-16 bg-background rounded-full mx-auto" /></td>
              <td class="p-3 flex justify-end"><div class="h-6 w-24 bg-background rounded" /></td>
            </tr>
          </tbody>

          <!-- Empty -->
          <tbody v-else-if="!store.records || store.records.length === 0">
            <tr>
              <td colspan="13" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-card-background border border-primary-border flex items-center justify-center">
                    <ReceiptText class="w-5 h-5 text-secondary-text" />
                  </div>
                  <p class="text-sm font-semibold text-primary-text">No settlements found</p>
                  <p class="text-xs text-secondary-text">Try adjusting your filters or search criteria</p>
                  <button
                    v-if="store.filters.fm_id"
                    class="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
                    @click="clearFmFilter"
                  >
                    Clear FM Filter
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Data -->
          <tbody v-else>
            <tr
              v-for="row in store.records"
              :key="row.settlement_id"
              class="border-b border-primary-border last:border-none hover:bg-background/40 transition-colors cursor-pointer"
              @click="goToDetail(row.settlement_id)"
            >
              <!-- Settlement ID -->
              <td class="p-3 text-xs font-bold font-mono text-primary">#{{ row.settlement_id }}</td>

              <!-- FM Details -->
              <td class="p-3">
                <p class="text-xs font-semibold text-primary-text">{{ row.fm_name || 'FM' }}</p>
                <p class="text-[11px] text-secondary-text font-mono">FM ID: #{{ row.fm_id }}</p>
              </td>

              <!-- Executed / Period -->
              <td class="p-3">
                <p class="text-xs font-medium text-primary-text">{{ formatDate(row.executed_at) || row.period }}</p>
                <p v-if="row.settlement_period_start" class="text-[10px] text-secondary-text mt-0.5">
                  {{ formatDateShort(row.settlement_period_start) }} – {{ formatDateShort(row.settlement_period_end) }}
                </p>
              </td>

              <!-- Settlement Type -->
              <td class="p-3">
                <span
                  v-if="row.settlement_type"
                  class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-background border border-primary-border text-secondary-text"
                >
                  {{ row.settlement_type }}
                </span>
                <span v-else class="text-xs text-secondary-text">—</span>
              </td>

              <!-- Net Profit -->
              <td class="p-3">
                <span
                  class="text-xs font-bold tabular-nums"
                  :class="getNetProfit(row) >= 0 ? 'text-primary-green' : 'text-primary-red'"
                >
                  {{ formatNetProfit(row) }}
                </span>
              </td>

              <!-- Gross Fee -->
              <td class="p-3 text-xs font-medium text-primary-text tabular-nums">
                {{ formatValWithCurrency(getGrossFee(row), row) }}
              </td>

              <!-- FM Share -->
              <td class="p-3 text-xs text-primary-text tabular-nums">
                {{ formatValWithCurrency(getFmShare(row), row) }}
              </td>

              <!-- IB's Share -->
              <td class="p-3 text-xs text-primary-text tabular-nums">
                {{ formatValWithCurrency(getIbShare(row), row) }}
              </td>

              <!-- Broker Net -->
              <td class="p-3 text-xs text-primary-green font-medium tabular-nums">
                {{ formatValWithCurrency(getBrokerNet(row), row) }}
              </td>

              <!-- Followers Count -->
              <td class="p-3 text-center">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-medium bg-background border border-primary-border text-primary-text">
                  {{ row.followers_count ?? 0 }}
                </span>
              </td>

              <!-- Trades Count -->
              <td class="p-3 text-center">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-background border border-primary-border text-primary-text">
                  {{ row.trades_count ?? 0 }}
                </span>
              </td>

              <!-- Status -->
              <td class="p-3 text-center">
                <span
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize inline-block"
                  :class="statusClass(row.status)"
                >
                  {{ row.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="p-3 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-medium transition-colors cursor-pointer"
                    title="View Settlement Details"
                    @click="goToDetail(row.settlement_id)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    v-if="hasPermission('settlement.trades')"
                    class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
                    title="View Flat Trades"
                    @click="goToTrade(row.settlement_id)"
                  >
                    <BarChart2 class="w-3.5 h-3.5" />
                    <span>Trades</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ReceiptText,
  DollarSign,
  Building2,
  GitBranch,
  Search,
  X,
  RotateCcw,
  RotateCw,
  Eye,
  BarChart2,
  Info,
} from 'lucide-vue-next'
import { useSettlementsStore } from '@/stores/settlements/settlements'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import apiRequest from '@/api/request'
import urls from '@/api/urls'

const router = useRouter()
const store = useSettlementsStore()
const { hasPermission } = usePermissionCheck()

const fmIdInput = ref('')
const fmOptions = ref([])
const isFetchingFms = ref(false)

const fetchFms = async () => {
  try {
    isFetchingFms.value = true
    const res = await apiRequest('get', urls.fm.simpleList, { params: { page: 1, per_page: 1000 } })
    if (res?.data) {
      fmOptions.value = res.data.map(fm => {
        const labelName = fm.label_name || 'FM'
        const name = fm.name || ''
        const displayName = labelName === name || !name ? labelName : `${labelName} (${name})`
        return {
          label: `${displayName} (#${fm.id})`,
          email: fm.email,
          value: fm.id,
        }
      })
    }
  } catch (err) {
    console.error(err)
  } finally {
    isFetchingFms.value = false
  }
}

const handleApplyFmFilter = () => {
  store.filters.fm_id = fmIdInput.value ? Number(fmIdInput.value) : null
  store.applyFilters()
}

const clearFmFilter = () => {
  fmIdInput.value = ''
  store.filters.fm_id = null
  store.applyFilters()
}

const handlePageChange = (page) => {
  store.setPage(page)
}

const formatNum = (val) =>
  (Number(val) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const getCurrencySymbol = (currency) => {
  const c = String(currency || '').trim().toUpperCase()
  if (c === 'USC' || c === 'CENT' || c === 'CENTS') return 'C'
  if (c === 'CAD') return 'C$'
  if (c === 'EUR') return '€'
  if (c === 'GBP') return '£'
  if (c === 'INR') return '₹'
  if (c === 'JPY') return '¥'
  if (c === 'USD') return '$'
  return c ? `${c} ` : '$'
}

const getRecordCurrency = (row) => {
  if (row.currency) {
    if (row.currency.selected_view === 'usd') {
      return row.currency.payout_currency || 'USD'
    }
    return row.currency.account_currency || (row.amounts_in_account_units ? 'USC' : 'USD')
  }
  return row.amounts_in_account_units ? 'USC' : 'USD'
}

const formatValWithCurrency = (val, row) => {
  const curr = getRecordCurrency(row)
  const sym = getCurrencySymbol(curr)
  const num = Number(val) || 0
  const isNegative = num < 0
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${isNegative ? '-' : ''}${sym}${formatted}`
}

const formatNetProfit = (row) => {
  const val = getNetProfit(row)
  const curr = getRecordCurrency(row)
  const sym = getCurrencySymbol(curr)
  const num = Number(val) || 0
  const sign = num > 0 ? '+' : num < 0 ? '-' : ''
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${sign}${sym}${formatted}`
}

const topCurrencySymbol = computed(() => {
  const c = store.currency
  if (!c) return '$'
  const cur = c.selected_view === 'usd' ? (c.payout_currency || 'USD') : (c.account_currency || 'USD')
  return getCurrencySymbol(cur)
})

const getNetProfit = (row) =>
  row.display?.net_profit ?? row.display?.gross_pnl ?? row.net_profit ?? row.gross_pnl ?? 0

const getGrossFee = (row) =>
  row.display?.gross_fee ?? row.gross_fee ?? 0

const getFmShare = (row) =>
  row.display?.fm_share ?? row.display?.fm_net_after_agents ?? row.fm_share ?? row.fm_net_after_agents ?? 0

const getIbShare = (row) =>
  row.display?.ib_pool ?? row.display?.ib_distributed ?? row.ib_pool ?? row.ib_distributed ?? 0

const getBrokerNet = (row) =>
  row.display?.broker_net ?? row.broker_net ?? 0

const formatDate = (val) => {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (e) {
    return String(val)
  }
}

const formatDateShort = (val) => {
  if (!val) return ''
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch (e) {
    return String(val)
  }
}

const statusClass = (s) =>
  ({
    completed: 'bg-primary-green/10 text-primary-green border-primary-green/20',
    pending: 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20',
    failed: 'bg-primary-red/10 text-primary-red border-primary-red/20',
  }[String(s).toLowerCase()] ?? 'bg-background text-secondary-text border-primary-border')

const goToDetail = (settlementId) => {
  router.push(`/settlement/details/${settlementId}`)
}

const goToTrade = (settlementId) => {
  router.push(`/settlement/trade/${settlementId}`)
}

onMounted(() => {
  store.fetchSettlements()
  fetchFms()
})
</script>

