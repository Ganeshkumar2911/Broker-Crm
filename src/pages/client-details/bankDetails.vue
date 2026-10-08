<template>
  <div class="space-y-4 pt-2 pb-12 overflow-y-auto no-scrollbar">
    <!-- ─── SKELETON SHIMMER LOADER ─────────────────────────────────────── -->
    <div
      v-if="loading && (!bankAccounts || bankAccounts.length === 0)"
      class="rounded-2xl border border-primary-border bg-card-background/60 overflow-hidden shadow-2xs p-4 space-y-3 animate-pulse"
    >
      <div class="h-10 bg-primary-border/30 rounded-xl w-full mb-3" />
      <div v-for="n in 4" :key="n" class="h-14 bg-primary-border/20 rounded-xl w-full" />
    </div>

    <!-- ─── ERROR STATE ────────────────────────────────────────────────── -->
    <div
      v-else-if="error"
      class="p-6 rounded-2xl border border-primary-red/30 bg-primary-red/5 flex flex-col items-center justify-center text-center space-y-3"
    >
      <div class="w-12 h-12 rounded-2xl bg-primary-red/10 border border-primary-red/20 flex items-center justify-center text-primary-red">
        <HugeIcon :icon="Alert02Icon" :size="24" />
      </div>
      <div>
        <h4 class="text-sm font-bold text-primary-text">Failed to Load Bank Details</h4>
        <p class="text-xs text-secondary-text mt-1 max-w-md">
          {{ error }}
        </p>
      </div>
      <button
        type="button"
        @click="fetchBankAccounts(true)"
        class="btn-primary"
      >
        Try Again
      </button>
    </div>

    <!-- ─── MAIN CONTENT ───────────────────────────────────────────────── -->
    <div v-else class="space-y-4">
      <!-- ── Top Summary & Action Bar ── -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <!-- Metric Chips -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Total -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-primary-border">
            <span class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">Total:</span>
            <span class="text-xs font-extrabold text-primary-text">{{ totalCount }}</span>
          </div>

          <!-- Pending -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-yellow/10 border border-primary-yellow/20">
            <span class="text-[11px] font-semibold text-primary-yellow uppercase tracking-wider">Pending:</span>
            <span class="text-xs font-extrabold text-primary-yellow">{{ pendingCount }}</span>
          </div>

          <!-- Approved -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-green/10 border border-primary-green/20">
            <span class="text-[11px] font-semibold text-primary-green uppercase tracking-wider">Approved:</span>
            <span class="text-xs font-extrabold text-primary-green">{{ approvedCount }}</span>
          </div>

          <!-- Rejected -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-red/10 border border-primary-red/20">
            <span class="text-[11px] font-semibold text-primary-red uppercase tracking-wider">Rejected:</span>
            <span class="text-xs font-extrabold text-primary-red">{{ rejectedCount }}</span>
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            class="btn-primary"
            :disabled="loading || bankRequestStore.actionLoading"
            @click="fetchBankAccounts(true)"
            title="Refresh bank details"
          >
            <HugeIcon :icon="RefreshCwIcon" :size="14" :class="{ 'animate-spin': loading }" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- ── Empty State ── -->
      <div
        v-if="!bankAccounts || bankAccounts.length === 0"
        class="bg-card-background/40 border border-primary-border rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[260px] space-y-3 shadow-xs"
      >
        <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <HugeIcon :icon="Building02Icon" :size="28" />
        </div>
        <div class="space-y-1">
          <h4 class="text-base font-bold text-primary-text">
            No Bank Accounts Saved
          </h4>
          <p class="text-xs text-secondary-text max-w-sm">
            This client has not added or submitted any bank accounts yet.
          </p>
        </div>
      </div>

      <!-- ── Data Table View (Unified Common DataTable Component) ── -->
      <div
        v-else
        class="rounded-2xl border border-primary-border bg-card-background overflow-hidden shadow-xs"
      >
        <DataTable
          :columns="tableColumns"
          :data="bankAccounts"
          :loading="loading"
        >
          <!-- # ID Column -->
          <template #cell-id="{ row }">
            <span class="font-mono font-bold text-primary-text">
              #{{ row.id }}
            </span>
          </template>

          <!-- Bank Name & Branch Column -->
          <template #cell-bank="{ row }">
            <div class="flex flex-col min-w-[140px]">
              <div class="font-bold text-primary-text flex items-center gap-1.5">
                <HugeIcon :icon="Building02Icon" :size="15" class="text-primary shrink-0" />
                <span>{{ row.bank || '—' }}</span>
              </div>
              <div v-if="row.label || row.bank_branch || row.bank_code" class="text-[11px] text-secondary-text flex items-center gap-1 mt-0.5 flex-wrap">
                <span v-if="row.label" class="font-semibold text-primary/90">{{ row.label }}</span>
                <span v-if="row.label && (row.bank_branch || row.bank_code)">•</span>
                <span v-if="row.bank_branch">{{ row.bank_branch }}</span>
                <span v-if="row.bank_code" class="font-mono text-[10px] opacity-75">({{ row.bank_code }})</span>
              </div>
            </div>
          </template>

          <!-- Account Holder Column -->
          <template #cell-account_name="{ row }">
            <span class="font-bold text-primary-text text-xs sm:text-sm">
              {{ row.account_name || '—' }}
            </span>
          </template>

          <!-- Account Number Column with Copy -->
          <template #cell-account_number="{ row }">
            <div class="flex items-center gap-1.5 font-mono font-bold text-primary-text min-w-[130px]">
              <span>{{ row.account_number || '—' }}</span>
              <button
                v-if="row.account_number"
                type="button"
                @click="copyText(row.account_number, 'Account Number')"
                class="btn-icon p-1"
                title="Copy Account Number"
              >
                <HugeIcon :icon="Copy01Icon" :size="13" />
              </button>
            </div>
          </template>

          <!-- Account Type Badge Column -->
          <template #cell-account_type="{ row }">
            <span
              class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border"
              :class="getAccountTypeBadgeClass(row.account_type)"
            >
              {{ row.account_type || 'SAVINGS' }}
            </span>
          </template>

          <!-- IFSC / Branch Code Column with Copy -->
          <template #cell-bank_branch_code="{ row }">
            <div class="flex items-center gap-1.5 font-mono font-bold text-primary-text uppercase min-w-[120px]">
              <span>{{ row.bank_branch_code || '—' }}</span>
              <button
                v-if="row.bank_branch_code"
                type="button"
                @click="copyText(row.bank_branch_code, 'IFSC Code')"
                class="btn-icon p-1"
                title="Copy IFSC Code"
              >
                <HugeIcon :icon="Copy01Icon" :size="13" />
              </button>
            </div>
          </template>

          <!-- Proof Document Button Column -->
          <template #cell-document_proof="{ row }">
            <div v-if="row.document_proof_url || row.document_proof" class="inline-flex items-center justify-center">
              <button
                type="button"
                @click="previewDocument(row)"
                class="btn-secondary px-2.5 py-1 text-xs"
                title="Verify document proof attachment"
              >
                <HugeIcon :icon="FileAttachmentIcon" :size="13" class="text-primary" />
                <span>Verify Proof</span>
              </button>
            </div>
            <span v-else class="text-secondary-text text-xs italic">—</span>
          </template>

          <!-- Approval Status Badge & Rejection Reason Column -->
          <template #cell-approval_status="{ row }">
            <div class="flex flex-col gap-1 items-center">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border inline-flex items-center gap-1"
                :class="getStatusClass(row.approval_status)"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>{{ row.approval_status || 'Pending' }}</span>
              </span>
              <p
                v-if="String(row.approval_status).toLowerCase() === 'rejected' && row.rejection_reason"
                class="text-[10px] text-primary-red truncate max-w-[160px]"
                :title="row.rejection_reason"
              >
                {{ row.rejection_reason }}
              </p>
            </div>
          </template>

          <!-- Edit Lock Toggle Button Column -->
          <template #cell-flag_enable_edit="{ row }">
            <div class="inline-flex items-center justify-center">
              <button
                v-if="hasPermission('user_bank_account.enable_edit')"
                type="button"
                @click="handleToggleEditLock(row)"
                :disabled="bankRequestStore.actionLoading"
                :class="row.flag_enable_edit ? 'btn-warning px-2.5 py-1 text-[11px]' : 'btn-secondary px-2.5 py-1 text-[11px]'"
                :title="row.flag_enable_edit ? 'Edit unlocked by client. Click to lock.' : 'Edit locked. Click to allow client editing.'"
              >
                <HugeIcon :icon="row.flag_enable_edit ? PencilEdit01Icon : LockPasswordIcon" :size="12" />
                <span>{{ row.flag_enable_edit ? 'Unlocked' : 'Locked' }}</span>
              </button>
              <span
                v-else
                class="text-[11px] font-medium"
                :class="row.flag_enable_edit ? 'text-primary-yellow' : 'text-secondary-text'"
              >
                {{ row.flag_enable_edit ? 'Unlocked' : 'Locked' }}
              </span>
            </div>
          </template>

          <!-- Default Badge Column -->
          <template #cell-is_default="{ row }">
            <span
              v-if="row.is_default"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 inline-flex items-center gap-1"
            >
              <Star class="w-2.5 h-2.5 fill-primary text-primary" />
              <span>Default</span>
            </span>
            <span v-else class="text-secondary-text text-[11px]">—</span>
          </template>

          <!-- Created Date Column -->
          <template #cell-created_at="{ row }">
            <span class="text-secondary-text text-[11px] whitespace-nowrap">
              {{ formatTimestamp(row.created_at) }}
            </span>
          </template>

          <!-- Actions Column (Approve / Reject) -->
          <template #cell-actions="{ row }">
            <div class="flex items-center justify-end gap-1.5 whitespace-nowrap">
              <!-- Approve Button -->
              <button
                v-if="String(row.approval_status || '').toLowerCase() === 'pending' && hasPermission('user_bank_account.approve')"
                type="button"
                @click="openApproveDialog(row)"
                :disabled="bankRequestStore.actionLoading"
                class="btn-success px-2.5 py-1"
                title="Approve Bank Account"
              >
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="13" />
                <span>Approve</span>
              </button>

              <!-- Reject Button -->
              <button
                v-if="String(row.approval_status || '').toLowerCase() === 'pending' && hasPermission('user_bank_account.reject')"
                type="button"
                @click="openRejectModal(row)"
                :disabled="bankRequestStore.actionLoading"
                class="btn-danger px-2.5 py-1"
                title="Reject Bank Account"
              >
                <HugeIcon :icon="Cancel01Icon" :size="13" />
                <span>Reject</span>
              </button>

              <!-- If not pending and no actions available -->
              <span
                v-if="String(row.approval_status || '').toLowerCase() !== 'pending'"
                class="text-[11px] text-secondary-text italic"
              >
                Completed
              </span>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- ─── REJECT REASON MODAL ────────────────────────────────────────── -->
    <RejectReasonModal
      :open="showRejectModal"
      :account="selectedAccount"
      :loading="bankRequestStore.actionLoading"
      @close="showRejectModal = false"
      @submit="handleRejectSubmit"
    />

    <!-- ─── PROOF DOCUMENT LIGHTBOX MODAL ─────────────────────────────── -->
    <ProofDocumentModal
      :open="showProofModal"
      :account="selectedAccount"
      @close="showProofModal = false"
    />

    <!-- ─── APPROVAL CONFIRMATION DIALOG ──────────────────────────────── -->
    <ConfirmationDialog
      :open="showApproveDialog"
      title="Approve Bank Account"
      :message="`Are you sure you want to approve bank account ${selectedAccount?.bank} (${selectedAccount?.account_number}) for ${selectedAccount?.account_name || 'Client #' + selectedAccount?.user_id}?`"
      confirm-text="Approve Account"
      type="success"
      :loading="bankRequestStore.actionLoading"
      @confirm="handleConfirmApprove"
      @cancel="showApproveDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import {
  Building02Icon,
  RefreshCwIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Alert02Icon,
  FileAttachmentIcon,
  LockPasswordIcon,
  PencilEdit01Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { Star } from "lucide-vue-next";

