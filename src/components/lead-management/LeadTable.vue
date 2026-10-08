<script setup>
import { ref, computed, watch } from "vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Pagination from "@/components/common/Pagination.vue";
import TagChip from "@/components/common/TagChip.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import { getFlagCode, cleanCountryLabel } from "@/utils/countries";
import { formatDate } from "@/utils/timeFormatter";
import {
  Eye,
  Edit,
  ArrowRightLeft,
  UserX,
  Phone,
  Mail,
  Plus,
  Loader2,
  UserCheck,
  Tag,
} from "lucide-vue-next";
import DropdownMenu from "@/components/common/DropdownMenu.vue";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const props = defineProps({
  leads: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: {
    type: Object,
    default: () => ({ page: 1, per_page: 10, total_items: 0, total_pages: 1 }),
  },
  stages: { type: Array, default: () => [] },
  staffList: { type: Array, default: () => [] },
  selectedStage: { type: String, default: "" },
});

const emit = defineEmits([
  "open-drawer",
  "edit-lead",
  "move-stage",
  "add-lead",
  "page-change",
  "per-page-change",
  "assign-staff",
  "manage-tags",
  "bulk-manage-tags",
]);

const { hasPermission, hasAnyPermission } = usePermissionCheck();

const selectedLeadIds = ref([]);

watch(
  () => props.leads,
  () => {
    selectedLeadIds.value = [];
  }
);

