<script setup>
import { computed } from "vue";
import { Filter, ArrowRight, Info } from "lucide-vue-next";
import Tooltip from "@/components/common/Tooltip.vue";

const props = defineProps({
  stages: { type: Array, default: () => [] },
  selectedStage: { type: String, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["select-stage"]);

const stageMetrics = computed(() => {
  const list = Array.isArray(props.stages) ? props.stages : [];

  if (!list.length) return [];

  const total =
    list.reduce((sum, item) => sum + Number(item.count || 0), 0) || 1;

  return list.map((s, idx) => {
    const code = s.code || String(s.id);
    const count = Number(s.count ?? 0);
    return {
      code,
      label: s.name || code,
      description: s.description || "",
      color: s.color,
      stepNumber: s.display_order || idx + 1,
      count,
      pct: Math.round((count / total) * 100),
    };
  });
});

function handleStageClick(code) {
  emit("select-stage", props.selectedStage === code ? null : code);
}
</script>

<template>
  <div
    class="bg-card-background border border-primary-border rounded-xl p-5 space-y-4"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2
          class="text-xs font-bold uppercase tracking-wider text-primary-text"
        >
          Onboarding Process Stepper
        </h2>
        <p class="text-[11px] text-secondary-text mt-0.5">
          Select a step to filter leads by onboarding stage
        </p>
      </div>

      <button
        v-if="selectedStage"
        @click="emit('select-stage', null)"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 font-medium transition-colors cursor-pointer"
      >
        <Filter class="w-3 h-3" />
        <span>Clear Filter ({{ selectedStage }})</span>
      </button>
    </div>

    <!-- Stepper Skeleton Loader -->
    <div v-if="loading" class="overflow-x-auto pb-2 pt-1 no-scrollbar">
      <div
        class="flex items-start min-w-[950px] justify-between relative px-2 py-2"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="flex-1 flex flex-col items-center relative animate-pulse"
        >
          <div
            v-if="n < 6"
            class="absolute top-4 left-[50%] right-[-50%] h-[2px] bg-primary-border/40 z-0"
          />
          <div
            class="relative z-10 w-8 h-8 rounded-full bg-primary-border/60 border-2 border-primary-border/40 shrink-0"
          />
          <div class="mt-2.5 flex flex-col items-center gap-1.5 w-full">
            <div class="h-3 w-16 bg-primary-border/50 rounded" />
            <div class="h-4 w-12 bg-primary-border/30 rounded-md" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="stageMetrics.length === 0"
      class="py-6 text-center text-xs text-secondary-text border border-dashed border-primary-border/60 rounded-lg"
    >
      No active stages found. Manage stages to configure your onboarding
      pipeline.
    </div>

    <!-- Stepper Pipeline View -->
    <div v-else class="overflow-x-auto pb-2 pt-1 no-scrollbar">
      <div class="flex items-start min-w-[950px] justify-between relative px-2">
        <div
          v-for="(stg, i) in stageMetrics"
          :key="stg.code"
          @click="handleStageClick(stg.code)"
          class="flex-1 flex flex-col items-center relative group cursor-pointer select-none"
        >
          <!-- Connector Line & Arrow -->
          <div
            v-if="i < stageMetrics.length - 1"
            class="absolute top-4 left-[50%] right-[-50%] h-[2px] z-0 flex items-center justify-center transition-colors"
            :class="
              selectedStage === stg.code
                ? 'bg-primary'
                : 'bg-primary-border group-hover:bg-primary/40'
            "
          >
            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-200 z-10 shrink-0 shadow-xs group-hover:scale-110 group-hover:translate-x-0.5',
                selectedStage === stg.code
                  ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                  : 'bg-card-background text-secondary-text border-primary-border group-hover:border-primary/60 group-hover:text-primary',
              ]"
            >
              <ArrowRight class="w-3 h-3" />
            </div>
          </div>

          <!-- Step Circle Node -->
          <div
            :class="[
              'relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2',
              selectedStage === stg.code
                ? 'bg-primary border-primary text-white shadow-primary/30 scale-110'
                : 'bg-background border-primary-border text-secondary-text group-hover:border-primary/50 group-hover:text-primary-text',
            ]"
          >
            <span>{{ stg.stepNumber }}</span>
          </div>

          <!-- Step Title & Metrics -->
          <div class="mt-2.5 text-center px-1">
            <div class="flex items-center justify-center gap-1">
              <p
                :class="[
                  'text-[11px] font-semibold tracking-tight uppercase transition-colors line-clamp-1',
                  selectedStage === stg.code
                    ? 'text-primary font-bold'
                    : 'text-primary-text group-hover:text-primary',
                ]"
              >
                {{ stg.label }}
              </p>

              <Tooltip
                v-if="stg.description"
                :text="stg.description"
                :position="i === stageMetrics.length - 1 ? 'left' : 'right'"
                textSize="10px"
              >
                <button
                  type="button"
                  class="p-0.5 text-secondary-text hover:text-primary transition-colors cursor-pointer inline-flex items-center justify-center shrink-0"
                  @click.stop
                >
                  <Info class="w-3 h-3" />
                </button>
              </Tooltip>
            </div>

            <div class="mt-1 flex items-center justify-center gap-1.5">
              <span
                :class="[
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-md border',
                  selectedStage === stg.code
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-background text-secondary-text border-primary-border/60',
                ]"
              >
                {{ stg.count }}
              </span>
              <span class="text-[10px] text-secondary-text font-medium">
                {{ stg.pct }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
