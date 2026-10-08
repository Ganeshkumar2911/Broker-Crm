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
          class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck class="w-5.5 h-5.5 text-primary" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h2 class="text-sm font-semibold text-primary-text truncate">User Permission Overrides</h2>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {{ staff?.role_name || 'Staff' }}
                  </span>
                </div>
                <p class="text-xs text-secondary-text mt-0.5 truncate">
                  <span class="font-medium text-primary-text">{{ staff?.name }}</span> ({{ staff?.email }})
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

          <!-- Tab Segmented Control -->
          <div class=" border-b border-primary-border bg-background/40 shrink-0 h-12">
            <div class="flex items-center  w-full h-full">
              <!-- Tab 1: Role Permissions -->
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer h-full"
                :class="activeTab === 'role'
                  ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                  : 'border-transparent text-secondary-text hover:text-primary-text hover:bg-background/60'"
                @click="activeTab = 'role'"
              >
                <ShieldAlert class="w-4 h-4 shrink-0" />
                <span class="truncate">Role Permissions</span>
                <span
                  class="text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0"
                  :class="activeTab === 'role' ? 'bg-amber-500/20 text-amber-500' : 'bg-background border border-primary-border text-secondary-text'"
                >
                  {{ rolePermissionsCount }}
                </span>
              </button>

              <!-- Tab 2: Grant Permissions -->
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer h-full"
                :class="activeTab === 'grant'
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-secondary-text hover:text-primary-text hover:bg-background/60'"
                @click="activeTab = 'grant'"
              >
                <PlusCircle class="w-4 h-4 shrink-0" />
                <span class="truncate">Grant Additional</span>
                <span
                  class="text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0"
                  :class="activeTab === 'grant' ? 'bg-primary/20 text-primary' : 'bg-background border border-primary-border text-secondary-text'"
                >
                  {{ availablePermissionsCount }}
                </span>
              </button>

              <!-- Tab 3: Custom Permissions -->
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer h-full"
                :class="activeTab === 'custom'
                  ? 'border-primary-red text-primary-red bg-primary-red/10'
                  : 'border-transparent text-secondary-text hover:text-primary-text hover:bg-background/60'"
                @click="activeTab = 'custom'"
              >
                <Key class="w-4 h-4 shrink-0" />
                <span class="truncate">Custom Overrides</span>
                <span
                  class="text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0"
                  :class="activeTab === 'custom' ? 'bg-primary-red/20 text-primary-red' : 'bg-background border border-primary-border text-secondary-text'"
                >
                  {{ customPermissionsCount }}
                </span>
              </button>
            </div>
          </div>

          <!-- Toolbar / Controls -->
          <div class="px-6 py-3 border-b border-primary-border bg-background/60 shrink-0 space-y-3">
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
                @click="selectAllActive"
              >
                Select All
              </button>
              <button
                type="button"
                class="px-2.5 py-2 rounded-xl border border-primary-border bg-card-background hover:bg-background text-[11px] font-medium text-secondary-text hover:text-primary-text transition-colors whitespace-nowrap cursor-pointer"
                @click="clearActiveSelection"
              >
                Clear
              </button>
            </div>

            <!-- Stats Bar -->
            <div class="flex items-center justify-between text-[11px] text-secondary-text pt-0.5">
              <span>Showing {{ totalActivePermissions }} permissions in active tab</span>
              <span class="font-semibold" :class="activeTabThemeColor">
                {{ activeSelectedCount }} Selected
              </span>
            </div>
          </div>

          <!-- Scrollable Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <!-- Loading Skeleton -->
            <div v-if="loading || (activeTab === 'grant' && allPermissionsLoading)" class="space-y-4 animate-pulse">
              <div v-for="n in 4" :key="n" class="bg-background border border-primary-border rounded-xl p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="h-4 w-32 bg-card-background rounded" />
                  <div class="h-4 w-16 bg-card-background rounded" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div v-for="i in 4" :key="i" class="h-10 bg-card-background rounded-lg" />
                </div>
              </div>
            </div>

            <!-- Sections -->
            <template v-else>
              <!-- Tab 1: Role Permissions -->
              <RolePermissionsSection
                v-if="activeTab === 'role'"
                :permissions="rolePermissions"
                :selected-ids="selectedRoleIds"
                :search-query="searchQuery"
                @toggle-permission="toggleRolePermission"
                @toggle-resource="toggleRoleResource"
              />

              <!-- Tab 2: Grant Permissions -->
              <GrantPermissionsSection
                v-else-if="activeTab === 'grant'"
                :permissions="availablePermissions"
                :selected-ids="selectedGrantIds"
                :search-query="searchQuery"
                @toggle-permission="toggleGrantPermission"
                @toggle-resource="toggleGrantResource"
              />

              <!-- Tab 3: Custom Overrides -->
              <CustomPermissionsSection
                v-else-if="activeTab === 'custom'"
                :permissions="customPermissions"
                :selected-ids="selectedCustomIds"
                :search-query="searchQuery"
                @toggle-permission="toggleCustomPermission"
                @toggle-resource="toggleCustomResource"
              />
            </template>
          </div>

          <!-- Sticky Footer Action Bar -->
          <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <div>
              <p class="text-xs font-semibold text-primary-text">
                {{ activeSelectedCount }} Selected for {{ activeActionText }}
              </p>
              <p class="text-[11px] text-secondary-text">
                Changes apply immediately upon confirmation.
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
                :disabled="actionLoading || activeSelectedCount === 0"
                class="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary/85 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                @click="executeActiveAction"
              >
                <Loader2 v-if="actionLoading" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ actionLoading ? 'Processing...' : activeActionButtonLabel }}</span>
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
import { X, ShieldCheck, Search, Loader2, ShieldAlert, PlusCircle, Key } from 'lucide-vue-next'
import { useUserPermissions } from '@/composables/useUserPermissions'
import RolePermissionsSection from './RolePermissionsSection.vue'
import GrantPermissionsSection from './GrantPermissionsSection.vue'
import CustomPermissionsSection from './CustomPermissionsSection.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  staff: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const activeTab = ref('role') // 'role' | 'grant' | 'custom'
const searchQuery = ref('')

