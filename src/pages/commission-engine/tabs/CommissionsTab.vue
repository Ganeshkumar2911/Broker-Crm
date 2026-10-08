<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Search01Icon,
  RefreshCwIcon,
  FilterIcon,
  Cancel01Icon,
  Coins01Icon,
  Tick02Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  Calendar01Icon,
  InformationCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import ApproveCommissionModal from "../components/ApproveCommissionModal.vue";
import RejectCommissionModal from "../components/RejectCommissionModal.vue";
import CalculateCommissionsModal from "../components/CalculateCommissionsModal.vue";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canView = computed(() =>
  hasPermission([
    "ib_commission_commissions.view",
    "ib_commission.commissions.view",
    "ib_commission.view",
  ])
);
const canApprove = computed(() =>
  hasPermission([
    "ib_commission_commissions.approve",
    "ib_commission.commissions.approve",
  ])
);
const canSync = computed(() =>
  hasPermission([
    "ib_commission_sync.update",
    "ib_commission.sync.update",
    "ib_commission_commissions.approve",
    "ib_commission.commissions.approve",
  ])
);

// Filters
const statusFilter = ref("pending"); // 'pending' | 'approved' | 'rejected' | ''
const walletTargetFilter = ref(""); // '' | 'main' | 'demo'
const loginFilter = ref("");
const ibIdFilter = ref("");
const tradeIdFilter = ref("");
const symbolFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const dateField = ref("created_at");

// Date range computed wrapper for BaseDatePicker
const dateRangeValue = computed({
  get() {
    if (dateFrom.value || dateTo.value) {
      return {
        start: dateFrom.value || null,
        end: dateTo.value || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      dateFrom.value = "";
      dateTo.value = "";
    } else if (Array.isArray(val)) {
      dateFrom.value = val[0] || "";
      dateTo.value = val[1] || "";
    } else if (typeof val === "object") {
      dateFrom.value = val.start || val.from || "";
      dateTo.value = val.end || val.to || "";
    }
    handleFilterChange();
  },
});

// Modals state
const isApproveModalOpen = ref(false);
const singleCommissionToApprove = ref(null);
const selectedCommissions = ref([]);

const isRejectModalOpen = ref(false);
const singleCommissionToReject = ref(null);

const isCalculateModalOpen = ref(false);

const searchTimer = ref(null);

const dateFieldOptions = [
  { label: "Created At", value: "created_at" },
  { label: "Approved At", value: "approved_at" },
  { label: "Trade Close Time", value: "close_time" },
];

const walletTargetOptions = [
  { label: "All Wallets", value: "" },
  { label: "Main Wallet", value: "main" },
  { label: "Demo Wallet", value: "demo" },
];

onMounted(() => {
  store.fetchWorkflowSettings();
  loadCommissions(1);
  if (!store.ibSearchOptions.length) {
    store.searchIbs("");
  }
});

let ibSearchTimer = null;
const onIbSearch = (query) => {
  clearTimeout(ibSearchTimer);
  if (!query || !query.trim()) {
    store.searchIbs("");
    return;
  }
  ibSearchTimer = setTimeout(() => {
    store.searchIbs(query).catch(() => {});
  }, 300);
};

// Auto-adjust default filter if workflow is auto_wallet
watch(
  () => store.workflowSettings?.auto_wallet_credit,
  (isAuto) => {
    if (
      isAuto &&
      statusFilter.value === "pending" &&
      !store.commissionsList?.length
    ) {
      statusFilter.value = "approved";
      loadCommissions(1, true);
    }
  },
);

const loadCommissions = (page = 1, force = false) => {
  const loginVal =
    loginFilter.value != null ? String(loginFilter.value).trim() : "";
  const ibIdVal =
    ibIdFilter.value != null ? String(ibIdFilter.value).trim() : "";
  const tradeIdVal =
    tradeIdFilter.value != null ? String(tradeIdFilter.value).trim() : "";
  const symbolVal =
    symbolFilter.value != null ? String(symbolFilter.value).trim() : "";

  const params = {
    status: statusFilter.value || undefined,
    wallet_target: walletTargetFilter.value || undefined,
    login: loginVal ? Number(loginVal) : undefined,
    ib_id: ibIdVal ? Number(ibIdVal) : undefined,
    trade_id: tradeIdVal ? Number(tradeIdVal) : undefined,
    symbol: symbolVal ? symbolVal.toUpperCase() : undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    date_field: dateField.value || "created_at",
    page,
    per_page: store.commissionsPagination.per_page || 50,
  };

  store.fetchCommissions(params, force);
};

const handleFilterChange = () => {
  if (searchTimer.value) clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    selectedCommissions.value = [];
    loadCommissions(1, true);
  }, 350);
};

