<template>
  <div
    class="h-screen bg-background text-primary-text flex flex-col -m-4 lg:-m-6"
  >
    <!-- TOP BAR -->
    <div class="border-b border-primary-border px-6 py-4">
      <div class="flex items-start justify-between gap-4">
        <!-- Avatar -->
        <div class="md:flex-2 flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-lg shrink-0"
          >
            {{ initials }}
          </div>

          <!-- Name + meta -->
          <div class="flex-1">
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-lg font-semibold text-primary-text">
                {{ user.name }}
              </h1>
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
                :class="
                  user.is_active
                    ? 'bg-primary-green/10 text-primary-green'
                    : 'bg-primary-red/10 text-primary-red'
                "
              >
                {{ user.is_active ? "Active" : "Inactive" }}
              </span>
              <span
                v-if="user.state"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-blue/10 text-primary-blue"
              >
                {{ user.state }}
              </span>
              <span
                v-if="user.role"
                class="text-[11px] text-secondary-text uppercase tracking-widest font-semibold"
              >
                {{ user.role }}
              </span>
              <template v-if="Array.isArray(user.tags) && user.tags.length > 0">
                <span
                  v-for="tag in user.tags"
                  :key="tag.id || tag.name"
                  class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  :style="{
                    backgroundColor: `${tag.color || '#3B82F6'}1A`,
                    color: tag.color || '#3B82F6',
                    border: `1px solid ${tag.color || '#3B82F6'}33`,
                  }"
                >
                  {{ tag.name }}
                </span>
              </template>
            </div>

            <div class="flex items-center gap-6 mt-1 flex-wrap">
              <span class="text-[11px] text-secondary-text">
                CLIENT ID
                <span class="text-primary-text font-medium tabular-nums"
                  >#{{ user.id }}</span
                >
              </span>
              <span class="text-[11px] text-secondary-text">
                WHITELABEL
                <span class="text-primary-text font-medium">{{
                  whitelabel
                }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="border-l border-primary-border h-20"></div>

        <!-- Email / Phone / KYC -->
        <div class="hidden flex-1 md:flex flex-col gap-2 text-sm">
          <div>
            <p
              class="text-[11px] text-secondary-text uppercase tracking-widest mb-0.5"
            >
              Email
            </p>
            <p class="text-primary-text tabular-nums">{{ user.email }}</p>
          </div>
          <div>
            <p
              class="text-[11px] text-secondary-text uppercase tracking-widest"
            >
              Phone
            </p>
            <p class="text-primary-text tabular-nums">
              {{ user.phone_number ?? "-" }}
            </p>
          </div>
        </div>

        <div class="border-l border-primary-border h-20"></div>

        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p
              class="text-[11px] text-secondary-text uppercase tracking-widest mb-0.5"
            >
              KYC
            </p>
            <span
              class="px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize border"
              :class="kycClass"
            >
              {{ kycStatus }}
            </span>
          </div>
          <div>
            <p
              class="text-[11px] text-secondary-text uppercase tracking-widest mb-0.5"
            >
              Country
            </p>
            <p class="text-primary-text flex items-center gap-1.5">
              <span
                v-if="user.country && getFlagCode(user.country)"
                :class="[
                  'fi',
                  `fi-${getFlagCode(user.country)}`,
                  'fis',
                  'w-4 h-3 shrink-0',
                ]"
              ></span>
              <span>{{ cleanCountryLabel(user.country) || "—" }}</span>
            </p>
          </div>
        </div>

        <div class="border-l border-primary-border h-20 hidden md:block"></div>

        <div class="hidden md:flex flex-col gap-2 justify-center">
          <div>
            <p class="text-[11px] text-secondary-text uppercase tracking-widest mb-1.5">
              Auto Withdrawal
            </p>
            <label class="inline-flex items-center gap-2 cursor-pointer shrink-0 select-none" @click.prevent="handleToggleClick">
              <input
                type="checkbox"
                role="switch"
                :checked="user.eligible_for_auto_withdrawal"
                class="peer sr-only"
              />
              <span
                class="relative block h-5.5 w-10 rounded-full bg-zinc-300 transition-colors duration-200 dark:bg-zinc-600 peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/40 peer-checked:[&>span]:translate-x-4.5"
                :class="{'opacity-50 pointer-events-none': isUpdatingAutoWithdrawal}"
              >
                <span
                  class="absolute left-0.75 top-0.75 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                ></span>
              </span>
              <span
                class="text-xs font-bold"
                :class="user.eligible_for_auto_withdrawal ? 'text-emerald-500' : 'text-zinc-500'"
              >
                {{ user.eligible_for_auto_withdrawal ? 'Enabled' : 'Disabled' }}
              </span>
            </label>
          </div>
        </div>

        <!-- <div class="border-l border-primary-border h-20"></div> -->

        <!-- Quick Actions -->
        <div class="shrink-0 border border-primary-border rounded-lg p-3">
          <p class="text-secondary-text font-extralight text-xs">
            Quick Actions
          </p>
          <div class="flex items-center gap-1.5 mt-2">
            <Tooltip
              v-for="action in visibleQuickActions"
              :key="action.label"
              :text="action.label"
              position="bottom"
            >
              <button
                type="button"
                :aria-label="action.label"
                @click="handleQuickAction(action)"
                class="cursor-pointer border border-primary-border p-2 rounded-lg text-secondary-text hover:bg-background hover:text-primary-text transition-colors"
              >
                <HugeiconsIcon v-if="action.hugeIcon" :icon="action.hugeIcon" class="w-4 h-4" />
                <component v-else :is="action.icon" class="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Sub-tabs -->
      <!-- <div class="flex items-center gap-1 mt-4 overflow-x-auto scrollbar-none">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          :class="
            activeTab === tab.key
              ? 'bg-primary text-white'
              : 'text-secondary-text hover:bg-background hover:text-primary-text'
          "
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div> -->
    </div>

    <!-- BODY -->
    <div class="flex flex-1 overflow-hidden">
      <!-- LEFT SIDEBAR -->
      <aside
        class="w-52 shrink-0 border-r border-primary-border overflow-y-auto no-scrollbar"
      >
        <div class="p-3 space-y-1">
          <template v-for="section in sidebarSections" :key="section.key">
            <!-- Section header (expandable) -->
            <button
              @click="toggleSection(section.key)"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-secondary-text hover:bg-background hover:text-primary-text transition-colors"
            >
              <div class="flex items-center gap-2">
                <component :is="section.icon" class="w-4 h-4" />
                {{ section.label }}
              </div>
              <ChevronDown
                class="w-3.5 h-3.5 transition-transform"
                :class="expanded[section.key] ? 'rotate-180' : ''"
              />
            </button>

            <!-- Info fields -->
            <div
              v-if="section.isInfo && expanded[section.key]"
              class="ml-3 pl-3 border-l border-primary-border space-y-2 py-1"
            >
              <div
                v-for="item in section.fields"
                :key="item.label"
                class="text-xs"
              >
                <p
                  class="text-[10px] text-secondary-text uppercase tracking-widest mb-0.5"
                >
                  {{ item.label }}
                </p>

                <!-- Custom renderer for Account Numbers with badge chips -->
                <div
                  v-if="item.isAccounts"
                  class="flex flex-wrap gap-1.5 pt-0.5"
                >
                  <template v-if="clientAccounts.length > 0">
                    <span
                      v-for="(acc, idx) in clientAccounts"
                      :key="acc.account_number || acc.login || acc.id || acc || idx"
                      @click="goToTradingAccount(acc.account_number || acc.login || acc.id || acc)"
                      :title="`Trading Account: #${acc.account_number || acc.login || acc.id || acc}${acc.account_type ? ' (' + acc.account_type + ')' : ''} — Click to view`"
                      class="font-mono text-[9px] px-1.5 py-0.5 rounded-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 inline-flex items-center font-semibold border shadow-2xs"
                      :class="getAccountBadgeClass(acc)"
                    >
                      {{ acc.account_number || acc.login || acc.id || acc }}
                    </span>
                  </template>
                  <span v-else class="text-secondary-text text-xs">—</span>
                </div>

                <!-- Custom renderer for Account Types with badge chips -->
                <div
                  v-else-if="item.isAccountTypes"
                  class="flex flex-wrap gap-1.5 pt-0.5"
                >
                  <template v-if="accountTypesList.length > 0">
                    <span
                      v-for="t in accountTypesList"
                      :key="t"
                      class="text-[9px] px-1.5 py-0.5 rounded-md capitalize font-semibold border"
                      :class="getAccountBadgeClass({ account_type: t })"
                    >
                      {{ String(t).replace(/_/g, " ") }}
                    </span>
                  </template>
                  <span v-else class="text-secondary-text text-xs">—</span>
                </div>

                <!-- Default field value renderer -->
                <p
                  v-else
                  class="text-primary-text break-all flex items-center gap-1.5"
                >
                  <span
                    v-if="
                      item.label === 'Country' &&
                      item.value() &&
                      getFlagCode(item.value())
                    "
                    :class="[
                      'fi',
                      `fi-${getFlagCode(item.value())}`,
                      'fis',
                      'w-4 h-3 shrink-0',
                    ]"
                  ></span>
                  <span>{{
                    item.label === "Country"
                      ? cleanCountryLabel(item.value())
                      : item.value() || "—"
                  }}</span>
                </p>
              </div>
            </div>

            <!-- Child routes -->
            <div
              v-else-if="!section.isInfo && expanded[section.key]"
              class="ml-3 pl-3 border-l border-primary-border space-y-0.5"
            >
              <RouterLink
                v-for="child in section.children"
                :key="child.to"
                :to="child.to"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-secondary-text hover:bg-background hover:text-primary-text transition-colors"
                active-class="bg-primary/10 text-primary"
              >
                {{ child.label }}
              </RouterLink>
            </div>
          </template>
        </div>
      </aside>

      <!-- MAIN CONTENT (router-view) -->
      <main class="flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
        <div
          class="flex items-center justify-between gap-3 overflow-x-auto sticky top-0 z-30 bg-background border-b border-primary-border py-3"
        >
          <div class="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <RouterLink
              v-for="tab in tabs"
              :key="tab.key"
              :to="tab.to"
              class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              :class="
                isTabActive(tab)
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-secondary-text hover:bg-card-background hover:text-primary-text'
              "
            >
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
            </RouterLink>
          </div>

          <!-- Global Refresh Button for all tabs -->
          <div class="flex items-center shrink-0 pr-1">
            <button
              type="button"
              @click="handleGlobalRefresh"
              :disabled="isGlobalRefreshing"
              class="border border-primary-border bg-card-background/40 hover:bg-card-background/70 rounded-xl p-2 text-secondary-text hover:text-primary-text transition-colors cursor-pointer shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
              title="Refresh Tab Data"
            >
              <RefreshCw
                class="w-4 h-4"
                :class="{ 'animate-spin text-primary': isGlobalRefreshing }"
              />
            </button>
          </div>
        </div>
        <RouterView />
      </main>
    </div>

    <!-- Upload KYC Document Modal (Quick Action) -->
    <UploadKycDocumentModal
      :open="uploadDocModalOpen"
      :client="user"
      @close="uploadDocModalOpen = false"
      @success="handleUploadDocSuccess"
    />

    <!-- Email Manual Trigger Panel (Quick Action) -->
    <ClientEmailTriggerPanel
      :open="emailTriggerPanelOpen"
      :client="user"
      @close="emailTriggerPanelOpen = false"
    />

    <!-- WhatsApp Real-Time Chat Drawer (Quick Action) -->
    <ClientWhatsAppChatDrawer
      :open="whatsappDrawerOpen"
      :client="user"
      @close="whatsappDrawerOpen = false"
    />

    <!-- Auto Withdrawal Confirmation Modal -->
    <ConfirmationDialog
      :open="autoWithdrawalConfirmOpen"
      title="Confirm Auto Withdrawal Change"
      :message="`Are you sure you want to ${pendingAutoWithdrawalState ? 'enable' : 'disable'} auto withdrawal for this client?`"
      :confirmText="pendingAutoWithdrawalState ? 'Enable' : 'Disable'"
      :type="pendingAutoWithdrawalState ? 'success' : 'danger'"
      :loading="isUpdatingAutoWithdrawal"
      @confirm="confirmAutoWithdrawalToggle"
      @cancel="autoWithdrawalConfirmOpen = false"
    />

    <!-- Reset 2FA Confirmation Modal -->
    <ConfirmationDialog
      :open="reset2faConfirmOpen"
      title="Reset 2FA"
      message="This removes their authenticator and backup codes. They can set 2FA up again after login."
      confirmText="Reset 2FA"
      type="danger"
      :loading="isResetting2fa"
      @confirm="confirmReset2fa"
      @cancel="reset2faConfirmOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getFlagCode, cleanCountryLabel } from "@/utils/countries";