const selectedRoleIds = ref([])
const selectedGrantIds = ref([])
const selectedCustomIds = ref([])

const {
  loading,
  allPermissionsLoading,
  actionLoading,
  rolePermissions,
  rolePermissionsCount,
  customPermissions,
  customPermissionsCount,
  availablePermissions,
  availablePermissionsCount,
  getPermId,
  fetchUserPermissions,
  fetchAllPermissions,
  disableRolePermissions,
  grantCustomPermissions,
  removeCustomPermissions,
} = useUserPermissions()

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.staff?.id) {
      searchQuery.value = ''
      activeTab.value = 'role'
      selectedRoleIds.value = []
      selectedGrantIds.value = []
      selectedCustomIds.value = []

      fetchUserPermissions(props.staff.id)
      fetchAllPermissions()
    }
  }
)

// Active Tab Helpers
const activeSelectedCount = computed(() => {
  let list = []
  if (activeTab.value === 'role') list = selectedRoleIds.value
  else if (activeTab.value === 'grant') list = selectedGrantIds.value
  else if (activeTab.value === 'custom') list = selectedCustomIds.value
  return list.filter((id) => id !== null && id !== undefined).length
})

const totalActivePermissions = computed(() => {
  if (activeTab.value === 'role') return rolePermissionsCount.value
  if (activeTab.value === 'grant') return availablePermissionsCount.value
  if (activeTab.value === 'custom') return customPermissionsCount.value
  return 0
})

const activeActionText = computed(() => {
  if (activeTab.value === 'role') return 'disabling'
  if (activeTab.value === 'grant') return 'granting'
  if (activeTab.value === 'custom') return 'removing'
  return ''
})

const activeTabThemeColor = computed(() => {
  if (activeTab.value === 'role') return 'text-amber-500'
  if (activeTab.value === 'grant') return 'text-primary'
  if (activeTab.value === 'custom') return 'text-primary-red'
  return ''
})

// const activeActionButtonClass = computed(() => {
//   if (activeTab.value === 'role') return 'bg-primary-hover hover:bg-primary-hover'
//   if (activeTab.value === 'grant') return 'bg-primary hover:bg-primary-hover'
//   if (activeTab.value === 'custom') return 'bg-primary-red hover:bg-primary-red/90'
//   return 'bg-primary'
// })

