<template>
  <div class="px-4 mx-auto max-w-7xl h-[calc(100vh-115px)] flex flex-col overflow-hidden">
    <!-- Initial Loading State (Centered spinner overlay instead of skeleton layout wipe) -->
    <div v-if="store.detailLoading && !store.detail" class="flex flex-col items-center justify-center h-full space-y-3">
      <Loader2 class="w-8 h-8 text-primary animate-spin" />
      <p class="text-xs text-secondary-text font-medium">Loading ticket details...</p>
    </div>

    <template v-else-if="store.detail">
      <!-- Header Bar (shrink-0) -->
      <div class="shrink-0 mb-4 space-y-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-background border border-primary-border text-secondary-text font-mono">
            {{ store.detail.ticket_number }}
          </span>
          
          <!-- Priority Badge -->
          <span
            class="text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize"
            :class="priorityClass(store.detail.priority)"
          >
            {{ store.detail.priority }}
          </span>

          <!-- Status Button -->
          <button
            class="text-xs font-medium px-2.5 py-0.5 rounded-full border transition-all capitalize"
            :class="[
              statusClass(store.detail.status),
              hasPermission(['ticket.update', 'ticket.close', 'ticket.assign'])
                ? 'cursor-pointer hover:opacity-80'
                : 'cursor-not-allowed opacity-60',
            ]"
            @click="openStatusDialog"
            :disabled="!hasPermission(['ticket.update', 'ticket.close', 'ticket.assign'])"
          >
            {{ store.detail.status }}
          </button>

          <!-- TAT Status Badge -->
          <div
            v-if="getTat(store.detail).hasDeadline"
            class="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border bg-background"
            :class="getTat(store.detail).isBreached ? 'border-primary-red/40 text-primary-red' : 'border-primary-green/40 text-primary-green'"
          >
            <Clock class="w-3 h-3" />
            <span>{{ getTat(store.detail).tatFormatted || getTat(store.detail).tatMessage }}</span>
          </div>
        </div>

        <h1 class="text-xl font-bold text-primary-text tracking-tight">
          {{ store.detail.subject }}
        </h1>
        
        <div class="flex items-center gap-3 text-xs text-secondary-text">
          <span>Created by <strong class="text-primary-text font-medium">{{ store.detail.created_by_name || 'Client' }}</strong></span>
          <span>·</span>
          <span>{{ formatDate(store.detail.created_at) }}</span>
        </div>
      </div>

      <!-- Main Grid Layout: Ticket Metadata & Chat System (flex-1 min-h-0) -->
      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2">
        
        <!-- Left Side / Sidebar Info (1 column on lg) -->
        <div class="lg:col-span-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pr-1">
          <!-- Assignee & Ticket Meta Card -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-5  space-y-4 shrink-0">
            <div class="flex items-center justify-between border-b border-primary-border pb-2.5">
              <h2 class="text-xs font-bold uppercase tracking-wider text-secondary-text">
                Ticket Details
              </h2>
            </div>

            <!-- Action Controls inside Left Sidebar -->
            <div class="flex items-center gap-2 pb-1 border-b border-primary-border/60">
              <button
                v-if="store.detail.status !== 'closed' && hasPermission(['ticket.update', 'ticket.close', 'ticket.assign'])"
                @click="openStatusDialog"
                class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-medium transition-all cursor-pointer "
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>Update Status</span>
              </button>
            </div>

            <!-- Assignee -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <p class="text-xs text-secondary-text">Assigned Staff</p>
                <button
                  v-if="hasPermission(['ticket.update', 'ticket.assign']) && store.detail.assigned_staff && !isEditingStaff"
                  type="button"
                  @click="isEditingStaff = true"
                  class="p-1 rounded-md text-secondary-text hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  title="Change Assigned Staff"
                >
                  <Pencil class="w-3 h-3" />
                </button>
              </div>

              <!-- When assigned and not editing -->
              <div v-if="store.detail.assigned_staff && !isEditingStaff" class="flex items-center gap-2.5 p-2.5 rounded-lg bg-background border border-primary-border">
                <div class="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  {{ (store.detail.assigned_staff.name || 'S').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold text-primary-text truncate">
                    {{ store.detail.assigned_staff.name }}
                  </p>
                  <p class="text-[11px] text-secondary-text truncate">
                    {{ store.detail.assigned_staff.email }}
                  </p>
                </div>
                <span v-if="store.detail.assigned_role" class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {{ store.detail.assigned_role }}
                </span>
              </div>

              <!-- Dropdown mode (When not assigned OR when editing) -->
              <div v-else-if="hasPermission(['ticket.update', 'ticket.assign'])" class="flex items-center gap-1.5">
                <div class="flex-1">
                  <BaseSelect
                    :model-value="store.detail.assigned_staff?.id || store.detail.assigned_staff_id || null"
                    :options="staffOptions"
                    :placeholder="store.detail.assigned_staff ? 'Change Staff...' : 'Assign Staff...'"
                    searchable
                    variant="surface"
                    @update:model-value="(staffId) => promptAssignStaff(staffId)"
                  />
                </div>
                <button
                  v-if="isEditingStaff"
                  type="button"
                  @click="isEditingStaff = false"
                  class="p-2 rounded-lg border border-primary-border text-secondary-text hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                  title="Cancel Edit"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <p v-else class="text-xs text-secondary-text italic p-2 bg-background rounded-lg border border-primary-border">
                No staff assigned yet
              </p>
            </div>

            <!-- Creator info -->
            <div>
              <p class="text-xs text-secondary-text mb-1">Reporter</p>
              <div class="flex items-center gap-2.5 p-2.5 rounded-lg bg-background border border-primary-border">
                <div class="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                  {{ (store.detail.created_by_name || 'C').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-primary-text truncate">
                    {{ store.detail.created_by_name || 'Client' }}
                  </p>
                  <p class="text-[11px] text-secondary-text truncate">
                    {{ store.detail.created_by_email || '—' }}
                  </p>
                </div>
                <span class="ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-background text-secondary-text border border-primary-border">
                  {{ store.detail.created_by_role || 'Client' }}
                </span>
              </div>
            </div>

            <!-- TAT Summary -->
            <div class="pt-2 border-t border-primary-border">
              <p class="text-xs text-secondary-text mb-1">TAT Target</p>
              <p class="text-xs font-medium" :class="getTat(store.detail).isBreached ? 'text-primary-red font-semibold' : 'text-primary-text'">
                {{ getTat(store.detail).tatMessage }}
              </p>
            </div>
          </div>

          <!-- Description Card -->
          <div class="bg-card-background border border-primary-border rounded-2xl p-5  shrink-0">
            <h2 class="text-xs font-bold uppercase tracking-wider text-secondary-text border-b border-primary-border pb-2.5 mb-3">
              Initial Issue Description
            </h2>
            <p class="text-xs text-primary-text leading-relaxed whitespace-pre-line">
              {{ store.detail.description || 'No description provided.' }}
            </p>
          </div>
        </div>

        <!-- Right Side / Modern Chat System (2 columns on lg) -->
        <div class="lg:col-span-2 flex flex-col bg-card-background border border-primary-border rounded-2xl  overflow-hidden h-full min-h-0">
          
          <!-- Chat Header (shrink-0) -->
          <div class="px-6 py-4 border-b border-primary-border bg-card-background flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <MessageSquare class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-primary-text">Ticket Discussion</h3>
                <p class="text-[11px] text-secondary-text">Chat history & resolution updates</p>
              </div>
            </div>
             <div class="flex items-center gap-2">
            <button
                type="button"
                @click="refreshTicket"
                :disabled="store.detailLoading"
                class="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                title="Refresh Ticket Details"
              >
                <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.detailLoading }" />
              </button>
            
           
              <span class="text-xs px-2.5 py-1 rounded-full bg-background border border-primary-border text-secondary-text font-medium">
                {{ totalHistoryCount }} {{ totalHistoryCount === 1 ? 'event' : 'events' }}
              </span>
            </div>
          </div>

          <!-- Chat Stream Messages Container -->
          <div
            ref="chatContainerRef"
            class="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50 scroll-smooth"
          >
            <div v-if="chatStream.length === 0" class="flex flex-col items-center justify-center h-full text-center p-6">
              <div class="w-12 h-12 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text mb-3 ">
                <MessageSquare class="w-6 h-6" />
              </div>
              <p class="text-sm font-semibold text-primary-text">No conversation yet</p>
              <p class="text-xs text-secondary-text max-w-xs mt-1">Start chatting below to respond or add attachments to this ticket.</p>
            </div>

            <template v-else>
              <div v-for="group in chatStream" :key="group.dateLabel" class="space-y-4">
                <!-- Date Section Divider -->
                <div class="flex items-center justify-center my-4">
                  <span class="text-[10px] font-semibold text-secondary-text bg-card-background border border-primary-border px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                    {{ group.dateLabel }}
                  </span>
                </div>

                <!-- Messages in this Date Group -->
                <div v-for="item in group.messages" :key="item.id">
                  
                  <!-- 1. System Events (Staff Assignment, Status change, etc.) -->
                  <div v-if="isSystemEvent(item)" class="flex justify-center my-3">
                    <div class="flex items-center gap-1.5 text-xs text-secondary-text bg-card-background/80 border border-primary-border/70 px-3 py-1.5 rounded-full shadow-2xs">
                      <UserCheck v-if="item.event_type === 'staff_assigned'" class="w-3.5 h-3.5 text-primary" />
                      <CheckCircle2 v-else-if="item.event_type === 'status_changed'" class="w-3.5 h-3.5 text-primary-green" />
                      <AlertCircle v-else class="w-3.5 h-3.5 text-primary-yellow" />
                      <span>{{ getSystemEventText(item) }}</span>
                      <span class="text-[10px] text-secondary-text/60 ml-1">· {{ formatTime(item.created_at) }}</span>
                    </div>
                  </div>

                  <!-- 2. Chat Bubble (Comments & Attachments) -->
                  <div
                    v-else
                    class="flex items-start gap-3 my-3"
                    :class="item.isMe ? 'flex-row-reverse' : 'flex-row'"
                  >
                    <!-- Avatar for non-me messages -->
                    <div
                      v-if="!item.isMe"
                      class="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-2xs mt-0.5"
                    >
                      {{ (item.actor_name || 'U').charAt(0).toUpperCase() }}
                    </div>

                    <!-- Bubble Container -->
                    <div
                      class="flex flex-col max-w-[82%] sm:max-w-[75%]"
                      :class="item.isMe ? 'items-end' : 'items-start'"
                    >
                      <!-- Sender Header -->
                      <div class="flex items-center gap-2 mb-1 px-1">
                        <span class="text-[11px] font-semibold text-primary-text">
                          {{ item.isMe ? 'You' : item.actor_name }}
                        </span>
                        <span
                          v-if="item.actor_role"
                          class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border"
                          :class="item.isMe ? 'bg-primary/10 text-primary border-primary/20' : 'bg-background text-secondary-text border-primary-border'"
                        >
                          {{ item.actor_role }}
                        </span>
                        <span v-if="item.isSending" class="text-[10px] text-secondary-text flex items-center gap-1">
                          <Loader2 class="w-2.5 h-2.5 animate-spin text-primary" />
                          <span>Sending...</span>
                        </span>
                        <span v-else class="text-[10px] text-secondary-text">
                          {{ formatTime(item.created_at) }}
                        </span>
                      </div>

                      <!-- Message Box -->
                      <div
                        class="p-4 rounded-2xl text-xs leading-relaxed shadow-2xs space-y-2.5"
                        :class="[
                          item.isMe
                            ? 'bg-primary text-white rounded-tr-xs'
                            : 'bg-card-background border border-primary-border text-primary-text rounded-tl-xs'
                        ]"
                      >
                        <!-- Text comment content -->
                        <p v-if="item.comment_text" class="whitespace-pre-wrap break-words">
                          {{ item.comment_text }}
                        </p>

                        <!-- Attached File Preview -->
                        <div v-if="item.file_url" class="mt-2 pt-2" :class="item.comment_text ? (item.isMe ? 'border-t border-white/20' : 'border-t border-primary-border') : ''">
                          
                          <!-- Image Attachment -->
                          <div v-if="isImageFile(item.file_url || item.file_name)" class="space-y-1.5">
                            <a
                              :href="item.file_url"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="block overflow-hidden rounded-lg border max-w-sm hover:opacity-95 transition-opacity"
                              :class="item.isMe ? 'border-white/30 bg-black/10' : 'border-primary-border bg-background'"
                            >
                              <img
                                :src="item.file_url"
                                :alt="item.file_name || 'Attachment'"
                                class="w-full h-auto max-h-56 object-cover"
                              />
                            </a>
                            <div class="flex items-center justify-between text-[11px]" :class="item.isMe ? 'text-white/80' : 'text-secondary-text'">
                              <span class="truncate max-w-[200px]">{{ item.file_name || 'Image attachment' }}</span>
                              <a :href="item.file_url" target="_blank" download class="underline font-medium hover:opacity-80">View</a>
                            </div>
                          </div>

                          <!-- Document / Generic File Attachment -->
                          <a
                            v-else
                            :href="item.file_url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-3 p-3 rounded-lg border transition-all"
                            :class="[
                              item.isMe
                                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                : 'bg-background hover:bg-card-background border-primary-border text-primary-text'
                            ]"
                          >
                            <div
                              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              :class="item.isMe ? 'bg-white/20 text-white' : 'bg-card-background border border-primary-border text-primary'"
                            >
                              <FileIcon class="w-4 h-4" />
                            </div>
                            <div class="min-w-0 flex-1">
                              <p class="text-xs font-semibold truncate">{{ item.file_name || 'Attached File' }}</p>
                              <p class="text-[10px] opacity-75">Click to download</p>
                            </div>
                            <ExternalLink class="w-3.5 h-3.5 shrink-0 opacity-80" />
                          </a>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </template>
          </div>

          <!-- Selected File Preview Bar (Before Sending) -->
          <div v-if="selectedFile" class="px-4 py-2 bg-background border-t border-primary-border flex items-center justify-between">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Paperclip class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 text-xs">
                <p class="font-medium text-primary-text truncate">{{ selectedFile.name }}</p>
                <p class="text-[10px] text-secondary-text">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
              </div>
            </div>
            <button
              @click="clearSelectedFile"
              class="p-1 rounded-lg hover:bg-card-background text-secondary-text hover:text-primary-red transition-colors cursor-pointer"
              title="Remove file"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Bottom Chat Input Bar -->
          <div class="p-4 bg-card-background border-t border-primary-border">
            <div
              v-if="store.detail?.status === 'closed'"
              class="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-background border border-primary-border text-secondary-text text-xs font-medium"
            >
              <Lock class="w-4 h-4 text-secondary-text shrink-0" />
              <span>This ticket is closed. You can't communicate in this ticket anymore.</span>
            </div>
            <form v-else @submit.prevent="sendMessage" class="flex items-end gap-2">
              
              <!-- File Attachment Selector Button -->
              <input
                ref="fileInputRef"
                type="file"
                class="hidden"
                @change="onFileSelected"
              />
              <button
                type="button"
                @click="triggerFilePicker"
                :disabled="store.actionLoading"
                class="p-2.5 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Attach file"
              >
                <Paperclip class="w-4 h-4" />
              </button>

              <!-- Multiline Textarea Input -->
              
                <textarea
                  v-model="commentText"
                  rows="1"
                  placeholder="Type your reply... (Press Enter to send, Shift+Enter for new line)"
                  :disabled="store.actionLoading"
                  @keydown.enter.exact.prevent="sendMessage"
                  class="w-full flex-1 px-4 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-all placeholder:text-secondary-text disabled:opacity-50 resize-none max-h-28"
                />
             

              <!-- Send Button -->
              <button
                type="submit"
                :disabled="store.actionLoading || (!commentText.trim() && !selectedFile)"
                class="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer "
              >
                <Loader2 v-if="sending" class="w-4 h-4 animate-spin" />
                <Send v-else class="w-4 h-4" />
                <span class="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </template>

    <!-- Dialogs -->
    <TicketActionDialog
      :open="dialog.open"
      :mode="dialog.mode"
      :ticket-id="ticketId"
      @close="dialog.open = false"
    />
    <TicketStatusDialog
      :open="statusDialog.open"
      :status="store.detail?.status"
      :ticketId="ticketId"
      @close="statusDialog.open = false"
    />
    <ConfirmationDialog
      :open="assignDialog.open"
      :title="assignDialog.isEdit ? 'Reassign Staff Member' : 'Assign Staff Member'"
      :message="
        assignDialog.isEdit
          ? `Are you sure you want to reassign ticket #${store.detail?.ticket_number || ticketId} to ${assignDialog.staffName}?`
          : `Are you sure you want to assign ${assignDialog.staffName} to ticket #${store.detail?.ticket_number || ticketId}?`
      "
      :confirm-text="assignDialog.isEdit ? 'Reassign Staff' : 'Assign Staff'"
      cancel-text="Cancel"
      type="info"
      :loading="assignDialog.loading"
      @confirm="handleConfirmAssignStaff"
      @cancel="handleCancelAssignStaff"
    />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import {
  Paperclip,
  MessageSquare,
  File as FileIcon,
  ExternalLink,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Send,
  Loader2,
  Pencil,
  X,
  Lock
} from "lucide-vue-next";
import { usePlatfromTicketsStore } from "@/stores/platformTickets/platformTickets";
import { useProfileStore } from "@/stores/profile/profile";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";
import { useRbacStaffStore } from "@/stores/rbac/staff";
import BaseSelect from "@/components/common/BaseSelect.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import TicketActionDialog from "@/components/platformTickets/TicketActionDialog.vue";
import TicketStatusDialog from "@/components/platformTickets/TicketStatusDialog.vue";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate, calculateTat } from "@/utils/timeFormatter";

