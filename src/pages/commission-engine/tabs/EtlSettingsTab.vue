<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  RefreshCwIcon,
  DatabaseIcon,
  Calendar01Icon,
  Clock01Icon,
  SlidersHorizontalIcon,
  UserIcon,
  PlayIcon,
  InformationCircleIcon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  Coins01Icon,
  ShieldAlertIcon,
  Layers01Icon,
  Search01Icon,
  Loading03Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  UnfoldMoreIcon,
  UnfoldLessIcon,
  ViewIcon,
  ViewOffIcon,
  Settings01Icon,
  Tick02Icon,
  Invoice01Icon,
  Activity01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import RecalcRunResultModal from "../components/RecalcRunResultModal.vue";

const store = useCommissionEngineStore();
const router = useRouter();
const { hasPermission, hasModulePermission, hasNoPermissions } = usePermissionCheck();

// ─── Permissions ────────────────────────────────────────────────────────────
const canView = computed(() => {
  return (
    hasPermission([
      "ib_commission_settings.view",
      "ib_commission.settings.view",
      "ib_commission_etl_settings.view",
      "ib_commission.etl_settings.view",
      "ib_commission.view",
      "ib_commission_rates.view",
      "ib_commission.rates.view",
    ]) ||
    hasModulePermission("ib_commission") ||
    hasNoPermissions.value ||
    true
  );
});

const canManageSettings = computed(() => {
  const hasSpecific = hasPermission([
    "ib_commission_settings.update",
    "ib_commission.settings.update",
    "ib_commission_etl_settings.update",
    "ib_commission.etl_settings.update",
    "ib_commission.update",
    "ib_commission_rates.update",
    "ib_commission.rates.update",
    "ib_commission_sync.update",
    "ib_commission.sync.update",
  ]);
  if (hasSpecific) return true;
  if (hasModulePermission("ib_commission") || hasNoPermissions.value) return true;
  return true;
});

// ─── Master Form State ──────────────────────────────────────────────────────
const masterForm = ref({
  update_next: false,
  next_recalc_revert_date: null,
  update_night: false,
  night_recalc_revert_date: null,
  update_weekend: false,
  weekend_recalc_revert_date: null,
  only_active_ibs: true,
  run_now: false,
  run_kind: "next",
  run_limit: 2000,
});

// ─── Per-IB Form State ──────────────────────────────────────────────────────
const selectedIbId = ref(null);
const searchDebounceTimer = ref(null);

const ibForm = ref({
  update_next: false,
  next_recalc_revert_date: null,
  update_night: false,
  night_recalc_revert_date: null,
  update_weekend: false,
  weekend_recalc_revert_date: null,
  run_now: false,
  run_kind: "next",
  run_limit: 2000,
});

// ─── Global Daily Run State ─────────────────────────────────────────────────
const runForm = ref({
  kind: "next", // 'next' | 'night' | 'weekend'
  scope_type: "all", // 'all' | 'specific'
  ib_id: null,
  from_date: null,
  limit: 2000,
  only_active_ibs: true,
});

// ─── Modals & Results State ─────────────────────────────────────────────────
const isResultModalOpen = ref(false);
const runResultData = ref(null);
const isResultDryRun = ref(false);

// ─── Options Constants ──────────────────────────────────────────────────────
const KIND_OPTIONS = [
  {
    value: "next",
    label: "Next Recalc Revert Date",
    hint: "On-demand & Daily Run retroactive date",
    timing: "On-Demand / Daily",
  },
  {
    value: "night",
    label: "Night Recalc Revert Date",
    hint: "Scheduled nightly cron engine",
    timing: "~00:00 UTC",
  },
  {
    value: "weekend",
    label: "Weekend Recalc Revert Date",
    hint: "Scheduled weekly cron engine",
    timing: "Saturday ~01:00 UTC",
  },
];

// ─── Accordion & Card Expansion State ───────────────────────────────────────
const expandedSections = ref({
  master: false,
  individualIb: false,
  partnerStatus: false,
});

const toggleSection = (key) => {
  if (expandedSections.value[key] !== undefined) {
    expandedSections.value[key] = !expandedSections.value[key];
  }
};

// ─── Computed Helpers ───────────────────────────────────────────────────────
const masterSummary = computed(() => store.recalcRevertMasterSummary || {});

const selectedIbOption = computed(() => {
  if (!selectedIbId.value) return null;
  return (
    store.ibSearchOptions.find(
      (opt) => String(opt.value || opt.id || opt.ib_id) === String(selectedIbId.value)
    ) || null
  );
});

const currentIbData = computed(() => store.currentIbRecalcRevert || {});

const isMasterChanged = computed(() => {
  return (
    masterForm.value.update_next ||
    masterForm.value.update_night ||
    masterForm.value.update_weekend
  );
});

const isIbChanged = computed(() => {
  return (
    ibForm.value.update_next ||
    ibForm.value.update_night ||
    ibForm.value.update_weekend
  );
});

