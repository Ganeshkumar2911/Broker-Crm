<template>
  <div
    class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 flex flex-col justify-between min-h-[360px] flex-1"
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
            <FileText class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base min-[1650px]:text-lg font-bold text-primary-text">
              Remarks
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {{ notesList.length }}
              </span>
            </h3>
            <p class="text-xs text-secondary-text mt-0.5">
              Internal staff notes.
            </p>
          </div>
        </div>
      </div>

      <!-- Actions on Top Right -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Add Note Button (Opens Side Drawer) -->
        <button
          type="button"
          @click="openAddDrawer"
          class="bg-primary hover:bg-primary-hover text-white rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Plus class="w-3.5 h-3.5" />
          Add Note
        </button>
      </div>
    </div>

    <!-- ─── BODY / TABLE CONTENT ───────────────────────────────────── -->
    <div class="pt-4 flex-1 flex flex-col justify-start">
      <!-- Loading Skeleton -->
      <div
        v-if="clientDepthStore.userReferencesLoading && notesList.length === 0"
        class="space-y-3 py-2"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="h-14 rounded-xl bg-card-background/60 border border-primary-border/60 animate-pulse flex items-center justify-between px-4"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary-border/40 shrink-0" />
            <div class="space-y-1.5">
              <div class="h-3.5 w-32 sm:w-44 bg-primary-border/60 rounded" />
              <div class="h-2.5 w-44 sm:w-60 bg-primary-border/30 rounded" />
            </div>
          </div>
          <div class="h-4 w-24 bg-primary-border/30 rounded hidden sm:block" />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="notesList.length === 0"
        class="py-12 flex flex-col items-center justify-center text-center my-auto"
      >
        <div
          class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3"
        >
          <FileText class="w-6 h-6" />
        </div>
        <p class="text-sm font-bold text-primary-text">No KYC notes yet</p>
        <p class="text-xs text-secondary-text mt-1 max-w-sm">
          No verification remarks or audit notes have been logged for this client.
        </p>
        <button
          type="button"
          @click="openAddDrawer"
          class="mt-4 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus class="w-3.5 h-3.5" />
          Add First Note
        </button>
      </div>

      <!-- Table of Notes (Scrollable with sticky header) -->
      <div
        v-else
        class="border border-primary-border rounded-xl overflow-x-auto overflow-y-auto max-h-[300px] flex-1 no-scrollbar"
      >
        <table class="w-full text-left text-xs border-collapse">
          <thead
            class="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-primary-border"
          >
            <tr
              class="text-[11px] font-bold text-secondary-text uppercase tracking-wider"
            >
              <th class="py-2.5 px-3.5">Note / Remark</th>
              <th class="py-2.5 px-3">Author</th>
              <th class="py-2.5 px-3">Date &amp; Time</th>
              <th class="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="note in notesList"
              :key="note.uniqueKey"
              class="border-b border-primary-border hover:bg-card-background/70 transition-colors group cursor-pointer"
              @click="openViewDrawer(note)"
            >
              <!-- Details / Title / Remarks -->
              <td class="py-3 px-3.5 max-w-sm">
                <div class="flex items-start gap-2.5">
                  <div class="min-w-0 flex-1">
                    <p
                      class="font-bold text-primary-text text-xs group-hover:text-primary transition-colors truncate"
                    >
                      {{ note.title }}
                    </p>
                    <p
                      class="text-[11px] text-secondary-text line-clamp-2 mt-0.5"
                    >
                      {{ note.remarks || "—" }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Created By / Author -->
              <td class="py-3 px-3">
                <div class="flex items-center gap-1.5">
                  <div
                    class="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-extrabold flex items-center justify-center shrink-0 border border-primary/20"
                  >
                    {{ (note.author || "A").charAt(0).toUpperCase() }}
                  </div>
                  <span
                    class="font-semibold text-primary-text text-xs truncate max-w-[120px]"
                  >
                    {{ note.author || "Admin User" }}
                  </span>
                </div>
              </td>

              <!-- Date & Time -->
              <td
                class="py-3 px-3 text-secondary-text text-[11px] font-medium whitespace-nowrap"
              >
                {{ formatDateTime(note.created_at) }}
              </td>

              <!-- Actions (Three-dot DropdownMenu) -->
              <td
                class="py-2.5 px-3.5 text-right whitespace-nowrap"
                @click.stop
              >
                <div class="inline-flex justify-end">
                  <DropdownMenu
                    :items="getNoteActions(note)"
                    position="bottom-end"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── 1. REUSABLE VIEW NOTE SIDE DRAWER ─────────────────────── -->
    <ViewKycNoteDrawer
      :open="viewDrawerOpen"
      :note="selectedNote"
      @close="closeViewDrawer"
      @edit="openEditDrawer"
      @delete="openDeleteModal"
    />

    <!-- ─── 2. REUSABLE ADD / EDIT NOTE SIDE DRAWER ───────────────── -->
    <AddEditKycNoteDrawer
      :open="formDrawerOpen"
      :userId="currentUserId"
      :existingNote="noteToEdit"
      @close="closeFormDrawer"
      @success="handleFormSuccess"
    />

    <!-- ─── 3. REUSABLE DELETE CONFIRMATION MODAL ─────────────────── -->
    <DeleteKycNoteModal
      :open="deleteModalOpen"
      :userId="currentUserId"
      :note="itemToDelete"
      @close="closeDeleteModal"
      @success="handleDeleteSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import DropdownMenu from "@/components/common/DropdownMenu.vue";
import ViewKycNoteDrawer from "@/components/clientDetails/ViewKycNoteDrawer.vue";
import AddEditKycNoteDrawer from "@/components/clientDetails/AddEditKycNoteDrawer.vue";
import DeleteKycNoteModal from "@/components/clientDetails/DeleteKycNoteModal.vue";
import { FileText, Eye, Pencil, Trash2, Plus } from "lucide-vue-next";

const props = defineProps({
  userId: {
    type: [String, Number],
    default: null,
  },
});

const route = useRoute();
const clientDepthStore = useClientDepthStore();

const currentUserId = computed(() => {
  return props.userId || route.params.id || clientDepthStore.activeClient?.id;
});

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

// ─── Resolvers for Notes ──────────────────────────────────────────────────────
const rawData = computed(() => {
  return clientDepthStore.userReferencesData || {};
});

const notesList = computed(() => {
  const notes = rawData.value?.notes || [];
  return notes
    .map((n, idx) => ({
      uniqueKey: `note-${n.id || idx}`,
      id: n.id,
      isDoc: false,
      title: n.creator_name
        ? `${n.creator_name}'s Note`
        : "Internal Verification Note",
      remarks: n.remarks || n.note || n.text || "",
      author: n.creator_name || n.uploaded_by_name || "Admin User",
      created_at:
        n.created_at || rawData.value?.created_at || new Date().toISOString(),
      raw: n,
    }))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
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

// ─── View Drawer State ────────────────────────────────────────────────────────
const selectedNote = ref(null);
const viewDrawerOpen = ref(false);

const openViewDrawer = (note) => {
  selectedNote.value = note;
  viewDrawerOpen.value = true;
};

const closeViewDrawer = () => {
  viewDrawerOpen.value = false;
};

// ─── Add / Edit Drawer State ──────────────────────────────────────────────────
const formDrawerOpen = ref(false);
const noteToEdit = ref(null);

const openAddDrawer = () => {
  if (viewDrawerOpen.value) closeViewDrawer();
  noteToEdit.value = null;
  formDrawerOpen.value = true;
};

const openEditDrawer = (note) => {
  if (viewDrawerOpen.value) closeViewDrawer();
  noteToEdit.value = note;
  formDrawerOpen.value = true;
};

const closeFormDrawer = () => {
  formDrawerOpen.value = false;
  noteToEdit.value = null;
};

const handleFormSuccess = () => {
  closeFormDrawer();
};

// ─── Delete Modal State ───────────────────────────────────────────────────────
const deleteModalOpen = ref(false);
const itemToDelete = ref(null);

const openDeleteModal = (note) => {
  if (viewDrawerOpen.value) closeViewDrawer();
  itemToDelete.value = note;
  deleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  deleteModalOpen.value = false;
  itemToDelete.value = null;
};

const handleDeleteSuccess = () => {
  closeDeleteModal();
};

// ─── Note Dropdown Actions ───────────────────────────────────────────────────
const getNoteActions = (note) => [
  {
    id: "view",
    label: "View Note",
    icon: Eye,
    handler: () => openViewDrawer(note),
  },
  {
    id: "edit",
    label: "Edit Note",
    icon: Pencil,
    handler: () => openEditDrawer(note),
  },
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    danger: true,
    handler: () => openDeleteModal(note),
  },
];
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
