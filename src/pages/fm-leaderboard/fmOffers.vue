<template>
  <div class="space-y-6 py-2">
    <!-- Top Header / FM Basic Info Banner -->
    <div class="bg-card-background border border-primary-border rounded-2xl p-4 sm:p-5 shadow-2xs">
      <div v-if="fmInfo" class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
            {{ (fmInfo.label_name || 'FM')[0].toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base font-bold text-primary-text truncate">
                {{ fmInfo.label_name || 'Fund Manager Offers' }}
              </h2>
              <span
                class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                :class="fmInfo.is_active ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-background text-secondary-text border-primary-border'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="fmInfo.is_active ? 'bg-primary-green' : 'bg-zinc-400'" />
                {{ fmInfo.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span class="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md border text-secondary-text bg-background/80 border-primary-border">
                {{ fmInfo.visibility_type || 'public' }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-xs text-secondary-text mt-1 flex-wrap font-medium">
              <span v-if="fmInfo.user?.email" class="flex items-center gap-1 font-mono text-primary-text select-all">
                <Mail class="w-3.5 h-3.5 text-primary shrink-0" />
                {{ fmInfo.user.email }}
              </span>
              <span v-if="fmInfo.user?.name" class="text-secondary-text">
                Owner: <strong class="text-primary-text">{{ fmInfo.user.name }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- Summary Specs & Actions -->
        <div class="flex items-center gap-3 shrink-0 flex-wrap">
          <div class="flex items-center gap-3 text-xs bg-background/60 border border-primary-border/60 rounded-xl px-3.5 py-2 shrink-0 flex-wrap">
            <div>
              <span class="text-[9px] uppercase text-secondary-text block font-semibold">Master Account</span>
              <span class="font-bold text-primary-text font-mono text-xs">{{ fmInfo.master_account?.account_number || `#${fmInfo.master_account_id}` }}</span>
            </div>
            <div class="h-6 w-px bg-primary-border/60" />
            <div>
              <span class="text-[9px] uppercase text-secondary-text block font-semibold">Coverage Account</span>
              <span class="font-bold text-primary-text font-mono text-xs">{{ fmInfo.coverage_account?.account_number || `#${fmInfo.coverage_account_id}` }}</span>
            </div>
            <div class="h-6 w-px bg-primary-border/60" />
            <div>
              <span class="text-[9px] uppercase text-secondary-text block font-semibold">Perf Fee / Min Cap</span>
              <span class="font-bold text-primary text-xs">{{ fmInfo.performance_fee }}% · {{ formatCurrency(fmInfo.min_capital, activeCurrency) }}</span>
            </div>
          </div>

          <button
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            @click="openCreateDialog"
          >
            <Plus class="w-3.5 h-3.5" /> New Offer
          </button>

          <Tooltip text="Refresh List">
            <button
              class="p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="fetchOffers(true)"
              :disabled="loading"
              title="Refresh List"
            >
              <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div v-else class="flex items-center justify-between gap-3">
        <h2 class="text-base font-bold text-primary-text">
          Offers List <span class="text-xs text-secondary-text font-normal">(FM #{{ fmId }})</span>
        </h2>
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            @click="openCreateDialog"
          >
            <Plus class="w-3.5 h-3.5" /> New Offer
          </button>
          <Tooltip text="Refresh List">
            <button
              class="p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="fetchOffers(true)"
              :disabled="loading"
              title="Refresh List"
            >
              <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- SKELETON LOADING STATE -->
    <template v-if="loading">
      <div class="hidden md:block w-full border border-primary-border rounded-2xl overflow-hidden bg-card-background/40">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-primary-border bg-card-background/50">
              <th v-for="n in 6" :key="n" class="px-4 py-3">
                <div class="h-3 w-16 bg-background rounded animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in 5" :key="n" class="border-b border-primary-border/60 last:border-none">
              <td v-for="i in 6" :key="i" class="px-4 py-4">
                <div class="h-4 bg-background rounded animate-pulse" :class="i === 1 ? 'w-32' : 'w-16'" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- EMPTY STATE -->
    <div
      v-else-if="offers.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-border bg-card-background/30 py-20 px-4 text-center"
    >
      <div class="w-16 h-16 rounded-2xl bg-background border border-primary-border flex items-center justify-center mb-4 shadow-xs">
        <Tag class="w-7 h-7 text-secondary-text" />
      </div>
      <p class="text-base font-semibold text-primary-text mb-1">No Offers Created Yet</p>
      <p class="text-xs text-secondary-text max-w-sm mb-4">
        No subscription offers have been configured for this Fund Manager yet.
      </p>
      <button
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
        @click="openCreateDialog"
      >
        <Plus class="w-3.5 h-3.5" /> Create Offer
      </button>
    </div>

    <!-- MAIN CONTENT -->
    <template v-else>
      <!-- Desktop Table View -->
      <div class="hidden md:block w-full border border-primary-border rounded-2xl overflow-hidden bg-card-background/40 shadow-sm">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr class="border-b border-primary-border bg-background/60 text-secondary-text font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-4 whitespace-nowrap">Offer Name & Code</th>
              <th class="py-3.5 px-4 whitespace-nowrap">Visibility & Status</th>
              <th class="py-3.5 px-4 whitespace-nowrap">Subscribers & Links</th>
              <th class="py-3.5 px-4 whitespace-nowrap">Collected Fees & Min Capital</th>
              <th class="py-3.5 px-4 whitespace-nowrap">Fee Structure</th>
              <th class="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="offer in offers" :key="offer.id">
              <tr
                class="border-b border-primary-border/60 hover:bg-background/50 transition-colors cursor-pointer"
                :class="activeOfferId === offer.id ? 'bg-primary/5 border-primary/20' : ''"
              >
                <!-- Offer Name & Code -->
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Tag class="w-4 h-4" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-primary-text text-xs truncate" :title="offer.name">
                        {{ offer.name || 'Unnamed Offer' }}
                      </p>
                      <p class="text-[11px] font-semibold text-primary font-mono select-all truncate">
                        {{ offer.offer_code }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Visibility & Status -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      class="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 shadow-2xs"
                      :class="offer.is_active
                        ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                        : 'bg-background text-secondary-text border-primary-border'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="offer.is_active ? 'bg-primary-green animate-pulse' : 'bg-zinc-400'" />
                      {{ offer.is_active ? 'Active' : 'Inactive' }}
                    </span>
                    <span class="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md border text-secondary-text bg-background/80 border-primary-border">
                      {{ offer.visibility || 'public' }}
                    </span>
                  </div>
                </td>

                <!-- Subscribers & Links -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="space-y-0.5">
                    <p class="text-xs font-bold text-primary-text">
                      {{ offer.subscribers_count ?? 0 }} <span class="text-secondary-text font-normal text-[11px]">subscribers</span>
                    </p>
                    <p class="text-[10px] font-medium text-secondary-text">
                      {{ offer.join_link_count ?? 0 }} join link(s)
                    </p>
                  </div>
                </td>

                <!-- Collected Fees & Min Balance -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="space-y-0.5">
                    <p class="text-xs font-extrabold text-primary-text">
                      {{ formatCurrency(offer.total_fees_collected, getOfferCurrency(offer)) }} <span class="text-secondary-text text-[10px] font-normal">collected</span>
                    </p>
                    <p class="text-[10px] text-secondary-text">
                      Min Capital: <span class="font-bold text-primary-text font-mono">{{ formatCurrency(offer.minimum_balance, getOfferCurrency(offer)) }}</span>
                    </p>
                  </div>
                </td>

                <!-- Fee Config -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-[10px]">
                      PF: {{ offer.performance_fee }}%
                    </span>
                    <span class="px-2.5 py-1 rounded-lg bg-background/80 border border-primary-border text-primary-text font-bold text-[10px]">
                      MF: {{ offer.management_fee }}%
                    </span>
                    <span v-if="offer.registration_fee" class="px-2.5 py-1 rounded-lg bg-background/80 border border-primary-border text-secondary-text font-bold text-[10px]">
                      RF: {{ formatCurrency(offer.registration_fee, getOfferCurrency(offer)) }}
                    </span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-4 px-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      class="p-1.5 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
                      @click.stop="openEditDialog(offer)"
                      title="Edit Offer"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                      @click.stop="goToOfferDetails(offer)"
                      title="Manage Links & Agents"
                    >
                      <Link2 class="w-3.5 h-3.5" />
                      Manage
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="offer in offers"
          :key="offer.id"
          class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col gap-4 shadow-2xs"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-primary-text truncate">{{ offer.name }}</p>
              <p class="text-[11px] text-secondary-text mt-0.5 font-mono">{{ offer.offer_code }}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                :class="offer.visibility === 'public' ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'"
              >{{ offer.visibility }}</span>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                :class="offer.is_active ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
              >{{ offer.is_active ? 'Active' : 'Inactive' }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-background/80 border border-primary-border/60 rounded-xl px-3 py-2 text-center">
              <p class="text-[10px] text-secondary-text uppercase font-semibold mb-0.5">Subscribers</p>
              <p class="text-xs font-bold text-primary-text">{{ offer.subscribers_count ?? 0 }}</p>
            </div>
            <div class="bg-background/80 border border-primary-border/60 rounded-xl px-3 py-2 text-center">
              <p class="text-[10px] text-secondary-text uppercase font-semibold mb-0.5">Join Links</p>
              <p class="text-xs font-bold text-primary-text">{{ offer.join_link_count ?? 0 }}</p>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background text-xs font-semibold transition-colors cursor-pointer"
              @click="openEditDialog(offer)"
            >
              <Pencil class="w-3.5 h-3.5" /> Edit
            </button>
            <button
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer"
              @click="goToOfferDetails(offer)"
            >
              <Link2 class="w-3.5 h-3.5" /> Manage
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- CREATE / EDIT OFFER DIALOG -->
    <CreateOfferDialog
      :open="createDialogOpen"
      :edit-offer="editingOffer"
      :fm-id="fmId"
      :currency="activeCurrency"
      @close="closeCreateDialog"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RotateCw, Tag, Mail, ChevronDown, Link2, Users, Loader2, Plus, Pencil } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import Tooltip from '@/components/common/Tooltip.vue'
import CreateOfferDialog from '@/components/fmOffers/CreateOfferDialog.vue'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

const fmId = route.params.id
const fmInfo = ref(null)
const offers = ref([])
const loading = ref(false)

const activeOfferId = ref(null)
const joinLinks = ref([])
const agents = ref([])
const linksLoading = ref(false)
const agentsLoading = ref(false)

const createDialogOpen = ref(false)
const editingOffer = ref(null)

const openCreateDialog = () => {
  editingOffer.value = null
  createDialogOpen.value = true
}

const openEditDialog = (offer) => {
  editingOffer.value = { ...offer }
  createDialogOpen.value = true
}

const closeCreateDialog = () => {
  createDialogOpen.value = false
  editingOffer.value = null
  fetchOffers(true)
}

const goToOfferDetails = (offer) => {
  localStorage.setItem('active_offer', JSON.stringify(offer))
  router.push({
    path: `/fm-offers/${offer.id}`,
    query: {
      fm_id: fmId || offer.fund_manager_id || offer.fm_id,
      currency: getOfferCurrency(offer),
    },
  })
}

const loadFmInfo = () => {
  try {
    const raw = localStorage.getItem('active_fm')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (String(parsed?.id) === String(fmId)) {
        fmInfo.value = parsed
      }
    }
  } catch (e) {
    console.error('Failed to load active FM from localStorage:', e)
  }
}

const fmt = (val) => {
  const num = Number(val ?? 0)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const activeCurrency = computed(() => {
  return (
    route.query.currency ||
    fmInfo.value?.broker_currency ||
    fmInfo.value?.currency ||
    fmInfo.value?.coverage_account?.broker_currency ||
    fmInfo.value?.master_account?.broker_currency ||
    'USD'
  )
})

const getOfferCurrency = (offer) => {
  return (
    offer?.broker_currency ||
    offer?.currency ||
    activeCurrency.value ||
    'USD'
  )
}

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

const formatDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const formatShare = (s) => (s === null || s === undefined || s === '') ? '—' : `${Number(s)}%`
const formatAgentAccount = (a) => a?.trading_account_id ?? a?.account_number ?? a?.trading_account?.account_number ?? '—'

const fetchOffers = (force = false) => {
  if (!fmId) return
  loading.value = true

  apiRequest(urls.KEYS.GET, `${urls.fm.offers}/${fmId}`, {
    isTokenRequired: true,
    onSuccess: (res) => {
      offers.value = res?.data || []
      loading.value = false
    },
    onFailure: (err) => {
      loading.value = false
      snackbar.show(err?.error || err?.message || 'Failed to load FM offers.', 'error')
    },
  })
}

const fetchOfferJoinLinks = (offerId) => {
  linksLoading.value = true
  joinLinks.value = []

  const endpoint = urls.fm?.offerJoinLinks ? `${urls.fm.offerJoinLinks}/${offerId}` : `/offers/join-links/${offerId}`
  apiRequest(urls.KEYS.GET, endpoint, {
    isTokenRequired: true,
    onSuccess: (res) => {
      joinLinks.value = res?.data || []
      linksLoading.value = false
    },
    onFailure: () => {
      linksLoading.value = false
    },
  })
}

const fetchOfferAgents = (offerId) => {
  agentsLoading.value = true
  agents.value = []

  const endpoint = urls.fm?.offerAgents ? `${urls.fm.offerAgents}/${offerId}` : `/offers/agents/${offerId}`
  apiRequest(urls.KEYS.GET, endpoint, {
    isTokenRequired: true,
    onSuccess: (res) => {
      agents.value = res?.data || []
      agentsLoading.value = false
    },
    onFailure: () => {
      agentsLoading.value = false
    },
  })
}
onMounted(() => {
  loadFmInfo()
  fetchOffers()
})
</script>
