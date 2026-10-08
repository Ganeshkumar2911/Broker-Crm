<script setup>
defineProps({
  rows: { type: Array, default: () => ['w-24 h-2.5', 'w-32 h-7', 'w-20 h-2'] },
})
</script>

<template>
  <div class="animate-pulse space-y-3">
    <div v-for="(cls, i) in rows" :key="i" :class="['bg-primary-border rounded-full', cls]" />
  </div>
</template>