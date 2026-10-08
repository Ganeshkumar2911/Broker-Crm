<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Search01Icon,
  RefreshCwIcon,
  Tag01Icon,
  Folder01Icon,
  Delete02Icon,
  FilterIcon,
  Tick02Icon,
  Cancel01Icon,
  Layers01Icon,
  PlusSignIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BulkAssignSymbolsModal from "../components/BulkAssignSymbolsModal.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canAssign = computed(() =>
  hasPermission(["ib_commission_symbol_groups.update", "ib_commission.symbol_groups.update"])
);
const canUnassign = computed(() =>
  hasPermission([
    "ib_commission_symbol_groups.delete",
    "ib_commission.symbol_groups.delete",
    "ib_commission_symbol_groups.update",
    "ib_commission.symbol_groups.update",
  ])
);
const canManage = computed(() => canAssign.value);

// Filters state
const searchQuery = ref("");
const unmappedFilter = ref("all"); // 'all' | 'unmapped'
const selectedGroupFilter = ref(null);
const selectedSymbols = ref([]);
const isBulkModalOpen = ref(false);
const isUnassignConfirmOpen = ref(false);
const symbolToUnassign = ref(null);
const symbolGroupNameToUnassign = ref("");
const searchTimer = ref(null);

onMounted(() => {
  if (!store.isFetched.symbolGroups) {
    store.fetchSymbolGroups({ active_only: false });
  }
  loadSymbols(1);
});

const loadSymbols = (page = 1, force = false) => {
  const params = {
    q: searchQuery.value.trim() || undefined,
    unmapped_only: unmappedFilter.value === "unmapped",
    page,
    per_page: store.symbolsPagination.per_page || 50,
  };

  store.fetchSymbols(params, force);
};

const handleSearchInput = () => {
  if (searchTimer.value) clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    selectedSymbols.value = [];
    loadSymbols(1, true);
  }, 350);
};

const handleClearSearch = () => {
  searchQuery.value = "";
  selectedSymbols.value = [];
  loadSymbols(1, true);
};

const setUnmappedFilter = (mode) => {
  unmappedFilter.value = mode;
  selectedSymbols.value = [];
  loadSymbols(1, true);
};

const handlePageChange = (newPage) => {
  loadSymbols(newPage, true);
};

const handlePerPageChange = (newPerPage) => {
  const perPageVal =
    typeof newPerPage === "object" && newPerPage !== null
      ? newPerPage.per_page || newPerPage.value || 50
      : newPerPage;
  store.symbolsPagination.per_page = Number(perPageVal) || 50;
  loadSymbols(1, true);
};

// Map group name and code from symbol_group_id
const getGroupInfo = (groupId) => {
  if (!groupId) return null;
  const g = (store.symbolGroups || []).find((grp) => grp.id === groupId);
  return g ? g : { id: groupId, name: `Group #${groupId}` };
};

const symbolGroupOptions = computed(() => {
  return (store.symbolGroups || []).map((g) => ({
    label: `${g.name}${g.code ? ` (${g.code})` : ""}`,
    value: g.id,
  }));
});

// Filtered symbols on client-side if group filter is applied
const displayedSymbols = computed(() => {
  const list = store.symbolsList || [];
  if (!selectedGroupFilter.value) return list;
  return list.filter((s) => String(s.symbol_group_id) === String(selectedGroupFilter.value));
});

const tablePagination = computed(() => {
  if (selectedGroupFilter.value) {
    const total = displayedSymbols.value.length;
    const perPage = Number(store.symbolsPagination.per_page) || 50;
    const pages = Math.max(1, Math.ceil(total / perPage));
    return {
      page: 1,
      per_page: perPage,
      total_items: total,
      total_pages: pages,
      total,
      pages,
    };
  }
  return store.symbolsPagination;
});

const columns = [
  {
    key: "symbol",
    label: "Symbol / Description",
    sortable: true,
    width: "240px",
  },
  {
    key: "path",
    label: "MT5 Path",
    sortable: true,
    width: "220px",
  },
  {
    key: "specs",
    label: "Contract Specs",
    align: "center",
    width: "160px",
  },
  {
    key: "currency",
    label: "Currency",
    align: "center",
    width: "140px",
  },
  {
    key: "mapped_group",
    label: "Assigned Group",
    align: "center",
    width: "200px",
  },
  {
    key: "status",
    label: "Status",
    align: "center",
    width: "110px",
  },
  {
    key: "actions",
    label: "Actions",
    align: "right",
    width: "130px",
  },
];

