<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Search01Icon,
  RefreshCwIcon,
  FilterIcon,
  Cancel01Icon,
  DatabaseIcon,
  Tick02Icon,
  Alert02Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import RebuildTradesModal from "../components/RebuildTradesModal.vue";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canSync = computed(() =>
  hasPermission([
    "ib_commission_trades.update",
    "ib_commission.trades.update",
    "ib_commission_sync.update",
    "ib_commission.sync.update",
  ])
);

// Filters
const statusFilter = ref(""); // '' | 'open' | 'closed'
const loginFilter = ref("");
const ibIdFilter = ref("");
const symbolFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const dateField = ref("close_time");

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

const isRebuildModalOpen = ref(false);
const searchTimer = ref(null);

const hasActiveFilters = computed(() => {
  return (
    !!statusFilter.value ||
    !!loginFilter.value ||
    !!ibIdFilter.value ||
    !!symbolFilter.value ||
    !!dateFrom.value ||
    !!dateTo.value
  );
});

const dateFieldOptions = [
  { label: "Close Time", value: "close_time" },
  { label: "Open Time", value: "open_time" },
  { label: "Either (Open or Close)", value: "either" },
];

onMounted(() => {
  loadTrades(1);
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

const loadTrades = (page = 1, force = false) => {
  const loginVal = loginFilter.value != null ? String(loginFilter.value).trim() : "";
  const ibIdVal = ibIdFilter.value != null ? String(ibIdFilter.value).trim() : "";
  const symbolVal = symbolFilter.value != null ? String(symbolFilter.value).trim() : "";

  const params = {
    status: statusFilter.value || undefined,
    login: loginVal ? Number(loginVal) : undefined,
    ib_id: ibIdVal ? Number(ibIdVal) : undefined,
    symbol: symbolVal ? symbolVal.toUpperCase() : undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
    date_field: dateField.value || "close_time",
    page,
    per_page: store.tradesPagination.per_page || 50,
  };

  store.fetchTrades(params, force);
};

const handleFilterChange = () => {
  if (searchTimer.value) clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    loadTrades(1, true);
  }, 350);
};

const handleResetFilters = () => {
  statusFilter.value = "";
  loginFilter.value = "";
  ibIdFilter.value = "";
  symbolFilter.value = "";
  dateFrom.value = "";
  dateTo.value = "";
  dateField.value = "close_time";
  loadTrades(1, true);
};

const handlePageChange = (newPage) => {
  loadTrades(newPage, true);
};

const handlePerPageChange = (newPerPage) => {
  const perPageVal =
    typeof newPerPage === "object" && newPerPage !== null
      ? newPerPage.per_page || newPerPage.value || 50
      : newPerPage;
  store.tradesPagination.per_page = Number(perPageVal) || 50;
  loadTrades(1, true);
};

const columns = [
  { key: "id", label: "ID", width: "90px", sortable: true },
  { key: "status", label: "Status", align: "center", width: "100px" },
  { key: "login", label: "Login & Position", width: "150px" },
  { key: "symbol", label: "Symbol", width: "130px", sortable: true },
  { key: "mt5_group", label: "MT5 Group", width: "200px" },
  { key: "mappings", label: "Mappings (BG / SG / Link)", width: "190px" },
  { key: "volumes", label: "Closed Volume & Lots", align: "right", width: "160px" },
  { key: "times", label: "Timestamps", width: "170px" },
  { key: "calculated", label: "Calculated?", align: "center", width: "120px" },
];

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  return isNaN(d.getTime()) ? val : d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
</script>

