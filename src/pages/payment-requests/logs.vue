<template>
  <div
    v-if="
      !hasPermission('payment_requests.platform_view') &&
      !hasPermission('payment_request.platform_view')
    "
  >
    <NoPermissionsState />
  </div>

  <div v-else class="px-4 pb-8 space-y-5">
    <!-- Header & Source Toggle Switcher -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 class="text-lg font-bold text-primary-text flex items-center gap-2">
          <FileText class="w-5 h-5 text-primary" />
          <span>Payment Gateway Data</span>
        </h2>
        <p class="text-xs text-secondary-text mt-0.5">
          Inspect raw gateway webhook logs and payment gateway transaction
          records.
        </p>
      </div>

      <!-- Segmented Source Toggle -->
      <div
        class="inline-flex p-1 bg-card-background border border-primary-border rounded-xl"
      >
        <button
          type="button"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="
            store.source === 'logs'
              ? 'bg-primary text-white shadow-sm'
              : 'text-secondary-text hover:text-primary-text'
          "
          @click="store.setSource('logs')"
        >
          <Code2 class="w-3.5 h-3.5" />
          <span>Webhook & Gateway Logs</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          :class="
            store.source === 'transaction'
              ? 'bg-primary text-white shadow-sm'
              : 'text-secondary-text hover:text-primary-text'
          "
          @click="store.setSource('transaction')"
        >
          <ArrowLeftRight class="w-3.5 h-3.5" />
          <span>Gateway Transactions</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div
      class="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-primary-border bg-card-background/40 p-2 sm:flex-row sm:items-center xl:flex-nowrap flex-wrap"
    >
      <!-- Gateway Filter -->
      <BaseSelect
        v-model="store.filters.gateway"
        :options="gatewayOptions"
        placeholder="All Gateways"
        :allow-all="true"
        all-label="All Gateways"
        class="w-full sm:w-40 xl:w-44"
        @update:modelValue="store.applyFilters()"
      />

      <!-- Search Input -->
      <div class="relative w-full sm:w-52 xl:w-60">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
        />
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Search by keyword..."
          class="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition"
          @input="onSearchInput"
          @keyup.enter="handleSearchImmediate"
        />
      </div>

      <!-- Gateway Transaction ID -->
      <div class="relative w-full sm:w-48 xl:w-52">
        <Hash
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text pointer-events-none"
        />
        <input
          v-model="store.filters.gateway_transaction_id"
          type="text"
          placeholder="Gateway Tx ID..."
          class="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-primary-border bg-card-background text-primary-text placeholder:text-secondary-text focus:outline-hidden focus:border-primary transition"
          @input="onTxIdInput"
          @keyup.enter="handleTxIdImmediate"
        />
      </div>

      <!-- Date Range Picker -->
      <BaseDatePicker
        v-model="dateRangeValue"
        :range="true"
        placeholder="Filter by date range..."
        class="w-full sm:w-60 xl:w-64"
      />

      <!-- Per Page Select -->
      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="store.perPageOptions"
        placeholder="Per page..."
        class="w-full sm:w-28 xl:w-28"
        @update:modelValue="store.updatePerPage"
      />

      <!-- Clear Filters Button -->
      <button
        v-if="hasActiveFilters"
        type="button"
        class="rounded-lg px-3 py-2 text-xs font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors sm:flex-none cursor-pointer"
        @click="handleResetFilters"
      >
        Clear
      </button>

      <!-- Refresh Button -->
      <Tooltip text="Refresh" position="right">
        <button
          type="button"
          :disabled="store.loading"
          class="inline-flex items-center justify-center rounded-lg border border-primary-border p-2 text-secondary-text transition-colors hover:text-primary-text hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer sm:ml-auto"
          @click="store.fetchData(true)"
        >
          <RefreshCw
            class="h-3.5 w-3.5"
            :class="{ 'animate-spin': store.loading }"
          />
        </button>
      </Tooltip>
    </div>

    <!-- VIEW 1: LOGS DATA TABLE (Desktop) -->
    <div v-if="store.source === 'logs'" class="hidden md:block">
      <DataTable
        :data="store.records"
        :columns="logColumns"
        :loading="store.loading"
        :pagination="store.pagination"
        :per-page-options="store.perPageOptions"
        :actions="true"
        :actions-sticky="true"
        :actions-width="110"
        table-key="payment-gateway-logs-table"
        empty-title="No payment gateway logs found"
        empty-text="Try adjusting your gateway or date filters"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- Cell: ID & Date -->
        <template #cell-id="{ row }">
          <div class="space-y-1 whitespace-nowrap">
            <div class="flex items-center gap-1.5">
              <span
                class="inline-block font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text"
              >
                #{{ row.id }}
              </span>
              <Tooltip text="Copy Log ID" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer"
                  @click.stop="copyText(row.id, 'Log ID')"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>
            <p class="text-[11px] text-secondary-text">
              {{ formatDate(row.created_at) }}
            </p>
          </div>
        </template>

        <!-- Cell: Gateway -->
        <template #cell-gateway="{ row }">
          <span
            class="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20 font-mono"
          >
            {{ row.gateway }}
          </span>
        </template>

        <!-- Cell: Direction & Operation -->
        <template #cell-direction_operation="{ row }">
          <div class="space-y-0.5 min-w-36">
            <p class="font-bold text-xs text-primary-text uppercase">
              {{ row.operation || "WEBHOOK" }}
            </p>
            <p class="text-[11px] font-mono text-secondary-text">
              {{ row.direction || "inbound_webhook" }}
            </p>
            <p
              v-if="getLogShopName(row)"
              class="text-[10px] text-secondary-text truncate max-w-40 flex items-center gap-1 mt-0.5"
              :title="`Shop: ${getLogShopName(row)}`"
            >
              <Store class="w-3 h-3 text-secondary-text/70 shrink-0" />
              <span>{{ getLogShopName(row) }}</span>
            </p>
          </div>
        </template>

        <!-- Cell: Method & Endpoint -->
        <template #cell-endpoint="{ row }">
          <div class="space-y-0.5 font-mono text-xs min-w-40">
            <p class="break-all select-all">
              <span class="font-bold text-primary mr-1 text-[11px]">{{ row.http_method }}</span>
              <span class="text-secondary-text text-[11px]">{{ row.endpoint }}</span>
            </p>
            <p
              v-if="getLogTerminalName(row)"
              class="text-[10px] text-secondary-text truncate max-w-44 font-sans"
              :title="`Terminal: ${getLogTerminalName(row)}`"
            >
              Terminal: {{ getLogTerminalName(row) }}
            </p>
            <p
              v-if="getLogCheckoutOptionId(row)"
              class="text-[10px] text-secondary-text"
            >
              Option #{{ getLogCheckoutOptionId(row) }}
            </p>
          </div>
        </template>

        <!-- Cell: Gateway Tx ID -->
        <template #cell-gateway_tx_id="{ row }">
          <div v-if="row.gateway_transaction_id" class="flex items-center gap-1.5 font-mono">
            <span class="font-bold text-xs text-primary-text">
              #{{ row.gateway_transaction_id }}
            </span>
            <Tooltip text="Copy Gateway Tx ID" position="top">
              <button
                type="button"
                class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer"
                @click.stop="copyText(row.gateway_transaction_id, 'Gateway Tx ID')"
              >
                <Copy class="w-3 h-3" />
              </button>
            </Tooltip>
          </div>
          <span v-else class="text-secondary-text font-mono">—</span>
        </template>

        <!-- Cell: Status -->
        <template #cell-status="{ row }">
          <span
            v-if="row.response_status"
            class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border"
            :class="
              row.response_status >= 200 && row.response_status < 300
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            "
          >
            HTTP {{ row.response_status }}
          </span>
          <span v-else class="text-secondary-text font-mono">—</span>
        </template>

        <!-- Cell: Signature -->
        <template #cell-signature="{ row }">
          <span
            v-if="row.signature_valid === true"
            class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 whitespace-nowrap"
          >
            <span>✓ Valid</span>
          </span>
          <span
            v-else-if="row.signature_valid === false"
            class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-500/10 text-red-500 border-red-500/20 whitespace-nowrap"
          >
            <span>✕ Invalid</span>
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 whitespace-nowrap"
          >
            <span>○ Unverified</span>
          </span>
        </template>

        <!-- Cell: Customer / User (Full Details with Dynamic Width and Tooltips) -->
        <template #cell-customer="{ row }">
          <div v-if="getLogCustomer(row) || row.user_id" class="space-y-1 py-0.5 min-w-56 w-full">
            <!-- Line 1: Name & User Reference (No duplication) -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <template v-if="getLogCustomerName(row)">
                <Tooltip :text="`Customer Name: ${getLogCustomerName(row)}`" position="top">
                  <span class="font-bold text-primary-text text-xs cursor-default">
                    {{ getLogCustomerName(row) }}
                  </span>
                </Tooltip>
                <Tooltip
                  v-if="getLogCustomer(row)?.referenceId || row.user_id"
                  :text="`User Reference ID: ${getLogCustomer(row)?.referenceId || row.user_id}`"
                  position="top"
                >
                  <span
                    class="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-background border border-primary-border/60 text-secondary-text cursor-default"
                  >
                    User #{{ getLogCustomer(row)?.referenceId || row.user_id }}
                  </span>
                </Tooltip>
              </template>
              <template v-else-if="getLogCustomer(row)?.referenceId || row.user_id">
                <Tooltip :text="`User ID: ${getLogCustomer(row)?.referenceId || row.user_id}`" position="top">
                  <span class="font-bold font-mono text-primary-text text-xs cursor-default">
                    User #{{ getLogCustomer(row)?.referenceId || row.user_id }}
                  </span>
                </Tooltip>
              </template>
              <span v-else class="text-xs text-secondary-text">Unnamed Customer</span>
            </div>

            <!-- Line 2: Account Badge (Next Line) -->
            <div v-if="row.trading_account_id" class="flex items-center gap-1.5">
              <Tooltip
                :text="`Trading Account ID: ${row.trading_account_id}`"
                position="top"
              >
                <span
                  class="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary/5 text-primary border border-primary/20 cursor-default"
                >
                  Acc #{{ row.trading_account_id }}
                </span>
              </Tooltip>
            </div>

            <!-- Email with Copy & Tooltip -->
            <div
              v-if="getLogCustomer(row)?.email || row.email"
              class="text-[11px] text-secondary-text flex items-center gap-1.5 group/email min-w-0"
            >
              <Mail class="w-3 h-3 text-secondary-text/70 shrink-0" />
              <Tooltip :text="`Email: ${getLogCustomer(row)?.email || row.email}`" position="top">
                <span class="truncate select-all cursor-default block max-w-none">
                  {{ getLogCustomer(row)?.email || row.email }}
                </span>
              </Tooltip>
              <Tooltip text="Copy Email" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary transition cursor-pointer opacity-0 group-hover/email:opacity-100 shrink-0"
                  @click.stop="copyText(getLogCustomer(row)?.email || row.email, 'Customer Email')"
                >
                  <Copy class="w-2.5 h-2.5" />
                </button>
              </Tooltip>
            </div>

            <!-- Phone with Copy & Tooltip -->
            <div
              v-if="getLogCustomer(row)?.phone || row.phone"
              class="text-[11px] text-secondary-text flex items-center gap-1.5 font-mono group/phone min-w-0"
            >
              <Phone class="w-3 h-3 text-secondary-text/70 shrink-0" />
              <Tooltip :text="`Phone: ${getLogCustomer(row)?.phone || row.phone}`" position="top">
                <span class="cursor-default select-all">{{ getLogCustomer(row)?.phone || row.phone }}</span>
              </Tooltip>
              <Tooltip text="Copy Phone" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary transition cursor-pointer opacity-0 group-hover/phone:opacity-100 shrink-0"
                  @click.stop="copyText(getLogCustomer(row)?.phone || row.phone, 'Customer Phone')"
                >
                  <Copy class="w-2.5 h-2.5" />
                </button>
              </Tooltip>
            </div>

            <!-- Location Badges & IP with Tooltips -->
            <div
              v-if="getLogBillingCountry(row) || getLogBillingState(row) || getLogCustomer(row)?.ip"
              class="flex items-center gap-1.5 text-[10px] text-secondary-text font-mono flex-wrap pt-0.5"
            >
              <Tooltip
                v-if="getLogBillingCountry(row)"
                :text="`Country: ${getLogBillingCountry(row)}`"
                position="top"
              >
                <span
                  class="bg-primary/5 text-primary px-1.5 py-0.2 rounded border border-primary/20 font-bold uppercase cursor-default"
                >
                  {{ getLogBillingCountry(row) }}
                </span>
              </Tooltip>
              <Tooltip
                v-if="getLogBillingState(row)"
                :text="`State: ${getLogBillingState(row)}`"
                position="top"
              >
                <span
                  class="bg-background px-1.5 py-0.2 rounded border border-primary-border/40 font-sans cursor-default"
                >
                  State: {{ getLogBillingState(row) }}
                </span>
              </Tooltip>
              <Tooltip
                v-if="getLogCustomer(row)?.ip"
                :text="`IP Address: ${getLogCustomer(row).ip}`"
                position="top"
              >
                <span
                  class="bg-background px-1.5 py-0.2 rounded border border-primary-border/40 truncate cursor-default select-all"
                >
                  IP: {{ getLogCustomer(row).ip }}
                </span>
              </Tooltip>
            </div>
          </div>
          <span v-else class="text-secondary-text font-mono">—</span>
        </template>

        <!-- Cell: Amount & Type -->
        <template #cell-amount_type="{ row }">
          <div class="space-y-1 min-w-32 whitespace-nowrap">
            <p v-if="getLogAmount(row) != null" class="font-mono font-bold text-sm text-primary-text">
              {{ fmt(getLogAmount(row)) }} <span class="text-xs text-secondary-text">{{ getLogCurrency(row) }}</span>
            </p>
            <div v-if="getLogPaymentType(row) || getLogPaymentMethod(row)" class="flex items-center gap-1.5 flex-wrap">
              <span
                v-if="getLogPaymentType(row)"
                class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-background border border-primary-border text-primary-text"
              >
                {{ getLogPaymentType(row) }}
              </span>
              <span v-if="getLogPaymentMethod(row)" class="text-xs font-bold text-primary uppercase">
                {{ getLogPaymentMethod(row) }}
              </span>
            </div>
            <span v-if="getLogAmount(row) == null && !getLogPaymentType(row) && !getLogPaymentMethod(row)" class="text-secondary-text font-mono">—</span>
          </div>
        </template>

        <!-- Cell: Payment & Ref IDs (with Copy button and Tooltip) -->
        <template #cell-payment_ids="{ row }">
          <div class="space-y-1 py-0.5 font-mono text-xs min-w-44 w-full">
            <!-- Gateway Payment ID -->
            <div v-if="getLogGatewayPaymentId(row)" class="flex items-center gap-1.5 min-w-0">
              <Tooltip :text="`Payment ID: ${getLogGatewayPaymentId(row)}`" position="top">
                <span class="text-[10px] text-secondary-text truncate cursor-default block select-all">
                  ID: {{ getLogGatewayPaymentId(row) }}
                </span>
              </Tooltip>
              <Tooltip text="Copy Payment ID" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer shrink-0"
                  @click.stop="copyText(getLogGatewayPaymentId(row), 'Gateway Payment ID')"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>

            <!-- Reference ID -->
            <div v-if="getLogReferenceId(row)" class="flex items-center gap-1.5 min-w-0">
              <Tooltip :text="`Ref ID: ${getLogReferenceId(row)}`" position="top">
                <span class="text-[10px] text-secondary-text truncate cursor-default block select-all">
                  Ref: {{ getLogReferenceId(row) }}
                </span>
              </Tooltip>
              <Tooltip text="Copy Reference ID" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer shrink-0"
                  @click.stop="copyText(getLogReferenceId(row), 'Reference ID')"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>

            <!-- External ID -->
            <div v-if="getLogExternalId(row)" class="flex items-center gap-1.5 text-[10px] text-secondary-text min-w-0">
              <Tooltip :text="`External ID: #${getLogExternalId(row)}`" position="top">
                <span class="truncate cursor-default select-all">
                  Ext: #{{ getLogExternalId(row) }}
                </span>
              </Tooltip>
              <Tooltip text="Copy External ID" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer shrink-0"
                  @click.stop="copyText(getLogExternalId(row), 'External ID')"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>

            <span v-if="!getLogGatewayPaymentId(row) && !getLogReferenceId(row) && !getLogExternalId(row)" class="text-secondary-text font-sans">—</span>
          </div>
        </template>

        <!-- Cell: State & Result -->
        <template #cell-state="{ row }">
          <div v-if="getLogState(row)" class="space-y-1 min-w-32">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span
                class="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                :class="getLogStateClass(getLogState(row))"
              >
                {{ getLogState(row) }}
              </span>
            </div>

            <!-- Error Details -->
            <div v-if="getLogError(row) || getLogErrorCode(row)" class="space-y-0.5">
              <div v-if="getLogErrorCode(row) || getLogExternalResultCode(row)" class="flex items-center gap-1 text-[10px] text-red-500 font-bold">
                <span v-if="getLogErrorCode(row)">[{{ getLogErrorCode(row) }}]</span>
                <span v-if="getLogExternalResultCode(row)" class="bg-red-500/10 px-1 py-0.2 rounded border border-red-500/20 text-[9px] font-medium truncate max-w-28">
                  {{ getLogExternalResultCode(row) }}
                </span>
              </div>
              <p
                v-if="getLogError(row)"
                class="text-[10px] text-red-500 line-clamp-2 max-w-36 leading-tight"
                :title="getLogError(row)"
              >
                {{ getLogError(row) }}
              </p>
            </div>
          </div>
          <span v-else class="text-secondary-text font-mono">—</span>
        </template>

        <!-- Actions Slot -->
        <template #actions="{ row }">
          <div class="flex items-center justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
              title="View Details"
              @click.stop="openDetails(row)"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- VIEW 2: TRANSACTIONS DATA TABLE (Desktop) -->
    <div v-else class="hidden md:block">
      <DataTable
        :data="store.records"
        :columns="transactionColumns"
        :loading="store.loading"
        :pagination="store.pagination"
        :per-page-options="store.perPageOptions"
        :actions="true"
        :actions-sticky="true"
        :actions-width="110"
        table-key="payment-gateway-transactions-table"
        empty-title="No payment gateway transactions found"
        empty-text="Try adjusting your filters or switching to logs"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
      >
        <!-- Cell: ID & Date -->
        <template #cell-id="{ row }">
          <div class="space-y-1 whitespace-nowrap">
            <div class="flex items-center gap-1.5">
              <span
                class="inline-block font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text"
              >
                #{{ row.id }}
              </span>
              <Tooltip text="Copy ID" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer"
                  @click.stop="copyText(row.id, 'ID')"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>
            <p class="text-[11px] text-secondary-text">
              {{ formatDate(row.created_at) }}
            </p>
          </div>
        </template>

        <!-- Cell: Gateway -->
        <template #cell-gateway="{ row }">
          <span
            class="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20 font-mono"
          >
            {{ row.gateway }}
          </span>
        </template>

        <!-- Cell: Customer / User (Full Details with Dynamic Width and Tooltips) -->
        <template #cell-customer="{ row }">
          <div v-if="getLogCustomer(row) || row.user_id" class="space-y-1 py-0.5 min-w-56 w-full">
            <!-- Line 1: Name & User Reference (No duplication) -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <template v-if="getLogCustomerName(row)">
                <Tooltip :text="`Customer Name: ${getLogCustomerName(row)}`" position="top">
                  <span class="font-bold text-primary-text text-xs cursor-default">
                    {{ getLogCustomerName(row) }}
                  </span>
                </Tooltip>
                <Tooltip
                  v-if="getLogCustomer(row)?.referenceId || row.user_id"
                  :text="`User Reference ID: ${getLogCustomer(row)?.referenceId || row.user_id}`"
                  position="top"
                >
                  <span
                    class="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-background border border-primary-border/60 text-secondary-text cursor-default"
                  >
                    User #{{ getLogCustomer(row)?.referenceId || row.user_id }}
                  </span>
                </Tooltip>
              </template>
              <template v-else-if="getLogCustomer(row)?.referenceId || row.user_id">
                <Tooltip :text="`User ID: ${getLogCustomer(row)?.referenceId || row.user_id}`" position="top">
                  <span class="font-bold font-mono text-primary-text text-xs cursor-default">
                    User #{{ getLogCustomer(row)?.referenceId || row.user_id }}
                  </span>
                </Tooltip>
              </template>
              <span v-else class="text-xs text-secondary-text">Unnamed Customer</span>
            </div>

            <!-- Line 2: Account Badge (Next Line) -->
            <div v-if="row.trading_account_id" class="flex items-center gap-1.5">
              <Tooltip
                :text="`Trading Account ID: ${row.trading_account_id}`"
                position="top"
              >
                <span
                  class="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-primary/5 text-primary border border-primary/20 cursor-default"
                >
                  Acc #{{ row.trading_account_id }}
                </span>
              </Tooltip>
            </div>

            <!-- Email with Copy & Tooltip -->
            <div
              v-if="getLogCustomer(row)?.email || row.email"
              class="text-[11px] text-secondary-text flex items-center gap-1.5 group/email min-w-0"
            >
              <Mail class="w-3 h-3 text-secondary-text/70 shrink-0" />
              <Tooltip :text="`Email: ${getLogCustomer(row)?.email || row.email}`" position="top">
                <span class="truncate select-all cursor-default block max-w-none">
                  {{ getLogCustomer(row)?.email || row.email }}
                </span>
              </Tooltip>
              <Tooltip text="Copy Email" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary transition cursor-pointer opacity-0 group-hover/email:opacity-100 shrink-0"
                  @click.stop="copyText(getLogCustomer(row)?.email || row.email, 'Customer Email')"
                >
                  <Copy class="w-2.5 h-2.5" />
                </button>
              </Tooltip>
            </div>

            <!-- Phone with Copy & Tooltip -->
            <div
              v-if="getLogCustomer(row)?.phone || row.phone"
              class="text-[11px] text-secondary-text flex items-center gap-1.5 font-mono group/phone min-w-0"
            >
              <Phone class="w-3 h-3 text-secondary-text/70 shrink-0" />
              <Tooltip :text="`Phone: ${getLogCustomer(row)?.phone || row.phone}`" position="top">
                <span class="cursor-default select-all">{{ getLogCustomer(row)?.phone || row.phone }}</span>
              </Tooltip>
              <Tooltip text="Copy Phone" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary transition cursor-pointer opacity-0 group-hover/phone:opacity-100 shrink-0"
                  @click.stop="copyText(getLogCustomer(row)?.phone || row.phone, 'Customer Phone')"
                >
                  <Copy class="w-2.5 h-2.5" />
                </button>
              </Tooltip>
            </div>

            <!-- Location Badges & IP with Tooltips -->
            <div
              v-if="getLogBillingCountry(row) || getLogBillingState(row) || getLogCustomer(row)?.ip"
              class="flex items-center gap-1.5 text-[10px] text-secondary-text font-mono flex-wrap pt-0.5"
            >
              <Tooltip
                v-if="getLogBillingCountry(row)"
                :text="`Country: ${getLogBillingCountry(row)}`"
                position="top"
              >
                <span
                  class="bg-primary/5 text-primary px-1.5 py-0.2 rounded border border-primary/20 font-bold uppercase cursor-default"
                >
                  {{ getLogBillingCountry(row) }}
                </span>
              </Tooltip>
              <Tooltip
                v-if="getLogBillingState(row)"
                :text="`State: ${getLogBillingState(row)}`"
                position="top"
              >
                <span
                  class="bg-background px-1.5 py-0.2 rounded border border-primary-border/40 font-sans cursor-default"
                >
                  State: {{ getLogBillingState(row) }}
                </span>
              </Tooltip>
              <Tooltip
                v-if="getLogCustomer(row)?.ip"
                :text="`IP Address: ${getLogCustomer(row).ip}`"
                position="top"
              >
                <span
                  class="bg-background px-1.5 py-0.2 rounded border border-primary-border/40 truncate cursor-default select-all"
                >
                  IP: {{ getLogCustomer(row).ip }}
                </span>
              </Tooltip>
            </div>
          </div>
          <span v-else class="text-secondary-text font-mono">—</span>
        </template>

        <!-- Cell: Amount & Type -->
        <template #cell-amount_type="{ row }">
          <div class="space-y-1 min-w-32 whitespace-nowrap">
            <p v-if="row.amount != null || getLogAmount(row) != null" class="font-mono font-bold text-sm text-primary-text">
              {{ fmt(row.amount ?? getLogAmount(row)) }} <span class="text-xs text-secondary-text">{{ row.currency || getLogCurrency(row) }}</span>
            </p>
            <p
              v-if="row.customer_amount && row.customer_amount !== row.amount"
              class="font-mono text-[10px] text-secondary-text"
            >
              ({{ fmt(row.customer_amount) }} {{ row.customer_currency }})
            </p>
            <div v-if="row.payment_type || getLogPaymentType(row) || row.payment_method || getLogPaymentMethod(row)" class="flex items-center gap-1.5 flex-wrap">
              <span
                v-if="row.payment_type || getLogPaymentType(row)"
                class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-background border border-primary-border text-primary-text"
              >
                {{ row.payment_type || getLogPaymentType(row) }}
              </span>
              <span v-if="row.payment_method || getLogPaymentMethod(row)" class="text-xs font-bold text-primary uppercase">
                {{ row.payment_method || getLogPaymentMethod(row) }}
              </span>
            </div>
          </div>
        </template>

        <!-- Cell: Payment & Ref IDs (with Copy button and Tooltip) -->
        <template #cell-payment_ids="{ row }">
          <div class="space-y-1 py-0.5 font-mono text-xs min-w-44 w-full">
            <!-- Payment Request ID -->
            <div v-if="row.payment_request_id" class="flex items-center gap-1.5 min-w-0">
              <span class="font-bold text-xs text-primary-text">Req #{{ row.payment_request_id }}</span>
              <Tooltip text="Copy Payment Request ID" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer shrink-0"
                  @click.stop="copyText(row.payment_request_id, 'Payment Request ID')"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>

            <!-- Gateway Payment ID -->
            <div v-if="row.gateway_payment_id || getLogGatewayPaymentId(row)" class="flex items-center gap-1.5 min-w-0">
              <Tooltip :text="`Payment ID: ${row.gateway_payment_id || getLogGatewayPaymentId(row)}`" position="top">
                <span class="text-[10px] text-secondary-text truncate cursor-default block select-all">
                  ID: {{ row.gateway_payment_id || getLogGatewayPaymentId(row) }}
                </span>
              </Tooltip>
              <Tooltip text="Copy Payment ID" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer shrink-0"
                  @click.stop="copyText(row.gateway_payment_id || getLogGatewayPaymentId(row), 'Gateway Payment ID')"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>

            <!-- Reference ID -->
            <div v-if="row.reference_id || getLogReferenceId(row)" class="flex items-center gap-1.5 min-w-0">
              <Tooltip :text="`Ref ID: ${row.reference_id || getLogReferenceId(row)}`" position="top">
                <span class="text-[10px] text-secondary-text truncate cursor-default block select-all">
                  Ref: {{ row.reference_id || getLogReferenceId(row) }}
                </span>
              </Tooltip>
              <Tooltip text="Copy Reference ID" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer shrink-0"
                  @click.stop="copyText(row.reference_id || getLogReferenceId(row), 'Reference ID')"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>

            <!-- External ID -->
            <div v-if="getLogExternalId(row)" class="flex items-center gap-1.5 text-[10px] text-secondary-text min-w-0">
              <Tooltip :text="`External ID: #${getLogExternalId(row)}`" position="top">
                <span class="truncate cursor-default select-all">
                  Ext: #{{ getLogExternalId(row) }}
                </span>
              </Tooltip>
              <Tooltip text="Copy External ID" position="top">
                <button
                  type="button"
                  class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer shrink-0"
                  @click.stop="copyText(getLogExternalId(row), 'External ID')"
                >
                  <Copy class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>

            <span v-if="!row.payment_request_id && !row.gateway_payment_id && !getLogGatewayPaymentId(row) && !row.reference_id && !getLogReferenceId(row) && !getLogExternalId(row)" class="text-secondary-text font-sans">—</span>
          </div>
        </template>

        <!-- Cell: State & Result -->
        <template #cell-state="{ row }">
          <div class="space-y-1 min-w-32">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span
                class="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                :class="getTransactionStateClass(row.state || getLogState(row))"
              >
                {{ row.state || getLogState(row) || "PENDING" }}
              </span>

              <!-- Funds Applied Badge -->
              <span
                v-if="row.funds_applied !== undefined"
                class="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded border"
                :class="row.funds_applied ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary-text/10 text-secondary-text border-primary-border'"
                :title="row.funds_applied ? 'Funds Applied to Balance' : 'Funds Not Applied'"
              >
                {{ row.funds_applied ? 'Funds Applied' : 'Not Applied' }}
              </span>
            </div>

            <!-- Error Details -->
            <div v-if="row.error_message || row.error_code || getLogError(row) || getLogErrorCode(row)" class="space-y-0.5">
              <div v-if="row.error_code || getLogErrorCode(row) || getLogExternalResultCode(row)" class="flex items-center gap-1 text-[10px] text-red-500 font-bold">
                <span v-if="row.error_code || getLogErrorCode(row)">[{{ row.error_code || getLogErrorCode(row) }}]</span>
                <span v-if="getLogExternalResultCode(row)" class="bg-red-500/10 px-1 py-0.2 rounded border border-red-500/20 text-[9px] font-medium truncate max-w-28">
                  {{ getLogExternalResultCode(row) }}
                </span>
              </div>
              <p
                v-if="row.error_message || getLogError(row)"
                class="text-[10px] text-red-500 line-clamp-2 max-w-36 leading-tight"
                :title="row.error_message || getLogError(row)"
              >
                {{ row.error_message || getLogError(row) }}
              </p>
            </div>
          </div>
        </template>

        <!-- Cell: Direction & Operation -->
        <template #cell-direction_operation="{ row }">
          <div class="space-y-0.5 min-w-36">
            <p class="font-bold text-xs text-primary-text uppercase">
              {{ row.operation || "TRANSACTION" }}
            </p>
            <p v-if="row.direction" class="text-[11px] font-mono text-secondary-text">
              {{ row.direction }}
            </p>
            <p
              v-if="getLogShopName(row)"
              class="text-[10px] text-secondary-text truncate max-w-40 flex items-center gap-1 mt-0.5"
              :title="`Shop: ${getLogShopName(row)}`"
            >
              <Store class="w-3 h-3 text-secondary-text/70 shrink-0" />
              <span>{{ getLogShopName(row) }}</span>
            </p>
          </div>
        </template>

        <!-- Cell: Method & Endpoint -->
        <template #cell-endpoint="{ row }">
          <div class="space-y-0.5 font-mono text-xs min-w-40">
            <p v-if="row.http_method || row.endpoint" class="break-all select-all">
              <span v-if="row.http_method" class="font-bold text-primary mr-1 text-[11px]">{{ row.http_method }}</span>
              <span v-if="row.endpoint" class="text-secondary-text text-[11px]">{{ row.endpoint }}</span>
            </p>
            <p
              v-if="getLogTerminalName(row)"
              class="text-[10px] text-secondary-text truncate max-w-44 font-sans"
              :title="`Terminal: ${getLogTerminalName(row)}`"
            >
              Terminal: {{ getLogTerminalName(row) }}
            </p>
            <p
              v-if="getLogCheckoutOptionId(row)"
              class="text-[10px] text-secondary-text"
            >
              Option #{{ getLogCheckoutOptionId(row) }}
            </p>
            <span v-if="!row.http_method && !row.endpoint && !getLogTerminalName(row) && !getLogCheckoutOptionId(row)" class="text-secondary-text font-sans">—</span>
          </div>
        </template>

        <!-- Cell: Gateway Tx ID -->
        <template #cell-gateway_tx_id="{ row }">
          <div v-if="row.gateway_transaction_id || row.id" class="flex items-center gap-1.5 font-mono">
            <span class="font-bold text-xs text-primary-text">
              #{{ row.gateway_transaction_id || row.id }}
            </span>
            <Tooltip text="Copy Gateway Tx ID" position="top">
              <button
                type="button"
                class="p-0.5 rounded text-secondary-text hover:text-primary hover:bg-background transition cursor-pointer"
                @click.stop="copyText(row.gateway_transaction_id || row.id, 'Gateway Tx ID')"
              >
                <Copy class="w-3 h-3" />
              </button>
            </Tooltip>
          </div>
          <span v-else class="text-secondary-text font-mono">—</span>
        </template>

        <!-- Cell: Status -->
        <template #cell-status="{ row }">
          <span
            v-if="row.response_status || row.internal_status"
            class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border"
            :class="
              (row.response_status >= 200 && row.response_status < 300) || row.internal_status === 'success' || row.internal_status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            "
          >
            {{ row.response_status ? `HTTP ${row.response_status}` : row.internal_status }}
          </span>
          <span v-else class="text-secondary-text font-mono">—</span>
        </template>

        <!-- Cell: Signature -->
        <template #cell-signature="{ row }">
          <span
            v-if="row.signature_valid === true"
            class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 whitespace-nowrap"
          >
            <span>✓ Valid</span>
          </span>
          <span
            v-else-if="row.signature_valid === false"
            class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-500/10 text-red-500 border-red-500/20 whitespace-nowrap"
          >
            <span>✕ Invalid</span>
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 whitespace-nowrap"
          >
            <span>○ Unverified</span>
          </span>
        </template>

        <!-- Actions Slot -->
        <template #actions="{ row }">
          <div class="flex items-center justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
              title="View Details"
              @click.stop="openDetails(row)"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- MOBILE CARDS (Mobile view) -->
    <div class="md:hidden space-y-3">
      <!-- Loading Skeleton -->
      <template v-if="store.loading">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-card-background border border-primary-border rounded-xl p-4 animate-pulse space-y-3"
        >
          <div class="flex justify-between items-center">
            <div class="h-3 w-20 bg-background rounded" />
            <div class="h-5 w-16 bg-background rounded-full" />
          </div>
          <div class="space-y-1.5">
            <div class="h-3 w-full bg-background rounded" />
            <div class="h-2.5 w-2/3 bg-background rounded" />
          </div>
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="store.records.length === 0" class="py-16 text-center">
        <p class="text-sm font-medium text-primary-text">No records found</p>
        <p class="text-xs text-secondary-text mt-1">
          Try adjusting your filters
        </p>
      </div>

      <!-- Log Mobile Cards -->
      <template v-else-if="store.source === 'logs'">
        <div
          v-for="log in store.records"
          :key="log.id"
          class="bg-card-background border border-primary-border rounded-xl p-4 space-y-3 text-xs"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span
                  class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text"
                >
                  #{{ log.id }}
                </span>
                <span
                  class="font-bold uppercase text-primary text-[10px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20"
                >
                  {{ log.gateway }}
                </span>
                <span
                  v-if="getLogState(log)"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                  :class="getLogStateClass(getLogState(log))"
                >
                  {{ getLogState(log) }}
                </span>
              </div>
              <p class="text-[11px] text-secondary-text mt-1">
                {{ formatDate(log.created_at) }}
              </p>
            </div>
          </div>

          <!-- Customer Full Details -->
          <div v-if="getLogCustomer(log)" class="bg-background/40 rounded-lg p-2.5 space-y-1">
            <span class="text-[10px] uppercase font-bold text-secondary-text block">Customer Details</span>
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-primary-text">{{ getLogCustomerName(log) || 'Unnamed' }}</span>
              <span v-if="getLogCustomer(log)?.referenceId" class="font-mono text-[10px] text-secondary-text">User #{{ getLogCustomer(log).referenceId }}</span>
            </div>
            <p v-if="getLogCustomer(log)?.email" class="text-[11px] text-secondary-text flex items-center gap-1">
              <Mail class="w-3 h-3 shrink-0" />
              <span class="truncate">{{ getLogCustomer(log).email }}</span>
            </p>
            <p v-if="getLogCustomer(log)?.phone" class="text-[11px] text-secondary-text flex items-center gap-1 font-mono">
              <Phone class="w-3 h-3 shrink-0" />
              <span>{{ getLogCustomer(log).phone }}</span>
            </p>
            <div v-if="getLogCustomer(log)?.ip || getLogCustomer(log)?.citizenshipCountryCode" class="flex items-center gap-1.5 text-[10px] text-secondary-text font-mono mt-0.5">
              <span v-if="getLogCustomer(log)?.ip">IP: {{ getLogCustomer(log).ip }}</span>
              <span v-if="getLogCustomer(log)?.citizenshipCountryCode" class="font-bold text-primary">({{ getLogCustomer(log).citizenshipCountryCode }})</span>
            </div>
          </div>

          <!-- Amount, Type, Operation Grid -->
          <div class="grid grid-cols-2 gap-2 bg-background/30 rounded-lg p-2.5">
            <div>
              <span class="text-[10px] text-secondary-text block">Amount</span>
              <p
                v-if="getLogAmount(log) != null"
                class="font-mono font-bold text-primary-text"
              >
                {{ fmt(getLogAmount(log)) }} {{ getLogCurrency(log) }}
              </p>
              <span v-else class="text-secondary-text">—</span>
            </div>
            <div>
              <span class="text-[10px] text-secondary-text block">Type & Method</span>
              <p class="font-bold text-primary-text uppercase">
                {{ getLogPaymentType(log) || log.operation || "—" }}
                <span
                  v-if="getLogPaymentMethod(log)"
                  class="text-primary text-[10px]"
                >
                  ({{ getLogPaymentMethod(log) }})
                </span>
              </p>
            </div>
            <div class="col-span-2">
              <span class="text-[10px] text-secondary-text block">Operation / Dir</span>
              <p class="text-primary-text">
                {{ log.operation || "WEBHOOK" }}
                <span class="text-[10px] text-secondary-text inline-block ml-1">({{ log.direction || "inbound" }})</span>
              </p>
            </div>
          </div>

          <!-- Method & Endpoint & IDs -->
          <div
            class="bg-background/30 rounded-lg p-2.5 space-y-1.5 font-mono text-[11px]"
          >
            <p class="break-all">
              <span class="font-bold text-primary">{{ log.http_method }}</span>
              {{ log.endpoint }}
            </p>
            <div
              v-if="log.gateway_transaction_id || getLogReferenceId(log) || getLogGatewayPaymentId(log)"
              class="text-secondary-text text-[10px] space-y-1"
            >
              <div v-if="log.gateway_transaction_id" class="flex items-center justify-between">
                <span>Tx ID: #{{ log.gateway_transaction_id }}</span>
                <button type="button" class="text-primary hover:underline cursor-pointer" @click="copyText(log.gateway_transaction_id, 'Gateway Tx ID')">Copy Tx</button>
              </div>
              <div v-if="getLogGatewayPaymentId(log)" class="flex items-center justify-between gap-1">
                <span class="truncate">Payment ID: {{ getLogGatewayPaymentId(log) }}</span>
                <button type="button" class="text-primary hover:underline shrink-0 cursor-pointer" @click="copyText(getLogGatewayPaymentId(log), 'Gateway Payment ID')">Copy ID</button>
              </div>
              <div v-if="getLogReferenceId(log)" class="flex items-center justify-between gap-1">
                <span class="truncate">Ref: {{ getLogReferenceId(log) }}</span>
                <button type="button" class="text-primary hover:underline shrink-0 cursor-pointer" @click="copyText(getLogReferenceId(log), 'Reference ID')">Copy Ref</button>
              </div>
            </div>
            <p
              v-if="getLogError(log)"
              class="text-red-500 text-[10px] font-sans"
            >
              Error: {{ getLogError(log) }}
            </p>
          </div>

          <button
            type="button"
            class="w-full text-center py-2 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
            @click="openDetails(log)"
          >
            View Details
          </button>
        </div>
      </template>

      <!-- Transaction Mobile Cards -->
      <template v-else>
        <div
          v-for="tx in store.records"
          :key="tx.id"
          class="bg-card-background border border-primary-border rounded-xl p-4 space-y-3 text-xs"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span
                  class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-background border border-primary-border/60 text-primary-text"
                >
                  #{{ tx.id }}
                </span>
                <span
                  v-if="tx.gateway"
                  class="font-bold uppercase text-primary text-[10px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20"
                >
                  {{ tx.gateway }}
                </span>
                <span
                  v-if="getLogState(tx) || tx.state"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                  :class="getTransactionStateClass(getLogState(tx) || tx.state)"
                >
                  {{ getLogState(tx) || tx.state }}
                </span>
                <span
                  v-if="tx.funds_applied !== undefined"
                  class="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                  :class="tx.funds_applied ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary-text/10 text-secondary-text border-primary-border'"
                >
                  {{ tx.funds_applied ? 'Funds Applied' : 'Not Applied' }}
                </span>
              </div>
              <p class="text-[11px] text-secondary-text mt-1">
                {{ formatDate(tx.created_at) }}
              </p>
            </div>
          </div>

          <!-- Customer Full Details -->
          <div v-if="getLogCustomer(tx) || tx.user_id" class="bg-background/40 rounded-lg p-2.5 space-y-1">
            <span class="text-[10px] uppercase font-bold text-secondary-text block">Customer Details</span>
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-primary-text">{{ getLogCustomerName(tx) || (tx.user_id ? `User #${tx.user_id}` : 'Unnamed') }}</span>
              <span v-if="getLogCustomer(tx)?.referenceId || tx.user_id" class="font-mono text-[10px] text-secondary-text">User #{{ getLogCustomer(tx)?.referenceId || tx.user_id }}</span>
            </div>
            <p v-if="getLogCustomer(tx)?.email || tx.email" class="text-[11px] text-secondary-text flex items-center gap-1">
              <Mail class="w-3 h-3 shrink-0" />
              <span class="truncate">{{ getLogCustomer(tx)?.email || tx.email }}</span>
            </p>
            <p v-if="getLogCustomer(tx)?.phone || tx.phone" class="text-[11px] text-secondary-text flex items-center gap-1 font-mono">
              <Phone class="w-3 h-3 shrink-0" />
              <span>{{ getLogCustomer(tx)?.phone || tx.phone }}</span>
            </p>
            <div v-if="getLogBillingCountry(tx) || getLogCustomer(tx)?.ip" class="flex items-center gap-1.5 text-[10px] text-secondary-text font-mono mt-0.5">
              <span v-if="getLogCustomer(tx)?.ip">IP: {{ getLogCustomer(tx).ip }}</span>
              <span v-if="getLogBillingCountry(tx)" class="font-bold text-primary">({{ getLogBillingCountry(tx) }})</span>
            </div>
          </div>

          <!-- Amount, Type, Operation Grid -->
          <div class="grid grid-cols-2 gap-2 bg-background/30 rounded-lg p-2.5">
            <div>
              <span class="text-[10px] text-secondary-text block">Amount</span>
              <p
                v-if="getLogAmount(tx) != null || tx.amount != null"
                class="font-mono font-bold text-primary-text"
              >
                {{ fmt(getLogAmount(tx) ?? tx.amount) }} {{ getLogCurrency(tx) || tx.currency }}
              </p>
              <span v-else class="text-secondary-text">—</span>
            </div>
            <div>
              <span class="text-[10px] text-secondary-text block">Type & Method</span>
              <p class="font-bold text-primary-text uppercase">
                {{ getLogPaymentType(tx) || tx.payment_type || tx.operation || "—" }}
                <span
                  v-if="getLogPaymentMethod(tx) || tx.payment_method"
                  class="text-primary text-[10px]"
                >
                  ({{ getLogPaymentMethod(tx) || tx.payment_method }})
                </span>
              </p>
            </div>
            <div v-if="tx.payment_request_id || tx.trading_account_id">
              <span class="text-[10px] text-secondary-text block">Request / Account</span>
              <p class="font-mono text-primary-text">
                {{ tx.payment_request_id ? `Req #${tx.payment_request_id}` : '' }}
                {{ tx.trading_account_id ? `Acc #${tx.trading_account_id}` : '' }}
              </p>
            </div>
            <div :class="{ 'col-span-2': !tx.payment_request_id && !tx.trading_account_id }">
              <span class="text-[10px] text-secondary-text block">Operation / Dir</span>
              <p class="text-primary-text">
                {{ tx.operation || "TRANSACTION" }}
                <span v-if="tx.direction" class="text-[10px] text-secondary-text inline-block ml-1">({{ tx.direction }})</span>
              </p>
            </div>
          </div>

          <!-- Method & Endpoint & IDs -->
          <div
            v-if="tx.endpoint || tx.gateway_transaction_id || getLogReferenceId(tx) || getLogGatewayPaymentId(tx) || getLogExternalId(tx)"
            class="bg-background/30 rounded-lg p-2.5 space-y-1.5 font-mono text-[11px]"
          >
            <p v-if="tx.endpoint" class="break-all">
              <span v-if="tx.http_method" class="font-bold text-primary mr-1">{{ tx.http_method }}</span>
              {{ tx.endpoint }}
            </p>
            <div class="text-secondary-text text-[10px] space-y-1">
              <div v-if="tx.gateway_transaction_id || tx.id" class="flex items-center justify-between">
                <span>Tx ID: #{{ tx.gateway_transaction_id || tx.id }}</span>
                <button type="button" class="text-primary hover:underline cursor-pointer" @click="copyText(tx.gateway_transaction_id || tx.id, 'Gateway Tx ID')">Copy Tx</button>
              </div>
              <div v-if="getLogGatewayPaymentId(tx) || tx.gateway_payment_id" class="flex items-center justify-between gap-1">
                <span class="truncate">Payment ID: {{ getLogGatewayPaymentId(tx) || tx.gateway_payment_id }}</span>
                <button type="button" class="text-primary hover:underline shrink-0 cursor-pointer" @click="copyText(getLogGatewayPaymentId(tx) || tx.gateway_payment_id, 'Gateway Payment ID')">Copy ID</button>
              </div>
              <div v-if="getLogReferenceId(tx) || tx.reference_id" class="flex items-center justify-between gap-1">
                <span class="truncate">Ref: {{ getLogReferenceId(tx) || tx.reference_id }}</span>
                <button type="button" class="text-primary hover:underline shrink-0 cursor-pointer" @click="copyText(getLogReferenceId(tx) || tx.reference_id, 'Reference ID')">Copy Ref</button>
              </div>
              <div v-if="getLogExternalId(tx)" class="flex items-center justify-between gap-1">
                <span class="truncate">Ext: #{{ getLogExternalId(tx) }}</span>
                <button type="button" class="text-primary hover:underline shrink-0 cursor-pointer" @click="copyText(getLogExternalId(tx), 'External ID')">Copy Ext</button>
              </div>
            </div>
            <p
              v-if="getLogError(tx) || tx.error_message"
              class="text-red-500 text-[10px] font-sans"
            >
              Error: {{ getLogError(tx) || tx.error_message }}
            </p>
          </div>

          <button
            type="button"
            class="w-full text-center py-2 text-xs font-semibold text-primary rounded-lg bg-primary/10 hover:bg-primary/20 transition cursor-pointer"
            @click="openDetails(tx)"
          >
            View Details
          </button>
        </div>
      </template>

      <!-- Mobile Pagination -->
      <div class="mt-4">
        <Pagination
          v-if="store.pagination.total_items > store.pagination.per_page"
          :pagination="store.pagination"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Detail Drawer -->
    <PaymentGatewayDetailDrawer
      :open="detailOpen"
      :item="selectedItem || {}"
      :source="store.source"
      @close="closeDetails"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import {
  FileText,
  Code2,
  ArrowLeftRight,
  Search,
  Hash,
  RefreshCw,
  Eye,
  Copy,
  Mail,
  Phone,
  Store,
  ExternalLink,
} from "lucide-vue-next";
import { usePaymentGatewayLogsStore } from "@/stores/paymentGatewayLogs/paymentGatewayLogs";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import Pagination from "@/components/common/Pagination.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import NoPermissionsState from "@/components/common/NoPermissionsState.vue";
import PaymentGatewayDetailDrawer from "@/components/paymentGatewayLogs/PaymentGatewayDetailDrawer.vue";
import { formatDate } from "@/utils/timeFormatter";

