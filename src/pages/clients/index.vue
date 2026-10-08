<script setup>
import { onMounted, computed, ref } from "vue";
import {
  Search,
  Users,
  UserPen,
  Eye,
  UserX,
  UserCheck,
  Pencil,
  UserPlus,
  Plus,
  RefreshCw,
  Trash2,
  Link2,
  LogIn,
  SlidersHorizontal,
  Tag,
  X,
  Landmark,
} from "lucide-vue-next";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import ClientBankAccountsDialog from "@/components/common/ClientBankAccountsDialog.vue";
import { useClientListStore } from "@/stores/clientList/clientList";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { useTagsStore } from "@/stores/tags/tags";
import Pagination from "@/components/common/Pagination.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import DropdownMenu from "@/components/common/DropdownMenu.vue";
import ChangeIBDialog from "@/components/common/ChangeIBDialog.vue";
import ChangeStatusDialog from "@/components/common/ChangeStatusDialog.vue";
import ClientDialog from "@/components/common/ClientDialog.vue";
import MakeIBDialog from "@/components/common/MakeIBDialog.vue";
import DeleteClientDialog from "@/components/common/DeleteClientDialog.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import UpdateReferralLinkDrawer from "@/components/common/UpdateReferralLinkDrawer.vue";
import ClientLoginModal from "@/components/common/ClientLoginModal.vue";
import ManageTransactionsDialog from "@/components/common/ManageTransactionsDialog.vue";
import TagChip from "@/components/common/TagChip.vue";
import TagAssignmentModal from "@/components/common/TagAssignmentModal.vue";
import { useRouter } from "vue-router";
import { useGoToTradingAccount } from "@/composables/useGoToTradingAccount";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { getFlagCode, cleanCountryLabel } from "@/utils/countries";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useRbacStaffStore } from "@/stores/rbac/staff";

const router = useRouter();
const { hasPermission, hasAnyPermission } = usePermissionCheck();

const store = useClientListStore();
const clientDepthStore = useClientDepthStore();
const tagsStore = useTagsStore();
const snackbar = useSnackbarStore();
const rbacStaffStore = useRbacStaffStore();

const canAssignTags = computed(() => {
  return (
    hasAnyPermission(["tags.assign", "tags.update", "tags.remove"]) ||
    hasPermission("client.update")
  );
});

const visibleTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.slice(0, 2);
};

const remainingTags = (tags) => {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.slice(2);
};

const selectedClients = ref([]);
const selectedClientIds = computed(() =>
  selectedClients.value.map((c) => (typeof c === "object" ? c.id : c)),
);

const isAllClientsSelected = computed(() => {
  if (!store.data || store.data.length === 0) return false;
  return store.data.every((c) => selectedClientIds.value.includes(c.id));
});

const isSomeClientsSelected = computed(() => {
  if (!store.data || store.data.length === 0) return false;
  return selectedClientIds.value.length > 0 && !isAllClientsSelected.value;
});

const toggleSelectAllClients = () => {
  if (isAllClientsSelected.value) {
    selectedClients.value = [];
  } else {
    selectedClients.value = [...(store.data || [])];
  }
};

const toggleSelectClient = (clientId) => {
  const idx = selectedClients.value.findIndex(
    (c) => (typeof c === "object" ? c.id : c) === clientId,
  );
  if (idx > -1) {
    selectedClients.value.splice(idx, 1);
  } else {
    const client = (store.data || []).find((c) => c.id === clientId);
    if (client) {
      selectedClients.value.push(client);
    }
  }
};

const clearClientSelection = () => {
  selectedClients.value = [];
};

const tagModal = ref({
  open: false,
  entityType: "user",
  entityId: null,
  entityIds: [],
  currentTags: [],
});

const openClientTagModal = (client) => {
  tagModal.value = {
    open: true,
    entityType: "user",
    entityId: client.id,
    entityIds: [],
    currentTags: client.tags || [],
  };
};

const openBulkClientTagModal = () => {
  if (selectedClientIds.value.length === 0) return;
  tagModal.value = {
    open: true,
    entityType: "user",
    entityId: null,
    entityIds: [...selectedClientIds.value],
    currentTags: [],
  };
};

const handleTagModalUpdated = () => {
  store.fetchClients(store.pagination.page);
};

const autoWithdrawalOptions = [
  { label: 'All Auto Withdrawal Status', value: '' },
  { label: 'Eligible', value: 'true' },
  { label: 'Not Eligible', value: 'false' },
]

const tagOptions = computed(() => {
  const options = [{ label: "All Tags", value: "" }];
  (tagsStore.tags || []).forEach((t) => {
    options.push({
      label: t.name,
      value: String(t.id),
    });
  });
  return options;
});

let searchTimer = null;
let ibSearchTimer = null;

const changeIBDialogOpen = ref(false);
const selectedClientForChangeIB = ref(null);

const makeIBDialogOpen = ref(false);
const selectedClientForMakeIB = ref(null);

const changeStatusDialogOpen = ref(false);
const selectedClientForChangeStatus = ref(null);

const editClientDialogOpen = ref(false);
const selectedClientForEdit = ref(null);

const createClientDialogOpen = ref(false);

const deleteClientDialogOpen = ref(false);
const selectedClientForDelete = ref(null);

const updateReferralLinkDrawerOpen = ref(false);
const selectedClientForReferralLink = ref(null);

const manageTransactionsDialogOpen = ref(false);
const selectedClientForTransactions = ref(null);

const clientLoginModalOpen = ref(false);
const selectedClientForLogin = ref(null);

const editingStaffClientId = ref(null);

const assignDialog = ref({
  open: false,
  loading: false,
  client: null,
  staffId: null,
  staffName: "",
  isEdit: false,
});

const onSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => store.applyFilters(), 400);
};

const onIbSearch = (query) => {
  clearTimeout(ibSearchTimer);
  ibSearchTimer = setTimeout(() => store.searchIbs(query), 350);
};

const hasFilters = computed(
  () => store.filters.search || store.filters.ib_id || store.filters.tag_ids,
);

const handlePageChange = (page) => store.fetchClients(page);

const handlePerPageChange = ({ page, per_page }) => {
  store.pagination.per_page = per_page;
  store.fetchClients(page);
};