const handleResetFilters = () => {
  statusFilter.value = store.workflowSettings?.auto_wallet_credit
    ? "approved"
    : "pending";
  walletTargetFilter.value = "";
  loginFilter.value = "";
  ibIdFilter.value = "";
  tradeIdFilter.value = "";
  symbolFilter.value = "";
  dateFrom.value = "";
  dateTo.value = "";
  dateField.value = "created_at";
  selectedCommissions.value = [];
  loadCommissions(1, true);
};

const handlePageChange = (newPage) => {
  loadCommissions(newPage, true);
};

const handlePerPageChange = (newPerPage) => {
  const perPageVal =
    typeof newPerPage === "object" && newPerPage !== null
      ? newPerPage.per_page || newPerPage.value || 50
      : newPerPage;
  store.commissionsPagination.per_page = Number(perPageVal) || 50;
  loadCommissions(1, true);
};

const handleToggleWorkflow = async (event) => {
  const isChecked = event.target.checked;
  await store.updateWorkflowSettings({ auto_wallet_credit: isChecked });
};

const setWorkflowMode = async (autoCredit) => {
  if (store.workflowSettings?.auto_wallet_credit === autoCredit) return;
  await store.updateWorkflowSettings({ auto_wallet_credit: autoCredit });
};

// Approval triggers
const openSingleApprove = (commission) => {
  singleCommissionToApprove.value = commission;
  isApproveModalOpen.value = true;
};

const openBulkApprove = () => {
  singleCommissionToApprove.value = null;
  isApproveModalOpen.value = true;
};

// Rejection trigger
const openSingleReject = (commission) => {
  singleCommissionToReject.value = commission;
  isRejectModalOpen.value = true;
};

const handleApprovedCallback = () => {
  selectedCommissions.value = [];
  loadCommissions(store.commissionsPagination.page, true);
};

const handleRejectedCallback = () => {
  loadCommissions(store.commissionsPagination.page, true);
};

const handleCalculatedCallback = () => {
  loadCommissions(1, true);
};

// Filter selectable rows: Only pending commissions can be bulk approved
const pendingSelectedCommissions = computed(() => {
  return selectedCommissions.value.filter((c) => c.status === "pending");
});

const hasActiveFilters = computed(() => {
  return (
    !!walletTargetFilter.value ||
    !!loginFilter.value ||
    !!ibIdFilter.value ||
    !!tradeIdFilter.value ||
    !!symbolFilter.value ||
    !!dateFrom.value ||
    !!dateTo.value
  );
});

const columns = [
  { key: "id", label: "ID", width: "75px", sortable: true },
  { key: "status", label: "Status", align: "center", width: "110px" },
  { key: "ib_partner", label: "IB Partner", width: "180px" },
  { key: "trade_info", label: "Client & Trade Details", width: "210px" },
  { key: "rates", label: "Rate Applied", width: "150px" },
  {
    key: "close_market",
    label: "Close Market (Ask/Bid)",
    align: "right",
    width: "160px",
  },
  {
    key: "closed_spread_points",
    label: "Spread (Pts)",
    align: "right",
    width: "120px",
  },
  {
    key: "closed_volume",
    label: "Closed Volume",
    align: "right",
    width: "130px",
  },
  {
    key: "contract_size",
    label: "Contract Size",
    align: "right",
    width: "120px",
  },
  {
    key: "digits",
    label: "Digits",
    align: "right",
    width: "90px",
  },
  {
    key: "commission_per_lot",
    label: "Comm / Lot",
    align: "right",
    width: "120px",
    sortable: true,
  },
  {
    key: "commission_per_millions_volume",
    label: "Comm / M.Vol",
    align: "right",
    width: "130px",
    sortable: true,
  },
  {
    key: "commission_per_spread",
    label: "Comm / Spread",
    align: "right",
    width: "130px",
    sortable: true,
  },
  {
    key: "commission_per_pips",
    label: "Comm / Pips",
    align: "right",
    width: "120px",
    sortable: true,
  },
  {
    key: "total_commission",
    label: "Total Commission",
    align: "right",
    width: "140px",
    sortable: true,
  },
  { key: "timeline", label: "Timeline & Audit", width: "170px" },
  { key: "wallet_target", label: "Wallet Target", align: "center", width: "120px" },
  { key: "group_name", label: "IB Group", width: "140px" },
  { key: "symbol_group", label: "Symbol & Config Grp", width: "150px" },
  { key: "mt5_group", label: "MT5 Group", width: "160px" },
  { key: "position_id", label: "Position ID", width: "120px" },
  { key: "trade_status", label: "Trade Status", align: "center", width: "110px" },
  { key: "deals", label: "Deals (Open/Close)", width: "150px" },
  { key: "trade_prices", label: "Trade Open/Close Price", align: "right", width: "170px" },
  { key: "open_market", label: "Open Market (Ask/Bid)", align: "right", width: "160px" },
  { key: "open_volume", label: "Open Volume", align: "right", width: "140px" },
  { key: "volume_entry_exit", label: "Entry/Exit Lots", align: "right", width: "135px" },
  { key: "trade_profit", label: "Trade Profit", align: "right", width: "120px", sortable: true },
  { key: "trade_timing", label: "Trade Open/Close Time", width: "180px" },
  { key: "spread_allotted", label: "Spread Allotted", align: "right", width: "145px" },
  { key: "pip_value", label: "Pip Value & One Pip", align: "right", width: "140px" },
  { key: "calculation_bases", label: "Calc Bases (M/Pips)", align: "right", width: "150px" },
  { key: "quote_fx", label: "Quote & FX Rate", align: "right", width: "135px" },
  { key: "fx_details", label: "FX Mode & Source", width: "140px" },
  { key: "settlement_batch", label: "Settlement Batch", width: "130px" },
  {
    key: "actions",
    label: "Actions",
    align: "right",
    width: "140px",
    sticky: "right",
  },
];

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};
</script>

