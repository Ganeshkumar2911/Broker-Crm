<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  title:      { type: String,           required: true },
  value:      { type: [String, Number], default: '—'   },
  subtext:    { type: String,           default: ''    },
  change:     { type: Number,           default: null  },
  loading:    { type: Boolean,          default: false },
  completed:  { type: Number,           default: 0     },
  pending:    { type: Number,           default: 0     },
  failed:     { type: Number,           default: 0     },
})

const total = computed(() => props.completed + props.pending + props.failed)

const chartData = computed(() => ({
  labels: ['Completed', 'Pending', 'Failed'],
  datasets: [
    {
      data: [props.completed, props.pending, props.failed],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      hoverBackgroundColor: ['#34d399', '#fbbf24', '#f87171'],
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1a2e',
      titleColor: '#9ca3af',
      bodyColor: '#f9fafb',
      borderColor: '#374151',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
      },
    },
  },
}

const stats = computed(() => [
  {
    label: 'Completed',
    sub:   'Successful settlements',
    value: props.completed,
    color: 'text-primary-green',
    dot:   'bg-primary-green',
  },
  {
    label: 'Pending',
    sub:   'Awaiting processing',
    value: props.pending,
    color: 'text-primary-yellow',
    dot:   'bg-primary-yellow',
  },
  {
    label: 'Failed',
    sub:   'Require attention',
    value: props.failed,
    color: 'text-primary-red',
    dot:   'bg-primary-red',
  },
])
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center gap-3 mb-4">
      <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text">Settlement Analytics</p>
      <span class="flex-1 h-px bg-primary-border" />
    </div>

    <div class="group bg-card-background border border-primary-border rounded-2xl p-5 transition-all duration-200 hover:border-primary/40 relative overflow-hidden flex-1 flex flex-col">
    <span class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="animate-pulse space-y-3">
        <div class="h-2.5 w-24 bg-primary-border rounded-full" />
        <div class="h-40 w-full bg-primary-border rounded-xl" />
        <div class="h-2 w-16 bg-primary-border rounded-full" />
      </div>
    </template>

    <!-- Data -->
    <template v-else>

      <!-- Header -->
      <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text mb-4">{{ title }}</p>

      <!-- Middle section: grows to fill available height -->
      <div class="flex flex-col flex-1 gap-4">

        <!-- Donut chart — larger, centered -->
        <div class="relative mx-auto w-[120px] h-[120px] shrink-0">
          <Doughnut :data="chartData" :options="chartOptions" />
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p class="text-2xl font-bold text-primary-text leading-none">{{ total }}</p>
            <p class="text-[10px] text-secondary-text mt-0.5">Total</p>
          </div>
        </div>

        <!-- Stat rows as cards, flex-1 so they expand to fill remaining height -->
        <div class="flex flex-col gap-2 flex-1 justify-center">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="flex items-center justify-between px-3 py-2.5 rounded-xl bg-card-inner border border-primary-border"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-2 h-2 rounded-full shrink-0" :class="stat.dot" />
              <div class="min-w-0">
                <p class="text-[11px] font-semibold text-primary-text leading-none">{{ stat.label }}</p>
                <p class="text-[9px] text-secondary-text mt-0.5 truncate">{{ stat.sub }}</p>
              </div>
            </div>
            <p class="text-sm font-bold shrink-0" :class="stat.color">{{ stat.value }}</p>
          </div>
        </div>

      </div>

      <!-- Divider + Footer -->
      <div class="mt-4 pt-4 border-t border-primary-border flex items-center justify-between">
        <p class="text-[10px] text-secondary-text uppercase tracking-widest">Total Fees Generated</p>
        <p class="text-sm font-bold text-primary-text">{{ value }}</p>
      </div>

      <!-- Optional subtext / change badge -->
      <div v-if="change !== null || subtext" class="mt-2 flex items-center gap-2">
        <span
          v-if="change !== null"
          :class="[
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-md',
            change > 0  ? 'bg-primary-green/10 text-primary-green' :
            change < 0  ? 'bg-primary-red/10 text-primary-red'     :
                          'bg-primary-border text-secondary-text',
          ]"
        >
          {{ change > 0 ? '↑' : change < 0 ? '↓' : '—' }} {{ Math.abs(change) }}%
        </span>
        <span v-if="subtext" class="text-[11px] text-secondary-text">{{ subtext }}</span>
      </div>

    </template>
  </div>
  </div>
</template>
