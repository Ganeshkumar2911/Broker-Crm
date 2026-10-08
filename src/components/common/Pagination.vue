<script setup>
import { computed } from 'vue'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-vue-next'

const props = defineProps({
  pagination: { type: Object, required: true },
})

const emit = defineEmits(['page-change'])

const go = (page) => {
  if (page < 1 || page > props.pagination.total_pages) return
  if (page === props.pagination.page) return
  emit('page-change', page)
}

const pages = computed(() => {
  const total   = props.pagination.total_pages
  const current = props.pagination.page

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const result = []

  result.push(1)
  if (current > 3) result.push('...')

  const start = Math.max(2, current - 1)
  const end   = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) result.push(i)

  if (current < total - 2) result.push('...')
  result.push(total)

  return result
})

const isFirst   = computed(() => props.pagination.page === 1)
const isLast    = computed(() => props.pagination.page === props.pagination.total_pages)

// shared classes broken into parts for readability
const baseBtn = `
  w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium
  border border-primary-border
  transition-all duration-150 cursor-pointer select-none
`
</script>

<template>
  <div
    v-if="pagination && pagination.total_pages > 1"
    class="flex items-center justify-end gap-1 mb-2 mr-4"
  >
    <!-- First -->
    <button
      @click="go(1)"
      :disabled="isFirst"
      :class="[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium',
        'border border-primary-border transition-all duration-150 cursor-pointer select-none',
        isFirst
          ? 'opacity-30 cursor-not-allowed text-secondary-text bg-background'
          : 'bg-background text-secondary-text hover:text-primary-text hover:border-primary-border'
      ]"
    >
      <ChevronsLeft class="w-3.5 h-3.5" />
    </button>

    <!-- Prev -->
    <button
      @click="go(pagination.page - 1)"
      :disabled="isFirst"
      :class="[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium',
        'border border-primary-border transition-all duration-150 cursor-pointer select-none',
        isFirst
          ? 'opacity-30 cursor-not-allowed text-secondary-text bg-background'
          : 'bg-background text-secondary-text hover:text-primary-text hover:border-primary-border'
      ]"
    >
      <ChevronLeft class="w-3.5 h-3.5" />
    </button>

    <!-- Pages -->
    <template v-for="p in pages" :key="p === '...' ? `ellipsis-${Math.random()}` : p">
      <!-- Ellipsis -->
      <span
        v-if="p === '...'"
        class="w-8 h-8 flex items-center justify-center text-xs text-secondary-text select-none"
      >
        ...
      </span>

      <!-- Page number -->
      <button
        v-else
        @click="go(p)"
        :class="[
          'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium',
          'border transition-all duration-150 cursor-pointer select-none',
          p === pagination.page
            ? 'bg-primary text-white border-primary-border'
            : 'bg-background text-secondary-text border-primary-border hover:text-primary-text hover:border-primary-border'
        ]"
      >
        {{ p }}
      </button>
    </template>

    <!-- Next -->
    <button
      @click="go(pagination.page + 1)"
      :disabled="isLast"
      :class="[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium',
        'border border-primary-border transition-all duration-150 cursor-pointer select-none',
        isLast
          ? 'opacity-30 cursor-not-allowed text-secondary-text bg-background'
          : 'bg-background text-secondary-text hover:text-primary-text hover:border-primary-border'
      ]"
    >
      <ChevronRight class="w-3.5 h-3.5" />
    </button>

    <!-- Last -->
    <button
      @click="go(pagination.total_pages)"
      :disabled="isLast"
      :class="[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium',
        'border border-primary-border transition-all duration-150 cursor-pointer select-none',
        isLast
          ? 'opacity-30 cursor-not-allowed text-secondary-text bg-background'
          : 'bg-background text-secondary-text hover:text-primary-text hover:border-primary-border'
      ]"
    >
      <ChevronsRight class="w-3.5 h-3.5" />
    </button>
  </div>
</template>