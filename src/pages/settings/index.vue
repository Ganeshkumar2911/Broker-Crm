<template>
  <div class="px-4 pb-8 space-y-6">

    <!-- Default Submodule Navbar -->
    <SettingsNavbar
      v-model="activeTab"
      @tab-change="handleTabChange"
      @visible-tabs-change="handleVisibleTabsChange"
    />

    <!-- Active Submodule Tab Content -->
    <div v-if="hasAnyAllowedTab" class="pt-1">
      <Transition name="tab-fade" mode="out-in">
        <component :is="activeComponent" :key="activeTab" />
      </Transition>
    </div>

    <!-- No Permissions Fallback -->
    <div
      v-else
      class="flex flex-col items-center justify-center p-12 bg-card-background/40 border border-primary-border rounded-lg text-center min-h-[400px] gap-3"
    >
      <div class="w-14 h-14 rounded-lg bg-card-background border border-primary-border flex items-center justify-center text-secondary-text">
        <ShieldAlert class="w-6 h-6 text-primary-red" />
      </div>
      <h3 class="text-sm font-bold text-primary-text">Access Restricted</h3>
      <p class="text-xs text-secondary-text max-w-sm">
        You do not have permissions to access any of the Settings submodules. Please contact your system administrator.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ShieldAlert } from "lucide-vue-next";
import SettingsNavbar from "@/components/default/SettingsNavbar.vue";

// Submodule Tab Components
import TransactionSettingsTab from "./tabs/TransactionSettingsTab.vue";
import TwoFactorSettingsTab from "./tabs/TwoFactorSettingsTab.vue";

const route = useRoute();
const router = useRouter();

const allowedTabs = ref([]);
const activeTab = ref(
  route.query.tab === "payment-settings"
    ? "transaction-settings"
    : route.query.tab || "transaction-settings"
);

const hasAnyAllowedTab = computed(() => allowedTabs.value.length > 0);

const handleVisibleTabsChange = (tabs) => {
  allowedTabs.value = tabs;
  if (tabs.length > 0 && !tabs.some((t) => t.value === activeTab.value)) {
    activeTab.value = tabs[0].value;
  }
};

const handleTabChange = (tabValue) => {
  activeTab.value = tabValue;
};

// Sync active tab with route query parameter
watch(
  () => route.query.tab,
  (tab) => {
    if (typeof tab === "string") {
      const normalizedTab = tab === "payment-settings" ? "transaction-settings" : tab;
      if (normalizedTab !== activeTab.value) {
        if (allowedTabs.value.length === 0 || allowedTabs.value.some((t) => t.value === normalizedTab)) {
          activeTab.value = normalizedTab;
        }
      }
    }
  }
);

watch(
  activeTab,
  (tab) => {
    if (route.query.tab !== tab) {
      router.replace({ query: { ...route.query, tab } });
    }
  }
);

// Map active tab to component (extensible for future settings submodules)
const tabComponentsMap = {
  "transaction-settings": TransactionSettingsTab,
  "payment-settings": TransactionSettingsTab,
  "2fa-settings": TwoFactorSettingsTab,
};

const activeComponent = computed(() => {
  return tabComponentsMap[activeTab.value] || TransactionSettingsTab;
});
</script>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
