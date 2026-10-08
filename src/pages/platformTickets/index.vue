<template>
  <div class="px-4">

    <!-- Filters -->
    <div class="flex items-center justify-between gap-3 mb-5 relative z-10">
      <div class="flex items-center gap-2">

        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
          <input
            v-model="store.filters.search"
            type="text"
            placeholder="Search..."
            class="pl-8 pr-3 py-2 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text w-44"
            @input="onSearch"
          />
        </div>

        <BaseSelect
          v-model="store.filters.filter"
          :options="dateFilterOptions"
          placeholder="Date Range"
          class="w-36"
          @update:modelValue="store.applyFilters()"
        />
        <BaseSelect
          v-model="store.filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          class="w-36"
          @update:modelValue="store.applyFilters()"
        />
        <BaseSelect
          v-model="store.filters.priority"
          :options="priorityOptions"
          placeholder="All Priorities"
          class="w-36"
          @update:modelValue="store.applyFilters()"
        />
        <BaseSelect
          v-model="store.filters.sort"
          :options="sortOptions"
          placeholder="Sort"
          class="w-32"
          @update:modelValue="store.applyFilters()"
        />
        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per Page"
          class="w-28"
          @update:modelValue="store.updatePerPage"
        />

        <button
          v-if="hasFilters"
          class="text-xs text-secondary-text hover:text-primary-text transition-colors px-2 py-2"
          @click="store.resetFilters()"
        >
          Clear
        </button>
      </div>

      <!-- <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black text-xs font-medium transition-colors"
        @click="router.push('/tickets/create')"
      >
        <Plus class="w-3.5 h-3.5" /> New Ticket
      </button> -->
    </div>

    <!-- Table -->
    <div class="w-full border border-primary-border rounded-xl overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-primary-border">
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">#</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Subject</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Priority</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Status</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Created By</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Created</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Updated</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest p-3">Action</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.isLoading">
          <tr v-for="n in 6" :key="n" class="border-b border-primary-border animate-pulse">
            <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-40 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-5 w-14 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-5 w-14 bg-card-background rounded-full" /></td>
            <td class="p-3"><div class="h-3 w-28 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
            <td class="p-3"><div class="h-3 w-20 bg-card-background rounded" /></td>
            <td class="p-3 flex justify-end"><div class="h-7 w-14 bg-card-background rounded-lg" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.data.length === 0">
          <tr>
            <td colspan="8" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
                  <TicketIcon class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-medium text-primary-text">No tickets found</p>
                <p class="text-xs text-secondary-text">Try adjusting your filters or create a new ticket</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="ticket in store.data"
            :key="ticket.id"
            class="border-b border-primary-border last:border-none hover:bg-card-background transition-colors"
          >
            <td class="p-3 text-xs font-medium text-primary-text">{{ ticket.ticket_number }}</td>

            <td class="p-3 text-xs text-primary-text max-w-[200px] truncate">{{ ticket.subject }}</td>

            <td class="p-3">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="priorityClass(ticket.priority)">
                {{ ticket.priority }}
              </span>
            </td>

            <td class="p-3">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="statusClass(ticket.status)">
                {{ ticket.status }}
              </span>
            </td>

            <td class="p-3 text-xs text-secondary-text">
              <div class="flex flex-col">
                <span class="text-[11px] text-secondary-text mt-0.5">
                  <template v-if="ticket.created_by_email">{{ ticket.created_by_email }}</template>
                  <template v-if="ticket.created_by_role">
                    <span v-if="ticket.created_by_email"> &middot; </span>{{ ticket.created_by_role }}
                  </template>
                </span>
              </div>
            </td>
            <td class="p-3 text-xs text-secondary-text">{{ formatDate(ticket.created_at) }}</td>
            <td class="p-3 text-xs text-secondary-text">{{ formatDate(ticket.updated_at) }}</td>

            <td class="p-3 text-right">
              <button
                v-if="hasPermission('ticket.platform_view')"
                class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary-border text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors ml-auto cursor-pointer"
                @click="router.push(`/ticket/${ticket.id}`)"
              >
                <Eye class="w-3.5 h-3.5" /> View
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
        @page-change="store.changePage"
      />
    </div>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, Eye, Ticket as TicketIcon } from 'lucide-vue-next'
import { usePlatfromTicketsStore } from '@/stores/platformTickets/platformTickets'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store = usePlatfromTicketsStore()
const router = useRouter()
const { hasPermission } = usePermissionCheck()

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(), 400)
}

const dateFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Latest', value: 'latest' },
]

const statusOptions = [
  { label: 'Open',        value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved',    value: 'resolved' },
  { label: 'Closed',      value: 'closed' },
]

const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const sortOptions = [
  { label: 'Newest', value: 'desc' },
  { label: 'Oldest', value: 'asc' },
]

const hasFilters = computed(() =>
  store.filters.search || store.filters.status || store.filters.priority ||
  (store.filters.filter && store.filters.filter !== 'all') ||
  (store.filters.sort && store.filters.sort !== 'desc')
)

import { formatDate } from "@/utils/timeFormatter";

const priorityClass = (p) => ({
  high:   'bg-primary-red/20 text-primary-red border border-primary-red/30',
  medium: 'bg-primary-yellow/20 text-primary-yellow border border-primary-yellow/30',
  low:    'bg-primary-green/20 text-primary-green border border-primary-green/30',
}[p] ?? 'bg-primary-border/20 text-secondary-text border border-primary-border')

const statusClass = (s) => ({
  open:        'bg-primary-blue/20 text-primary border border-primary-blue/30',
  in_progress: 'bg-primary-yellow/20 text-primary-yellow border border-primary-yellow/30',
  resolved:    'bg-primary-green/20 text-primary-green border border-primary-green/30',
  closed:      'bg-primary-border/20 text-secondary-text border border-primary-border',
})[s] ?? 'bg-primary-border/20 text-secondary-text border border-primary-border'

onMounted(() => store.fetchTickets())
</script>