const clientColumns = [
  { key: "client", label: "Client", sortable: true, minWidth: 170 },
  { key: "tags", label: "Tags", minWidth: 160 },
  { key: "contact", label: "Contact", minWidth: 180 },
  { key: "address", label: "Address", minWidth: 160 },
  { key: "ib", label: "IB", minWidth: 160 },
  { key: "staff", label: "Ass. Staff", minWidth: 170 },
  { key: "referral_link", label: "Referral Campaign", minWidth: 150 },
  { key: "kyc_status", label: "KYC Status", sortable: true, minWidth: 130 },
  { key: "doc_status", label: "Doc Status", minWidth: 120 },
  { key: "sumsub_id", label: "Sumsub ID", minWidth: 120 },
  { key: "accounts", label: "Accounts", minWidth: 180 },
  { key: "dates", label: "Dates", minWidth: 150 },
  { key: "status", label: "Status", align: "center", minWidth: 100 },
];

const formatDate = (val) =>
  val
    ? new Date(val).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function getRowActions(client) {
  const actions = [];

  const addDivider = () => {
    if (actions.length > 0 && !actions[actions.length - 1].divider) {
      actions.push({ divider: true });
    }
  };

  if (hasPermission("client.view")) {
    actions.push({
      action: "depth",
      label: "Client Depth",
      icon: Eye,
    });
  }

  if (hasPermission("client.update")) {
    addDivider();
    actions.push(
      { action: "edit", label: "Edit Client", icon: Pencil },
      {
        action: "manageTransactions",
        label: "Manage Transactions",
        icon: SlidersHorizontal,
      },
      { action: "changeIB", label: "Change IB", icon: UserPen },
      {
        action: "makeIB",
        label: "Make IB",
        icon: UserPlus,
        hidden: client.is_ib === true,
      },
      {
        action: "updateReferralLink",
        label: "Update Referral Link",
        icon: Link2,
      },
      { divider: true },
      {
        action: "toggleStatus",
        label: client.is_active ? "Deactivate Client" : "Activate Client",
        icon: client.is_active ? UserX : UserCheck,
        danger: client.is_active,
        success: !client.is_active,
      },
    );
  }

  if (hasAnyPermission(["user_bank_accounts.enable_edit"])) {
    addDivider();
    actions.push({
      action: "viewBankAccounts",
      label: "Bank Accounts",
      icon: Landmark,
    });
  }

  if (hasPermission("xtention_dev.login_as_client")) {
    addDivider();
    actions.push({
      action: "clientLogin",
      label: "Client Login",
      icon: LogIn,
    });
  }

  if (client.kyc_status === "pending" && hasPermission("client.delete")) {
    addDivider();
    actions.push({
      action: "delete",
      label: "Delete Client",
      icon: Trash2,
      danger: true,
    });
  }

  return actions;
}

const chooseBgColor = {
  live: "bg-primary-green/10 text-primary-green border border-primary-green/20 hover:bg-primary-green/20",
  demo: "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20 hover:bg-primary-yellow/20",
  copy_trading:
    "bg-primary-red/10 text-primary-red border border-primary-red/20 hover:bg-primary-red/20",
};

function onMenuSelect(item, client) {
  switch (item.action) {
    case "viewBankAccounts":
      return openClientBankAccountsDialog(client);
    case "manageTags":
      return openClientTagModal(client);
    case "clientLogin":
      return handleClientLogin(client);
    case "edit":
      return openEditClientDialog(client);
    case "manageTransactions":
      return openManageTransactionsDialog(client);
    case "changeIB":
      return openChangeIBDialog(client);
    case "makeIB":
      return openMakeIBDialog(client);
    case "updateReferralLink":
      return openUpdateReferralLinkDrawer(client);
    case "toggleStatus":
      return openChangeStatusDialog(client);
    case "depth":
      return openClientDepth(client);
    case "delete":
      return openDeleteClientDialog(client);
  }
}

const clientBankAccountsDialogOpen = ref(false);
const selectedClientForBankAccounts = ref(null);

const openClientBankAccountsDialog = (client) => {
  selectedClientForBankAccounts.value = client;
  clientBankAccountsDialogOpen.value = true;
};

const closeClientBankAccountsDialog = () => {
  clientBankAccountsDialogOpen.value = false;
  selectedClientForBankAccounts.value = null;
};

const handleClientLogin = (client) => {
  if (!client?.id) return;
  selectedClientForLogin.value = client;
  clientLoginModalOpen.value = true;
};

const closeClientLoginModal = () => {
  clientLoginModalOpen.value = false;
  selectedClientForLogin.value = null;
};

const openDeleteClientDialog = (client) => {
  selectedClientForDelete.value = client;
  deleteClientDialogOpen.value = true;
};

const closeDeleteClientDialog = () => {
  deleteClientDialogOpen.value = false;
  selectedClientForDelete.value = null;
};

const handleDeleteSuccess = () => {
  store.fetchClients(store.pagination.page);
};

const { goToTradingAccount } = useGoToTradingAccount();

const expandedAccountsMap = ref({});

const toggleExpandAccounts = (id) => {
  expandedAccountsMap.value[id] = !expandedAccountsMap.value[id];
};

const openChangeIBDialog = (client) => {
  selectedClientForChangeIB.value = client;
  changeIBDialogOpen.value = true;
};

const openClientDepth = (client) => {
  if (!client || !hasPermission("client.view")) return;
  clientDepthStore.reset();
  clientDepthStore.setActiveClient(client);
  router.push(`/client/details/${client.id}`);
};

const closeChangeIBDialog = () => {
  changeIBDialogOpen.value = false;
  selectedClientForChangeIB.value = null;
};

const handleChangeIBSuccess = () => {
  store.fetchClients(store.pagination.page);
};

const openMakeIBDialog = (client) => {
  selectedClientForMakeIB.value = client;
  makeIBDialogOpen.value = true;
};

const closeMakeIBDialog = () => {
  makeIBDialogOpen.value = false;
  selectedClientForMakeIB.value = null;
};

const handleMakeIBSuccess = () => {
  store.fetchClients(store.pagination.page);
};

const openChangeStatusDialog = (client) => {
  selectedClientForChangeStatus.value = client;
  changeStatusDialogOpen.value = true;
};

const closeChangeStatusDialog = () => {
  changeStatusDialogOpen.value = false;
  selectedClientForChangeStatus.value = null;
};

const handleChangeStatusSuccess = () => {
  store.fetchClients(store.pagination.page);
};

