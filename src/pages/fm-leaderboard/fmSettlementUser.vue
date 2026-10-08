<template>
  <div class="px-4 pb-8 space-y-6">
    <!-- Header & Navigation -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2.5 flex-wrap pt-1">
          <h1 class="text-base font-bold text-primary-text">
            Client Settlement Details
          </h1>
          <span
            v-if="store.data?.preview"
            class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary border border-primary/20"
          >
            Preview Mode
          </span>
          <span
            v-if="store.data?.fm_name"
            class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-card-background text-secondary-text border border-primary-border"
          >
            FM: {{ store.data.fm_name }} (FM #{{ store.data.fm_id }})
          </span>
          <span
            class="px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono bg-card-background text-primary border border-primary-border uppercase"
          >
            {{ activeCurrency }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          :disabled="store.loading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50 cursor-pointer"
          @click="loadData"
        >
          <RotateCw
            class="w-3.5 h-3.5"
            :class="{ 'animate-spin': store.loading }"
          />
          Refresh
        </button>
      </div>
    </div>

    <!-- Skeletons Loading State -->
    <div v-if="store.loading" class="space-y-6">
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-background" />
          <div class="space-y-2">
            <div class="h-4 w-40 bg-background rounded" />
            <div class="h-3 w-60 bg-background rounded" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          v-for="n in 6"
          :key="n"
          class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-2"
        >
          <div class="h-3 w-16 bg-background rounded" />
          <div class="h-6 w-24 bg-background rounded" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!store.data || !userData"
      class="flex flex-col items-center justify-center py-20 gap-4 bg-card-background border border-primary-border rounded-2xl"
    >
      <div
        class="w-14 h-14 rounded-2xl bg-background border border-primary-border flex items-center justify-center"
      >
        <ReceiptText class="w-6 h-6 text-secondary-text" />
      </div>
      <div class="text-center max-w-sm px-4">
        <p class="text-sm font-semibold text-primary-text">
          No Settlement Data Found
        </p>
        <p class="text-xs text-secondary-text mt-1">
          Unable to find settlement details for this client under the specified
          fund manager.
        </p>
        <button
          class="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
          @click="goBack"
        >
          Return to Overview
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Client Profile Hero Card -->
      <div
        class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 shadow-2xs"
      >
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div
              class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0"
            >
              {{ (userData.user?.name || "U")[0].toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-primary-text truncate">
                  {{ userData.user?.name || "Client Details" }}
                </h2>
                <span
                  class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                  :class="
                    userData.user?.is_active
                      ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                      : 'bg-background text-secondary-text border border-primary-border'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="
                      userData.user?.is_active
                        ? 'bg-primary-green'
                        : 'bg-zinc-400'
                    "
                  />
                  {{ userData.user?.is_active ? "Active" : "Inactive" }}
                </span>
                <span
                  class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border text-secondary-text bg-background/80 border-primary-border"
                >
                  User ID: #{{ userData.user?.user_id || route.params.userId }}
                </span>
              </div>
              <div
                class="flex items-center gap-3 text-xs text-secondary-text mt-1.5 flex-wrap font-medium"
              >
                <span
                  v-if="userData.user?.email"
                  class="flex items-center gap-1 font-mono text-primary-text select-all"
                >
                  <Mail class="w-3.5 h-3.5 text-primary shrink-0" />
                  {{ userData.user.email }}
                </span>
                <span
                  v-if="userData.user?.phone_number"
                  class="flex items-center gap-1 text-secondary-text"
                >
                  <Phone class="w-3.5 h-3.5 text-secondary-text shrink-0" />
                  {{ userData.user.phone_number }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Stats Count -->
          <div class="flex items-center gap-2 shrink-0 flex-wrap">
            <div
              class="flex items-center gap-2 bg-background/60 border border-primary-border/60 rounded-xl px-3 py-2 text-xs"
            >
              <Users class="w-3.5 h-3.5 text-primary" />
              <span class="text-secondary-text">Follower Sessions:</span>
              <span class="font-bold text-primary-text">{{
                followerList.length
              }}</span>
            </div>
            <div
              class="flex items-center gap-2 bg-background/60 border border-primary-border/60 rounded-xl px-3 py-2 text-xs"
            >
              <Activity class="w-3.5 h-3.5 text-primary" />
              <span class="text-secondary-text">Total Trades:</span>
              <span class="font-bold text-primary-text">{{
                userSummary.trades_count ?? totalTradesCount
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Metrics Summary Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Net PnL -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-[11px] font-medium uppercase tracking-wide text-secondary-text"
              >Net PnL</span
            >
            <TrendingUp
              v-if="userSummary.net_pnl >= 0"
              class="w-3.5 h-3.5 text-primary-green"
            />
            <TrendingDown v-else class="w-3.5 h-3.5 text-primary-red" />
          </div>
          <div class="mt-2">
            <p
              class="text-xl font-bold tabular-nums"
              :class="
                userSummary.net_pnl >= 0
                  ? 'text-primary-green'
                  : 'text-primary-red'
              "
            >
              {{ userSummary.net_pnl > 0 ? "+" : ""
              }}{{ formatCurrency(userSummary.net_pnl) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              After all deductions
            </p>
          </div>
        </div>

        <!-- Gross PnL -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-[11px] font-medium uppercase tracking-wide text-secondary-text"
              >Gross PnL</span
            >
            <TrendingUp
              v-if="userSummary.gross_pnl >= 0"
              class="w-3.5 h-3.5 text-primary-green"
            />
            <TrendingDown v-else class="w-3.5 h-3.5 text-primary-red" />
          </div>
          <div class="mt-2">
            <p
              class="text-xl font-bold tabular-nums"
              :class="
                userSummary.gross_pnl >= 0
                  ? 'text-primary-green'
                  : 'text-primary-red'
              "
            >
              {{ userSummary.gross_pnl > 0 ? "+" : ""
              }}{{ formatCurrency(userSummary.gross_pnl) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              Raw Trading Profit
            </p>
          </div>
        </div>

        <!-- Total Fee -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-[11px] font-medium uppercase tracking-wide text-secondary-text"
              >Total Fee</span
            >
            <DollarSign class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-text tabular-nums">
              {{ formatCurrency(userSummary.total_fee) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              Performance Fee
            </p>
          </div>
        </div>

        <!-- FM Net Fee -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-[11px] font-medium uppercase tracking-wide text-secondary-text"
              >FM Net Fee</span
            >
            <PieChart class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-text tabular-nums">
              {{ formatCurrency(userSummary.fm_net_after_agents) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              Gross: {{ formatCurrency(userSummary.fm_fee) }}
            </p>
          </div>
        </div>

        <!-- Broker Net Fee -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-[11px] font-medium uppercase tracking-wide text-secondary-text"
              >Broker Net</span
            >
            <Building2 class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-text tabular-nums">
              {{ formatCurrency(userSummary.broker_net) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              Gross: {{ formatCurrency(userSummary.broker_fee) }}
            </p>
          </div>
        </div>

        <!-- IB Pool Distributed -->
        <div
          class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col justify-between"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-[11px] font-medium uppercase tracking-wide text-secondary-text"
              >IB Distributed</span
            >
            <GitBranch class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <div class="mt-2">
            <p class="text-xl font-bold text-primary-green tabular-nums">
              {{ formatCurrency(userSummary.ib_distributed) }}
            </p>
            <p class="text-[10px] text-secondary-text mt-0.5">
              Pool: {{ formatCurrency(userSummary.ib_pool) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-primary-border pb-3"
      >
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <button
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="
              activeTab === 'settlements'
                ? 'bg-primary text-white'
                : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="activeTab = 'settlements'"
          >
            <ReceiptText class="w-3.5 h-3.5" />
            Follower Periods & Trades
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-semibold"
              :class="
                activeTab === 'settlements'
                  ? 'bg-white/20 text-white'
                  : 'bg-background text-secondary-text'
              "
            >
              {{ followerList.length }} Sessions
            </span>
          </button>

          <button
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="
              activeTab === 'ib_distribution'
                ? 'bg-primary text-white'
                : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="activeTab = 'ib_distribution'"
          >
            <GitBranch class="w-3.5 h-3.5" />
            IB Distribution Logs
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-semibold"
              :class="
                activeTab === 'ib_distribution'
                  ? 'bg-white/20 text-white'
                  : 'bg-background text-secondary-text'
              "
            >
              {{ store.data?.ib_distribution?.length ?? 0 }}
            </span>
          </button>

          <button
            v-if="store.data?.agent_distribution?.length"
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="
              activeTab === 'agent_distribution'
                ? 'bg-primary text-white'
                : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="activeTab = 'agent_distribution'"
          >
            <Shield class="w-3.5 h-3.5" />
            Agent Distribution
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-semibold"
              :class="
                activeTab === 'agent_distribution'
                  ? 'bg-white/20 text-white'
                  : 'bg-background text-secondary-text'
              "
            >
              {{ store.data.agent_distribution.length }}
            </span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full sm:w-64">
          <Search
            class="w-3.5 h-3.5 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search periods, trades, symbols..."
            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text placeholder:text-secondary-text outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- TAB 1: FOLLOWER SESSIONS & PERIODS SETTLEMENT BREAKDOWN -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'settlements'" class="space-y-6">
        <!-- Follower Session Filter Pills -->
        <div
          v-if="followerList.length > 1"
          class="flex items-center gap-2 overflow-x-auto pb-1"
        >
          <span class="text-xs font-medium text-secondary-text shrink-0"
            >Filter Session:</span
          >
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="
              selectedFollowerId === 'ALL'
                ? 'bg-primary text-white'
                : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="selectedFollowerId = 'ALL'"
          >
            All Sessions ({{ followerList.length }})
          </button>
          <button
            v-for="follower in followerList"
            :key="follower.follower_id"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            :class="
              selectedFollowerId === String(follower.follower_id)
                ? 'bg-primary text-white'
                : 'bg-card-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="selectedFollowerId = String(follower.follower_id)"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="follower.is_active ? 'bg-emerald-500' : 'bg-zinc-400'"
            />
            <span class="font-mono font-semibold"
              >Follower #{{ follower.follower_id }}</span
            >
            <span class="text-[10px] opacity-80 font-mono"
              >({{ follower.account_number }} ·
              {{ follower.summary?.trades_count ?? 0 }}t)</span
            >
          </button>
        </div>

        <!-- Follower Session Cards -->
        <div
          v-for="follower in displayedFollowers"
          :key="follower.follower_id"
          class="border border-primary-border rounded-2xl overflow-hidden bg-card-background shadow-2xs space-y-4 p-4 sm:p-5"
        >
          <!-- Follower Session Header -->
          <div
            class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-primary-border pb-4"
          >
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-primary-text">
                  Follower Session #{{ follower.follower_id }}
                </span>
                <span
                  class="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-background border border-primary-border text-primary-text"
                >
                  Account: {{ follower.account_number }}
                </span>
                <span
                  class="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                  :class="
                    follower.is_active
                      ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                      : 'bg-background text-secondary-text border border-primary-border'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="
                      follower.is_active ? 'bg-primary-green' : 'bg-zinc-400'
                    "
                  />
                  {{ follower.is_active ? "Active" : "Inactive" }}
                </span>
                <span
                  v-if="follower.joined_at"
                  class="text-[10px] text-secondary-text bg-background px-2 py-0.5 rounded border border-primary-border"
                >
                  Joined: {{ formatDate(follower.joined_at) }}
                </span>
                <span
                  class="text-[9px] uppercase font-bold px-2 py-0.5 rounded border text-secondary-text bg-background border-primary-border"
                >
                  Settlement:
                  {{
                    follower.settlement_type || follower.config?.settlement_type
                  }}
                </span>
              </div>

              <!-- Configuration Chips -->
              <div
                class="flex items-center gap-2 mt-2 text-[11px] text-secondary-text flex-wrap"
              >
                <span
                  class="bg-background px-2 py-0.5 rounded border border-primary-border/60"
                >
                  Perf Fee:
                  <strong class="text-primary-text"
                    >{{ follower.config?.performance_fee ?? 0 }}%</strong
                  >
                </span>
                <span
                  class="bg-background px-2 py-0.5 rounded border border-primary-border/60"
                >
                  FM Share:
                  <strong class="text-primary-text"
                    >{{ follower.config?.fm_share ?? 0 }}%</strong
                  >
                </span>
                <span
                  class="bg-background px-2 py-0.5 rounded border border-primary-border/60"
                >
                  Broker Share:
                  <strong class="text-primary-text"
                    >{{ follower.config?.broker_share ?? 0 }}%</strong
                  >
                </span>
                <span
                  class="bg-background px-2 py-0.5 rounded border border-primary-border/60"
                >
                  IB Pool:
                  <strong class="text-primary-text"
                    >{{ follower.config?.ib_pool_percentage ?? 0 }}%</strong
                  >
                </span>
                <span
                  v-if="follower.config?.management_fee"
                  class="bg-background px-2 py-0.5 rounded border border-primary-border/60"
                >
                  Mgmt Fee:
                  <strong class="text-primary-text"
                    >{{ follower.config?.management_fee }}%</strong
                  >
                </span>
                <span
                  v-if="follower.config?.registration_fee"
                  class="bg-background px-2 py-0.5 rounded border border-primary-border/60"
                >
                  Reg Fee:
                  <strong class="text-primary-text">{{
                    follower.config?.registration_fee
                  }}</strong>
                </span>
              </div>
            </div>

            <!-- Follower Session Totals Bar -->
            <div
              class="flex items-center gap-3 bg-background/70 border border-primary-border rounded-xl px-3.5 py-2 text-xs shrink-0 flex-wrap"
            >
              <div>
                <span class="text-[9px] uppercase text-secondary-text block"
                  >Trades</span
                >
                <span class="font-bold text-primary-text font-mono">{{
                  follower.summary?.trades_count ?? 0
                }}</span>
              </div>
              <div class="h-6 w-px bg-primary-border/80" />
              <div>
                <span class="text-[9px] uppercase text-secondary-text block"
                  >Gross PnL</span
                >
                <span
                  class="font-bold font-mono"
                  :class="
                    (follower.summary?.gross_pnl ?? 0) >= 0
                      ? 'text-primary-green'
                      : 'text-primary-red'
                  "
                >
                  {{ (follower.summary?.gross_pnl ?? 0) > 0 ? "+" : ""
                  }}{{ formatCurrency(follower.summary?.gross_pnl ?? 0) }}
                </span>
              </div>
              <div class="h-6 w-px bg-primary-border/80" />
              <div>
                <span class="text-[9px] uppercase text-secondary-text block"
                  >Total Fee</span
                >
                <span class="font-bold text-primary-text font-mono">{{
                  formatCurrency(follower.summary?.total_fee ?? 0)
                }}</span>
              </div>
              <div class="h-6 w-px bg-primary-border/80" />
              <div>
                <span class="text-[9px] uppercase text-secondary-text block"
                  >Net PnL</span
                >
                <span
                  class="font-bold font-mono"
                  :class="
                    (follower.summary?.net_pnl ?? 0) >= 0
                      ? 'text-primary-green'
                      : 'text-primary-red'
                  "
                >
                  {{ (follower.summary?.net_pnl ?? 0) > 0 ? "+" : ""
                  }}{{ formatCurrency(follower.summary?.net_pnl ?? 0) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Settlement Periods List for this Follower Session -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-semibold text-primary-text uppercase tracking-wider"
              >
                Settlement Periods ({{ follower.periods?.length ?? 0 }})
              </span>
            </div>

            <div
              v-for="period in getFilteredPeriods(follower.periods || [])"
              :key="period.period_key"
              class="border border-primary-border rounded-xl overflow-hidden bg-background/50"
            >
              <!-- Period Header Row -->
              <div
                class="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-background transition-colors"
                @click="
                  togglePeriodExpand(
                    `${follower.follower_id}-${period.period_key}`,
                  )
                "
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-card-background border border-primary-border flex items-center justify-center text-primary font-bold text-xs shrink-0"
                  >
                    <Calendar class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-primary-text">
                        {{ formatPeriodDate(period.period_key) }}
                      </span>
                      <span
                        class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-secondary-text"
                      >
                        {{ period.period_key }}
                      </span>
                      <span
                        class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-secondary-text"
                      >
                        {{ period.period_type }}
                      </span>
                    </div>
                    <p class="text-[11px] text-secondary-text mt-0.5">
                      {{ period.trades_count }} Trade{{
                        period.trades_count === 1 ? "" : "s"
                      }}
                      executed in this settlement period
                    </p>
                  </div>
                </div>

                <!-- Period Summary Metrics -->
                <div
                  class="flex items-center gap-4 text-xs shrink-0 flex-wrap justify-between md:justify-end"
                >
                  <div class="text-left md:text-right">
                    <span class="text-[10px] text-secondary-text block"
                      >Gross PnL</span
                    >
                    <span
                      class="font-mono font-semibold"
                      :class="
                        period.gross_pnl >= 0
                          ? 'text-primary-green'
                          : 'text-primary-red'
                      "
                    >
                      {{ period.gross_pnl > 0 ? "+" : ""
                      }}{{ formatCurrency(period.gross_pnl) }}
                    </span>
                  </div>

                  <div class="text-left md:text-right">
                    <span class="text-[10px] text-secondary-text block"
                      >Fee</span
                    >
                    <span class="font-mono font-semibold text-primary-text">{{
                      formatCurrency(period.fee)
                    }}</span>
                  </div>

                  <div class="text-left md:text-right">
                    <span class="text-[10px] text-secondary-text block"
                      >FM Net</span
                    >
                    <span class="font-mono font-semibold text-primary-text">
                      {{
                        formatCurrency(
                          period.distribution?.fm_net_after_agents ??
                            period.fm_fee,
                        )
                      }}
                    </span>
                  </div>

                  <div class="text-left md:text-right">
                    <span class="text-[10px] text-secondary-text block"
                      >Net PnL</span
                    >
                    <span
                      class="font-mono font-bold"
                      :class="
                        period.net_pnl >= 0
                          ? 'text-primary-green'
                          : 'text-primary-red'
                      "
                    >
                      {{ period.net_pnl > 0 ? "+" : ""
                      }}{{ formatCurrency(period.net_pnl) }}
                    </span>
                  </div>

                  <ChevronDown
                    class="w-4 h-4 text-secondary-text transition-transform duration-200"
                    :class="{
                      'rotate-180 text-primary':
                        expandedPeriodKey ===
                        `${follower.follower_id}-${period.period_key}`,
                    }"
                  />
                </div>
              </div>

              <!-- Period Expanded Content -->
              <div
                v-if="
                  expandedPeriodKey ===
                  `${follower.follower_id}-${period.period_key}`
                "
                class="p-4 border-t border-primary-border bg-card-background space-y-4"
              >
                <!-- HWM & Distribution Cards Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <!-- HWM Details -->
                  <div
                    class="bg-background rounded-xl p-3.5 border border-primary-border/60 space-y-2 text-xs"
                  >
                    <p
                      class="text-xs font-semibold text-primary-text flex items-center gap-1.5"
                    >
                      <Activity class="w-3.5 h-3.5 text-primary" /> High Water
                      Mark (HWM)
                    </p>
                    <div class="space-y-1.5 pt-1">
                      <div class="flex justify-between">
                        <span class="text-secondary-text">Previous HWM:</span>
                        <span class="font-mono text-primary-text">{{
                          formatCurrency(period.hwm?.previous_hwm)
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-secondary-text"
                          >Current Total Before:</span
                        >
                        <span class="font-mono text-primary-text">{{
                          formatCurrency(period.hwm?.current_total_before)
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-secondary-text"
                          >Profit Above HWM:</span
                        >
                        <span
                          class="font-mono font-semibold text-primary-green"
                          >{{
                            formatCurrency(period.hwm?.profit_above_hwm)
                          }}</span
                        >
                      </div>
                      <div
                        class="flex justify-between border-t border-primary-border/60 pt-1.5"
                      >
                        <span class="text-secondary-text">New Equity:</span>
                        <span
                          class="font-mono font-semibold text-primary-text"
                          >{{ formatCurrency(period.hwm?.new_equity) }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Fee Distribution Details -->
                  <div
                    class="bg-background rounded-xl p-3.5 border border-primary-border/60 space-y-2 text-xs"
                  >
                    <p
                      class="text-xs font-semibold text-primary-text flex items-center gap-1.5"
                    >
                      <GitBranch class="w-3.5 h-3.5 text-primary" /> Fee & Pool
                      Splits
                    </p>
                    <div class="space-y-1.5 pt-1">
                      <div class="flex justify-between">
                        <span class="text-secondary-text"
                          >Total Performance Fee:</span
                        >
                        <span class="font-mono font-medium text-primary-text">{{
                          formatCurrency(
                            period.distribution?.total_fee ?? period.fee,
                          )
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-secondary-text">FM Share (Net):</span>
                        <span class="font-mono text-primary-text">{{
                          formatCurrency(
                            period.distribution?.fm_net_after_agents ??
                              period.fm_fee,
                          )
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-secondary-text"
                          >Broker Share (Net):</span
                        >
                        <span class="font-mono text-primary-text">{{
                          formatCurrency(
                            period.distribution?.broker_net ??
                              period.broker_net ??
                              period.broker_fee,
                          )
                        }}</span>
                      </div>
                      <div
                        class="flex justify-between border-t border-primary-border/60 pt-1.5"
                      >
                        <span class="text-secondary-text"
                          >IB Pool / Distributed:</span
                        >
                        <span class="font-mono text-primary-green"
                          >{{
                            formatCurrency(
                              period.distribution?.ib_pool ?? period.ib_pool,
                            )
                          }}
                          /
                          {{
                            formatCurrency(period.distribution?.ib_distributed)
                          }}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <!-- IB Splits if present in this period -->
                <div
                  v-if="period.distribution?.ib_splits?.length"
                  class="bg-background rounded-xl p-3.5 border border-primary-border/60"
                >
                  <p
                    class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider mb-2"
                  >
                    IB Commission Splits for this Period
                  </p>
                  <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                      <thead>
                        <tr
                          class="border-b border-primary-border text-[10px] text-secondary-text uppercase"
                        >
                          <th class="text-left py-1.5 px-2 font-medium">
                            IB Partner
                          </th>
                          <th class="text-left py-1.5 px-2 font-medium">
                            Level
                          </th>
                          <th class="text-left py-1.5 px-2 font-medium">
                            Role
                          </th>
                          <th class="text-left py-1.5 px-2 font-medium">
                            Pool Share %
                          </th>
                          <th class="text-left py-1.5 px-2 font-medium">
                            Split %
                          </th>
                          <th class="text-right py-1.5 px-2 font-medium">
                            Commission
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="split in period.distribution.ib_splits"
                          :key="split.ib_id"
                          class="border-b border-primary-border/40 last:border-none"
                        >
                          <td class="py-1.5 px-2 font-medium text-primary-text">
                            {{ split.ib_name }}
                            <span class="text-secondary-text text-[10px]"
                              >({{ split.ib_email }})</span
                            >
                          </td>
                          <td class="py-1.5 px-2 text-secondary-text">
                            L{{ split.ib_level }}
                          </td>
                          <td class="py-1.5 px-2">
                            <span
                              class="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-card-background border border-primary-border text-secondary-text"
                            >
                              {{ split.role || "Partner" }}
                            </span>
                          </td>
                          <td class="py-1.5 px-2 font-mono text-primary-text">
                            {{ split.pool_share_pct }}%
                          </td>
                          <td class="py-1.5 px-2 font-mono text-primary-text">
                            {{ split.split_percentage }}%
                          </td>
                          <td
                            class="py-1.5 px-2 text-right font-mono font-semibold text-primary-green"
                          >
                            {{ formatCurrency(split.commission) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Trades in this Period Table -->
                <div class="space-y-2">
                  <p
                    class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider"
                  >
                    Closed Trades in this Period ({{
                      period.trades?.length ?? 0
                    }})
                  </p>
                  <div
                    class="overflow-x-auto border border-primary-border/60 rounded-xl"
                  >
                    <table class="w-full text-xs">
                      <thead>
                        <tr
                          class="border-b border-primary-border/60 bg-background/80 text-[10px] text-secondary-text uppercase"
                        >
                          <th class="text-left py-2 px-3 font-medium">
                            Trade ID
                          </th>
                          <th class="text-left py-2 px-3 font-medium">
                            Symbol
                          </th>
                          <th class="text-left py-2 px-3 font-medium">
                            Account
                          </th>
                          <th class="text-left py-2 px-3 font-medium">
                            Closed At
                          </th>
                          <th class="text-right py-2 px-3 font-medium">
                            Gross PnL
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="t in period.trades"
                          :key="t.trade_id"
                          class="border-b border-primary-border/30 last:border-none hover:bg-background/40 transition-colors"
                        >
                          <td
                            class="py-2 px-3 font-mono font-semibold text-primary-text"
                          >
                            #{{ t.trade_id }}
                          </td>
                          <td class="py-2 px-3">
                            <span
                              class="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-background border border-primary-border text-primary-text"
                            >
                              {{ t.symbol }}
                            </span>
                          </td>
                          <td class="py-2 px-3 font-mono text-secondary-text">
                            {{ t.account_number }}
                          </td>
                          <td class="py-2 px-3 text-secondary-text">
                            {{ formatDate(t.closed_at) }}
                          </td>
                          <td
                            class="py-2 px-3 text-right font-mono font-semibold"
                            :class="
                              t.gross_pnl >= 0
                                ? 'text-primary-green'
                                : 'text-primary-red'
                            "
                          >
                            {{ t.gross_pnl > 0 ? "+" : ""
                            }}{{ formatCurrency(t.gross_pnl) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="getFilteredPeriods(follower.periods || []).length === 0"
              class="text-center py-6 text-xs text-secondary-text"
            >
              No periods matching search filter.
            </div>
          </div>
        </div>

        <div
          v-if="displayedFollowers.length === 0"
          class="text-center py-12 text-xs text-secondary-text border border-primary-border rounded-2xl bg-card-background"
        >
          No follower sessions matching the selected filter.
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- TAB 2: IB DISTRIBUTION LOGS -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'ib_distribution'">
        <div
          class="border border-primary-border rounded-2xl overflow-hidden bg-card-background shadow-2xs"
        >
          <div
            class="px-5 py-3.5 border-b border-primary-border flex items-center justify-between bg-card-background"
          >
            <div class="flex items-center gap-2">
              <GitBranch class="w-4 h-4 text-secondary-text" />
              <span class="text-xs font-semibold text-primary-text"
                >Client IB Distribution Logs</span
              >
            </div>
            <span class="text-xs text-secondary-text">
              {{ store.data?.ib_distribution?.length ?? 0 }} Records
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-primary-border bg-background/50">
                  <th
                    class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3"
                  >
                    Trade ID
                  </th>
                  <th
                    class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3"
                  >
                    IB Partner
                  </th>
                  <th
                    class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3"
                  >
                    Level
                  </th>
                  <th
                    class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3"
                  >
                    Role
                  </th>
                  <th
                    class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3"
                  >
                    Pool Share %
                  </th>
                  <th
                    class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3"
                  >
                    Actual Share %
                  </th>
                  <th
                    class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3"
                  >
                    Commission
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(ib, idx) in filteredIbDistribution"
                  :key="idx"
                  class="border-b border-primary-border last:border-none hover:bg-background/40 transition-colors"
                >
                  <td
                    class="p-3 font-mono text-xs font-semibold text-primary-text"
                  >
                    #{{ ib.trade_id }}
                  </td>

                  <td class="p-3">
                    <p class="text-xs font-semibold text-primary-text">
                      {{ ib.ib_name }}
                    </p>
                    <p class="text-[11px] text-secondary-text">
                      {{ ib.ib_email }}
                    </p>
                    <p class="text-[10px] text-secondary-text">
                      User ID: #{{ ib.ib_user_id }} · IB ID: #{{ ib.ib_id }}
                    </p>
                  </td>

                  <td class="p-3">
                    <span
                      class="px-2 py-0.5 rounded text-[11px] font-medium bg-background border border-primary-border text-primary-text"
                    >
                      Level {{ ib.ib_level }}
                    </span>
                  </td>

                  <td class="p-3">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      :class="
                        ib.role === 'master'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-background border border-primary-border text-secondary-text'
                      "
                    >
                      {{ ib.role || "Partner" }}
                    </span>
                  </td>

                  <td class="p-3 font-mono text-xs text-primary-text">
                    {{ ib.pool_share_pct }}%
                  </td>

                  <td class="p-3 font-mono text-xs text-primary-text">
                    {{ ib.actual_share_pct ?? ib.split_percentage }}%
                  </td>

                  <td
                    class="p-3 text-right font-mono text-xs font-semibold text-primary-green"
                  >
                    {{ formatCurrency(ib.commission) }}
                  </td>
                </tr>

                <tr v-if="filteredIbDistribution.length === 0">
                  <td
                    colspan="7"
                    class="text-center py-10 text-xs text-secondary-text"
                  >
                    No IB distribution records found for this client.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- TAB 3: AGENT DISTRIBUTION -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'agent_distribution'">
        <div
          class="border border-primary-border rounded-2xl overflow-hidden bg-card-background shadow-2xs"
        >
          <div
            class="px-5 py-3.5 border-b border-primary-border flex items-center justify-between bg-card-background"
          >
            <div class="flex items-center gap-2">
              <Shield class="w-4 h-4 text-secondary-text" />
              <span class="text-xs font-semibold text-primary-text"
                >Agent Distribution</span
              >
            </div>
            <span class="text-xs text-secondary-text">
              {{ store.data?.agent_distribution?.length ?? 0 }} Records
            </span>
          </div>

          <div
            v-if="!store.data?.agent_distribution?.length"
            class="text-center py-12 text-xs text-secondary-text"
          >
            No agent distributions recorded for this client.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-primary-border bg-background/50">
                  <th
                    class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3"
                  >
                    Agent
                  </th>
                  <th
                    class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-wider p-3"
                  >
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(agent, idx) in store.data.agent_distribution"
                  :key="idx"
                  class="border-b border-primary-border last:border-none"
                >
                  <td class="p-3 text-xs font-medium text-primary-text">
                    {{ agent.name || agent.email || "Agent" }}
                  </td>
                  <td
                    class="p-3 text-right text-xs font-semibold text-primary-green tabular-nums"
                  >
                    {{ formatCurrency(agent.commission) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  ReceiptText,
  Users,
  GitBranch,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Building2,
  Activity,
  Calendar,
  ChevronDown,
  Search,
  RotateCw,
  Shield,
  Mail,
  Phone,
} from "lucide-vue-next";
import { useUserSettlementStore } from "@/stores/fmLeaderboard/userSettlement";

const route = useRoute();
const router = useRouter();
const store = useUserSettlementStore();

const activeTab = ref("settlements");
const searchQuery = ref("");
const selectedFollowerId = ref("ALL");
const expandedPeriodKey = ref(null);
const fmInfo = ref(null);

const loadFmInfo = () => {
  try {
    const raw = localStorage.getItem("active_fm");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (String(parsed?.id) === String(route.params.id)) {
        fmInfo.value = parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load active FM from localStorage:", e);
  }
};

const activeCurrency = computed(() => {
  return (
    route.query.currency ||
    store.data?.broker_currency ||
    store.data?.currency ||
    fmInfo.value?.broker_currency ||
    fmInfo.value?.currency ||
    "USD"
  );
});

const getCurrencySymbol = (currency) => {
  const c = String(currency || "")
    .trim()
    .toUpperCase();
  if (c === "USC" || c === "CENT") return "C";
  if (c === "CAD") return "C$";
  if (c === "EUR") return "€";
  if (c === "GBP") return "£";
  if (c === "INR") return "₹";
  if (c === "JPY") return "¥";
  if (c === "USD") return "$";
  return c ? `${c} ` : "$";
};

const formatCurrency = (val, currency = null) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (isNaN(num)) return "—";
  const sym = getCurrencySymbol(currency || activeCurrency.value);
  const isNegative = num < 0;
  const formatted = Math.abs(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? "-" : ""}${sym}${formatted}`;
};

const formatDate = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return isoString;
  }
};

const formatPeriodDate = (periodKey) => {
  if (!periodKey) return "";
  try {
    const d = new Date(periodKey);
    if (isNaN(d.getTime())) return periodKey;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return periodKey;
  }
};

const userData = computed(() => store.data?.user || null);

const userSummary = computed(() => {
  return userData.value?.summary || {};
});

const followerList = computed(() => {
  return userData.value?.followers || [];
});

const displayedFollowers = computed(() => {
  if (selectedFollowerId.value === "ALL") {
    return followerList.value;
  }
  return followerList.value.filter(
    (f) => String(f.follower_id) === String(selectedFollowerId.value),
  );
});

const totalTradesCount = computed(() => {
  let count = 0;
  followerList.value.forEach((f) => {
    count += f.summary?.trades_count ?? f.trades?.length ?? 0;
  });
  return count;
});

const getFilteredPeriods = (periods) => {
  if (!searchQuery.value.trim()) return periods;
  const q = searchQuery.value.toLowerCase().trim();
  return periods.filter((p) => {
    const periodMatches =
      String(p.period_key || "")
        .toLowerCase()
        .includes(q) ||
      String(p.period_type || "")
        .toLowerCase()
        .includes(q);
    const tradeMatches = Array.isArray(p.trades)
      ? p.trades.some(
          (t) =>
            String(t.trade_id || "").includes(q) ||
            String(t.symbol || "")
              .toLowerCase()
              .includes(q),
        )
      : false;
    return periodMatches || tradeMatches;
  });
};

const filteredIbDistribution = computed(() => {
  const list = store.data?.ib_distribution || [];
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter((ib) => {
    return (
      String(ib.trade_id || "").includes(q) ||
      String(ib.ib_name || "")
        .toLowerCase()
        .includes(q) ||
      String(ib.ib_email || "")
        .toLowerCase()
        .includes(q) ||
      String(ib.ib_user_id || "").includes(q) ||
      String(ib.role || "")
        .toLowerCase()
        .includes(q)
    );
  });
});

const togglePeriodExpand = (key) => {
  expandedPeriodKey.value = expandedPeriodKey.value === key ? null : key;
};

const goBack = () => {
  router.push({
    name: "fm-settlement-preview",
    params: { id: route.params.id },
    query: { currency: activeCurrency.value },
  });
};

const loadData = () => {
  store.fetchUserSettlement(route.params.id, route.params.userId);
};

onMounted(() => {
  loadFmInfo();
  loadData();
});
</script>
