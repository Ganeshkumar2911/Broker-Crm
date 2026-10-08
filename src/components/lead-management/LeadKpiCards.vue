<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Users,
  UserPlus,
  UserCheck,
  ShieldCheck,
  LineChart,
  TrendingUp,
  PhoneCall,
  Activity,
  UserCheck2,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next'

const props = defineProps({
  metrics: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const STORAGE_KEY = 'lead_kpi_cards_collapsed'

// State (default to collapsed = true)
const isCollapsed = ref(true)

onMounted(() => {
  const savedState = localStorage.getItem(STORAGE_KEY)
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem(STORAGE_KEY, String(isCollapsed.value))
}

const ICON_MAP = {
  total_leads: { icon: Users, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  new_user: { icon: UserPlus, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  new_leads: { icon: UserPlus, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  assigned: { icon: UserCheck, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  contact: { icon: PhoneCall, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  contacted: { icon: PhoneCall, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  registered: { icon: UserCheck2, bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  kyc: { icon: ShieldCheck, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  kyc_approved: { icon: ShieldCheck, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  trading_account: { icon: LineChart, bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  trading_accounts: { icon: LineChart, bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  conversion_rate: { icon: TrendingUp, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
}

const FALLBACK_PALETTE = [
  { icon: Users, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { icon: UserPlus, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { icon: UserCheck, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { icon: PhoneCall, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { icon: ShieldCheck, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { icon: LineChart, bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  { icon: TrendingUp, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { icon: Activity, bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
]

function formatTitle(key) {
  if (!key) return ''
  if (key.toLowerCase() === 'kyc') return 'KYC'
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatValue(key, val) {
  const num = Number(val ?? 0)
  if (key.includes('rate') || key.includes('percentage')) {
    return `${num}%`
  }
  return num.toLocaleString('en-US')
}

function getIconAndBg(key, index) {
  const normalizedKey = key.toLowerCase()
  if (ICON_MAP[normalizedKey]) {
    return ICON_MAP[normalizedKey]
  }
  return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length]
}

const kpiItems = computed(() => {
  const m = props.metrics
  if (!m || typeof m !== 'object') {
    return []
  }

  return Object.entries(m).map(([key, val], i) => {
    const title = formatTitle(key)
    const value = formatValue(key, val)
    const { icon, bg } = getIconAndBg(key, i)

    return {
      key,
      title,
      value,
      icon,
      iconBg: bg,
    }
  })
})
</script>

<template>
  <div class="space-y-2">
    <!-- Header with Toggle Button -->
    <div class="flex items-center justify-between px-0.5">
      <div class="flex items-center gap-2">
        <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider">Metrics Overview</h3>
        <!-- <span
          v-if="kpiItems.length > 0"
          class="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
        >
          {{ kpiItems.length }}
        </span> -->
      </div>

      <button
        @click="toggleCollapse"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-secondary-text hover:text-primary-text bg-card-background border border-primary-border hover:bg-background transition-all duration-200 cursor-pointer shadow-xs"
        :title="isCollapsed ? 'Expand to detailed view' : 'Collapse to compact 1-row view'"
      >
        <component :is="isCollapsed ? ChevronDown : ChevronUp" class="w-3.5 h-3.5 text-primary" />
        <span>{{ isCollapsed ? 'Expand View' : 'Collapse View' }}</span>
      </button>
    </div>

    <!-- Skeleton loader -->
    <template v-if="loading">
      <div
        :class="[
          'grid gap-2',
          isCollapsed ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8' : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8'
        ]"
      >
        <div
          v-for="n in (kpiItems.length || 8)"
          :key="n"
          class="bg-card-background border border-primary-border rounded-xl p-3 animate-pulse space-y-2"
        >
          <div class="h-2.5 w-16 bg-primary-border/50 rounded" />
          <div class="h-5 w-10 bg-primary-border/60 rounded" />
        </div>
      </div>
    </template>

    <!-- Loaded KPI Cards -->
    <template v-else-if="kpiItems.length > 0">
      <!-- 1. Collapsed View: 1 Row, Minimalist Title + Value, No Icons -->
      <div
        v-if="isCollapsed"
        class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 transition-all duration-300"
      >
        <div
          v-for="card in kpiItems"
          :key="card.key"
          class="bg-card-background border border-primary-border rounded-lg px-3 py-2 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-xs"
        >
          <p class="text-[10px] font-medium uppercase tracking-wider text-secondary-text truncate" :title="card.title">
            {{ card.title }}
          </p>
          <p class="text-sm font-bold text-primary-text mt-0.5 truncate">
            {{ card.value }}
          </p>
        </div>
      </div>

      <!-- 2. Expanded View: Detailed 2-Row Layout with Icons -->
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-3 transition-all duration-300"
      >
        <div
          v-for="card in kpiItems"
          :key="card.key"
          class="group bg-card-background border border-primary-border rounded-xl p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:border-primary/40 shadow-xs"
        >
          <span class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text truncate" :title="card.title">
                {{ card.title }}
              </p>
              <div :class="['w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105', card.iconBg]">
                <component :is="card.icon" class="w-3.5 h-3.5" />
              </div>
            </div>
            
            <p class="text-2xl font-bold text-primary-text leading-none tracking-tight">
              {{ card.value }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
