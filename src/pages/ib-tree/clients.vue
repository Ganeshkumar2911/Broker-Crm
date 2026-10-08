<template>
  <div class="px-4 pb-8">

    <!-- IB Header -->
    <div v-if="store.loading" class="bg-card-background border border-primary-border rounded-2xl p-5 mb-6 animate-pulse">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-background shrink-0" />
        <div class="space-y-1.5 flex-1">
          <div class="h-4 w-32 bg-background rounded" />
          <div class="h-2.5 w-44 bg-background rounded" />
        </div>
      </div>
    </div>

    <div v-else class="bg-card-background border border-primary-border rounded-2xl p-5 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
            {{ store.ib?.name?.charAt(0)?.toUpperCase() ?? 'I' }}
          </div>
          <div>
            <p class="text-sm font-semibold text-primary-text">{{ store.ib?.name }}</p>
            <p class="text-[11px] text-secondary-text">{{ store.ib?.email }} · {{ store.ib?.referral_code }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[11px] px-2.5 py-1 rounded-full bg-background border border-primary-border text-secondary-text">
            L{{ store.ib?.level }}
          </span>
          <span class="text-[11px] px-2.5 py-1 rounded-full bg-background border border-primary-border text-secondary-text">
            {{ store.ib?.total_clients }} Clients
          </span>
          <span class="text-[11px] px-2.5 py-1 rounded-full bg-background border border-primary-border text-secondary-text">
            {{ store.ib?.downline_ibs }} Downline IBs
          </span>
        </div>
      </div>
    </div>

    <!-- Header + Search -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-base font-semibold text-primary-text">Clients</h1>
        <p class="text-xs text-secondary-text mt-0.5">Clients referred under this IB</p>
      </div>

      <BaseSelect
        :modelValue="store.pagination.per_page"
        :options="store.perPageOptions"
        placeholder="Per page..."
        class="w-full sm:w-32 xl:w-32"
        @update:modelValue="(val) => store.updatePerPage(route.params.id, val)"
      />
      <!-- <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Search clients..."
          class="pl-8 pr-3 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text w-52"
          @input="onSearch"
        />
      </div> -->
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block border border-primary-border rounded-2xl overflow-hidden">
      <table class="w-full border-collapse">
        <thead class="border-b border-primary-border bg-card-background">
          <tr>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Client</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">KYC</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">IB</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Referral Link</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Wallet</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">PnL</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Accounts</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Followings</th>
            <th class="text-left text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Joined</th>
            <th class="text-right text-[11px] font-medium text-secondary-text uppercase tracking-widest px-4 py-3">Status</th>
          </tr>
        </thead>

        <!-- Skeleton -->
        <tbody v-if="store.loading">
          <tr v-for="n in 6" :key="n" class="border-b border-primary-border bg-card-background animate-pulse">
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-background shrink-0" />
                <div class="space-y-1.5">
                  <div class="h-3 w-24 bg-background rounded" />
                  <div class="h-2.5 w-32 bg-background rounded" />
                </div>
              </div>
            </td>
            <td class="px-4 py-3.5"><div class="h-5 w-16 bg-background rounded-full" /></td>
            <td class="px-4 py-3.5">
              <div class="space-y-1.5">
                <div class="h-3 w-20 bg-background rounded" />
                <div class="h-2.5 w-24 bg-background rounded" />
              </div>
            </td>
            <td class="px-4 py-3.5">
              <div class="space-y-1.5">
                <div class="h-4 w-16 bg-background rounded-full" />
                <div class="h-2.5 w-20 bg-background rounded" />
              </div>
            </td>
            <td class="px-4 py-3.5"><div class="h-3 w-16 bg-background rounded" /></td>
            <td class="px-4 py-3.5"><div class="h-3 w-16 bg-background rounded" /></td>
            <td class="px-4 py-3.5"><div class="h-3 w-8 bg-background rounded" /></td>
            <td class="px-4 py-3.5"><div class="h-3 w-8 bg-background rounded" /></td>
            <td class="px-4 py-3.5"><div class="h-3 w-20 bg-background rounded" /></td>
            <td class="px-4 py-3.5 flex justify-end"><div class="h-5 w-14 bg-background rounded-full" /></td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else-if="store.records.length === 0">
          <tr>
            <td colspan="10" class="py-20 text-center bg-card-background">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                  <Users class="w-5 h-5 text-secondary-text" />
                </div>
                <p class="text-sm font-semibold text-primary-text">No clients found</p>
                <p class="text-xs text-secondary-text">Try adjusting your search</p>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr
            v-for="client in store.records"
            :key="client.user_id"
            class="border-b border-primary-border last:border-none bg-card-background hover:bg-background transition-colors"
          >
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-white shrink-0">
                  {{ client.name?.charAt(0)?.toUpperCase() }}
                </div>
                <div>
                  <p class="text-xs font-medium text-primary-text">{{ client.name }}</p>
                  <p class="text-[11px] text-secondary-text">{{ client.email }}</p>
                </div>
              </div>
            </td>

            <td class="px-4 py-3.5">
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize" :class="kycClass(client.kyc_status)">
                {{ client.kyc_status?.replace('_', ' ') }}
              </span>
            </td>

            <td class="px-4 py-3.5">
              <div v-if="client.owner_ib" class="space-y-0.5">
                <p class="text-xs font-medium text-primary-text">{{ client.owner_ib.name }}</p>
                <p class="text-[10px] text-secondary-text">{{ client.owner_ib.email }}</p>
                <p class="text-[10px] text-secondary-text">
                  ID: {{ client.owner_ib.ib_id }} · Ref: {{ client.owner_ib.referral_code }} · L{{ client.owner_ib.level }}
                </p>
              </div>
              <span v-else class="text-xs text-secondary-text/50">—</span>
            </td>

            <td class="px-4 py-3.5">
              <div v-if="client.referral_link" class="space-y-1">
                <span
                  class="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 px-1.5 py-0.5 rounded-full select-all"
                  :title="client.referral_link.name"
                >
                  <Link2 class="w-2.5 h-2.5 shrink-0" />
                  <span>{{ client.referral_link.code }}</span>
                </span>
                <p class="text-[10px] text-primary-text truncate max-w-[120px]" :title="client.referral_link.name">
                  {{ client.referral_link.name }}
                </p>
              </div>
              <span v-else class="text-xs text-secondary-text/50">—</span>
            </td>

            <td class="px-4 py-3.5 text-xs text-primary-text tabular-nums">${{ fmt(client.wallet_balance) }}</td>

            <td class="px-4 py-3.5">
              <span class="text-xs font-medium tabular-nums" :class="client.total_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'">
                {{ client.total_pnl >= 0 ? '+' : '' }}${{ fmt(client.total_pnl) }}
              </span>
            </td>

            <td class="px-4 py-3.5 text-xs text-primary-text">{{ client.trading_accounts }}</td>
            <td class="px-4 py-3.5 text-xs text-primary-text">{{ client.active_followings }}</td>
            <td class="px-4 py-3.5 text-xs text-secondary-text">{{ formatDate(client.joined_at) }}</td>

            <td class="px-4 py-3.5 text-right">
              <span
                class="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                :class="client.is_active
                  ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                  : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
              >
                {{ client.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-3">
      <template v-if="store.loading">
        <div v-for="n in 4" :key="n" class="bg-card-background border border-primary-border rounded-2xl p-4 animate-pulse space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-background shrink-0" />
            <div class="space-y-1.5 flex-1">
              <div class="h-3 w-32 bg-background rounded" />
              <div class="h-2.5 w-40 bg-background rounded" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="m in 4" :key="m" class="h-12 bg-background rounded-xl" />
          </div>
        </div>
      </template>

      <div v-else-if="store.records.length === 0" class="py-16 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-card-background flex items-center justify-center">
            <Users class="w-5 h-5 text-secondary-text" />
          </div>
          <p class="text-sm font-medium text-primary-text">No clients found</p>
        </div>
      </div>

      <div
        v-else
        v-for="client in store.records"
        :key="client.user_id"
        class="bg-card-background border border-primary-border rounded-2xl p-4 space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-black shrink-0">
              {{ client.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-medium text-primary-text">{{ client.name }}</p>
              <p class="text-[11px] text-secondary-text">{{ client.email }}</p>
            </div>
          </div>
          <span
            class="text-[11px] font-medium px-2 py-0.5 rounded-full border"
            :class="client.is_active
              ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
              : 'bg-primary-red/10 text-primary-red border-primary-red/20'"
          >
            {{ client.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-background rounded-xl px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">KYC</p>
            <span class="font-medium capitalize" :class="kycClass(client.kyc_status).split(' ')[1]">
              {{ client.kyc_status?.replace('_', ' ') }}
            </span>
          </div>
          <div class="bg-background rounded-xl px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Wallet</p>
            <p class="font-medium text-primary-text">${{ fmt(client.wallet_balance) }}</p>
          </div>
          <div class="bg-background rounded-xl px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">PnL</p>
            <p class="font-medium tabular-nums" :class="client.total_pnl >= 0 ? 'text-primary-green' : 'text-primary-red'">
              {{ client.total_pnl >= 0 ? '+' : '' }}${{ fmt(client.total_pnl) }}
            </p>
          </div>
          <div class="bg-background rounded-xl px-3 py-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Accounts / Following</p>
            <p class="font-medium text-primary-text">{{ client.trading_accounts }} / {{ client.active_followings }}</p>
          </div>
          <div v-if="client.owner_ib" class="bg-background rounded-xl px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Owner IB</p>
            <p class="font-medium text-primary-text">{{ client.owner_ib.name }} (L{{ client.owner_ib.level }})</p>
            <p class="text-[10px] text-secondary-text">{{ client.owner_ib.email }} · Ref: {{ client.owner_ib.referral_code }}</p>
          </div>
          <div v-if="client.referral_link" class="bg-background rounded-xl px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Referral Link</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 px-1.5 py-0.5 rounded-full select-all">
                <Link2 class="w-2.5 h-2.5 shrink-0" />
                <span>{{ client.referral_link.code }}</span>
              </span>
              <span class="text-xs text-primary-text">{{ client.referral_link.name }}</span>
            </div>
          </div>
          <div class="bg-background rounded-xl px-3 py-2 col-span-2">
            <p class="text-[10px] text-secondary-text mb-0.5">Joined</p>
            <p class="font-medium text-primary-text">{{ formatDate(client.joined_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <Pagination
        v-if="store.pagination.total_items > store.pagination.per_page"
        :pagination="store.pagination"
        @page-change="handlePageChange"
      />
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Users, Link2 } from 'lucide-vue-next'
import { useIbClientsStore } from '@/stores/ibTree/ibClients'
import Pagination from '@/components/common/Pagination.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const store = useIbClientsStore()
const route = useRoute()

let searchTimer = null
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(route.params.id), 400)
}

const handlePageChange = (page) => {
  store.setPage(page)
  store.fetchClients(route.params.id, true)
}

const fmt = (v) => (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const kycClass = (status) => ({
  approved:  'bg-primary-green/10 text-primary-green border-primary-green/20',
  in_review: 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20',
  rejected:  'bg-primary-red/10 text-primary-red border-primary-red/20',
}[status] ?? 'bg-background text-secondary-text border-primary-border')

onMounted(() => store.fetchClients(route.params.id))
</script>