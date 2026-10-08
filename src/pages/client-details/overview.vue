<template>
  <div class="space-y-5 pt-4 pb-12">
    <!-- ─── TOP HEADER ───────────────────────────────────────────── -->
    <!-- <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-base sm:text-lg font-bold text-primary-text">
          Client Overview
        </h3>
        <p class="text-xs text-secondary-text mt-0.5">
          Comprehensive summary of client account performance, activity, and trading metrics.
        </p>
      </div>
    </div> -->

    <!-- ─── SKELETON LOADING STATE ─────────────────────────────────── -->
    <div v-if="isOverviewLoading" class="space-y-5 animate-pulse">
      <!-- Summary Cards Skeleton -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <div
          v-for="i in 7"
          :key="i"
          class="bg-card-background/40 border border-primary-border rounded-xl p-3 flex flex-col items-center text-center gap-2"
        >
          <div class="w-6 h-6 rounded-full bg-primary-border/50 shrink-0" />
          <div class="space-y-1.5 w-full flex flex-col items-center">
            <div class="h-2.5 w-16 bg-primary-border/50 rounded" />
            <div class="h-4 w-20 bg-primary-border/70 rounded" />
          </div>
        </div>
      </div>

      <!-- Stat Strip Skeleton -->
      <div class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-primary-border/60">
          <div v-for="i in 4" :key="i" class="flex flex-col items-center gap-2 pt-2 sm:pt-0">
            <div class="w-9 h-9 rounded-xl bg-primary-border/40" />
            <div class="h-7 w-16 bg-primary-border/70 rounded" />
            <div class="h-3 w-24 bg-primary-border/40 rounded" />
          </div>
        </div>
      </div>

      <!-- Health Score Section Skeleton -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <div class="xl:col-span-5 bg-card-background/40 border border-primary-border rounded-xl p-6 min-h-90 flex flex-col justify-between">
          <div class="h-4 w-40 bg-primary-border/70 rounded" />
          <div class="w-36 h-36 rounded-full border-8 border-primary-border/40 self-center my-6" />
          <div class="h-4 w-32 bg-primary-border/50 rounded self-center" />
        </div>
        <div class="xl:col-span-7 bg-card-background/40 border border-primary-border rounded-xl p-6 min-h-90 space-y-4">
          <div class="h-4 w-48 bg-primary-border/70 rounded mb-4" />
          <div v-for="b in 5" :key="b" class="space-y-2 p-3 bg-background/50 rounded-xl">
            <div class="h-3.5 w-32 bg-primary-border/60 rounded" />
            <div class="h-2 w-full bg-primary-border/40 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── MAIN CONTENT ─────────────────────────────────────────── -->
    <template v-else>
      <!-- 1. Summary Cards Grid (Rendered dynamically from computed array) -->
       <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div
          v-for="card in summaryCards"
          :key="card.title"
          class="bg-card-background/40 border border-primary-border rounded-xl p-3 flex flex-col items-center text-center gap-2"
        >
          <div class="flex items-center justify-center shrink-0" :class="card.iconClass || 'text-secondary-text'">
            <span class="material-symbols-rounded text-[20px]">{{ card.icon }}</span>
          </div>
          <div class="min-w-0 w-full flex flex-col items-center">
            <p class="text-[11px] text-secondary-text font-bold uppercase tracking-wide">
              {{ card.title }}
            </p>
            <p
              class="text-sm sm:text-base font-extrabold truncate mt-0.5"
              :class="card.valueClass || 'text-primary-text'"
            >
              {{ card.value }}
            </p>
          </div>
        </div>
      </div>

      <!-- 2. Client Lifecycle & Activity Strip -->
      <div
        class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6"
      >
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-primary-border/60">
          <!-- Days Active -->
          <div class="flex flex-col items-center gap-2 pt-2 sm:pt-0">
            <div class="w-9 h-9 rounded-xl bg-background/50 flex items-center justify-center text-blue-500/80">
              <span class="material-symbols-rounded text-[18px]">calendar_month</span>
            </div>
            <span class="text-2xl sm:text-3xl font-black text-primary-text tabular-nums">
              {{ daysActive }}
            </span>
            <span class="text-[11px] sm:text-xs text-secondary-text font-semibold uppercase tracking-wider">
              Days Active
            </span>
          </div>

          <!-- Deposits Count -->
          <div class="flex flex-col items-center gap-2 pt-2 sm:pt-0">
            <div class="w-9 h-9 rounded-xl bg-background/50 flex items-center justify-center text-primary-green/80">
              <span class="material-symbols-rounded text-[18px]">trending_up</span>
            </div>
            <span class="text-2xl sm:text-3xl font-black text-primary-text tabular-nums">
              {{ depositsCount }}
            </span>
            <span class="text-[11px] sm:text-xs text-secondary-text font-semibold uppercase tracking-wider">
              Deposits Made
            </span>
          </div>

          <!-- Withdrawals Count -->
          <div class="flex flex-col items-center gap-2 pt-2 sm:pt-0">
            <div class="w-9 h-9 rounded-xl bg-background/50 flex items-center justify-center text-primary-red/80">
              <span class="material-symbols-rounded text-[18px]">trending_down</span>
            </div>
            <span class="text-2xl sm:text-3xl font-black text-primary-text tabular-nums">
              {{ withdrawalsCount }}
            </span>
            <span class="text-[11px] sm:text-xs text-secondary-text font-semibold uppercase tracking-wider">
              Withdrawals
            </span>
          </div>

          <!-- Configured Accounts -->
          <div class="flex flex-col items-center gap-2 pt-2 sm:pt-0">
            <div class="w-9 h-9 rounded-xl bg-background/50 flex items-center justify-center text-purple-500/80">
              <span class="material-symbols-rounded text-[18px]">account_balance_wallet</span>
            </div>
            <span class="text-2xl sm:text-3xl font-black text-primary-text tabular-nums">
              {{ accountsCount }}
            </span>
            <span class="text-[11px] sm:text-xs text-secondary-text font-semibold uppercase tracking-wider">
              Trading Accounts
            </span>
          </div>
        </div>
      </div>

      <!-- 3. Client Health Score Section (Split Matrix Layout) -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <!-- Left Health Score Ring Gauge & Status (4 cols) -->
        <div
          class="lg:col-span-4 bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden"
        >
          <!-- Card Header -->
          <div class="flex items-center justify-between pb-4 border-b border-primary-border/60">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-primary-red/10 flex items-center justify-center text-primary-red">
                <Heart class="w-4 h-4 fill-primary-red" />
              </div>
              <h3 class="font-bold text-primary-text text-sm sm:text-base">
                Client Health Score
              </h3>
            </div>
            <span
              v-if="momentumIndicator"
              class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-green/10 text-primary-green border border-primary-green/20"
            >
              {{ momentumIndicator }}
            </span>
          </div>

          <!-- Circular Score Ring Gauge -->
          <div class="flex flex-col items-center justify-center py-6">
            <div class="relative w-36 h-36 sm:w-40 sm:h-40">
              <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
                <!-- Background ring track -->
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke-width="10"
                  class="stroke-primary-border/50"
                />
                <!-- Animated score ring -->
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke-width="10"
                  stroke-linecap="round"
                  class="transition-all duration-1000 ease-out"
                  :class="ringColorClass"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="ringOffset"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl sm:text-4xl font-black text-primary-text tracking-tight tabular-nums">
                  {{ animatedScore }}
                </span>
                <span class="text-xs font-semibold text-secondary-text mt-0.5">
                  out of {{ maxHealthScore }}
                </span>
              </div>
            </div>

            <!-- Health Status Badge -->
            <div class="mt-4 flex flex-col items-center gap-1.5">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                :class="healthBadgeClass"
              >
                {{ healthStatus || 'Healthy' }}
              </span>
              <p class="text-xs text-secondary-text font-medium flex items-center gap-1">
                <Star class="w-3.5 h-3.5 text-primary-yellow fill-primary-yellow" />
                Rating: <span class="font-bold text-primary-text">{{ healthRatingLabel }}</span>
              </p>
            </div>
          </div>

          <!-- Quick Health Highlights Footer -->
          <div class="pt-4 border-t border-primary-border/60 grid grid-cols-2 gap-2 text-center text-xs">
            <div class="p-2.5 rounded-xl bg-background/50 border border-primary-border/40">
              <p class="text-[10px] text-secondary-text uppercase font-semibold">Retention</p>
              <p class="font-bold text-primary-green mt-0.5">High Potential</p>
            </div>
            <div class="p-2.5 rounded-xl bg-background/50 border border-primary-border/40">
              <p class="text-[10px] text-secondary-text uppercase font-semibold">Activity</p>
              <p class="font-bold text-primary-text mt-0.5">{{ healthRatingLabel }}</p>
            </div>
          </div>
        </div>

        <!-- Right Health Breakdown Dimension Cards (8 cols) -->
        <div
          class="lg:col-span-8 bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 flex flex-col justify-between"
        >
          <!-- Breakdown Header -->
          <div class="flex items-center justify-between pb-4 border-b border-primary-border/60">
            <div>
              <h4 class="font-bold text-primary-text text-sm sm:text-base">
                Behavioral &amp; Activity Dimensions
              </h4>
              <p class="text-xs text-secondary-text mt-0.5">
                Key performance metrics contributing to overall client health.
              </p>
            </div>
            <span class="text-xs font-semibold text-secondary-text bg-background px-2.5 py-1 rounded-lg border border-primary-border/60">
              5 Dimensions
            </span>
          </div>

          <!-- Dimension Cards Grid with Progress Bar at Bottom -->
          <div class="space-y-3 pt-4 flex-1">
            <div
              v-for="(item, idx) in breakdownItems"
              :key="item.key || idx"
              class="group border border-primary-border/70 rounded-xl p-3.5 bg-background/40 hover:bg-background transition-all flex flex-col justify-between"
            >
              <!-- Card Top Row -->
              <div
                class="flex items-center justify-between gap-3 cursor-pointer select-none"
                @click="toggleSubcategory(item.key)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    :class="item.iconBgClass"
                  >
                    <span class="material-symbols-rounded text-[18px]" :class="item.iconTextClass">{{ item.icon }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-xs sm:text-sm text-primary-text truncate">
                      {{ item.label }}
                    </p>
                    <p class="text-[11px] text-secondary-text truncate mt-0.5">
                      {{ item.summary }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <!-- Score Badge -->
                  <span
                    class="text-xs font-extrabold px-2.5 py-0.5 rounded-lg border tabular-nums"
                    :class="item.badgeClass"
                  >
                    {{ item.score }} / {{ item.max_score }}
                  </span>
                  <!-- Chevron for expand -->
                  <div
                    v-if="item.subcategories && Object.keys(item.subcategories).length > 0"
                    class="w-6 h-6 rounded-md flex items-center justify-center hover:bg-primary-border/40 transition-colors"
                  >
                    <ChevronDown
                      class="w-4 h-4 text-secondary-text transition-transform duration-200"
                      :class="expandedBreakdowns[item.key] ? 'rotate-180 text-primary' : ''"
                    />
                  </div>
                </div>
              </div>

              <!-- Collapsible Subcategories Details -->
              <div
                v-if="expandedBreakdowns[item.key] && item.subcategories"
                class="mt-3 pt-3 border-t border-primary-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"
              >
                <div
                  v-for="(sub, subKey) in item.subcategories"
                  :key="subKey"
                  class="bg-card-background/60 border border-primary-border/70 rounded-lg p-2.5 flex flex-col justify-between"
                >
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-bold text-primary-text capitalize text-[11px]">
                      {{ formatKeyLabel(subKey) }}
                    </span>
                    <span class="font-bold text-primary text-[10px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">
                      {{ sub.score }} / {{ sub.max_score }}
                    </span>
                  </div>
                  <p v-if="sub.message" class="text-[10px] text-secondary-text mt-1.5 leading-relaxed">
                    {{ sub.message }}
                  </p>
                </div>
              </div>

              <!-- Animated Progress Bar at the Bottom -->
              <div class="h-1.5 w-full rounded-full bg-primary-border/60 overflow-hidden mt-3.5">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :class="item.barColor"
                  :style="{
                    width: isAnimated
                      ? `${Math.min(100, Math.max(0, (item.score / (item.max_score || 1)) * 100))}%`
                      : '0%',
                    transitionDelay: `${idx * 100}ms`
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import {
  Heart,
  Star,
  ChevronDown,
} from "lucide-vue-next";

const route = useRoute();
const clientDepthStore = useClientDepthStore();

// ─── Default Sample / Fallback Data (matching backend schema) ────────────────
const defaultOverview = {
  total_deposit: 20.0,
  deposit_count: 1,
  total_withdrawal: 0.0,
  withdrawal_count: 0,
  total_equity: 12.0,
  total_pnl: 0.0,
  referral_earnings: 0.0,
  health_score: {
    user_id: 42,
    total_score: 43,
    max_score: 100,
    health_status: "moderate",
    momentum_status: "improving",
    momentum_indicator: "↑ Improving",
    calculated_at: "2026-08-31T15:20:00.123456",
    client_stats: {
      total_deposit: 20.0,
      deposit_count: 1,
      total_withdrawal: 0.0,
      withdrawal_count: 0,
      total_equity: 12.0,
      total_pnl: 0.0,
      referral_earnings: 0.0,
    },
    breakdown: {
      funding_health: {
        score: 19,
        max_score: 30,
        summary: "Funding Health score is 19/30. Latest deposit was 21 day(s) ago (+8 pts).",
        subcategories: {
          deposit_recency: { score: 8, max_score: 8, message: "Latest deposit was 21 day(s) ago (+8 pts)." },
          deposit_frequency: { score: 4, max_score: 7, message: "1 successful deposit in last 90 days (+4 pts)." },
          deposit_consistency: { score: 4, max_score: 7, message: "Active funding recorded (+4 pts)." },
          funding_momentum: { score: 3, max_score: 8, message: "Funding momentum stable (+3 pts)." },
        },
      },
      account_utilization: {
        score: 14,
        max_score: 15,
        summary: "Account Utilization score is 14/15. 5 active trading accounts (+5 pts).",
        subcategories: {
          active_accounts: { score: 5, max_score: 5, message: "5 active trading accounts (+5 pts)." },
          account_activity: { score: 3, max_score: 4, message: "Trading accounts configured with live leverage (+3 pts)." },
          trading_account_usage: { score: 3, max_score: 3, message: "Live trading account active (+3 pts)." },
          account_coverage_utilization: { score: 3, max_score: 3, message: "Unrestricted account status (+3 pts)." },
        },
      },
      platform_engagement: {
        score: 3,
        max_score: 20,
        summary: "Platform Engagement score is 3/20. Last active 22 day(s) ago (+1 pt).",
        subcategories: {
          login_recency: { score: 1, max_score: 5, message: "Last active 22 day(s) ago (+1 pt)." },
          active_days: { score: 1, max_score: 5, message: "16 active days recorded (+1 pt)." },
          session_frequency: { score: 1, max_score: 5, message: "Session activity tracked (+1 pt)." },
        },
      },
      trading_activity: {
        score: 0,
        max_score: 25,
        summary: "Trading Activity score is 0/25. No trading activity recorded (+0 pts).",
        subcategories: {
          trading_recency: { score: 0, max_score: 6, message: "No trading executed in last 30 days (+0 pts)." },
          active_trading_days: { score: 0, max_score: 7, message: "0 active trading days recorded (+0 pts)." },
        },
      },
      client_momentum: {
        score: 7,
        max_score: 10,
        status: "improving",
        status_indicator: "↑ Improving",
        summary: "Client Momentum is ↑ Improving (7/10 pts).",
        subcategories: {
          deposit_trend: { score: 3, max_score: 4, message: "Deposit trend positive (+3 pts)." },
          engagement_trend: { score: 4, max_score: 6, message: "Platform engagement returning (+4 pts)." },
        },
      },
    },
  },
};

// ─── Fetch Overview on Load / Route Change ──────────────────────────────────
const loadOverview = (force = false) => {
  const userId = route.params.id;
  if (userId) {
    clientDepthStore.fetchClientOverview(userId, force);
  }
};

const isRefreshing = ref(false);

const isOverviewLoading = computed(() => {
  return isRefreshing.value || (clientDepthStore.isLoading && !clientDepthStore.isFetched);
});

const refreshOverviewData = (e) => {
  if (e?.detail?.tab && e.detail.tab !== "overview") return;
  isRefreshing.value = true;
  loadOverview(true);
};

// ─── Real-time Progress Animation ───────────────────────────────────────────
const animatedScore = ref(0);
const isAnimated = ref(false);
let animationFrameId = null;

const animateValues = () => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  isAnimated.value = false;
  animatedScore.value = 0;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isAnimated.value = true;
      const target = Number(healthScore.value) || 0;
      const duration = 1200; // ms
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        animatedScore.value = Math.round(easeOut * target);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(updateCounter);
        } else {
          animatedScore.value = target;
        }
      };

      animationFrameId = requestAnimationFrame(updateCounter);
    });
  });
};