const store = usePaymentGatewayLogsStore();
const snackbar = useSnackbarStore();
const { hasPermission } = usePermissionCheck();

const detailOpen = ref(false);
const selectedItem = ref(null);

let searchDebounceTimer = null;
let txIdDebounceTimer = null;

const onSearchInput = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    store.applyFilters();
  }, 350);
};

const handleSearchImmediate = () => {
  clearTimeout(searchDebounceTimer);
  store.applyFilters();
};

const onTxIdInput = () => {
  clearTimeout(txIdDebounceTimer);
  txIdDebounceTimer = setTimeout(() => {
    store.applyFilters();
  }, 350);
};

const handleTxIdImmediate = () => {
  clearTimeout(txIdDebounceTimer);
  store.applyFilters();
};

const handleResetFilters = () => {
  clearTimeout(searchDebounceTimer);
  clearTimeout(txIdDebounceTimer);
  store.resetFilters();
};

const gatewayOptions = [
  { label: "Coinsbuy", value: "coinsbuy" },
  { label: "Paymaxis", value: "paymaxis" },
];

const logColumns = [
  { key: "id", label: "LOG ID & DATE", sortable: false, minWidth: 160 },
  { key: "gateway", label: "GATEWAY", sortable: false, minWidth: 110 },
  { key: "customer", label: "CUSTOMER / USER", sortable: false, minWidth: 240 },
  { key: "amount_type", label: "AMOUNT & TYPE", sortable: false, minWidth: 140 },
  { key: "payment_ids", label: "PAYMENT & REF IDS", sortable: false, minWidth: 180 },
  { key: "state", label: "STATE / RESULT", sortable: false, minWidth: 140 },
  { key: "direction_operation", label: "DIRECTION & OPERATION", sortable: false, minWidth: 160 },
  { key: "endpoint", label: "METHOD & ENDPOINT", sortable: false, minWidth: 180 },
  { key: "gateway_tx_id", label: "GATEWAY TX ID", sortable: false, minWidth: 130 },
  { key: "status", label: "STATUS", sortable: false, minWidth: 100 },
  { key: "signature", label: "SIGNATURE", sortable: false, minWidth: 110 },
];

