<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
  X,
  RefreshCw,
  Search,
  Users,
  ShieldCheck,
  Briefcase,
  Network,
  Globe,
  Monitor,
  Clock,
  Copy,
  Check,
} from "lucide-vue-next";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { formatDate } from "@/utils/timeFormatter";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  initialRole: {
    type: String,
    default: "client",
  },
});

const emit = defineEmits(["close"]);

const snackbar = useSnackbarStore();

const activeRole = ref("client");
const searchInput = ref("");
const isLoading = ref(false);
const users = ref([]);
const copiedId = ref(null);

const pagination = ref({
  page: 1,
  per_page: 10,
  total_pages: 1,
  total: 0,
});

const perPageOptions = [
  { label: "10 ", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const rolesList = [
  { id: "", label: "All Users", icon: Users, color: "text-primary" },
  { id: "client", label: "Clients", icon: Users, color: "text-emerald-500" },
  { id: "fm", label: "Fund Managers", icon: Briefcase, color: "text-sky-500" },
  { id: "ib", label: "IB Partners", icon: Network, color: "text-amber-500" },
  { id: "admin", label: "Admins", icon: ShieldCheck, color: "text-purple-500" },
];

const currentRoleConfig = computed(() => {
  return rolesList.find((r) => r.id === activeRole.value) || rolesList[0];
});

const filteredUsers = computed(() => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return users.value;

  return users.value.filter((u) => {
    const name = String(u.name || "").toLowerCase();
    const email = String(u.email || "").toLowerCase();
    const id = String(u.user_id || "").toLowerCase();
    const ip = String(u.ip_address || "").toLowerCase();
    const role = String(u.role || "").toLowerCase();

    return (
      name.includes(q) ||
      email.includes(q) ||
      id.includes(q) ||
      ip.includes(q) ||
      role.includes(q)
    );
  });
});

const fetchLiveUsers = (page = 1) => {
  isLoading.value = true;

  const params = {
    page,
    per_page: pagination.value.per_page,
  };

  // If role is set (client, ib, fm, admin), include it. If empty string, role= (all roles)
  if (activeRole.value !== undefined && activeRole.value !== null) {
    params.role = activeRole.value;
  }

  const successHandler = (res) => {
    isLoading.value = false;
    const resData = res?.data || res || {};

    users.value = Array.isArray(resData.users) ? resData.users : [];
    pagination.value = {
      page: resData.page || page,
      per_page: resData.per_page || pagination.value.per_page,
      total_pages: resData.pages || 1,
      total: resData.total ?? users.value.length,
    };
  };

  const failureHandler = (err) => {
    isLoading.value = false;
    snackbar.show(err?.message || "Failed to fetch live users list", "error");
  };

  apiRequest(urls.KEYS.GET, urls.dashboard.liveUsers, {
    params,
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
  });
};

const handleRoleSelect = (roleId) => {
  if (activeRole.value === roleId) return;
  activeRole.value = roleId;
  pagination.value.page = 1;
  fetchLiveUsers(1);
};

const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > pagination.value.total_pages) return;
  pagination.value.page = newPage;
  fetchLiveUsers(newPage);
};

const handlePerPageChange = (val) => {
  pagination.value.per_page = Number(val);
  pagination.value.page = 1;
  fetchLiveUsers(1);
};

const copyText = (text, id) => {
  if (!text) return;
  navigator.clipboard.writeText(String(text));
  copiedId.value = id;
  setTimeout(() => {
    if (copiedId.value === id) copiedId.value = null;
  }, 2000);
};

const getRoleBadgeClass = (role) => {
  const r = String(role || "").toLowerCase();
  switch (r) {
    case "client":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "fm":
      return "bg-sky-500/10 text-sky-500 border-sky-500/20";
    case "ib":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "admin":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
};

const getInitials = (name, email) => {
  const str = (name || email || "U").trim();
  const parts = str.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return str.slice(0, 2).toUpperCase();
};

const handleKeydown = (e) => {
  if (e.key === "Escape" && props.open) {
    emit("close");
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      activeRole.value = props.initialRole ?? "client";
      searchInput.value = "";
      pagination.value.page = 1;
      fetchLiveUsers(1);
      window.addEventListener("keydown", handleKeydown);
    } else {
      window.removeEventListener("keydown", handleKeydown);
    }
  },
);

watch(
  () => props.initialRole,
  (newRole) => {
    if (props.open && newRole !== undefined && newRole !== activeRole.value) {
      activeRole.value = newRole;
      pagination.value.page = 1;
      fetchLiveUsers(1);
    }
  },
);

