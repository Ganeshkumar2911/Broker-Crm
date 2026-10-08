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
          class="w-full max-w-lg bg-card-background border border-primary-border rounded-2xl shadow-2xl overflow-hidden text-xs"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div class="px-5 py-4 border-b border-primary-border flex items-center justify-between bg-background/50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <HugeIcon :icon="Coins01Icon" :size="18" />
              </div>
              <div>
                <h3 class="font-bold text-primary-text text-sm">Adjust Loyalty Wallet</h3>
                <p class="text-[11px] text-secondary-text">
                  Manual wallet deposit, promo credit, or balance withdrawal
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
              @click="$emit('close')"
            >
              <HugeIcon :icon="Cancel01Icon" :size="18" />
            </button>
          </div>

          <!-- Body -->
          <form id="credit-wallet-form" class="p-5 space-y-4" @submit.prevent="handleSubmit">
            <!-- Member & Wallet Info Callout -->
            <div class="p-3 rounded-xl bg-background/60 border border-primary-border space-y-2">
              <div class="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                <span class="text-secondary-text">Target Member:</span>
                <span class="font-semibold text-primary-text font-mono">
                  {{ enrollment?.email || `User #${enrollment?.user_id || props.userId}` }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                <span class="text-secondary-text">Program:</span>
                <span class="font-semibold text-primary-text">
                  {{ enrollment?.program_code || store.program?.name || 'Panther Loyalty' }}
                </span>
              </div>
              <div v-if="enrollment?.available_points !== undefined" class="flex items-center justify-between gap-2 flex-wrap text-[11px] pt-1.5 border-t border-primary-border/60">
                <span class="text-secondary-text">Current Available Balance:</span>
                <span class="font-bold text-primary-green font-mono">
                  {{ Number(enrollment.available_points).toLocaleString() }} pts
                </span>
              </div>
            </div>

            <!-- Transaction Type Selection -->
            <div class="space-y-1.5">
              <label class="font-semibold text-primary-text block">Transaction Type</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5"
                  :class="form.transaction_type === 'deposit' || form.transaction_type === 'credit'
                    ? 'bg-primary/10 border-primary text-primary font-semibold'
                    : 'bg-background border-primary-border text-secondary-text hover:text-primary-text'"
                  @click="form.transaction_type = 'deposit'"
                >
                  <div
                    class="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                    :class="form.transaction_type === 'deposit' || form.transaction_type === 'credit' ? 'border-primary' : 'border-secondary-text'"
                  >
                    <div v-if="form.transaction_type === 'deposit' || form.transaction_type === 'credit'" class="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p class="text-xs">Admin Deposit (+)</p>
                    <p class="text-[10px] opacity-75">Comp / bonus / manual grant</p>
                  </div>
                </button>

                <button
                  type="button"
                  class="p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5"
                  :class="form.transaction_type === 'withdrawal'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-500 font-semibold'
                    : 'bg-background border-primary-border text-secondary-text hover:text-primary-text'"
                  @click="form.transaction_type = 'withdrawal'"
                >
                  <div
                    class="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                    :class="form.transaction_type === 'withdrawal' ? 'border-rose-500' : 'border-secondary-text'"
                  >
                    <div v-if="form.transaction_type === 'withdrawal'" class="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </div>
                  <div>
                    <p class="text-xs">Admin Withdrawal (-)</p>
                    <p class="text-[10px] opacity-75">Clawback / balance deduction</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Points Amount -->
            <div class="space-y-1">
              <label class="font-semibold text-primary-text">
                Points Amount <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.points"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="e.g. 500"
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary font-mono text-xs"
                />
                <span class="absolute right-3 top-2 text-secondary-text font-mono text-[11px] pointer-events-none">
                  pts
                </span>
              </div>
              <p class="text-[10px] text-secondary-text">
                {{ form.transaction_type === 'withdrawal' ? 'Points will be deducted from active lots (FIFO order).' : 'Credited points become available immediately in the central wallet.' }}
              </p>
            </div>

            <!-- Reason (Required) -->
            <div class="space-y-1">
              <label class="font-semibold text-primary-text">
                Reason / Note <span class="text-rose-400">*</span>
              </label>
              <textarea
                v-model="form.reason"
                rows="2"
                required
                placeholder="e.g. Comp for support ticket #123, VIP bonus grant, clawback..."
                class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary text-xs resize-none"
              />
            </div>

            <!-- Optional Custom Expiration (Deposit only) -->
            <div v-if="form.transaction_type !== 'withdrawal'" class="space-y-1">
              <label class="font-semibold text-primary-text">
                Custom Expiration Date (Optional)
              </label>
              <BaseDatePicker
                v-model="form.expires_at"
                :enableTime="true"
                :disableFuture="false"
                :placement="props.datePlacement || 'top'"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                placeholder="Leave blank to use default program validity period"
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
              form="credit-wallet-form"
              :disabled="store.actionLoading || !form.points || Number(form.points) <= 0 || !form.reason.trim()"
              class="px-4 py-2 rounded-xl font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-xs shadow-xs text-white"
              :class="form.transaction_type === 'withdrawal' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-primary hover:bg-primary-hover'"
            >
              <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="14" class="animate-spin" />
              <span>
                {{ form.transaction_type === 'withdrawal' ? 'Withdraw' : 'Deposit' }}
                {{ form.points ? Number(form.points).toLocaleString() : '' }} Points
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import {
  Coins01Icon,
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  enrollment: { type: Object, default: null },
  userId: { type: [Number, String], default: null },
  programId: { type: [Number, String], default: null },
  datePlacement: { type: String, default: "top" },
});

const emit = defineEmits(["close", "success"]);
const store = useLoyaltyStore();

const form = reactive({
  transaction_type: "deposit",
  points: "",
  reason: "",
  expires_at: null,
});

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.transaction_type = "deposit";
      form.points = "";
      form.reason = "";
      form.expires_at = null;
    }
  }
);

const handleSubmit = async () => {
  if (!form.points || Number(form.points) <= 0 || !form.reason.trim()) return;

  const payload = {
    transaction_type: form.transaction_type,
    points: Number(form.points),
    reason: form.reason.trim(),
  };

  if (props.enrollment?.id) {
    payload.enrollment_id = props.enrollment.id;
  } else {
    if (props.enrollment?.user_id || props.userId) {
      payload.user_id = props.enrollment?.user_id || props.userId;
    }
    if (props.enrollment?.program_id || props.programId) {
      payload.program_id = props.enrollment?.program_id || props.programId;
    }
  }

  // Only include expires_at for deposits
  if (form.transaction_type !== "withdrawal" && form.expires_at) {
    payload.expires_at = form.expires_at;
  }

  await store.creditWallet(payload);
  emit("success");
  emit("close");
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
