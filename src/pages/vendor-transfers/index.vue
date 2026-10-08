<template>
  <div class="px-4 pb-8">
    <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5 mt-4">
      <div class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-1 xl:flex-nowrap">
        <!-- Type Filter -->
        <BaseSelect
          v-model="store.filters.type"
          :options="typeOptions"
          placeholder="All Types"
          clearable
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Status Filter -->
        <BaseSelect
          v-model="store.filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          clearable
          class="w-full sm:w-36 xl:w-36"
          @update:modelValue="store.applyFilters()"
        />

        <!-- Per Page -->
        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per page..."
          class="sm:w-2 xl:w-20"
          @update:modelValue="store.updatePerPage"
        />

        <!-- Clear -->
        <button
          v-if="hasFilters"
          class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none cursor-pointer"
          @click="store.resetFilters()"
        >
          Clear
        </button>

        <!-- Refresh -->
        <Tooltip text="Refresh" position="right">
          <button
            type="button"
            :disabled="store.loading"
            class="inline-flex items-center justify-center rounded-lg border border-primary-border p-1.5 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="store.fetchTransfers(true)"
          >
            <RefreshCw
              class="h-3.5 w-3.5"
              :class="{ 'animate-spin': store.loading }"
            />
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- Table -->
    <DataTable
      :columns="tableColumns"
      :data="store.records"
      :loading="store.loading"
      :pagination="store.pagination"
      table-key="vendor-transfers-table"
      empty-title="No Vendor Transfers Found"
      empty-text="There are no vendor transfers matching your filters."
      @page-change="handlePageChange"
      @per-page-change="store.updatePerPage"
      @row-click="handleRowClick"
    >
      <!-- Cell: Transfer ID & Date -->
      <template #cell-id="{ row }">
        <div class="space-y-1 min-w-[90px]">
          <div class="flex items-center gap-1.5">
            <span class="inline-block font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text">
              #{{ row.id }}
            </span>
          </div>
          <p class="text-[11px] text-secondary-text whitespace-nowrap">
            {{ formatDate(row.created_at) }}
          </p>
        </div>
      </template>

      <!-- Cell: Payment Request & Reference -->
      <template #cell-request_ref="{ row }">
        <div class="space-y-1 min-w-[130px] max-w-[170px]">
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-xs font-semibold text-primary-text">
              PR #{{ row.payment_request_id || row.payment_request?.id || '—' }}
            </span>
            <Tooltip text="Copy Payment Request ID" position="top">
              <button
                v-if="row.payment_request_id || row.payment_request?.id"
                type="button"
                class="p-0.5 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                @click.stop="copyText(row.payment_request_id || row.payment_request?.id, 'Payment Request ID')"
              >
                <Copy class="w-2.5 h-2.5" />
              </button>
            </Tooltip>
          </div>

          <div v-if="row.payment_request?.reference_id" class="flex items-center gap-1 font-mono text-[10px] text-secondary-text">
            <span class="truncate max-w-[110px]" :title="row.payment_request.reference_id">
              {{ row.payment_request.reference_id }}
            </span>
            <Tooltip text="Copy Reference UUID" position="top">
              <button
                type="button"
                class="p-0.5 rounded text-secondary-text hover:text-primary transition cursor-pointer shrink-0"
                @click.stop="copyText(row.payment_request.reference_id, 'Reference ID')"
              >
                <Copy class="w-2.5 h-2.5" />
              </button>
            </Tooltip>
          </div>

          <div v-if="row.payment_request?.approval_status" class="pt-0.5">
            <span
              class="text-[10px] font-medium px-1.5 py-0.2 rounded border capitalize"
              :class="approvalStatusClass(row.payment_request.approval_status)"
            >
              {{ row.payment_request.approval_status }}
            </span>
          </div>
        </div>
      </template>

      <!-- Cell: Client / User -->
      <template #cell-user="{ row }">
        <div class="space-y-0.5 min-w-[140px] max-w-[190px]">
          <div class="flex items-center gap-1.5">
            <p class="text-xs font-semibold text-primary-text truncate" :title="row.payment_request?.user_name">
              {{ row.payment_request?.user_name || '—' }}
            </p>
            <span
              v-if="row.payment_request?.user_id"
              class="text-[10px] font-mono px-1 rounded bg-background border border-primary-border/60 text-secondary-text shrink-0"
              title="User ID"
            >
              #{{ row.payment_request.user_id }}
            </span>
          </div>
          <!-- <p class="text-[11px] text-secondary-text truncate font-mono" :title="row.payment_request?.user_email">
            {{ row.payment_request?.user_email || '—' }}
          </p> -->
        </div>
      </template>

      <!-- Cell: Account / Destination -->
      <template #cell-account="{ row }">
        <div class="space-y-0.5 min-w-[120px] max-w-[160px]">
          <p v-if="row.payment_request?.trading_account_number" class="text-xs font-semibold text-primary-text font-mono">
            #{{ row.payment_request.trading_account_number }}
          </p>
          <p v-else-if="row.payment_request?.ib_wallet_id" class="text-xs font-semibold text-primary-text">
            IB Wallet #{{ row.payment_request.ib_wallet_id }}
          </p>
          <p v-else-if="row.payment_request?.fm_wallet_id" class="text-xs font-semibold text-primary-text">
            FM Wallet #{{ row.payment_request.fm_wallet_id }}
          </p>
          <p v-else class="text-xs text-secondary-text">—</p>

          <p class="text-[10px] text-secondary-text capitalize">
            {{ row.payment_request?.method || row.payment_request?.gateway || 'Bank Transfer' }}
          </p>
        </div>
      </template>

      <!-- Cell: Type -->
      <template #cell-type="{ row }">
        <span
          class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize inline-flex items-center gap-1"
          :class="
            row.payment_request?.type?.toLowerCase() === 'deposit'
              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
              : 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
          "
        >
          <ArrowDownLeft v-if="row.payment_request?.type?.toLowerCase() === 'deposit'" class="w-3 h-3" />
          <ArrowUpRight v-else class="w-3 h-3" />
          <span>{{ row.payment_request?.type || '—' }}</span>
        </span>
      </template>

      <!-- Cell: Amounts -->
      <template #cell-amounts="{ row }">
        <div v-if="row.payment_request" class="space-y-1 min-w-[110px]">
          <div class="flex items-baseline gap-1">
            <span class="text-xs font-bold text-primary-text tabular-nums">
              ${{ fmt(row.payment_request.amount) }}
            </span>
            <span class="text-[10px] text-secondary-text font-semibold uppercase">
              {{ row.payment_request.currency || 'USD' }}
            </span>
          </div>

          <div v-if="row.payment_request.paid_amount" class="flex items-center gap-1">
            <span class="text-[11px] font-semibold text-primary-green tabular-nums">
              {{ fmt(row.payment_request.paid_amount) }}
            </span>
            <span class="text-[9px] font-bold text-secondary-text uppercase">
              {{ row.payment_request.paid_currency || 'INR' }}
            </span>
          </div>
        </div>
        <span v-else class="text-xs text-secondary-text">—</span>
      </template>

      <!-- Cell: Bank Details -->
      <template #cell-bank_details="{ row }">
        <!-- Withdrawal: User Bank Account -->
        <div
          v-if="row.payment_request?.type?.toLowerCase() === 'withdrawal' && row.payment_request?.bank"
          class="space-y-0.5 min-w-[150px] max-w-[200px] text-xs"
        >
          <div class="font-semibold text-primary-text truncate" :title="row.payment_request.bank.bank">
            {{ row.payment_request.bank.bank || 'Bank' }}
            <span v-if="row.payment_request.bank.account_name" class="font-normal text-secondary-text text-[11px]">
              ({{ row.payment_request.bank.account_name }})
            </span>
          </div>
          <div class="font-mono text-[11px] text-primary-text flex items-center gap-1">
            <span>A/C: {{ row.payment_request.bank.account_number || '—' }}</span>
            <Tooltip text="Copy Account Number" position="top">
              <button
                v-if="row.payment_request.bank.account_number"
                type="button"
                class="p-0.5 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                @click.stop="copyText(row.payment_request.bank.account_number, 'Account Number')"
              >
                <Copy class="w-2.5 h-2.5" />
              </button>
            </Tooltip>
          </div>
          <div v-if="row.payment_request.bank.bank_branch_code" class="text-[10px] text-secondary-text font-mono">
            IFSC: {{ row.payment_request.bank.bank_branch_code }}
          </div>
        </div>

        <!-- Deposit: Company Bank Account -->
        <div
          v-else-if="row.payment_request?.bank?.company_bank"
          class="space-y-0.5 min-w-[150px] max-w-[200px] text-xs"
        >
          <div class="font-semibold text-primary-text truncate" :title="row.payment_request.bank.company_bank.bank_name">
            {{ row.payment_request.bank.company_bank.bank_name }}
            <span v-if="row.payment_request.bank.company_bank.account_name" class="font-normal text-secondary-text text-[11px]">
              ({{ row.payment_request.bank.company_bank.account_name }})
            </span>
          </div>
          <div class="font-mono text-[11px] text-primary-text flex items-center gap-1">
            <span>A/C: {{ row.payment_request.bank.company_bank.account_number || '—' }}</span>
            <Tooltip text="Copy Account Number" position="top">
              <button
                v-if="row.payment_request.bank.company_bank.account_number"
                type="button"
                class="p-0.5 rounded text-secondary-text hover:text-primary transition cursor-pointer"
                @click.stop="copyText(row.payment_request.bank.company_bank.account_number, 'Account Number')"
              >
                <Copy class="w-2.5 h-2.5" />
              </button>
            </Tooltip>
          </div>
          <div v-if="row.payment_request.bank.company_bank.ifsc_code" class="text-[10px] text-secondary-text font-mono">
            IFSC: {{ row.payment_request.bank.company_bank.ifsc_code }}
          </div>
        </div>

        <span v-else class="text-xs text-secondary-text">—</span>
      </template>

      <!-- Cell: Proof & UTR -->
      <template #cell-proof_utr="{ row }">
        <div class="space-y-1 min-w-[130px] max-w-[170px]">
          <!-- UTR / TxID / proof_url -->
          <div v-if="getUtrOrRef(row)" class="flex items-center gap-1 text-[11px] font-mono text-primary-text">
            <span class="truncate max-w-[110px]" :title="getUtrOrRef(row)">
              UTR: {{ getUtrOrRef(row) }}
            </span>
            <Tooltip text="Copy UTR / Reference" position="top">
              <button
                type="button"
                class="p-0.5 rounded text-secondary-text hover:text-primary transition cursor-pointer shrink-0"
                @click.stop="copyText(getUtrOrRef(row), 'UTR / Reference')"
              >
                <Copy class="w-2.5 h-2.5" />
              </button>
            </Tooltip>
          </div>

          <!-- Attachment buttons -->
          <div class="flex flex-wrap items-center gap-1 pt-0.5">
            <button
              v-if="row.proof_attachment_url"
              type="button"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-semibold transition cursor-pointer"
              @click.stop="openPreview(row.proof_attachment_url, 'Vendor Transfer Proof')"
            >
              <ImageIcon class="w-2.5 h-2.5" />
              <span>Vendor Proof</span>
            </button>

            <button
              v-if="row.payment_request?.bank?.deposit_proof_url"
              type="button"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-background hover:bg-card-background text-secondary-text hover:text-primary-text border border-primary-border text-[10px] font-semibold transition cursor-pointer"
              @click.stop="openPreview(row.payment_request.bank.deposit_proof_url, 'Deposit Slip Proof')"
            >
              <ImageIcon class="w-2.5 h-2.5" />
              <span>Deposit Slip</span>
            </button>
          </div>

          <span
            v-if="!getUtrOrRef(row) && !row.proof_attachment_url && !row.payment_request?.bank?.deposit_proof_url"
            class="text-xs text-secondary-text"
          >
            —
          </span>
        </div>
      </template>

      <!-- Cell: Status & Assignment -->
      <template #cell-status_assignment="{ row }">
        <div class="space-y-1 min-w-[120px]">
          <div>
            <span
              class="text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize inline-flex items-center gap-1 shrink-0"
              :class="statusClass(row.status)"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
              <span>{{ row.status || '—' }}</span>
            </span>
          </div>

          <div class="text-[10px] text-secondary-text space-y-0.5">
            <p v-if="row.assigned_to">
              Assigned:
              <span class="font-medium text-primary-text" :title="row.assigned_to_email">{{ row.assigned_to_name || 'Vendor' }}</span>
              <span class="font-mono font-medium text-primary-text/80 ml-1">#{{ row.assigned_to }}</span>
            </p>
            <p v-if="row.submitted_by">
              Submitted:
              <span class="font-medium text-primary-text" :title="row.submitted_by_email">{{ row.submitted_by_name || 'Admin' }}</span>
              <span class="font-mono font-medium text-primary-text/80 ml-1">#{{ row.submitted_by }}</span>
            </p>
          </div>
        </div>
      </template>

      <!-- Cell: Vendor Note -->
      <template #cell-vendor_note="{ row }">
        <div v-if="row.vendor_note" class="text-xs text-secondary-text max-w-[130px] truncate" :title="row.vendor_note">
          {{ row.vendor_note }}
        </div>
        <span v-else class="text-xs text-secondary-text">—</span>
      </template>

      <!-- Cell: Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-primary-border bg-card-background hover:bg-primary/10 hover:border-primary/30 text-primary transition cursor-pointer"
            @click.stop="handleViewClick(row)"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>View</span>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Transfer Detail Drawer -->
    <VendorTransferDetailDrawer
      :open="detailDrawerOpen"
      :transfer="selectedTransfer"
      @close="detailDrawerOpen = false"
      @preview="openPreview"
    />

    <!-- Image Preview Modal -->
    <ImagePreviewModal
      :open="previewModalOpen"
      :imageUrl="previewImageUrl"
      :title="previewImageTitle"
      @close="previewModalOpen = false"
    />
  </div>
