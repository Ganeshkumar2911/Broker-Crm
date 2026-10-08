<template>
  <div class="space-y-4 pt-4 pb-12 overflow-y-auto no-scrollbar">
    <!-- ─── REUSABLE DATA TABLE ─────────────────────────────────── -->
    <DataTable
      :data="paginatedNotifications"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :per-page-options="[10, 25, 50, 100]"
      row-key="id"
      table-key="client-details-notifications-table"
      empty-title="No Notifications Found"
      empty-text="No notifications have been dispatched to this client yet."
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    >
      <!-- Cell: ID -->
      <template #cell-id="{ row }">
        <span class="font-mono text-xs font-bold text-primary-text">
          #{{ row.id }}
        </span>
      </template>

      <!-- Cell: Type -->
      <template #cell-type="{ row }">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap"
          :class="[getTypeMeta(row.type).bg, getTypeMeta(row.type).border, getTypeMeta(row.type).text]"
        >
          <component :is="getTypeMeta(row.type).icon" class="w-3 h-3 shrink-0" />
          {{ formatTypeLabel(row.type) }}
        </span>
      </template>

      <!-- Cell: Priority -->
      <template #cell-priority="{ row }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap"
          :class="[getPriorityStyles(row.priority).bg, getPriorityStyles(row.priority).border, getPriorityStyles(row.priority).text]"
        >
          {{ row.priority || "NORMAL" }}
        </span>
      </template>

      <!-- Cell: Title & Message -->
      <template #cell-title="{ row }">
        <div class="space-y-1 py-1 max-w-md">
          <p class="font-bold text-primary-text text-xs leading-snug">
            {{ row.title || "—" }}
          </p>
          <p class="text-secondary-text text-[11px] leading-relaxed line-clamp-2" :title="row.message">
            {{ row.message || "—" }}
          </p>
          <a
            v-if="row.action_url"
            :href="row.action_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline transition-opacity mt-0.5"
          >
            <span>Open Link</span>
            <ExternalLink class="w-3 h-3" />
          </a>
        </div>
      </template>

      <!-- Cell: Metadata / Note -->
      <template #cell-metadata="{ row }">
        <div class="space-y-1 py-1 min-w-[140px]">
          <div v-if="row.metadata_json">
            <MetadataBadges
              :metadata="row.metadata_json"
              :limit="2"
              :title="`Metadata — #${row.id}`"
            />
          </div>
          <div
            v-if="row.note"
            class="text-[10.5px] text-secondary-text truncate max-w-[200px] flex items-center gap-1 bg-background/50 px-2 py-0.5 rounded border border-primary-border/60"
            :title="row.note"
          >
            <Info class="w-3 h-3 text-primary shrink-0" />
            <span class="truncate"><span class="font-semibold text-primary-text">Note:</span> {{ row.note }}</span>
          </div>
          <span v-if="!row.metadata_json && !row.note" class="text-secondary-text text-[11px]">—</span>
        </div>
      </template>

      <!-- Cell: Status -->
      <template #cell-is_active="{ row }">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap"
          :class="
            row.is_active
              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
              : 'bg-primary-red/10 text-primary-red border-primary-red/20'
          "
        >
          {{ row.is_active ? "Active" : "Inactive" }}
        </span>
      </template>

      <!-- Cell: Created At Date -->
      <template #cell-created_at="{ row }">
        <span
          class="text-[11px] text-secondary-text tabular-nums whitespace-nowrap"
          :title="formatDate(row.created_at)"
        >
          {{ formatDate(row.created_at) }}
        </span>
      </template>

      <!-- Cell: Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1.5">
          <!-- View Image Modal Trigger -->
          <button
            v-if="row.image_url"
            type="button"
            @click.stop="openImageModal(row)"
            class="p-1.5 rounded-lg border border-primary-border hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer shadow-2xs"
            title="View Attached Image"
          >
            <ImageIcon class="w-3.5 h-3.5" />
          </button>

          <!-- External Action URL -->
          <a
            v-if="row.action_url"
            :href="row.action_url"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 rounded-lg border border-primary-border hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer shadow-2xs inline-flex items-center"
            title="Open Action Link"
          >
            <ExternalLink class="w-3.5 h-3.5" />
          </a>

          <span v-if="!row.image_url && !row.action_url" class="text-secondary-text text-xs">—</span>
        </div>
      </template>
    </DataTable>

    <!-- ─── IMAGE PREVIEW MODAL ──────────────────────────────────── -->
    <NotificationImageModal
      :open="imageModalOpen"
      :image-url="selectedImageUrl"
      :title="selectedImageTitle"
      @close="imageModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { formatDate } from "@/utils/timeFormatter";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import NotificationImageModal from "@/components/notifications/NotificationImageModal.vue";
