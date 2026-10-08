<template>
  <div class="pb-10 max-w-[1600px] mx-auto space-y-6">
    <!-- Compact Merged Header & Controls Card -->
    <div
      class="rounded-2xl bg-card-background border border-primary-border/80 p-4 sm:p-5 space-y-4"
    >
      <!-- Top Row: Folder Info & Action Buttons -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
          >
            <FolderOpen class="w-5 h-5" />
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1
                class="text-lg font-bold text-primary-text tracking-tight truncate"
              >
                {{ store.mediaGroup?.title || "Media Folder" }}
              </h1>

              <span
                v-if="store.mediaGroup"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
                :class="
                  store.mediaGroup.is_active
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    store.mediaGroup.is_active
                      ? 'bg-primary-green'
                      : 'bg-primary-red'
                  "
                />
                {{
                  store.mediaGroup.is_active
                    ? "Active Folder"
                    : "Inactive Folder"
                }}
              </span>

              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-background border border-primary-border/80 text-secondary-text"
              >
                {{ store.pagination?.total ?? store.records.length }} Total
                Assets
              </span>
            </div>

            <p
              v-if="store.mediaGroup?.description"
              class="text-xs text-secondary-text truncate max-w-2xl mt-0.5 leading-relaxed"
            >
              {{ store.mediaGroup.description }}
            </p>
          </div>
        </div>

        <!-- Right Side Action Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-card-background transition-all cursor-pointer disabled:opacity-50"
            :disabled="store.loading"
            @click="store.fetchMediaImages(groupId)"
            title="Refresh media"
          >
            <RotateCw
              class="w-3.5 h-3.5"
              :class="{ 'animate-spin': store.loading }"
            />
            <span class="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-sm"
            @click="panel = { open: true, editData: null }"
          >
            <Upload class="w-3.5 h-3.5" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-primary-border/60" />

      <!-- Bottom Row: Search, Status Filter & View Switcher -->
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
      >
        <!-- Search Input & Status Filter -->
        <div class="flex flex-wrap items-center gap-3 flex-1">
          <!-- Search Input -->
          <div class="relative flex-1 max-w-sm min-w-[200px]">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search media..."
              class="w-full pl-8 pr-7 py-1.5 bg-background border border-primary-border/80 rounded-lg text-xs text-primary-text placeholder:text-secondary-text/70 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
            >
              <X class="w-3 h-3" />
            </button>
          </div>

          <!-- Status Filter Pills -->
          <!-- <div
            class="flex items-center bg-background border border-primary-border/80 p-0.5 rounded-lg shrink-0"
          >
            <button
              v-for="status in ['all', 'active', 'inactive']"
              :key="status"
              type="button"
              class="px-2.5 py-1 text-[11px] font-semibold capitalize rounded-md transition-all cursor-pointer"
              :class="
                statusFilter === status
                  ? 'bg-primary text-white font-bold'
                  : 'text-secondary-text hover:text-primary-text'
              "
              @click="statusFilter = status"
            >
              {{ status }}
            </button>
          </div> -->
        </div>

        <!-- View Switcher (Grid vs List) -->
        <div class="flex items-center justify-end shrink-0">
          <div
            class="flex items-center bg-background border border-primary-border/80 p-0.5 rounded-lg"
          >
            <button
              type="button"
              class="p-1 rounded-md transition-all cursor-pointer"
              :class="
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-secondary-text hover:text-primary-text'
              "
              @click="viewMode = 'grid'"
              title="Grid View"
            >
              <LayoutGrid class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              class="p-1 rounded-md transition-all cursor-pointer"
              :class="
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-secondary-text hover:text-primary-text'
              "
              @click="viewMode = 'list'"
              title="List View"
            >
              <List class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div
      v-if="store.loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden animate-pulse"
      >
        <div class="aspect-video bg-background/80" />
        <div class="p-4 space-y-2.5">
          <div class="h-4 w-32 bg-background rounded-md" />
          <div class="h-3 w-full bg-background rounded-md" />
          <div class="h-8 w-full bg-background rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredImages.length === 0"
      class="flex flex-col items-center justify-center gap-4 py-20 bg-card-background/40 border border-dashed border-primary-border rounded-2xl"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text"
      >
        <ImageIcon class="w-8 h-8 opacity-60" />
      </div>
      <div class="text-center max-w-sm px-4">
        <h3 class="text-base font-bold text-primary-text">
          {{
            searchQuery || statusFilter !== "all"
              ? "No matching media found"
              : "No media files in this folder yet"
          }}
        </h3>
        <p class="text-xs text-secondary-text mt-1 leading-relaxed">
          {{
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search query or filter settings."
              : "Upload media files (Images, Videos, PDFs) to start managing assets in this media group."
          }}
        </p>
      </div>

      <button
        v-if="!searchQuery && statusFilter === 'all'"
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer"
        @click="panel = { open: true, editData: null }"
      >
        <Upload class="w-4 h-4" />
        <span>Upload First Media File</span>
      </button>

      <button
        v-else
        type="button"
        class="px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
        @click="
          searchQuery = '';
          statusFilter = 'all';
        "
      >
        Reset Filters
      </button>
    </div>

    <!-- GRID VIEW -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <div
        v-for="img in filteredImages"
        :key="img.id"
        class="group relative bg-card-background border border-primary-border/80 hover:border-primary/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
      >
        <!-- Media Container with Hover Overlay -->
        <div
          class="relative aspect-[4/3] bg-black/60 overflow-hidden cursor-pointer m-3 rounded-xl flex items-center justify-center"
          @click="preview = { open: true, image: img }"
        >
          <img
            v-if="getMediaType(img.image_url) === 'image'"
            :src="img.image_url"
            :alt="img.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div
            v-else-if="getMediaType(img.image_url) === 'video'"
            class="relative w-full h-full flex items-center justify-center bg-black"
          >
            <video
              :src="img.image_url"
              class="w-full h-full object-cover opacity-80"
              muted
              preload="metadata"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-10 h-10 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Play class="w-5 h-5 fill-white translate-x-0.5" />
              </div>
            </div>
          </div>
          <div
            v-else-if="getMediaType(img.image_url) === 'pdf'"
            class="w-full h-full flex flex-col items-center justify-center bg-card-background/90 p-4 gap-2 text-center"
          >
            <FileText class="w-10 h-10 text-primary" />
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
              PDF Document
            </span>
          </div>

          <!-- Dark Overlay on Hover -->
          <div
            class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5"
          >
            <!-- Top Row Badges -->
            <div class="flex items-center justify-between">
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border"
                :class="
                  img.is_active
                    ? 'bg-primary-green/20 text-primary-green border-primary-green/30'
                    : 'bg-primary-red/20 text-primary-red border-primary-red/30'
                "
              >
                {{ img.is_active ? "Active" : "Inactive" }}
              </span>

              <span
                class="text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded-md border border-white/10"
              >
                #{{ img.id }}
              </span>
            </div>

            <!-- Hover Action Buttons Bar -->
            <div class="flex items-center justify-center gap-2">
              <button
                type="button"
                class="p-2.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all hover:scale-105 cursor-pointer"
                @click.stop="preview = { open: true, image: img }"
                title="Preview Image"
              >
                <Eye class="w-4 h-4" />
              </button>

              <button
                type="button"
                class="p-2.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all hover:scale-105 cursor-pointer"
                @click.stop="panel = { open: true, editData: img }"
                title="Edit Image Details"
              >
                <Pencil class="w-4 h-4" />
              </button>

              <button
                type="button"
                class="p-2.5 rounded-lg bg-primary-red/80 hover:bg-primary-red text-white transition-all hover:scale-105 cursor-pointer"
                @click.stop="deleteDialog = { open: true, image: img }"
                title="Delete Image"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Non-hover status pill indicator -->
          <div
            class="absolute top-2.5 right-2.5 group-hover:opacity-0 transition-opacity"
          >
            <span
              class="w-2.5 h-2.5 rounded-full border border-white/20 inline-block"
              :class="img.is_active ? 'bg-primary-green' : 'bg-primary-red'"
            />
          </div>
        </div>

        <!-- Card Details Content -->
        <div
          class="p-4 flex flex-col gap-3 flex-1 justify-between bg-card-background"
        >
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-xs sm:text-sm font-bold text-primary-text truncate"
                :title="img.title"
              >
                {{ img.title }}
              </h3>
            </div>

            <p
              v-if="img.description"
              class="text-[11.5px] text-secondary-text line-clamp-2 leading-relaxed"
            >
              {{ img.description }}
            </p>
            <p v-else class="text-[11px] italic text-secondary-text/50">
              No description
            </p>
          </div>

          <div class="space-y-2 pt-2 border-t border-primary-border/60">
            <!-- URL Copy Pill -->
            <URLCopyButton :url="img.image_url" />

            <div
              class="flex items-center justify-between text-[10.5px] text-secondary-text/80 pt-1"
            >
              <span class="flex items-center gap-1">
                <CalendarDays class="w-3 h-3 text-secondary-text" />
                {{ formatDate(img.created_at) }}
              </span>

              <div
                class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  type="button"
                  class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  @click="panel = { open: true, editData: img }"
                >
                  Edit
                </button>
                <span class="text-secondary-text/40">•</span>
                <button
                  type="button"
                  class="text-xs font-semibold text-primary-red hover:underline cursor-pointer"
                  @click="deleteDialog = { open: true, image: img }"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LIST / TABLE VIEW -->
    <div
      v-else
      class="bg-card-background border border-primary-border/80 rounded-2xl overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-primary-text">
          <thead
            class="bg-background/80 border-b border-primary-border text-[11px] uppercase tracking-wider text-secondary-text font-bold"
          >
            <tr>
              <th class="py-3.5 px-4">Preview</th>
              <th class="py-3.5 px-4">Title & Description</th>
              <th class="py-3.5 px-4">Direct URL</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4">Created Date</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/60">
            <tr
              v-for="img in filteredImages"
              :key="img.id"
              class="hover:bg-primary/[0.02] transition-colors group"
            >
              <!-- Thumbnail -->
              <td class="py-3 px-4 shrink-0">
                <div
                  class="w-14 h-11 rounded-lg bg-black/40 overflow-hidden border border-primary-border/80 cursor-pointer shrink-0 relative group/thumb flex items-center justify-center"
                  @click="preview = { open: true, image: img }"
                >
                  <img
                    v-if="getMediaType(img.image_url) === 'image'"
                    :src="img.image_url"
                    :alt="img.title"
                    class="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                  />
                  <div
                    v-else-if="getMediaType(img.image_url) === 'video'"
                    class="w-full h-full relative bg-black flex items-center justify-center"
                  >
                    <video
                      :src="img.image_url"
                      class="w-full h-full object-cover opacity-70"
                      muted
                      preload="metadata"
                    />
                    <Play class="w-3.5 h-3.5 text-white absolute fill-white" />
                  </div>
                  <div
                    v-else-if="getMediaType(img.image_url) === 'pdf'"
                    class="w-full h-full flex items-center justify-center bg-background text-primary"
                  >
                    <FileText class="w-5 h-5" />
                  </div>
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Eye class="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </td>

              <!-- Title & Description -->
              <td class="py-3 px-4 min-w-[200px]">
                <p class="font-bold text-primary-text text-xs">
                  {{ img.title }}
                </p>
                <p
                  v-if="img.description"
                  class="text-[11px] text-secondary-text line-clamp-1 mt-0.5"
                >
                  {{ img.description }}
                </p>
              </td>

              <!-- Direct URL -->
              <td class="py-3 px-4 min-w-[240px]">
                <URLCopyButton :url="img.image_url" />
              </td>

              <!-- Status -->
              <td class="py-3 px-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                  :class="
                    img.is_active
                      ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                      : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="
                      img.is_active ? 'bg-primary-green' : 'bg-primary-red'
                    "
                  />
                  {{ img.is_active ? "Active" : "Inactive" }}
                </span>
              </td>

              <!-- Created Date -->
              <td
                class="py-3 px-4 text-secondary-text whitespace-nowrap text-[11px]"
              >
                {{ formatDate(img.created_at) }}
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    class="p-1.5 rounded-lg border border-primary-border/80 hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                    @click="preview = { open: true, image: img }"
                    title="Preview Image"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    class="p-1.5 rounded-lg border border-primary-border/80 hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                    @click="panel = { open: true, editData: img }"
                    title="Edit Image"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    class="p-1.5 rounded-lg bg-primary-red/10 border border-primary-red/20 text-primary-red hover:bg-primary-red/20 transition-colors cursor-pointer"
                    @click="deleteDialog = { open: true, image: img }"
                    title="Delete Image"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
        @page-change="(page) => store.changePage(groupId, page)"
      />
    </div>

    <!-- Dialogs -->
    <MediaImageDialog
      :open="panel.open"
      :edit-data="panel.editData"
      :group-id="groupId"
      @close="panel = { open: false, editData: null }"
    />
    <DeleteMediaDialog
      :open="deleteDialog.open"
      :image="deleteDialog.image"
      :group-id="groupId"
      @close="deleteDialog = { open: false, image: null }"
    />
    <ImagePreviewDialog
      :open="preview.open"
      :image="preview.image"
      @close="preview = { open: false, image: null }"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import {
  ArrowLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  FolderOpen,
  RotateCw,
  Search,
  X,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  Video,
  FileText,
  Play,
} from "lucide-vue-next";
import { useMediaImagesStore } from "@/stores/media/mediaImages";
import Pagination from "@/components/common/Pagination.vue";
import MediaImageDialog from "@/components/media/MediaImageDialog.vue";
import DeleteMediaDialog from "@/components/media/DeleteMediaDialog.vue";
import ImagePreviewDialog from "@/components/media/ImagePreviewDialog.vue";
import URLCopyButton from "@/components/media/URLCopyButton.vue";
import { formatDate } from "@/utils/timeFormatter";

const store = useMediaImagesStore();
const route = useRoute();
const groupId = route.params.groupId;

const panel = ref({ open: false, editData: null });
const deleteDialog = ref({ open: false, image: null });
const preview = ref({ open: false, image: null });

const searchQuery = ref("");
const statusFilter = ref("all");
const viewMode = ref("grid");

function getMediaType(url) {
  if (!url || typeof url !== "string") return "image";
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|ogg|mov|m4v|mkv)$/i.test(cleanUrl)) {
    return "video";
  }
  if (/\.pdf$/i.test(cleanUrl)) {
    return "pdf";
  }
  return "image";
}

const filteredImages = computed(() => {
  return (store.records || []).filter((img) => {
    // Search Filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchTitle = (img.title || "").toLowerCase().includes(q);
      const matchDesc = (img.description || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // Status Filter
    if (statusFilter.value === "active" && !img.is_active) return false;
    if (statusFilter.value === "inactive" && img.is_active) return false;

    return true;
  });
});

onMounted(() => {
  store.fetchMediaImages(groupId);
});
</script>