</template>

<script setup>
import { onMounted, computed, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  RefreshCw,
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Image as ImageIcon,
} from "lucide-vue-next";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import ImagePreviewModal from "@/components/common/ImagePreviewModal.vue";
import VendorTransferDetailDrawer from "./components/VendorTransferDetailDrawer.vue";
import { useVendorTransfersStore } from "@/stores/vendorTransfers/vendorTransfers";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { formatDate } from "@/utils/timeFormatter";

const store = useVendorTransfersStore();
const snackbar = useSnackbarStore();
const router = useRouter();

// Modal & Drawer State
const previewModalOpen = ref(false);
const previewImageUrl = ref("");
const previewImageTitle = ref("Proof Document");

const detailDrawerOpen = ref(false);
const selectedTransfer = ref(null);

const openPreview = (url, title = "Proof Document") => {
  previewImageUrl.value = url;
  previewImageTitle.value = title;
  previewModalOpen.value = true;
};

const openDetailDrawer = (transfer) => {
  selectedTransfer.value = transfer;
  detailDrawerOpen.value = true;
};

const handleRowClick = ({ row }) => {
  if (row?.payment_request?.id) {
    router.push({ path: '/payment-requests', query: { id: row.payment_request.id, detail: 'true' } });
  } else {
    openDetailDrawer(row);
  }
};

