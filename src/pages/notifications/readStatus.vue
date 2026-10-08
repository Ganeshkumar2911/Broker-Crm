<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications/notifications'
import BaseSelect from '@/components/common/BaseSelect.vue'
import Pagination from '@/components/common/Pagination.vue'
import { formatDate } from '@/utils/timeFormatter'
import {
  ArrowLeft,
  Search,
  RotateCw,
  Eye,
  CheckCheck,
  Check,
  Loader2,
  Users,
  Shield,
  ShieldCheck,
  User,
  TrendingUp,
  Network,
  FilterX,
  UserCheck,
  UserX,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useNotificationsStore()

const notificationId = computed(() => route.params.id)

const searchQuery = ref('')
const selectedStatus = ref(null)
const selectedRole = ref(null)

const statusOptions = [
  { label: 'Read Only', value: 'read' },
  { label: 'Unread Only', value: 'unread' },
]

const roleOptions = [
  { label: 'Client', value: 'client' },
  { label: 'Fund Manager', value: 'fm' },
  { label: 'IB Partner', value: 'ib' },
  { label: 'Admin', value: 'staff' },
]

function loadLogs(page = 1) {
  if (!notificationId.value) return
  store.fetchReadStatusLogs(notificationId.value, {
    page,
    status: selectedStatus.value,
    role: selectedRole.value,
  })
}

onMounted(() => {
  loadLogs(1)
})

watch([selectedStatus, selectedRole], () => {
  loadLogs(1)
})

function handlePageChange(newPage) {
  loadLogs(newPage)
}

function handleRefresh() {
  loadLogs(store.readStatusPagination.page || 1)
}

const hasActiveFilters = computed(() => {
  return Boolean(searchQuery.value.trim() || selectedStatus.value !== null || selectedRole.value !== null)
})

function clearFilters() {
  searchQuery.value = ''
  selectedStatus.value = null
  selectedRole.value = null
}

function goBack() {
  router.back()
}

const filteredLogs = computed(() => {
  if (!searchQuery.value.trim()) return store.readStatusLogs
  const q = searchQuery.value.toLowerCase().trim()
  return store.readStatusLogs.filter((item) => {
    const nameStr = (item.name || '').toLowerCase()
    const emailStr = (item.email || '').toLowerCase()
    const idStr = String(item.user_id || '')
    return nameStr.includes(q) || emailStr.includes(q) || idStr.includes(q)
  })
})

const readCount = computed(() => filteredLogs.value.filter((i) => i.is_read).length)
const unreadCount = computed(() => filteredLogs.value.length - readCount.value)

function getRoleBadgeClass(role) {
  switch ((role || '').toLowerCase()) {
    case 'client':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    case 'fm':
    case 'fund manager':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    case 'ib':
    case 'ib partner':
      return 'bg-teal-500/10 text-teal-400 border-teal-500/30'
    case 'admin':
    case 'staff':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    default:
      return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
  }
}

function getRoleIcon(role) {
  switch ((role || '').toLowerCase()) {
    case 'client':
      return User
    case 'fm':
    case 'fund manager':
      return TrendingUp
    case 'ib':
    case 'ib partner':
      return Network
    case 'admin':
    case 'staff':
      return ShieldCheck
    default:
      return User
  }
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="mx-auto space-y-5 px-4 pb-12">
    <!-- Filters Bar -->
    <div class="flex flex-col gap-3 rounded-xl border border-primary-border bg-card-background/60 p-3 lg:flex-row lg:items-center lg:justify-between">
      <!-- Search Input -->
      <div class="relative w-full lg:max-w-sm">
        <Search class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-text" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by user name, email, or ID..."
          class="w-full rounded-lg border border-primary-border bg-background py-1.5 pl-8 pr-3 text-xs text-primary-text outline-none transition-colors placeholder:text-secondary-text/70 focus:border-primary"
        />
      </div>

      <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <!-- Dropdown Filters -->
        <div class="grid grid-cols-2 gap-2.5 sm:w-72">
          <BaseSelect
            v-model="selectedStatus"
            :options="statusOptions"
            :allowAll="true"
            allLabel="All Status"
            placeholder="All Status"
          />
          <BaseSelect
            v-model="selectedRole"
            :options="roleOptions"
            :allowAll="true"
            allLabel="All Roles"
            placeholder="All Roles"
          />
        </div>

        <!-- Clear Filters & Refresh -->
        <div class="flex items-center gap-2">
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="flex shrink-0 items-center justify-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 cursor-pointer"
            title="Reset search and filters"
          >
            <FilterX class="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          <button
            @click="handleRefresh"
            :disabled="store.readStatusLoading"
            class="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-primary-border bg-card-background px-3.5 py-2 text-xs font-medium text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:opacity-50 cursor-pointer"
          >
            <RotateCw class="h-3.5 w-3.5" :class="{ 'animate-spin': store.readStatusLoading }" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Logs Table Container -->
    <div class="overflow-hidden rounded-2xl border border-primary-border bg-card-background">
      <div class="flex items-center justify-between border-b border-primary-border bg-gradient-to-b from-background/70 to-transparent px-5 py-3.5">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Eye class="h-3.5 w-3.5 text-primary" />
          </div>
          <span class="text-xs font-bold text-primary-text">Recipient Activity Logs</span>
        </div>

        <span class="text-xs font-semibold text-secondary-text">
          {{ store.readStatusPagination.total || filteredLogs.length }} recipients tracked
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="store.readStatusLoading" class="flex flex-col items-center gap-3 py-16">
        <Loader2 class="h-5 w-5 animate-spin text-primary" />
        <p class="text-xs text-secondary-text">Loading recipient read status logs…</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredLogs.length === 0" class="flex flex-col items-center gap-3 py-16 text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-border/40">
          <Users class="h-5 w-5 text-secondary-text" />
        </div>
        <div>
          <p class="text-xs font-semibold text-primary-text">No recipient logs found</p>
          <p class="mt-0.5 text-[11px] text-secondary-text">Try adjusting your status or role filters.</p>
        </div>
      </div>

      <!-- Table Body -->
      <div v-else class="no-scrollbar overflow-x-auto">
        <table class="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr class="border-b border-primary-border bg-background/40 text-[10.5px] font-semibold uppercase tracking-wider text-secondary-text">
              <th class="px-5 py-3">User</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3 text-right">Read Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-primary-border/50 text-xs">
            <tr
              v-for="item in filteredLogs"
              :key="item.user_id"
              class="transition-colors hover:bg-primary/[0.03]"
            >
              <!-- User (avatar + name/email/id) -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {{ getInitials(item.name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-xs font-bold text-primary-text">{{ item.name || '—' }}</p>
                    <p class="truncate font-mono text-[10.5px] text-secondary-text">
                      {{ item.email || '—' }} <span class="text-secondary-text/60">· #{{ item.user_id }}</span>
                    </p>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-4 py-3.5">
                <span :class="['inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase', getRoleBadgeClass(item.role)]">
                  <component :is="getRoleIcon(item.role)" class="h-2.5 w-2.5" />
                  {{ item.role }}
                </span>
              </td>

              <!-- Read Status -->
              <td class="px-4 py-3.5 text-right">
                <div class="inline-flex items-center justify-end gap-1.5">
                  <span
                    v-if="item.is_read"
                    class="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-bold uppercase text-emerald-400"
                  >
                    <CheckCheck class="h-3 w-3 text-emerald-400" />
                    <span>Read {{ formatDate(item.read_at) }}</span>
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 rounded-full border border-primary-border bg-background px-2.5 py-1 text-[10.5px] font-bold uppercase text-secondary-text"
                  >
                    <Check class="h-3 w-3 text-secondary-text" />
                    <span>Unread</span>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="flex items-center justify-between border-t border-primary-border bg-background/30 px-5 py-2.5">
        <span class="px-2.5 py-1 text-xs font-semibold text-secondary-text">
          {{ store.readStatusPagination.total || filteredLogs.length }} total recipients
        </span>
        <Pagination
          :pagination="store.readStatusPagination"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>