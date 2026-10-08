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
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sticky Header -->
        <div class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/90 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <PackageCheck class="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                Store Redemption #{{ redemption?.id || '—' }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                Item snapshot, reserved points, shipping destination & status lifecycle
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

        <!-- Scrollable Content -->
        <div v-if="redemption" class="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          <!-- Status & Lifecycle Banner -->
          <div class="p-4 rounded-2xl bg-background/50 border border-primary-border flex items-center justify-between gap-4">
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-secondary-text">Lifecycle Status</span>
              <div>
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-bold uppercase font-mono tracking-wider inline-flex items-center gap-1.5"
                  :class="getStatusBadgeClass(redemption.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(redemption.status)" />
                  <span>{{ redemption.status }}</span>
                </span>
              </div>
            </div>

            <!-- Points Cost -->
            <div class="text-right space-y-0.5">
              <span class="text-[10px] uppercase font-bold text-secondary-text block">Points Reserved</span>
              <p class="text-base font-bold font-mono text-primary-green">
                {{ redemption.points || redemption.points_requested }} pts
              </p>
              <p v-if="redemption.cash_value_snapshot || redemption.cash_amount" class="text-[10px] font-mono text-secondary-text">
                &asymp; ${{ redemption.cash_value_snapshot || redemption.cash_amount }} USD
              </p>
            </div>
          </div>

          <!-- Product Item Snapshot -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <ShoppingBag class="w-3.5 h-3.5 text-primary" />
              Claimed Product Snapshot
            </span>

            <div class="p-3 bg-card-background border border-primary-border rounded-lg space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="font-bold text-primary-text text-sm">
                    {{ redemption.item_snapshot?.title || redemption.item_snapshot?.name || `Product #${redemption.product_id}` }}
                  </h4>
                  <p class="text-[11px] text-secondary-text capitalize">
                    Type: <span class="font-semibold text-primary-text">{{ redemption.item_snapshot?.type || redemption.reward_type }}</span>
                  </p>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/20">
                  {{ redemption.item_snapshot?.fulfillment_type || 'manual' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Member & Account Context -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-primary" />
              Member & Account Details
            </span>

            <div class="grid grid-cols-2 gap-2.5 text-secondary-text">
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px]">User ID:</span>
                <span class="font-mono font-bold text-primary-text">#{{ redemption.user_id }}</span>
              </div>
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px]">Trading Account:</span>
                <span class="font-mono font-bold text-primary">#{{ redemption.trading_account_id }}</span>
              </div>
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px]">Enrollment ID:</span>
                <span class="font-mono font-bold text-primary-text">#{{ redemption.enrollment_id }}</span>
              </div>
              <div class="p-2.5 bg-card-background border border-primary-border/60 rounded-lg">
                <span class="block text-[10px]">Program ID:</span>
                <span class="font-mono font-bold text-primary-text">#{{ redemption.program_id }}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Details (if any) -->
          <div v-if="redemption.shipping_snapshot" class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <Truck class="w-3.5 h-3.5 text-primary" />
              Delivery & Shipping Snapshot
            </span>

            <div class="p-3 bg-card-background border border-primary-border rounded-lg text-primary-text space-y-1">
              <p class="font-mono text-xs whitespace-pre-wrap leading-relaxed">{{ formatShipping(redemption.shipping_snapshot) }}</p>
            </div>
          </div>

          <!-- Fulfillment & Tracking (if approved or fulfilled) -->
          <div v-if="redemption.fulfillment_payload || redemption.rejection_reason || redemption.admin_note" class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-3">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <FileCheck class="w-3.5 h-3.5 text-primary" />
              Ops Dispatch Notes & Reasons
            </span>

            <div v-if="redemption.rejection_reason" class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 space-y-1">
              <span class="font-bold text-[10px] uppercase">Rejection Reason:</span>
              <p class="text-xs">{{ redemption.rejection_reason }}</p>
            </div>

            <div v-if="redemption.admin_note" class="p-3 bg-card-background border border-primary-border rounded-lg space-y-1">
              <span class="font-bold text-[10px] uppercase text-secondary-text">Admin Note:</span>
              <p class="text-primary-text text-xs">{{ redemption.admin_note }}</p>
            </div>

            <div v-if="redemption.fulfillment_payload" class="p-3 bg-card-background border border-primary-border rounded-lg space-y-1">
              <span class="font-bold text-[10px] uppercase text-secondary-text">Fulfillment Payload:</span>
              <pre class="font-mono text-[10px] text-primary-text overflow-x-auto">{{ JSON.stringify(redemption.fulfillment_payload, null, 2) }}</pre>
            </div>
          </div>

          <!-- Timestamps Audit -->
          <div class="p-4 rounded-xl bg-background/50 border border-primary-border space-y-2 text-secondary-text">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text block">Timestamps Audit</span>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span class="text-[10px] block">Requested At:</span>
                <span class="font-sans text-primary-text">{{ formatDate(redemption.requested_at || redemption.created_at) }}</span>
              </div>
              <div>
                <span class="text-[10px] block">Approved At:</span>
                <span class="font-sans text-primary-text">{{ formatDate(redemption.approved_at) }}</span>
              </div>
              <div>
                <span class="text-[10px] block">Fulfilled At:</span>
                <span class="font-sans text-primary-text">{{ formatDate(redemption.fulfilled_at) }}</span>
              </div>
              <div>
                <span class="text-[10px] block">Rejected At:</span>
                <span class="font-sans text-primary-text">{{ formatDate(redemption.rejected_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Footer Action Bar -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between gap-3 bg-card-background shrink-0">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
            @click="$emit('close')"
          >
            Close
          </button>

          <div v-if="redemption" class="flex items-center gap-2">
            <!-- Reject button if PENDING -->
            <button
              v-if="redemption.status === 'PENDING' && hasPermission('loyalty_redemption.reject')"
              type="button"
              class="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold transition cursor-pointer text-xs"
              @click="$emit('reject', redemption)"
            >
              Reject
            </button>

            <!-- Approve button if PENDING -->
            <button
              v-if="redemption.status === 'PENDING' && hasPermission('loyalty_redemption.approve')"
              type="button"
              class="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer text-xs shadow-xs"
              @click="$emit('approve', redemption)"
            >
              Approve
            </button>

            <!-- Fulfill button if APPROVED -->
            <button
              v-if="redemption.status === 'APPROVED' && hasPermission('loyalty_redemption.fulfill')"
              type="button"
              class="px-3.5 py-2 rounded-xl bg-primary-green hover:bg-primary-green/90 text-white font-semibold transition cursor-pointer text-xs shadow-xs flex items-center gap-1.5"
              @click="$emit('fulfill', redemption)"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>Fulfill</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { X, PackageCheck, ShoppingBag, User, Truck, FileCheck, CheckCircle2 } from "lucide-vue-next";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { formatDate } from "@/utils/timeFormatter";

defineProps({
  open: { type: Boolean, default: false },
  redemption: { type: Object, default: null },
});

defineEmits(["close", "approve", "reject", "fulfill"]);
const { hasPermission } = usePermissionCheck();

const formatShipping = (snapshot) => {
  if (!snapshot) return "—";
  if (typeof snapshot === "string") return snapshot;
  if (typeof snapshot === "object") {
    return Object.entries(snapshot)
      .map(([k, v]) => `${k.replace(/_/g, " ").toUpperCase()}: ${v}`)
      .join("\n");
  }
  return String(snapshot);
};

const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    case "APPROVED":
      return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    case "FULFILLED":
      return "bg-primary-green/10 text-primary-green border border-primary-green/20";
    case "REJECTED":
      return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    default:
      return "bg-background text-secondary-text border border-primary-border";
  }
};

const getStatusDotClass = (status) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-amber-500 animate-ping";
    case "APPROVED":
      return "bg-blue-500";
    case "FULFILLED":
      return "bg-primary-green";
    case "REJECTED":
      return "bg-rose-500";
    default:
      return "bg-secondary-text";
  }
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
