<template>
  <div class="px-4">

    <!-- Header -->
    <!-- <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-base font-semibold text-primary-text">Account Transactions</h1>
        <p class="text-xs text-secondary-text mt-0.5">Transaction history for account #{{ route.params.id }}</p>
      </div>
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search transactions..."
          class="pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text w-52"
          @input="onSearch"
        />
      </div>
    </div> -->
 <div v-if="activeAccount" class="bg-card-background border border-primary-border rounded-xl p-4 mb-6 flex flex-wrap items-center gap-8">
      <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Account</p>
        <p class="text-sm font-bold text-primary-text">#{{ activeAccount.account_number }}</p>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Broker</p>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white">{{ activeAccount.broker }}</span>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Type</p>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded border border-primary-border text-secondary-text capitalize">{{ activeAccount.account_type }}</span>
      </div>
        <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Entity</p>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded border border-primary-border text-secondary-text capitalize">{{ activeAccount.entity_type }}</span>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Trading</p>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded border border-primary-border text-secondary-text capitalize">{{ activeAccount.trading_type }}</span>
      </div>
        <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Currency</p>
        <p class="text-sm font-bold text-primary-text">{{ activeAccount.currency }}</p>
      </div>
      <div v-if="activeAccount.broker_leverage">
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Leverage</p>
        <p class="text-sm font-bold text-primary-text">1:{{ activeAccount.broker_leverage }}</p>
      </div>
      <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Balance</p>
        <p class="text-sm font-bold text-primary-text tabular-nums">{{ formatNum(activeAccount.balance) }} {{ currencyDisplay }}</p>
      </div>
      <!-- <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">PnL</p>
        <p class="text-sm font-bold tabular-nums" :class="(activeAccount.pnl ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'">
          {{ (activeAccount.pnl ?? 0) >= 0 ? '+' : '' }}{{ formatNum(activeAccount.pnl) }} {{ currencyDisplay }}
        </p>
      </div> -->
       <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Equity</p>
        <p class="text-sm font-bold text-primary-text tabular-nums">{{ activeAccount.equity }}</p>
      </div>
       <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">Credit</p>
        <p class="text-sm font-bold text-primary-text tabular-nums">{{ activeAccount.credit }}</p>
      </div>
    </div>


    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      <template v-if="store.isLoading">
        <div v-for="n in 6" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2">
          <div class="h-3 w-24 bg-background rounded" />
          <div class="h-6 w-28 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Transactions</p>
          <p class="text-2xl font-semibold text-primary-text">{{ store.summary.total_transactions ?? 0 }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Net Flow</p>
          <p class="text-2xl font-semibold" :class="store.summary.net_flow >= 0 ? 'text-primary-green' : 'text-primary-red'">
            {{ store.summary.net_flow >= 0 ? '+' : '' }}{{ formatMoney(store.summary.net_flow) }}
          </p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Credits</p>
          <p class="text-2xl font-semibold text-primary-green">+{{ formatMoney(store.summary.total_credits) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Debits</p>
          <p class="text-2xl font-semibold text-primary-red">-{{ formatMoney(store.summary.total_debits) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Deposit</p>
          <p class="text-2xl font-semibold text-primary-text">{{ formatMoney(store.summary.total_deposit) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Withdrawal</p>
          <p class="text-2xl font-semibold text-primary-text">{{ formatMoney(store.summary.total_withdrawal) }}</p>
        </div>
      </template>
    </div>

    <!-- Filter bar -->
    <div class="flex items-center justify-end gap-3 mb-4">
      <!-- Date Range Filter -->
      <div class="w-56 sm:w-64">
        <BaseDatePicker
          v-model="dateRangeValue"
          :range="true"
          placeholder="Select date range..."
        />
      </div>
      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="store.perPageOptions"
        placeholder="Per page..."
        class="w-full sm:w-32 xl:w-32"
        @update:modelValue="(val) => store.updatePerPage(route.params.id, val)"
      />
    </div>

    <!-- DataTable -->
    <DataTable
      :data="store.data"
      :columns="txColumns"
      :pagination="store.pagination"
      :loading="store.isLoading"
      row-key="transaction_id"
      table-key="account-transactions-table"
      empty-title="No transactions found"
      empty-text="Transactions will appear here once recorded"
      @page-change="handlePageChange"
    >
      <!-- Custom Cell: Transaction -->
      <template #cell-transaction_id="{ row }">
        <p class="text-xs font-medium text-primary-text">#{{ row.transaction_id }}</p>
        <p class="text-[11px] text-secondary-text max-w-[160px] truncate">{{ row.description }}</p>
      </template>

      <!-- Custom Cell: Type badge -->
      <template #cell-type="{ row }">
        <span class="text-[11px] font-medium px-2 py-0.5 rounded-full capitalize" :class="typeClass(row.type)">
          {{ formatType(row.type) }}
        </span>
      </template>

      <!-- Custom Cell: Direction badge -->
      <template #cell-direction="{ row }">
        <span
          class="text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 w-fit capitalize"
          :class="row.direction === 'credit'
            ? 'bg-primary-green text-white'
            : 'bg-primary-red text-white'"
        >
          <ArrowDownLeft v-if="row.direction === 'credit'" class="w-3 h-3" />
          <ArrowUpRight v-else class="w-3 h-3" />
          {{ row.direction }}
        </span>
      </template>

      <!-- Custom Cell: Amount -->
      <template #cell-amount="{ row }">
        <span
          class="text-xs font-medium tabular-nums"
          :class="row.direction === 'credit' ? 'text-primary-green' : 'text-primary-red'"
        >
          {{ row.direction === 'credit' ? '+' : '-' }}{{ formatMoney(row.amount) }}
        </span>
      </template>

      <!-- Custom Cell: Balance Before -->
      <!-- <template #cell-balance_before="{ row }">
        <span class="text-xs text-secondary-text tabular-nums">{{ formatMoney(row.balance_before) }}</span>
      </template> -->

      <!-- Custom Cell: Balance After -->
      <!-- <template #cell-balance_after="{ row }">
        <span class="text-xs text-primary-text tabular-nums">{{ formatMoney(row.balance_after) }}</span>
      </template> -->

      <!-- Custom Cell: Reference -->
      <template #cell-reference_id="{ row }">
        <span class="text-xs text-secondary-text">{{ row.reference_id ?? '—' }}</span>
      </template>

      <!-- Custom Cell: Date -->
      <template #cell-created_at="{ row }">
        <span class="text-xs text-secondary-text whitespace-nowrap">{{ formatDate(row.created_at) }}</span>
      </template>
    </DataTable>

  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-vue-next'
import { useAccountTransactionsStore } from '@/stores/tradingAccounts/transactions'
import DataTable from '@/components/common/DataTable/DataTable.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseDatePicker from '@/components/common/BaseDatePicker.vue'
import { formatDate } from "@/utils/timeFormatter";

const store = useAccountTransactionsStore()
const route = useRoute()
const searchQuery = ref('')
const activeCurrency = ref(localStorage.getItem('active_currency') || 'USD')

const txColumns = [
  { key: 'transaction_id', label: 'Transaction' },
  { key: 'type', label: 'Type' },
  { key: 'direction', label: 'Direction' },
  { key: 'amount', label: 'Amount' },
 // { key: 'balance_before', label: 'Bal. Before' },
 // { key: 'balance_after', label: 'Bal. After' },
  { key: 'reference_id', label: 'Reference' },
  { key: 'created_at', label: 'Date', align: 'right' },
]

const dateRangeValue = computed({
  get() {
    if (store.from_date || store.to_date) {
      return {
        start: store.from_date || null,
        end: store.to_date || null,
      }
    }
    return null
  },
  set(val) {
    if (!val) {
      store.setDateRange('', '', route.params.id)
    } else if (Array.isArray(val)) {
      store.setDateRange(val[0] || '', val[1] || '', route.params.id)
    } else if (typeof val === 'object') {
      store.setDateRange(val.start || val.from || '', val.end || val.to || '', route.params.id)
    }
  },
})

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.applyFilters(route.params.id)
  }, 500)
}

const handlePageChange = (page) => {
  store.fetchTransactions(route.params.id, page)
}
const activeAccount = JSON.parse(
  localStorage.getItem('active_account')
)
const currencyDisplay = computed(
  () => activeAccount?.broker_currency || activeAccount?.currency || activeCurrency.value || 'USD'
)

const formatNum = (val) => (val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatMoney = (amount) => {
  const num = formatNum(amount)
  return activeCurrency.value === 'USC' ? `USC ${num}` : `$${num}`
}
// const formatDate = (val) => formatDate(val)
const formatType = (t) => t?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '—'

const typeClass = (type) => ({
  trade_pnl: 'bg-primary text-white',
  fee_paid:  'bg-primary-yellow text-white',
  deposit:   'bg-primary-green text-white',
  withdrawal:'bg-primary-red text-white',
}[type] ?? 'border border-primary-border text-secondary-text')

onMounted(() => {
  store.initAccountId(route.params.id)
  store.fetchTransactions(route.params.id)
})
</script>
