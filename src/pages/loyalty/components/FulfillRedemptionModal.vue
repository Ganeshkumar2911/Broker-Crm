<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        @click="$emit('close')"
      >
        <!-- Modal Card -->
        <div
          class="w-full max-w-md bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden text-xs"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between bg-background/50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green">
                <CheckCircle2 class="w-4 h-4" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-sm">Fulfill Store Redemption</h3>
                <p class="text-[11px] text-secondary-text">Redemption #{{ redemption?.id }}</p>
              </div>
            </div>
            <button
              type="button"
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              @click="$emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <form id="fulfill-form" class="p-5 space-y-4" @submit.prevent="handleSubmit">
            <!-- Summary Info -->
            <div class="p-3 bg-background/50 border border-primary-border rounded-xl space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-secondary-text text-[11px]">Product:</span>
                <span class="font-semibold text-primary-text">{{ redemption?.item_snapshot?.title || redemption?.product_id }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-secondary-text text-[11px]">Member Trading A/C:</span>
                <span class="font-mono text-primary font-medium">#{{ redemption?.trading_account_id }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-secondary-text text-[11px]">Points:</span>
                <span class="font-mono text-primary-green font-bold">{{ redemption?.points || redemption?.points_requested }} pts</span>
              </div>
            </div>

            <div class="space-y-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Fulfillment / Shipment Reference</label>
                <input
                  v-model="form.fulfillment_reference"
                  type="text"
                  placeholder="e.g. SHIP-987654 or VOUCHER-ABCD-1234"
                  required
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Carrier / Logistics Partner</label>
                <input
                  v-model="form.carrier"
                  type="text"
                  placeholder="e.g. DHL Express, FedEx, Amazon Digital"
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary text-xs"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Internal Admin Note / Tracking Link</label>
                <textarea
                  v-model="form.tracking"
                  rows="2"
                  placeholder="Tracking URLs, tracking number, or dispatch notes..."
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary text-xs resize-none"
                />
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div class="px-5 py-3.5 border-t border-primary-border flex items-center justify-end gap-2.5 bg-background/40">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="fulfill-form"
              :disabled="store.actionLoading"
              class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-xs shadow-xs"
            >
              <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
              <span>Confirm & Fulfill</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { X, CheckCircle2, Loader2 } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  redemption: { type: Object, default: null },
});

const emit = defineEmits(["close", "fulfilled"]);
const store = useLoyaltyStore();

const form = reactive({
  fulfillment_reference: "",
  carrier: "",
  tracking: "",
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.fulfillment_reference = "";
      form.carrier = "";
      form.tracking = "";
    }
  },
);

const handleSubmit = async () => {
  if (!props.redemption?.id) return;

  const payload = {
    fulfillment_reference: form.fulfillment_reference.trim(),
    fulfillment_payload: form.carrier ? { carrier: form.carrier.trim() } : {},
    fulfillment_metadata: form.tracking ? { tracking: form.tracking.trim() } : {},
  };

  await store.fulfillStoreRedemption(props.redemption.id, payload);
  emit("fulfilled");
  emit("close");
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease-out;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
