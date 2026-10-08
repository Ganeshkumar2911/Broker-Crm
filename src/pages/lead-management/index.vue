<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { useLeadStageStore } from "@/stores/leadStage/leadStage";
import { useLeadStore } from "@/stores/lead/lead";
import { useRbacStaffStore } from "@/stores/rbac/staff";

import LeadKpiCards from "@/components/lead-management/LeadKpiCards.vue";
import LeadPipelineOverview from "@/components/lead-management/LeadPipelineOverview.vue";
import LeadFilterBar from "@/components/lead-management/LeadFilterBar.vue";
import LeadTable from "@/components/lead-management/LeadTable.vue";
import LeadDetailDrawer from "@/components/lead-management/LeadDetailDrawer.vue";
import LeadFormModal from "@/components/lead-management/LeadFormModal.vue";
import LeadStageManagementModal from "@/components/lead-management/LeadStageManagementModal.vue";
import LeadImportExportDrawer from "@/components/lead-management/LeadImportExportDrawer.vue";
import TagAssignmentModal from "@/components/common/TagAssignmentModal.vue";

import { Plus, ArrowUpDown, Layers } from "lucide-vue-next";

const leadStageStore = useLeadStageStore();
const leadStore = useLeadStore();
const rbacStaffStore = useRbacStaffStore();
const { hasPermission } = usePermissionCheck();

const stageModalOpen = ref(false);
const importExportDrawerOpen = ref(false);

// Modal & Drawer state
const drawer = ref({ open: false, lead: null, leadId: null });
const modal = ref({ open: false, mode: "add", lead: null });

const tagModal = ref({
  open: false,
  entityType: "lead",
  entityId: null,
  entityIds: [],
  currentTags: [],
});

onMounted(() => {
  leadStageStore.fetchStages();
  leadStore.fetchLeads(1);
  leadStore.fetchDashboardMetrics();
  rbacStaffStore.fetchStaff(true, 1);
});

// Watch filters to trigger API refetch
watch(
  () => [
    leadStore.filters.search,
    leadStore.filters.stage,
    leadStore.filters.staff,
    leadStore.filters.country,
    leadStore.filters.source,
    leadStore.filters.priority,
    leadStore.filters.tag_ids,
  ],
  () => {
    leadStore.fetchLeads(1);
  },
);

function openTagModal(lead) {
  tagModal.value = {
    open: true,
    entityType: "lead",
    entityId: lead.id,
    entityIds: [],
    currentTags: lead.tags || [],
  };
}

function openBulkTagModal(leadIds) {
  tagModal.value = {
    open: true,
    entityType: "lead",
    entityId: null,
    entityIds: leadIds,
    currentTags: [],
  };
}

function handleTagModalUpdated() {
  leadStore.fetchLeads();
  if (drawer.value.open && drawer.value.leadId) {
    leadStore.fetchLeadById(drawer.value.leadId);
  }
}

function handleSelectStage(stageCode) {
  leadStore.filters.stage = stageCode || "";
}

// Drawer Handlers
function openDrawer(lead) {
  drawer.value = { open: true, lead, leadId: lead?.id };
}

function closeDrawer() {
  drawer.value = { open: false, lead: null, leadId: null };
}

// Modal Handlers
function openModal(mode, lead = null) {
  modal.value = { open: true, mode, lead };
}

function closeModal() {
  modal.value = { open: false, mode: "add", lead: null };
}

async function handleSaveLead({ mode, leadId, payload }) {
  try {
    if (mode === "add") {
      await leadStore.createLead(payload);
    } else if (mode === "edit" || mode === "moveStage") {
      await leadStore.updateLead(leadId, payload);
    }
    closeModal();
  } catch (err) {
    // Handled in store with snackbar
  }
}

async function handleAssignStaff({ leadId, staffId }) {
  if (!leadId || !staffId) return;
  try {
    await leadStore.assignLead(leadId, staffId);
  } catch (err) {
    // Handled in store
  }
}

