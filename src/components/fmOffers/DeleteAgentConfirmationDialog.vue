<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="emit('close')"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md overflow-hidden shadow-2xl shadow-black/20" @click.stop>
      <div class="px-6 py-4 border-b border-primary-border flex items-start gap-3 bg-rose-500/5">
        <div class="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
          <Trash2 class="w-4 h-4 text-rose-500" />
        </div>
        <div class="min-w-0">
          <h2 class="text-sm font-bold text-primary-text">Delete Additional Agent</h2>
          <p class="text-xs text-secondary-text mt-0.5">Confirm removal of this agent configuration.</p>
        </div>
      </div>
      <div class="px-6 py-5 space-y-4">
        <div class="rounded-xl border border-primary-border bg-background/60 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Trading Account</p>
              <p class="text-sm font-bold text-primary-text mt-1">{{ formatAgentAccount(agent) }}</p>
              <p class="text-xs text-secondary-text mt-1 truncate">{{ agent?.broker_label || 'No broker label' }}</p>
            </div>
            <span
              class="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border"
              :class="agent?.is_active
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="agent?.is_active ? 'bg-emerald-500' : 'bg-rose-500'"></span>
              {{ agent?.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="rounded-lg bg-card-background border border-primary-border px-3 py-2">
              <p class="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Share</p>
              <p class="text-sm font-bold text-primary-text mt-1">{{ formatShare(agent?.share_percentage) }}</p>
            </div>
            <div class="rounded-lg bg-card-background border border-primary-border px-3 py-2">
              <p class="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Created</p>
              <p class="text-sm font-bold text-primary-text mt-1">{{ formatDate(agent?.created_at) }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
          <p class="text-xs font-semibold text-primary-text">This action cannot be undone.</p>
          <p class="text-[11px] text-secondary-text mt-0.5">The agent share will be removed immediately.</p>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background">
        <button
          type="button"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="loading"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="emit('confirm')"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ loading ? 'Deleting...' : 'Delete' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Trash2, Loader2 } from 'lucide-vue-next'

defineProps({
  open: { type: Boolean, default: false },
  agent: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'confirm'])

const formatAgentAccount = (a) => a?.trading_account_id ?? a?.account_number ?? a?.trading_account?.account_number ?? '—'
const formatShare = (s) => (s === null || s === undefined || s === '') ? '—' : `${Number(s)}%`
const formatDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
</script>
