<script setup>
import { ref, computed, watch } from "vue";
import {
  Cancel01Icon,
  Loading03Icon,
  RefreshCwIcon,
  DatabaseIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { useCommissionEngineStore } from "@/stores/commissionEngine/commissionEngine";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue", "rebuilt"]);

const store = useCommissionEngineStore();

const form = ref({
  ib_id: null,
  login: "",
  date_from: "",
  date_to: "",
  date_field: "close_time",
  limit: 2000,
});

const rebuildResult = ref(null);

const dateFieldOptions = [
  { label: "Close Time", value: "close_time" },
  { label: "Open Time", value: "open_time" },
  { label: "Either (Open or Close)", value: "either" },
];

// Date range computed wrapper for BaseDatePicker
const dateRangeValue = computed({
  get() {
    if (form.value.date_from || form.value.date_to) {
      return {
        start: form.value.date_from || null,
        end: form.value.date_to || null,
      };
    }
    return null;
  },
  set(val) {
    if (!val) {
      form.value.date_from = "";
      form.value.date_to = "";
    } else if (Array.isArray(val)) {
      form.value.date_from = val[0] || "";
      form.value.date_to = val[1] || "";
    } else if (typeof val === "object") {
      form.value.date_from = val.start || val.from || "";
      form.value.date_to = val.end || val.to || "";
    }
  },
});

let ibSearchTimer = null;
const onIbSearch = (query) => {
  clearTimeout(ibSearchTimer);
  if (!query || !query.trim()) {
    store.searchIbs("");
    return;
  }
  ibSearchTimer = setTimeout(() => {
    store.searchIbs(query).catch(() => {});
  }, 300);
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      rebuildResult.value = null;
      form.value = {
        ib_id: props.initialFilters?.ib_id || null,
        login: props.initialFilters?.login || "",
        date_from: props.initialFilters?.date_from || "",
        date_to: props.initialFilters?.date_to || "",
        date_field: props.initialFilters?.date_field || "close_time",
        limit: props.initialFilters?.limit || 2000,
      };
      if (!store.ibSearchOptions.length) {
        store.searchIbs("");
      }
    }
  },
  { immediate: true }
);

const closeModal = () => {
  rebuildResult.value = null;
  emit("update:modelValue", false);
};

const handleRebuild = async () => {
  try {
    const payload = {
      limit: Number(form.value.limit) || 2000,
    };

    if (form.value.ib_id) {
      payload.ib_id = Number(form.value.ib_id);
    }

    const loginVal =
      form.value.login !== null && form.value.login !== undefined
        ? String(form.value.login).trim()
        : "";
    if (loginVal) {
      payload.login = Number(loginVal);
    }

    if (form.value.date_from) {
      payload.date_from = form.value.date_from;
    }
    if (form.value.date_to) {
      payload.date_to = form.value.date_to;
    }
    if (form.value.date_field) {
      payload.date_field = form.value.date_field;
    }

    const res = await store.rebuildTrades(payload);
    if (res?.data) {
      rebuildResult.value = res.data;
    }
    emit("rebuilt");
  } catch (err) {
    // Handled in store
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-lg bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-primary-border bg-card-background"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20"
              >
                <HugeIcon :icon="DatabaseIcon" :size="20" />
              </div>
              <div>
                <h3 class="title-text text-base text-primary-text font-semibold">
                  Rebuild Trades Pipeline
                </h3>
                <p class="text-xs text-secondary-text">
                  Reconstruct position deals from raw report records
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
              @click="closeModal"
            >
              <HugeIcon :icon="Cancel01Icon" :size="16" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4 overflow-y-auto">
            <!-- Rebuild Result Banner if Available -->
            <div
              v-if="rebuildResult"
              class="p-4 rounded-xl bg-primary-green/10 border border-primary-green/20 space-y-2 animate-in fade-in duration-200"
            >
              <div class="flex items-center gap-2 text-primary-green font-semibold text-xs">
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="16" />
                <span>Rebuild Completed</span>
              </div>
              <div class="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div class="p-2 rounded-lg bg-background border border-primary-border">
                  <span class="text-secondary-text block text-[10px]">Positions</span>
                  <strong class="font-mono text-sm text-primary-text">{{ rebuildResult.positions ?? 0 }}</strong>
                </div>
                <div class="p-2 rounded-lg bg-background border border-primary-border">
                  <span class="text-secondary-text block text-[10px]">Upserted</span>
                  <strong class="font-mono text-sm text-primary">{{ rebuildResult.upserted ?? 0 }}</strong>
                </div>
                <div class="p-2 rounded-lg bg-background border border-primary-border">
                  <span class="text-secondary-text block text-[10px]">Closed</span>
                  <strong class="font-mono text-sm text-primary-green">{{ rebuildResult.closed ?? 0 }}</strong>
                </div>
              </div>
            </div>

            <!-- Notice -->
            <div
              v-else
              class="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-secondary-text leading-relaxed"
            >
              Executes position reconstruction to associate entry (open) and exit (close) deals into unified trade records for commission computation.
            </div>

            <!-- Form Options Grid -->
            <div class="space-y-3.5">
              <!-- IB & Login Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- IB Filter -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-primary-text">
                    IB
                    <span class="text-[10px] text-secondary-text font-normal ml-1">(Optional)</span>
                  </label>
                  <BaseSelect
                    v-model="form.ib_id"
                    :options="store.ibSearchOptions"
                    :isLoading="store.searchLoading"
                    placeholder="All IBs..."
                    searchable
                    allow-all
                    all-label="All IBs"
                    variant="surface"
                    @search="onIbSearch"
                  />
                </div>

                <!-- MT5 Login Filter -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-primary-text">
                    MT5 Login
                    <span class="text-[10px] text-secondary-text font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    v-model="form.login"
                    type="number"
                    placeholder="e.g. 670978"
                    class="input-field w-full px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <!-- Date Field & Date Range Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Date Field -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-primary-text">
                    Date Field
                  </label>
                  <BaseSelect
                    v-model="form.date_field"
                    :options="dateFieldOptions"
                    variant="surface"
                  />
                </div>

                <!-- Date Range -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-primary-text">
                    Date Range
                    <span class="text-[10px] text-secondary-text font-normal ml-1">(Optional)</span>
                  </label>
                  <BaseDatePicker
                    v-model="dateRangeValue"
                    :range="true"
                    placeholder="Select date range..."
                    variant="surface"
                  />
                </div>
              </div>

              <!-- Limit Input -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-primary-text">
                  Batch Reconstruction Limit
                </label>
                <input
                  v-model.number="form.limit"
                  type="number"
                  min="100"
                  max="10000"
                  step="500"
                  class="input-field w-full px-3 py-2 text-xs font-mono"
                />
                <p class="text-[11px] text-secondary-text">
                  Max positions to process in this ops batch (default 2,000).
                </p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 flex items-center justify-end gap-2.5 border-t border-primary-border">
              <button
                type="button"
                class="px-4 py-2 text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background border border-primary-border rounded-xl transition-all cursor-pointer"
                @click="closeModal"
              >
                {{ rebuildResult ? "Done" : "Cancel" }}
              </button>
              <button
                type="button"
                :disabled="store.actionLoading"
                class="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleRebuild"
              >
                <HugeIcon
                  v-if="store.actionLoading"
                  :icon="Loading03Icon"
                  :size="14"
                  class="animate-spin"
                />
                <HugeIcon v-else :icon="RefreshCwIcon" :size="14" />
                <span>{{ rebuildResult ? "Run Again" : "Rebuild Trades" }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
