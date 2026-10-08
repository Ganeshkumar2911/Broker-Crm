<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Search,
  Plus,
  FileSpreadsheet,
  Pencil,
  Trash2,
  ListFilter,
  CheckCircle2,
  XCircle,
  Layers,
  RefreshCw,
} from 'lucide-vue-next'
import { useWatchlistStore } from '@/stores/watchlist/watchlist'
import { usePermissionCheck } from '@/composables/usePermissionCheck'
import BaseSelect from '@/components/common/BaseSelect.vue'
import SymbolModal from '@/components/watchlist/SymbolModal.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import Pagination from '@/components/common/Pagination.vue'

const emit = defineEmits(['switchTab'])

const store = useWatchlistStore()
const { hasPermission } = usePermissionCheck()

// Filter Options
const statusOptions = [
  { label: 'Active Only', value: 'active' },
  { label: 'Inactive Only', value: 'inactive' },
]

const categoryOptions = computed(() =>
  store.availableCategories.map((cat) => ({
    label: cat,
    value: cat,
  }))
)

// Dialog states
const modalOpen = ref(false)
const selectedSymbol = ref(null)

const deleteDialogOpen = ref(false)
const symbolToDelete = ref(null)

onMounted(() => {
  store.fetchSymbols(true)
})

function openCreateModal() {
  selectedSymbol.value = null
  modalOpen.value = true
}

function openEditModal(symbol) {
  selectedSymbol.value = { ...symbol }
  modalOpen.value = true
}

async function handleSaveSymbol(payload) {
  try {
    if (selectedSymbol.value?.id) {
      await store.updateSymbol(selectedSymbol.value.id, payload)
    } else {
      await store.createSymbol(payload)
    }
    modalOpen.value = false
  } catch (_) {
    // Error is handled in store snackbar
  }
}

function confirmDelete(symbol) {
  symbolToDelete.value = symbol
  deleteDialogOpen.value = true
}

async function handleDeleteConfirmed() {
  if (symbolToDelete.value) {
    try {
      await store.deleteSymbol(symbolToDelete.value.id)
      deleteDialogOpen.value = false
      symbolToDelete.value = null
    } catch (_) {
      // Error handled in store
    }
  }
}