import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useBankRequestStore } from "@/stores/bankRequest/bankRequest";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

import DataTable from "@/components/common/DataTable/DataTable.vue";
import ProofDocumentModal from "@/pages/bankrequest/components/ProofDocumentModal.vue";
import RejectReasonModal from "@/pages/bankrequest/components/RejectReasonModal.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";

import moment from "moment-timezone";

const route = useRoute();
const snackbar = useSnackbarStore();
const bankRequestStore = useBankRequestStore();
const { hasPermission } = usePermissionCheck();

const bankAccounts = ref([]);
const rawResponse = ref(null);
const loading = ref(false);
const error = ref(null);

// Modal state
const showRejectModal = ref(false);
const showProofModal = ref(false);
const showApproveDialog = ref(false);
const selectedAccount = ref(null);

// ─── Table Columns Definition ────────────────────────
const tableColumns = [
  { key: "id", label: "# ID", sortable: true },
  { key: "bank", label: "Bank Name & Branch", sortable: true },
  { key: "account_name", label: "Account Holder", sortable: true },
  { key: "account_number", label: "Account Number", sortable: true },
  { key: "account_type", label: "Type", sortable: true },
  { key: "bank_branch_code", label: "IFSC / Branch Code", sortable: true },
  { key: "document_proof", label: "Proof", headerClass: "text-center", cellClass: "text-center" },
  { key: "approval_status", label: "Approval Status", headerClass: "text-center", cellClass: "text-center", sortable: true },
  { key: "flag_enable_edit", label: "Edit Lock", headerClass: "text-center", cellClass: "text-center" },
  { key: "is_default", label: "Default", headerClass: "text-center", cellClass: "text-center" },
  { key: "created_at", label: "Created Date", sortable: true },
  { key: "actions", label: "Actions", headerClass: "text-right", cellClass: "text-right" },
];