import Tooltip from "@/components/common/Tooltip.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import UploadKycDocumentModal from "@/components/clientDetails/UploadKycDocumentModal.vue";
import ClientEmailTriggerPanel from "@/components/clientDetails/ClientEmailTriggerPanel.vue";
import ClientWhatsAppChatDrawer from "@/components/clientDetails/ClientWhatsAppChatDrawer.vue";
import { useClientDepthStore } from "@/stores/clientDepth/clientDepth";
import { useEnhancedAuditLogsStore } from "@/stores/enhancedAuditLogs/enhancedAuditLogs";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { usePermissionCheck } from "@/composables/usePermissionCheck";
import {
  User,
  Info,
  MapPin,
  MoreHorizontal,
  BarChart2,
  CreditCard,
  Headphones,
  Megaphone,
  Activity,
  ChevronDown,
  Phone,
  Mail,
  FileText,
  FileCheck,
  MessageSquare,
  RefreshCw,
  Bell,
  Landmark,
  ClipboardList,
  ShieldOff,
} from "lucide-vue-next";
import { WhatsappIcon } from "@hugeicons/core-free-icons/index";
const route = useRoute();
const router = useRouter();
const snackbar = useSnackbarStore();
const clientDepthStore = useClientDepthStore();
const enhancedAuditLogsStore = useEnhancedAuditLogsStore();
const { hasPermission } = usePermissionCheck();

