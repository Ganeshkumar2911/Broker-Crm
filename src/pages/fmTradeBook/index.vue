<template>
  <div class="space-y-6 pb-12">
    <!-- TOP HEADER / BREADCRUMB CARD -->
    <div
      class="bg-card-background border border-primary-border rounded-lg p-5 "
    >
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <!-- Left Title & Meta -->
        <div class="flex items-center gap-3">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1
                class="text-lg font-bold text-primary-text flex items-center gap-2"
              >
                <BookOpen class="w-5 h-5 text-primary" />
                {{ headerTitle }}
              </h1>

              <!-- Mode Badge -->
              <span
                class="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border"
                :class="
                  isFollowerMode
                    ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                    : 'bg-primary/10 text-primary border border-primary/20'
                "
              >
                {{ isFollowerMode ? "Follower Trade Book" : "FM Trade Book" }}
              </span>

              <!-- Live Account Status -->
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                :class="
                  activeStatus
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-background text-secondary-text border-primary-border'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="activeStatus ? 'bg-primary-green' : 'bg-zinc-400'"
                />
                {{ activeStatus ? "Active" : "Inactive" }}
              </span>
            </div>

            <div
              class="flex items-center gap-4 text-xs text-secondary-text mt-1.5 flex-wrap"
            >
              <span
                v-if="accountNumber"
                class="flex items-center gap-1 font-mono font-semibold text-primary-text"
              >
                <span class="text-secondary-text">Account:</span>
                #{{ accountNumber }}
              </span>

              <span
                v-if="coverageAccountNumber && !isFollowerMode"
                class="flex items-center gap-1 font-mono font-semibold text-primary-text"
              >
                <span class="text-secondary-text">Coverage:</span>
                #{{ coverageAccountNumber }}
              </span>

              <span
                v-if="brokerGroup"
                class="flex items-center gap-1 font-mono text-secondary-text"
              >
                <Server class="w-3.5 h-3.5 text-secondary-text" />
                {{ brokerGroup }}
              </span>

              <span
                v-if="leverageOrRatio"
                class="text-xs font-bold text-primary"
              >
                {{ leverageOrRatio }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Quick Actions -->
        <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            class="p-2 rounded-lg border border-primary-border bg-background text-secondary-text hover:text-primary-text hover:bg-card-background transition-colors cursor-pointer "
            :disabled="store.isLoading || store.isRefreshing"
            @click="store.fetchTradesData(true)"
            title="Refresh Data"
          >
            <RefreshCw
              class="w-3.5 h-3.5"
              :class="{ 'animate-spin': store.isRefreshing || store.isLoading }"
            />
          </button>
        </div>
      </div>

      <!-- KPI Summary Ribbon Cards (Specific to Mode & Active Tab) -->
      <!-- FM MASTER TRADES MODE -->
      <div
        v-if="!isFollowerMode"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-primary-border/60"
      >
        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Trades</span
            >
            <Activity class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.total_trades ?? store.summary.total_positions ?? 0
            }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Open Trades</span
            >
            <Clock class="w-3.5 h-3.5 text-primary-yellow" />
          </div>
          <p class="text-xl font-extrabold text-primary-yellow font-mono">
            {{ store.summary.open_trades ?? store.summary.open_positions ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Closed Trades</span
            >
            <CheckCircle2 class="w-3.5 h-3.5 text-primary-green" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.closed_trades ?? store.summary.closed_positions ?? 0
            }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Volume</span
            >
            <DollarSign class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              formatLot(store.summary.total_lot ?? store.summary.total_volume)
            }}
            <span class="text-xs font-bold text-secondary-text">Lots</span>
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background col-span-2 sm:col-span-1"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Net PnL</span
            >
            <TrendingUp
              v-if="
                Number(
                  store.summary.total_pnl ?? store.summary.total_profit ?? 0,
                ) >= 0
              "
              class="w-3.5 h-3.5 text-primary-green"
            />
            <TrendingDown v-else class="w-3.5 h-3.5 text-primary-red" />
          </div>
          <p
            class="text-xl font-extrabold font-mono"
            :class="
              Number(
                store.summary.total_pnl ?? store.summary.total_profit ?? 0,
              ) >= 0
                ? 'text-primary-green'
                : 'text-primary-red'
            "
          >
            {{
              formatPnl(store.summary.total_pnl ?? store.summary.total_profit)
            }}
          </p>
        </div>
      </div>

      <!-- FOLLOWER MODE: POSITIONS TAB (6 KPI Cards) -->
      <div
        v-else-if="store.activeTab === 'positions'"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-primary-border/60"
      >
        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Positions</span
            >
            <Activity class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.total_positions ?? store.summary.total_trades ?? 0
            }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Open Positions</span
            >
            <Clock class="w-3.5 h-3.5 text-primary-yellow" />
          </div>
          <p class="text-xl font-extrabold text-primary-yellow font-mono">
            {{ store.summary.open_positions ?? store.summary.open_trades ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Closed Positions</span
            >
            <CheckCircle2 class="w-3.5 h-3.5 text-primary-green" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.closed_positions ?? store.summary.closed_trades ?? 0
            }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Win Rate</span
            >
            <TrendingUp class="w-3.5 h-3.5 text-primary-green" />
          </div>
          <div class="flex items-baseline gap-1.5">
            <p class="text-xl font-extrabold text-primary-green font-mono">
              {{
                store.summary.win_rate != null
                  ? Number(store.summary.win_rate).toFixed(1) + "%"
                  : "-"
              }}
            </p>
            <span
              v-if="
                store.summary.winning_positions !== undefined ||
                store.summary.winning_trades !== undefined
              "
              class="text-[10px] font-semibold text-secondary-text"
            >
              ({{
                store.summary.winning_positions ??
                store.summary.winning_trades ??
                0
              }}W/{{
                store.summary.losing_positions ??
                store.summary.losing_trades ??
                0
              }}L)
            </span>
          </div>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Volume</span
            >
            <DollarSign class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              formatLot(
                store.summary.total_volume ??
                  store.summary.total_lot ??
                  store.summary.total_lots,
              )
            }}
            <span class="text-xs font-bold text-secondary-text">Lots</span>
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Profit</span
            >
            <TrendingUp
              v-if="
                Number(
                  store.summary.total_profit ?? store.summary.total_pnl ?? 0,
                ) >= 0
              "
              class="w-3.5 h-3.5 text-primary-green"
            />
            <TrendingDown v-else class="w-3.5 h-3.5 text-primary-red" />
          </div>
          <p
            class="text-xl font-extrabold font-mono"
            :class="
              Number(
                store.summary.total_profit ?? store.summary.total_pnl ?? 0,
              ) >= 0
                ? 'text-primary-green'
                : 'text-primary-red'
            "
          >
            {{
              formatPnl(store.summary.total_profit ?? store.summary.total_pnl)
            }}
          </p>
        </div>
      </div>

      <!-- FOLLOWER MODE: ORDERS TAB (5 KPI Cards) -->
      <div
        v-else-if="store.activeTab === 'orders'"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-primary-border/60"
      >
        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Orders</span
            >
            <Activity class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{ store.summary.total_orders ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Filled Orders</span
            >
            <CheckCircle2 class="w-3.5 h-3.5 text-primary-green" />
          </div>
          <p class="text-xl font-extrabold text-primary-green font-mono">
            {{ store.summary.filled_orders ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Rejected Orders</span
            >
            <X class="w-3.5 h-3.5 text-primary-red" />
          </div>
          <p class="text-xl font-extrabold text-primary-red font-mono">
            {{ store.summary.rejected_orders ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Volume</span
            >
            <DollarSign class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              formatLot(
                store.summary.total_volume ??
                  store.summary.total_lot ??
                  store.summary.total_lots,
              )
            }}
            <span class="text-xs font-bold text-secondary-text">Lots</span>
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background col-span-2 sm:col-span-1"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Fill Rate</span
            >
            <TrendingUp class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              store.summary.total_orders
                ? Math.round(
                    ((store.summary.filled_orders || 0) /
                      store.summary.total_orders) *
                      100,
                  ) + "%"
                : "-"
            }}
          </p>
        </div>
      </div>

      <!-- FOLLOWER MODE: DEALS TAB (6 KPI Cards) -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-primary-border/60"
      >
        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Deals</span
            >
            <Activity class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{ store.summary.total_deals ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >IN Deals</span
            >
            <Clock class="w-3.5 h-3.5 text-primary-yellow" />
          </div>
          <p class="text-xl font-extrabold text-primary-yellow font-mono">
            {{ store.summary.in_deals ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >OUT Deals</span
            >
            <CheckCircle2 class="w-3.5 h-3.5 text-primary-green" />
          </div>
          <p class="text-xl font-extrabold text-primary-green font-mono">
            {{ store.summary.out_deals ?? 0 }}
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Volume</span
            >
            <DollarSign class="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p class="text-xl font-extrabold text-primary-text font-mono">
            {{
              formatLot(
                store.summary.total_volume ??
                  store.summary.total_lot ??
                  store.summary.total_lots,
              )
            }}
            <span class="text-xs font-bold text-secondary-text">Lots</span>
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Commission / Storage</span
            >
            <DollarSign class="w-3.5 h-3.5 text-secondary-text" />
          </div>
          <p class="text-sm font-extrabold text-primary-text font-mono mt-1">
            {{ formatCurrency(store.summary.total_commission || 0) }}
            <span class="text-[10px] text-secondary-text font-normal"
              >/ {{ formatCurrency(store.summary.total_storage || 0) }}</span
            >
          </p>
        </div>

        <div
          class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background"
        >
          <div
            class="flex items-center justify-between text-secondary-text mb-1"
          >
            <span class="text-[10px] uppercase font-bold tracking-wider"
              >Total Profit</span
            >
            <TrendingUp
              v-if="
                Number(
                  store.summary.total_profit ?? store.summary.total_pnl ?? 0,
                ) >= 0
              "
              class="w-3.5 h-3.5 text-primary-green"
            />
            <TrendingDown v-else class="w-3.5 h-3.5 text-primary-red" />
          </div>
          <p
            class="text-xl font-extrabold font-mono"
            :class="
              Number(
                store.summary.total_profit ?? store.summary.total_pnl ?? 0,
              ) >= 0
                ? 'text-primary-green'
                : 'text-primary-red'
            "
          >
            {{
              formatPnl(store.summary.total_profit ?? store.summary.total_pnl)
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- TABS BAR & FILTERS SECTION -->
    <div
      class="bg-card-background border border-primary-border rounded-lg p-4 space-y-4 "
    >
      <!-- Tabs Switcher -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-border pb-3"
      >
        <!-- For FM Master Trade Book: Show Single Master Trades Tab -->
        <div v-if="!isFollowerMode" class="flex items-center gap-1.5">
          <div
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 bg-primary text-white "
          >
            <Layers class="w-3.5 h-3.5" />
            <span>Master Trades</span>
            <span
              v-if="
                store.positions.length > 0 || store.pagination.total_items > 0
              "
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold bg-white/20 text-white"
            >
              {{
                store.summary.total_positions ??
                store.summary.total_trades ??
                store.pagination.total_items ??
                store.positions.length
              }}
            </span>
          </div>
        </div>

        <!-- For Follower Trade Book: Show 3 Multi-Tabs -->
        <div v-else class="flex items-center gap-1.5">
          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            :class="
              store.activeTab === 'positions'
                ? 'bg-primary text-white '
                : 'bg-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="store.setActiveTab('positions')"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>Positions</span>
            <span
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
              :class="
                store.activeTab === 'positions'
                  ? 'bg-white/20 text-white'
                  : 'bg-card-background text-secondary-text'
              "
            >
              {{ store.summary.total_positions ?? "" }}
            </span>
          </button>

          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            :class="
              store.activeTab === 'orders'
                ? 'bg-primary text-white '
                : 'bg-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="store.setActiveTab('orders')"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>Orders</span>
            <span
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
              :class="
                store.activeTab === 'orders'
                  ? 'bg-white/20 text-white'
                  : 'bg-card-background text-secondary-text'
              "
            >
              {{ store.summary.total_orders ?? "0" }}
            </span>
          </button>

          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            :class="
              store.activeTab === 'deals'
                ? 'bg-primary text-white '
                : 'bg-background border border-primary-border text-secondary-text hover:text-primary-text'
            "
            @click="store.setActiveTab('deals')"
          >
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Deals History</span>
            <span
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold"
              :class="
                store.activeTab === 'deals'
                  ? 'bg-white/20 text-white'
                  : 'bg-card-background text-secondary-text'
              "
            >
              {{ store.summary.total_deals ?? "" }}
            </span>
          </button>
        </div>

        <div class="text-[11px] text-secondary-text font-medium">
          Viewing
          <strong class="text-primary-text font-mono capitalize">{{
            isFollowerMode ? store.activeTab : "Master Trades"
          }}</strong>
          records
        </div>
      </div>

      <!-- Filters Row (Single Unified Row) -->
      <div class="flex items-center gap-2.5 overflow-x-auto pb-1 flex-nowrap">
        <!-- Search Input (if enabled in filter schema) -->
        <div
          v-if="hasSearchFilter"
          class="relative w-48 sm:w-56 shrink-0"
        >
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text pointer-events-none"
          />
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search symbol, ticket, account..."
            class="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-background border border-primary-border text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-primary transition-colors font-medium"
            @input="handleSearch($event.target.value)"
          />
          <button
            v-if="searchInput"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer"
            @click="clearSearch"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Dynamic Enum Select Filters -->
        <div
          v-for="enumFilter in dynamicEnumFilters"
          :key="enumFilter.key"
          class="w-32 sm:w-36 shrink-0"
        >
          <BaseSelect
            :modelValue="store.filters[enumFilter.key]"
            :options="enumFilter.options"
            :placeholder="enumFilter.label"
            clearable
            @update:modelValue="(val) => store.setDynamicFilter(enumFilter.key, val)"
          />
        </div>

        <!-- Date Range Picker (from_date / to_date) -->
        <div class="min-w-48 sm:min-w-60 shrink-0">
          <BaseDatePicker
            v-model="dateRangeValue"
            :range="true"
            placeholder="Select date range"
            valueFormat="YYYY-MM-DD"
          />
        </div>

        <!-- Reset Filter Button -->
        <button
          v-if="hasActiveFilters"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-secondary-text hover:text-primary-text bg-background border border-primary-border hover:border-primary/40 transition-colors cursor-pointer  shrink-0"
          @click="handleResetFilters"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>

    <!-- MAIN DATA TABLE -->
    
      <div class="overflow-x-auto">

        <!-- 1. POSITIONS TABLE (Used for both FM Master Trades and Follower Positions) -->
        <DataTable
          v-if="store.activeTab === 'positions'"
          :columns="positionsColumns"
          :data="store.positions"
          :loading="store.isLoading"
          :pagination="store.pagination"
          @page-change="store.setPage"
          @per-page-change="store.setPerPage"
          empty-title="No positions found"
          empty-text="There are currently no position records available."
        >
          <template #cell-ticket="{ row: item }">
            <span class="font-mono font-bold text-primary select-all">#{{ item.position_ticket || item.id || "-" }}</span>
          </template>
          <template #cell-account="{ row: item }">
            <span class="font-mono font-bold text-primary-text">{{ item.account_number || "-" }}</span>
          </template>
          <template #cell-broker_group="{ row: item }">
            <span class="font-mono text-secondary-text">{{ item.broker_group || "-" }}</span>
          </template>
          <template #cell-symbol="{ row: item }">
            <span class="font-bold text-primary-text">{{ item.symbol || "-" }}</span>
          </template>
          <template #cell-type="{ row: item }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border"
              :class="
                item.action_name === 'BUY' || item.action === 0 || item.type === 'BUY'
                  ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                  : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
              "
            >
              {{ item.action_name || (item.action === 0 ? "BUY" : item.action === 1 ? "SELL" : item.type || "-") }}
            </span>
          </template>
          <template #cell-status="{ row: item }">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
              :class="
                String(item.status || '').toUpperCase() === 'OPEN'
                  ? 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'
                  : 'bg-background text-secondary-text border-primary-border'
              "
            >
              <span v-if="String(item.status || '').toUpperCase() === 'OPEN'" class="w-1.5 h-1.5 rounded-full bg-primary-yellow animate-pulse" />
              {{ item.status || (item.is_open ? "OPEN" : "CLOSED") }}
            </span>
          </template>
          <template #cell-volume="{ row: item }">
            <span class="font-mono font-bold text-primary-text">{{ formatLot(getTradeLot(item)) }}</span>
          </template>
          <template #cell-entry_price="{ row: item }">
            <span class="font-mono text-secondary-text">{{ formatPrice(item.price_open ?? item.entry_price ?? item.price_position ?? item.price) }}</span>
          </template>
          <template #cell-exit_price="{ row: item }">
            <span class="font-mono text-secondary-text">{{ formatPrice(item.price_close ?? item.exit_price) }}</span>
          </template>
          <template #cell-pnl="{ row: item }">
            <span class="tabular-nums transition-colors duration-200 font-mono font-bold whitespace-nowrap" :class="Number(livePNL(item)) >= 0 ? 'text-primary-green' : 'text-primary-red'">
              {{ formatPnl(livePNL(item)) }}
            </span>
          </template>
          <template #cell-opened="{ row: item }">
            <span class="font-medium text-secondary-text whitespace-nowrap">{{ item.created_at }}</span>
          </template>
          <template #cell-closed="{ row: item }">
            <span class="font-medium text-secondary-text whitespace-nowrap">{{ item.closed_at }}</span>
          </template>
        </DataTable>

        <!-- 2. ORDERS TABLE (Follower Mode) -->
        <DataTable
          v-else-if="store.activeTab === 'orders'"
          :columns="ordersColumns"
          :data="store.orders"
          :loading="store.isLoading"
          :pagination="store.pagination"
          @page-change="store.setPage"
          @per-page-change="store.setPerPage"
          empty-title="No orders found"
          empty-text="There are currently no orders recorded."
        >
          <template #cell-order_ticket="{ row: order }">
            <span class="font-mono font-bold text-primary select-all">#{{ order.order_ticket || order.id || "-" }}</span>
          </template>
          <template #cell-position_ticket="{ row: order }">
            <span class="font-mono text-secondary-text">#{{ order.position_ticket || "-" }}</span>
          </template>
          <template #cell-account="{ row: order }">
            <span class="font-mono font-bold text-primary-text">{{ order.account_number || "-" }}</span>
          </template>
          <template #cell-symbol="{ row: order }">
            <span class="font-bold text-primary-text">{{ order.symbol || "-" }}</span>
          </template>
          <template #cell-side="{ row: order }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border"
              :class="
                order.type_name === 'BUY' || order.type === 0 || order.action_name === 'BUY'
                  ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                  : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
              "
            >
              {{ order.type_name || (order.type === 0 ? "BUY" : order.type === 1 ? "SELL" : order.action_name || "-") }}
            </span>
          </template>
          <template #cell-state="{ row: order }">
            <Tooltip
              v-if="String(order.state_name || '').toUpperCase() === 'REJECTED' || order.state === 5 || order.reject_reason || order.comment"
              :text="order.reject_reason || order.comment || 'REJECTED'"
              position="center"
            >
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-primary-red/10 text-primary-red border-primary-red/20 cursor-help">
                <span>{{ order.state_name || "REJECTED" }}</span>
                <Info class="w-3 h-3 text-primary-red shrink-0" />
              </span>
            </Tooltip>
            <span
              v-else-if="String(order.state_name || '').toUpperCase() === 'FILLED' || order.state === 4"
              class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-primary-green/10 text-primary-green border-primary-green/20"
            >
              {{ order.state_name || "FILLED" }}
            </span>
            <span v-else class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
              {{ order.state_name || order.state || "-" }}
            </span>
          </template>
          <template #cell-initial_vol="{ row: order }">
            <span class="font-mono font-bold text-primary-text">{{ formatLot(getTradeLot(order)) }}</span>
          </template>
          <template #cell-current_vol="{ row: order }">
            <span class="font-mono text-secondary-text">{{ formatLot(order.volume_current ?? order.volume_closed ?? 0) }}</span>
          </template>
          <template #cell-order_price="{ row: order }">
            <span class="font-mono text-secondary-text">{{ formatPrice(order.price_order ?? order.price) }}</span>
          </template>
          <template #cell-current_price="{ row: order }">
            <span class="font-mono text-secondary-text">{{ formatPrice(order.price_current ?? order.price_position) }}</span>
          </template>
          <template #cell-setup_time="{ row: order }">
            <span class="font-medium text-secondary-text whitespace-nowrap">{{ order.time_setup || order.created_at }}</span>
          </template>
          <template #cell-done_time="{ row: order }">
            <span class="font-medium text-secondary-text whitespace-nowrap">{{ order.time_done || order.closed_at ? order.time_done || order.closed_at : "-" }}</span>
          </template>
        </DataTable>

        <!-- 3. DEALS / HISTORY TABLE -->
        <DataTable
          v-else-if="store.activeTab === 'deals'"
          :columns="dealsColumns"
          :data="store.deals"
          :loading="store.isLoading"
          :pagination="store.pagination"
          @page-change="store.setPage"
          @per-page-change="store.setPerPage"
          empty-title="No deal history found"
          empty-text="There are currently no deals recorded."
        >
          <template #cell-deal_ticket="{ row: deal }">
            <span class="font-mono font-bold text-primary select-all">#{{ deal.deal_ticket || deal.id || "-" }}</span>
          </template>
          <template #cell-position_ticket="{ row: deal }">
            <span class="font-mono text-secondary-text">#{{ deal.position_ticket || "-" }}</span>
          </template>
          <template #cell-order_ticket="{ row: deal }">
            <span class="font-mono text-secondary-text">#{{ deal.order_ticket || "-" }}</span>
          </template>
          <template #cell-account="{ row: deal }">
            <span class="font-mono font-bold text-primary-text">{{ deal.account_number || "-" }}</span>
          </template>
          <template #cell-broker_group="{ row: deal }">
            <span class="font-mono text-secondary-text">{{ deal.broker_group || "-" }}</span>
          </template>
          <template #cell-symbol="{ row: deal }">
            <span class="font-bold text-primary-text">{{ deal.symbol || "-" }}</span>
          </template>
          <template #cell-action="{ row: deal }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border"
              :class="
                deal.action_name === 'BUY' || deal.action === 0
                  ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                  : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
              "
            >
              {{ deal.action_name || (deal.action === 0 ? "BUY" : deal.action === 1 ? "SELL" : "-") }}
            </span>
          </template>
          <template #cell-entry="{ row: deal }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
              :class="
                deal.entry_name === 'IN' || deal.entry === 0
                  ? 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20'
                  : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
              "
            >
              {{ deal.entry_name || (deal.entry === 0 ? "IN" : deal.entry === 1 ? "OUT" : "-") }}
            </span>
          </template>
          <template #cell-volume="{ row: deal }">
            <span class="font-mono font-bold text-primary-text">{{ formatLot(getTradeLot(deal)) }}</span>
          </template>
          <template #cell-deal_price="{ row: deal }">
            <span class="font-mono text-secondary-text">{{ formatPrice(deal.price) }}</span>
          </template>
          <template #cell-position_price="{ row: deal }">
            <span class="font-mono text-secondary-text">{{ formatPrice(deal.price_position) }}</span>
          </template>
          <template #cell-profit="{ row: deal }">
            <span class="font-mono font-bold whitespace-nowrap" :class="Number(deal.profit ?? deal.profit_raw ?? 0) >= 0 ? 'text-primary-green' : 'text-primary-red'">
              {{ formatPnl(deal.profit ?? deal.profit_raw) }}
            </span>
          </template>
          <template #cell-commission="{ row: deal }">
            <span class="font-mono text-secondary-text">{{ formatCurrency(deal.commission || deal.fee || 0) }}</span>
          </template>
          <template #cell-time="{ row: deal }">
            <span class="font-medium text-secondary-text whitespace-nowrap">{{ formatDate(deal.time) }}</span>
          </template>
        </DataTable>
      </div>


    </div>

</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  BookOpen,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  RotateCcw,
  ArrowLeft,
  Layers,
  Server,
  Info,
} from "lucide-vue-next";
import { useFmTradeBookStore } from "@/stores/fmTradeBook/fmTradeBook";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import Pagination from "@/components/common/Pagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import { formatDate as formatTime } from "@/utils/timeFormatter.js";
import { livePNL } from "@/utils/livePNL.js";

const store = useFmTradeBookStore();
const route = useRoute();
const router = useRouter();

const searchInput = ref("");

// Mode detection: checks route name and params
const isFollowerMode = computed(() => {
  return (
    route.name === "follower-trade-book" ||
    route.path.includes("/follower/trade-book")
  );
});

const activeStatus = computed(() => {
  if (store.accountInfo) {
    return store.accountInfo.is_active ?? store.accountInfo.status === "active";
  }
  if (route.query.is_active !== undefined) {
    return route.query.is_active === "true" || route.query.is_active === true;
  }
  return true;
});

const headerTitle = computed(() => {
  if (isFollowerMode.value) {
    return (
      store.accountInfo?.name ||
      store.accountInfo?.user_name ||
      route.query.user_name ||
      route.query.name ||
      (accountNumber.value ? `Account #${accountNumber.value}` : "Follower Trade Book")
    );
  }
  return store.accountInfo?.label_name || route.query.name || "Fund Manager Master Account";
});

const accountNumber = computed(() => {
  return (
    store.accountInfo?.account_number ||
    store.accountInfo?.master_account?.account_number ||
    route.query.account_number ||
    ""
  );
});

const coverageAccountNumber = computed(() => {
  return (
    store.accountInfo?.coverage_account?.account_number ||
    store.accountInfo?.coverage_account_id ||
    route.query.coverage_account_number ||
    route.query.coverage_account_id ||
    ""
  );
});

const brokerGroup = computed(() => {
  return (
    store.accountInfo?.broker_group ||
    store.accountInfo?.master_account?.broker_group ||
    route.query.broker_group ||
    ""
  );
});

const leverageOrRatio = computed(() => {
  const copyRatio = store.accountInfo?.copy_ratio || route.query.copy_ratio;
  if (isFollowerMode.value && copyRatio) {
    return `Ratio: ${copyRatio}x`;
  }
  const lev = store.accountInfo?.broker_leverage || route.query.broker_leverage;
  if (lev) {
    return `1:${lev}`;
  }
  return "";
});

const currentTableCount = computed(() => {
  if (!isFollowerMode.value) return store.positions.length;
  if (store.activeTab === "orders") return store.orders.length;
  if (store.activeTab === "deals") return store.deals.length;
  return store.positions.length;
});

// Dynamic Field Label Formatter
const formatFieldLabel = (key) => {
  const customMap = {
    status: "Status",
    state: "Order State",
    entry: "Entry Type",
    action: "Action",
    order_type: "Order Type",
    type: "Side / Action",
    result: "Result",
    trade_source: "Trade Source",
    symbol: "Symbol",
    from_date: "From Date",
    to_date: "To Date",
    closed_from: "Closed From",
    closed_to: "Closed To",
  };
  if (customMap[key]) return customMap[key];
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// Check if search filter exists in active section schema
const hasSearchFilter = computed(() => {
  const schema = store.currentSectionFilters || {};
  return schema.search !== undefined ? !!schema.search : true;
});

// Dynamic Enum Filters generated directly from API response schema
const dynamicEnumFilters = computed(() => {
  const schema = store.currentSectionFilters || {};
  const list = [];

  Object.entries(schema).forEach(([key, fieldDef]) => {
    if (fieldDef?.type === "enum" && Array.isArray(fieldDef?.options)) {
      const label = formatFieldLabel(key);
      const options = [
        { label: `All ${label}`, value: "" },
        ...fieldDef.options.map((opt) => ({
          label: typeof opt === "string" ? opt : (opt.label || opt.value),
          value: typeof opt === "string" ? opt : opt.value,
        })),
      ];

      list.push({
        key,
        label,
        options,
        multi: !!fieldDef.multi,
      });
    }
  });

  return list;
});

// Dynamic Date Range Filters generated directly from API schema (pairs from_date/to_date and closed_from/closed_to)
// Date Range Filter (from_date / to_date)
const dateRangeValue = computed({
  get() {
    if (store.filters.from_date || store.filters.to_date) {
      return {
        start: store.filters.from_date || null,
        end: store.filters.to_date || null,
      };
    }
    return null;
  },
  set(val) {
    handleDateRangeUpdate(val);
  },
});

const handleDateRangeUpdate = (val) => {
  if (!val) {
    store.setDateFilter("", "");
    return;
  }
  if (Array.isArray(val)) {
    store.setDateFilter(val[0] || "", val[1] || "");
  } else if (typeof val === "object") {
    store.setDateFilter(val.start || val.from || "", val.end || val.to || "");
  }
};

const hasActiveFilters = computed(() => {
  const schema = store.currentSectionFilters || {};
  const hasDynamicActive = Object.keys(schema).some((key) => {
    if (key === "from_date" || key === "to_date" || key === "closed_from" || key === "closed_to") return false;
    const val = store.filters[key];
    return val !== undefined && val !== null && val !== "";
  });

  return (
    hasDynamicActive ||
    !!store.filters.search ||
    !!store.filters.status ||
    !!store.filters.type ||
    !!store.filters.symbol ||
    !!store.filters.from_date ||
    !!store.filters.to_date
  );
});

let searchDebounceTimer = null;
const handleSearch = (val) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    store.setSearch(val);
  }, 350);
};

const clearSearch = () => {
  searchInput.value = "";
  store.setSearch("");
};

const handleResetFilters = () => {
  searchInput.value = "";
  store.resetFilters();
};

const formatPrice = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (isNaN(num)) return "-";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });
};

