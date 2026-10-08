<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Settings01Icon,
  RefreshCwIcon,
  Search01Icon,
  Tick02Icon,
  Alert02Icon,
  InformationCircleIcon,
  Coins01Icon,
  UserIcon,
  Clock01Icon,
  Calendar01Icon,
  PlayIcon,
  Invoice01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  EyeIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import SettlementRunResultModal from "../components/SettlementRunResultModal.vue";
import BatchDetailsModal from "../components/BatchDetailsModal.vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";

const store = useCommissionEngineStore();
const router = useRouter();
const { hasPermission } = usePermissionCheck();

// ─── Permissions ─────────────────────────────────────────
const canView = computed(() =>
  hasPermission([
    "ib_commission_settings.view",
    "ib_commission.settings.view",
    "ib_commission.view",
  ])
);
const canManageSettings = computed(() =>
  hasPermission([
    "ib_commission_settings.update",
    "ib_commission.settings.update",
  ])
);
const canApprove = computed(() =>
  hasPermission([
    "ib_commission_settlements.approve",
    "ib_commission.settlements.approve",
    "ib_commission_approvals.approve",
    "ib_commission.approvals.approve",
  ])
);

// ─── Master Form State ───────────────────────────────────
const masterForm = ref({
  payout_mode: "require_approval", // 'require_approval' | 'auto_settlement'
  settlement_frequency: "daily", // 'daily' | 'weekly' | 'monthly'
  settle_hour: 0,
  settle_minute: 0,
  weekly_weekday: 0, // 0=Mon ... 6=Sun
  monthly_day: 1, // 1-28
  wallet_target: "main", // 'main' | 'demo'
  is_active: true,
  only_active_ibs: true,
});

// ─── Per-IB Form State ───────────────────────────────────
const selectedIbId = ref(null);
const searchDebounceTimer = ref(null);

const ibForm = ref({
  payout_mode: "require_approval",
  settlement_frequency: "daily",
  settle_hour: 0,
  settle_minute: 0,
  weekly_weekday: 0,
  monthly_day: 1,
  wallet_target: "main",
  is_active: true,
});

const ibFormErrors = ref({});

// ─── Settlements Filters State ───────────────────────────
const settlementFilterIbId = ref("");
const settlementFilterPeriodType = ref("");
const settlementFilterPeriodKey = ref("");
const settlementFilterStatus = ref("");
const filterDebounceTimer = ref(null);

// ─── Eligibility State ───────────────────────────────────
const eligibilityForm = ref({
  eligibility_duration: null,
});
const eligibilityLoading = ref(false);

const fetchEligibility = async () => {
  eligibilityLoading.value = true;
  await apiRequest(urls.KEYS.GET, urls.ibCommission.eligibilitySettings, {
    isTokenRequired: true,
    onSuccess: (res) => {
      eligibilityForm.value.eligibility_duration = res?.data?.eligibility_duration ?? null;
    },
    onFailure: (err) => {
      console.error("Failed to fetch eligibility", err);
    },
  });
  eligibilityLoading.value = false;
};

const handleSaveEligibility = async () => {
  if (!canManageSettings.value) return;
  eligibilityLoading.value = true;
  const val = eligibilityForm.value.eligibility_duration;
  await apiRequest(urls.KEYS.PUT, urls.ibCommission.eligibilitySettings, {
    isTokenRequired: true,
    data: {
      eligibility_duration: (val === "" || val == null) ? null : Number(val),
    },
    onSuccess: () => {
      // Success handled by global interceptors
    },
    onFailure: (err) => {
      console.error("Failed to save eligibility", err);
    },
  });
  eligibilityLoading.value = false;
};

// ─── Modals & Dialogs State ──────────────────────────────
const isApplyAllConfirmOpen = ref(false);
const isSettleIbConfirmOpen = ref(false);
const isRunAllDueConfirmOpen = ref(false);

const isRunResultModalOpen = ref(false);
const runResultData = ref(null);
const isRunResultDryRun = ref(false);

const isBatchDetailsModalOpen = ref(false);
const selectedBatchForDetails = ref(null);

// ─── Options Constants ───────────────────────────────────
const WEEKDAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const MODES = [
  {
    value: "require_approval",
    label: "Require Approval",
    hint: "Commissions stay pending until manually approved",
  },
  {
    value: "auto_settlement",
    label: "Auto Settlement",
    hint: "Commissions auto-credit to wallet on scheduled timing",
  },
];

