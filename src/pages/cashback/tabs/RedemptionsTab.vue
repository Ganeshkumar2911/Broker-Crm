<template>
  <div class="space-y-4">
    <!-- Filter and Search Header -->
    <div class="bg-card-background border border-primary-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- Status Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer"
          :class="selectedStatus === filter.value
            ? 'bg-primary text-white shadow-xs'
            : 'bg-background text-secondary-text hover:text-primary-text border border-primary-border'"
          @click="selectStatus(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Search by User ID -->
      <div class="flex items-center gap-2.5">
        <div class="relative w-44 sm:w-56">
          <input
            v-model="searchUserId"
            type="number"
            placeholder="Search by User ID..."
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
          v-if="searchUserId || selectedStatus"
          type="button"
          class="px-2.5 py-1.5 bg-background border border-primary-border rounded-lg text-xs text-secondary-text hover:text-primary-red transition cursor-pointer"
          title="Reset Filters"
          @click="resetFilters"
        >
          <HugeIcon :icon="RefreshIcon" :size="14" />
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-card-background border border-primary-border rounded-xl">
      <DataTable
        :columns="columns"
        :data="store.redemptions"
        :loading="store.loading"
        :pagination="store.redemptionsPagination"
        @page-change="handlePageChange"
      >
        <template #cell-id="{ row }">
          <span class="font-mono text-xs font-semibold text-primary-text">#{{ row.id }}</span>
        </template>
        <template #cell-user_id="{ row }">
          <span class="font-mono text-xs text-primary-text">User #{{ row.user_id }}</span>
        </template>
        <template #cell-trading_account_id="{ row }">
          <span class="font-mono text-xs font-bold text-primary-text">{{ row.trading_account_id }}</span>
        </template>
        <template #cell-amount="{ row }">
          <span class="font-bold text-xs text-primary-text">{{ formatCurrency(row.amount, row.currency) }}</span>
        </template>
        <template #cell-ledger_transaction_id="{ row }">
          <span v-if="row.ledger_transaction_id" class="font-mono text-xs text-primary">#{{ row.ledger_transaction_id }}</span>
          <span v-else class="text-secondary-text text-xs">-</span>
        </template>
        <template #cell-status="{ row }">
          <div class="flex flex-col items-start gap-0.5">
            <StatusBadge :status="row.status" />
            <span v-if="row.failure_reason" class="text-[10px] text-primary-red font-medium leading-tight">
              {{ row.failure_reason }}
            </span>
          </div>
        </template>
        <template #cell-completed_at="{ row }">
          <span class="text-xs text-secondary-text whitespace-nowrap">{{ formatDateTime(row.completed_at || row.created_at) }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import {
  Search01Icon,
  FilterIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";

const store = useCashbackStore();

const searchUserId = ref("");
const selectedStatus = ref("");

const statusFilters = [
  { label: "All Redemptions", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const columns = [
  { key: "id", label: "Redemption ID", sortable: false },
  { key: "user_id", label: "User", sortable: false },
  { key: "trading_account_id", label: "Destination Account", sortable: false },
  { key: "amount", label: "Redeemed Amount", sortable: false },
  { key: "ledger_transaction_id", label: "Ledger Tx", sortable: false },
  { key: "status", label: "Status", sortable: false },
  { key: "completed_at", label: "Completed At", sortable: false },
];

const buildQueryParams = (page = 1) => {
  const limit = store.redemptionsPagination.limit || 50;
  const params = {
    limit,
    offset: (page - 1) * limit,
  };

  if (selectedStatus.value) {
    params.status = selectedStatus.value;
  }

  if (searchUserId.value) {
    params.user_id = parseInt(searchUserId.value, 10);
  }

  return params;
};

const handlePageChange = (page) => {
  store.fetchRedemptions(buildQueryParams(page), true);
};

const selectStatus = (status) => {
  selectedStatus.value = status;
  store.fetchRedemptions(buildQueryParams(1), true);
};

const applyFilters = () => {
  store.fetchRedemptions(buildQueryParams(1), true);
};

const resetFilters = () => {
  searchUserId.value = "";
  selectedStatus.value = "";
  store.fetchRedemptions({ limit: 50, offset: 0 }, true);
};

const formatCurrency = (val, currency = "USD") => {
  if (val == null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(val);
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
  if (!store.isFetched.redemptions) {
    store.fetchRedemptions();
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
