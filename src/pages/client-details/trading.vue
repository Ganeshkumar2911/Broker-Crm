<template>
  <div class="space-y-5 pt-4 pb-12">
    <!-- ─── TOP HEADER ───────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-base sm:text-lg font-bold text-primary-text">
          Trading Activity
        </h3>
        <p class="text-xs text-secondary-text mt-0.5">
          Real-time trade logs, positions, orders, and trading statistics.
        </p>
      </div>
    </div>

    <!-- Main Card -->
    <div
      class="bg-card-background/40 border border-primary-border rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[320px]"
    >
      <div
        class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3"
      >
        <LineChart class="w-6 h-6" />
      </div>
      <h4 class="text-base font-bold text-primary-text">Trading Module</h4>
      <p class="text-xs text-secondary-text mt-1 max-w-sm">
        Trading account logs and position history will be displayed here.
      </p>
    </div>
  </div>
</template>

<script setup>
import { LineChart } from "lucide-vue-next";
</script>