const WALLET_TARGETS = [
  {
    value: "main",
    label: "Main CRM Wallet",
    hint: "Standard IB wallet balance",
  },
  {
    value: "demo",
    label: "Demo Wallet",
    hint: "Separate demo wallet balance",
  },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily (Yesterday's Trades)" },
  { value: "weekly", label: "Weekly (Last ISO Week)" },
  { value: "monthly", label: "Monthly (Last Calendar Month)" },
];

const PERIOD_TYPE_OPTIONS = [
  { label: "All Periods", value: "" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Paid", value: "paid" },
  { label: "Empty (0 Payable)", value: "empty" },
  { label: "Failed", value: "failed" },
];

// ─── Table Columns ───────────────────────────────────────
const columns = [
  { key: "id", label: "Batch ID", width: "90px", sortable: true },
  { key: "ib", label: "IB Partner", width: "160px" },
  { key: "period", label: "Period", width: "140px" },
  { key: "entries", label: "Entries", align: "center", width: "90px" },
  { key: "amount", label: "Total Amount", align: "right", width: "140px", sortable: true },
  { key: "status", label: "Status", align: "center", width: "120px" },
  { key: "wallet_tx", label: "Wallet Tx", align: "center", width: "110px" },
  { key: "paid_at", label: "Paid At", width: "160px" },
  { key: "actions", label: "Actions", align: "right", width: "100px" },
];

// ─── Computed Helpers ────────────────────────────────────
const selectedIbOption = computed(() => {
  if (!selectedIbId.value) return null;
  return (
    store.ibSearchOptions.find(
      (opt) => String(opt.value || opt.id || opt.ib_id) === String(selectedIbId.value)
    ) || null
  );
});

// ─── Lifecycle & Initial Load ────────────────────────────
onMounted(() => {
  store.fetchMasterPayoutSummary();
  store.fetchSettlements({ page: 1 });
  store.searchIbs("");
  fetchEligibility();
});

// Watch master summary to initialize master form state when available
watch(
  () => store.masterPayoutSummary,
  (summary) => {
    if (summary?.master_state === "all_auto_settlement") {
      masterForm.value.payout_mode = "auto_settlement";
    } else if (summary?.master_state === "all_require_approval") {
      masterForm.value.payout_mode = "require_approval";
    }
    if (summary?.wallet_target_master_state === "all_demo") {
      masterForm.value.wallet_target = "demo";
    } else if (summary?.wallet_target_master_state === "all_main") {
      masterForm.value.wallet_target = "main";
    }
  },
  { immediate: true }
);

// Watch selected IB changes to fetch and populate per-IB form
watch(
  () => selectedIbId.value,
  async (newIbId) => {
    ibFormErrors.value = {};
    if (!newIbId) {
      store.currentIbPayoutSettings = null;
      return;
    }
    await store.fetchIbPayoutSettings(newIbId, true);
  }
);

// Populate IB form when currentIbPayoutSettings changes
watch(
  () => store.currentIbPayoutSettings,
  (settings) => {
    if (settings) {
      ibForm.value = {
        payout_mode: settings.payout_mode || "require_approval",
        settlement_frequency: settings.settlement_frequency || "daily",
        settle_hour: settings.settle_hour ?? 0,
        settle_minute: settings.settle_minute ?? 0,
        weekly_weekday: settings.weekly_weekday ?? 0,
        monthly_day: settings.monthly_day ?? 1,
        wallet_target: settings.wallet_target || "main",
        is_active: settings.is_active !== undefined ? settings.is_active : true,
      };
    }
  }
);

// ─── Master Form Handlers ────────────────────────────────
const handleApplyToAllClick = () => {
  isApplyAllConfirmOpen.value = true;
};

const handleConfirmApplyToAll = async () => {
  isApplyAllConfirmOpen.value = false;
  const payload = {
    payout_mode: masterForm.value.payout_mode,
    wallet_target: masterForm.value.wallet_target || "main",
    only_active_ibs: !!masterForm.value.only_active_ibs,
  };

  if (masterForm.value.payout_mode === "auto_settlement") {
    payload.settlement_frequency = masterForm.value.settlement_frequency || "daily";
    payload.settle_hour = Number(masterForm.value.settle_hour) || 0;
    payload.settle_minute = Number(masterForm.value.settle_minute) || 0;
    payload.weekly_weekday = Number(masterForm.value.weekly_weekday) || 0;
    payload.monthly_day = Number(masterForm.value.monthly_day) || 1;
    payload.is_active = !!masterForm.value.is_active;
  }

  await store.applyPayoutToAll(payload);
};

// ─── IB Search & Selection Handlers ──────────────────────
const handleIbSearchInput = (query) => {
  const q = String(query || "").trim();
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value);
  searchDebounceTimer.value = setTimeout(() => {
    store.searchIbs(q);
  }, 300);
};

// ─── Per-IB Form Validation & Save ───────────────────────
const validateIbForm = () => {
  const errors = {};
  if (ibForm.value.payout_mode === "auto_settlement") {
    if (!ibForm.value.settlement_frequency) {
      errors.settlement_frequency = "Settlement frequency is required for auto mode.";
    }
    const hour = Number(ibForm.value.settle_hour);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      errors.settle_hour = "Hour must be between 0 and 23.";
    }
    const minute = Number(ibForm.value.settle_minute);
    if (isNaN(minute) || minute < 0 || minute > 59) {
      errors.settle_minute = "Minute must be between 0 and 59.";
    }
    if (ibForm.value.settlement_frequency === "weekly") {
      const weekday = Number(ibForm.value.weekly_weekday);
      if (isNaN(weekday) || weekday < 0 || weekday > 6) {
        errors.weekly_weekday = "Weekday must be between 0 (Mon) and 6 (Sun).";
      }
    }
    if (ibForm.value.settlement_frequency === "monthly") {
      const day = Number(ibForm.value.monthly_day);
      if (isNaN(day) || day < 1 || day > 28) {
        errors.monthly_day = "Monthly day must be between 1 and 28.";
      }
    }
  }
  ibFormErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSaveIb = async () => {
  if (!selectedIbId.value) return;
  if (!validateIbForm()) return;

  const payload = {
    payout_mode: ibForm.value.payout_mode,
    wallet_target: ibForm.value.wallet_target || "main",
    is_active: !!ibForm.value.is_active,
  };

  if (ibForm.value.payout_mode === "auto_settlement") {
    payload.settlement_frequency = ibForm.value.settlement_frequency;
    payload.settle_hour = Number(ibForm.value.settle_hour) || 0;
    payload.settle_minute = Number(ibForm.value.settle_minute) || 0;
    if (ibForm.value.settlement_frequency === "weekly") {
      payload.weekly_weekday = Number(ibForm.value.weekly_weekday) || 0;
    }
    if (ibForm.value.settlement_frequency === "monthly") {
      payload.monthly_day = Number(ibForm.value.monthly_day) || 1;
    }
  }

  await store.saveIbPayoutSettings(selectedIbId.value, payload);
};

// ─── Single IB Settlement Actions (Dry Run / Settle Now) ─
const handleDryRunSingleIb = async () => {
  if (!selectedIbId.value) return;
  try {
    const res = await store.runSettlement({
      ib_id: Number(selectedIbId.value),
      dry_run: true,
      force: true,
    });
    runResultData.value = res?.data || res;
    isRunResultDryRun.value = true;
    isRunResultModalOpen.value = true;
  } catch (err) {
    console.error("Dry run error:", err);
  }
};

const handleSettleSingleIbClick = () => {
  if (!selectedIbId.value) return;
  isSettleIbConfirmOpen.value = true;
};

const handleConfirmSettleSingleIb = async () => {
  isSettleIbConfirmOpen.value = false;
  if (!selectedIbId.value) return;
  try {
    const res = await store.runSettlement({
      ib_id: Number(selectedIbId.value),
      dry_run: false,
      force: true,
    });
    runResultData.value = res?.data || res;
    isRunResultDryRun.value = false;
    isRunResultModalOpen.value = true;
  } catch (err) {
    console.error("Settle now error:", err);
  }
};

const navigateToCommissionsForIb = () => {
  if (!selectedIbId.value) return;
  router.push({
    path: "/commission-engine/commissions",
    query: { ib_id: selectedIbId.value, status: "pending" },
  });
};

// ─── Settlement Batches Table Handlers ───────────────────
const loadSettlements = (page = 1, force = false) => {
  const ibVal = settlementFilterIbId.value != null ? String(settlementFilterIbId.value).trim() : "";
  const keyVal = settlementFilterPeriodKey.value != null ? String(settlementFilterPeriodKey.value).trim() : "";

  const params = {
    ib_id: ibVal ? Number(ibVal) : undefined,
    period_type: settlementFilterPeriodType.value || undefined,
    period_key: keyVal || undefined,
    status: settlementFilterStatus.value || undefined,
    page,
    per_page: store.settlementPagination.per_page || 50,
  };

  store.fetchSettlements(params, force);
};

const handleFilterChange = () => {
  if (filterDebounceTimer.value) clearTimeout(filterDebounceTimer.value);
  filterDebounceTimer.value = setTimeout(() => {
    loadSettlements(1, true);
  }, 350);
};

const handleResetFilters = () => {
  settlementFilterIbId.value = "";
  settlementFilterPeriodType.value = "";
  settlementFilterPeriodKey.value = "";
  settlementFilterStatus.value = "";
  loadSettlements(1, true);
};

const handlePageChange = (newPage) => {
  loadSettlements(newPage, true);
};

const handlePerPageChange = (newPerPage) => {
  const perPageVal =
    typeof newPerPage === "object" && newPerPage !== null
      ? newPerPage.per_page || newPerPage.value || 50
      : newPerPage;
  store.settlementPagination.per_page = Number(perPageVal) || 50;
  loadSettlements(1, true);
};

const openBatchDetails = (batch) => {
  selectedBatchForDetails.value = batch;
  isBatchDetailsModalOpen.value = true;
};

// ─── Global Settlement Actions (Run Due / Dry Run All) ────
const handleDryRunAll = async () => {
  try {
    const res = await store.runSettlement({
      dry_run: true,
      force: false,
    });
    runResultData.value = res?.data || res;
    isRunResultDryRun.value = true;
    isRunResultModalOpen.value = true;
  } catch (err) {
    console.error("Dry run all error:", err);
  }
};

const handleRunAllDueClick = () => {
  isRunAllDueConfirmOpen.value = true;
};

const handleConfirmRunAllDue = async () => {
  isRunAllDueConfirmOpen.value = false;
  try {
    const res = await store.runSettlement({
      dry_run: false,
      force: false,
    });
    runResultData.value = res?.data || res;
    isRunResultDryRun.value = false;
    isRunResultModalOpen.value = true;
  } catch (err) {
    console.error("Run due all error:", err);
  }
};

// ─── Format Helpers ──────────────────────────────────────
const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const getMasterStateBadge = (state) => {
  switch (state) {
    case "all_auto_settlement":
      return { label: "All Auto Settlement", class: "bg-primary-green/10 text-primary-green border border-primary-green/20" };
    case "all_require_approval":
      return { label: "All Require Approval", class: "bg-primary/10 text-primary border border-primary/20" };
    case "mixed":
      return { label: "Mixed / Custom per IB", class: "bg-primary-blue/10 text-primary-blue border border-primary-blue/20" };
    case "empty":
      return { label: "No IBs Configured", class: "bg-background text-secondary-text border border-primary-border" };
    default:
      return { label: state || "Mixed", class: "bg-background text-secondary-text border border-primary-border" };
  }
};

const getWalletTargetMasterBadge = (state) => {
  switch (state) {
    case "all_main":
      return { label: "Main Wallet", class: "bg-primary-green/10 text-primary-green border border-primary-green/20" };
    case "all_demo":
      return { label: "Demo Wallet", class: "bg-primary-blue/10 text-primary-blue border border-primary-blue/20" };
    case "mixed":
      return { label: "Mixed Destinations", class: "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20" };
    case "empty":
      return { label: "No IBs", class: "bg-background text-secondary-text border border-primary-border" };
    default:
      return { label: state || "Mixed", class: "bg-background text-secondary-text border border-primary-border" };
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION -1: GLOBAL ELIGIBILITY                              -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="rounded-lg bg-card-background/80 backdrop-blur-xl border border-primary-border/50 overflow-hidden">
      <div class="p-4 sm:p-5 border-b border-primary-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background/40">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <HugeIcon :icon="Clock01Icon" :size="18" />
          </div>
          <div>
            <h2 class="text-sm font-bold text-primary-text">Eligibility (global)</h2>
            <p class="text-xs text-secondary-text mt-0.5">
              Minimum hold time a position must stay open before IB commission is created.
            </p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-end gap-4">
        <div class="space-y-1.5 flex-1 max-w-sm">
          <label class="text-xs font-semibold text-primary-text block">Min hold time (seconds, optional)</label>
          <input
            v-model.number="eligibilityForm.eligibility_duration"
            type="number"
            min="0"
            placeholder="e.g. 30"
            class="input-field w-full px-3 py-2 text-sm"
          />
          <p class="text-[11px] text-secondary-text">Hint: leave empty = no minimum; 30 = &ge;30s to earn IB</p>
        </div>
        <button
          v-if="canManageSettings"
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
          :disabled="eligibilityLoading"
          @click="handleSaveEligibility"
        >
          <HugeIcon v-if="eligibilityLoading" :icon="Loading03Icon" :size="13" class="animate-spin" />
          <HugeIcon v-else :icon="Tick02Icon" :size="14" />
          <span>Save eligibility</span>
        </button>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 0: MASTER (ALL IBs) SETTINGS                        -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="rounded-lg bg-card-background/80 backdrop-blur-xl border border-primary-border/50 overflow-hidden">
      <!-- Section Header -->
      <div class="p-4 sm:p-5 border-b border-primary-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background/40">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <HugeIcon :icon="Settings01Icon" :size="18" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-sm font-bold text-primary-text">
                Master Payout Settings (All IBs)
              </h2>
              <span
                v-if="store.masterPayoutSummary?.master_state"
                class="px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono"
                :class="getMasterStateBadge(store.masterPayoutSummary.master_state).class"
              >
                {{ getMasterStateBadge(store.masterPayoutSummary.master_state).label }}
              </span>
            </div>
            <p class="text-xs text-secondary-text mt-0.5">
              Universal default payout mode &amp; settlement schedule across all active IB partners
            </p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-primary-border bg-card-background text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer self-start sm:self-auto"
          :disabled="store.settingsLoading"
          title="Refresh Master Summary"
          @click="store.fetchMasterPayoutSummary(true)"
        >
          <HugeIcon :icon="RefreshCwIcon" :size="13" :class="{ 'animate-spin': store.settingsLoading }" />
          <span>Refresh</span>
        </button>
      </div>

      <div class="p-4 sm:p-5 space-y-4">
        <!-- Summary Stats Pills Grid -->
        <div v-if="store.masterPayoutSummary" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm ">
            <span class="text-[11px] text-secondary-text block mb-0.5">Total IBs</span>
            <span class="text-base font-bold text-primary-text font-mono">
              {{ store.masterPayoutSummary.total_ibs ?? 0 }}
            </span>
          </div>

          <div class="p-3 rounded-lg bg-primary-green/5 border border-primary-green/20">
            <span class="text-[11px] text-primary-green block mb-0.5">Auto Settlement</span>
            <span class="text-base font-bold text-primary-green font-mono">
              {{ store.masterPayoutSummary.auto_settlement_count ?? 0 }}
            </span>
          </div>

          <div class="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <span class="text-[11px] text-primary block mb-0.5">Require Approval</span>
            <span class="text-base font-bold text-primary font-mono">
              {{ store.masterPayoutSummary.require_approval_count ?? 0 }}
            </span>
          </div>

          <div class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm ">
            <div class="flex items-center justify-between mb-0.5">
              <span class="text-[11px] text-secondary-text">Wallet Target</span>
              <span
                v-if="store.masterPayoutSummary.wallet_target_master_state"
                class="px-1.5 py-0.2 rounded text-[10px] font-semibold"
                :class="getWalletTargetMasterBadge(store.masterPayoutSummary.wallet_target_master_state).class"
              >
                {{ getWalletTargetMasterBadge(store.masterPayoutSummary.wallet_target_master_state).label }}
              </span>
            </div>
            <span class="text-xs font-semibold text-primary-text block font-mono">
              Main: {{ store.masterPayoutSummary.wallet_target_main_count ?? 0 }} &middot; Demo: {{ store.masterPayoutSummary.wallet_target_demo_count ?? 0 }}
            </span>
          </div>

          <div class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  col-span-2 sm:col-span-1">
            <span class="text-[11px] text-secondary-text block mb-0.5">Overrides / Defaults</span>
            <span class="text-xs font-semibold text-primary-text font-mono block">
              {{ store.masterPayoutSummary.configured_count ?? 0 }} custom / {{ store.masterPayoutSummary.unconfigured_count ?? 0 }} defaults
            </span>
          </div>
        </div>

        <!-- Master Configuration Form Controls -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          <!-- Mode Selector Radios -->
          <div class="space-y-2 flex flex-col h-full">
            <label class="text-xs font-semibold text-primary-text block">
              Universal Payout Mode
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 items-stretch">
              <label
                v-for="mode in MODES"
                :key="mode.value"
                class="flex items-start gap-2.5 p-3 rounded-lg border transition-all cursor-pointer h-full"
                :class="
                  masterForm.payout_mode === mode.value
                    ? 'border-primary bg-primary/5 text-primary-text ring-1 ring-primary/20'
                    : 'border-primary-border bg-background hover:bg-card-background text-secondary-text'
                "
              >
                <input
                  v-model="masterForm.payout_mode"
                  type="radio"
                  name="master_payout_mode"
                  :value="mode.value"
                  class="mt-0.5 text-primary focus:ring-primary h-3.5 w-3.5 shrink-0"
                />
                <div class="space-y-0.5 min-w-0">
                  <span class="text-xs font-semibold text-primary-text block truncate">{{ mode.label }}</span>
                  <span class="text-[11px] text-secondary-text block leading-tight">{{ mode.hint }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Universal Wallet Target Radios -->
          <div class="space-y-2 flex flex-col h-full">
            <label class="text-xs font-semibold text-primary-text block">
              Universal Wallet Destination (Target)
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 items-stretch">
              <label
                v-for="target in WALLET_TARGETS"
                :key="target.value"
                class="flex items-start gap-2.5 p-3 rounded-lg border transition-all cursor-pointer h-full"
                :class="
                  masterForm.wallet_target === target.value
                    ? 'border-primary bg-primary/5 text-primary-text ring-1 ring-primary/20'
                    : 'border-primary-border bg-background hover:bg-card-background text-secondary-text'
                "
              >
                <input
                  v-model="masterForm.wallet_target"
                  type="radio"
                  name="master_wallet_target"
                  :value="target.value"
                  class="mt-0.5 text-primary focus:ring-primary h-3.5 w-3.5 shrink-0"
                />
                <div class="space-y-0.5 min-w-0">
                  <span class="text-xs font-semibold text-primary-text block truncate">{{ target.label }}</span>
                  <span class="text-[11px] text-secondary-text block leading-tight">{{ target.hint }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- If Auto Settlement Selected: Detailed Schedule Settings -->
        <div
          v-if="masterForm.payout_mode === 'auto_settlement'"
          class="p-3.5 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  space-y-3"
        >
          <h4 class="text-xs font-semibold text-primary-text flex items-center gap-1.5">
            <HugeIcon :icon="Clock01Icon" :size="14" class="text-primary" />
            <span>Master Settlement Schedule (UTC)</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Frequency -->
            <div class="space-y-1">
              <label class="text-[11px] font-medium text-secondary-text">Frequency</label>
              <BaseSelect
                v-model="masterForm.settlement_frequency"
                :options="FREQUENCIES"
                placeholder="Select frequency..."
                variant="surface"
              />
            </div>

            <!-- Settle Time (Server UTC Hour & Minute) -->
            <div class="space-y-1">
              <label class="text-[11px] font-medium text-secondary-text">Settle Time (UTC)</label>
              <div class="flex items-center gap-1.5">
                <input
                  v-model.number="masterForm.settle_hour"
                  type="number"
                  min="0"
                  max="23"
                  placeholder="HH"
                  class="input-field flex-1 px-2.5 py-1.5 text-xs font-mono text-center"
                />
                <span class="text-secondary-text font-bold text-xs">:</span>
                <input
                  v-model.number="masterForm.settle_minute"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="MM"
                  class="input-field flex-1 px-2.5 py-1.5 text-xs font-mono text-center"
                />
              </div>
            </div>

            <!-- Weekly Weekday (If Weekly) -->
            <div v-if="masterForm.settlement_frequency === 'weekly'" class="space-y-1">
              <label class="text-[11px] font-medium text-secondary-text">Weekly Settle Day</label>
              <BaseSelect
                v-model="masterForm.weekly_weekday"
                :options="WEEKDAYS"
                placeholder="Select weekday..."
                variant="surface"
              />
            </div>

            <!-- Monthly Day (If Monthly) -->
            <div v-if="masterForm.settlement_frequency === 'monthly'" class="space-y-1">
              <label class="text-[11px] font-medium text-secondary-text">Monthly Day of Month (1–28)</label>
              <input
                v-model.number="masterForm.monthly_day"
                type="number"
                min="1"
                max="28"
                placeholder="Day (1-28)"
                class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
              />
            </div>

            <!-- Target Scope Checkbox -->
            <div class="space-y-1 flex flex-col justify-end">
              <label class="flex items-center gap-2 p-2 rounded-lg bg-card-background border border-primary-border cursor-pointer">
                <input
                  v-model="masterForm.only_active_ibs"
                  type="checkbox"
                  class="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span class="text-xs text-primary-text">Apply to active IBs only</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Master Apply Action Button -->
        <div v-if="canManageSettings" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-primary-border">
          <span class="text-xs text-secondary-text">
            Upserts this payout configuration to all matching IB records. Individual IB overrides can still be configured below.
          </span>
          <button
            type="button"
            class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            :disabled="store.actionLoading"
            @click="handleApplyToAllClick"
          >
            <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="13" class="animate-spin" />
            <HugeIcon v-else :icon="CheckmarkCircle02Icon" :size="14" />
            <span>Apply to All IBs</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 1: PER-IB OVERRIDE PANEL                             -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Left Column: IB Selection & Override Configuration Form -->
      <div class="lg:col-span-7 bg-card-background/80 backdrop-blur-xl border border-primary-border/50 rounded-2xl  p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between gap-3 border-b border-primary-border pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <HugeIcon :icon="UserIcon" :size="16" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">Individual IB Payout Override</h3>
              <p class="text-xs text-secondary-text">Configure specific payout settings and schedule for a single IB</p>
            </div>
          </div>
        </div>

        <!-- IB Partner Selector -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-primary-text block">Select IB Partner</label>
          <BaseSelect
            v-model="selectedIbId"
            :options="store.ibSearchOptions"
            :isLoading="store.searchLoading"
            placeholder="Search IB partner by name, email, or ID..."
            searchable
            variant="surface"
            @search="handleIbSearchInput"
          />
        </div>

        <!-- Selected IB Profile Pill Banner -->
        <div
          v-if="selectedIbId && store.currentIbPayoutSettings"
          class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  flex flex-wrap items-center justify-between gap-2"
        >
          <div class="flex items-stretch gap-2.5 min-w-0">
            <div class="px-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold font-mono text-xs shrink-0 whitespace-nowrap self-stretch">
              #{{ selectedIbId }}
            </div>
            <div class="min-w-0 flex flex-col justify-center">
              <span class="text-xs font-bold text-primary-text block truncate leading-tight">
                {{ selectedIbOption?.name || store.currentIbPayoutSettings?.ib_name || `IB #${selectedIbId}` }}
              </span>
              <span class="text-[11px] text-secondary-text font-mono block truncate leading-tight mt-0.5">
                {{ selectedIbOption?.email || store.currentIbPayoutSettings?.ib_email || `ID: ${selectedIbId}` }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span
              v-if="store.currentIbPayoutSettings?.exists === false"
              class="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
            >
              Default (No Override)
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-green/10 text-primary-green border border-primary-green/20"
            >
              Custom Override Active
            </span>

            <span
              v-if="store.currentIbPayoutSettings?.is_active === false"
              class="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20"
            >
              Inactive
            </span>
          </div>
        </div>

        <!-- IB Configuration Form Body (Only rendered when IB is selected) -->
        <template v-if="selectedIbId">
          <!-- Mode Selector for This IB -->
          <div class="space-y-2 flex flex-col">
            <label class="text-xs font-semibold text-primary-text block">
              Payout Mode
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-stretch">
              <label
                v-for="mode in MODES"
                :key="mode.value"
                class="flex items-start gap-2.5 p-3 rounded-lg border transition-all cursor-pointer h-full"
                :class="
                  ibForm.payout_mode === mode.value
                    ? 'border-primary bg-primary/5 text-primary-text ring-1 ring-primary/20'
                    : 'border-primary-border bg-background hover:bg-card-background text-secondary-text'
                "
              >
                <input
                  v-model="ibForm.payout_mode"
                  type="radio"
                  name="ib_payout_mode"
                  :value="mode.value"
                  class="mt-0.5 text-primary focus:ring-primary h-3.5 w-3.5 shrink-0"
                />
                <div class="space-y-0.5 min-w-0">
                  <span class="text-xs font-semibold text-primary-text block truncate">{{ mode.label }}</span>
                  <span class="text-[11px] text-secondary-text block leading-tight">{{ mode.hint }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Wallet Destination for This IB -->
          <div class="space-y-2 flex flex-col">
            <label class="text-xs font-semibold text-primary-text block">
              Wallet Destination (Target)
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-stretch">
              <label
                v-for="target in WALLET_TARGETS"
                :key="target.value"
                class="flex items-start gap-2.5 p-3 rounded-lg border transition-all cursor-pointer h-full"
                :class="
                  ibForm.wallet_target === target.value
                    ? 'border-primary bg-primary/5 text-primary-text ring-1 ring-primary/20'
                    : 'border-primary-border bg-background hover:bg-card-background text-secondary-text'
                "
              >
                <input
                  v-model="ibForm.wallet_target"
                  type="radio"
                  name="ib_wallet_target"
                  :value="target.value"
                  class="mt-0.5 text-primary focus:ring-primary h-3.5 w-3.5 shrink-0"
                />
                <div class="space-y-0.5 min-w-0">
                  <span class="text-xs font-semibold text-primary-text block truncate">{{ target.label }}</span>
                  <span class="text-[11px] text-secondary-text block leading-tight">{{ target.hint }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Auto Settlement Configuration for This IB -->
          <div
            v-if="ibForm.payout_mode === 'auto_settlement'"
            class="p-3.5 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  space-y-3"
          >
            <h4 class="text-xs font-semibold text-primary-text flex items-center gap-1.5">
              <HugeIcon :icon="Clock01Icon" :size="14" class="text-primary" />
              <span>Auto Settlement Schedule for IB #{{ selectedIbId }} (UTC)</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <!-- Frequency -->
              <div class="space-y-1">
                <label class="text-[11px] font-medium text-secondary-text">Frequency</label>
                <BaseSelect
                  v-model="ibForm.settlement_frequency"
                  :options="FREQUENCIES"
                  placeholder="Select frequency..."
                  variant="surface"
                />
                <span v-if="ibFormErrors.settlement_frequency" class="text-[11px] text-primary-red block">
                  {{ ibFormErrors.settlement_frequency }}
                </span>
              </div>

              <!-- Settle Time -->
              <div class="space-y-1">
                <label class="text-[11px] font-medium text-secondary-text">Settle Time (UTC)</label>
                <div class="flex items-center gap-1.5">
                  <input
                    v-model.number="ibForm.settle_hour"
                    type="number"
                    min="0"
                    max="23"
                    placeholder="HH"
                    class="input-field flex-1 px-2.5 py-1.5 text-xs font-mono text-center"
                    :class="{ 'border-primary-red': ibFormErrors.settle_hour }"
                  />
                  <span class="text-secondary-text font-bold text-xs">:</span>
                  <input
                    v-model.number="ibForm.settle_minute"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    class="input-field flex-1 px-2.5 py-1.5 text-xs font-mono text-center"
                    :class="{ 'border-primary-red': ibFormErrors.settle_minute }"
                  />
                </div>
                <span v-if="ibFormErrors.settle_hour || ibFormErrors.settle_minute" class="text-[11px] text-primary-red block">
                  {{ ibFormErrors.settle_hour || ibFormErrors.settle_minute }}
                </span>
              </div>

              <!-- Weekly Weekday -->
              <div v-if="ibForm.settlement_frequency === 'weekly'" class="space-y-1">
                <label class="text-[11px] font-medium text-secondary-text">Weekly Day</label>
                <BaseSelect
                  v-model="ibForm.weekly_weekday"
                  :options="WEEKDAYS"
                  placeholder="Select weekday..."
                  variant="surface"
                />
                <span v-if="ibFormErrors.weekly_weekday" class="text-[11px] text-primary-red block">
                  {{ ibFormErrors.weekly_weekday }}
                </span>
              </div>

              <!-- Monthly Day -->
              <div v-if="ibForm.settlement_frequency === 'monthly'" class="space-y-1">
                <label class="text-[11px] font-medium text-secondary-text">Month Day (1–28)</label>
                <input
                  v-model.number="ibForm.monthly_day"
                  type="number"
                  min="1"
                  max="28"
                  placeholder="Day (1-28)"
                  class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                  :class="{ 'border-primary-red': ibFormErrors.monthly_day }"
                />
                <span v-if="ibFormErrors.monthly_day" class="text-[11px] text-primary-red block">
                  {{ ibFormErrors.monthly_day }}
                </span>
              </div>

              <!-- Active Toggle for This IB -->
              <div class="space-y-1 flex flex-col justify-end">
                <label class="flex items-center gap-2 p-2 rounded-lg bg-card-background border border-primary-border cursor-pointer">
                  <input
                    v-model="ibForm.is_active"
                    type="checkbox"
                    class="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span class="text-xs text-primary-text">Active for auto scheduler</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Bottom Action: Save Button -->
          <div v-if="canManageSettings" class="flex items-center justify-end pt-2 border-t border-primary-border">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover  transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="store.actionLoading"
              @click="handleSaveIb"
            >
              <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="13" class="animate-spin" />
              <HugeIcon v-else :icon="Tick02Icon" :size="14" />
              <span>Save IB Settings</span>
            </button>
          </div>
        </template>
      </div>

      <!-- Right Column: Live Status & Immediate Settlement Operations -->
      <div class="lg:col-span-5 bg-card-background/80 backdrop-blur-xl border border-primary-border/50 rounded-2xl  p-4 sm:p-5 flex flex-col justify-between">
        <!-- Empty State if no IB is selected -->
        <div
          v-if="!selectedIbId"
          class="flex flex-col items-center justify-center text-center py-12 px-4 space-y-2.5 h-full"
        >
          <div class="w-10 h-10 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  flex items-center justify-center text-secondary-text">
            <HugeIcon :icon="UserIcon" :size="18" />
          </div>
          <h4 class="text-xs font-semibold text-primary-text">No IB Partner Selected</h4>
          <p class="text-xs text-secondary-text max-w-xs leading-relaxed">
            Select an IB partner to inspect live pending commissions, next auto-settlement time, and run instant settlements.
          </p>
        </div>

        <!-- Live IB Stats & Operations when IB is selected -->
        <div v-else class="space-y-4">
          <div class="flex items-center justify-between gap-2 border-b border-primary-border pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary-green/10 text-primary-green flex items-center justify-center border border-primary-green/20 shrink-0">
                <HugeIcon :icon="Coins01Icon" :size="16" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-primary-text">Live Partner Status</h4>
                <p class="text-xs text-secondary-text">Live metrics and operations for IB #{{ selectedIbId }}</p>
              </div>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  text-primary hover:text-primary-hover hover:border-primary/40 transition-colors cursor-pointer"
              @click="navigateToCommissionsForIb"
            >
              <span>Commissions</span>
              <HugeIcon :icon="ArrowRight01Icon" :size="12" />
            </button>
          </div>

          <!-- Pending Summary Metrics Cards -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm ">
              <span class="text-[11px] text-secondary-text block mb-0.5">Pending Records</span>
              <span class="text-base font-bold text-primary-text font-mono">
                {{ store.currentIbPayoutSettings?.pending_summary?.pending_count ?? 0 }}
              </span>
            </div>

            <div class="p-3 rounded-lg bg-primary-green/5 border border-primary-green/20">
              <span class="text-[11px] text-primary-green block mb-0.5">Pending Payable</span>
              <span class="text-base font-bold text-primary-green font-mono">
                ${{ Number(store.currentIbPayoutSettings?.pending_summary?.pending_total || 0).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Payout Detail List -->
          <div class="p-3.5 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  space-y-2.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-secondary-text">Target Destination:</span>
              <span class="font-semibold text-primary-text capitalize">
                {{ store.currentIbPayoutSettings?.effective_wallet_target || store.currentIbPayoutSettings?.wallet_target || 'main' }} Wallet
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-secondary-text">Next Auto-Settlement:</span>
              <span class="font-mono text-primary-text">
                {{ formatDate(store.currentIbPayoutSettings?.next_settlement_at) }}
              </span>
            </div>

            <div class="flex items-center justify-between border-t border-primary-border/60 pt-2">
              <span class="text-secondary-text">Last Updated:</span>
              <span class="text-secondary-text">
                {{ store.currentIbPayoutSettings?.updated_at ? formatDate(store.currentIbPayoutSettings.updated_at) : 'Using Default' }}
              </span>
            </div>
          </div>

          <!-- Operations Actions -->
          <div v-if="canApprove" class="space-y-2 pt-1">
            <label class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
              Immediate Partner Actions
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  text-primary-blue hover:bg-primary-blue/10 hover:border-primary-blue/30 transition-colors cursor-pointer disabled:opacity-50"
                :disabled="store.runSettlementLoading"
                @click="handleDryRunSingleIb"
              >
                <HugeIcon :icon="InformationCircleIcon" :size="14" />
                <span>Dry Run</span>
              </button>

              <button
                type="button"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-primary-green/10 text-primary-green border border-primary-green/30 hover:bg-primary-green hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                :disabled="store.runSettlementLoading"
                @click="handleSettleSingleIbClick"
              >
                <HugeIcon :icon="PlayIcon" :size="14" />
                <span>Settle Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 2: SETTLEMENT BATCHES & HISTORY                     -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="space-y-3">
      <DataTable
        :columns="columns"
        :data="store.settlementBatches"
        :loading="store.settlementLoading"
        :pagination="store.settlementPagination"
        row-key="id"
        table-key="ib-settlements-table"
        :per-page-options="[20, 50, 100, 200]"
        empty-title="No settlement batches found"
        empty-text="No settlement history matches the given filter criteria."
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- Toolbar Slot -->
        <template #toolbar>
          <div class="space-y-3">
            <!-- Top Row: Section Title & Global Ops Buttons -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-bold text-primary-text flex items-center gap-2">
                  <HugeIcon :icon="Invoice01Icon" :size="16" class="text-primary" />
                  <span>Settlement Batches &amp; History</span>
                </h3>
                <p class="text-xs text-secondary-text mt-0.5">
                  Audit and track aggregated settlement payouts credited to IB wallets
                </p>
              </div>

              <!-- Ops Actions (Dry Run All & Settle Due) -->
              <div v-if="canApprove" class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  text-primary-blue hover:bg-primary-blue/10 hover:border-primary-blue/30 transition-colors cursor-pointer disabled:opacity-50"
                  :disabled="store.runSettlementLoading"
                  @click="handleDryRunAll"
                >
                  <HugeIcon :icon="InformationCircleIcon" :size="13" />
                  <span>Dry Run All Due</span>
                </button>

                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 p-2 text-xs font-semibold rounded-lg bg-primary-green text-white hover:bg-primary-green/90  transition-colors cursor-pointer disabled:opacity-50"
                  :disabled="store.runSettlementLoading"
                  @click="handleRunAllDueClick"
                >
                  <HugeIcon v-if="store.runSettlementLoading" :icon="Loading03Icon" :size="13" class="animate-spin" />
                  <HugeIcon v-else :icon="PlayIcon" :size="13" />
                  <span>Run Due Settlements</span>
                </button>
              </div>
            </div>

            <!-- Bottom Row: Filter Controls -->
            <div class="flex flex-wrap items-center gap-2.5 pt-1">
              <!-- IB Filter Dropdown -->
              <div class="w-48 sm:w-56">
                <BaseSelect
                  v-model="settlementFilterIbId"
                  :options="store.ibSearchOptions"
                  :isLoading="store.searchLoading"
                  placeholder="All IBs"
                  searchable
                  allowAll
                  allLabel="All IBs"
                  variant="surface"
                  @search="handleIbSearchInput"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Period Type Filter -->
              <div class="w-36 sm:w-40">
                <BaseSelect
                  v-model="settlementFilterPeriodType"
                  :options="PERIOD_TYPE_OPTIONS"
                  placeholder="All Periods"
                  variant="surface"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Period Key Filter -->
              <div class="w-36 sm:w-44">
                <input
                  v-model="settlementFilterPeriodKey"
                  type="text"
                  placeholder="Period (e.g. 2026-09)"
                  class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                  @input="handleFilterChange"
                />
              </div>

              <!-- Status Filter -->
              <div class="w-36 sm:w-40">
                <BaseSelect
                  v-model="settlementFilterStatus"
                  :options="STATUS_OPTIONS"
                  placeholder="All Statuses"
                  variant="surface"
                  @update:model-value="handleFilterChange"
                />
              </div>

              <!-- Reset & Refresh -->
              <div class="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  title="Reset Filters"
                  @click="handleResetFilters"
                >
                  Reset
                </button>
                <button
                  type="button"
                  class="p-1.5 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                  title="Refresh Settlements"
                  :disabled="store.settlementLoading"
                  @click="loadSettlements(store.settlementPagination.page, true)"
                >
                  <HugeIcon :icon="RefreshCwIcon" :size="13" :class="{ 'animate-spin': store.settlementLoading }" />
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Custom Cell: ID -->
        <template #cell-id="{ row }">
          <span class="font-mono font-bold text-xs text-primary-text">#{{ row.id }}</span>
        </template>

        <!-- Custom Cell: IB -->
        <template #cell-ib="{ row }">
          <div class="truncate">
            <span class="font-bold text-xs text-primary-text font-mono block">IB #{{ row.ib_id }}</span>
            <span v-if="row.ib_user_id" class="text-[11px] text-secondary-text font-mono">User #{{ row.ib_user_id }}</span>
          </div>
        </template>

        <!-- Custom Cell: Period -->
        <template #cell-period="{ row }">
          <div>
            <span class="font-mono font-semibold text-xs text-primary block">{{ row.period_key }}</span>
            <span class="text-[11px] text-secondary-text capitalize">{{ row.period_type }}</span>
          </div>
        </template>

        <!-- Custom Cell: Entries -->
        <template #cell-entries="{ row }">
          <span class="font-mono text-xs font-bold text-primary-text">{{ row.entry_count ?? 0 }}</span>
        </template>

        <!-- Custom Cell: Amount -->
        <template #cell-amount="{ row }">
          <div>
            <span class="font-mono font-bold text-xs text-primary-green">
              ${{ Number(row.total_amount || 0).toFixed(2) }}
            </span>
            <span class="text-[10px] text-secondary-text ml-1 font-mono">{{ row.account_currency || 'USD' }}</span>
          </div>
        </template>

        <!-- Custom Cell: Status -->
        <template #cell-status="{ row }">
          <span
            class="px-2 py-0.5 rounded-md text-[11px] font-semibold border inline-block"
            :class="
              row.status === 'paid'
                ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                : row.status === 'empty'
                ? 'bg-background text-secondary-text border-primary-border'
                : 'bg-primary-red/10 text-primary-red border-primary-red/20'
            "
          >
            {{ row.status?.toUpperCase() || 'UNKNOWN' }}
          </span>
        </template>

        <!-- Custom Cell: Wallet Tx -->
        <template #cell-wallet_tx="{ row }">
          <span v-if="row.wallet_transaction_id" class="font-mono text-xs font-semibold text-primary-blue">
            #{{ row.wallet_transaction_id }}
          </span>
          <span v-else class="text-xs text-secondary-text">—</span>
        </template>

        <!-- Custom Cell: Paid At -->
        <template #cell-paid_at="{ row }">
          <span class="text-xs font-mono text-secondary-text">{{ formatDate(row.paid_at || row.created_at) }}</span>
        </template>

        <!-- Custom Cell: Actions -->
        <template #cell-actions="{ row }">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm  text-secondary-text hover:text-primary-text hover:border-primary/40 transition-colors cursor-pointer"
            @click="openBatchDetails(row)"
          >
            <HugeIcon :icon="EyeIcon" :size="12" />
            <span>Details</span>
          </button>
        </template>
      </DataTable>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 3: HOW AUTO SETTLEMENT TIMING WORKS (HELP BANNER)   -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="p-4 sm:p-5 rounded-lg bg-card-background border border-primary-border space-y-4">
      <div class="flex items-center gap-2 text-primary-blue">
        <div class="w-5 h-5 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue shrink-0">
          <HugeIcon :icon="InformationCircleIcon" :size="12" />
        </div>
        <h4 class="text-xs font-bold text-primary-text uppercase tracking-wider">
          How Auto Settlement Timing Works
        </h4>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-secondary-text">
        <div class="pl-4 border-l-2 border-primary-blue space-y-1.5 py-1">
          <span class="font-bold text-primary-text block">1. Five-Minute Engine Cron</span>
          <p class="leading-relaxed">
            The background settlement scheduler executes every ~5 minutes, checking which active IBs have reached their specified UTC settle hour and minute window.
          </p>
        </div>
        <div class="pl-4 border-l-2 border-primary-green space-y-1.5 py-1">
          <span class="font-bold text-primary-text block">2. Completed Periods Only</span>
          <p class="leading-relaxed">
            Settlement aggregates trades strictly from the <strong>previous completed</strong> period:
            <strong>Daily</strong> (yesterday <code class="text-primary-text bg-background px-1 py-0.5 rounded">YYYY-MM-DD</code>),
            <strong>Weekly</strong> (last ISO week <code class="text-primary-text bg-background px-1 py-0.5 rounded">YYYY-Www</code>), or
            <strong>Monthly</strong> (last calendar month <code class="text-primary-text bg-background px-1 py-0.5 rounded">YYYY-MM</code>).
          </p>
        </div>
        <div class="pl-4 border-l-2 border-primary-purple space-y-1.5 py-1">
          <span class="font-bold text-primary-text block">3. Single Wallet Credit &amp; Idempotency</span>
          <p class="leading-relaxed">
            Pending commissions for the period are summed and credited into the IB wallet in <strong>one single batch</strong>. Re-running the same completed period will never double-pay due to cryptographic lock keys.
          </p>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- CONFIRMATION & RESULT MODALS                                -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- Apply to All Confirmation -->
    <ConfirmationDialog
      :open="isApplyAllConfirmOpen"
      title="Apply Payout Settings to All IBs?"
      :message="`This will override and upsert the '${masterForm.payout_mode === 'auto_settlement' ? 'Auto Settlement' : 'Require Approval'}' payout mode onto all active IB partners. Continue?`"
      confirm-text="Apply to All"
      type="warning"
      :loading="store.actionLoading"
      @confirm="handleConfirmApplyToAll"
      @cancel="isApplyAllConfirmOpen = false"
    />

    <!-- Settle Single IB Confirmation -->
    <ConfirmationDialog
      :open="isSettleIbConfirmOpen"
      :title="`Settle Now for IB #${selectedIbId}?`"
      message="This will immediately sum pending commissions for this IB's previous completed period, create a settlement batch, and credit the IB wallet."
      confirm-text="Execute Settlement"
      type="warning"
      :loading="store.runSettlementLoading"
      @confirm="handleConfirmSettleSingleIb"
      @cancel="isSettleIbConfirmOpen = false"
    />

    <!-- Run Due All Confirmation -->
    <ConfirmationDialog
      :open="isRunAllDueConfirmOpen"
      title="Run Due Settlements for All IBs?"
      message="This will process all IBs currently in their settlement window, sum their pending commissions for the previous period, and credit their respective wallets."
      confirm-text="Run Due Settlements"
      type="warning"
      :loading="store.runSettlementLoading"
      @confirm="handleConfirmRunAllDue"
      @cancel="isRunAllDueConfirmOpen = false"
    />

    <!-- Run / Dry-Run Result Preview Modal -->
    <SettlementRunResultModal
      v-model="isRunResultModalOpen"
      :result="runResultData"
      :is-dry-run="isRunResultDryRun"
    />

    <!-- Batch Metadata Details Modal -->
    <BatchDetailsModal
      v-model="isBatchDetailsModalOpen"
      :batch="selectedBatchForDetails"
    />
  </div>
</template>
