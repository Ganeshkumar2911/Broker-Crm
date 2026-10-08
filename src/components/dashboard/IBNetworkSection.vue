<script setup>
/**
 * IBNetworkSection — IB Network Intelligence (Section 4)
 * API: dashboard.ib_network_insights
 *   largest_network: { ib_name, downline_count, commission }
 *   deepest_level: number
 *   top_networks: [{ ib_name, downline_count, commission }]
 */
import { computed } from 'vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

const props = defineProps({
  data:    { type: Object,  default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const largestNetwork = computed(() => props.data.largest_network ?? {})
const deepestLevel   = computed(() => props.data.deepest_level ?? 0)
const topNetworks    = computed(() => props.data.top_networks ?? [])

function fmt(v) {
  return `$${Number(v ?? 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// visual depth bars (show up to 5)
const depthBars = computed(() =>
  Array.from({ length: Math.max(deepestLevel.value, 5) }, (_, i) => i < deepestLevel.value)
    .slice(0, 5)
)
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-4">
      <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary-text">IB Network</p>
      <span class="flex-1 h-px bg-primary-border" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <!-- Largest Network -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-200 group">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text mb-4">Largest Network</p>

        <template v-if="loading">
          <SkeletonCard :rows="['w-32 h-5', 'w-20 h-3', 'w-full h-px', 'w-20 h-4', 'w-20 h-4']" />
        </template>
        <template v-else>
          <div class="flex items-start justify-between">
            <div class="min-w-0">
              <p class="text-sm font-bold text-primary-text truncate">{{ largestNetwork.ib_name ?? 'Unnamed IB' }}</p>
              <p class="text-[10px] text-secondary-text mt-0.5">Largest by downline</p>
            </div>
            <!-- node visual -->
            <div class="flex flex-col items-center gap-1 opacity-30 group-hover:opacity-60 transition-opacity shrink-0 ml-2">
              <div class="w-2 h-2 rounded-full bg-primary" />
              <div class="flex gap-1">
                <div class="w-1.5 h-1.5 rounded-full bg-primary/70" />
                <div class="w-1.5 h-1.5 rounded-full bg-primary/70" />
              </div>
              <div class="flex gap-0.5">
                <div class="w-1 h-1 rounded-full bg-primary/50" />
                <div class="w-1 h-1 rounded-full bg-primary/50" />
                <div class="w-1 h-1 rounded-full bg-primary/50" />
              </div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-primary-border">
            <div>
              <p class="text-[10px] text-secondary-text">Downlines</p>
              <p class="text-xl font-bold text-primary-text">{{ largestNetwork.downline_count ?? 0 }}</p>
            </div>
            <div>
              <p class="text-[10px] text-secondary-text">Commission</p>
              <p class="text-xl font-bold text-primary-text">{{ fmt(largestNetwork.commission) }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Network Depth -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-200">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text mb-4">Network Depth</p>

        <template v-if="loading">
          <SkeletonCard :rows="['w-14 h-9', 'w-24 h-3', 'w-full h-8 mt-2']" />
        </template>
        <template v-else>
          <div class="flex items-end gap-3">
            <p class="text-4xl font-bold text-primary-text leading-none">{{ deepestLevel }}</p>
            <p class="text-xs text-secondary-text mb-1">levels deep</p>
          </div>

          <div class="mt-4 flex items-end gap-1.5 h-10">
            <div
              v-for="(active, i) in depthBars"
              :key="i"
              :class="['flex-1 rounded-sm transition-all duration-500', active ? 'bg-primary/80' : 'bg-primary-border']"
              :style="{ height: `${(i + 1) * 20}%` }"
            />
          </div>
          <p class="text-[10px] text-secondary-text mt-3">Deepest referral chain</p>
        </template>
      </div>

      <!-- Top Performing IBs -->
      <div class="bg-card-background border border-primary-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-200">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-secondary-text mb-4">Top Performing IBs</p>

        <template v-if="loading">
          <div class="space-y-2">
            <SkeletonCard v-for="i in 4" :key="i" :rows="['w-full h-8']" />
          </div>
        </template>
        <template v-else>
          <div v-if="!topNetworks.length" class="flex flex-col items-center justify-center h-32 gap-2 text-secondary-text">
            <p class="text-[11px]">No network data yet</p>
          </div>
          <div v-else class="space-y-1.5">
            <div
              v-for="(net, i) in topNetworks"
              :key="i"
              class="flex items-center justify-between py-2 px-3 rounded-xl bg-background border border-primary-border hover:border-primary/20 transition-all duration-150"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-[10px] font-bold text-secondary-text w-4 shrink-0">{{ i + 1 }}</span>
                <div class="min-w-0">
                  <p class="text-[11px] font-medium text-primary-text truncate">{{ net.ib_name }}</p>
                  <p class="text-[10px] text-secondary-text">{{ net.downline_count }} downlines</p>
                </div>
              </div>
              <p class="text-xs font-semibold text-primary shrink-0 ml-2">{{ fmt(net.commission) }}</p>
            </div>
          </div>
        </template>
      </div>

    </div>
  </section>
</template>