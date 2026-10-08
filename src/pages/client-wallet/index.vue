<template>
  <div class="px-4">
    <!-- Tabs -->
    <div
      class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit mb-6"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer"
        :class="
          activeTab === tab.value
            ? 'bg-primary text-white'
            : 'text-secondary-text hover:text-primary-text'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'transactions'">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <template v-if="store.loading">
          <div
            v-for="n in 4"
            :key="n"
            class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2"
          >
            <div class="h-3 w-24 bg-background rounded" />
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
              Total Deposit
            </p>
            <p class="text-xl font-medium text-green-700">
              +${{ formatNum(store.summary.total_deposit) }}
            </p>
          </div>
          <div
            class="bg-card-background border border-primary-border rounded-xl p-4"
          >
            <p
              class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
            >
              Total Withdrawal
            </p>
            <p class="text-xl font-medium text-red-700">
              -${{ formatNum(store.summary.total_withdrawal) }}
            </p>
          </div>
          <div
            class="bg-card-background border border-primary-border rounded-xl p-4"
          >
            <p
              class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
            >
              Trade PnL
            </p>
            <p
              class="text-xl font-medium"
              :class="
                store.summary.total_pnl >= 0 ? 'text-green-700' : 'text-red-700'
              "
            >
              {{ store.summary.total_pnl >= 0 ? "+" : "" }}${{
                formatNum(store.summary.total_pnl)
              }}
            </p>
          </div>
          <div
            class="bg-card-background border border-primary-border rounded-xl p-4"
          >
            <p
              class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
            >
              Fee Paid
            </p>
            <p class="text-xl font-medium text-primary-text">
              ${{ formatNum(store.summary.total_fee_paid) }}
            </p>
          </div>
        </template>
      </div>

      <!-- Filters -->
      <div
        class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5"
      >
        <div
          class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap"
        >
          <!-- Client Filter -->
          <BaseSelect
            v-model="filters.client_id"
            :options="clientOptions"
            :isLoading="isSearchingClients"
            placeholder="All Clients"
            searchable
            class="w-full sm:w-40 xl:w-40"
            @update:modelValue="applyFilters"
            @search="onClientSearch"
          />

          <!-- Account Filter -->
          <BaseSelect
            v-model="filters.account_id"
            :options="accountOptions"
            :isLoading="isSearchingAccounts"
            placeholder="All Accounts"
            searchable
            class="w-full sm:w-44 xl:w-44"
            @update:modelValue="applyFilters"
            @search="onAccountSearch"
          />

          <!-- Type Filter -->
          <BaseSelect
            v-model="filters.type"
            :options="typeOptions"
            placeholder="All Types"
            class="w-full sm:w-36 xl:w-36"
            @update:modelValue="applyFilters"
          />

          <!-- Date range -->
          <BaseDatePicker
            v-model="dateRangeValue"
            :range="true"
            placeholder="Filter by date range..."
            class="w-full sm:w-54 xl:w-54"
          />

          <BaseSelect
            :modelValue="store.pagination.per_page"
            :options="store.perPageOptions"
            placeholder="Per Page"
            class="sm:w-18 xl:w-18"
            @update:modelValue="store.updatePerPage"
          />

          <!-- Clear -->
          <button
            v-if="hasFilters"
            class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
            @click="clearFilters"
          >
            Clear
          </button>

          <!-- Reload -->
          <button
            class="rounded-lg p-2 text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none flex items-center justify-center border border-primary-border hover:border-primary-border"
            @click="refresh"
            title="Refresh"
            :disabled="store.loading"
          >
            <RefreshCw
              class="w-3.5 h-3.5"
              :class="{ 'animate-spin': store.loading }"
            />
          </button>
        </div>
      </div>

      <!-- DataTable -->
      <DataTable
        :data="store.data"
        :columns="walletColumns"
        :pagination="store.pagination"
        :loading="store.loading"
        :per-page-options="[10, 25, 50, 100]"
        row-key="payment_id"
        table-key="client-wallet-transactions-table"
        empty-title="No ledger entries found"
        empty-text="Try adjusting your filters or date range."
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- Cell: ID / Reference -->
        <template #cell-payment_id="{ row }">
          <p class="text-xs font-semibold text-primary-text">
            #{{ row.payment_id }}
          </p>
          <p
            v-if="row.txid"
            class="text-[10px] text-secondary-text font-mono truncate max-w-40"
            :title="row.txid"
          >
            TXID: {{ row.txid }}
          </p>
          <p
            v-else-if="row.external_payment_id"
            class="text-[10px] text-secondary-text truncate max-w-40"
          >
            Ext: {{ row.external_payment_id }}
          </p>
        </template>

        <!-- Cell: Trading Account -->
        <template #cell-trading_account="{ row }">
          <p class="text-xs font-medium text-primary-text">
            <span
              @click.stop="goToTradingAccount(row.account_number)"
              class="cursor-pointer hover:text-primary transition-colors hover:underline"
            >
              {{ row.account_number }} · {{ row.broker_label || "—" }}
            </span>
          </p>
          <p class="text-[10px] text-secondary-text">
            Client: {{ row.client_name }}
          </p>
        </template>

        <!-- Cell: Payment Method -->
        <template #cell-method="{ row }">
          <p class="text-xs font-medium text-primary-text capitalize">
            {{ row.method ?? "—" }}
          </p>
          <p class="text-[10px] text-secondary-text capitalize">
            via {{ row.gateway ?? "—" }}
          </p>
        </template>

        <!-- Cell: Amount -->
        <template #cell-amount="{ row }">
          <span
            class="text-xs font-medium tabular-nums"
            :class="amountClass(row.type, row.amount)"
          >
            {{ row.type === "deposit" ? "+" : "-"
            }}{{ formatMoney(row.amount, row.broker_currency) }}
          </span>
        </template>

        <!-- Cell: Date -->
        <template #cell-created_at="{ row }">
          <span class="text-xs text-secondary-text whitespace-nowrap">{{
            formatDate(row.created_at)
          }}</span>
        </template>
      </DataTable>
    </div>

    <div v-else>
      <InternalTransfers />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { BookOpen, RefreshCw } from "lucide-vue-next";