import MetadataBadges from "@/components/notifications/MetadataBadges.vue";
import {
  Bell,
  Megaphone,
  Cog,
  Tag,
  TriangleAlert,
  Info,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-vue-next";

const route = useRoute();
const clientDepthStore = useClientDepthStore();

// ─── Table Columns Configuration ─────────────────────────────────────────────
const columns = [
  {
    key: "id",
    label: "ID",
    width: 80,
    minWidth: 70,
    sortable: true,
    resizable: true,
  },
  {
    key: "type",
    label: "Type",
    width: 150,
    minWidth: 130,
    sortable: true,
    resizable: true,
  },
  {
    key: "priority",
    label: "Priority",
    width: 120,
    minWidth: 110,
    sortable: true,
    resizable: true,
  },
  {
    key: "title",
    label: "Title & Message",
    minWidth: 260,
    sortable: true,
    resizable: true,
  },
  {
    key: "metadata",
    label: "Metadata / Note",
    minWidth: 180,
    resizable: true,
  },
  {
    key: "is_active",
    label: "Status",
    width: 110,
    minWidth: 90,
    sortable: true,
    resizable: true,
  },
  {
    key: "created_at",
    label: "Sent Date",
    width: 170,
    minWidth: 150,
    sortable: true,
    resizable: true,
  },
  {
    key: "actions",
    label: "Actions",
    align: "right",
    width: 100,
    minWidth: 90,
    actionsSticky: true,
  },
];

// ─── Pagination State ─────────────────────────────────────────────────────────
const currentPage = ref(1);
const perPage = ref(10);

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handlePerPageChange = (newPerPage) => {
  perPage.value = newPerPage;
  currentPage.value = 1;
};

// Image Modal State
const imageModalOpen = ref(false);
const selectedImageUrl = ref("");
const selectedImageTitle = ref("");

function openImageModal(notification) {
  if (!notification?.image_url) return;
  selectedImageUrl.value = notification.image_url;
  selectedImageTitle.value = notification.title || "Notification Image Attachment";
  imageModalOpen.value = true;
}

// ─── Store Integration ────────────────────────────────────────────────────────
const notificationsList = computed(() => {
  return clientDepthStore.clientNotificationsData || [];
});

const loading = computed(() => {
  return clientDepthStore.clientNotificationsLoading;
});

const fetchNotifications = (force = false) => {
  const userId = route.params.id;
  if (userId) {
    clientDepthStore.fetchClientNotifications(userId, {}, force);
  }
};

// ─── Paginated Data & Pagination Object for DataTable ─────────────────────────
const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return notificationsList.value.slice(start, start + perPage.value);
});

const pagination = computed(() => {
  const total = notificationsList.value.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage.value));
  return {
    page: currentPage.value,
    per_page: perPage.value,
    total,
    total_pages: totalPages,
  };
});

// ─── Style & Icon Resolvers ───────────────────────────────────────────────────
function getPriorityStyles(priority) {
  const p = String(priority || "").toUpperCase();
  switch (p) {
    case "HIGH":
    case "URGENT":
    case "CRITICAL":
      return {
        text: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
      };
    case "MEDIUM":
    case "MODERATE":
      return {
        text: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
      };
    case "LOW":
    case "INFO":
      return {
        text: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
      };
    default:
      return {
        text: "text-secondary-text",
        bg: "bg-secondary-text/10",
        border: "border-primary-border",
      };
  }
}

function getTypeMeta(type) {
  const t = String(type || "").toUpperCase();
  switch (t) {
    case "ANNOUNCEMENT":
      return {
        icon: Megaphone,
        text: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
      };
    case "SYSTEM":
      return {
        icon: Cog,
        text: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
      };
    case "PROMOTION":
      return {
        icon: Tag,
        text: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
      };
    case "ALERT":
    case "WARNING":
      return {
        icon: TriangleAlert,
        text: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
      };
    default:
      return {
        icon: Bell,
        text: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/30",
      };
  }
}

function formatTypeLabel(type) {
  if (!type) return "Announcement";
  return String(type)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Lifecycle & Events ───────────────────────────────────────────────────────
const handleTabRefresh = (e) => {
  if (e?.detail?.tab && e.detail.tab !== "notifications") return;
  fetchNotifications(true);
};

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      currentPage.value = 1;
      fetchNotifications();
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchNotifications();
  window.addEventListener("refresh-client-tab-data", handleTabRefresh);
});

onUnmounted(() => {
  window.removeEventListener("refresh-client-tab-data", handleTabRefresh);
});
</script>
