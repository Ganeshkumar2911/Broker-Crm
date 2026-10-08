<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  onBeforeUpdate,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import { useProfileStore } from "@/stores/profile/profile";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";
import Tooltip from "@/components/common/Tooltip.vue";
import ProfileDialog from "@/components/common/profileDialog.vue";
import { navClusters } from "@/config/navItems";

const store = useProfileStore();
const myPermissionsStore = useMyPermissionsStore();
const router = useRouter();
const route = useRoute();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "toggle-collapse"]);

const searchQuery = ref("");
const searchInputRef = ref(null);
const selectedIndex = ref(0);
const resultItemRefs = ref([]);
const profileDialogOpen = ref(false);

function openProfileDialog() {
  profileDialogOpen.value = true;
}

function closeProfileDialog() {
  profileDialogOpen.value = false;
}

onBeforeUpdate(() => {
  resultItemRefs.value = [];
});

// Filter navigation clusters dynamically based on user permissions
const filteredClusters = computed(() => {
  return navClusters
    .map((cluster) => {
      if (cluster.children) {
        const allowedChildren = cluster.children.filter((child) => {
          if (child.permission) {
            return myPermissionsStore.hasPermission(child.permission);
          }
          return true;
        });
        if (allowedChildren.length === 0) return null;
        return {
          ...cluster,
          children: allowedChildren,
        };
      }
      // Direct standalone item (e.g. Dashboard)
      if (
        cluster.permission &&
        !myPermissionsStore.hasPermission(cluster.permission)
      ) {
        return null;
      }
      return cluster;
    })
    .filter(Boolean);
});

// Flattened list of all permitted items for fast searching
const allSearchableItems = computed(() => {
  const list = [];
  filteredClusters.value.forEach((cluster) => {
    if (cluster.children) {
      cluster.children.forEach((child) => {
        list.push({
          ...child,
          keywords: child.keywords || [],
          clusterName: cluster.label,
          clusterIcon: cluster.icon,
        });
      });
    } else {
      list.push({
        ...cluster,
        keywords: cluster.keywords || [],
        clusterName: "Core",
        clusterIcon: cluster.icon,
      });
    }
  });
  return list;
});

// Filtered search results with prioritized relevance scoring
const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return [];

  const queryWords = query.split(/\s+/).filter(Boolean);
  const normalizedQuery = query.replace(/[^a-z0-9]/g, "");

  const scoredItems = [];

  for (const item of allSearchableItems.value) {
    const labelLower = item.label.toLowerCase();
    const clusterLower = item.clusterName.toLowerCase();
    const toLower = item.to.toLowerCase();
    const normalizedLabel = labelLower.replace(/[^a-z0-9]/g, "");

    let score = 0;

    // 1. Direct Module Name Matches (HIGHEST PRIORITY)
    if (labelLower === query) {
      score += 1000;
    } else if (labelLower.startsWith(query)) {
      score += 600;
    } else if (labelLower.includes(query)) {
      score += 400;
    } else if (
      queryWords.length > 0 &&
      queryWords.every((word) => labelLower.includes(word))
    ) {
      score += 300;
    } else if (
      normalizedQuery.length >= 3 &&
      (normalizedLabel.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedLabel))
    ) {
      score += 250;
    } else if (
      query.length >= 4 &&
      (labelLower.includes(query.slice(0, 4)) ||
        labelLower.includes(query.replace(/i/g, "")))
    ) {
      // Handles common typos/variations like "loyality" -> "loyalty"
      score += 200;
    }

    // 2. Direct Route Path Match
    if (toLower.includes(query) || toLower.includes(normalizedQuery)) {
      score += 80;
    }

    // 3. Category / Cluster Name Matches (LOWER PRIORITY)
    if (clusterLower === query) {
      score += 40;
    } else if (clusterLower.startsWith(query)) {
      score += 30;
    } else if (clusterLower.includes(query)) {
      score += 20;
    } else if (
      query.length >= 4 &&
      (clusterLower.includes(query.slice(0, 4)) ||
        clusterLower.includes(query.replace(/i/g, "")))
    ) {
      score += 10;
    }

    // 4. Keyword Matches
    if (item.keywords && item.keywords.length > 0) {
      for (const kw of item.keywords) {
        const kwLower = kw.toLowerCase();
        if (kwLower === query) {
          score += 350;
        } else if (kwLower.startsWith(query)) {
          score += 200;
        } else if (kwLower.includes(query)) {
          score += 120;
        } else if (
          queryWords.length > 0 &&
          queryWords.every((w) => kwLower.includes(w))
        ) {
          score += 90;
        }
      }
    }

    if (score > 0) {
      scoredItems.push({ item, score });
    }
  }

  // Sort descending by relevance score so direct matches appear at the very top
  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.map((entry) => entry.item);
});

