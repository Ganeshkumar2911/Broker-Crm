<template>
  <div class="space-y-4 py-3 min-h-[calc(100vh-100px)] flex flex-col">
    <!-- Filter & Toolbar Bar -->
    <div class="relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2.5 rounded-xl border border-primary-border bg-card-background/50 p-2.5 sm:flex-row sm:items-center justify-between overflow-visible"
      >
        <!-- Left: Filter Controls -->
        <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <!-- Email Search Dropdown (/client-list API) -->
          <BaseSelect
            v-model="store.filters.email"
            :options="[
              { label: 'All Emails', value: null },
              ...store.clientEmails,
            ]"
            placeholder="Filter Email"
            class="w-full sm:w-52 lg:w-60"
            searchable
            :isLoading="store.isLoadingClientEmails"
            @search="handleSearchClientEmails"
            @update:modelValue="store.applyFilters()"
          />

          <!-- Event Filter Dropdown (All 14 Brevo Events) -->
          <BaseSelect
            v-model="store.filters.event"
            :options="[
              { label: 'All Events', value: null },
              ...store.eventOptions,
            ]"
            placeholder="Filter Event"
            class="w-full sm:w-44 lg:w-48"
            searchable
            @update:modelValue="store.applyFilters()"
          />

          <!-- Tag Filter Dropdown (/email-templates API using 'code' property) -->
          <BaseSelect
            v-model="store.filters.tags"
            :options="[
              { label: 'All Tags', value: 'ALL' },
              ...store.templateTags,
            ]"
            placeholder="Filter Tag"
            class="w-full sm:w-56 lg:w-64"
            searchable
            :isLoading="store.isLoadingTemplateTags"
            @update:modelValue="store.applyFilters()"
          />

          <!-- Date Range Picker -->
          <BaseDatePicker
            v-model="dateRangeValue"
            :range="true"
            placeholder="Filter date range..."
            class="w-full sm:w-56 lg:w-60"
          />

          <!-- Sort Dropdown -->
          <BaseSelect
            v-model="store.filters.sort"
            :options="sortOptions"
            placeholder="Sort"
            class="w-full sm:w-32 lg:w-36"
            @update:modelValue="store.applyFilters()"
          />

          <!-- Refresh & Reset Action Buttons -->
          <div class="flex items-center gap-1.5 h-9">
            <Tooltip text="Refresh Logs" placement="top">
              <button
                :disabled="store.loading"
                @click="store.fetchLogs(true)"
                class="w-9 h-9 flex items-center justify-center text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': store.loading }"
              >
                <RefreshCcw
                  size="15"
                  :class="{ 'animate-spin': store.loading }"
                />
              </button>
            </Tooltip>

            <button
              v-if="store.hasActiveFilters"
              @click="store.resetFilters()"
              class="h-9 px-3 text-xs font-semibold text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Filters Pills Bar -->
    <div
      v-if="store.hasActiveFilters"
      class="flex items-center gap-2 flex-wrap text-xs px-1"
    >
      <span class="text-secondary-text font-medium text-[11px]">Active Filters:</span>
      
      <span
        v-if="store.filters.email"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px]"
      >
        Email: {{ store.filters.email }}
        <X class="w-3 h-3 cursor-pointer hover:opacity-80" @click="handleClearEmail" />
      </span>

      <span
        v-if="store.filters.event"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px] capitalize"
      >
        Event: {{ store.filters.event }}
        <X class="w-3 h-3 cursor-pointer hover:opacity-80" @click="store.filters.event = null; store.applyFilters()" />
      </span>

      <span
        v-if="store.filters.tags && store.filters.tags !== 'ALL'"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px]"
      >
        Tag: {{ store.filters.tags }}
        <X class="w-3 h-3 cursor-pointer hover:opacity-80" @click="store.filters.tags = 'ALL'; store.applyFilters()" />
      </span>

      <span
        v-if="store.filters.startDate || store.filters.endDate"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px]"
      >
        Date: {{ store.filters.startDate || 'Any' }} to {{ store.filters.endDate || 'Any' }}
        <X
          class="w-3 h-3 cursor-pointer hover:opacity-80"
          @click="store.filters.startDate = null; store.filters.endDate = null; store.applyFilters()"
        />
      </span>
    </div>

    <!-- Logs Table -->
    <DataTable
      :columns="columns"
      :data="store.logs"
      :loading="store.loading"
      :pagination="store.pagination"
      :per-page-options="[10, 25, 50, 100]"
      empty-title="No Brevo email logs found"
      :empty-text="store.hasActiveFilters ? 'No records matched your current filter criteria. Try adjusting or clearing your filters.' : 'Logs from Brevo dispatch will appear here.'"
      @page-change="store.changePage"
      @per-page-change="(payload) => store.updatePerPage(payload.per_page)"
    >
      <template #empty v-if="store.hasActiveFilters">
        <div class="flex flex-col items-center justify-center gap-3 py-8">
          <div class="w-12 h-12 rounded-full bg-background border border-primary-border flex items-center justify-center text-secondary-text shadow-xs">
            <Mail class="w-6 h-6 stroke-[1.5]" />
          </div>
          <p class="text-sm font-semibold text-primary-text">No Brevo email logs found</p>
          <p class="text-xs text-secondary-text max-w-sm text-center">
            No records matched your current filter criteria. Try adjusting or clearing your filters.
          </p>
          <button
            @click="store.resetFilters()"
            class="mt-1 px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </template>

      <!-- Cell Slots -->
      <template #cell-date="{ row }">
        <span class="font-medium whitespace-nowrap">
          {{ formatDate(row.date || row.created_at || row.timestamp) }}
        </span>
      </template>

      <template #cell-event="{ row }">
        <span
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize"
          :class="eventClass(row.event)"
        >
          {{ formatEventName(row.event) }}
        </span>
      </template>

      <template #cell-subject="{ row }">
        <div class="max-w-55 truncate" :title="row.subject || '—'">
          {{ row.subject || "—" }}
        </div>
      </template>

      <template #cell-sender="{ row }">
        <div class="max-w-45 truncate text-secondary-text" :title="row.from || row.sender || '—'">
          {{ row.from || row.sender || "—" }}
        </div>
      </template>

      <template #cell-recipient="{ row }">
        <div class="font-mono max-w-50 truncate" :title="row.email || row.recipient || '—'">
          {{ row.email || row.recipient || "—" }}
        </div>
      </template>

      <template #cell-tag="{ row }">
        <span
          v-if="row.tag || row.tags"
          class="px-2 py-0.5 rounded text-[11px] font-mono bg-background border border-primary-border text-secondary-text"
        >
          {{ row.tag || row.tags }}
        </span>
        <span v-else class="text-secondary-text/60">—</span>
      </template>

      <template #cell-actions="{ row }">
        <Tooltip text="View Details" placement="top">
          <button
            @click="handleViewLog(row.messageId || row.id)"
            class="cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors"
          >
            <Eye class="w-4 h-4" />
          </button>
        </Tooltip>
      </template>
    </DataTable>

    <!-- Log Details Slide-over Modal -->
    <ViewEmailLogDetails
      v-if="openDialog"
      :open="openDialog"
      :id="selectedLogId"
      @close="handleCloseDialog"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
  Search,
  Mail,
  RefreshCcw,
  Eye,
  RotateCcw,
  X,
  Tag,
} from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import ViewEmailLogDetails from "@/pages/e-mails/ViewEmailLogDetails.vue";

