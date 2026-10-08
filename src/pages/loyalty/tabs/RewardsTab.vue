<template>
  <div class="space-y-6">
    <!-- Header & Action -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-base font-semibold text-primary-text">Store Products & Catalogue</h2>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
            {{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'Product' : 'Products' }}
          </span>
        </div>
        <p class="text-xs text-secondary-text">
          Client loyalty store inventory including digital gift cards, merchandise, VPS hosting, tier boosts, and cash credits.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="hasPermission('loyalty_store.create') || hasPermission('loyalty.update')"
          type="button"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          @click="handleCreate"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Store Product</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-border bg-card-background hover:bg-background text-secondary-text hover:text-primary-text text-xs font-medium transition cursor-pointer"
          @click="handleRefresh"
        >
          <RefreshCw class="w-3.5 h-3.5 text-primary" :class="store.loading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="flex flex-wrap items-center gap-2.5 p-3 bg-card-background border border-primary-border rounded-xl text-xs">
      <div class="relative w-full sm:w-56">
        <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products by title..."
          class="w-full pl-8 pr-3 py-1.5 bg-background border border-primary-border rounded-lg text-primary-text placeholder:text-secondary-text/60 outline-none focus:border-primary transition text-xs"
        />
      </div>

      <div class="w-full sm:w-44">
        <BaseSelect
          v-model="filters.product_type"
          :options="productTypeFilterOptions"
          placeholder="All Product Types"
          variant="surface"
          @update:modelValue="fetchData"
        />
      </div>

      <div class="w-full sm:w-36">
        <BaseSelect
          v-model="filters.status"
          :options="statusFilterOptions"
          placeholder="All Statuses"
          variant="surface"
          @update:modelValue="fetchData"
        />
      </div>

      <button
        v-if="searchQuery || filters.product_type || filters.status"
        type="button"
        class="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer text-xs"
        @click="resetFilters"
      >
        Clear Filters
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 6" :key="n" class="h-80 bg-card-background border border-primary-border rounded-2xl animate-pulse" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredProducts.length === 0"
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-dashed border-primary-border rounded-2xl text-center gap-3"
    >
      <div class="w-12 h-12 rounded-2xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <ShoppingBag class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">No Store Products Found</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          {{ (searchQuery || filters.product_type || filters.status) ? 'No products match your current search or filter criteria.' : 'Publish store products to allow enrolled traders to redeem their loyalty points.' }}
        </p>
      </div>
      <button
        v-if="hasPermission('loyalty_store.create') || hasPermission('loyalty.update')"
        type="button"
        class="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
        @click="handleCreate"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Create First Product</span>
      </button>
    </div>

    <!-- Premium Products Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="bg-card-background border border-primary-border rounded-2xl overflow-hidden flex flex-col justify-between group"
      >
        <!-- Product Visual Media Header -->
        <div
          class="relative h-44 w-full overflow-hidden bg-[#0F1422] flex items-center justify-center border-b border-primary-border/60 group/product-media select-none"
          @mouseenter="hoveredProductId = product.id"
          @mouseleave="hoveredProductId = null"
        >
          <!-- Real Media Carousel with Gradient Overlay -->
          <template v-if="getProductImages(product).length > 0">
            <Transition name="carousel-fade" mode="out-in">
              <video
                v-if="isVideoUrl(getProductImages(product)[getActiveImageIndex(product.id)])"
                :key="`video-${product.id}-${getActiveImageIndex(product.id)}`"
                :src="getProductImages(product)[getActiveImageIndex(product.id)]"
                autoplay
                loop
                muted
                playsinline
                class="w-full h-full object-cover object-center select-none"
              />
              <img
                v-else
                :key="`img-${product.id}-${getActiveImageIndex(product.id)}`"
                :src="getProductImages(product)[getActiveImageIndex(product.id)]"
                :alt="product.name || product.title"
                class="w-full h-full object-cover object-center select-none"
                loading="lazy"
                @error="handleImageError(product.id)"
              />
            </Transition>
            <div class="absolute inset-0 bg-gradient-to-t from-[#0F1422] via-black/30 to-black/20 pointer-events-none" />

            <!-- Carousel Next/Prev Controls (if multiple images) -->
            <div
              v-if="getProductImages(product).length > 1"
              class="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-15 opacity-0 group-hover/product-media:opacity-100 transition-opacity"
            >
              <button
                type="button"
                class="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center justify-center transition hover:bg-black/90 cursor-pointer pointer-events-auto hover:scale-105 shadow-md"
                title="Previous Image"
                @click.stop="prevProductImage(product, $event)"
              >
                <ChevronLeft class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center justify-center transition hover:bg-black/90 cursor-pointer pointer-events-auto hover:scale-105 shadow-md"
                title="Next Image"
                @click.stop="nextProductImage(product, $event)"
              >
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Dots indicator (if multiple images) -->
            <div
              v-if="getProductImages(product).length > 1"
              class="absolute bottom-1.5 inset-x-0 flex items-center justify-center gap-1 z-15 pointer-events-auto"
            >
              <button
                v-for="(_, idx) in getProductImages(product)"
                :key="idx"
                type="button"
                class="h-1 rounded-full transition-all cursor-pointer"
                :class="idx === getActiveImageIndex(product.id) ? 'w-4 bg-primary' : 'w-1 bg-white/50 hover:bg-white/80'"
                @click.stop="setProductImageIndex(product.id, idx, $event)"
              />
            </div>
          </template>

          <!-- Themed Abstract Category Banner Fallback -->
          <template v-else>
            <div
              class="absolute inset-0 flex items-center justify-center"
              :class="getCategoryThemeBg(product.product_type || product.type)"
            >
              <!-- Ambient radial glow -->
              <div class="absolute inset-0 bg-gradient-to-t from-[#0F1422] via-transparent to-transparent pointer-events-none" />
              
              <!-- Large Category Watermark Icon -->
              <div class="relative z-10 flex flex-col items-center gap-2 transform group-hover:scale-110 transition-transform duration-300">
                <div class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                  <component :is="getCategoryIcon(product.product_type || product.type)" class="w-7 h-7 text-white" />
                </div>
                <span class="text-[11px] font-bold text-white/90 tracking-wide font-mono uppercase">
                  {{ formatTypeLabel(product.product_type || product.type) }}
                </span>
              </div>
            </div>
          </template>

          <!-- Top Floating Badges & Action Buttons -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
            <!-- Product Type Pill -->
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border"
              :class="getProductTypeBadgeClass(product.product_type || product.type)"
            >
              <component :is="getCategoryIcon(product.product_type || product.type)" class="w-3 h-3" />
              <span>{{ formatTypeLabel(product.product_type || product.type) }}</span>
            </span>

            <!-- Actions (Edit / Deactivate) -->
            <div class="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/15">
              <button
                v-if="hasPermission('loyalty_store.update') || hasPermission('loyalty.update')"
                type="button"
                class="w-6.5 h-6.5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer shadow-2xs"
                title="Edit Product"
                @click="handleEdit(product)"
              >
                <Pencil class="w-3 h-3" />
              </button>
              <button
                v-if="hasPermission('loyalty_store.delete') || hasPermission('loyalty_store.update') || hasPermission('loyalty.update')"
                type="button"
                class="w-6.5 h-6.5 flex items-center justify-center rounded-full transition-all cursor-pointer shadow-2xs"
                :class="isProductActive(product)
                  ? 'bg-rose-500/20 hover:bg-rose-500/40 text-rose-200'
                  : 'bg-white/10 hover:bg-emerald-500/30 text-zinc-400 hover:text-emerald-200'"
                :title="isProductActive(product) ? 'Deactivate Product' : 'Activate Product'"
                @click="handleToggleStatus(product)"
              >
                <Power v-if="isProductActive(product)" class="w-3 h-3" />
                <PowerOff v-else class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Bottom Floating Specs on Image -->
          <div class="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 z-20">
            <!-- Active Status Badge -->
            <span
              class="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase inline-flex items-center gap-1 backdrop-blur-md border shadow-2xs"
              :class="(product.status === 'ACTIVE' || product.is_active) ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-zinc-800/80 text-zinc-400 border-zinc-700'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="(product.status === 'ACTIVE' || product.is_active) ? 'bg-emerald-400' : 'bg-zinc-500'" />
              <span>{{ product.status || (product.is_active ? 'ACTIVE' : 'INACTIVE') }}</span>
            </span>

            <!-- Tier / User Limit Badges -->
            <div class="flex items-center gap-1">
              <span
                v-if="product.min_tier_id"
                class="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-amber-500/20 text-amber-200 border border-amber-500/40 backdrop-blur-md shadow-2xs inline-flex items-center gap-1"
                :title="`Requires ${getTierName(product.min_tier_id)} or higher`"
              >
                <Award class="w-2.5 h-2.5" />
                <span>{{ getTierName(product.min_tier_id) }}+</span>
              </span>

              <span
                v-if="product.max_per_user || product.max_redemptions_per_user"
                class="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-white/10 text-white/90 border border-white/20 backdrop-blur-md shadow-2xs"
                :title="`Max ${product.max_per_user || product.max_redemptions_per_user} per client`"
              >
                Max {{ product.max_per_user || product.max_redemptions_per_user }}/user
              </span>
            </div>
          </div>
        </div>

        <!-- Product Body -->
        <div class="p-4 flex-1 flex flex-col justify-between gap-3.5">
          <div class="space-y-2">
            <!-- Title & Description -->
            <div class="space-y-1">
              <h3 class="text-sm font-bold text-primary-text leading-snug group-hover:text-primary transition-colors">
                {{ product.name || product.title }}
              </h3>
              <p class="text-[11px] text-secondary-text line-clamp-2 leading-relaxed min-h-[32px]">
                {{ product.description || 'No description provided for this store product catalogue item.' }}
              </p>
            </div>

            <!-- Price & Cash Value Matrix Banner -->
            <div class="p-2.5 rounded-xl bg-background/60 border border-primary-border flex items-center justify-between gap-2">
              <div class="flex flex-col gap-0.5">
                <span class="text-[9px] uppercase font-bold text-secondary-text tracking-wider">Required Points</span>
                <div class="flex items-baseline gap-1">
                  <template v-if="product.points_required || product.points_cost">
                    <span class="text-base font-extrabold text-primary font-mono tracking-tight leading-none">
                      {{ Number(product.points_required || product.points_cost).toLocaleString() }}
                    </span>
                    <span class="text-[10px] font-bold text-primary/80 font-mono uppercase">PTS</span>
                  </template>
                  <template v-else>
                    <span class="text-xs font-bold text-primary font-mono">Variable</span>
                    <span class="text-[9px] text-secondary-text font-mono">pts</span>
                  </template>
                </div>
              </div>

              <div class="flex flex-col gap-0.5 text-right">
                <span class="text-[9px] uppercase font-bold text-secondary-text tracking-wider">Cash Value</span>
                <div class="flex items-baseline justify-end gap-0.5">
                  <span
                    v-if="product.cash_value"
                    class="text-xs font-bold text-emerald-400 font-mono"
                  >
                    ${{ Number(product.cash_value).toFixed(2) }}
                  </span>
                  <span v-else class="text-xs font-mono text-secondary-text">—</span>
                  <span v-if="product.cash_value" class="text-[9px] font-medium text-secondary-text">USD</span>
                </div>
              </div>
            </div>

            <!-- Rich Fulfillment Config Spec Pills -->
            <div v-if="hasFulfillmentSpecs(product.fulfillment_config)" class="flex flex-wrap gap-1.5 pt-1">
              <!-- VPS Specs -->
              <template v-if="product.product_type === 'vps' || product.type === 'vps'">
                <span v-if="product.fulfillment_config?.ram_gb" class="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-medium">
                  {{ product.fulfillment_config.ram_gb }}GB RAM
                </span>
                <span v-if="product.fulfillment_config?.ssd_gb" class="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-medium">
                  {{ product.fulfillment_config.ssd_gb }}GB SSD
                </span>
                <span v-if="product.fulfillment_config?.vcpu" class="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-medium">
                  {{ product.fulfillment_config.vcpu }} vCPU
                </span>
                <span v-if="product.fulfillment_config?.months" class="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-medium">
                  {{ product.fulfillment_config.months }} Mo Duration
                </span>
              </template>

              <!-- Gift Card Specs -->
              <template v-else-if="product.product_type === 'gift_card' || product.type === 'gift_card'">
                <span v-if="product.fulfillment_config?.provider" class="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium capitalize">
                  {{ product.fulfillment_config.provider }}
                </span>
                <span v-if="product.fulfillment_config?.face_value" class="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  ${{ product.fulfillment_config.face_value }} Value
                </span>
              </template>

              <!-- Tier Boost Specs -->
              <template v-else-if="product.product_type === 'tier_boost' || product.type === 'tier_boost'">
                <span v-if="product.fulfillment_config?.multiplier" class="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono font-bold">
                  {{ product.fulfillment_config.multiplier }}&times; Multiplier Boost
                </span>
                <span v-if="product.fulfillment_config?.days" class="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono font-medium">
                  {{ product.fulfillment_config.days }} Days Active
                </span>
              </template>

              <!-- Bonus Funds Specs -->
              <template v-else-if="product.product_type === 'bonus_funds' || product.type === 'bonus_funds'">
                <span v-if="product.fulfillment_config?.lots_per_usd" class="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-medium">
                  {{ product.fulfillment_config.lots_per_usd }} Lots / $1 USD
                </span>
              </template>

              <!-- Merchandise Specs -->
              <template v-else-if="product.product_type === 'merchandise' || product.type === 'merchandise'">
                <span class="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium">
                  Physical Shipping
                </span>
              </template>

              <!-- Cash Specs -->
              <template v-else-if="product.product_type === 'cash' || product.type === 'cash'">
                <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                  Direct Trading Credit
                </span>
              </template>
            </div>
          </div>

          <!-- Stock & Fulfillment Info Row -->
          <div class="flex items-center justify-between pt-2.5 border-t border-primary-border/60 text-[11px]">
            <!-- Stock Count -->
            <div class="flex items-center gap-1.5">
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="(product.stock_qty !== null && product.stock_qty !== undefined) ? (product.stock_qty > 10 ? 'bg-emerald-400' : product.stock_qty > 0 ? 'bg-amber-400' : 'bg-rose-400') : 'bg-blue-400'"
              />
              <span
                class="font-mono text-[10px] font-medium"
                :class="(product.stock_qty !== null && product.stock_qty !== undefined) ? 'text-primary-text' : 'text-secondary-text'"
              >
                {{ (product.stock_qty !== null && product.stock_qty !== undefined) ? `${product.stock_qty} in stock` : (product.stock !== null && product.stock !== undefined ? `${product.stock} in stock` : 'Unlimited stock') }}
              </span>
            </div>

            <!-- Fulfillment Type -->
            <span class="text-[10px] text-secondary-text font-mono capitalize">
              {{ product.fulfillment_type || 'manual' }} fulfillment
            </span>
          </div>
        </div>

        <!-- Footer Meta IDs -->
        <div class="px-4 py-2 bg-background/40 border-t border-primary-border/60 flex items-center justify-between text-[10px] font-mono text-secondary-text">
          <span>Sort #{{ product.sort_order }}</span>
          <!-- <span>ID #{{ product.id }}</span> -->
        </div>
      </div>
    </div>

    <!-- Store Product Drawer -->
    <RewardDrawer
      :open="isDrawerOpen"
      :reward="selectedProduct"
      :tiers="tiers"
      :programId="programId"
      @close="isDrawerOpen = false"
      @saved="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import {
  Plus,
  RefreshCw,
  Gift as GiftIcon,
  ShoppingBag,
  Pencil,
  Power,
  PowerOff,
  Search,
  Server,
  Gift,
  Package,
  Zap,
  DollarSign,
  Coins,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import RewardDrawer from "../components/RewardDrawer.vue";

