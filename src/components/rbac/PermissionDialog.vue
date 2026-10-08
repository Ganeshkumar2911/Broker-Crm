<template>
  <Teleport to="body">
    <div>
      <!-- Backdrop Overlay -->
      <Transition name="backdrop">
        <div
          v-if="open"
          class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer"
          @click="emit('close')"
        />
      </Transition>

      <!-- Side Panel Drawer -->
      <Transition name="drawer">
        <div
          v-if="open"
          class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck class="w-5 h-5 text-primary" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-sm font-semibold text-primary-text">Manage Permissions</h2>
                  <span v-if="role?.is_system" class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">System</span>
                </div>
                <p class="text-xs text-secondary-text mt-0.5">
                  Role: <span class="font-medium text-primary-text">{{ role?.name || 'Selected Role' }}</span>
                </p>
              </div>
            </div>

            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              @click="emit('close')"
              title="Close"
            >
              <X class="w-4.5 h-4.5" />
            </button>
          </div>

          <!-- Toolbar / Controls -->
          <div class="px-6 py-3 border-b border-primary-border bg-background/60 shrink-0 space-y-3">
            <!-- Search & Actions -->
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search permissions or modules..."
                  class="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                />
                <button
                  v-if="searchQuery"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
                  @click="searchQuery = ''"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>

              <!-- Quick Selection Actions -->
              <button
                type="button"
                class="px-2.5 py-2 rounded-xl border border-primary-border bg-card-background hover:bg-background text-[11px] font-medium text-secondary-text hover:text-primary-text transition-colors whitespace-nowrap cursor-pointer"
                @click="selectAllFiltered"
              >
                Select All
              </button>
              <button
                type="button"
                class="px-2.5 py-2 rounded-xl border border-primary-border bg-card-background hover:bg-background text-[11px] font-medium text-secondary-text hover:text-primary-text transition-colors whitespace-nowrap cursor-pointer"
                @click="deselectAllFiltered"
              >
                Clear
              </button>
            </div>

            <!-- Stats Bar -->
            <div class="flex items-center justify-between text-[11px] text-secondary-text pt-0.5">
              <span>Showing {{ totalFilteredPermissions }} permissions across {{ Object.keys(filteredPermissions).length }} modules</span>
              <span class="font-semibold text-primary">
                {{ localSelected.length }} / {{ totalAllPermissions }} Selected
              </span>
            </div>
          </div>

          <!-- Scrollable Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <!-- Loading Skeleton -->
            <div v-if="store.permissionLoading" class="space-y-4 animate-pulse">
              <div v-for="n in 5" :key="n" class="bg-background border border-primary-border rounded-xl p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="h-4 w-32 bg-card-background rounded" />
                  <div class="h-4 w-12 bg-card-background rounded" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div v-for="i in 4" :key="i" class="h-8 bg-card-background rounded-lg" />
                </div>
              </div>
            </div>

            <!-- Empty Search Results -->
            <div
              v-else-if="Object.keys(filteredPermissions).length === 0"
              class="flex flex-col items-center justify-center py-16 text-center"
            >
              <div class="w-12 h-12 rounded-full bg-background border border-primary-border flex items-center justify-center mb-3">
                <Search class="w-5 h-5 text-secondary-text" />
              </div>
              <p class="text-xs font-semibold text-primary-text">No permissions found</p>
              <p class="text-[11px] text-secondary-text mt-1">Try adjusting your search criteria</p>
            </div>

            <!-- Resource Permission Cards -->
            <div
              v-else
              v-for="(perms, resource) in filteredPermissions"
              :key="resource"
              class="bg-background border border-primary-border rounded-xl overflow-hidden transition-all duration-150 hover:border-primary-border/80"
            >
              <!-- Resource Card Header -->
              <div class="px-4 py-3 bg-card-background/50 border-b border-primary-border flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Layers class="w-4 h-4 text-primary" />
                  <span class="text-xs font-semibold text-primary-text capitalize tracking-wide">
                    {{ resource.replace(/_/g, ' ') }}
                  </span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-background text-secondary-text border border-primary-border font-medium">
                    {{ getSelectedCountForResource(perms) }} / {{ perms.length }}
                  </span>
                </div>

                <!-- Module Select All Checkbox -->
                <button
                  type="button"
                  class="flex items-center gap-1.5 text-[11px] text-secondary-text hover:text-primary-text font-medium cursor-pointer transition-colors"
                  @click="toggleResourcePermissions(perms)"
                >
                  <span>{{ isResourceFullySelected(perms) ? 'Deselect Module' : 'Select Module' }}</span>
                  <div
                    class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                    :class="isResourceFullySelected(perms) ? 'bg-primary border-primary' : 'bg-background border-primary-border'"
                  >
                    <Check v-if="isResourceFullySelected(perms)" class="w-3 h-3 text-white" />
                  </div>
                </button>
              </div>

              <!-- Permission Items Grid -->
              <div class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="perm in perms"
                  :key="perm.id"
                  class="flex items-center justify-between p-2.5 rounded-lg border transition-all duration-150 cursor-pointer select-none"
                  :class="localSelected.includes(perm.id)
                    ? 'bg-primary/5 border-primary/30 text-primary-text'
                    : 'bg-card-background border-primary-border/60 hover:border-primary-border text-secondary-text hover:text-primary-text'"
                  @click="togglePermission(perm.id)"
                >
                  <span class="text-xs font-medium capitalize truncate pr-2">
                    {{ perm.action ? perm.action.replace(/_/g, ' ') : perm.name || 'Permission' }}
                  </span>

                  <div
                    class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                    :class="localSelected.includes(perm.id)
                      ? 'bg-primary border-primary'
                      : 'bg-background border-primary-border'"
                  >
                    <Check v-if="localSelected.includes(perm.id)" class="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sticky Footer Action Bar -->
          <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <div>
              <p class="text-xs font-semibold text-primary-text">
                {{ localSelected.length }} Permissions Selected
              </p>
              <p class="text-[11px] text-secondary-text">
                Changes will take effect immediately upon saving.
              </p>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                class="px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
                @click="emit('close')"
              >
                Cancel
              </button>
              <button
                type="button"
                :disabled="store.actionLoading"
                class="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                @click="save"
              >
                <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ store.actionLoading ? 'Saving Changes...' : 'Save Permissions' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Check, Loader2, ShieldCheck, Search, Layers } from 'lucide-vue-next'
