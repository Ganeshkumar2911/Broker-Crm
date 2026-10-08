<script setup>
import { onMounted, ref } from "vue";
import { useFmRequestStore } from "@/stores/fmRequest/fmRequest";
import FmRequestFilters from "@/components/fmRequest/FmRequestFilters.vue";
import Pagination from "@/components/common/Pagination.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import FmRequestActionDialog from "@/components/fmRequest/FmRequestActionDialog.vue";
import AddEditFundManager from "@/components/fundManager/AddEditFundManager.vue";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import { RefreshCw } from "lucide-vue-next";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const store = useFmRequestStore();
const tableColumns = [
  { key: 'user', title: 'User', minWidth: '150px' },
  { key: 'broker', title: 'Broker', minWidth: '150px' },
  { key: 'min_capital', title: 'Min Capital', minWidth: '120px' },
  { key: 'settlement', title: 'Settlement', minWidth: '120px' },
  { key: 'broker_share', title: 'Broker Share', minWidth: '110px' },
  { key: 'fm_share', title: 'FM Share', minWidth: '110px' },
  { key: 'ib_pool', title: 'IB Pool', minWidth: '110px' },
  { key: 'perf_fee', title: 'Perf. Fee', minWidth: '110px' },
  { key: 'status', title: 'Status', minWidth: '110px' }
];
const { hasPermission } = usePermissionCheck();
const activeStatus = ref(null);

const dialogOpen = ref(false);
const selectedItem = ref(null);
const actionType = ref("accept");

const fundManagerDialogOpen = ref(false);
const fundManagerMode = ref("add");
const selectedFundManager = ref(null);

const onFilter = (val) => {
  activeStatus.value = val;
  store.isFetched = false;
  store.fetchFmRequests(true, 1, val, store.search);
};

const onSearch = (val) => {
  store.setSearch(val, activeStatus.value);
};

const handlePageChange = (page) => {
  store.pagination.page = page;
  store.fetchFmRequests(true, page, activeStatus.value, store.search);
};

const handlePerPageChange = (val) => {
  const newPerPage = (val && typeof val === 'object' && val.per_page) ? val.per_page : val;
  store.updatePerPage(newPerPage, activeStatus.value);
};

const handleAccept = (item) => {
  selectedItem.value = item;
  actionType.value = "accept";
  dialogOpen.value = true;
};

const handleReject = (item) => {
  selectedItem.value = item;
  actionType.value = "reject";
  dialogOpen.value = true;
};

const handleConfirm = ({ data, message, reason }) => {
  if (actionType.value === "accept") {
    // ✅ pass form data + optional message
    store.acceptRequest(selectedItem.value.request_id, data, message);
  } else {
    store.rejectRequest(selectedItem.value.request_id, reason);
  }
  dialogOpen.value = false;
};

const handleAddFundManager = () => {
  fundManagerMode.value = "add";
  selectedFundManager.value = null;
  fundManagerDialogOpen.value = true;
};

const handleEditFundManager = (item) => {
  fundManagerMode.value = "edit";
  selectedFundManager.value = item;
  fundManagerDialogOpen.value = true;
};

const handleFundManagerSuccess = () => {
  fundManagerDialogOpen.value = false;
};
const handleRefresh = () => {
  store.fetchFmRequests(
    true,
    store.pagination.page,
    activeStatus.value,
    store.search,
  );
};

const formatMoney = (value, currency = "USD") => {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) return "-";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

