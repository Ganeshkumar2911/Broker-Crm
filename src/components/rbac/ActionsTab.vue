<template>
  <div class="space-y-6">
    <!-- Top Action & Filter Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
          <input
            v-model="store.filters.actionSearch"
            type="text"
            placeholder="Search actions..."
            class="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-all placeholder:text-secondary-text"
          />
          <button
            v-if="store.filters.actionSearch"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
            @click="store.filters.actionSearch = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Summary Counter -->
        <div class="hidden md:flex items-center gap-2 text-xs text-secondary-text">
          <span class="px-3 py-1.5 rounded-lg bg-card-background border border-primary-border font-medium">
            Total Actions: <strong class="text-primary-text">{{ filteredActions.length }}</strong>
          </span>
        </div>
      </div>

      <!-- Add Action Button -->
      <button
        class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer shrink-0"
        @click="openCreate"
      >
        <Plus class="w-4 h-4" />
        <span>Add Action</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="store.loadingActions" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 6" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-background" />
          <div class="h-5 w-16 bg-background rounded-full" />
        </div>
        <div class="space-y-2">
          <div class="h-4 w-3/4 bg-background rounded" />
          <div class="h-3 w-full bg-background rounded" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredActions.length === 0"
      class="flex flex-col items-center justify-center py-20 bg-card-background border border-primary-border rounded-2xl text-center p-6"
    >
      <div class="w-14 h-14 rounded-2xl bg-background border border-primary-border flex items-center justify-center mb-4">
        <Zap class="w-7 h-7 text-secondary-text" />
      </div>
      <h3 class="text-sm font-bold text-primary-text mb-1">No Actions Found</h3>
      <p class="text-xs text-secondary-text max-w-sm mb-5">
        {{ store.filters.actionSearch ? 'No actions match your search query.' : 'Create action types (e.g., view, edit, approve) to link with resources.' }}
      </p>
      <button
        v-if="store.filters.actionSearch"
        class="px-4 py-2 rounded-xl border border-primary-border text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
        @click="store.filters.actionSearch = ''"
      >
        Clear Search
      </button>
      <button
        v-else
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
        @click="openCreate"
      >
        <Plus class="w-4 h-4" /> Create First Action
      </button>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="act in filteredActions"
        :key="act.id"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-primary/40 transition-all duration-300 group"
      >
        <!-- Card Body -->
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
              <Zap class="w-5 h-5 text-primary" />
            </div>

            <span class="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-background text-secondary-text border border-primary-border shrink-0">
              ID: #{{ act.id }}
            </span>
          </div>

          <div>
            <h3 class="text-sm font-bold text-primary-text tracking-wide group-hover:text-primary transition-colors">
              {{ act.name }}
            </h3>
            <div class="mt-1 flex items-center gap-2">
              <span class="text-xs text-secondary-text">Slug:</span>
              <code class="text-xs font-mono px-2 py-0.5 rounded bg-background border border-primary-border text-primary font-medium">
                {{ act.slug }}
              </code>
            </div>
          </div>
        </div>

        <!-- Meta & Actions Footer -->
        <div class="space-y-3 pt-3 border-t border-primary-border">
          <div class="flex items-center justify-between text-xs text-secondary-text">
            <span class="flex items-center gap-1.5 font-medium">
              <KeyRound class="w-3.5 h-3.5 text-primary" />
              <span>{{ getLinkedPermissionsCount(act) }} Permissions Linked</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-background border border-primary-border hover:border-primary/40 text-xs font-semibold text-primary-text hover:bg-primary/5 transition-all duration-200 cursor-pointer"
              @click="openEdit(act)"
            >
              <Pencil class="w-3.5 h-3.5 text-primary" />
              <span>Edit</span>
            </button>

            <button
              :disabled="store.actionLoading"
              class="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-red/10 text-primary-red border border-primary-red/20 hover:bg-primary-red/20 transition-colors disabled:opacity-50 cursor-pointer"
              title="Delete Action"
              @click="deleteTarget = act"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
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
            <h3 class="text-sm font-bold text-primary-text">Delete Action</h3>
            <p class="text-xs text-secondary-text mt-1 leading-relaxed">
              Are you sure you want to delete action <strong class="text-primary-text">{{ deleteTarget.name }}</strong> (<code class="text-primary font-mono text-[11px]">{{ deleteTarget.slug }}</code>)?
            </p>
            <div class="mt-2.5 p-3 rounded-xl bg-primary-red/10 border border-primary-red/20 text-[11px] text-primary-red flex items-start gap-2">
              <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
              <span>Warning: This will cascade and delete all permissions linked to this action!</span>
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
              <span>{{ store.actionLoading ? 'Deleting...' : 'Delete Action' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Action Drawer -->
    <ActionDrawer
      :open="drawer.open"
      :edit-data="drawer.editData"
      @close="drawer.open = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Zap, Pencil, Trash2, KeyRound, AlertTriangle, Loader2, X } from 'lucide-vue-next'
import { useRbacModulesStore } from '@/stores/rbac/modules'
import ActionDrawer from './ActionDrawer.vue'

const store = useRbacModulesStore()

const drawer = ref({ open: false, editData: null })
const deleteTarget = ref(null)

const openCreate = () => {
  drawer.value = { open: true, editData: null }
}
const openEdit = (act) => {
  drawer.value = { open: true, editData: act }
}

const filteredActions = computed(() => {
  const query = (store.filters.actionSearch || '').toLowerCase().trim()
  if (!query) return store.actions
  return store.actions.filter(
    (a) =>
      a.name?.toLowerCase().includes(query) ||
      a.slug?.toLowerCase().includes(query) ||
      a.id?.toString().includes(query)
  )
})

const getLinkedPermissionsCount = (act) => {
  return store.permissionsMapping.filter((p) => p.action_id === act.id || p.action_slug === act.slug).length
}

const confirmDelete = () => {
  if (!deleteTarget.value) return
  store.deleteAction(deleteTarget.value.id, () => {
    deleteTarget.value = null
  })
}

onMounted(() => {
  if (store.actions.length === 0) store.fetchActions()
})
</script>
