<template>
  <div class="pb-10 max-w-[1600px] mx-auto space-y-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card-background border border-primary-border text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background transition-all cursor-pointer disabled:opacity-50"
          :disabled="store.loading"
          @click="store.fetchGroups(true)"
          title="Refresh media folders"
        >
          <RotateCw
            class="w-3.5 h-3.5"
            :class="{ 'animate-spin': store.loading }"
          />
          <span class="hidden sm:inline">Refresh</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer"
          @click="panel = { open: true, editData: null }"
        >
          <Plus class="w-4 h-4" />
          <span>Create Folder</span>
        </button>
      </div>
    </div>

    <!-- Skeleton -->
    <div
      v-if="store.loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4"
      >
        <div class="flex items-center justify-between">
          <div class="h-5 w-36 bg-background rounded-md" />
          <div class="h-5 w-16 bg-background rounded-full" />
        </div>
        <div class="h-3.5 w-full bg-background rounded-md" />
        <div class="h-3 w-28 bg-background rounded-md" />
        <div class="flex gap-2 pt-3 border-t border-primary-border">
          <div class="flex-1 h-8 bg-background rounded-lg" />
          <div class="w-8 h-8 bg-background rounded-lg" />
          <div class="w-8 h-8 bg-background rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="store.records.length === 0"
      class="flex flex-col items-center justify-center gap-4 py-20 bg-card-background/40 border border-dashed border-primary-border rounded-2xl"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text"
      >
        <FolderOpen class="w-8 h-8 opacity-60" />
      </div>
      <div class="text-center max-w-sm px-4">
        <h3 class="text-base font-bold text-primary-text">
          No Media Folders Yet
        </h3>
        <p class="text-xs text-secondary-text mt-1 leading-relaxed">
          Create your first media group folder to start uploading and organizing
          promotional images.
        </p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer"
        @click="panel = { open: true, editData: null }"
      >
        <Plus class="w-4 h-4" />
        <span>Create First Folder</span>
      </button>
    </div>

    <!-- Group Folders Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="group in store.records"
        :key="group.id"
        class="group bg-card-background border border-primary-border/80 hover:border-primary/50 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 cursor-pointer"
        @click="router.push(`/media/${group.id}`)"
      >
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform"
              >
                <FolderOpen class="w-5 h-5" />
              </div>

              <div class="min-w-0">
                <h3
                  class="text-sm font-bold text-primary-text group-hover:text-primary transition-colors truncate"
                >
                  {{ group.title }}
                </h3>
                <p class="text-[11px] font-mono text-secondary-text/80">
                  Folder #{{ group.id }}
                </p>
              </div>
            </div>

            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0"
              :class="
                group.is_active
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                  : 'bg-primary-red/10 text-primary-red border-primary-red/20'
              "
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="group.is_active ? 'bg-primary-green' : 'bg-primary-red'"
              />
              {{ group.is_active ? "Active" : "Inactive" }}
            </span>
          </div>

          <p
            class="text-xs text-secondary-text leading-relaxed line-clamp-2 min-h-[36px]"
          >
            {{
              group.description ||
              "No description provided for this media group."
            }}
          </p>
        </div>

        <div class="space-y-3 pt-3 border-t border-primary-border/60">
          <div
            class="flex items-center justify-between text-[11px] text-secondary-text"
          >
            <span class="flex items-center gap-1.5">
              <CalendarDays class="w-3.5 h-3.5 text-secondary-text/70" />
              {{ formatDate(group.created_at) }}
            </span>
          </div>

          <div class="flex items-center gap-2" @click.stop>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer"
              @click="router.push(`/media/${group.id}`)"
            >
              <FolderOpen class="w-3.5 h-3.5" />
              <span>Open Folder</span>
            </button>

            <button
              type="button"
              class="p-2 rounded-lg border border-primary-border/80 hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              @click="panel = { open: true, editData: group }"
              title="Edit Folder"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              class="p-2 rounded-lg bg-primary-red/10 border border-primary-red/20 text-primary-red hover:bg-primary-red/20 transition-colors cursor-pointer"
              @click="deleteDialog = { open: true, group }"
              title="Delete Folder"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pt-2">
      <Pagination
        v-if="store.pagination.total > store.pagination.per_page"
        :pagination="{
          page: store.pagination.page,
          per_page: store.pagination.per_page,
          total_items: store.pagination.total,
          total_pages: store.pagination.pages,
        }"
        @page-change="store.changePage"
      />
    </div>

    <!-- Dialogs -->
    <MediaGroupDialog
      :open="panel.open"
      :edit-data="panel.editData"
      @close="panel = { open: false, editData: null }"
    />
    <DeleteGroupDialog
      :open="deleteDialog.open"
      :group="deleteDialog.group"
      @close="deleteDialog = { open: false, group: null }"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  Plus,
  FolderOpen,
  Pencil,
  Trash2,
  CalendarDays,
  RotateCw,
} from "lucide-vue-next";
import { useMediaGroupsStore } from "@/stores/media/mediaGroups";
import Pagination from "@/components/common/Pagination.vue";
import MediaGroupDialog from "@/components/media/MediaGroupDialog.vue";
import DeleteGroupDialog from "@/components/media/DeleteGroupDialog.vue";
import { formatDate } from "@/utils/timeFormatter";

const store = useMediaGroupsStore();
const router = useRouter();

const panel = ref({ open: false, editData: null });
const deleteDialog = ref({ open: false, group: null });

onMounted(() => {
  store.fetchGroups();
});
</script>
