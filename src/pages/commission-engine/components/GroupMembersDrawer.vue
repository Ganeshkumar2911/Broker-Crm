<script setup>
import { ref, watch, computed } from "vue";
import {
  Cancel01Icon,
  Search01Icon,
  PlusSignIcon,
  Delete02Icon,
  Loading03Icon,
  Folder01Icon,
  Tag01Icon,
  RefreshCwIcon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  group: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "updated"]);

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canAssign = computed(() =>
  hasPermission(["ib_commission_symbol_groups.update", "ib_commission.symbol_groups.update"])
);
const canRemove = computed(() =>
  hasPermission([
    "ib_commission_symbol_groups.delete",
    "ib_commission.symbol_groups.delete",
    "ib_commission_symbol_groups.update",
    "ib_commission.symbol_groups.update",
  ])
);

const searchQuery = ref("");
const newSymbolInput = ref("");
const selectedSymbolsToRemove = ref([]);
const page = ref(1);
const perPage = ref(10);

watch(
  () => [props.modelValue, props.group?.id],
  ([isOpen, groupId]) => {
    if (isOpen && groupId) {
      searchQuery.value = "";
      newSymbolInput.value = "";
      selectedSymbolsToRemove.value = [];
      page.value = 1;
      store.fetchSymbolGroupMembers(groupId, true);
    }
  },
  { immediate: true }
);

const filteredMembers = computed(() => {
  const list = store.symbolGroupMembers || [];
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.trim().toUpperCase();
  return list.filter((m) => (m.symbol || "").toUpperCase().includes(q));
});

const paginatedMembers = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return filteredMembers.value.slice(start, start + perPage.value);
});

const drawerPagination = computed(() => {
  const total = filteredMembers.value.length;
  const total_pages = Math.max(1, Math.ceil(total / perPage.value));
  return {
    page: page.value,
    per_page: perPage.value,
    total_items: total,
    total_pages,
    total,
    pages: total_pages,
  };
});

const handlePageChange = (newPage) => {
  page.value = newPage;
};

const handlePerPageChange = (newPerPage) => {
  const perPageVal =
    typeof newPerPage === "object" && newPerPage !== null
      ? newPerPage.per_page || newPerPage.value || 10
      : newPerPage;
  perPage.value = Number(perPageVal) || 10;
  page.value = 1;
};

const columns = [
  { key: "symbol", label: "Symbol", sortable: true },
  { key: "actions", label: "Actions", align: "right", width: "90px" },
];

const closeDrawer = () => {
  emit("update:modelValue", false);
};

const handleAddSymbols = async () => {
  if (!newSymbolInput.value.trim() || !props.group?.id) return;
  const rawSymbols = newSymbolInput.value
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawSymbols.length === 0) return;

  try {
    await store.assignSymbolsToGroup(props.group.id, {
      symbols: rawSymbols,
      replace: false,
    });
    newSymbolInput.value = "";
    emit("updated");
  } catch (err) {
    // Handled in store
  }
};

const handleRemoveSingleSymbol = async (symbol) => {
  if (!symbol) return;
  try {
    await store.unassignSymbols({ symbols: [symbol] });
    if (props.group?.id) {
      await store.fetchSymbolGroupMembers(props.group.id, true);
    }
    emit("updated");
  } catch (err) {
    // Handled in store
  }
};