const openEditClientDialog = (client) => {
  selectedClientForEdit.value = client;
  editClientDialogOpen.value = true;
};

const closeEditClientDialog = () => {
  editClientDialogOpen.value = false;
  selectedClientForEdit.value = null;
};

const handleEditClientSuccess = () => {
  store.fetchClients(store.pagination.page);
};

const openCreateClientDialog = () => {
  createClientDialogOpen.value = true;
};

const closeCreateClientDialog = () => {
  createClientDialogOpen.value = false;
};

const handleCreateClientSuccess = () => {
  store.fetchClients(1);
};

const openUpdateReferralLinkDrawer = (client) => {
  selectedClientForReferralLink.value = client;
  updateReferralLinkDrawerOpen.value = true;
};

const closeUpdateReferralLinkDrawer = () => {
  updateReferralLinkDrawerOpen.value = false;
  selectedClientForReferralLink.value = null;
};

const handleUpdateReferralLinkSuccess = () => {
  store.fetchClients(store.pagination.page);
};

const openManageTransactionsDialog = (client) => {
  selectedClientForTransactions.value = client;
  manageTransactionsDialogOpen.value = true;
};

const closeManageTransactionsDialog = () => {
  manageTransactionsDialogOpen.value = false;
  selectedClientForTransactions.value = null;
};

const handleManageTransactionsSuccess = () => {
  store.fetchClients(store.pagination.page);
};

const staffOptions = computed(() => {
  return (rbacStaffStore.records || []).map((s) => ({
    value: s.id,
    label:
      s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email,
  }));
});

const promptAssignStaff = (client, staffId) => {
  if (!hasPermission("client.update")) {
    snackbar.show(
      "You do not have permission to assign or update staff.",
      "error",
    );
    return;
  }

  if (!client) {
    snackbar.show("Invalid client record.", "error");
    return;
  }

  if (!staffId) {
    snackbar.show("Please select a staff member.", "warning");
    return;
  }

  const currentStaffId =
    client.staff_assigned?.id ||
    client.assigned_staff?.id ||
    client.assigned_staff_id;

  if (currentStaffId && Number(currentStaffId) === Number(staffId)) {
    snackbar.show(
      "This staff member is already assigned to this client.",
      "info",
    );
    editingStaffClientId.value = null;
    return;
  }

  const currentStaffName =
    client.staff_assigned?.name || client.assigned_staff?.name || null;
  const isEdit = !!currentStaffName;

  const staffObj = (rbacStaffStore.records || []).find((s) => s.id === staffId);
  const staffName = staffObj
    ? staffObj.name ||
      `${staffObj.first_name || ""} ${staffObj.last_name || ""}`.trim() ||
      staffObj.email
    : "selected staff member";

  assignDialog.value = {
    open: true,
    loading: false,
    client,
    staffId,
    staffName,
    isEdit,
  };
};

const handleConfirmAssignStaff = () => {
  const { client, staffId } = assignDialog.value;
  const targetId = client?.lead_id || client?.id;

  if (!targetId) {
    snackbar.show("Invalid client lead ID for assignment.", "error");
    assignDialog.value.open = false;
    return;
  }

  if (!staffId) {
    snackbar.show("Please select a staff member.", "warning");
    assignDialog.value.open = false;
    return;
  }

  assignDialog.value.loading = true;

  apiRequest(urls.KEYS.PATCH, urls.lead.assign, {
    look_up_key: targetId,
    data: {
      assigned_staff_id: staffId,
    },
    isTokenRequired: true,
    onSuccess: (res) => {
      assignDialog.value.loading = false;
      assignDialog.value.open = false;
      editingStaffClientId.value = null;

      snackbar.show(
        res?.message || res?.data?.message || "Staff assigned successfully.",
        "success",
      );
      store.fetchClients(store.pagination.page);
    },
    onFailure: (err) => {
      assignDialog.value.loading = false;
      snackbar.show(
        err?.response?.data?.message ||
          err?.message ||
          err?.error ||
          "Failed to assign staff.",
        "error",
      );
    },
  });
};

const handleCancelAssignStaff = () => {
  assignDialog.value.open = false;
};

const getKycClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "approved")
    return "bg-primary-green/10 text-primary-green border border-primary-green/20";
  if (s === "pending")
    return "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20";
  return "bg-primary-red/10 text-primary-red border border-primary-red/20";
};

onMounted(() => {
  store.fetchClients();
  tagsStore.fetchTags();
  rbacStaffStore.fetchStaff(false);
});
</script>

