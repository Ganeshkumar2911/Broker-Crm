<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-lg no-scrollbar" @click.stop>

      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Settings2 class="w-4 h-4 text-secondary-text" />
          <h2 class="text-sm font-semibold text-primary-text">Add Group Config</h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">

        <!-- Group path (readonly) -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">MT5 Group Path</p>
          <div class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-secondary-text text-xs font-mono truncate opacity-70">
            {{ group?.group }}
          </div>
        </div>

        <!-- Label -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Label</p>
          <input
            v-model="form.label"
            type="text"
            placeholder="e.g. Demo Standard"
            :disabled="store.createLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>

        <!-- Account Type (readonly) -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Account Type</p>
          <div class="flex items-center gap-1 bg-background border border-primary-border rounded-lg p-1 w-fit opacity-70 cursor-not-allowed">
            <button
              v-for="t in ['demo', 'live']"
              :key="t"
              disabled
              class="px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors"
              :class="props.group?.account_type === t ? 'bg-primary text-white' : 'text-secondary-text'"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <!-- Account Category -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Account Category</p>
          <input
            :value="props.group?.account_category"
            type="text"
            disabled
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>
        <!-- Currency + Leverage -->
        <div class="grid grid-cols-2 gap-3">
          <div>
          <p class="text-xs text-secondary-text mb-1.5">MT5 Group Path</p>
          <div class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-secondary-text text-xs font-mono truncate opacity-70">
            {{ group?.currency }}
          </div>
        </div>
          <div>
            <p class="text-xs text-secondary-text mb-1.5">Leverage</p>
            <input
              v-model.number="form.leverage"
              type="number"
              placeholder="eg. 500"
              :disabled="store.createLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
            />
          </div>
        </div>

        <!-- Badge -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Badge</p>
          <input
            v-model="form.badge"
            type="text"
            placeholder="e.g. STP, RAW"
            :disabled="store.createLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
          />
        </div>

        <!-- Description -->
        <div>
          <p class="text-xs text-secondary-text mb-1.5">Description</p>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Optional description..."
            :disabled="store.createLoading"
            class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
          />
        </div>
      </div>

      <div class="px-6 py-4 border-t border-primary-border flex gap-3">
        <button
          :disabled="store.createLoading"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          @click="emit('close')"
        >Cancel</button>
        <button
          :disabled="store.createLoading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="store.createLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ store.createLoading ? 'Adding...' : 'Add Config' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { X, Settings2, Loader2 } from 'lucide-vue-next'
import { useGroupConfigStore } from '@/stores/groupConfig/groupConfig'

const props = defineProps({
  open:  { type: Boolean, default: false },
  group: { type: Object,  default: null  },
})
const emit = defineEmits(['close'])
const store = useGroupConfigStore()

const form = ref({ label: '', account_type: props.group?.account_type,  account_category: '', currency: '', leverage: null, badge: '', description: '' })

const isValid = computed(() => form.value.label && form.value.account_type && form.value.currency)

watch(() => props.open, (val) => {
  if (val) {
    form.value = {
      label: '',
      account_type: props.group?.account_type,
      account_category: '',
      currency: props.group?.currency ?? '',
      leverage: null,
      badge: '',
      description: '',
    }
  }
})

const submit = () => {
    store.addGroupConfig({
    mt5_group:        props.group?.group,
    label:            form.value.label,
    account_type:     props.group?.account_type,      
    account_category: props.group?.account_category,
    currency:         props.group?.currency,
    leverage:         form.value.leverage,
    badge:            form.value.badge,
    description:      form.value.description,
    }, () => emit('close'))
}
</script>
