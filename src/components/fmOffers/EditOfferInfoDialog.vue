<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="emit('close')"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/20" @click.stop>
      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <component :is="icon" class="w-4 h-4 text-primary" />
          <h2 class="text-sm font-bold text-primary-text">Edit {{ sectionTitle }}</h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors cursor-pointer" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <!-- Common Information Section -->
        <template v-if="section === 'common'">
          <div class="bg-background border border-primary-border rounded-xl p-4 space-y-4">
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Offer Title</p>
              <input
                v-model="form.name"
                type="text"
                placeholder="Offer name..."
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Visibility</p>
              <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit">
                <button
                  v-for="v in ['public', 'private']"
                  :key="v"
                  type="button"
                  class="px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer"
                  :class="form.visibility === v ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
                  @click="form.visibility = v"
                >
                  {{ v }}
                </button>
              </div>
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Summary / Description</p>
              <textarea
                v-model="form.summary"
                rows="2"
                placeholder="Brief description..."
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text resize-none"
              />
            </div>
          </div>
        </template>

        <!-- Fees Section -->
        <template v-if="section === 'fees'">
          <div class="bg-background border border-primary-border rounded-xl p-4 space-y-4">
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Performance Fee (%)</p>
              <input
                v-model.number="form.performance_fee"
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 15"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Management Fee (%)</p>
              <input
                v-model.number="form.management_fee"
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 10"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Registration Fee ($)</p>
              <input
                v-model.number="form.registration_fee"
                type="number"
                min="0"
                placeholder="e.g. 10"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>
          </div>
        </template>

        <!-- Filters Section -->
        <template v-if="section === 'filters'">
          <div class="bg-background border border-primary-border rounded-xl p-4 space-y-4">
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Minimum Balance ($)</p>
              <input
                v-model.number="form.minimum_balance"
                type="number"
                min="0"
                placeholder="e.g. 2000"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
              <p class="text-[11px] text-secondary-text mt-1.5">Followers must maintain at least this balance to participate.</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer -->
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
          :disabled="loading"
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
import { X, Tag, Sliders, DollarSign, Loader2 } from 'lucide-vue-next'
import { useFmOffersStore } from '@/stores/fmOffers/fmOffers'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open: { type: Boolean, default: false },
  section: { type: String, required: true },
  offerId: { type: [String, Number], required: true },
  offer: { type: Object, required: true },
})
const emit = defineEmits(['close', 'updated'])

const store = useFmOffersStore()
const snackbar = useSnackbarStore()
const form = ref({})

const sectionTitle = computed(() => {
  const titles = { common: 'Common Information', fees: 'Fees', filters: 'Filters' }
  return titles[props.section] || 'Offer Info'
})

const icon = computed(() => {
  const icons = { common: Tag, fees: DollarSign, filters: Sliders }
  return icons[props.section] || Tag
})

const loading = computed(() => store.updateLoading)

const initializeForm = () => {
  const offer = props.offer
  if (!offer) { form.value = {}; return }
  if (props.section === 'common') {
    form.value = {
      name: String(offer.name ?? ''),
      visibility: String(offer.visibility ?? 'public'),
      summary: String(offer.summary ?? offer.description ?? ''),
    }
  } else if (props.section === 'fees') {
    form.value = {
      performance_fee: offer.performance_fee != null ? Number(offer.performance_fee) : null,
      management_fee: offer.management_fee != null ? Number(offer.management_fee) : null,
      registration_fee: offer.registration_fee != null ? Number(offer.registration_fee) : null,
    }
  } else if (props.section === 'filters') {
    form.value = {
      minimum_balance: offer.minimum_balance != null ? Number(offer.minimum_balance) : null,
    }
  }
}

const submit = () => {
  store.updateOffer(props.offerId, { ...form.value }, () => {
    snackbar.show(`${sectionTitle.value} updated successfully.`, 'success')
    emit('close')
    emit('updated', { ...form.value })
  })
}

watch(() => props.open, (isOpen) => {
  if (isOpen) initializeForm()
}, { immediate: true })
</script>
