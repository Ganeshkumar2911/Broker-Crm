<template>
  <div class="px-4 pb-8">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-end gap-3 mb-6">
      <!-- <div>
        <h1 class="text-base font-semibold text-primary-text">Group Config</h1>
        <p class="text-xs text-secondary-text mt-0.5">Manage MT5 group configurations</p>
      </div> -->
      <!-- <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-all"
          :class="{ 'animate-spin-slow': store.loading }"
          @click="refresh"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="refreshing ? 'animate-spin' : ''" />
          Refresh
        </button>
      </div> -->
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <template v-if="store.loading">
        <div v-for="n in 3" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2">
          <div class="h-3 w-20 bg-background rounded" />
          <div class="h-6 w-12 bg-background rounded" />
        </div>
      </template>
      <template v-else>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Total Groups</p>
          <p class="text-2xl font-bold text-primary-text">{{ store.summary.total_groups ?? 0 }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Added</p>
          <p class="text-2xl font-bold text-primary-green">{{ store.summary.added ?? 0 }}</p>
        </div>
        <div class="bg-card-background border border-primary-border rounded-2xl p-4">
          <p class="text-[11px] uppercase tracking-wide text-secondary-text mb-1">Not Added</p>
          <p class="text-2xl font-bold text-primary-yellow">{{ store.summary.not_added ?? 0 }}</p>
        </div>
      </template>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <!-- Search -->
      <!-- <div class="relative flex-1 min-w-48 max-w-64">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Search groups..."
          class="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          @input="onSearch"
        />
      </div> -->

      <!-- Status Tabs -->
      <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="store.filters.status === tab.value
            ? 'bg-primary text-white'
            : 'text-secondary-text hover:text-primary-text'"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="store.perPageOptions"
        placeholder="Per page..."
        class="w-32"
        @update:modelValue="store.updatePerPage"
      />
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-lg overflow-x-auto bg-card-background">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border bg-card-background/50">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap">Group / Label</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap">Status</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap">Currency</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap">Leverage</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap">Margin Mode</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap">Badge</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap">Account Type</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap">Category</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest px-3 py-3 whitespace-nowrap">Actions</th>
          </tr>
        </thead>

        <!-- Loading skeleton -->
        <tbody v-if="store.loading">
          <tr
            v-for="n in 6"
            :key="n"
            class="border-b border-primary-border animate-pulse"
          >
            <td class="px-3 py-4">
              <div class="h-3.5 w-28 bg-background rounded mb-1.5" />
              <div class="h-2.5 w-36 bg-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-5 w-14 bg-background rounded-full" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3.5 w-10 bg-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3.5 w-12 bg-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3.5 w-16 bg-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3.5 w-16 bg-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="h-3.5 w-16 bg-background rounded" />
            </td>
            <td class="px-3 py-4">
              <div class="flex justify-end gap-2">
                <div class="h-7 w-20 bg-background rounded-lg" />
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Empty State -->
        <tbody v-else-if="store.records.length === 0">
          <tr>
            <td colspan="8" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-14 h-14 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center">
                  <Database class="w-6 h-6 text-secondary-text" />
                </div>
                <p class="text-sm font-semibold text-primary-text">No groups found</p>
                <p class="text-xs text-secondary-text">Try adjusting your filters or search</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data Rows -->
        <tbody v-else>
          <tr
            v-for="g in store.records"
            :key="g.config_id ?? g.group"
            class="border-b border-primary-border last:border-none hover:bg-background/40 transition-colors"
          >
            <!-- Group / Label & Config ID & Default indicator -->
            <td class="px-3 py-4">
              <div class="flex items-center gap-2">
                <Tooltip v-if="g.is_default" text="Default Group">
                  <div class="shrink-0 text-yellow-500">
                    <Star class="w-4 h-4 fill-current" />
                  </div>
                </Tooltip>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-primary-text truncate">
                    {{ g.label ?? extractGroupName(g.group) }}
                  </p>
                  <p class="text-[10px] text-secondary-text font-mono truncate mt-0.5">{{ g.group }}</p>
                  <p v-if="g.config_id" class="text-[10px] text-primary-green font-medium mt-0.5">Config #{{ g.config_id }}</p>
                </div>
              </div>
            </td>

            <!-- Status -->
            <td class="px-3 py-4 whitespace-nowrap">
              <span
                v-if="g.is_added"
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                :class="g.is_active
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                  : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
              >
                {{ g.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span v-else class="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20">
                Not Added
              </span>
            </td>

            <!-- Currency -->
            <td class="px-3 py-4 text-xs text-primary-text whitespace-nowrap">
              {{ g.currency ?? '—' }}
            </td>

            <!-- Leverage -->
            <td class="px-3 py-4 text-xs text-primary-text whitespace-nowrap">
              {{ g.leverage ? `1:${g.leverage}` : '—' }}
            </td>

            <!-- Margin Mode -->
            <td class="px-3 py-4 text-xs text-primary-text whitespace-nowrap capitalize">
              {{ g.margin_mode?.replace(/_/g, ' ') ?? '—' }}
            </td>

            <!-- Account Type / Badge -->
            <td class="px-3 py-4 text-xs text-primary-text whitespace-nowrap capitalize">
              <span v-if="g.badge" class="ml-1 px-1.5 py-0.5 text-[9px] bg-background border border-primary-border rounded text-secondary-text uppercase font-semibold">
                {{ g.badge }}
              </span>
            </td>
            <td class="px-3 py-4 text-xs text-primary-text text-center whitespace-nowrap capitalize">
              {{ g.account_type ?? '—' }}
            </td>

            <!-- Category -->
            <td class="px-3 py-4 text-xs text-primary-text whitespace-nowrap capitalize">
              {{ g.account_category ?? '—' }}
            </td>

            <!-- Actions -->
            <td class="px-3 py-4">
              <div class="flex items-center justify-center gap-2">
                <!-- Add Config -->
                <button
                  v-if="!g.is_added && hasPermission('group.group_update')"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                  @click="openAdd(g)"
                >
                  <Plus class="w-3 h-3" /> Add Config
                </button>

                <!-- Added Actions -->
                <template v-else-if="g.is_added">
                  <Tooltip
                    v-if="!g.is_default && hasPermission('group.group_update')"
                    text="Set as Default"
                  >
                    <button
                      @click="openSetDefaultConfirm(g)"
                      :disabled="store.actionLoading.id === g.config_id && store.actionLoading.type === 'set_default'"
                      class="p-1.5 rounded-lg hover:bg-yellow-500/10 text-yellow-600 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Loader2
                        v-if="store.actionLoading.id === g.config_id && store.actionLoading.type === 'set_default'"
                        class="w-3.5 h-3.5 animate-spin"
                      />
                      <Star v-else class="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>

                  <Tooltip v-if="hasPermission('group.group_delete')" text="Remove Configuration" position="end">
                    <button
                      @click="openDeconfigConfirm(g)"
                      :disabled="store.actionLoading.id === g.config_id && store.actionLoading.type === 'deconfig'"
                      class="p-1.5 rounded-lg hover:bg-primary-red/10 text-primary-red transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Loader2
                        v-if="store.actionLoading.id === g.config_id && store.actionLoading.type === 'deconfig'"
                        class="w-3.5 h-3.5 animate-spin"
                      />
                      <Trash2 v-else class="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-5">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Add Config Dialog -->
    <AddGroupConfigDialog
      :open="dialog.open"
      :group="dialog.group"
      @close="dialog.open = false"
    />

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :type="confirmDialog.type"
      :loading="store.actionLoading.id === confirmDialog.configId"
      :confirm-text="confirmDialog.action === 'setDefault' ? 'Set Default' : 'Remove Config'"
      @confirm="handleConfirmAction"
      @cancel="handleCancelConfirm"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Search, RefreshCw, Plus, CheckCircle2, Database, Star, Trash2, Loader2 } from 'lucide-vue-next'
import { useGroupConfigStore } from '@/stores/groupConfig/groupConfig'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import AddGroupConfigDialog from '@/components/groupConfig/AddGroupConfigDialog.vue'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store = useGroupConfigStore()
const route = useRoute()
const { hasPermission } = usePermissionCheck()
const refreshing = ref(false)
const dialog = ref({ open: false, group: null })

const confirmDialog = ref({
  open: false,
  type: 'warning',
  title: '',
  message: '',
  action: null,
  configId: null,
})

const tabs = [
  { label: 'All',       value: 'all'       },
  { label: 'Added',     value: 'added'     },
  { label: 'Not Added', value: 'not_added' },
]

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(), 400)
}

