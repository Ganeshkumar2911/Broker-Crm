<template>
  <span
    class="text-xs px-2 py-0.5 rounded-full border font-medium capitalize"
    :class="classes"
  >
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ status: { type: String, default: '' } })
const classes = computed(() => {
  switch (props.status?.toLowerCase()) {
    case 'approved':
    case 'completed':
    case 'active':
      return 'text-primary border-primary/30 bg-primary/5'
    case 'rejected':
    case 'failed':
      return 'text-secondary-text border-primary-border/50 bg-primary-border/10 opacity-70'
    case 'pending':
      return 'text-secondary-text border-primary-border bg-primary-border/20'
    default:
      return 'text-secondary-text border-primary-border bg-primary-border/10'
  }
})
</script>