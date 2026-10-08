<script setup>
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  tag: {
    type: Object,
    required: true,
  },
  removable: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['remove'])

// Default fallback color if none provided
const hexColor = computed(() => props.tag?.color || '#3B82F6')

// Convert hex to RGBA for soft background tint compatible with light and dark mode
const badgeStyle = computed(() => {
  const hex = hexColor.value.replace('#', '')
  let r = 59, g = 130, b = 246
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
  }

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
    color: 'var(--color-primary-text)',
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-2 py-0.5 text-xs gap-1 font-medium'
    case 'lg':
      return 'px-3 py-1 text-sm gap-2 font-medium'
    default:
      return 'px-2.5 py-1 text-xs gap-1.5 font-medium'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-md border transition-all duration-200 select-none max-w-full"
    :class="[
      sizeClasses,
      tag.status === 'inactive' ? 'opacity-60 grayscale-[40%]' : '',
    ]"
    :style="badgeStyle"
    :title="tag.description || tag.name"
  >
    <!-- Color Dot -->
    <span
      class="w-2 h-2 rounded-full shrink-0"
      :style="{ backgroundColor: hexColor }"
    />

    <!-- Tag Name -->
    <span class="truncate max-w-[140px] text-primary-text">{{ tag.name }}</span>

    <!-- Optional Inactive Pill -->
    <span
      v-if="showStatus && tag.status === 'inactive'"
      class="text-[10px] uppercase font-bold tracking-wider px-1 bg-primary-red/20 text-primary-red rounded"
    >
      Inactive
    </span>

    <!-- Remove Button -->
    <button
      v-if="removable"
      type="button"
      class="p-0.5 rounded-full hover:bg-primary-border/40 transition-colors focus:outline-none shrink-0 ml-0.5"
      @click.stop="emit('remove', tag)"
      :title="`Remove ${tag.name}`"
    >
      <X class="w-3 h-3 text-secondary-text hover:text-primary-text" />
    </button>
  </span>
</template>