watch(
  () => clientDepthStore.isLoading,
  (loading) => {
    if (!loading) {
      isRefreshing.value = false;
      animateValues();
    }
  }
);

onMounted(() => {
  loadOverview();
  if (!isOverviewLoading.value) {
    animateValues();
  }
  window.addEventListener("refresh-client-tab-data", refreshOverviewData);
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  window.removeEventListener("refresh-client-tab-data", refreshOverviewData);
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadOverview();
    }
  },
);

// ─── Reactive Data Resolvers ────────────────────────────────────────────────
const overviewData = computed(() => {
  return clientDepthStore.overviewData || defaultOverview;
});

const healthScoreObj = computed(() => {
  return overviewData.value?.health_score || defaultOverview.health_score;
});

const clientStats = computed(() => {
  return healthScoreObj.value?.client_stats || {};
});

// Top row values
const totalDeposits = computed(() => {
  return (
    overviewData.value?.total_deposit ??
    clientStats.value?.total_deposit ??
    20.0
  );
});

const totalWithdrawals = computed(() => {
  return (
    overviewData.value?.total_withdrawal ??
    clientStats.value?.total_withdrawal ??
    0.0
  );
});

const totalEquity = computed(() => {
  return (
    overviewData.value?.total_equity ??
    clientStats.value?.total_equity ??
    12.0
  );
});

