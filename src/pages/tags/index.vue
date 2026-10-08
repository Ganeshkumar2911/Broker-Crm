<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Power,
  SlidersHorizontal,
  ArrowUpDown,
  Users,
  Target,
  Layers,
  X,
  RotateCcw,
} from 'lucide-vue-next'
import { useTagsStore } from '@/stores/tags/tags'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import { formatDate } from '@/utils/timeFormatter'

import TagChip from '@/components/common/TagChip.vue'
import TagFormModal from '@/components/tags/TagFormModal.vue'
import TagDeleteDialog from '@/components/tags/TagDeleteDialog.vue'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import DropdownMenu from '@/components/common/DropdownMenu.vue'

const tagsStore = useTagsStore()
const { hasPermission } = usePermissionCheck()

// Modal states
const formModalOpen = ref(false)
const formModalMode = ref('create')
const selectedTagForForm = ref(null)

const deleteDialogOpen = ref(false)
const selectedTagForDelete = ref(null)

const searchTimer = ref(null)
const localSearch = ref('')

onMounted(() => {
  tagsStore.fetchTags(1)
  tagsStore.fetchLimits()
})

// Search & Filter Watchers
const handleSearchInput = (e) => {
  const val = e.target.value
  localSearch.value = val
  clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(() => {
    tagsStore.filters.search = val
    tagsStore.fetchTags(1)
  }, 400)
}

// Filter & Sort Options
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Active Only', value: 'active' },
  { label: 'Inactive Only', value: 'inactive' },
]

const sortOptions = [
  { label: 'Date Created', value: 'created_at' },
  { label: 'Name', value: 'name' },
  { label: 'Total Usage', value: 'usage_count' },
  { label: 'Status', value: 'status' },
]

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

const hasActiveFilters = computed(() => {
  return (
    !!localSearch.value ||
    !!tagsStore.filters.status ||
    tagsStore.filters.sort_by !== 'created_at' ||
    tagsStore.filters.sort_order !== 'desc'
  )
})

const clearSearch = () => {
  localSearch.value = ''
  tagsStore.filters.search = ''
  tagsStore.fetchTags(1)
}

const resetFilters = () => {
  localSearch.value = ''
  tagsStore.filters.search = ''
  tagsStore.filters.status = ''
  tagsStore.filters.sort_by = 'created_at'
  tagsStore.filters.sort_order = 'desc'
  tagsStore.fetchTags(1)
}

const handleStatusChange = (val) => {
  tagsStore.filters.status = val
  tagsStore.fetchTags(1)
}

const handleSortChange = (val) => {
  tagsStore.filters.sort_by = val
  tagsStore.fetchTags(1)
}

const handlePerPageChange = (val) => {
  tagsStore.fetchTags(1, Number(val))
}

const toggleSortOrder = () => {
  tagsStore.filters.sort_order = tagsStore.filters.sort_order === 'asc' ? 'desc' : 'asc'
  tagsStore.fetchTags(1)
}

const handlePageChange = (page) => {
  tagsStore.fetchTags(page)
}

// Action Handlers
const openCreateModal = () => {
  selectedTagForForm.value = null
  formModalMode.value = 'create'
  formModalOpen.value = true
}

const openEditModal = (tag) => {
  selectedTagForForm.value = tag
  formModalMode.value = 'edit'
  formModalOpen.value = true
}

const openDeleteDialog = (tag) => {
  selectedTagForDelete.value = tag
  deleteDialogOpen.value = true
}

const handleToggleStatus = async (tag) => {
  try {
    if (tag.status === 'active') {
      await tagsStore.deactivateTag(tag.id)
    } else {
      await tagsStore.activateTag(tag.id)
    }
  } catch (err) {
    // Handled in store
  }
}

// Row Dropdown Menu Actions
const getTagRowActions = (tag) => {
  const actions = []

  if (hasPermission('tags.update')) {
    actions.push({
      action: 'edit',
      label: 'Edit Tag',
      icon: Edit,
    })
    actions.push({
      action: 'toggleStatus',
      label: tag.status === 'active' ? 'Deactivate Tag' : 'Activate Tag',
      icon: Power,
      danger: tag.status === 'active',
      success: tag.status !== 'active',
    })
  }

  if (hasPermission('tags.delete')) {
    if (actions.length > 0) {
      actions.push({ divider: true })
    }
    actions.push({
      action: 'delete',
      label: 'Delete Tag',
      icon: Trash2,
      danger: true,
    })
  }

  return actions
}

const onMenuSelect = (item, tag) => {
  switch (item.action) {
    case 'edit':
      return openEditModal(tag)
    case 'toggleStatus':
      return handleToggleStatus(tag)
    case 'delete':
      return openDeleteDialog(tag)
  }
}

