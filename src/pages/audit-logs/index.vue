<template>
  <div class="px-4 pb-8">
    <!-- Filters Bar (Single Row) -->
    <div
      class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5"
    >
      <div
        class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap"
      >
        <!-- Module Filter -->
        <BaseSelect
          v-model="filters.module"
          :isLoading="store.loading"
          :options="moduleOptions"
          placeholder="All Modules"
          class="w-full sm:w-44 xl:w-44"
          @update:modelValue="applyFilters"
        />

        <!-- Entity Filter -->
        <BaseSelect
          v-model="filters.entity"
          :isLoading="store.loading"
          :options="entityOptions"
          placeholder="All Entities"
          class="w-full sm:w-44 xl:w-44"
          @update:modelValue="applyFilters"
        />

        <!-- Action Filter -->
        <BaseSelect
          v-model="filters.action"
          :isLoading="store.loading"
          :options="actionOptions"
          placeholder="All Actions"
          class="w-full sm:w-48 xl:w-48"
          @update:modelValue="applyFilters"
        />

        <!-- Status Filter -->
        <BaseSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="applyFilters"
        />

        <!-- User Search -->
        <BaseSelect
          v-model="filters.user_id"
          :options="userOptions"
          :isLoading="isSearchingUsers"
          placeholder="Search User..."
          searchable
          class="w-full sm:w-56 xl:w-56"
          @search="onUserSearch"
          @update:modelValue="applyFilters"
        />

        <!-- Per Page Option -->
        <BaseSelect
          v-model="store.pagination.per_page"
          :options="perPageOptions"
          placeholder="Per Page"
          class="w-full sm:w-28 xl:w-28"
          @update:modelValue="handlePerPageChange"
        />

        <!-- Clear Button -->
        <button
          v-if="hasActiveFilters"
          type="button"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none cursor-pointer"
          @click="resetFilters"
        >
          Clear
        </button>

        <!-- Refresh Button -->
        <button
          type="button"
          :disabled="store.loading"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer sm:ml-auto"
          title="Refresh"
          @click="() => store.fetchAuditLogs(true)"
        >
          <RefreshCw
            class="h-3.5 w-3.5"
            :class="{ 'animate-spin': store.loading }"
          />
        </button>
      </div>
    </div>

    <!-- Desktop Table -->
    <div
      class="hidden md:block w-full border border-primary-border rounded-xl overflow-x-auto bg-card-background/40"
    >
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="border-b border-primary-border text-[11px] font-medium text-secondary-text uppercase tracking-widest">
            <th class="p-3">Log ID & Date</th>
            <th class="p-3">Actor / User</th>
            <th class="p-3">Module & Entity</th>
            <th class="p-3">Action & Status</th>
            <th class="p-3">Highlights & Context</th>
            <th class="p-3">Device / IP</th>
            <th class="p-3 text-center w-20">Details</th>
          </tr>
        </thead>

        <!-- Skeleton Loading -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 6"
            :key="n"
            class="border-b border-primary-border animate-pulse"
          >
            <td class="p-3">
              <div class="h-3.5 w-20 bg-card-background rounded mb-1.5" />
              <div class="h-2.5 w-28 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-36 bg-card-background rounded mb-1.5" />
              <div class="h-2.5 w-24 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-24 bg-card-background rounded mb-1.5" />
              <div class="h-2.5 w-16 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-28 bg-card-background rounded mb-1.5" />
              <div class="h-5 w-16 bg-card-background rounded-full" />
            </td>
            <td class="p-3">
              <div class="h-3.5 w-36 bg-card-background rounded mb-1.5" />
              <div class="h-2.5 w-24 bg-card-background rounded" />
            </td>
            <td class="p-3">
              <div class="h-3 w-32 bg-card-background rounded" />
            </td>
            <td class="p-3 text-center">
              <div class="h-6 w-12 bg-card-background rounded mx-auto" />
            </td>
          </tr>
        </tbody>

        <!-- Empty State -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="7" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center border border-primary-border"
                >
                  <BookOpen class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">
                  No audit logs found
                </p>
                <p class="text-xs text-secondary-text">
                  Try adjusting your filters or refreshing
                </p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data Rows -->
        <tbody v-else>
          <tr
            v-for="log in store.data"
            :key="log.id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <!-- ID & Date -->
            <td class="p-3 align-top">
              <div class="space-y-1">
                <span class="inline-block font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text">
                  #{{ log.id }}
                </span>
                <p class="text-xs text-secondary-text">
                  {{ formatDate(log.created_at) }}
                </p>
              </div>
            </td>

            <!-- Actor / User -->
            <td class="p-3 align-top">
              <div class="space-y-0.5">
                <p class="text-xs font-semibold text-primary-text">
                  {{ getActorName(log) }}
                </p>
                <p v-if="getActorEmail(log)" class="text-[11px] text-secondary-text">
                  {{ getActorEmail(log) }}
                </p>
                <p class="text-[10px] text-secondary-text font-mono mt-1">
                  IP: {{ log.ip_address || "—" }}
                </p>
              </div>
            </td>

            <!-- Module & Entity -->
            <td class="p-3 align-top">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-medium text-primary-text uppercase">{{ log.module }}</span>
                <span class="text-[10px] text-secondary-text">
                  {{ log.entity }}
                  <span v-if="log.entity_id" class="font-mono">#{{ log.entity_id }}</span>
                </span>
              </div>
            </td>

            <!-- Action & Status -->
            <td class="p-3 align-top">
              <div class="space-y-1">
                <p class="text-xs font-medium text-primary-text">
                  {{ formatActionName(log.action) }}
                </p>
                <span
                  class="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize"
                  :class="getStatusClass(log.status)"
                >
                  {{ log.status }}
                </span>
              </div>
            </td>

            <!-- Highlights & Context -->
            <td class="p-3 align-top max-w-[240px]">
              <!-- Failure Reason Alert Banner -->
              <div
                v-if="log.status === 'FAILED' || getFailureReason(log)"
                class="bg-red-500/10 border border-red-500/20 rounded p-1.5 text-[10px] text-red-500 space-y-0.5"
              >
                <p class="font-bold uppercase tracking-wider flex items-center gap-1 text-[9px]">
                  <AlertTriangle class="w-3 h-3 shrink-0" />
                  <span>Reason</span>
                </p>
                <p class="font-mono leading-tight line-clamp-2 text-red-400 break-words" :title="getFailureReason(log)">
                  {{ getFailureReason(log) || 'Operation failed' }}
                </p>
              </div>

              <!-- Transaction Flow Preview -->
              <div v-else-if="log.meta_data?.source || log.meta_data?.destination" class="text-[11px] space-y-0.5">
                <div class="flex items-center gap-1 text-xs text-primary-text truncate">
                  <span class="truncate">{{ log.meta_data.source?.name || log.meta_data.source?.email || 'System' }}</span>
                  <ArrowRight class="w-3 h-3 text-secondary-text shrink-0" />
                  <span class="truncate">{{ log.meta_data.destination?.name || log.meta_data.destination?.email || 'N/A' }}</span>
                </div>
                <div v-if="log.meta_data?.miscellaneous?.amount" class="text-[10px] text-secondary-text">
                  Amount: {{ log.meta_data.miscellaneous.amount }} {{ log.meta_data.miscellaneous.currency || 'USD' }}
                </div>
              </div>

              <!-- Email Preview -->
              <div v-else-if="log.module === 'EMAIL' && log.meta_data?.miscellaneous?.subject" class="text-[10px] text-secondary-text truncate">
                Subject: "{{ log.meta_data.miscellaneous.subject }}"
              </div>

              <!-- Metadata Summary -->
              <div v-else-if="getMetadataSummary(log).length" class="space-y-1">
                <p
                  v-for="item in getMetadataSummary(log)"
                  :key="item.label"
                  class="text-[10px] leading-tight text-secondary-text truncate"
                  :title="`${item.label}: ${item.value}`"
                >
                  <span class="font-medium text-primary-text">{{ item.label }}:</span>
                  {{ item.value }}
                </p>
              </div>

              <span v-else class="text-xs text-secondary-text">—</span>
            </td>

            <!-- Device / Agent -->
            <td class="p-3 align-top max-w-[180px]">
              <div class="flex items-center gap-1.5 text-xs text-primary-text">
                <Computer class="w-3.5 h-3.5 shrink-0 text-secondary-text" />
                <p class="truncate text-[11px]" :title="log.user_agent">
                  {{ parseUserAgent(log.user_agent) }}
                </p>
              </div>
            </td>

            <!-- Details Action -->
            <td class="p-3 align-top text-center">
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
                @click="openDetails(log)"
              >
                <Eye class="w-3 h-3" />
                <span>View</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <template v-if="store.loading">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-3"
        >
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
          <div
            class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center"
          >
            <BookOpen class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">
            No audit logs found
          </p>
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
            <p
              v-if="getActorEmail(log)"
              class="text-[11px] text-secondary-text mt-0.5"
            >
              {{ getActorEmail(log) }}
            </p>
            <p class="text-[10px] text-secondary-text font-mono mt-0.5">
              IP: {{ log.ip_address || "—" }}
            </p>
          </div>
          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize"
            :class="getStatusClass(log.status)"
          >
            {{ log.status }}
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
            <span class="font-medium text-primary-text"
              >{{ log.entity }}
              <span v-if="log.entity_id" class="font-mono text-[10px]"
                >#{{ log.entity_id }}</span
              ></span
            >
          </div>
          <div class="col-span-2">
            <span class="text-[10px] text-secondary-text block">Device</span>
            <span class="font-medium text-primary-text truncate block">{{
              parseUserAgent(log.user_agent)
            }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-[10px] text-secondary-text block">Date</span>
            <span class="font-medium text-primary-text">{{
              formatDate(log.created_at)
            }}</span>
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

    <!-- Pagination -->
    <div class="mt-5">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Event Details Drawer -->
    <AuditLogDetailDrawer
      :open="detailOpen"
      :log="selectedLog || {}"
      @close="closeDetails"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { RefreshCw, BookOpen, Eye, Computer, ArrowRight, AlertTriangle } from "lucide-vue-next";
import { useAuditLogsStore } from "@/stores/auditLogs/auditLogs";
import Pagination from "@/components/common/Pagination.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import AuditLogDetailDrawer from "@/components/common/AuditLogDetailDrawer.vue";
import { formatDate } from "@/utils/timeFormatter";

const store = useAuditLogsStore();

const filters = ref({
  entity: null,
  module: null,
  action: null,
  status: null,
  user_id: null,
});

const userOptions = ref([]);
const isSearchingUsers = ref(false);
let userSearchTimer = null;

const detailOpen = ref(false);
const selectedLog = ref(null);

const entityOptions = computed(() => {
  return (store.actionsFilters?.entities ?? []).map((entity) => ({
    label: entity,
    value: entity,
  }));
});

const moduleOptions = computed(() => {
  return (store.actionsFilters?.modules ?? []).map((module) => ({
    label: module,
    value: module,
  }));
});

const actionOptions = computed(() => {
  return (store.actionsFilters?.actions ?? []).map((action) => ({
    label: formatActionName(action),
    value: action,
  }));
});

const statusOptions = [
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
  { label: "Pending", value: "PENDING" },
];

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const hasActiveFilters = computed(() => {
  return (
    filters.value.entity ||
    filters.value.module ||
    filters.value.action ||
    filters.value.status ||
    filters.value.user_id
  );
});

// Lifecycle
onMounted(() => {
  filters.value = { ...store.filters };
  store.fetchAuditLogs();
});

// Search functionality
const onUserSearch = (query) => {
  if (!query.trim()) {
    userOptions.value = [];
    return;
  }
  clearTimeout(userSearchTimer);
  isSearchingUsers.value = true;
  userSearchTimer = setTimeout(async () => {
    try {
      const results = await store.searchClients(query);
      userOptions.value = results;
    } catch (e) {
      userOptions.value = [];
    } finally {
      isSearchingUsers.value = false;
    }
  }, 300);
};

// Filter triggers
const applyFilters = () => {
  store.applyFilters(filters.value);
};

const resetFilters = () => {
  filters.value = {
    entity: null,
    module: null,
    action: null,
    status: null,
    user_id: null,
  };
  userOptions.value = [];
  store.resetFilters();
};

const handlePerPageChange = (val) => {
  store.updatePerPage(val);
};

const handlePageChange = (page) => {
  store.pagination.page = page;
  store.fetchAuditLogs(true);
};

// Event Details Modal handlers
const openDetails = (log) => {
  selectedLog.value = log;
  detailOpen.value = true;
};

const closeDetails = () => {
  detailOpen.value = false;
  selectedLog.value = null;
};

// Styling & Text Helpers
const formatActionName = (action) => {
  if (!action) return "Audit Action";
  if (action === "CLEAR_FM_FOLLOWER_POSITIONS") return "GET_FM_FOLLOWER_POSITIONS";
  return String(action)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getActorName = (log) => {
  return log.user?.name || log.name || "Anonymous";
};

const getActorEmail = (log) => {
  return log.user?.email || log.email || null;
};

const getFailureReason = (log) => {
  const meta = log?.meta_data;
  if (meta?.miscellaneous?.reason) return String(meta.miscellaneous.reason);
  if (meta?.reason) return String(meta.reason);
  if (meta?.error) return String(meta.error);
  return null;
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

const getMetadataSummary = (log) => {
  const meta = log?.meta_data;
  if (!meta || typeof meta !== "object") return [];

  const formatPerson = (person) => {
    if (!person || typeof person !== "object") return null;
    return person.name || person.email || null;
  };

  const source = formatPerson(meta.source);
  const destination = formatPerson(meta.destination);
  const items = [];

  if (source) items.push({ label: "Source", value: source });
  if (destination) items.push({ label: "Destination", value: destination });

  if (meta.miscellaneous && typeof meta.miscellaneous === "object") {
    const details = Object.entries(meta.miscellaneous)
      .filter(([key, value]) => !/(token|password|secret|authorization)/i.test(key) && value !== null && value !== undefined)
      .slice(0, 2)
      .map(([key, value]) => `${formatMetadataKey(key)}: ${formatMetadataValue(value)}`);

    if (details.length) items.push({ label: "Info", value: details.join(" · ") });
  }

  return items;
};

const formatMetadataKey = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatMetadataValue = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return Object.values(value).join(", ");
  return String(value);
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
