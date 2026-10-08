<script setup>
import { ref, computed, watch } from "vue";
import TelegramSettings from "@/pages/telegram/TelegramSettings.vue";
import TelegramConfiguration from "@/pages/telegram/TelegramConfiguration.vue";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const { hasPermission } = usePermissionCheck();

const allTabs = [
  {
    label: "Telegram Settings",
    value: "settings",
    permission: [
      "telegram.view",
      "telegram.create",
      "telegram.update",
      "telegram.delete",
    ],
  },
  {
    label: "Telegram Configuration",
    value: "configuration",
    permission: ["telegram.configure_view", "telegram.configure_update"],
  },
];

const tabs = computed(() => {
  return allTabs.filter((tab) => hasPermission(tab.permission));
});

const activeTab = ref("settings");

watch(
  tabs,
  (newTabs) => {
    if (newTabs.length > 0 && !newTabs.some((t) => t.value === activeTab.value)) {
      activeTab.value = newTabs[0].value;
    }
  },
  { immediate: true },
);

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case "settings":
      return TelegramSettings;

    case "configuration":
      return TelegramConfiguration;

    default:
      return TelegramSettings;
  }
});
</script>

<template>
  <div class="px-4">
    <!-- Tabs -->
    <div
      v-if="tabs.length > 0"
      class="flex items-center gap-1 cursor-pointer bg-card-background border border-primary-border rounded-lg p-1 w-fit mb-4"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer"
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

    <!-- Active Tab Content -->
    <component :is="activeComponent" v-if="tabs.length > 0" />
    <div v-else class="py-12 text-center text-sm text-secondary-text">
      You do not have permission to view Telegram settings or configuration.
    </div>
  </div>
</template>
