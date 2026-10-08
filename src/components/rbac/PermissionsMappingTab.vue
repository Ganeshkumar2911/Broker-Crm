<template>
  <div class="space-y-6">
    <!-- Top Action & Filter Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Code -->
        <div class="relative w-full sm:w-64">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
          <input
            v-model="store.filters.permissionSearch"
            type="text"
            placeholder="Search code or slug..."
            class="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-all placeholder:text-secondary-text"
          />
          <button
            v-if="store.filters.permissionSearch"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
            @click="store.filters.permissionSearch = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Filter by Resource -->
        <div class="w-full sm:w-48">
          <BaseSelect
            v-model="store.filters.resourceFilterId"
            :options="resourceFilterOptions"
            allow-all
            all-label="All Resources"
            placeholder="All Resources"
            searchable
            local-search
            variant="surface"
          />
        </div>

        <!-- Filter by Action -->
        <div class="w-full sm:w-44">
          <BaseSelect
            v-model="store.filters.actionFilterId"
            :options="actionFilterOptions"
            allow-all
            all-label="All Actions"
            placeholder="All Actions"
            searchable
            local-search
            variant="surface"
          />
        </div>
      </div>

      <!-- Add Permission Mapping Button -->
      <button
        class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer shrink-0"
        @click="drawerOpen = true"
      >
        <Plus class="w-4 h-4" />
        <span>Create Permission</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="store.loadingPermissions" class="space-y-3">
      <div v-for="n in 5" :key="n" class="h-16 bg-card-background border border-primary-border rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredPermissions.length === 0"
      class="flex flex-col items-center justify-center py-20 bg-card-background border border-primary-border rounded-2xl text-center p-6"
    >
      <div class="w-14 h-14 rounded-2xl bg-background border border-primary-border flex items-center justify-center mb-4">
        <KeyRound class="w-7 h-7 text-secondary-text" />
      </div>
      <h3 class="text-sm font-bold text-primary-text mb-1">No Permission Mappings Found</h3>
      <p class="text-xs text-secondary-text max-w-sm mb-5">
        {{ (store.filters.permissionSearch || store.filters.resourceFilterId || store.filters.actionFilterId) ? 'No permissions match your filter query.' : 'Link resources and actions together to create permissions.' }}
      </p>
      <button
        v-if="store.filters.permissionSearch || store.filters.resourceFilterId || store.filters.actionFilterId"
        class="px-4 py-2 rounded-xl border border-primary-border text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
        @click="resetFilters"
      >
        Clear Filters
      </button>
      <button
        v-else
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
        @click="drawerOpen = true"
      >
        <Plus class="w-4 h-4" /> Create First Permission
      </button>
    </div>

    <!-- Data Table View -->
    <div v-else class="bg-card-background border border-primary-border rounded-2xl overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-primary-border bg-background/50 text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
              <th class="py-3 px-4">ID</th>
              <th class="py-3 px-4">Permission Code</th>
              <th class="py-3 px-4">Resource</th>
              <th class="py-3 px-4">Action</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border text-xs text-primary-text">
            <tr
              v-for="perm in filteredPermissions"
              :key="perm.id"
              class="hover:bg-background/40 transition-colors group"
            >
              <!-- ID -->
              <td class="py-3.5 px-4 font-mono text-secondary-text font-medium">
                #{{ perm.id }}
              </td>

              <!-- Code -->
              <td class="py-3.5 px-4 font-mono">
                <span class="px-2.5 py-1 rounded-lg bg-background border border-primary-border text-primary font-semibold">
                  {{ perm.code }}
                </span>
              </td>

              <!-- Resource -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2">
                  <Box class="w-3.5 h-3.5 text-secondary-text" />
                  <span class="font-semibold">{{ getResourceName(perm) }}</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-primary-border text-secondary-text">
                    {{ getResourceSlug(perm) }}
                  </span>
                </div>
              </td>

              <!-- Action -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2">
                  <Zap class="w-3.5 h-3.5 text-amber-400" />
                  <span class="font-semibold">{{ getActionName(perm) }}</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-primary-border text-secondary-text">
                    {{ getActionSlug(perm) }}
                  </span>
                </div>
              </td>

              <!-- Action button -->
              <td class="py-3.5 px-4 text-right">
                <button
                  :disabled="store.actionLoading"
                  class="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-primary-red/10 text-primary-red border border-primary-red/20 hover:bg-primary-red/20 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Delete Permission"
                  @click="deleteTarget = perm"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        @click="deleteTarget = null"
      >
        <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm p-6 shadow-2xl space-y-4" @click.stop>
          <div class="w-11 h-11 rounded-2xl bg-primary-red/10 border border-primary-red/20 flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-primary-red" />
          </div>

          <div>
            <h3 class="text-sm font-bold text-primary-text">Delete Permission Mapping</h3>
            <p class="text-xs text-secondary-text mt-1 leading-relaxed">
              Are you sure you want to delete permission code <code class="text-primary font-mono font-bold">{{ deleteTarget.code }}</code>?
            </p>
            <div class="mt-2.5 p-3 rounded-xl bg-primary-red/10 border border-primary-red/20 text-[11px] text-primary-red flex items-start gap-2">
              <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
              <span>Warning: This will unassign this permission from any Roles or Users that currently have it!</span>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer"
              @click="deleteTarget = null"
            >
              Cancel
            </button>
            <button
              :disabled="store.actionLoading"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary-red hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
              @click="confirmDelete"
            >
              <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ store.actionLoading ? 'Deleting...' : 'Delete Permission' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Permission Mapping Drawer -->
    <PermissionMappingDrawer
      :open="drawerOpen"
      @close="drawerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, KeyRound, Box, Zap, Trash2, AlertTriangle, Loader2, X } from 'lucide-vue-next'
