<script setup>
import { FUNNEL_FLOW } from '@/pages/lead-management/mockLeadData'
import { ArrowRight, TrendingDown, Layers } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-card-background border border-primary-border rounded-2xl p-5 relative overflow-hidden">
    <!-- Top subtle glow lines -->
    <span class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Layers class="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">
            Conversion Funnel Flow
          </h3>
          <p class="text-[11px] text-secondary-text">
            Lead conversion velocity across major milestone gates
          </p>
        </div>
      </div>

      <span class="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
        <span>Overall Conversion Rate:</span>
        <strong class="font-bold">15.9%</strong>
      </span>
    </div>

    <!-- Funnel steps connected row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
      <div
        v-for="(step, idx) in FUNNEL_FLOW"
        :key="idx"
        class="group relative bg-background border border-primary-border/80 rounded-xl p-3 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between text-[10px] text-secondary-text mb-1">
            <span class="font-mono">Step 0{{ idx + 1 }}</span>
            <span v-if="step.drop" class="text-rose-400 flex items-center gap-0.5 text-[9px] font-medium">
              <TrendingDown class="w-2.5 h-2.5" />
              {{ step.drop }}
            </span>
          </div>

          <p class="text-xs font-semibold text-primary-text truncate">
            {{ step.stage }}
          </p>
        </div>

        <div class="mt-3">
          <div class="flex items-baseline justify-between">
            <span class="text-xl font-bold text-primary-text">{{ step.count }}</span>
            <span class="text-[10px] font-semibold text-primary">{{ step.pct }}</span>
          </div>

          <div class="w-full h-1 bg-primary-border rounded-full mt-1.5 overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-500"
              :style="{ width: step.pct }"
            />
          </div>
        </div>

        <!-- Connection Arrow for Desktop -->
        <div
          v-if="idx < FUNNEL_FLOW.length - 1"
          class="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-card-background border border-primary-border items-center justify-center text-secondary-text shadow-sm"
        >
          <ArrowRight class="w-3 h-3" />
        </div>
      </div>
    </div>
  </div>
</template>