const getTradeLot = (item) => {
  if (!item) return 0;

  // 1. Direct lot field
  if (item.lot !== undefined && item.lot !== null && Number(item.lot) > 0) {
    const raw = Number(item.lot);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 2. Active volume (if > 0)
  if (
    item.volume !== undefined &&
    item.volume !== null &&
    Number(item.volume) > 0
  ) {
    const raw = Number(item.volume);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 3. Closed / Traded volume (for closed positions where volume is 0)
  if (
    item.volume_closed !== undefined &&
    item.volume_closed !== null &&
    Number(item.volume_closed) > 0
  ) {
    const raw = Number(item.volume_closed);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 4. Initial volume
  if (
    item.volume_initial !== undefined &&
    item.volume_initial !== null &&
    Number(item.volume_initial) > 0
  ) {
    const raw = Number(item.volume_initial);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 5. Traded volume
  if (
    item.volume_traded !== undefined &&
    item.volume_traded !== null &&
    Number(item.volume_traded) > 0
  ) {
    const raw = Number(item.volume_traded);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  // 6. Raw volume
  if (
    item.volume_raw !== undefined &&
    item.volume_raw !== null &&
    Number(item.volume_raw) > 0
  ) {
    const raw = Number(item.volume_raw);
    return raw >= 100 && Number.isInteger(raw) ? raw / 10000 : raw;
  }

  return item.volume ?? item.lot ?? 0;
};

const formatLot = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  let num = Number(val);
  if (isNaN(num)) return "-";
  if (num >= 100 && Number.isInteger(num)) {
    num = num / 10000;
  }
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

const activeCurrency = computed(() => {
  if (route.query.currency) return String(route.query.currency).toUpperCase();
  if (route.query.broker_currency)
    return String(route.query.broker_currency).toUpperCase();

  if (store.accountInfo) {
    const c =
      store.accountInfo.broker_currency ||
      store.accountInfo.currency ||
      store.accountInfo.coverage_account?.broker_currency ||
      store.accountInfo.trading_account?.broker_currency;
    if (c) return String(c).toUpperCase();
  }

  try {
    const raw = localStorage.getItem("active_fm");
    if (raw) {
      const parsed = JSON.parse(raw);
      const c =
        parsed.broker_currency ||
        parsed.currency ||
        parsed.coverage_account?.broker_currency ||
        parsed.master_account?.broker_currency;
      if (c) return String(c).toUpperCase();
    }
  } catch (e) {
    // ignore
  }

  return "USD";
});

const isUsc = computed(() => activeCurrency.value === "USC");
const currencySymbol = computed(() => (isUsc.value ? "USC" : "$"));


const positionsColumns = computed(() => [
  { key: 'ticket', label: 'Ticket / Position ID' },
  { key: 'account', label: 'Account' },
  { key: 'broker_group', label: 'Broker Group' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'volume', label: 'Volume (Lots)', align: 'right' },
  { key: 'entry_price', label: 'Entry Price', align: 'right' },
  { key: 'exit_price', label: 'Exit Price', align: 'right' },
  { key: 'pnl', label: `PnL (${currencySymbol.value})`, align: 'right' },
  { key: 'opened', label: 'Opened Time', align: 'right' },
  { key: 'closed', label: 'Closed Time', align: 'right' },
]);

const ordersColumns = computed(() => [
  { key: 'order_ticket', label: 'Order Ticket' },
  { key: 'position_ticket', label: 'Position Ticket' },
  { key: 'account', label: 'Account' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'side', label: 'Side' },
  { key: 'state', label: 'State' },
  { key: 'initial_vol', label: 'Initial Vol', align: 'right' },
  { key: 'current_vol', label: 'Current Vol', align: 'right' },
  { key: 'order_price', label: 'Order Price', align: 'right' },
  { key: 'current_price', label: 'Current Price', align: 'right' },
  { key: 'setup_time', label: 'Setup Time', align: 'right' },
  { key: 'done_time', label: 'Done Time', align: 'right' },
]);

const dealsColumns = computed(() => [
  { key: 'deal_ticket', label: 'Deal Ticket' },
  { key: 'position_ticket', label: 'Position Ticket' },
  { key: 'order_ticket', label: 'Order Ticket' },
  { key: 'account', label: 'Account' },
  { key: 'broker_group', label: 'Broker Group' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'action', label: 'Action' },
  { key: 'entry', label: 'Entry' },
  { key: 'volume', label: 'Volume', align: 'right' },
  { key: 'deal_price', label: 'Deal Price', align: 'right' },
  { key: 'position_price', label: 'Position Price', align: 'right' },
  { key: 'profit', label: `Profit (${currencySymbol.value})`, align: 'right' },
  { key: 'commission', label: `Commission / Fee (${currencySymbol.value})`, align: 'right' },
  { key: 'time', label: 'Time', align: 'right' },
]);



const formatCurrency = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  let num = Number(val);
  if (isNaN(num)) return "-";
  if (isUsc.value) {
    num = num * 100;
  }
  const formatted = Math.abs(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = num < 0 ? "-" : "";
  return isUsc.value ? `${prefix}USC ${formatted}` : `${prefix}$${formatted}`;
};



const formatPnl = (val) => {
  if (val === null || val === undefined || val === "") return "-";

  const num = Number(val);
  if (Number.isNaN(num)) return "-";

  if (Math.abs(num) < 0.000001) {
    return isUsc.value ? "USC 0.00" : "$0.00";
  }

  const prefix = num > 0 ? "+" : "-";
  const formattedNum = Math.abs(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isUsc.value
    ? `${prefix}USC ${formattedNum}`
    : `${prefix}$${formattedNum}`;
};

const formatDate = (val) => {
  if (!val) return "-";
  return formatTime(val);
};



const goBack = () => {
  if (isFollowerMode.value) {
    const fmId = route.query.fm_id;
    if (fmId) {
      router.push(`/fm/followers/${fmId}`);
    } else {
      router.back();
    }
  } else {
    router.push("/fm-leaderboard");
  }
};

const initContext = () => {
  const targetId = route.params.id;
  let parsedInfo = null;

  if (isFollowerMode.value) {
    store.setContext({
      type: "follower",
      id: targetId,
      info: null,
    });
  } else {
    try {
      const raw = localStorage.getItem("active_fm");
      if (raw) {
        parsedInfo = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Could not read active_fm from storage:", e);
    }

    store.setContext({
      type: "fm",
      id: targetId,
      info: parsedInfo,
    });
  }

  store.fetchFilters();
  store.fetchTradesData();
};

onMounted(() => {
  initContext();
});

onUnmounted(() => {
  store.resetAll();
});
</script>
