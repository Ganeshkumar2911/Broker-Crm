<template>
  <div class="space-y-6 pb-12 max-w-[1600px] mx-auto">
    <!-- ─── TOP ACTION & HEADER BAR ──────────────────────────────── -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-primary-text tracking-tight">
          Blog Articles
        </h1>
        <p class="text-xs text-secondary-text mt-1">
          Create, edit, and publish market insights, educational guides, and platform updates.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card-background border border-primary-border text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-background transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
          :disabled="store.loading"
          @click="store.fetchBlogs(true)"
          title="Refresh articles"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loading }" />
          <span class="hidden sm:inline">Refresh</span>
        </button>

        <button
          v-if="hasPermission('blog.create')"
          type="button"
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <Plus class="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>
    </div>

    <!-- ─── 3 SUMMARY METRIC CARDS ──────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Total Articles -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-xs transition-all hover:border-primary/40 flex items-center justify-between"
      >
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Total Articles
          </p>
          <p class="text-2xl sm:text-3xl font-extrabold text-primary-text mt-1">
            {{ blogs.length }}
          </p>
        </div>
        <div
          class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
        >
          <FileText class="w-5 h-5" />
        </div>
      </div>

      <!-- Published -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-xs transition-all hover:border-primary/40 flex items-center justify-between"
      >
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Published
          </p>
          <p class="text-2xl sm:text-3xl font-extrabold text-primary-green mt-1">
            {{ publishedCount }}
          </p>
        </div>
        <div
          class="w-11 h-11 rounded-xl bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green shrink-0"
        >
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>

      <!-- Drafts -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 shadow-xs transition-all hover:border-primary/40 flex items-center justify-between"
      >
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Drafts
          </p>
          <p class="text-2xl sm:text-3xl font-extrabold text-primary-yellow mt-1">
            {{ draftCount }}
          </p>
        </div>
        <div
          class="w-11 h-11 rounded-xl bg-primary-yellow/10 border border-primary-yellow/20 flex items-center justify-center text-primary-yellow shrink-0"
        >
          <Edit3 class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- ─── CONTROLS & FILTER BAR ────────────────────────────────── -->
    <div
      class="bg-card-background border border-primary-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between"
    >
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <Search class="absolute left-3 top-2.5 w-4 h-4 text-secondary-text" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title, description or category..."
          class="w-full bg-background border border-primary-border rounded-xl pl-9 pr-3 py-2 text-xs text-primary-text placeholder-secondary-text/60 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <!-- Filter Selectors -->
      <div class="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
        <BaseSelect
          v-model="selectedCategory"
          :options="categoryFilterOptions"
          placeholder="All Categories"
          class="w-full sm:w-44"
        />

        <BaseSelect
          v-model="selectedStatus"
          :options="statusFilterOptions"
          placeholder="All Statuses"
          class="w-full sm:w-36"
        />
      </div>
    </div>

    <!-- ─── SKELETON LOADING STATE ───────────────────────────────── -->
    <div
      v-if="store.loading"
      class="bg-card-background border border-primary-border rounded-2xl p-6 space-y-4 animate-pulse"
    >
      <div v-for="i in 5" :key="i" class="flex items-center justify-between gap-4 py-3 border-b border-primary-border/40">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-background" />
          <div class="space-y-2">
            <div class="h-4 w-48 bg-background rounded" />
            <div class="h-3 w-64 bg-background rounded" />
          </div>
        </div>
        <div class="h-6 w-20 bg-background rounded-lg" />
        <div class="h-4 w-24 bg-background rounded" />
        <div class="h-6 w-16 bg-background rounded-full" />
        <div class="flex gap-2">
          <div class="w-8 h-8 bg-background rounded-lg" />
          <div class="w-8 h-8 bg-background rounded-lg" />
          <div class="w-8 h-8 bg-background rounded-lg" />
        </div>
      </div>
    </div>

    <!-- ─── ARTICLES DATA TABLE ──────────────────────────────────── -->
    <div
      v-else
      class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-xs"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              class="bg-background/80 text-secondary-text font-bold border-b border-primary-border uppercase tracking-wider text-[10px]"
            >
              <th class="py-3.5 px-5">Article</th>
              <th class="py-3.5 px-4">Category</th>
              <th class="py-3.5 px-4">Date</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/60">
            <tr
              v-for="blog in filteredBlogs"
              :key="blog.id"
              class="hover:bg-background/50 transition-colors group"
            >
              <!-- Article Title & Thumbnail -->
              <td class="py-3.5 px-5 max-w-md">
                <div class="flex items-center gap-3.5">
                  <div
                    class="w-12 h-12 rounded-xl bg-background border border-primary-border overflow-hidden shrink-0 flex items-center justify-center"
                  >
                    <img
                      v-if="blog.image"
                      :src="getImageUrl(blog.image)"
                      :alt="blog.title"
                      class="w-full h-full object-cover"
                      @error="(e) => (e.target.style.display = 'none')"
                    />
                    <FileText v-else class="w-5 h-5 text-secondary-text/50" />
                  </div>
                  <div class="min-w-0">
                    <h4
                      class="font-bold text-primary-text truncate group-hover:text-primary transition-colors text-xs sm:text-sm"
                    >
                      {{ blog.title }}
                    </h4>
                    <p class="text-secondary-text text-[11px] truncate mt-0.5">
                      {{
                        blog.description ||
                        (blog.content ? blog.content.replace(/<[^>]*>?/gm, "").slice(0, 90) : "")
                      }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Category -->
              <td class="py-3.5 px-4">
                <span
                  class="bg-background border border-primary-border text-primary-text px-2.5 py-1 rounded-lg text-[11px] font-medium"
                >
                  {{ blog.category || 'General' }}
                </span>
              </td>

              <!-- Date -->
              <td class="py-3.5 px-4 text-secondary-text text-[11px] font-medium">
                {{ formatDate(blog.created_at) }}
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4">
                <span
                  v-if="blog.status === 'Published'"
                  class="bg-primary-green/10 text-primary-green border border-primary-green/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                >
                  Published
                </span>
                <span
                  v-else
                  class="bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                >
                  Draft
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-5 text-right space-x-1 whitespace-nowrap">
                <button
                  type="button"
                  @click="openPreviewModal(blog)"
                  title="Preview Article"
                  class="p-2 rounded-lg bg-background border border-primary-border text-secondary-text hover:text-primary-text hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <Eye class="w-3.5 h-3.5" />
                </button>
                <button
                  v-if="hasPermission('blog.update')"
                  type="button"
                  @click="openEditModal(blog)"
                  title="Edit Article"
                  class="p-2 rounded-lg bg-background border border-primary-border text-secondary-text hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <Edit class="w-3.5 h-3.5" />
                </button>
                <button
                  v-if="hasPermission('blog.delete')"
                  type="button"
                  @click="openDeleteModal(blog)"
                  title="Delete Article"
                  class="p-2 rounded-lg bg-background border border-primary-border text-secondary-text hover:text-rose-500 hover:border-rose-500/40 transition-colors cursor-pointer"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="!filteredBlogs.length">
              <td colspan="5" class="py-14 text-center text-secondary-text text-xs">
                <FileText class="w-10 h-10 mx-auto text-secondary-text/40 mb-2" />
                <p class="font-bold text-primary-text text-sm">No articles found.</p>
                <p class="text-xs text-secondary-text mt-1">
                  {{ hasPermission('blog.create') ? 'Click "New Article" to create and publish your first article.' : 'No blog articles available.' }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── CREATE / EDIT MODAL ──────────────────────────────────── -->
    <div
      v-if="showFormModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
          <div>
            <h3 class="text-sm sm:text-base font-bold text-primary-text">
              {{ isEditing ? 'Edit Article' : 'Create New Article' }}
            </h3>
            <p class="text-xs text-secondary-text mt-0.5">
              Fill in details below to publish via POST /admin/create-blog.
            </p>
          </div>
          <button
            type="button"
            @click="showFormModal = false"
            class="text-secondary-text hover:text-primary-text cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <div class="p-6 overflow-y-auto space-y-4 flex-1 no-scrollbar">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Title -->
            <div class="md:col-span-2 space-y-1.5">
              <label class="text-xs font-semibold text-primary-text">
                Blog Title <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                placeholder="e.g. Market Trends: Q3 2026 Crypto & Forex Outlook"
                class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary"
              />
            </div>

            <!-- Category -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-primary-text">
                Category <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.category"
                type="text"
                placeholder="e.g. Market Analysis, Platform Updates, Guides..."
                class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <!-- Short Description -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-primary-text">
              Short Description / Summary <span class="text-rose-500">*</span>
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Brief summary or introductory excerpt..."
              class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Image File Upload -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-primary-text">
                Cover Image <span class="text-[11px] text-secondary-text font-normal">(Optional: png, jpg, jpeg, gif, webp, svg)</span>
              </label>
              <div class="flex items-center gap-3">
                <input
                  ref="fileInputRef"
                  type="file"
                  @change="handleFileChange"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  class="w-full bg-background border border-primary-border rounded-xl px-3 py-1.5 text-xs text-secondary-text focus:outline-none focus:border-primary file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-primary file:text-white file:font-bold cursor-pointer"
                />
              </div>

              <!-- Thumbnail Preview if Selected -->
              <div v-if="imagePreviewUrl" class="mt-2 flex items-center gap-3 p-2 rounded-xl bg-background border border-primary-border">
                <img :src="imagePreviewUrl" alt="Preview" class="w-12 h-12 object-cover rounded-lg border border-primary-border" />
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium text-primary-text truncate">{{ selectedImage?.name || 'Selected Image' }}</p>
                  <p class="text-[10px] text-secondary-text">{{ (selectedImage?.size / 1024).toFixed(1) }} KB</p>
                </div>
                <button
                  type="button"
                  @click="clearSelectedImage"
                  class="text-xs text-rose-500 hover:text-rose-600 font-semibold p-1 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>

            <!-- Status -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-primary-text">Status</label>
              <BaseSelect
                v-model="form.status"
                :options="statusFormOptions"
                placeholder="Select status..."
                class="w-full"
              />
            </div>
          </div>

          <!-- SEO Meta Fields -->
          <!-- Meta Title -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-primary-text">
              Meta Title <span class="text-[11px] text-secondary-text font-normal">(SEO)</span>
            </label>
            <input
              v-model="form.meta_title"
              type="text"
              placeholder="e.g. Market Trends: Q3 2026 Crypto & Forex Outlook"
              class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary"
            />
          </div>

          <!-- Meta Description & Meta Keywords -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-primary-text">
                Meta Description <span class="text-[11px] text-secondary-text font-normal">(SEO)</span>
              </label>
              <textarea
                v-model="form.meta_description"
                rows="2"
                placeholder="SEO meta description for search engines..."
                class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-primary-text">
                Meta Keywords <span class="text-[11px] text-secondary-text font-normal">(SEO)</span>
              </label>
              <textarea
                v-model="form.meta_keywords"
                rows="2"
                placeholder="e.g. crypto, forex, market analysis, trading"
                class="w-full bg-background border border-primary-border rounded-xl px-3.5 py-2 text-xs text-primary-text placeholder-secondary-text/50 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <!-- Rich Text Content Editor -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-primary-text">
              Full Blog Content <span class="text-rose-500">*</span>
            </label>
            <RichTextEditor
              v-model="form.content"
              placeholder="Write your detailed blog content here..."
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex justify-between items-center bg-background/50">
          <button
            type="button"
            @click="showFormModal = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-secondary-text hover:text-primary-text cursor-pointer border border-primary-border"
          >
            Cancel
          </button>

          <button
            type="button"
            @click="handleSaveBlog"
            :disabled="store.actionLoading"
            class="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer transition-colors shadow-xs flex items-center gap-2"
          >
            <RotateCw v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isEditing ? 'Update Article' : 'Publish Article' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ─── PREVIEW MODAL ────────────────────────────────────────── -->
    <div
      v-if="showPreviewModal && selectedBlog"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="bg-primary/10 text-primary font-bold text-xs px-2.5 py-0.5 rounded-md border border-primary/20">
              {{ selectedBlog.category || 'General' }}
            </span>
            <span class="text-xs text-secondary-text">{{ formatDate(selectedBlog.created_at) }}</span>
          </div>
          <button
            type="button"
            @click="showPreviewModal = false"
            class="text-secondary-text hover:text-primary-text cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 no-scrollbar">
          <h2 class="text-xl sm:text-2xl font-bold text-primary-text">
            {{ selectedBlog.title }}
          </h2>

          <div
            v-if="selectedBlog.image"
            class="w-full h-56 rounded-xl overflow-hidden border border-primary-border bg-background"
          >
            <img
              :src="getImageUrl(selectedBlog.image)"
              :alt="selectedBlog.title"
              class="w-full h-full object-cover"
              @error="(e) => (e.target.style.display = 'none')"
            />
          </div>

          <!-- SEO Meta Preview -->
          <div
            v-if="selectedBlog.meta_title || selectedBlog.meta_description || selectedBlog.meta_keywords"
            class="p-3.5 bg-background border border-primary-border rounded-xl space-y-2 text-xs"
          >
            <p class="font-bold text-[11px] uppercase tracking-wider text-secondary-text">
              SEO Information
            </p>
            <p v-if="selectedBlog.meta_title" class="text-secondary-text">
              <span class="font-semibold text-primary-text">Meta Title:</span> {{ selectedBlog.meta_title }}
            </p>
            <p v-if="selectedBlog.meta_description" class="text-secondary-text">
              <span class="font-semibold text-primary-text">Meta Description:</span> {{ selectedBlog.meta_description }}
            </p>
            <p v-if="selectedBlog.meta_keywords" class="text-secondary-text">
              <span class="font-semibold text-primary-text">Meta Keywords:</span> {{ selectedBlog.meta_keywords }}
            </p>
          </div>

          <div
            class="pt-3 border-t border-primary-border text-xs sm:text-sm leading-relaxed text-secondary-text editor-content"
            v-html="selectedBlog.content"
          />
        </div>

        <div class="px-6 py-4 border-t border-primary-border text-right bg-background/50">
          <button
            type="button"
            @click="showPreviewModal = false"
            class="bg-background border border-primary-border hover:bg-card-background text-primary-text font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>

    <!-- ─── DELETE CONFIRMATION MODAL ────────────────────────────── -->
    <div
      v-if="showDeleteModal && selectedBlog"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-card-background border border-primary-border rounded-2xl w-full max-w-sm p-6 space-y-4 text-center shadow-2xl"
      >
        <div class="w-12 h-12 rounded-full bg-primary-red/10 text-primary-red flex items-center justify-center mx-auto">
          <Trash2 class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-primary-text">Delete Article</h3>
          <p class="text-xs text-secondary-text mt-1">
            Are you sure you want to delete <span class="text-primary-text font-bold">"{{ selectedBlog.title }}"</span>? This action cannot be undone.
          </p>
        </div>
        <div class="flex gap-2.5 pt-2">
          <button
            type="button"
            @click="showDeleteModal = false"
            class="flex-1 bg-background hover:bg-card-background text-secondary-text hover:text-primary-text font-semibold py-2 rounded-xl text-xs cursor-pointer border border-primary-border"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDelete"
            class="flex-1 bg-primary-red hover:bg-primary-red/90 text-white font-bold py-2 rounded-xl text-xs cursor-pointer transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import RichTextEditor from "./rich-text-editor.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { useBlogStore } from "@/stores/blog/blog";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import {
  FileText,
  CheckCircle2,
  Edit3,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  RotateCw,
} from "lucide-vue-next";

const store = useBlogStore();
const { hasPermission } = usePermissionCheck();

const searchQuery = ref("");
const selectedCategory = ref("All");
const selectedStatus = ref("All");

// Status options
const statusFilterOptions = [
  { label: "All Statuses", value: "All" },
  { label: "Published", value: "Published" },
  { label: "Draft", value: "Draft" },
];

const statusFormOptions = [
  { label: "Published", value: "Published" },
  { label: "Draft", value: "Draft" },
];

// Modals state
const showFormModal = ref(false);
const showPreviewModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedBlog = ref(null);

// Image upload state
const fileInputRef = ref(null);
const selectedImage = ref(null);
const imagePreviewUrl = ref("");

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;

  let baseUrl = localStorage.getItem("custom_base_url") || "https://admin.panthercapitals.com";
  baseUrl = baseUrl.trim().replace(/\/admin\/?$/, "").replace(/\/+$/, "");
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

const formatDate = (dateVal) => {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  } catch (e) {
    return dateVal;
  }
};

const handleFileChange = (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) {
    selectedImage.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  }
};

