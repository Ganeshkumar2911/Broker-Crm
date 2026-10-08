<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  BarChart2,
  RotateCcwKey,
  Search,
  X,
  Wallet as WalletIcon,
  DollarSign,
  ArrowDownUp,
  RefreshCw,
  Plus,
  Pencil,
  Power,
  Layers,
  SlidersHorizontal,
} from "lucide-vue-next";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import ChangePasswordDialog from "@/components/trading-accounts/ChangePasswordDialog.vue";
import DepositWithdrawalDialog from "@/components/trading-accounts/DepositWithdrawal.vue";
import AddEditAccount from "@/components/trading-accounts/AddEditAccount.vue";
import ToggleTradingDialog from "@/components/trading-accounts/ToggleTradingDialog.vue";
import ChangeTradingGroupDrawer from "@/components/trading-accounts/ChangeTradingGroupDrawer.vue";
import ManageTransactionsDialog from "@/components/common/ManageTransactionsDialog.vue";
import { useAccountsStore } from "@/stores/tradingAccounts/tradingAccounts";
import { useClientListStore } from "@/stores/clientList/clientList";
import { useProfileStore } from "@/stores/profile/profile";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const store = useAccountsStore();
const profile = useProfileStore();
const router = useRouter();
const route = useRoute();
const { hasPermission } = usePermissionCheck();

const goToClientSearch = (row) => {
  const searchTerm = row.user?.email || row.client_name;
  if (searchTerm) {
    const clientStore = useClientListStore();
    clientStore.filters.search = searchTerm;
    clientStore.applyFilters();
    router.push('/clients');
  }
};

const tabs = [
  { label: "All", value: "all" },
  // { label: 'Client', value: 'client' },
  { label: "FM", value: "fm" },
];

const tradingTypeFilters = [
  { label: "All", value: "all" },
  { label: "MT5", value: "real" },
  { label: "Copy Trading", value: "copy_trading" },
];

const accountTypeFilters = [
  { label: "All", value: "all" },
  { label: "Demo", value: "demo" },
  { label: "Live", value: "live" },
];

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const changePasswordDialog = ref({
  open: false,
  account: null,
});

const depositWithdrawalDialog = ref({
  open: false,
  account: null,
  mode: "deposit", // 'deposit' or 'withdrawal'
});

const addEditAccountDialog = ref({
  open: false,
  editData: null,
});

const toggleTradingDialog = ref({
  open: false,
  account: null,
});

const changeGroupDrawer = ref({
  open: false,
  account: null,
});

const manageTransactionsDialog = ref({
  open: false,
  account: null,
});

const openAddAccount = () => {
  addEditAccountDialog.value = {
    open: true,
    editData: null,
  };
};

const openEditAccount = (acc) => {
  addEditAccountDialog.value = {
    open: true,
    editData: acc,
  };
};

const closeAddEditAccount = () => {
  addEditAccountDialog.value = {
    open: false,
    editData: null,
  };
};

let searchTimer = null;

const isRefreshing = ref(false);

const refreshAccounts = async () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    await store.fetchAccounts();
  } finally {
    isRefreshing.value = false;
  }
};

const isFm = computed(() => profile.user?.role === "fm");
const activeTab = computed(() => store.filters.account_type ?? "all");
const activeTradingType = computed(() => store.filters.trading_type ?? "all");
const activeAccountType = computed(
  () => store.filters.account_subtype ?? "all",
);
const hasActiveFilters = computed(
  () =>
    activeTab.value !== "all" ||
    activeTradingType.value !== "all" ||
    activeAccountType.value !== "all" ||
    (store.filters.is_active !== "all" &&
      store.filters.is_active !== null &&
      store.filters.is_active !== undefined) ||
    Boolean(store.filters.search_query?.trim()),
);

const emptyStateTitle = computed(() =>
  hasActiveFilters.value
    ? "No accounts match the selected filters"
    : "No trading accounts yet",
);

const emptyStateDescription = computed(() =>
  hasActiveFilters.value
    ? "Try a different account type, trading type, or account subtype."
    : "Trading accounts will appear here once they are added.",
);