const store = usePlatfromTicketsStore();
const profileStore = useProfileStore();
const permissionsStore = useMyPermissionsStore();
const rbacStaffStore = useRbacStaffStore();
const route = useRoute();
const { hasPermission } = usePermissionCheck();

const ticketId = computed(() => route.params.id);
const dialog = ref({ open: false, mode: "comment" });
const statusDialog = ref({ open: false });

const commentText = ref("");
const selectedFile = ref(null);
const fileInputRef = ref(null);
const chatContainerRef = ref(null);
const sending = ref(false);
const optimisticMessages = ref([]);

// Current User ID determination for bubble alignment
const currentUserId = computed(() => {
  return (
    profileStore.user?.id ||
    profileStore.user?.user_id ||
    profileStore.user?.user?.id ||
    permissionsStore.userId
  );
});

const openStatusDialog = () => {
    statusDialog.value.open = true;
};

const refreshTicket = () => {
  if (ticketId.value) {
    store.fetchTicketDetail(ticketId.value, true);
  }
};

const triggerFilePicker = () => {
  fileInputRef.value?.click();
};

const onFileSelected = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const clearSelectedFile = () => {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const isImageFile = (urlOrName) => {
  if (!urlOrName) return false;
  return /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(urlOrName);
};

const isSystemEvent = (item) => {
  const systemTypes = ["staff_assigned", "status_changed", "priority_changed", "ticket_created_system"];
  return systemTypes.includes(item.event_type) || (!item.comment_text && !item.file_url);
};

const getSystemEventText = (item) => {
  if (item.event_type === "staff_assigned") {
    const toName = item.meta_data?.to_staff_name;
    return `${item.actor_name} assigned ticket ${toName ? 'to ' + toName : ''}`;
  }
  if (item.event_type === "status_changed") {
    return `${item.actor_name} updated status`;
  }
  if (item.event_type === "priority_changed") {
    return `${item.actor_name} updated priority`;
  }
  return `${item.actor_name}: ${item.event_type?.replace(/_/g, ' ') || 'event'}`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateGroup = (dateStr) => {
  if (!dateStr) return "Today";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

// Transform history array into structured chat stream
const chatStream = computed(() => {
  if (!store.detail) return [];

  const rawItems = [];

  // Add items from detail.history
  if (Array.isArray(store.detail.history) && store.detail.history.length > 0) {
    store.detail.history.forEach((h) => {
      const actorId = h.actor_user_id;
      const isMe = currentUserId.value && String(actorId) === String(currentUserId.value);
      rawItems.push({
        id: h.id || `h-${Math.random()}`,
        event_type: h.event_type || "comment_added",
        actor_name: h.actor_name || "User",
        actor_role: h.actor_role || "",
        actor_user_id: actorId,
        isMe,
        comment_text: h.comment_text,
        file_name: h.file_name,
        file_url: h.file_url,
        created_at: h.created_at,
        meta_data: h.meta_data,
      });
    });
  } else {
    // Legacy fallback to comments/attachments
    if (Array.isArray(store.detail.comments)) {
      store.detail.comments.forEach((c) => {
        const actorId = c.user_id || c.actor_user_id;
        const isMe = currentUserId.value && String(actorId) === String(currentUserId.value);
        rawItems.push({
          id: `comment-${c.id}`,
          event_type: "comment_added",
          actor_name: c.name || c.email || c.role || "User",
          actor_role: c.role || "",
          actor_user_id: actorId,
          isMe,
          comment_text: c.comment || c.comment_text,
          created_at: c.created_at,
        });
      });
    }
    if (Array.isArray(store.detail.attachments)) {
      store.detail.attachments.forEach((a) => {
        const actorId = a.user_id || a.actor_user_id;
        const isMe = currentUserId.value && String(actorId) === String(currentUserId.value);
        rawItems.push({
          id: `att-${a.id}`,
          event_type: "attachment_uploaded",
          actor_name: a.actor_name || "User",
          actor_role: a.role || "",
          actor_user_id: actorId,
          isMe,
          file_name: a.file_name,
          file_url: a.file_url,
          created_at: a.created_at,
        });
      });
    }
  }

  // Append optimistic messages seamlessly
  if (optimisticMessages.value.length > 0) {
    optimisticMessages.value.forEach((opt) => {
      rawItems.push(opt);
    });
  }

  // Sort items by created_at ascending
  rawItems.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Group by date
  const grouped = [];
  let currentGroup = null;

  rawItems.forEach((item) => {
    const groupLabel = formatDateGroup(item.created_at);
    if (!currentGroup || currentGroup.dateLabel !== groupLabel) {
      currentGroup = {
        dateLabel: groupLabel,
        messages: [],
      };
      grouped.push(currentGroup);
    }
    currentGroup.messages.push(item);
  });

  return grouped;
});

const totalHistoryCount = computed(() => {
  let count = 0;
  chatStream.value.forEach((g) => {
    count += g.messages.length;
  });
  return count;
});

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
    }
  });
};

