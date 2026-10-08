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
          <h2 class="text-sm font-bold text-primary-text">Add Additional Agent</h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="px-6 py-5 space-y-4">
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Trading Account Number</p>
          <input
            v-model.number="form.trading_account_id"
            type="number"
            min="1"
            placeholder="e.g. 1000906"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
          />
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
          <p class="text-[11px] text-secondary-text mt-1">Maximum allowed share is 100%.</p>
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
          <span>{{ loading ? 'Adding...' : 'Add Agent' }}</span>
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
})
const emit = defineEmits(['close', 'created'])
const store = useFmOffersStore()

const form = ref({ trading_account_id: null, share_percentage: null })
const loading = computed(() => store.createAgentLoading)

const isValid = computed(() => {
  const sp = Number(form.value.share_percentage)
  return Number.isFinite(Number(form.value.trading_account_id)) && Number.isFinite(sp) && sp >= 0 && sp <= 100
})

watch(() => props.open, (val) => {
  if (!val) return
  form.value = { trading_account_id: null, share_percentage: null }
})

const submit = () => {
  if (!isValid.value) return
  store.createAgent(props.offerId, {
    trading_account_id: Number(form.value.trading_account_id),
    share_percentage: Number(form.value.share_percentage),
  }, () => {
    emit('created')
    emit('close')
  })
}
</script>