const getAccountId = (acc) => acc?.id ?? acc?.account_id ?? null;

const switchTab = (val) => {
  if (activeTab.value === val) return;
  store.setType(val);
};

const handlePageChange = (page) => {
  store.setPage(page);
};

const handlePerPageChange = (val) => {
  const perPage = typeof val === "object" ? val.per_page : val;
  store.updatePerPage(perPage);
};

const accountColumns = [
  { key: "account", label: "Account", sortable: true, sortKey: "account_number", minWidth: 140 },
  { key: "client", label: "Client", sortable: true, sortKey: "client_name", minWidth: 160 },
  { key: "entity_type", label: "Entity", sortable: true, minWidth: 110 },
  { key: "trading_type", label: "Trading", sortable: true, minWidth: 110 },
  { key: "account_type", label: "Type", sortable: true, minWidth: 110 },
  { key: "account_role", label: "Role", sortable: true, minWidth: 100 },
  { key: "account_category", label: "Acc. Category", sortable: true, minWidth: 130 },
  { key: "broker", label: "Broker", sortable: true, sortKey: "broker_label", minWidth: 150 },
  { key: "server", label: "Server", sortable: true, minWidth: 120 },
  { key: "currency", label: "Currency", sortable: true, sortKey: "broker_currency", minWidth: 100 },
  { key: "leverage", label: "Leverage", sortable: true, sortKey: "broker_leverage", minWidth: 100 },
  { key: "balance", label: "Balance", align: "right", sortable: true, minWidth: 120 },
  { key: "equity", label: "Equity", align: "right", sortable: true, minWidth: 120 },
  { key: "credit", label: "Credit", align: "right", sortable: true, minWidth: 110 },
  { key: "status", label: "Status", align: "center", sortable: true, sortKey: "is_active", minWidth: 100 },
  { key: "created_at", label: "Created", sortable: true, minWidth: 130 },
];

const setTradingType = (type) => {
  const nextFilters = {
    trading_type: type,
  };
  // Reset account_subtype when trading_type is 'all'
  if (type === "all") {
    nextFilters.account_subtype = "all";
  }
  store.setFilters(nextFilters);
};

const setAccountType = (type) => {
  store.setFilters({
    account_subtype: type,
  });
};

const onSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    store.setFilters({
      search_query: store.filters.search_query,
    });
  }, 1000);
};

const clearAllFilters = () => {
  store.setFilters({
    account_type: "all",
    trading_type: "all",
    account_subtype: "all",
    is_active: "all",
    search_query: "",
  });
};

const openChangePassword = (acc) => {
  if (acc?.trading_type !== "real") return;

  changePasswordDialog.value = {
    open: true,
    account: {
      ...acc,
      id: getAccountId(acc),
    },
  };
};

const closeChangePassword = () => {
  changePasswordDialog.value = {
    open: false,
    account: null,
  };
};

const confirmChangePassword = () => {
  closeChangePassword();
};

const openDepositWithdrawalDialog = (acc, mode) => {
  depositWithdrawalDialog.value = {
    open: true,
    account: { ...acc, id: getAccountId(acc) },
    mode: mode,
  };
};

const closeDepositWithdrawalDialog = () => {
  depositWithdrawalDialog.value = {
    open: false,
    account: null,
    mode: "deposit",
  };
};

const openToggleTrading = (acc) => {
  if (!hasPermission("trading_account.update")) return;
  if (
    acc?.account_type === "copy_trading" ||
    acc?.trading_type === "copy_trading"
  )
    return;
  toggleTradingDialog.value = {
    open: true,
    account: acc,
  };
};

const closeToggleTrading = () => {
  toggleTradingDialog.value = {
    open: false,
    account: null,
  };
};

const openChangeGroup = (acc) => {
  changeGroupDrawer.value = {
    open: true,
    account: acc,
  };
};

const closeChangeGroup = () => {
  changeGroupDrawer.value = {
    open: false,
    account: null,
  };
};

const openManageTransactions = (acc) => {
  manageTransactionsDialog.value = {
    open: true,
    account: acc,
  };
};