// Clear search
const clearSearch = () => {
  searchQuery.value = "";
  selectedIndex.value = 0;
};

// Reset selected index when search query changes
watch(searchQuery, () => {
  selectedIndex.value = 0;
});

// Select an item and navigate
const selectItem = (item) => {
  if (!item || !item.to) return;
  router.push(item.to);
  clearSearch();
  emit("close");
};

// Scroll active item into view
const scrollToSelectedItem = () => {
  nextTick(() => {
    const targetRef = resultItemRefs.value[selectedIndex.value];
    const el = targetRef?.$el || targetRef;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
};

// Keyboard navigation in search input
const handleSearchKeydown = (e) => {
  if (!searchResults.value.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (selectedIndex.value < searchResults.value.length - 1) {
      selectedIndex.value++;
    } else {
      selectedIndex.value = 0;
    }
    scrollToSelectedItem();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (selectedIndex.value > 0) {
      selectedIndex.value--;
    } else {
      selectedIndex.value = searchResults.value.length - 1;
    }
    scrollToSelectedItem();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (
      selectedIndex.value >= 0 &&
      selectedIndex.value < searchResults.value.length
    ) {
      selectItem(searchResults.value[selectedIndex.value]);
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    clearSearch();
    searchInputRef.value?.blur();
  }
};

// Global Cmd+K / Ctrl+K / Cmd+S / Ctrl+S listener
const handleGlobalKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "s")) {
    e.preventDefault();
    if (props.isCollapsed) {
      emit("toggle-collapse");
      nextTick(() => {
        searchInputRef.value?.focus();
      });
    } else {
      searchInputRef.value?.focus();
    }
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeydown);
});

// Active Route Checks
const isActive = (path) => {
  if (!path) return false;
  if (route.path === path) return true;
  return route.path.startsWith(path + "/");
};

const isClusterActive = (cluster) => {
  if (cluster.to) return isActive(cluster.to);
  if (cluster.children) {
    return cluster.children.some((child) => isActive(child.to));
  }
  return false;
};

// Accordion Open/Collapse State
const openClusters = ref(new Set());

const isClusterOpen = (clusterId) => openClusters.value.has(clusterId);

const toggleCluster = (clusterId) => {
  if (openClusters.value.has(clusterId)) {
    openClusters.value.delete(clusterId);
  } else {
    openClusters.value.add(clusterId);
  }
};

// Auto expand the cluster that contains the active route
const autoExpandActiveCluster = () => {
  filteredClusters.value.forEach((cluster) => {
    if (cluster.children && isClusterActive(cluster)) {
      openClusters.value.add(cluster.id);
    }
  });
};

watch(
  () => route.path,
  () => {
    autoExpandActiveCluster();
  },
  { immediate: true },
);

// Collapsed mode flyout state
const hoveredCluster = ref(null);
const flyoutPos = ref({ top: 0, left: 84 });
let closeTimer = null;