import { useRbacModulesStore } from '@/stores/rbac/modules'
import PermissionMappingDrawer from './PermissionMappingDrawer.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const store = useRbacModulesStore()
const drawerOpen = ref(false)
const deleteTarget = ref(null)

const resourceFilterOptions = computed(() => {
  return store.resources.map((r) => ({
    label: r.name,
    value: r.id,
  }))
})

const actionFilterOptions = computed(() => {
  return store.actions.map((a) => ({
    label: a.name,
    value: a.id,
  }))
})

const resetFilters = () => {
  store.filters.permissionSearch = ''
  store.filters.resourceFilterId = null
  store.filters.actionFilterId = null
}

const filteredPermissions = computed(() => {
  let list = store.permissionsMapping

  if (store.filters.resourceFilterId) {
    list = list.filter((p) => p.resource_id === store.filters.resourceFilterId)
  }

  if (store.filters.actionFilterId) {
    list = list.filter((p) => p.action_id === store.filters.actionFilterId)
  }

  const query = (store.filters.permissionSearch || '').toLowerCase().trim()
  if (query) {
    list = list.filter(
      (p) =>
        p.code?.toLowerCase().includes(query) ||
        p.resource_slug?.toLowerCase().includes(query) ||
        p.action_slug?.toLowerCase().includes(query) ||
        p.id?.toString().includes(query)
    )
  }

  return list
})

const getResourceName = (perm) => {
  if (perm.resource_name) return perm.resource_name
  const res = store.resources.find((r) => r.id === perm.resource_id || r.slug === perm.resource_slug)
  return res ? res.name : perm.resource_slug || `Resource #${perm.resource_id}`
}

const getResourceSlug = (perm) => {
  if (perm.resource_slug) return perm.resource_slug
  const res = store.resources.find((r) => r.id === perm.resource_id)
  return res ? res.slug : ''
}

const getActionName = (perm) => {
  if (perm.action_name) return perm.action_name
  const act = store.actions.find((a) => a.id === perm.action_id || a.slug === perm.action_slug)
  return act ? act.name : perm.action_slug || `Action #${perm.action_id}`
}

const getActionSlug = (perm) => {
  if (perm.action_slug) return perm.action_slug
  const act = store.actions.find((a) => a.id === perm.action_id)
  return act ? act.slug : ''
}

const confirmDelete = () => {
  if (!deleteTarget.value) return
  store.deletePermissionMapping(deleteTarget.value.id, () => {
    deleteTarget.value = null
  })
}

onMounted(() => {
  if (store.permissionsMapping.length === 0) store.fetchPermissionsMapping()
})
</script>
