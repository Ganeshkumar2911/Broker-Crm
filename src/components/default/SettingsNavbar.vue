<template>
  <div class="w-full">
    <!-- Submodule Navigation Bar -->
    <div
      class="flex items-center gap-1.5 p-1.5 bg-card-background/70 backdrop-blur-md border border-primary-border rounded-xl overflow-x-auto no-scrollbar shadow-xs"
    >
      <button
        v-for="tab in visibleTabs"
        :key="tab.value"
        type="button"
        @click="selectTab(tab.value)"
        class="group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 outline-none select-none"
        :class="[
          modelValue === tab.value
            ? 'bg-primary text-white shadow-xs'
            : 'text-secondary-text hover:text-primary-text hover:bg-background/60',
        ]"
      >
        <!-- Icon -->
        <component
          :is="tab.icon"
          class="w-4 h-4 transition-transform duration-200 group-hover:scale-110 shrink-0"
          :class="
            modelValue === tab.value
              ? 'text-white'
              : 'text-secondary-text group-hover:text-primary-text'
          "
        />

        <!-- Label -->
        <span>{{ tab.label }}</span>

        <!-- Badge / Pill (Optional) -->
        <span
          v-if="tab.badge"
          class="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full"
          :class="
            modelValue === tab.value
              ? 'bg-white/20 text-white'
              : 'bg-background text-secondary-text border border-primary-border/60'
          "
        >
          {{ tab.badge }}
        </span>

        <!-- Active Dot Indicator -->
        <span
          v-if="modelValue === tab.value"
          class="w-1.5 h-1.5 rounded-full bg-white ml-0.5 animate-pulse"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { SlidersHorizontal, ShieldCheck } from "lucide-vue-next";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const props = defineProps({
  modelValue: {
    type: String,
    default: "transaction-settings",
  },
  customTabs: {
    type: Array,
    default: null,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "tab-change",
  "visible-tabs-change",
]);

const { hasPermission } = usePermissionCheck();

// Built-in default settings submodule definitions
const defaultSettingsTabs = [
  {
    label: "Transaction Settings",
    value: "transaction-settings",
    icon: SlidersHorizontal,
    description: "Deposit, withdrawal, and internal transfer restrictions",
    permission: [
      "system_setting.manager_transection_setting",
      "system_setting.view",
      "xtention_dev.view",
    ],
  },
  {
    label: "Two-Factor Auth (2FA)",
    value: "2fa-settings",
    icon: ShieldCheck,
    description: "Manage global Google Authenticator rules",
    permission: ["two_factor.view"],
  },
];

const allTabs = computed(() => props.customTabs || defaultSettingsTabs);

// Dynamically filter tabs according to staff permissions
const visibleTabs = computed(() => {
  return allTabs.value.filter((tab) => {
    if (!tab.permission) return true;
    return hasPermission(tab.permission);
  });
});

const selectTab = (tabValue) => {
  emit("update:modelValue", tabValue);
  emit("tab-change", tabValue);
};

// Emit visible tabs so parent page can default or react accordingly
watch(
  visibleTabs,
  (newTabs) => {
    emit("visible-tabs-change", newTabs);
    if (
      newTabs.length > 0 &&
      !newTabs.some((t) => t.value === props.modelValue)
    ) {
      emit("update:modelValue", newTabs[0].value);
    }
  },
  { immediate: true },
);
</script>