const clearSelectedImage = () => {
  selectedImage.value = null;
  imagePreviewUrl.value = "";
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

// Form state
const form = ref({
  id: null,
  title: "",
  description: "",
  category: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  content: "",
  status: "Published",
});

onMounted(() => {
  store.fetchBlogs();
});

const blogs = computed(() => store.blogs || []);
const publishedCount = computed(() => blogs.value.filter((b) => b.status === "Published").length);
const draftCount = computed(() => blogs.value.filter((b) => b.status === "Draft").length);

// Extract unique real categories from actual blogs
const availableCategories = computed(() => {
  const cats = new Set();
  blogs.value.forEach((b) => {
    if (b.category && typeof b.category === "string" && b.category.trim()) {
      cats.add(b.category.trim());
    }
  });
  return Array.from(cats);
});

const categoryFilterOptions = computed(() => {
  const options = [{ label: "All Categories", value: "All" }];
  availableCategories.value.forEach((cat) => {
    options.push({ label: cat, value: cat });
  });
  return options;
});

const filteredBlogs = computed(() => {
  let list = blogs.value;

  if (selectedCategory.value && selectedCategory.value !== "All") {
    list = list.filter((b) => b.category === selectedCategory.value);
  }

  if (selectedStatus.value && selectedStatus.value !== "All") {
    list = list.filter((b) => b.status === selectedStatus.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        b.meta_title?.toLowerCase().includes(q) ||
        b.meta_description?.toLowerCase().includes(q) ||
        b.meta_keywords?.toLowerCase().includes(q) ||
        b.content?.toLowerCase().includes(q)
    );
  }

  return list;
});

const openCreateModal = () => {
  if (!hasPermission("blog.create")) return;
  isEditing.value = false;
  clearSelectedImage();
  form.value = {
    id: null,
    title: "",
    description: "",
    category: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    content: "",
    status: "Published",
  };
  showFormModal.value = true;
};

const openEditModal = (blog) => {
  if (!hasPermission("blog.update")) return;
  isEditing.value = true;
  clearSelectedImage();
  form.value = {
    id: blog.id,
    title: blog.title || "",
    description: blog.description || "",
    category: blog.category || "",
    meta_title: blog.meta_title || "",
    meta_description: blog.meta_description || "",
    meta_keywords: blog.meta_keywords || "",
    content: blog.content || "",
    status: blog.status || "Published",
  };
  if (blog.image) {
    imagePreviewUrl.value = getImageUrl(blog.image);
  }
  showFormModal.value = true;
};

const handleSaveBlog = () => {
  if (isEditing.value && !hasPermission("blog.update")) return;
  if (!isEditing.value && !hasPermission("blog.create")) return;

  if (!form.value.title?.trim() || !form.value.category?.trim() || !form.value.description?.trim() || !form.value.content?.trim()) {
    alert("Please fill in Title, Category, Description, and Content.");
    return;
  }

  const formData = new FormData();
  formData.append("title", form.value.title.trim());
  formData.append("category", form.value.category.trim());
  formData.append("description", form.value.description.trim());
  formData.append("content", form.value.content);
  formData.append("status", form.value.status || "Published");

  formData.append("meta_title", form.value.meta_title ? form.value.meta_title.trim() : "");
  formData.append("meta_description", form.value.meta_description ? form.value.meta_description.trim() : "");
  formData.append("meta_keywords", form.value.meta_keywords ? form.value.meta_keywords.trim() : "");

  if (selectedImage.value) {
    formData.append("image", selectedImage.value);
  }

  if (isEditing.value && form.value.id) {
    store.updateBlog(form.value.id, formData, () => {
      showFormModal.value = false;
      clearSelectedImage();
    });
  } else {
    store.createBlog(formData, () => {
      showFormModal.value = false;
      clearSelectedImage();
    });
  }
};

const openPreviewModal = (blog) => {
  selectedBlog.value = blog;
  showPreviewModal.value = true;
};

const openDeleteModal = (blog) => {
  if (!hasPermission("blog.delete")) return;
  selectedBlog.value = blog;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (!hasPermission("blog.delete")) return;
  if (selectedBlog.value) {
    store.deleteBlog(selectedBlog.value.id, () => {
      showDeleteModal.value = false;
    });
  }
};
</script>
