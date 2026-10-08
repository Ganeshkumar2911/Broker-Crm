<script setup>
import { ref, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  symbolData: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  categoryOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  symbol: '',
  name: '',
  category: '',
  sort_order: 0,
  is_active: true,
})

const errors = ref({
  symbol: '',
})

watch(
  () => props.symbolData,
  (val) => {
    if (val) {
      form.value = {
        symbol: val.symbol || '',
        name: val.name || '',
        category: val.category || '',
        sort_order: val.sort_order ?? 0,
        is_active: val.is_active ?? true,
      }
    } else {
      form.value = {
        symbol: '',
        name: '',
        category: '',
        sort_order: 0,
        is_active: true,
      }
    }
    errors.value.symbol = ''
  },
  { immediate: true },
)

function onSymbolInput(e) {
  form.value.symbol = e.target.value
  if (errors.value.symbol) errors.value.symbol = ''
}

function handleSave() {
  if (!form.value.symbol.trim()) {
    errors.value.symbol = 'Symbol is required'
    return
  }

  const payload = {
    symbol: form.value.symbol.trim(),
    name: form.value.name?.trim() || null,
    category: form.value.category?.trim() || null,
    is_active: Boolean(form.value.is_active),
  }

  // sort_order is only sent during edit, NOT during add/creation
  if (props.symbolData) {
    payload.sort_order = Number(form.value.sort_order) || 0
  }

  emit('save', payload)
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    @click="emit('close')"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-primary-text">
            {{ symbolData ? 'Edit Symbol' : 'Add New Symbol' }}
          </h3>
          <p class="text-xs text-secondary-text mt-0.5">
            Configure symbol catalog properties and visibility
          </p>
        </div>
        <button
          @click="emit('close')"
          class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="px-6 py-5 space-y-4">
        <!-- Symbol Field -->
        <div>
          <label class="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">
            Symbol <span class="text-primary-red">*</span>
          </label>
          <input
            :value="form.symbol"
            @input="onSymbolInput"
            type="text"
            placeholder="e.g. EURUSD, BTCUSD, XAUUSD"
            maxlength="50"
            class="input-field font-mono font-medium tracking-wide px-3.5 py-2.5"
            :class="{ 'border-primary-red focus:border-primary-red': errors.symbol }"
          />
          <p v-if="errors.symbol" class="text-xs text-primary-red mt-1">
            {{ errors.symbol }}
          </p>
        </div>

        <!-- Name Field -->
        <div>
          <label class="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">
            Display Name
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Euro vs US Dollar"
            class="input-field px-3.5 py-2.5"
          />
        </div>

        <!-- Category & (Conditional) Sort Order Grid -->
        <div :class="symbolData ? 'grid grid-cols-2 gap-3' : 'space-y-4'">
          <div>
            <label class="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">
              Category
            </label>
            <input
              v-model="form.category"
              type="text"
              placeholder="e.g. Forex, Crypto, Forex/Commodities"
              class="input-field px-3.5 py-2.5"
            />
          </div>

          <!-- Sort Order ONLY visible in Edit mode -->
          <div v-if="symbolData">
            <label class="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">
              Sort Order
            </label>
            <input
              v-model.number="form.sort_order"
              type="number"
              min="0"
              class="input-field px-3.5 py-2.5"
            />
          </div>
        </div>

        <!-- Active Toggle -->
        <div class="pt-2 border-t border-primary-border">
          <label class="flex items-center gap-3 cursor-pointer select-none">
            <input
              v-model="form.is_active"
              type="checkbox"
              class="w-4 h-4 rounded border-primary-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
            />
            <div>
              <span class="text-sm font-medium text-primary-text block">Active Status</span>
              <span class="text-xs text-secondary-text block">
                Visible to clients & fund managers when building watchlists
              </span>
            </div>
          </label>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-primary-border bg-background/50 flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="emit('close')"
          :disabled="loading"
          class="px-4 py-2 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-card-background hover:text-primary-text transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="loading"
          class="px-5 py-2 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ loading ? 'Saving...' : (symbolData ? 'Update Symbol' : 'Add Symbol') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