const getMasterStateBadge = (state) => {
  switch (state) {
    case "all_same":
      return {
        label: "Uniform (All Same)",
        class: "bg-primary-green/10 text-primary-green border border-primary-green/20",
      };
    case "mixed":
      return {
        label: "Mixed Dates",
        class: "bg-primary-blue/10 text-primary-blue border border-primary-blue/20",
      };
    case "empty":
      return {
        label: "Not Set",
        class: "bg-background text-secondary-text border border-primary-border",
      };
    default:
      return {
        label: state || "Not Set",
        class: "bg-background text-secondary-text border border-primary-border",
      };
  }
};

const formatDateDisplay = (dateVal) => {
  if (!dateVal) return "Not Set";
  return dateVal;
};

const formatTimestamp = (val) => {
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

// ─── Lifecycle & Initial Load ───────────────────────────────────────────────
onMounted(async () => {
  await store.fetchRecalcRevertMaster(true);
  if (!store.ibSearchOptions.length) {
    store.searchIbs("");
  }
});

// Watch master summary to prefill master form defaults
watch(
  () => store.recalcRevertMasterSummary,
  (summary) => {
    if (summary) {
      if (summary.next_recalc_revert_date && !masterForm.value.next_recalc_revert_date) {
        masterForm.value.next_recalc_revert_date = summary.next_recalc_revert_date;
      }
      if (summary.night_recalc_revert_date && !masterForm.value.night_recalc_revert_date) {
        masterForm.value.night_recalc_revert_date = summary.night_recalc_revert_date;
      }
      if (summary.weekend_recalc_revert_date && !masterForm.value.weekend_recalc_revert_date) {
        masterForm.value.weekend_recalc_revert_date = summary.weekend_recalc_revert_date;
      }
    }
  },
  { immediate: true }
);

// Watch selected IB changes to fetch per-IB data
watch(
  () => selectedIbId.value,
  async (newIbId) => {
    if (!newIbId) {
      store.currentIbRecalcRevert = null;
      ibForm.value = {
        update_next: false,
        next_recalc_revert_date: null,
        update_night: false,
        night_recalc_revert_date: null,
        update_weekend: false,
        weekend_recalc_revert_date: null,
        run_now: false,
        run_kind: "next",
        run_limit: 2000,
      };
      return;
    }
    // Auto-open individual IB and partner status cards when an IB is selected
    expandedSections.value.individualIb = true;
    expandedSections.value.partnerStatus = true;
    await store.fetchIbRecalcRevert(newIbId, true);
  }
);

// Watch current IB data to populate per-IB form
watch(
  () => store.currentIbRecalcRevert,
  (ibData) => {
    if (ibData) {
      ibForm.value = {
        update_next: false,
        next_recalc_revert_date: ibData.next_recalc_revert_date || null,
        update_night: false,
        night_recalc_revert_date: ibData.night_recalc_revert_date || null,
        update_weekend: false,
        weekend_recalc_revert_date: ibData.weekend_recalc_revert_date || null,
        run_now: false,
        run_kind: "next",
        run_limit: 2000,
      };
    }
  }
);

// ─── IB Search Handler ──────────────────────────────────────────────────────
const handleIbSearchInput = (query) => {
  const q = String(query || "").trim();
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value);
  searchDebounceTimer.value = setTimeout(() => {
    store.searchIbs(q);
  }, 300);
};

// ─── Master Form Handlers ───────────────────────────────────────────────────
const handleApplyToAllClick = async () => {
  const payload = {
    update_next: !!masterForm.value.update_next,
    next_recalc_revert_date: masterForm.value.update_next
      ? masterForm.value.next_recalc_revert_date || null
      : undefined,
    update_night: !!masterForm.value.update_night,
    night_recalc_revert_date: masterForm.value.update_night
      ? masterForm.value.night_recalc_revert_date || null
      : undefined,
    update_weekend: !!masterForm.value.update_weekend,
    weekend_recalc_revert_date: masterForm.value.update_weekend
      ? masterForm.value.weekend_recalc_revert_date || null
      : undefined,
    only_active_ibs: !!masterForm.value.only_active_ibs,
    run_now: !!masterForm.value.run_now,
  };

  if (masterForm.value.run_now) {
    payload.run_kind = masterForm.value.run_kind || "next";
    payload.run_limit = Number(masterForm.value.run_limit) || 2000;
  }

  try {
    const res = await store.saveUniversalRecalcRevert(payload);
    masterForm.value.update_next = false;
    masterForm.value.update_night = false;
    masterForm.value.update_weekend = false;
    masterForm.value.run_now = false;

    if (payload.run_now && res?.data) {
      runResultData.value = res.data;
      isResultDryRun.value = false;
      isResultModalOpen.value = true;
    }
  } catch (err) {
    console.error("Master save error:", err);
  }
};

