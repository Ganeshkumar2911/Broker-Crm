<template>
  <div class="px-4 pb-8">
    <!-- Filters Bar -->
    <div class="mb-5">
      <div
        class="flex flex-wrap items-center gap-2.5 rounded-xl border border-primary-border bg-card-background/40 p-2.5"
      >
        <!-- Module Filter -->
        <BaseSelect
          v-model="filters.module"
          :isLoading="store.filterLoading"
          :options="moduleOptions"
          placeholder="All Modules"
          clearable
          class="w-full sm:w-36 xl:w-40"
          @update:modelValue="onModuleChange"
        />

        <!-- Entity Filter -->
        <BaseSelect
          v-model="filters.entity_type"
          :isLoading="store.filterLoading"
          :options="entityOptions"
          :disabled="!filters.module"
          placeholder="All Entities"
          clearable
          class="w-full sm:w-36 xl:w-40"
          @update:modelValue="onEntityChange"
        />

        <!-- Action Filter -->
        <BaseSelect
          v-model="filters.action"
          :isLoading="store.filterLoading"
          :options="actionOptions"
          :disabled="!filters.entity_type"
          placeholder="All Actions"
          clearable
          class="w-full sm:w-40 xl:w-44"
          @update:modelValue="applyFilters"
        />

        <!-- Staff Filter (Source) -->
        <BaseSelect
          v-model="filters.source_id"
          :options="staffOptions"
          :isLoading="isSearchingStaff"
          placeholder="All Staff"
          searchable
          clearable
          class="w-full sm:w-40 xl:w-44"
          @search="onStaffSearch"
          @update:modelValue="applyFilters"
        />

        <!-- Client Filter (Destination) -->
        <BaseSelect
          v-model="filters.destination_id"
          :options="clientOptions"
          :isLoading="isSearchingClients"
          placeholder="All Clients"
          searchable
          clearable
          class="w-full sm:w-40 xl:w-44"
          @search="onClientSearch"
          @update:modelValue="applyFilters"
        />

        <!-- Date Filters -->
        <BaseDatePicker
          v-model="dateRange"
          range
          placeholder="Select Dates"
          class="w-full sm:w-56 xl:w-60"
          @update:modelValue="onDateChange"
        />

        <!-- Per Page Option -->
        <BaseSelect
          v-model="store.pagination.per_page"
          :options="perPageOptions"
          placeholder="Per Page"
          class="w-full sm:w-24 xl:w-24"
          @update:modelValue="handlePerPageChange"
        />

        <!-- Action Buttons (Clear & Refresh) -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            v-if="hasActiveFilters"
            type="button"
            class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            @click="resetFilters"
          >
            Clear
          </button>

          <button
            type="button"
            :disabled="store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-2 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            title="Refresh logs"
            @click="() => store.fetchAuditLogs(true)"
          >
            <RefreshCw
              class="h-3.5 w-3.5"
              :class="{ 'animate-spin': store.loading }"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block w-full">
      <DataTable
        :columns="tableColumns"
        :data="store.data"
        :loading="store.loading"
        :pagination="store.pagination"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- ID & Date -->
        <template #cell-log_id="{ row: log }">
          <div class="space-y-1">
            <span class="inline-block font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text">
              #{{ log.id }}
            </span>
            <p class="text-xs text-secondary-text">
              {{ formatDate(log.created_at) }}
            </p>
          </div>
        </template>

        <!-- Actor / User -->
        <template #cell-actor="{ row: log }">
          <div class="space-y-0.5">
            <p class="text-xs font-semibold text-primary-text">
              {{ getActorName(log) }}
            </p>
            <p v-if="getActorEmail(log)" class="text-[11px] text-secondary-text">
              {{ getActorEmail(log) }}
            </p>
            <p class="text-[10px] text-secondary-text font-mono mt-1">
              IP: {{ log.request_context?.ip_address || "—" }}
            </p>
          </div>
        </template>

        <!-- Module & Entity -->
        <template #cell-module_entity="{ row: log }">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-medium text-primary-text uppercase">{{ log.module }}</span>
            <span class="text-[10px] text-secondary-text">
              {{ log.entity?.type }}
              <span v-if="log.entity?.id" class="font-mono">#{{ log.entity.id }}</span>
            </span>
          </div>
        </template>

        <!-- Action & Status -->
        <template #cell-action_status="{ row: log }">
          <div class="space-y-1">
            <p class="text-xs font-medium text-primary-text">
              {{ formatActionName(log.action) }}
            </p>
            <span
              class="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize"
              :class="getStatusClass(log.result_status)"
            >
              {{ log.result_status }}
            </span>
          </div>
        </template>

        <!-- Highlights & Context -->
        <template #cell-context="{ row: log }">
          <p class="text-[11px] text-secondary-text leading-snug line-clamp-2" :title="log.summary">
            {{ log.summary || 'No summary available.' }}
          </p>
        </template>

        <!-- Device / Agent -->
        <template #cell-device="{ row: log }">
          <div class="flex items-center gap-1.5 text-xs text-primary-text">
            <Computer class="w-3.5 h-3.5 shrink-0 text-secondary-text" />
            <p class="truncate text-[11px]" :title="log.request_context?.user_agent">
              {{ parseUserAgent(log.request_context?.user_agent) }}
            </p>
          </div>
        </template>

        <!-- Details Action -->
        <template #cell-details="{ row: log }">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer mx-auto"
            @click="openDetails(log)"
          >
            <Eye class="w-3 h-3" />
            <span>View</span>
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <!-- (Mobile view structure similar to audit logs but adapted for enhanced logs) -->
      <template v-if="store.loading">
        <div v-for="n in 3" :key="n" class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-3">
          <div class="flex justify-between items-center">
            <div class="h-3 w-28 bg-background rounded" />
            <div class="h-5 w-14 bg-background rounded-full" />
          </div>
          <div class="space-y-1.5">
            <div class="h-3 w-full bg-background rounded" />
            <div class="h-2.5 w-3/4 bg-background rounded" />
          </div>
        </div>
      </template>

      <div v-else-if="store.data.length === 0" class="py-16 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center border border-primary-border">
            <BookOpen class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No enhanced audit logs found</p>
        </div>
      </div>

      <div
        v-else
        v-for="log in store.data"
        :key="log.id"
        class="bg-card-background border border-primary-border rounded-xl p-4 space-y-3 text-xs"
      >
        <div class="flex items-start justify-between">
          <div class="space-y-0.5">
            <p class="font-bold text-primary-text text-xs">
              {{ getActorName(log) }}
            </p>
            <p v-if="getActorEmail(log)" class="text-[11px] text-secondary-text mt-0.5">
              {{ getActorEmail(log) }}
            </p>
            <p class="text-[10px] text-secondary-text font-mono mt-0.5">
              IP: {{ log.request_context?.ip_address || "—" }}
            </p>
          </div>
          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize"
            :class="getStatusClass(log.result_status)"
          >
            {{ log.result_status }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 bg-background/30 rounded-lg p-2.5">
          <div>
            <span class="text-[10px] text-secondary-text block">Action</span>
            <span class="font-medium text-primary-text">{{ formatActionName(log.action) }}</span>
          </div>
          <div>
            <span class="text-[10px] text-secondary-text block">Module</span>
            <span class="font-medium text-primary-text uppercase">{{ log.module }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-[10px] text-secondary-text block">Entity</span>
            <span class="font-medium text-primary-text">
              {{ log.entity?.type }}
              <span v-if="log.entity?.id" class="font-mono text-[10px]">#{{ log.entity.id }}</span>
            </span>
          </div>
          <div class="col-span-2">
            <span class="text-[10px] text-secondary-text block">Summary</span>
            <span class="font-medium text-primary-text truncate block" :title="log.summary">{{ log.summary }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-[10px] text-secondary-text block">Date</span>
            <span class="font-medium text-primary-text">{{ formatDate(log.created_at) }}</span>
          </div>
        </div>

        <button
          type="button"
          class="w-full text-center py-2 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
          @click="openDetails(log)"
        >
          View Log Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { RefreshCw, BookOpen, Eye, Computer } from "lucide-vue-next";
import { useEnhancedAuditLogsStore } from "@/stores/enhancedAuditLogs/enhancedAuditLogs";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import { formatDate } from "@/utils/timeFormatter";

const router = useRouter();
const store = useEnhancedAuditLogsStore();
const { hasPermission } = usePermissionCheck();

const filters = ref({
  entity_type: null,
  module: null,
  action: null,
  source_id: null,
  destination_id: null,
});
const dateRange = ref(null);

const staffOptions = ref([]);
const isSearchingStaff = ref(false);
let staffSearchTimer = null;

const clientOptions = ref([]);
const isSearchingClients = ref(false);
let clientSearchTimer = null;

const tableColumns = [
  { key: 'log_id', label: 'Log ID & Date' },
  { key: 'actor', label: 'Actor / User' },
  { key: 'module_entity', label: 'Module & Entity' },
  { key: 'action_status', label: 'Action & Status' },
  { key: 'context', label: 'Highlights & Context' },
  { key: 'device', label: 'Device / IP' },
  { key: 'details', label: 'Details' }
];

// Dropdown Computed
const moduleOptions = computed(() => {
  return (store.filtersData?.modules ?? []).map((module) => ({
    label: module,
    value: module,
  }));
});

const entityOptions = computed(() => {
  return (store.filtersData?.entity_types ?? []).map((entity) => ({
    label: entity,
    value: entity,
  }));
});

const actionOptions = computed(() => {
  return (store.filtersData?.actions ?? []).map((action) => ({
    label: formatActionName(action),
    value: action,
  }));
});

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const hasActiveFilters = computed(() => {
  return (
    filters.value.entity_type ||
    filters.value.module ||
    filters.value.action ||
    filters.value.source_id ||
    filters.value.destination_id ||
    dateRange.value
  );
});

// Lifecycle
onMounted(async () => {
  if (!hasPermission(["audit.view", "audit"])) return;

  filters.value = { ...store.filters };
  store.fetchFilters(); // load modules
  store.fetchAuditLogs();

  // Load default 10 options for both Staff & Client filters
  try {
    const [staffList, clientList] = await Promise.all([
      store.searchStaff(""),
      store.searchClients(""),
    ]);
    staffOptions.value = staffList;
    clientOptions.value = clientList;
  } catch (err) {
    // Graceful fallback
  }
});

// Staff Search functionality (Source)
const onStaffSearch = (query = "") => {
  clearTimeout(staffSearchTimer);
  isSearchingStaff.value = true;
  staffSearchTimer = setTimeout(async () => {
    try {
      const results = await store.searchStaff(query);
      staffOptions.value = results;
    } catch (e) {
      staffOptions.value = [];
    } finally {
      isSearchingStaff.value = false;
    }
  }, 300);
};

// Client Search functionality (Destination)
const onClientSearch = (query = "") => {
  clearTimeout(clientSearchTimer);
  isSearchingClients.value = true;
  clientSearchTimer = setTimeout(async () => {
    try {
      const results = await store.searchClients(query);
      clientOptions.value = results;
    } catch (e) {
      clientOptions.value = [];
    } finally {
      isSearchingClients.value = false;
    }
  }, 300);
};

// Filter triggers
const onModuleChange = () => {
  filters.value.entity_type = null;
  filters.value.action = null;
  if (filters.value.module) {
    store.fetchFilters(filters.value.module);
  }
  applyFilters();
};

const onEntityChange = () => {
  filters.value.action = null;
  if (filters.value.module && filters.value.entity_type) {
    store.fetchFilters(filters.value.module, filters.value.entity_type);
  }
  applyFilters();
};

const onDateChange = (dates) => {
  if (dates && dates.length === 2) {
    filters.value.start_date = dates[0].toISOString().split('T')[0];
    filters.value.end_date = dates[1].toISOString().split('T')[0];
  } else {
    filters.value.start_date = null;
    filters.value.end_date = null;
  }
  applyFilters();
};

const applyFilters = () => {
  store.applyFilters({
    ...filters.value
  });
};

const resetFilters = () => {
  filters.value = {
    entity_type: null,
    module: null,
    action: null,
    source_id: null,
    destination_id: null,
    start_date: null,
    end_date: null,
  };
  dateRange.value = null;
  store.resetFilters();
  store.fetchFilters(); // reset filters data
  onStaffSearch("");
  onClientSearch("");
};

const handlePerPageChange = (val) => {
  const perPage = val?.per_page ?? val;
  store.updatePerPage(perPage);
};

const handlePageChange = (page) => {
  store.pagination.page = page;
  store.fetchAuditLogs(true);
};

// Event Details Page navigation
const openDetails = (log) => {
  const id = log.audit_log_id || log.id;
  router.push(`/enhanced-audit-logs/${id}`);
};

// Styling & Text Helpers
const formatActionName = (action) => {
  if (!action) return "Audit Action";
  return String(action)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getActorName = (log) => {
  return log.source?.name || log.actor?.name || log.user?.name || log.name || "System/Anonymous";
};

const getActorEmail = (log) => {
  return log.source?.email || log.actor?.email || log.user?.email || log.email || null;
};

const getStatusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "success" || s === "completed") {
    return "bg-green-500/10 text-green-700 border-green-500/20";
  }
  if (s === "failed" || s === "error") {
    return "bg-red-500/10 text-red-700 border-red-500/20";
  }
  return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
};

const parseUserAgent = (ua) => {
  if (!ua) return "Unknown";
  const lowercase = ua.toLowerCase();
  let os = "Unknown OS";
  if (lowercase.includes("macintosh") || lowercase.includes("mac os"))
    os = "macOS";
  else if (lowercase.includes("windows")) os = "Windows";
  else if (lowercase.includes("linux")) os = "Linux";
  else if (lowercase.includes("android")) os = "Android";
  else if (lowercase.includes("iphone") || lowercase.includes("ipad"))
    os = "iOS";

  let browser = "Browser";
  if (lowercase.includes("chrome")) browser = "Chrome";
  else if (lowercase.includes("safari") && !lowercase.includes("chrome"))
    browser = "Safari";
  else if (lowercase.includes("firefox")) browser = "Firefox";
  else if (lowercase.includes("edge")) browser = "Edge";
  else if (lowercase.includes("opera") || lowercase.includes("opr"))
    browser = "Opera";

  return `${browser} on ${os}`;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