function resetFilters() {
  store.filters.search = ''
  store.filters.category = ''
  store.filters.status = ''
  store.handleFilterChange(false)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header & Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-primary-text">Symbol Catalog</h2>
        <p class="text-xs text-secondary-text mt-1">
          Clients and fund managers pick from active symbols when building custom watchlists.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          class="p-2 rounded-xl border border-primary-border bg-card-background text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
          title="Refresh List"
          :disabled="store.symbolsLoading"
          @click="store.fetchSymbols(true)"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': store.symbolsLoading }" />
        </button>

        <button
          v-if="hasPermission('watchlist.symbols_import')"
          type="button"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border bg-card-background hover:text-primary-text hover:bg-background transition-colors flex items-center gap-2 cursor-pointer"
          @click="emit('switchTab', 'import')"
        >
          <FileSpreadsheet class="w-3.5 h-3.5 text-primary" />
          <span>Import Excel</span>
        </button>

        <button
          v-if="hasPermission('watchlist.symbols_create')"
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          @click="openCreateModal"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Symbol</span>
        </button>
      </div>
    </div>

    <!-- Summary Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-card-background border border-primary-border rounded-xl p-4 flex items-center justify-between">
        <div>
          <p class="text-[11px] font-medium text-secondary-text uppercase tracking-wider">Total Catalog</p>
          <p class="text-2xl font-bold text-primary-text mt-1">{{ store.summary.total }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-background border border-primary-border flex items-center justify-center text-secondary-text">
          <Layers class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-card-background border border-primary-border rounded-xl p-4 flex items-center justify-between">
        <div>
          <p class="text-[11px] font-medium text-secondary-text uppercase tracking-wider">Active Symbols</p>
          <p class="text-2xl font-bold text-primary-green mt-1">{{ store.summary.active }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center text-primary-green">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>

      <div class="bg-card-background border border-primary-border rounded-xl p-4 flex items-center justify-between">
        <div>
          <p class="text-[11px] font-medium text-secondary-text uppercase tracking-wider">Inactive / Hidden</p>
          <p class="text-2xl font-bold text-secondary-text mt-1">{{ store.summary.inactive }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-background border border-primary-border flex items-center justify-center text-secondary-text">
          <XCircle class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Toolbar Filters -->
    <div class="bg-card-background border border-primary-border rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <!-- Search with debounce -->
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Search symbol code or display name..."
          class="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text placeholder:text-secondary-text/70 outline-none focus:border-primary transition-colors"
          @input="store.handleFilterChange(true)"
        />
      </div>

      <!-- Filters Row -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Category Filter -->
        <BaseSelect
          v-model="store.filters.category"
          :options="categoryOptions"
          placeholder="All Categories"
          :allow-all="true"
          all-label="All Categories"
          class="w-36 sm:w-44"
          @update:modelValue="store.handleFilterChange(false)"
        />

        <!-- Status Filter -->
        <!-- <BaseSelect
          v-model="store.filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          :allow-all="true"
          all-label="All Statuses"
          class="w-32 sm:w-36"
          @update:modelValue="store.handleFilterChange(false)"
        /> -->

        <!-- Per Page Filter -->
        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per page..."
          class="w-24 sm:w-28"
          @update:modelValue="store.setPerPage"
        />

        <!-- Clear filters button if active -->
        <button
          v-if="store.filters.search || store.filters.category || store.filters.status"
          type="button"
          class="px-2.5 py-1.5 rounded-lg text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
          @click="resetFilters"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="border border-primary-border rounded-xl overflow-hidden bg-card-background shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-primary-border bg-background/50">
              <th class="px-4 py-3.5 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
                Symbol
              </th>
              <th class="px-4 py-3.5 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
                Display Name
              </th>
              <th class="px-4 py-3.5 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
                Category
              </th>
              <th class="px-4 py-3.5 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
                Sort Order
              </th>
              <th class="px-4 py-3.5 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 py-3.5 text-[11px] font-semibold text-secondary-text uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-primary-border">
            <!-- Loading Skeleton -->
            <template v-if="store.symbolsLoading">
              <tr v-for="n in 5" :key="n" class="animate-pulse">
                <td class="px-4 py-4"><div class="h-4 w-20 bg-background rounded" /></td>
                <td class="px-4 py-4"><div class="h-4 w-32 bg-background rounded" /></td>
                <td class="px-4 py-4"><div class="h-4 w-24 bg-background rounded" /></td>
                <td class="px-4 py-4"><div class="h-4 w-8 bg-background rounded" /></td>
                <td class="px-4 py-4"><div class="h-4 w-16 bg-background rounded" /></td>
                <td class="px-4 py-4 text-right"><div class="h-4 w-16 bg-background rounded ml-auto" /></td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else-if="store.symbols.length === 0">
              <td colspan="6" class="px-4 py-12 text-center">
                <div class="max-w-xs mx-auto flex flex-col items-center justify-center text-center">
                  <div class="w-12 h-12 rounded-full bg-background border border-primary-border flex items-center justify-center text-secondary-text mb-3">
                    <ListFilter class="w-5 h-5" />
                  </div>
                  <h4 class="text-sm font-semibold text-primary-text mb-1">No Symbols Found</h4>
                  <p class="text-xs text-secondary-text">
                    No catalog symbols match your query. Try adjusting your filters or add a new symbol.
                  </p>
                  <button
                    type="button"
                    class="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
                    @click="openCreateModal"
                  >
                    + Add Symbol
                  </button>
                </div>
              </td>
            </tr>

            <!-- Symbol Rows -->
            <template v-else>
              <tr
                v-for="item in store.symbols"
                :key="item.id"
                class="hover:bg-background/60 transition-colors group"
              >
                <!-- Symbol Code -->
                <td class="px-4 py-3.5">
                  <span class="font-mono text-xs font-bold text-primary-text bg-background border border-primary-border px-2.5 py-1 rounded-md">
                    {{ item.symbol }}
                  </span>
                </td>

                <!-- Display Name -->
                <td class="px-4 py-3.5 text-xs text-primary-text font-medium">
                  {{ item.name || '—' }}
                </td>

                <!-- Category -->
                <td class="px-4 py-3.5">
                  <span class="text-xs uppercase tracking-wider text-secondary-text bg-background border border-primary-border px-2 py-0.5 rounded-md">
                    {{ item.category || 'General' }}
                  </span>
                </td>

                <!-- Sort Order -->
                <td class="px-4 py-3.5 text-xs font-mono text-secondary-text">
                  {{ item.sort_order ?? 0 }}
                </td>

                <!-- Status Badge -->
                <td class="px-4 py-3.5">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                    :class="item.is_active ? 'bg-primary-green/10 text-primary-green' : 'bg-secondary-text/10 text-secondary-text'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="item.is_active ? 'bg-primary-green' : 'bg-secondary-text'" />
                    {{ item.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-4 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      v-if="hasPermission('watchlist.symbols_update')"
                      type="button"
                      class="p-1.5 rounded-lg text-secondary-text hover:text-primary hover:bg-background transition-colors cursor-pointer"
                      title="Edit Symbol"
                      @click="openEditModal(item)"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button
                      v-if="hasPermission('watchlist.symbols_delete')"
                      type="button"
                      class="p-1.5 rounded-lg text-secondary-text hover:text-primary-red hover:bg-background transition-colors cursor-pointer"
                      title="Delete Symbol"
                      @click="confirmDelete(item)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="store.pagination.pages > 1"
        class="p-3 border-t border-primary-border bg-background/30 flex items-center justify-between"
      >
        <p class="text-xs text-secondary-text">
          Showing <span class="font-semibold text-primary-text">{{ store.symbols.length }}</span> of <span class="font-semibold text-primary-text">{{ store.pagination.total }}</span> symbols
        </p>

        <Pagination
          :pagination="{
            page: store.pagination.page,
            total_pages: store.pagination.pages,
            per_page: store.pagination.per_page,
            total_items: store.pagination.total,
          }"
          @page-change="store.setPage"
        />
      </div>
    </div>

    <!-- Modals -->
    <SymbolModal
      :open="modalOpen"
      :symbol-data="selectedSymbol"
      :category-options="store.availableCategories"
      :loading="store.symbolSaving"
      @close="modalOpen = false"
      @save="handleSaveSymbol"
    />

    <ConfirmationDialog
      :open="deleteDialogOpen"
      type="danger"
      title="Delete Catalog Symbol"
      :message="`Are you sure you want to delete symbol ${symbolToDelete?.symbol}? This action cannot be undone.`"
      confirm-text="Delete Symbol"
      :loading="store.symbolDeleting"
      @cancel="deleteDialogOpen = false"
      @confirm="handleDeleteConfirmed"
    />
  </div>
</template>