onMounted(() => {
  if (!store.isFetched) {
    store.fetchFmRequests();
  }
});
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap- mb-6">
      <div class="flex items-center gap-2">
        <FmRequestFilters
          :filters="store.filters?.status ?? []"
          :active-status="activeStatus"
          :search="store.search"
          @filter="onFilter"
          @search="onSearch"
        />
        <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed"
            @click="handleRefresh"
          >
            <RefreshCw
              class="h-3.5 w-3.5"
              :class="{ 'animate-spin': store.loading }"
            />
          </button>
        </Tooltip>
      </div>
      <!-- <button
        @click="handleAddFundManager"
        class="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-background
               hover:bg-primary-hover transition-all cursor-pointer whitespace-nowrap"
      >
        + Add Fund Manager
      </button> -->
    </div>

    <div class="w-full overflow-hidden mt-4">
      <DataTable
        table-key="fm-request-table"
        :data="store.data"
        :columns="tableColumns"
        :loading="store.isLoading"
        :pagination="store.pagination"
        :actions="[]"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <template #cell-user="{ row: item }">
          <p class="text-xs font-medium text-primary-text">{{ item.user_email }}</p>
          <p class="text-[11px] text-secondary-text mt-0.5">ID {{ item.user_id }}</p>
          <p class="text-[11px] text-secondary-text mt-0.5">{{ item.created_at }}</p>
        </template>

        <template #cell-broker="{ row: item }">
          <p class="text-xs font-medium text-primary-text">{{ item.broker_currency }}</p>
          <p class="text-[11px] text-secondary-text mt-0.5 break-all">{{ item.broker_group }}</p>
          <p class="text-[11px] text-secondary-text mt-0.5">Leverage: {{ item.broker_leverage }}</p>
          <p class="text-[11px] text-secondary-text mt-0.5">Category: {{ item.broker_category }}</p>
        </template>

        <template #cell-min_capital="{ row: item }">
          <span class="text-xs text-primary-text">{{ formatMoney(item.min_capital, item.broker_currency) }}</span>
        </template>

        <template #cell-settlement="{ row: item }">
          <p class="text-xs text-primary-text capitalize">{{ item.settlement_type }}</p>
          <p class="text-[11px] text-secondary-text mt-0.5">{{ item.settlement_time }}</p>
        </template>

        <template #cell-broker_share="{ row: item }">
          <span class="text-xs text-primary-text">{{ item.broker_share }}%</span>
        </template>

        <template #cell-fm_share="{ row: item }">
          <span class="text-xs text-primary-text">{{ item.fm_share }}%</span>
        </template>

        <template #cell-ib_pool="{ row: item }">
          <span class="text-xs text-primary-text">{{ item.ib_pool_percentage }}%</span>
        </template>

        <template #cell-perf_fee="{ row: item }">
          <span class="text-xs text-primary-text">{{ item.performance_fee }}%</span>
        </template>

        <template #cell-status="{ row: item }">
          <span
            class="text-[11px] font-medium px-2.5 py-1 rounded-full border"
            :class="{
              'bg-primary-green/50 border-green-200': item.status === 'approved',
              'bg-yellow-50 text-yellow-800 border-yellow-200': item.status === 'pending',
              'bg-primary-red/50 border-red-200': item.status === 'rejected',
            }"
          >
            {{ item.status }}
          </span>
        </template>

        <template #actions="{ row: item }">
          <div
            v-if="
              item.status === 'pending' &&
              (hasPermission('fm_request.approve') || hasPermission('fm_request.reject'))
            "
            class="flex justify-center gap-2"
          >
            <Tooltip v-if="hasPermission('fm_request.approve')" text="Accept">
              <button
                class="inline-flex items-center justify-center w-8 h-8 border border-gray-300 rounded bg-gray-100 text-green-500 cursor-pointer transition-all duration-200 hover:bg-primary-green/50 hover:border-green-500"
                @click="handleAccept(item)"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </Tooltip>
            <Tooltip v-if="hasPermission('fm_request.reject')" text="Reject">
              <button
                class="inline-flex items-center justify-center w-8 h-8 border border-gray-300 rounded bg-gray-100 text-red-500 cursor-pointer transition-all duration-200 hover:bg-primary-red/50 hover:border-red-500"
                @click="handleReject(item)"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </Tooltip>
          </div>
        </template>
      </DataTable>
    </div>


    <FmRequestActionDialog
      :open="dialogOpen"
      :item="selectedItem"
      :action="actionType"
      :isSubmitting="store.isSubmitting"
      @close="dialogOpen = false"
      @confirm="handleConfirm"
    />

    <AddEditFundManager
      :open="fundManagerDialogOpen"
      :mode="fundManagerMode"
      :item="selectedFundManager"
      @close="fundManagerDialogOpen = false"
      @success="handleFundManagerSuccess"
    />
  </div>
</template>
