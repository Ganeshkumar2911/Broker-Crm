<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Folder01Icon,
  PlusSignIcon,
  Search01Icon,
  RefreshCwIcon,
  Edit02Icon,
  Delete02Icon,
  Tag01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import SymbolGroupModal from "../components/SymbolGroupModal.vue";
import GroupMembersDrawer from "../components/GroupMembersDrawer.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canCreate = computed(() =>
  hasPermission(["ib_commission_symbol_groups.create", "ib_commission.symbol_groups.create"])
);
const canEdit = computed(() =>
  hasPermission(["ib_commission_symbol_groups.update", "ib_commission.symbol_groups.update"])
);
const canDelete = computed(() =>
  hasPermission(["ib_commission_symbol_groups.delete", "ib_commission.symbol_groups.delete"])
);

const searchQuery = ref("");
const isModalOpen = ref(false);
const editingGroup = ref(null);

const isDrawerOpen = ref(false);
const activeDrawerGroup = ref(null);

const isDeleteDialogOpen = ref(false);
const groupToDelete = ref(null);

onMounted(() => {
  if (!store.isFetched.symbolGroups) {
    store.fetchSymbolGroups({ active_only: false });
  }
});

const page = ref(1);
const perPage = ref(10);

const filteredGroups = computed(() => {
  const list = store.symbolGroups || [];
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.trim().toLowerCase();
  return list.filter(
    (g) =>
      g.name?.toLowerCase().includes(q) ||
      g.code?.toLowerCase().includes(q)
  );
});

const paginatedGroups = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return filteredGroups.value.slice(start, start + perPage.value);
});