const handleClusterMouseEnter = (cluster, event) => {
  if (!props.isCollapsed || !cluster.children) return;
  if (closeTimer) clearTimeout(closeTimer);
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  flyoutPos.value = {
    top: Math.max(10, Math.min(window.innerHeight - 280, rect.top)),
    left: rect.right + 8,
  };
  hoveredCluster.value = cluster;
};

const handleClusterMouseLeave = () => {
  if (!props.isCollapsed) return;
  closeTimer = setTimeout(() => {
    hoveredCluster.value = null;
  }, 150);
};

const handleFlyoutMouseEnter = () => {
  if (closeTimer) clearTimeout(closeTimer);
};

const handleFlyoutMouseLeave = () => {
  hoveredCluster.value = null;
};
</script>

<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 z-40 h-full bg-navbar text-white border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out -translate-x-full md:translate-x-0"
    :class="[
      { 'translate-x-0': isOpen },
      isCollapsed ? 'w-[80px]' : 'w-[240px]',
    ]"
  >
    <!-- Header -->
    <div
      class="h-[60px] flex items-center justify-between px-4 border-b border-white/10"
    >
      <div v-if="!isCollapsed" class="flex items-center gap-2.5">
        <div class="w-48 h-28 flex items-center justify-center">
          <img src="/logo_full.svg" alt="Logo" />
        </div>
      </div>
      <div v-else class="flex items-center justify-center w-full">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center">
          <img src="/logo.svg" alt="Logo" />
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div v-if="!isCollapsed" class="px-3 pt-3 pb-1">
      <div class="relative flex items-center">
        <Search
          class="absolute left-2.5 w-3.5 h-3.5 text-white/40 pointer-events-none"
        />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Search modules..."
          @keydown="handleSearchKeydown"
          class="w-full h-8 pl-8 pr-7 bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-white/40 text-xs rounded-lg border border-white/10 focus:border-primary/50 focus:outline-none transition-all"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          type="button"
          class="absolute right-2 text-white/40 hover:text-white p-0.5 transition-colors"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>
    <div v-else class="px-3 pt-3 pb-1 flex justify-center">
      <Tooltip text="Search (⌘K)" position="right">
        <button
          @click="emit('toggle-collapse')"
          class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all"
        >
          <Search class="w-4 h-4" />
        </button>
      </Tooltip>
    </div>

    <!-- Nav with Clusters or Search Results -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
      <!-- A. Search Results View -->
      <template v-if="searchQuery.trim()">
        <div class="space-y-1">
          <div
            class="px-2 py-1 flex items-center justify-between text-[11px] font-semibold text-white/40 uppercase tracking-wider"
          >
            <span>Results ({{ searchResults.length }})</span>
            <button
              @click="clearSearch"
              class="text-primary-light hover:underline lowercase text-[11px]"
            >
              clear
            </button>
          </div>

          <div v-if="searchResults.length === 0" class="py-8 text-center">
            <p class="text-xs text-white/50">No modules found</p>
            <p class="text-[11px] text-white/30 mt-0.5">
              Try searching another keyword
            </p>
          </div>

          <RouterLink
            v-for="(item, index) in searchResults"
            :key="item.to"
            :to="item.to"
            :ref="
              (el) => {
                if (el) resultItemRefs[index] = el;
              }
            "
            @click="selectItem(item)"
            @mouseenter="selectedIndex = index"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group cursor-pointer"
            :class="[
              selectedIndex === index
                ? 'bg-primary text-white shadow-sm font-semibold'
                : isActive(item.to)
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10',
            ]"
          >
            <component
              :is="item.icon"
              class="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"
              :class="selectedIndex === index ? 'text-white' : 'text-white/70'"
            />
            <div class="min-w-0 flex-1">
              <div class="text-xs font-medium truncate text-white">
                {{ item.label }}
              </div>
              <div
                class="text-[10px] truncate"
                :class="
                  selectedIndex === index ? 'text-white/80' : 'text-white/40'
                "
              >
                {{ item.clusterName }}
              </div>
            </div>
            <span
              v-if="selectedIndex === index"
              class="ml-auto text-[10px] text-white/90 bg-white/20 px-1.5 py-0.5 rounded font-mono font-medium"
            >
              ↵
            </span>
            <span
              v-else-if="isActive(item.to)"
              class="ml-auto w-1.5 h-1.5 rounded-full bg-white"
            />
          </RouterLink>
        </div>
      </template>

      <!-- B. Normal Clustered Navigation -->
      <template v-else v-for="cluster in filteredClusters" :key="cluster.id">
        <!-- 1. Direct standalone item (e.g. Dashboard) -->
        <template v-if="!cluster.children">
          <Tooltip
            :text="cluster.label"
            position="right"
            :disabled="!isCollapsed"
            :block="true"
          >
            <RouterLink
              :to="cluster.to"
              @click="$emit('close')"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group"
              :class="[
                isActive(cluster.to)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10',
                isCollapsed ? 'justify-center' : '',
              ]"
            >
              <component
                :is="cluster.icon"
                class="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0"
              />
              <span v-if="!isCollapsed">{{ cluster.label }}</span>

              <!-- Active dot -->
              <span
                v-if="isActive(cluster.to) && !isCollapsed"
                class="ml-auto w-1.5 h-1.5 rounded-full bg-white"
              />
            </RouterLink>
          </Tooltip>
        </template>

        <!-- 2. Cluster / Grouped Category -->
        <template v-else>
          <!-- Collapsed View (Icon with hover flyout) -->
          <div
            v-if="isCollapsed"
            class="relative"
            @mouseenter="handleClusterMouseEnter(cluster, $event)"
            @mouseleave="handleClusterMouseLeave"
          >
            <button
              type="button"
              class="w-full flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group"
              :class="[
                isClusterActive(cluster)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10',
              ]"
            >
              <component
                :is="cluster.icon"
                class="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0"
              />
              <!-- Active child indicator dot -->
              <span
                v-if="isClusterActive(cluster)"
                class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white ring-2 ring-navbar"
              />
            </button>
          </div>

          <!-- Expanded View (Collapsible Accordion) -->
          <div v-else class="space-y-1">
            <!-- Cluster Header Trigger -->
            <button
              type="button"
              @click="toggleCluster(cluster.id)"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none group"
              :class="[
                isClusterActive(cluster)
                  ? 'text-white font-semibold bg-white/5'
                  : 'text-white/70 hover:text-white hover:bg-white/10',
              ]"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <component
                  :is="cluster.icon"
                  class="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0"
                  :class="
                    isClusterActive(cluster)
                      ? 'text-primary-light'
                      : 'text-white/70'
                  "
                />
                <span class="truncate">{{ cluster.label }}</span>
              </div>

              <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <!-- Active dot if cluster is closed but has active child -->
                <span
                  v-if="isClusterActive(cluster) && !isClusterOpen(cluster.id)"
                  class="w-1.5 h-1.5 rounded-full bg-primary"
                />
                <!-- Accordion Chevron -->
                <ChevronDown
                  class="w-3.5 h-3.5 text-white/50 transition-transform duration-200"
                  :class="{
                    'rotate-180 text-white': isClusterOpen(cluster.id),
                  }"
                />
              </div>
            </button>

            <!-- Cluster Children List -->
            <Transition name="accordion">
              <div
                v-if="isClusterOpen(cluster.id)"
                class="ml-3 pl-3 my-0.5 border-l border-white/15 space-y-0.5"
              >
                <RouterLink
                  v-for="child in cluster.children"
                  :key="child.to"
                  :to="child.to"
                  @click="$emit('close')"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group"
                  :class="[
                    isActive(child.to)
                      ? 'bg-primary text-white shadow-sm font-semibold'
                      : 'text-white/65 hover:text-white hover:bg-white/10',
                  ]"
                >
                  <HugeiconsIcon
                    v-if="child.hugeIcon"
                    :icon="child.hugeIcon"
                    class="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:scale-105"
                  />
                  <component
                    v-else
                    :is="child.icon"
                    class="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:scale-105"
                  />
                  <span class="truncate">{{ child.label }}</span>

                  <!-- Active indicator dot -->
                  <span
                    v-if="isActive(child.to)"
                    class="ml-auto w-1 h-1 rounded-full bg-white"
                  />
                </RouterLink>
              </div>
            </Transition>
          </div>
        </template>
      </template>
    </nav>

    <!-- Footer -->
    <div class="border-t border-white/10">
      <!-- User Info -->
      <div class="p-4">
        <div
          class="flex items-center"
          :class="isCollapsed ? 'justify-center' : 'gap-3'"
        >
          <div
            class="flex items-center min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            :class="isCollapsed ? 'hidden' : 'gap-3'"
            @click="openProfileDialog"
          >
            <div
              class="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
            >
              <span class="text-white text-xs font-bold">{{
                store.user?.name?.charAt(0).toUpperCase() || "S"
              }}</span>
            </div>
            <div class="min-w-0">
              <p class="text-white text-xs font-semibold truncate">
                {{ store.user?.name }}
              </p>
              <p class="text-white text-[11px] capitalize truncate">
                {{ store.user?.role === "staff" ? "admin" : store.user?.role }}
              </p>
            </div>
          </div>

          <Tooltip v-if="isCollapsed" text="Expand" position="right">
            <button
              @click="emit('toggle-collapse')"
              class="flex items-center justify-center w-10 h-10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </Tooltip>
          <button
            v-else
            @click="emit('toggle-collapse')"
            class="flex items-center justify-center w-10 h-10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 ml-auto"
            title="Collapse"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </aside>

  <!-- Collapsed Flyout Popover (Teleported to body for unclipped layering) -->
  <Teleport to="body">
    <div
      v-if="isCollapsed && hoveredCluster"
      class="fixed z-50 min-w-[210px] max-w-[260px] py-2 px-1.5 bg-[#141822] text-white border border-white/15 rounded-xl shadow-2xl backdrop-blur-xl"
      :style="{
        top: `${flyoutPos.top}px`,
        left: `${flyoutPos.left}px`,
      }"
      @mouseenter="handleFlyoutMouseEnter"
      @mouseleave="handleFlyoutMouseLeave"
    >
      <!-- Flyout Header -->
      <div
        class="px-2.5 py-1 mb-1 border-b border-white/10 flex items-center gap-2"
      >
        <component :is="hoveredCluster.icon" class="w-3.5 h-3.5 text-primary" />
        <span class="text-xs font-semibold text-white/90 tracking-wide">
          {{ hoveredCluster.label }}
        </span>
      </div>

      <!-- Flyout Items -->
      <div class="space-y-0.5 max-h-[320px] overflow-y-auto no-scrollbar">
        <RouterLink
          v-for="child in hoveredCluster.children"
          :key="child.to"
          :to="child.to"
          @click="
            hoveredCluster = null;
            $emit('close');
          "
          class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group"
          :class="[
            isActive(child.to)
              ? 'bg-primary text-white shadow-sm font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/10',
          ]"
        >
          <component
            :is="child.icon"
            class="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:scale-105"
          />
          <span class="truncate">{{ child.label }}</span>
          <span
            v-if="isActive(child.to)"
            class="ml-auto w-1 h-1 rounded-full bg-white"
          />
        </RouterLink>
      </div>
    </div>
  </Teleport>

  <!-- Profile Dialog -->
  <ProfileDialog :open="profileDialogOpen" @close="closeProfileDialog" />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Accordion transition */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.2s ease-in-out;
  max-height: 250px;
  opacity: 1;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}
</style>