// ─── Account Badges Styling & Navigation ───────────────────────────────────────
const chooseBgColor = {
  live: "bg-primary-green/10 text-primary-green border border-primary-green/20 hover:bg-primary-green/20",
  demo: "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20 hover:bg-primary-yellow/20",
  copy_trading: "bg-primary-red/10 text-primary-red border border-primary-red/20 hover:bg-primary-red/20",
  copy: "bg-primary-red/10 text-primary-red border border-primary-red/20 hover:bg-primary-red/20",
  pamm: "bg-primary-blue/10 text-primary-blue border border-primary-blue/20 hover:bg-primary-blue/20",
};

const getAccountBadgeClass = (acc) => {
  if (!acc) return "bg-background text-secondary-text border-primary-border";
  const type = typeof acc === "object" ? acc.account_type || acc.trading_type || acc.type : null;
  if (type) {
    const norm = String(type).toLowerCase().trim();
    if (chooseBgColor[norm]) return chooseBgColor[norm];
    if (norm.includes("copy")) return chooseBgColor.copy_trading;
    if (norm.includes("demo")) return chooseBgColor.demo;
    if (norm.includes("live") || norm.includes("real")) return chooseBgColor.live;
  }

  // Fallback to account number prefix if account_type is omitted
  const accNum = String(
    typeof acc === "object"
      ? acc.account_number || acc.login || acc.id || ""
      : acc
  ).toUpperCase();

  if (accNum.startsWith("CT")) return chooseBgColor.copy_trading;
  if (accNum.startsWith("DM") || accNum.startsWith("DEMO")) return chooseBgColor.demo;
  if (accNum.startsWith("LV") || accNum.startsWith("LIVE")) return chooseBgColor.live;

  return "bg-card-background text-secondary-text border-primary-border hover:text-primary-text";
};

