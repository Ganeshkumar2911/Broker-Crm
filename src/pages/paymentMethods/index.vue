<template>
  <div class="px-4 pb-8 space-y-6">

    <!-- Header & Controls -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <!-- Search & Filters -->
      <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
        <div class="relative w-full sm:w-64">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <input
            v-model="store.filters.search"
            type="text"
            placeholder="Search by wallet label..."
            class="w-full pl-8 pr-7 py-2 bg-card-background border border-primary-border rounded-lg text-xs text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition-all shadow-2xs"
            @input="onSearchInput"
          />
          <button
            v-if="store.filters.search"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
            @click="clearSearch"
          >
            <X class="w-3 h-3" />
          </button>
        </div>

        <!-- Method Type Filter Pills -->
        <div class="hidden md:flex flex-wrap items-center p-0.5 bg-card-background border border-primary-border rounded-lg text-xs">
          <button
            v-for="filter in METHOD_TYPES"
            :key="filter.value"
            class="px-2.5 py-1 rounded-md font-medium transition cursor-pointer"
            :class="store.filters.method_type === filter.value
              ? 'bg-primary text-white font-semibold shadow-2xs'
              : 'text-secondary-text hover:text-primary-text'"
            @click="onMethodTypeChange(filter.value)"
          >
            {{ filter.label }}
          </button>
        </div>

        <BaseSelect
          :modelValue="store.pagination.per_page"
          :options="store.perPageOptions"
          placeholder="Per page..."
          class="w-24 sm:w-28"
          @update:modelValue="store.updatePerPage"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 ml-auto">
        <button
          v-if="hasPermission('payment_methods.view')"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-primary-text text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          @click="isCurrencyDrawerOpen = true"
        >
          <Coins class="w-3.5 h-3.5 text-primary" />
          <span>Currency Rates</span>
        </button>

        <button
          v-if="hasPermission('payment_methods.create')"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
          @click="handleOpenCreate"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Payment Method</span>
        </button>
      </div>
    </div>


    <!-- Skeleton Cards on Loading -->
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4 shadow-2xs">
        <div class="flex items-center justify-between">
          <div class="h-5 w-28 bg-background rounded-full" />
          <div class="h-5 w-14 bg-background rounded-full" />
        </div>
        <div class="space-y-2">
          <div class="h-4 w-3/4 bg-background rounded" />
          <div class="h-3 w-1/2 bg-background rounded" />
        </div>
        <div class="h-20 bg-background/50 rounded-xl" />
        <div class="grid grid-cols-3 gap-2">
          <div class="h-10 bg-background rounded-lg" />
          <div class="h-10 bg-background rounded-lg" />
          <div class="h-10 bg-background rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.records.length === 0" class="flex flex-col items-center gap-4 py-20 bg-card-background border border-dashed border-primary-border rounded-2xl">
      <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Wallet class="w-6 h-6" />
      </div>
      <div class="text-center space-y-1">
        <p class="text-sm font-bold text-primary-text">No payment methods found</p>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          {{ store.filters.search || store.filters.method_type ? 'No methods match your search filter.' : 'Create payment methods or aggregator gateways to start accepting client deposits and payouts.' }}
        </p>
      </div>
      <button
        v-if="hasPermission('payment_methods.create')"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-xs"
        @click="handleOpenCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Create First Payment Method</span>
      </button>
    </div>

    <!-- Payment Method Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
      <div
        v-for="record in store.records"
        :key="record.id"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between gap-4.5 transition-all duration-200 group relative"
      >
        <!-- Top accent gradient -->
        <div class="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div class="space-y-4">
          <!-- Card Header: Gateway & Badges + Active Switch & Edit Action -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-wrap items-center gap-1.5 min-w-0">
              <!-- Gateway Badge -->
              <span
                class="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md border uppercase tracking-wider"
                :class="getGatewayBadgeClass(record.gateway)"
              >
                {{ record.gateway || 'GATEWAY' }}
              </span>

              <!-- Method Type Badge -->
              <span
                v-if="record.method_type"
                class="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-background border border-primary-border text-secondary-text uppercase"
              >
                {{ record.method_type }}
              </span>

              <!-- Aggregator Code Badge -->
              <span
                v-if="record.payment_method_code"
                class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
              >
                {{ record.payment_method_code }}
              </span>
            </div>

            <!-- Header Quick Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- Edit Button -->
              <button
                v-if="hasPermission('payment_methods.update')"
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-background border border-primary-border hover:border-primary/40 text-secondary-text hover:text-primary transition cursor-pointer shadow-2xs"
                title="Edit Payment Method"
                @click="handleOpenEdit(record)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>

              <!-- Active Toggle Switch -->
              <button
                v-if="hasPermission('payment_methods.update')"
                type="button"
                :disabled="store.updateLoading && togglingId === record.id"
                class="relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 cursor-pointer"
                :class="record.is_active ? 'bg-primary-green' : 'bg-primary-border'"
                :title="record.is_active ? 'Click to deactivate' : 'Click to activate'"
                @click="toggleActive(record)"
              >
                <span
                  v-if="!(store.updateLoading && togglingId === record.id)"
                  class="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-xs"
                  :class="record.is_active ? 'translate-x-4.5' : 'translate-x-0'"
                />
                <Loader2
                  v-else
                  class="absolute inset-0 m-auto w-3.5 h-3.5 text-white animate-spin"
                />
              </button>
            </div>
          </div>

          <!-- Label & Inline Edit -->
          <div>
            <div v-if="editingId === record.id && hasPermission('payment_methods.update')" class="flex items-center gap-1.5">
              <input
                v-model="editingLabel"
                ref="labelInput"
                type="text"
                class="flex-1 min-w-0 px-2.5 py-1 rounded-lg bg-background border border-primary text-primary-text text-xs outline-none"
                @keydown.enter="saveLabel(record)"
                @keydown.escape="cancelEdit"
              />
              <div class="flex items-center gap-1">
                <button
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition cursor-pointer"
                  :disabled="store.updateLoading"
                  @click="saveLabel(record)"
                >
                  <Loader2 v-if="store.updateLoading && savingId === record.id" class="w-3.5 h-3.5 text-secondary-text animate-spin" />
                  <Check v-else class="w-3.5 h-3.5 text-primary-green" />
                </button>
                <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition cursor-pointer" @click="cancelEdit">
                  <X class="w-3.5 h-3.5 text-secondary-text" />
                </button>
              </div>
            </div>

            <div
              v-else
              class="flex items-center gap-1.5 group/label"
              :class="hasPermission('payment_methods.update') ? 'cursor-pointer' : ''"
              @click="hasPermission('payment_methods.update') && startEdit(record)"
            >
              <h3 class="text-sm font-bold text-primary-text truncate" :title="record.wallet_label">
                {{ record.wallet_label || 'Untitled Method' }}
              </h3>
              <Pencil v-if="hasPermission('payment_methods.update')" class="w-3 h-3 text-secondary-text opacity-0 group-hover/label:opacity-100 transition-opacity shrink-0" />
            </div>

            <div class="flex items-center gap-2 mt-0.5 text-[10px] text-secondary-text font-mono">
              <span v-if="record.remarks" class="truncate opacity-80" :title="record.remarks">{{ record.remarks }}</span>
            </div>
          </div>

          <!-- Operation Badges Row (Deposit, Withdrawal, Defaults) -->
          <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
            <!-- Deposit Capability -->
            <span
              class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border"
              :class="isDepositEnabled(record)
                ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                : 'bg-background text-secondary-text/60 border-primary-border'"
            >
              <ArrowDownLeft class="w-3 h-3" />
              <span>Deposit: {{ isDepositEnabled(record) ? 'ON' : 'OFF' }}</span>
            </span>

            <!-- Withdrawal Capability -->
            <span
              class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border"
              :class="isWithdrawalEnabled(record)
                ? 'bg-primary-blue/10 text-primary-blue border-primary-blue/20'
                : 'bg-background text-secondary-text/60 border-primary-border'"
            >
              <ArrowUpRight class="w-3 h-3" />
              <span>Withdraw: {{ isWithdrawalEnabled(record) ? 'ON' : 'OFF' }}</span>
            </span>

            <!-- Default Deposit Star Badge -->
            <span
              v-if="record.is_default_deposit"
              class="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20"
              title="Default Deposit Method"
            >
              <Star class="w-2.5 h-2.5 fill-amber-500" />
              <span>Def. Deposit</span>
            </span>

            <!-- Default Withdrawal Star Badge -->
            <span
              v-if="record.is_default_withdrawal"
              class="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20"
              title="Default Withdrawal Method"
            >
              <Star class="w-2.5 h-2.5 fill-amber-500" />
              <span>Def. Withdrawal</span>
            </span>
          </div>

          <!-- Dynamic Client Meta Fields Box (`meta_data`) -->
          <div class="bg-background/40 rounded-xl p-3 border border-primary-border/60 space-y-2 text-xs">
            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-secondary-text pb-1.5 border-b border-primary-border/30">
              <span class="flex items-center gap-1">
                <FormInput class="w-3 h-3 text-primary" />
                <span>Client Form Inputs</span>
              </span>
              <span>
                {{ (record.meta_data?.deposit_fields?.length || 0) + (record.meta_data?.withdrawal_fields?.length || 0) }} field(s)
              </span>
            </div>

            <!-- Direct Credentials (if manual UPI/Bank) -->
            <div v-if="record.upi_id" class="text-[11px] font-mono">
              <span class="text-[9px] uppercase text-secondary-text block">UPI ID:</span>
              <span class="text-primary font-bold break-all select-all">{{ record.upi_id }}</span>
            </div>

            <div v-else-if="record.bank_name || record.account_number" class="text-[11px] grid grid-cols-2 gap-1.5 font-mono">
              <div v-if="record.bank_name">
                <span class="text-[9px] uppercase text-secondary-text block font-sans">Bank:</span>
                <span class="text-primary-text font-medium truncate">{{ record.bank_name }}</span>
              </div>
              <div v-if="record.account_number">
                <span class="text-[9px] uppercase text-secondary-text block font-sans">A/C Number:</span>
                <span class="text-primary-text font-medium truncate">{{ record.account_number }}</span>
              </div>
            </div>

            <!-- Meta Data Fields Badges -->
            <div class="space-y-1.5 pt-0.5">
              <!-- Deposit Fields Summary -->
              <div class="flex items-start gap-1.5 text-[10px]">
                <span class="text-secondary-text font-semibold shrink-0">Deposit:</span>
                <div v-if="record.meta_data?.deposit_fields && record.meta_data.deposit_fields.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="(f, i) in record.meta_data.deposit_fields"
                    :key="i"
                    class="px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-[9px] font-mono text-primary-text"
                  >
                    {{ f.label || f.key }}<span v-if="f.required" class="text-primary-red">*</span>
                  </span>
                </div>
                <span v-else class="text-secondary-text/70 italic">Standard flow (no extra fields)</span>
              </div>

              <!-- Withdrawal Fields Summary -->
              <div class="flex items-start gap-1.5 text-[10px]">
                <span class="text-secondary-text font-semibold shrink-0">Withdraw:</span>
                <div v-if="record.meta_data?.withdrawal_fields && record.meta_data.withdrawal_fields.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="(f, i) in record.meta_data.withdrawal_fields"
                    :key="i"
                    class="px-1.5 py-0.2 rounded bg-card-background border border-primary-border text-[9px] font-mono text-primary-text"
                  >
                    {{ f.label || f.key }}<span v-if="f.required" class="text-primary-red">*</span>
                  </span>
                </div>
                <span v-else class="text-secondary-text/70 italic">Standard flow (no extra fields)</span>
              </div>
            </div>
          </div>

          <!-- Transaction Limits Grid with Tooltips -->
          <div class="grid grid-cols-3 gap-2 pt-1 border-t border-primary-border/40">
            <Tooltip :text="getDepositTooltip(record)" block position="center">
              <div class="text-center p-2 rounded-xl bg-background/30 border border-primary-border/20 cursor-help">
                <p class="text-[9px] text-secondary-text mb-0.5">Deposit Limit</p>
                <p class="text-[11px] font-bold text-primary-text truncate font-mono">
                  {{ formatLimitRange(record.minimum_deposit_amount, record.maximum_deposit_amount) }}
                </p>
              </div>
            </Tooltip>

            <Tooltip :text="getWithdrawTooltip(record)" block position="center">
              <div class="text-center p-2 rounded-xl bg-background/30 border border-primary-border/20 cursor-help">
                <p class="text-[9px] text-secondary-text mb-0.5">Withdraw Limit</p>
                <p class="text-[11px] font-bold text-primary-text truncate font-mono">
                  {{ formatLimitRange(record.minimum_withdrawal_amount, record.maximum_withdrawal_amount) }}
                </p>
              </div>
            </Tooltip>

            <Tooltip :text="getDailyWdTooltip(record)" block position="center">
              <div class="text-center p-2 rounded-xl bg-background/30 border border-primary-border/20 cursor-help">
                <p class="text-[9px] text-secondary-text mb-0.5">Max WD / Day</p>
                <p class="text-[11px] font-bold text-primary-text truncate font-mono">
                  {{ record.maximum_withdrawals_per_day ? `${record.maximum_withdrawals_per_day}` : 'Unlimited' }}
                </p>
              </div>
            </Tooltip>
          </div>
        </div>

        <!-- Footer: Created At Timestamp -->
        <div class="pt-2 border-t border-primary-border/40 flex items-center justify-between text-[9px] text-secondary-text">
          <div class="flex items-center gap-1">
            <Clock class="w-3 h-3 text-secondary-text/60" />
            <span>Created: {{ formatDate(record.created_at) }}</span>
          </div>
          <span v-if="record.withdraw_notification_emails?.length" class="text-primary font-medium">
            {{ record.withdraw_notification_emails.length }} email alert(s)
          </span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-5">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Edit / Create Dialog -->
    <EditPaymentMethodDialog
      :open="isEditDialogOpen"
      :paymentMethod="selectedPaymentMethod"
      @close="isEditDialogOpen = false"
    />

    <!-- Currency Rates Drawer -->
    <CurrencyRatesDrawer
      :open="isCurrencyDrawerOpen"
      @close="isCurrencyDrawerOpen = false"
    />

  </div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import {
  Wallet,
  Pencil,
  Check,
  X,
  Loader2,
  Plus,
  Coins,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Star,
  FormInput,
  Clock,
} from 'lucide-vue-next'
import { usePaymentMethodsStore } from '@/stores/paymentMethods/paymentMethods'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import EditPaymentMethodDialog from '@/components/paymentMethods/EditPaymentMethodDialog.vue'
import CurrencyRatesDrawer from '@/components/paymentMethods/CurrencyRatesDrawer.vue'
import { usePermissionCheck } from '@/composables/usePermissionCheck'