watch(() => store.detail, () => {
  scrollToBottom();
}, { deep: true });

const sendMessage = () => {
  const text = commentText.value.trim();
  const file = selectedFile.value;

  if (!text && !file) return;

  sending.value = true;

  // Create instant optimistic bubble
  const tempId = `temp-${Date.now()}`;
  let tempFileUrl = null;
  if (file && isImageFile(file.name || file.type)) {
    tempFileUrl = URL.createObjectURL(file);
  }

  const optimisticItem = {
    id: tempId,
    event_type: file ? "attachment_uploaded" : "comment_added",
    actor_name: profileStore.user?.name || profileStore.user?.first_name || "You",
    actor_role: profileStore.user?.role || "staff",
    actor_user_id: currentUserId.value,
    isMe: true,
    isSending: true,
    comment_text: text || null,
    file_name: file ? file.name : null,
    file_url: tempFileUrl,
    created_at: new Date().toISOString(),
  };

  optimisticMessages.value.push(optimisticItem);
  scrollToBottom();

  const clearOptimistic = () => {
    if (tempFileUrl) {
      URL.revokeObjectURL(tempFileUrl);
    }
    optimisticMessages.value = optimisticMessages.value.filter((m) => m.id !== tempId);
  };

  const onComplete = () => {
    commentText.value = "";
    clearSelectedFile();
    sending.value = false;
    clearOptimistic();
    scrollToBottom();
  };

  if (file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("attachments", file);
    fd.append("files", file);

    store.addAttachment(ticketId.value, fd, () => {
      if (text) {
        store.addComment(ticketId.value, { comment: text }, onComplete);
      } else {
        onComplete();
      }
    });
  } else if (text) {
    store.addComment(ticketId.value, { comment: text }, onComplete);
  }
};