const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const isDrawerOpen = ref(false);
const selectedProduct = ref(null);
const searchQuery = ref("");
const failedImageIds = ref(new Set());

// Product Multi-Image Carousel State
const activeImageIndices = reactive({});
const hoveredProductId = ref(null);
let productCarouselTimer = null;

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

const getProductImages = (product) => {
  if (!product || failedImageIds.value.has(product.id)) return [];
  const urls = [];
  if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
    product.image_urls.forEach((u) => {
      if (typeof u === "string" && u.trim().length > 0 && !urls.includes(u.trim())) {
        urls.push(u.trim());
      }
    });
  }
  if (urls.length === 0 && product.image_url && typeof product.image_url === "string" && product.image_url.trim().length > 0) {
    urls.push(product.image_url.trim());
  }
  return urls;
};

const getActiveImageIndex = (productId) => {
  return activeImageIndices[productId] || 0;
};

const nextProductImage = (product, e) => {
  e?.stopPropagation?.();
  const images = getProductImages(product);
  if (images.length <= 1) return;
  const current = activeImageIndices[product.id] || 0;
  activeImageIndices[product.id] = (current + 1) % images.length;
};

const prevProductImage = (product, e) => {
  e?.stopPropagation?.();
  const images = getProductImages(product);
  if (images.length <= 1) return;
  const current = activeImageIndices[product.id] || 0;
  activeImageIndices[product.id] = (current - 1 + images.length) % images.length;
};