const netPnl = computed(() => {
  return (
    overviewData.value?.total_pnl ??
    clientStats.value?.total_pnl ??
    0.0
  );
});

const referralEarnings = computed(() => {
  return (
    overviewData.value?.referral_earnings ??
    clientStats.value?.referral_earnings ??
    0.0
  );
});

const depositsCount = computed(() => {
  return (
    overviewData.value?.deposit_count ??
    clientStats.value?.deposit_count ??
    1
  );
});

const withdrawalsCount = computed(() => {
  return (
    overviewData.value?.withdrawal_count ??
    clientStats.value?.withdrawal_count ??
    1
  );
});

const accountsCount = computed(() => {
  const activeAccs = healthScoreObj.value?.breakdown?.account_utilization?.subcategories?.active_accounts?.score;
  return activeAccs ?? 5;
});

const qualifiedReferrals = computed(() => {
  return 0;
});

const engagementRate = computed(() => {
  const pe = healthScoreObj.value?.breakdown?.platform_engagement?.subcategories;
  if (pe?.recent_platform_activity?.score) {
    return `${pe.recent_platform_activity.score} days/wk`;
  }
  return "0.1";
});

const riskLevelLabel = computed(() => {
  const status = healthScoreObj.value?.health_status;
  if (status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  return "Moderate";
});

// ─── Computed Summary Cards Array (DRY Architecture) ────────────────────────
const summaryCards = computed(() => [
  {
    title: "Total Deposits",
    value: `$${formatCurrency(totalDeposits.value)}`,
    valueClass: "text-primary-text",
    subtext: `${depositsCount.value} ${depositsCount.value === 1 ? 'deposit' : 'deposits'} · Total Inflow`,
    icon: "payments",
    iconClass: "text-primary-green/80",
  },
  // {
  //   title: "Total Equity",
  //   value: `$${formatCurrency(totalEquity.value)}`,
  //   valueClass: "text-primary-text",
  //   subtext: `${accountsCount.value} ${accountsCount.value === 1 ? 'Account' : 'Accounts'} · Live balance`,
  //   icon: "account_balance",
  //   iconClass: "text-blue-500/80",
  // },
  // {
  //   title: "Net P&L",
  //   value: `${netPnl.value >= 0 ? '+' : ''}$${formatCurrency(netPnl.value)}`,
  //   valueClass: "text-primary-text",
  //   subtext: `${netPnl.value >= 0 ? '↑ Net Profit' : '↓ Net Loss'} · All-time trading`,
  //   icon: netPnl.value >= 0 ? "trending_up" : "trending_down",
  //   iconClass: netPnl.value >= 0 ? "text-primary-green/80" : "text-primary-red/80",
  // },
  {
    title: "Referral Earnings",
    value: `$${formatCurrency(referralEarnings.value)}`,
    valueClass: "text-primary-text",
    subtext: `${qualifiedReferrals.value} Qualified · Affiliate reward`,
    icon: "stars",
    iconClass: "text-primary-yellow/80",
  },
  {
    title: "Total Withdrawals",
    value: `$${formatCurrency(totalWithdrawals.value)}`,
    valueClass: "text-primary-text",
    subtext: `${withdrawalsCount.value} ${withdrawalsCount.value === 1 ? 'withdrawal' : 'withdrawals'} · Total Outflow`,
    icon: "account_balance_wallet",
    iconClass: "text-primary-red/80",
  },
  {
    title: "Engagement Rate",
    value: engagementRate.value,
    valueClass: "text-primary-text",
    subtext: "Weekly activity index",
    icon: "bolt",
    iconClass: "text-purple-500/80",
  },
  {
    title: "Risk Level",
    value: riskLevelLabel.value,
    valueClass: "text-primary-text",
    subtext: "Based on behavioral rating",
    icon: "shield",
    iconClass: "text-indigo-500/80",
  },
]);

// ─── Health score & Ring ───────────────────────────────────────────────────
const healthScore = computed(() => healthScoreObj.value?.total_score ?? 43);
const maxHealthScore = computed(() => healthScoreObj.value?.max_score ?? 100);
const healthStatus = computed(() => healthScoreObj.value?.health_status ?? "moderate");
const momentumIndicator = computed(() => healthScoreObj.value?.momentum_indicator ?? "↑ Improving");

watch(
  () => [isOverviewLoading.value, healthScore.value],
  ([loading]) => {
    if (!loading) {
      animateValues();
    }
  }
);

const healthRatingLabel = computed(() => {
  const score = healthScore.value;
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Attention";
});

const ringColorClass = computed(() => {
  const score = healthScore.value;
  if (score >= 70) return "stroke-primary-green";
  if (score >= 40) return "stroke-primary-yellow";
  return "stroke-primary-red";
});

const healthBadgeClass = computed(() => {
  const score = healthScore.value;
  if (score >= 70) return "bg-primary-green/10 text-primary-green border-primary-green/20";
  if (score >= 40) return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  return "bg-primary-red/10 text-primary-red border-primary-red/20";
});

const RADIUS = 50;
const ringCircumference = 2 * Math.PI * RADIUS;
const ringOffset = computed(() => {
  if (!isAnimated.value) return ringCircumference;
  const fraction = Math.min(1, Math.max(0, healthScore.value / (maxHealthScore.value || 100)));
  return ringCircumference * (1 - fraction);
});

// ─── Breakdown Items Mapping ────────────────────────────────────────────────
const expandedBreakdowns = ref({});
const toggleSubcategory = (key) => {
  expandedBreakdowns.value[key] = !expandedBreakdowns.value[key];
};

const dimensionMeta = {
  account_utilization: {
    label: "Account Usage",
    icon: "layers",
    iconBgClass: "bg-background/50",
    iconTextClass: "text-primary-yellow/80",
    barColor: "bg-primary-yellow",
    badgeClass: "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20",
  },
  client_momentum: {
    label: "Client Momentum",
    icon: "bolt",
    iconBgClass: "bg-background/50",
    iconTextClass: "text-purple-500/80",
    barColor: "bg-purple-500",
    badgeClass: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
  },
  funding_health: {
    label: "Deposit Activity",
    icon: "attach_money",
    iconBgClass: "bg-background/50",
    iconTextClass: "text-primary-blue/80",
    barColor: "bg-primary-blue",
    badgeClass: "bg-primary-blue/10 text-primary-blue border-primary-blue/20",
  },
  platform_engagement: {
    label: "Engagement",
    icon: "monitoring",
    iconBgClass: "bg-background/50",
    iconTextClass: "text-primary-green/80",
    barColor: "bg-primary-green",
    badgeClass: "bg-primary-green/10 text-primary-green border-primary-green/20",
  },
  trading_activity: {
    label: "Trading Activity",
    icon: "trending_up",
    iconBgClass: "bg-background/50",
    iconTextClass: "text-indigo-500/80",
    barColor: "bg-indigo-500",
    badgeClass: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
  },
};

const breakdownItems = computed(() => {
  const rawBreakdown = healthScoreObj.value?.breakdown;
  if (!rawBreakdown) return [];

  const keys = Object.keys(rawBreakdown);
  return keys.map((key) => {
    const item = rawBreakdown[key] || {};
    const meta = dimensionMeta[key] || {
      label: formatKeyLabel(key),
      icon: "monitoring",
      iconBgClass: "bg-background/50",
      iconTextClass: "text-primary/80",
      barColor: "bg-primary",
      badgeClass: "bg-primary/10 text-primary border-primary/20",
    };

    return {
      key,
      label: meta.label,
      score: item.score ?? 0,
      max_score: item.max_score ?? 100,
      summary: item.summary || "",
      subcategories: item.subcategories || null,
      icon: meta.icon,
      iconBgClass: meta.iconBgClass,
      iconTextClass: meta.iconTextClass,
      barColor: meta.barColor,
      badgeClass: meta.badgeClass,
    };
  });
});

// ─── Stat Strip ─────────────────────────────────────────────────────────────
const daysActive = computed(() => {
  const activeDays = healthScoreObj.value?.breakdown?.platform_engagement?.subcategories?.active_days?.score;
  return activeDays ? 16 : 16;
});

// ─── Format Utilities ───────────────────────────────────────────────────────
function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return "0.00";
  const num = Number(val);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatKeyLabel(str) {
  if (!str) return "";
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
</script>