const paginationState = computed(() => {
  const total = filteredGroups.value.length;
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
  { key: "group", label: "Group Name & Code", sortable: true },
  { key: "currency", label: "Currency", align: "center", width: "100px", sortable: true },
  { key: "sort_order", label: "Sort Order", align: "center", width: "110px", sortable: true },
  { key: "member_count", label: "Mapped Symbols", align: "center", width: "160px", sortable: true },
  { key: "status", label: "Status", align: "center", width: "120px" },
  { key: "actions", label: "Actions", align: "right", width: "160px" },
];

const openCreateModal = () => {
  editingGroup.value = null;
  isModalOpen.value = true;
};

const openEditModal = (group) => {
  editingGroup.value = group;
  isModalOpen.value = true;
};

const openMembersDrawer = (group) => {
  activeDrawerGroup.value = group;
  isDrawerOpen.value = true;
};

const openDeleteConfirm = (group) => {
  groupToDelete.value = group;
  isDeleteDialogOpen.value = true;
};

const handleDeleteConfirm = async () => {
  if (!groupToDelete.value?.id) return;
  try {
    await store.deleteSymbolGroup(groupToDelete.value.id);
    isDeleteDialogOpen.value = false;
    groupToDelete.value = null;
  } catch (err) {
    // Handled in store
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- Symbol Groups DataTable with integrated Toolbar & Pagination -->
    <DataTable
      :columns="columns"
      :data="paginatedGroups"
      :loading="store.loading"
      :pagination="paginationState"
      table-key="symbol-groups-table"
      :per-page-options="[10, 20, 50]"
      empty-title="No symbol groups found"
      empty-text="Create your first symbol group (e.g. Forex Major, Gold) to map MT5 trading symbols."
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <!-- Toolbar Slot -->
      <template #toolbar>
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <!-- Search Input -->
          <div class="relative w-full sm:w-80">
            <HugeIcon
              :icon="Search01Icon"
              :size="14"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search symbol groups by name or code..."
              class="input-field w-full pl-8 pr-8 py-1.5 text-xs"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
              @click="searchQuery = ''"
            >
              <HugeIcon :icon="Cancel01Icon" :size="13" />
            </button>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              :disabled="store.loading"
              class="p-2 border border-primary-border rounded-xl text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              title="Refresh Groups"
              @click="store.fetchSymbolGroups({ active_only: false }, true)"
            >
              <HugeIcon
                :icon="RefreshCwIcon"
                :size="14"
                :class="{ 'animate-spin': store.loading }"
              />
            </button>

            <button
              v-if="canCreate"
              type="button"
              class="btn-primary"
              @click="openCreateModal"
            >
              <HugeIcon :icon="PlusSignIcon" :size="14" />
              <span>Add Symbol Group</span>
            </button>
          </div>
        </div>
      </template>

      <!-- Custom Cell: Group Name & Code -->
      <template #cell-group="{ row }">
        <div class="flex items-center gap-3 py-0.5">
          <div
            class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 font-bold"
          >
            <HugeIcon :icon="Folder01Icon" :size="16" />
          </div>
          <div>
            <p class="text-xs font-bold text-primary-text">
              {{ row.name }}
            </p>
            <p v-if="row.code" class="text-[11px] font-mono text-secondary-text">
              {{ row.code }}
            </p>
          </div>
        </div>
      </template>

      <!-- Custom Cell: Currency -->
      <template #cell-currency="{ row }">
        <span class="font-mono text-[11px] font-bold text-primary">
          {{ row.currency || "—" }}
        </span>
      </template>

      <!-- Custom Cell: Sort Order -->
      <template #cell-sort_order="{ row }">
        <span class="font-mono text-xs font-semibold text-secondary-text">
          {{ row.sort_order ?? 1 }}
        </span>
      </template>

      <!-- Custom Cell: Mapped Symbols Count -->
      <template #cell-member_count="{ row }">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background hover:bg-primary/10 hover:text-primary border border-primary-border text-xs font-mono font-semibold text-primary-text transition-colors cursor-pointer"
          @click="openMembersDrawer(row)"
          title="Click to view and manage symbols"
        >
          <HugeIcon :icon="Tag01Icon" :size="13" class="text-primary" />
          <span>{{ row.member_count || 0 }} symbols</span>
        </button>
      </template>

      <!-- Custom Cell: Status -->
      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          :class="
            row.is_active
              ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
              : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
          "
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="row.is_active ? 'bg-primary-green' : 'bg-primary-red'" />
          {{ row.is_active ? "Active" : "Inactive" }}
        </span>
      </template>

      <!-- Custom Cell: Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1.5">
          <button
            type="button"
            class="flex items-center gap-1 px-2.5 py-1 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-semibold cursor-pointer"
            @click="openMembersDrawer(row)"
          >
            <HugeIcon :icon="Tag01Icon" :size="13" />
            <span>Members</span>
          </button>

          <button
            v-if="canEdit"
            type="button"
            class="p-1.5 text-secondary-text hover:text-primary hover:bg-background rounded-lg transition-colors cursor-pointer"
            title="Edit Group"
            @click="openEditModal(row)"
          >
            <HugeIcon :icon="Edit02Icon" :size="14" />
          </button>

          <button
            v-if="canDelete"
            type="button"
            class="p-1.5 text-secondary-text hover:text-primary-red hover:bg-primary-red/10 rounded-lg transition-colors cursor-pointer"
            title="Delete Group"
            @click="openDeleteConfirm(row)"
          >
            <HugeIcon :icon="Delete02Icon" :size="14" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Modals and Drawers -->
    <SymbolGroupModal
      v-model="isModalOpen"
      :group="editingGroup"
      @saved="store.fetchSymbolGroups({ active_only: false }, true)"
    />

    <GroupMembersDrawer
      v-model="isDrawerOpen"
      :group="activeDrawerGroup"
      @updated="store.fetchSymbolGroups({ active_only: false }, true)"
    />

    <ConfirmationDialog
      :open="isDeleteDialogOpen"
      title="Delete Symbol Group"
      :message="`Are you sure you want to delete the symbol group '${groupToDelete?.name}'? Mapped symbols will become unassigned.`"
      confirm-text="Delete Group"
      type="danger"
      :loading="store.actionLoading"
      @confirm="handleDeleteConfirm"
      @cancel="isDeleteDialogOpen = false"
    />
  </div>
</template>