import { useRbacRolesStore } from '@/stores/rbac/roles'

const props = defineProps({
  open: { type: Boolean, default: false },
  role: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const store = useRbacRolesStore()
const localSelected = ref([])
const searchQuery = ref('')

watch(
  () => props.open,
  (val) => {
    if (val && props.role) {
      searchQuery.value = ''
      localSelected.value = [...(props.role.permission_ids ?? [])]
      store.fetchPermissions()
      store.fetchRolePermissions(props.role.id)
    }
  }
)

watch(
  () => store.selectedRolePermissions,
  (val) => {
    if (val?.length) {
      localSelected.value = [...val]
    }
  }
)

// Computed filtered permissions
const filteredPermissions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return store.permissions || {}

  const result = {}
  Object.entries(store.permissions || {}).forEach(([resource, perms]) => {
    const resourceMatch = resource.replace(/_/g, ' ').toLowerCase().includes(query)
    const matchingPerms = perms.filter((perm) => {
      const actionMatch = perm.action?.replace(/_/g, ' ').toLowerCase().includes(query)
      const nameMatch = perm.name?.toLowerCase().includes(query)
      return resourceMatch || actionMatch || nameMatch
    })

    if (matchingPerms.length > 0) {
      result[resource] = matchingPerms
    }
  })

  return result
})

// Statistics
const totalAllPermissions = computed(() => {
  let count = 0
  Object.values(store.permissions || {}).forEach((perms) => {
    count += perms.length
  })
  return count
})

const totalFilteredPermissions = computed(() => {
  let count = 0
  Object.values(filteredPermissions.value).forEach((perms) => {
    count += perms.length
  })
  return count
})

// Toggle individual permission
const togglePermission = (id) => {
  const idx = localSelected.value.indexOf(id)
  if (idx === -1) {
    localSelected.value.push(id)
  } else {
    localSelected.value.splice(idx, 1)
  }
}

// Module / Resource helpers
const getSelectedCountForResource = (perms) => {
  return perms.filter((p) => localSelected.value.includes(p.id)).length
}

const isResourceFullySelected = (perms) => {
  if (!perms || perms.length === 0) return false
  return perms.every((p) => localSelected.value.includes(p.id))
}

const toggleResourcePermissions = (perms) => {
  const fullySelected = isResourceFullySelected(perms)
  perms.forEach((p) => {
    const idx = localSelected.value.indexOf(p.id)
    if (fullySelected) {
      if (idx !== -1) localSelected.value.splice(idx, 1)
    } else {
      if (idx === -1) localSelected.value.push(p.id)
    }
  })
}

// Bulk Actions
const selectAllFiltered = () => {
  Object.values(filteredPermissions.value).forEach((perms) => {
    perms.forEach((p) => {
      if (!localSelected.value.includes(p.id)) {
        localSelected.value.push(p.id)
      }
    })
  })
}

const deselectAllFiltered = () => {
  Object.values(filteredPermissions.value).forEach((perms) => {
    perms.forEach((p) => {
      const idx = localSelected.value.indexOf(p.id)
      if (idx !== -1) {
        localSelected.value.splice(idx, 1)
      }
    })
  })
}

const save = () => {
  if (!props.role) return
  store.assignPermissions(props.role.id, localSelected.value, () => emit('close'))
}
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>