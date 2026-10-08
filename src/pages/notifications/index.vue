<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications/notifications";
import CreateNotificationModal from "@/components/notifications/CreateNotificationModal.vue";
import SendNotificationConfirmModal from "@/components/notifications/SendNotificationConfirmModal.vue";
import NotificationImageModal from "@/components/notifications/NotificationImageModal.vue";
import MetadataBadges from "@/components/notifications/MetadataBadges.vue";
import Pagination from "@/components/common/Pagination.vue";
import { formatDate } from "@/utils/timeFormatter";
import { getMetadataEntries } from "@/utils/notificationHelpers";
import {
  Plus,
  RotateCw,
  Radio,
  Send,
  Pencil,
  Eye,
  Image as ImageIcon,
  Megaphone,
  Cog,
  Tag,
  TriangleAlert,
  Bell,
  CircleCheck,
  CircleDashed,
  Inbox,
  Loader2,
} from "lucide-vue-next";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";

const myPermissionsStore = useMyPermissionsStore();

const canCreateNotification = computed(() =>
  myPermissionsStore.hasPermission("notifications.create"),
);

const can = (permission) => myPermissionsStore.hasPermission(permission);

const router = useRouter();
const store = useNotificationsStore();

const createModalOpen = ref(false);
const selectedEditNotification = ref(null);

const sendConfirmModalOpen = ref(false);
const selectedSendNotification = ref(null);

const imageModalOpen = ref(false);
const selectedImageUrl = ref("");
const selectedImageTitle = ref("");

function openImageModal(notification) {
  if (!notification?.image_url) return;
  selectedImageUrl.value = notification.image_url;
  selectedImageTitle.value =
    notification.title || "Notification Image Attachment";
  imageModalOpen.value = true;
}

function openSendConfirm(notification) {
  selectedSendNotification.value = notification;
  sendConfirmModalOpen.value = true;
}

function openCreateModal() {
  selectedEditNotification.value = null;
  createModalOpen.value = true;
}

function openEditModal(notification) {
  selectedEditNotification.value = notification;
  createModalOpen.value = true;
}

function handleCloseCreateModal() {
  createModalOpen.value = false;
  selectedEditNotification.value = null;
}

onMounted(() => {
  store.fetchAdminNotifications(1);
});

function handleRefresh() {
  store.fetchAdminNotifications(store.adminPagination.page || 1, true);
}

function handlePageChange(newPage) {
  store.fetchAdminNotifications(newPage, true);
}

const activeCount = computed(
  () => store.adminNotifications.filter((n) => n.is_active).length,
);
const inactiveCount = computed(
  () => store.adminNotifications.length - activeCount.value,
);

function getPriorityStyles(priority) {
  switch (priority) {
    case "HIGH":
      return {
        text: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        bar: "bg-rose-500",
      };
    case "MEDIUM":
      return {
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        bar: "bg-amber-500",
      };
    case "LOW":
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        bar: "bg-emerald-500",
      };
    default:
      return {
        text: "text-zinc-400",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/30",
        bar: "bg-zinc-500",
      };
  }
}

function getTypeMeta(type) {
  switch (type) {
    case "ANNOUNCEMENT":
      return {
        icon: Megaphone,
        text: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
      };
    case "SYSTEM":
      return {
        icon: Cog,
        text: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
      };
    case "PROMOTION":
      return {
        icon: Tag,
        text: "text-teal-400",
        bg: "bg-teal-500/10",
        border: "border-teal-500/30",
      };
    case "ALERT":
      return {
        icon: TriangleAlert,
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
      };
    default:
      return {
        icon: Bell,
        text: "text-zinc-300",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/30",
      };
  }
}
</script>