// Metrics
const totalTagsCount = computed(() => tagsStore.pagination.total_items || 0)
</script>

<template>
  <div class="space-y-6">
    <!-- Top Header & Metrics -->
    <div class="flex flex-col md:flex-row md:items-center justify-end gap-4">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-3 py-2 text-xs font-medium rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors flex items-center gap-1.5 cursor-pointer"
          @click="tagsStore.fetchTags()"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': tagsStore.loading }" />
          <span>Refresh</span>
        </button>

        <button
          v-if="hasPermission('tags.create')"
          type="button"
          class="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
          @click="openCreateModal"
        >
          <Plus class="w-4 h-4" />
          <span>Create Tag</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-4 rounded-lg bg-card-background border border-primary-border flex items-center justify-between">
        <div>
          <p class="text-xs text-secondary-text">Total System Tags</p>
          <p class="text-xl font-bold text-primary-text mt-1">{{ totalTagsCount }}</p>
        </div>
        <div class="p-3 rounded-lg bg-primary/10 text-primary">
          <Layers class="w-5 h-5" />
        </div>
      </div>

      <!-- <div class="p-4 rounded-lg bg-card-background border border-primary-border flex items-center justify-between">
        <div>
          <p class="text-xs text-secondary-text">Lead Tag Limit (Env)</p>
          <p class="text-xl font-bold text-primary-green mt-1">{{ tagsStore.limits.lead || 10 }} chips / lead</p>
        </div>
        <div class="p-3 rounded-lg bg-primary-green/10 text-primary-green">
          <Target class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 rounded-lg bg-card-background border border-primary-border flex items-center justify-between">
        <div>
          <p class="text-xs text-secondary-text">User Tag Limit (Env)</p>
          <p class="text-xl font-bold text-primary-blue mt-1">{{ tagsStore.limits.user || 5 }} chips / client</p>
        </div>
        <div class="p-3 rounded-lg bg-primary-blue/10 text-primary-blue">
          <Users class="w-5 h-5" />
        </div>
      </div> -->
    </div>

    <!-- Filter Bar -->
    <div class="p-3 rounded-xl bg-card-background border border-primary-border flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <!-- Search & Filters -->
      <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        <!-- Search Input -->
        <div class="relative w-full sm:w-60 xl:w-72 min-w-0">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
          <input
            v-model="localSearch"
            type="text"
            placeholder="Search by name, slug..."
            class="w-full h-9.5 pl-9 pr-8 text-xs rounded-lg border border-primary-border bg-background text-primary-text placeholder-secondary-text focus:outline-none focus:border-primary transition-colors"
            @input="handleSearchInput"
          />
          <button
            v-if="localSearch"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer p-0.5 rounded transition-colors"
            title="Clear search"
            @click="clearSearch"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Status Filter -->
        <BaseSelect
          v-model="tagsStore.filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          variant="surface"
          class="w-full sm:w-36"
          @update:modelValue="handleStatusChange"
        />

        <!-- Sort By -->
        <BaseSelect
          v-model="tagsStore.filters.sort_by"
          :options="sortOptions"
          placeholder="Sort by"
          variant="surface"
          class="w-full sm:w-44"
          @update:modelValue="handleSortChange"
        />

        <!-- Sort Order Toggle -->
        <button
          type="button"
          class="h-9.5 px-3 rounded-lg border border-primary-border bg-background text-secondary-text hover:text-primary-text hover:bg-card-background transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer select-none"
          :title="`Sort order: ${tagsStore.filters.sort_order.toUpperCase()}`"
          @click="toggleSortOrder"
        >
          <ArrowUpDown class="w-3.5 h-3.5 text-secondary-text" />
          <span class="text-xs font-medium uppercase">{{ tagsStore.filters.sort_order }}</span>
        </button>

        <!-- Reset Filters Button -->
        <button
          v-if="hasActiveFilters"
          type="button"
          class="h-9.5 px-3 rounded-lg border border-primary-border bg-background text-secondary-text hover:text-primary-red hover:border-primary-red/30 transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0 cursor-pointer"
          title="Reset all filters"
          @click="resetFilters"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <!-- Per Page Selector -->
      <div class="flex items-center gap-2 self-start lg:self-center shrink-0">
        <BaseSelect
          :modelValue="tagsStore.pagination.per_page"
          :options="perPageOptions"
          placeholder="Per page"
          variant="surface"
          class="w-28"
          @update:modelValue="handlePerPageChange"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div class="rounded-lg border border-primary-border bg-card-background overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-primary-border bg-background/50 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
              <th class="py-3.5 px-4">Tag Badge</th>
              <th class="py-3.5 px-4">Slug</th>
              <th class="py-3.5 px-4">Color</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4 text-center">Lead Usage</th>
              <th class="py-3.5 px-4 text-center">Client Usage</th>
              <th class="py-3.5 px-4 text-center">Total Usage</th>
              <th class="py-3.5 px-4">Created By</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-primary-border/60 text-xs text-primary-text">
            <!-- Loading skeleton -->
            <template v-if="tagsStore.loading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td class="py-4 px-4"><div class="h-6 w-24 bg-background rounded"></div></td>
                <td class="py-4 px-4"><div class="h-4 w-16 bg-background rounded"></div></td>
                <td class="py-4 px-4"><div class="h-4 w-16 bg-background rounded"></div></td>
                <td class="py-4 px-4"><div class="h-5 w-14 bg-background rounded"></div></td>
                <td class="py-4 px-4 text-center"><div class="h-4 w-8 mx-auto bg-background rounded"></div></td>
                <td class="py-4 px-4 text-center"><div class="h-4 w-8 mx-auto bg-background rounded"></div></td>
                <td class="py-4 px-4 text-center"><div class="h-4 w-8 mx-auto bg-background rounded"></div></td>
                <td class="py-4 px-4"><div class="h-4 w-24 bg-background rounded"></div></td>
                <td class="py-4 px-4 text-right"><div class="h-6 w-16 ml-auto bg-background rounded"></div></td>
              </tr>
            </template>

            <!-- Empty state -->
            <tr v-else-if="tagsStore.tags.length === 0">
              <td colspan="9" class="py-12 text-center text-secondary-text">
                <Tag class="w-8 h-8 mx-auto mb-2 text-secondary-text/50" />
                <p class="font-medium text-primary-text">No tags found</p>
                <p class="text-xs text-secondary-text mt-1">Try adjusting search query or filter options.</p>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-else
              v-for="tag in tagsStore.tags"
              :key="tag.id"
              class="hover:bg-background/80 transition-colors"
            >
              <!-- Badge -->
              <td class="py-3.5 px-4 font-medium">
                <TagChip :tag="tag" size="md" :show-status="true" />
              </td>

              <!-- Slug -->
              <td class="py-3.5 px-4 font-mono text-secondary-text">
                {{ tag.slug || tag.name?.toLowerCase().replace(/\s+/g, '-') }}
              </td>

              <!-- Color -->
              <td class="py-3.5 px-4 font-mono">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full border border-primary-border" :style="{ backgroundColor: tag.color }" />
                  <span>{{ tag.color }}</span>
                </div>
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize"
                  :class="tag.status === 'active' ? 'bg-primary-green/10 text-primary-green border border-primary-green/30' : 'bg-background text-secondary-text border border-primary-border'"
                >
                  {{ tag.status }}
                </span>
              </td>

              <!-- Lead Usage -->
              <td class="py-3.5 px-4 text-center font-semibold text-primary-text">
                {{ tag.lead_usage_count || 0 }}
              </td>

              <!-- User Usage -->
              <td class="py-3.5 px-4 text-center font-semibold text-primary-text">
                {{ tag.user_usage_count || 0 }}
              </td>

              <!-- Total Usage -->
              <td class="py-3.5 px-4 text-center font-bold text-primary">
                {{ tag.total_usage_count || 0 }}
              </td>

              <!-- Created By -->
              <td class="py-3.5 px-4">
                <div class="text-xs">
                  <span class="block text-primary-text font-medium">{{ tag.created_by?.name || 'System' }}</span>
                  <span class="block text-[10px] text-secondary-text">{{ formatDate(tag.created_at) }}</span>
                </div>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-center align-middle">
                <DropdownMenu
                  :items="getTagRowActions(tag)"
                  @select="(item) => onMenuSelect(item, tag)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-primary-border bg-background/40">
        <Pagination
          :page="tagsStore.pagination.page"
          :total-pages="tagsStore.pagination.total_pages"
          :total-items="tagsStore.pagination.total_items"
          :per-page="tagsStore.pagination.per_page"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Create/Edit Tag Modal -->
    <TagFormModal
      :open="formModalOpen"
      :mode="formModalMode"
      :tag="selectedTagForForm"
      @close="formModalOpen = false"
      @saved="tagsStore.fetchTags()"
    />

    <!-- Delete Tag Dialog -->
    <TagDeleteDialog
      :open="deleteDialogOpen"
      :tag="selectedTagForDelete"
      @close="deleteDialogOpen = false"
      @deleted="tagsStore.fetchTags()"
    />
  </div>
</template>