const transactionColumns = [
  { key: "id", label: "LOG ID & DATE", sortable: false, minWidth: 160 },
  { key: "gateway", label: "GATEWAY", sortable: false, minWidth: 110 },
  { key: "customer", label: "CUSTOMER / USER", sortable: false, minWidth: 240 },
  { key: "amount_type", label: "AMOUNT & TYPE", sortable: false, minWidth: 140 },
  { key: "payment_ids", label: "PAYMENT & REF IDS", sortable: false, minWidth: 180 },
  { key: "state", label: "STATE / RESULT", sortable: false, minWidth: 140 },
  { key: "direction_operation", label: "DIRECTION & OPERATION", sortable: false, minWidth: 160 },
  { key: "endpoint", label: "METHOD & ENDPOINT", sortable: false, minWidth: 180 },
  { key: "gateway_tx_id", label: "GATEWAY TX ID", sortable: false, minWidth: 130 },
  { key: "status", label: "STATUS", sortable: false, minWidth: 100 },
  { key: "signature", label: "SIGNATURE", sortable: false, minWidth: 110 },
];

const hasActiveFilters = computed(() => {
  return (
    store.filters.gateway ||
    store.filters.gateway_transaction_id ||
    store.filters.search ||
    store.filters.from_date ||
    store.filters.to_date
  );
});