const goToTradingAccount = (accountNumber) => {
  if (!accountNumber) return;
  router.push({
    path: "/trading-accounts",
    query: { search: accountNumber },
  });
};

// ─── Reactive Client User State ───────────────────────────────────────────────
const localStoredUser = ref({});

const loadUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("active_client");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!route.params.id || String(parsed?.id) === String(route.params.id)) {
        localStoredUser.value = parsed;
        return;
      }
    }
  } catch { }
  localStoredUser.value = {};
};

const handleProfileUpdated = (e) => {
  if (e?.detail) {
    localStoredUser.value = { ...localStoredUser.value, ...e.detail };
    clientDepthStore.setActiveClient(e.detail);
  } else {
    loadUserFromStorage();
  }
};

const handleStorageChange = (e) => {
  if (e.key === "active_client") {
    loadUserFromStorage();
  }
};

const handleKycUpdated = (e) => {
  const userId = route.params.id || user.value?.id;
  if (userId) {
    clientDepthStore.fetchClientKyc(userId, true);
    clientDepthStore.fetchClientOverview(userId, true);
  }
};

onMounted(() => {
  loadUserFromStorage();
  window.addEventListener("client-profile-updated", handleProfileUpdated);
  window.addEventListener("client-kyc-updated", handleKycUpdated);
  window.addEventListener("storage", handleStorageChange);
});

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId) {
      if (oldId && String(newId) !== String(oldId)) {
        if (clientDepthStore.currentUserId !== String(newId)) {
          clientDepthStore.reset();
        }
      }
      loadUserFromStorage();
      clientDepthStore.fetchClientOverview(newId);
      clientDepthStore.fetchClientKyc(newId);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  window.removeEventListener("client-profile-updated", handleProfileUpdated);
  window.removeEventListener("client-kyc-updated", handleKycUpdated);
  window.removeEventListener("storage", handleStorageChange);
});

const user = computed(() => {
  const routeId = route.params.id;
  const overviewUser =
    (String(clientDepthStore.overviewData?.user?.id) === String(routeId) ||
     String(clientDepthStore.overviewData?.id) === String(routeId))
      ? (clientDepthStore.overviewData?.user || clientDepthStore.overviewData)
      : {};
  const active =
    (String(clientDepthStore.activeClient?.id) === String(routeId))
      ? clientDepthStore.activeClient
      : {};
  const stored =
    (String(localStoredUser.value?.id) === String(routeId))
      ? localStoredUser.value
      : {};

  const kycStatusFromStore =
    (String(clientDepthStore.kycData?.user_id) === String(routeId) ||
     String(clientDepthStore.currentUserId) === String(routeId))
      ? (clientDepthStore.kycData?.kyc_status || clientDepthStore.kycData?.status)
      : null;

  return {
    ...stored,
    ...active,
    ...overviewUser,
    ...(kycStatusFromStore ? { kyc_status: kycStatusFromStore } : {}),
  };
});