const setProductImageIndex = (productId, index, e) => {
  e?.stopPropagation?.();
  activeImageIndices[productId] = index;
};

const startProductAutoplay = () => {
  stopProductAutoplay();
  productCarouselTimer = setInterval(() => {
    if (products.value && products.value.length > 0) {
      products.value.forEach((prod) => {
        if (prod.id !== hoveredProductId.value) {
          const imgs = getProductImages(prod);
          if (imgs.length > 1) {
            const current = activeImageIndices[prod.id] || 0;
            activeImageIndices[prod.id] = (current + 1) % imgs.length;
          }
        }
      });
    }
  }, 4000);
};

const stopProductAutoplay = () => {
  if (productCarouselTimer) {
    clearInterval(productCarouselTimer);
    productCarouselTimer = null;
  }
};

const filters = reactive({
  product_type: "",
  status: "",
});

const productTypeFilterOptions = [
  { label: "All Product Types", value: "" },
  { label: "Merchandise", value: "merchandise" },
  { label: "Gift Card", value: "gift_card" },
  { label: "VPS Hosting", value: "vps" },
  { label: "Bonus Funds", value: "bonus_funds" },
  { label: "Tier Boost", value: "tier_boost" },
  { label: "Cash Credit", value: "cash" },
];

const statusFilterOptions = [
  { label: "All Statuses", value: "" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
];

const products = computed(() => {
  if (store.storeProducts && store.storeProducts.length > 0) {
    return store.storeProducts;
  }
  return store.rewards || [];
});

const filteredProducts = computed(() => {
  let list = products.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.product_type && p.product_type.toLowerCase().includes(q))
    );
  }

  return list;
});

