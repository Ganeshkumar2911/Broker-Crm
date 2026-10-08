<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-primary-text">Loyalty Stages & Multipliers</h2>
        <p class="text-xs text-secondary-text">
          Configure stage thresholds, point multipliers, custom badge colors, and cash conversion rates.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="hasPermission('loyalty.update')"
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          @click="handleCreate"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add New Tier</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition cursor-pointer"
          @click="handleRefresh"
        >
          <RefreshCw class="w-3.5 h-3.5 text-primary" :class="store.loading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div v-for="n in 5" :key="n" class="h-32 bg-card-background border border-primary-border rounded-xl animate-pulse" />
      </div>
      <div class="h-44 bg-card-background border border-primary-border rounded-xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="tiers.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <Layers class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">No Loyalty Tiers Configured</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          Create tiers (Bronze, Silver, Gold, Platinum, Elite) to activate tier multiplier progression for this program.
        </p>
      </div>
      <button
        v-if="hasPermission('loyalty.update')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
        @click="handleCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Create First Tier</span>
      </button>
    </div>

    <!-- Content: Stage Cards Grid + Data Table -->
    <div v-else class="space-y-6">
      <!-- Visual Stage Cards Progression Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div
          v-for="tier in tiers"
          :key="tier.id"
          class="relative w-full flex flex-col rounded-2xl overflow-hidden cursor-pointer border border-white/10"
          :style="{ backgroundColor: tier.color || '#11182A' }"
          @click="handleEdit(tier)"
        >
          <div class="absolute inset-0 bg-black/20 pointer-events-none" />
          <div class="absolute inset-0 bg-linear-to-b from-white/8 to-transparent pointer-events-none" />

          <!-- Refined corner sheen -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-white/15 to-transparent rounded-bl-full pointer-events-none opacity-80" />

          <!-- Brand Logo Watermark Background with shine effect strictly inside logo vector paths -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
            <svg
              viewBox="0 0 561.49 388.8"
              class="w-32 sm:w-36 h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask :id="`tier-logo-mask-${tier.id || tier.code}`">
                  <g fill="#ffffff">
                    <path d="M276.33,178.03l.12-28.66c.11-27.43-17.74-51.69-43.95-59.76L96.14,47.68h-.02s-62.81-19.32-62.81-19.32l.04.08L0,18.22s38.12,20.1,52.99,52.6c5.63,12.14,16.05,21.39,28.78,25.53,89.8,29.18,167.67,51.25,194.56,81.68Z"/>
                    <path d="M250.78,169.67c-11.81-9.48-14.62-10.26-33.74-17.42,6.3,8.29,10.73,22.25,12.32,50.48l-67.09-21.36-14.66-38.05c-3.26-8.46-10.28-14.91-18.99-17.44l-56.95-16.53,77.75,164.12c6.15,15.02,35.98,40.23,75.09,69.43l-38.93-101.04,91.74,28.66v-51.96c0-19.73-4.48-31.17-26.53-48.88Z"/>
                    <path d="M342.11,285.66l9.67-133.41c-5.99,2.95-17.08,9.2-34.85,19.78-22.45,16.52-25.12,23.34-25.12,40.53v176.24l90.35-71.64c20.35-16.14,36.43-37.01,46.84-60.81l13.05-29.83c-23.1,6.44-44.97,12.76-59.36,18.3-6.41,15.34-15.76,28.47-40.58,40.83Z"/>
                    <path d="M496.26,42.04l-152.92,46.76c-30.74,9.4-51.6,37.95-51.22,70.1l.24,20.19c24.13-25.38,71.02-47.8,150.99-65.91l-25.39,57,53.54-16.33c3.26-.99,5.96-3.31,7.43-6.39l31.15-65.29c22.5-47.16,51.42-60.54,51.42-60.54l-65.24,20.42Z"/>
                    <path d="M122.54,25.42s123.47,46.95,150.82,56.02c4.49,1.49,9.33,1.54,13.86.16l144.9-54.68C341.87-7.27,217.78-10.11,122.54,25.42Z"/>
                  </g>
                </mask>
                <linearGradient :id="`shine-gradient-${tier.id || tier.code}`" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
                  <stop offset="35%" stop-color="#ffffff" stop-opacity="0.08" />
                  <stop offset="50%" stop-color="#ffffff" stop-opacity="0.6" />
                  <stop offset="65%" stop-color="#ffffff" stop-opacity="0.08" />
                  <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
                </linearGradient>
              </defs>

              <!-- Base subtle watermark -->
              <g fill="#ffffff" opacity="0.08">
                <path d="M276.33,178.03l.12-28.66c.11-27.43-17.74-51.69-43.95-59.76L96.14,47.68h-.02s-62.81-19.32-62.81-19.32l.04.08L0,18.22s38.12,20.1,52.99,52.6c5.63,12.14,16.05,21.39,28.78,25.53,89.8,29.18,167.67,51.25,194.56,81.68Z"/>
                <path d="M250.78,169.67c-11.81-9.48-14.62-10.26-33.74-17.42,6.3,8.29,10.73,22.25,12.32,50.48l-67.09-21.36-14.66-38.05c-3.26-8.46-10.28-14.91-18.99-17.44l-56.95-16.53,77.75,164.12c6.15,15.02,35.98,40.23,75.09,69.43l-38.93-101.04,91.74,28.66v-51.96c0-19.73-4.48-31.17-26.53-48.88Z"/>
                <path d="M342.11,285.66l9.67-133.41c-5.99,2.95-17.08,9.2-34.85,19.78-22.45,16.52-25.12,23.34-25.12,40.53v176.24l90.35-71.64c20.35-16.14,36.43-37.01,46.84-60.81l13.05-29.83c-23.1,6.44-44.97,12.76-59.36,18.3-6.41,15.34-15.76,28.47-40.58,40.83Z"/>
                <path d="M496.26,42.04l-152.92,46.76c-30.74,9.4-51.6,37.95-51.22,70.1l.24,20.19c24.13-25.38,71.02-47.8,150.99-65.91l-25.39,57,53.54-16.33c3.26-.99,5.96-3.31,7.43-6.39l31.15-65.29c22.5-47.16,51.42-60.54,51.42-60.54l-65.24,20.42Z"/>
                <path d="M122.54,25.42s123.47,46.95,150.82,56.02c4.49,1.49,9.33,1.54,13.86.16l144.9-54.68C341.87-7.27,217.78-10.11,122.54,25.42Z"/>
              </g>

              <!-- Shine effect strictly masked to the logo paths -->
              <g :mask="`url(#tier-logo-mask-${tier.id || tier.code})`">
                <rect
                  x="-350"
                  y="-200"
                  width="350"
                  height="800"
                  :fill="`url(#shine-gradient-${tier.id || tier.code})`"
                  class="svg-shine-rect"
                />
              </g>
            </svg>
          </div>

          <div class="relative z-10 p-4 flex flex-col h-full justify-between gap-3">
            <!-- Header: Stage, Status, and Edit -->
            <div class="flex items-start justify-between">
              <div class="flex flex-col gap-0.5">
                <span class="text-[9px] font-bold uppercase tracking-widest text-white/50 font-mono">
                  Stage #{{ tier.sort_order }}
                </span>
                <div class="flex items-center gap-1.5">
                  <h3 class="text-base font-bold text-white leading-none tracking-tight">{{ tier.name }}</h3>
                  <!-- Status Badge -->
                  <span
                    v-if="!tier.is_active"
                    class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-red-500/20 border border-red-500/30 text-red-200 backdrop-blur-sm"
                  >
                    Inactive
                  </span>
                </div>
              </div>

              <!-- Edit Button -->
              <!-- <button
                v-if="hasPermission('loyalty.update')"
                type="button"
                class="w-6.5 h-6.5 rounded-full bg-black/20 border border-white/10 hover:bg-white/15 hover:border-white/30 flex items-center justify-center transition-all duration-200 cursor-pointer"
                title="Edit Tier"
                @click.stop="handleEdit(tier)"
              >
                <Pencil class="w-3 h-3 text-white/80" />
              </button> -->
            </div>

            <div class="flex flex-col gap-2">
              <!-- Code Pill -->
              <div class="inline-flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-md bg-black/30 border border-white/10 shadow-inner">
                <div class="w-1.5 h-1.5 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                <span class="text-[10px] font-mono font-medium text-white/90 uppercase tracking-wider">
                  {{ tier.code }}
                </span>
              </div>

              <!-- Points Requirement -->
              <div class="flex flex-col gap-0.5">
                <span class="text-[9px] font-semibold text-white/50 uppercase tracking-widest">Points Required</span>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-base font-bold text-white tracking-tight font-mono">
                    {{ Number(tier.min_points).toLocaleString() }}
                  </span>
                  <span class="text-xs font-medium text-white/40">to</span>
                  <span
                    v-if="tier.max_points !== null && tier.max_points !== undefined"
                    class="text-base font-bold text-white tracking-tight font-mono"
                  >
                    {{ Number(tier.max_points).toLocaleString() }}
                  </span>
                  <span
                    v-else
                    class="text-2xl font-light text-white leading-none inline-flex items-center"
                    title="No upper limit"
                  >
                    &infin;
                  </span>
                  <span class="text-[10px] font-bold text-white/60 tracking-wider uppercase ml-0.5">PTS</span>
                </div>
              </div>
            </div>

            <!-- Actions / Metrics Row -->
            <div class="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/10">
              <div class="flex flex-col gap-0.5">
                <span class="text-[9px] font-medium text-white/50 uppercase tracking-widest">Multiplier</span>
                <div class="flex items-baseline gap-0.5">
                  <span class="text-xs font-bold text-white font-mono">{{ tier.point_multiplier }}</span>
                  <span class="text-[10px] text-white/60 font-mono">&times;</span>
                </div>
              </div>

              <div class="flex flex-col gap-0.5">
                <span class="text-[9px] font-medium text-white/50 uppercase tracking-widest">Cash Value</span>
                <div class="flex items-baseline gap-0.5">
                  <span class="text-xs font-bold text-white font-mono">${{ tier.cash_conversion_rate }}</span>
                  <span class="text-[9px] text-white/50">/pt</span>
                </div>
              </div>

              <div class="flex flex-col gap-0.5">
                <span class="text-[9px] font-medium text-white/50 uppercase tracking-widest">Wallet Transfer</span>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider"
                  :class="tier.allow_wallet_transfer ? 'text-primary-green' : 'text-white/50'"
                >
                  {{ tier.allow_wallet_transfer ? 'Enabled' : 'Disabled' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tiers Table -->
      <div class="bg-card-background border border-primary-border rounded-xl overflow-hidden shadow-2xs">
        <div class="px-4 py-3 border-b border-primary-border flex items-center justify-between bg-background/50">
          <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">All Tier Stages ({{ tiers.length }})</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-background/60 text-secondary-text border-b border-primary-border">
              <tr>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Order</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Tier Code</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Name</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Color</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Min Points</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Max Points</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Multiplier</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Cash Rate</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Wallet Convert</th>
                <th class="py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider">Status</th>
                <th v-if="hasPermission('loyalty.update')" class="py-2.5 px-4 text-right text-[11px] font-medium uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border">
              <tr v-for="tier in tiers" :key="tier.id" class="hover:bg-background/50 transition">
                <td class="py-3 px-4 font-mono font-medium text-secondary-text">#{{ tier.sort_order }}</td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded font-mono text-[11px] font-bold border"
                    :style="{
                      backgroundColor: tier.color ? `${tier.color}15` : 'var(--color-primary-10)',
                      color: tier.color || 'var(--color-primary)',
                      borderColor: tier.color ? `${tier.color}35` : 'var(--color-primary-20)',
                    }"
                  >
                    {{ tier.code }}
                  </span>
                </td>
                <td class="py-3 px-4 font-semibold text-primary-text">{{ tier.name }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-3.5 h-3.5 rounded-full border border-white/20 shadow-2xs shrink-0"
                      :style="{ backgroundColor: tier.color || '#CD7F32' }"
                    />
                    <span class="font-mono text-[11px] text-secondary-text">{{ tier.color || 'Default' }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono text-primary-text">{{ tier.min_points }}</td>
                <td class="py-3 px-4 font-mono text-secondary-text">
                  {{ tier.max_points !== null && tier.max_points !== undefined ? tier.max_points : 'Open-Ended (∞)' }}
                </td>
                <td class="py-3 px-4 font-mono font-semibold text-primary">{{ tier.point_multiplier }}&times;</td>
                <td class="py-3 px-4 font-mono text-primary-text">${{ tier.cash_conversion_rate }}</td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                    :class="tier.allow_wallet_transfer ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-background text-secondary-text border-primary-border'"
                  >
                    {{ tier.allow_wallet_transfer ? 'Enabled' : 'Disabled' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    :class="tier.is_active ? 'bg-primary-green/10 text-primary-green' : 'bg-rose-500/10 text-rose-400'"
                  >
                    {{ tier.is_active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </td>
                <td v-if="hasPermission('loyalty.update')" class="py-3 px-4 text-right">
                  <button
                    type="button"
                    class="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-primary-border hover:bg-background text-secondary-text hover:text-primary transition cursor-pointer"
                    title="Edit Tier"
                    @click="handleEdit(tier)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tier Slide-Over Drawer -->
    <TierDrawer
      :open="isDrawerOpen"
      :tier="selectedTier"
      :programId="programId"
      @close="isDrawerOpen = false"
      @saved="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Award, Plus, RefreshCw, Layers, Pencil } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import logoIcon from "@/assets/logo.svg";
import TierDrawer from "../components/TierDrawer.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isDrawerOpen = ref(false);
const selectedTier = ref(null);

const tiers = computed(() => store.tiers || []);
const programId = computed(() => store.program?.id || null);

const handleCreate = () => {
  selectedTier.value = null;
  isDrawerOpen.value = true;
};

const handleEdit = (tier) => {
  selectedTier.value = tier;
  isDrawerOpen.value = true;
};

const handleRefresh = () => {
  if (programId.value) {
    store.fetchTiers(programId.value, true);
  }
};

watch(
  programId,
  (newId) => {
    if (newId) {
      store.fetchTiers(newId, true);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.svg-shine-rect {
  transform-origin: center;
  animation: svg-logo-shine 6s ease-in-out infinite;
}

@keyframes svg-logo-shine {
  0% {
    transform: translateX(-350px) rotate(25deg);
  }

  35% {
    transform: translateX(850px) rotate(25deg);
  }

  100% {
    transform: translateX(850px) rotate(25deg);
  }
}
</style>