// Date Range Computed Wrapper for BaseDatePicker
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
    if (!val) {
      store.filters.from_date = "";
      store.filters.to_date = "";
    } else if (Array.isArray(val)) {
      store.filters.from_date = val[0] || "";
      store.filters.to_date = val[1] || "";
    } else if (typeof val === "object") {
      store.filters.from_date = val.start || val.from || "";
      store.filters.to_date = val.end || val.to || "";
    }
    store.applyFilters();
  },
});

const fmt = (v) =>
  Number(v ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const parsePayload = (val) => {
  if (!val) return null;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return null;
};

const getLogReqBody = (log) => parsePayload(log?.request_body);
const getLogResBody = (log) => parsePayload(log?.response_body);
const getLogResResult = (log) => {
  const resBody = getLogResBody(log);
  return resBody?.result || resBody || null;
};

const getLogCustomer = (log) => {
  if (log?.customer) return log.customer;
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.customer || res?.customer || null;
};

const getLogCustomerName = (log) => {
  const c = getLogCustomer(log);
  if (c) {
    if (c.accountName) return c.accountName;
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ");
    if (name) return name;
  }
  if (log?.customer_name) return log.customer_name;
  if (log?.user_name) return log.user_name;
  return null;
};

const getLogBillingCountry = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  const c = getLogCustomer(log);
  return (
    req?.billingAddress?.countryCode ||
    res?.billingAddress?.countryCode ||
    c?.citizenshipCountryCode ||
    log?.country ||
    log?.billing_country ||
    null
  );
};

