<template>
  <div
    class="bg-card-background/40 border border-primary-border rounded-lg p-5 sm:p-6 flex flex-col justify-between min-h-[360px] flex-1"
  >
    <!-- ─── HEADER ────────────────────────────────────────────────── -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-primary-border/60"
    >
      <div>
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
          >
            <Files class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
              Documents
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {{ filesList.length }}
              </span>
            </h3>
            <p class="text-xs text-secondary-text mt-0.5">
              Uploaded documents for this client.
            </p>
          </div>
        </div>
      </div>

      <!-- Actions on Top Right -->
      <div v-if="canAddDoc" class="flex items-center gap-2 flex-wrap">
        <!-- Upload Document Button -->
        <button
          type="button"
          @click="openAddDrawer('document')"
          class="bg-primary hover:bg-primary-hover text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
        >
          <Upload class="w-3.5 h-3.5" />
          Upload Document
        </button>
      </div>
    </div>

    <!-- ─── BODY / TABLE CONTENT ───────────────────────────────────── -->
    <div class="pt-4 flex-1 flex flex-col justify-start">
      <!-- Loading Skeleton -->
      <div
        v-if="clientDepthStore.userReferencesLoading && filesList.length === 0"
        class="space-y-3 py-2"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="h-14 rounded-lg bg-card-background/60 border border-primary-border/60 animate-pulse flex items-center justify-between px-4"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary-border/40 shrink-0" />
            <div class="space-y-1.5">
              <div class="h-3.5 w-28 sm:w-36 bg-primary-border/60 rounded" />
              <div class="h-2.5 w-36 sm:w-48 bg-primary-border/30 rounded" />
            </div>
          </div>
          <div class="h-5 w-16 bg-primary-border/40 rounded-full hidden sm:block" />
          <div class="h-4 w-20 bg-primary-border/30 rounded hidden md:block" />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredFiles.length === 0"
        class="py-12 flex flex-col items-center justify-center text-center my-auto"
      >
        <div
          class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3"
        >
          <Files class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-primary-text">
          No KYC documents or images uploaded
        </p>
        <p class="text-xs text-secondary-text mt-1 max-w-sm">
          Upload Aadhaar, PAN card, Passport, driving license or bank statements for verification.
        </p>
        <div v-if="canAddDoc" class="flex items-center gap-2 mt-4">
          <button
            type="button"
            @click="openAddDrawer('document')"
            class="border border-primary text-primary hover:bg-primary/10 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Upload class="w-3.5 h-3.5" />
            Upload Document
          </button>
          <button
            type="button"
            @click="openAddDrawer('image')"
            class="border border-primary-border text-primary-text hover:bg-background rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ImageIcon class="w-3.5 h-3.5 text-secondary-text" />
            Upload Image
          </button>
        </div>
      </div>

      <!-- Table of Documents & Images (Scrollable with sticky header) -->
      <div
        v-else
        class="flex flex-col min-h-0 border border-primary-border rounded-lg overflow-x-auto overflow-y-auto max-h-[360px] flex-1 no-scrollbar"
      >
        <table class="w-full text-left text-xs border-collapse">
          <thead
            class="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-primary-border"
          >
            <tr class="text-[11px] font-bold text-secondary-text uppercase tracking-wider">
              <th class="py-2.5 px-3.5">Document Details</th>
              <th class="py-2.5 px-3">Type</th>
              <th class="py-2.5 px-3">Uploaded By</th>
              <th class="py-2.5 px-3">Date &amp; Time</th>
              <th class="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredFiles"
              :key="item.uniqueKey"
              class="border-b border-primary-border hover:bg-card-background/70 transition-colors group cursor-pointer"
              @click="openViewDrawer(item)"
            >
              <!-- Details / Title / Remarks -->
              <td class="py-3 px-3.5 max-w-xs">
                <div class="flex items-start gap-2.5">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <p
                        class="font-bold text-primary-text text-xs group-hover:text-primary transition-colors truncate"
                      >
                        {{ item.title }}
                      </p>
                      <span
                        v-if="item.file_name"
                        class="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold uppercase bg-primary/10 text-primary border border-primary/20"
                      >
                        {{ formatFileNameDisplay(item.file_name) }}
                      </span>
                    </div>
                    <p class="text-[11px] text-secondary-text line-clamp-1 mt-0.5">
                      {{ item.previewText }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Type Badge -->
              <td class="py-3 px-3">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border bg-primary-blue/10 text-primary-blue border-primary-blue/20"
                >
                  <component
                    :is="isImageFile(item) ? ImageIcon : FileText"
                    class="w-3 h-3"
                  />
                  {{ isImageFile(item) ? "Image" : "Document" }}
                </span>
              </td>

              <!-- Created By / Author -->
              <td class="py-3 px-3">
                <div class="flex items-center gap-1.5">
                  <div
                    class="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-extrabold flex items-center justify-center shrink-0"
                  >
                    {{ (item.author || "A").charAt(0).toUpperCase() }}
                  </div>
                  <span
                    class="font-semibold text-primary-text text-xs truncate max-w-[120px]"
                  >
                    {{ item.author || "Admin User" }}
                  </span>
                </div>
              </td>

              <!-- Date & Time -->
              <td
                class="py-3 px-3 text-secondary-text text-[11px] font-medium whitespace-nowrap"
              >
                {{ formatDateTime(item.created_at) }}
              </td>

              <!-- Actions (Three-dot DropdownMenu) -->
              <td
                class="py-2.5 px-3.5 text-right whitespace-nowrap"
                @click.stop
              >
                <div class="inline-flex justify-end">
                  <DropdownMenu
                    :items="getDocumentActions(item)"
                    position="bottom-end"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── 1. REUSABLE VIEW DOCUMENT SIDE DRAWER ────────────────── -->
    <ViewClientDocumentDrawer
      :open="viewDrawerOpen"
      :doc="selectedItem"
      :canEdit="canEditDoc"
      :canDelete="canDeleteDoc"
      @close="closeViewDrawer"
      @edit="openEditDrawer"
      @delete="openDeleteModal"
    />

    <!-- ─── 2. REUSABLE UPLOAD / EDIT DOCUMENT SIDE DRAWER ────────── -->
    <UploadKycDocumentModal
      :open="uploadModalOpen"
      :userId="currentUserId"
      :existingDoc="docToEdit"
      :initialCategory="uploadModalCategory"
      @close="closeUploadModal"
      @success="handleUploadSuccess"
    />

    <!-- ─── 3. DELETE CONFIRMATION MODAL ─────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="deleteModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer overflow-y-auto"
          @click="closeDeleteModal"
        >
          <div
            class="bg-card-background border border-primary-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 cursor-default"
            @click.stop
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-primary-red/10 border border-primary-red/20 text-primary-red flex items-center justify-center shrink-0"
              >
                <AlertTriangle class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-base">
                  Delete KYC Document?
                </h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  Are you sure you want to delete this document? This action cannot be undone.
                </p>
              </div>
            </div>

            <div
              class="p-3 rounded-lg bg-background border border-primary-border text-xs text-primary-text font-medium"
            >
              <p class="font-bold">
                {{ itemToDelete?.file_name || itemToDelete?.title || "Selected Document" }}
              </p>
              <p class="text-[11px] text-secondary-text mt-0.5 line-clamp-2">
                {{ itemToDelete?.remarks || "—" }}
              </p>
            </div>

            <div
              class="flex items-center justify-end gap-2 pt-2 border-t border-primary-border"
            >
              <button
                type="button"
                @click="closeDeleteModal"
                class="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-background rounded-lg border border-primary-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="confirmDelete"
                :disabled="clientDepthStore.isDeletingReference"
                class="px-4 py-2 text-xs font-semibold text-white bg-primary-red hover:bg-primary-red/90 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Loader2
                  v-if="clientDepthStore.isDeletingReference"
                  class="w-3.5 h-3.5 animate-spin"
                />
                <span>Delete Document</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { useProfileStore } from "@/stores/profile/profile";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import UploadKycDocumentModal from "@/components/clientDetails/UploadKycDocumentModal.vue";
import ViewClientDocumentDrawer from "@/components/clientDetails/ViewClientDocumentDrawer.vue";
import {
  FileText,
  File,
  Files,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  X,
  ExternalLink,
  Copy,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
} from "lucide-vue-next";

const props = defineProps({
  userId: {
    type: [String, Number],
    default: null,
  },
});

const route = useRoute();
const snackbar = useSnackbarStore();
const clientDepthStore = useClientDepthStore();

const currentUserId = computed(() => {
  return props.userId || route.params.id || clientDepthStore.activeClient?.id;
});

const formatFileNameDisplay = (fileName) => {
  if (!fileName) return "";
  return fileName.replace(/_/g, " ");
};

// ─── Fetch References ─────────────────────────────────────────────────────────
const loadReferences = (force = false) => {
  if (currentUserId.value) {
    clientDepthStore.fetchUserReferences(currentUserId.value, force);
  }
};

onMounted(() => {
  loadReferences(false);
});

watch(
  () => currentUserId.value,
  (newId, oldId) => {
    if (newId && newId !== oldId) loadReferences(false);
  },
);

// ─── Resolvers for Files ──────────────────────────────────────────────────────
const rawData = computed(() => {
  return clientDepthStore.userReferencesData || {};
});

const isImageFile = (input) => {
  if (!input) return false;

  if (typeof input === "object") {
    const mime =
      input.mime_type ||
      input.mime ||
      input.raw?.mime_type ||
      input.raw?.type ||
      input.raw?.mime;
    if (typeof mime === "string" && mime.startsWith("image/")) return true;

    const candidates = [
      input.file_url,
      input.path,
      input.formatted_path,
      input.url,
      input.file_name,
      input.name,
      input.title,
      input.raw?.path,
      input.raw?.formatted_path,
      input.raw?.file_name,
      input.raw?.file_url,
      input.raw?.name,
    ].filter(Boolean);

    for (const c of candidates) {
      if (typeof c === "string" && isImageFile(c)) return true;
    }
    return false;
  }

  const str = String(input).split("?")[0].split("#")[0].toLowerCase();
  if (str.startsWith("data:image/") || str.startsWith("blob:")) return true;
  return /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico|tiff?)$/i.test(str);
};