import { useClientLedgerStore } from "@/stores/clientLedger/clientLedger";
import Pagination from "@/components/common/Pagination.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import InternalTransfers from "./InternalTransfers.vue";
import { useGoToTradingAccount } from "@/composables/useGoToTradingAccount";
import { formatDate } from "@/utils/timeFormatter";

const activeTab = ref("transactions");
const tabs = [
  { label: "Account Transactions", value: "transactions" },
  { label: "Internal Transfers", value: "transfers" },
];

const store = useClientLedgerStore();
const { goToTradingAccount } = useGoToTradingAccount();

const filters = ref({
  client_id: null,
  account_id: null,
  type: null,
  from_date: "",
  to_date: "",
});
const clientOptions = ref([]);
const accountOptions = ref([]);
const isSearchingClients = ref(false);
const isSearchingAccounts = ref(false);
let clientSearchTimer = null;
let accountSearchTimer = null;

const typeOptions = computed(() =>
  (store.filterOptions.types ?? []).map((t) => ({
    label: formatType(t),
    value: t,
  })),
);

const onClientSearch = (query) => {
  if (!query.trim()) {
    clientOptions.value = (store.filterOptions.clients ?? []).map((c) => ({
      label: c.name,
      value: c.id,
    }));
    return;
  }

  clearTimeout(clientSearchTimer);
  isSearchingClients.value = true;

  clientSearchTimer = setTimeout(async () => {
    try {
      const results = await store.fetchAllClients(query);
      clientOptions.value = results;
    } catch (err) {
      clientOptions.value = [];
    } finally {
      isSearchingClients.value = false;
    }
  }, 300);
};

const onAccountSearch = (query) => {
  if (!query.trim()) {
    accountOptions.value = (store.filterOptions.accounts ?? []).map((a) => ({
      label: `#${a.account_number} · ${a.broker_label ?? ""}`.trim(),
      value: a.id,
    }));
    return;
  }

  clearTimeout(accountSearchTimer);
  isSearchingAccounts.value = true;

  accountSearchTimer = setTimeout(async () => {
    try {
      const results = await store.fetchAllAccounts(
        query,
        filters.value.client_id,
      );
      accountOptions.value = results;
    } catch (err) {
      accountOptions.value = [];
    } finally {
      isSearchingAccounts.value = false;
    }
  }, 300);
};

onMounted(() => {
  clientOptions.value = (store.filterOptions.clients ?? []).map((c) => ({
    label: c.name,
    value: c.id,
  }));
  accountOptions.value = (store.filterOptions.accounts ?? []).map((a) => ({
    label: `#${a.account_number} · ${a.broker_label ?? ""}`.trim(),
    value: a.id,
  }));
  // Initialize local filters from store to maintain state
  filters.value = { ...store.filters };
  store.fetchLedger();
});

