<template>
  <div class="space-y-4 py-3 min-h-[calc(100vh-100px)] flex flex-col">
    <!-- Filter & Layout Toolbar Section -->
    <div class="relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2.5 rounded-xl border border-primary-border bg-card-background/50 p-2.5 lg:flex-row lg:items-center justify-between overflow-visible"
      >
        <!-- Left: Search & Filter controls -->
        <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <!-- Search Input -->
          <div class="relative w-full sm:w-48 lg:w-56 h-9">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tag name or ID..."
              class="w-full h-full pl-8 pr-7 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Tags Filter Dropdown -->
          <BaseSelect
            v-model="store.filters.tags"
            :options="[{ label: 'All Tags', value: 'ALL' }, ...store.tags]"
            placeholder="Filter Tag"
            class="w-full sm:w-40 lg:w-44"
            searchable
            @update:modelValue="store.applyFilters()"
          />

          <!-- Sort Dropdown -->
          <BaseSelect
            v-model="store.filters.sort"
            :options="sortOptions"
            placeholder="Sort"
            class="w-full sm:w-32 lg:w-36"
            @update:modelValue="store.applyFilters()"
          />

          <!-- Date Range Picker -->
          <BaseDatePicker
            v-model="dateRangeValue"
            :range="true"
            placeholder="Filter date range..."
            class="w-full sm:w-56 lg:w-60"
          />

          <!-- Per Page Select -->
          <BaseSelect
            :modelValue="store.pagination.per_page"
            :options="perPageOptions"
            placeholder="Per Page"
            class="w-full sm:w-28"
            @update:modelValue="store.updatePerPage"
          />

          <!-- Refresh & Clear Filters -->
          <div class="flex items-center gap-1.5 h-9">
            <Tooltip text="Refresh Logs" placement="top">
              <button
                :disabled="store.isLoadingLogsList"
                @click="store.fetchLogsList(true)"
                class="w-9 h-9 flex items-center justify-center text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': store.isLoadingLogsList }"
              >
                <RefreshCcw
                  size="15"
                  :class="{ 'animate-spin': store.isLoadingLogsList }"
                />
              </button>
            </Tooltip>

            <button
              v-if="store.hasActiveFilters || searchQuery"
              @click="handleResetAll"
              class="h-9 px-3 text-xs font-semibold text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <!-- Right: Layout Switcher (Grid, List, Split View) -->
        <div
          class="flex items-center gap-1 bg-background border border-primary-border rounded-lg p-1 h-9 shrink-0 self-end lg:self-auto"
        >
          <Tooltip text="Grid Card View" placement="top">
            <button
              @click="layoutMode = 'grid'"
              class="w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer"
              :class="
                layoutMode === 'grid'
                  ? 'bg-primary text-white font-medium'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <LayoutGrid class="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip text="Table List View" placement="top">
            <button
              @click="layoutMode = 'list'"
              class="w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer"
              :class="
                layoutMode === 'list'
                  ? 'bg-primary text-white font-medium'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <List class="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip text="Split Preview View" placement="top">
            <button
              @click="layoutMode = 'split'"
              class="w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors cursor-pointer"
              :class="
                layoutMode === 'split'
                  ? 'bg-primary text-white font-medium'
                  : 'text-secondary-text hover:text-primary-text'
              "
            >
              <Columns class="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Main Content Area based on Layout Mode -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Loading Skeleton State -->
      <div
        v-if="store.isLoadingLogsList"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4"
        >
          <div class="flex items-center justify-between">
            <div class="h-4 w-36 bg-background rounded-md" />
            <div class="h-5 w-16 bg-background rounded-full" />
          </div>
          <div class="h-44 w-full bg-background/50 rounded-xl" />
          <div class="flex justify-between items-center pt-2">
            <div class="h-4 w-24 bg-background rounded-md" />
            <div class="h-8 w-20 bg-background rounded-lg" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredLogs.length === 0"
        class="flex-1 flex flex-col items-center justify-center gap-4 py-20 bg-card-background/30 border border-primary-border rounded-2xl"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text"
        >
          <Mail class="w-8 h-8" />
        </div>
        <div class="text-center max-w-sm px-4">
          <p class="text-base font-bold text-primary-text">No email logs found</p>
          <p class="text-xs text-secondary-text mt-1">
            {{
              searchQuery || store.hasActiveFilters
                ? "No email templates match your active filters or search term."
                : "No email template logs available yet."
            }}
          </p>
        </div>
        <button
          v-if="searchQuery || store.hasActiveFilters"
          @click="handleResetAll"
          class="px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Clear Filters & Search
        </button>
      </div>

      <!-- 1. GRID CARDS VIEW MODE -->
      <div
        v-else-if="layoutMode === 'grid'"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <div
          v-for="d in filteredLogs"
          :key="d.campaign_id"
          class="group bg-card-background border border-primary-border hover:border-primary/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200  hover:shadow-md"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span
                  class="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md truncate max-w-[200px]"
                  :title="d.tag"
                >
                  {{ d.tag }}
                </span>
                <span
                  class="text-[11px] text-secondary-text font-semibold px-1.5 py-0.5 bg-background rounded-md border border-primary-border shrink-0"
                >
                  #{{ d.campaign_id }}
                </span>
              </div>
              <p class="text-[11px] text-secondary-text mt-1 flex items-center gap-1">
                <Clock class="w-3 h-3 text-secondary-text" />
                <span>{{ formatDate(d.last_sent_at) }}</span>
              </p>
            </div>

            <!-- Action Menu Buttons -->
            <div class="flex items-center gap-1 shrink-0">
              <Tooltip text="Preview Template" placement="top">
                <button
                  @click="handleOpenPreviewModal(d)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text="View Logs" placement="top">
                <button
                  @click="navigateToViewDetailsPage(d.campaign_id)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          <!-- HTML Template Preview Box inside Card -->
          <div
            class="relative w-full h-48 rounded-xl border border-primary-border overflow-hidden bg-white group/preview cursor-pointer"
            @click="handleOpenPreviewModal(d)"
          >
            <RenderHTMLBody :htmlContent="d.body_html || ''" />

            <!-- Hover Overlay -->
            <div
              class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 text-white p-4"
            >
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Eye class="w-5 h-5" />
              </div>
              <span class="text-xs font-semibold">Click for Interactive Full Preview</span>
              <span class="text-[10px] text-slate-300">Desktop & Mobile Switcher Available</span>
            </div>
          </div>

          <!-- Card Footer Metrics -->
          <div
            class="mt-3 pt-3 border-t border-primary-border flex items-center justify-between text-xs"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex items-center gap-1 font-medium text-secondary-text"
                title="Total Emails Sent"
              >
                <Send class="w-3.5 h-3.5 text-green-500" />
                <strong class="text-primary-text">{{ d.total_emails }}</strong> sent
              </span>
              <span
                class="flex items-center gap-1 font-medium text-secondary-text"
                title="Total Campaigns"
              >
                <Layers class="w-3.5 h-3.5 text-blue-500" />
                <strong class="text-primary-text">{{ d.total_campaigns }}</strong> campaign
              </span>
            </div>

            <button
              @click="handleOpenPreviewModal(d)"
              class="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Preview</span>
              <Eye class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- 2. TABLE LIST VIEW MODE -->
      <div
        v-else-if="layoutMode === 'list'"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden "
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-primary-border bg-background/50 text-secondary-text font-semibold">
                <th class="p-3.5 pl-5">Template Preview</th>
                <th class="p-3.5">Tag Name</th>
                <th class="p-3.5">Campaign ID</th>
                <th class="p-3.5">Emails Sent</th>
                <th class="p-3.5">Total Campaigns</th>
                <th class="p-3.5">Last Sent Date</th>
                <th class="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border">
              <tr
                v-for="d in filteredLogs"
                :key="d.campaign_id"
                class="hover:bg-background/40 transition-colors"
              >
                <!-- Thumbnail Preview -->
                <td class="p-3 pl-5">
                  <div
                    class="w-24 h-14 rounded-lg border border-primary-border overflow-hidden bg-white relative cursor-pointer group/thumb"
                    @click="handleOpenPreviewModal(d)"
                  >
                    <RenderHTMLBody :htmlContent="d.body_html || ''" />
                    <div
                      class="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Eye class="w-4 h-4" />
                    </div>
                  </div>
                </td>

                <!-- Tag Name -->
                <td class="p-3 font-semibold text-primary-text">
                  <span class="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md">
                    {{ d.tag }}
                  </span>
                </td>

                <!-- Campaign ID -->
                <td class="p-3 font-medium text-secondary-text">
                  #{{ d.campaign_id }}
                </td>

                <!-- Emails Sent -->
                <td class="p-3">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                    <Send class="w-3 h-3" />
                    {{ d.total_emails }}
                  </span>
                </td>

                <!-- Total Campaigns -->
                <td class="p-3">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Layers class="w-3 h-3" />
                    {{ d.total_campaigns }}
                  </span>
                </td>

                <!-- Last Sent Date -->
                <td class="p-3 text-secondary-text whitespace-nowrap">
                  {{ formatDate(d.last_sent_at) }}
                </td>

                <!-- Actions -->
                <td class="p-3 text-right pr-5">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="handleOpenPreviewModal(d)"
                      class="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye class="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      @click="navigateToViewDetailsPage(d.campaign_id)"
                      class="px-3 py-1.5 text-xs font-medium text-secondary-text hover:text-primary-text bg-background border border-primary-border rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Logs</span>
                      <ChevronRight class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. SPLIT PREVIEW VIEW MODE -->
      <div
        v-else-if="layoutMode === 'split'"
        class="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[600px] max-h-[750px]"
      >
        <!-- Left Master List (4 Cols) -->
        <div
          class="lg:col-span-4 bg-card-background border border-primary-border rounded-2xl flex flex-col overflow-hidden"
        >
          <div class="p-3 border-b border-primary-border bg-background/50">
            <p class="text-xs font-semibold text-primary-text mb-2">
              Select Template ({{ filteredLogs.length }})
            </p>
            <!-- <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Filter list..."
                class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text outline-none"
              />
            </div> -->
          </div>

          <div class="flex-1 overflow-y-auto divide-y divide-primary-border">
            <div
              v-for="d in filteredLogs"
              :key="d.campaign_id"
              @click="selectedLogForSplit = d"
              class="p-3.5 cursor-pointer transition-colors flex items-center justify-between gap-2"
              :class="
                selectedLogForSplit?.campaign_id === d.campaign_id
                  ? 'bg-primary/10 border-l-4 border-l-primary'
                  : 'hover:bg-background/40'
              "
            >
              <div class="min-w-0 flex-1">
                <p
                  class="text-xs font-bold font-mono truncate"
                  :class="
                    selectedLogForSplit?.campaign_id === d.campaign_id
                      ? 'text-primary'
                      : 'text-primary-text'
                  "
                >
                  {{ d.tag }}
                </p>
                <div class="flex items-center gap-2 text-[11px] text-secondary-text mt-1">
                  <span>Campaign #{{ d.campaign_id }}</span>
                  <span>•</span>
                  <span>{{ d.total_emails }} sent</span>
                </div>
              </div>
              <ChevronRight
                class="w-4 h-4 shrink-0 transition-transform"
                :class="
                  selectedLogForSplit?.campaign_id === d.campaign_id
                    ? 'text-primary translate-x-1'
                    : 'text-secondary-text'
                "
              />
            </div>
          </div>
        </div>

        <!-- Right Live Preview Pane (8 Cols) -->
        <div
          class="lg:col-span-8 bg-card-background border border-primary-border rounded-2xl flex flex-col overflow-hidden "
        >
          <template v-if="selectedLogForSplit">
            <!-- Header Bar -->
            <div
              class="px-5 py-3 border-b border-primary-border flex flex-wrap items-center justify-between gap-3 bg-background/50"
            >
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-primary-text font-mono">
                    {{ selectedLogForSplit.tag }}
                  </h3>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    Campaign #{{ selectedLogForSplit.campaign_id }}
                  </span>
                </div>
                <p class="text-[11px] text-secondary-text mt-0.5">
                  Last sent: {{ formatDate(selectedLogForSplit.last_sent_at) }} · Total Emails: {{ selectedLogForSplit.total_emails }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="handleOpenPreviewModal(selectedLogForSplit)"
                  class="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>Full Screen Modal</span>
                </button>
                <button
                  @click="navigateToViewDetailsPage(selectedLogForSplit.campaign_id)"
                  class="px-3 py-1.5 text-xs font-semibold text-secondary-text hover:text-primary-text bg-background border border-primary-border rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View Logs</span>
                  <ChevronRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Live iframe -->
            <div class="flex-1 overflow-hidden bg-white p-2 relative">
              <RenderHTMLBody :htmlContent="selectedLogForSplit.body_html || ''" />
            </div>
          </template>

          <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center text-secondary-text">
            <Mail class="w-12 h-12 mb-2 text-secondary-text/50" />
            <p class="text-sm font-semibold">Select a template on the left to preview</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Footer -->
    <div
      v-if="store.pagination && store.pagination.total_pages > 1"
      class="pt-4 border-t border-primary-border flex items-center justify-between flex-wrap gap-3 mt-auto"
    >
      <p class="text-xs text-secondary-text">
        Showing Page <strong class="text-primary-text">{{ store.pagination.page }}</strong> of
        <strong class="text-primary-text">{{ store.pagination.total_pages }}</strong>
        (<strong class="text-primary-text">{{ store.pagination.total_items }}</strong> total tags)
      </p>

      <Pagination
        :pagination="store.pagination"
        @page-change="store.changePage"
      />
    </div>

    <!-- Interactive Template Preview Modal -->
    <EmailTemplatePreviewModal
      :open="openPreviewModal"
      :log="selectedLogForModal"
      @close="openPreviewModal = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import {
  Search,
  Mail,
  RefreshCcw,
  Eye,
  ChevronRight,
  Send,
  Layers,
  LayoutGrid,
  List,
  Columns,
  Clock,
  RotateCcw,
  X,
} from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import Pagination from "@/components/common/Pagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import RenderHTMLBody from "@/components/emails/RenderHTMLBody.vue";
import EmailTemplatePreviewModal from "@/components/emails/EmailTemplatePreviewModal.vue";
import { useRouter } from "vue-router";
import { formatDate } from "@/utils/timeFormatter";