<template>
  <div class="mx-auto space-y-5 px-4 pb-12">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
      <!-- Stat pills -->
      <!-- <div class="flex flex-wrap items-center gap-2.5">
        <div class="flex items-center gap-2 rounded-lg border border-primary-border bg-card-background px-3.5 py-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Radio class="h-3.5 w-3.5 text-primary" />
          </div>
          <div class="leading-tight">
            <p class="text-sm font-bold text-primary-text">{{ store.adminPagination.total || store.adminNotifications.length }}</p>
            <p class="text-[10px] font-medium uppercase tracking-wide text-secondary-text">Dispatched</p>
          </div>
        </div>

        <div class="flex items-center gap-2 rounded-lg border border-primary-border bg-card-background px-3.5 py-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
            <CircleCheck class="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div class="leading-tight">
            <p class="text-sm font-bold text-primary-text">{{ activeCount }}</p>
            <p class="text-[10px] font-medium uppercase tracking-wide text-secondary-text">Active</p>
          </div>
        </div>

        <div class="flex items-center gap-2 rounded-lg border border-primary-border bg-card-background px-3.5 py-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
            <CircleDashed class="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div class="leading-tight">
            <p class="text-sm font-bold text-primary-text">{{ inactiveCount }}</p>
            <p class="text-[10px] font-medium uppercase tracking-wide text-secondary-text">Pending</p>
          </div>
        </div>
      </div> -->

      <!-- Action Buttons -->
      <div class="flex shrink-0 items-center gap-2">
        <button
          @click="handleRefresh"
          :disabled="store.adminLoading"
          class="flex items-center gap-1.5 rounded-lg border border-primary-border bg-card-background px-3.5 py-2.5 text-xs font-medium text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:opacity-50"
          title="Refresh Logs"
        >
          <RotateCw
            class="h-3.5 w-3.5"
            :class="{ 'animate-spin': store.adminLoading }"
          />
          <span>Refresh</span>
        </button>

        <button
          v-if="canCreateNotification"
          @click="openCreateModal"
          class="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-btn-text-primary shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
        >
          <Plus class="h-4 w-4" />
          <span>Create Notification</span>
        </button>
      </div>
    </div>

    <!-- Dispatch Log -->
    <div
      class="overflow-hidden rounded-2xl border border-primary-border bg-card-background"
    >
      <div
        class="flex items-center justify-between border-b border-primary-border bg-gradient-to-b from-background/70 to-transparent px-5 py-4"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
          >
            <Radio class="h-4 w-4 text-primary" />
          </div>
          <div>
            <p class="text-[13px] font-bold tracking-tight text-primary-text">
              Dispatch Log
            </p>
            <p class="text-[10.5px] text-secondary-text">
              System-wide notification history
            </p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="store.adminLoading"
        class="flex flex-col items-center gap-3 py-16"
      >
        <Loader2 class="h-5 w-5 animate-spin text-primary" />
        <p class="text-xs text-secondary-text">Loading dispatch history…</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="store.adminNotifications.length === 0"
        class="flex flex-col items-center gap-3 py-16 text-center"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-border/40"
        >
          <Inbox class="h-5 w-5 text-secondary-text" />
        </div>
        <div>
          <p class="text-[13px] font-semibold text-primary-text">
            No notifications dispatched yet
          </p>
          <p class="mt-0.5 text-[11px] text-secondary-text">
            Click "Create Notification" to send your first one.
          </p>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="no-scrollbar overflow-x-auto">
        <table class="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr
              class="border-b border-primary-border bg-background/40 text-[10.5px] font-semibold uppercase tracking-wider text-secondary-text"
            >
              <th class="px-5 py-3">ID</th>
              <th class="px-4 py-3">Notification</th>
              <th class="px-4 py-3">Type &amp; Priority</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Recipients</th>
              <th class="px-4 py-3 text-right">Dispatched</th>
              <th class="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/50 text-xs">
            <tr
              v-for="item in store.adminNotifications"
              :key="item.id"
              class="group relative transition-colors hover:bg-primary/[0.04]"
            >
              <td class="relative px-5 py-4">
                <span
                  :class="[
                    'absolute left-0 top-0 h-full w-[3px]',
                    getPriorityStyles(item.priority).bar,
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                  ]"
                />
                <span
                  class="font-mono text-[11px] font-bold text-secondary-text"
                  >#{{ item.id }}</span
                >
              </td>

              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <h4 class="text-[12.5px] font-bold text-primary-text">
                    {{ item.title }}
                  </h4>
                  <button
                    v-if="item.image_url"
                    @click.stop="openImageModal(item)"
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                    title="Click to view attached image"
                  >
                    <ImageIcon class="w-3 h-3" />
                    <span>Image</span>
                  </button>
                </div>
                <p
                  class="mt-0.5 line-clamp-2 whitespace-pre-line max-w-sm text-[11px] text-secondary-text"
                >
                  {{ item.message }}
                </p>
                <p
                  v-if="item.note"
                  class="mt-1 flex items-center gap-1 text-[10px] italic text-secondary-text/80"
                >
                  <span class="not-italic">📝</span> {{ item.note }}
                </p>
              </td>

              <td class="whitespace-nowrap px-4 py-4">
                <div class="flex flex-col items-start gap-1">
                  <div class="flex items-center gap-1.5">
                    <span
                      :class="[
                        'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase',
                        getTypeMeta(item.type).text,
                        getTypeMeta(item.type).bg,
                        getTypeMeta(item.type).border,
                      ]"
                    >
                      <component
                        :is="getTypeMeta(item.type).icon"
                        class="h-3 w-3"
                      />
                      {{ item.type }}
                    </span>
                    <span
                      :class="[
                        'rounded-lg border px-2 py-1 text-[10px] font-bold uppercase',
                        getPriorityStyles(item.priority).text,
                        getPriorityStyles(item.priority).bg,
                        getPriorityStyles(item.priority).border,
                      ]"
                    >
                      {{ item.priority }}
                    </span>
                  </div>

                  <!-- Metadata Badges below priority -->
                  <MetadataBadges :metadata="item.metadata_json" :limit="2" class="mt-0.5" />
                </div>
              </td>

              <td class="whitespace-nowrap px-4 py-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase',
                    item.is_active
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                  ]"
                >
                  <span
                    :class="[
                      'h-1.5 w-1.5 rounded-full',
                      item.is_active
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-amber-400',
                    ]"
                  />
                  {{ item.is_active ? "Active" : "Inactive" }}
                </span>
              </td>

              <td class="px-4 py-4 max-w-[240px]">
                <div
                  class="max-h-16 overflow-y-auto flex flex-wrap items-center gap-1 pr-1"
                >
                  <span
                    v-for="(t, idx) in item.targets"
                    :key="idx"
                    class="rounded-full border border-primary-border bg-background px-2 py-0.5 text-[10px] font-bold text-primary-text"
                  >
                    <span
                      v-if="t.target_type === 'ALL'"
                      class="font-extrabold text-primary"
                      >Broadcast ALL</span
                    >
                    <span v-else-if="t.target_type === 'ROLE'"
                      >ROLE: {{ t.target_id }}</span
                    >
                    <span v-else>USER: #{{ t.target_id }}</span>
                  </span>
                </div>
              </td>

              <td
                class="whitespace-nowrap px-4 py-4 text-right text-[11px] text-secondary-text"
              >
                {{ formatDate(item.created_at) }}
              </td>

              <td class="whitespace-nowrap px-4 py-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="item.is_active"
                    @click="
                      router.push(`/notifications/read-status/${item.id}`)
                    "
                    class="inline-flex items-center gap-1.5 rounded-lg border border-primary-border bg-background px-2.5 py-1.5 text-xs font-semibold text-secondary-text transition-colors hover:bg-card-background hover:text-primary-text cursor-pointer"
                    title="View Read Status Logs"
                  >
                    <Eye class="h-3 w-3" />
                    <span>Logs</span>
                  </button>

                  <button
                    v-if="!item.is_active && can('notifications.update')"
                    @click="openEditModal(item)"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-primary-border bg-background px-2.5 py-1.5 text-xs font-semibold text-secondary-text transition-colors hover:bg-card-background hover:text-primary-text cursor-pointer"
                    title="Edit Notification"
                  >
                    <Pencil class="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    v-if="!item.is_active && can('notifications.create')"
                    @click="openSendConfirm(item)"
                    :disabled="store.sendLoadingId === item.id"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Loader2
                      v-if="store.sendLoadingId === item.id"
                      class="h-3 w-3 animate-spin"
                    />
                    <Send v-else class="h-3 w-3" />
                    <span>{{
                      store.sendLoadingId === item.id ? "Sending…" : "Send"
                    }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div
        class="flex items-center justify-between border-t border-primary-border bg-background/30 py-2.5 px-5"
      >
        <span class="px-2.5 py-1 text-xs font-semibold text-secondary-text">
          {{ store.adminPagination.total || store.adminNotifications.length }}
          total
        </span>
        <Pagination
          :pagination="store.adminPagination"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Create / Edit Notification Modal -->
    <CreateNotificationModal
      :open="createModalOpen"
      :notificationToEdit="selectedEditNotification"
      @close="handleCloseCreateModal"
    />

    <!-- Trigger/Send Confirmation Modal -->
    <SendNotificationConfirmModal
      :open="sendConfirmModalOpen"
      :notification="selectedSendNotification"
      @close="sendConfirmModalOpen = false"
    />

    <!-- Image Attachment Preview Modal -->
    <NotificationImageModal
      :open="imageModalOpen"
      :imageUrl="selectedImageUrl"
      :title="selectedImageTitle"
      @close="imageModalOpen = false"
    />
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