const tiers = computed(() => store.tiers || []);
const programId = computed(() => store.program?.id || 1);

const fetchData = (force = false) => {
  const params = {};
  if (filters.product_type) params.product_type = filters.product_type;
  if (filters.status) params.status = filters.status;
  if (programId.value) params.program_id = programId.value;

  store.fetchStoreProducts(params, force);
};

const handleRefresh = () => {
  fetchData(true);
};

const resetFilters = () => {
  searchQuery.value = "";
  filters.product_type = "";
  filters.status = "";
  fetchData(true);
};

const handleCreate = () => {
  selectedProduct.value = null;
  isDrawerOpen.value = true;
};

const handleEdit = (product) => {
  selectedProduct.value = product;
  isDrawerOpen.value = true;
};

const isProductActive = (product) => {
  if (!product) return false;
  if (product.status) {
    return product.status.toUpperCase() === "ACTIVE";
  }
  return Boolean(product.is_active);
};

const handleToggleStatus = async (product) => {
  if (!product?.id) return;
  if (isProductActive(product)) {
    await store.deleteStoreProduct(product.id, programId.value);
  } else {
    await store.updateStoreProduct(
      product.id,
      { status: "ACTIVE", is_active: true },
      programId.value
    );
  }
};

const handleImageError = (productId) => {
  failedImageIds.value.add(productId);
};