<template>
  <div class="space-y-4">
    <!-- Trades DataTable -->
    <DataTable
      :columns="columns"
      :data="store.tradesList"
      :loading="store.loading"
      :pagination="store.tradesPagination"
      row-key="id"
      table-key="commission-trades-table"
      :per-page-options="[20, 50, 100, 200]"
      empty-title="No trades found"
      empty-text="No MT5 trading records match the current filter criteria."
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
              class="inline-flex p-1 rounded-xl bg-background border border-primary-border shrink-0 self-start sm:self-auto shadow-2xs"
            >
              <!-- All Trades -->
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
                <span>All Trades</span>
              </button>

              <!-- Closed Only -->
              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                :class="[
                  statusFilter === 'closed'
                    ? 'bg-primary text-white shadow-2xs font-bold'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60',
                ]"
                @click="
                  statusFilter = 'closed';
                  handleFilterChange();
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="statusFilter === 'closed' ? 'bg-white' : 'bg-primary/80'"
                />
                <span>Closed Only</span>
              </button>

              <!-- Open Only -->
              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                :class="[
                  statusFilter === 'open'
                    ? 'bg-primary-green text-white shadow-2xs font-bold'
                    : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60',
                ]"
                @click="
                  statusFilter = 'open';
                  handleFilterChange();
                "
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="statusFilter === 'open' ? 'bg-white' : 'bg-primary-green/80'"
                />
                <span>Open Only</span>
              </button>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
              <!-- Rebuild Trades Ops Button -->
              <button
                v-if="canSync"
                type="button"
                :disabled="store.actionLoading"
                class="flex items-center gap-1.5 px-3.5 py-1.5 bg-card-background border border-primary-border hover:bg-background text-primary-text text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Reconstruct trade positions"
                @click="isRebuildModalOpen = true"
              >
                <HugeIcon :icon="DatabaseIcon" :size="14" />
                <span>Rebuild Trades</span>
              </button>

              <!-- Refresh Button -->
            
              <button
                type="button"
                :disabled="store.loading"
                class="flex items-center justify-center w-8 h-8 border border-primary-border rounded-xl text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
                @click="loadTrades(store.tradesPagination.page, true)"
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
            <div class="relative w-36 sm:w-44">
              <HugeIcon
                :icon="Search01Icon"
                :size="13"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
              />
              <input
                v-model="symbolFilter"
                type="text"
                placeholder="Symbol (e.g. XAU)"
                class="input-field w-full pl-7 pr-3 py-1.5 text-xs font-mono uppercase"
                @input="handleFilterChange"
              />
            </div>

            <div class="h-5 w-px bg-primary-border/60 hidden xl:block mx-0.5" />

            <!-- Date Field Select -->
            <div class="w-40 sm:w-44">
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
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          :class="
            row.trade_status === 'closed'
              ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
              : 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="row.trade_status === 'closed' ? 'bg-primary-green' : 'bg-primary-yellow'"
          />
          {{ row.trade_status === 'closed' ? "Closed" : "Open" }}
        </span>
      </template>

      <!-- Cell: Login & Position -->
      <template #cell-login="{ row }">
        <div class="text-xs font-mono">
          <p class="font-bold text-primary-text">Login: {{ row.login }}</p>
          <p class="text-[10px] text-secondary-text">Pos: #{{ row.position_id }}</p>
        </div>
      </template>

      <!-- Cell: Symbol -->
      <template #cell-symbol="{ row }">
        <div class="text-xs">
          <span
            class="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-mono font-bold"
          >
            {{ row.symbol }}
          </span>
          <p class="text-[10px] text-secondary-text font-mono mt-0.5">
            CCY: {{ row.account_currency || "USD" }}
          </p>
        </div>
      </template>

      <!-- Cell: MT5 Group -->
      <template #cell-mt5_group="{ row }">
        <Tooltip
          v-if="row.mt5_group"
          :text="row.mt5_group"
          position="center"
          block
        >
          <span class="text-xs font-mono text-secondary-text block ">
            {{ row.mt5_group }}
          </span>
        </Tooltip>
        <span v-else class="text-xs font-mono text-secondary-text">
          -
        </span>
      </template>

      <!-- Cell: Mappings (BG, SG, Link) -->
      <template #cell-mappings="{ row }">
        <div class="text-[11px] font-mono space-y-0.5">
          <p>
            <span class="text-secondary-text">BG:</span>
            <span :class="row.broker_group_config_id ? 'text-primary-text font-semibold' : 'text-primary-red'">
              {{ row.broker_group_config_id ? `#${row.broker_group_config_id}` : 'None' }}
            </span>
            &middot;
            <span class="text-secondary-text">SG:</span>
            <span :class="row.symbol_group_id ? 'text-primary-text font-semibold' : 'text-primary-red'">
              {{ row.symbol_group_id ? `#${row.symbol_group_id}` : 'None' }}
            </span>
          </p>
          <p>
            <span class="text-secondary-text">IB:</span>
            <strong class="text-primary-text font-semibold">#{{ row.ib_id ?? '-' }}</strong>
            &middot;
            <span class="text-secondary-text">Link:</span>
            <span>{{ row.referral_link_id ? `#${row.referral_link_id}` : '-' }}</span>
          </p>
        </div>
      </template>

      <!-- Cell: Volumes & Lots -->
      <template #cell-volumes="{ row }">
        <div class="text-xs font-mono text-right">
          <p class="font-bold text-primary-text">
            {{ row.closed_volume_lots !== undefined ? `${row.closed_volume_lots} lots` : `${row.volume_entry_lots ?? '-'} lots` }}
          </p>
          <p class="text-[10px] text-secondary-text">
            Spread: {{ row.closed_spread ?? row.open_spread ?? '-' }} &middot; Vol: {{ row.closed_volume ?? row.open_volume ?? '-' }}
          </p>
        </div>
      </template>

      <!-- Cell: Timestamps -->
      <template #cell-times="{ row }">
        <div class="text-[11px] text-secondary-text space-y-0.5">
          <p v-if="row.close_time">
            Close: <span class="text-primary-text font-mono">{{ formatDate(row.close_time) }}</span>
          </p>
          <p v-if="row.open_time">
            Open: <span class="font-mono">{{ formatDate(row.open_time) }}</span>
          </p>
        </div>
      </template>

      <!-- Cell: Calculated? -->
      <template #cell-calculated="{ row }">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          :class="
            row.commission_calculated
              ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
              : 'bg-background text-secondary-text border border-primary-border'
          "
        >
          <HugeIcon
            :icon="row.commission_calculated ? Tick02Icon : Alert02Icon"
            :size="11"
          />
          <span>{{ row.commission_calculated ? "Calculated" : "Uncalculated" }}</span>
        </span>
      </template>
    </DataTable>

    <!-- Rebuild Trades Ops Modal -->
    <RebuildTradesModal
      v-model="isRebuildModalOpen"
      :initial-filters="{
        ib_id: ibIdFilter,
        login: loginFilter,
        date_from: dateFrom,
        date_to: dateTo,
        date_field: dateField,
      }"
      @rebuilt="loadTrades(store.tradesPagination.page, true)"
    />
  </div>
</template>