const kycStatus = computed(() => {
  return (
    clientDepthStore.kycData?.kyc_status ||
    clientDepthStore.kycData?.status ||
    user.value?.kyc_status ||
    "Pending"
  );
});

const initials = computed(() => {
  const n = user.value.name || "";
  return n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const whitelabel = computed(() => {
  const email = user.value.ib_email || "";
  const domain = email.split("@")[1] || "";
  return domain.split(".")[0] || "—";
});

const kycClass = computed(() => {
  const s = String(kycStatus.value || "").toLowerCase();
  if (s === "approved" || s === "verified")
    return "bg-primary-green/10 text-primary-green border border-primary-green/20";
  if (
    s === "pending" ||
    s === "in_progress" ||
    s === "under review" ||
    s === "waiting for verification" ||
    s === "unverified"
  )
    return "bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20";
  if (s === "rejected")
    return "bg-primary-red/10 text-primary-red border border-primary-red/20";
  return "bg-secondary-text/10 text-secondary-text border border-primary-border";
});

const autoWithdrawalConfirmOpen = ref(false);
const pendingAutoWithdrawalState = ref(false);
const isUpdatingAutoWithdrawal = ref(false);

const handleToggleClick = () => {
  if (isUpdatingAutoWithdrawal.value) return;
  pendingAutoWithdrawalState.value = !user.value.eligible_for_auto_withdrawal;
  autoWithdrawalConfirmOpen.value = true;
};

const confirmAutoWithdrawalToggle = () => {
  toggleAutoWithdrawal(pendingAutoWithdrawalState.value);
};

const toggleAutoWithdrawal = (newVal) => {
  if (!user.value?.id) return;
  isUpdatingAutoWithdrawal.value = true;
  apiRequest(urls.KEYS.PATCH, urls.clientList.update, {
    look_up_key: user.value.id,
    data: { eligible_for_auto_withdrawal: newVal },
    isTokenRequired: true,
    onSuccess: (res) => {
      snackbar.show("Auto withdrawal status updated successfully", "success");
      
      const raw = localStorage.getItem("active_client");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (String(parsed.id) === String(user.value.id)) {
            parsed.eligible_for_auto_withdrawal = newVal;
            localStorage.setItem("active_client", JSON.stringify(parsed));
          }
        } catch(e) {}
      }
      
      window.dispatchEvent(
        new CustomEvent("client-profile-updated", {
          detail: { eligible_for_auto_withdrawal: newVal },
        })
      );
      
      clientDepthStore.fetchClientOverview(user.value.id, true);
      autoWithdrawalConfirmOpen.value = false;
    },
    onFailure: (err) => {
      snackbar.show(err?.message || "Failed to update auto withdrawal status", "error");
      autoWithdrawalConfirmOpen.value = false;
      window.dispatchEvent(
        new CustomEvent("client-profile-updated", {
          detail: { eligible_for_auto_withdrawal: !newVal },
        })
      );
    },
    onFinally: () => {
      isUpdatingAutoWithdrawal.value = false;
    }
  });
};

// ─── Quick Actions ────────────────────────────────────────────────────────────
const uploadDocModalOpen = ref(false);
const emailTriggerPanelOpen = ref(false);
const whatsappDrawerOpen = ref(false);

const quickActions = [
  { action: "call", label: "Call", icon: Phone },
  { action: "email", label: "Email", icon: Mail, permission: ["email.manage", "email.template_manual_trigger", "email.view"] },
  { action: "message", label: "WhatsApp Chat", hugeIcon: WhatsappIcon, permission: ["whatsapp.send", "whatsapp.view"] },
  { action: "documents", label: "Documents", icon: FileText, permission: ["client.document_add", "client.document_view"] },
  { action: "reset2fa", label: "Reset 2FA", icon: ShieldOff, permission: ["two_factor.reset"] },
];

const visibleQuickActions = computed(() => {
  return quickActions.filter((action) => !action.permission || hasPermission(action.permission));
});

