<template>
  <div class="flex flex-wrap items-center gap-3">
    
    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
      <input
        :value="search"
        type="text"
        placeholder="Search..."
        class="pl-8 pr-3 py-2.5 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text w-48"
        @input="emit('search', $event.target.value)"
      />
    </div>

    <!-- Select instead of buttons -->
    <div class="w-40">
      <BaseSelect
        :modelValue="activeStatus"
        :options="selectOptions"
        placeholder="All"
        :allowAll="true"
        allLabel="All"
        @update:modelValue="emit('filter', $event)"
      />
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Search } from 'lucide-vue-next'

const props = defineProps({
  filters: { type: Array, default: () => [] },
  activeStatus: { type: [String, Number, null], default: null },
  search: { type: String, default: '' },
})

const emit = defineEmits(['filter', 'search'])

const selectOptions = computed(() =>
  props.filters.map(f => ({
    label: f.label,
    value: f.value
  }))
)
</script>