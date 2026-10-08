<template>
  <div class="space-y-4 pt-4 pb-12 overflow-y-auto no-scrollbar">
    <!-- ─── REUSABLE DATA TABLE (DESKTOP) ───────────────────────── -->
    <div class="hidden md:block w-full">
      <DataTable
        :columns="tableColumns"
        :data="store.data"
        :loading="store.loading"
        :pagination="store.pagination"
        :per-page-options="[10, 20, 50, 100]"
        row-key="id"
        table-key="client-details-audit-logs-table"
        empty-title="No Audit Logs Found"
        empty-text="No audit events recorded for this client yet."
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- Log ID & Date -->
        <template #cell-log_id="{ row: log }">
          <div class="space-y-1">
            <span class="inline-block font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text">
              #{{ log.audit_log_id || log.id }}
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
            <p class="text-[10px] text-secondary-text font-mono mt-0.5">
              IP: {{ log.request_context?.ip_address || "—" }}
            </p>
          </div>
        </template>

        <!-- Module & Entity -->
        <template #cell-module_entity="{ row: log }">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-medium text-primary-text uppercase">{{ log.module }}</span>
            <span class="text-[10px] text-secondary-text">
              {{ log.entity?.type || log.entity }}
              <span v-if="log.entity?.id || log.entity_id" class="font-mono">#{{ log.entity?.id || log.entity_id }}</span>
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
              :class="getStatusClass(log.result_status || log.status)"
            >
              {{ log.result_status || log.status || 'SUCCESS' }}
            </span>
          </div>
        </template>

        <!-- Highlights & Context -->
        <template #cell-context="{ row: log }">
          <p class="text-[11px] text-secondary-text leading-snug line-clamp-2" :title="log.summary">
            {{ log.summary || 'No summary available.' }}
          </p>
        </template>

        <!-- Device / IP -->
        <template #cell-device="{ row: log }">
          <div class="flex items-center gap-1.5 text-xs text-primary-text">
            <Computer class="w-3.5 h-3.5 shrink-0 text-secondary-text" />
            <p class="truncate text-[11px] max-w-35" :title="log.request_context?.user_agent || log.user_agent">
              {{ parseUserAgent(log.request_context?.user_agent || log.user_agent) }}
            </p>
          </div>
        </template>

        <!-- Details Action -->
        <template #cell-details="{ row: log }">
          <button
            type="button"
            class="btn-secondary px-2.5 py-1 text-xs text-primary font-bold inline-flex items-center gap-1 mx-auto"
            @click="openDetails(log)"
          >
            <Eye class="w-3.5 h-3.5 text-primary" />
            <span>View</span>
          </button>
        </template>
      </DataTable>
    </div>

    <!-- ─── MOBILE CARDS VIEW ─────────────────────────────────────── -->
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
          <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center border border-primary-border">
            <BookOpen class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No enhanced audit logs found</p>
        </div>
      </div>

      <div
        v-else
        v-for="log in store.data"
        :key="log.audit_log_id || log.id"
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
            :class="getStatusClass(log.result_status || log.status)"
          >
            {{ log.result_status || log.status || 'SUCCESS' }}
          </span>
        </div>

        <div class="pt-2 border-t border-primary-border flex items-center justify-between">
          <span class="text-[11px] text-secondary-text">
            {{ formatDate(log.created_at) }}
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
            @click="openDetails(log)"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEnhancedAuditLogsStore } from "@/stores/enhancedAuditLogs/enhancedAuditLogs";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import { formatDate } from "@/utils/timeFormatter";
import { Eye, Computer, BookOpen } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const store = useEnhancedAuditLogsStore();
const { hasPermission } = usePermissionCheck();

