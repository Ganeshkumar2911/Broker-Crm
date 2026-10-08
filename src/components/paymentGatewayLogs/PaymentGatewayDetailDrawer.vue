<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/50">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              :class="headerIconBgClass"
            >
              <FileCode2 v-if="isLog" class="w-5 h-5 text-primary" />
              <ArrowLeftRight v-else class="w-5 h-5 text-emerald-500" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-primary-text truncate">
                  {{ isLog ? `Log #${item?.id}` : `Transaction #${item?.id}` }}
                </h3>
                <span
                  v-if="item?.gateway"
                  class="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-primary/10 text-primary border-primary/20"
                >
                  {{ item.gateway }}
                </span>
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize"
                  :class="statusBadgeClass"
                >
                  {{ statusBadgeLabel }}
                </span>
              </div>
              <p class="text-[11px] text-secondary-text mt-0.5">
                {{ formatDate(item?.created_at) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              title="Copy JSON"
              @click="copyJson"
            >
              <Copy class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              @click="emit('close')"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1 px-6 border-b border-primary-border bg-background/30 text-xs font-medium shrink-0 overflow-x-auto">
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            :class="activeTab === 'overview' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'overview'"
          >
            <Info class="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            v-if="isLog"
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            :class="activeTab === 'request' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'request'"
          >
            <ArrowUpRight class="w-3.5 h-3.5" />
            <span>Request & Headers</span>
          </button>
          <button
            v-if="isLog"
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            :class="activeTab === 'response' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'response'"
          >
            <ArrowDownLeft class="w-3.5 h-3.5" />
            <span>Response & Signature</span>
          </button>
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            :class="activeTab === 'raw' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'raw'"
          >
            <Code2 class="w-3.5 h-3.5" />
            <span>Raw Payload</span>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- TAB 1: OVERVIEW -->
          <div v-if="activeTab === 'overview'" class="space-y-4 text-xs">
            <!-- LOG OVERVIEW -->
            <template v-if="isLog">
              <!-- Log Core Info Card -->
              <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
                <span class="text-[11px] font-bold text-primary-text uppercase tracking-wide flex items-center gap-1.5">
                  <Activity class="w-3.5 h-3.5 text-primary" />
                  <span>Log & Gateway Info</span>
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Log ID</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="font-mono font-bold text-primary-text">#{{ item?.id }}</span>
                      <button
                        v-if="item?.id"
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer"
                        @click="copyText(item.id, 'Log ID')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Gateway Tx ID</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="font-mono font-bold text-primary-text">
                        {{ item?.gateway_transaction_id ? `#${item.gateway_transaction_id}` : '—' }}
                      </span>
                      <button
                        v-if="item?.gateway_transaction_id"
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer"
                        @click="copyText(item.gateway_transaction_id, 'Gateway Tx ID')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Gateway</span>
                    <span class="font-bold text-primary uppercase mt-0.5 block">{{ item?.gateway || '—' }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Operation / Direction</span>
                    <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span class="font-semibold text-primary-text">{{ item?.operation || 'WEBHOOK' }}</span>
                      <span class="text-[10px] text-secondary-text">({{ item?.direction || 'inbound' }})</span>
                    </div>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">HTTP Method & Endpoint</span>
                    <span class="font-mono text-[11px] text-primary-text block mt-0.5 select-all">
                      <span class="font-bold text-primary mr-1">{{ item?.http_method }}</span>
                      {{ item?.endpoint }}
                    </span>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Response Status & Signature</span>
                    <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span
                        v-if="item?.response_status"
                        class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded"
                        :class="item.response_status >= 200 && item.response_status < 300 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'"
                      >
                        HTTP {{ item.response_status }}
                      </span>
                      <span
                        v-if="item?.signature_valid !== null && item?.signature_valid !== undefined"
                        class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded"
                        :class="item.signature_valid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'"
                      >
                        {{ item.signature_valid ? 'Signature Valid' : 'Signature Invalid' }}
                      </span>
                    </div>
                  </div>
                  <div v-if="item?.correlation_id" class="sm:col-span-2">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Correlation ID / Reference</span>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="font-mono text-[11px] text-primary-text select-all break-all">{{ item.correlation_id }}</span>
                      <button
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                        @click="copyText(item.correlation_id, 'Correlation ID')"
                      >
                        <Copy class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Customer Info Card -->
              <div v-if="drawerLogCustomer" class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
                <span class="text-[11px] font-bold text-primary-text uppercase tracking-wide flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-primary" />
                  <span>Customer & User Information</span>
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Customer Name</span>
                    <span class="font-bold text-primary-text mt-0.5 block">{{ drawerLogCustomerName || '—' }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">User Reference ID</span>
                    <span class="font-mono font-semibold text-primary-text mt-0.5 block">
                      {{ drawerLogCustomer.referenceId ? `User #${drawerLogCustomer.referenceId}` : '—' }}
                    </span>
                  </div>
                  <div v-if="drawerLogCustomer.email">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Email</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-primary-text select-all truncate">{{ drawerLogCustomer.email }}</span>
                      <button
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                        @click="copyText(drawerLogCustomer.email, 'Customer Email')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div v-if="drawerLogCustomer.phone">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Phone</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="font-mono text-primary-text select-all">{{ drawerLogCustomer.phone }}</span>
                      <button
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                        @click="copyText(drawerLogCustomer.phone, 'Customer Phone')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div v-if="drawerLogCustomer.ip">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">IP Address</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="font-mono text-secondary-text select-all">{{ drawerLogCustomer.ip }}</span>
                      <button
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                        @click="copyText(drawerLogCustomer.ip, 'Customer IP')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Country & Location</span>
                    <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span v-if="drawerLogBillingCountry" class="font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                        {{ drawerLogBillingCountry }}
                      </span>
                      <span v-if="drawerLogBillingState" class="text-secondary-text bg-background px-1.5 py-0.2 rounded border border-primary-border/40">
                        State: {{ drawerLogBillingState }}
                      </span>
                      <span v-if="drawerLogCustomer.locale" class="text-secondary-text bg-background px-1.5 py-0.2 rounded border border-primary-border/40">
                        Locale: {{ drawerLogCustomer.locale }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Details Card -->
              <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
                <span class="text-[11px] font-bold text-primary-text uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard class="w-3.5 h-3.5 text-primary" />
                  <span>Payment & Gateway Transaction Data</span>
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Amount & Currency</span>
                    <span class="font-mono font-bold text-sm text-primary-text mt-0.5 block">
                      {{ drawerLogAmount != null ? `${fmt(drawerLogAmount)} ${drawerLogCurrency}` : '—' }}
                    </span>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Payment State</span>
                    <div class="mt-0.5">
                      <span
                        v-if="drawerLogState"
                        class="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                        :class="getLogStateClass(drawerLogState)"
                      >
                        {{ drawerLogState }}
                      </span>
                      <span v-else class="text-secondary-text font-mono">—</span>
                    </div>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Type & Method</span>
                    <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span v-if="drawerLogPaymentType" class="font-bold uppercase text-primary-text bg-background px-1.5 py-0.5 rounded border border-primary-border">
                        {{ drawerLogPaymentType }}
                      </span>
                      <span v-if="drawerLogPaymentMethod" class="font-bold uppercase text-primary">
                        {{ drawerLogPaymentMethod }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Gateway Payment ID</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="font-mono text-primary-text select-all break-all">{{ drawerLogGatewayPaymentId || '—' }}</span>
                      <button
                        v-if="drawerLogGatewayPaymentId"
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                        @click="copyText(drawerLogGatewayPaymentId, 'Gateway Payment ID')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div v-if="drawerLogExternalId">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">External ID</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="font-mono text-primary-text select-all">#{{ drawerLogExternalId }}</span>
                      <button
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                        @click="copyText(drawerLogExternalId, 'External ID')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div v-if="drawerLogCheckoutOptionId">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Checkout Option ID</span>
                    <span class="font-mono text-primary-text mt-0.5 block">#{{ drawerLogCheckoutOptionId }}</span>
                  </div>
                  <div v-if="drawerLogShopName">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Shop Name</span>
                    <span class="text-primary-text mt-0.5 block">{{ drawerLogShopName }}</span>
                  </div>
                  <div v-if="drawerLogTerminalName" class="sm:col-span-2">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Terminal Name</span>
                    <span class="text-secondary-text font-mono text-[11px] mt-0.5 block">{{ drawerLogTerminalName }}</span>
                  </div>
                </div>
              </div>

              <!-- Error Alert Card (If Declined/Failed) -->
              <div
                v-if="drawerLogError || drawerLogErrorCode || drawerLogExternalResultCode"
                class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-1.5 text-red-400"
              >
                <div class="flex items-center gap-1.5">
                  <ShieldAlert class="w-4 h-4 text-red-500 shrink-0" />
                  <span class="font-bold text-xs text-red-500">Transaction Declined / Error Info</span>
                  <span v-if="drawerLogErrorCode" class="font-mono font-bold text-[10px] bg-red-500/20 px-1.5 py-0.2 rounded text-red-300">
                    Code: {{ drawerLogErrorCode }}
                  </span>
                </div>
                <p v-if="drawerLogExternalResultCode" class="text-[11px] font-mono text-red-300">
                  Result: {{ drawerLogExternalResultCode }}
                </p>
                <p v-if="drawerLogError" class="text-xs text-red-400">
                  {{ drawerLogError }}
                </p>
              </div>

              <!-- URLs Card -->
              <div
                v-if="drawerLogRedirectUrl || drawerLogReturnUrl || drawerLogWebhookUrl"
                class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-2.5"
              >
                <span class="text-[11px] font-bold text-primary-text uppercase tracking-wide flex items-center gap-1.5">
                  <ExternalLink class="w-3.5 h-3.5 text-primary" />
                  <span>Endpoints & Checkout URLs</span>
                </span>
                <div class="space-y-2">
                  <div v-if="drawerLogRedirectUrl">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Checkout / Redirect URL</span>
                    <div class="flex items-center gap-2 mt-0.5">
                      <a
                        :href="drawerLogRedirectUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-mono text-[11px] text-primary hover:underline truncate max-w-lg"
                      >
                        {{ drawerLogRedirectUrl }}
                      </a>
                      <button
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                        @click="copyText(drawerLogRedirectUrl, 'Redirect URL')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div v-if="drawerLogReturnUrl">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Return URL</span>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="font-mono text-[11px] text-secondary-text truncate max-w-lg select-all">{{ drawerLogReturnUrl }}</span>
                      <button
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                        @click="copyText(drawerLogReturnUrl, 'Return URL')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div v-if="drawerLogWebhookUrl">
                    <span class="text-[10px] uppercase font-bold text-secondary-text block">Webhook URL</span>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="font-mono text-[11px] text-secondary-text truncate max-w-lg select-all">{{ drawerLogWebhookUrl }}</span>
                      <button
                        type="button"
                        class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                        @click="copyText(drawerLogWebhookUrl, 'Webhook URL')"
                      >
                        <Copy class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- TRANSACTION OVERVIEW -->
            <template v-else>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-background/50 border border-primary-border rounded-xl p-4">
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Transaction ID</span>
                  <span class="font-mono font-bold text-primary-text">#{{ item?.id }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Payment Request ID</span>
                  <span class="font-mono font-bold text-primary-text">{{ item?.payment_request_id ? `#${item.payment_request_id}` : '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">User ID</span>
                  <span class="font-mono text-primary-text">{{ item?.user_id || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Trading Account ID</span>
                  <span class="font-mono text-primary-text">{{ item?.trading_account_id ? `#${item.trading_account_id}` : '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Payment Type</span>
                  <span class="font-bold uppercase tracking-wider text-primary">{{ item?.payment_type || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Gateway & Method</span>
                  <span class="font-semibold text-primary-text uppercase">{{ item?.gateway }} · {{ item?.payment_method || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Amount</span>
                  <span class="font-mono font-bold text-sm text-primary-text">
                    {{ fmt(item?.amount) }} {{ item?.currency }}
                  </span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Customer Amount</span>
                  <span class="font-mono font-semibold text-secondary-text">
                    {{ fmt(item?.customer_amount) }} {{ item?.customer_currency }}
                  </span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">State</span>
                  <span class="font-bold text-primary-text">{{ item?.state || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Internal Status</span>
                  <span class="font-medium capitalize text-secondary-text">{{ item?.internal_status || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Funds Applied</span>
                  <span
                    class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded mt-0.5"
                    :class="item?.funds_applied ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary-text/10 text-secondary-text'"
                  >
                    {{ item?.funds_applied ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Created At</span>
                  <span class="text-secondary-text">{{ formatDate(item?.created_at) }}</span>
                </div>
                <div v-if="item?.completed_at">
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Completed At</span>
                  <span class="text-secondary-text">{{ formatDate(item?.completed_at) }}</span>
                </div>
                <div v-if="item?.reference_id" class="sm:col-span-2">
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Reference ID</span>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="font-mono text-[11px] text-primary-text select-all break-all">{{ item.reference_id }}</span>
                    <button
                      type="button"
                      class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                      @click="copyText(item.reference_id, 'Reference ID')"
                    >
                      <Copy class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div v-if="item?.gateway_payment_id" class="sm:col-span-2">
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Gateway Payment ID</span>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="font-mono text-[11px] text-primary-text select-all break-all">{{ item.gateway_payment_id }}</span>
                    <button
                      type="button"
                      class="text-secondary-text hover:text-primary p-0.5 cursor-pointer shrink-0"
                      @click="copyText(item.gateway_payment_id, 'Gateway Payment ID')"
                    >
                      <Copy class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div v-if="item?.redirect_url" class="sm:col-span-2">
                  <span class="text-[10px] uppercase font-bold text-secondary-text block">Redirect URL</span>
                  <a
                    :href="item.redirect_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-mono text-[11px] text-primary break-all block mt-0.5 hover:underline"
                  >
                    {{ item.redirect_url }}
                  </a>
                </div>
                <div v-if="item?.error_message || item?.error_code" class="sm:col-span-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400">
                  <span class="text-[10px] uppercase font-bold text-red-500 block">Error ({{ item?.error_code || 'N/A' }})</span>
                  <p class="font-mono text-[11px] mt-0.5 wrap-break-word">{{ item?.error_message }}</p>
                </div>
              </div>
            </template>
          </div>

          <!-- TAB 2: REQUEST & HEADERS (LOGS) -->
          <div v-else-if="activeTab === 'request'" class="space-y-4 text-xs">
            <!-- Headers -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-primary-text uppercase tracking-wide flex items-center gap-1.5">
                  <Key class="w-3.5 h-3.5 text-primary" />
                  <span>Request Headers</span>
                </span>
                <button
                  type="button"
                  class="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  @click="copyText(JSON.stringify(item?.request_headers, null, 2), 'Request Headers')"
                >
                  Copy Headers
                </button>
              </div>
              <pre class="font-mono text-[11px] bg-background/80 border border-primary-border p-3.5 rounded-xl overflow-x-auto text-primary-text select-text leading-relaxed whitespace-pre-wrap break-all">{{ formatJson(item?.request_headers) }}</pre>
            </div>

            <!-- Body -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-primary-text uppercase tracking-wide flex items-center gap-1.5">
                  <FileText class="w-3.5 h-3.5 text-primary" />
                  <span>Request Body</span>
                </span>
                <button
                  type="button"
                  class="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  @click="copyText(JSON.stringify(item?.request_body, null, 2), 'Request Body')"
                >
                  Copy Body
                </button>
              </div>
              <pre class="font-mono text-[11px] bg-background/80 border border-primary-border p-3.5 rounded-xl overflow-x-auto text-primary-text select-text leading-relaxed whitespace-pre-wrap break-all">{{ formatJson(item?.request_body) }}</pre>
            </div>
          </div>

          <!-- TAB 3: RESPONSE & SIGNATURE (LOGS) -->
          <div v-else-if="activeTab === 'response'" class="space-y-4 text-xs">
            <!-- Signature status alert -->
            <div
              class="border rounded-xl p-3.5 flex items-center gap-3"
              :class="item?.signature_valid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'"
            >
              <ShieldCheck v-if="item?.signature_valid" class="w-5 h-5 shrink-0" />
              <ShieldAlert v-else class="w-5 h-5 shrink-0" />
              <div>
                <p class="font-bold text-xs">
                  {{ item?.signature_valid ? 'Cryptographic Signature Validated' : 'Signature Validation Failed or Unverified' }}
                </p>
                <p class="text-[11px] opacity-80 mt-0.5">
                  {{ item?.signature_valid ? 'The incoming webhook payload was verified with the gateway secret key.' : 'The signature could not be verified against the expected secret.' }}
                </p>
              </div>
            </div>

            <!-- Response Body -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-primary-text uppercase tracking-wide flex items-center gap-1.5">
                  <Activity class="w-3.5 h-3.5 text-primary" />
                  <span>Response Body (HTTP {{ item?.response_status || 'N/A' }})</span>
                </span>
                <button
                  type="button"
                  class="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  @click="copyText(JSON.stringify(item?.response_body, null, 2), 'Response Body')"
                >
                  Copy Response
                </button>
              </div>
              <pre class="font-mono text-[11px] bg-background/80 border border-primary-border p-3.5 rounded-xl overflow-x-auto text-primary-text select-text leading-relaxed whitespace-pre-wrap break-all">{{ formatJson(item?.response_body) }}</pre>
            </div>
          </div>

          <!-- TAB 4: RAW PAYLOAD -->
          <div v-else-if="activeTab === 'raw'" class="space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-primary-text uppercase tracking-wide">Complete JSON Object</span>
              <button
                type="button"
                class="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                @click="copyJson"
              >
                Copy Full JSON
              </button>
            </div>
            <pre class="font-mono text-[11px] bg-background/80 border border-primary-border p-3.5 rounded-xl overflow-x-auto text-primary-text select-text leading-relaxed whitespace-pre-wrap break-all">{{ formatJson(item) }}</pre>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  X,
  Copy,
  Info,
  ArrowUpRight,
  ArrowDownLeft,
  Code2,
  FileCode2,
  ArrowLeftRight,
  ShieldCheck,
  ShieldAlert,
  Key,
  FileText,
  Activity,
  User,
  CreditCard,
  ExternalLink,
} from "lucide-vue-next";
import { formatDate } from "@/utils/timeFormatter";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  source: {
    type: String,
    default: "logs", // 'logs' | 'transaction'
  },
});

const emit = defineEmits(["close"]);
const snackbar = useSnackbarStore();
const activeTab = ref("overview");

const isLog = computed(() => {
  if (props.source === "logs") return true;
  return Boolean(
    props.item?.direction ||
    props.item?.http_method ||
    props.item?.endpoint ||
    props.item?.request_body ||
    props.item?.response_body
  );
});

const headerIconBgClass = computed(() => {
  return isLog.value ? "bg-primary/10 border-primary/20" : "bg-emerald-500/10 border-emerald-500/20";
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

const drawerLogReqBody = computed(() => parsePayload(props.item?.request_body));
const drawerLogResBody = computed(() => parsePayload(props.item?.response_body));
const drawerLogResResult = computed(() => {
  const res = drawerLogResBody.value;
  return res?.result || res || null;
});

const drawerLogCustomer = computed(() => {
  if (props.item?.customer) return props.item.customer;
  return drawerLogReqBody.value?.customer || drawerLogResResult.value?.customer || null;
});

const drawerLogCustomerName = computed(() => {
  const c = drawerLogCustomer.value;
  if (c) {
    if (c.accountName) return c.accountName;
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ");
    if (name) return name;
  }
  if (props.item?.customer_name) return props.item.customer_name;
  if (props.item?.user_name) return props.item.user_name;
  if (props.item?.user_id) return `User #${props.item.user_id}`;
  return null;
});

const drawerLogBillingCountry = computed(() => {
  return (
    drawerLogReqBody.value?.billingAddress?.countryCode ||
    drawerLogResResult.value?.billingAddress?.countryCode ||
    drawerLogCustomer.value?.citizenshipCountryCode ||
    props.item?.country ||
    props.item?.billing_country ||
    null
  );
});

const drawerLogBillingState = computed(() => {
  return (
    drawerLogReqBody.value?.billingAddress?.state ||
    drawerLogResResult.value?.billingAddress?.state ||
    props.item?.state_name ||
    props.item?.billing_state ||
    null
  );
});

const drawerLogAmount = computed(() => {
  const amount = drawerLogReqBody.value?.amount ?? drawerLogResResult.value?.amount ?? props.item?.amount;
  return amount != null ? amount : null;
});

const drawerLogCurrency = computed(() => {
  return drawerLogReqBody.value?.currency || drawerLogResResult.value?.currency || props.item?.currency || "";
});

const drawerLogPaymentType = computed(() => {
  return drawerLogReqBody.value?.paymentType || drawerLogResResult.value?.paymentType || props.item?.payment_type || null;
});

const drawerLogPaymentMethod = computed(() => {
  return drawerLogReqBody.value?.paymentMethod || drawerLogResResult.value?.paymentMethod || props.item?.payment_method || null;
});

const drawerLogShopName = computed(() => {
  return drawerLogReqBody.value?.shopName || drawerLogResResult.value?.shopName || props.item?.shop_name || null;
});

const drawerLogTerminalName = computed(() => {
  return drawerLogReqBody.value?.terminalName || drawerLogResResult.value?.terminalName || props.item?.terminal_name || null;
});

const drawerLogCheckoutOptionId = computed(() => {
  return (
    drawerLogReqBody.value?.externalRefs?.checkoutOptionId ||
    drawerLogResResult.value?.externalRefs?.checkoutOptionId ||
    props.item?.checkout_option_id ||
    null
  );
});

const drawerLogGatewayPaymentId = computed(() => {
  return drawerLogReqBody.value?.id || drawerLogResResult.value?.id || props.item?.gateway_payment_id || null;
});

const drawerLogExternalId = computed(() => {
  return (
    drawerLogReqBody.value?.externalId ||
    drawerLogReqBody.value?.externalRefs?.id ||
    drawerLogResResult.value?.externalId ||
    drawerLogResResult.value?.externalRefs?.id ||
    props.item?.external_id ||
    null
  );
});

const drawerLogState = computed(() => {
  return drawerLogReqBody.value?.state || drawerLogResResult.value?.state || props.item?.state || null;
});

const drawerLogError = computed(() => {
  return (
    drawerLogReqBody.value?.errorMessage ||
    drawerLogReqBody.value?.externalResultCode ||
    drawerLogResResult.value?.errorMessage ||
    drawerLogResResult.value?.message ||
    props.item?.error_message ||
    null
  );
});

const drawerLogErrorCode = computed(() => {
  return drawerLogReqBody.value?.errorCode || drawerLogResResult.value?.errorCode || props.item?.error_code || null;
});

const drawerLogExternalResultCode = computed(() => {
  return drawerLogReqBody.value?.externalResultCode || drawerLogResResult.value?.externalResultCode || null;
});

const drawerLogRedirectUrl = computed(() => {
  return drawerLogResResult.value?.redirectUrl || drawerLogReqBody.value?.redirectUrl || props.item?.redirect_url || null;
});

const drawerLogReturnUrl = computed(() => {
  return drawerLogReqBody.value?.returnUrl || null;
});

const drawerLogWebhookUrl = computed(() => {
  return drawerLogReqBody.value?.webhookUrl || null;
});

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

const statusBadgeClass = computed(() => {
  if (isLog.value) {
    const status = props.item?.response_status;
    if (status >= 200 && status < 300) {
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
    if (status >= 400) {
      return "bg-red-500/10 text-red-500 border-red-500/20";
    }
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }

  const state = (props.item?.state || "").toUpperCase();
  if (state === "COMPLETED" || state === "SUCCESS") {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }
  if (state === "FAILED" || state === "REJECTED" || state === "ERROR") {
    return "bg-red-500/10 text-red-500 border-red-500/20";
  }
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
});

const statusBadgeLabel = computed(() => {
  if (isLog.value) {
    return props.item?.response_status ? `HTTP ${props.item.response_status}` : (props.item?.operation || "LOG");
  }
  return props.item?.state || "PENDING";
});

const fmt = (v) =>
  Number(v ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatJson = (data) => {
  if (data === null || data === undefined) return "null";
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  }
  return JSON.stringify(data, null, 2);
};

const copyText = (text, label = "Text") => {
  if (!text) return;
  navigator.clipboard.writeText(String(text));
  snackbar.show(`${label} copied to clipboard`, "success");
};

const copyJson = () => {
  if (!props.item) return;
  copyText(JSON.stringify(props.item, null, 2), "Full payload");
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
