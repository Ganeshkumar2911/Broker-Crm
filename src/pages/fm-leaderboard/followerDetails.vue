<template>
  <div class="space-y-6 py-2">
    <!-- Loading Skeleton -->
    <div v-if="store.loading" class="space-y-6 animate-pulse">
      <div class="bg-card-background border border-primary-border rounded-lg p-6 space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-13 h-13 rounded-lg bg-background" />
          <div class="space-y-2 flex-1">
            <div class="h-5 w-48 bg-background rounded" />
            <div class="h-3 w-32 bg-background rounded" />
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-primary-border/60">
          <div v-for="n in 4" :key="n" class="h-16 bg-background rounded-lg" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 space-y-4">
          <div class="h-44 bg-card-background border border-primary-border rounded-lg" />
          <div class="h-44 bg-card-background border border-primary-border rounded-lg" />
        </div>
        <div class="space-y-4">
          <div class="h-44 bg-card-background border border-primary-border rounded-lg" />
          <div class="h-44 bg-card-background border border-primary-border rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!store.details"
      class="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary-border bg-card-background/40 py-20 px-4 text-center shadow-2xs"
    >
      <div class="w-14 h-14 rounded-lg bg-background border border-primary-border flex items-center justify-center mb-3 text-secondary-text shadow-2xs">
        <UserX class="w-6 h-6 opacity-60" />
      </div>
      <h3 class="text-sm font-bold text-primary-text mb-1">Follower Details Not Found</h3>
      <p class="text-xs text-secondary-text max-w-sm mb-4">
        This follower record could not be located or may have been deactivated.
      </p>
      <button
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        @click="goBack"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Return to Followers List</span>
      </button>
    </div>

    <!-- MAIN FOLLOWER DETAILS CONTENT -->
    <template v-else>
      <!-- HERO FOLLOWER PROFILE BANNER -->
      <div class="bg-card-background border border-primary-border rounded-lg p-5 sm:p-6 shadow-2xs relative overflow-hidden">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <!-- Left: User Identity -->
          <div class="flex items-start sm:items-center gap-4 min-w-0">
            <div class="w-13 h-13 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-lg shrink-0 shadow-xs">
              <UserCheck class="w-6 h-6" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2.5 flex-wrap">
                <h1 class="text-lg sm:text-xl font-bold text-primary-text tracking-tight truncate">
                  {{ store.details.user_name || 'Subscriber Account' }}
                </h1>

                <span
                  class="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 shadow-2xs"
                  :class="store.details.is_active !== false
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="store.details.is_active !== false ? 'bg-primary-green animate-pulse' : 'bg-primary-red'"
                  />
                  {{ store.details.is_active !== false ? 'Active Follower' : 'Inactive' }}
                </span>

                <span
                  v-if="store.details.lot_type"
                  class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-primary-border bg-background text-secondary-text"
                >
                  {{ store.details.lot_type }}
                </span>

                <span
                  v-if="store.details.broker_currency || store.details.currency"
                  class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-primary-green/20 bg-primary-green/10 text-primary-green"
                >
                  {{ getCurrencySymbol(activeCurrency) }} {{ activeCurrency }}
                </span>
              </div>

              <!-- Subtitle / Contact Row -->
              <div class="flex items-center gap-3 text-xs text-secondary-text mt-2 flex-wrap font-medium">
                <button
                  v-if="store.details.user_email"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-primary-border font-mono text-[11px] font-bold text-primary hover:border-primary/40 transition-colors cursor-pointer"
                  @click="copyText(store.details.user_email, 'Email address')"
                  title="Click to copy email"
                >
                  <Mail class="w-3 h-3 text-secondary-text" />
                  <span>{{ store.details.user_email }}</span>
                  <Check v-if="copiedField === 'email'" class="w-3 h-3 text-primary-green" />
                  <Copy v-else class="w-3 h-3 opacity-60" />
                </button>

                <span v-if="store.details.account_number" class="inline-flex items-center gap-1 font-mono text-primary-text">
                  <Layers class="w-3.5 h-3.5 text-secondary-text" />
                  Account #{{ store.details.account_number }}
                </span>

                <span v-if="store.details.created_at" class="flex items-center gap-1">
                  <Calendar class="w-3.5 h-3.5 opacity-60" />
                  Joined {{ store.details.created_at }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right Quick Stat / Offer Identifier & Actions -->
          <div class="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-background hover:bg-card-background text-primary-text hover:text-primary text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              @click="
                router.push({
                  path: `/follower/trade-book/${route.params.id}`,
                  query: {
                    fm_id: route.query.fm_id,
                    account_number: store.details?.account_number,
                    trading_account_id: store.details?.trading_account_id,
                    currency: activeCurrency,
                    user_name: store.details?.user_name || store.details?.name,
                    broker_group: store.details?.broker_group,
                    copy_ratio: store.details?.copy_ratio,
                    is_active: store.details?.is_active,
                  },
                })
              "
            >
              <BookOpen class="w-3.5 h-3.5 text-primary" />
              <span>Trade Book</span>
            </button>

            <button
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              @click="editDialogOpen = true"
            >
              <Pencil class="w-3.5 h-3.5" />
              <span>Edit Follower</span>
            </button>

            <Tooltip text="Refresh Follower Details">
              <button
                class="p-2 rounded-lg border border-primary-border bg-card-background text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer shadow-2xs"
                :disabled="store.loading"
                @click="store.fetchDetails(route.params.id)"
              >
                <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': store.loading }" />
              </button>
            </Tooltip>
          </div>
        </div>

        <!-- KPI SUMMARY STRIP -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-primary-border/60">
          <!-- 1. Follower Capital Balance -->
          <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background">
            <div class="flex items-center justify-between text-secondary-text mb-1">
              <span class="text-[10px] uppercase font-bold tracking-wider">Account Balance</span>
              <Wallet class="w-3.5 h-3.5 text-primary-green" />
            </div>
            <p class="text-base sm:text-lg font-extrabold text-primary-text font-mono">
              {{ formatCurrency(store.details.balance) }}
            </p>
          </div>

          <!-- 2. Performance Fee -->
          <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background">
            <div class="flex items-center justify-between text-secondary-text mb-1">
              <span class="text-[10px] uppercase font-bold tracking-wider">Performance Fee</span>
              <TrendingUp class="w-3.5 h-3.5 text-primary" />
            </div>
            <p class="text-base sm:text-lg font-extrabold text-primary font-mono">
              {{ store.details.performance_fee ?? 0 }}%
            </p>
          </div>

          <!-- 3. Management Fee -->
          <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background">
            <div class="flex items-center justify-between text-secondary-text mb-1">
              <span class="text-[10px] uppercase font-bold tracking-wider">Management Fee</span>
              <Clock class="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p class="text-base sm:text-lg font-extrabold text-primary-text font-mono">
              {{ store.details.management_fee ?? 0 }}%
            </p>
          </div>

          <!-- 4. Registration Fee -->
          <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3.5 transition-all hover:bg-background">
            <div class="flex items-center justify-between text-secondary-text mb-1">
              <span class="text-[10px] uppercase font-bold tracking-wider">Registration Fee</span>
              <Shield class="w-3.5 h-3.5 text-primary-yellow" />
            </div>
            <p class="text-base sm:text-lg font-extrabold text-primary-text font-mono">
              {{ formatCurrency(store.details.registration_fee) }}
            </p>
          </div>
        </div>
      </div>

      <!-- DETAILED SPECIFICATIONS GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <!-- Left Column: Trading Account & Copy Rules -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Trading Account Details Card -->
          <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
            <div class="flex items-center justify-between px-4 py-3 border-b border-primary-border bg-background/40">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  <Layers class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-primary-text">Follower Trading Account</h3>
                  <p class="text-[11px] text-secondary-text">Trading credentials and broker connection details</p>
                </div>
              </div>
            </div>

            <div class="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3">
                <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-1">Account Number</p>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-primary-text font-mono select-all">
                    {{ store.details.account_number || '—' }}
                  </span>
                  <button
                    v-if="store.details.account_number"
                    class="text-secondary-text hover:text-primary transition-colors cursor-pointer"
                    @click="copyText(store.details.account_number, 'Account Number')"
                    title="Copy Account Number"
                  >
                    <Copy class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3">
                <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-1">Trading Account ID</p>
                <p class="text-sm font-bold text-primary-text font-mono">
                  #{{ store.details.trading_account_id ?? '—' }}
                </p>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3">
                <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-1">Broker Label</p>
                <p class="text-xs font-bold text-primary-text truncate">
                  {{ store.details.broker_label || 'Default Broker' }}
                </p>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3">
                <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-1">Server Routing</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <Server class="w-3.5 h-3.5 text-primary opacity-80" />
                  <span class="text-xs font-bold text-primary-text uppercase font-mono">
                    {{ store.details.server || 'COPY_TRADING' }}
                  </span>
                </div>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3">
                <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-1">Available Balance</p>
                <p class="text-sm font-black text-primary-green font-mono">
                  {{ formatCurrency(store.details.balance) }}
                </p>
              </div>

              <div class="bg-background/60 border border-primary-border/60 rounded-lg p-3">
                <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-1">Settlement Mode</p>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-primary-border bg-background text-secondary-text inline-block">
                  {{ store.details.settlement_type || 'Standard' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Subscription Copy Sizing Configuration Card -->
          <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
            <div class="flex items-center justify-between px-4 py-3 border-b border-primary-border bg-background/40">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-md bg-primary-green/10 text-primary-green flex items-center justify-center font-bold text-xs">
                  <SlidersHorizontal class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-primary-text">Copy Trading Execution Settings</h3>
                  <p class="text-[11px] text-secondary-text">Lot multiplier and sizing parameters configured for this follower</p>
                </div>
              </div>
              <button
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary-border bg-background hover:bg-card-background text-primary-text hover:text-primary text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                @click="editDialogOpen = true"
              >
                <Pencil class="w-3 h-3 text-secondary-text" />
                <span>Edit</span>
              </button>
            </div>

            <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="bg-background border border-primary-border rounded-lg p-3.5 flex items-center justify-between">
                <div>
                  <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider">Lot Sizing Type</p>
                  <p class="text-sm font-bold text-primary-text capitalize mt-0.5">
                    {{ store.details.lot_type || 'Fixed Lot' }}
                  </p>
                  <p class="text-[10px] text-secondary-text mt-0.5">Volume calculation methodology</p>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {{ store.details.lot_type || 'fixed' }}
                </span>
              </div>

              <div class="bg-background border border-primary-border rounded-lg p-3.5 flex items-center justify-between">
                <div>
                  <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider">Lot Value / Ratio</p>
                  <p class="text-lg font-black text-primary-text font-mono mt-0.5">
                    {{ store.details.lot_value ?? '1.00' }}
                  </p>
                  <p class="text-[10px] text-secondary-text mt-0.5">Execution volume coefficient</p>
                </div>
                <div class="w-8 h-8 rounded-lg bg-background border border-primary-border flex items-center justify-center text-secondary-text font-bold text-xs">
                  ×
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: User Profile & Subscription Terms -->
        <div class="space-y-4">
          <!-- Client Profile Information -->
          <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
            <div class="flex items-center justify-between px-4 py-3 border-b border-primary-border bg-background/40">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  <UserCheck class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-primary-text">Follower Profile</h3>
                  <p class="text-[11px] text-secondary-text">User identity information</p>
                </div>
              </div>
            </div>

            <div class="p-4 space-y-3">
              <div>
                <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-0.5">Full Name</p>
                <p class="text-xs font-bold text-primary-text">{{ store.details.user_name || '—' }}</p>
              </div>

              <div class="pt-2 border-t border-primary-border/60">
                <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-0.5">Email Address</p>
                <p class="text-xs font-mono font-bold text-primary select-all">{{ store.details.user_email || '—' }}</p>
              </div>

              <div class="pt-2 border-t border-primary-border/60 grid grid-cols-2 gap-2">
                <div>
                  <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-0.5">Record ID</p>
                  <p class="text-xs font-mono font-bold text-primary-text">#{{ route.params.id }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <p class="text-[10px] uppercase font-bold text-secondary-text tracking-wider mb-0.5">Status</p>
                  <span
                    class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border inline-block"
                    :class="store.details.is_active !== false
                      ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                      : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
                  >
                    {{ store.details.is_active !== false ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Associated Offer Terms Card -->
          <div class="bg-card-background border border-primary-border rounded-lg overflow-hidden shadow-2xs">
            <div class="flex items-center justify-between px-4 py-3 border-b border-primary-border bg-background/40">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-md bg-primary-yellow/10 text-primary-yellow flex items-center justify-center font-bold text-xs">
                  <Tag class="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 class="text-xs font-bold text-primary-text">Offer Fee Terms</h3>
                  <p class="text-[11px] text-secondary-text">Pricing agreed upon subscription</p>
                </div>
              </div>
            </div>

            <div class="p-4 space-y-2.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-secondary-text">Performance Fee</span>
                <span class="font-extrabold text-primary font-mono">{{ store.details.performance_fee ?? 0 }}%</span>
              </div>
              <div class="flex items-center justify-between  border-t border-primary-border/60 text-xs">
                <span class="text-secondary-text">FM Share</span>
                <span class="font-extrabold text-primary font-mono">{{ store.details.fm_share ?? 0 }}%</span>
              </div>
              <div class="flex items-center justify-between border-t border-primary-border/60 text-xs">
                <span class="text-secondary-text">Broker Share</span>
                <span class="font-extrabold text-primary font-mono">{{ store.details.broker_share ?? 0 }}%</span>
              </div>
              <div class="flex items-center justify-between text-xs pt-2 border-t border-primary-border/60">
                <span class="text-secondary-text">Management Fee</span>
                <span class="font-extrabold text-primary-text font-mono">{{ store.details.management_fee ?? 0 }}%</span>
              </div>
              <div class="flex items-center justify-between text-xs pt-2 border-t border-primary-border/60">
                <span class="text-secondary-text">Registration Fee</span>
                <span class="font-extrabold text-primary-text font-mono">{{ formatCurrency(store.details.registration_fee) }}</span>
              </div>
              <div class="flex items-center justify-between text-xs pt-2 border-t border-primary-border/60">
                <span class="text-secondary-text">Subscription Date</span>
                <span class="font-semibold text-secondary-text">{{ formatDate(store.details.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Follower Drawer Dialog -->
      <EditFollowerDialog
        :open="editDialogOpen"
        :follower="editFollowerTarget"
        @close="editDialogOpen = false"
        @updated="onFollowerUpdated"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  UserCheck, UserX, RotateCw, ArrowLeft, Mail, Calendar,
  Wallet, TrendingUp, Clock, Shield, Tag, Layers, Server,
  SlidersHorizontal, Copy, Check, Pencil, BookOpen
} from 'lucide-vue-next'
import { useFollowersDetailsStore } from '@/stores/fmOffers/followersDetails'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import Tooltip from '@/components/common/Tooltip.vue'
import EditFollowerDialog from '@/components/fmOffers/EditFollowerDialog.vue'

const store = useFollowersDetailsStore()
const snackbar = useSnackbarStore()
const route = useRoute()
const router = useRouter()

const editDialogOpen = ref(false)
const copiedField = ref(null)

const editFollowerTarget = computed(() => {
  if (!store.details) return null
  return {
    ...store.details,
    id: store.details.id || route.params.id,
    name: store.details.user_name || store.details.name,
    email: store.details.user_email || store.details.email,
  }
})

const onFollowerUpdated = () => {
  store.fetchDetails(route.params.id)
}

const activeCurrency = computed(() => {
  return (
    store.details?.broker_currency ||
    store.details?.currency ||
    route.query.currency ||
    'USD'
  )
})

const getCurrencySymbol = (currency) => {
  const c = String(currency || '').trim().toUpperCase()
  if (c === 'USC' || c === 'CENT') return 'C'
  if (c === 'CAD') return 'C$'
  if (c === 'EUR') return '€'
  if (c === 'GBP') return '£'
  if (c === 'INR') return '₹'
  if (c === 'JPY') return '¥'
  if (c === 'USD') return '$'
  return c ? `${c} ` : '$'
}

const formatCurrency = (val, currency = null) => {
  if (val === null || val === undefined || isNaN(val)) return '—'
  const num = Number(val)
  if (isNaN(num)) return '—'
  const sym = getCurrencySymbol(currency || activeCurrency.value)
  return `${sym}${fmt(num)}`
}

const fmt = (v) => (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const goBack = () => {
  const fmId = route.query.fm_id
  if (fmId) {
    router.push(`/fm/followers/${fmId}`)
  } else {
    router.back()
  }
}

const copyText = async (text, label = 'Text') => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    if (label.toLowerCase().includes('email')) {
      copiedField.value = 'email'
      setTimeout(() => { copiedField.value = null }, 2000)
    }
    snackbar.show(`${label} copied to clipboard.`, 'success')
  } catch {
    snackbar.show(`Failed to copy ${label}.`, 'error')
  }
}

onMounted(() => store.fetchDetails(route.params.id))
onUnmounted(() => store.reset())
</script>
