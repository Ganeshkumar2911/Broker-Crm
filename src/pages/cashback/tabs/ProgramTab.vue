<template>
  <div class="space-y-6">
    <div v-if="store.loading && !store.activeProgram" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <SkeletonCard class="h-32" />
      <SkeletonCard class="h-32" />
      <SkeletonCard class="h-32" />
    </div>

    <div v-else-if="store.activeProgram" class="space-y-6">
      <!-- Top Header -->
      <div class="bg-card-background border border-primary-border rounded-xl p-6">
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-semibold text-primary-text">{{ store.activeProgram.name }}</h2>
              <StatusBadge :status="store.activeProgram.status" />
            </div>
            
            <p class="text-sm text-secondary-text max-w-3xl">
              {{ store.activeProgram.description }}
            </p>

            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-secondary-text">
              <div class="flex items-center gap-1.5">
                <HugeIcon :icon="Calendar01Icon" :size="14" />
                <span>Start: <span class="font-medium text-primary-text">{{ formatDateTime(store.activeProgram.start_at) }}</span></span>
              </div>
              <div class="w-1 h-1 rounded-full bg-primary-border"></div>
              <div class="flex items-center gap-1.5">
                <HugeIcon :icon="InfinityIcon" :size="14" />
                <span>End Date: <span class="font-medium text-primary-text">{{ store.activeProgram.end_at ? formatDateTime(store.activeProgram.end_at) : 'None (Indefinite)' }}</span></span>
              </div>
              <div class="w-1 h-1 rounded-full bg-primary-border"></div>
              <div class="flex items-center gap-1.5">
                <HugeIcon :icon="Dollar01Icon" :size="14" />
                <span>Base Currency: <span class="font-medium text-primary-text">{{ store.activeProgram.currency }} ($)</span></span>
              </div>
              <div class="w-1 h-1 rounded-full bg-primary-border"></div>
              <div class="flex items-center gap-1.5">
                <HugeIcon :icon="Clock01Icon" :size="14" />
                <span>Min Hold Time: <span class="font-medium text-primary-text">{{ (store.activeProgram.min_trade_duration_seconds ?? 120) > 0 ? `${store.activeProgram.min_trade_duration_seconds ?? 120}s` : 'Disabled' }}</span></span>
              </div>
              <template v-if="store.activeProgram.updated_at">
                <div class="w-1 h-1 rounded-full bg-primary-border"></div>
                <div class="flex items-center gap-1.5">
                  <HugeIcon :icon="Clock01Icon" :size="14" />
                  <span>Last Updated: <span class="font-medium text-primary-text">{{ formatDateTime(store.activeProgram.updated_at) }}</span></span>
                </div>
              </template>
            </div>
          </div>
          
          <div class="flex items-center gap-3 shrink-0">
            <button class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer" @click="isEditModalOpen = true">
              <HugeIcon :icon="PencilEdit01Icon" :size="16" />
              Edit Settings
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Lifecycle & Audit -->
        <div class="bg-card-background border border-primary-border rounded-xl p-5 flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-sm font-semibold text-primary-text flex items-center gap-2">
              <HugeIcon :icon="Settings01Icon" :size="16" class="text-primary" />
              Lifecycle
            </h3>
          </div>

          <div class="space-y-4 flex-1">
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">OPERATIONAL STATUS</span>
              <StatusBadge :status="store.activeProgram.status" />
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">ACTIVATION EPOCH</span>
              <span class="text-sm font-medium text-primary-text">{{ formatDateTimeCompact(store.activeProgram.start_at) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">PROGRAM EXPIRY</span>
              <span class="text-sm font-medium text-primary-text flex items-center gap-1">
                <HugeIcon :icon="InfinityIcon" :size="14" />
                {{ store.activeProgram.end_at ? formatDateTimeCompact(store.activeProgram.end_at) : 'Open-ended' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">PLAN LOCK DAYS</span>
              <span class="text-sm font-medium text-primary-text">
                {{ store.activeProgram.plan_lock_days ?? 30 }} Days
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">MIN TRADE DURATION</span>
              <span class="text-sm font-medium text-primary-text">
                {{ (store.activeProgram.min_trade_duration_seconds ?? 120) > 0 ? `${store.activeProgram.min_trade_duration_seconds ?? 120}s` : 'Disabled (0s)' }}
              </span>
            </div>
            <div v-if="store.activeProgram.updated_at" class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">LAST UPDATED</span>
              <span class="text-sm font-medium text-primary-text">{{ formatDateTimeCompact(store.activeProgram.updated_at) }}</span>
            </div>
          </div>


        </div>

        <!-- Financial Settlement -->
        <div class="bg-card-background border border-primary-border rounded-xl p-5 flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-sm font-semibold text-primary-text flex items-center gap-2">
              <HugeIcon :icon="CreditCardIcon" :size="16" class="text-primary" />
              Financial Settlement
            </h3>
          </div>

          <div class="space-y-4 flex-1">
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">OPERATING CURRENCY</span>
              <div class="flex items-center gap-1 bg-background px-2 py-1 rounded-lg border border-primary-border">
                <HugeIcon :icon="Dollar01Icon" :size="14" class="text-secondary-text" />
                <span class="text-sm font-bold text-primary-text">{{ store.activeProgram.currency }} <span class="text-xs font-normal text-secondary-text">(Dollar)</span></span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide w-24 leading-tight">MIN REDEMPTION THRESHOLD</span>
              <div class="flex items-center gap-1.5">
                <HugeIcon :icon="HelpCircleIcon" :size="14" class="text-secondary-text cursor-pointer" />
                <div class="bg-primary text-white px-2 py-1 rounded-lg font-bold text-sm">
                  {{ formatCurrencyStr(store.activeProgram.min_redemption_amount) }} {{ store.activeProgram.currency }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Eligibility & Compliance -->
        <div class="bg-card-background border border-primary-border rounded-xl p-5 flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-sm font-semibold text-primary-text flex items-center gap-2">
              <HugeIcon :icon="ShieldCheckIcon" :size="16" class="text-primary" />
              Eligibility & Compliance
            </h3>
          </div>

          <div class="space-y-4 flex-1">
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">REQUIRE LIVE ACCOUNT</span>
              <div v-if="store.activeProgram.eligibility_rules?.require_live" class="flex items-center gap-1 bg-primary/10 text-primary-green px-2 py-1 rounded-lg text-xs font-bold">
                <HugeIcon :icon="CheckmarkCircle01Icon" :size="12" />
                Yes <span class="font-normal">(Mandatory)</span>
              </div>
              <div v-else class="flex items-center gap-1 bg-background text-secondary-text border border-primary-border px-2 py-1 rounded-lg text-xs font-medium">
                <HugeIcon :icon="MinusSignCircleIcon" :size="12" />
                No <span class="font-normal">(Optional)</span>
              </div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">REQUIRE KYC VERIFIED</span>
              <div v-if="store.activeProgram.eligibility_rules?.require_kyc" class="flex items-center gap-1 bg-primary/10 text-primary-green px-2 py-1 rounded-lg text-xs font-bold">
                <HugeIcon :icon="CheckmarkCircle01Icon" :size="12" />
                Yes <span class="font-normal">(Mandatory)</span>
              </div>
              <div v-else class="flex items-center gap-1 bg-background text-secondary-text border border-primary-border px-2 py-1 rounded-lg text-xs font-medium">
                <HugeIcon :icon="MinusSignCircleIcon" :size="12" />
                No <span class="font-normal">(Optional)</span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">ALLOWED ACCOUNT TYPES</span>
              <div class="flex items-center gap-1">
                <span v-for="t in store.activeProgram.eligibility_rules?.trading_types || []" :key="t" class="px-2 py-0.5 bg-background border border-primary-border rounded-lg text-xs font-medium text-primary-text">
                  {{ t }}
                </span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">EXCLUDED CATEGORIES</span>
              <div class="flex items-center gap-1">
                <span v-for="c in store.activeProgram.eligibility_rules?.exclude_account_categories || []" :key="c" class="px-2 py-0.5 bg-primary-red/10 text-primary-red rounded-lg text-xs font-medium">
                  {{ c }}
                </span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-secondary-text tracking-wide">EXCLUDE COPY ACCOUNTS</span>
              <div v-if="store.activeProgram.eligibility_rules?.exclude_copy_accounts" class="flex items-center gap-1 bg-primary-red/10 text-primary-red px-2 py-1 rounded-lg text-xs font-bold">
                <HugeIcon :icon="Cancel01Icon" :size="12" />
                Yes <span class="font-normal">(Excluded)</span>
              </div>
              <div v-else class="flex items-center gap-1 bg-background text-secondary-text border border-primary-border px-2 py-1 rounded-lg text-xs font-medium">
                <HugeIcon :icon="MinusSignCircleIcon" :size="12" />
                No
              </div>
            </div>

            <div class="flex justify-between items-start mt-2">
              <span class="text-xs font-semibold text-secondary-text tracking-wide mt-1 w-24 leading-tight">ALLOWED CLIENT GROUPS</span>
              <span v-if="!store.activeProgram.eligibility_rules?.allowed_group_codes" class="text-sm font-medium text-primary-text text-right max-w-30 leading-tight">All</span>
              <div v-else class="flex flex-wrap justify-end gap-1 max-w-30">
                <span v-for="g in store.activeProgram.eligibility_rules.allowed_group_codes" :key="g" class="px-2 py-0.5 bg-background border border-primary-border rounded-lg text-xs font-medium text-primary-text">
                  {{ g }}
                </span>
              </div>
            </div>

            <div class="flex justify-between items-start mt-2 border-t border-primary-border pt-4">
              <span class="text-xs font-semibold text-secondary-text tracking-wide mt-1 w-24 leading-tight">ELIGIBLE SYMBOLS</span>
              <span v-if="!store.activeProgram.instrument_rules?.rules?.length" class="text-sm font-medium text-primary-text text-right max-w-30 leading-tight">All Symbols</span>
              <div v-else class="flex flex-col items-end gap-1">
                <span class="text-[10px] text-secondary-text mb-1">
                  Normalize Suffixes: {{ store.activeProgram.instrument_rules.normalize_suffixes ? 'Yes' : 'No' }}
                </span>
                <div v-for="(rule, idx) in store.activeProgram.instrument_rules.rules" :key="idx" class="flex flex-col items-end bg-background border border-primary-border rounded-lg p-2 text-xs">
                  <span class="font-medium text-primary-text">
                    {{ rule.match === 'exact' ? rule.symbols?.join(', ') : `Prefix: ${rule.pattern}` }}
                  </span>
                  <span :class="rule.eligible ? 'text-primary-green' : 'text-primary-red'" class="font-semibold">
                    {{ rule.eligible ? 'Eligible' : 'Ineligible' }} (Pri: {{ rule.priority }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Reward Plans -->
      <div class="space-y-4 pt-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-bold text-primary-text">Configured Reward Plans</h3>
            <span class="px-2 py-0.5 bg-background border border-primary-border text-secondary-text rounded-lg text-xs font-medium">
              {{ store.activeProgram.plans?.length || 0 }} Plans Active
            </span>
          </div>
          <button @click="goToPlans" class="text-primary text-sm font-medium hover:underline flex items-center gap-1 cursor-pointer">
            Manage Plans in Plans Tab
            <HugeIcon :icon="ArrowRight01Icon" :size="16" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(plan, index) in store.activeProgram.plans" :key="plan.id" class="bg-card-background border border-primary-border rounded-xl p-6 flex flex-col">
            <div class="flex justify-between items-start mb-4">
              <div>
                <span class="text-[10px] font-bold text-secondary-text tracking-wider uppercase">ORDER #{{ plan.sort_order || index + 1 }} <span class="ml-2 px-1.5 py-0.5 bg-background border border-primary-border rounded-lg font-mono">{{ plan.code }}</span></span>
                <h4 class="text-lg font-bold text-primary-text mt-1">{{ plan.name }}</h4>
              </div>
              <StatusBadge :status="plan.status" />
            </div>

            <div class="bg-primary/5 rounded-lg p-4 mb-6 mt-4">
              <span class="text-[10px] font-bold text-secondary-text tracking-wider uppercase mb-1 block">CASHBACK PAYOUT RATE</span>
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-black text-primary-text">{{ formatCurrencyStr(plan.rate_per_lot) }}</span>
                <span class="text-sm font-medium text-secondary-text">/ closed lot</span>
              </div>
            </div>

            <div class="space-y-4 flex-1">
              <div class="flex justify-between items-center border-primary-border pb-4">
                <span class="text-[10px] font-bold text-secondary-text tracking-wider uppercase w-20 leading-tight">QUALIFYING CONDITION</span>
                <div class="flex items-center gap-2 font-bold text-sm text-primary-text text-right capitalize">
                  {{ plan.qualify_on }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



    </div>
    
    <div v-else class="text-center py-12 text-secondary-text">
      No Cashback Program Found.
    </div>

    <EditProgramModal
      v-if="isEditModalOpen"
      :program="store.activeProgram"
      @close="isEditModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCashbackStore } from "@/stores/cashback/cashback";
import SkeletonCard from "@/components/common/SkeletonCard.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import EditProgramModal from "../components/EditProgramModal.vue";
import {
  Calendar01Icon,
  InfinityIcon,
  CheckmarkCircle01Icon,
  Dollar01Icon,
  Download01Icon,
  PencilEdit01Icon,
  Settings01Icon,
  Copy01Icon,
  ExternalLinkIcon,
  InformationCircleIcon,
  CreditCardIcon,
  HelpCircleIcon,
  Activity01Icon,
  ShieldCheckIcon,
  MinusSignCircleIcon,
  Cancel01Icon,
  SecurityCheckIcon,
  ArrowRight01Icon,
  TrendingDownIcon,
  TrendingUpIcon,
  ArrowDataTransferHorizontalIcon,
  Shield01Icon,
  FlashIcon,
  GlobeIcon,
  ServerIcon,
  Clock01Icon
} from "@hugeicons/core-free-icons";

const store = useCashbackStore();
const router = useRouter();
const isEditModalOpen = ref(false);

const formatCurrencyStr = (val) => {
  if (!val) return "$0.00";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: store.activeProgram?.currency || "USD" }).format(val);
};

const formatDateTime = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleString("en-US", { 
    month: "short", day: "numeric", year: "numeric", 
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" 
  });
};

const formatDateTimeCompact = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())} UTC`;
};

const goToPlans = () => {
  router.push({ query: { tab: 'plans' } });
};


</script>