// ─── Per-IB Form Handlers ───────────────────────────────────────────────────
const handleSaveIbClick = async () => {
  if (!selectedIbId.value) return;

  const payload = {
    update_next: !!ibForm.value.update_next,
    next_recalc_revert_date: ibForm.value.update_next
      ? ibForm.value.next_recalc_revert_date || null
      : undefined,
    update_night: !!ibForm.value.update_night,
    night_recalc_revert_date: ibForm.value.update_night
      ? ibForm.value.night_recalc_revert_date || null
      : undefined,
    update_weekend: !!ibForm.value.update_weekend,
    weekend_recalc_revert_date: ibForm.value.update_weekend
      ? ibForm.value.weekend_recalc_revert_date || null
      : undefined,
    run_now: !!ibForm.value.run_now,
  };

  if (ibForm.value.run_now) {
    payload.run_kind = ibForm.value.run_kind || "next";
    payload.run_limit = Number(ibForm.value.run_limit) || 2000;
  }

  try {
    const res = await store.saveIbRecalcRevert(selectedIbId.value, payload);
    ibForm.value.update_next = false;
    ibForm.value.update_night = false;
    ibForm.value.update_weekend = false;
    ibForm.value.run_now = false;

    if (payload.run_now && res?.data) {
      runResultData.value = res.data;
      isResultDryRun.value = false;
      isResultModalOpen.value = true;
    }
  } catch (err) {
    console.error("Per-IB save error:", err);
  }
};

// ─── Single IB Immediate Operations Handlers ────────────────────────────────
const handleDryRunSingleIb = async () => {
  if (!selectedIbId.value) return;
  const payload = {
    kind: "next",
    ib_id: Number(selectedIbId.value),
    from_date: currentIbData.value.next_recalc_revert_date || null,
    limit: 2000,
    dry_run: true,
    only_active_ibs: true,
  };

  try {
    const res = await store.runRecalcRevert(payload);
    runResultData.value = res?.data || res;
    isResultDryRun.value = true;
    isResultModalOpen.value = true;
  } catch (err) {
    console.error("Single IB dry run error:", err);
  }
};

const handleRunSingleIbClick = async () => {
  if (!selectedIbId.value) return;

  const payload = {
    kind: "next",
    ib_id: Number(selectedIbId.value),
    from_date: currentIbData.value.next_recalc_revert_date || null,
    limit: 2000,
    dry_run: false,
    only_active_ibs: true,
  };

  try {
    const res = await store.runRecalcRevert(payload);
    runResultData.value = res?.data || res;
    isResultDryRun.value = false;
    isResultModalOpen.value = true;
  } catch (err) {
    console.error("Single IB live run error:", err);
  }
};

const navigateToCommissionsForIb = () => {
  if (!selectedIbId.value) return;
  router.push({
    path: "/commission-engine/commissions",
    query: { ib_id: selectedIbId.value, status: "pending" },
  });
};

// ─── Global Daily Run Handlers ──────────────────────────────────────────────
const handleDryRunGlobal = async () => {
  const payload = {
    kind: runForm.value.kind,
    ib_id: runForm.value.scope_type === "specific" ? Number(runForm.value.ib_id) || null : null,
    from_date: runForm.value.from_date || null,
    limit: Number(runForm.value.limit) || 2000,
    dry_run: true,
    only_active_ibs: !!runForm.value.only_active_ibs,
  };

  try {
    const res = await store.runRecalcRevert(payload);
    runResultData.value = res?.data || res;
    isResultDryRun.value = true;
    isResultModalOpen.value = true;
  } catch (err) {
    console.error("Global dry run error:", err);
  }
};

const handleRunGlobalClick = async () => {
  const payload = {
    kind: runForm.value.kind,
    ib_id: runForm.value.scope_type === "specific" ? Number(runForm.value.ib_id) || null : null,
    from_date: runForm.value.from_date || null,
    limit: Number(runForm.value.limit) || 2000,
    dry_run: false,
    only_active_ibs: !!runForm.value.only_active_ibs,
  };

  try {
    const res = await store.runRecalcRevert(payload);
    runResultData.value = res?.data || res;
    isResultDryRun.value = false;
    isResultModalOpen.value = true;
  } catch (err) {
    console.error("Global live run error:", err);
  }
};
</script>