const getLogBillingState = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return (
    req?.billingAddress?.state ||
    res?.billingAddress?.state ||
    log?.state_name ||
    log?.billing_state ||
    null
  );
};

const getLogAmount = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  const amount = req?.amount ?? res?.amount ?? log?.amount;
  return amount != null ? amount : null;
};

const getLogCurrency = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.currency || res?.currency || log?.currency || "";
};

const getLogPaymentMethod = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.paymentMethod || res?.paymentMethod || log?.payment_method || null;
};

const getLogPaymentType = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.paymentType || res?.paymentType || log?.payment_type || null;
};

const getLogShopName = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.shopName || res?.shopName || log?.shop_name || null;
};

const getLogTerminalName = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.terminalName || res?.terminalName || log?.terminal_name || null;
};

const getLogCheckoutOptionId = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return (
    req?.externalRefs?.checkoutOptionId ||
    res?.externalRefs?.checkoutOptionId ||
    log?.checkout_option_id ||
    null
  );
};

const getLogGatewayPaymentId = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.id || res?.id || log?.gateway_payment_id || null;
};

const getLogReferenceId = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return (
    req?.referenceId ||
    res?.referenceId ||
    log?.reference_id ||
    log?.correlation_id ||
    null
  );
};

const getLogExternalId = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return (
    req?.externalId ||
    req?.externalRefs?.id ||
    res?.externalId ||
    res?.externalRefs?.id ||
    log?.external_id ||
    null
  );
};