onMounted(() => {
  if (props.open) {
    window.addEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div>
      <!-- Backdrop Overlay -->
      <Transition name="backdrop">
        <div
          v-if="open"
          class="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs cursor-pointer"
          @click="emit('close')"
        />
      </Transition>

      <!-- Side Panel Drawer -->
      <Transition name="drawer">
        <div
          v-if="open"
          class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Drawer Header -->
          <div
            class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-background/60"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
                :class="currentRoleConfig.color"
              >
                <component :is="currentRoleConfig.icon" class="w-5 h-5" />
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h2 class="text-sm font-bold text-primary-text truncate">
                    {{ currentRoleConfig.label }}
                  </h2>
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                    />
                    LIVE
                  </span>
                  <span
                    class="text-xs font-mono font-bold text-secondary-text bg-background px-2 py-0.5 rounded-md border border-primary-border"
                  >
                    {{ pagination.total }} active
                  </span>
                </div>
                <p class="text-xs text-secondary-text mt-0.5 truncate">
                  Real-time active users currently connected to the platform
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer border border-primary-border/60"
                :class="{ 'animate-spin': isLoading }"
                @click="fetchLiveUsers(pagination.page)"
                title="Refresh List"
              >
                <RefreshCw class="w-4 h-4" />
              </button>

              <button
                type="button"
                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer border border-primary-border/60"
                @click="emit('close')"
                title="Close"
              >
                <X class="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          <!-- Role Filter Tabs & Search Bar -->
          <div
            class="px-6 py-3 border-b border-primary-border/60 bg-background/40 space-y-3 shrink-0"
          >
            <!-- Filter Pills -->
            <div
              class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
            >
              <button
                v-for="roleItem in rolesList"
                :key="roleItem.id"
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border"
                :class="
                  activeRole === roleItem.id
                    ? 'bg-primary text-background border-primary shadow-xs'
                    : 'bg-card-background text-secondary-text border-primary-border hover:text-primary-text hover:border-primary/40'
                "
                @click="handleRoleSelect(roleItem.id)"
              >
                <component :is="roleItem.icon" class="w-3.5 h-3.5" />
                <span>{{ roleItem.label }}</span>
              </button>
            </div>

            <!-- Search + Per Page Selector -->
            <div class="flex items-center gap-3">
              <div class="relative flex-1">
                <Search
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text pointer-events-none"
                />
                <input
                  v-model="searchInput"
                  type="text"
                  placeholder="Search by name, email, user ID, IP address..."
                  class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-card-background border border-primary-border text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-primary transition-colors font-medium"
                />
              </div>

              <div class="w-32 shrink-0">
                <BaseSelect
                  :modelValue="pagination.per_page"
                  :options="perPageOptions"
                  placeholder="Per page"
                  @update:modelValue="handlePerPageChange"
                />
              </div>
            </div>
          </div>

          <!-- Drawer Content: User List -->
          <div class="flex-1 overflow-y-auto p-6 space-y-3">
            <!-- Loading State -->
            <template v-if="isLoading">
              <div
                v-for="n in 6"
                :key="n"
                class="p-4 rounded-xl border border-primary-border/60 bg-background/40 animate-pulse flex items-center justify-between gap-4"
              >
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-10 h-10 rounded-full bg-primary-border" />
                  <div class="space-y-2 flex-1 max-w-xs">
                    <div class="h-3.5 bg-primary-border rounded w-3/4" />
                    <div class="h-2.5 bg-primary-border rounded w-1/2" />
                  </div>
                </div>
                <div class="h-6 w-20 bg-primary-border rounded-md" />
              </div>
            </template>

            <!-- Empty State -->
            <template v-else-if="filteredUsers.length === 0">
              <div
                class="py-16 px-4 text-center flex flex-col items-center justify-center max-w-sm mx-auto space-y-3 text-secondary-text"
              >
                <div
                  class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"
                >
                  <Users class="w-6 h-6 opacity-60" />
                </div>
                <p class="text-sm font-bold text-primary-text">
                  No active live users found
                </p>
                <p class="text-xs">
                  {{
                    searchInput
                      ? `No active users matched your search "${searchInput}".`
                      : "There are currently no connected sessions for this user type."
                  }}
                </p>
                <button
                  type="button"
                  class="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                  @click="fetchLiveUsers(1)"
                >
                  Refresh Status
                </button>
              </div>
            </template>

            <!-- Users List Cards -->
            <template v-else>
              <div
                v-for="user in filteredUsers"
                :key="user.user_id"
                class="group p-4 rounded-xl border border-primary-border/60 bg-background/40 hover:bg-background/80 hover:border-primary/40 transition-all duration-150 space-y-3"
              >
                <!-- Top Row: Avatar + Name + Email + Role Badge -->
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <!-- Avatar with Pulse Dot -->
                    <div class="relative shrink-0">
                      <div
                        class="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs"
                      >
                        {{ getInitials(user.name, user.email) }}
                      </div>
                      <span
                        class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card-background animate-pulse"
                        title="Online"
                      />
                    </div>

                    <!-- User Name & Email -->
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <p
                          class="text-sm font-bold text-primary-text truncate"
                          :title="user.name"
                        >
                          {{ user.name || "Unnamed User" }}
                        </p>
                        <span
                          class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-background text-secondary-text border border-primary-border shrink-0 select-all"
                        >
                          #{{ user.user_id }}
                        </span>
                      </div>

                      <div
                        class="flex items-center gap-1.5 text-xs text-secondary-text mt-0.5"
                      >
                        <span class="truncate" :title="user.email">{{
                          user.email || "No email"
                        }}</span>
                        <button
                          v-if="user.email"
                          type="button"
                          class="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity cursor-pointer p-0.5"
                          @click="copyText(user.email, `email-${user.user_id}`)"
                          title="Copy Email"
                        >
                          <Check
                            v-if="copiedId === `email-${user.user_id}`"
                            class="w-3 h-3 text-emerald-500"
                          />
                          <Copy v-else class="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Role Badge -->
                  <div class="shrink-0 flex flex-col items-end gap-1">
                    <span
                      class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                      :class="getRoleBadgeClass(user.role)"
                    >
                      {{ user.role || "User" }}
                    </span>

                    <span
                      v-if="user.active_sessions"
                      class="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary-text"
                    >
                      <Monitor class="w-3 h-3 opacity-60" />
                      {{ user.active_sessions }}
                      {{ user.active_sessions === 1 ? "session" : "sessions" }}
                    </span>
                  </div>
                </div>

                <!-- Bottom Meta Row: IP Address & Last Seen -->
                <div
                  class="pt-2 border-t border-primary-border/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-secondary-text font-medium"
                >
                  <!-- IP Address -->
                  <div class="flex items-center gap-1.5 truncate">
                    <Globe class="w-3.5 h-3.5 opacity-60 shrink-0" />
                    <span
                      class="font-mono text-primary-text select-all truncate"
                    >
                      {{ user.ip_address || "—" }}
                    </span>
                    <button
                      v-if="user.ip_address"
                      type="button"
                      class="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity cursor-pointer p-0.5"
                      @click="copyText(user.ip_address, `ip-${user.user_id}`)"
                      title="Copy IP"
                    >
                      <Check
                        v-if="copiedId === `ip-${user.user_id}`"
                        class="w-3 h-3 text-emerald-500"
                      />
                      <Copy v-else class="w-3 h-3" />
                    </button>
                  </div>

                  <!-- Last Seen -->
                  <div
                    class="flex items-center gap-1.5 sm:justify-end truncate"
                  >
                    <Clock class="w-3.5 h-3.5 opacity-60 shrink-0" />
                    <span
                      class="text-secondary-text truncate"
                      :title="user.last_seen"
                    >
                      {{ formatDate(user.last_seen) }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Drawer Footer with Pagination -->
          <div
            v-if="pagination.total_pages > 1 || pagination.total > 0"
            class="px-6 py-3 border-t border-primary-border/60 bg-background/60 flex items-center justify-between gap-3 shrink-0"
          >
            <p class="text-xs text-secondary-text">
              Showing
              <span class="font-bold text-primary-text">
                {{
                  Math.min(
                    (pagination.page - 1) * pagination.per_page + 1,
                    pagination.total,
                  )
                }}
              </span>
              to
              <span class="font-bold text-primary-text">
                {{
                  Math.min(
                    pagination.page * pagination.per_page,
                    pagination.total,
                  )
                }}
              </span>
              of
              <span class="font-bold text-primary-text">{{
                pagination.total
              }}</span>
              users
            </p>

            <!-- Page Buttons -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="px-2.5 py-1 text-xs rounded-lg border border-primary-border bg-card-background text-secondary-text hover:text-primary-text hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
                :disabled="pagination.page <= 1 || isLoading"
                @click="handlePageChange(pagination.page - 1)"
              >
                Previous
              </button>

              <span class="px-2 text-xs font-mono font-bold text-primary-text">
                {{ pagination.page }} / {{ pagination.total_pages }}
              </span>

              <button
                type="button"
                class="px-2.5 py-1 text-xs rounded-lg border border-primary-border bg-card-background text-secondary-text hover:text-primary-text hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
                :disabled="
                  pagination.page >= pagination.total_pages || isLoading
                "
                @click="handlePageChange(pagination.page + 1)"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
