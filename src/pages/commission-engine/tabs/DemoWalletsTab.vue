<template>
  <div class="space-y-5">
    <!-- Header & Info Banner (Single Row Card) -->
    <div
      class="bg-card-background border border-primary-border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0"
        >
          <HugeIcon :icon="InformationCircleIcon" :size="18" />
        </div>
        <div class="text-xs text-secondary-text leading-relaxed">
          <span class="font-semibold text-primary-text">Demo Wallet Destination:</span>
          When an IB is configured with
          <code class="px-1.5 py-0.5 bg-background border border-primary-border rounded text-primary font-mono text-[11px] font-bold">wallet_target=demo</code>,
          approved commissions &amp; settlement batches credit directly to demo wallets.
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <router-link
          to="/commission-engine/settings"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-primary-border hover:bg-card-background text-primary-text text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <HugeIcon :icon="Settings01Icon" :size="13" />
          <span>Configure Destination</span>
        </router-link>

        <button
          type="button"
          :disabled="store.demoWalletsLoading || store.demoTransactionsLoading"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-card-background border border-primary-border hover:bg-background text-primary-text text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Wallets and History"
          @click="refreshAll"
        >
          <HugeIcon
            :icon="RefreshCwIcon"
            :size="13"
            :class="{ 'animate-spin': store.demoWalletsLoading || store.demoTransactionsLoading }"
          />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Wallets -->
      <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Total Demo Wallets
          </p>
          <div class="text-xl font-bold font-mono text-primary-text">
            {{ store.demoWalletsPagination.total || store.demoWalletsList.length }}
          </div>
          <p class="text-[10px] text-secondary-text">
            Configured partner accounts
          </p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <HugeIcon :icon="Wallet01Icon" :size="18" />
        </div>
      </div>

      <!-- Positive Balance Wallets -->
      <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Active Balances
          </p>
          <div class="text-xl font-bold font-mono text-primary-green">
            {{ positiveCount }}
          </div>
          <p class="text-[10px] text-secondary-text">
            Wallets with balance &gt; $0
          </p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green shrink-0">
          <HugeIcon :icon="Coins01Icon" :size="18" />
        </div>
      </div>

      <!-- Total Demo Balance -->
      <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Cumulative Balance
          </p>
          <div class="text-xl font-bold font-mono text-primary-text">
            ${{ formatNum(totalBalanceSum) }}
          </div>
          <p class="text-[10px] text-secondary-text">
            Total across demo wallets
          </p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-background border border-primary-border flex items-center justify-center text-secondary-text shrink-0">
          <HugeIcon :icon="Invoice01Icon" :size="18" />
        </div>
      </div>

      <!-- Available Demo Balance -->
      <div class="bg-card-background border border-primary-border rounded-lg p-4 flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
            Available Funds
          </p>
          <div class="text-xl font-bold font-mono text-primary-green">
            ${{ formatNum(totalAvailableSum) }}
          </div>
          <p class="text-[10px] text-secondary-text">
            Net available balance
          </p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green shrink-0">
          <HugeIcon :icon="Tick02Icon" :size="18" />
        </div>
      </div>
    </div>

    <!-- Section 1: Demo Wallets List Table -->
    <DataTable
      :columns="walletColumns"
      :data="store.demoWalletsList"
      :loading="store.demoWalletsLoading"
      :pagination="store.demoWalletsPagination"
      row-key="wallet_id"
      table-key="demo-wallets-table"
      :per-page-options="[20, 50, 100, 200]"
      empty-title="No demo wallets found"
      empty-text="No demo wallet records match the current filter criteria."
      @page-change="handleWalletPageChange"
      @per-page-change="handleWalletPerPageChange"
    >
      <!-- Toolbar -->
      <template #toolbar>
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <!-- Left Filter Group -->
            <div class="flex flex-wrap items-center gap-2.5 flex-1">
              <!-- Search Input (q) -->
              <div class="relative w-full sm:w-64">
                <HugeIcon
                  :icon="Search01Icon"
                  :size="13"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none"
                />
                <input
                  v-model="walletFilterQ"
                  type="text"
                  placeholder="Search partner, email, IB ID..."
                  class="input-field w-full pl-8 pr-7 py-1.5 text-xs"
                  @input="handleWalletFilterChange"
                />
                <button
                  v-if="walletFilterQ"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
                  @click="walletFilterQ = ''; handleWalletFilterChange();"
                >
                  <HugeIcon :icon="Cancel01Icon" :size="12" />
                </button>
              </div>

              <!-- IB Search Select -->
              <div class="w-full sm:w-56">
                <BaseSelect
                  v-model="walletFilterIbId"
                  :options="store.ibSearchOptions"
                  :isLoading="store.searchLoading"
                  placeholder="Filter by IB..."
                  searchable
                  variant="surface"
                  @search="onIbSearch"
                  @update:modelValue="handleWalletFilterChange"
                />
              </div>

              <!-- Positive Balance Filter Pill -->
              <div class="inline-flex p-1 rounded-lg bg-background border border-primary-border shrink-0">
                <button
                  type="button"
                  class="px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                  :class="[
                    !walletFilterOnlyPositive
                      ? 'bg-card-background text-primary-text font-bold'
                      : 'text-secondary-text hover:text-primary-text'
                  ]"
                  @click="walletFilterOnlyPositive = false; loadDemoWallets(1, true);"
                >
                  All Wallets
                </button>
                <button
                  type="button"
                  class="px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                  :class="[
                    walletFilterOnlyPositive
                      ? 'bg-primary text-white font-bold'
                      : 'text-secondary-text hover:text-primary-text'
                  ]"
                  @click="walletFilterOnlyPositive = true; loadDemoWallets(1, true);"
                >
                  Balance &gt; 0
                </button>
              </div>

              <!-- Clear Wallet Filters -->
              <button
                v-if="hasWalletFilters"
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-secondary-text hover:text-primary-red hover:bg-primary-red/5 rounded-lg transition-colors cursor-pointer"
                title="Clear all wallet filters"
                @click="handleResetWalletFilters"
              >
                <HugeIcon :icon="Cancel01Icon" :size="13" />
                <span>Clear</span>
              </button>
            </div>

            <!-- Right Refresh Action -->
            <button
              type="button"
              :disabled="store.demoWalletsLoading"
              class="p-2 border border-primary-border rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Wallets Table"
              @click="loadDemoWallets(store.demoWalletsPagination.page, true)"
            >
              <HugeIcon
                :icon="RefreshCwIcon"
                :size="14"
                :class="{ 'animate-spin': store.demoWalletsLoading }"
              />
            </button>
          </div>
        </div>
      </template>

      <!-- Cell: IB Partner -->
      <template #cell-ib="{ row }">
        <div class="space-y-0.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <p class="text-xs font-bold text-primary-text">
              {{ row.user_name || `IB #${row.ib_id}` }}
            </p>
            <span
              v-if="row.ib_active !== undefined"
              class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border"
              :class="
                row.ib_active
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                  : 'bg-primary-red/10 text-primary-red border-primary-red/20'
              "
            >
              {{ row.ib_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p class="text-[10px] text-secondary-text font-mono">
            IB #{{ row.ib_id }}
          </p>
        </div>
      </template>

      <!-- Cell: User -->
      <template #cell-user="{ row }">
        <div class="space-y-0.5">
          <p class="text-xs font-semibold text-primary-text">
            User #{{ row.user_id }}
          </p>
          <p class="text-[11px] text-secondary-text font-mono truncate max-w-[180px]">
            {{ row.user_email || '—' }}
          </p>
        </div>
      </template>

      <!-- Cell: Wallet -->
      <template #cell-wallet="{ row }">
        <div class="space-y-0.5 font-mono text-xs">
          <span class="font-semibold text-primary-text">#{{ row.wallet_id || '—' }}</span>
          <p
            v-if="row.exists === false"
            class="text-[10px] text-secondary-text italic"
          >
            Uninitialized
          </p>
        </div>
      </template>

      <!-- Cell: Balance -->
      <template #cell-balance="{ row }">
        <span class="font-mono text-xs font-semibold text-primary-text tabular-nums">
          ${{ formatNum(row.balance) }}
        </span>
      </template>

      <!-- Cell: Locked -->
      <template #cell-locked="{ row }">
        <span class="font-mono text-xs text-secondary-text tabular-nums">
          ${{ formatNum(row.locked_balance) }}
        </span>
      </template>

      <!-- Cell: Available Balance -->
      <template #cell-available="{ row }">
        <span class="font-mono text-xs font-bold text-primary-green tabular-nums">
          ${{ formatNum(row.available_balance != null ? row.available_balance : (row.balance - (row.locked_balance || 0))) }}
        </span>
      </template>

      <!-- Cell: Updated At -->
      <template #cell-updated_at="{ row }">
        <span class="text-[11px] text-secondary-text font-mono">
          {{ formatDate(row.updated_at) }}
        </span>
      </template>

      <!-- Cell: Actions -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end">
          <button
            type="button"
            class="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            :class="
              selectedWalletIbId === row.ib_id
                ? 'bg-primary text-white'
                : 'bg-background border border-primary-border hover:bg-card-background text-primary-text'
            "
            @click="selectWalletForHistory(row)"
          >
            <span>History</span>
            <HugeIcon :icon="ArrowRight01Icon" :size="12" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Section 2: Demo Wallet Transactions History -->
    <div id="demo-transactions-section" class="space-y-4 pt-4 border-t border-primary-border">
      <!-- Section Header & Selected Context Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <HugeIcon :icon="Invoice01Icon" :size="15" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-primary-text">Transaction History &amp; Ledger</h3>
            <p class="text-xs text-secondary-text mt-0.5">
              <template v-if="selectedWallet">
                Showing transactions for <strong class="text-primary-text">{{ selectedWallet.user_name || `IB #${selectedWallet.ib_id}` }}</strong> (IB #{{ selectedWallet.ib_id }} &middot; User #{{ selectedWallet.user_id }})
              </template>
              <template v-else>
                Viewing all demo wallet credit transactions and settlement ledger batches.
              </template>
            </p>
          </div>
        </div>

        <div v-if="selectedWallet" class="flex items-center gap-2">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-secondary-text hover:text-primary-text bg-card-background border border-primary-border rounded-lg transition-colors cursor-pointer"
            @click="clearSelectedWallet"
          >
            <HugeIcon :icon="Cancel01Icon" :size="12" />
            <span>Show All IBs</span>
          </button>
        </div>
      </div>

      <!-- Transactions DataTable -->
      <DataTable
        :columns="transactionColumns"
        :data="store.demoTransactionsList"
        :loading="store.demoTransactionsLoading"
        :pagination="store.demoTransactionsPagination"
        row-key="id"
        table-key="demo-transactions-table"
        :per-page-options="[20, 50, 100, 200]"
        empty-title="No demo transactions found"
        empty-text="No transactions match the current history criteria."
        @page-change="handleTxPageChange"
        @per-page-change="handleTxPerPageChange"
      >
        <!-- Toolbar -->
        <template #toolbar>
          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <div class="flex flex-wrap items-center gap-2.5 flex-1">
              <!-- Reference Type Filter -->
              <div class="w-full sm:w-48">
                <BaseSelect
                  v-model="txFilterRefType"
                  :options="refTypeOptions"
                  placeholder="All Reference Types"
                  variant="surface"
                  @update:modelValue="handleTxFilterChange"
                />
              </div>

              <!-- Transaction Type Filter -->
              <div class="w-full sm:w-36">
                <BaseSelect
                  v-model="txFilterType"
                  :options="txTypeOptions"
                  placeholder="All Types"
                  variant="surface"
                  @update:modelValue="handleTxFilterChange"
                />
              </div>

              <!-- Status Filter -->
              <div class="w-full sm:w-36">
                <BaseSelect
                  v-model="txFilterStatus"
                  :options="txStatusOptions"
                  placeholder="All Statuses"
                  variant="surface"
                  @update:modelValue="handleTxFilterChange"
                />
              </div>

              <!-- Reference ID Filter -->
              <div class="w-full sm:w-32">
                <input
                  v-model="txFilterRefId"
                  type="text"
                  placeholder="Ref ID (#)"
                  class="input-field w-full px-2.5 py-1.5 text-xs font-mono"
                  @input="handleTxFilterChange"
                />
              </div>

              <!-- Date Range Filter -->
              <div class="w-full sm:w-56">
                <BaseDatePicker
                  v-model="txDateRangeValue"
                  :range="true"
                  placeholder="Date range..."
                  variant="surface"
                  placement="top"
                />
              </div>

              <!-- Clear Tx Filters -->
              <button
                v-if="hasTxFilters"
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-secondary-text hover:text-primary-red hover:bg-primary-red/5 rounded-lg transition-colors cursor-pointer"
                title="Clear transaction filters"
                @click="handleResetTxFilters"
              >
                <HugeIcon :icon="Cancel01Icon" :size="13" />
                <span>Clear</span>
              </button>
            </div>

            <!-- Refresh Tx Button -->
            <button
              type="button"
              :disabled="store.demoTransactionsLoading"
              class="p-2 border border-primary-border rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              title="Refresh Transactions"
              @click="loadDemoTransactions(store.demoTransactionsPagination.page, true)"
            >
              <HugeIcon
                :icon="RefreshCwIcon"
                :size="14"
                :class="{ 'animate-spin': store.demoTransactionsLoading }"
              />
            </button>
          </div>
        </template>

        <!-- Cell: ID & Created At -->
        <template #cell-created_at="{ row }">
          <div class="space-y-0.5">
            <span class="font-mono text-xs font-semibold text-primary-text">
              #{{ row.id }}
            </span>
            <p class="text-[10px] text-secondary-text font-mono">
              {{ formatDate(row.created_at) }}
            </p>
          </div>
        </template>

        <!-- Cell: Target (User/Wallet) -->
        <template #cell-target="{ row }">
          <div class="space-y-0.5 font-mono text-xs">
            <span class="text-primary-text">
              User #{{ row.user_id }}
            </span>
            <p class="text-[10px] text-secondary-text">
              Wallet #{{ row.wallet_id }}
            </p>
          </div>
        </template>

        <!-- Cell: Type -->
        <template #cell-type="{ row }">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase font-mono bg-primary/10 text-primary border border-primary/20">
            {{ formatType(row.type) }}
          </span>
        </template>

        <!-- Cell: Amount -->
        <template #cell-amount="{ row }">
          <span class="font-mono text-xs font-bold text-primary-green tabular-nums">
            +${{ formatNum(row.amount) }}
          </span>
        </template>

        <!-- Cell: Balance Shift -->
        <template #cell-balance_shift="{ row }">
          <div class="flex items-center gap-1.5 font-mono text-xs tabular-nums text-secondary-text">
            <span>${{ formatNum(row.balance_before) }}</span>
            <HugeIcon :icon="ArrowRight01Icon" :size="11" class="text-secondary-text" />
            <span class="font-semibold text-primary-text">${{ formatNum(row.balance_after) }}</span>
          </div>
        </template>

        <!-- Cell: Status -->
        <template #cell-status="{ row }">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            :class="{
              'bg-primary-green/10 text-primary-green border border-primary-green/20': row.status === 'completed',
              'bg-primary/10 text-primary border border-primary/20': row.status === 'pending',
              'bg-primary-red/10 text-primary-red border border-primary-red/20': row.status === 'failed',
            }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="{
                'bg-primary-green': row.status === 'completed',
                'bg-primary': row.status === 'pending',
                'bg-primary-red': row.status === 'failed',
              }"
            />
            <span>{{ formatStatus(row.status) }}</span>
          </span>
        </template>

        <!-- Cell: Reference -->
        <template #cell-reference="{ row }">
          <div class="space-y-0.5">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-card-background border border-primary-border text-secondary-text">
              {{ formatRefType(row.reference_type) }}
            </span>
            <p v-if="row.reference_id" class="text-xs font-mono text-primary-text font-semibold">
              Ref #{{ row.reference_id }}
            </p>
          </div>
        </template>

        <!-- Cell: Description -->
        <template #cell-description="{ row }">
          <Tooltip
            v-if="row.description || row.remarks"
            :text="[row.description, row.remarks].filter(Boolean).join(' • ')"
            position="top"
          >
            <div class="max-w-[280px] cursor-default">
              <p class="text-xs text-primary-text truncate">
                {{ row.description || '—' }}
              </p>
              <p v-if="row.remarks" class="text-[11px] text-secondary-text truncate italic">
                {{ row.remarks }}
              </p>
            </div>
          </Tooltip>
          <span v-else class="text-secondary-text text-xs">—</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Wallet01Icon,
  Coins01Icon,
  Invoice01Icon,
  Tick02Icon,
  Search01Icon,
  RefreshCwIcon,
  InformationCircleIcon,
  Settings01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";

const store = useCommissionEngineStore();

// ─── Wallet Filter State ────────────────────────────────
const walletFilterQ = ref("");
const walletFilterIbId = ref(null);
const walletFilterUserId = ref("");
const walletFilterMinBal = ref("");
const walletFilterMaxBal = ref("");
const walletFilterOnlyPositive = ref(false);
const walletDebounceTimer = ref(null);

// ─── Selected Wallet for Transaction History ────────────
const selectedWalletIbId = ref(null);
const selectedWallet = ref(null);

// ─── Transaction Filter State ───────────────────────────
const txFilterType = ref("");
const txFilterStatus = ref("");
const txFilterRefType = ref("");
const txFilterRefId = ref("");
const txDateFrom = ref("");
const txDateTo = ref("");
const txDebounceTimer = ref(null);

// Date range wrapper for BaseDatePicker
const txDateRangeValue = computed({
  get() {
    if (txDateFrom.value || txDateTo.value) {
      return {
        start: txDateFrom.value || null,
        end: txDateTo.value || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      txDateFrom.value = "";
      txDateTo.value = "";
    } else if (Array.isArray(val)) {
      txDateFrom.value = val[0] || "";
      txDateTo.value = val[1] || "";
    } else if (typeof val === "object") {
      txDateFrom.value = val.start || val.from || "";
      txDateTo.value = val.end || val.to || "";
    }
    handleTxFilterChange();
  },
});

// ─── Static Select Options ──────────────────────────────
const refTypeOptions = [
  { label: "All Reference Types", value: "" },
  { label: "Single Commission", value: "ib_commission" },
  { label: "Settlement Batch", value: "ib_commission_settlement" },
];

const txTypeOptions = [
  { label: "All Types", value: "" },
  { label: "Commission", value: "commission" },
];

const txStatusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

// ─── Columns Definitions ────────────────────────────────
const walletColumns = [
  { key: "ib", label: "IB Partner", width: "180px" },
  { key: "user", label: "User Details", width: "200px" },
  { key: "wallet", label: "Wallet ID", width: "130px" },
  { key: "balance", label: "Total Balance", align: "right", width: "140px", sortable: true },
  { key: "locked", label: "Locked", align: "right", width: "130px" },
  { key: "available", label: "Available Balance", align: "right", width: "160px", sortable: true },
  { key: "updated_at", label: "Last Updated", width: "160px" },
  { key: "actions", label: "Actions", align: "right", width: "120px", sticky: "right" },
];

const transactionColumns = [
  { key: "created_at", label: "Date & ID", width: "160px" },
  { key: "target", label: "User / Wallet", width: "150px" },
  { key: "type", label: "Type", align: "center", width: "120px" },
  { key: "amount", label: "Amount", align: "right", width: "130px" },
  { key: "balance_shift", label: "Balance Before → After", align: "right", width: "190px" },
  { key: "status", label: "Status", align: "center", width: "120px" },
  { key: "reference", label: "Reference", width: "180px" },
  { key: "description", label: "Description", width: "260px" },
];

// ─── Computed Helpers ───────────────────────────────────
const positiveCount = computed(() => {
  return (store.demoWalletsList || []).filter((w) => Number(w.balance || 0) > 0).length;
});

const totalBalanceSum = computed(() => {
  return (store.demoWalletsList || []).reduce((sum, w) => sum + Number(w.balance || 0), 0);
});

const totalAvailableSum = computed(() => {
  return (store.demoWalletsList || []).reduce((sum, w) => {
    const avail = w.available_balance != null ? Number(w.available_balance) : Number(w.balance || 0) - Number(w.locked_balance || 0);
    return sum + avail;
  }, 0);
});

const hasWalletFilters = computed(() => {
  return (
    walletFilterQ.value ||
    walletFilterIbId.value ||
    walletFilterUserId.value ||
    walletFilterMinBal.value ||
    walletFilterMaxBal.value ||
    walletFilterOnlyPositive.value
  );
});

const hasTxFilters = computed(() => {
  return (
    txFilterType.value ||
    txFilterStatus.value ||
    txFilterRefType.value ||
    txFilterRefId.value ||
    txDateFrom.value ||
    txDateTo.value
  );
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
onMounted(() => {
  loadDemoWallets(1);
  loadDemoTransactions(1);
  if (!store.ibSearchOptions.length) {
    store.searchIbs("");
  }
});

const refreshAll = () => {
  loadDemoWallets(store.demoWalletsPagination.page, true);
  loadDemoTransactions(store.demoTransactionsPagination.page, true);
};

const loadDemoWallets = (page = 1, force = false) => {
  const qVal = walletFilterQ.value.trim();
  const ibVal = walletFilterIbId.value;
  const userVal = walletFilterUserId.value ? Number(walletFilterUserId.value) : undefined;
  const minBal = walletFilterMinBal.value !== "" ? Number(walletFilterMinBal.value) : undefined;
  const maxBal = walletFilterMaxBal.value !== "" ? Number(walletFilterMaxBal.value) : undefined;

  const params = {
    page,
    per_page: store.demoWalletsPagination.per_page || 50,
    q: qVal || undefined,
    ib_id: ibVal ? Number(ibVal) : undefined,
    user_id: userVal,
    min_balance: minBal,
    max_balance: maxBal,
    only_positive: walletFilterOnlyPositive.value ? true : undefined,
  };

  store.fetchDemoWallets(params, force);
};

const loadDemoTransactions = (page = 1, force = false) => {
  const ibVal = selectedWalletIbId.value;
  const userVal = selectedWallet.value?.user_id;
  const refType = txFilterRefType.value;
  const refId = txFilterRefId.value.trim();
  const txType = txFilterType.value;
  const txStatus = txFilterStatus.value;

  const params = {
    page,
    per_page: store.demoTransactionsPagination.per_page || 50,
    ib_id: ibVal ? Number(ibVal) : undefined,
    user_id: userVal ? Number(userVal) : undefined,
    reference_type: refType || undefined,
    reference_id: refId || undefined,
    type: txType || undefined,
    status: txStatus || undefined,
    date_from: txDateFrom.value || undefined,
    date_to: txDateTo.value || undefined,
  };

  store.fetchDemoTransactions(params, force);
};

// ─── Filter & Pagination Handlers ───────────────────────
const handleWalletFilterChange = () => {
  if (walletDebounceTimer.value) clearTimeout(walletDebounceTimer.value);
  walletDebounceTimer.value = setTimeout(() => {
    loadDemoWallets(1, true);
  }, 350);
};

const toggleOnlyPositive = () => {
  walletFilterOnlyPositive.value = !walletFilterOnlyPositive.value;
  loadDemoWallets(1, true);
};

const handleResetWalletFilters = () => {
  walletFilterQ.value = "";
  walletFilterIbId.value = null;
  walletFilterUserId.value = "";
  walletFilterMinBal.value = "";
  walletFilterMaxBal.value = "";
  walletFilterOnlyPositive.value = false;
  loadDemoWallets(1, true);
};

const handleWalletPageChange = (page) => {
  loadDemoWallets(page, true);
};

const handleWalletPerPageChange = (newPerPage) => {
  const perPageVal =
    typeof newPerPage === "object" && newPerPage !== null
      ? newPerPage.per_page || newPerPage.value || 50
      : newPerPage;
  store.demoWalletsPagination.per_page = Number(perPageVal) || 50;
  loadDemoWallets(1, true);
};

const selectWalletForHistory = (wallet) => {
  if (selectedWalletIbId.value === wallet.ib_id) {
    clearSelectedWallet();
    return;
  }
  selectedWalletIbId.value = wallet.ib_id;
  selectedWallet.value = wallet;
  loadDemoTransactions(1, true);

  // Smooth scroll to transactions section
  const el = document.getElementById("demo-transactions-section");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const clearSelectedWallet = () => {
  selectedWalletIbId.value = null;
  selectedWallet.value = null;
  loadDemoTransactions(1, true);
};

const handleTxFilterChange = () => {
  if (txDebounceTimer.value) clearTimeout(txDebounceTimer.value);
  txDebounceTimer.value = setTimeout(() => {
    loadDemoTransactions(1, true);
  }, 350);
};

const handleResetTxFilters = () => {
  txFilterType.value = "";
  txFilterStatus.value = "";
  txFilterRefType.value = "";
  txFilterRefId.value = "";
  txDateFrom.value = "";
  txDateTo.value = "";
  loadDemoTransactions(1, true);
};

const handleTxPageChange = (page) => {
  loadDemoTransactions(page, true);
};

const handleTxPerPageChange = (newPerPage) => {
  const perPageVal =
    typeof newPerPage === "object" && newPerPage !== null
      ? newPerPage.per_page || newPerPage.value || 50
      : newPerPage;
  store.demoTransactionsPagination.per_page = Number(perPageVal) || 50;
  loadDemoTransactions(1, true);
};

// ─── Formatters ─────────────────────────────────────────
const formatNum = (val) => {
  if (val == null || isNaN(Number(val))) return "0.00";
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

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

const formatType = (val) => {
  if (!val) return "Commission";
  return String(val).replace(/_/g, " ");
};

const formatStatus = (val) => {
  if (!val) return "Completed";
  return String(val).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatRefType = (val) => {
  if (val === "ib_commission") return "Single Commission";
  if (val === "ib_commission_settlement") return "Settlement Batch";
  return val ? String(val).replace(/_/g, " ") : "Commission";
};
</script>