const handleQuickAction = (action) => {
  const actionType = action.action || action.label?.toLowerCase();

  if (actionType === "documents") {
    if (action.permission && !hasPermission(action.permission)) {
      snackbar.show("You do not have permission to manage documents.", "error");
      return;
    }
    uploadDocModalOpen.value = true;
    return;
  }
  if (actionType === "call") {
    if (user.value?.phone_number) {
      window.open(`tel:${user.value.phone_number}`);
    } else {
      snackbar.show("Phone number not available for this client.", "info");
    }
    return;
  }
  if (actionType === "email") {
    if (action.permission && !hasPermission(action.permission)) {
      snackbar.show("You do not have permission to send emails.", "error");
      return;
    }
    if (user.value?.email) {
      emailTriggerPanelOpen.value = true;
    } else {
      snackbar.show("Email address not available for this client.", "info");
    }
    return;
  }
  if (actionType === "message" || actionType?.includes("whatsapp")) {
    if (!hasPermission(["whatsapp.send", "whatsapp.view"])) {
      snackbar.show("You do not have permission to access WhatsApp chat.", "error");
      return;
    }
    if (user.value?.phone_number) {
      whatsappDrawerOpen.value = true;
    } else {
      snackbar.show("Phone number not available for WhatsApp chat.", "info");
    }
    return;
  }
  if (actionType === "reset2fa") {
    if (action.permission && !hasPermission(action.permission)) {
      snackbar.show("You do not have permission to reset 2FA.", "error");
      return;
    }
    reset2faConfirmOpen.value = true;
    return;
  }
  if (actionType === "more") {
    snackbar.show("Additional quick actions coming soon.", "info");
    return;
  }
};

const handleUploadDocSuccess = () => {
  uploadDocModalOpen.value = false;
  const userId = route.params.id || user.value?.id;
  if (userId) {
    clientDepthStore.fetchClientKyc(userId, true);
    clientDepthStore.fetchClientOverview(userId, true);
    clientDepthStore.fetchUserReferences(userId, true);
  }
};

const reset2faConfirmOpen = ref(false);
const isResetting2fa = ref(false);

const confirmReset2fa = () => {
  const userId = route.params.id || user.value?.id;
  if (!userId) return;
  isResetting2fa.value = true;
  apiRequest(urls.KEYS.POST, urls.twoFactor.reset(userId), {
    isTokenRequired: true,
    onSuccess: (res) => {
      snackbar.show(res?.message || "User 2FA has been reset.", "success");
      reset2faConfirmOpen.value = false;
      // Optional: Dispatch event if user object has totp_enabled flag in future
      window.dispatchEvent(
        new CustomEvent("client-profile-updated", {
          detail: { totp_enabled: false },
        })
      );
    },
    onFailure: (err) => {
      snackbar.show(
        err?.response?.data?.message || err?.message || "Failed to reset 2FA",
        "error"
      );
    },
    onFinally: () => {
      isResetting2fa.value = false;
    },
  });
};

// ─── Current Active Tab Resolver ──────────────────────────────────────────────
const currentActiveTab = computed(() => {
  const currentPath = route.path.replace(/\/$/, "");
  if (currentPath.endsWith("/profile") || route.name === "client-details-profile") return "profile";
  if (currentPath.endsWith("/financials") || route.name === "client-details-financials") return "financials";
  if (currentPath.endsWith("/bank-details") || route.name === "client-details-bank-details") return "bank-details";
  if (currentPath.endsWith("/marketing") || route.name === "client-details-marketing") return "marketing";
  if (currentPath.endsWith("/notifications") || route.name === "client-details-notifications") return "notifications";
  if (currentPath.includes("/audit-logs") || route.name === "client-details-audit-logs" || route.name === "client-details-audit-log-detail") return "audit-logs";
  if (currentPath.endsWith("/trading") || route.name === "client-details-trading") return "trading";
  if (currentPath.endsWith("/crm") || route.name === "client-details-crm") return "crm";
  return "overview";
});

// ─── Global Tab Refresh Action (Tab-Specific) ──────────────────────────────────
const isManualRefreshing = ref(false);

const isGlobalRefreshing = computed(() => {
  if (isManualRefreshing.value) return true;
  if (currentActiveTab.value === "overview") {
    return clientDepthStore.isLoading;
  }
  if (currentActiveTab.value === "profile") {
    return clientDepthStore.kycLoading || clientDepthStore.userReferencesLoading;
  }
  if (currentActiveTab.value === "financials") {
    return clientDepthStore.userChartsLoading || clientDepthStore.accountDetailsLoading;
  }
  if (currentActiveTab.value === "notifications") {
    return clientDepthStore.clientNotificationsLoading;
  }
  if (currentActiveTab.value === "audit-logs") {
    return enhancedAuditLogsStore.loading;
  }
  return false;
});