const activeActionButtonLabel = computed(() => {
  const count = activeSelectedCount.value
  if (activeTab.value === 'role') return count ? `Disable ${count} Permission${count > 1 ? 's' : ''}` : 'Disable Selected'
  if (activeTab.value === 'grant') return count ? `Grant ${count} Permission${count > 1 ? 's' : ''}` : 'Grant Selected'
  if (activeTab.value === 'custom') return count ? `Remove ${count} Override${count > 1 ? 's' : ''}` : 'Remove Selected'
  return 'Save'
})

// Item Toggles
const toggleRolePermission = (id) => {
  if (id === null || id === undefined) return
  const idx = selectedRoleIds.value.indexOf(id)
  if (idx === -1) selectedRoleIds.value.push(id)
  else selectedRoleIds.value.splice(idx, 1)
}

const toggleRoleResource = (perms) => {
  const validPerms = (perms || []).map(getPermId).filter((id) => id !== null && id !== undefined)
  const allIn = validPerms.every((id) => selectedRoleIds.value.includes(id))
  validPerms.forEach((id) => {
    const idx = selectedRoleIds.value.indexOf(id)
    if (allIn) {
      if (idx !== -1) selectedRoleIds.value.splice(idx, 1)
    } else {
      if (idx === -1) selectedRoleIds.value.push(id)
    }
  })
}

const toggleGrantPermission = (id) => {
  if (id === null || id === undefined) return
  const idx = selectedGrantIds.value.indexOf(id)
  if (idx === -1) selectedGrantIds.value.push(id)
  else selectedGrantIds.value.splice(idx, 1)
}

const toggleGrantResource = (perms) => {
  const validPerms = (perms || []).map(getPermId).filter((id) => id !== null && id !== undefined)
  const allIn = validPerms.every((id) => selectedGrantIds.value.includes(id))
  validPerms.forEach((id) => {
    const idx = selectedGrantIds.value.indexOf(id)
    if (allIn) {
      if (idx !== -1) selectedGrantIds.value.splice(idx, 1)
    } else {
      if (idx === -1) selectedGrantIds.value.push(id)
    }
  })
}

const toggleCustomPermission = (id) => {
  if (id === null || id === undefined) return
  const idx = selectedCustomIds.value.indexOf(id)
  if (idx === -1) selectedCustomIds.value.push(id)
  else selectedCustomIds.value.splice(idx, 1)
}

const toggleCustomResource = (perms) => {
  const validPerms = (perms || []).map(getPermId).filter((id) => id !== null && id !== undefined)
  const allIn = validPerms.every((id) => selectedCustomIds.value.includes(id))
  validPerms.forEach((id) => {
    const idx = selectedCustomIds.value.indexOf(id)
    if (allIn) {
      if (idx !== -1) selectedCustomIds.value.splice(idx, 1)
    } else {
      if (idx === -1) selectedCustomIds.value.push(id)
    }
  })
}

// Bulk Selection
const selectAllActive = () => {
  let targetObj = {}
  let targetList = null

  if (activeTab.value === 'role') {
    targetObj = rolePermissions.value
    targetList = selectedRoleIds.value
  } else if (activeTab.value === 'grant') {
    targetObj = availablePermissions.value
    targetList = selectedGrantIds.value
  } else if (activeTab.value === 'custom') {
    targetObj = customPermissions.value
    targetList = selectedCustomIds.value
  }

  Object.values(targetObj).forEach((perms) => {
    perms.forEach((p) => {
      const id = getPermId(p)
      if (id !== null && id !== undefined && !targetList.includes(id)) {
        targetList.push(id)
      }
    })
  })
}

const clearActiveSelection = () => {
  if (activeTab.value === 'role') selectedRoleIds.value = []
  else if (activeTab.value === 'grant') selectedGrantIds.value = []
  else if (activeTab.value === 'custom') selectedCustomIds.value = []
}

// Action execution
const executeActiveAction = () => {
  if (!props.staff?.id) return

  if (activeTab.value === 'role') {
    disableRolePermissions(props.staff.id, selectedRoleIds.value, () => {
      selectedRoleIds.value = []
    })
  } else if (activeTab.value === 'grant') {
    grantCustomPermissions(props.staff.id, selectedGrantIds.value, () => {
      selectedGrantIds.value = []
    })
  } else if (activeTab.value === 'custom') {
    removeCustomPermissions(props.staff.id, selectedCustomIds.value, () => {
      selectedCustomIds.value = []
    })
  }
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
