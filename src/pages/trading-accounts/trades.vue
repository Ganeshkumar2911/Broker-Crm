<template>
  <div class="px-4">
    <!-- Summary Cards -->
    <div
      v-if="activeAccount"
      class="bg-card-background border border-primary-border rounded-xl p-4 mb-6 flex flex-wrap items-center gap-8"
    >
      <div>
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Account
        </p>
        <p class="text-sm font-bold text-primary-text">
          #{{ activeAccount.account_number }}
        </p>
      </div>
      <div>
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Broker
        </p>
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white"
          >{{ activeAccount.broker }}</span
        >
      </div>
      <div>
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Type
        </p>
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded border border-primary-border text-secondary-text capitalize"
          >{{ activeAccount.account_type }}</span
        >
      </div>
      <div>
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Entity
        </p>
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded border border-primary-border text-secondary-text capitalize"
          >{{ activeAccount.entity_type }}</span
        >
      </div>
      <div>
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Trading
        </p>
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded border border-primary-border text-secondary-text capitalize"
          >{{ activeAccount.trading_type }}</span
        >
      </div>
      <div>
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Currency
        </p>
        <p class="text-sm font-bold text-primary-text">
          {{ activeAccount.currency }}
        </p>
      </div>
      <div v-if="activeAccount.broker_leverage">
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Leverage
        </p>
        <p class="text-sm font-bold text-primary-text">
          1:{{ activeAccount.broker_leverage }}
        </p>
      </div>
      <div>
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Balance
        </p>
        <p class="text-sm font-bold text-primary-text tabular-nums">
          {{ formatNum(activeAccount.balance) }} {{ currencyDisplay }}
        </p>
      </div>
      <!-- <div>
        <p class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold">PnL</p>
        <p class="text-sm font-bold tabular-nums" :class="(activeAccount.pnl ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'">
          {{ (activeAccount.pnl ?? 0) >= 0 ? '+' : '' }}{{ formatNum(activeAccount.pnl) }} {{ currencyDisplay }}
        </p>
      </div> -->
      <div>
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Equity
        </p>
        <p class="text-sm font-bold text-primary-text tabular-nums">
          {{ activeAccount.equity }}
        </p>
      </div>
      <div>
        <p
          class="text-[10px] uppercase tracking-widest text-secondary-text mb-1 font-semibold"
        >
          Credit
        </p>
        <p class="text-sm font-bold text-primary-text tabular-nums">
          {{ activeAccount.credit }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <template v-if="store.loading">
        <div
          v-for="n in 2"
          :key="n"
          class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2"
        >
          <div class="h-3 w-20 bg-background rounded" />
          <div class="h-6 w-28 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div
          class="bg-card-background border border-primary-border rounded-xl p-4"
        >
          <p
            class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
          >
            Total Volume
          </p>
          <p class="text-2xl font-medium text-primary-text">
            {{ formatNum(store.summary.total_lots) }}
          </p>
        </div>
        <div
          class="bg-card-background border border-primary-border rounded-xl p-4"
          v-if="store.side !== 'open'"
        >
          <p
            class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
          >
            Total Closed PnL
          </p>
          <p
            class="text-2xl font-medium"
            :class="
              store.summary.total_pnl >= 0 ? 'text-green-700' : 'text-red-700'
            "
          >
            {{ store.summary.total_pnl >= 0 ? "+" : ""
            }}{{ formatMoney(store.summary.total_pnl) }}
          </p>
        </div>
      </template>
    </div>

    <!-- Positions Tabs & Filters -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer"
          :class="
            store.side == null
              ? 'bg-primary-text text-background border-primary-text'
              : 'bg-card-background text-secondary-text border-primary-border hover:text-primary-text'
          "
          @click="handleSideChange(null)"
        >
          All
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer"
          :class="
            store.side === 'open'
              ? 'bg-primary-text text-background border-primary-text'
              : 'bg-card-background text-secondary-text border-primary-border hover:text-primary-text'
          "
          @click="handleSideChange('open')"
        >
          Open
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer"
          :class="
            store.side === 'closed'
              ? 'bg-primary-text text-background border-primary-text'
              : 'bg-card-background text-secondary-text border-primary-border hover:text-primary-text'
          "
          @click="handleSideChange('closed')"
        >
          Closed
        </button>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
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
          class="w-28 sm:w-32"
          @update:modelValue="store.updatePerPage"
        />
        <Tooltip text="Refresh" position="top">
          <button
            type="button"
            :disabled="store.loading"
            class="flex items-center justify-center w-8 h-8 rounded-lg border border-primary-border bg-card-background text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
            @click="handleRefresh"
          >
            <RefreshCw
              class="w-3.5 h-3.5"
              :class="{ 'animate-spin': store.loading }"
            />
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="store.data"
      :columns="tradeColumns"
      :pagination="store.pagination"
      :per-page-options="store.perPageOptions"
      :loading="store.loading"
      row-key="trade_id"
      table-key="account-trades-table"
      empty-title="No trades found"
      empty-text="Trades will appear here once executed"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <!-- Custom Cell: Trade ID -->
      <template #cell-trade_id="{ row }">
        <span class="text-xs font-medium text-primary-text">#{{ row.trade_id }}</span>
      </template>

      <!-- Custom Cell: Type badge -->
      <template #cell-type="{ row }">
        <span
          class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
          :class="
            row.type === 'BUY'
              ? 'bg-primary-green/10 text-green-800 border-primary-green/20'
              : 'bg-primary-red/10 text-red-800 border-primary-red/20'
          "
        >
          {{ row.type }}
        </span>
      </template>

      <!-- Custom Cell: Volume -->
      <template #cell-lot="{ row }">
        <span class="text-xs text-primary-text tabular-nums">{{ row.lot?.toFixed(2) }}</span>
      </template>

      <!-- Custom Cell: Entry Price -->
      <template #cell-entry_price="{ row }">
        <span class="text-xs text-primary-text tabular-nums">
          {{ row.entry_price != null ? Number(row.entry_price) : "—" }}
        </span>
      </template>

      <!-- Custom Cell: Exit Price -->
      <template #cell-exit_price="{ row }">
        <span class="text-xs text-primary-text tabular-nums">
          {{ row.exit_price != null ? formatNum(row.exit_price) : "—" }}
        </span>
      </template>

      <!-- Custom Cell: LTP -->
      <template #cell-ltp="{ row }">
        <span class="text-xs text-primary-text tabular-nums">{{ lastTickerPriceText(row) }}</span>
      </template>

      <!-- Custom Cell: PnL -->
      <template #cell-pnl="{ row }">
        <span
          class="text-xs tabular-nums font-medium"
          :class="pnlValue(row) >= 0 ? 'text-green-700' : 'text-red-700'"
        >
          {{ pnlValue(row) >= 0 ? "+" : "" }}{{ formatMoney(pnlValue(row)) }}
        </span>
      </template>

      <!-- Custom Cell: Status badge -->
      <template #cell-status="{ row }">
        <span
          class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
          :class="
            row.status === 'CLOSED'
              ? 'bg-background text-secondary-text border-primary-border'
              : 'bg-primary-blue/20 text-primary'
          "
        >
          {{ row.status }}
        </span>
      </template>

      <!-- Custom Cell: Closed At -->
      <template #cell-closed_at="{ row }">
        <span class="text-xs text-secondary-text whitespace-nowrap font-mono">
          {{ row.closed_at }}
        </span>
      </template>
      <!-- Custom Cell: Created At -->
      <template #cell-created_at="{ row }">
        <span class="text-xs text-secondary-text whitespace-nowrap font-mono">
          {{ row.created_at }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { RefreshCw } from "lucide-vue-next";
import { useAccountTradesStore } from "@/stores/tradingAccounts/accountsTrades";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import { livePNL } from "@/utils/livePNL";
import { useTickerStore } from "@/stores/ws/ticker";
import moment from "moment-timezone";

const activeCurrency = ref(localStorage.getItem("active_currency") || "USD");
const store = useAccountTradesStore();
const route = useRoute();
const accountId = route.params.id;
const tickerStore = useTickerStore();

const tradeColumns = [
  { key: 'trade_id', label: 'Trade ID' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'type', label: 'Type' },
  { key: 'lot', label: 'Volume' },
  { key: 'entry_price', label: 'Entry' },
  { key: 'exit_price', label: 'Exit' },
  { key: 'ltp', label: 'LTP' },
  { key: 'pnl', label: 'PnL' },
  { key: 'status', label: 'Status' },
  { key: 'closed_at', label: 'Closed' },
  { key: 'created_at', label: 'Created', align: 'right' },
];

const dateRangeValue = computed({
  get() {
    if (store.from_date || store.to_date) {
      return {
        start: store.from_date || null,
        end: store.to_date || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      store.setDateRange("", "");
    } else if (Array.isArray(val)) {
      store.setDateRange(val[0] || "", val[1] || "");
    } else if (typeof val === "object") {
      store.setDateRange(val.start || val.from || "", val.end || val.to || "");
    }
  },
});

const hasActiveDateFilter = computed(
  () => !!store.from_date || !!store.to_date
);

const clearDateFilter = () => {
  store.setDateRange("", "");
};

const isOpenTrade = (trade) =>
  String(trade?.status ?? "").toUpperCase() === "OPEN";
const pnlValue = (trade) => {
  const raw = isOpenTrade(trade) ? livePNL(trade) : trade?.pnl;
  const val = Number(raw);
  return Number.isFinite(val) ? val : 0;
};
const activeAccount = JSON.parse(localStorage.getItem("active_account"));
const currencyDisplay = computed(
  () => activeAccount?.broker_currency || activeAccount?.currency || activeCurrency.value || "USD"
);

const lastTickerPriceText = (trade) => {
  const quote = tickerStore?.getLastPrice?.(trade?.symbol);
  if (quote == null) return "—";

  if (typeof quote === "number")
    return Number.isFinite(quote) ? formatNum(quote) : "—";

  const side = String(trade?.type ?? "").toUpperCase();
  const raw = side === "BUY" ? quote?.bid : quote?.ask;
  const val = Number(raw);
  return Number.isFinite(val) ? formatNum(val) : "—";
};

const handlePageChange = (page) => {
  store.setPage(page);
};

const handlePerPageChange = (payload) => {
  const perPage = typeof payload === "object" && payload !== null ? (payload.per_page ?? payload.value) : payload;
  store.updatePerPage(perPage);
};

const handleRefresh = () => {
  store.fetchTrades(accountId, store.side, store.from_date, store.to_date);
};

const handleSideChange = (side) => {
  store.setSide(side);
};

const formatNum = (val) =>
  (val ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });
const formatMoney = (amount) => {
  const num = formatNum(amount);
  return activeCurrency.value === "USC" ? `USC ${num}` : `$${num}`;
};
const formatDate = (val) => {
  if (!val) return "—";
  try {
    const m = moment.utc(val);
    if (!m.isValid()) return String(val);
    const tz = moment.tz.guess();
    return m.tz(tz).format("DD MMM YYYY, hh:mm:ss A");
  } catch {
    return String(val);
  }
};

onMounted(() => store.fetchTrades(accountId, store.side));
</script>