const openBulkAssign = (symbolsToAssign = null) => {
  if (Array.isArray(symbolsToAssign)) {
    selectedSymbols.value = symbolsToAssign;
  }
  isBulkModalOpen.value = true;
};

const openUnassignConfirm = (row) => {
  symbolToUnassign.value = row.symbol;
  const group = getGroupInfo(row.symbol_group_id);
  symbolGroupNameToUnassign.value = group?.name || `Group #${row.symbol_group_id}`;
  isUnassignConfirmOpen.value = true;
};

const handleConfirmUnassign = async () => {
  if (!symbolToUnassign.value) return;
  try {
    await store.unassignSymbols({ symbols: [symbolToUnassign.value] });
    isUnassignConfirmOpen.value = false;
    symbolToUnassign.value = null;
    loadSymbols(store.symbolsPagination.page, true);
  } catch (err) {
    // Handled in store
  }
};

const handleAssignedCallback = () => {
  selectedSymbols.value = [];
  loadSymbols(store.symbolsPagination.page, true);
};
</script>

<template>
  <div class="space-y-4">
    <!-- Main DataTable with integrated Toolbar & Pagination -->
    <DataTable
      :columns="columns"
      :data="displayedSymbols"
      :loading="store.loading"
      :pagination="tablePagination"
      :selectable="canManage"
      v-model:selected="selectedSymbols"
      row-key="symbol"
      table-key="symbols-catalog-table"
      :per-page-options="[20, 50, 100, 200]"
      empty-title="No trading symbols found"
      empty-text="Try adjusting your search query or filter options to locate MT5 symbols."
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <!-- Toolbar Slot: Search, Filter Tabs, Group Filter, and Batch Actions -->
      <template #toolbar>
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <!-- Left: Search & Filter Pills -->
          <div class="flex flex-wrap items-center gap-2.5 flex-1">
            <!-- Search Input -->
            <div class="relative w-full sm:w-72">
              <HugeIcon
                :icon="Search01Icon"
                :size="14"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search symbol (e.g. XAUUSD, EUR, BTC)..."
                class="input-field w-full pl-8 pr-8 py-1.5 text-xs font-mono uppercase"
                @input="handleSearchInput"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
                @click="handleClearSearch"
              >
                <HugeIcon :icon="Cancel01Icon" :size="13" />
              </button>
            </div>

            <!-- Filter Pills (All / Unmapped Only) -->
            <div class="inline-flex p-1 rounded-lg bg-background border border-primary-border shrink-0">
              <button
                type="button"
                class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                :class="[
                  unmappedFilter === 'all'
                    ? 'bg-card-background text-primary-text font-bold shadow-2xs'
                    : 'text-secondary-text hover:text-primary-text'
                ]"
                @click="setUnmappedFilter('all')"
              >
                All Symbols
              </button>
              <button
                type="button"
                class="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                :class="[
                  unmappedFilter === 'unmapped'
                    ? 'bg-primary text-white font-bold'
                    : 'text-secondary-text hover:text-primary-text'
                ]"
                @click="setUnmappedFilter('unmapped')"
              >
                Unmapped Only
              </button>
            </div>

            <!-- Group Filter Dropdown using BaseSelect -->
            <div v-if="unmappedFilter === 'all' && store.symbolGroups?.length" class="w-56 shrink-0">
              <BaseSelect
                v-model="selectedGroupFilter"
                :options="symbolGroupOptions"
                placeholder="All Symbol Groups"
                :allow-all="true"
                all-label="All Symbol Groups"
                variant="surface"
                :searchable="true"
                :local-search="true"
              />
            </div>
          </div>

          <!-- Right: Action Buttons -->
          <div class="flex items-center gap-2.5 justify-end shrink-0">
            <!-- Batch Action Button (When selected) -->
            <button
              v-if="canManage && selectedSymbols.length > 0"
              type="button"
              class="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
              @click="openBulkAssign()"
            >
              <HugeIcon :icon="Tag01Icon" :size="14" />
              <span>Assign Selected ({{ selectedSymbols.length }})</span>
            </button>

            <!-- Refresh Button -->
            <button
              type="button"
              :disabled="store.loading"
              class="p-2 border border-primary-border rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              title="Refresh Catalog"
              @click="loadSymbols(store.symbolsPagination.page, true)"
            >
              <HugeIcon
                :icon="RefreshCwIcon"
                :size="14"
                :class="{ 'animate-spin': store.loading }"
              />
            </button>
          </div>
        </div>
      </template>

      <!-- Custom Cell: Symbol & Description -->
      <template #cell-symbol="{ row }">
        <div class="flex items-center gap-2.5 py-0.5">
          <span
            class="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono font-bold text-primary shrink-0"
          >
            {{ row.symbol }}
          </span>
          <div class="min-w-0">
            <p v-if="row.description" class="text-xs font-medium text-primary-text truncate max-w-[180px]">
              {{ row.description }}
            </p>
            <p class="text-[10px] text-secondary-text font-mono">
              ID: #{{ row.id }} &middot; {{ row.source || "mt5" }}
            </p>
          </div>
        </div>
      </template>

      <!-- Custom Cell: MT5 Path -->
      <template #cell-path="{ row }">
        <span class="text-xs font-mono text-secondary-text block">
          {{ row.path || "Direct Symbol" }}
        </span>
      </template>

      <!-- Custom Cell: Contract Specs -->
      <template #cell-specs="{ row }">
        <div class="text-[11px] text-secondary-text space-y-0.5 text-center font-mono">
          <p>Digits: <strong class="text-primary-text font-bold">{{ row.digits ?? '-' }}</strong></p>
          <p v-if="row.contract_size" class="text-[10px] text-secondary-text">
            Size: {{ Number(row.contract_size).toLocaleString() }}
          </p>
        </div>
      </template>

      <!-- Custom Cell: Currency -->
      <template #cell-currency="{ row }">
        <div class="text-center font-mono text-xs">
          <span v-if="row.currency_base || row.currency_profit" class="font-semibold text-primary-text">
            {{ row.currency_base || '-' }} / {{ row.currency_profit || '-' }}
          </span>
          <span v-else class="text-secondary-text">-</span>
        </div>
      </template>

      <!-- Custom Cell: Mapped Group -->
      <template #cell-mapped_group="{ row }">
        <div class="text-center">
          <span
            v-if="row.symbol_group_id"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold"
          >
            <HugeIcon :icon="Folder01Icon" :size="12" />
            <span>{{ getGroupInfo(row.symbol_group_id)?.name }}</span>
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-background text-secondary-text border border-primary-border text-[11px] font-medium"
          >
            Unassigned
          </span>
        </div>
      </template>

      <!-- Custom Cell: Status -->
      <template #cell-status="{ row }">
        <div class="text-center">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            :class="
              row.is_active !== false
                ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
            "
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="row.is_active !== false ? 'bg-primary-green' : 'bg-primary-red'" />
            {{ row.is_active !== false ? "Active" : "Inactive" }}
          </span>
        </div>
      </template>

      <!-- Custom Cell: Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1.5">
          <button
            v-if="canAssign && !row.symbol_group_id"
            type="button"
            class="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-semibold cursor-pointer"
            @click="openBulkAssign([row.symbol])"
          >
            <HugeIcon :icon="Tag01Icon" :size="12" />
            <span>Assign</span>
          </button>

          <button
            v-if="canUnassign && row.symbol_group_id"
            type="button"
            class="p-1.5 text-secondary-text hover:text-primary-red hover:bg-primary-red/10 rounded-lg transition-colors cursor-pointer"
            title="Unassign symbol from group"
            @click="openUnassignConfirm(row)"
          >
            <HugeIcon :icon="Delete02Icon" :size="14" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Bulk Assign Modal -->
    <BulkAssignSymbolsModal
      v-model="isBulkModalOpen"
      :symbols="selectedSymbols"
      @assigned="handleAssignedCallback"
    />

    <!-- Unassign Confirmation Dialog -->
    <ConfirmationDialog
      :open="isUnassignConfirmOpen"
      title="Unassign Symbol"
      :message="`Are you sure you want to unassign '${symbolToUnassign}' from '${symbolGroupNameToUnassign}'?`"
      confirm-text="Unassign Symbol"
      type="danger"
      :loading="store.actionLoading"
      @confirm="handleConfirmUnassign"
      @cancel="isUnassignConfirmOpen = false"
    />
  </div>
</template>