// ─── Metrics Counts ──────────────────────────────────
const totalCount = computed(() => bankAccounts.value.length);
const pendingCount = computed(
  () =>
    bankAccounts.value.filter(
      (a) => String(a.approval_status || "").toLowerCase() === "pending"
    ).length
);
const approvedCount = computed(
  () =>
    bankAccounts.value.filter(
      (a) => String(a.approval_status || "").toLowerCase() === "approved"
    ).length
);
const rejectedCount = computed(
  () =>
    bankAccounts.value.filter(
      (a) => String(a.approval_status || "").toLowerCase() === "rejected"
    ).length
);

// ─── Formatters & Styling Helpers ────────────────────
const formatTimestamp = (ts) => {
  if (!ts) return "—";
  try {
    const m = moment.utc(ts);
    if (!m.isValid()) return String(ts);
    const tz = moment.tz.guess();
    return m.tz(tz).format("DD MMM YYYY, hh:mm A");
  } catch {
    return String(ts);
  }
};

const copyText = (text, label = "Value") => {
  if (!text) return;
  navigator.clipboard.writeText(String(text));
  snackbar.show(`${label} copied to clipboard!`, "success");
};

const getStatusClass = (status) => {
  const s = String(status || "").toLowerCase();
  switch (s) {
    case "approved":
      return "bg-primary-green/10 text-primary-green border-primary-green/20";
    case "rejected":
      return "bg-primary-red/10 text-primary-red border-primary-red/20";
    case "pending":
    default:
      return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  }
};

