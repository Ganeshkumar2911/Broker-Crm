<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs cursor-pointer"
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
        <div class="px-6 py-4.5 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/95 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <HugeIcon :icon="ShoppingBag01Icon" :size="20" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text">
                {{ isEditing ? 'Edit Store Product' : 'Add Store Product' }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                {{ isEditing ? 'Update catalogue item points cost, stock, cash value, and fulfillment' : 'Publish a new reward item to the client loyalty store' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="$emit('close')"
          >
            <HugeIcon :icon="Cancel01Icon" :size="18" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form id="reward-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-4.5 text-xs" @submit.prevent="handleSubmit">
          
          <!-- Program Visibility & Target -->
          <div class="p-4 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
                <HugeIcon :icon="ShieldCheckIcon" :size="14" class="text-primary" />
                Visibility & Scope
              </span>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold"
                :class="form.program_id ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-primary-green/10 text-primary-green border border-primary-green/20'"
              >
                {{ form.program_id ? 'Program-Scoped' : 'Public (All Programs)' }}
              </span>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-primary-text flex items-center justify-between">
                <span>Target Loyalty Program</span>
                <span class="text-[10px] text-secondary-text">Optional</span>
              </label>
              <BaseSelect
                v-model="form.program_id"
                :options="programOptions"
                placeholder="All Programs (Public)"
                searchable
                class="w-full"
              />
              <p class="text-[10px] text-secondary-text">
                {{ form.program_id ? 'Only clients enrolled in this program will see and redeem this item.' : 'Public products are redeemable by any client with at least 1 active enrollment.' }}
              </p>
            </div>
          </div>

          <!-- Item Info Card -->
          <div class="p-4 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <HugeIcon :icon="PackageIcon" :size="14" class="text-primary" />
              Item Details & Classification
            </span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Product Type <span class="text-rose-400">*</span></label>
                  <BaseSelect
                    v-model="form.product_type"
                    :options="productTypeOptions"
                    placeholder="Select type..."
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Fulfillment Type <span class="text-rose-400">*</span></label>
                  <BaseSelect
                    v-model="form.fulfillment_type"
                    :options="fulfillmentTypeOptions"
                    placeholder="Select fulfillment..."
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Product Title / Name <span class="text-rose-400">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Amazon Gift Card $25 or Panther Merchandise Hoodie"
                  required
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Describe the product specifications, voucher terms, or shipping guidelines..."
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition resize-none"
                />
              </div>

              <!-- Multi-Image URLs (Max 4) -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="font-semibold text-primary-text">Product Images (Max 4)</label>
                  <span class="text-[10px] text-secondary-text font-mono">{{ imageUrlsList.length }}/4</span>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="(url, idx) in imageUrlsList"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <div class="w-8 h-8 rounded-lg bg-background border border-primary-border overflow-hidden shrink-0 flex items-center justify-center">
                      <video
                        v-if="url && isVideoUrl(url)"
                        :src="url"
                        autoplay
                        loop
                        muted
                        playsinline
                        class="w-full h-full object-cover"
                      />
                      <img
                        v-else-if="url"
                        :src="url"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.style.display = 'none'"
                      />
                      <HugeIcon v-else :icon="Image01Icon" :size="14" class="text-secondary-text" />
                    </div>
                    <input
                      v-model="imageUrlsList[idx]"
                      type="url"
                      placeholder="https://..."
                      class="flex-1 px-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      class="w-7 h-7 flex items-center justify-center text-secondary-text hover:text-rose-400 rounded-lg hover:bg-background transition cursor-pointer"
                      title="Remove Image"
                      @click="removeImageUrl(idx)"
                    >
                      <HugeIcon :icon="Delete02Icon" :size="14" />
                    </button>
                  </div>
                </div>

                <button
                  v-if="imageUrlsList.length < 4"
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-primary-border hover:border-primary/50 text-secondary-text hover:text-primary transition text-xs cursor-pointer w-full justify-center"
                  @click="addImageUrl"
                >
                  <HugeIcon :icon="PlusSignIcon" :size="12" />
                  <span>Add Image URL</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Cost & Valuation Card -->
          <div class="p-4 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <HugeIcon :icon="Coins01Icon" :size="14" class="text-primary" />
              Points Cost & Value Valuation
            </span>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Points Required <span class="text-rose-400">*</span></label>
                <input
                  v-model.number="form.points_required"
                  type="number"
                  step="any"
                  placeholder="e.g. 800"
                  required
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono font-bold"
                />
              </div>

              <div class="space-y-1">
                <label class="font-semibold text-primary-text">Cash Equivalent Value ($)</label>
                <input
                  v-model.number="form.cash_value"
                  type="number"
                  step="any"
                  placeholder="e.g. 50.00"
                  class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Inventory & Tier Eligibility -->
          <div class="p-4 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-3.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-secondary-text flex items-center gap-1.5">
              <HugeIcon :icon="ShieldCheckIcon" :size="14" class="text-primary" />
              Inventory & Tier Eligibility
            </span>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Available Stock</label>
                  <input
                    v-model="form.stock"
                    type="number"
                    placeholder="Unlimited (Blank)"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                  <p class="text-[10px] text-secondary-text">Decremented on redemption</p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Max Per Client</label>
                  <input
                    v-model="form.max_redemptions_per_user"
                    type="number"
                    placeholder="Unlimited (Blank)"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>
              </div>

              <!-- Minimum Tier (Enabled only for Program-Scoped products) -->
              <div class="space-y-1">
                <label class="font-semibold text-primary-text flex items-center justify-between">
                  <span>Minimum Tier Requirement</span>
                  <span v-if="!form.program_id" class="text-[10px] text-secondary-text">Requires Program Scope</span>
                </label>
                <BaseSelect
                  v-model="form.min_tier_id"
                  :options="tierOptions"
                  :disabled="!form.program_id"
                  :placeholder="!form.program_id ? 'Select a program above to gate by tier' : 'All Tiers (No Limit)'"
                />
                <p v-if="!form.program_id" class="text-[10px] text-secondary-text">
                  Public products cannot set a tier gate. Select a program above to restrict to specific tiers.
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-1">
                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Sort Order</label>
                  <input
                    v-model.number="form.sort_order"
                    type="number"
                    class="w-full px-3 py-2 bg-background border border-primary-border rounded-lg text-primary-text outline-none focus:border-primary transition font-mono"
                  />
                </div>

                <div class="space-y-1">
                  <label class="font-semibold text-primary-text">Status</label>
                  <BaseSelect
                    v-model="form.status"
                    :options="statusOptions"
                    placeholder="Select status..."
                  />
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
            form="reward-form"
            :disabled="store.actionLoading || !form.name.trim() || !form.points_required"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="16" class="animate-spin" />
            <span>{{ isEditing ? 'Save Product' : 'Publish Product' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";
import {
  ShoppingBag01Icon,
  Cancel01Icon,
  PackageIcon,
  Coins01Icon,
  ShieldCheckIcon,
  PlusSignIcon,
  Delete02Icon,
  Image01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";

const props = defineProps({
  open: { type: Boolean, default: false },
  reward: { type: Object, default: null },
  tiers: { type: Array, default: () => [] },
  programId: { type: [Number, String], default: null },
});

const emit = defineEmits(["close", "saved"]);
const store = useLoyaltyStore();

const isEditing = computed(() => Boolean(props.reward && props.reward.id));
const imageUrlsList = ref([]);

const productTypeOptions = [
  { label: "Merchandise & Lifestyle", value: "merchandise" },
  { label: "Gift Card / Digital Voucher", value: "gift_card" },
  { label: "Free VPS Hosting", value: "vps" },
  { label: "Bonus Trading Funds", value: "bonus_funds" },
  { label: "Tier Boost", value: "tier_boost" },
  { label: "Cash Credit", value: "cash" },
  { label: "Other Perk", value: "other" },
];

const fulfillmentTypeOptions = [
  { label: "Manual Fulfillment (Ops queue)", value: "manual" },
  { label: "Wallet Credit (Instant)", value: "wallet" },
  { label: "MT5 Credit Deposit", value: "mt5_credit" },
  { label: "External Partner API", value: "external" },
];

const programOptions = computed(() => [
  { label: "All Programs (Public - Any Active User)", value: null },
  ...(store.programsList || []).map((p) => ({
    label: `${p.name || 'Program'} (${p.status?.toUpperCase() || 'ACTIVE'}) · #${p.id}`,
    value: p.id,
  })),
]);

const tierOptions = computed(() => {
  if (!form.program_id) return [];
  const list = props.tiers || [];
  return [
    { label: "All Tiers (No Limit)", value: null },
    ...list.map((t) => ({
      label: `${t.name} (${t.code})`,
      value: t.id,
    })),
  ];
});

const statusOptions = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
];

const form = reactive({
  program_id: null,
  name: "",
  description: "",
  product_type: "merchandise",
  fulfillment_type: "manual",
  points_required: 500,
  cash_value: "",
  stock: "",
  max_redemptions_per_user: "",
  min_tier_id: null,
  sort_order: 1,
  status: "ACTIVE",
});

const isVideoUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.includes("/video/") ||
    cleanUrl.includes("format=mp4")
  );
};

const addImageUrl = () => {
  if (imageUrlsList.value.length < 4) {
    imageUrlsList.value.push("");
  }
};

const removeImageUrl = (index) => {
  imageUrlsList.value.splice(index, 1);
};

watch(
  () => form.program_id,
  (newPid) => {
    if (!newPid) {
      form.min_tier_id = null;
    }
  }
);

watch(
  () => props.reward,
  (r) => {
    if (r) {
      form.program_id = r.program_id ? Number(r.program_id) : null;
      form.name = r.name || r.title || "";
      form.description = r.description || "";
      form.product_type = r.product_type || r.type || "merchandise";
      form.fulfillment_type = r.fulfillment_type || "manual";
      form.points_required =
        r.points_required !== null && r.points_required !== undefined
          ? Number(r.points_required)
          : (r.points_cost !== null && r.points_cost !== undefined
              ? Number(r.points_cost)
              : 500);
      form.cash_value =
        r.cash_value !== null && r.cash_value !== undefined
          ? Number(r.cash_value)
          : "";
      form.stock =
        r.stock !== null && r.stock !== undefined
          ? r.stock
          : (r.stock_qty !== null && r.stock_qty !== undefined
              ? r.stock_qty
              : "");
      form.max_redemptions_per_user =
        r.max_redemptions_per_user !== null &&
        r.max_redemptions_per_user !== undefined
          ? r.max_redemptions_per_user
          : (r.max_per_user !== null && r.max_per_user !== undefined
              ? r.max_per_user
              : "");
      form.min_tier_id = r.min_tier_id ?? null;
      form.sort_order = r.sort_order ?? 1;
      form.status = r.status || (r.is_active === false ? "INACTIVE" : "ACTIVE");

      const urls =
        Array.isArray(r.image_urls) && r.image_urls.length > 0
          ? r.image_urls
          : r.image_url
            ? [r.image_url]
            : [];
      imageUrlsList.value = [...urls].slice(0, 4);
    } else {
      form.program_id = props.programId ? Number(props.programId) : null;
      form.name = "";
      form.description = "";
      form.product_type = "merchandise";
      form.fulfillment_type = "manual";
      form.points_required = 500;
      form.cash_value = "";
      form.stock = "";
      form.max_redemptions_per_user = "";
      form.min_tier_id = null;
      form.sort_order = 1;
      form.status = "ACTIVE";
      imageUrlsList.value = [];
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  const validUrls = imageUrlsList.value
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, 4);
  const primaryUrl = validUrls[0] || null;

  if (isEditing.value) {
    const r = props.reward;
    const patchPayload = {};

    const newProgramId = form.program_id ? Number(form.program_id) : null;
    const oldProgramId = r.program_id ? Number(r.program_id) : null;
    if (newProgramId !== oldProgramId) {
      patchPayload.program_id = newProgramId;
    }

    const newName = form.name.trim();
    const oldName = r.name || r.title || "";
    if (newName !== oldName) {
      patchPayload.name = newName;
      patchPayload.title = newName;
    }

    const newDesc = form.description ? form.description.trim() : null;
    const oldDesc = r.description ? r.description.trim() : null;
    if (newDesc !== oldDesc) patchPayload.description = newDesc;

    const newType = form.product_type;
    const oldType = r.product_type || r.type || "merchandise";
    if (newType !== oldType) {
      patchPayload.product_type = newType;
      patchPayload.type = newType;
    }

    if (form.fulfillment_type !== (r.fulfillment_type || "manual")) {
      patchPayload.fulfillment_type = form.fulfillment_type;
    }

    const newPoints = Number(form.points_required);
    const oldPoints = Number(r.points_required ?? r.points_cost ?? 500);
    if (newPoints !== oldPoints) {
      patchPayload.points_required = newPoints;
      patchPayload.points_cost = newPoints;
    }

    const newCash =
      form.cash_value === "" || form.cash_value === null
        ? null
        : Number(form.cash_value);
    const oldCash =
      r.cash_value === "" ||
      r.cash_value === null ||
      r.cash_value === undefined
        ? null
        : Number(r.cash_value);
    if (newCash !== oldCash) patchPayload.cash_value = newCash;

    const newStock =
      form.stock === "" || form.stock === null ? null : Number(form.stock);
    const oldStock =
      (r.stock === "" || r.stock === null || r.stock === undefined) &&
      (r.stock_qty === "" || r.stock_qty === null || r.stock_qty === undefined)
        ? null
        : Number(r.stock ?? r.stock_qty);
    if (newStock !== oldStock) {
      patchPayload.stock = newStock;
      patchPayload.stock_qty = newStock;
    }

    const newMaxPerUser =
      form.max_redemptions_per_user === "" ||
      form.max_redemptions_per_user === null
        ? null
        : Number(form.max_redemptions_per_user);
    const oldMaxPerUser =
      (r.max_redemptions_per_user === "" ||
        r.max_redemptions_per_user === null ||
        r.max_redemptions_per_user === undefined) &&
      (r.max_per_user === "" ||
        r.max_per_user === null ||
        r.max_per_user === undefined)
        ? null
        : Number(r.max_redemptions_per_user ?? r.max_per_user);
    if (newMaxPerUser !== oldMaxPerUser) {
      patchPayload.max_redemptions_per_user = newMaxPerUser;
      patchPayload.max_per_user = newMaxPerUser;
    }

    const newMinTier =
      form.program_id && form.min_tier_id ? Number(form.min_tier_id) : null;
    const oldMinTier = r.min_tier_id ? Number(r.min_tier_id) : null;
    if (newMinTier !== oldMinTier) patchPayload.min_tier_id = newMinTier;

    // Check images diff
    const oldUrls = Array.isArray(r.image_urls)
      ? r.image_urls
      : r.image_url
        ? [r.image_url]
        : [];
    if (JSON.stringify(validUrls) !== JSON.stringify(oldUrls)) {
      patchPayload.image_urls = validUrls;
      patchPayload.image_url = primaryUrl;
    }

    if (Number(form.sort_order) !== Number(r.sort_order ?? 1)) {
      patchPayload.sort_order = Number(form.sort_order);
    }

    const oldStatus =
      r.status || (r.is_active === false ? "INACTIVE" : "ACTIVE");
    if (form.status !== oldStatus) {
      patchPayload.status = form.status;
      patchPayload.is_active = form.status === "ACTIVE";
    }

    if (Object.keys(patchPayload).length === 0) {
      emit("close");
      return;
    }

    await store.updateStoreProduct(
      props.reward.id,
      patchPayload,
      props.programId,
    );
  } else {
    const payload = {
      program_id: form.program_id ? Number(form.program_id) : null,
      name: form.name.trim(),
      title: form.name.trim(),
      description: form.description?.trim() || null,
      product_type: form.product_type,
      type: form.product_type,
      fulfillment_type: form.fulfillment_type,
      points_required: Number(form.points_required),
      points_cost: Number(form.points_required),
      cash_value:
        form.cash_value === "" || form.cash_value === null
          ? null
          : Number(form.cash_value),
      stock:
        form.stock === "" || form.stock === null ? null : Number(form.stock),
      stock_qty:
        form.stock === "" || form.stock === null ? null : Number(form.stock),
      max_redemptions_per_user:
        form.max_redemptions_per_user === "" ||
        form.max_redemptions_per_user === null
          ? null
          : Number(form.max_redemptions_per_user),
      max_per_user:
        form.max_redemptions_per_user === "" ||
        form.max_redemptions_per_user === null
          ? null
          : Number(form.max_redemptions_per_user),
      min_tier_id:
        form.program_id && form.min_tier_id ? Number(form.min_tier_id) : null,
      image_urls: validUrls,
      image_url: primaryUrl,
      sort_order: Number(form.sort_order),
      status: form.status,
    };

    await store.createStoreProduct(payload, props.programId);
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