const switchTab = (val) => {
  store.filters.status = val
  store.applyFilters()
}

const refresh = async () => {
  refreshing.value = true
  await store.fetchGroups(true)
  refreshing.value = false
}

const openAdd = (group) => {
  dialog.value = {
    open: true,
    group: {
      ...group,
      account_category: route.params.account_category,
      account_type: route.params.account_type,
    }
  }
}

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchGroups(true)
}

const extractGroupName = (path) => path?.split('\\').pop() ?? path

const openSetDefaultConfirm = (group) => {
  confirmDialog.value = {
    open: true,
    type: 'success',
    title: 'Set as Default',
    message: `Are you sure you want to set "${group.label ?? group.group}" as the default group configuration?`,
    action: 'setDefault',
    configId: group.config_id,
  }
}

const openDeconfigConfirm = (group) => {
  confirmDialog.value = {
    open: true,
    type: 'danger',
    title: 'De-configure Group',
    message: `Are you sure you want to remove the configuration for "${group.label ?? group.group}"? This action cannot be undone.`,
    action: 'deconfig',
    configId: group.config_id,
  }
}

const handleConfirmAction = () => {
  const { action, configId } = confirmDialog.value

  if (action === 'setDefault') {
    store.setDefaultGroup(configId, () => {
      confirmDialog.value.open = false
    })
  } else if (action === 'deconfig') {
    store.deconfigGroup(configId, () => {
      confirmDialog.value.open = false
    })
  }
}

const handleCancelConfirm = () => {
  confirmDialog.value.open = false
  confirmDialog.value.action = null
  confirmDialog.value.configId = null
}

onMounted(() => {
  store.filters.account_category = route.params.account_category
  store.filters.account_type = route.params.account_type
  store.fetchGroups()
})
</script>
