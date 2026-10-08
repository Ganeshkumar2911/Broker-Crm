<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import WatchlistSettings from "./WatchlistSettings.vue";
import SymbolCatalog from "./SymbolCatalog.vue";
import ExcelImport from "./ExcelImport.vue";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const { hasPermission } = usePermissionCheck();
const route = useRoute();
const router = useRouter();

const allTabs = [
  {
    label: "Settings",
    value: "settings",
    permission: [
      "watchlist.settings_view",
      "watchlist.settings_update",
    ],
  },
  {
    label: "Symbol Catalog",
    value: "symbols",
    permission: [
      "watchlist.symbols_view",
      "watchlist.symbols_create",
      "watchlist.symbols_update",
      "watchlist.symbols_delete",
    ],
  },
  {
    label: "Excel Import",
    value: "import",
    permission: [
      "watchlist.symbols_import",
    ],
  },
];

const tabs = computed(() => {
  return allTabs.filter((tab) => {
    if (!tab.permission) return true;
    return hasPermission(tab.permission);
  });
});

const activeTab = ref(route.query.tab || "settings");

watch(
  () => route.query.tab,
  (tab) => {
    if (
      typeof tab === "string" &&
      ["settings", "symbols", "import"].includes(tab)
    ) {
      activeTab.value = tab;
    }
  },
);

watch(activeTab, (tab) => {
  if (route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } });
  }
});

watch(
  tabs,
  (newTabs) => {
    if (
      newTabs.length > 0 &&
      !newTabs.some((t) => t.value === activeTab.value)
    ) {
      activeTab.value = newTabs[0].value;
    }
  },
  { immediate: true },
);

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case "symbols":
      return SymbolCatalog;
    case "import":
      return ExcelImport;
    case "settings":
    default:
      return WatchlistSettings;
  }
});

function switchTab(tabValue) {
  activeTab.value = tabValue;
}
</script>

<template>
  <div class="px-4">
    <!-- Tabs -->
    <div
      v-if="tabs.length > 0"
      class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit mb-4"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="cursor-pointer px-4 py-2 rounded-md text-xs font-medium transition-colors"
        :class="
          activeTab === tab.value
            ? 'bg-primary text-white'
            : 'text-secondary-text hover:text-primary-text'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Active Tab Component -->
    <component :is="activeComponent" v-if="tabs.length > 0" @switch-tab="switchTab" />
    <div
      v-else
      class="py-12 text-center text-sm text-secondary-text bg-card-background border border-primary-border rounded-lg"
    >
      You do not have permission to view Watchlist.
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
