<template>
  <div class="space-y-4 py-3 min-h-[calc(100vh-100px)] flex flex-col">
    <!-- Top Navigation & Title Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-card-background border border-primary-border rounded-xl p-3">
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- <button
          @click="goBack"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-secondary-text hover:text-primary-text bg-background border border-primary-border rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back to Email Logs</span>
        </button>

        <div class="h-4 w-px bg-primary-border hidden sm:block" /> -->

        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="text-sm font-bold text-primary-text font-mono">
            {{ store.logDetails?.tag || 'Campaign Log Details' }}
          </h2>
          <span
            v-if="store.logDetails?.campaign_id"
            class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20"
          >
            Campaign #{{ store.logDetails.campaign_id }}
          </span>
          <span
            v-if="store.logDetails?.records?.length !== undefined"
            class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-background text-secondary-text border border-primary-border"
          >
            {{ store.logDetails.pagination?.total_items || store.logDetails.records.length || 0 }} Records
          </span>
        </div>
      </div>

      <!-- Quick Action: Resend -->
      <button
        @click="handleResendData(store?.logDetails?.campaign_id)"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <Send class="w-3.5 h-3.5" />
        <span>Resend Email</span>
      </button>
    </div>

    <!-- Filter & Toolbar Section -->
    <div class="relative z-10">
      <div
        class="flex w-full min-w-0 flex-col gap-2.5 rounded-xl border border-primary-border bg-card-background/50 p-2.5 sm:flex-row sm:items-center justify-between flex-wrap"
      >
        <!-- Search & Dropdown Filters -->
        <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <!-- Email Search -->
          <div class="relative w-full sm:w-48 lg:w-56 h-9">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
            />
            <input
              v-model="store.filters.email"
              type="text"
              placeholder="Search by email..."
              class="w-full h-full pl-8 pr-7 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              @input="debounceSearch"
            />
            <button
              v-if="store.filters.email"
              @click="store.filters.email = ''; store.applyFilters()"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Event Filter -->
          <BaseSelect
            v-model="store.filters.event"
            :options="[{ label: 'All Events', value: null }, ...store.eventOptions]"
            placeholder="Events"
            class="w-full sm:w-36 lg:w-44"
            @update:modelValue="store.applyFilters()"
          />



          <!-- Action Buttons: Reset, Refresh, Sync -->
          <div class="flex items-center gap-1.5 h-9">
            <!-- Reset Filters -->
            <button
              v-if="store.hasActiveFilters"
              @click="store.resetFilters()"
              class="h-9 px-3 text-xs font-semibold text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <Tooltip text="Refresh Logs" placement="top">
              <button
                :disabled="store.isLoadingEmailLogsDetails"
                @click="store.fetchLogsDetails(route.params.tagId)"
                class="w-9 h-9 flex items-center justify-center text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors cursor-pointer"
                :class="{ 'opacity-50 cursor-not-allowed': store.isLoadingEmailLogsDetails }"
              >
                <RefreshCcw
                  size="15"
                  :class="{ 'animate-spin': store.isLoadingEmailLogsDetails }"
                />
              </button>
            </Tooltip>

            <Tooltip text="Sync External Logs" placement="top">
              <button
                :disabled="isButtonDisabled"
                @click="store.syncMail(route.params.tagId)"
                class="h-9 px-3 flex items-center gap-1.5 text-xs font-medium text-secondary-text hover:text-primary-text bg-card-background hover:bg-background rounded-lg border border-primary-border transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CloudSync size="15" :class="{ 'animate-spin': store.isSyncing }" />
                <span>Sync</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Spinner State -->
    <div
      v-if="store.isLoadingEmailLogsDetails"
      class="flex-1 min-h-[400px] flex items-center justify-center bg-card-background/40 border border-primary-border rounded-2xl p-8"
    >
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
        <span class="text-xs font-semibold text-secondary-text">Loading Campaign Logs...</span>
      </div>
    </div>

    <!-- Main Content Area: Left Template Preview + Right Log Records Table -->
    <div v-else-if="store.logDetails" class="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
      <!-- Left Column: Template Live Preview Pane (5 Cols) -->
      <div class="lg:col-span-5 bg-card-background border border-primary-border rounded-2xl flex flex-col overflow-hidden  h-[420px] sm:h-[480px] lg:h-[calc(100vh-230px)] lg:min-h-[500px]">
        <!-- Pane Header -->
        <div class="px-4 py-3 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0">
          <div class="flex items-center gap-2">
            <Mail class="w-4 h-4 text-primary" />
            <h3 class="text-xs font-bold text-primary-text">Template Preview</h3>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              @click="openPreviewModal = true"
              class="px-2.5 py-1 text-[11px] font-semibold text-primary border border-primary/30 hover:bg-primary/10 rounded-md transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>
          </div>
        </div>

        <!-- Rendered HTML Container -->
        <div class="flex-1 w-full h-full overflow-hidden bg-white relative">
          <RenderHTMLBody :htmlContent="store.logDetails?.body_html || ''" />
        </div>
      </div>

      <!-- Right Column: Recipient Logs Table Pane (7 Cols) -->
      <div class="lg:col-span-7 bg-card-background border border-primary-border rounded-2xl flex flex-col overflow-hidden  h-[450px] sm:h-[500px] lg:h-[calc(100vh-230px)] lg:min-h-[500px]">
        <!-- Pane Header -->
        <div class="px-4 py-3 border-b border-primary-border flex items-center justify-between bg-background/50 shrink-0">
          <h3 class="text-xs font-bold text-primary-text">
            Recipient Dispatch Records ({{ store.logDetails?.pagination?.total_items || store.logDetails?.records?.length || 0 }})
          </h3>
          <span class="text-[11px] text-secondary-text hidden sm:inline">
            Click eye icon for message timeline
          </span>
        </div>

        <!-- Table Container -->
        <div class="flex-1 overflow-hidden w-full flex flex-col">
          <DataTable
            class="!border-0 !rounded-none !shadow-none h-full flex-1"
            :data="store.logDetails?.records || []"
            :columns="tableColumns"
            :loading="store.isLoadingEmailLogsDetails"
            :pagination="store.pagination"
            :actions="[]"
            @page-change="store.changePage"
            @per-page-change="store.updatePerPage"
            table-key="email_log_details"
            empty-title="No dispatch records found"
            :empty-text="store.hasActiveFilters ? 'Try adjusting your active search filters.' : 'No email dispatches recorded for this campaign.'"
            :per-page-options="store.perPageOptions"
          >
            <template #cell-created_at="{ row }">
              <span class="font-medium text-primary-text whitespace-nowrap">
                {{ formatDate(row.created_at) }}
              </span>
            </template>

            <template #cell-email="{ row }">
              <span class="text-primary-text max-w-[200px] truncate font-mono text-[11px]" :title="row.email">
                {{ row.email }}
              </span>
            </template>

            <template #cell-subject="{ row }">
              <span class="text-primary-text max-w-[220px] truncate" :title="row.subject">
                {{ row.subject || '—' }}
              </span>
            </template>

            <template #cell-latest_event="{ row }">
              <span
                class="text-[11px] font-medium capitalize"
                :class="getEventTextClass(row.latest_event)"
              >
                {{ row.latest_event || '—' }}
              </span>
            </template>

            <template #cell-sync_status="{ row }">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize"
                :class="getSyncStatusClass(row.sync_status)"
              >
                {{ row.sync_status || 'Pending' }}
              </span>
            </template>

            <template #actions="{ row }">
              <Tooltip text="View Delivery Details" placement="top">
                <button
                  @click="handleOpenDialog(row.message_id || row.messageId)"
                  class="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-primary-border bg-background hover:bg-card-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                >
                  <Eye size="14" />
                </button>
              </Tooltip>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Empty State if store.logDetails is null -->
    <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center text-secondary-text bg-card-background border border-primary-border rounded-2xl">
      <Mail class="w-10 h-10 mb-2 text-secondary-text/50" />
      <p class="text-xs font-semibold">No campaign details available.</p>
    </div>

    <!-- Full Screen Template Preview Modal -->
    <EmailTemplatePreviewModal
      :open="openPreviewModal"
      :log="store.logDetails"
      @close="openPreviewModal = false"
    />

    <!-- Message Event Timeline Drawer -->
    <ViewEmailLogDetails
      :open="openDialog"
      :id="selectedLogsId"
      @close="openDialog = false"
    />

    <!-- Resend Email Drawer -->
    <ResendEmailPannel
      :open="resendData.open"
      :campegin_id="resendData.campegin_id"
      @close="handleClose"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import {
  X,
  Loader2,
  RefreshCcw,
  Search,
  Mail,
  CloudSync,
  ArrowLeft,
  Send,
  Eye,
  RotateCcw,
} from "lucide-vue-next";
import { useEmailLogsStore } from "@/stores/emails/emailLogs";
import RenderHTMLBody from "@/components/emails/RenderHTMLBody.vue";
import EmailTemplatePreviewModal from "@/components/emails/EmailTemplatePreviewModal.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import { formatDate } from "@/utils/timeFormatter";
import { useRoute, useRouter } from "vue-router";
import ViewEmailLogDetails from "@/pages/e-mails/ViewEmailLogDetails.vue";
import ResendEmailPannel from "@/components/emails/ResendEmailPannel.vue";

