<template>
  <div class="space-y-4">
    <!-- Filter and Search Header -->
    <div class="bg-card-background border border-primary-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- Transaction Type Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          v-for="type in typeFilters"
          :key="type.value"
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
          :class="selectedType === type.value
            ? 'bg-primary text-white shadow-xs'
            : 'bg-background text-secondary-text hover:text-primary-text border border-primary-border'"
          @click="selectType(type.value)"
        >
          {{ type.label }}
        </button>
      </div>

      <!-- Search and Filter inputs -->
      <div class="flex items-center gap-2.5">
        <div class="relative w-44 sm:w-56">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="User or Account ID..."
            class="input-field pl-8 pr-3 py-1.5 text-xs w-full"
            @keyup.enter="applyFilters"
          />
          <HugeIcon
            :icon="Search01Icon"
            :size="14"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-text"
          />
        </div>

        <button
          type="button"
          class="px-3 py-1.5 bg-background border border-primary-border rounded-lg text-xs font-medium text-primary-text hover:bg-card-background transition cursor-pointer flex items-center gap-1.5"
          @click="applyFilters"
        >
          <HugeIcon :icon="FilterIcon" :size="14" />
          Filter
        </button>

        <button
          v-if="searchQuery || selectedType"
          type="button"
          class="px-2.5 py-1.5 bg-background border border-primary-border rounded-lg text-xs text-secondary-text hover:text-primary-red transition cursor-pointer"
          title="Reset Filters"
          @click="resetFilters"
        >
          <HugeIcon :icon="RefreshIcon" :size="14" />
        </button>
      </div>
    </div>

    <!-- Transactions Data Table -->
    <div class="bg-card-background border border-primary-border rounded-xl">
      <DataTable
        :columns="columns"
        :data="store.transactions"
        :loading="store.loading"
        :pagination="store.transactionsPagination"
        @page-change="handlePageChange"
      >
        <!-- Tx ID -->
        <template #cell-id="{ row }">
          <span class="font-mono text-xs font-semibold text-primary-text">#{{ row.id }}</span>
        </template>

        <!-- User -->
        <template #cell-user="{ row }">
          <div class="flex flex-col min-w-36">
            <span class="text-xs font-semibold text-primary-text leading-tight truncate">
              {{ row.user_name || row.user?.name || ('User #' + row.user_id) }}
            </span>
            <span class="text-[11px] font-mono text-secondary-text truncate">
              {{ row.user_email || row.user?.email || ('ID: ' + row.user_id) }}
            </span>
          </div>
        </template>

        <!-- Account -->
        <template #cell-account="{ row }">
          <div class="flex flex-col">
            <span class="font-mono text-xs font-bold text-primary-text">
              {{ row.account_number || row.trading_account?.account_number || row.trading_account_id }}
            </span>
            <span v-if="row.trading_account?.trading_type" class="text-[10px] text-secondary-text font-medium uppercase">
              {{ row.trading_account.trading_type }} · {{ row.trading_account.broker_currency || 'USD' }}
            </span>
          </div>
        </template>

        <!-- Trade / Deal -->
        <template #cell-deal="{ row }">
          <div v-if="row.mt5_deal_id || row.symbol" class="flex flex-col text-xs leading-tight">
            <div class="flex items-center gap-1 font-semibold text-primary-text">
              <span class="font-mono">{{ row.symbol || row.metadata?.symbol || 'Deal' }}</span>
              <span v-if="row.lots != null" class="text-[11px] font-normal text-secondary-text">({{ row.lots }} lots)</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span v-if="row.mt5_deal_id" class="text-[10px] font-mono text-secondary-text">Deal #{{ row.mt5_deal_id }}</span>
              <span
                v-if="row.profit != null"
                class="text-[10px] font-mono font-medium"
                :class="Number(row.profit) > 0 ? 'text-primary-green' : (Number(row.profit) < 0 ? 'text-primary-red' : 'text-secondary-text')"
              >
                P&L: {{ formatCurrency(row.profit) }}
              </span>
            </div>
          </div>
          <span v-else class="text-secondary-text text-xs">-</span>
        </template>

        <!-- Type -->
        <template #cell-transaction_type="{ row }">
          <span
            class="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider"
            :class="getTypeBadgeClass(row.transaction_type)"
          >
            {{ row.transaction_type }}
          </span>
        </template>

        <!-- Plan -->
        <template #cell-plan_code="{ row }">
          <div v-if="row.plan_code" class="flex flex-col">
            <span class="px-1.5 py-0.5 bg-background border border-primary-border rounded text-[11px] font-semibold text-primary-text uppercase w-fit">
              {{ row.plan_code }}
            </span>
            <span v-if="row.rate_per_lot" class="text-[10px] text-secondary-text mt-0.5">
              {{ formatCurrency(row.rate_per_lot) }}/lot
            </span>
          </div>
          <span v-else class="text-secondary-text">-</span>
        </template>

        <!-- Amount & Balance -->
        <template #cell-amount="{ row }">
          <div class="flex flex-col">
            <span
              class="font-bold text-xs"
              :class="Number(row.amount) > 0 ? 'text-primary-green' : (Number(row.amount) < 0 ? 'text-primary-red' : 'text-secondary-text')"
            >
              {{ formatCurrency(row.amount) }}
            </span>
            <span v-if="row.balance_after != null" class="text-[10px] font-mono text-secondary-text">
              Bal: {{ formatCurrency(row.balance_after) }}
            </span>
          </div>
        </template>

        <!-- Status & Skip Reason -->
        <template #cell-status="{ row }">
          <div class="flex flex-col gap-1 items-start">
            <StatusBadge :status="row.status" />
            
            <!-- Skip Reason Badge -->
            <template v-if="row.status === 'SKIPPED'">
              <span
                v-if="isDurationSkip(row)"
                class="px-1.5 py-0.5 rounded bg-primary-red/10 text-primary-red border border-primary-red/20 text-[10px] font-medium leading-tight flex items-center gap-1"
                :title="`Hold time ${row.metadata?.duration_seconds ?? 'N/A'}s <= ${row.metadata?.min_duration_seconds_applied ?? 120}s`"
              >
                <HugeIcon :icon="Clock01Icon" :size="10" />
                Duration ({{ row.metadata?.duration_seconds != null ? `${row.metadata.duration_seconds}s` : 'short' }})
              </span>
              <span
                v-else-if="(row.skip_reason || row.metadata?.skip_reason) === 'ineligible_symbol'"
                class="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-medium leading-tight"
              >
                Ineligible Symbol
              </span>
              <span
                v-else
                class="px-1.5 py-0.5 rounded bg-primary-red/10 text-primary-red text-[10px] font-medium leading-tight capitalize"
              >
                {{ (row.skip_reason || row.metadata?.skip_reason || 'Plan Not Qualified').replace(/_/g, ' ') }}
              </span>
            </template>
          </div>
        </template>

        <!-- Created At -->
        <template #cell-created_at="{ row }">
          <span class="text-xs text-secondary-text whitespace-nowrap">{{ formatDateTime(row.created_at) }}</span>
        </template>

        <!-- Actions -->
        <template #cell-actions="{ row }">
          <button
            type="button"
            class="px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
            @click="openDetails(row)"
          >
            <HugeIcon :icon="ViewIcon" :size="14" />
            Details
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Transaction Details Drawer -->
    <TransactionDetailsDrawer
      :open="isDrawerOpen"
      :transaction="selectedTransaction"
      @close="closeDetails"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import TransactionDetailsDrawer from "../components/TransactionDetailsDrawer.vue";
