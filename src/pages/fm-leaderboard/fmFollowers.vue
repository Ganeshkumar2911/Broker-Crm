<template>
  <div class="space-y-6 py-2">
    <!-- Top Header / FM Basic Info Banner -->
    <div
      class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 shadow-2xs"
    >
      <div
        v-if="fmInfo"
        class="flex flex-col xl:flex-row xl:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <div
            class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0"
          >
            {{ (fmInfo.label_name || "FM")[0].toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base font-bold text-primary-text truncate">
                {{ fmInfo.label_name || "Fund Manager Followers" }}
              </h2>
              <span
                class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                :class="
                  fmInfo.is_active
                    ? 'bg-primary-green/10 text-primary-green border border-primary-green/20'
                    : 'bg-background text-secondary-text border border-primary-border'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="fmInfo.is_active ? 'bg-primary-green' : 'bg-zinc-400'"
                />
                {{ fmInfo.is_active ? "Active" : "Inactive" }}
              </span>
              <span
                class="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md border text-secondary-text bg-background/80 border-primary-border"
              >
                {{ fmInfo.visibility_type || "public" }}
              </span>
            </div>
            <div
              class="flex items-center gap-3 text-xs text-secondary-text mt-1 flex-wrap font-medium"
            >
              <span
                v-if="fmInfo.user?.email"
                class="flex items-center gap-1 font-mono text-primary-text select-all"
              >
                <Mail class="w-3.5 h-3.5 text-primary shrink-0" />
                {{ fmInfo.user.email }}
              </span>
              <span v-if="fmInfo.user?.name" class="text-secondary-text">
                Owner:
                <strong class="text-primary-text">{{
                  fmInfo.user.name
                }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- Summary Specs & Refresh Button -->
        <div class="flex flex-col xl:flex-row xl:items-center gap-3 shrink-0 w-full xl:w-auto mt-2 xl:mt-0">
          <div
            class="grid grid-cols-2 sm:flex sm:items-center gap-3 text-xs bg-background/60 border border-primary-border/60 rounded-xl px-3.5 py-2 w-full xl:w-auto"
          >
            <div>
              <span
                class="text-[9px] uppercase text-secondary-text block font-semibold"
                >Master Account</span
              >
              <span
                class="font-bold text-primary-text font-mono text-xs cursor-pointer hover:text-primary hover:underline transition-colors break-all"
                @click="goToTradingAccount(fmInfo.master_account?.account_number || fmInfo.master_account_id)"
              >
                {{ fmInfo.master_account?.account_number || `#${fmInfo.master_account_id}` }}
              </span>
            </div>
            <div class="hidden sm:block h-6 w-px bg-primary-border/60" />
            <div>
              <span
                class="text-[9px] uppercase text-secondary-text block font-semibold"
                >Coverage Account</span
              >
              <span
                v-if="fmInfo.coverage_account?.account_number || fmInfo.coverage_account_id"
                class="font-bold text-primary-text font-mono text-xs cursor-pointer hover:text-primary hover:underline transition-colors break-all"
                @click="goToTradingAccount(fmInfo.coverage_account?.account_number || fmInfo.coverage_account_id)"
              >
                {{ fmInfo.coverage_account?.account_number || `#${fmInfo.coverage_account_id}` }}
              </span>
              <span v-else class="text-xs text-secondary-text">—</span>
            </div>
            <div class="hidden sm:block h-6 w-px bg-primary-border/60" />
            <div class="col-span-2 sm:col-span-1">
              <span
                class="text-[9px] uppercase text-secondary-text block font-semibold"
                >Perf Fee / Min Cap</span
              >
              <span class="font-bold text-primary text-xs"
                >{{ fmInfo.performance_fee }}% ·
                {{ formatCurrency(fmInfo.min_capital, activeCurrency) }}</span
              >
            </div>
          </div>

          <div class="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end items-center gap-2 w-full xl:w-auto">
            <button
              class="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
              @click="fetchOpenPositions"
              :disabled="loadingOpenPositions"
            >
              <Activity
                class="w-3.5 h-3.5"
                :class="{ 'animate-pulse': loadingOpenPositions }"
              />
              <span class="whitespace-nowrap">Check Open Pos</span>
            </button>

            <button
              v-if="hasPermission('fund_manager.view')"
              class="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
              @click="scanDealsDialogOpen = true"
            >
              <Search class="w-3.5 h-3.5" />
              <span class="whitespace-nowrap">Scan Deals</span>
            </button>

            <button
              v-if="
                hasPermission('fund_manager.update') ||
                hasPermission('xtention_dev.view')
              "
              class="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-red hover:bg-primary-red/90 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
              @click="clearPositionsDialogOpen = true"
            >
              <XCircle class="w-3.5 h-3.5" />
              <span class="whitespace-nowrap">Clear Positions</span>
            </button>

            <button
              v-if="hasPermission('fund_manager.update')"
              class="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
              @click="addFollowerDialogOpen = true"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span class="whitespace-nowrap">Add Follower</span>
            </button>

            <Tooltip text="Refresh List" class="col-span-2 sm:col-span-1 w-full sm:w-auto mt-1 sm:mt-0">
              <button
                class="w-full sm:w-auto flex justify-center items-center p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
                @click="fetchFollowers(true, pagination.page)"
                :disabled="loading"
                title="Refresh List"
              >
                <RotateCw
                  class="w-4 h-4 sm:w-3.5 sm:h-3.5"
                  :class="{ 'animate-spin': loading }"
                />
                <span class="ml-2 sm:hidden text-xs font-semibold">Refresh</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h2 class="text-base font-bold text-primary-text">
          Clients & Followers List
          <span class="text-xs text-secondary-text font-normal block sm:inline-block sm:ml-1 mt-0.5 sm:mt-0"
            >(FM #{{ fmId }})</span
          >
        </h2>
        <div class="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end items-center gap-2 w-full xl:w-auto">
          <button
            class="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
            @click="fetchOpenPositions"
            :disabled="loadingOpenPositions"
          >
            <Activity
              class="w-3.5 h-3.5"
              :class="{ 'animate-pulse': loadingOpenPositions }"
            />
            <span class="whitespace-nowrap">Check Open Pos</span>
          </button>

          <button
            v-if="hasPermission('fund_manager.view')"
            class="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
            @click="scanDealsDialogOpen = true"
          >
            <Search class="w-3.5 h-3.5" />
            <span class="whitespace-nowrap">Scan Deals</span>
          </button>

          <button
            v-if="hasPermission('fund_manager.update')"
            class="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-red hover:bg-primary-red/90 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
            @click="clearPositionsDialogOpen = true"
          >
            <XCircle class="w-3.5 h-3.5" />
            <span class="whitespace-nowrap">Clear Positions</span>
          </button>

          <button
            v-if="hasPermission('fund_manager.update')"
            class="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
            @click="addFollowerDialogOpen = true"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span class="whitespace-nowrap">Add Follower</span>
          </button>

          <Tooltip text="Refresh List" class="col-span-2 sm:col-span-1 w-full sm:w-auto mt-1 sm:mt-0">
            <button
              class="w-full sm:w-auto flex justify-center items-center p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="fetchFollowers(true, pagination.page)"
              :disabled="loading"
              title="Refresh List"
            >
              <RotateCw
                class="w-4 h-4 sm:w-3.5 sm:h-3.5"
                :class="{ 'animate-spin': loading }"
              />
              <span class="ml-2 sm:hidden text-xs font-semibold">Refresh</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Status Navigation Tabs -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div
        class="flex items-center gap-1 bg-card-background border border-primary-border rounded-xl p-1 shadow-2xs overflow-x-auto max-w-full"
      >
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          class="cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 select-none"
          :class="
            selectedStatus === tab.value
              ? 'bg-primary text-white shadow-xs'
              : 'text-secondary-text hover:text-primary-text hover:bg-background/80'
          "
          @click="selectStatus(tab.value)"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="selectedStatus === tab.value ? 'bg-white' : tab.dotClass"
          />
          {{ tab.label }}
          <span
            v-if="
              selectedStatus === tab.value &&
              pagination.total_items !== undefined
            "
            class="px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-none"
            :class="
              selectedStatus === tab.value
                ? 'bg-white/20 text-white'
                : 'bg-background text-secondary-text border border-primary-border'
            "
          >
            {{ pagination.total_items }}
          </span>
        </button>
      </div>

      <!-- Quick status indicator -->
      <div
        class="text-xs text-secondary-text font-medium hidden sm:flex items-center gap-2"
      >
        <span
          class="inline-block w-2 h-2 rounded-full"
          :class="currentStatusDotClass"
        />
        <span
          >View:
          <strong class="text-primary-text">{{
            currentStatusTitle
          }}</strong></span
        >
      </div>
    </div>

    <!-- Filters Bar -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card-background/40 border border-primary-border rounded-xl p-2.5"
    >
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search follower name, email, account..."
            class="w-full h-9 pl-8 pr-7 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Offer Filter -->
        <BaseSelect
          v-if="offerOptions.length > 1"
          v-model="selectedOffer"
          :options="offerOptions"
          placeholder="Filter Offer"
          class="w-40 sm:w-44"
        />
      </div>

      <!-- Clear Filters -->
      <button
        v-if="hasActiveFilters"
        type="button"
        class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        @click="resetFilters"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        Reset Filters
      </button>
    </div>

    <!-- SKELETON LOADING STATE -->
    <template v-if="loading">
      <div
        class="hidden md:block w-full border border-primary-border rounded-2xl overflow-hidden bg-card-background/40"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-primary-border bg-card-background/50">
              <th v-for="n in 8" :key="n" class="px-4 py-3">
                <div class="h-3 w-16 bg-background rounded animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="n in 5"
              :key="n"
              class="border-b border-primary-border/60 last:border-none"
            >
              <td v-for="i in 8" :key="i" class="px-4 py-4">
                <div
                  class="h-4 bg-background rounded animate-pulse"
                  :class="i === 1 ? 'w-32' : 'w-16'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4"
        >
          <div class="flex items-center justify-between">
            <div class="h-4 w-32 bg-background rounded" />
            <div class="h-5 w-14 bg-background rounded-full" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="m in 4"
              :key="m"
              class="h-10 bg-background rounded-xl"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- EMPTY STATE -->
    <div
      v-else-if="filteredFollowers.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-border bg-card-background/30 py-20 px-4 text-center"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-background border border-primary-border flex items-center justify-center mb-4 shadow-xs"
      >
        <Users class="w-7 h-7 text-secondary-text" />
      </div>
      <p class="text-base font-semibold text-primary-text mb-1">
        {{ hasActiveFilters ? "No matching followers found" : emptyStateTitle }}
      </p>
      <p class="text-xs text-secondary-text max-w-sm">
        {{
          hasActiveFilters
            ? "Try adjusting your search criteria or resetting filters."
            : emptyStateDescription
        }}
      </p>
    </div>

    <!-- MAIN CONTENT -->
    <template v-else>
      <!-- Desktop Table View -->
      <div class="hidden md:block w-full">
        <DataTable
          :columns="columns"
          :data="filteredFollowers"
          :actions-sticky="true"
          :pagination="pagination"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
        >
          <!-- Name & Email -->
          <template #cell-follower_email="{ row }">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0"
                  >
                    {{ (row.name || "F")[0].toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="font-bold text-primary-text text-xs truncate"
                      :title="row.name"
                    >
                      {{ row.name || "Unnamed Follower" }}
                    </p>
                    <p
                      class="text-[11px] font-semibold text-primary font-mono select-all truncate max-w-50"
                      :title="row.email"
                    >
                      {{ row.email || "No email" }}
                    </p>
                  </div>
                </div>
          </template>

          <!-- Account & Server -->
          <template #cell-account_server="{ row }">
                <div class="space-y-0.5">
                  <p 
                    class="font-mono text-xs text-primary-text font-bold cursor-pointer hover:text-primary hover:underline transition-colors w-fit"
                    @click.stop="goToTradingAccount(row.account_number || row.account_id)"
                  >
                    {{ row.account_number || `#${row.account_id}` }}
                  </p>
                  <p
                    class="text-[10px] text-secondary-text uppercase font-semibold"
                  >
                    {{ row.broker_label || row.server || "COPY_TRADING" }}
                  </p>
                </div>
          </template>

          <!-- Equity & PnL -->
          <template #cell-equity_pnl="{ row }">
                <div class="space-y-0.5">
                  <p class="text-xs font-extrabold text-primary-text">
                    {{ formatCurrency(row.equity, getRowCurrency(row)) }}
                  </p>
                  <p
                    class="text-[10px] font-bold"
                    :class="
                      Number(row.net_profit || row.gross_pnl || 0) >= 0
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    "
                  >
                    PnL:
                    {{
                      formatPnl(
                        row.net_profit || row.gross_pnl,
                        getRowCurrency(row),
                      )
                    }}
                  </p>
                </div>
          </template>

          <!-- Lot Setup & Trades -->
          <template #cell-lot_trades="{ row }">
                <div class="space-y-0.5">
                  <p class="text-xs font-semibold text-primary-text capitalize">
                    {{ row.lot_type || "fixed" }}
                    <span class="text-secondary-text text-[10px] font-normal"
                      >({{ row.lot_value ?? "0" }})</span
                    >
                  </p>
                  <p class="text-[10px] text-secondary-text">
                    Trades:
                    <span class="font-bold text-primary-text">{{
                      row.total_trades ?? 0
                    }}</span
                    ><span v-if="row.open_position_count !== undefined">
                      · Open Pos:
                      <span
                        class="font-bold"
                        :class="
                          row.open_position_count > 0
                            ? 'text-amber-500'
                            : 'text-primary-text'
                        "
                        >{{ row.open_position_count }}</span
                      ></span
                    >
                  </p>
                  <p class="text-[10px] text-secondary-text">
                    Fees:
                    <span class="font-bold text-primary-text">{{
                      formatCurrency(row.total_fees, getRowCurrency(row))
                    }}</span>
                  </p>
                </div>
          </template>

          <!-- Offer & IB Partner -->
          <template #cell-offer_ib="{ row }">
                <div class="space-y-0.5">
                  <p
                    v-if="row.offer_name"
                    class="text-xs font-semibold text-primary-text truncate max-w-42.5"
                    :title="row.offer_name"
                  >
                    {{ row.offer_name }}
                  </p>
                  <p v-else class="text-xs text-secondary-text">—</p>
                  <p
                    v-if="row.ib_name || row.ib_email"
                    class="text-[10px] text-secondary-text truncate max-w-42.5"
                    :title="row.ib_email"
                  >
                    IB: {{ row.ib_name || row.ib_email }}
                  </p>
                </div>
          </template>

          <!-- Joined At -->
          <template #cell-joined_at="{ row }">
            <span class="text-[10px] text-secondary-text font-mono">
              {{ row.joined_at ? formatDateTime(row.joined_at) : '—' }}
            </span>
          </template>

          <!-- Status -->
          <template #cell-status="{ row }">
                <span
                  class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 shadow-2xs"
                  :class="getStatusBadgeClass(row)"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="getStatusDotClass(row)"
                  />
                  {{ getStatusLabel(row) }}
                </span>
                <p
                  v-if="row.unfollowed_at || row.ended_at || row.left_at"
                  class="text-[10px] text-secondary-text mt-1 font-mono"
                >
                  Ended:
                  {{
                    formatDate(row.unfollowed_at || row.ended_at || row.left_at)
                  }}
                </p>
          </template>

          <!-- Action -->
          <template #cell-actions="{ row }">
                <div class="flex items-center justify-end gap-1.5">
                  <Tooltip text="Trade Book" position="right">
                    <button
                      class="flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                      @click="goToTradeBook(row)"
                    >
                      <BookOpen class="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>

                  <Tooltip
                    v-if="hasPermission('xtention_dev.login_as_client')"
                    text="Client Login"
                    position="right"
                  >
                    <button
                      class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                      @click="handleClientLogin(row)"
                    >
                      <LogIn class="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>

                  <Tooltip
                    v-if="!isPastFollower(row)"
                    :text="
                      row.open_position_count > 0
                        ? 'Cannot edit with open positions'
                        : 'Edit Follower Settings'
                    "
                    position="right"
                  >
                    <button
                      class="p-1.5 rounded-lg border border-primary-border transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                      :class="
                        row.open_position_count > 0
                          ? 'bg-background/50 text-secondary-text/50 cursor-not-allowed'
                          : 'hover:bg-background text-secondary-text hover:text-primary-text cursor-pointer'
                      "
                      :disabled="row.open_position_count > 0"
                      @click="
                        row.open_position_count > 0
                          ? null
                          : openEditFollowerDialog(row)
                      "
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>

                  <Tooltip text="View Follower Details" position="right">
                    <button
                      class="p-1.5 rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                      @click="goToFollowerDetails(row)"
                    >
                      <ChevronsRight class="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
          </template>
        </DataTable>
      </div>

      <!-- Mobile Card View -->
      <div class="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="row in filteredFollowers"
          :key="row.id || row.account_id"
          class="bg-card-background border border-primary-border rounded-2xl p-4 flex flex-col gap-3 shadow-2xs"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="text-xs font-bold text-primary-text truncate">
                {{ row.name || "Unnamed Follower" }}
              </p>
              <p class="text-[11px] text-primary font-semibold truncate">
                {{ row.email }}
              </p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                :class="getStatusBadgeClass(row)"
              >
                {{ getStatusLabel(row) }}
              </span>
              <button
                class="p-1 rounded-lg border border-primary-border bg-primary/10 text-primary hover:bg-primary/20"
                title="Trade Book"
                @click="goToTradeBook(row)"
              >
                <BookOpen class="w-3.5 h-3.5" />
              </button>
              <button
                v-if="hasPermission('xtention_dev.login_as_client')"
                class="p-1 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text"
                title="Client Login"
                @click="handleClientLogin(row)"
              >
                <LogIn class="w-3.5 h-3.5" />
              </button>
              <button
                v-if="!isPastFollower(row)"
                class="p-1 rounded-lg border border-primary-border transition-colors"
                :class="
                  row.open_position_count > 0
                    ? 'bg-background/50 text-secondary-text/50 cursor-not-allowed'
                    : 'text-secondary-text hover:text-primary-text cursor-pointer'
                "
                :title="
                  row.open_position_count > 0
                    ? 'Cannot edit with open positions'
                    : 'Edit Follower Settings'
                "
                :disabled="row.open_position_count > 0"
                @click="
                  row.open_position_count > 0
                    ? null
                    : openEditFollowerDialog(row)
                "
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                class="p-1 rounded-lg border border-primary-border text-secondary-text hover:text-primary"
                title="View Follower Details"
                @click="goToFollowerDetails(row)"
              >
                <ChevronsRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            class="grid grid-cols-2 gap-2 text-xs bg-background/60 border border-primary-border/60 rounded-xl p-2.5"
          >
            <div>
              <span
                class="text-[9px] text-secondary-text block uppercase font-semibold"
                >Account</span
              >
              <span class="font-bold text-primary-text font-mono">{{
                row.account_number || `#${row.account_id}`
              }}</span>
            </div>
            <div>
              <span
                class="text-[9px] text-secondary-text block uppercase font-semibold"
                >Equity</span
              >
              <span class="font-bold text-primary-text">{{
                formatCurrency(row.equity, getRowCurrency(row))
              }}</span>
            </div>
            <div>
              <span
                class="text-[9px] text-secondary-text block uppercase font-semibold"
                >Net PnL</span
              >
              <span
                class="font-bold"
                :class="
                  Number(row.net_profit || row.gross_pnl || 0) >= 0
                    ? 'text-emerald-500'
                    : 'text-rose-500'
                "
              >
                {{
                  formatPnl(
                    row.net_profit || row.gross_pnl,
                    getRowCurrency(row),
                  )
                }}
              </span>
            </div>
            <div>
              <span
                class="text-[9px] text-secondary-text block uppercase font-semibold"
                >Trades</span
              >
              <span class="font-bold text-primary-text">{{
                row.total_trades ?? 0
              }}</span>
            </div>
            <div v-if="row.open_position_count !== undefined">
              <span
                class="text-[9px] text-secondary-text block uppercase font-semibold"
                >Open Pos</span
              >
              <span
                class="font-bold"
                :class="
                  row.open_position_count > 0
                    ? 'text-amber-500'
                    : 'text-primary-text'
                "
                >{{ row.open_position_count }}</span
              >
            </div>
            <div class="col-span-2">
              <span
                class="text-[9px] text-secondary-text block uppercase font-semibold"
                >Joined At</span
              >
              <span class="font-bold text-secondary-text font-mono">{{
                row.joined_at ? formatDate(row.joined_at) : "—"
              }}</span>
            </div>
            <div
              v-if="row.unfollowed_at || row.ended_at || row.left_at"
              class="col-span-2"
            >
              <span
                class="text-[9px] text-secondary-text block uppercase font-semibold"
                >Ended Date</span
              >
              <span class="font-bold text-secondary-text font-mono">{{
                formatDate(row.unfollowed_at || row.ended_at || row.left_at)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Pagination -->
      <div class="md:hidden mt-4" v-if="pagination && pagination.total_items > pagination.per_page">
        <DataTablePagination
          :pagination="pagination"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
        />
      </div>
    </template>

    <!-- ADD FOLLOWER DIALOG -->
    <AddFollowerDialog
      :open="addFollowerDialogOpen"
      :fm-id="fmId"
      :currency="activeCurrency"
      @close="addFollowerDialogOpen = false"
      @created="handleFollowerAdded"
    />

    <!-- EDIT FOLLOWER DIALOG -->
    <EditFollowerDialog
      :open="editDialogOpen"
      :follower="editingFollower"
      @close="editDialogOpen = false"
      @updated="handleFollowerUpdated"
    />

    <!-- CLIENT LOGIN MODAL -->
    <ClientLoginModal
      :open="clientLoginModalOpen"
      :client="selectedClientForLogin || {}"
      @close="closeClientLoginModal"
    />

    <!-- CLEAR POSITIONS DIALOG -->
    <ConfirmationDialog
      :open="clearPositionsDialogOpen"
      title="Clear Follower Positions"
      message="Clear all open follower positions for this fund manager? Followers will stay subscribed. Live closes are processed by the copy engine and may take a short time. This cannot be undone from the UI."
      confirmText="Clear Positions"
      cancelText="Cancel"
      type="danger"
      :loading="clearingPositions"
      @confirm="handleClearPositions"
      @cancel="clearPositionsDialogOpen = false"
    />

    <!-- SCAN DEALS BY COMMENT DIALOG -->
    <ScanDealsByCommentDialog
      :open="scanDealsDialogOpen"
      :fm-id="fmId"
      @close="scanDealsDialogOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  RotateCw,
  RotateCcw,
  Users,
  Search,
  X,
  Mail,
  ChevronsRight,
  Pencil,
  BookOpen,
  UserCheck,
  PauseCircle,
  History,
  UserPlus,
  LogIn,
  XCircle,
  Activity,
} from "lucide-vue-next";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { formatDate as formatDateTime } from "@/utils/timeFormatter";
import Tooltip from "@/components/common/Tooltip.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import DataTablePagination from "@/components/common/DataTable/DataTablePagination.vue";

import EditFollowerDialog from "@/components/fmOffers/EditFollowerDialog.vue";
import AddFollowerDialog from "@/components/fmOffers/AddFollowerDialog.vue";
import ScanDealsByCommentDialog from "@/components/fmOffers/ScanDealsByCommentDialog.vue";
import ClientLoginModal from "@/components/common/ClientLoginModal.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const route = useRoute();
const router = useRouter();
const snackbar = useSnackbarStore();
const { hasPermission } = usePermissionCheck();

const goToTradingAccount = (accountNumber) => {
  if (!accountNumber) return;
  const accStr = String(accountNumber).replace('#', '');
  router.push({ path: '/trading-accounts', query: { search: accStr } });
};

const columns = [
  { key: "follower_email", label: "Follower & Email" },
  { key: "account_server", label: "Account & Server" },
  { key: "equity_pnl", label: "Equity & PnL" },
  { key: "lot_trades", label: "Lot Setup & Trades" },
  { key: "offer_ib", label: "Offer & IB Partner" },
  { key: "joined_at", label: "Joined At" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Action", align: "right" },
];

const fmId = route.params.id;
const fmInfo = ref(null);
const followers = ref([]);
const availableOffers = ref([]);
const loading = ref(false);
const loadingOpenPositions = ref(false);
const addFollowerDialogOpen = ref(false);
const scanDealsDialogOpen = ref(false);

const clearPositionsDialogOpen = ref(false);
const clearingPositions = ref(false);

const handleClearPositions = () => {
  if (!fmId) return;
  clearingPositions.value = true;

  apiRequest(
    urls.KEYS.POST,
    urls.fm.clearFollowerPositions(fmId),
    {
      data: { confirm: true },
      isTokenRequired: true,
      onSuccess: (res) => {
        const d = res?.data;
        const failed = d?.failed ?? [];

        let msg = `Successfully processed. Followers: ${d?.followers}, Positions: ${d?.positions}, Queued: ${d?.queued}, Synced: ${d?.synced}.`;
        if (d?.note) msg += ` Note: ${d.note}`;
        if (failed.length > 0) {
          msg += ` Failed for ${failed.length} follower(s).`;
          snackbar.show(msg, "warning");
        } else {
          snackbar.show(msg, "success");
        }
        clearPositionsDialogOpen.value = false;
        fetchFollowers(true, pagination.value.page);
      },
      onFailure: (err) => {
        snackbar.show(
          err?.error || err?.message || "Failed to clear positions",
          "error",
        );
      },
      onFinally: () => {
        clearingPositions.value = false;
      },
    },
  );
};

const handleFollowerAdded = () => {
  fetchFollowers(true, 1);
};
const searchQuery = ref("");
const selectedOffer = ref("ALL");

const clientLoginModalOpen = ref(false);
const selectedClientForLogin = ref(null);

const handleClientLogin = (row) => {
  if (!row) return;
  const clientId = row.user_id || row.client_id || row.lead_id || row.id;
  if (!clientId) return;

  selectedClientForLogin.value = { ...row, id: clientId };
  clientLoginModalOpen.value = true;
};

const closeClientLoginModal = () => {
  clientLoginModalOpen.value = false;
  selectedClientForLogin.value = null;
};

const statusTabs = [
  {
    label: "Active Followers",
    value: "active",
    icon: UserCheck,
    dotClass: "bg-emerald-500",
  },
  {
    label: "Paused",
    value: "paused",
    icon: PauseCircle,
    dotClass: "bg-amber-500",
  },
  {
    label: "Past History",
    value: "past",
    icon: History,
    dotClass: "bg-zinc-400",
  },
  { label: "All Followers", value: "all", icon: Users, dotClass: "bg-primary" },
];

const normalizeStatus = (status) => {
  const s = String(status || "")
    .toLowerCase()
    .trim();
  if (s === "history" || s === "past") return "past";
  if (s === "paused") return "paused";
  if (s === "all") return "all";
  return "active";
};

const selectedStatus = ref(
  route.query.status ? normalizeStatus(route.query.status) : "active",
);

const currentStatusTitle = computed(() => {
  const current = statusTabs.find((t) => t.value === selectedStatus.value);
  return current?.label || selectedStatus.value;
});

const currentStatusDotClass = computed(() => {
  const current = statusTabs.find((t) => t.value === selectedStatus.value);
  return current?.dotClass || "bg-primary";
});

const emptyStateTitle = computed(() => {
  if (selectedStatus.value === "active") return "No Active Followers";
  if (selectedStatus.value === "paused") return "No Paused Followers";
  if (selectedStatus.value === "past") return "No Past Followers History";
  return "No Followers Assigned Yet";
});

const emptyStateDescription = computed(() => {
  if (selectedStatus.value === "active") {
    return "No active client accounts are currently subscribed to this Fund Manager.";
  }
  if (selectedStatus.value === "paused") {
    return "No follower accounts are currently paused for this Fund Manager.";
  }
  if (selectedStatus.value === "past") {
    return "No unfollowed or historical follower accounts found for this Fund Manager.";
  }
  return "No client accounts have subscribed to this Fund Manager yet.";
});

const selectStatus = (status) => {
  if (selectedStatus.value === status) return;
  selectedStatus.value = status;
  pagination.value.page = 1;
  router.replace({
    query: {
      ...route.query,
      status,
    },
  });
  fetchFollowers(true, 1);
};

watch(
  () => route.query.status,
  (newStatus) => {
    if (newStatus) {
      const normalized = normalizeStatus(newStatus);
      if (selectedStatus.value !== normalized) {
        selectedStatus.value = normalized;
        pagination.value.page = 1;
        fetchFollowers(true, 1);
      }
    }
  },
);

const editDialogOpen = ref(false);
const editingFollower = ref(null);

const goToTradeBook = (row) => {
  const followerId = row.id || row.account_id;
  router.push({
    path: `/follower/trade-book/${followerId}`,
    query: {
      fm_id: fmId,
      account_number: row.account_number,
      trading_account_id: row.trading_account_id || row.account_id,
      currency: getRowCurrency(row),
      user_name: row.user_name || row.name || row.account_name,
      broker_group: row.broker_group,
      copy_ratio: row.copy_ratio,
      is_active: row.is_active,
    },
  });
};

const goToFollowerDetails = (row) => {
  const followerId = row.id || row.account_id;
  router.push({
    path: `/follower-info/${followerId}`,
    query: {
      fm_id: fmId,
      status: selectedStatus.value,
    },
  });
};

const openEditFollowerDialog = (row) => {
  editingFollower.value = row;
  editDialogOpen.value = true;
};

const handleFollowerUpdated = () => {
  fetchFollowers(true, pagination.value.page);
};

const pagination = ref({
  page: 1,
  per_page: 10,
  total_items: 0,
  total_pages: 0,
});

const loadFmInfo = () => {
  try {
    const raw = localStorage.getItem("active_fm");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (String(parsed?.id) === String(fmId)) {
        fmInfo.value = parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load active FM from localStorage:", e);
  }
};

const offerOptions = computed(() => {
  const options = [{ label: "All Offers", value: "ALL" }];
  if (Array.isArray(availableOffers.value)) {
    availableOffers.value.forEach((off) => {
      options.push({
        label: off.name || off.offer_code || `Offer #${off.id}`,
        value: String(off.id),
      });
    });
  }
  return options;
});

const hasActiveFilters = computed(() => {
  return Boolean(searchQuery.value.trim()) || selectedOffer.value !== "ALL";
});

const resetFilters = () => {
  searchQuery.value = "";
  selectedOffer.value = "ALL";
};

const fmt = (val) => {
  const num = Number(val ?? 0);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const activeCurrency = computed(() => {
  return (
    route.query.currency ||
    fmInfo.value?.broker_currency ||
    fmInfo.value?.currency ||
    fmInfo.value?.coverage_account?.broker_currency ||
    fmInfo.value?.master_account?.broker_currency ||
    "USD"
  );
});

const getRowCurrency = (row) => {
  return (
    row?.broker_currency ||
    row?.currency ||
    row?.trading_account?.broker_currency ||
    row?.account?.broker_currency ||
    activeCurrency.value ||
    "USD"
  );
};

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
  if (val === null || val === undefined || isNaN(val)) return "—";
  const num = Number(val);
  if (isNaN(num)) return "—";
  const sym = getCurrencySymbol(currency || activeCurrency.value);
  return `${sym}${fmt(num)}`;
};

const formatPnl = (val, currency = null) => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const num = Number(val);
  if (isNaN(num)) return "—";
  const sym = getCurrencySymbol(currency || activeCurrency.value);
  const prefix = num >= 0 ? `+${sym}` : `-${sym}`;
  return `${prefix}${fmt(Math.abs(num))}`;
};

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const isPastFollower = (row) => {
  const s = String(row?.status || "").toLowerCase();
  return s === "past" || s === "history" || s === "unfollowed";
};

const getStatusBadgeClass = (row) => {
  const s = String(
    row?.status || (row?.is_active ? "active" : "inactive"),
  ).toLowerCase();
  if (s === "active") {
    return "bg-primary-green/10 text-primary-green border border-primary-green/20";
  }
  if (s === "paused") {
    return "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20";
  }
  if (s === "past" || s === "history" || s === "unfollowed") {
    return "bg-background text-secondary-text border border-primary-border";
  }
  return "bg-background text-secondary-text border border-primary-border";
};

const getStatusDotClass = (row) => {
  const s = String(
    row?.status || (row?.is_active ? "active" : "inactive"),
  ).toLowerCase();
  if (s === "active") return "bg-primary-green animate-pulse";
  if (s === "paused") return "bg-primary-yellow";
  if (s === "past" || s === "history" || s === "unfollowed")
    return "bg-zinc-400";
  return "bg-zinc-400";
};

const getStatusLabel = (row) => {
  if (row?.status) {
    if (row.status === "past") return "Past (Unfollowed)";
    return row.status.charAt(0).toUpperCase() + row.status.slice(1);
  }
  return row?.is_active ? "Active" : "Inactive";
};

const filteredFollowers = computed(() => {
  if (!Array.isArray(followers.value)) return [];
  return followers.value.filter((row) => {
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchName = row.name?.toLowerCase().includes(q);
      const matchEmail = row.email?.toLowerCase().includes(q);
      const matchAcc =
        row.account_number?.toLowerCase().includes(q) ||
        String(row.account_id ?? "").includes(q);
      const matchOffer = row.offer_name?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchAcc && !matchOffer) return false;
    }
    if (selectedOffer.value !== "ALL") {
      if (String(row.offer_id) !== String(selectedOffer.value)) return false;
    }
    return true;
  });
});

const fetchFollowers = (force = false, page = 1) => {
  if (!fmId) return;
  loading.value = true;

  const isHistory = selectedStatus.value === "past";
  const endpoint = isHistory
    ? urls.fm.followersHistory(fmId)
    : urls.fm.followers(fmId);

  const params = {
    page,
    per_page: pagination.value.per_page,
  };

  // Regular followers endpoint only accepts: active / paused / all
  if (!isHistory) {
    params.status = selectedStatus.value;
  }

  const successHandler = (res) => {
    followers.value = res?.data || [];
    availableOffers.value = res?.filters?.offers || [];
    if (res?.pagination) {
      pagination.value = res.pagination;
    }
    loading.value = false;
  };

  const failureHandler = (err) => {
    loading.value = false;
    snackbar.show(
      err?.error || err?.message || "Failed to load followers.",
      "error",
    );
  };

  apiRequest(urls.KEYS.GET, endpoint, {
    params,
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
  });
};

const fetchOpenPositions = () => {
  const fols = followers.value;
  if (!fols.length || !fmId) return;

  loadingOpenPositions.value = true;
  const ids = fols.map((f) => f.id).slice(0, 500);

  const countsSuccessHandler = (countRes) => {
    const cMap = countRes?.c || {};
    followers.value = fols.map((f) => ({
      ...f,
      open_position_count: Number(cMap[String(f.id)] ?? 0),
    }));
    loadingOpenPositions.value = false;
  };

  const countsFailureHandler = (err) => {
    console.error("Failed to fetch open positions:", err);
    followers.value = fols.map((f) => ({ ...f, open_position_count: 0 }));
    loadingOpenPositions.value = false;
  };

  apiRequest(urls.KEYS.POST, urls.fm.openPositionCounts, {
    data: { fm_id: Number(fmId), follower: ids },
    isTokenRequired: true,
    onSuccess: countsSuccessHandler,
    onFailure: countsFailureHandler,
  });
};

const handlePageChange = (page) => {
  pagination.value.page = page;
  fetchFollowers(true, page);
};

const handlePerPageChange = (payload) => {
  const perPage = payload?.per_page ?? payload;
  pagination.value.per_page = perPage;
  pagination.value.page = 1;
  fetchFollowers(true, 1);
};

onMounted(() => {
  loadFmInfo();
  fetchFollowers();
});
</script>
