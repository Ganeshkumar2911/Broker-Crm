<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Sticky Header -->
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background/95 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <HugeIcon :icon="UserAdd01Icon" :size="20" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-primary-text flex items-center gap-2">
                <span>Enroll Trading Account</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  New Member
                </span>
              </h3>
              <p class="text-[11px] text-secondary-text">
                Opt-in live client trading account into loyalty rewards
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="$emit('close')"
          >
            <HugeIcon :icon="Cancel01Icon" :size="18" />
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form id="enroll-form" class="flex-1 overflow-y-auto px-6 py-5 space-y-4.5 text-xs" @submit.prevent="handleSubmit">
          
          <!-- STEP 1: Program Selection Card -->
          <div class="p-4 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                  1
                </div>
                <span class="text-[11px] font-bold tracking-wide text-primary-text">
                  Loyalty Program
                </span>
              </div>
              <span
                v-if="selectedProgram"
                class="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase font-mono"
                :class="selectedProgram.status === 'active' ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-background text-secondary-text border border-primary-border'"
              >
                {{ selectedProgram.status || 'Active' }}
              </span>
            </div>

            <div class="space-y-1">
              <label class="text-[11px] font-medium text-secondary-text">Target Program</label>
              <BaseSelect
                v-model="form.program_id"
                :options="programOptions"
                placeholder="Select Loyalty Program..."
                searchable
                class="w-full"
              />
            </div>

            <!-- Program Policy Chips -->
            <div v-if="selectedProgram" class="pt-2 border-t border-primary-border/60 flex flex-wrap gap-1.5 text-[10px]">
              <span
                v-if="isExcludeCopyAccounts"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20 font-medium"
              >
                <HugeIcon :icon="ShieldAlertIcon" :size="12" class="shrink-0" />
                Copy Trading Accounts Excluded
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-green/10 text-primary-green border border-primary-green/20 font-medium"
              >
                <HugeIcon :icon="CheckmarkCircle02Icon" :size="12" class="shrink-0" />
                Copy Accounts Allowed
              </span>

              <span
                v-if="isRequireKyc"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-blue/10 text-primary-blue border border-primary-blue/20 font-medium"
              >
                <HugeIcon :icon="ShieldCheckIcon" :size="12" class="shrink-0" />
                KYC Required
              </span>

              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-primary-border text-secondary-text font-mono">
                Scope: {{ selectedProgram.account_scope === 'all_eligible_accounts' ? 'All Accounts' : '1 Per User' }}
              </span>
            </div>
          </div>

          <!-- STEP 2: Client Search Selection Card -->
          <div class="p-4 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                  2
                </div>
                <span class="text-[11px] font-bold tracking-wide text-primary-text">
                  Client Selection
                </span>
              </div>
              <button
                v-if="selectedClient"
                type="button"
                class="text-[10px] font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
                @click="resetSelectedClient"
              >
                Change Client
              </button>
            </div>

            <!-- Client Selected Info Card -->
            <div
              v-if="selectedClient"
              class="p-3 rounded-xl bg-background/70 border border-primary-border space-y-2.5"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {{ (selectedClient.name || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-primary-text truncate text-xs">{{ selectedClient.name }}</p>
                    <p class="text-[10px] text-secondary-text font-mono">User ID: #{{ selectedClient.id }}</p>
                  </div>
                </div>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase shrink-0"
                  :class="selectedClient.kyc_status === 'approved' ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' : 'bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20'"
                >
                  KYC: {{ selectedClient.kyc_status || 'Pending' }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-primary-border/60 text-secondary-text">
                <div class="flex items-center gap-1.5 truncate">
                  <HugeIcon :icon="Mail01Icon" :size="12" class="shrink-0 text-secondary-text/60" />
                  <span class="truncate">{{ selectedClient.email || 'No email' }}</span>
                </div>
                <div class="flex items-center gap-1.5 truncate">
                  <HugeIcon :icon="Call02Icon" :size="12" class="shrink-0 text-secondary-text/60" />
                  <span class="truncate">{{ selectedClient.phone_number || '—' }}</span>
                </div>
                <div v-if="selectedClient.country || selectedClient.city" class="flex items-center gap-1.5 truncate col-span-2">
                  <HugeIcon :icon="Globe02Icon" :size="12" class="shrink-0 text-secondary-text/60" />
                  <span class="truncate">{{ [selectedClient.city, selectedClient.country].filter(Boolean).join(', ') }}</span>
                </div>
              </div>
            </div>

            <!-- Client Search Selector (when no client is selected or re-searching) -->
            <div v-else class="space-y-1.5">
              <label class="text-[11px] font-medium text-secondary-text">Search Client</label>
              <BaseSelect
                v-model="form.user_id"
                :options="clientOptions"
                :isLoading="isSearchingClients"
                placeholder="Type name, email or client ID..."
                searchable
                class="w-full"
                @search="handleClientSearch"
              />
              <p class="text-[10px] text-secondary-text flex items-center gap-1">
                <HugeIcon :icon="Search01Icon" :size="12" class="shrink-0" />
                Type at least 2 characters to search clients in real-time
              </p>
            </div>
          </div>

          <!-- STEP 3: Trading Account Selection Card -->
          <div class="p-4 rounded-2xl bg-card-background border border-primary-border shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                  3
                </div>
                <span class="text-[11px] font-bold tracking-wide text-primary-text">
                  Live Trading Account
                </span>
              </div>
              <span v-if="form.user_id && selectedClient" class="text-[10px] font-mono text-secondary-text">
                {{ accountOptions.length }} eligible account{{ accountOptions.length === 1 ? '' : 's' }}
              </span>
            </div>

            <!-- Disabled Prompt if no client selected -->
            <div
              v-if="!form.user_id"
              class="p-3 rounded-xl bg-background/50 border border-dashed border-primary-border text-center text-secondary-text space-y-1"
            >
              <p class="text-[11px] font-medium text-primary-text">Select Client First</p>
              <p class="text-[10px]">Please search and pick a client in Step 2 to view their trading accounts</p>
            </div>

            <!-- Account Selector & Details when client is selected -->
            <template v-else>
              <div class="space-y-1">
                <label class="text-[11px] font-medium text-secondary-text">Select Account</label>
                <BaseSelect
                  v-model="form.trading_account_id"
                  :options="accountOptions"
                  :disabled="accountOptions.length === 0"
                  :placeholder="accountOptions.length === 0 ? 'No eligible accounts available' : 'Select trading account...'"
                  searchable
                  class="w-full"
                />
              </div>

              <!-- Selected Account Detail Preview -->
              <div
                v-if="selectedAccount"
                class="p-3 rounded-xl bg-background/70 border border-primary-border space-y-2"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 font-mono">
                    <HugeIcon :icon="CreditCardIcon" :size="15" class="text-primary" />
                    <span class="font-bold text-primary-text text-xs">#{{ selectedAccount.account_number }}</span>
                    <span class="text-[10px] text-secondary-text">(ID: {{ selectedAccount.id }})</span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-primary/10 text-primary border border-primary/20">
                    {{ selectedAccount.account_type || 'LIVE' }}
                  </span>
                </div>

                <!-- Restrictions Status -->
                <div class="flex flex-wrap gap-1.5 text-[10px] pt-1">
                  <span
                    v-if="!selectedAccount.restrict_deposit && !selectedAccount.restrict_withdrawal && !selectedAccount.restrict_internal_transfer"
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary-green/10 text-primary-green border border-primary-green/20"
                  >
                    <HugeIcon :icon="CheckmarkCircle02Icon" :size="12" />
                    No Restrictions (Active)
                  </span>
                  <template v-else>
                    <span
                      v-if="selectedAccount.restrict_deposit"
                      class="px-2 py-0.5 rounded bg-primary-red/10 text-primary-red border border-primary-red/20 font-medium"
                    >
                      Deposit Restricted
                    </span>
                    <span
                      v-if="selectedAccount.restrict_withdrawal"
                      class="px-2 py-0.5 rounded bg-primary-red/10 text-primary-red border border-primary-red/20 font-medium"
                    >
                      Withdrawal Restricted
                    </span>
                    <span
                      v-if="selectedAccount.restrict_internal_transfer"
                      class="px-2 py-0.5 rounded bg-primary-red/10 text-primary-red border border-primary-red/20 font-medium"
                    >
                      Transfer Restricted
                    </span>
                  </template>
                </div>
              </div>

              <!-- Warning if no eligible accounts -->
              <div
                v-if="selectedClient && accountOptions.length === 0"
                class="p-3 rounded-xl bg-primary-yellow/10 border border-primary-yellow/20 text-primary-yellow text-[11px] flex items-start gap-2.5"
              >
                <HugeIcon :icon="Alert02Icon" :size="16" class="shrink-0 mt-0.5" />
                <div class="space-y-0.5">
                  <p class="font-semibold">No eligible live trading accounts found</p>
                  <p class="text-[10px] text-secondary-text">
                    This client has {{ selectedClient.accounts?.length || 0 }} account(s), but demo accounts
                    <span v-if="isExcludeCopyAccounts">and copy trading accounts</span> are excluded by policy.
                  </p>
                </div>
              </div>
            </template>
          </div>

          <!-- STEP 4: Ready to Enroll Confirmation Card -->
          <div
            v-if="form.user_id && form.trading_account_id && form.program_id"
            class="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3"
          >
            <div class="flex items-center justify-between border-b border-primary/10 pb-2">
              <span class="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
                <HugeIcon :icon="SparklesIcon" :size="14" />
                Enrollment Ready
              </span>
              <span class="text-[10px] font-mono text-primary font-bold">Step 4 / 4</span>
            </div>

            <div class="space-y-1.5 text-[11px]">
              <div class="flex items-center justify-between">
                <span class="text-secondary-text">Program:</span>
                <span class="font-semibold text-primary-text font-mono">{{ selectedProgram?.name || form.program_id }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-secondary-text">Client:</span>
                <span class="font-semibold text-primary-text">{{ selectedClient?.name }} (#{{ form.user_id }})</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-secondary-text">Trading Account:</span>
                <span class="font-mono font-bold text-primary">#{{ selectedAccount?.account_number }} (ID: {{ form.trading_account_id }})</span>
              </div>
            </div>
          </div>

          <!-- Eligibility Policy Notes -->
          <div
            v-else
            class="p-3.5 rounded-2xl bg-background/40 border border-primary-border/60 text-secondary-text text-[11px] flex items-start gap-2.5"
          >
            <HugeIcon :icon="ShieldCheckIcon" :size="16" class="text-primary shrink-0 mt-0.5" />
            <div class="space-y-1">
              <p class="font-semibold text-primary-text text-[11px]">Enrollment Policy Rules</p>
              <ul class="space-y-0.5 list-disc list-inside text-[10px] text-secondary-text">
                <li>Only live real trading accounts are eligible (Cent/Demo excluded).</li>
                <li v-if="isExcludeCopyAccounts">Copy trading accounts are excluded for this program.</li>
                <li>Points are earned on closed trades based on standard lots traded.</li>
              </ul>
            </div>
          </div>
        </form>

        <!-- Sticky Footer -->
        <div class="px-6 py-4 border-t border-primary-border flex items-center gap-3 bg-card-background shrink-0">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 rounded-xl border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background font-medium transition cursor-pointer text-xs"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="enroll-form"
            :disabled="store.actionLoading || !form.user_id || !form.trading_account_id || !form.program_id"
            class="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="16" class="animate-spin" />
            <span>{{ store.actionLoading ? 'Enrolling...' : 'Enroll Account' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import {
  UserAdd01Icon,
  Cancel01Icon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  CreditCardIcon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  Mail01Icon,
  Call02Icon,
  Globe02Icon,
  Search01Icon,
  SparklesIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { useLoyaltyStore } from "@/stores/loyalty/loyalty";
import apiRequest from "@/api/request";
import urls from "@/api/urls";

const props = defineProps({
  open: { type: Boolean, default: false },
  programId: { type: [Number, String], default: null },
});

const emit = defineEmits(["close", "enrolled"]);
const store = useLoyaltyStore();

const form = reactive({
  program_id: null,
  user_id: null,
  trading_account_id: null,
});

// Clients search & cache
const clientsMap = ref(new Map());
const clientList = ref([]);
const isSearchingClients = ref(false);
let clientSearchTimer = null;

// ─── Programs Computed ──────────────────────────────────
const programOptions = computed(() => {
  const list =
    Array.isArray(store.programsList) && store.programsList.length > 0
      ? store.programsList
      : store.program
        ? [store.program]
        : [];

  return list.map((prog) => ({
    label: `${prog.name || "Unnamed Program"} (${(prog.status || "active").toUpperCase()}) · #${prog.id}`,
    value: prog.id,
    program: prog,
  }));
});

const selectedProgram = computed(() => {
  if (!form.program_id) return store.program || null;
  const found = store.programsList?.find((p) => p.id === form.program_id);
  return found || store.program || null;
});

const isExcludeCopyAccounts = computed(() => {
  const prog = selectedProgram.value;
  if (!prog) return false;
  return Boolean(
    prog.eligibility_rules?.exclude_copy_accounts ?? prog.exclude_copy_accounts,
  );
});

const isRequireKyc = computed(() => {
  const prog = selectedProgram.value;
  if (!prog) return false;
  return Boolean(prog.eligibility_rules?.require_kyc ?? prog.require_kyc);
});

// ─── Clients Computed & Search ─────────────────────────
const clientOptions = computed(() => {
  return clientList.value.map((c) => ({
    label: `${c.name || "Unnamed"} (${c.email || "No email"}) · User #${c.id}`,
    value: c.id,
    email: c.email,
    client: c,
  }));
});

const selectedClient = computed(() => {
  if (!form.user_id) return null;
  return clientsMap.value.get(form.user_id) || null;
});

const resetSelectedClient = () => {
  form.user_id = null;
  form.trading_account_id = null;
  clientList.value = [];
};

// ONLY fetch clients when user types into the search input (not by default)
const fetchClients = async (searchQuery = "") => {
  const q = (searchQuery || "").trim();
  if (!q) {
    return;
  }

  isSearchingClients.value = true;
  try {
    const res = await apiRequest(urls.KEYS.GET, urls.clientList.list, {
      params: {
        page: 1,
        per_page: 20,
        search: q,
      },
      isTokenRequired: true,
    });
    const items = Array.isArray(res?.data) ? res.data : [];
    clientList.value = items;
    items.forEach((c) => {
      if (c && c.id) {
        clientsMap.value.set(c.id, c);
      }
    });
  } catch (err) {
    console.error("Failed to fetch clients on search:", err);
  } finally {
    isSearchingClients.value = false;
  }
};

const handleClientSearch = (query) => {
  clearTimeout(clientSearchTimer);
  const q = (query || "").trim();
  if (!q) {
    return;
  }

  isSearchingClients.value = true;
  clientSearchTimer = setTimeout(() => {
    fetchClients(q);
  }, 350);
};

// ─── Trading Accounts Computed ─────────────────────────
const eligibleAccounts = computed(() => {
  if (!selectedClient.value || !Array.isArray(selectedClient.value.accounts)) {
    return [];
  }

  return selectedClient.value.accounts.filter((acc) => {
    const type = (acc.account_type || "").toLowerCase();

    // 1. Ignore all demo accounts
    if (type === "demo") return false;

    // 2. Ignore copy accounts if program excludes copy accounts
    if (
      isExcludeCopyAccounts.value &&
      (type === "copy_trading" || type === "copy")
    ) {
      return false;
    }

    return true;
  });
});

const accountOptions = computed(() => {
  return eligibleAccounts.value.map((acc) => {
    const typeStr = (acc.account_type || "live").toUpperCase();
    return {
      label: `#${acc.account_number} · ${typeStr} (ID: ${acc.id})`,
      value: acc.id,
      account: acc,
    };
  });
});

const selectedAccount = computed(() => {
  if (!form.trading_account_id || !selectedClient.value) return null;
  return (
    selectedClient.value.accounts?.find(
      (a) => a.id === form.trading_account_id,
    ) || null
  );
});

// ─── Watchers ──────────────────────────────────────────
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // Ensure programs list is fetched if not present
      if (!store.programsList || store.programsList.length === 0) {
        store.fetchProgramsList({}, true);
      }

      // Initialize program_id
      if (props.programId) {
        form.program_id = Number(props.programId);
      } else if (store.program?.id) {
        form.program_id = Number(store.program.id);
      } else if (store.programsList?.length > 0) {
        form.program_id = Number(store.programsList[0].id);
      }
    }
  },
  { immediate: true },
);

watch(
  () => props.programId,
  (pid) => {
    if (pid) form.program_id = Number(pid);
  },
  { immediate: true },
);

// Reset trading account if user changes
watch(
  () => form.user_id,
  () => {
    form.trading_account_id = null;
  },
);

// Reset trading account if program exclude_copy_accounts setting turns on and current account is copy
watch(
  () => isExcludeCopyAccounts.value,
  (excludeCopy) => {
    if (excludeCopy && selectedAccount.value) {
      const type = (selectedAccount.value.account_type || "").toLowerCase();
      if (type === "copy_trading" || type === "copy") {
        form.trading_account_id = null;
      }
    }
  },
);

// ─── Submit ────────────────────────────────────────────
const handleSubmit = async () => {
  if (!form.user_id || !form.trading_account_id || !form.program_id) return;

  const payload = {
    user_id: Number(form.user_id),
    trading_account_id: Number(form.trading_account_id),
    program_id: Number(form.program_id),
  };

  await store.createEnrollment(payload);
  form.user_id = null;
  form.trading_account_id = null;
  emit("enrolled");
  emit("close");
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease-out;
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