import {
  Search01Icon,
  FilterIcon,
  RefreshIcon,
  Clock01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

const store = useCashbackStore();

const isDrawerOpen = ref(false);
const selectedTransaction = ref(null);

const searchQuery = ref("");
const selectedType = ref("");

const typeFilters = [
  { label: "All Transactions", value: "" },
  { label: "Earns", value: "EARN" },
  { label: "Redemptions", value: "REDEEM" },
  { label: "Reversals", value: "REVERSE" },
  { label: "Adjustments", value: "ADJUST" },
];

const columns = [
  { key: "id", label: "Tx ID", sortable: false },
  { key: "user", label: "User", sortable: false },
  { key: "account", label: "Trading Account", sortable: false },
  { key: "deal", label: "Deal / Symbol", sortable: false },
  { key: "transaction_type", label: "Type", sortable: false },
  { key: "plan_code", label: "Plan", sortable: false },
  { key: "amount", label: "Amount / Bal", sortable: false },
  { key: "status", label: "Status & Reason", sortable: false },
  { key: "created_at", label: "Date & Time", sortable: false },
  { key: "actions", label: "Actions", sortable: false, align: "right" },
];

const isDurationSkip = (row) => {
  return (row.skip_reason || row.metadata?.skip_reason) === "duration";
};

const getTypeBadgeClass = (type) => {
  switch (type?.toUpperCase()) {
    case "EARN":
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    case "REDEEM":
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    case "REVERSE":
      return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    case "ADJUST":
      return "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20";
    default:
      return "bg-background text-secondary-text border border-primary-border";
  }
};

const buildQueryParams = (page = 1) => {
  const limit = store.transactionsPagination.limit || 50;
  const params = {
    limit,
    offset: (page - 1) * limit,
  };

  if (selectedType.value) {
    params.transaction_type = selectedType.value;
  }

  const query = searchQuery.value.trim();
  if (query) {
    // If numeric, could be user_id or trading_account_id
    if (/^\d+$/.test(query)) {
      params.user_id = parseInt(query, 10);
    }
  }

  return params;
};

const handlePageChange = (page) => {
  store.fetchTransactions(buildQueryParams(page), true);
};

const selectType = (type) => {
  selectedType.value = type;
  store.fetchTransactions(buildQueryParams(1), true);
};

const applyFilters = () => {
  store.fetchTransactions(buildQueryParams(1), true);
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedType.value = "";
  store.fetchTransactions({ limit: 50, offset: 0 }, true);
};

const openDetails = (row) => {
  selectedTransaction.value = row;
  isDrawerOpen.value = true;
};

const closeDetails = () => {
  isDrawerOpen.value = false;
  selectedTransaction.value = null;
};

const formatCurrency = (val) => {
  if (val == null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
};

const formatDateTime = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

onMounted(() => {
  if (!store.isFetched.transactions) {
    store.fetchTransactions();
  }
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
