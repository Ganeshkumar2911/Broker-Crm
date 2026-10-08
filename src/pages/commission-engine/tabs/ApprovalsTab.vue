<template>
  <div class="space-y-5">
    <!-- Top Configuration Header & Frequency / Period Selector -->
    <div class="p-5 rounded-2xl bg-card-background border border-primary-border space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <!-- Title & Context -->
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-base font-bold text-primary-text tracking-tight">
              Draft Commission Workflow &amp; Approvals
            </h2>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold font-mono uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              PERIOD BATCH WORKFLOW
            </span>
          </div>
          <p class="text-xs text-secondary-text mt-0.5">
            Review and batch-approve pending IB commissions grouped by settlement period and frequency.
          </p>
        </div>

        <!-- Frequency Segmented Buttons -->
        <div class="flex items-center gap-2 self-start lg:self-center flex-wrap">
          <label class="text-xs font-bold uppercase tracking-wider text-secondary-text">
            Frequency:
          </label>
          <div class="inline-flex p-1 rounded-lg bg-background border border-primary-border ">
            <button
              v-for="freq in frequencies"
              :key="freq.value"
              type="button"
              class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              :class="[
                activeFrequency === freq.value
                  ? 'bg-primary text-white  font-bold'
                  : 'text-secondary-text hover:text-primary-text hover:bg-card-background/60',
              ]"
              @click="handleFrequencyChange(freq.value)"
            >
              {{ freq.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Controls Row: Period Picker, Secondary Filters & Refresh -->
      <div class="pt-3.5 border-t border-primary-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5 flex-1">
          <!-- Period Selector -->
          <div class="w-full sm:w-56 md:w-60">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-1">
              Select Period
            </label>
            <BaseSelect
              v-model="selectedPeriodKey"
              :options="periodSelectOptions"
              :is-loading="store.approvalPeriodsLoading"
              placeholder="Select period..."
              variant="surface"
              @update:model-value="handlePeriodChange"
            />
          </div>

          <!-- Wallet Target Filter -->
          <div class="w-36 sm:w-40">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-1">
              Wallet Target
            </label>
            <BaseSelect
              v-model="filterWalletTarget"
              :options="walletTargetOptions"
              placeholder="All Wallets"
              variant="surface"
              @update:model-value="handleFilterChange"
            />
          </div>

          <!-- Payout Mode Filter -->
          <div class="w-44 sm:w-48">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-1">
              Payout Mode
            </label>
            <BaseSelect
              v-model="filterPayoutMode"
              :options="payoutModeOptions"
              placeholder="All Modes"
              variant="surface"
              @update:model-value="handleFilterChange"
            />
          </div>

          <!-- Single IB Filter -->
          <div class="w-full sm:w-52 md:w-56">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-1">
              Filter by IB
            </label>
            <BaseSelect
              v-model="filterIbId"
              :options="store.ibSearchOptions"
              :is-loading="store.searchLoading"
              placeholder="All IBs..."
              searchable
              variant="surface"
              @search="onIbSearch"
              @update:model-value="handleFilterChange"
            />
          </div>

          <!-- Clear Filters -->
          <div v-if="hasActiveFilters" class="flex items-end self-end pb-1">
            <button
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-secondary-text hover:text-primary-red hover:bg-primary-red/5 rounded-lg transition-colors cursor-pointer"
              title="Clear active filters"
              @click="handleResetFilters"
            >
              <HugeIcon :icon="Cancel01Icon" :size="13" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <!-- Action / Reload Button -->
        <div class="flex items-end self-end sm:self-auto pb-0.5">
          <Tooltip text="Reload Approvals" position="center">
            <button
              type="button"
              :disabled="store.approvalsLoading || store.approvalPeriodsLoading"
              class="flex items-center justify-center w-9 h-9 text-secondary-text hover:text-primary-text bg-background hover:bg-card-background border border-primary-border rounded-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
              @click="loadApprovalsSummary(true)"
            >
              <HugeIcon
                :icon="RefreshCwIcon"
                :size="15"
                :class="{ 'animate-spin': store.approvalsLoading || store.approvalPeriodsLoading }"
              />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Period KPI Ribbon -->
    <div
      v-if="store.approvalsSummary && !store.approvalsSummary.empty"
      class="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <!-- Grand Total -->
      <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between ">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-1">
            Grand Total Pending
          </p>
          <div class="text-xl font-bold font-mono text-primary-green">
            +${{ formatNum(store.approvalsSummary.grand_total) }}
          </div>
        </div>
        <div class="w-10 h-10 rounded-lg bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green">
          <HugeIcon :icon="Coins01Icon" :size="20" />
        </div>
      </div>

      <!-- Total IBs -->
      <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between ">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-1">
            IBs with Pending
          </p>
          <div class="text-xl font-bold font-mono text-primary-text">
            {{ store.approvalsSummary.ib_count }}
          </div>
        </div>
        <div class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <HugeIcon :icon="UserGroupIcon" :size="20" />
        </div>
      </div>

      <!-- Pending Entries Count -->
      <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between ">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-1">
            Pending Line Items
          </p>
          <div class="text-xl font-bold font-mono text-primary-text">
            {{ store.approvalsSummary.entry_count }}
          </div>
        </div>
        <div class="w-10 h-10 rounded-lg bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
          <HugeIcon :icon="Invoice01Icon" :size="20" />
        </div>
      </div>

      <!-- Period Date Window -->
      <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between ">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text mb-1">
            Period Window
          </p>
          <div class="text-xs font-mono font-bold text-primary-text">
            {{ activePeriodLabel }}
          </div>
          <p class="text-[10px] text-secondary-text font-mono mt-0.5">
            {{ formatShortDate(store.approvalsSummary.start) }} &rarr; {{ formatShortDate(store.approvalsSummary.end) }}
          </p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
          <HugeIcon :icon="Calendar01Icon" :size="20" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.approvalsLoading" class="space-y-4">
      <div class="bg-card-background border border-primary-border rounded-2xl overflow-hidden p-5 space-y-4">
        <div class="h-10 bg-background border border-primary-border rounded-lg animate-pulse w-full" />
        <div v-for="r in 4" :key="r" class="h-16 bg-background/50 border border-primary-border rounded-lg animate-pulse w-full" />
      </div>
    </div>

    <!-- Empty State (Matches UI Requirement & API empty_message) -->
    <div
      v-else-if="!store.approvalsSummary || store.approvalsSummary.empty || !store.approvalsSummary.items?.length"
      class="flex flex-col items-center justify-center p-14 rounded-2xl bg-card-background border border-primary-border text-center min-h-[320px] space-y-4 "
    >
      <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <HugeIcon :icon="CheckmarkCircle02Icon" :size="24" />
      </div>
      <div class="space-y-1.5 max-w-md">
        <h3 class="text-sm font-bold text-primary-text">
          {{ store.approvalsSummary?.empty_message || "No records, please choose or initiate a commission workflow" }}
        </h3>
        <p class="text-xs text-secondary-text leading-relaxed">
          There are no pending commission entries for the <strong class="text-primary-text">{{ activePeriodLabel }}</strong> period under the <strong class="capitalize text-primary-text">{{ activeFrequency }}</strong> workflow.
        </p>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <router-link
          to="/commission-engine/commissions"
          class="flex items-center gap-1.5 px-4 py-2 bg-card-background border border-primary-border hover:bg-background text-primary-text text-xs font-semibold rounded-lg transition-all cursor-pointer "
        >
          <HugeIcon :icon="Coins01Icon" :size="14" />
          <span>View All Commissions</span>
        </router-link>
      </div>
    </div>

    <!-- IB-wise Pending Summary Table -->
    <div v-else class="space-y-4">
      <DataTable
        :columns="columns"
        :data="store.approvalsSummary.items"
        :loading="store.approvalsLoading"
        row-key="ib_id"
        table-key="commission-approvals-table"
        :per-page-options="[10, 20, 50, 100]"
        empty-title="No IB records found"
        empty-text="No IBs match the current filter criteria."
      >
        <!-- Cell: IB Partner -->
        <template #cell-ib="{ row }">
          <div class="space-y-0.5">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-primary-text text-xs">
                {{ row.ib_name || `IB #${row.ib_id}` }}
              </span>
              <span class="text-[11px] font-mono text-secondary-text px-1.5 py-0.2 bg-background rounded border border-primary-border">
                #{{ row.ib_id }}
              </span>
            </div>
            <p class="text-[11px] text-secondary-text font-mono truncate max-w-[220px]">
              {{ row.ib_email || "No email" }} &middot; User #{{ row.ib_user_id || "N/A" }}
            </p>
          </div>
        </template>

        <!-- Cell: Entries Count -->
        <template #cell-entries="{ row }">
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-card-background border border-primary-border text-xs font-mono font-bold text-primary-text tabular-nums">
            {{ row.entry_count }} {{ row.entry_count === 1 ? 'entry' : 'entries' }}
          </span>
        </template>

        <!-- Cell: Total Commission -->
        <template #cell-total="{ row }">
          <span class="font-mono text-xs font-bold text-primary-green tabular-nums text-sm">
            +${{ formatNum(row.total_commission) }}
          </span>
        </template>

        <!-- Cell: Currency Breakdown -->
        <template #cell-currency="{ row }">
          <div class="flex flex-wrap items-center gap-1 font-mono text-[11px]">
            <span
              v-for="(amount, curr) in (row.by_currency || { USD: row.total_commission })"
              :key="curr"
              class="px-2 py-0.5 rounded-md bg-background border border-primary-border text-secondary-text font-medium"
            >
              {{ curr }}: <strong class="text-primary-text font-bold">${{ formatNum(amount) }}</strong>
            </span>
          </div>
        </template>

        <!-- Cell: Wallet Target -->
        <template #cell-wallet="{ row }">
          <span
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider"
            :class="
              row.wallet_target === 'demo'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            "
          >
            {{ row.wallet_target === 'demo' ? 'Demo Wallet' : 'Main Wallet' }}
          </span>
        </template>

        <!-- Cell: Payout Mode -->
        <template #cell-mode="{ row }">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
            :class="
              row.payout_mode === 'auto_settlement'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-card-background text-secondary-text border border-primary-border'
            "
          >
            {{ row.payout_mode === 'auto_settlement' ? 'Auto Settlement' : 'Require Approval' }}
          </span>
        </template>

        <!-- Cell: Actions -->
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2 justify-end">
            <!-- View Line Items -->
            <button
              type="button"
              class="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-secondary-text hover:text-primary-text bg-card-background border border-primary-border hover:bg-background rounded-lg transition-colors cursor-pointer"
              title="View line items for this IB in this period"
              @click="openLineItemsDrawer(row)"
            >
              <span>Entries</span>
              <HugeIcon :icon="ArrowRight01Icon" :size="12" />
            </button>

            <!-- Approve IB Button -->
            <button
              v-if="canApprove && row.can_approve !== false"
              type="button"
              :disabled="store.approveIbLoading"
              class="flex items-center gap-1.5 px-3 py-1 bg-primary-green hover:bg-primary-green/90 text-white text-xs font-bold rounded-lg transition-all cursor-pointer  disabled:opacity-50"
              title="Approve all pending commissions for this IB in this period"
              @click="openApproveConfirm(row)"
            >
              <HugeIcon :icon="CheckmarkCircle02Icon" :size="13" />
              <span>Approve</span>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- IB Line Items Drawer -->
    <IbApprovalEntriesDrawer
      :open="isDrawerOpen"
      :ib="selectedIbForDrawer"
      :frequency="activeFrequency"
      :period-key="selectedPeriodKey"
      :period-label="activePeriodLabel"
      @close="isDrawerOpen = false"
      @approve="openApproveConfirm"
    />

    <!-- Approve Confirmation Dialog -->
    <ConfirmationDialog
      :open="isApproveConfirmOpen"
      :title="`Approve IB #${ibToApprove?.ib_id} Commissions?`"
      :message="approveConfirmMessage"
      confirm-text="Approve & Credit Wallet"
      type="warning"
      :loading="store.approveIbLoading"
      @confirm="handleConfirmApprove"
      @cancel="isApproveConfirmOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Coins01Icon,
  RefreshCwIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Calendar01Icon,
  Invoice01Icon,
  UserGroupIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import IbApprovalEntriesDrawer from "../components/IbApprovalEntriesDrawer.vue";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();
const canApprove = computed(() =>
  hasPermission([
    "ib_commission_approvals.approve",
    "ib_commission.approvals.approve",
    "ib_commission_settlements.approve",
    "ib_commission.settlements.approve",
  ])
);

// ─── Frequencies ────────────────────────────────────────
const frequencies = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

const activeFrequency = ref("daily");
const selectedPeriodKey = ref("");

// ─── Secondary Filters ──────────────────────────────────
const filterWalletTarget = ref("");
const filterPayoutMode = ref("");
const filterIbId = ref(null);

const walletTargetOptions = [
  { label: "All Wallets", value: "" },
  { label: "Main Wallet", value: "main" },
  { label: "Demo Wallet", value: "demo" },
];

const payoutModeOptions = [
  { label: "All Modes", value: "" },
  { label: "Require Approval", value: "require_approval" },
  { label: "Auto Settlement", value: "auto_settlement" },
];

const hasActiveFilters = computed(() => {
  return !!filterWalletTarget.value || !!filterPayoutMode.value || !!filterIbId.value;
});

// ─── Table Columns ──────────────────────────────────────
const columns = [
  { key: "ib", label: "IB Partner", width: "220px" },
  { key: "entries", label: "Pending Entries", align: "center", width: "140px" },
  { key: "total", label: "Total Commission", align: "right", width: "150px" },
  { key: "currency", label: "Currency Breakdown", width: "190px" },
  { key: "wallet", label: "Wallet Target", align: "center", width: "140px" },
  { key: "mode", label: "Payout Mode", align: "center", width: "150px" },
  { key: "actions", label: "Actions", align: "right", width: "180px", sticky: "right" },
];

// ─── Period Select Options ──────────────────────────────
const periodSelectOptions = computed(() => {
  const options = store.approvalPeriods?.options || [];
  return options.map((opt) => ({
    label: opt.label || opt.period_key,
    value: opt.period_key,
    start: opt.start,
    end: opt.end,
  }));
});

const activePeriodLabel = computed(() => {
  const match = periodSelectOptions.value.find((o) => o.value === selectedPeriodKey.value);
  return match?.label || selectedPeriodKey.value || "Selected Period";
});

// ─── Drawer & Modals State ──────────────────────────────
const isDrawerOpen = ref(false);
const selectedIbForDrawer = ref(null);

const isApproveConfirmOpen = ref(false);
const ibToApprove = ref(null);

const approveConfirmMessage = computed(() => {
  if (!ibToApprove.value) return "";
  const ib = ibToApprove.value;
  const walletName = ib.wallet_target === "demo" ? "Demo Wallet" : "Main CRM Wallet";
  return `Are you sure you want to approve ${ib.entry_count || 0} pending commissions totaling $${formatNum(ib.total_commission)} for ${ib.ib_name || `IB #${ib.ib_id}`} in period '${activePeriodLabel.value}'? Funds will credit directly to their ${walletName}.`;
});

// ─── IB Search Handler ──────────────────────────────────
let ibSearchDebounce = null;
const onIbSearch = (query) => {
  clearTimeout(ibSearchDebounce);
  if (!query || !query.trim()) {
    store.searchIbs("");
    return;
  }
  ibSearchDebounce = setTimeout(() => {
    store.searchIbs(query).catch(() => {});
  }, 300);
};

// ─── Lifecycle & Data Loaders ───────────────────────────
onMounted(async () => {
  if (!store.ibSearchOptions.length) {
    store.searchIbs("");
  }
  await loadPeriodsAndSummary();
});

const loadPeriodsAndSummary = async () => {
  const periodsData = await store.fetchApprovalPeriods(activeFrequency.value, 12);
  const opts = periodsData?.options || [];
  if (opts.length) {
    // Default to first option
    selectedPeriodKey.value = opts[0].period_key;
  } else {
    selectedPeriodKey.value = "";
  }
  loadApprovalsSummary(true);
};

const handleFrequencyChange = async (newFreq) => {
  if (activeFrequency.value === newFreq) return;
  activeFrequency.value = newFreq;
  await loadPeriodsAndSummary();
};

const handlePeriodChange = () => {
  loadApprovalsSummary(true);
};

const handleFilterChange = () => {
  loadApprovalsSummary(true);
};

const handleResetFilters = () => {
  filterWalletTarget.value = "";
  filterPayoutMode.value = "";
  filterIbId.value = null;
  loadApprovalsSummary(true);
};

const loadApprovalsSummary = (force = false) => {
  if (!selectedPeriodKey.value) return;

  const params = {
    frequency: activeFrequency.value,
    period_key: selectedPeriodKey.value,
    wallet_target: filterWalletTarget.value || undefined,
    payout_mode: filterPayoutMode.value || undefined,
    ib_id: filterIbId.value ? Number(filterIbId.value) : undefined,
  };

  store.fetchApprovalsSummary(params, force);
};

const openLineItemsDrawer = (ib) => {
  selectedIbForDrawer.value = ib;
  isDrawerOpen.value = true;
};

const openApproveConfirm = (ib) => {
  ibToApprove.value = ib;
  isApproveConfirmOpen.value = true;
};

const handleConfirmApprove = async () => {
  if (!ibToApprove.value) return;
  try {
    await store.approveIbPeriod({
      frequency: activeFrequency.value,
      period_key: selectedPeriodKey.value,
      ib_id: ibToApprove.value.ib_id,
      dry_run: false,
    });
    isApproveConfirmOpen.value = false;
    isDrawerOpen.value = false;
  } catch {
    // Error handled by store snackbar
  }
};

// ─── Formatters ─────────────────────────────────────────
const formatNum = (val) => {
  if (val == null || isNaN(Number(val))) return "0.00";
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatShortDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};
</script>
