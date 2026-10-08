<script setup>
import { ref, onMounted } from "vue";
import { useProfileStore } from "@/stores/profile/profile";
import NavBar from "@/components/default/NavBar.vue";
import TopBar from "@/components/default/TopBar.vue";
import NoPermissionsState from "@/components/common/NoPermissionsState.vue";
import { useTickerStore } from "@/stores/ws/ticker";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";

const SIDEBAR_COLLAPSED_KEY = "panther_sidebar_collapsed";
const storedSidebarCollapsed =
  typeof window !== "undefined"
    ? localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
    : false;

const sidebarOpen = ref(false);
const isSidebarCollapsed = ref(storedSidebarCollapsed);
const profileStore = useProfileStore();
const tickerStore = useTickerStore();
const permissionsStore = useMyPermissionsStore();
const { hasNoPermissions } = usePermissionCheck();

const setSidebarCollapsed = (value) => {
  isSidebarCollapsed.value = value;
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value));
};

const toggleSidebarCollapsed = () => {
  setSidebarCollapsed(!isSidebarCollapsed.value);
};

const handleRetry = () => {
  permissionsStore.fetchMyPermissions(true);
};

onMounted(async () => {
  try {
    await profileStore.fetchUserProfile();
  } catch (_) {}
  await tickerStore.startWebSocket();
  tickerStore.updateTickerList([
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "AUDUSD",
    "USDCAD",
    "XAUUSD",
    "XAUUSD.c",
  ]);
});
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-background">
    <!-- NavBar Sidebar -->
    <NavBar
      :is-open="sidebarOpen"
      :is-collapsed="isSidebarCollapsed"
      @close="sidebarOpen = false"
      @toggle-collapse="toggleSidebarCollapsed"
    />

    <!-- Main column — offset by sidebar width on md+ -->
    <div
      class="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out"
      :class="isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60'"
    >
      <!-- Top Bar -->
      <TopBar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Router View Area -->
      <main
        class="flex-1 overflow-y-auto no-scrollbar bg-background p-4 lg:p-6"
      >
        <NoPermissionsState v-if="hasNoPermissions" @retry="handleRetry" />
        <router-view v-else />
      </main>
    </div>
  </div>
</template>