const handleBulkRemove = async () => {
  if (selectedSymbolsToRemove.value.length === 0) return;
  const symbols = selectedSymbolsToRemove.value.map((s) => (typeof s === "object" ? s.symbol : s));
  try {
    await store.unassignSymbols({ symbols });
    selectedSymbolsToRemove.value = [];
    if (props.group?.id) {
      await store.fetchSymbolGroupMembers(props.group.id, true);
    }
    emit("updated");
  } catch (err) {
    // Handled in store
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
        @click.self="closeDrawer"
      >
        <div
          class="w-full max-w-lg bg-card-background border-l border-primary-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out"
        >
          <!-- Drawer Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-card-background shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20"
              >
                <HugeIcon :icon="Folder01Icon" :size="20" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="title-text text-base text-primary-text font-bold">
                    {{ group?.name || "Symbol Group Members" }}
                  </h3>
                  <span
                    v-if="group?.code"
                    class="px-2 py-0.5 rounded-md bg-background border border-primary-border text-[11px] font-mono text-secondary-text"
                  >
                    {{ group.code }}
                  </span>
                </div>
                <p class="text-xs text-secondary-text">
                  {{ store.symbolGroupMembers?.length || 0 }} MT5 trading symbols assigned
                </p>
              </div>
            </div>

            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="closeDrawer"
            >
              <HugeIcon :icon="Cancel01Icon" :size="18" />
            </button>
          </div>

          <!-- Add Symbols Form -->
          <div
            v-if="canAssign"
            class="p-4 bg-background/50 border-b border-primary-border space-y-2 shrink-0"
          >
            <label class="block text-xs font-semibold text-primary-text">
              Assign New Symbols
            </label>
            <div class="flex gap-2">
              <input
                v-model="newSymbolInput"
                type="text"
                placeholder="e.g. XAUUSD, EURUSD, BTCUSD"
                class="input-field flex-1 px-3 py-2 text-xs font-mono"
                @keydown.enter.prevent="handleAddSymbols"
              />
              <button
                type="button"
                :disabled="store.actionLoading || !newSymbolInput.trim()"
                class="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                @click="handleAddSymbols"
              >
                <HugeIcon
                  v-if="store.actionLoading"
                  :icon="Loading03Icon"
                  :size="14"
                  class="animate-spin"
                />
                <HugeIcon v-else :icon="PlusSignIcon" :size="14" />
                <span>Assign</span>
              </button>
            </div>
            <p class="text-[11px] text-secondary-text">
              Type or paste one or more symbols (comma/space separated) to add to this group.
            </p>
          </div>

          <!-- Members DataTable Area -->
          <div class="flex-1 overflow-hidden p-4">
            <DataTable
              :columns="columns"
              :data="paginatedMembers"
              :loading="store.loading"
              :pagination="drawerPagination"
              :selectable="canRemove"
              v-model:selected="selectedSymbolsToRemove"
              row-key="symbol"
              table-key="group-members-table"
              :per-page-options="[10, 20, 50]"
              empty-title="No symbols in group"
              empty-text="Use the input above or Symbols Catalog tab to map symbols to this group."
              @page-change="handlePageChange"
              @per-page-change="handlePerPageChange"
            >
              <!-- Toolbar Slot -->
              <template #toolbar>
                <div class="flex items-center justify-between gap-2">
                  <div class="relative flex-1">
                    <HugeIcon
                      :icon="Search01Icon"
                      :size="13"
                      class="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
                    />
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search member symbol..."
                      class="input-field w-full pl-7 pr-3 py-1 text-xs font-mono"
                      @input="page = 1"
                    />
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <button
                      v-if="canRemove && selectedSymbolsToRemove.length > 0"
                      type="button"
                      :disabled="store.actionLoading"
                      class="flex items-center gap-1 px-2.5 py-1 bg-primary-red/10 border border-primary-red/20 text-primary-red hover:bg-primary-red/20 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      @click="handleBulkRemove"
                    >
                      <HugeIcon :icon="Delete02Icon" :size="12" />
                      <span>Remove ({{ selectedSymbolsToRemove.length }})</span>
                    </button>

                    <button
                      type="button"
                      :disabled="store.loading"
                      class="p-1.5 border border-primary-border rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
                      title="Refresh"
                      @click="store.fetchSymbolGroupMembers(group?.id, true)"
                    >
                      <HugeIcon
                        :icon="RefreshCwIcon"
                        :size="13"
                        :class="{ 'animate-spin': store.loading }"
                      />
                    </button>
                  </div>
                </div>
              </template>

              <!-- Custom Cell: Symbol -->
              <template #cell-symbol="{ row }">
                <span
                  class="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-xs font-mono font-bold text-primary"
                >
                  {{ row.symbol }}
                </span>
              </template>

              <!-- Custom Cell: Actions -->
              <template #cell-actions="{ row }">
                <button
                  v-if="canRemove"
                  type="button"
                  :disabled="store.actionLoading"
                  class="p-1 text-secondary-text hover:text-primary-red hover:bg-primary-red/10 rounded transition-colors cursor-pointer"
                  title="Remove from group"
                  @click="handleRemoveSingleSymbol(row.symbol)"
                >
                  <HugeIcon :icon="Delete02Icon" :size="13" />
                </button>
              </template>
            </DataTable>
          </div>

          <!-- Drawer Footer -->
          <div
            class="px-6 py-3.5 border-t border-primary-border bg-card-background flex items-center justify-between shrink-0"
          >
            <span class="text-xs text-secondary-text">
              Showing {{ filteredMembers.length }} of {{ store.symbolGroupMembers?.length || 0 }} symbols
            </span>
            <button
              type="button"
              class="px-4 py-1.5 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background border border-primary-border rounded-xl transition-all cursor-pointer"
              @click="closeDrawer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
</style>