const handleGlobalRefresh = async () => {
  const userId = route.params.id || user.value?.id;
  if (!userId) return;
  const activeTab = currentActiveTab.value;
  isManualRefreshing.value = true;
  try {
    // Notify active child component via scoped event
    window.dispatchEvent(
      new CustomEvent("refresh-client-tab-data", {
        detail: { tab: activeTab, userId },
      })
    );

    // Call only the API relevant to the active tab
    if (activeTab === "overview") {
      await clientDepthStore.fetchClientOverview(userId, true);
    } else if (activeTab === "profile") {
      await Promise.allSettled([
        clientDepthStore.fetchClientKyc(userId, true),
        clientDepthStore.fetchUserReferences(userId, true),
        clientDepthStore.fetchClientOverview(userId, true),
      ]);
    } else if (activeTab === "financials") {
      await Promise.allSettled([
        clientDepthStore.fetchUserCharts(userId, {}, true),
        clientDepthStore.fetchAccountDetails(userId, {}, true),
      ]);
    } else if (activeTab === "notifications") {
      await clientDepthStore.fetchClientNotifications(userId, {}, true);
    } else if (activeTab === "audit-logs") {
      await enhancedAuditLogsStore.fetchUserAuditLogs(userId, 1, enhancedAuditLogsStore.pagination.per_page, true);
    }

    const tabLabel = tabs.value.find((t) => t.key === activeTab)?.label || "Tab";
    snackbar.show(`${tabLabel} refreshed successfully!`, "success");
  } catch (err) {
    console.error("Refresh tab data error:", err);
  } finally {
    isManualRefreshing.value = false;
  }
};

// ─── Top Tabs ─────────────────────────────────────────────────────────────────
const tabs = computed(() => {
  const list = [
    {
      key: "overview",
      label: "Overview",
      to: `/client/details/${route.params.id}`,
      icon: Activity,
    },
    {
      key: "profile",
      label: "Profile & KYC",
      to: `/client/details/${route.params.id}/profile`,
      icon: FileCheck,
    },
    {
      key: "financials",
      label: "Financials",
      to: `/client/details/${route.params.id}/financials`,
      icon: CreditCard,
    },
    {
      key: "bank-details",
      label: "Bank Details",
      to: `/client/details/${route.params.id}/bank-details`,
      icon: Landmark,
    },
    // {
    //   key: "trading",
    //   label: "Trading",
    //   to: `/client/details/${route.params.id}/trading`,
    //   icon: BarChart2,
    // },
    // {
    //   key: "crm",
    //   label: "CRM & Support",
    //   to: `/client/details/${route.params.id}/crm`,
    //   icon: Headphones,
    // },
    {
      key: "marketing",
      label: "Marketing",
      to: `/client/details/${route.params.id}/marketing`,
      icon: Megaphone,
    },
    // {
    //   key: "notifications",
    //   label: "Notifications",
    //   to: `/client/details/${route.params.id}/notifications`,
    //   icon: Bell,
    // },
  ];

  if (hasPermission(["audit.view", "audit"])) {
    list.push({
      key: "audit-logs",
      label: "Audit Log",
      to: `/client/details/${route.params.id}/audit-logs`,
      icon: ClipboardList,
    });
  }

  return list;
});