const tableColumns = [
  { key: "log_id", label: "Log ID & Date", width: 170, minWidth: 150 },
  { key: "actor", label: "Actor / User", minWidth: 180 },
  { key: "module_entity", label: "Module & Entity", minWidth: 160 },
  { key: "action_status", label: "Action & Status", minWidth: 160 },
  { key: "context", label: "Highlights & Context", minWidth: 240 },
  { key: "device", label: "Device / IP", minWidth: 140 },
  { key: "details", label: "Details", width: 90, align: "center", actionsSticky: true },
];

const fetchClientAuditLogs = (force = false) => {
  const userId = route.params.id;
  if (!userId || !hasPermission(["audit.view", "audit"])) return;

  store.fetchUserAuditLogs(userId, store.pagination.page, store.pagination.per_page, force);
};

const handlePageChange = (page) => {
  const userId = route.params.id;
  if (!userId) return;
  store.pagination.page = page;
  store.fetchUserAuditLogs(userId, page, store.pagination.per_page, true);
};

const handlePerPageChange = (perPage) => {
  const userId = route.params.id;
  if (!userId) return;
  store.pagination.per_page = perPage;
  store.pagination.page = 1;
  store.fetchUserAuditLogs(userId, 1, perPage, true);
};

const openDetails = (log) => {
  const logId = log.audit_log_id || log.id;
  const clientId = route.params.id;
  if (logId && clientId) {
    router.push(`/client/details/${clientId}/audit-logs/${logId}`);
  } else if (logId) {
    router.push(`/enhanced-audit-logs/${logId}`);
  }
};

// ─── Formatters & Helpers ───────────────────────────────────────────────────
const getActorName = (log) => {
  if (log.actor?.name) return log.actor.name;
  if (log.source?.name) return log.source.name;
  if (log.user?.name) return log.user.name;
  if (log.name) return log.name;
  if (log.actor?.type && log.actor?.id) return `${log.actor.type} #${log.actor.id}`;
  if (log.source?.type && log.source?.id) return `${log.source.type} #${log.source.id}`;
  return "System";
};

const getActorEmail = (log) => {
  return log.actor?.email || log.source?.email || log.user?.email || log.email || null;
};

const formatActionName = (action) => {
  if (!action) return "Audit Event";
  return String(action)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getStatusClass = (status) => {
  const s = String(status || "").toUpperCase();
  if (["SUCCESS", "APPROVED", "COMPLETED"].includes(s)) {
    return "bg-primary-green/10 text-primary-green border-primary-green/20";
  }
  if (["FAILED", "REJECTED", "ERROR", "FAILURE"].includes(s)) {
    return "bg-primary-red/10 text-primary-red border-primary-red/20";
  }
  return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
};

const parseUserAgent = (ua) => {
  if (!ua) return "Unknown";
  const l = ua.toLowerCase();
  let browser = "Browser";
  if (l.includes("crios") || (l.includes("chrome") && !l.includes("edg"))) browser = "Chrome";
  else if (l.includes("safari") && !l.includes("chrome") && !l.includes("crios")) browser = "Safari";
  else if (l.includes("firefox")) browser = "Firefox";
  else if (l.includes("edg")) browser = "Edge";

  let os = "OS";
  if (l.includes("iphone") || l.includes("ipad")) os = "iOS";
  else if (l.includes("macintosh") || l.includes("mac os")) os = "macOS";
  else if (l.includes("windows")) os = "Windows";
  else if (l.includes("android")) os = "Android";
  else if (l.includes("linux")) os = "Linux";

  return `${browser} on ${os}`;
};

// ─── Lifecycle & Events ─────────────────────────────────────────────────────
const handleTabRefresh = (e) => {
  if (e?.detail?.tab && e.detail.tab !== "audit-logs") return;
  fetchClientAuditLogs(true);
};

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      store.pagination.page = 1;
      fetchClientAuditLogs(true);
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchClientAuditLogs(true);
  window.addEventListener("refresh-client-tab-data", handleTabRefresh);
});

onUnmounted(() => {
  window.removeEventListener("refresh-client-tab-data", handleTabRefresh);
});
</script>
