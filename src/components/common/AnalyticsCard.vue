<template>
  <!-- Skeleton -->
  <div v-if="loading" class="rounded-2xl bg-card-background border border-primary-border p-5 animate-pulse">
    <div class="flex items-start justify-between mb-4">
      <div class="w-8 h-8 rounded-xl bg-primary-border/40" />
      <div class="w-16 h-4 rounded-full bg-primary-border/40" />
    </div>
    <div class="w-24 h-6 rounded-lg bg-primary-border/40 mb-1" />
    <div class="w-32 h-3 rounded-full bg-primary-border/30" />
  </div>

  <!-- Card -->
  <div
    v-else
    class="group rounded-2xl bg-card-background border border-primary-border p-5 hover:border-primary/40 transition-all duration-300 cursor-default"
  >
    <div class="flex items-start justify-between mb-4">
      <div class="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <component :is="icon" :size="15" class="text-primary" />
      </div>
      <!-- Trend badge -->
      <span
        v-if="trend !== undefined"
        class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
        :class="trendClasses"
      >
        <component :is="trend >= 0 ? TrendingUp : TrendingDown" :size="10" />
        {{ Math.abs(trend) }}%
      </span>
    </div>

    <div class="space-y-1">
      <p class="text-xl font-semibold text-primary-text tracking-tight tabular-nums">{{ formattedValue }}</p>
      <p class="text-xs text-secondary-text">{{ label }}</p>
      <p v-if="sub" class="text-xs text-secondary-text/60">{{ sub }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

const props = defineProps({
  icon: { type: Object, required: true },
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  prefix: { type: String, default: '' },
  trend: { type: Number, default: undefined },
  sub: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  format: { type: String, default: 'number' }, // 'number' | 'currency' | 'raw'
})

const formattedValue = computed(() => {
  if (props.format === 'raw') return props.value
  const num = parseFloat(props.value) || 0
  if (props.format === 'currency') {
    if (num >= 1000000) return `${props.prefix}${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${props.prefix}${(num / 1000).toFixed(1)}K`
    return `${props.prefix}${num.toFixed(2)}`
  }
  // number
  if (num >= 1000000) return `${props.prefix}${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${props.prefix}${(num / 1000).toFixed(1)}K`
  return `${props.prefix}${num.toLocaleString()}`
})

const trendClasses = computed(() => {
  if (props.trend === 0) return 'text-secondary-text border-primary-border bg-primary-border/10'
  return props.trend > 0
    ? 'text-primary border-primary/30 bg-primary/5'
    : 'text-secondary-text border-primary-border/50 bg-primary-border/10'
})
</script>