const isTabActive = (tab) => {
  const currentPath = route.path.replace(/\/$/, "");
  const targetPath = tab.to.replace(/\/$/, "");
  if (tab.key === "overview") {
    return (
      currentPath === targetPath ||
      route.name === "client-details" ||
      route.name === "client-details-overview"
    );
  }
  return currentPath === targetPath || currentPath.startsWith(targetPath);
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const expanded = ref({
  personal: true,
  info: false,
  address: false,
  other: false,
});

function toggleSection(key) {
  expanded.value[key] = !expanded.value[key];
}

const clientAccounts = computed(() => {
  // 1. Array of objects in user.value.accounts
  if (Array.isArray(user.value.accounts) && user.value.accounts.length > 0) {
    return user.value.accounts;
  }
  // 2. Overview data from store
  if (
    Array.isArray(clientDepthStore.overviewData?.user?.accounts) &&
    clientDepthStore.overviewData.user.accounts.length > 0
  ) {
    return clientDepthStore.overviewData.user.accounts;
  }
  if (
    Array.isArray(clientDepthStore.overviewData?.accounts) &&
    clientDepthStore.overviewData.accounts.length > 0
  ) {
    return clientDepthStore.overviewData.accounts;
  }
  // 3. Array of account numbers in user.value.account_numbers
  if (
    Array.isArray(user.value.account_numbers) &&
    user.value.account_numbers.length > 0
  ) {
    const accTypes = user.value.account_types || [];
    return user.value.account_numbers.map((num, idx) => {
      if (typeof num === "object" && num !== null) return num;
      return {
        account_number: num,
        account_type: accTypes[idx] || null,
      };
    });
  }
  // 4. Single account number
  if (user.value.account_number) {
    return [
      {
        account_number: user.value.account_number,
        account_type: user.value.account_type || null,
      },
    ];
  }
  return [];
});

const accountTypesList = computed(() => {
  if (Array.isArray(user.value.accounts) && user.value.accounts.length > 0) {
    return [
      ...new Set(
        user.value.accounts
          .map((a) => a.account_type || a.type)
          .filter(Boolean)
      ),
    ];
  }
  if (Array.isArray(user.value.account_types) && user.value.account_types.length > 0) {
    return [...new Set(user.value.account_types.filter(Boolean))];
  }
  if (user.value.account_type) {
    return [user.value.account_type];
  }
  return [];
});

const sidebarSections = computed(() => [
  {
    key: "personal",
    label: "Personal Details",
    icon: User,
    isInfo: true,
    fields: [
      { label: "Name", value: () => user.value.name },
      { label: "Email", value: () => user.value.email },
      { label: "Phone", value: () => user.value.phone_number || user.value.phone },
      { label: "DOB", value: () => user.value.date_of_birth || user.value.dob },
      { label: "Country", value: () => user.value.country },
      { label: "Role", value: () => user.value.role },
      { label: "State", value: () => user.value.state },
      {
        label: "Staff Assigned",
        value: () =>
          user.value.staff_assigned?.name ||
          (typeof user.value.staff_assigned === "string" ? user.value.staff_assigned : null) ||
          user.value.assigned_staff?.name ||
          null,
      },
      {
        label: "Lead ID",
        value: () => (user.value.lead_id ? `#${user.value.lead_id}` : null),
      },
      {
        label: "Client ID",
        value: () => (user.value.id ? `#${user.value.id}` : null),
      },
    ],
  },
  {
    key: "info",
    label: "Personal Info",
    icon: Info,
    isInfo: true,
    fields: [
      { label: "KYC Status", value: () => kycStatus.value || user.value.kyc_status },
      { label: "KYC Verified At", value: () => user.value.kyc_verified_at },
      {
        label: "KYC Reject Reason",
        value: () =>
          clientDepthStore.kycData?.kyc_reject_reason ||
          user.value.kyc_reject_reason,
      },
      {
        label: "Verification Channel",
        value: () => user.value.verification_channel,
      },
      {
        label: "Docs Uploaded",
        value: () =>
          clientDepthStore.kycData?.docs_uploaded != null
            ? String(clientDepthStore.kycData.docs_uploaded)
            : (user.value.docs_uploaded != null ? String(user.value.docs_uploaded) : null),
      },
      {
        label: "Doc Approved",
        value: () =>
          clientDepthStore.kycData?.doc_approved ||
          user.value.doc_approved,
      },
      {
        label: "Sumsub Applicant ID",
        value: () => user.value.sumsub_applicant_id,
      },
    ],
  },
  {
    key: "address",
    label: "Address",
    icon: MapPin,
    isInfo: true,
    fields: [
      { label: "Address", value: () => user.value.address || user.value.residential_address },
      { label: "City", value: () => user.value.city },
      { label: "State", value: () => user.value.state },
      { label: "Country", value: () => user.value.country },
      { label: "Zip Code", value: () => user.value.zip_code || user.value.postal_code || user.value.zip },
    ],
  },
  {
    key: "other",
    label: "Other",
    icon: MoreHorizontal,
    isInfo: true,
    fields: [
      { label: "IB Name", value: () => user.value.ib_name || user.value.ib?.name },
      { label: "IB Email", value: () => user.value.ib_email || user.value.ib?.email },
      { label: "IB Referral Code", value: () => user.value.ib_referral_code || user.value.ib_id },
      { label: "Tracking ID", value: () => user.value.tracking_id },
      {
        label: "Referral Link",
        value: () => user.value.referral_link_name || user.value.referral_link_code,
      },
      {
        label: "Account Numbers",
        isAccounts: true,
        value: () => {
          if (clientAccounts.value.length > 0) {
            return clientAccounts.value
              .map((a) => a.account_number || a.login || a.id || a)
              .filter(Boolean)
              .join(", ");
          }
          return null;
        },
      },
      {
        label: "Account Types",
        isAccountTypes: true,
        value: () => accountTypesList.value.join(", "),
      },
      {
        label: "Total Accounts",
        value: () => {
          if (user.value.total_accounts != null) return String(user.value.total_accounts);
          if (clientAccounts.value.length > 0) return String(clientAccounts.value.length);
          if (Array.isArray(user.value.accounts)) return String(user.value.accounts.length);
          return null;
        },
      },
      {
        label: "Is IB",
        value: () =>
          user.value.is_ib != null ? (user.value.is_ib ? "Yes" : "No") : null,
      },
      { label: "Created At", value: () => user.value.created_at },
      { label: "Updated At", value: () => user.value.updated_at },
    ],
  },
]);
</script>
