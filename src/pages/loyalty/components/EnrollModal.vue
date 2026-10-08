<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
  >
    <div
      class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh]"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-primary-border shrink-0 bg-card-background">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <HugeIcon :icon="UserAdd01Icon" :size="18" />
          </div>
          <div>
            <h3 class="text-base font-bold text-primary-text">Enroll Trading Account</h3>
            <p class="text-xs text-secondary-text">Opt-in client live trading account into loyalty rewards</p>
          </div>
        </div>
        <button
          type="button"
          class="p-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer"
          @click="$emit('close')"
        >
          <HugeIcon :icon="Cancel01Icon" :size="18" />
        </button>
      </div>

      <!-- Scrollable Form Content -->
      <form id="enroll-modal-form" class="p-6 space-y-4 text-xs overflow-y-auto flex-1" @submit.prevent="handleSubmit">
        <!-- 1. Program Selection -->
        <div class="space-y-1">
          <label class="font-semibold text-primary-text flex items-center justify-between">
            <span>Loyalty Program</span>
            <span
              v-if="isExcludeCopyAccounts"
              class="text-[10px] text-primary-yellow font-normal"
            >
              (Copy accounts excluded)
            </span>
          </label>
          <BaseSelect
            v-model="form.program_id"
            :options="programOptions"
            placeholder="Select Loyalty Program..."
            searchable
            class="w-full"
          />
        </div>

        <!-- 2. Client Selection (Search) -->
        <div class="space-y-1">
          <label class="font-semibold text-primary-text">Client / User</label>
          <BaseSelect
            v-model="form.user_id"
            :options="clientOptions"
            :isLoading="isSearchingClients"
            placeholder="Type name, email or client ID..."
            searchable
            class="w-full"
            @search="handleClientSearch"
          />
        </div>

        <!-- 3. Trading Account Selection -->
        <div class="space-y-1">
          <label class="font-semibold text-primary-text flex items-center justify-between">
            <span>Live Trading Account</span>
            <span v-if="form.user_id" class="text-[10px] text-secondary-text font-mono">
              {{ accountOptions.length }} eligible
            </span>
          </label>
          <BaseSelect
            v-model="form.trading_account_id"
            :options="accountOptions"
            :disabled="!form.user_id || accountOptions.length === 0"
            :placeholder="!form.user_id ? 'First select a client above...' : (accountOptions.length === 0 ? 'No eligible accounts found' : 'Select trading account...')"
            searchable
            class="w-full"
          />
        </div>

        <!-- Warning if no eligible accounts -->
        <div
          v-if="form.user_id && selectedClient && accountOptions.length === 0"
          class="p-3 rounded-xl bg-primary-yellow/10 border border-primary-yellow/20 text-primary-yellow text-[11px] flex items-start gap-2"
        >
          <HugeIcon :icon="Alert02Icon" :size="16" class="shrink-0 mt-0.5" />
          <p>
            No eligible live accounts found. Demo accounts
            <span v-if="isExcludeCopyAccounts">and copy trading accounts</span> are excluded.
          </p>
        </div>

        <!-- 4. Selected Info Preview -->
        <div
          v-if="selectedClient || selectedAccount"
          class="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2.5 text-[11px]"
        >
          <div v-if="selectedClient" class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-primary-text">{{ selectedClient.name }}</p>
              <p class="text-[10px] text-secondary-text font-mono">#{{ selectedClient.id }} · {{ selectedClient.email }}</p>
            </div>
            <span
              class="px-2 py-0.5 rounded text-[10px] uppercase font-medium border"
              :class="selectedClient.kyc_status === 'approved' ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'"
            >
              KYC: {{ selectedClient.kyc_status || 'Pending' }}
            </span>
          </div>

          <div v-if="selectedAccount" class="pt-2 border-t border-primary/10 flex items-center justify-between">
            <div class="flex items-center gap-1.5 font-mono">
              <span class="font-bold text-primary-text">#{{ selectedAccount.account_number }}</span>
              <span class="text-secondary-text">(ID: {{ selectedAccount.id }})</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-primary/10 text-primary">
              {{ selectedAccount.account_type || 'LIVE' }}
            </span>
          </div>
        </div>
      </form>

      <!-- Action Footer -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-border shrink-0 bg-card-background">
        <button
          type="button"
          class="px-4 py-2 rounded-lg border border-primary-border text-secondary-text hover:text-primary-text hover:bg-background transition cursor-pointer text-xs"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="enroll-modal-form"
          :disabled="store.actionLoading || !form.user_id || !form.trading_account_id || !form.program_id"
          class="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs"
        >
          <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="14" class="animate-spin" />
          <span>{{ store.actionLoading ? 'Enrolling...' : 'Enroll Account' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import {
  UserAdd01Icon,
  Cancel01Icon,
  Alert02Icon,
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

const clientsMap = ref(new Map());
const clientList = ref([]);
const isSearchingClients = ref(false);
let clientSearchTimer = null;

const programOptions = computed(() => {
  const list = Array.isArray(store.programsList) && store.programsList.length > 0
    ? store.programsList
    : store.program
      ? [store.program]
      : [];

  return list.map((prog) => ({
    label: `${prog.name || 'Unnamed Program'} (${(prog.status || 'active').toUpperCase()}) · #${prog.id}`,
    value: prog.id,
    program: prog,
  }));
});

const selectedProgram = computed(() => {
  if (!form.program_id) return store.program || null;
  return store.programsList?.find((p) => p.id === form.program_id) || store.program || null;
});

const isExcludeCopyAccounts = computed(() => {
  const prog = selectedProgram.value;
  if (!prog) return false;
  return Boolean(
    prog.eligibility_rules?.exclude_copy_accounts ?? prog.exclude_copy_accounts,
  );
});

const clientOptions = computed(() => {
  return clientList.value.map((c) => ({
    label: `${c.name || 'Unnamed'} (${c.email || 'No email'}) · #${c.id}`,
    value: c.id,
    email: c.email,
    client: c,
  }));
});

const selectedClient = computed(() => {
  if (!form.user_id) return null;
  return clientsMap.value.get(form.user_id) || null;
});

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
    console.error("Failed to fetch clients for modal dropdown:", err);
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

const eligibleAccounts = computed(() => {
  if (!selectedClient.value || !Array.isArray(selectedClient.value.accounts)) {
    return [];
  }

  return selectedClient.value.accounts.filter((acc) => {
    const type = (acc.account_type || "").toLowerCase();
    if (type === "demo") return false;
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
    selectedClient.value.accounts?.find((a) => a.id === form.trading_account_id) ||
    null
  );
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (!store.programsList || store.programsList.length === 0) {
        store.fetchProgramsList({}, true);
      }
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

watch(
  () => form.user_id,
  () => {
    form.trading_account_id = null;
  },
);

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