const filesList = computed(() => {
  const files = rawData.value?.files || [];
  return files
    .map((f, idx) => ({
      uniqueKey: `file-${f.id || idx}`,
      id: f.id,
      isDoc: true,
      file_name: f.file_name || `Reference Document #${f.id || idx + 1}`,
      title: f.file_name
        ? formatFileNameDisplay(f.file_name)
        : `Document #${f.id || idx + 1}`,
      remarks: f.description || f.remarks || "",
      previewText:
        f.description || f.remarks || f.path || f.file_name || "Attached document",
      file_url: f.formatted_path || f.path || null,
      path: f.path || null,
      author: f.uploaded_by_name || "Admin User",
      created_at:
        f.created_at || rawData.value?.created_at || new Date().toISOString(),
      raw: f,
    }))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
});

const filteredFiles = computed(() => {
  return filesList.value;
});

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  snackbar.show("Copied to clipboard!", "success");
};

// ─── View Drawer State ────────────────────────────────────────────────────────
const selectedItem = ref(null);
const viewDrawerOpen = ref(false);

const openViewDrawer = (item) => {
  selectedItem.value = item;
  viewDrawerOpen.value = true;
};

const closeViewDrawer = () => {
  viewDrawerOpen.value = false;
};

const { hasPermission } = usePermissionCheck();

