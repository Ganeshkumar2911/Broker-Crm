<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  >
    <div
      class="bg-card-background border border-primary-border rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col"
    >
      <div
        class="flex justify-between items-center p-5 border-b border-primary-border"
      >
        <h3 class="text-lg font-semibold text-primary-text">Enroll Account</h3>
        <button
          @click="$emit('close')"
          class="text-secondary-text hover:text-primary-text cursor-pointer"
        >
          <HugeIcon :icon="Cancel01Icon" :size="20" />
        </button>
      </div>

      <div class="p-5 space-y-4">
        <!-- 1. Search User -->
        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1"
            >User</label
          >
          <BaseSelect
            v-model="formData.user_id"
            :options="userOptions"
            :searchable="true"
            @search="handleUserSearch"
            :isLoading="isUserLoading"
            placeholder="Search by name, email or ID..."
          />
        </div>

        <!-- 2. Trading Account -->
        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1"
            >Trading Account</label
          >
          <BaseSelect
            v-model="formData.trading_account_id"
            :options="accountOptions"
            :disabled="!formData.user_id"
            :isLoading="isAccountsLoading"
            placeholder="Select a trading account..."
          />
        </div>

        <!-- 3. Plan -->
        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1"
            >Plan</label
          >
          <BaseSelect
            v-model="formData.plan_id"
            :options="planOptions"
            :isLoading="isPlansLoading"
            placeholder="Select a plan..."
          />
        </div>
        <!-- 4. Skip Plan Lock -->
        <div
          class="flex items-center justify-between p-3 bg-background rounded-lg border border-primary-border mt-2"
        >
          <label
            for="skip-plan-lock"
            class="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              id="skip-plan-lock"
              v-model="formData.skip_plan_lock"
              class="w-4 h-4 text-primary bg-card-background border-primary-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
            />
            <span class="text-sm text-primary-text font-medium"
              >Skip plan lock time</span
            >
          </label>
          <span class="text-xs text-secondary-text">
            {{
              formData.skip_plan_lock
                ? "Ignore existing lock"
                : "Respect existing lock"
            }}
          </span>
        </div>
      </div>

      <div
        class="flex justify-end gap-3 p-5 border-t border-primary-border bg-background/50"
      >
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text border border-primary-border rounded-lg cursor-pointer"
          @click="$emit('close')"
          :disabled="store.actionLoading"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2 cursor-pointer"
          @click="handleSubmit"
          :disabled="
            store.actionLoading ||
            !formData.user_id ||
            !formData.trading_account_id ||
            !formData.plan_id
          "
        >
          <HugeIcon
            v-if="store.actionLoading"
            :icon="Loading03Icon"
            :size="16"
            class="animate-spin"
          />
          Enroll
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { useCashbackStore } from "@/stores/cashback/cashback";
import apiRequest from "@/api/request";
import urls from "@/api/urls";

const emit = defineEmits(["close"]);
const store = useCashbackStore();

const formData = ref({
  user_id: "",
  trading_account_id: "",
  plan_id: "",
  skip_plan_lock: true,
});

// -- 1. Search Users --
const userOptions = ref([]);
const isUserLoading = ref(false);
let searchTimeout = null;

const handleUserSearch = (query) => {
  if (!query) {
    userOptions.value = [];
    return;
  }

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    isUserLoading.value = true;
    try {
      await apiRequest(
        urls.KEYS.GET,
        urls.cashback.userSearch || "/cashback/user-search",
        {
          params: { q: query, limit: 20 },
          isTokenRequired: true,
          onSuccess: (res) => {
            const items = res?.data?.items || [];
            userOptions.value = items.map((u) => ({
              label: `${u.name || "Unknown"} (ID: ${u.user_id}) - ${u.email || "No email"}`,
              value: u.user_id,
              email: u.email,
            }));
          },
        },
      );
    } finally {
      isUserLoading.value = false;
    }
  }, 400);
};

// -- 2. Load Trading Accounts --
const accountOptions = ref([]);
const isAccountsLoading = ref(false);

watch(
  () => formData.value.user_id,
  async (newVal) => {
    formData.value.trading_account_id = ""; // reset
    accountOptions.value = [];

    if (!newVal) return;

    isAccountsLoading.value = true;
    try {
      await apiRequest(
        urls.KEYS.GET,
        urls.cashback.userSearch || "/cashback/user-search",
        {
          params: { user_id: newVal, trading_accounts: true },
          isTokenRequired: true,
          onSuccess: (res) => {
            const accounts = res?.data?.accounts || [];
            accountOptions.value = accounts.map((a) => {
              let label = `${a.account_number || a.trading_account_id} (${a.broker_currency || "N/A"}, ${a.trading_type || "N/A"})`;
              if (a.enrollment) label += ` - Enrolled: ${a.enrollment.plan_id}`;
              else if (!a.eligible)
                label += ` - Ineligible: ${a.ineligible_reason || "Unknown"}`;
              else label += ` - Eligible`;

              return {
                label,
                value: a.trading_account_id,
                disabled: !a.eligible && !a.enrollment,
              };
            });
          },
        },
      );
    } finally {
      isAccountsLoading.value = false;
    }
  },
);

// -- 3. Load Plans --
const planOptions = ref([]);
const isPlansLoading = ref(false);

onMounted(async () => {
  isPlansLoading.value = true;
  try {
    await apiRequest(
      urls.KEYS.GET,
      urls.cashback.program || "/cashback/program",
      {
        isTokenRequired: true,
        onSuccess: (res) => {
          const plans = res?.data?.plans || res?.data?.data?.plans || [];
          planOptions.value = plans
            .filter((p) => p.status === "active")
            .map((p) => ({
              label: `${p.name || "Plan " + p.id}`,
              value: p.id,
            }));
        },
      },
    );
  } finally {
    isPlansLoading.value = false;
  }
});

const handleSubmit = async () => {
  await store.enrollAccount({
    user_id: parseInt(formData.value.user_id),
    trading_account_id: parseInt(formData.value.trading_account_id),
    plan_id: formData.value.plan_id,
    skip_plan_lock: formData.value.skip_plan_lock,
  });
  if (!store.error) {
    emit("close");
  }
};
</script>
