<template>
  <div class="bg-background space-y-6 pt-4 pb-8 overflow-y-auto no-scrollbar">
    <!-- ─── 1. FINANCIAL SUMMARY HEADER & CONTROLS ───────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
      <!-- <div>
        <h3 class="text-base sm:text-lg font-bold text-primary-text">
          Financial Summary
        </h3>
        <p class="text-xs text-secondary-text mt-0.5">
          Overview of client's financial activity across all trading accounts.
        </p>
      </div> -->

      <!-- Period Filter (Moved to Top Summary Row) -->
      <div class="w-32 sm:w-36 self-start sm:self-auto">
        <BaseSelect
          v-model="selectedPeriod"
          :options="periodOptions"
          @update:model-value="handlePeriodChange"
        />
      </div>
    </div>

    <!-- ─── 2. TOP 5 KPI METRIC CARDS SKELETON OR CONTENT ───────── -->
    <!-- Skeleton State -->
    <div
      v-if="isTopMetricsLoading"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5 animate-pulse"
    >
      <div
        v-for="i in 5"
        :key="i"
        class="bg-card-background/40 border border-primary-border rounded-xl p-4 sm:p-5 flex items-center justify-between gap-2.5"
      >
        <div class="space-y-2 flex-1 min-w-0">
          <div class="h-3 w-20 bg-primary-border/60 rounded-md" />
          <div class="h-6 w-28 bg-primary-border/80 rounded-lg" />
          <div class="h-2.5 w-16 bg-primary-border/40 rounded-md" />
        </div>
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-border/40 shrink-0" />
      </div>
    </div>

    <!-- Live Content -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      <!-- 1. Total Deposit -->
      <div
        class="bg-card-background/40 border border-primary-border rounded-xl p-4 sm:p-5 flex items-center justify-between gap-2.5"
      >
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Total Deposit
          </p>
          <p class="text-lg sm:text-xl xl:text-2xl font-extrabold text-primary-green mt-1 whitespace-nowrap">
            ${{ formatCurrency(totalDeposits) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5 whitespace-nowrap">
            {{ depositCount }} {{ depositCount === 1 ? 'Deposit' : 'Deposits' }}
          </p>
        </div>
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-green/10 flex items-center justify-center shrink-0 text-primary-green">
          <ArrowDownLeft class="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </div>
      </div>

      <!-- 2. Total Withdrawal -->
      <div
        class="bg-card-background/40 border border-primary-border rounded-xl p-4 sm:p-5 flex items-center justify-between gap-2.5"
      >
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Total Withdrawal
          </p>
          <p class="text-lg sm:text-xl xl:text-2xl font-extrabold text-primary-red mt-1 whitespace-nowrap">
            ${{ formatCurrency(totalWithdrawals) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5 whitespace-nowrap">
            {{ withdrawalCount }} {{ withdrawalCount === 1 ? 'Withdrawal' : 'Withdrawals' }}
          </p>
        </div>
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-red/10 flex items-center justify-center shrink-0 text-primary-red">
          <ArrowUpRight class="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </div>
      </div>

      <!-- 3. Net Cashflow -->
      <div
        class="bg-card-background/40 border border-primary-border rounded-xl p-4 sm:p-5 flex items-center justify-between gap-2.5"
      >
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Net Cashflow
          </p>
          <p
            class="text-lg sm:text-xl xl:text-2xl font-extrabold mt-1 whitespace-nowrap"
            :class="netCashflow >= 0 ? 'text-primary-green' : 'text-primary-red'"
          >
            {{ netCashflow >= 0 ? '+' : '' }}${{ formatCurrency(netCashflow) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5 whitespace-nowrap">
            Deposit - Withdrawal
          </p>
        </div>
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
          :class="netCashflow >= 0 ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'"
        >
          <Wallet class="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </div>
      </div>

      <!-- 4. Total Equity -->
      <div
        class="bg-card-background/40 border border-primary-border rounded-xl p-4 sm:p-5 flex items-center justify-between gap-2.5"
      >
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Total Equity
          </p>
          <p class="text-lg sm:text-xl xl:text-2xl font-extrabold text-primary-blue mt-1 whitespace-nowrap">
            ${{ formatCurrency(totalEquity) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5 whitespace-nowrap">
            {{ totalAccountsCount }} {{ totalAccountsCount === 1 ? 'Account' : 'Accounts' }}
          </p>
        </div>
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-blue/10 flex items-center justify-center shrink-0 text-primary-blue">
          <BarChart2 class="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </div>
      </div>

      <!-- 5. Total PnL -->
      <!-- <div
        class="bg-card-background/40 border border-primary-border rounded-xl p-4 sm:p-5 flex items-center justify-between gap-2.5"
      >
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text truncate">
            Total PnL
          </p>
          <p
            class="text-lg sm:text-xl xl:text-2xl font-extrabold mt-1 whitespace-nowrap"
            :class="totalPnl >= 0 ? 'text-primary-green' : 'text-primary-red'"
          >
            {{ totalPnl >= 0 ? '+' : '' }}${{ formatCurrency(totalPnl) }}
          </p>
          <p class="text-[11px] text-secondary-text font-medium mt-0.5 whitespace-nowrap">
            Realized + Unrealized
          </p>
        </div>
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
          :class="totalPnl >= 0 ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'"
        >
          <DollarSign class="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </div>
      </div> -->
    </div>

    <!-- ─── 3. MIDDLE SECTION: PERFORMANCE TRENDS CHARTS ─────────── -->
    <div class="space-y-4">
      <!-- Section Header Row -->
      <div>
        <h4 class="text-sm sm:text-base font-bold text-primary-text">
          Performance Trends
        </h4>
        <p class="text-xs text-secondary-text mt-0.5">
          Cashflow deposits, withdrawals, and equity growth over time.
        </p>
      </div>

      <!-- Skeletons for Charts -->
      <div
        v-if="isChartsLoading"
        class="grid grid-cols-1 min-[1280px]:grid-cols-2 gap-5 animate-pulse"
      >
        <!-- Chart 1 Skeleton -->
        <div class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 space-y-3 flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="h-4 w-48 bg-primary-border/70 rounded-md" />
            <div class="h-3 w-32 bg-primary-border/40 rounded-md" />
          </div>
          <div class="h-64 w-full bg-primary-border/10 rounded-xl flex items-end justify-between gap-3 p-4">
            <div
              v-for="b in 6"
              :key="b"
              class="flex-1 flex gap-1.5 items-end justify-center h-full"
            >
              <div class="w-3 bg-primary-green/30 rounded-t" :style="{ height: `${25 + (b * 10)}%` }" />
              <div class="w-3 bg-primary-red/30 rounded-t" :style="{ height: `${15 + (b * 7)}%` }" />
            </div>
          </div>
          <div class="flex justify-center gap-6 pt-3 border-t border-primary-border/40">
            <div class="h-3 w-16 bg-primary-border/50 rounded" />
            <div class="h-3 w-20 bg-primary-border/50 rounded" />
          </div>
        </div>

        <!-- Chart 2 Skeleton -->
        <div class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 space-y-3 flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="h-4 w-44 bg-primary-border/70 rounded-md" />
            <div class="h-3 w-36 bg-primary-border/40 rounded-md" />
          </div>
          <div class="h-64 w-full bg-primary-border/10 rounded-xl p-4 flex items-center justify-center">
            <div class="w-full h-36 border-b border-primary-blue/30 border-dashed rounded flex items-center justify-center">
              <div class="h-1 bg-primary-blue/30 w-full rounded animate-pulse" />
            </div>
          </div>
          <div class="flex justify-center gap-6 pt-3 border-t border-primary-border/40">
            <div class="h-3 w-24 bg-primary-border/50 rounded" />
          </div>
        </div>
      </div>

      <!-- Live Charts Content -->
      <div v-else class="grid grid-cols-1 min-[1280px]:grid-cols-2 gap-5">
        <!-- Chart 1: Deposit vs Withdrawal Trend -->
        <div
          class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 flex flex-col justify-between"
        >
          <!-- Chart Header -->
          <div class="pb-2">
            <h4 class="text-sm sm:text-base font-bold text-primary-text">
              Deposit vs Withdrawal Trend
            </h4>
            <p class="text-xs text-secondary-text mt-0.5">
              Track client's cash flow over time.
            </p>
          </div>

          <!-- Bar Chart Container -->
          <div class="h-64 w-full pt-2 relative">
            <div
              v-if="clientDepthStore.userChartsLoading"
              class="absolute inset-0 bg-card-background/60 backdrop-blur-2xs flex items-center justify-center z-10 rounded-xl"
            >
              <Loader2 class="w-6 h-6 animate-spin text-primary" />
            </div>
            <Bar :data="depositWithdrawalChartData" :options="depositWithdrawalChartOptions" />
          </div>

          <!-- Chart Legend (Bottom Center below X-axis) -->
          <div class="flex items-center justify-center gap-6 text-xs font-semibold pt-3 border-t border-primary-border/40 mt-2">
            <div class="flex items-center gap-1.5 text-secondary-text">
              <span class="w-3 h-3 rounded-xs bg-primary-green" />
              <span class="text-primary-text font-medium">Deposits</span>
            </div>
            <div class="flex items-center gap-1.5 text-secondary-text">
              <span class="w-3 h-3 rounded-xs bg-primary-red" />
              <span class="text-primary-text font-medium">Withdrawals</span>
            </div>
          </div>
        </div>

        <!-- Chart 2: Account Equity Trend -->
        <div
          class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 flex flex-col justify-between"
        >
          <!-- Chart Header -->
          <div class="pb-2">
            <h4 class="text-sm sm:text-base font-bold text-primary-text">
              Account Equity Trend
            </h4>
            <p class="text-xs text-secondary-text mt-0.5">
              Track total equity trend across all trading accounts.
            </p>
          </div>

          <!-- Line Chart Container -->
          <div class="h-64 w-full pt-2 relative">
            <div
              v-if="clientDepthStore.userChartsLoading"
              class="absolute inset-0 bg-card-background/60 backdrop-blur-2xs flex items-center justify-center z-10 rounded-xl"
            >
              <Loader2 class="w-6 h-6 animate-spin text-primary" />
            </div>
            <Line :data="equityChartData" :options="equityChartOptions" />
          </div>

          <!-- Chart Legend (Bottom Center below X-axis) -->
          <div class="flex items-center justify-center gap-6 text-xs font-semibold pt-3 border-t border-primary-border/40 mt-2">
            <div class="flex items-center gap-1.5 text-secondary-text">
              <span class="w-3 h-3 rounded-xs bg-primary-blue" />
              <span class="text-primary-text font-medium">Account Equity</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── 4. BOTTOM SECTION: 2 TABLES SKELETON OR CONTENT ────────── -->
    <!-- Skeletons for Tables -->
    <div
      v-if="isTablesInitialLoading"
      class="grid grid-cols-1 min-[1280px]:grid-cols-2 gap-5 animate-pulse"
    >
      <!-- Table 1 Skeleton -->
      <div class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 space-y-4 min-h-[380px]">
        <div class="space-y-1.5 pb-4 border-b border-primary-border/60">
          <div class="h-4 w-36 bg-primary-border/70 rounded-md" />
          <div class="h-3 w-48 bg-primary-border/40 rounded-md" />
        </div>
        <div class="space-y-3 pt-1">
          <div
            v-for="r in 4"
            :key="r"
            class="h-11 w-full bg-primary-border/20 rounded-xl flex items-center justify-between px-3 gap-2"
          >
            <div class="h-3.5 w-20 bg-primary-border/60 rounded" />
            <div class="h-3.5 w-16 bg-primary-border/50 rounded" />
            <div class="h-3.5 w-12 bg-primary-border/50 rounded" />
            <div class="h-3.5 w-16 bg-primary-border/60 rounded" />
            <div class="h-3.5 w-14 bg-primary-border/40 rounded" />
          </div>
        </div>
      </div>

      <!-- Table 2 Skeleton -->
      <div class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 space-y-4 min-h-[380px]">
        <div class="space-y-1.5 pb-4 border-b border-primary-border/60">
          <div class="h-4 w-40 bg-primary-border/70 rounded-md" />
          <div class="h-3 w-44 bg-primary-border/40 rounded-md" />
        </div>
        <div class="space-y-3 pt-1">
          <div
            v-for="r in 4"
            :key="r"
            class="h-11 w-full bg-primary-border/20 rounded-xl flex items-center justify-between px-3 gap-2"
          >
            <div class="h-3.5 w-24 bg-primary-border/60 rounded" />
            <div class="h-3.5 w-16 bg-primary-border/50 rounded" />
            <div class="h-3.5 w-14 bg-primary-border/50 rounded" />
            <div class="h-3.5 w-16 bg-primary-border/60 rounded" />
            <div class="h-3.5 w-14 bg-primary-border/40 rounded" />
          </div>
        </div>
      </div>
    </div>

    <!-- Live Tables Content with Fixed Heights & Hidden Scrollbars -->
    <div v-else class="grid grid-cols-1 min-[1280px]:grid-cols-2 gap-5">
      <!-- Table 1: Account Overview -->
      <div
        class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 flex flex-col justify-between min-h-[380px]"
      >
        <div class="flex flex-col h-full">
          <!-- Header with count badge -->
          <div class="pb-3.5 border-b border-primary-border/60 shrink-0 flex items-center justify-between gap-2">
            <div>
              <h4 class="text-sm sm:text-base font-bold text-primary-text">
                Account Overview
              </h4>
              <p class="text-xs text-secondary-text mt-0.5">
                Summary of all trading accounts.
              </p>
            </div>
            <span
              v-if="tradingAccounts.length > 0"
              class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary shrink-0"
            >
              {{ accountsPagination.total_items ?? tradingAccounts.length }} {{ (accountsPagination.total_items ?? tradingAccounts.length) === 1 ? 'Account' : 'Accounts' }}
            </span>
          </div>

          <!-- Accounts Table Scrollable Container with Fixed Max-Height -->
          <div class="overflow-y-auto overflow-x-auto no-scrollbar max-h-72 flex-1 border border-primary-border rounded-xl mt-3">
            <!-- Skeletons for Accounts Table -->
            <div v-if="isTablesLoading" class="p-4 space-y-2.5 animate-pulse">
              <div v-for="i in 4" :key="i" class="h-9 bg-primary-border/40 rounded-lg w-full" />
            </div>

            <table v-else-if="tradingAccounts.length > 0" class="w-full text-left text-xs border-collapse">
              <thead class="sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b border-primary-border">
                <tr class="text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                  <th class="py-2.5 px-3">Account Number</th>
                  <th class="py-2.5 px-3">Account Type</th>
                  <th class="py-2.5 px-3">Currency</th>
                  <th class="py-2.5 px-3">Balance</th>
                  <th class="py-2.5 px-3">Equity</th>
                  <th class="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="acc in tradingAccounts"
                  :key="acc.id || acc.account_number"
                  class="border-b border-primary-border hover:bg-card-background/70 transition-colors"
                >
                  <td class="py-3 px-3 font-bold text-primary-text tabular-nums whitespace-nowrap">
                    <span>{{ acc.account_number }}</span>
                    <span v-if="acc.platform" class="ml-1.5 text-[10px] text-secondary-text font-normal">({{ acc.platform }})</span>
                  </td>
                  <td class="py-3 px-3 whitespace-nowrap">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-md capitalize"
                      :class="getAccountTypeBadgeClass(acc.trading_type || acc.account_type)"
                    >
                      {{ formatAccountType(acc.trading_type || acc.account_type) }}
                    </span>
                  </td>
                  <td class="py-3 px-3 font-medium text-secondary-text">
                    {{ acc.broker_currency || 'USD' }}
                  </td>
                  <td class="py-3 px-3 font-bold text-primary-text tabular-nums whitespace-nowrap">
                    ${{ formatCurrency(acc.balance) }}
                  </td>
                  <td class="py-3 px-3 font-bold text-primary-text tabular-nums whitespace-nowrap">
                    ${{ formatCurrency(acc.equity) }}
                  </td>
                  <td class="py-3 px-3 text-right whitespace-nowrap">
                    <span
                      class="text-xs font-semibold capitalize"
                      :class="acc.status ? 'text-primary-green' : 'text-primary-red'"
                    >
                      {{ acc.status ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-else class="py-12 flex flex-col items-center justify-center text-center">
              <BarChart2 class="w-8 h-8 text-secondary-text/40 mb-2" />
              <p class="text-xs font-semibold text-primary-text">No Trading Accounts Found</p>
              <p class="text-[11px] text-secondary-text mt-0.5">This client does not have any active trading accounts.</p>
            </div>
          </div>

          <!-- Accounts Pagination -->
          <div v-if="accountsPagination && accountsPagination.total_pages > 1" class="pt-3 border-t border-primary-border/50 shrink-0 flex justify-end">
            <Pagination :pagination="accountsPagination" @page-change="handleAccountsPageChange" />
          </div>
        </div>
      </div>

      <!-- Table 2: Recent Transactions -->
      <div
        class="bg-card-background/40 border border-primary-border rounded-xl p-5 sm:p-6 flex flex-col justify-between min-h-[380px]"
      >
        <div class="flex flex-col h-full">
          <!-- Header with count badge -->
          <div class="pb-3.5 border-b border-primary-border/60 shrink-0 flex items-center justify-between gap-2">
            <div>
              <h4 class="text-sm sm:text-base font-bold text-primary-text">
                Recent Transactions
              </h4>
              <p class="text-xs text-secondary-text mt-0.5">
                Latest financial deposits and withdrawals.
              </p>
            </div>
            <span
              v-if="recentTransactions.length > 0"
              class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary shrink-0"
            >
              {{ transactionsPagination.total_items ?? recentTransactions.length }} {{ (transactionsPagination.total_items ?? recentTransactions.length) === 1 ? 'Transaction' : 'Transactions' }}
            </span>
          </div>

          <!-- Transactions Table Scrollable Container with Fixed Max-Height -->
          <div class="overflow-y-auto overflow-x-auto no-scrollbar max-h-72 flex-1 border border-primary-border rounded-xl mt-3">
            <!-- Skeletons for Transactions Table -->
            <div v-if="isTablesLoading" class="p-4 space-y-2.5 animate-pulse">
              <div v-for="i in 4" :key="i" class="h-9 bg-primary-border/40 rounded-lg w-full" />
            </div>

            <table v-else-if="recentTransactions.length > 0" class="w-full text-left text-xs border-collapse">
              <thead class="sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b border-primary-border">
                <tr class="text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                  <th class="py-2.5 px-3">Date &amp; Time</th>
                  <th class="py-2.5 px-3">Account</th>
                  <th class="py-2.5 px-3">Type</th>
                  <th class="py-2.5 px-3">Amount</th>
                  <th class="py-2.5 px-3">Payment Method</th>
                  <th class="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(tx, idx) in recentTransactions"
                  :key="tx.payment_id || idx"
                  class="border-b border-primary-border hover:bg-card-background/70 transition-colors"
                >
                  <td class="py-3 px-3 text-secondary-text font-medium whitespace-nowrap">
                    {{ formatDateTime(tx.created_at || tx.datetime) }}
                  </td>
                  <td class="py-3 px-3 font-semibold text-primary-text tabular-nums whitespace-nowrap">
                    {{ tx.account_number || '—' }}
                  </td>
                  <td class="py-3 px-3 whitespace-nowrap">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                      :class="String(tx.type).toLowerCase() === 'deposit' ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'"
                    >
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="py-3 px-3 font-bold text-primary-text tabular-nums whitespace-nowrap">
                    ${{ formatCurrency(tx.amount) }}
                  </td>
                  <td class="py-3 px-3 font-medium text-secondary-text capitalize whitespace-nowrap">
                    {{ tx.gateway || tx.method || 'Admin' }}
                  </td>
                  <td class="py-3 px-3 text-right whitespace-nowrap">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                      :class="getTransactionStatusBadgeClass(tx.approval_status || tx.payment_status || tx.status)"
                    >
                      {{ tx.approval_status || tx.payment_status || tx.status || 'Approved' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-else class="py-12 flex flex-col items-center justify-center text-center">
              <DollarSign class="w-8 h-8 text-secondary-text/40 mb-2" />
              <p class="text-xs font-semibold text-primary-text">No Transactions Found</p>
              <p class="text-[11px] text-secondary-text mt-0.5">There are no deposits or withdrawals recorded for this client.</p>
            </div>
          </div>

          <!-- Transactions Pagination -->
          <div v-if="transactionsPagination && transactionsPagination.total_pages > 1" class="pt-3 border-t border-primary-border/50 shrink-0 flex justify-end">
            <Pagination :pagination="transactionsPagination" @page-change="handleTransactionsPageChange" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import BaseSelect from "@/components/common/BaseSelect.vue";
import Pagination from "@/components/common/Pagination.vue";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  DollarSign,
  Wallet,
  RefreshCw,
  Loader2,
} from "lucide-vue-next";

// Chart.js imports
import { Bar, Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const route = useRoute();
const clientDepthStore = useClientDepthStore();

// ─── Filter & Refresh State ───────────────────────────────────────────────────
const selectedPeriod = ref("6M");
const isChartsRefreshing = ref(false);

const periodOptions = [
  { label: "1 Month", value: "1M" },
  { label: "3 Months", value: "3M" },
  { label: "6 Months", value: "6M" },
  { label: "1 Year", value: "1Y" },
];

const periodMonthsMap = {
  "1M": 1,
  "3M": 3,
  "6M": 6,
  "1Y": 12,
};

const handlePeriodChange = (val) => {
  const userId = route.params.id;
  const months = periodMonthsMap[val || selectedPeriod.value] || 6;
  if (userId) {
    clientDepthStore.fetchUserCharts(userId, { months }, true);
  }
};

// ─── Fetch Initial Financial Data ─────────────────────────────────────────────
const loadFinancialData = (force = false) => {
  const userId = route.params.id;
  if (userId) {
    clientDepthStore.fetchClientOverview(userId, force);
    clientDepthStore.fetchUserCharts(userId, { months: periodMonthsMap[selectedPeriod.value] || 6 }, force);
    clientDepthStore.fetchAccountDetails(userId, {}, force);
  }
};

// ─── Refresh Financial Summary & Charts Data ───────────────────────────────
const refreshChartsData = (e) => {
  if (e?.detail?.tab && e.detail.tab !== "financials") return;
  const userId = route.params.id;
  if (!userId) return;
  isChartsRefreshing.value = true;
  clientDepthStore.fetchUserCharts(
    userId,
    { months: periodMonthsMap[selectedPeriod.value] || 6 },
    true
  );
  clientDepthStore.fetchAccountDetails(userId, {}, true);
};

// Auto-reset isChartsRefreshing once both userChartsLoading and accountDetailsLoading finish
watch(
  () => [clientDepthStore.userChartsLoading, clientDepthStore.accountDetailsLoading],
  ([chartsLoading, accLoading]) => {
    if (!chartsLoading && !accLoading) {
      isChartsRefreshing.value = false;
    }
  }
);

onMounted(() => {
  loadFinancialData();
  window.addEventListener("refresh-client-tab-data", refreshChartsData);
});

onUnmounted(() => {
  window.removeEventListener("refresh-client-tab-data", refreshChartsData);
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) loadFinancialData();
  }
);

// ─── Loading Skeletons State Resolvers ─────────────────────────────────────────
const isTopMetricsLoading = computed(() => {
  return (
    isChartsRefreshing.value ||
    clientDepthStore.userChartsLoading ||
    !clientDepthStore.userChartsFetched
  );
});

const isChartsLoading = computed(() => {
  return (
    isChartsRefreshing.value ||
    clientDepthStore.userChartsLoading ||
    !clientDepthStore.userChartsFetched
  );
});

const isTablesLoading = computed(() => {
  return (
    isChartsRefreshing.value ||
    clientDepthStore.accountDetailsLoading ||
    !clientDepthStore.accountDetailsFetched
  );
});

// ─── Reactive Data Resolvers from API Store ───────────────────────────────────
const overviewData = computed(() => clientDepthStore.overviewData || {});
const userChartsData = computed(() => clientDepthStore.userChartsData || {});
const chartsSummary = computed(() => userChartsData.value?.summary || {});
const accountDetailsData = computed(() => clientDepthStore.accountDetailsData || {});
const accountSummary = computed(() => accountDetailsData.value?.summary || {});
const accountsPagination = computed(() => accountDetailsData.value?.accounts_pagination || {});
const transactionsPagination = computed(() => accountDetailsData.value?.transactions_pagination || {});

// ─── Top Metric Cards Values (Prioritizing Charts API Summary) ────────────────
const totalDeposits = computed(() => {
  if (chartsSummary.value?.total_deposit !== undefined && chartsSummary.value?.total_deposit !== null) {
    return Number(chartsSummary.value.total_deposit);
  }
  if (chartsSummary.value?.total_deposits !== undefined && chartsSummary.value?.total_deposits !== null) {
    return Number(chartsSummary.value.total_deposits);
  }
  if (accountSummary.value?.total_deposit !== undefined && accountSummary.value?.total_deposit !== null) {
    return Number(accountSummary.value.total_deposit);
  }
  if (overviewData.value?.total_deposit !== undefined && overviewData.value?.total_deposit !== null) {
    return Number(overviewData.value.total_deposit);
  }
  return 0;
});

const depositCount = computed(() => {
  if (chartsSummary.value?.deposit_count !== undefined && chartsSummary.value?.deposit_count !== null) {
    return chartsSummary.value.deposit_count;
  }
  if (chartsSummary.value?.deposits_count !== undefined && chartsSummary.value?.deposits_count !== null) {
    return chartsSummary.value.deposits_count;
  }
  if (recentTransactions.value && recentTransactions.value.length > 0) {
    const count = recentTransactions.value.filter((t) => String(t.type).toLowerCase() === "deposit").length;
    if (count > 0) return count;
  }
  return overviewData.value?.deposit_count || 0;
});

const totalWithdrawals = computed(() => {
  if (chartsSummary.value?.total_withdrawal !== undefined && chartsSummary.value?.total_withdrawal !== null) {
    return Number(chartsSummary.value.total_withdrawal);
  }
  if (chartsSummary.value?.total_withdrawals !== undefined && chartsSummary.value?.total_withdrawals !== null) {
    return Number(chartsSummary.value.total_withdrawals);
  }
  if (accountSummary.value?.total_withdrawal !== undefined && accountSummary.value?.total_withdrawal !== null) {
    return Number(accountSummary.value.total_withdrawal);
  }
  if (overviewData.value?.total_withdrawal !== undefined && overviewData.value?.total_withdrawal !== null) {
    return Number(overviewData.value.total_withdrawal);
  }
  return 0;
});

const withdrawalCount = computed(() => {
  if (chartsSummary.value?.withdrawal_count !== undefined && chartsSummary.value?.withdrawal_count !== null) {
    return chartsSummary.value.withdrawal_count;
  }
  if (chartsSummary.value?.withdrawals_count !== undefined && chartsSummary.value?.withdrawals_count !== null) {
    return chartsSummary.value.withdrawals_count;
  }
  if (recentTransactions.value && recentTransactions.value.length > 0) {
    const count = recentTransactions.value.filter((t) => String(t.type).toLowerCase() === "withdrawal").length;
    if (count > 0) return count;
  }
  return overviewData.value?.withdrawal_count || 0;
});

const netCashflow = computed(() => {
  if (chartsSummary.value?.net_cashflow !== undefined && chartsSummary.value?.net_cashflow !== null) {
    return Number(chartsSummary.value.net_cashflow);
  }
  if (chartsSummary.value?.cashflow !== undefined && chartsSummary.value?.cashflow !== null) {
    return Number(chartsSummary.value.cashflow);
  }
  if (accountSummary.value?.net_cashflow !== undefined && accountSummary.value?.net_cashflow !== null) {
    return Number(accountSummary.value.net_cashflow);
  }
  return totalDeposits.value - totalWithdrawals.value;
});

const totalEquity = computed(() => {
  if (chartsSummary.value?.current_equity !== undefined && chartsSummary.value?.current_equity !== null) {
    return Number(chartsSummary.value.current_equity);
  }
  if (chartsSummary.value?.total_equity !== undefined && chartsSummary.value?.total_equity !== null) {
    return Number(chartsSummary.value.total_equity);
  }
  if (chartsSummary.value?.equity !== undefined && chartsSummary.value?.equity !== null) {
    return Number(chartsSummary.value.equity);
  }
  if (accountSummary.value?.total_equity !== undefined && accountSummary.value?.total_equity !== null) {
    return Number(accountSummary.value.total_equity);
  }
  if (overviewData.value?.total_equity !== undefined && overviewData.value?.total_equity !== null) {
    return Number(overviewData.value.total_equity);
  }
  return 0;
});

const totalAccountsCount = computed(() => {
  if (chartsSummary.value?.total_accounts !== undefined && chartsSummary.value?.total_accounts !== null) {
    return chartsSummary.value.total_accounts;
  }
  if (chartsSummary.value?.accounts_count !== undefined && chartsSummary.value?.accounts_count !== null) {
    return chartsSummary.value.accounts_count;
  }
  if (accountSummary.value?.total_accounts !== undefined && accountSummary.value?.total_accounts !== null) {
    return accountSummary.value.total_accounts;
  }
  if (accountsPagination.value?.total_items !== undefined) {
    return accountsPagination.value.total_items;
  }
  return tradingAccounts.value.length || overviewData.value?.total_accounts || 0;
});

const totalPnl = computed(() => {
  if (chartsSummary.value?.total_growth !== undefined && chartsSummary.value?.total_growth !== null) {
    return Number(chartsSummary.value.total_growth);
  }
  if (chartsSummary.value?.total_pnl !== undefined && chartsSummary.value?.total_pnl !== null) {
    return Number(chartsSummary.value.total_pnl);
  }
  if (chartsSummary.value?.pnl !== undefined && chartsSummary.value?.pnl !== null) {
    return Number(chartsSummary.value.pnl);
  }
  if (chartsSummary.value?.net_pnl !== undefined && chartsSummary.value?.net_pnl !== null) {
    return Number(chartsSummary.value.net_pnl);
  }
  if (accountSummary.value?.total_pnl !== undefined && accountSummary.value?.total_pnl !== null) {
    return Number(accountSummary.value.total_pnl);
  }
  if (overviewData.value?.total_pnl !== undefined && overviewData.value?.total_pnl !== null) {
    return Number(overviewData.value.total_pnl);
  }
  return 0;
});

// ─── Format Month Label Helper ────────────────────────────────────────────────
const formatMonthLabel = (label) => {
  if (!label) return "";
  if (/^\d{4}-\d{2}$/.test(label)) {
    const [year, month] = label.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }
  return label;
};

// ─── Deposit vs Withdrawal Bar Chart Config ───────────────────────────────────
const depositWithdrawalRawData = computed(() => {
  return userChartsData.value?.deposit_withdrawal_chart || [];
});

const depositWithdrawalChartData = computed(() => {
  const chartList = depositWithdrawalRawData.value;
  if (!chartList || chartList.length === 0) {
    return {
      labels: ["No Data"],
      datasets: [
        {
          label: "Deposits",
          data: [0],
          backgroundColor: "#22c55e",
          borderRadius: 4,
          barThickness: 10,
          maxBarThickness: 14,
        },
        {
          label: "Withdrawals",
          data: [0],
          backgroundColor: "#ef4444",
          borderRadius: 4,
          barThickness: 10,
          maxBarThickness: 14,
        },
      ],
    };
  }

  return {
    labels: chartList.map((item) => formatMonthLabel(item.label)),
    datasets: [
      {
        label: "Deposits",
        data: chartList.map((item) => Number(item.deposit || 0)),
        backgroundColor: "#22c55e",
        borderRadius: 4,
        barThickness: 12,
        maxBarThickness: 16,
      },
      {
        label: "Withdrawals",
        data: chartList.map((item) => Number(item.withdrawal || 0)),
        backgroundColor: "#ef4444",
        borderRadius: 4,
        barThickness: 12,
        maxBarThickness: 16,
      },
    ],
  };
});

const depositWithdrawalChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      titleFont: { size: 11, weight: "bold" },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context) => ` ${context.dataset.label}: $${Number(context.parsed.y).toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 10, weight: "500" },
        color: "#9ca3af",
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(229, 231, 235, 0.15)",
      },
      ticks: {
        font: { size: 10, weight: "500" },
        color: "#9ca3af",
        callback: (value) => (value === 0 ? "$0" : `$${value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value}`),
      },
    },
  },
};

// ─── Account Equity Line Chart Config ─────────────────────────────────────────
const equityRawData = computed(() => {
  return userChartsData.value?.equity_chart || [];
});

const equityChartData = computed(() => {
  const chartList = equityRawData.value;
  if (!chartList || chartList.length === 0) {
    return {
      labels: ["No Data"],
      datasets: [
        {
          label: "Account Equity",
          data: [0],
          borderColor: "#3b82f6",
          borderWidth: 2.5,
          fill: true,
          pointRadius: 4,
        },
      ],
    };
  }

  return {
    labels: chartList.map((item) => formatMonthLabel(item.label)),
    datasets: [
      {
        label: "Account Equity",
        data: chartList.map((item) => Number(item.equity || 0)),
        borderColor: "#3b82f6",
        borderWidth: 2.5,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.25)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
});

const equityChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      titleFont: { size: 11, weight: "bold" },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context) => ` Total Equity: $${Number(context.parsed.y).toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 10, weight: "500" },
        color: "#9ca3af",
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(229, 231, 235, 0.15)",
      },
      ticks: {
        font: { size: 10, weight: "500" },
        color: "#9ca3af",
        callback: (value) => (value === 0 ? "$0" : `$${value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value}`),
      },
    },
  },
};

// ─── Account Overview Table Data ──────────────────────────────────────────────
const tradingAccounts = computed(() => {
  return accountDetailsData.value?.trading_accounts || [];
});

const formatAccountType = (type) => {
  if (!type) return "Live";
  return String(type).replace(/_/g, " ");
};

const getAccountTypeBadgeClass = (type) => {
  const t = String(type || "").toLowerCase();
  if (t === "live" || t === "real") return "bg-primary-green/10 text-primary-green border border-primary-green/20";
  if (t === "demo") return "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20";
  if (t.includes("copy")) return "bg-primary-red/10 text-primary-red border border-primary-red/20";
  if (t === "pamm") return "bg-primary-blue/10 text-primary-blue border border-primary-blue/20";
  return "bg-secondary-text/10 text-secondary-text border border-secondary-text/20";
};

const handleAccountsPageChange = (page) => {
  const userId = route.params.id;
  if (userId) {
    clientDepthStore.fetchAccountDetails(userId, { accounts_page: page }, true);
  }
};

// ─── Recent Transactions Table Data ───────────────────────────────────────────
const recentTransactions = computed(() => {
  return accountDetailsData.value?.transactions || [];
});

const formatDateTime = (val) => {
  if (!val) return "—";
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTransactionStatusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "paid" || s === "completed" || s === "success") {
    return "bg-primary-green/10 text-primary-green border border-primary-green/20";
  }
  if (s === "pending" || s === "processing") {
    return "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20";
  }
  if (s === "rejected" || s === "failed" || s === "cancelled") {
    return "bg-primary-red/10 text-primary-red border border-primary-red/20";
  }
  return "bg-secondary-text/10 text-secondary-text border border-secondary-text/20";
};

const handleTransactionsPageChange = (page) => {
  const userId = route.params.id;
  if (userId) {
    clientDepthStore.fetchAccountDetails(userId, { tx_page: page }, true);
  }
};

// ─── Format Utilities ─────────────────────────────────────────────────────────
function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return "0.00";
  const num = Number(val);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>