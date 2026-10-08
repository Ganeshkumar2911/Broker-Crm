<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import EmailSettings from "./EmailSettings.vue";
import EmailTemplates from "./EmailTemplates.vue";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
// import EmailLogs from "@/pages/e-mails/EmailLogs.vue";
import NewEmailLogs from "@/pages/e-mails/NewEmailLogs.vue";
import BrevoLogs from "@/pages/e-mails/BrevoLogs.vue";

const { hasPermission } = usePermissionCheck();
const route = useRoute();
const router = useRouter();

const allTabs = [
  {
    label: "Email Settings",
    value: "settings",
    permission: ["email.manage", "email.view", "email.update"],
  },
  {
    label: "Email Templates",
    value: "templates",
    permission: [
      "email.template_view",
      "email.template_update",
      "email.template_manual_trigger",
    ],
  },
  {
    label: "Email Logs",
    value: "logs",
    // permission: ['email.log_view'],
  },
  {
    label: "Brevo Logs",
    value: "brevo-logs",
    // permission: ['email.log_view'],
  },
];

const tabs = computed(() => {
  return allTabs.filter((tab) => hasPermission(tab.permission));
});

const activeTab = ref(route.query.tab || "settings");

watch(
  () => route.query.tab,
  (tab) => {
    if (typeof tab === "string") {
      activeTab.value = tab;
    }
  },
);

watch(
  activeTab,
  (tab) => {
    if (route.query.tab !== tab) {
      router.replace({ query: { ...route.query, tab } });
    }
  },
);

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
    case "templates":
      return EmailTemplates;
    case "logs":
      return NewEmailLogs;
    case "brevo-logs":
      return BrevoLogs;
    default:
      return EmailSettings;
  }
});
</script>

<template>
  <div class="px-4">
    <!-- Tabs -->
    <div
      class="flex items-center gap-1 bg-card-background border border-primary-border rounded-lg p-1 w-fit"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
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

    <!-- Active Tab Content -->
    <component :is="activeComponent" />
  </div>
</template>