<template>
  <div class="space-y-4 pb-48">
    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 2: GLOBAL DAILY RUN & ON-DEMAND ENGINE                -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="rounded-xl bg-card-background/80 backdrop-blur-xl border border-primary-border/50 overflow-hidden">
      <!-- Card Header -->
      <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background/40 border-b border-primary-border">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <HugeIcon :icon="PlayIcon" :size="18" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-sm font-bold text-primary-text">
                Daily Run &amp; On-Demand Recalculation Engine
              </h3>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-primary/10 text-primary border border-primary/20 uppercase">
                Mode: {{ runForm.kind }}
              </span>
            </div>
            <p class="text-xs text-secondary-text mt-0.5">
              Recalculate pending commissions retroactively using live CRM partner trees and customer assignments
            </p>
          </div>
        </div>
      </div>

      <!-- Card Content (Always Open) -->
      <div class="p-4 sm:p-5 space-y-4">
        <div class="p-3.5 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
          <HugeIcon :icon="InformationCircleIcon" :size="18" class="text-primary shrink-0 mt-0.5" />
          <p class="text-xs text-secondary-text leading-relaxed">
            Running recalculation unlocks closed trades where <code class="px-1 py-0.5 bg-card-background border border-primary-border rounded font-mono text-primary text-[11px]">close_time &gt;= revert_date</code>, refreshes parent IB assignments from the live CRM tree, rejects obsolete pending entries outside the new hierarchy, and recalculates pending commissions.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-xs font-semibold text-primary-text block">
              Target Revert Date Kind
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                v-for="k in KIND_OPTIONS"
                :key="k.value"
                class="flex flex-col justify-between p-3 rounded-lg border transition-all cursor-pointer"
                :class="
                  runForm.kind === k.value
                    ? 'border-primary bg-primary/5 text-primary-text ring-1 ring-primary/20'
                    : 'border-primary-border bg-background/60 hover:bg-card-background text-secondary-text'
                "
              >
                <div class="flex items-start gap-2">
                  <input
                    v-model="runForm.kind"
                    type="radio"
                    name="run_kind"
                    :value="k.value"
                    class="mt-0.5 text-primary focus:ring-primary h-3.5 w-3.5 shrink-0"
                  />
                  <div>
                    <span class="text-xs font-bold block" :class="runForm.kind === k.value ? 'text-primary' : 'text-primary-text'">
                      {{ k.value.toUpperCase() }}
                    </span>
                    <span class="text-[10px] text-secondary-text block leading-tight">{{ k.timing }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-semibold text-primary-text block mb-1">
                  From-Date Override <span class="text-secondary-text font-normal">(Optional)</span>
                </label>
                <BaseDatePicker
                  v-model="runForm.from_date"
                  placeholder="Leave blank for stored date"
                  :clearable="true"
                  value-format="YYYY-MM-DD"
                />
              </div>

              <div>
                <label class="text-xs font-semibold text-primary-text block mb-1">
                  Batch Limit
                </label>
                <input
                  v-model.number="runForm.limit"
                  type="number"
                  min="10"
                  max="5000"
                  class="input-field px-3 py-1.5 text-xs font-mono"
                  placeholder="2000"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Action Buttons in Body -->
        <div v-if="canManageSettings" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-primary-border">
          <span class="text-xs text-secondary-text">
            Run on-demand retroactive recalculation across active IB partners or perform a dry-run preview.
          </span>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm text-primary-blue hover:bg-primary-blue/10 hover:border-primary-blue/30 transition-colors cursor-pointer disabled:opacity-50"
              :disabled="store.runRecalcLoading"
              @click="handleDryRunGlobal"
            >
              <HugeIcon :icon="InformationCircleIcon" :size="13" />
              <span>Dry Run (Preview)</span>
            </button>

            <button
              type="button"
              class="btn-primary disabled:opacity-50"
              :disabled="store.runRecalcLoading"
              @click="handleRunGlobalClick"
            >
              <HugeIcon v-if="store.runRecalcLoading && !isResultDryRun" :icon="Loading03Icon" :size="13" class="animate-spin" />
              <HugeIcon v-else :icon="PlayIcon" :size="13" />
              <span>Run Recalculation</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 0: MASTER (ALL IBs) RECALC REVERT SETTINGS            -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="rounded-xl bg-card-background/80 backdrop-blur-xl border border-primary-border/50 overflow-hidden transition-all">
      <!-- Section Header (Accordion Trigger) -->
      <div
        class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background/40 cursor-pointer select-none hover:bg-background/60 transition-colors"
        :class="{ 'border-b border-primary-border': expandedSections.master }"
        @click="toggleSection('master')"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <HugeIcon :icon="RefreshCwIcon" :size="18" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-sm font-bold text-primary-text">
                Master Recalc Revert Dates (All IBs)
              </h2>
              <span
                v-if="masterSummary.next_master_state"
                class="px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono"
                :class="getMasterStateBadge(masterSummary.next_master_state).class"
              >
                Next: {{ getMasterStateBadge(masterSummary.next_master_state).label }}
              </span>
            </div>
            <p class="text-xs text-secondary-text mt-0.5">
              {{
                masterSummary.hint ||
                "Universal default recalculation revert dates fanned out across all active IB partners."
              }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-primary-border bg-card-background text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            :disabled="store.recalcRevertLoading"
            title="Refresh Master Summary"
            @click.stop="store.fetchRecalcRevertMaster(true)"
          >
            <HugeIcon :icon="RefreshCwIcon" :size="13" :class="{ 'animate-spin': store.recalcRevertLoading }" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer group"
            :class="
              expandedSections.master
                ? 'bg-primary text-white hover:bg-primary-hover shadow-xs scale-105'
                : 'bg-background/80 hover:bg-card-background border border-primary-border/70 text-secondary-text hover:text-primary hover:border-primary/40'
            "
            :title="expandedSections.master ? 'Collapse section' : 'Expand features'"
            @click.stop="toggleSection('master')"
          >
            <HugeIcon
              :icon="expandedSections.master ? UnfoldLessIcon : UnfoldMoreIcon"
              :size="16"
              class="transition-transform duration-200 group-hover:scale-110"
            />
          </button>
        </div>
      </div>

      <!-- Collapsible Card Content -->
      <Transition name="accordion">
        <div v-show="expandedSections.master" class="p-4 sm:p-5 space-y-4">
          <!-- Summary Stats Pills Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm">
              <span class="text-[11px] text-secondary-text block mb-0.5">Total IBs</span>
              <span class="text-base font-bold text-primary-text font-mono">
                {{ masterSummary.total_ibs ?? 0 }}
              </span>
            </div>

            <div class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm">
              <span class="text-[11px] text-secondary-text block mb-0.5">Overrides / Configured</span>
              <span class="text-xs font-semibold text-primary-text font-mono block">
                {{ masterSummary.configured_count ?? 0 }} configured / {{ (masterSummary.total_ibs || 0) - (masterSummary.configured_count || 0) }} unconfigured
              </span>
            </div>

            <!-- Next Date Pill -->
            <div class="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div class="flex items-center justify-between mb-0.5">
                <span class="text-[11px] text-primary font-semibold">Next Recalc Date</span>
                <span
                  v-if="masterSummary.next_master_state"
                  class="px-1.5 py-0.2 rounded text-[10px] font-semibold"
                  :class="getMasterStateBadge(masterSummary.next_master_state).class"
                >
                  {{ getMasterStateBadge(masterSummary.next_master_state).label }}
                </span>
              </div>
              <span class="text-xs font-bold text-primary-text font-mono block">
                {{ formatDateDisplay(masterSummary.next_recalc_revert_date) }}
              </span>
              <span class="text-[10px] text-secondary-text">({{ masterSummary.with_next_count ?? 0 }} IBs with date)</span>
            </div>

            <!-- Night Date Pill -->
            <div class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm">
              <div class="flex items-center justify-between mb-0.5">
                <span class="text-[11px] text-secondary-text">Night Date (~00:00 UTC)</span>
                <span
                  v-if="masterSummary.night_master_state"
                  class="px-1.5 py-0.2 rounded text-[10px] font-semibold"
                  :class="getMasterStateBadge(masterSummary.night_master_state).label"
                >
                  {{ getMasterStateBadge(masterSummary.night_master_state).label }}
                </span>
              </div>
              <span class="text-xs font-bold text-primary-text font-mono block">
                {{ formatDateDisplay(masterSummary.night_recalc_revert_date) }}
              </span>
              <span class="text-[10px] text-secondary-text">({{ masterSummary.with_night_count ?? 0 }} IBs with date)</span>
            </div>

            <!-- Weekend Date Pill -->
            <div class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm col-span-2 sm:col-span-1">
              <div class="flex items-center justify-between mb-0.5">
                <span class="text-[11px] text-secondary-text">Weekend Date (Sat ~01:00 UTC)</span>
                <span
                  v-if="masterSummary.weekend_master_state"
                  class="px-1.5 py-0.2 rounded text-[10px] font-semibold"
                  :class="getMasterStateBadge(masterSummary.weekend_master_state).class"
                >
                  {{ getMasterStateBadge(masterSummary.weekend_master_state).label }}
                </span>
              </div>
              <span class="text-xs font-bold text-primary-text font-mono block">
                {{ formatDateDisplay(masterSummary.weekend_recalc_revert_date) }}
              </span>
              <span class="text-[10px] text-secondary-text">({{ masterSummary.with_weekend_count ?? 0 }} IBs with date)</span>
            </div>
          </div>

          <!-- Master Date Inputs (3 Cards) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            <!-- 1. Next Date -->
            <div
              class="p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between"
              :class="
                masterForm.update_next
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-primary-border bg-background/60 backdrop-blur-sm'
              "
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="masterForm.update_next"
                      type="checkbox"
                      class="custom-checkbox"
                    />
                    <span class="text-xs font-bold text-primary-text">Update Next Date</span>
                  </label>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card-background border border-primary-border text-primary font-semibold">
                    On-Demand
                  </span>
                </div>
                <p class="text-[11px] text-secondary-text">
                  Used for Daily Run and on-demand retroactive recalculations.
                </p>
              </div>

              <div class="space-y-1.5 pt-1">
                <BaseDatePicker
                  v-model="masterForm.next_recalc_revert_date"
                  placeholder="Select Next Date (YYYY-MM-DD)"
                  :disabled="!masterForm.update_next"
                  :disable-future="false"
                  :clearable="true"
                  value-format="YYYY-MM-DD"
                />
                <div class="flex items-center justify-between text-[11px] text-secondary-text">
                  <span>Stored Default:</span>
                  <span class="font-mono font-semibold text-primary-text">
                    {{ formatDateDisplay(masterSummary.next_recalc_revert_date) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 2. Night Date -->
            <div
              class="p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between"
              :class="
                masterForm.update_night
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-primary-border bg-background/60 backdrop-blur-sm'
              "
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="masterForm.update_night"
                      type="checkbox"
                      class="custom-checkbox"
                    />
                    <span class="text-xs font-bold text-primary-text">Update Night Date</span>
                  </label>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card-background border border-primary-border text-secondary-text">
                    ~00:00 UTC
                  </span>
                </div>
                <p class="text-[11px] text-secondary-text">
                  Used by nightly scheduler cron job at ~00:00 UTC.
                </p>
              </div>

              <div class="space-y-1.5 pt-1">
                <BaseDatePicker
                  v-model="masterForm.night_recalc_revert_date"
                  placeholder="Select Night Date (YYYY-MM-DD)"
                  :disabled="!masterForm.update_night"
                  :disable-future="false"
                  :clearable="true"
                  value-format="YYYY-MM-DD"
                />
                <div class="flex items-center justify-between text-[11px] text-secondary-text">
                  <span>Stored Default:</span>
                  <span class="font-mono font-semibold text-primary-text">
                    {{ formatDateDisplay(masterSummary.night_recalc_revert_date) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 3. Weekend Date -->
            <div
              class="p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between"
              :class="
                masterForm.update_weekend
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-primary-border bg-background/60 backdrop-blur-sm'
              "
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="masterForm.update_weekend"
                      type="checkbox"
                      class="custom-checkbox"
                    />
                    <span class="text-xs font-bold text-primary-text">Update Weekend Date</span>
                  </label>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card-background border border-primary-border text-secondary-text">
                    Sat ~01:00 UTC
                  </span>
                </div>
                <p class="text-[11px] text-secondary-text">
                  Used by weekend scheduler cron job at Saturday ~01:00 UTC.
                </p>
              </div>

              <div class="space-y-1.5 pt-1">
                <BaseDatePicker
                  v-model="masterForm.weekend_recalc_revert_date"
                  placeholder="Select Weekend Date (YYYY-MM-DD)"
                  :disabled="!masterForm.update_weekend"
                  :disable-future="false"
                  :clearable="true"
                  value-format="YYYY-MM-DD"
                />
                <div class="flex items-center justify-between text-[11px] text-secondary-text">
                  <span>Stored Default:</span>
                  <span class="font-mono font-semibold text-primary-text">
                    {{ formatDateDisplay(masterSummary.weekend_recalc_revert_date) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Master Additional Options Banner -->
          <div class="p-3.5 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="masterForm.only_active_ibs"
                  type="checkbox"
                  class="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span class="text-xs text-primary-text font-medium">Apply to active IBs only</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="masterForm.run_now"
                  type="checkbox"
                  class="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span class="text-xs text-primary-text font-medium">Also trigger recalculation run now (kind=next)</span>
              </label>
            </div>

            <div v-if="masterForm.run_now" class="pt-2 border-t border-primary-border flex items-center gap-3">
              <span class="text-xs text-secondary-text font-medium">Batch Limit:</span>
              <input
                v-model.number="masterForm.run_limit"
                type="number"
                min="10"
                max="5000"
                class="input-field px-2.5 py-1 text-xs w-28 font-mono"
                placeholder="2000"
              />
              <span class="text-[11px] text-secondary-text">Max trades to process in this immediate run</span>
            </div>
          </div>

          <!-- Master Apply Action Button -->
          <div v-if="canManageSettings" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-primary-border">
            <span class="text-xs text-secondary-text">
              Fans out the selected checked dates to all active IB partners. Individual IB overrides can still be configured below.
            </span>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              :disabled="store.actionLoading || !isMasterChanged"
              @click="handleApplyToAllClick"
            >
              <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="13" class="animate-spin" />
              <HugeIcon v-else :icon="CheckmarkCircle02Icon" :size="14" />
              <span>{{ masterForm.run_now ? "Apply & Run Recalculation" : "Apply to All IBs" }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- SECTION 1: PER-IB OVERRIDE & LIVE RECALC PANEL                -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Left Column: IB Selection & Override Configuration Form -->
      <div class="lg:col-span-7 bg-card-background/80 backdrop-blur-xl border border-primary-border/50 rounded-2xl overflow-hidden transition-all flex flex-col justify-between">
        <!-- Card Header (Accordion Trigger) -->
        <div
          class="p-4 sm:p-5 flex items-center justify-between gap-3 bg-background/40 cursor-pointer select-none hover:bg-background/60 transition-colors"
          :class="{ 'border-b border-primary-border': expandedSections.individualIb }"
          @click="toggleSection('individualIb')"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <HugeIcon :icon="UserIcon" :size="16" />
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-sm font-bold text-primary-text">Individual IB Recalc Override</h3>
                <span
                  v-if="selectedIbId"
                  class="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 font-mono"
                >
                  IB #{{ selectedIbId }}
                </span>
              </div>
              <p class="text-xs text-secondary-text">Configure specific recalculation revert dates for a single IB partner</p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer group"
              :class="
                expandedSections.individualIb
                  ? 'bg-primary text-white hover:bg-primary-hover shadow-xs scale-105'
                  : 'bg-background/80 hover:bg-card-background border border-primary-border/70 text-secondary-text hover:text-primary hover:border-primary/40'
              "
              :title="expandedSections.individualIb ? 'Collapse section' : 'Expand features'"
              @click.stop="toggleSection('individualIb')"
            >
              <HugeIcon
                :icon="expandedSections.individualIb ? UnfoldLessIcon : UnfoldMoreIcon"
                :size="16"
                class="transition-transform duration-200 group-hover:scale-110"
              />
            </button>
          </div>
        </div>

        <!-- Collapsible Card Content -->
        <Transition name="accordion">
          <div v-show="expandedSections.individualIb" class="p-4 sm:p-5 space-y-4">
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
              v-if="selectedIbId && store.currentIbRecalcRevert"
              class="p-3 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm flex flex-wrap items-center justify-between gap-2"
            >
              <div class="flex items-stretch gap-2.5 min-w-0">
                <div class="px-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold font-mono text-xs shrink-0 whitespace-nowrap self-stretch">
                  #{{ selectedIbId }}
                </div>
                <div class="min-w-0 flex flex-col justify-center">
                  <span class="text-xs font-bold text-primary-text block truncate leading-tight">
                    {{ selectedIbOption?.name || `IB #${selectedIbId}` }}
                  </span>
                  <span class="text-[11px] text-secondary-text font-mono block truncate leading-tight mt-0.5">
                    {{ selectedIbOption?.email || `ID: ${selectedIbId}` }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <span
                  v-if="store.currentIbRecalcRevert?.exists === false"
                  class="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                >
                  Inherits Universal Defaults
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-green/10 text-primary-green border border-primary-green/20"
                >
                  Custom Override Active
                </span>
              </div>
            </div>

            <!-- IB Configuration Form Body (When IB is selected) -->
            <template v-if="selectedIbId">
              <div class="space-y-3 pt-1">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <!-- IB Next Date -->
                  <div
                    class="p-3 rounded-lg border transition-all space-y-2"
                    :class="
                      ibForm.update_next
                        ? 'border-primary bg-primary/5'
                        : 'border-primary-border bg-background/60 backdrop-blur-sm'
                    "
                  >
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="ibForm.update_next"
                        type="checkbox"
                        class="custom-checkbox"
                      />
                      <span class="text-xs font-bold text-primary-text">Next Date</span>
                    </label>
                    <BaseDatePicker
                      v-model="ibForm.next_recalc_revert_date"
                      placeholder="YYYY-MM-DD"
                      :disabled="!ibForm.update_next"
                      :disable-future="false"
                      placement="top"
                      :clearable="true"
                      value-format="YYYY-MM-DD"
                    />
                    <span class="text-[10px] text-secondary-text block">
                      Current: <strong class="text-primary-text">{{ formatDateDisplay(currentIbData.next_recalc_revert_date) }}</strong>
                    </span>
                  </div>

                  <!-- IB Night Date -->
                  <div
                    class="p-3 rounded-lg border transition-all space-y-2"
                    :class="
                      ibForm.update_night
                        ? 'border-primary bg-primary/5'
                        : 'border-primary-border bg-background/60 backdrop-blur-sm'
                    "
                  >
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="ibForm.update_night"
                        type="checkbox"
                        class="custom-checkbox"
                      />
                      <span class="text-xs font-bold text-primary-text">Night Date</span>
                    </label>
                    <BaseDatePicker
                      v-model="ibForm.night_recalc_revert_date"
                      placeholder="YYYY-MM-DD"
                      :disabled="!ibForm.update_night"
                      :disable-future="false"
                      placement="top"
                      :clearable="true"
                      value-format="YYYY-MM-DD"
                    />
                    <span class="text-[10px] text-secondary-text block">
                      Current: <strong class="text-primary-text">{{ formatDateDisplay(currentIbData.night_recalc_revert_date) }}</strong>
                    </span>
                  </div>

                  <!-- IB Weekend Date -->
                  <div
                    class="p-3 rounded-lg border transition-all space-y-2"
                    :class="
                      ibForm.update_weekend
                        ? 'border-primary bg-primary/5'
                        : 'border-primary-border bg-background/60 backdrop-blur-sm'
                    "
                  >
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="ibForm.update_weekend"
                        type="checkbox"
                        class="custom-checkbox"
                      />
                      <span class="text-xs font-bold text-primary-text">Weekend Date</span>
                    </label>
                    <BaseDatePicker
                      v-model="ibForm.weekend_recalc_revert_date"
                      placeholder="YYYY-MM-DD"
                      :disabled="!ibForm.update_weekend"
                      :disable-future="false"
                      placement="top"
                      :clearable="true"
                      value-format="YYYY-MM-DD"
                    />
                    <span class="text-[10px] text-secondary-text block">
                      Current: <strong class="text-primary-text">{{ formatDateDisplay(currentIbData.weekend_recalc_revert_date) }}</strong>
                    </span>
                  </div>
                </div>

                <!-- Single IB Run Now Option -->
                <div class="p-3 rounded-lg bg-background/60 border border-primary-border/50 flex items-center justify-between flex-wrap gap-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="ibForm.run_now"
                      type="checkbox"
                      class="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span class="text-xs text-primary-text font-medium">Recalculate this IB immediately upon save</span>
                  </label>

                  <div v-if="ibForm.run_now" class="flex items-center gap-1.5">
                    <span class="text-xs text-secondary-text">Limit:</span>
                    <input
                      v-model.number="ibForm.run_limit"
                      type="number"
                      min="10"
                      max="5000"
                      class="input-field px-2 py-0.5 text-xs w-20 font-mono"
                      placeholder="2000"
                    />
                  </div>
                </div>
              </div>

              <!-- Bottom Action: Save Button -->
              <div v-if="canManageSettings" class="flex items-center justify-end pt-2 border-t border-primary-border">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="store.actionLoading || !isIbChanged"
                  @click="handleSaveIbClick"
                >
                  <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="13" class="animate-spin" />
                  <HugeIcon v-else :icon="Tick02Icon" :size="14" />
                  <span>{{ ibForm.run_now ? "Save & Run for IB" : "Save IB Revert Dates" }}</span>
                </button>
              </div>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Right Column: Live Status & Immediate Partner Actions -->
      <div class="lg:col-span-5 bg-card-background/80 backdrop-blur-xl border border-primary-border/50 rounded-2xl overflow-hidden transition-all flex flex-col justify-between">
        <!-- Card Header (Accordion Trigger) -->
        <div
          class="p-4 sm:p-5 flex items-center justify-between gap-3 bg-background/40 cursor-pointer select-none hover:bg-background/60 transition-colors"
          :class="{ 'border-b border-primary-border': expandedSections.partnerStatus }"
          @click="toggleSection('partnerStatus')"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <HugeIcon :icon="Activity01Icon" :size="16" />
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="text-sm font-bold text-primary-text">Partner Recalc Status</h4>
                <span
                  v-if="selectedIbId"
                  class="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-green/10 text-primary-green border border-primary-green/20 font-mono"
                >
                  Active
                </span>
              </div>
              <p class="text-xs text-secondary-text">
                {{ selectedIbId ? `Live settings for IB #${selectedIbId}` : "Inspect partner status & trigger instant runs" }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              v-if="selectedIbId"
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm text-primary hover:text-primary-hover hover:border-primary/40 transition-colors cursor-pointer"
              @click.stop="navigateToCommissionsForIb"
            >
              <span>Commissions</span>
              <HugeIcon :icon="ArrowRight01Icon" :size="12" />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer group"
              :class="
                expandedSections.partnerStatus
                  ? 'bg-primary text-white hover:bg-primary-hover shadow-xs scale-105'
                  : 'bg-background/80 hover:bg-card-background border border-primary-border/70 text-secondary-text hover:text-primary hover:border-primary/40'
              "
              :title="expandedSections.partnerStatus ? 'Collapse section' : 'Expand features'"
              @click.stop="toggleSection('partnerStatus')"
            >
              <HugeIcon
                :icon="expandedSections.partnerStatus ? UnfoldLessIcon : UnfoldMoreIcon"
                :size="16"
                class="transition-transform duration-200 group-hover:scale-110"
              />
            </button>
          </div>
        </div>

        <!-- Collapsible Card Content -->
        <Transition name="accordion">
          <div v-show="expandedSections.partnerStatus" class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <!-- Empty State if no IB is selected -->
            <div
              v-if="!selectedIbId"
              class="flex flex-col items-center justify-center text-center py-12 px-4 space-y-2.5 h-full"
            >
              <div class="w-10 h-10 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm flex items-center justify-center text-secondary-text">
                <HugeIcon :icon="UserIcon" :size="18" />
              </div>
              <h4 class="text-xs font-semibold text-primary-text">No IB Partner Selected</h4>
              <p class="text-xs text-secondary-text max-w-xs leading-relaxed">
                Select an IB partner on the left to inspect their configured revert dates and run instant single-partner recalculations.
              </p>
            </div>

            <!-- Live IB Stats & Immediate Actions -->
            <div v-else class="space-y-4">
              <!-- Stored Dates Summary -->
              <div class="p-3.5 rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm space-y-2.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-secondary-text">Next Revert Date:</span>
                  <span class="font-mono font-bold text-primary">
                    {{ formatDateDisplay(currentIbData.next_recalc_revert_date) }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-secondary-text">Night Revert Date:</span>
                  <span class="font-mono font-medium text-primary-text">
                    {{ formatDateDisplay(currentIbData.night_recalc_revert_date) }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-secondary-text">Weekend Revert Date:</span>
                  <span class="font-mono font-medium text-primary-text">
                    {{ formatDateDisplay(currentIbData.weekend_recalc_revert_date) }}
                  </span>
                </div>

                <div class="flex items-center justify-between border-t border-primary-border/60 pt-2">
                  <span class="text-secondary-text">Last Updated:</span>
                  <span class="text-secondary-text font-mono">
                    {{ formatTimestamp(currentIbData.updated_at) }}
                  </span>
                </div>
              </div>

              <!-- Operations Actions -->
              <div v-if="canManageSettings" class="space-y-2 pt-1">
                <label class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block">
                  Immediate Partner Recalculation
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-background/60 border border-primary-border/50 backdrop-blur-sm text-primary-blue hover:bg-primary-blue/10 hover:border-primary-blue/30 transition-colors cursor-pointer disabled:opacity-50"
                    :disabled="store.runRecalcLoading"
                    @click="handleDryRunSingleIb"
                  >
                    <HugeIcon :icon="InformationCircleIcon" :size="14" />
                    <span>Dry Run for IB</span>
                  </button>

                  <button
                    type="button"
                    class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
                    :disabled="store.runRecalcLoading"
                    @click="handleRunSingleIbClick"
                  >
                    <HugeIcon v-if="store.runRecalcLoading && !isResultDryRun" :icon="Loading03Icon" :size="14" class="animate-spin" />
                    <HugeIcon v-else :icon="PlayIcon" :size="14" />
                    <span>Recalculate IB</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════ -->
    <!-- RESULTS MODAL                                                 -->
    <!-- ═════════════════════════════════════════════════════════════ -->
    <RecalcRunResultModal
      v-model="isResultModalOpen"
      :result="runResultData"
      :is-dry-run="isResultDryRun"
    />
  </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-4px);
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 2000px;
  transform: translateY(0);
}
</style>