const store = useEmailLogsStore();
const openDialog = ref(false);
const selectedLogId = ref(null);

let searchTimeout = null;

const dateRangeValue = computed({
  get() {
    if (store.filters.startDate || store.filters.endDate) {
      return {
        start: store.filters.startDate || null,
        end: store.filters.endDate || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      store.filters.startDate = null;
      store.filters.endDate = null;
    } else if (Array.isArray(val)) {
      store.filters.startDate = val[0] || null;
      store.filters.endDate = val[1] || null;
    } else if (typeof val === "object") {
      store.filters.startDate = val.start || val.from || null;
      store.filters.endDate = val.end || val.to || null;
    }
    store.applyFilters();
  },
});

const sortOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

const columns = [
  { key: "date", label: "Date & Time", width: "160px" },
  { key: "event", label: "Event Status", width: "140px" },
  { key: "subject", label: "Subject", minWidth: "200px" },
  { key: "sender", label: "Sender", width: "160px" },
  { key: "recipient", label: "Recipient Email", width: "180px" },
  { key: "tag", label: "Tag / Campaign", width: "140px" },
  { key: "actions", label: "Action", width: "80px", sortable: false, align: "center" },
];

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    store.applyFilters();
  }, 400);
};

const handleClearEmail = () => {
  store.filters.email = "";
  store.applyFilters();
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatEventName = (evt) => {
  if (!evt) return "—";
  const names = {
    hardBounces: "Hard Bounce",
    softBounces: "Soft Bounce",
    loadedByProxy: "Loaded By Proxy",
  };
  return names[evt] || String(evt);
};

const eventClass = (event) => {
  const e = String(event || "").toLowerCase();
  if (e === "delivered") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (e === "opened") {
    return "bg-sky-500/10 text-sky-400 border-sky-500/20";
  }
  if (e === "clicks") {
    return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  }
  if (e === "requests") {
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
  }
  if (e === "deferred") {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
  if (e.includes("bounce")) {
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  }
  if (e === "spam") {
    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  }
  if (e === "blocked" || e === "error" || e === "invalid") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  if (e === "unsubscribed") {
    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
  if (e === "loadedbyproxy") {
    return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  }
  return "bg-primary-border/20 text-secondary-text border-primary-border";
};

const handleViewLog = (messageId) => {
  if (!messageId) return;
  selectedLogId.value = messageId;
  openDialog.value = true;
};

const handleCloseDialog = () => {
  openDialog.value = false;
  selectedLogId.value = null;
  store.resetLogDetails();
};

let clientSearchTimeout = null;
const handleSearchClientEmails = (query) => {
  clearTimeout(clientSearchTimeout);
  clientSearchTimeout = setTimeout(() => {
    store.fetchClientEmails(query);
  }, 350);
};

onMounted(() => {
  store.setActiveFetcher(() => store.fetchLogs(true));
  store.fetchLogs(true);
  store.fetchTemplateTags();
  store.fetchClientEmails();
});
</script>
