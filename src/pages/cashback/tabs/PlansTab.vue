<template>
  <div class="space-y-6">

    <!-- Loading State -->
    <div v-if="store.loading" class="flex justify-center items-center py-12">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!store.plans?.length" class="flex flex-col items-center justify-center py-12 bg-card-background border border-primary-border rounded-xl">
      <span class="text-secondary-text mb-2">No plans available</span>
    </div>

    <!-- Plans Content (Cards & Table) -->
    <template v-else>
      <!-- Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div
          v-for="(plan, index) in store.plans"
          :key="plan.id || plan.code"
          class="relative w-full flex flex-col rounded-2xl overflow-hidden cursor-pointer border border-white/10 transition-all duration-300 hover:border-white/30"
          :style="{ backgroundColor: getPlanColor(index) }"
          @click="openEditModal(plan)"
        >
          <div class="absolute inset-0 bg-black/30 pointer-events-none" />
          <div class="absolute inset-0 bg-linear-to-br from-white/12 to-transparent pointer-events-none" />
          
          <!-- Brand Logo Watermark Background with shine effect strictly inside logo vector paths -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
            <div class="relative w-32 sm:w-36 h-32 sm:h-36">
              <img
                src="/gold_logo.png"
                alt="Plan Logo"
                class="absolute inset-0 w-full h-full opacity-10 object-contain grayscale-[20%]"
              />
              <div
                class="absolute inset-0 pointer-events-none"
                style="-webkit-mask-image: url(/gold_logo.png); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;"
              >
                <div class="w-[350px] h-[800px] absolute top-1/2 left-1/2 -mt-[400px] -ml-[175px] svg-shine-rect"
                     style="background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.08) 65%, rgba(255,255,255,0) 100%);">
                </div>
              </div>
            </div>
          </div>

          <div class="relative z-10 p-5 flex flex-col h-full min-h-35 gap-4">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex flex-col gap-1.5">
                <span class="text-[10px] font-bold uppercase tracking-widest text-white/50 font-mono">
                  Code: {{ plan.code }}
                </span>
                <h3 class="text-xl font-bold text-white leading-tight tracking-tight">{{ plan.name }}</h3>
              </div>
              
              <!-- Custom Status Badge for Cards -->
              <span
                v-if="plan.status?.toLowerCase() === 'active'"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/20 border border-green-500/30 text-green-300 backdrop-blur-sm"
              >
                Active
              </span>
              <span
                v-else
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/10 border border-white/20 text-white/80 backdrop-blur-sm"
              >
                {{ plan.status || 'Unknown' }}
              </span>
            </div>

            <div class="mt-auto pt-4 flex flex-col gap-2.5">
              <div class="flex justify-between items-end border-b border-white/5 pb-2">
                <span class="text-xs font-medium text-white/60">Qualifies On</span>
                <span class="text-sm font-semibold text-white/90 capitalize">{{ plan.qualify_on?.replace(/_/g, ' ') || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-end">
                <span class="text-xs font-medium text-white/60">Rate / Lot</span>
                <span class="text-lg font-black text-white tracking-tight">{{ formatCurrency(plan.rate_per_lot) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View Section -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-semibold text-primary-text">Plans Overview</h3>
            <span class="px-2 py-0.5 rounded-lg text-xs font-medium bg-card-background text-secondary-text border border-primary-border">
              {{ store.plans.length }} {{ store.plans.length === 1 ? 'Plan' : 'Plans' }}
            </span>
          </div>
        </div>

        <div class="bg-card-background border border-primary-border rounded-xl overflow-hidden">
          <DataTable
            :columns="columns"
            :data="store.plans"
            :loading="store.loading"
          >
            <template #cell-code="{ row }">
              <span class="px-2 py-0.5 bg-background border border-primary-border rounded-md font-mono text-xs font-semibold text-primary-text">
                {{ row.code }}
              </span>
            </template>
            <template #cell-name="{ row, index }">
              <div class="flex items-center gap-2">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: getPlanColor(index) }"
                />
                <span class="font-semibold text-primary-text">{{ row.name }}</span>
              </div>
            </template>
            <template #cell-rate_per_lot="{ row }">
              <span class="font-bold text-primary-text">
                {{ formatCurrency(row.rate_per_lot) }}
                <span class="text-xs font-normal text-secondary-text">/ lot</span>
              </span>
            </template>
            <template #cell-qualify_on="{ row }">
              <span class="capitalize text-primary-text text-xs font-medium">
                {{ row.qualify_on?.replace(/_/g, ' ') || '-' }}
              </span>
            </template>
            <template #cell-status="{ row }">
              <StatusBadge :status="row.status" />
            </template>
            <template #cell-updated_at="{ row }">
              <span class="text-xs text-secondary-text">
                {{ formatDateTime(row.updated_at || row.created_at) }}
              </span>
            </template>
            <template #cell-actions="{ row }">
              <button
                class="px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                @click="openEditModal(row)"
              >
                <HugeIcon :icon="PencilEdit01Icon" :size="14" />
                Edit
              </button>
            </template>
          </DataTable>
        </div>
      </div>
    </template>

    <EditPlanModal
      v-if="selectedPlan"
      :plan="selectedPlan"
      @close="closeEditModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import StatusBadge from "@/components/common/StatusBadge.vue";
import DataTable from "@/components/common/DataTable/DataTable.vue";
import EditPlanModal from "../components/EditPlanModal.vue";
import { PencilEdit01Icon } from "@hugeicons/core-free-icons";

const store = useCashbackStore();
const selectedPlan = ref(null);

const columns = [
  { key: "code", label: "Plan Code", sortable: false },
  { key: "name", label: "Plan Name", sortable: false },
  { key: "rate_per_lot", label: "Rate / Lot", sortable: false },
  { key: "qualify_on", label: "Qualify Condition", sortable: false },
  { key: "status", label: "Status", sortable: false },
  { key: "updated_at", label: "Last Updated", sortable: false },
  { key: "actions", label: "Actions", sortable: false, align: "right" },
];

const planColors = [
  '#0f172a', // slate-900
  '#1e1b4b', // indigo-950
  '#022c22', // emerald-950
  '#4a044e', // fuchsia-900
  '#450a0a', // red-950
  '#422006', // orange-950
  '#083344', // cyan-950
  '#312e81', // indigo-900
];

const getPlanColor = (index) => {
  return planColors[index % planColors.length];
};

const formatCurrency = (val) => {
  if (val == null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: store.activeProgram?.currency || "USD" }).format(val);
};

const formatDateTime = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openEditModal = (plan) => {
  selectedPlan.value = plan;
};

const closeEditModal = () => {
  selectedPlan.value = null;
};

onMounted(() => {
  if (store.activeProgram && (!store.isFetched.plans || store.plans.length === 0)) {
    store.fetchPlans(store.activeProgram.id);
  }
});
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


