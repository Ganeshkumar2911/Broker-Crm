<template>
  <div class="bg-background space-y-5 pt-4 pb-8 overflow-y-auto no-scrollbar">
    <!-- ─── TOP HEADER ───────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-base sm:text-lg font-bold text-primary-text">
          Marketing & Promotions
        </h3>
        <p class="text-xs text-secondary-text mt-0.5">
          Active banners and marketing campaign assets configured for this client.
        </p>
      </div>
    </div>

    <!-- Skeleton Shimmer Loader -->
    <div
      v-if="loading"
      class="w-full aspect-[3.75/1] min-h-[140px] sm:min-h-[180px] md:min-h-[220px] rounded-xl bg-card-background/40 border border-primary-border relative overflow-hidden animate-pulse"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-primary-border/40 via-primary-border/20 to-primary-border/40 animate-pulse"
      />
    </div>

    <!-- Banner Carousel -->
    <div
      v-else-if="banners && banners.length > 0"
      class="relative w-full aspect-[3.75/1] min-h-[140px] sm:min-h-[180px] md:min-h-[220px] rounded-xl border border-primary-border bg-card-background/40 overflow-hidden shadow-xs group"
      @mouseenter="pauseAutoplay"
      @mouseleave="resumeAutoplay"
    >
      <!-- Banner Slides -->
      <transition-group name="slide-fade" tag="div" class="w-full h-full">
        <div
          v-for="(banner, idx) in banners"
          v-show="currentSlide === idx"
          :key="banner.id || idx"
          class="absolute inset-0 w-full h-full"
        >
          <img
            :src="banner.image_url"
            :alt="`Banner ${idx + 1}`"
            class="w-full h-full object-cover object-center"
            @error="handleImageError($event)"
          />
        </div>
      </transition-group>

      <!-- Previous Slide Button (Visible on hover when more than 1 banner) -->
      <button
        v-if="banners.length > 1"
        type="button"
        @click="prevSlide"
        class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-md"
        aria-label="Previous Banner"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <!-- Next Slide Button (Visible on hover when more than 1 banner) -->
      <button
        v-if="banners.length > 1"
        type="button"
        @click="nextSlide"
        class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-md"
        aria-label="Next Banner"
      >
        <ChevronRight class="w-4 h-4" />
      </button>

      <!-- Slide Indicators / Pagination Dots -->
      <div
        v-if="banners.length > 1"
        class="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10"
      >
        <button
          v-for="(_, idx) in banners"
          :key="idx"
          type="button"
          @click="goToSlide(idx)"
          class="h-2 rounded-full transition-all duration-300 cursor-pointer"
          :class="currentSlide === idx ? 'w-5 bg-primary' : 'w-2 bg-white/50 hover:bg-white/80'"
          :aria-label="`Slide ${idx + 1}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import defaultBanner from "@/assets/header.png";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-vue-next";

// ─── State ────────────────────────────────────────────────────────────────────
const banners = ref([]);
const loading = ref(false);
const currentSlide = ref(0);
let autoplayTimer = null;

const defaultBanners = [{ id: 1, image_url: defaultBanner }];

// ─── Fetch Banners ────────────────────────────────────────────────────────────
const fetchBanners = () => {
  loading.value = true;

  const successHandler = (res) => {
    loading.value = false;
    const links =
      res?.image_links ||
      res?.data?.image_links ||
      res?.data?.banners ||
      res?.banners ||
      (Array.isArray(res?.data) ? res.data : []) ||
      [];

    if (Array.isArray(links) && links.length > 0) {
      banners.value = links.map((item, id) => {
        if (typeof item === "string") {
          return { id: id + 1, image_url: item };
        }
        return {
          id: item.id || id + 1,
          image_url: item.image_url || item.url || item.image || defaultBanner,
        };
      });
    } else {
      banners.value = defaultBanners;
    }
  };

  const failureHandler = () => {
    loading.value = false;
    banners.value = defaultBanners;
  };

  const bannerUrl =
    urls.media?.images?.clientLinks ||
    urls.media?.images?.links ||
    "/media/images/links";

  apiRequest(urls.KEYS.GET, bannerUrl, {
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
  });
};

// ─── Slide Controls ───────────────────────────────────────────────────────────
const nextSlide = () => {
  if (banners.value.length <= 1) return;
  currentSlide.value = (currentSlide.value + 1) % banners.value.length;
};

const prevSlide = () => {
  if (banners.value.length <= 1) return;
  currentSlide.value =
    (currentSlide.value - 1 + banners.value.length) % banners.value.length;
};

const goToSlide = (idx) => {
  currentSlide.value = idx;
};

const startAutoplay = () => {
  stopAutoplay();
  autoplayTimer = setInterval(() => {
    nextSlide();
  }, 4500);
};

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
};

const pauseAutoplay = () => stopAutoplay();
const resumeAutoplay = () => startAutoplay();

const handleImageError = (e) => {
  if (e?.target) {
    e.target.src = defaultBanner;
  }
};

const handleTabRefresh = (e) => {
  if (e?.detail?.tab && e.detail.tab !== "marketing") return;
  fetchBanners();
};

onMounted(() => {
  fetchBanners();
  startAutoplay();
  window.addEventListener("refresh-client-tab-data", handleTabRefresh);
});

onUnmounted(() => {
  stopAutoplay();
  window.removeEventListener("refresh-client-tab-data", handleTabRefresh);
});
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.skeleton-shimmer {
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.12),
    transparent
  );
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  to {
    transform: translateX(100%);
  }
}
</style>