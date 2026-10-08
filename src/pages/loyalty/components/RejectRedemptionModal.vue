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
              <div class="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle class="w-4 h-4" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-sm">Reject Store Redemption</h3>
                <p class="text-[11px] text-secondary-text">Redemption #{{ redemption?.id }} &bull; Points & Stock will be restored</p>
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
          <form id="reject-form" class="p-5 space-y-4" @submit.prevent="handleSubmit">
            <!-- Warning Callout -->
            <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 space-y-1">
              <p class="font-semibold text-xs">Points & Stock Restoration</p>
              <p class="text-[11px] leading-relaxed text-rose-300">
                Rejecting this request will immediately release the reserved <strong>{{ redemption?.points || redemption?.points_requested }} points</strong> back to the member's wallet and increment available product stock.
              </p>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-primary-text">Rejection Reason <span class="text-rose-400">*</span></label>
              <textarea
                v-model="form.reason"
                rows="3"
                placeholder="e.g. Out of stock, invalid shipping address, duplicate request..."
                required
                class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-rose-400 text-xs resize-none"
              />
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-primary-text">Internal Admin Note (Optional)</label>
              <input
                v-model="form.note"
                type="text"
                placeholder="Internal memo for ops audit log..."
                class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary text-xs"
              />
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
              form="reject-form"
              :disabled="store.actionLoading"
              class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-xs shadow-xs"
            >
              <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
              <span>Confirm Rejection</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { X, AlertTriangle, Loader2 } from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  redemption: { type: Object, default: null },
});

const emit = defineEmits(["close", "rejected"]);
const store = useLoyaltyStore();

const form = reactive({
  reason: "",
  note: "",
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.reason = "";
      form.note = "";
    }
  },
);

const handleSubmit = async () => {
  if (!props.redemption?.id) return;

  const payload = {
    rejection_reason: form.reason.trim(),
    note: form.note.trim() || form.reason.trim(),
  };

  await store.rejectStoreRedemption(props.redemption.id, payload);
  emit("rejected");
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
