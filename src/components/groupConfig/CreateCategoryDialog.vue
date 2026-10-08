<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
  >
    <div class="bg-card-background rounded-2xl border border-primary-border w-full max-w-xl max-h-[90vh] flex flex-col no-scrollbar" @click.stop>

      <!-- Header -->
      <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <FolderPlus class="w-4 h-4 text-secondary-text" />
          <h2 class="text-sm font-semibold text-primary-text">Create Category</h2>
        </div>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition-colors" @click="emit('close')">
          <X class="w-4 h-4 text-secondary-text" />
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-5">

        <!-- Category Info -->
        <div class="bg-background border border-primary-border rounded-xl p-4 space-y-4">
          <p class="text-[11px] uppercase tracking-widest font-semibold text-secondary-text">Category Info</p>

          <div>
            <p class="text-xs text-secondary-text mb-1.5">Account Category</p>
            <input
              v-model="form.account_category"
              type="text"
              placeholder="e.g. standard, ECN"
              :disabled="store.createLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
            />
          </div>

          <div>
            <p class="text-xs text-secondary-text mb-1.5">Account Type</p>
            <div class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit">
              <button
                v-for="t in ['demo', 'live']"
                :key="t"
                class="px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors"
                :class="form.account_type === t ? 'bg-primary text-white' : 'text-secondary-text hover:text-primary-text'"
                @click="form.account_type = t"
              >
                {{ t }}
              </button>
            </div>
          </div>

          <div>
            <p class="text-xs text-secondary-text mb-1.5">Description</p>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Optional description..."
              :disabled="store.createLoading"
              class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50 resize-none"
            />
          </div>
        </div>

        <!-- Group Info -->
        <div class="bg-background border border-primary-border rounded-xl p-4 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-[11px] uppercase tracking-widest font-semibold text-secondary-text">Group Info</p>
            <span class="text-[10px] text-primary-yellow bg-primary-yellow/10 border border-primary-yellow/20 px-2 py-0.5 rounded-full">
              At least 1 required
            </span>
          </div>

          <!-- MT5 Group Select -->
          <div>
            <p class="text-xs text-secondary-text mb-1.5">MT5 Group</p>
            <BaseSelect
              v-model="form.group.mt5_group"
              :options="groupSelectOptions"
              :isLoading="store.groupSearchLoading"
              placeholder="Search MT5 groups..."
              searchable
              @search="onGroupSearch"
            />
          </div>

          <!-- Selected group preview -->
          <div v-if="form.group.mt5_group" class="bg-card-background border border-primary-border rounded-xl p-3">
            <p class="text-[10px] text-secondary-text mb-1">Selected Group</p>
            <p class="text-xs font-mono font-medium text-primary-text truncate">{{ form.group.mt5_group }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Label</p>
              <input
                v-model="form.group.label"
                type="text"
                placeholder="Group label"
                :disabled="store.createLoading"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Currency</p>
              <input
                :value="form.group.currency"
                type="text"
                readonly
                class="w-full px-3 py-2.5 rounded-lg bg-background border border-primary-border text-secondary-text text-sm cursor-not-allowed opacity-70"
              />
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Leverage</p>
              <input
                v-model.number="form.group.leverage"
                type="number"
                placeholder="500"
                :disabled="store.createLoading"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
            <div>
              <p class="text-xs text-secondary-text mb-1.5">Badge</p>
              <input
                v-model="form.group.badge"
                type="text"
                placeholder="STP, RAW..."
                :disabled="store.createLoading"
                class="w-full px-3 py-2.5 rounded-lg bg-card-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="px-6 py-4 border-t border-primary-border flex gap-3 shrink-0 bg-card-background">
        <button
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors"
          @click="emit('close')"
        >Cancel</button>
        <button
          :disabled="store.createLoading || !isValid"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="submit"
        >
          <Loader2 v-if="store.createLoading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ store.createLoading ? 'Creating...' : 'Create Category' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, FolderPlus, Loader2 } from 'lucide-vue-next'
import { useGroupCategoriesStore } from '@/stores/groupConfig/groupCategories'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit  = defineEmits(['close'])
const store = useGroupCategoriesStore()

const form = ref({
  account_category: '',
  account_type:     'demo',
  description:      '',
  group: { mt5_group: '', label: '', currency: '', leverage: null, badge: '' },
})

const isValid = computed(() =>
  form.value.account_category &&
  form.value.account_type &&
  form.value.group.mt5_group &&
  form.value.group.label
)

const groupSelectOptions = computed(() =>
  store.groupOptions.map((item) => ({
    value: item.group,
    label: item.group,
  }))
)

watch(() => props.open, (val) => {
  if (val) {
    form.value = {
      account_category: '', account_type: 'demo', description: '',
      group: { mt5_group: '', label: '', currency: '', leverage: null, badge: '' },
    }
    store.searchMt5Groups('')
  }
})

watch(() => form.value.group.mt5_group, (selectedGroup) => {
  if (selectedGroup) {
    const selectedItem = store.groupOptions.find(
      (item) => item.group === selectedGroup
    )
    if (selectedItem) {
      form.value.group.currency = selectedItem.currency ?? ''
    }
  }
})

let searchTimer = null
const onGroupSearch = (query) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.searchMt5Groups(query)
  }, 350)
}

const submit = () => {
  store.createCategory({
    mt5_group: form.value.group.mt5_group,
    label: form.value.group.label,
    account_category: form.value.account_category,
    account_type: form.value.account_type,
    currency: form.value.group.currency,
    leverage: form.value.group.leverage,
    badge: form.value.group.badge,
    description: form.value.description,
  }, () => emit('close'))
}
</script>