const dateRangeValue = computed({
  get() {
    if (filters.value.from_date || filters.value.to_date) {
      return {
        start: filters.value.from_date || null,
        end: filters.value.to_date || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      filters.value.from_date = "";
      filters.value.to_date = "";
    } else if (Array.isArray(val)) {
      filters.value.from_date = val[0] || "";
      filters.value.to_date = val[1] || "";
    } else if (typeof val === "object") {
      filters.value.from_date = val.start || val.from || "";
      filters.value.to_date = val.end || val.to || "";
    }
    applyDateFilters();
  },
});

const hasFilters = computed(
  () =>
    filters.value.client_id ||
    filters.value.account_id ||
    filters.value.type ||
    filters.value.from_date ||
    filters.value.to_date,
);

const hasCompleteDateRange = () =>
  filters.value.from_date && filters.value.to_date;
const hasEmptyDateRange = () =>
  !filters.value.from_date && !filters.value.to_date;

const getApplicableFilters = () => {
  const nextFilters = { ...filters.value };

  if (!hasCompleteDateRange()) {
    nextFilters.from_date = "";
    nextFilters.to_date = "";
  }

  return nextFilters;
};

const applyFilters = () => {
  Object.assign(store.filters, getApplicableFilters());
  store.applyFilters();
};

const applyDateFilters = () => {
  if (hasCompleteDateRange() || hasEmptyDateRange()) {
    applyFilters();
  }
};

const clearFilters = () => {
  filters.value = {
    client_id: null,
    account_id: null,
    type: null,
    from_date: "",
    to_date: "",
  };
  applyFilters();
};

const refresh = () => {
  store.fetchLedger(true);
};

const handlePageChange = (page) => {
  store.setPage(page);
};

const handlePerPageChange = ({ per_page }) => {
  store.updatePerPage(per_page);
};

const walletColumns = [
  {
    key: "payment_id",
    label: "ID / Reference",
    minWidth: 150,
    resizable: true,
  },
  {
    key: "trading_account",
    label: "Trading Account",
    minWidth: 180,
    resizable: true,
  },
  { key: "method", label: "Payment Method", minWidth: 140, resizable: true },
  {
    key: "type",
    label: "Type",
    type: "badge",
    minWidth: 110,
    resizable: true,
    badge: {
      map: {
        deposit: { label: "Deposit", variant: "success" },
        withdrawal: { label: "Withdrawal", variant: "danger" },
        trade_pnl: { label: "Trade PnL", variant: "info" },
        fee_paid: { label: "Fee Paid", variant: "warning" },
      },
    },
  },
  { key: "amount", label: "Amount", minWidth: 140, resizable: true },
  {
    key: "approval_status",
    label: "Status",
    type: "badge",
    minWidth: 120,
    resizable: true,
    // formatter: (val, row) => row.approval_status ?? row.payment_status ?? val ?? '—',
    badge: {
      map: {
        approved: { label: "Approved", variant: "success" },
        completed: { label: "Completed", variant: "success" },
        paid: { label: "Paid", variant: "success" },
        success: { label: "Success", variant: "success" },
        pending: { label: "Pending", variant: "warning" },
        processing: { label: "Processing", variant: "warning" },
        rejected: { label: "Rejected", variant: "danger" },
        failed: { label: "Failed", variant: "danger" },
      },
    },
  },
  {
    key: "created_at",
    label: "Date",
    align: "right",
    minWidth: 130,
    resizable: true,
  },
];

const formatNum = (val) =>
  (val ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formatType = (t) =>
  t?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—";

const typeClass = (type) =>
  ({
    deposit: "bg-primary-green/10 text-primary-green border-primary-green/20",
    withdrawal: "bg-primary-red/10 text-primary-red border-primary-red/20",
    trade_pnl: "bg-primary-blue/10 text-primary-blue border-primary-blue/20",
    fee_paid: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  })[type] ?? "bg-background text-secondary-text border-primary-border";

const amountClass = (type, amount) => {
  if (type === "deposit") return "text-green-700";
  if (type === "withdrawal") return "text-red-700";
  if (type === "trade_pnl")
    return amount >= 0 ? "text-green-700" : "text-red-700";
  return "text-secondary-text";
};

const statusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "success":
    case "approved":
    case "completed":
      return "bg-primary-green/10 text-primary-green border-primary-green/20";
    case "failed":
    case "rejected":
      return "bg-primary-red/10 text-primary-red border-primary-red/20";
    case "pending":
    case "processing":
      return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
    default:
      return "bg-background text-secondary-text border-primary-border";
  }
};

const formatMoney = (amount, currency) => {
  if (!currency) return `$${formatNum(amount)}`;
  return /^[A-Z]{3}$/.test(currency)
    ? `${currency} ${formatNum(amount)}`
    : `${currency}${formatNum(amount)}`;
};
</script>
