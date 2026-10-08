<script setup>
import { computed, onMounted } from "vue";
import {
  DatabaseIcon,
  RefreshCwIcon,
  Loading03Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  InformationCircleIcon,
  Time02Icon,
  Coins01Icon,
  Layers01Icon,
  SlidersHorizontalIcon,
  Activity01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const store = useCommissionEngineStore();
const { hasPermission } = usePermissionCheck();

const canSync = computed(() =>
  hasPermission(["ib_commission_sync.update", "ib_commission.sync.update"])
);

onMounted(() => {
  if (!store.isFetched.syncStatus) {
    store.fetchSyncStatus();
  }
});

const isConfigured = computed(() => store.syncStatus?.configured !== false);
const cursor = computed(() => store.syncStatus?.cursor || {});
const totals = computed(() => store.syncStatus?.totals || {});

const handleSyncDeals = () => {
  store.triggerDealsSync();
};

const handleSyncSymbols = () => {
  store.triggerSymbolsSync();
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
        second: "2-digit",
      });
};
</script>

<template>
  <div class="space-y-4">
    <!-- Top Action & Overview Card -->
    <div
      class="bg-card-background border border-primary-border rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3.5">
        <div
          class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0"
        >
          <HugeIcon :icon="DatabaseIcon" :size="20" />
        </div>
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h2 class="text-sm text-primary-text font-bold tracking-tight">
              ETL Sync Status &amp; Health
            </h2>
            <span
              v-if="store.syncStatus"
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold font-mono"
              :class="
                isConfigured
                  ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                  : 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20'
              "
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="isConfigured ? 'bg-primary-green' : 'bg-primary-yellow'"
              />
              {{ isConfigured ? "Report DB Connected" : "Report DB Not Configured" }}
            </span>
          </div>
          <p class="text-xs text-secondary-text mt-0.5">
            Continuous background synchronization of MT5 trading deals, symbol catalogs, and watermark cursors
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
        <button
          type="button"
          :disabled="store.syncLoading"
          class="p-2 border border-primary-border rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Sync Status"
          @click="store.fetchSyncStatus(true)"
        >
          <HugeIcon
            :icon="RefreshCwIcon"
            :size="14"
            :class="{ 'animate-spin': store.syncLoading }"
          />
        </button>

        <button
          v-if="canSync"
          type="button"
          :disabled="store.actionLoading || !isConfigured"
          class="flex items-center gap-1.5 px-3 py-2 bg-background border border-primary-border hover:bg-card-background text-primary-text text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleSyncSymbols"
        >
          <HugeIcon
            v-if="store.actionLoading"
            :icon="Loading03Icon"
            :size="13"
            class="animate-spin"
          />
          <HugeIcon v-else :icon="RefreshCwIcon" :size="13" />
          <span>Sync Symbols</span>
        </button>

        <button
          v-if="canSync"
          type="button"
          :disabled="store.actionLoading || !isConfigured"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleSyncDeals"
        >
          <HugeIcon
            v-if="store.actionLoading"
            :icon="Loading03Icon"
            :size="13"
            class="animate-spin"
          />
          <HugeIcon v-else :icon="DatabaseIcon" :size="13" />
          <span>Sync Deals Now</span>
        </button>
      </div>
    </div>

    <!-- DB Warning Notice if Not Configured -->
    <div
      v-if="!isConfigured"
      class="p-4 rounded-lg bg-primary-yellow/10 border border-primary-yellow/20 flex items-start gap-3 text-xs"
    >
      <HugeIcon :icon="Alert02Icon" :size="18" class="text-primary-yellow shrink-0 mt-0.5" />
      <div class="space-y-0.5">
        <p class="font-bold text-primary-text">
          Report Database Environment Not Configured
        </p>
        <p class="text-secondary-text leading-relaxed">
          The MT5 report database credentials are not configured on this environment. Symbol group management and rates setup remain fully functional, while automated deal ETL ingestion is paused.
        </p>
      </div>
    </div>

    <!-- ─── SKELETON LOADER STATE ─── -->
    <div v-if="store.syncLoading && !store.syncStatus" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="n in 4" :key="n" class="h-20 bg-card-background border border-primary-border rounded-lg animate-pulse" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="h-56 bg-card-background border border-primary-border rounded-lg animate-pulse" />
        <div class="h-56 bg-card-background border border-primary-border rounded-lg animate-pulse" />
      </div>
    </div>

    <!-- ─── ACTUAL CONTENT STATE ─── -->
    <template v-else-if="store.syncStatus">
      <!-- Top Metric Cards Grid (4 Columns) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Synced Deals -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
              Total Synced Deals
            </p>
            <div class="text-xl font-bold font-mono text-primary-text">
              {{ totals.ibc_deals_approx !== undefined ? Number(totals.ibc_deals_approx).toLocaleString() : '—' }}
            </div>
            <p class="text-[10px] text-secondary-text">
              CRM stored deal records
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <HugeIcon :icon="Coins01Icon" :size="18" />
          </div>
        </div>

        <!-- 2. Upserted Last Run -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
              Upserted Last Run
            </p>
            <div class="text-xl font-bold font-mono text-primary-green">
              +{{ cursor.rows_upserted_last_run !== undefined ? cursor.rows_upserted_last_run : '0' }}
            </div>
            <p class="text-[10px] text-secondary-text">
              Batch size: {{ store.syncStatus?.batch_size || 300 }} items
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green shrink-0">
            <HugeIcon :icon="CheckmarkCircle02Icon" :size="18" />
          </div>
        </div>

        <!-- 3. Unresolved MT5 Groups -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
              Unresolved Groups
            </p>
            <div
              class="text-xl font-bold font-mono"
              :class="totals.unresolved_mt5_group > 0 ? 'text-primary-yellow' : 'text-primary-text'"
            >
              {{ totals.unresolved_mt5_group !== undefined ? totals.unresolved_mt5_group : '0' }}
            </div>
            <p class="text-[10px] text-secondary-text">
              Deals without MT5 broker group
            </p>
          </div>
          <div
            class="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
            :class="
              totals.unresolved_mt5_group > 0
                ? 'bg-primary-yellow/10 border-primary-yellow/20 text-primary-yellow'
                : 'bg-background border-primary-border text-secondary-text'
            "
          >
            <HugeIcon :icon="Layers01Icon" :size="18" />
          </div>
        </div>

        <!-- 4. Pipeline Status -->
        <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
              Pipeline Status
            </p>
            <div class="text-sm font-bold capitalize text-primary-text flex items-center gap-1.5">
              <span
                class="w-2 h-2 rounded-full"
                :class="cursor.last_status === 'ok' ? 'bg-primary-green' : 'bg-primary-yellow'"
              />
              <span>{{ cursor.last_status === 'ok' ? 'Operational' : (cursor.last_status || 'Idle') }}</span>
            </div>
            <p class="text-[10px] text-secondary-text font-mono truncate max-w-37.5">
              {{ cursor.last_run_at ? formatTimestamp(cursor.last_run_at) : 'No runs recorded' }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-background border border-primary-border flex items-center justify-center text-secondary-text shrink-0">
            <HugeIcon :icon="Time02Icon" :size="18" />
          </div>
        </div>
      </div>

      <!-- Two-Column Information Cards (Diagnostics & Configuration) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Panel 1: Watermark & Run Diagnostics -->
        <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden">
          <div class="px-4 py-3 bg-background/50 border-b border-primary-border flex items-center justify-between">
            <div class="flex items-center gap-2">
              <HugeIcon :icon="Activity01Icon" :size="15" class="text-primary" />
              <h3 class="text-xs font-bold uppercase tracking-wider text-primary-text">
                Watermark &amp; Run Diagnostics
              </h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
              Live Cursor
            </span>
          </div>

          <div class="divide-y divide-primary-border text-xs">
            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Last Processed Deal</span>
              <span class="font-mono font-bold text-primary-text">
                {{ cursor.last_deal ? `#${cursor.last_deal}` : "None" }}
              </span>
            </div>

            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Watermark Timestamp</span>
              <span class="font-mono font-semibold text-primary-text">
                {{ cursor.last_timestamp || "None" }}
              </span>
            </div>

            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Last Run Completed At</span>
              <span class="font-mono text-primary-text">
                {{ formatTimestamp(cursor.last_run_at) }}
              </span>
            </div>

            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Execution Time</span>
              <span class="font-mono font-semibold text-primary-text">
                {{ cursor.extra?.elapsed_ms !== undefined ? `${cursor.extra.elapsed_ms} ms` : "—" }}
              </span>
            </div>

            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Stop / Exit Reason</span>
              <span class="font-mono text-[11px] text-secondary-text px-2 py-0.5 bg-background rounded border border-primary-border">
                {{ cursor.extra?.stopped_reason || "Scheduled Interval" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Panel 2: ETL Engine Parameters & Limits -->
        <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden">
          <div class="px-4 py-3 bg-background/50 border-b border-primary-border flex items-center justify-between">
            <div class="flex items-center gap-2">
              <HugeIcon :icon="SlidersHorizontalIcon" :size="15" class="text-primary" />
              <h3 class="text-xs font-bold uppercase tracking-wider text-primary-text">
                ETL Engine Parameters
              </h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-primary-border text-secondary-text font-semibold">
              Configured
            </span>
          </div>

          <div class="divide-y divide-primary-border text-xs">
            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Source Deals Table</span>
              <span class="font-mono font-bold text-primary-text">
                {{ store.syncStatus?.deals_table || "mt5_deals" }}
              </span>
            </div>

            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Sync Interval Cadence</span>
              <span class="font-mono font-semibold text-primary-text">
                {{ store.syncStatus?.sync_interval_seconds ? `${store.syncStatus.sync_interval_seconds}s (~${Math.round(store.syncStatus.sync_interval_seconds / 60)} min)` : "120s" }}
              </span>
            </div>

            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Default Batch Size</span>
              <span class="font-mono text-primary-text">
                {{ store.syncStatus?.batch_size || 300 }} deals / batch
              </span>
            </div>

            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Batch Limits per Job</span>
              <span class="font-mono text-primary-text">
                {{ store.syncStatus?.max_batches_per_run || 5 }} batches max
              </span>
            </div>

            <div class="px-4 py-2.5 flex items-center justify-between">
              <span class="text-secondary-text">Max Runtime per Run</span>
              <span class="font-mono text-primary-text">
                {{ store.syncStatus?.max_runtime_seconds || 45 }} seconds max
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
