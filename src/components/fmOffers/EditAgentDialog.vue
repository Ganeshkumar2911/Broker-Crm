<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="emit('close')"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md overflow-hidden flex flex-col shadow-2xl shadow-black/20" @click.stop>
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <Users class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-bold text-primary-text">Edit Additional Agent</h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="px-6 py-5 space-y-4">
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Trading Account</p>
          <p class="text-sm font-bold text-primary-text">{{ formatAgentAccount(agent) }}</p>
          <p class="text-xs text-secondary-text mt-1">{{ agent?.broker_label || '—' }}</p>
        </div>

        <div>
          <p class="text-xs text-secondary-text mb-1.5">Share Percentage (%)</p>
          <input
            v-model.number="form.share_percentage"
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 25"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
        </div>

        <div class="flex items-center justify-between px-3.5 py-2.5 bg-background border border-primary-border rounded-xl">
          <div>
            <p class="text-xs font-semibold text-primary-text">Agent Status</p>
            <p class="text-[11px] text-secondary-text">Enable or disable this agent.</p>
          </div>
          <button
            type="button"
            class="relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer"
            :class="form.is_active ? 'bg-primary' : 'bg-background border border-primary-border'"
            @click="form.is_active = !form.is_active"
          >
            <span
              class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background">
        <button
          type="button"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="loading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="submit"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ loading ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Users, Loader2 } from 'lucide-vue-next'
import { useFmOffersStore } from '@/stores/fmOffers/fmOffers'

const props = defineProps({
  open: { type: Boolean, default: false },
  offerId: { type: [String, Number], required: true },
  agent: { type: Object, default: null },
})

const emit = defineEmits(['close'])
const store = useFmOffersStore()

const form = ref({ share_percentage: null, is_active: true })
const loading = computed(() => store.updateAgentLoading)

const isValid = computed(() => {
  const sp = Number(form.value.share_percentage)
  return Number.isFinite(sp) && sp >= 0 && sp <= 100
})

watch(() => props.open, (val) => {
  if (!val) return
  form.value = {
    share_percentage: props.agent?.share_percentage ?? null,
    is_active: props.agent?.is_active ?? true,
  }
})

const submit = () => {
  if (!isValid.value || !props.agent?.id) return
  store.updateAgent(props.offerId, props.agent.id, {
    share_percentage: Number(form.value.share_percentage),
    is_active: Boolean(form.value.is_active),
  }, () => emit('close'))
}

const formatAgentAccount = (a) => a?.trading_account_id ?? a?.account_number ?? a?.trading_account?.account_number ?? '—'
</script>