const getLogState = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.state || res?.state || log?.state || null;
};

const getLogError = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return (
    req?.errorMessage ||
    req?.externalResultCode ||
    res?.errorMessage ||
    res?.message ||
    log?.error_message ||
    null
  );
};

const getLogErrorCode = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.errorCode || res?.errorCode || log?.error_code || null;
};

const getLogExternalResultCode = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return req?.externalResultCode || res?.externalResultCode || null;
};

const getLogRedirectUrl = (log) => {
  const req = getLogReqBody(log);
  const res = getLogResResult(log);
  return res?.redirectUrl || req?.redirectUrl || log?.redirect_url || null;
};

const copyText = (text, label = "Text") => {
  if (!text) return;
  navigator.clipboard.writeText(String(text));
  snackbar.show(`${label} copied to clipboard`, "success");
};

const getLogStateClass = (state) => {
  const s = (state || "").toUpperCase();
  if (s === "COMPLETED" || s === "SUCCESS") {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }
  if (s === "DECLINED" || s === "FAILED" || s === "REJECTED" || s === "ERROR") {
    return "bg-red-500/10 text-red-500 border-red-500/20";
  }
  if (s === "CHECKOUT" || s === "PENDING" || s === "PROCESSING") {
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }
  return "bg-primary/10 text-primary border-primary/20";
};

const getTransactionStateClass = (state) => {
  const s = (state || "").toUpperCase();
  if (s === "COMPLETED" || s === "SUCCESS") {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }
  if (s === "FAILED" || s === "REJECTED" || s === "ERROR") {
    return "bg-red-500/10 text-red-500 border-red-500/20";
  }
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
};

const handlePageChange = (page) => {
  store.setPage(page);
};

const handlePerPageChange = (perPage) => {
  store.updatePerPage(perPage);
};

const openDetails = (item) => {
  selectedItem.value = item;
  detailOpen.value = true;
};

const closeDetails = () => {
  detailOpen.value = false;
  selectedItem.value = null;
};

onMounted(() => {
  if (
    hasPermission("payment_requests.platform_view") ||
    hasPermission("payment_request.platform_view")
  ) {
    store.fetchData();
  }
});
</script>