const store = usePaymentMethodsStore()
const { hasPermission } = usePermissionCheck()

// ── Drawer & Dialog States ──
const isCurrencyDrawerOpen = ref(false)
const isEditDialogOpen = ref(false)
const selectedPaymentMethod = ref(null)

const METHOD_TYPES = [
  { value: "", label: "All types" },
  { value: "crypto", label: "Crypto" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "wallet", label: "Wallet" },
  { value: "card", label: "Card" },
  { value: "internal_transfer", label: "Internal transfer" },
]

let searchTimeout = null
const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.pagination.page = 1
    store.fetchPaymentMethods(true)
  }, 300)
}

const clearSearch = () => {
  store.filters.search = ''
  onSearchInput()
}

const onMethodTypeChange = (val) => {
  store.filters.method_type = val
  store.pagination.page = 1
  store.fetchPaymentMethods(true)
}

// ── Inline Edit Label State ──
const editingId = ref(null)
const editingLabel = ref('')
const savingId = ref(null)
const labelInput = ref(null)
const togglingId = ref(null)

// ── Handlers ──
const handleOpenEdit = (record) => {
  selectedPaymentMethod.value = record
  isEditDialogOpen.value = true
}

const handleOpenCreate = () => {
  selectedPaymentMethod.value = null
  isEditDialogOpen.value = true
}

