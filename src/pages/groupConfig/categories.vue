<template>
  <div class="px-4 pb-8">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-end gap-3 mb-6">
      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="store.perPageOptions"
        placeholder="Per page..."
        class="w-32"
        @update:modelValue="store.updatePerPage"
      />
      <button
        v-if="hasPermission('group.group_update')"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
        @click="dialogOpen = true"
      >
        <FolderPlus class="w-3.5 h-3.5" /> Create Category
      </button>
    </div>

    <!-- Search -->
    <!-- <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Search categories..."
          class="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          @input="onSearch"
        />
      </div>
    </div> -->

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-2xl overflow-hidden">
      <table class="w-full border-collapse bg-card-background">
        <thead>
          <tr class="border-b border-primary-border bg-background">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Category</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Type</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Description</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">MT5 Groups</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Status</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Action</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr v-for="n in 5" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="p-3"><div class="h-3 w-24 bg-background rounded" /></td>
            <td class="p-3"><div class="h-5 w-14 bg-background rounded-full" /></td>
            <td class="p-3"><div class="h-3 w-40 bg-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-10 bg-background rounded" /></td>
            <td class="p-3"><div class="h-5 w-14 bg-background rounded-full" /></td>
            <td class="p-3 flex justify-end"><div class="h-7 w-24 bg-background rounded-lg" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.records.length === 0">
          <tr>
            <td colspan="6" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-background border border-primary-border flex items-center justify-center">
                  <FolderOpen class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-semibold text-primary-text">No categories found</p>
                <p class="text-xs text-secondary-text">Create your first category to get started</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="cat in store.records"
            :key="`${cat.account_category}-${cat.account_type}`"
            class="border-b border-primary-border last:border-none hover:bg-background transition-colors"
          >
            <td class="p-3">
              <p class="text-xs font-semibold text-primary-text capitalize">{{ cat.account_category }}</p>
            </td>

            <td class="p-3">
              <span
                class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize"
                :class="cat.account_type === 'live'
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                  : 'bg-background text-secondary-text border-primary-border'"
              >
                {{ cat.account_type }}
              </span>
            </td>

            <td class="p-3 text-xs text-secondary-text max-w-[200px] truncate">
              {{ cat.description || '—' }}
            </td>

            <td class="p-3">
              <div class="flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-secondary-text" />
                <span class="text-xs font-semibold text-primary-text">{{ cat.total_mt5_groups ?? 0 }}</span>
              </div>
            </td>

            <td class="p-3">
              <span
                class="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                :class="cat.is_active
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                  : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
              >
                {{ cat.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td class="p-3 text-right">
              <button
                v-if="hasPermission('group.group_view')"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors ml-auto cursor-pointer"
                @click="viewGroups(cat)"
              >
                <Eye class="w-3.5 h-3.5" /> View Groups
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <CreateCategoryDialog :open="dialogOpen" @close="dialogOpen = false" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, FolderPlus, FolderOpen, Eye, Layers } from 'lucide-vue-next'
import { useGroupCategoriesStore } from '@/stores/groupConfig/groupCategories'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import CreateCategoryDialog from '@/components/groupConfig/CreateCategoryDialog.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store      = useGroupCategoriesStore()
const router     = useRouter()
const { hasPermission } = usePermissionCheck()
const dialogOpen = ref(false)

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(), 400)
}

const viewGroups = (cat) => {
  router.push(`/categories/${cat.account_category}/${cat.account_type}`)
}

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchCategories(true)
}

onMounted(() => store.fetchCategories())
</script>