const canAddDoc = computed(() => {
  return hasPermission(["client.document_add"]);
});

const canViewDoc = computed(() => {
  return hasPermission(["client.document_view", "client.view", "kyc.view"]);
});

const canEditDoc = computed(() => {
  return hasPermission(["client.document_update"]);
});

const canDeleteDoc = computed(() => {
  return hasPermission(["client.document_delete"]);
});

// ─── Document Dropdown Actions ───────────────────────────────────────────────
const getDocumentActions = (item) => {
  const actions = [];

  if (canViewDoc.value) {
    actions.push({
      id: "view",
      label: "View Details",
      icon: Eye,
      handler: () => openViewDrawer(item),
    });
  }

  if (canEditDoc.value) {
    actions.push({
      id: "edit",
      label: "Edit Document",
      icon: Pencil,
      handler: () => openEditDrawer(item),
    });
  }

  if (item.file_url) {
    actions.push({
      id: "open",
      label: "Open Link",
      icon: ExternalLink,
      handler: () => window.open(item.file_url, "_blank", "noopener,noreferrer"),
    });
  }

  if (canDeleteDoc.value) {
    actions.push({
      id: "delete",
      label: "Delete",
      icon: Trash2,
      danger: true,
      handler: () => openDeleteModal(item),
    });
  }

  return actions;
};

// ─── Reusable Upload / Edit Modal State ────────────────────────────────────────
const uploadModalOpen = ref(false);
const uploadModalCategory = ref("document");
const docToEdit = ref(null);

const openAddDrawer = (type = "document") => {
  if (viewDrawerOpen.value) closeViewDrawer();
  docToEdit.value = null;
  uploadModalCategory.value = type === "image" ? "image" : "document";
  uploadModalOpen.value = true;
};

const openEditDrawer = (item) => {
  if (viewDrawerOpen.value) closeViewDrawer();
  docToEdit.value = item;
  uploadModalCategory.value = isImageFile(item) ? "image" : "document";
  uploadModalOpen.value = true;
};

const closeUploadModal = () => {
  uploadModalOpen.value = false;
  docToEdit.value = null;
};

const handleUploadSuccess = () => {
  loadReferences(true);
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────
const deleteModalOpen = ref(false);
const itemToDelete = ref(null);

const openDeleteModal = (item) => {
  if (viewDrawerOpen.value) closeViewDrawer();
  itemToDelete.value = item;
  deleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  deleteModalOpen.value = false;
  itemToDelete.value = null;
};

const confirmDelete = () => {
  if (!itemToDelete.value || !currentUserId.value) return;

  const payload = {
    user_id: currentUserId.value,
    id: itemToDelete.value.id,
    file_id: itemToDelete.value.id,
  };

  clientDepthStore.deleteUserReference(currentUserId.value, payload, (err) => {
    if (!err) closeDeleteModal();
  });
};
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-active .transform,
.drawer-fade-leave-active .transform {
  transition: transform 0.25s ease;
}
.drawer-fade-enter-from .transform,
.drawer-fade-leave-to .transform {
  transform: translateX(100%);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