const startEdit = async (record) => {
  editingId.value = record.id
  editingLabel.value = record.wallet_label ?? ''
  await nextTick()
  labelInput.value?.focus()
}

const cancelEdit = () => {
  editingId.value = null
  editingLabel.value = ''
}

const saveLabel = async (record) => {
  if (!editingLabel.value.trim()) return
  savingId.value = record.id
  await store.updatePaymentMethod(record.id, { wallet_label: editingLabel.value.trim() })
  savingId.value = null
  editingId.value = null
}

const toggleActive = async (record) => {
  togglingId.value = record.id
  await store.updatePaymentMethod(record.id, { is_active: !record.is_active })
  togglingId.value = null
}

const handlePageChange = (page) => {
  store.setPage(page)
}

// ── Helpers ──
const isDepositEnabled = (record) => {
  if (!record.enable_deposit) return false
  if (record.disable_client_deposit !== undefined && record.disable_client_deposit !== null) {
    return !Boolean(record.disable_client_deposit)
  }
  return Boolean(record.enable_deposit)
}

const isWithdrawalEnabled = (record) => {
  if (!record.enable_withdrawal) return false
  if (record.disable_client_withdrawal !== undefined && record.disable_client_withdrawal !== null) {
    return !Boolean(record.disable_client_withdrawal)
  }
  return Boolean(record.enable_withdrawal)
}