const getAccountTypeBadgeClass = (type) => {
  const t = String(type || "").toUpperCase();
  switch (t) {
    case "SAVINGS":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "CURRENT":
      return "bg-primary-blue/10 text-primary-blue border-primary-blue/20";
    case "CHECKING":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-background text-secondary-text border-primary-border";
  }
};

// ─── Modals Trigger Helpers ──────────────────────────
const previewDocument = (account) => {
  selectedAccount.value = account;
  showProofModal.value = true;
};

const openApproveDialog = (account) => {
  selectedAccount.value = account;
  showApproveDialog.value = true;
};

const openRejectModal = (account) => {
  selectedAccount.value = account;
  showRejectModal.value = true;
};

// ─── Action Handlers ─────────────────────────────────
const handleConfirmApprove = () => {
  if (!selectedAccount.value) return;
  bankRequestStore.approveBankAccount(selectedAccount.value.id, () => {
    showApproveDialog.value = false;
    selectedAccount.value = null;
    fetchBankAccounts(true);
  });
};

const handleRejectSubmit = (reason) => {
  if (!selectedAccount.value) return;
  bankRequestStore.rejectBankAccount(selectedAccount.value.id, reason, () => {
    showRejectModal.value = false;
    selectedAccount.value = null;
    fetchBankAccounts(true);
  });
};

const handleToggleEditLock = (account) => {
  const userId = route.params.id || account.user_id;
  const nextFlag = !account.flag_enable_edit;
  bankRequestStore.toggleEnableEdit(userId, account.id, nextFlag, () => {
    fetchBankAccounts(true);
  });
};

// ─── API Fetch (GET Client Bank Accounts) ─────────────
const fetchBankAccounts = (force = false) => {
  const userId = route.params.id;
  if (!userId) return;

  loading.value = true;
  error.value = null;

  apiRequest(urls.KEYS.GET, urls.clientDepth.bankAccounts || "/users/bank-accounts", {
    look_up_key: userId,
    isTokenRequired: true,
    onSuccess: (res) => {
      rawResponse.value = res;

      const extracted =
        res?.data?.accounts ||
        res?.data?.bank_accounts ||
        res?.data ||
        res?.accounts ||
        res?.bank_accounts ||
        (Array.isArray(res) ? res : []);

      bankAccounts.value = Array.isArray(extracted)
        ? extracted
        : typeof extracted === "object" && extracted !== null
        ? [extracted]
        : [];

      loading.value = false;
      if (force) {
        snackbar.show("Bank details refreshed successfully!", "success");
      }
    },
    onFailure: (err) => {
      loading.value = false;
      error.value =
        err?.message || err?.error || "Failed to fetch client bank accounts.";
      if (force) {
        snackbar.show(error.value, "error");
      }
    },
  });
};

const handleRefreshEvent = (e) => {
  if (e?.detail?.tab === "bank-details") {
    fetchBankAccounts(true);
  }
};

onMounted(() => {
  fetchBankAccounts();
  window.addEventListener("refresh-client-tab-data", handleRefreshEvent);
});

onUnmounted(() => {
  window.removeEventListener("refresh-client-tab-data", handleRefreshEvent);
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchBankAccounts();
    }
  }
);
</script>
