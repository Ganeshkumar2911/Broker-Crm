<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border">
        <div>
          <h3 class="text-base font-bold text-primary-text">
            {{ isEditing ? 'Edit Tier' : 'Create New Tier' }}
          </h3>
          <p class="text-xs text-secondary-text">Set stage point requirements, multipliers, and cash rates.</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
          @click="$emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Content -->
      <form class="p-6 space-y-4 text-xs" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Code -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Tier Code</label>
            <input
              v-model="form.code"
              type="text"
              placeholder="e.g. BRONZE"
              required
              :disabled="isEditing"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary uppercase font-mono transition disabled:opacity-50"
            />
          </div>

          <!-- Name -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Tier Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Bronze"
              required
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
            />
          </div>

          <!-- Sort Order -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Sort Order</label>
            <input
              v-model.number="form.sort_order"
              type="number"
              required
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Active Switch -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Active Status</label>
            <BaseSelect
              v-model="form.is_active"
              :options="statusOptions"
              placeholder="Select status..."
              variant="surface"
            />
          </div>

          <!-- Min Points -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Min Points</label>
            <input
              v-model.number="form.min_points"
              type="number"
              step="any"
              placeholder="0"
              required
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Max Points -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Max Points (Blank for Unlimited)</label>
            <input
              v-model="form.max_points"
              type="number"
              step="any"
              placeholder="Leave empty for open-ended"
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Point Multiplier -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Point Multiplier</label>
            <input
              v-model.number="form.point_multiplier"
              type="number"
              step="any"
              placeholder="1.0"
              required
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Cash Conversion Rate -->
          <div class="space-y-1">
            <label class="font-semibold text-primary-text">Cash Conversion Rate ($/pt)</label>
            <input
              v-model.number="form.cash_conversion_rate"
              type="number"
              step="any"
              placeholder="0.01"
              required
              class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
            />
          </div>

          <!-- Allow Primary Wallet Transfer -->
          <div class="sm:col-span-2 flex items-center gap-2 pt-2">
            <input
              id="tier_wallet_transfer"
              v-model="form.allow_wallet_transfer"
              type="checkbox"
              class="w-4 h-4 rounded text-primary border-primary-border focus:ring-0 cursor-pointer"
            />
            <label for="tier_wallet_transfer" class="font-semibold text-primary-text cursor-pointer">
              Allow Primary Wallet Transfer (convert points to primary trading account)
            </label>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-primary-border">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="store.actionLoading"
            class="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="store.actionLoading" class="w-4 h-4 animate-spin" />
            <span>{{ isEditing ? 'Save Tier' : 'Create Tier' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { X, Loader2 } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  tier: { type: Object, default: null },
  programId: { type: [Number, String], required: true },
});

const emit = defineEmits(["close", "saved"]);
const store = useLoyaltyStore();

const isEditing = computed(() => Boolean(props.tier && props.tier.id));

const statusOptions = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const form = reactive({
  code: "",
  name: "",
  sort_order: 1,
  min_points: 0,
  max_points: "",
  point_multiplier: 1.0,
  cash_conversion_rate: 0.01,
  allow_wallet_transfer: false,
  is_active: true,
});

watch(
  () => props.tier,
  (t) => {
    if (t) {
      form.code = t.code ?? "";
      form.name = t.name ?? "";
      form.sort_order = t.sort_order ?? 1;
      form.min_points = t.min_points !== null && t.min_points !== undefined ? Number(t.min_points) : 0;
      form.max_points = t.max_points !== null && t.max_points !== undefined ? Number(t.max_points) : "";
      form.point_multiplier = t.point_multiplier !== null && t.point_multiplier !== undefined ? Number(t.point_multiplier) : 1.0;
      form.cash_conversion_rate = t.cash_conversion_rate !== null && t.cash_conversion_rate !== undefined ? Number(t.cash_conversion_rate) : 0.01;
      form.allow_wallet_transfer = Boolean(t.allow_wallet_transfer);
      form.is_active = t.is_active !== undefined ? Boolean(t.is_active) : true;
    } else {
      form.code = "";
      form.name = "";
      form.sort_order = 1;
      form.min_points = 0;
      form.max_points = "";
      form.point_multiplier = 1.0;
      form.cash_conversion_rate = 0.01;
      form.allow_wallet_transfer = false;
      form.is_active = true;
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  const payload = {
    code: form.code,
    name: form.name,
    sort_order: form.sort_order,
    min_points: Number(form.min_points),
    max_points: form.max_points === "" || form.max_points === null ? null : Number(form.max_points),
    point_multiplier: Number(form.point_multiplier),
    cash_conversion_rate: Number(form.cash_conversion_rate),
    allow_wallet_transfer: Boolean(form.allow_wallet_transfer),
    is_active: Boolean(form.is_active),
  };

  if (isEditing.value) {
    await store.updateTier(props.tier.id, payload, props.programId);
  } else {
    await store.createTier(props.programId, payload);
  }

  emit("saved");
  emit("close");
};
</script>
