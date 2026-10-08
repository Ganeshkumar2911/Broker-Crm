<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="emit('close')"
      />
    </Transition>

    <!-- Side Panel Drawer -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-xl sm:max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <!-- Drawer Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/60">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
              <Pencil class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-primary-text truncate">
                  Edit Follower Settings
                </h3>
                <span class="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded-md border border-primary/20 bg-primary/10">
                  {{ follower?.account_number || `#${follower?.account_id}` }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5">
                {{ follower?.name || 'Unnamed Follower' }} · {{ follower?.email || 'No email' }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="p-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Drawer Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Status & Copy Mode -->
          <div class="bg-background/70 border border-primary-border/80 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-primary-text">Status & Copy Mode</p>
                <p class="text-[11px] text-secondary-text mt-0.5">Control active status and follower lot sizing</p>
              </div>

              <!-- Active Toggle -->
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-primary-text">Active</span>
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

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Lot Type</p>
                <BaseSelect
                  v-model="form.lot_type"
                  :options="lotTypeOptions"
                  placeholder="Select lot type"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Lot Value</p>
                <input
                  v-model.number="form.lot_value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 0.1"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-mono"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Allocated Amount ($)</p>
                <input
                  v-model.number="form.allocated_amount"
                  type="number"
                  min="0"
                  placeholder="e.g. 1000"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Offer & Fee Configuration -->
          <div class="bg-background/70 border border-primary-border/80 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-primary-text">Offer & Fee Configuration</p>
              <p class="text-[11px] text-secondary-text mt-0.5">Assigned offer ID and fee parameters</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Offer ID</p>
                <input
                  v-model.number="form.offer_id"
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-mono"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Performance Fee (%)</p>
                <input
                  v-model.number="form.performance_fee"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 20"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Management Fee (%)</p>
                <input
                  v-model.number="form.management_fee"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 2"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Fee Interval</p>
                <BaseSelect
                  v-model="form.management_fee_interval"
                  :options="intervalOptions"
                  placeholder="Select interval"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Registration Fee ($)</p>
                <input
                  v-model.number="form.registration_fee"
                  type="number"
                  min="0"
                  placeholder="e.g. 0"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-mono"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Minimum Balance ($)</p>
                <input
                  v-model.number="form.minimum_balance"
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Revenue Sharing & Settlement -->
          <div class="bg-background/70 border border-primary-border/80 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-primary-text">Revenue Sharing & Settlement</p>
              <p class="text-[11px] text-secondary-text mt-0.5">Revenue split ratios and settlement timing</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">FM Share (%)</p>
                <input
                  v-model.number="form.fm_share"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 70"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Broker Share (%)</p>
                <input
                  v-model.number="form.broker_share"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 30"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">IB Pool (%)</p>
                <input
                  v-model.number="form.ib_pool_percentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 10"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Settlement Type</p>
                <BaseSelect
                  v-model="form.settlement_type"
                  :options="settlementTypeOptions"
                  placeholder="Select type"
                />
              </div>
              <div>
                <p class="text-xs font-semibold text-secondary-text mb-1.5">Settlement Time</p>
                <input
                  v-model="form.settlement_time"
                  type="text"
                  placeholder="e.g. 00:00"
                  class="w-full h-9 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors placeholder:text-secondary-text font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Footer (Fixed Bottom) -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center justify-end gap-3 shrink-0 bg-background/80 backdrop-blur-xs">
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl text-xs font-bold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="loading"
            class="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            @click="submit"
          >
            <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ loading ? 'Saving Changes...' : 'Save Changes' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Pencil, Loader2 } from 'lucide-vue-next'
import apiRequest from '@/api/request'
import urls from '@/api/urls'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'

const props = defineProps({
  open: { type: Boolean, default: false },
  follower: { type: Object, default: null },
})
const emit = defineEmits(['close', 'updated'])

const snackbar = useSnackbarStore()
const loading = ref(false)

const form = ref({})
const initialForm = ref({})

const lotTypeOptions = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Multiplier', value: 'multiplier' },
]

const intervalOptions = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
]

const settlementTypeOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
]

const initializeForm = () => {
  const f = props.follower || {}
  const data = {
    lot_type: f.lot_type ?? 'fixed',
    lot_value: f.lot_value != null ? Number(f.lot_value) : null,
    allocated_amount: f.allocated_amount != null ? Number(f.allocated_amount) : null,
    is_active: f.is_active ?? (f.status === 'active'),
    offer_id: f.offer_id != null ? Number(f.offer_id) : null,
    performance_fee: f.performance_fee != null ? Number(f.performance_fee) : null,
    management_fee: f.management_fee != null ? Number(f.management_fee) : null,
    management_fee_interval: f.management_fee_interval || 'monthly',
    registration_fee: f.registration_fee != null ? Number(f.registration_fee) : null,
    fm_share: f.fm_share != null ? Number(f.fm_share) : null,
    broker_share: f.broker_share != null ? Number(f.broker_share) : null,
    ib_pool_percentage: f.ib_pool_percentage != null ? Number(f.ib_pool_percentage) : null,
    settlement_type: f.settlement_type || 'monthly',
    settlement_time: f.settlement_time || '00:00',
    minimum_balance: f.minimum_balance != null ? Number(f.minimum_balance) : null,
  }

  form.value = { ...data }
  initialForm.value = { ...data }
}

watch(() => props.open, (isOpen) => {
  if (isOpen) initializeForm()
}, { immediate: true })

const submit = () => {
  const followerId = props.follower?.id || props.follower?.account_id
  if (!followerId) {
    snackbar.show('Follower ID missing.', 'error')
    return
  }

  // Build payload with ONLY changed fields
  const payload = {}
  for (const key of Object.keys(form.value)) {
    if (form.value[key] !== initialForm.value[key]) {
      payload[key] = form.value[key]
    }
  }

  if (Object.keys(payload).length === 0) {
    snackbar.show('No changes detected to update.', 'info')
    emit('close')
    return
  }

  loading.value = true
  const endpoint = `${urls.fm.editFollower}/${followerId}`

  apiRequest(urls.KEYS.PUT, endpoint, {
    data: payload,
    isTokenRequired: true,
    onSuccess: (res) => {
      loading.value = false
      snackbar.show(res?.message || 'Follower updated successfully.', 'success')
      emit('close')
      emit('updated', payload)
    },
    onFailure: (err) => {
      loading.value = false
      snackbar.show(err?.error || err?.message || 'Failed to update follower.', 'error')
    },
  })
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
