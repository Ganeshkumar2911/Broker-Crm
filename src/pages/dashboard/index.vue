<script setup>
import { computed, onMounted, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { useDashboardStore } from "@/stores/dashboard/dashboard";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";

import OverviewSection from "@/components/dashboard/OverviewSection.vue";
import RevenueIntelligence from "@/components/dashboard/RevenueIntelligence.vue";
import FundManagerSection from "@/components/dashboard/FundManagerSection.vue";
import IBNetworkSection from "@/components/dashboard/IBNetworkSection.vue";
import WalletSection from "@/components/dashboard/WalletSection.vue";
import SettlementSection from "@/components/dashboard/SettlementSection.vue";
import RecentActivitySection from "@/components/dashboard/RecentActivitySection.vue";
import LiveUserAccounts from "@/components/dashboard/LiveUserAccounts.vue";

// ─── Store & Permissions ──────────────────────────────────────────
const router = useRouter();
const store = useDashboardStore();
const { dashboard, dashboardLoading, revenueLoading, dashboardFilters } =
  storeToRefs(store);
const { hasPermission, isFetched, firstAllowedPath } = usePermissionCheck();

watchEffect(() => {
  if (isFetched.value && !hasPermission("analytics.view")) {
    router.replace(firstAllowedPath.value);
  }
});

// ─── Date range computed wrapper for BaseDatePicker ───────────────
const dateRangeValue = computed({
  get() {
    if (dashboardFilters.value.start_date || dashboardFilters.value.end_date) {
      return {
        start: dashboardFilters.value.start_date || null,
        end: dashboardFilters.value.end_date || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      store.setDashboardFilters({ start_date: "", end_date: "" });
    } else if (Array.isArray(val)) {
      store.setDashboardFilters({
        start_date: val[0] || "",
        end_date: val[1] || "",
      });
    } else if (typeof val === "object") {
      store.setDashboardFilters({
        start_date: val.start || val.from || "",
        end_date: val.end || val.to || "",
      });
    }
    store.applyDashboardFilters();
  },
});

// ─── Dashboard data slices (from dashboard.value) ─────────────────
const overview = computed(() => dashboard.value?.overview ?? {});
const fundManagerInsights = computed(
  () => dashboard.value?.fund_manager_insights ?? {},
);
const ibNetworkInsights = computed(
  () => dashboard.value?.ib_network_insights ?? {},
);
const walletSummary = computed(() => dashboard.value?.wallet_summary ?? {});
const walletBreakdown = computed(() => dashboard.value?.wallet_breakdown ?? {});
const settlementSummary = computed(
  () => dashboard.value?.settlement_summary ?? {},
);
const recentActivity = computed(() => dashboard.value?.recent_activity ?? []);

// ─── Refresh all ─────────────────────────────────────────────────
function refreshAll() {
  store.fetchDashboard();
  store.fetchRevenueAnalytics();
}

// ─── Lifecycle ───────────────────────────────────────────────────
onMounted(() => {
  if (hasPermission("analytics.view")) {
    store.fetchDashboard();
    store.fetchLiveUserAccounts();
    store.fetchRevenueAnalytics();
  }
});
</script>

<template>
  <div class="min-h-screen bg-background text-primary-text antialiased">
    <!-- ─── Main ─────────────────────────────────────────────── -->
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-10">
      <!-- Date Range Filter -->
      <div class="flex flex-wrap items-center gap-3">
        <BaseDatePicker
          v-model="dateRangeValue"
          :range="true"
          placeholder="Filter by date range..."
          class="w-full sm:w-60 xl:w-64"
        />
      </div>

      <LiveUserAccounts
        :data="store.userAccounts"
        :loading="store.userAccountsLoading"
      />

      <!-- 1 · Overview -->
      <OverviewSection :data="overview" :loading="dashboardLoading" />

      <!-- 2 · Revenue Intelligence (owns its own loading via store) -->
      <RevenueIntelligence />

      <!-- 3 · Fund Manager Intelligence -->
      <FundManagerSection
        :data="fundManagerInsights"
        :loading="dashboardLoading"
      />

      <!-- 4 · IB Network Intelligence -->
      <IBNetworkSection :data="ibNetworkInsights" :loading="dashboardLoading" />

      <!-- 5 · Wallet & Capital Flow -->
      <WalletSection
        :summary="walletSummary"
        :breakdown="walletBreakdown"
        :loading="dashboardLoading"
      />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        <!-- Recent Activity — 2/3 -->
        <div class="xl:col-span-2">
          <RecentActivitySection
            :activities="recentActivity"
            :loading="dashboardLoading"
          />
        </div>

        <!-- Settlement — 1/3 -->
        <div class="xl:col-span-1 flex flex-col">
          <SettlementSection
            title="Settlement Analytics"
            :completed="settlementSummary.completed ?? 0"
            :pending="settlementSummary.pending ?? 0"
            :failed="settlementSummary.failed ?? 0"
            :value="`$${(settlementSummary.total_fees ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`"
            :loading="dashboardLoading"
          />
        </div>
      </div>
    </main>
  </div>
</template>