const router = useRouter();
const store = useEmailLogsStore();

const searchQuery = ref("");
const layoutMode = ref("grid"); // 'grid' | 'list' | 'split'

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

// Preview Modal State
const openPreviewModal = ref(false);
const selectedLogForModal = ref(null);

// Split View Selected Log
const selectedLogForSplit = ref(null);

const sortOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

const perPageOptions = [
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

// Computed list filtered by search query locally
const filteredLogs = computed(() => {
  const list = store.logLists || [];
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(
    (item) =>
      item.tag?.toLowerCase().includes(q) ||
      String(item.campaign_id).includes(q)
  );
});

// Calculate total emails sum
const totalEmailsSum = computed(() => {
  const list = store.logLists || [];
  return list.reduce((sum, item) => sum + (Number(item.total_emails) || 0), 0);
});

// Calculate total campaigns sum
const totalCampaignsSum = computed(() => {
  const list = store.logLists || [];
  return list.reduce(
    (sum, item) => sum + (Number(item.total_campaigns) || 0),
    0
  );
});

// Auto-select first item for split view when logLists updates
watch(
  filteredLogs,
  (newLogs) => {
    if (newLogs && newLogs.length > 0 && !selectedLogForSplit.value) {
      selectedLogForSplit.value = newLogs[0];
    }
  },
  { immediate: true }
);

const handleOpenPreviewModal = (log) => {
  selectedLogForModal.value = log;
  openPreviewModal.value = true;
};

const handleResetAll = () => {
  searchQuery.value = "";
  store.resetFilters();
};

// Navigate to View Details Page
const navigateToViewDetailsPage = (campaignId) => {
  router.push({ name: "email-logs-details", params: { tagId: campaignId } });
};

onMounted(() => {
  store.setActiveFetcher(() => store.fetchLogsList(true));
  store.fetchLogsList();
  store.fetchTags();
});
</script>