const getGatewayBadgeClass = (gateway) => {
  const g = (gateway || '').toLowerCase()
  if (g.includes('paymaxis')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  if (g.includes('upi')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  if (g.includes('bank')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  if (g.includes('crypto') || g.includes('coinsbuy')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (g.includes('internal')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  return 'bg-primary/10 text-primary border-primary/20'
}

const formatLimitRange = (min, max) => {
  const minNum = Number(min) || 0
  const maxNum = Number(max) || 0

  if (minNum === 0 && maxNum === 0) return 'No Limit'
  if (minNum > 0 && maxNum === 0) return `$${minNum.toLocaleString()} min`
  if (minNum === 0 && maxNum > 0) return `Up to $${maxNum.toLocaleString()}`
  return `$${minNum.toLocaleString()} – $${maxNum.toLocaleString()}`
}

const getDepositTooltip = (record) => {
  const min = Number(record.minimum_deposit_amount) || 0
  const max = Number(record.maximum_deposit_amount) || 0
  const minStr = min > 0 ? `$${min.toLocaleString()}` : '$0 (No Min)'
  const maxStr = max > 0 ? `$${max.toLocaleString()}` : 'No Max Limit'
  return `Deposit: Min ${minStr} • Max ${maxStr}`
}

const getWithdrawTooltip = (record) => {
  const min = Number(record.minimum_withdrawal_amount) || 0
  const max = Number(record.maximum_withdrawal_amount) || 0
  const minStr = min > 0 ? `$${min.toLocaleString()}` : '$0 (No Min)'
  const maxStr = max > 0 ? `$${max.toLocaleString()}` : 'No Max Limit'
  return `Withdrawal: Min ${minStr} • Max ${maxStr}`
}

const getDailyWdTooltip = (record) => {
  const count = record.maximum_withdrawals_per_day
  return count ? `Daily Limit: Max ${count} withdrawal(s) per day` : 'Daily Limit: Unlimited withdrawals allowed'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

onMounted(() => store.fetchPaymentMethods())
</script>