const handleViewClick = (row) => {
  if (row?.payment_request?.id) {
    router.push({ path: '/payment-requests', query: { id: row.payment_request.id, detail: 'true' } });
  } else {
    openDetailDrawer(row);
  }
};

const copyText = (text, label = "Item") => {
  if (!text) return;
  navigator.clipboard.writeText(String(text));
  snackbar.show(`${label} copied to clipboard!`, "success");
};

const getUtrOrRef = (row) => {
  return row?.payment_request?.bank?.utr || row?.payment_request?.txid || row?.proof_url || null;
};

const typeOptions = [
  { label: "Deposit", value: "deposit" },
  { label: "Withdrawal", value: "withdrawal" },
];

const statusOptions = [
  { label: "Assigned", value: "assigned" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const tableColumns = [
  { key: "id", label: "ID & Date", sortable: false },
  { key: "request_ref", label: "Request & Ref", sortable: false },
  { key: "user", label: "Client", sortable: false },
  { key: "account", label: "Account", sortable: false },
  { key: "type", label: "Type", sortable: false },
  { key: "amounts", label: "Amounts", sortable: false },
  { key: "bank_details", label: "Bank Details", sortable: false },
  { key: "proof_utr", label: "Proof & UTR", sortable: false },
  { key: "status_assignment", label: "Status & Admin", sortable: false },
  { key: "vendor_note", label: "Note", sortable: false },
  { key: "actions", label: "Actions", sortable: false },
];

const hasFilters = computed(() => {
  return store.filters.type || store.filters.status;
});

const fmt = (num, dec = 2) => {
  if (num === null || num === undefined || isNaN(Number(num))) return "0.00";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
};

const statusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "bg-primary-green/10 text-primary-green border-primary-green/20";
  if (s === "cancelled") return "bg-primary-red/10 text-primary-red border-primary-red/20";
  if (s === "assigned") return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  return "bg-background border border-primary-border text-secondary-text";
};

const approvalStatusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-primary-green/10 text-primary-green border-primary-green/20";
  if (s === "rejected") return "bg-primary-red/10 text-primary-red border-primary-red/20";
  if (s === "pending") return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  return "bg-background border border-primary-border text-secondary-text";
};

const handlePageChange = (page) => {
  store.setPage(page);
};

onMounted(() => {
  if (!store.isFetched) {
    store.fetchTransfers();
  }
});
</script>