const getTierName = (tierId) => {
  if (!tierId) return null;
  const found = tiers.value.find((t) => t.id === tierId || t.sort_order === tierId);
  return found ? found.name : `Tier #${tierId}`;
};

const formatTypeLabel = (type) => {
  switch (type?.toLowerCase()) {
    case "merchandise":
      return "Merchandise";
    case "gift_card":
      return "Gift Card";
    case "vps":
      return "VPS Hosting";
    case "bonus_funds":
      return "Bonus Funds";
    case "tier_boost":
      return "Tier Boost";
    case "cash":
      return "Cash Credit";
    default:
      return type || "Product";
  }
};

const getCategoryIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "merchandise":
      return Package;
    case "gift_card":
      return Gift;
    case "vps":
      return Server;
    case "bonus_funds":
      return Coins;
    case "tier_boost":
      return Zap;
    case "cash":
      return DollarSign;
    default:
      return ShoppingBag;
  }
};

const getCategoryThemeBg = (type) => {
  switch (type?.toLowerCase()) {
    case "vps":
      return "bg-gradient-to-br from-blue-900/60 via-indigo-900/40 to-[#0F1422]";
    case "gift_card":
      return "bg-gradient-to-br from-emerald-900/60 via-teal-900/40 to-[#0F1422]";
    case "merchandise":
      return "bg-gradient-to-br from-amber-900/60 via-orange-900/40 to-[#0F1422]";
    case "bonus_funds":
      return "bg-gradient-to-br from-primary/30 via-indigo-950/50 to-[#0F1422]";
    case "tier_boost":
      return "bg-gradient-to-br from-purple-900/60 via-pink-900/40 to-[#0F1422]";
    case "cash":
      return "bg-gradient-to-br from-teal-900/60 via-emerald-950/50 to-[#0F1422]";
    default:
      return "bg-gradient-to-br from-zinc-900 via-slate-900 to-[#0F1422]";
  }
};

const getProductTypeBadgeClass = (type) => {
  switch (type?.toLowerCase()) {
    case "merchandise":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "gift_card":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "vps":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "bonus_funds":
      return "bg-primary/20 text-primary border-primary/30";
    case "tier_boost":
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    case "cash":
      return "bg-teal-500/20 text-teal-300 border-teal-500/30";
    default:
      return "bg-background text-secondary-text border-primary-border";
  }
};

const hasFulfillmentSpecs = (config) => {
  if (!config || typeof config !== "object") return false;
  return Object.keys(config).length > 0;
};

watch(
  programId,
  (newId) => {
    if (newId) {
      fetchData(true);
      if (!store.isFetched.tiers) {
        store.fetchTiers(newId);
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  startProductAutoplay();
});

onUnmounted(() => {
  stopProductAutoplay();
});
</script>

<style scoped>
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.35s ease;
}
.carousel-fade-enter-from,
.carousel-fade-leave-to {
  opacity: 0;
}
</style>