const tableColumns = [
  { key: 'created_at', label: 'Sent Date', sortable: false },
  { key: 'email', label: 'Recipient Email', sortable: false },
  { key: 'subject', label: 'Subject', sortable: false },
  { key: 'latest_event', label: 'Latest Event', sortable: false },
  { key: 'sync_status', label: 'Sync Status', sortable: false },
];

const route = useRoute();
const router = useRouter();
const store = useEmailLogsStore();

const openDialog = ref(false);
const openPreviewModal = ref(false);
const selectedLogsId = ref(null);
let searchTimeout;

const resendData = reactive({
  open: false,
  campegin_id: null,
});



const isButtonDisabled = computed(() => {
  return store.isSyncing;
});

const getSyncStatusClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s.includes('success') || s.includes('delivered') || s.includes('synced')) {
    return 'bg-green-500/10 text-green-500 border-green-500/20';
  }
  if (s.includes('fail') || s.includes('bounce') || s.includes('error')) {
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  }
  return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
};

const getEventTextClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s.includes('delivered') || s.includes('success')) return 'text-green-500';
  if (s.includes('bounce') || s.includes('error') || s.includes('fail') || s.includes('spam')) return 'text-red-500';
  if (s.includes('open') || s.includes('click')) return 'text-blue-500';
  return 'text-secondary-text';
};

const goBack = () => {
  router.push({ path: '/e-mails', query: { tab: 'logs' } });
};

const handleOpenDialog = (id) => {
  openDialog.value = true;
  selectedLogsId.value = id;
};

const handleResendData = (id) => {
  resendData.open = true;
  resendData.campegin_id = id;
};

const handleClose = () => {
  resendData.campegin_id = null;
  resendData.open = false;
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    store.applyFilters();
  }, 500);
};

watch(
  () => [route.params.tagId],
  async ([newId]) => {
    if (newId) {
      store.setActiveFetcher(() => store.fetchLogsDetails(newId));
      await store.fetchLogsDetails(newId);
    }
  },
  { immediate: true },
);
</script>
