<script setup>
import { computed, onMounted } from "vue";
import { Doughnut, Bar, Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { PieChart, BarChart3, TrendingUp } from "lucide-vue-next";
import { useLeadStageStore } from "@/stores/leadStage/leadStage";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const props = defineProps({
  leads: { type: Array, default: () => [] },
  stages: { type: Array, default: null },
});

const leadStageStore = useLeadStageStore();

onMounted(() => {
  if (!props.stages && !leadStageStore.isFetched) {
    leadStageStore.fetchStages();
  }
});

const activeStages = computed(() => {
  if (Array.isArray(props.stages) && props.stages.length > 0) {
    return props.stages;
  }
  return leadStageStore.stages || [];
});

const defaultColors = [
  "#3b82f6",
  "#0ea5e9",
  "#f59e0b",
  "#6366f1",
  "#10b981",
  "#14b8a6",
  "#ec4899",
  "#8b5cf6",
  "#71717a",
];

// 1. Stage Distribution Doughnut
const stageChartData = computed(() => {
  const currentStages = activeStages.value;

  if (!currentStages || currentStages.length === 0) {
    return {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }

  const labels = currentStages.map((s) => s.name || s.code);
  const counts = currentStages.map((s) => {
    if (props.leads && props.leads.length > 0) {
      const matchCount = props.leads.filter(
        (l) =>
          l.current_stage?.code === s.code ||
          l.current_stage?.id === s.id ||
          l.stage === s.code ||
          l.stage === s.name,
      ).length;
      return matchCount > 0 ? matchCount : Number(s.count ?? 0);
    }
    return Number(s.count ?? 0);
  });

  const colors = currentStages.map(
    (s, idx) => s.color || defaultColors[idx % defaultColors.length],
  );

  return {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "72%",
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#9ca3af",
        font: { size: 10 },
        padding: 12,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: "#18181b",
      titleColor: "#f4f4f5",
      bodyColor: "#a1a1aa",
      borderColor: "#27272a",
      borderWidth: 1,
      padding: 10,
    },
  },
};

// 2. Lead Source Bar Chart
const sourceChartData = computed(() => {
  return {
    labels: [
      "Website",
      "Facebook",
      "Google",
      "CSV Import",
      "Support",
      "Referral",
    ],
    datasets: [
      {
        label: "Leads Generated",
        data: [42, 35, 28, 18, 15, 22],
        backgroundColor: "#6366f1",
        borderRadius: 8,
        hoverBackgroundColor: "#818cf8",
      },
    ],
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#18181b",
      titleColor: "#f4f4f5",
      bodyColor: "#a1a1aa",
      borderColor: "#27272a",
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#9ca3af", font: { size: 10 } },
    },
    y: {
      grid: { color: "rgba(255, 255, 255, 0.05)" },
      ticks: { color: "#9ca3af", font: { size: 10 } },
    },
  },
};

// 3. Weekly Lead Growth Area Chart
const growthChartData = computed(() => {
  return {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "New Leads",
        data: [12, 19, 15, 25, 22, 30, 27],
        fill: true,
        backgroundColor: "rgba(16, 185, 129, 0.12)",
        borderColor: "#10b981",
        tension: 0.4,
        pointBackgroundColor: "#10b981",
        pointRadius: 4,
      },
    ],
  };
});

const areaOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#18181b",
      titleColor: "#f4f4f5",
      bodyColor: "#a1a1aa",
      borderColor: "#27272a",
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#9ca3af", font: { size: 10 } },
    },
    y: {
      grid: { color: "rgba(255, 255, 255, 0.05)" },
      ticks: { color: "#9ca3af", font: { size: 10 } },
    },
  },
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <!-- Chart 1: Stage Distribution -->
    <div
      class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between shadow-sm"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
          >
            <PieChart class="w-3.5 h-3.5" />
          </div>
          <div>
            <h3
              class="text-xs font-semibold text-primary-text uppercase tracking-wider"
            >
              Stage Distribution
            </h3>
            <p class="text-[11px] text-secondary-text">
              Breakdown by current lead status
            </p>
          </div>
        </div>
      </div>

      <div class="h-56 relative flex items-center justify-center">
        <Doughnut :data="stageChartData" :options="doughnutOptions" />
      </div>
    </div>

    <!-- Chart 2: Lead Source Breakdown -->
    <div
      class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between shadow-sm"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"
          >
            <BarChart3 class="w-3.5 h-3.5" />
          </div>
          <div>
            <h3
              class="text-xs font-semibold text-primary-text uppercase tracking-wider"
            >
              Lead Source Performance
            </h3>
            <p class="text-[11px] text-secondary-text">
              Acquisition channel volume
            </p>
          </div>
        </div>
      </div>

      <div class="h-56">
        <Bar :data="sourceChartData" :options="barOptions" />
      </div>
    </div>

    <!-- Chart 3: Weekly Lead Growth -->
    <div
      class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between shadow-sm"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"
          >
            <TrendingUp class="w-3.5 h-3.5" />
          </div>
          <div>
            <h3
              class="text-xs font-semibold text-primary-text uppercase tracking-wider"
            >
              Weekly Lead Growth
            </h3>
            <p class="text-[11px] text-secondary-text">
              Daily inbound lead volume trend
            </p>
          </div>
        </div>
        <span
          class="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
        >
          +28.4%
        </span>
      </div>

      <div class="h-56">
        <Line :data="growthChartData" :options="areaOptions" />
      </div>
    </div>
  </div>
</template>
