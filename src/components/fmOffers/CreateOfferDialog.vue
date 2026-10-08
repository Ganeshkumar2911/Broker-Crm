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

    <!-- Drawer Side Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg sm:max-w-xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/60">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              <Tag class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <h2 class="text-base font-bold text-primary-text truncate">
                {{ isEditing ? 'Edit Subscription Offer' : 'Create Subscription Offer' }}
              </h2>
              <p class="text-xs text-secondary-text truncate mt-0.5">
                {{ isEditing ? 'Update the parameters and fees for this offer' : 'Configure a new offer for followers to subscribe' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg border border-primary-border/60 hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- 1. Basic Info -->
          <div class="bg-background/70 border border-primary-border rounded-xl p-4 space-y-4 shadow-2xs">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-3.5 bg-primary rounded-full" />
              <p class="text-[11px] uppercase tracking-widest font-bold text-secondary-text">Basic Information</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-primary-text mb-1.5">Offer Name <span class="text-rose-500">*</span></label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. VIP Alpha Growth"
                class="w-full px-3.5 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-primary-text mb-1.5">Visibility</label>
              <div class="flex items-center gap-1.5 bg-card-background border border-primary-border rounded-lg p-1 w-fit">
                <button
                  v-for="v in ['public', 'private']"
                  :key="v"
                  type="button"
                  class="px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer"
                  :class="form.visibility === v ? 'bg-primary text-white shadow-xs' : 'text-secondary-text hover:text-primary-text hover:bg-background/60'"
                  @click="form.visibility = v"
                >
                  {{ v }}
                </button>
              </div>
              <p class="text-[11px] text-secondary-text mt-2">
                Public offers are listed for all followers. Private offers can only be joined via dedicated join links.
              </p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-primary-text mb-1.5">Summary / Description</label>
              <textarea
                v-model="form.summary"
                rows="3"
                placeholder="Brief description of the trading strategy and terms..."
                class="w-full px-3.5 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text resize-none"
              />
            </div>
          </div>

          <!-- 2. Fees Configuration -->
          <div class="bg-background/70 border border-primary-border rounded-xl p-4 space-y-4 shadow-2xs">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-3.5 bg-primary rounded-full" />
              <p class="text-[11px] uppercase tracking-widest font-bold text-secondary-text">Fee Structure</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1.5">Performance Fee (%)</label>
                <div class="relative">
                  <input
                    v-model.number="form.performance_fee"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 20"
                    class="w-full px-3.5 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text pr-8"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary-text pointer-events-none">%</span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1.5">Management Fee (%)</label>
                <div class="relative">
                  <input
                    v-model.number="form.management_fee"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 2"
                    class="w-full px-3.5 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text pr-8"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary-text pointer-events-none">%</span>
                </div>
              </div>


              <div>
                <label class="block text-xs font-semibold text-primary-text mb-1.5">Registration Fee ({{ currencyLabel }})</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary-text pointer-events-none">{{ currencySymbol }}</span>
                  <input
                    v-model.number="form.registration_fee"
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                    class="w-full pr-3.5 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text pl-8"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Account Requirements -->
          <div class="bg-background/70 border border-primary-border rounded-xl p-4 space-y-4 shadow-2xs">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-3.5 bg-primary rounded-full" />
              <p class="text-[11px] uppercase tracking-widest font-bold text-secondary-text">Account Requirements</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-primary-text mb-1.5">Minimum Balance / Capital ({{ currencyLabel }})</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary-text pointer-events-none">{{ currencySymbol }}</span>
                <input
                  v-model.number="form.minimum_balance"
                  type="number"
                  min="0"
                  :placeholder="isUsc ? 'e.g. 100000' : 'e.g. 1000'"
                  class="w-full pr-3.5 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-mono pl-8"
                />
              </div>
              <p class="text-[11px] text-secondary-text mt-1.5">
                Minimum investment balance required from a follower before subscribing.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center justify-end gap-3 shrink-0 bg-background/60">
          <button
            type="button"
            class="px-4 py-2.5 rounded-lg text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="loading || !isValid"
            class="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            @click="submit"
          >
            <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isEditing ? (loading ? 'Updating Offer...' : 'Update Offer') : (loading ? 'Creating Offer...' : 'Create Offer') }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { X, Tag, Loader2 } from 'lucide-vue-next'
import { useFmOffersStore } from '@/stores/fmOffers/fmOffers'

const props = defineProps({
  open: { type: Boolean, default: false },
  editOffer: { type: Object, default: null },
  fmId: { type: [String, Number], default: null },
  currency: { type: String, default: '' },
})
const emit = defineEmits(['close'])
const store = useFmOffersStore()
const route = useRoute()

const fmCurrency = computed(() => {
  if (route.query.currency) return String(route.query.currency).trim().toUpperCase()
  if (props.currency) return String(props.currency).trim().toUpperCase()
  if (props.editOffer?.currency) return String(props.editOffer.currency).trim().toUpperCase()
  if (props.editOffer?.broker_currency) return String(props.editOffer.broker_currency).trim().toUpperCase()
  try {
    const raw = localStorage.getItem('active_fm')
    if (raw) {
      const parsed = JSON.parse(raw)
      const c = parsed?.broker_currency || parsed?.currency || parsed?.coverage_account?.broker_currency
      if (c) return String(c).trim().toUpperCase()
    }
  } catch (e) {
    // ignore
  }
  return 'USD'
})

const isUsc = computed(() => fmCurrency.value === 'USC' || fmCurrency.value === 'CENT')
const currencySymbol = computed(() => {
  if (isUsc.value) return 'C'
  if (fmCurrency.value === 'CAD') return 'C$'
  if (fmCurrency.value === 'EUR') return '€'
  if (fmCurrency.value === 'GBP') return '£'
  if (fmCurrency.value === 'INR') return '₹'
  if (fmCurrency.value === 'JPY') return '¥'
  return '$'
})
const currencyLabel = computed(() => isUsc.value ? 'Cent' : '$')

function getDefaultForm() {
  return {
    name: '',
    visibility: 'public',
    summary: '',
    performance_fee: null,
    management_fee: null,
    registration_fee: null,
    minimum_balance: null,
  }
}

const form = ref(getDefaultForm())
const isEditing = computed(() => !!props.editOffer)
const loading = computed(() => isEditing.value ? store.updateLoading : store.createLoading)

const isValid = computed(() => Boolean(form.value.name && form.value.visibility))

watch(() => props.open, (val) => {
  if (!val) return
  if (props.editOffer) {
    form.value = {
      name: props.editOffer.name || '',
      visibility: props.editOffer.visibility || 'public',
      summary: props.editOffer.summary || props.editOffer.description || '',
      performance_fee: props.editOffer.performance_fee ?? null,
      management_fee: props.editOffer.management_fee ?? null,
      registration_fee: props.editOffer.registration_fee ?? null,
      minimum_balance: props.editOffer.minimum_balance ?? null,
    }
  } else {
    form.value = getDefaultForm()
  }
})

const submit = () => {
  const currentFmId = props.fmId || route.params.id || route.query.fm_id
  if (isEditing.value) {
    store.updateOffer(props.editOffer.id, { ...form.value }, () => emit('close'))
  } else {
    store.createOffer({ ...form.value }, currentFmId, () => emit('close'))
  }
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
</style>