const closeManageTransactions = () => {
  manageTransactionsDialog.value = {
    open: false,
    account: null,
  };
};

const formatNum = (val) =>
  Number(val ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatLabel = (val) => {
  if (!val) return "—";

  return String(val).replace(/_/g, " ");
};

const formatMoney = (amount, currency) => {
  if (!currency) return `$${formatNum(amount)}`;

  return /^[A-Z]{3}$/.test(currency)
    ? `${currency} ${formatNum(amount)}`
    : `${currency}${formatNum(amount)}`;
};

const formatDate = (val) => {
  if (!val) return "—";

  return new Date(val).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const setActiveCurrency = (acc) => {
  const currency = acc?.broker_currency ?? acc?.currency;
  if (!currency) return;

  try {
    localStorage.setItem("active_currency", currency);
  } catch (e) {
    // ignore storage failures
  }
};

const setActiveAccount = (acc) => {
  try {
    localStorage.setItem("active_account", JSON.stringify(acc));

    const currency = acc?.broker_currency ?? acc?.currency;

    if (currency) {
      localStorage.setItem("active_currency", currency);
    }
  } catch (err) {
    console.error(err);
  }
};

function getRowActions(acc) {
  const actions = [];

  if (hasPermission("trading_account.view")) {
    actions.push(
      { action: "trades", label: "View Trades", icon: BarChart2 },
      { action: "transactions", label: "View Transactions", icon: WalletIcon },
    );
  }

  if (hasPermission("trading_account.update")) {
    if (actions.length > 0) {
      actions.push({ divider: true });
    }
    actions.push(
      { action: "deposit", label: "Deposit", icon: DollarSign },
      { action: "withdraw", label: "Withdraw", icon: ArrowDownUp },
      {
        action: "manageRestrictions",
        label: "Manage Restrictions",
        icon: SlidersHorizontal,
      },
      {
        action: "changePassword",
        label: "Change Password",
        icon: RotateCcwKey,
        hidden: acc.trading_type !== "real",
      },
      {
        action: "editAccount",
        label: "Edit Account",
        icon: Pencil,
        hidden: acc.trading_type !== "copy_trading",
      },
      {
        action: "toggleTrading",
        label: acc.is_active ? "Disable Trading" : "Enable Trading",
        icon: Power,
        danger: acc.is_active,
        success: !acc.is_active,
        hidden:
          acc.trading_type === "copy_trading" ||
          acc.account_type === "copy_trading",
      },
      {
        action: "changeGroup",
        label: "Change Trading Group",
        icon: Layers,
        hidden:
          acc.trading_type === "copy_trading" ||
          acc.account_type === "copy_trading",
      },
    );
  }

  return actions;
}

function onMenuSelect(item, acc) {
  switch (item.action) {
    case "trades":
      setActiveAccount(acc);
      router.push(`/account/trade/${getAccountId(acc)}`);
      break;
    case "transactions":
      setActiveAccount(acc);
      router.push(`/account/transactions/${getAccountId(acc)}`);
      break;
    case "deposit":
      setActiveCurrency(acc);
      openDepositWithdrawalDialog(acc, "deposit");
      break;
    case "withdraw":
      setActiveCurrency(acc);
      openDepositWithdrawalDialog(acc, "withdrawal");
      break;
    case "manageRestrictions":
      setActiveCurrency(acc);
      openManageTransactions(acc);
      break;
    case "changePassword":
      setActiveCurrency(acc);
      openChangePassword(acc);
      break;
    case "editAccount":
      setActiveCurrency(acc);
      openEditAccount(acc);
      break;
    case "toggleTrading":
      setActiveCurrency(acc);
      openToggleTrading(acc);
      break;
    case "changeGroup":
      setActiveCurrency(acc);
      openChangeGroup(acc);
      break;
  }
}

onMounted(() => {
  if (!profile.user) {
    profile.fetchUserProfile();
  }

  const querySearch =
    route.query.search || route.query.search_query || route.query.email;
  if (querySearch) {
    store.setFilters({
      search_query: String(querySearch).trim(),
    });
  } else {
    store.fetchAccounts();
  }
});

watch(
  () => route.query.search || route.query.search_query || route.query.email,
  (newSearch) => {
    if (newSearch && newSearch !== store.filters.search_query) {
      store.setFilters({
        search_query: String(newSearch).trim(),
      });
    }
  },
);

onBeforeUnmount(() => clearTimeout(searchTimer));
</script>

<template>
  <div class="px-4 pb-8">
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-end gap-3 mb-6">
      <button
        v-if="hasPermission('trading_account.create')"
        class="btn-primary"
        @click="openAddAccount"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Account
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <template v-if="store.loading">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-2"
        >
          <div class="h-3 w-24 bg-background rounded" />
          <div class="h-6 w-32 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div
          class="bg-card-background border border-primary-border rounded-xl p-4"
        >
          <p
            class="text-[11px] uppercase tracking-wide text-secondary-text mb-1"
          >
            Total Accounts
          </p>
          <p class="text-2xl font-medium text-primary-text">
            {{ store.summary.total_accounts ?? 0 }}
          </p>
        </div>
        <!-- <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Balance</p>
          <p class="text-2xl font-medium text-primary-text">${{ formatNum(store.summary.total_balance) }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total PnL</p>
          <p class="text-2xl font-medium" :class="store.summary.total_pnl >= 0 ? 'text-green-700' : 'text-red-700'">
            {{ store.summary.total_pnl >= 0 ? '+' : '' }}${{ formatNum(store.summary.total_pnl) }}
          </p>
        </div> -->
      </template>
    </div>
    <!-- Filters -->
    <div
      class="mb-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3"
    >
      <!-- Tabs Container (Scrollable) -->
      <div
        class="flex items-center gap-3 flex-nowrap whitespace-nowrap overflow-x-auto no-scrollbar py-0.5"
      >
        <div
          class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit flex-nowrap whitespace-nowrap"
        >
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
            :class="
              activeTab === tab.value
                ? 'bg-primary text-white'
                : 'text-secondary-text hover:text-primary-text'
            "
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div
          v-if="!isFm"
          class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit flex-nowrap whitespace-nowrap"
        >
          <button
            v-for="filter in tradingTypeFilters"
            :key="filter.value"
            type="button"
            class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
            :class="
              activeTradingType === filter.value
                ? 'bg-primary text-white'
                : 'text-secondary-text hover:text-primary-text'
            "
            @click="setTradingType(filter.value)"
          >
            {{ filter.label }}
          </button>
        </div>

        <div
          v-if="!isFm && activeTradingType === 'real'"
          class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit flex-nowrap whitespace-nowrap"
        >
          <button
            v-for="filter in accountTypeFilters"
            :key="filter.value"
            type="button"
            class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
            :class="
              activeAccountType === filter.value
                ? 'bg-primary text-white'
                : 'text-secondary-text hover:text-primary-text'
            "
            @click="setAccountType(filter.value)"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Controls Container (Unclipped, so BaseSelect dropdown displays properly) -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="relative min-w-50 flex-1 sm:flex-none">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text"
          />
          <input
            v-model="store.filters.search_query"
            type="text"
            placeholder="Search accounts..."
            class="w-full bg-card-background border border-primary-border rounded-lg pl-9 pr-3 py-2 text-xs text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-primary"
            @input="onSearch"
          />
        </div>

        <BaseSelect
          :modelValue="store.filters.is_active"
          :options="statusOptions"
          placeholder="Status"
          class="w-32 sm:w-36"
          @update:modelValue="(val) => store.setFilters({ is_active: val })"
        />

        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per page..."
          class="w-28 sm:w-32"
          @update:modelValue="store.updatePerPage"
        />

        <Tooltip v-if="hasActiveFilters" text="Clear filters" position="left">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background cursor-pointer"
            @click="clearAllFilters"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </Tooltip>

        <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="isRefreshing || store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="refreshAccounts"
          >
            <span
              v-if="isRefreshing"
              class="inline-flex items-center justify-center"
            >
              <span
                class="w-3.5 h-3.5 border-2 border-secondary-text border-t-transparent rounded-full animate-spin"
              />
            </span>
            <RefreshCw
              v-else
              class="h-3.5 w-3.5"
              :class="store.loading ? 'animate-spin' : ''"
            />
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      :data="store.data"
      :columns="accountColumns"
      :pagination="store.pagination"
      :loading="store.loading"
      :actions="getRowActions"
      :per-page-options="[10, 25, 50, 100]"
      row-key="id"
      table-key="trading-accounts-table"
      :empty-title="emptyStateTitle"
      :empty-text="emptyStateDescription"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
      @action="({ action, item, row }) => onMenuSelect(item || { action }, row)"
    >
      <!-- Custom Cell: Account -->
      <template #cell-account="{ row }">
        <span class="text-sm font-medium text-primary-text tabular-nums">
          #{{ row.account_number ?? "—" }}
        </span>
        <p class="mt-1 text-[11px] text-secondary-text tabular-nums">
          ID {{ getAccountId(row) ?? "—" }}
        </p>
      </template>

      <!-- Custom Cell: Client -->
      <template #cell-client="{ row }">
        <div class="cursor-pointer group" @click="goToClientSearch(row)">
          <p class="text-xs font-medium text-primary-text group-hover:text-primary group-hover:underline whitespace-nowrap transition-colors">
            {{ row.client_name ?? row.user?.name ?? "—" }}
          </p>
          <p class="mt-1 text-[11px] text-secondary-text group-hover:text-primary/80 whitespace-nowrap transition-colors">
            {{ row.user?.email ?? "—" }}
          </p>
        </div>
      </template>

      <!-- Custom Cell: Entity -->
      <template #cell-entity_type="{ row }">
        <span
          class="text-[11px] font-medium px-2 py-1 rounded-full bg-card-background text-secondary-text capitalize whitespace-nowrap"
        >
          {{ formatLabel(row.entity_type) }}
        </span>
      </template>

      <!-- Custom Cell: Trading -->
      <template #cell-trading_type="{ row }">
        <span
          class="text-[11px] font-medium px-2 py-1 rounded-full bg-card-background text-secondary-text capitalize whitespace-nowrap"
        >
          {{ formatLabel(row.trading_type) }}
        </span>
      </template>

      <!-- Custom Cell: Type -->
      <template #cell-account_type="{ row }">
        <span
          class="text-[11px] font-medium px-2 py-1 rounded-full bg-card-background text-secondary-text capitalize whitespace-nowrap"
        >
          {{ formatLabel(row.account_type) }}
        </span>
      </template>

      <!-- Custom Cell: Role -->
      <template #cell-account_role="{ row }">
        <span
          v-if="row.account_role"
          class="text-[11px] font-medium px-2 py-1 rounded-full border capitalize"
          :class="
            row.account_role === 'master'
              ? 'bg-primary-blue/40 text-primary'
              : 'bg-background text-secondary-text border-primary-border'
          "
        >
          {{ row.account_role }}
        </span>
        <span v-else class="text-xs text-secondary-text">—</span>
      </template>

      <!-- Custom Cell: Acc. Category -->
      <template #cell-account_category="{ row }">
        <span class="text-xs text-primary-text whitespace-nowrap">
          {{ row.account_category ?? "—" }}
        </span>
      </template>

      <!-- Custom Cell: Broker -->
      <template #cell-broker="{ row }">
        <p class="text-xs font-medium text-primary-text whitespace-nowrap">
          {{ row.broker_label ?? row.broker ?? "—" }}
        </p>
        <p class="mt-1 text-[11px] text-secondary-text whitespace-nowrap">
          {{ row.broker_group ?? row.broker ?? "—" }}
        </p>
      </template>

      <!-- Custom Cell: Server -->
      <template #cell-server="{ row }">
        <span class="text-xs text-primary-text whitespace-nowrap">
          {{ row.server ?? "—" }}
        </span>
      </template>

      <!-- Custom Cell: Currency -->
      <template #cell-currency="{ row }">
        <span class="text-xs text-primary-text whitespace-nowrap">
          {{ row.broker_currency ?? row.currency ?? "—" }}
        </span>
      </template>

      <!-- Custom Cell: Leverage -->
      <template #cell-leverage="{ row }">
        <span class="text-xs text-primary-text tabular-nums whitespace-nowrap">
          {{ row.broker_leverage ?? "—" }}
        </span>
      </template>

      <!-- Custom Cell: Balance -->
      <template #cell-balance="{ row }">
        <span class="text-xs text-primary-text tabular-nums whitespace-nowrap">
          {{ formatMoney(row.balance, row.broker_currency ?? row.currency) }}
        </span>
      </template>

      <!-- Custom Cell: Equity -->
      <template #cell-equity="{ row }">
        <span class="text-xs text-primary-text tabular-nums whitespace-nowrap">
          {{
            formatMoney(
              row.account_type === 'copy_trading' ||
                row.trading_type === 'copy_trading'
                ? row.balance
                : row.equity,
              row.broker_currency ?? row.currency
            )
          }}
        </span>
      </template>

      <!-- Custom Cell: Credit -->
      <template #cell-credit="{ row }">
        <span class="text-xs text-primary-text tabular-nums whitespace-nowrap">
          {{ formatMoney(row.credit, row.broker_currency ?? row.currency) }}
        </span>
      </template>

      <!-- Custom Cell: Status -->
      <template #cell-status="{ row }">
        <button
          type="button"
          class="text-[11px] font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap text-white transition-all flex items-center gap-1 mx-auto"
          :class="[
            row.is_active ? 'bg-primary-green' : 'bg-primary-red',
            hasPermission('trading_account.update') &&
            row.account_type !== 'copy_trading' &&
            row.trading_type !== 'copy_trading'
              ? 'hover:opacity-80 active:scale-95 cursor-pointer'
              : 'cursor-not-allowed opacity-80',
          ]"
          :disabled="
            !hasPermission('trading_account.update') ||
            row.account_type === 'copy_trading' ||
            row.trading_type === 'copy_trading'
          "
          @click.stop="openToggleTrading(row)"
        >
          {{ row.is_active ? "Active" : "Inactive" }}
        </button>
      </template>

      <!-- Custom Cell: Created -->
      <template #cell-created_at="{ row }">
        <span class="text-xs text-secondary-text whitespace-nowrap">
          {{ formatDate(row.created_at) }}
        </span>
      </template>

      <!-- Empty State -->
      <template #empty>
        <div class="flex flex-col items-center gap-3 py-16">
          <div
            class="w-14 h-14 rounded-full bg-card-background border border-primary-border flex items-center justify-center"
          >
            <WalletIcon class="w-6 h-6 text-secondary-text" />
          </div>
          <div>
            <h3 class="text-sm font-medium text-primary-text mb-1">
              {{ emptyStateTitle }}
            </h3>
            <p class="text-xs text-secondary-text">
              {{ emptyStateDescription }}
            </p>
          </div>
        </div>
      </template>
    </DataTable>

    <ChangePasswordDialog
      :open="changePasswordDialog.open"
      :account="changePasswordDialog.account"
      @close="closeChangePassword"
      @confirm="confirmChangePassword"
    />

    <DepositWithdrawalDialog
      :open="depositWithdrawalDialog.open"
      :account-data="depositWithdrawalDialog.account"
      :mode="depositWithdrawalDialog.mode"
      @close="closeDepositWithdrawalDialog"
      @success="store.fetchAccounts(true)"
    />

    <AddEditAccount
      :open="addEditAccountDialog.open"
      :edit-data="addEditAccountDialog.editData"
      @close="closeAddEditAccount"
    />

    <ToggleTradingDialog
      :open="toggleTradingDialog.open"
      :account="toggleTradingDialog.account"
      @close="closeToggleTrading"
      @success="store.fetchAccounts(true)"
    />

    <ChangeTradingGroupDrawer
      :open="changeGroupDrawer.open"
      :account="changeGroupDrawer.account"
      @close="closeChangeGroup"
      @updated="store.fetchAccounts()"
    />

    <ManageTransactionsDialog
      :open="manageTransactionsDialog.open"
      :account="manageTransactionsDialog.account"
      @close="closeManageTransactions"
      @success="store.fetchAccounts(true)"
    />
  </div>
</template>