const isEditingStaff = ref(false);

const staffOptions = computed(() => {
  return (rbacStaffStore.records || []).map((s) => ({
    value: s.id,
    label: s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email,
  }));
});

const assignDialog = ref({
  open: false,
  loading: false,
  staffId: null,
  staffName: "",
  isEdit: false,
});

const promptAssignStaff = (staffId) => {
  if (!staffId) return;

  const currentStaffId =
    store.detail?.assigned_staff?.id ||
    store.detail?.assigned_staff_id;

  if (currentStaffId && Number(currentStaffId) === Number(staffId)) {
    isEditingStaff.value = false;
    return;
  }

  const isEdit = !!store.detail?.assigned_staff;
  const staffObj = (rbacStaffStore.records || []).find((s) => s.id === staffId);
  const staffName = staffObj
    ? staffObj.name ||
      `${staffObj.first_name || ""} ${staffObj.last_name || ""}`.trim() ||
      staffObj.email
    : "selected staff member";

  assignDialog.value = {
    open: true,
    loading: false,
    staffId,
    staffName,
    isEdit,
  };
};

const handleConfirmAssignStaff = () => {
  const { staffId } = assignDialog.value;
  if (!ticketId.value || !staffId) {
    assignDialog.value.open = false;
    return;
  }

  assignDialog.value.loading = true;

  store.assignTicket(ticketId.value, staffId, () => {
    assignDialog.value.loading = false;
    assignDialog.value.open = false;
    isEditingStaff.value = false;
  });
};