function handleExportCSV() {
  const headers = [
    "ID",
    "Lead Code",
    "Name",
    "Email",
    "Phone",
    "Country",
    "Source",
    "Assigned Staff",
    "Stage",
    "Priority",
    "Created Date",
  ];
  const rows = leadStore.leads.map((l) => [
    l.id,
    l.lead_code || "",
    `${l.first_name || ""} ${l.last_name || ""}`.trim() || l.name || "",
    l.email || "",
    l.phone || "",
    l.country || "",
    l.source || "",
    l.assigned_staff
      ? `${l.assigned_staff.first_name || ""} ${l.assigned_staff.last_name || ""}`.trim()
      : l.assignedStaff || "",
    l.current_stage?.name || l.current_stage?.code || l.stage || "",
    l.priority || "",
    l.created_at || l.createdAt || "",
  ]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `leads_export_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleRefresh() {
  leadStore.fetchLeads();
  leadStore.fetchDashboardMetrics();
  leadStageStore.fetchStages(true);
}

function handleImportCSV() {
  closeModal();
}
</script>

<template>
  <div class="mx-auto space-y-6 pb-12">
    <!-- Header Row -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          v-if="hasPermission('xtention_dev.view')"
          @click="stageModalOpen = true"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all duration-200 cursor-pointer"
        >
          <Layers class="w-3.5 h-3.5" />
          <span>Manage Stages</span>
        </button>

        <button
          v-if="hasPermission('lead_management.import_export')"
          @click="importExportDrawerOpen = true"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition-all duration-200 cursor-pointer"
        >
          <ArrowUpDown class="w-3.5 h-3.5" />
          <span>Import / Export</span>
        </button>

        <button
          v-if="hasPermission('lead_management.view')"
          @click="openModal('add')"
          class="btn-primary"
        >
          <Plus class="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>
    </div>

    <!-- Section 1: KPI Overview Cards -->
    <LeadKpiCards
      :metrics="leadStore.dashboardMetrics"
      :loading="leadStore.metricsLoading"
    />

    <!-- Section 2: Pipeline Overview (Hero Section) -->
    <LeadPipelineOverview
      :leads="leadStore.leads"
      :stages="leadStageStore.stages"
      :loading="leadStageStore.loading"
      :selected-stage="leadStore.filters.stage"
      @select-stage="handleSelectStage"
    />

    <!-- Section 3: Filters -->
    <LeadFilterBar
      v-model:searchQuery="leadStore.filters.search"
      v-model:selectedStage="leadStore.filters.stage"
      v-model:selectedStaff="leadStore.filters.staff"
      v-model:selectedCountry="leadStore.filters.country"
      v-model:selectedSource="leadStore.filters.source"
      v-model:selectedPriority="leadStore.filters.priority"
      v-model:selectedTagIds="leadStore.filters.tag_ids"
      :stages="leadStageStore.stages"
      :staff-list="rbacStaffStore.records"
      @reset-filters="leadStore.resetFilters"
      @refresh="handleRefresh"
    />

    <!-- Section 4: Primary Lead Table -->
    <LeadTable
      :leads="leadStore.leads"
      :loading="leadStore.loading"
      :pagination="leadStore.pagination"
      :stages="leadStageStore.stages"
      :staff-list="rbacStaffStore.records"
      :selected-stage="leadStore.filters.stage"
      @page-change="leadStore.fetchLeads"
      @per-page-change="(perPage) => leadStore.fetchLeads(1, perPage)"
      @open-drawer="openDrawer"
      @edit-lead="openModal('edit', $event)"
      @move-stage="openModal('moveStage', $event)"
      @add-lead="openModal('add')"
      @assign-staff="handleAssignStaff"
      @manage-tags="openTagModal"
      @bulk-manage-tags="openBulkTagModal"
    />

    <!-- Detail Drawer Slide-over -->
    <LeadDetailDrawer
      :open="drawer.open"
      :lead="drawer.lead"
      :lead-id="drawer.leadId"
      :stages="leadStageStore.stages"
      :staff-list="rbacStaffStore.records"
      @close="closeDrawer"
      @move-stage="openModal('moveStage', drawer.lead)"
      @edit-lead="openModal('edit', drawer.lead)"
      @assign-staff="handleAssignStaff"
      @manage-tags="openTagModal"
    />

    <!-- Action & Form Modal -->
    <LeadFormModal
      :open="modal.open"
      :mode="modal.mode"
      :lead="modal.lead"
      :stages="leadStageStore.stages"
      :staff-list="rbacStaffStore.records"
      @close="closeModal"
      @save-lead="handleSaveLead"
      @import-csv="handleImportCSV"
    />

    <!-- Lead Stage Management Modal -->
    <LeadStageManagementModal
      :open="stageModalOpen"
      @close="stageModalOpen = false"
    />

    <!-- Lead Import / Export Drawer -->
    <LeadImportExportDrawer
      :open="importExportDrawerOpen"
      :filters="leadStore.filters"
      :stages="leadStageStore.stages"
      :staff-list="rbacStaffStore.records"
      @close="importExportDrawerOpen = false"
      @imported="handleRefresh"
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
  </div>
</template>