<template>
  <div class="space-y-4">
    <!-- Commissions DataTable -->
    <DataTable
      :columns="columns"
      :data="store.commissionsList"
      :loading="store.loading"
      :pagination="store.commissionsPagination"
      :selectable="canApprove && statusFilter === 'pending'"
      v-model:selected="selectedCommissions"
      row-key="id"
      table-key="ib-commissions-table"
      :per-page-options="[10, 20, 50, 100, 200]"
      empty-title="No commission records found"
      empty-text="No commissions match the current filter or status criteria."
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <!-- Toolbar Slot -->
      <template #toolbar>
        <div class="space-y-3">
          <!-- Top Row: Status Tabs (Left) & Actions (Right) -->
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primary-border/60"
          >
            <!-- Status Filter Pills -->
            <div
              class="inline-flex p-1 rounded-lg bg-background border border-primary-border shrink-0 self-start sm:self-auto shadow-2xs"
            >
              <!-- Pending -->
              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                :class="[
                  statusFilter === 'pending'
                    ? 'bg-primary text-white shadow-2xs font-bold'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60',
                ]"
                @click="
                  statusFilter = 'pending';
                  handleFilterChange();
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="statusFilter === 'pending' ? 'bg-white' : 'bg-primary/80'"
                />
                <span>Pending</span>
              </button>

              <!-- Approved -->
              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                :class="[
                  statusFilter === 'approved'
                    ? 'bg-primary-green text-white shadow-2xs font-bold'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60',
                ]"
                @click="
                  statusFilter = 'approved';
                  handleFilterChange();
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="
                    statusFilter === 'approved'
                      ? 'bg-white'
                      : 'bg-primary-green/80'
                  "
                />
                <span>Approved</span>
              </button>

              <!-- Rejected -->
              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                :class="[
                  statusFilter === 'rejected'
                    ? 'bg-primary-red text-white shadow-2xs font-bold'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60',
                ]"
                @click="
                  statusFilter = 'rejected';
                  handleFilterChange();
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="
                    statusFilter === 'rejected' ? 'bg-white' : 'bg-primary-red/80'
                  "
                />
                <span>Rejected</span>
              </button>

              <!-- All -->
              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                :class="[
                  statusFilter === ''
                    ? 'bg-card-background text-primary-text shadow-2xs border border-primary-border font-bold'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60',
                ]"
                @click="
                  statusFilter = '';
                  handleFilterChange();
                "
              >
                <span>All</span>
              </button>
            </div>

            <!-- Right: Action Buttons -->
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
              <!-- Bulk Approve Button -->
              <button
                v-if="canApprove && pendingSelectedCommissions.length > 0"
                type="button"
                :disabled="store.actionLoading"
                class="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-green hover:bg-primary-green/90 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs animate-in fade-in zoom-in-95 duration-150"
                @click="openBulkApprove"
              >
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="14" />
                <span
                  >Approve Selected ({{
                    pendingSelectedCommissions.length
                  }})</span
                >
              </button>

              <!-- Calculate Commissions Button -->
              <button
                v-if="canSync"
                type="button"
                :disabled="store.actionLoading"
                class="btn-primary disabled:opacity-50"
                @click="isCalculateModalOpen = true"
              >
                <HugeIcon :icon="Coins01Icon" :size="14" />
                <span>Calculate Commissions</span>
              </button>

              <!-- Refresh Button -->
             
                <button
                  type="button"
                  :disabled="store.loading"
                  class="flex items-center justify-center w-8 h-8 border border-primary-border rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
                  @click="loadCommissions(store.commissionsPagination.page, true)"
                >
                  <HugeIcon
                    :icon="RefreshCwIcon"
                    :size="14"
                    :class="{ 'animate-spin': store.loading }"
                  />
                </button>

            </div>
          </div>

          <!-- Bottom Row: Filter Controls -->
          <div class="flex flex-wrap items-center gap-2.5">
            <!-- IB Filter -->
            <div class="w-full sm:w-52 md:w-56">
              <BaseSelect
                v-model="ibIdFilter"
                :options="store.ibSearchOptions"
                :isLoading="store.searchLoading"
                placeholder="Search IB..."
                searchable
                variant="surface"
                @search="onIbSearch"
                @update:modelValue="handleFilterChange"
              />
            </div>

            <!-- MT5 Login Filter -->
            <div class="w-28 sm:w-32">
              <input
                v-model="loginFilter"
                type="number"
                placeholder="MT5 Login"
                class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                @input="handleFilterChange"
              />
            </div>

            <!-- Symbol Search -->
            <div class="relative w-32 sm:w-36">
              <HugeIcon
                :icon="Search01Icon"
                :size="13"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
              />
              <input
                v-model="symbolFilter"
                type="text"
                placeholder="Symbol"
                class="input-field w-full pl-7 pr-3 py-1.5 text-xs font-mono uppercase"
                @input="handleFilterChange"
              />
            </div>

            <!-- Wallet Target Filter -->
            <div class="w-32 sm:w-36">
              <BaseSelect
                v-model="walletTargetFilter"
                :options="walletTargetOptions"
                placeholder="All Wallets"
                variant="surface"
                @update:model-value="handleFilterChange"
              />
            </div>

            <div class="h-5 w-px bg-primary-border/60 hidden xl:block mx-0.5" />

            <!-- Date Field Select -->
            <div class="w-36 sm:w-40">
              <BaseSelect
                v-model="dateField"
                :options="dateFieldOptions"
                variant="surface"
                @update:model-value="handleFilterChange"
              />
            </div>

            <!-- Date Range Picker -->
            <div class="w-56 sm:w-60">
              <BaseDatePicker
                v-model="dateRangeValue"
                :range="true"
                placeholder="Select date range..."
                variant="surface"
              />
            </div>

            <!-- Reset / Clear Filter Button -->
            <button
              v-if="hasActiveFilters"
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-secondary-text hover:text-primary-red hover:bg-primary-red/5 rounded-lg transition-colors cursor-pointer"
              title="Clear all active filters"
              @click="handleResetFilters"
            >
              <HugeIcon :icon="Cancel01Icon" :size="13" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Cell: ID -->
      <template #cell-id="{ row }">
        <span class="font-mono text-xs font-semibold text-primary-text">
          #{{ row.id }}
        </span>
      </template>

      <!-- Cell: Status -->
      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
          :class="{
            'bg-primary-green/10 text-primary-green border border-primary-green/20':
              row.status === 'approved',
            'bg-primary/10 text-primary border border-primary/20':
              row.status === 'pending',
            'bg-primary-red/10 text-primary-red border border-primary-red/20':
              row.status === 'rejected',
          }"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="{
              'bg-primary-green': row.status === 'approved',
              'bg-primary': row.status === 'pending',
              'bg-primary-red': row.status === 'rejected',
            }"
          />
          {{ row.status?.toUpperCase() }}
        </span>
      </template>

      <!-- Cell: IB Partner -->
      <template #cell-ib_partner="{ row }">
        <div class="space-y-0.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <p class="font-bold text-primary-text text-xs">
              {{ row.ib_name || `IB #${row.ib_id}` }}
            </p>
            <span
              v-if="row.wallet_target"
              class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border inline-block"
              :class="
                row.wallet_target === 'demo'
                  ? 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                  : 'bg-primary-green/10 text-primary-green border-primary-green/20'
              "
            >
              {{ row.wallet_target }}
            </span>
          </div>
          <p class="text-[10px] text-secondary-text font-mono">
            IB #{{ row.ib_id }} &middot; User #{{ row.ib_user_id || "N/A" }}
            <span v-if="row.referral_link_id"> &middot; Link #{{ row.referral_link_id }}</span>
          </p>
        </div>
      </template>

      <!-- Cell: Trade Info -->
      <template #cell-trade_info="{ row }">
        <div class="text-xs space-y-0.5">
          <!-- Trader / Client Name -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-bold text-primary-text">
              {{ row.user_name || `User #${row.user_id || row.trade?.user_id || 'N/A'}` }}
            </span>
            <span
              v-if="row.user_id || row.trade?.user_id"
              class="text-[10px] text-secondary-text font-mono px-1 py-0.2 bg-background rounded border border-primary-border"
            >
              #{{ row.user_id || row.trade?.user_id }}
            </span>
          </div>
          <!-- Symbol & Volume Lots -->
          <div class="flex items-center gap-1.5 text-[11px] font-mono text-secondary-text">
            <span class="font-bold text-primary-text">
              {{ row.trade?.symbol || "N/A" }}
            </span>
            <span>&middot;</span>
            <span>{{ row.closed_volume_lots ?? row.volume_lots ?? "-" }} lots</span>
          </div>
          <!-- Login & Trade ID -->
          <p class="text-[10px] text-secondary-text font-mono">
            Login: {{ row.trade?.login || "-" }} &middot; Trade #{{
              row.trade_id || row.trade?.position_id || "-"
            }}
          </p>
        </div>
      </template>

      <!-- Cell: Rates Applied -->
      <template #cell-rates="{ row }">
        <div class="text-[11px] font-mono space-y-0.5">
          <p v-if="row.rate_per_lot !== null && row.rate_per_lot !== undefined">
            Per Lot:
            <strong class="text-primary-text">
              {{ row.rate_type_per_lot === 'percent' ? `${row.rate_per_lot}%` : `$${row.rate_per_lot}` }}
            </strong>
          </p>
          <p v-if="row.rate_per_spread !== null && row.rate_per_spread !== undefined">
            Per Spread:
            <strong class="text-primary-text">
              {{ row.rate_type_per_spread === 'percent' || row.rate_type_per_spread === undefined ? `${row.rate_per_spread}%` : `$${row.rate_per_spread}` }}
            </strong>
          </p>
          <p v-if="row.rate_per_millions_volume !== null && row.rate_per_millions_volume !== undefined">
            Per M. Vol:
            <strong class="text-primary-text">
              {{ row.rate_type_per_millions_volume === 'percent' ? `${row.rate_per_millions_volume}%` : `$${row.rate_per_millions_volume}` }}
            </strong>
          </p>
          <p v-if="row.rate_per_pips !== null && row.rate_per_pips !== undefined">
            Per Pips:
            <strong class="text-primary-text">
              {{ row.rate_type_per_pips === 'percent' ? `${row.rate_per_pips}%` : `P${row.rate_per_pips}` }}
            </strong>
          </p>
          <p
            v-if="
              (row.rate_per_lot === null || row.rate_per_lot === undefined) &&
              (row.rate_per_spread === null || row.rate_per_spread === undefined) &&
              (row.rate_per_millions_volume === null || row.rate_per_millions_volume === undefined) &&
              (row.rate_per_pips === null || row.rate_per_pips === undefined)
            "
            class="text-secondary-text"
          >
            Standard Matrix
          </p>
        </div>
      </template>

      <!-- Cell: Close Market (Ask / Bid / Spread) -->
      <template #cell-close_market="{ row }">
        <div class="text-right font-mono text-xs space-y-0.5">
          <p v-if="row.trade?.close_market_ask != null || row.calculation?.close_market_ask != null" class="text-primary-text">
            Ask: <span class="font-semibold">{{ row.trade?.close_market_ask ?? row.calculation?.close_market_ask }}</span>
          </p>
          <p v-if="row.trade?.close_market_bid != null || row.calculation?.close_market_bid != null" class="text-primary-text">
            Bid: <span class="font-semibold">{{ row.trade?.close_market_bid ?? row.calculation?.close_market_bid }}</span>
          </p>
          <p v-if="row.trade?.closed_spread != null || row.closed_spread != null" class="text-[10px] text-secondary-text">
            Spread: {{ row.trade?.closed_spread ?? row.closed_spread }} pts
          </p>
          <span v-if="row.trade?.close_market_ask == null && row.calculation?.close_market_ask == null && row.trade?.close_market_bid == null && row.calculation?.close_market_bid == null">-</span>
        </div>
      </template>

      <!-- Cell: Closed Spread Points -->
      <template #cell-closed_spread_points="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="row.calculation?.closed_spread_points != null"
            class="text-primary-text font-semibold"
          >
            {{ row.calculation.closed_spread_points }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Closed Volume -->
      <template #cell-closed_volume="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="row.calculation?.closed_volume != null || row.closed_volume != null"
            class="text-primary-text font-semibold"
          >
            {{ Number(row.calculation?.closed_volume ?? row.closed_volume).toLocaleString('en-US', { maximumFractionDigits: 4 }) }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Contract Size -->
      <template #cell-contract_size="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="row.calculation?.contract_size != null || row.contract_size != null"
            class="text-primary-text font-semibold"
          >
            {{ row.calculation?.contract_size ?? row.contract_size }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Digits -->
      <template #cell-digits="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="row.calculation?.digits != null || row.digits != null"
            class="text-primary-text font-semibold"
          >
            {{ row.calculation?.digits ?? row.digits }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Commission Per Lot -->
      <template #cell-commission_per_lot="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="
              row.commission_per_lot !== null &&
              row.commission_per_lot !== undefined
            "
            class="text-primary-text font-semibold"
          >
            ${{ Number(row.commission_per_lot || 0).toFixed(4) }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Commission Per Millions Volume -->
      <template #cell-commission_per_millions_volume="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="
              row.commission_per_millions_volume !== null &&
              row.commission_per_millions_volume !== undefined
            "
            class="text-primary-text font-semibold"
          >
            ${{ Number(row.commission_per_millions_volume || 0).toFixed(4) }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Commission Per Spread -->
      <template #cell-commission_per_spread="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="
              row.commission_per_spread !== null &&
              row.commission_per_spread !== undefined
            "
            class="text-primary-text font-semibold"
          >
            ${{ Number(row.commission_per_spread || 0).toFixed(4) }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Commission Per Pips -->
      <template #cell-commission_per_pips="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="
              row.commission_per_pips !== null &&
              row.commission_per_pips !== undefined
            "
            class="text-primary-text font-semibold"
          >
            ${{ Number(row.commission_per_pips || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Total Commission -->
      <template #cell-total_commission="{ row }">
        <div class="text-right">
          <p class="font-mono text-sm font-bold text-primary-green">
            ${{ Number(row.total_commission || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) }}
          </p>
          <p class="text-[10px] text-secondary-text font-mono">
            {{ row.account_currency || "USD" }}
          </p>
        </div>
      </template>

      <!-- Cell: Timeline & Audit -->
      <template #cell-timeline="{ row }">
        <div class="text-[11px] text-secondary-text space-y-0.5">
          <p>
            Created:
            <span class="text-primary-text font-mono">{{
              formatDate(row.created_at)
            }}</span>
          </p>
          <p v-if="row.approved_at">
            Approved:
            <span class="text-primary-green font-mono">{{
              formatDate(row.approved_at)
            }}</span>
            <span
              v-if="row.wallet_transaction_id"
              class="block text-[10px] font-mono"
            >
              Trx #{{ row.wallet_transaction_id }}
            </span>
          </p>
          <p v-if="row.rejected_at">
            Rejected:
            <span class="text-primary-red font-mono">{{
              formatDate(row.rejected_at)
            }}</span>
            <span
              v-if="row.reject_reason"
              class="block text-[10px] text-primary-red truncate max-w-37.5"
              :title="row.reject_reason"
            >
              "{{ row.reject_reason }}"
            </span>
          </p>
        </div>
      </template>

      <!-- Cell: Wallet Target -->
      <template #cell-wallet_target="{ row }">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
          :class="
            row.wallet_target === 'demo'
              ? 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
              : 'bg-primary-green/10 text-primary-green border-primary-green/20'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="row.wallet_target === 'demo' ? 'bg-primary-blue' : 'bg-primary-green'"
          />
          {{ row.wallet_target || 'main' }}
        </span>
      </template>

      <!-- Cell: Group Name -->
      <template #cell-group_name="{ row }">
        <div class="space-y-0.5 text-xs">
          <p class="font-medium text-primary-text">
            {{ row.group_name || "-" }}
          </p>
          <p v-if="row.group_id" class="text-[10px] font-mono text-secondary-text">
            Group #{{ row.group_id }}
          </p>
        </div>
      </template>

      <!-- Cell: Symbol Group & Config -->
      <template #cell-symbol_group="{ row }">
        <div class="space-y-0.5 text-xs font-mono">
          <p class="text-primary-text">
            Sym Grp: <span class="text-secondary-text">#{{ row.symbol_group_id || row.trade?.symbol_group_id || '-' }}</span>
          </p>
          <p class="text-primary-text">
            Config: <span class="text-secondary-text">#{{ row.broker_group_config_id || row.trade?.broker_group_config_id || '-' }}</span>
          </p>
        </div>
      </template>

      <!-- Cell: MT5 Group -->
      <template #cell-mt5_group="{ row }">
        <span
          class="text-xs font-mono text-secondary-text truncate block max-w-37.5"
          :title="row.trade?.mt5_group"
        >
          {{ row.trade?.mt5_group || "-" }}
        </span>
      </template>

      <!-- Cell: Position ID -->
      <template #cell-position_id="{ row }">
        <span class="font-mono text-xs text-primary-text font-semibold">
          {{ row.trade?.position_id ? `#${row.trade.position_id}` : '-' }}
        </span>
      </template>

      <!-- Cell: Trade Status -->
      <template #cell-trade_status="{ row }">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
          :class="
            (row.trade?.trade_status || 'closed') === 'closed'
              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
              : 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'
          "
        >
          {{ row.trade?.trade_status || 'closed' }}
        </span>
      </template>

      <!-- Cell: Deals (Open / Close) -->
      <template #cell-deals="{ row }">
        <div class="text-[10px] font-mono space-y-0.5">
          <p class="text-primary-text">
            Open: <span class="text-secondary-text">#{{ row.trade?.open_deal || "-" }}</span>
          </p>
          <p class="text-primary-text">
            Close: <span class="text-secondary-text">#{{ row.trade?.close_deal || "-" }}</span>
          </p>
        </div>
      </template>

      <!-- Cell: Trade Prices (Open & Close) -->
      <template #cell-trade_prices="{ row }">
        <div class="text-right font-mono text-xs space-y-0.5">
          <p class="text-primary-text">
            Open: <span class="font-semibold">{{ row.trade?.price_open ?? row.trade?.open_price ?? "-" }}</span>
          </p>
          <p class="text-primary-text">
            Close: <span class="font-semibold">{{ row.trade?.price_close ?? row.trade?.close_price ?? "-" }}</span>
          </p>
        </div>
      </template>

      <!-- Cell: Open Market (Ask / Bid / Spread) -->
      <template #cell-open_market="{ row }">
        <div class="text-right font-mono text-xs space-y-0.5">
          <p v-if="row.trade?.open_market_ask != null" class="text-primary-text">
            Ask: <span class="font-semibold">{{ row.trade.open_market_ask }}</span>
          </p>
          <p v-if="row.trade?.open_market_bid != null" class="text-primary-text">
            Bid: <span class="font-semibold">{{ row.trade.open_market_bid }}</span>
          </p>
          <p v-if="row.trade?.open_spread != null" class="text-[10px] text-secondary-text">
            Spread: {{ row.trade.open_spread }} pts
          </p>
          <span v-if="row.trade?.open_market_ask == null && row.trade?.open_market_bid == null">-</span>
        </div>
      </template>

      <!-- Cell: Open Volume -->
      <template #cell-open_volume="{ row }">
        <div class="text-right font-mono text-xs space-y-0.5">
          <p v-if="row.trade?.open_volume != null" class="text-primary-text font-semibold">
            {{ Number(row.trade.open_volume).toLocaleString('en-US', { maximumFractionDigits: 4 }) }}
          </p>
          <p v-if="row.trade?.open_volume_lots != null" class="text-[10px] text-secondary-text">
            {{ row.trade.open_volume_lots }} lots
          </p>
          <span v-if="row.trade?.open_volume == null">-</span>
        </div>
      </template>

      <!-- Cell: Entry / Exit Lots -->
      <template #cell-volume_entry_exit="{ row }">
        <div class="text-right font-mono text-xs space-y-0.5">
          <p class="text-primary-text">
            Entry: <span class="font-semibold">{{ row.trade?.volume_entry_lots ?? '-' }} L</span>
          </p>
          <p class="text-primary-text">
            Exit: <span class="font-semibold">{{ row.trade?.volume_exit_lots ?? '-' }} L</span>
          </p>
        </div>
      </template>

      <!-- Cell: Trade Profit / Loss -->
      <template #cell-trade_profit="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="row.trade?.profit !== null && row.trade?.profit !== undefined"
            class="font-bold"
            :class="(row.trade.profit ?? 0) >= 0 ? 'text-primary-green' : 'text-primary-red'"
          >
            {{ (row.trade.profit ?? 0) > 0 ? '+' : '' }}${{ Number(row.trade.profit).toFixed(2) }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Trade Execution Time -->
      <template #cell-trade_timing="{ row }">
        <div class="text-[10px] font-mono text-secondary-text space-y-0.5">
          <p v-if="row.trade?.open_time">
            Open: <span class="text-primary-text">{{ formatDate(row.trade.open_time) }}</span>
          </p>
          <p v-if="row.trade?.close_time">
            Close: <span class="text-primary-text">{{ formatDate(row.trade.close_time) }}</span>
          </p>
          <span v-if="!row.trade?.open_time && !row.trade?.close_time">-</span>
        </div>
      </template>

      <!-- Cell: Spread Allotted -->
      <template #cell-spread_allotted="{ row }">
        <div class="text-right font-mono text-xs">
          <span
            v-if="row.calculation?.spread_allotted != null"
            class="text-primary font-semibold"
          >
            {{ row.calculation.spread_allotted }} pts
            <span v-if="row.calculation?.spread_allotted_pips != null" class="text-[10px] text-secondary-text block">
              ({{ row.calculation.spread_allotted_pips }} pips)
            </span>
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Cell: Pip Value & One Pip -->
      <template #cell-pip_value="{ row }">
        <div class="text-right font-mono text-xs space-y-0.5">
          <p v-if="row.calculation?.pip_value != null || row.pip_value != null" class="text-primary-text font-semibold">
            Pip: {{ row.calculation?.pip_value ?? row.pip_value }}
          </p>
          <p v-if="row.calculation?.one_pip != null || row.one_pip != null" class="text-[10px] text-secondary-text">
            1Pip: {{ row.calculation?.one_pip ?? row.one_pip }}
          </p>
          <span v-if="row.calculation?.pip_value == null && row.pip_value == null">-</span>
        </div>
      </template>

      <!-- Cell: Calculation Bases -->
      <template #cell-calculation_bases="{ row }">
        <div class="text-right font-mono text-xs space-y-0.5">
          <p v-if="row.calculation?.millions_base != null" class="text-primary-text">
            M.Base: <span class="font-semibold">{{ row.calculation.millions_base }}</span>
          </p>
          <p v-if="row.calculation?.pips_base != null" class="text-primary-text">
            Pips Base: <span class="font-semibold">{{ row.calculation.pips_base }}</span>
          </p>
          <span v-if="row.calculation?.millions_base == null && row.calculation?.pips_base == null">-</span>
        </div>
      </template>

      <!-- Cell: Quote & FX Rate -->
      <template #cell-quote_fx="{ row }">
        <div class="text-right font-mono text-xs">
          <p class="text-primary-text font-semibold">
            {{ row.calculation?.quote_currency || row.quote_currency || "USD" }}
          </p>
          <p class="text-[10px] text-secondary-text font-mono">
            @ {{ row.calculation?.quote_to_usd_rate || row.quote_to_usd_rate || 1.0 }}
          </p>
        </div>
      </template>

      <!-- Cell: FX Details -->
      <template #cell-fx_details="{ row }">
        <div class="text-xs font-mono space-y-0.5">
          <p class="text-primary-text">
            Mode: <span class="text-secondary-text">{{ row.calculation?.fx_mode || row.trade?.fx_mode || row.fx_mode || '-' }}</span>
          </p>
          <p v-if="row.trade?.fx_source" class="text-[10px] text-secondary-text">
            Src: {{ row.trade.fx_source }}
          </p>
          <p v-if="row.trade?.fx_symbol || row.fx_symbol" class="text-[10px] text-primary">
            Sym: {{ row.trade?.fx_symbol || row.fx_symbol }}
          </p>
        </div>
      </template>

      <!-- Cell: Settlement Batch -->
      <template #cell-settlement_batch="{ row }">
        <span class="font-mono text-xs text-secondary-text">
          {{ row.settlement_batch_id ? `#${row.settlement_batch_id}` : '-' }}
        </span>
      </template>

      <!-- Cell: Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1.5">
          <!-- Pending Action Buttons -->
          <template v-if="row.status === 'pending' && canApprove">
            <button
              type="button"
              :disabled="store.actionLoading"
              class="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary-green/10 hover:bg-primary-green/20 text-primary-green rounded-lg transition-colors font-semibold cursor-pointer"
              title="Approve commission"
              @click="openSingleApprove(row)"
            >
              <HugeIcon :icon="CheckmarkCircle02Icon" :size="12" />
              <span>Approve</span>
            </button>

            <button
              type="button"
              :disabled="store.actionLoading"
              class="p-1.5 text-secondary-text hover:text-primary-red hover:bg-primary-red/10 rounded-lg transition-colors cursor-pointer"
              title="Reject commission"
              @click="openSingleReject(row)"
            >
              <HugeIcon :icon="Delete02Icon" :size="13" />
            </button>
          </template>

          <!-- Non-pending Badge Indicator -->
          <span
            v-else-if="row.status === 'approved'"
            class="text-[11px] text-primary-green font-mono font-medium"
          >
            Credited
          </span>
          <span
            v-else-if="row.status === 'rejected'"
            class="text-[11px] text-primary-red font-mono font-medium"
          >
            Disallowed
          </span>
        </div>
      </template>
    </DataTable>

    <!-- Approve Modal (Single & Bulk) -->
    <ApproveCommissionModal
      v-model="isApproveModalOpen"
      :commission="singleCommissionToApprove"
      :commissions="pendingSelectedCommissions"
      @approved="handleApprovedCallback"
    />

    <!-- Reject Modal (Single with Reason) -->
    <RejectCommissionModal
      v-model="isRejectModalOpen"
      :commission="singleCommissionToReject"
      @rejected="handleRejectedCallback"
    />

    <!-- Calculate Commissions Modal -->
    <CalculateCommissionsModal
      v-model="isCalculateModalOpen"
      @calculated="handleCalculatedCallback"
    />
  </div>
</template>
