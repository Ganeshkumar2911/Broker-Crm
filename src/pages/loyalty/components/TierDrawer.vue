<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sticky Header -->
        <div class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/90 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors"
              :style="{ backgroundColor: form.color ? `${form.color}20` : 'var(--color-primary-10)', borderColor: form.color ? `${form.color}40` : 'var(--color-primary-20)' }"
            >
              <Layers class="w-4.5 h-4.5" :style="{ color: form.color || 'var(--color-primary)' }" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                {{ isEditing ? 'Edit Loyalty Tier' : 'Create New Tier' }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                {{ isEditing ? 'Update stage multiplier, color, and point thresholds' : 'Define new progression stage for active traders' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="$emit('close')"
          >
            <X class="w-4.5 h-4.5" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form id="tier-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs" @submit.prevent="handleSubmit">
          <!-- Stage Identity -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Stage Details</span>

            <div class="space-y-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Tier Code <span class="text-rose-400">*</span></label>
                <input
                  v-model="form.code"
                  type="text"
                  placeholder="e.g. BRONZE"
                  required
                  :disabled="isEditing"
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary uppercase font-mono transition disabled:opacity-50"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Display Name <span class="text-rose-400">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Bronze"
                  required
                  class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
                />
              </div>

              <!-- Color Picker & Presets -->
              <div class="space-y-2">
                <label class="font-semibold text-primary-text flex items-center justify-between">
                  <span>Tier Badge Color</span>
                  <span class="font-mono text-[11px] text-secondary-text">{{ form.color || '#CD7F32' }}</span>
                </label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="form.color"
                    type="color"
                    class="w-9 h-8 rounded-lg border border-primary-border bg-card-background cursor-pointer p-0.5"
                  />
                  <input
                    v-model="form.color"
                    type="text"
                    placeholder="#CD7F32"
                    class="flex-1 px-3 py-1.5 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono uppercase text-xs"
                  />
                </div>
                <!-- Preset chips -->
                <div class="flex flex-wrap gap-1.5 pt-1">
                  <button
                    v-for="preset in colorPresets"
                    :key="preset.hex"
                    type="button"
                    class="flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] transition cursor-pointer"
                    :class="form.color?.toLowerCase() === preset.hex.toLowerCase() ? 'border-primary text-primary-text font-bold' : 'border-primary-border text-secondary-text hover:text-primary-text'"
                    @click="form.color = preset.hex"
                  >
                    <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: preset.hex }" />
                    <span>{{ preset.name }}</span>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-1">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Sort Order <span class="text-rose-400">*</span></label>
                  <input
                    v-model.number="form.sort_order"
                    type="number"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Status</label>
                  <BaseSelect
                    v-model="form.is_active"
                    :options="statusOptions"
                    placeholder="Select status..."
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Thresholds & Rates -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Points & Multipliers</span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Min Points <span class="text-rose-400">*</span></label>
                  <input
                    v-model.number="form.min_points"
                    type="number"
                    step="any"
                    placeholder="0"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Max Points</label>
                  <input
                    v-model="form.max_points"
                    type="number"
                    step="any"
                    placeholder="Open-ended (Blank)"
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                  <p class="text-[10px] text-secondary-text">Leave blank for open-ended top tier</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Point Multiplier <span class="text-rose-400">*</span></label>
                  <input
                    v-model.number="form.point_multiplier"
                    type="number"
                    step="any"
                    placeholder="1.0"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Cash Conversion ($/pt) <span class="text-rose-400">*</span></label>
                  <input
                    v-model.number="form.cash_conversion_rate"
                    type="number"
                    step="any"
                    placeholder="0.01"
                    required
                    class="w-full px-3 py-2 bg-card-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <!-- Allow Primary Wallet Transfer -->
                <div class="sm:col-span-2 pt-2 border-t border-primary-border/60">
                  <label class="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      v-model="form.allow_wallet_transfer"
                      type="checkbox"
                      class="w-4 h-4 rounded text-primary border-primary-border focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <p class="font-semibold text-primary-text">Allow Primary Wallet Transfer</p>
                      <p class="text-[10px] text-secondary-text">Enable members in this tier to convert points to their primary trading account</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>

        <!-- Sticky Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 bg-card-background shrink-0">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tier-form"
            :disabled="store.actionLoading"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>{{ isEditing ? 'Save Tier' : 'Create Tier' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { X, Loader2, Layers } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  tier: { type: Object, default: null },
  programId: { type: [Number, String], required: true },
});

const emit = defineEmits(["close", "saved"]);
const store = useLoyaltyStore();

const isEditing = computed(() => Boolean(props.tier && props.tier.id));

const colorPresets = [
  { name: "Bronze", hex: "#CD7F32" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Platinum", hex: "#E5E4E2" },
  { name: "Diamond", hex: "#40E0D0" },
  { name: "Elite Purple", hex: "#8A2BE2" },
];

const statusOptions = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const form = reactive({
  code: "",
  name: "",
  color: "#CD7F32",
  sort_order: 1,
  min_points: 0,
  max_points: "",
  point_multiplier: 1.0,
  cash_conversion_rate: 0.01,
  allow_wallet_transfer: false,
  benefits: {},
  is_active: true,
});

watch(
  () => props.tier,
  (t) => {
    if (t) {
      form.code = t.code ?? "";
      form.name = t.name ?? "";
      form.color = t.color ?? "#CD7F32";
      form.sort_order = t.sort_order ?? 1;
      form.min_points = t.min_points !== null && t.min_points !== undefined ? Number(t.min_points) : 0;
      form.max_points = t.max_points !== null && t.max_points !== undefined ? Number(t.max_points) : "";
      form.point_multiplier = t.point_multiplier !== null && t.point_multiplier !== undefined ? Number(t.point_multiplier) : 1.0;
      form.cash_conversion_rate = t.cash_conversion_rate !== null && t.cash_conversion_rate !== undefined ? Number(t.cash_conversion_rate) : 0.01;
      form.allow_wallet_transfer = Boolean(t.allow_wallet_transfer);
      form.benefits = t.benefits || {};
      form.is_active = t.is_active !== undefined ? Boolean(t.is_active) : true;
    } else {
      form.code = "";
      form.name = "";
      form.color = "#CD7F32";
      form.sort_order = 1;
      form.min_points = 0;
      form.max_points = "";
      form.point_multiplier = 1.0;
      form.cash_conversion_rate = 0.01;
      form.allow_wallet_transfer = false;
      form.benefits = {};
      form.is_active = true;
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  if (isEditing.value) {
    const t = props.tier;
    const patchPayload = {};

    const newCode = form.code.trim().toUpperCase();
    if (newCode !== (t.code || "")) patchPayload.code = newCode;

    const newName = form.name.trim();
    if (newName !== (t.name || "")) patchPayload.name = newName;

    const newColor = form.color || null;
    if (newColor !== (t.color || null)) patchPayload.color = newColor;

    if (Number(form.sort_order) !== Number(t.sort_order)) {
      patchPayload.sort_order = Number(form.sort_order);
    }
    if (Number(form.min_points) !== Number(t.min_points)) {
      patchPayload.min_points = Number(form.min_points);
    }

    const newMax = form.max_points === "" || form.max_points === null ? null : Number(form.max_points);
    const oldMax = t.max_points === "" || t.max_points === null ? null : Number(t.max_points);
    if (newMax !== oldMax) patchPayload.max_points = newMax;

    if (Number(form.point_multiplier) !== Number(t.point_multiplier)) {
      patchPayload.point_multiplier = Number(form.point_multiplier);
    }
    if (Number(form.cash_conversion_rate) !== Number(t.cash_conversion_rate)) {
      patchPayload.cash_conversion_rate = Number(form.cash_conversion_rate);
    }
    if (Boolean(form.allow_wallet_transfer) !== Boolean(t.allow_wallet_transfer)) {
      patchPayload.allow_wallet_transfer = Boolean(form.allow_wallet_transfer);
    }
    if (Boolean(form.is_active) !== Boolean(t.is_active)) {
      patchPayload.is_active = Boolean(form.is_active);
    }

    if (Object.keys(patchPayload).length === 0) {
      emit("close");
      return;
    }

    await store.updateTier(props.tier.id, patchPayload, props.programId);
  } else {
    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      color: form.color || null,
      sort_order: Number(form.sort_order),
      min_points: Number(form.min_points),
      max_points: form.max_points === "" || form.max_points === null ? null : Number(form.max_points),
      point_multiplier: Number(form.point_multiplier),
      cash_conversion_rate: Number(form.cash_conversion_rate),
      allow_wallet_transfer: Boolean(form.allow_wallet_transfer),
      benefits: form.benefits || {},
      is_active: Boolean(form.is_active),
    };
    await store.createTier(props.programId, payload);
  }

  emit("saved");
  emit("close");
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