<template>
  <div class="px-4">
    <!-- Filters -->
    <div
      class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5"
    >
      <div
        class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap"
      >
        <div class="relative w-full sm:w-56 xl:w-56">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text"
          />
          <input
            v-model="store.filters.search"
            type="text"
            placeholder="Search clients..."
            class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
            @input="onSearch"
          />
        </div>

        <BaseSelect
          v-model="store.filters.ib_id"
          :options="store.ibOptions"
          :isLoading="store.searchLoading"
          placeholder="Search IB..."
          searchable
          clearable
          class="w-full sm:w-52 xl:w-52"
          @search="onIbSearch"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Tag Filter -->
        <BaseSelect
          v-model="store.filters.tag_ids"
          :options="tagOptions"
          placeholder="All Tags..."
          clearable
          class="w-full sm:w-56 xl:w-56"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Auto Withdrawal Filter -->
        <BaseSelect
          v-model="store.filters.eligible_for_auto_withdrawal"
          :options="autoWithdrawalOptions"
          placeholder="Auto Withdrawal..."
          clearable
          class="w-full sm:w-56 xl:w-56"
          @update:modelValue="store.applyFilters()"
        />

        <button
          v-if="selectedClientIds.length > 0"
          type="button"
          @click="openBulkClientTagModal"
          class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
        >
          <Tag class="w-3.5 h-3.5" />
          <span>Manage Tags ({{ selectedClientIds.length }})</span>
        </button>

        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none"
          @click="store.resetFilters()"
        >
          Clear
        </button>

        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per page..."
          class="w-full sm:w-32 xl:w-32"
          @update:modelValue="store.updatePerPage"
        />
        <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="store.isLoading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed"
            @click="
              () => {
                store.fetchClients();
              }
            "
          >
            <RefreshCw
              class="h-3.5 w-3.5"
              :class="{ 'animate-spin': store.isLoading }"
            />
          </button>
        </Tooltip>

        <span
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text bg-background border border-primary-border sm:ml-auto sm:flex-none"
        >
          {{ store.pagination.total_items }} clients
        </span>

        <button
          v-if="hasPermission('client.create')"
          class="btn-primary"
          @click="openCreateClientDialog"
        >
          <Plus class="w-3.5 h-3.5" />
          Add Client
        </button>
      </div>
    </div>

    <!-- Floating / Top Bulk Actions Bar -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="canAssignTags && selectedClientIds.length > 0"
        class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-primary-text mb-4 shadow-sm"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md bg-primary text-white text-[11px] font-bold shadow-xs"
          >
            {{ selectedClientIds.length }}
          </span>
          <span class="font-medium text-xs">
            Client{{ selectedClientIds.length > 1 ? "s" : "" }} selected
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="openBulkClientTagModal"
            class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Tag class="w-3.5 h-3.5" />
            <span>Manage Tags ({{ selectedClientIds.length }})</span>
          </button>
          <button
            type="button"
            @click="clearClientSelection"
            class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-card-background/70 transition-colors cursor-pointer"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </Transition>

    <!-- Desktop DataTable -->
    <div class="hidden md:block">
      <DataTable
        :data="store.data"
        :columns="clientColumns"
        :pagination="store.pagination"
        :loading="store.isLoading"
        :selectable="canAssignTags"
        v-model:selected="selectedClients"
        :actions="getRowActions"
        :per-page-options="[10, 25, 50, 100]"
        row-key="id"
        table-key="clients-list-table"
        empty-title="No clients found"
        empty-text="Try adjusting your filters or search criteria."
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
        @action="({ action, row }) => onMenuSelect({ action }, row)"
      >
        <!-- Custom Cell: Client (Avatar, Name, ID) -->
        <template #cell-client="{ row }">
          <div class="flex items-center gap-2.5">
            <div
              class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-white shrink-0"
            >
              {{ row.name?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-xs font-medium text-primary-text">
                {{ row.name }}
              </p>
              <p class="text-[10px] text-secondary-text">ID: {{ row.id }}</p>
            </div>
          </div>
        </template>

        <!-- Custom Cell: Tags -->
        <template #cell-tags="{ row }">
          <div class="flex flex-wrap items-center gap-1" @click.stop>
            <TagChip
              v-for="tag in visibleTags(row.tags)"
              :key="tag.id"
              :tag="tag"
              size="sm"
            />
            <Tooltip
              v-if="remainingTags(row.tags).length"
              position="center"
              maxWidth="280px"
            >
              <span
                class="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border border-primary-border bg-background/80 text-secondary-text hover:text-primary-text cursor-help transition-colors"
              >
                +{{ remainingTags(row.tags).length }}
              </span>

              <template #content>
                <div class="p-1">
                  <p
                    class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider mb-1.5"
                  >
                    Additional Tags
                  </p>
                  <div class="flex flex-wrap gap-1 max-w-64">
                    <TagChip
                      v-for="tag in remainingTags(row.tags)"
                      :key="tag.id"
                      :tag="tag"
                      size="sm"
                    />
                  </div>
                </div>
              </template>
            </Tooltip>
            <button
              v-if="canAssignTags"
              type="button"
              @click="openClientTagModal(row)"
              class="p-1 rounded hover:bg-white/10 text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              title="Manage Tags"
            >
              <Plus class="w-3 h-3" />
            </button>
          </div>
        </template>

        <!-- Custom Cell: Contact (Email, Phone, DOB) -->
        <template #cell-contact="{ row }">
          <p
            v-if="row.email"
            @click.stop="goToTradingAccount(row.email)"
            class="text-xs font-medium text-primary hover:underline cursor-pointer transition-colors"
            title="Search trading accounts for this email"
          >
            {{ row.email }}
          </p>
          <p v-else class="text-xs text-primary-text">—</p>
          <p
            v-if="hasPermission('client.view_number')"
            class="text-[10px] text-secondary-text"
          >
            {{ row.phone_number ?? "—" }}
          </p>
          <p class="text-[10px] text-secondary-text" v-if="row.date_of_birth">
            DOB: {{ formatDate(row.date_of_birth) }}
          </p>
        </template>

        <!-- Custom Cell: Address -->
        <template #cell-address="{ row }">
          <p class="text-xs text-primary-text">
            {{ row.address ?? "—" }}
          </p>
          <p class="text-[10px] text-secondary-text">
            {{ row.city ?? "—" }}, {{ row.state ?? "—" }}
          </p>
          <p class="text-[10px] text-secondary-text flex items-center gap-1.5">
            <span
              v-if="row.country && getFlagCode(row.country)"
              :class="[
                'fi',
                `fi-${getFlagCode(row.country)}`,
                'fis',
                'w-4 h-3 shrink-0',
              ]"
            ></span>
            <span>{{ cleanCountryLabel(row.country) || "—" }}</span>
            <span v-if="row.zip_code">({{ row.zip_code }})</span>
          </p>
        </template>

        <!-- Custom Cell: IB -->
        <template #cell-ib="{ row }">
          <p class="text-xs text-primary-text">
            {{ row.ib_name ?? "—" }}
          </p>
          <p class="text-[10px] text-secondary-text">
            {{ row.ib_email ?? "—" }}
          </p>
          <p class="text-[10px] text-secondary-text" v-if="row.ib_id">
            Ref: {{ row.ib_referral_code ?? "" }} (ID: {{ row.ib_id }})
          </p>
        </template>

        <!-- Custom Cell: Ass. Staff -->
        <template #cell-staff="{ row }">
          <div class="whitespace-nowrap" @click.stop>
            <div
              v-if="
                (row.staff_assigned?.name || row.assigned_staff?.name) &&
                editingStaffClientId !== row.id
              "
              class="flex items-center justify-between gap-2 group"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-btn-text-primary shrink-0"
                >
                  {{
                    (row.staff_assigned?.name || row.assigned_staff?.name || "")
                      .charAt(0)
                      .toUpperCase()
                  }}
                </div>
                <span class="text-primary-text font-medium text-xs">{{
                  row.staff_assigned?.name || row.assigned_staff?.name
                }}</span>
              </div>
              <button
                v-if="hasPermission('client.update')"
                type="button"
                @click="editingStaffClientId = row.id"
                class="p-1 rounded-md text-secondary-text hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="Edit Assigned Staff"
              >
                <Pencil class="w-3 h-3" />
              </button>
            </div>
            <div
              v-else-if="hasPermission('client.update')"
              class="w-44 flex items-center gap-1"
            >
              <div class="flex-1">
               <BaseSelect
                  :model-value="
                    row.staff_assigned?.id ||
                    row.assigned_staff?.id ||
                    row.assigned_staff_id ||
                    null
                  "
                  :options="staffOptions"
                  :placeholder="
                    row.staff_assigned?.name || row.assigned_staff?.name
                      ? 'Change Staff...'
                      : 'Assign Staff...'
                  "
                  searchable
                  variant="surface"
                  @update:model-value="
                    (staffId) => promptAssignStaff(row, staffId)
                  "
                />
              </div>
              <button
                v-if="editingStaffClientId === row.id"
                type="button"
                @click="editingStaffClientId = null"
                class="p-1 rounded-md text-secondary-text hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                title="Cancel Edit"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <span v-else class="text-xs text-secondary-text">Unassigned</span>
          </div>
        </template>

        <!-- Custom Cell: Referral Campaign -->
        <template #cell-referral_link="{ row }">
          <div v-if="row.referral_link_code" class="space-y-1">
            <span
              class="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 px-1.5 py-0.5 rounded-full select-all"
              :title="row.referral_link_name"
            >
              <Link2 class="w-2.5 h-2.5 shrink-0" />
              <span>{{ row.referral_link_code }}</span>
            </span>
            <p
              class="text-[10px] text-primary-text truncate max-w-35"
              :title="row.referral_link_name"
            >
              {{ row.referral_link_name }}
            </p>
          </div>
          <span v-else class="text-xs text-secondary-text/50">—</span>
        </template>

        <!-- Custom Cell: KYC Status -->
        <template #cell-kyc_status="{ row }">
          <span
            class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize mb-1 inline-block"
            :class="getKycClass(row.kyc_status)"
          >
            {{ row.kyc_status || "not started" }}
          </span>
          <p class="text-[10px] text-secondary-text">
            {{ row.verification_channel ?? "—" }}
          </p>
          <p v-if="row.kyc_verified_at" class="text-[10px] text-secondary-text">
            ✓ {{ formatDate(row.kyc_verified_at) }}
          </p>
        </template>

        <!-- Custom Cell: Doc Status -->
        <template #cell-doc_status="{ row }">
          <p class="text-xs text-primary-text mb-1 text-nowrap">
            <span
              :class="
                row.docs_uploaded === 'True'
                  ? 'text-primary-green'
                  : 'text-primary-yellow'
              "
            >
              Docs: {{ row.docs_uploaded ?? "—" }}
            </span>
          </p>
          <p class="text-xs text-primary-text mb-1">
            {{ row.doc_approved ?? "—" }}
          </p>
          <p v-if="row.kyc_reject_reason" class="text-[10px] text-primary-red">
            Reject: {{ row.kyc_reject_reason }}
          </p>
        </template>

        <!-- Custom Cell: Sumsub ID -->
        <template #cell-sumsub_id="{ row }">
          <p class="text-xs font-mono text-primary-text">
            {{ row.sumsub_applicant_id ?? "—" }}
          </p>
        </template>

        <!-- Custom Cell: Accounts -->
        <template #cell-accounts="{ row }">
          <div class="max-w-55">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="text-xs font-semibold text-primary-text block">
                {{ row.total_accounts || row.accounts?.length || 0 }} Acct{{
                  (row.total_accounts || row.accounts?.length || 0) !== 1
                    ? "s"
                    : ""
                }}
              </span>
              <button
                v-if="row.accounts?.length > 2"
                type="button"
                @click.stop="toggleExpandAccounts(row.id)"
                class="text-[9px] font-medium text-primary hover:underline cursor-pointer focus:outline-none"
              >
                {{ expandedAccountsMap[row.id] ? "Show Less" : "Show All" }}
              </button>
            </div>

            <div
              v-if="row.accounts?.length > 0"
              class="flex flex-wrap gap-1 items-center"
            >
              <!-- Collapsed view: show first 2 accounts + "+N more" badge -->
              <template v-if="!expandedAccountsMap[row.id]">
                <span
                  v-for="(acc, idx) in row.accounts.slice(0, 2)"
                  :key="acc.account_number || acc || idx"
                  @click.stop="goToTradingAccount(acc.account_number || acc)"
                  :title="`Trading Account: #${acc.account_number || acc}${acc.account_type ? ' (' + acc.account_type + ')' : ''} — Click to view`"
                  class="font-mono text-[9px] px-1.5 py-0.5 rounded-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 inline-block border"
                  :class="[
                    chooseBgColor[acc.account_type] ||
                      'bg-background text-secondary-text border-primary-border',
                  ]"
                >
                  {{ acc.account_number || acc }}
                </span>

                <button
                  v-if="row.accounts.length > 2"
                  type="button"
                  @click.stop="toggleExpandAccounts(row.id)"
                  class="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer inline-block"
                  title="Click to view all accounts"
                >
                  +{{ row.accounts.length - 2 }} more
                </button>
              </template>

              <!-- Expanded view: show all accounts inline cleanly -->
              <template v-else>
                <span
                  v-for="(acc, idx) in row.accounts"
                  :key="acc.account_number || acc || idx"
                  @click.stop="goToTradingAccount(acc.account_number || acc)"
                  :title="`Trading Account: #${acc.account_number || acc}${acc.account_type ? ' (' + acc.account_type + ')' : ''} — Click to view`"
                  class="font-mono text-[9px] px-1.5 py-0.5 rounded-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 inline-block border"
                  :class="[
                    chooseBgColor[acc.account_type] ||
                      'bg-background text-secondary-text border-primary-border',
                  ]"
                >
                  {{ acc.account_number || acc }}
                </span>
              </template>
            </div>
            <span v-else class="text-xs text-secondary-text">—</span>
          </div>
        </template>

        <!-- Custom Cell: Dates -->
        <template #cell-dates="{ row }">
          <p class="text-[10px] text-nowrap text-secondary-text mb-1">
            Joined: {{ formatDate(row.created_at) }}
          </p>
          <p class="text-[10px] text-nowrap text-secondary-text mb-1">
            Updated: {{ formatDate(row.updated_at) }}
          </p>
          <p class="text-[10px] text-nowrap text-secondary-text">
            Tracking ID: {{ row.tracking_id ?? "—" }}
          </p>
        </template>

        <!-- Custom Cell: Status -->
        <template #cell-status="{ row }">
          <Tooltip
            :text="`Click to ${row.is_active ? 'deactivate' : 'activate'}`"
            position="left"
          >
            <button
              :disabled="!hasPermission('client.update')"
              @click.stop="openChangeStatusDialog(row)"
              class="text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all duration-200 cursor-pointer focus:outline-none hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              :class="
                row.is_active
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20 hover:bg-primary-green/20'
                  : 'bg-background text-secondary-text border-primary-border hover:bg-secondary-text/10'
              "
            >
              {{ row.is_active ? "Active" : "Inactive" }}
            </button>
          </Tooltip>
        </template>
      </DataTable>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <template v-if="store.isLoading">
        <div
          v-for="n in 4"
          :key="n"
          class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-3"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-background" />
            <div class="space-y-1.5 flex-1">
              <div class="h-3 w-32 bg-background rounded" />
              <div class="h-2.5 w-40 bg-background rounded" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="m in 6" :key="m" class="h-8 bg-background rounded-lg" />
          </div>
        </div>
      </template>

      <div v-else-if="store.data.length === 0" class="py-16 text-center">
        <div class="flex flex-col items-center gap-3">
          <div
            class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center"
          >
            <Users class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No clients found</p>
        </div>
      </div>

      <div
        v-else
        v-for="client in store.data"
        :key="client.id"
        class="border rounded-2xl p-4 space-y-3 transition-colors duration-150"
        :class="[
          selectedClientIds.includes(client.id)
            ? 'bg-primary/10 border-primary/40 shadow-xs'
            : 'bg-card-background border-primary-border',
        ]"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <!-- Mobile Select Checkbox -->
            <div v-if="canAssignTags" class="shrink-0" @click.stop>
              <input
                type="checkbox"
                :checked="selectedClientIds.includes(client.id)"
                @change="toggleSelectClient(client.id)"
                class="custom-checkbox"
              />
            </div>
            <div
              class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-white shrink-0"
            >
              {{ client.name?.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-primary-text truncate">
                {{ client.name }}
              </p>
              <p
                v-if="client.email"
                @click="goToTradingAccount(client.email)"
                class="text-[11px] font-medium text-primary hover:underline cursor-pointer transition-colors truncate"
                title="Search trading accounts for this email"
              >
                {{ client.email }}
              </p>
              <p v-else class="text-[11px] text-secondary-text truncate">—</p>
              <p
                v-if="client.phone_number"
                class="text-[10px] text-secondary-text/80 truncate"
              >
                {{ client.phone_number }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-1.5 items-end shrink-0">
            <button
              class="text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all duration-200 cursor-pointer focus:outline-none hover:scale-105 active:scale-95"
              :class="
                client.is_active
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20 hover:bg-primary-green/20'
                  : 'bg-background text-secondary-text border-primary-border hover:bg-secondary-text/10'
              "
              @click="openChangeStatusDialog(client)"
            >
              {{ client.is_active ? "Active" : "Inactive" }}
            </button>
            <span
              class="text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize"
              :class="getKycClass(client.kyc_status)"
            >
              {{ client.kyc_status || "not started" }}
            </span>
          </div>
        </div>

        <!-- Mobile Tags Display -->
        <div
          v-if="client.tags && client.tags.length > 0"
          class="flex flex-wrap items-center gap-1 pt-1"
        >
          <TagChip
            v-for="tag in visibleTags(client.tags)"
            :key="tag.id"
            :tag="tag"
            size="sm"
          />
          <Tooltip
            v-if="remainingTags(client.tags).length"
            position="center"
            maxWidth="280px"
          >
            <span
              class="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border border-primary-border bg-background/80 text-secondary-text hover:text-primary-text cursor-help transition-colors"
            >
              +{{ remainingTags(client.tags).length }}
            </span>

            <template #content>
              <div class="p-1">
                <p
                  class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider mb-1.5"
                >
                  Additional Tags
                </p>
                <div class="flex flex-wrap gap-1 max-w-64">
                  <TagChip
                    v-for="tag in remainingTags(client.tags)"
                    :key="tag.id"
                    :tag="tag"
                    size="sm"
                  />
                </div>
              </div>
            </template>
          </Tooltip>
          <button
            v-if="canAssignTags"
            type="button"
            @click="openClientTagModal(client)"
            class="p-1 rounded hover:bg-white/10 text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            title="Manage Tags"
          >
            <Plus class="w-3 h-3" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Email</p>
            <p class="font-medium text-primary-text text-[11px] truncate">
              {{ client.email ?? "—" }}
            </p>
          </div>
          <div
            v-if="hasPermission('client.view_number')"
            class="bg-background rounded-lg px-3 py-2"
          >
            <p class="text-[10px] text-secondary-text mb-0.5">Phone</p>
            <p class="font-medium text-primary-text text-[11px] truncate">
              {{ client.phone_number ?? "—" }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Date of Birth</p>
            <p class="font-medium text-primary-text text-[11px]">
              {{
                client.date_of_birth ? formatDate(client.date_of_birth) : "—"
              }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">City</p>
            <p class="font-medium text-primary-text text-[11px] truncate">
              {{ client.city ?? "—" }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Address</p>
            <p class="font-medium text-primary-text text-[11px] truncate">
              {{ client.address ?? "—" }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">State</p>
            <p class="font-medium text-primary-text text-[11px]">
              {{ client.state ?? "—" }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Zip Code</p>
            <p class="font-medium text-primary-text text-[11px]">
              {{ client.zip_code ?? "—" }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">IB Information</p>
            <p class="font-medium text-primary-text text-[11px] truncate">
              {{ client.ib_name ?? "—" }}
            </p>
            <p class="text-[10px] text-secondary-text truncate">
              {{ client.ib_email ?? "—" }}
            </p>
            <p class="text-[10px] text-secondary-text">
              Ref: {{ client.ib_referral_code ?? "—" }} | ID:
              {{ client.ib_id ?? "—" }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Assigned Staff</p>
            <div
              v-if="
                (client.staff_assigned?.name || client.assigned_staff?.name) &&
                editingStaffClientId !== client.id
              "
              class="flex items-center justify-between gap-2 mt-0.5"
            >
              <div class="flex items-center gap-1.5 min-w-0">
                <div
                  class="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-btn-text-primary shrink-0"
                >
                  {{
                    (
                      client.staff_assigned?.name ||
                      client.assigned_staff?.name ||
                      ""
                    )
                      .charAt(0)
                      .toUpperCase()
                  }}
                </div>
                <p class="font-medium text-primary-text text-xs truncate">
                  {{
                    client.staff_assigned?.name || client.assigned_staff?.name
                  }}
                </p>
              </div>
              <button
                v-if="hasPermission('client.update')"
                type="button"
                @click="editingStaffClientId = client.id"
                class="p-1 rounded-md text-secondary-text hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
                title="Edit Assigned Staff"
              >
                <Pencil class="w-3 h-3" />
              </button>
            </div>
            <div
              v-else-if="hasPermission('client.update')"
              class="w-full mt-1 flex items-center gap-1"
            >
              <div class="flex-1">
                <BaseSelect
                  :model-value="
                    client.staff_assigned?.id ||
                    client.assigned_staff?.id ||
                    client.assigned_staff_id ||
                    null
                  "
                  :options="staffOptions"
                  :placeholder="
                    client.staff_assigned?.name || client.assigned_staff?.name
                      ? 'Change Staff...'
                      : 'Assign Staff...'
                  "
                  searchable
                  variant="surface"
                  @update:model-value="
                    (staffId) => promptAssignStaff(client, staffId)
                  "
                />
              </div>
              <button
                v-if="editingStaffClientId === client.id"
                type="button"
                @click="editingStaffClientId = null"
                class="p-1 rounded-md text-secondary-text hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                title="Cancel Edit"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <p v-else class="text-xs text-secondary-text mt-0.5">Unassigned</p>
          </div>
          <div
            class="bg-background rounded-lg px-3 py-2 col-span-2"
            v-if="client.referral_link_code"
          >
            <p class="text-[10px] text-secondary-text mb-0.5">
              Referral Campaign
            </p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span
                class="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 px-2 py-0.5 rounded-full"
              >
                <Link2 class="w-2.5 h-2.5 shrink-0" />
                <span>{{ client.referral_link_code }}</span>
              </span>
              <span
                class="text-[10px] text-primary-text font-medium truncate"
                >{{ client.referral_link_name }}</span
              >
            </div>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">
              KYC Information
            </p>
            <p class="text-[10px] text-primary-text mb-1">
              Channel: {{ client.verification_channel ?? "—" }}
            </p>
            <p
              v-if="client.kyc_verified_at"
              class="text-[10px] text-primary-green mb-1"
            >
              ✓ Verified: {{ formatDate(client.kyc_verified_at) }}
            </p>
            <p v-if="client.kyc_reject_reason" class="text-[10px] text-primary-red">
              Reject Reason: {{ client.kyc_reject_reason }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">
              Document Status
            </p>
            <p class="text-[10px] text-primary-text mb-1">
              Uploaded:
              <span
                :class="
                  client.docs_uploaded === 'True'
                    ? 'text-primary-green'
                    : 'text-primary-yellow'
                "
                >{{ client.docs_uploaded ?? "—" }}</span
              >
            </p>
            <p class="text-[10px] text-primary-text mb-1">
              Approved: {{ client.doc_approved ?? "—" }}
            </p>
            <p class="text-[10px] text-secondary-text">
              SumSub ID: {{ client.sumsub_applicant_id ?? "—" }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <div class="flex items-center justify-between mb-1">
              <p class="text-[10px] text-secondary-text">
                Accounts ({{
                  client.total_accounts ||
                  client.accounts?.length ||
                  client.account_numbers?.length ||
                  0
                }})
              </p>
              <button
                v-if="
                  client.accounts?.length > 4 ||
                  client.account_numbers?.length > 4
                "
                type="button"
                @click="toggleExpandAccounts(`mobile_${client.id}`)"
                class="text-[9px] font-medium text-primary hover:underline cursor-pointer focus:outline-none"
              >
                {{
                  expandedAccountsMap[`mobile_${client.id}`]
                    ? "Show Less"
                    : "Show All"
                }}
              </button>
            </div>

            <div
              v-if="client.accounts?.length || client.account_numbers?.length"
              class="flex flex-wrap gap-1"
            >
              <template v-if="!expandedAccountsMap[`mobile_${client.id}`]">
                <span
                  v-for="(num, idx) in (
                    client.accounts || client.account_numbers
                  ).slice(0, 4)"
                  :key="num.account_number || num || idx"
                  @click="goToTradingAccount(num.account_number || num)"
                  class="font-mono text-[10px] px-1.5 py-0.5 rounded border cursor-pointer transition-all duration-150"
                  :class="[
                    chooseBgColor[num.account_type] ||
                      'bg-card-background border-primary-border text-secondary-text hover:text-primary',
                  ]"
                >
                  {{ num.account_number || num }}
                </span>
                <span
                  v-if="(client.accounts || client.account_numbers).length > 4"
                  @click="toggleExpandAccounts(`mobile_${client.id}`)"
                  class="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition cursor-pointer"
                >
                  +{{ (client.accounts || client.account_numbers).length - 4 }}
                  more
                </span>
              </template>
              <template v-else>
                <span
                  v-for="(num, idx) in client.accounts ||
                  client.account_numbers"
                  :key="num.account_number || num || idx"
                  @click="goToTradingAccount(num.account_number || num)"
                  class="font-mono text-[10px] px-1.5 py-0.5 rounded border cursor-pointer transition-all duration-150"
                  :class="[
                    chooseBgColor[num.account_type] ||
                      'bg-card-background border-primary-border text-secondary-text hover:text-primary',
                  ]"
                >
                  {{ num.account_number || num }}
                </span>
              </template>
            </div>
            <p v-else class="text-secondary-text text-xs">—</p>
            <p
              v-if="client.account_types?.length"
              class="text-[10px] text-secondary-text mt-1 capitalize"
            >
              Types: {{ client.account_types.join(", ") }}
            </p>
          </div>
          <div class="bg-background rounded-lg px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Timeline</p>
            <p class="text-[10px] text-primary-text">
              Joined: {{ formatDate(client.created_at) }}
            </p>
            <p class="text-[10px] text-primary-text">
              Updated: {{ formatDate(client.updated_at) }}
            </p>
            <p class="text-[10px] text-secondary-text">
              Tracking ID: {{ client.tracking_id ?? "—" }}
            </p>
          </div>
          <div
            v-if="
              hasPermission('client.view') ||
              hasPermission('client.update') ||
              (client.kyc_status === 'pending' &&
                hasPermission('client.delete'))
            "
            class="bg-background rounded-lg px-3 py-2 col-span-2 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              v-if="hasPermission('client.view')"
              @click="openClientDepth(client)"
              class="flex-1 min-w-22.5 text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              Client Depth
            </button>
            <button
              v-if="hasPermission('client.update')"
              @click="openEditClientDialog(client)"
              class="flex-1 min-w-17.5 text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              Edit
            </button>
            <button
              v-if="hasPermission('client.update')"
              @click="openManageTransactionsDialog(client)"
              class="flex-1 min-w-22.5 text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              Transactions
            </button>
            <button
              v-if="hasPermission('client.update')"
              @click="openChangeIBDialog(client)"
              class="flex-1 min-w-20 text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              Change IB
            </button>
            <button
              v-if="client.is_ib === false && hasPermission('client.update')"
              @click="openMakeIBDialog(client)"
              class="flex-1 min-w-20 text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition animate-all duration-200 cursor-pointer"
            >
              Make IB
            </button>
            <button
              v-if="hasPermission('client.update')"
              @click="openUpdateReferralLinkDrawer(client)"
              class="flex-1 min-w-25 text-xs font-medium py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              Referral Link
            </button>
            <button
              v-if="hasPermission('client.update')"
              @click="openChangeStatusDialog(client)"
              class="flex-1 min-w-17.5 text-xs font-medium py-1.5 rounded-lg transition animate-all duration-200 cursor-pointer"
              :class="
                client.is_active
                  ? 'bg-primary-red/10 text-primary-red hover:bg-primary-red/20'
                  : 'bg-primary-green/10 text-primary-green hover:bg-primary-green/20'
              "
            >
              Status
            </button>
            <button
              v-if="
                client.kyc_status === 'pending' &&
                hasPermission('client.delete')
              "
              @click="openDeleteClientDialog(client)"
              class="flex-1 min-w-17.5 text-xs font-medium py-1.5 rounded-lg bg-primary-red/10 text-primary-red hover:bg-primary-red/20 transition animate-all duration-200 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="md:hidden mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Change IB Dialog -->
    <ChangeIBDialog
      :open="changeIBDialogOpen"
      :client="selectedClientForChangeIB || {}"
      @close="closeChangeIBDialog"
      @success="handleChangeIBSuccess"
    />

    <!-- Change Status Dialog -->
    <ChangeStatusDialog
      :open="changeStatusDialogOpen"
      :client="selectedClientForChangeStatus || {}"
      @close="closeChangeStatusDialog"
      @success="handleChangeStatusSuccess"
    />

    <!-- Edit Client Dialog -->
    <ClientDialog
      :open="editClientDialogOpen"
      :client="selectedClientForEdit"
      @close="closeEditClientDialog"
      @success="handleEditClientSuccess"
    />

    <!-- Make IB Dialog -->
    <MakeIBDialog
      :open="makeIBDialogOpen"
      :client="selectedClientForMakeIB || {}"
      @close="closeMakeIBDialog"
      @success="handleMakeIBSuccess"
    />

    <!-- Create Client Dialog -->
    <ClientDialog
      :open="createClientDialogOpen"
      :client="null"
      @close="closeCreateClientDialog"
      @success="handleCreateClientSuccess"
    />

    <!-- Delete Client Dialog -->
    <DeleteClientDialog
      :open="deleteClientDialogOpen"
      :client="selectedClientForDelete || {}"
      @close="closeDeleteClientDialog"
      @success="handleDeleteSuccess"
    />

    <!-- Update Referral Link Drawer -->
    <UpdateReferralLinkDrawer
      :open="updateReferralLinkDrawerOpen"
      :client="selectedClientForReferralLink || {}"
      @close="closeUpdateReferralLinkDrawer"
      @success="handleUpdateReferralLinkSuccess"
    />

    <!-- Manage Transactions Dialog -->
    <ManageTransactionsDialog
      :open="manageTransactionsDialogOpen"
      :client="selectedClientForTransactions || {}"
      @close="closeManageTransactionsDialog"
      @success="handleManageTransactionsSuccess"
    />

    <!-- Client Login Confirmation Modal -->
    <ClientLoginModal
      :open="clientLoginModalOpen"
      :client="selectedClientForLogin || {}"
      @close="closeClientLoginModal"
    />

    <!-- Assign / Reassign Staff Confirmation Dialog -->
    <ConfirmationDialog
      :open="assignDialog.open"
      :title="
        assignDialog.isEdit ? 'Reassign Staff Member' : 'Assign Staff Member'
      "
      :message="
        assignDialog.isEdit
          ? `Are you sure you want to reassign staff for client '${
              assignDialog.client?.name ||
              (assignDialog.client?.first_name
                ? `${assignDialog.client.first_name} ${assignDialog.client.last_name || ''}`.trim()
                : 'Selected Client')
            }' to ${assignDialog.staffName}?`
          : `Are you sure you want to assign ${assignDialog.staffName} to client '${
              assignDialog.client?.name ||
              (assignDialog.client?.first_name
                ? `${assignDialog.client.first_name} ${assignDialog.client.last_name || ''}`.trim()
                : 'Selected Client')
            }'?`
      "
      :confirm-text="assignDialog.isEdit ? 'Reassign Staff' : 'Assign Staff'"
      cancel-text="Cancel"
      type="info"
      :loading="assignDialog.loading"
      @confirm="handleConfirmAssignStaff"
      @cancel="handleCancelAssignStaff"
    />

    <!-- Tag Assignment Modal -->
    <TagAssignmentModal
      :open="tagModal.open"
      :entity-type="tagModal.entityType"
      :entity-id="tagModal.entityId"
      :entity-ids="tagModal.entityIds"
      :current-tags="tagModal.currentTags"
      @close="tagModal.open = false"
      @updated="handleTagModalUpdated"
    />

    <!-- Saved Bank Accounts Dialog -->
    <ClientBankAccountsDialog
      :open="clientBankAccountsDialogOpen"
      :client="selectedClientForBankAccounts"
      @close="closeClientBankAccountsDialog"
    />
  </div>
</template>
