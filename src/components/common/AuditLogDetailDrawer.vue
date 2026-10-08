<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/50">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              :class="getHeaderIconClass(log?.status)"
            >
              <ShieldAlert v-if="isFailed(log?.status)" class="w-5 h-5 text-primary-red" />
              <CheckCircle2 v-else-if="isSuccess(log?.status)" class="w-5 h-5 text-primary-green" />
              <Activity v-else class="w-5 h-5 text-primary-yellow" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-primary-text truncate">
                  {{ formatAction(log?.action) }}
                </h3>
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize"
                  :class="getStatusClass(log?.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(log?.status)"></span>
                  {{ log?.status || 'UNKNOWN' }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-secondary-text mt-0.5">
                <span class="font-mono bg-background px-1.5 py-0.5 rounded border border-primary-border/60 text-primary-text text-[10px]">
                  #{{ log?.id }}
                </span>
                <span>·</span>
                <span class="font-semibold text-primary-text">{{ log?.module }}</span>
                <span>/</span>
                <span>{{ log?.entity }}</span>
                <span v-if="log?.entity_id" class="font-mono text-[10px] text-secondary-text">#{{ log?.entity_id }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              title="Copy Log ID"
              @click="copyText(String(log?.id), 'Log ID')"
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
        <div class="flex items-center gap-1 px-6 border-b border-primary-border bg-background/30 text-xs font-medium shrink-0">
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'overview' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'overview'"
          >
            <Info class="w-3.5 h-3.5" />
            <span>Overview & Event</span>
          </button>
          <button
            v-if="log?.old_data || log?.new_data"
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'diff' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'diff'"
          >
            <FileCode class="w-3.5 h-3.5" />
            <span>Data Changes</span>
          </button>
          <button
            type="button"
            class="py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'raw' ? 'border-primary text-primary font-semibold' : 'border-transparent text-secondary-text hover:text-primary-text'"
            @click="activeTab = 'raw'"
          >
            <Code class="w-3.5 h-3.5" />
            <span>Raw Payload</span>
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- TAB 1: OVERVIEW -->
          <template v-if="activeTab === 'overview'">
            <!-- Failure Reason Alert Banner -->
            <div
              v-if="failureReason"
              class="rounded-xl border border-primary-red/30 bg-primary-red/5 p-4 text-xs space-y-2 relative overflow-hidden"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-primary-red font-bold">
                  <AlertTriangle class="w-4 h-4 shrink-0" />
                  <span>Execution Failure Details</span>
                </div>
                <button
                  type="button"
                  class="text-[10px] font-semibold text-primary-red hover:underline cursor-pointer"
                  @click="copyText(failureReason, 'Failure Reason')"
                >
                  Copy Reason
                </button>
              </div>
              <p class="text-secondary-text font-mono text-[11px] leading-relaxed break-words bg-black/20 p-2.5 rounded-lg border border-primary-red/20">
                {{ failureReason }}
              </p>
            </div>

            <!-- Actor & Session Information -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-primary" />
                  <span>Actor & Session</span>
                </p>
                <span v-if="actorUser?.role" class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                  {{ actorUser.role }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
                  {{ userInitial }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <p class="text-xs font-bold text-primary-text truncate">
                      {{ actorUser.name }}
                    </p>
                    <span v-if="actorUser.id" class="text-[10px] font-mono text-secondary-text bg-background px-1.5 rounded border border-primary-border/60">
                      ID: {{ actorUser.id }}
                    </span>
                  </div>
                  <p v-if="actorUser.email" class="text-[11px] text-secondary-text truncate mt-0.5 flex items-center gap-1">
                    <Mail class="w-3 h-3 text-secondary-text shrink-0" />
                    <span>{{ actorUser.email }}</span>
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-primary-border/60 text-xs">
                <div>
                  <span class="text-secondary-text text-[10px] block font-medium">IP Address</span>
                  <div class="flex items-center gap-1 mt-0.5">
                    <Globe class="w-3.5 h-3.5 text-secondary-text" />
                    <span class="font-mono font-semibold text-primary-text select-all text-[11px]">{{ log?.ip_address || '—' }}</span>
                    <button
                      v-if="log?.ip_address"
                      type="button"
                      class="text-secondary-text hover:text-primary transition p-0.5 cursor-pointer"
                      title="Copy IP"
                      @click="copyText(log.ip_address, 'IP Address')"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <span class="text-secondary-text text-[10px] block font-medium">Event Time</span>
                  <div class="flex items-center gap-1 mt-0.5">
                    <Clock class="w-3.5 h-3.5 text-secondary-text" />
                    <span class="font-medium text-primary-text text-[11px]">{{ formatDate(log?.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- User Agent -->
              <div v-if="log?.user_agent" class="pt-3 border-t border-primary-border/60 text-xs">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-secondary-text text-[10px] font-medium flex items-center gap-1">
                    <Laptop class="w-3.5 h-3.5 text-secondary-text" />
                    <span>Device & User Agent</span>
                  </span>
                  <span class="text-[11px] font-semibold text-primary-text">
                    {{ parsedUserAgent.browser }} on {{ parsedUserAgent.os }}
                  </span>
                </div>
                <p class="text-[10px] text-secondary-text font-mono break-all bg-background/60 p-2 rounded-lg border border-primary-border/50">
                  {{ log.user_agent }}
                </p>
              </div>
            </div>

            <!-- Source -> Destination Flow Card -->
            <div v-if="metaSource || metaDestination" class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                <ArrowRight class="w-3.5 h-3.5 text-primary" />
                <span>Action Flow</span>
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <!-- Source -->
                <div class="bg-card-background border border-primary-border/80 rounded-lg p-3 space-y-1">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-secondary-text block">Source</span>
                  <p class="text-xs font-bold text-primary-text truncate">{{ metaSource?.name || metaSource?.email || 'N/A' }}</p>
                  <p v-if="metaSource?.email && metaSource?.name" class="text-[10px] text-secondary-text truncate">{{ metaSource.email }}</p>
                  <div class="flex items-center gap-1.5 pt-1">
                    <span v-if="metaSource?.role" class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 capitalize">
                      {{ metaSource.role }}
                    </span>
                    <span v-if="metaSource?.user_id" class="text-[9px] font-mono text-secondary-text">
                      User #{{ metaSource.user_id }}
                    </span>
                  </div>
                </div>

                <!-- Destination -->
                <div class="bg-card-background border border-primary-border/80 rounded-lg p-3 space-y-1">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-secondary-text block">Destination</span>
                  <p class="text-xs font-bold text-primary-text truncate">{{ metaDestination?.name || metaDestination?.email || 'N/A' }}</p>
                  <p v-if="metaDestination?.email && metaDestination?.name" class="text-[10px] text-secondary-text truncate">{{ metaDestination.email }}</p>
                  <div class="flex items-center gap-1.5 pt-1">
                    <span v-if="metaDestination?.role" class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 capitalize">
                      {{ metaDestination.role }}
                    </span>
                    <span v-if="metaDestination?.user_id" class="text-[9px] font-mono text-secondary-text">
                      User #{{ metaDestination.user_id }}
                    </span>
                    <span v-if="metaDestination?.trading_account_id" class="text-[9px] font-mono text-primary-green font-semibold">
                      Account #{{ metaDestination.trading_account_id }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Miscellaneous Information -->
            <div v-if="miscellaneousFields.length > 0" class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-primary" />
                <span>Event Attributes & Metadata</span>
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div
                  v-for="item in miscellaneousFields"
                  :key="item.key"
                  class="bg-card-background/60 border border-primary-border/60 rounded-lg p-2.5 space-y-1"
                  :class="item.fullWidth ? 'sm:col-span-2' : ''"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] text-secondary-text font-semibold uppercase tracking-wider">{{ item.label }}</span>
                    <button
                      v-if="item.isCopyable"
                      type="button"
                      class="text-secondary-text hover:text-primary transition p-0.5 cursor-pointer text-[10px] flex items-center gap-0.5"
                      @click="copyText(item.rawValue, item.label)"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>

                  <div v-if="item.isBadge" class="inline-flex">
                    <span
                      class="text-[11px] font-bold px-2 py-0.5 rounded border"
                      :class="item.badgeClass"
                    >
                      {{ item.displayValue }}
                    </span>
                  </div>
                  <div v-else-if="item.isCode" class="font-mono text-[10px] text-primary-text bg-background p-2 rounded border border-primary-border/50 break-all select-all">
                    {{ item.displayValue }}
                  </div>
                  <div v-else class="font-semibold text-primary-text break-words leading-snug">
                    {{ item.displayValue }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Entity & System Details Card -->
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                <Hash class="w-3.5 h-3.5 text-primary" />
                <span>Entity & Target Specs</span>
              </p>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span class="text-[10px] text-secondary-text block">Module</span>
                  <span class="font-bold text-primary-text uppercase text-[11px]">{{ log?.module || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-secondary-text block">Entity</span>
                  <span class="font-bold text-primary-text text-[11px]">{{ log?.entity || '—' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-secondary-text block">Entity ID</span>
                  <span class="font-mono font-bold text-primary text-[11px]">{{ log?.entity_id ? `#${log.entity_id}` : '—' }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- TAB 2: DATABASE CHANGES DIFF -->
          <template v-else-if="activeTab === 'diff'">
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                  <FileCode class="w-3.5 h-3.5 text-primary" />
                  <span>State Changes & Database Diff</span>
                </p>
                <span v-if="changedFields" class="text-[10px] font-semibold text-secondary-text">
                  {{ changedFields.length }} fields affected
                </span>
              </div>

              <!-- Structured Diff Grid -->
              <div v-if="changedFields && changedFields.length > 0" class="space-y-3">
                <div
                  v-for="field in changedFields"
                  :key="field.key"
                  class="rounded-xl border border-primary-border overflow-hidden bg-card-background"
                >
                  <div class="px-3 py-1.5 bg-background border-b border-primary-border font-bold text-primary-text text-[11px] flex items-center justify-between">
                    <span class="font-mono">{{ field.key }}</span>
                    <span
                      v-if="field.hasChanged"
                      class="text-[9px] font-semibold px-2 py-0.2 rounded bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
                    >
                      MODIFIED
                    </span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-primary-border text-xs">
                    <div class="p-3 bg-primary-red/5">
                      <span class="text-[9px] font-bold uppercase tracking-wider text-primary-red block mb-1">Before (Old Value)</span>
                      <span v-if="field.oldValue !== undefined" class="font-mono text-primary-red break-all select-all text-[11px]">
                        {{ formatValue(field.oldValue) }}
                      </span>
                      <span v-else class="text-secondary-text opacity-50 italic">— (none)</span>
                    </div>
                    <div class="p-3 bg-primary-green/5">
                      <span class="text-[9px] font-bold uppercase tracking-wider text-primary-green block mb-1">After (New Value)</span>
                      <span v-if="field.newValue !== undefined" class="font-mono text-primary-green break-all select-all text-[11px]">
                        {{ formatValue(field.newValue) }}
                      </span>
                      <span v-else class="text-secondary-text opacity-50 italic">— (none)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback raw JSON -->
              <div v-else class="space-y-3 text-xs">
                <div v-if="log?.old_data" class="space-y-1">
                  <span class="text-[10px] uppercase font-bold text-primary-red tracking-wider">Old Data</span>
                  <pre class="bg-primary-red/5 border border-primary-red/20 rounded-xl p-3 text-[10px] font-mono text-primary-red overflow-auto max-h-56 leading-relaxed">{{ JSON.stringify(log.old_data, null, 2) }}</pre>
                </div>
                <div v-if="log?.new_data" class="space-y-1">
                  <span class="text-[10px] uppercase font-bold text-primary-green tracking-wider">New Data</span>
                  <pre class="bg-primary-green/5 border border-primary-green/20 rounded-xl p-3 text-[10px] font-mono text-primary-green overflow-auto max-h-56 leading-relaxed">{{ JSON.stringify(log.new_data, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </template>

          <!-- TAB 3: RAW PAYLOAD -->
          <template v-else-if="activeTab === 'raw'">
            <div class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-[10px] uppercase tracking-wider text-secondary-text font-bold flex items-center gap-1.5">
                  <Code class="w-3.5 h-3.5 text-primary" />
                  <span>Full API Payload JSON</span>
                </p>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  @click="copyText(JSON.stringify(log, null, 2), 'Raw JSON')"
                >
                  <Copy class="w-3 h-3" />
                  <span>Copy JSON</span>
                </button>
              </div>

              <pre class="bg-card-background border border-primary-border text-primary-text rounded-xl p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto select-all">{{ JSON.stringify(log, null, 2) }}</pre>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border bg-card-background shrink-0 flex items-center justify-between gap-3">
          <div class="text-[11px] text-secondary-text font-mono">
            ID: {{ log?.id || '—' }}
          </div>
          <button
            type="button"
            class="px-5 py-2 rounded-lg text-xs font-semibold text-primary-text border border-primary-border hover:bg-background transition cursor-pointer"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  X,
  Info,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Copy,
  User,
  Mail,
  Globe,
  Clock,
  Laptop,
  ArrowRight,
  Layers,
  Hash,
  AlertTriangle,
  Code
} from 'lucide-vue-next'
import { formatDate } from '@/utils/timeFormatter'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open: { type: Boolean, default: false },
  log: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])
const snackbar = useSnackbarStore()
const activeTab = ref('overview')

// Copy helper
const copyText = (text, label = 'Content') => {
  if (!text) return
  navigator.clipboard.writeText(text)
  snackbar.show(`${label} copied to clipboard`, 'success')
}

// Helpers
const isFailed = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'failed' || s === 'error' || s === 'failure'
}

const isSuccess = (status) => {
  const s = String(status || '').toLowerCase()
  return s === 'success' || s === 'completed'
}

const formatAction = (action) => {
  if (!action) return 'Audit Log Event'
  return String(action)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const getStatusClass = (status) => {
  if (isSuccess(status)) {
    return 'bg-primary-green/10 text-primary-green border-primary-green/20'
  }
  if (isFailed(status)) {
    return 'bg-primary-red/10 text-primary-red border-primary-red/20'
  }
  return 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'
}

const getStatusDotClass = (status) => {
  if (isSuccess(status)) return 'bg-primary-green'
  if (isFailed(status)) return 'bg-primary-red'
  return 'bg-primary-yellow'
}

const getHeaderIconClass = (status) => {
  if (isSuccess(status)) return 'bg-primary-green/10 border-primary-green/20'
  if (isFailed(status)) return 'bg-primary-red/10 border-primary-red/20'
  return 'bg-primary-yellow/10 border-primary-yellow/20'
}

const actorUser = computed(() => {
  const u = props.log?.user || {}
  const source = props.log?.meta_data?.source || {}
  return {
    id: u.id || source.user_id || props.log?.user_id || null,
    name: u.name || props.log?.name || source.name || 'Anonymous User',
    email: u.email || props.log?.email || source.email || null,
    role: source.role || u.role || null
  }
})

const userInitial = computed(() => {
  const name = actorUser.value.name || 'A'
  return name.charAt(0).toUpperCase()
})

const failureReason = computed(() => {
  const meta = props.log?.meta_data
  if (meta?.miscellaneous?.reason) return String(meta.miscellaneous.reason)
  if (meta?.reason) return String(meta.reason)
  if (meta?.error) return String(meta.error)
  if (props.log?.status === 'FAILED') return 'Action execution reported FAILED status.'
  return null
})

const metaSource = computed(() => {
  return props.log?.meta_data?.source || null
})

const metaDestination = computed(() => {
  return props.log?.meta_data?.destination || null
})

const miscellaneousFields = computed(() => {
  const misc = props.log?.meta_data?.miscellaneous
  if (!misc || typeof misc !== 'object') return []

  const items = []

  // Check for amounts & currencies
  if (misc.amount !== undefined) {
    const cur = misc.currency || 'USD'
    items.push({
      key: 'amount',
      label: 'Amount',
      displayValue: `${misc.amount} ${cur}`,
      isBadge: true,
      badgeClass: 'bg-primary/10 text-primary border-primary/20'
    })
  }

  if (misc.payout_amount !== undefined) {
    const pCur = misc.payout_currency || 'INR'
    items.push({
      key: 'payout_amount',
      label: 'Payout Amount',
      displayValue: `${misc.payout_amount} ${pCur}`,
      isBadge: true,
      badgeClass: 'bg-primary-green/10 text-primary-green border border-primary-green/20'
    })
  }

  if (misc.reference_id) {
    items.push({
      key: 'reference_id',
      label: 'Reference ID',
      displayValue: misc.reference_id,
      rawValue: misc.reference_id,
      isCode: true,
      isCopyable: true,
      fullWidth: true
    })
  }

  if (misc.auto_submitted !== undefined) {
    items.push({
      key: 'auto_submitted',
      label: 'Auto Submitted',
      displayValue: misc.auto_submitted ? 'Yes' : 'No',
      isBadge: true,
      badgeClass: misc.auto_submitted ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-background text-secondary-text border border-primary-border'
    })
  }

  if (misc.provider) {
    items.push({
      key: 'provider',
      label: 'Email Provider',
      displayValue: String(misc.provider).toUpperCase(),
      isBadge: true,
      badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    })
  }

  if (misc.subject) {
    items.push({
      key: 'subject',
      label: 'Email Subject',
      displayValue: misc.subject,
      fullWidth: true
    })
  }

  if (misc.template_code) {
    items.push({
      key: 'template_code',
      label: 'Template Code',
      displayValue: misc.template_code,
      isCode: true
    })
  }

  if (misc.recipient) {
    items.push({
      key: 'recipient',
      label: 'Recipient',
      displayValue: misc.recipient,
      isCopyable: true,
      rawValue: misc.recipient
    })
  }

  if (misc.response?.messageId) {
    items.push({
      key: 'messageId',
      label: 'Message ID',
      displayValue: misc.response.messageId,
      rawValue: misc.response.messageId,
      isCode: true,
      isCopyable: true,
      fullWidth: true
    })
  }

  // Pick up any other remaining keys not yet captured
  const handledKeys = new Set([
    'reason',
    'amount',
    'currency',
    'payout_amount',
    'payout_currency',
    'reference_id',
    'auto_submitted',
    'provider',
    'subject',
    'template_code',
    'recipient',
    'response'
  ])

  for (const [k, v] of Object.entries(misc)) {
    if (!handledKeys.has(k) && v !== null && v !== undefined && v !== '') {
      const label = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      const strVal = typeof v === 'object' ? JSON.stringify(v) : String(v)
      items.push({
        key: k,
        label,
        displayValue: strVal,
        rawValue: strVal,
        isCode: typeof v === 'object' || k.includes('id') || k.includes('code'),
        isCopyable: typeof v === 'string' && (k.includes('id') || k.includes('token'))
      })
    }
  }

  return items
})

const parsedUserAgent = computed(() => {
  const ua = props.log?.user_agent
  if (!ua) return { browser: 'Unknown', os: 'Unknown OS' }

  const l = ua.toLowerCase()
  let os = 'Unknown OS'
  if (l.includes('macintosh') || l.includes('mac os')) os = 'macOS'
  else if (l.includes('windows')) os = 'Windows'
  else if (l.includes('linux')) os = 'Linux'
  else if (l.includes('android')) os = 'Android'
  else if (l.includes('iphone') || l.includes('ipad')) os = 'iOS'

  let browser = 'Browser'
  if (l.includes('chrome')) browser = 'Chrome'
  else if (l.includes('safari') && !l.includes('chrome')) browser = 'Safari'
  else if (l.includes('firefox')) browser = 'Firefox'
  else if (l.includes('edge')) browser = 'Edge'

  return { browser, os }
})

// Diff viewer computed
const changedFields = computed(() => {
  const oldObj = props.log?.old_data
  const newObj = props.log?.new_data

  if (!oldObj && !newObj) return null

  const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val)
  const oldData = isObject(oldObj) ? oldObj : {}
  const newData = isObject(newObj) ? newObj : {}

  if (Object.keys(oldData).length === 0 && Object.keys(newData).length === 0) {
    return null
  }

  const allKeys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])]

  return allKeys.map((key) => {
    const oldValue = oldData[key]
    const newValue = newData[key]
    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue)
    return {
      key,
      oldValue,
      newValue,
      hasChanged
    }
  })
})

const formatValue = (val) => {
  if (val === null) return 'null'
  if (val === undefined) return 'undefined'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
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
</style>

