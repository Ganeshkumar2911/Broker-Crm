<template>
  <div>
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-card-background border-l border-primary-border shadow-2xl flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-5 border-b border-primary-border flex items-center justify-between gap-4 bg-background/50 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0">
              {{ (item?.label_name || item?.user?.name || 'FM').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-primary-text truncate">
                  {{ item?.label_name || item?.user?.name || 'Fund Manager Details' }}
                </h3>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                  :class="item?.is_active
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-background text-secondary-text border-primary-border'"
                >
                  {{ item?.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span
                  v-if="item?.visibility_type"
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20"
                >
                  {{ item?.visibility_type || 'public' }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5 flex items-center gap-1">
                <Mail class="w-3.5 h-3.5 text-primary shrink-0" />
                <span class="font-medium text-primary-text select-all">{{ item?.user?.email || 'No email provided' }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Header Copy Button -->
            <button
              v-if="item?.user?.email"
              type="button"
              class="relative p-2 rounded-lg transition-all cursor-pointer overflow-visible"
              :class="copiedKey === 'header_email'
                ? 'text-primary-green bg-primary-green/10 border border-primary-green/30 ring-1 ring-primary-green/20'
                : 'text-secondary-text hover:text-primary-text hover:bg-background border border-transparent'"
              :title="copiedKey === 'header_email' ? 'Copied!' : 'Copy Email'"
              @click="copyText(item?.user?.email, 'header_email')"
            >
              <template v-if="copiedKey === 'header_email'">
                <Check class="w-4 h-4 text-primary-green animate-scale-pop" />
                <span class="sparkle-particle sparkle-1">✦</span>
                <span class="sparkle-particle sparkle-2">★</span>
                <span class="sparkle-particle sparkle-3">✦</span>
              </template>
              <Copy v-else class="w-4 h-4 transition-transform active:scale-90" />
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
        <div class="flex items-center gap-2 px-6 border-b border-primary-border bg-background/30 text-xs font-semibold shrink-0">
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'overview' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'overview'"
          >
            <UserCheck class="w-3.5 h-3.5" />
            <span>Profile & Overview</span>
          </button>
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'accounts' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'accounts'"
          >
            <Layers class="w-3.5 h-3.5" />
            <span>Master & Coverage Accounts</span>
          </button>
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'fees' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'fees'"
          >
            <DollarSign class="w-3.5 h-3.5" />
            <span>Fees & Shares</span>
          </button>
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'json' ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'json'"
          >
            <FileCode class="w-3.5 h-3.5" />
            <span>Raw Data</span>
          </button>
        </div>

        <!-- Tab Content Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- OVERVIEW TAB -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <!-- User Information Card -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between border-b border-primary-border/60 pb-2.5">
                <h4 class="text-xs font-bold uppercase tracking-wider text-secondary-text flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-primary" />
                  User Profile Information
                </h4>
                <span
                  v-if="item?.user?.kyc_status"
                  class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                  :class="getKycBadgeClass(item.user.kyc_status)"
                >
                  KYC: {{ item.user.kyc_status }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-secondary-text text-[11px] block">Full Name</span>
                  <span class="font-bold text-primary-text">{{ item?.user?.name || '—' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Email Address</span>
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-primary-text font-mono select-all">{{ item?.user?.email || '—' }}</span>
                    <button
                      v-if="item?.user?.email"
                      type="button"
                      @click="copyText(item.user.email, 'overview_email')"
                      class="relative text-secondary-text hover:text-primary transition p-1 rounded-md hover:bg-background cursor-pointer overflow-visible"
                      :class="{ 'text-primary-green': copiedKey === 'overview_email' }"
                      :title="copiedKey === 'overview_email' ? 'Copied!' : 'Copy Email'"
                    >
                      <template v-if="copiedKey === 'overview_email'">
                        <Check class="w-3.5 h-3.5 text-primary-green animate-scale-pop" />
                        <span class="sparkle-particle sparkle-1">✦</span>
                        <span class="sparkle-particle sparkle-2">★</span>
                        <span class="sparkle-particle sparkle-3">✦</span>
                      </template>
                      <Copy v-else class="w-3.5 h-3.5 transition-transform active:scale-90" />
                    </button>
                  </div>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Phone Number</span>
                  <span class="font-semibold text-primary-text">{{ item?.user?.phone_number || '—' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Country</span>
                  <span class="font-semibold text-primary-text">{{ item?.user?.country || '—' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Date of Birth</span>
                  <span class="font-medium text-primary-text">{{ item?.user?.date_of_birth || '—' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">User ID & Role</span>
                  <span class="font-mono text-primary-text">#{{ item?.user?.id || item?.user_id }} ({{ item?.user?.role || 'fm' }})</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Is IB User?</span>
                  <span class="font-semibold text-primary-text">{{ item?.user?.is_ib ? 'Yes (IB Active)' : 'No' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Sumsub Applicant ID</span>
                  <span class="font-mono text-[11px] text-primary-text truncate block max-w-[200px]" :title="item?.user?.sumsub_applicant_id">
                    {{ item?.user?.sumsub_applicant_id || '—' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- FM General Configuration -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-secondary-text border-b border-primary-border/60 pb-2.5 flex items-center gap-1.5">
                <Sliders class="w-3.5 h-3.5 text-primary" />
                Fund Manager Leaderboard Configuration
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-secondary-text text-[11px] block">Label Name</span>
                  <span class="font-bold text-primary-text">{{ item?.label_name || '—' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Leaderboard Entry ID</span>
                  <span class="font-mono font-bold text-primary">#{{ item?.id }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Visibility Type</span>
                  <span class="font-bold text-primary-text capitalize">{{ item?.visibility_type || 'public' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Follower Account Type</span>
                  <span class="font-bold text-primary-text">
                    {{ getFollowerAccountTypeLabel(item?.follower_account_type) }}
                  </span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Active Status</span>
                  <span class="font-bold" :class="item?.is_active ? 'text-primary-green' : 'text-secondary-text'">
                    {{ item?.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Settlement Schedule</span>
                  <span class="font-semibold text-primary-text capitalize">
                    {{ item?.settlement || item?.settlement_type }} (at {{ item?.settlement_time }})
                  </span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Created Date</span>
                  <span class="font-medium text-primary-text">{{ formatDate(item?.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ACCOUNTS TAB -->
          <div v-if="activeTab === 'accounts'" class="space-y-6">
            <!-- Master Account -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between border-b border-primary-border/60 pb-2.5">
                <h4 class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Briefcase class="w-3.5 h-3.5" />
                  Master Account Configuration
                </h4>
                <span class="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  ID #{{ item?.master_account_id }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-secondary-text text-[11px] block">Account Number</span>
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-primary-text text-sm select-all">
                      {{ item?.master_account?.account_number || item?.master_account_id || '—' }}
                    </span>
                    <button
                      v-if="item?.master_account?.account_number || item?.master_account_id"
                      type="button"
                      @click="copyText(item?.master_account?.account_number || item?.master_account_id, 'master_acc')"
                      class="relative text-secondary-text hover:text-primary transition p-1 rounded-md hover:bg-background cursor-pointer overflow-visible"
                      :class="{ 'text-primary-green': copiedKey === 'master_acc' }"
                      :title="copiedKey === 'master_acc' ? 'Copied!' : 'Copy Account Number'"
                    >
                      <template v-if="copiedKey === 'master_acc'">
                        <Check class="w-3.5 h-3.5 text-primary-green animate-scale-pop" />
                        <span class="sparkle-particle sparkle-1">✦</span>
                        <span class="sparkle-particle sparkle-2">★</span>
                        <span class="sparkle-particle sparkle-3">✦</span>
                      </template>
                      <Copy v-else class="w-3.5 h-3.5 transition-transform active:scale-90" />
                    </button>
                  </div>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Role</span>
                  <span class="font-bold text-primary-text uppercase">{{ item?.master_account?.account_role || 'master' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Currency</span>
                  <span class="font-bold text-primary-text">{{ item?.master_account?.broker_currency || item?.broker_currency || 'USD' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Group Config ID</span>
                  <span class="font-mono text-primary-text">#{{ item?.master_account?.group_config_id || '—' }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-secondary-text text-[11px] block">Broker Group</span>
                  <span class="font-mono font-medium text-primary-text select-all break-all bg-background p-2 rounded border border-primary-border/60 block mt-0.5">
                    {{ item?.master_account?.broker_group || item?.broker_group || '—' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Coverage Account -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between border-b border-primary-border/60 pb-2.5">
                <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <ShieldCheck class="w-3.5 h-3.5" />
                  Coverage Account Configuration
                </h4>
                <span class="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                  ID #{{ item?.coverage_account_id }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-secondary-text text-[11px] block">Account Number</span>
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-primary-text text-sm select-all">
                      {{ item?.coverage_account?.account_number || item?.coverage_account_id || '—' }}
                    </span>
                    <button
                      v-if="item?.coverage_account?.account_number || item?.coverage_account_id"
                      type="button"
                      @click="copyText(item?.coverage_account?.account_number || item?.coverage_account_id, 'coverage_acc')"
                      class="relative text-secondary-text hover:text-primary transition p-1 rounded-md hover:bg-background cursor-pointer overflow-visible"
                      :class="{ 'text-primary-green': copiedKey === 'coverage_acc' }"
                      :title="copiedKey === 'coverage_acc' ? 'Copied!' : 'Copy Account Number'"
                    >
                      <template v-if="copiedKey === 'coverage_acc'">
                        <Check class="w-3.5 h-3.5 text-primary-green animate-scale-pop" />
                        <span class="sparkle-particle sparkle-1">✦</span>
                        <span class="sparkle-particle sparkle-2">★</span>
                        <span class="sparkle-particle sparkle-3">✦</span>
                      </template>
                      <Copy v-else class="w-3.5 h-3.5 transition-transform active:scale-90" />
                    </button>
                  </div>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Role</span>
                  <span class="font-bold text-primary-text uppercase">{{ item?.coverage_account?.account_role || 'coverage' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Currency</span>
                  <span class="font-bold text-primary-text">{{ item?.coverage_account?.broker_currency || item?.broker_currency || 'USD' }}</span>
                </div>
                <div>
                  <span class="text-secondary-text text-[11px] block">Group Config ID</span>
                  <span class="font-mono text-primary-text">#{{ item?.coverage_account?.group_config_id || '—' }}</span>
                </div>
                <div class="sm:col-span-2">
                  <span class="text-secondary-text text-[11px] block">Broker Group</span>
                  <span class="font-mono font-medium text-primary-text select-all break-all bg-background p-2 rounded border border-primary-border/60 block mt-0.5">
                    {{ item?.coverage_account?.broker_group || item?.broker_group || '—' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- FEES & SHARES TAB -->
          <div v-if="activeTab === 'fees'" class="space-y-6">
            <!-- Financial Fees Breakdown -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-4">
              <h4 class="text-xs font-bold uppercase tracking-wider text-secondary-text border-b border-primary-border/60 pb-2.5 flex items-center gap-1.5">
                <DollarSign class="w-3.5 h-3.5 text-primary" />
                Capital Requirements & Fees
              </h4>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div class="bg-card-background border border-primary-border/60 rounded-xl p-3">
                  <span class="text-[10px] font-bold uppercase text-secondary-text block">Min Capital</span>
                  <span class="text-sm font-extrabold text-primary-text mt-0.5 block">
                    {{ formatMoney(item?.min_capital, item?.broker_currency) }}
                  </span>
                </div>
                <div class="bg-card-background border border-primary-border/60 rounded-xl p-3">
                  <span class="text-[10px] font-bold uppercase text-secondary-text block">Performance Fee</span>
                  <span class="text-sm font-extrabold text-primary mt-0.5 block">
                    {{ formatPercent(item?.performance_fee) }}
                  </span>
                </div>
                <div class="bg-card-background border border-primary-border/60 rounded-xl p-3">
                  <span class="text-[10px] font-bold uppercase text-secondary-text block">Management Fee</span>
                  <span class="text-sm font-extrabold text-primary-text mt-0.5 block">
                    {{ formatPercent(item?.management_fee) }}
                  </span>
                  <span class="text-[9px] text-secondary-text capitalize block mt-0.5">
                    {{ item?.management_fee_interval || 'monthly' }}
                  </span>
                </div>
                <div class="bg-card-background border border-primary-border/60 rounded-xl p-3">
                  <span class="text-[10px] font-bold uppercase text-secondary-text block">Registration Fee</span>
                  <span class="text-sm font-extrabold text-primary-text mt-0.5 block">
                    {{ item?.registration_fee ? formatMoney(item?.registration_fee, item?.broker_currency) : 'Free' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Share Distribution -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-4">
              <h4 class="text-xs font-bold uppercase tracking-wider text-secondary-text border-b border-primary-border/60 pb-2.5 flex items-center justify-between">
                <span>Revenue Share Allocation</span>
                <span class="text-primary-text font-mono font-bold">100% Total</span>
              </h4>

              <div class="space-y-3">
                <!-- Broker Share -->
                <div class="space-y-1">
                  <div class="flex justify-between text-xs">
                    <span class="text-secondary-text font-semibold">Broker Share</span>
                    <span class="font-bold text-primary">{{ formatPercent(item?.broker_share) }}</span>
                  </div>
                  <div class="w-full h-2 bg-background border border-primary-border/60 rounded-full overflow-hidden">
                    <div class="bg-primary h-full transition-all" :style="{ width: `${Math.min(100, item?.broker_share || 0)}%` }" />
                  </div>
                </div>

                <!-- FM Share -->
                <div class="space-y-1">
                  <div class="flex justify-between text-xs">
                    <span class="text-secondary-text font-semibold">Fund Manager (FM) Share</span>
                    <span class="font-bold text-indigo-400">{{ formatPercent(item?.fm_share) }}</span>
                  </div>
                  <div class="w-full h-2 bg-background border border-primary-border/60 rounded-full overflow-hidden">
                    <div class="bg-indigo-500 h-full transition-all" :style="{ width: `${Math.min(100, item?.fm_share || 0)}%` }" />
                  </div>
                </div>

                <!-- IB Pool -->
                <div class="space-y-1">
                  <div class="flex justify-between text-xs">
                    <span class="text-secondary-text font-semibold">IB Pool Percentage</span>
                    <span class="font-bold text-primary-green">{{ formatPercent(item?.ib_pool_percentage) }}</span>
                  </div>
                  <div class="w-full h-2 bg-background border border-primary-border/60 rounded-full overflow-hidden">
                    <div class="bg-primary-green h-full transition-all" :style="{ width: `${Math.min(100, item?.ib_pool_percentage || 0)}%` }" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RAW JSON TAB -->
          <div v-if="activeTab === 'json'" class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-secondary-text">Full API Response JSON</span>
              <button
                type="button"
                @click="copyText(JSON.stringify(item, null, 2), 'raw_json')"
                class="relative px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 overflow-visible"
                :class="copiedKey === 'raw_json'
                  ? 'border-primary-green/40 text-primary-green bg-primary-green/10 shadow-xs'
                  : 'border-primary/30 text-primary hover:bg-primary/10'"
              >
                <template v-if="copiedKey === 'raw_json'">
                  <Check class="w-3.5 h-3.5 text-primary-green animate-scale-pop" />
                  <span>Copied!</span>
                  <span class="sparkle-particle sparkle-1">✦</span>
                  <span class="sparkle-particle sparkle-2">★</span>
                  <span class="sparkle-particle sparkle-3">✦</span>
                </template>
                <template v-else>
                  <Copy class="w-3.5 h-3.5 transition-transform active:scale-90" />
                  <span>Copy JSON</span>
                </template>
              </button>
            </div>
            <pre class="bg-background border border-primary-border rounded-xl p-4 text-[11px] font-mono text-primary-text overflow-x-auto select-all leading-relaxed">{{ JSON.stringify(item, null, 2) }}</pre>
          </div>
        </div>

        <!-- Drawer Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-background/50 flex items-center justify-between shrink-0">
          <span class="text-xs text-secondary-text font-mono">FM Entry #{{ item?.id }}</span>
          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-card-background border border-primary-border text-primary-text hover:bg-background text-xs font-semibold transition cursor-pointer"
            @click="emit('close')"
          >
            Close Panel
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  X,
  Copy,
  Check,
  User,
  Mail,
  UserCheck,
  Layers,
  DollarSign,
  FileCode,
  Sliders,
  Briefcase,
  ShieldCheck
} from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: () => null },
})

const emit = defineEmits(['close'])

const activeTab = ref('overview')
const copiedKey = ref('')

let copyTimeout = null
const copyText = (val, key = '') => {
  if (!val) return
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(String(val))
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = String(val)
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (e) {
      console.error(e)
    }
    document.body.removeChild(textArea)
  }

  copiedKey.value = key

  clearTimeout(copyTimeout)
  copyTimeout = setTimeout(() => {
    if (copiedKey.value === key) {
      copiedKey.value = ''
    }
  }, 1800)
}

const formatDate = (val) => {
  if (!val) return '—'
  const date = new Date(val)
  if (isNaN(date.getTime())) return String(val)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatMoney = (val, currency = '') => {
  if (val == null || val === '') return '—'
  const num = Number(val)
  if (Number.isNaN(num)) return String(val)
  const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return currency ? `${currency} ${formatted}` : `$${formatted}`
}

const formatPercent = (val) => {
  if (val == null || val === '') return '0%'
  return `${val}%`
}

const getKycBadgeClass = (status) => {
  if (status === 'approved') return 'bg-primary-green/10 text-primary-green border border-primary-green/20'
  if (status === 'pending') return 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20'
  if (status === 'rejected') return 'bg-primary-red/10 text-primary-red border border-primary-red/20'
  return 'bg-background text-secondary-text border border-primary-border'
}

const getFollowerAccountTypeLabel = (type) => {
  if (Number(type) === 2) return 'Real account only'
  if (Number(type) === 3) return 'Both options'
  return 'Copy trading only (default)'
}
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

/* Micro Sparkle Stars Animation */
@keyframes sparkle-burst {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.2) rotate(0deg);
  }
  40% {
    opacity: 1;
    transform: translate(var(--tx), var(--ty)) scale(1.3) rotate(35deg);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx-end), var(--ty-end)) scale(0.4) rotate(70deg);
  }
}

.sparkle-particle {
  position: absolute;
  pointer-events: none;
  font-size: 10px;
  line-height: 1;
  animation: sparkle-burst 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  z-index: 10;
}

.sparkle-1 {
  --tx: -8px;
  --ty: -10px;
  --tx-end: -12px;
  --ty-end: -16px;
  color: #10b981;
}

.sparkle-2 {
  --tx: 10px;
  --ty: -12px;
  --tx-end: 14px;
  --ty-end: -18px;
  color: #fbbf24;
  font-size: 9px;
}

.sparkle-3 {
  --tx: 9px;
  --ty: 7px;
  --tx-end: 13px;
  --ty-end: 11px;
  color: #34d399;
  font-size: 8px;
}

@keyframes scale-pop {
  0% {
    transform: scale(0.6);
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.animate-scale-pop {
  animation: scale-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