const canAssignTags = computed(() => {
  return (
    hasAnyPermission(["tags.assign", "tags.update", "tags.remove"]) ||
    hasPermission("lead.update")
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

const isAllSelected = computed(() => {
  if (!props.leads || !Array.isArray(props.leads) || props.leads.length === 0) return false;
  return props.leads.every((l) => selectedLeadIds.value.includes(l.id));
});

const isSomeSelected = computed(() => {
  if (!props.leads || !Array.isArray(props.leads) || props.leads.length === 0) return false;
  return (
    selectedLeadIds.value.length > 0 &&
    selectedLeadIds.value.length < props.leads.length
  );
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedLeadIds.value = [];
  } else {
    selectedLeadIds.value = props.leads.map((l) => l.id);
  }
};

const toggleSelectLead = (leadId) => {
  const idx = selectedLeadIds.value.indexOf(leadId);
  if (idx > -1) {
    selectedLeadIds.value.splice(idx, 1);
  } else {
    selectedLeadIds.value.push(leadId);
  }
};

const perPageOptions = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

function getActions(lead) {
  return [
    {
      label: "View Details",
      icon: Eye,
      handler: () => emit("open-drawer", lead),
    },
    {
      label: "Move Stage",
      icon: ArrowRightLeft,
      handler: () => emit("move-stage", lead),
    },
    {
      label: "Edit Lead",
      icon: Edit,
      handler: () => emit("edit-lead", lead),
    },
  ];
}

const isKycStatusVisible = computed(() => {
  if (!props.selectedStage) return true;
  const stage = props.selectedStage.toUpperCase();
  return ["REGISTERED", "KYC", "TRADING_ACCOUNT"].includes(stage);
});

const formattedPagination = computed(() => ({
  page: props.pagination?.page || 1,
  total_pages: props.pagination?.total_pages || 1,
  total_items: props.pagination?.total_items || 0,
  per_page: props.pagination?.per_page || 10,
}));

const staffOptions = computed(() => {
  return props.staffList.map((s) => ({
    value: s.id,
    label:
      s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email,
  }));
});

function getLeadName(lead) {
  if (lead.first_name || lead.last_name) {
    return `${lead.first_name || ""} ${lead.last_name || ""}`.trim();
  }
  return lead.name || "Unnamed Lead";
}

function getStaffName(lead) {
  if (lead.assigned_staff) {
    return (
      lead.assigned_staff.name || lead.assigned_staff.email || "Unassigned"
    );
  }
  return "Unassigned";
}

function getStageBadge(lead) {
  const current = lead.current_stage || {};
  const stageCode = current.code || lead.stage || props.stages?.[0]?.code || "";
  const stageName =
    current.name ||
    current.code ||
    lead.stage ||
    props.stages?.[0]?.name ||
    props.stages?.[0]?.code ||
    "NEW_USER";
  const matched = props.stages.find((s) => (s.code || s.key) === stageCode);
  const color = current.color || matched?.color || "var(--color-primary-blue)";

  return {
    label: stageName,
    code: stageCode,
    color,
  };
}

function getKycStatusBadge(kycStatus) {
  const status = (kycStatus || "pending").toLowerCase().replace(/_/g, " ");
  let badgeClass = "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/30";

  if (["approved", "verified", "completed"].includes(status)) {
    badgeClass = "bg-primary-green/10 text-primary-green border border-primary-green/30";
  } else if (["rejected", "failed", "declined"].includes(status)) {
    badgeClass = "bg-primary-red/10 text-primary-red border border-primary-red/30";
  }

  return {
    label: status,
    class: badgeClass,
  };
}

function getPriorityBadge(priority) {
  const p = (priority || "").toLowerCase();
  switch (p) {
    case "high":
      return "bg-primary-red/10 text-primary-red border-primary-red/30";
    case "medium":
      return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/30";
    case "low":
      return "bg-primary-green/10 text-primary-green border-primary-green/30";
    default:
      return "bg-secondary-text/10 text-secondary-text border-secondary-text/30";
  }
}

function formatSourceLabel(source) {
  const s = (source || "").toLowerCase();
  switch (s) {
    case "website":
      return "Website";
    case "support":
      return "Support";
    case "csv_import":
      return "CSV Import";
    case "google_ads":
      return "Google Ads";
    case "facebook":
      return "Facebook";
    case "referral":
      return "Referral";
    default:
      return source || "Website";
  }
}
</script>

<template>
  <div
    class="bg-card-background border border-primary-border rounded-2xl overflow-hidden"
  >
    <!-- Table Header Info -->
    <div
      class="px-5 py-3.5 border-b border-primary-border flex flex-wrap items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2">
        <span
          class="text-xs font-semibold text-primary-text uppercase tracking-wider"
        >
          Lead Records
        </span>
        <span
          class="text-[11px] text-secondary-text bg-background border border-primary-border px-2.5 py-0.5 rounded-full font-medium"
        >
          Showing {{ (leads && leads.length) || 0 }} of
          {{ formattedPagination.total_items || (leads && leads.length) || 0 }} Leads
        </span>
      </div>

      <div v-if="canAssignTags && selectedLeadIds.length > 0" class="flex items-center gap-2">
        <button
          type="button"
          @click="emit('bulk-manage-tags', selectedLeadIds)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors cursor-pointer"
        >
          <Tag class="w-3.5 h-3.5" />
          <span>Manage Tags ({{ selectedLeadIds.length }})</span>
        </button>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="p-6 space-y-3">
      <div
        v-for="n in 5"
        :key="n"
        class="animate-pulse flex items-center justify-between py-3 border-b border-primary-border/40"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-primary-border/40 shrink-0" />
          <div class="space-y-1.5">
            <div class="h-3 w-32 bg-primary-border/50 rounded" />
            <div class="h-2.5 w-44 bg-primary-border/30 rounded" />
          </div>
        </div>
        <div class="h-3 w-20 bg-primary-border/40 rounded" />
        <div class="h-3 w-24 bg-primary-border/40 rounded" />
        <div class="h-4 w-16 bg-primary-border/30 rounded-full" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && (!leads || leads.length === 0)"
      class="py-16 text-center space-y-3 px-4"
    >
      <div
        class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto"
      >
        <UserX class="w-6 h-6" />
      </div>
      <div class="max-w-md mx-auto">
        <h3 class="text-sm font-semibold text-primary-text">No Leads Found</h3>
        <p class="text-xs text-secondary-text mt-1">
          No lead records match your search or filter parameters. Try resetting
          your filters or create a new lead.
        </p>
      </div>
      <button
        @click="emit('add-lead')"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-medium transition-colors cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Lead</span>
      </button>
    </div>

    <!-- Table Container -->
    <div v-else class="overflow-x-auto no-scrollbar">
      <table class="w-full text-left border-collapse min-w-[1000px]">
        <thead class="group/head bg-background/50 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
          <tr class="border-b border-primary-border">
            <th v-if="canAssignTags" class="px-3 py-3 w-10 text-center">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate.prop="isSomeSelected"
                @change="toggleSelectAll"
                class="custom-checkbox transition-opacity duration-150 cursor-pointer"
                :class="[
                  selectedLeadIds.length > 0 || isAllSelected
                    ? 'opacity-100'
                    : 'opacity-0 group-hover/head:opacity-100'
                ]"
                title="Select all leads"
              />
            </th>
            <th class="px-5 py-3">Lead Code</th>
            <th class="px-5 py-3">Lead</th>
            <th class="px-4 py-3">Tags</th>
            <th class="px-4 py-3">Phone</th>
            <th class="px-4 py-3">Country</th>
            <th class="px-4 py-3">Source</th>
            <th class="px-4 py-3">Assigned Staff</th>
            <th class="px-4 py-3">Current Stage</th>
            <th v-if="isKycStatusVisible" class="px-4 py-3">KYC Status</th>
            <th class="px-4 py-3">Priority</th>
            <th class="px-4 py-3">Date</th>
            <th class="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-border/60 text-xs">
          <tr
            v-for="lead in leads"
            :key="lead.id"
            class="transition-colors group cursor-pointer"
            :class="[
              selectedLeadIds.includes(lead.id)
                ? 'bg-primary/10 hover:bg-primary/15'
                : 'hover:bg-background/80'
            ]"
          >
            <!-- Select Checkbox -->
            <td v-if="canAssignTags" class="px-3 py-3.5 text-center w-10" @click.stop>
              <input
                type="checkbox"
                :checked="selectedLeadIds.includes(lead.id)"
                @change="toggleSelectLead(lead.id)"
                class="custom-checkbox transition-opacity duration-150 cursor-pointer"
                :class="[
                  selectedLeadIds.length > 0 || selectedLeadIds.includes(lead.id)
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                ]"
              />
            </td>

            <!-- Lead Code -->
            <td
              class="px-5 py-3.5 font-mono text-[11px] text-secondary-text whitespace-nowrap"
            >
              {{ lead.lead_code || `L-${lead.id}` }}
            </td>

            <!-- Lead Name & Email -->
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform"
                >
                  {{ getLeadName(lead).charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p
                    class="font-semibold text-primary-text truncate group-hover:text-primary transition-colors"
                  >
                    {{ getLeadName(lead) }}
                  </p>
                  <p
                    v-if="lead.email"
                    class="text-[11px] text-secondary-text truncate flex items-center gap-1"
                  >
                    <Mail class="w-2.5 h-2.5 shrink-0" />
                    {{ lead.email }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Tags Column -->
            <td class="px-4 py-3.5 max-w-[200px]" @click.stop>
              <div class="flex flex-wrap items-center gap-1">
                <TagChip
                  v-for="tag in visibleTags(lead.tags)"
                  :key="tag.id"
                  :tag="tag"
                  size="sm"
                />
                <Tooltip
                  v-if="remainingTags(lead.tags).length"
                  position="center"
                  maxWidth="280px"
                >
                  <span
                    class="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border border-primary-border bg-background/80 text-secondary-text hover:text-primary-text cursor-help transition-colors"
                  >
                    +{{ remainingTags(lead.tags).length }}
                  </span>

                  <template #content>
                    <div class="p-1">
                      <p class="text-[10px] uppercase font-semibold text-secondary-text tracking-wider mb-1.5">
                        Additional Tags
                      </p>
                      <div class="flex flex-wrap gap-1 max-w-64">
                        <TagChip
                          v-for="tag in remainingTags(lead.tags)"
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
                  @click="emit('manage-tags', lead)"
                  class="p-1 rounded hover:bg-white/10 text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  title="Manage Tags"
                >
                  <Plus class="w-3 h-3" />
                </button>
              </div>
            </td>

            <!-- Phone -->
            <td class="px-4 py-3.5 text-secondary-text whitespace-nowrap">
              <span class="flex items-center gap-1">
                <Phone class="w-3 h-3 text-secondary-text/70 shrink-0" />
                {{ lead.phone || "-" }}
              </span>
            </td>

            <!-- Country -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background border border-primary-border text-[11px] text-primary-text font-medium"
              >
                <span
                  v-if="lead.country && getFlagCode(lead.country)"
                  :class="[
                    'fi',
                    `fi-${getFlagCode(lead.country)}`,
                    'fis',
                    'rounded-full',
                    'w-[18px]',
                    'h-[18px]',
                    'flex-shrink-0',
                  ]"
                ></span>
                <span>{{ cleanCountryLabel(lead.country) || "-" }}</span>
              </span>
            </td>

            <!-- Source -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-primary/10 text-primary border-primary/20"
              >
                {{ formatSourceLabel(lead.source) }}
              </span>
            </td>

            <!-- Assigned Staff -->
            <td class="px-4 py-3.5 whitespace-nowrap" @click.stop>
              <div v-if="lead.assigned_staff" class="flex items-center gap-2">
                <div
                  class="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-btn-text-primary shrink-0"
                >
                  {{ getStaffName(lead).charAt(0).toUpperCase() }}
                </div>
                <span class="text-primary-text font-medium text-xs">{{
                  getStaffName(lead)
                }}</span>
              </div>
              <div v-else class="w-36">
                <BaseSelect
                  :model-value="null"
                  :options="staffOptions"
                  placeholder="Assign Staff..."
                  searchable
                  variant="surface"
                  @update:model-value="
                    (staffId) =>
                      emit('assign-staff', { leadId: lead.id, staffId })
                  "
                />
              </div>
            </td>

            <!-- Stage Badge -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span
                class="text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase shadow-xs"
                :style="{
                  backgroundColor: `${getStageBadge(lead).color}15`,
                  color: getStageBadge(lead).color,
                  borderColor: `${getStageBadge(lead).color}40`,
                }"
              >
                {{ getStageBadge(lead).label }}
              </span>
            </td>

            <!-- KYC Status -->
            <td v-if="isKycStatusVisible" class="px-4 py-3.5 whitespace-nowrap">
              <span
                :class="[
                  'text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider capitalize',
                  getKycStatusBadge(lead.kyc_status || lead.kycStatus).class,
                ]"
              >
                {{ getKycStatusBadge(lead.kyc_status || lead.kycStatus).label }}
              </span>
            </td>

            <!-- Priority -->
            <td class="px-4 py-3.5 whitespace-nowrap">
              <span
                :class="[
                  'text-[10px] font-semibold px-2 py-0.5 rounded-md border capitalize',
                  getPriorityBadge(lead.priority),
                ]"
              >
                {{ lead.priority || "medium" }}
              </span>
            </td>

            <!-- Created Date -->
            <td
              class="px-4 py-3.5 text-secondary-text whitespace-nowrap text-[11px]"
            >
              <div class="flex flex-col gap-0.5">
                <span
                  ><strong class="font-bold text-primary-text"
                    >Created:&nbsp;
                  </strong>
                  {{ formatDate(lead.created_at) }}</span
                >
                <span
                  ><strong class="font-bold text-primary-text"
                    >Updated: &nbsp;
                  </strong>
                  {{ formatDate(lead.updated_at) }}</span
                >
              </div>
            </td>

            <!-- Actions -->
            <td class="px-5 py-3.5 text-right whitespace-nowrap" @click.stop>
              <div class="flex items-center justify-end">
                <DropdownMenu :items="getActions(lead)" position="bottom-end" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div
      v-if="leads && leads.length > 0"
      class="px-5 py-3 border-t border-primary-border flex flex-wrap items-center justify-between gap-3 bg-background/30"
    >
      <div class="flex items-center gap-4">
        <p class="text-xs text-secondary-text">
          Page
          <strong class="text-primary-text font-semibold">{{
            formattedPagination.page
          }}</strong>
          of
          <strong class="text-primary-text font-semibold">{{
            formattedPagination.total_pages
          }}</strong>
        </p>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xs text-secondary-text">Per page:</span>
          <div class="w-24">
            <BaseSelect
              :modelValue="formattedPagination.per_page"
              :options="perPageOptions"
              :dropUp="true"
              @update:modelValue="emit('per-page-change', Number($event))"
            />
          </div>
        </div>

        <Pagination
          v-if="formattedPagination.total_pages > 1"
          :pagination="formattedPagination"
          @page-change="emit('page-change', $event)"
        />
      </div>
    </div>
  </div>
</template>