const handleCancelAssignStaff = () => {
  assignDialog.value.open = false;
};

const now = ref(new Date());
let tickerTimer = null;

const getTat = (ticket) => calculateTat(ticket, now.value);

onMounted(() => {
  tickerTimer = setInterval(() => {
    now.value = new Date();
  }, 1000);

  rbacStaffStore.fetchStaff(false);

  if (ticketId.value) {
    store.fetchTicketDetail(ticketId.value);
  }
});

onBeforeUnmount(() => {
  if (tickerTimer) clearInterval(tickerTimer);
});

const priorityClass = (p) =>
  ({
    high: "bg-primary-red/20 text-primary-red border-primary-red/30",
    urgent: "bg-primary-red/30 text-primary-red border-primary-red/40 font-semibold",
    medium: "bg-primary-yellow/20 text-primary-yellow border-primary-yellow/30",
    low: "bg-primary-green/20 text-primary-green border-primary-green/30",
  })[p] ?? "bg-primary-border/20 text-secondary-text border-primary-border";

const statusClass = (s) =>
  ({
    open: "bg-primary-blue/20 text-primary border-primary-blue/30",
    in_progress: "bg-primary-yellow/20 text-primary-yellow border-primary-yellow/30",
    resolved: "bg-primary-green/20 text-primary-green border-primary-green/30",
    closed: "bg-primary-border/20 text-secondary-text border-primary-border",
  })[s] ?? "bg-primary-border/20 text-secondary-text border-primary-border";
</script>

