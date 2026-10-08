<template>
  <div class="px-4 pb-8 space-y-6">
    <!-- Header with Integrated Navigation -->
    <div v-if="hasLoyaltyAccess" class="w-full">
      <!-- Full-Width Equal-Space Underline Tab Navigation -->
      <!-- Responsive Full-Width Tab Navigation -->
      <div class="border-b border-primary-border w-full relative">
        <nav
          ref="tabNavRef"
          class="flex items-center w-full overflow-x-auto no-scrollbar -mb-px scroll-smooth"
          aria-label="Tabs"
        >
          <button
            v-for="tab in tabList"
            :key="tab.value"
            :ref="(el) => setTabRef(el, tab.value)"
            type="button"
            class="flex items-center justify-center gap-2 py-3 px-3.5 sm:px-4 xl:flex-1 text-xs font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer select-none text-center shrink-0"
            :class="[
              activeTab === tab.value
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-secondary-text hover:text-primary-text hover:border-primary-border/60'
            ]"
            @click="selectTab(tab.value)"
          >
            <HugeIcon
              :icon="tab.icon"
              :size="16"
              class="shrink-0 transition-colors"
              :class="activeTab === tab.value ? 'text-primary' : 'text-secondary-text'"
            />
            <span>{{ tab.label }}</span>
            <span
              v-if="tab.badge !== undefined && tab.badge !== null"
              class="ml-1 text-[10px] px-1.5 py-0.2 rounded-full border shrink-0 transition-colors font-mono"
              :class="
                activeTab === tab.value
                  ? 'bg-primary/10 text-primary border-primary/20 font-bold'
                  : 'bg-background text-secondary-text border-primary-border'
              "
            >
              {{ tab.badge }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Active Tab Component -->
    <div v-if="hasLoyaltyAccess">
      <Transition name="tab-fade" mode="out-in">
        <component :is="activeComponent" :key="activeTab" />
      </Transition>
    </div>

    <!-- Access Restricted Fallback -->
    <div
      v-else
      class="flex flex-col items-center justify-center p-12 bg-card-background border border-primary-border rounded-xl text-center min-h-[360px] gap-3"
    >
      <div class="w-12 h-12 rounded-xl bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <HugeIcon :icon="ShieldAlertIcon" :size="24" class="text-primary-red" />
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-primary-text">Access Restricted</h3>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          You do not have permission to view the Loyalty Program module. Please contact your system administrator.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Award01Icon,
  Layers01Icon,
  ShoppingBag01Icon,
  PackageCheckIcon,
  UserGroupIcon,
  Activity01Icon,
  HistoryIcon,
  ShieldAlertIcon,
} from "@hugeicons/core-free-icons";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

import ProgramTab from "./tabs/ProgramTab.vue";
import TiersTab from "./tabs/TiersTab.vue";
import RewardsTab from "./tabs/RewardsTab.vue";
import RedemptionsTab from "./tabs/RedemptionsTab.vue";
import EnrollmentsTab from "./tabs/EnrollmentsTab.vue";
import DealsTab from "./tabs/DealsTab.vue";
import BackfillTab from "./tabs/BackfillTab.vue";

const route = useRoute();
const router = useRouter();
const store = useLoyaltyStore();
const { hasPermission } = usePermissionCheck();

const hasLoyaltyAccess = computed(() =>
  hasPermission("loyalty.view") ||
  hasPermission("loyalty_store.read") ||
  hasPermission("loyalty_redemption.read")
);

const programSummary = computed(() => store.program?.summary || {});

const validTabKeys = ["program", "tiers", "store", "redemptions", "enrollments", "deals", "backfill"];

const tabList = computed(() => [
  { label: "Program & Rules", value: "program", icon: Award01Icon },
  { label: "Tiers", value: "tiers", icon: Layers01Icon, badge: programSummary.value?.tiers },
  { label: "Store Products", value: "store", icon: ShoppingBag01Icon, badge: programSummary.value?.rewards },
  { label: "Redemptions Queue", value: "redemptions", icon: PackageCheckIcon },
  { label: "Enrollments", value: "enrollments", icon: UserGroupIcon, badge: programSummary.value?.enrollments },
  { label: "Deals History", value: "deals", icon: Activity01Icon },
  { label: "MT5 Backfill", value: "backfill", icon: HistoryIcon },
]);

const mobileTabOptions = computed(() =>
  tabList.value.map((tab) => ({
    label: `${tab.label} ${tab.badge !== undefined && tab.badge !== null ? `(${tab.badge})` : ""}`.trim(),
    value: tab.value,
  }))
);

const activeTab = ref(
  typeof route.query.tab === "string" && validTabKeys.includes(route.query.tab)
    ? route.query.tab
    : "program"
);

const tabNavRef = ref(null);
const tabRefs = {};

const setTabRef = (el, key) => {
  if (el) {
    tabRefs[key] = el;
  }
};

const scrollToTab = (key) => {
  const el = tabRefs[key];
  if (el && tabNavRef.value) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
};

const selectTab = (key) => {
  activeTab.value = key;
  scrollToTab(key);
};

// Sync query parameter with tab
watch(
  () => route.query.tab,
  (tab) => {
    if (typeof tab === "string" && validTabKeys.includes(tab) && activeTab.value !== tab) {
      activeTab.value = tab;
      scrollToTab(tab);
    }
  }
);

watch(activeTab, (tab) => {
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } });
  }
});

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case "tiers":
      return TiersTab;
    case "store":
      return RewardsTab;
    case "redemptions":
      return RedemptionsTab;
    case "enrollments":
      return EnrollmentsTab;
    case "deals":
      return DealsTab;
    case "backfill":
      return BackfillTab;
    case "program":
    default:
      return ProgramTab;
  }
});

onMounted(() => {
  if (!store.isFetched.programsList) {
    store.fetchProgramsList();
  }
  if (!store.isFetched.program) {
    store.fetchProgram();
  }
  setTimeout(() => {
    scrollToTab(activeTab.value);
  }, 100);
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(2px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
