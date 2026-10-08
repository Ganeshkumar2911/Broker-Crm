<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
    @click="closeDialog"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-lg shadow-2xl overflow-hidden transform scale-100 transition-all duration-300"
      @click.stop
    >
      <!-- Header -->
      <div
        class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
          >
            <SlidersHorizontal class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-primary-text">
              {{
                isAccountMode
                  ? "Trading Account Restrictions"
                  : "Manage Transaction Restrictions"
              }}
            </h2>
            <p class="text-[11px] text-secondary-text mt-0.5">
              Configure deposit, transfer, and withdrawal restrictions
            </p>
          </div>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer focus:outline-none"
          @click="closeDialog"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5 bg-card-background max-h-[calc(85vh-130px)] overflow-y-auto">
        <!-- Reference Card (Client or Account) -->
        <div
          class="bg-background border border-primary-border rounded-xl p-3.5 flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white shrink-0"
            >
              <Wallet v-if="isAccountMode" class="w-4 h-4" />
              <span v-else>{{ initialLetter }}</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <template v-if="isAccountMode">
                  <p class="text-xs font-semibold text-primary-text font-mono truncate">
                    #{{ accountNumber || "—" }}
                  </p>
                  <span
                    v-if="accountId"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono font-medium"
                  >
                    ID: {{ accountId }}
                  </span>
                  <span
                    v-if="account?.trading_type"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-card-background text-secondary-text capitalize font-medium"
                  >
                    {{ account.trading_type }}
                  </span>
                </template>
                <template v-else>
                  <p class="text-xs font-semibold text-primary-text truncate">
                    {{ clientName }}
                  </p>
                  <span
                    v-if="client?.id"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono font-medium"
                  >
                    ID: {{ client.id }}
                  </span>
                </template>
              </div>
              <p class="text-[11px] text-secondary-text truncate mt-0.5">
                <template v-if="isAccountMode">
                  {{ clientName !== "—" ? `${clientName} • ` : "" }}{{ clientEmail || (account?.broker ? `${account.broker} (${account.broker_currency || account.currency || 'USD'})` : "—") }}
                </template>
                <template v-else>
                  {{ clientEmail || "—" }}
                </template>
              </p>
            </div>
          </div>

          <!-- Quick Preset Buttons -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              class="text-[10px] px-2 py-1 rounded-md font-medium text-secondary-text hover:text-primary-text hover:bg-card-background border border-primary-border transition cursor-pointer"
              title="Allow all transactions"
              @click="setAll(false)"
            >
              Allow All
            </button>
            <button
              type="button"
              class="text-[10px] px-2 py-1 rounded-md font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition cursor-pointer"
              title="Restrict all transactions"
              @click="setAll(true)"
            >
              Restrict All
            </button>
          </div>
        </div>

        <!-- Restriction Setting Cards -->
        <div class="space-y-3">
          <!-- 1. Restrict Deposit -->
          <div
            class="p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
            :class="
              restrictions.restrict_deposit
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-primary-border bg-background/50 hover:bg-background'
            "
            @click="restrictions.restrict_deposit = !restrictions.restrict_deposit"
          >
            <div class="flex items-start gap-3.5 min-w-0">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                :class="
                  restrictions.restrict_deposit
                    ? 'bg-red-500/15 text-red-500 border border-red-500/20'
                    : 'bg-green-500/15 text-green-600 border border-green-500/20'
                "
              >
                <ArrowDownCircle class="w-5 h-5" />
              </div>
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-semibold text-primary-text">
                    Restrict Deposit
                  </h4>
                  <span
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                    :class="
                      restrictions.restrict_deposit
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-green-500/10 text-green-700 border-green-500/20'
                    "
                  >
                    {{ restrictions.restrict_deposit ? "Restricted" : "Allowed" }}
                  </span>
                </div>
                <p class="text-[11px] text-secondary-text leading-relaxed">
                  {{
                    isAccountMode
                      ? "Block deposits into this trading account."
                      : "Block the client from depositing funds into their accounts."
                  }}
                </p>
              </div>
            </div>

            <!-- Custom Switch -->
            <button
              type="button"
              role="switch"
              :aria-checked="restrictions.restrict_deposit"
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="restrictions.restrict_deposit ? 'bg-red-500' : 'bg-primary/20'"
              @click.stop="
                restrictions.restrict_deposit = !restrictions.restrict_deposit
              "
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="
                  restrictions.restrict_deposit
                    ? 'translate-x-4'
                    : 'translate-x-0'
                "
              />
            </button>
          </div>

          <!-- 2. Restrict Internal Transfer -->
          <div
            class="p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
            :class="
              restrictions.restrict_internal_transfer
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-primary-border bg-background/50 hover:bg-background'
            "
            @click="
              restrictions.restrict_internal_transfer =
                !restrictions.restrict_internal_transfer
            "
          >
            <div class="flex items-start gap-3.5 min-w-0">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                :class="
                  restrictions.restrict_internal_transfer
                    ? 'bg-red-500/15 text-red-500 border border-red-500/20'
                    : 'bg-green-500/15 text-green-600 border border-green-500/20'
                "
              >
                <ArrowLeftRight class="w-5 h-5" />
              </div>
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-semibold text-primary-text">
                    Restrict Internal Transfer
                  </h4>
                  <span
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                    :class="
                      restrictions.restrict_internal_transfer
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-green-500/10 text-green-700 border-green-500/20'
                    "
                  >
                    {{
                      restrictions.restrict_internal_transfer
                        ? "Restricted"
                        : "Allowed"
                    }}
                  </span>
                </div>
                <p class="text-[11px] text-secondary-text leading-relaxed">
                  {{
                    isAccountMode
                      ? "Block internal transfers and balance movements to/from this trading account."
                      : "Block internal wallet transfers and balance movements between accounts."
                  }}
                </p>
              </div>
            </div>

            <!-- Custom Switch -->
            <button
              type="button"
              role="switch"
              :aria-checked="restrictions.restrict_internal_transfer"
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="
                restrictions.restrict_internal_transfer
                  ? 'bg-red-500'
                  : 'bg-primary/20'
              "
              @click.stop="
                restrictions.restrict_internal_transfer =
                  !restrictions.restrict_internal_transfer
              "
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="
                  restrictions.restrict_internal_transfer
                    ? 'translate-x-4'
                    : 'translate-x-0'
                "
              />
            </button>
          </div>

          <!-- 3. Restrict Withdrawal -->
          <div
            class="p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
            :class="
              restrictions.restrict_withdrawal
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-primary-border bg-background/50 hover:bg-background'
            "
            @click="
              restrictions.restrict_withdrawal = !restrictions.restrict_withdrawal
            "
          >
            <div class="flex items-start gap-3.5 min-w-0">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                :class="
                  restrictions.restrict_withdrawal
                    ? 'bg-red-500/15 text-red-500 border border-red-500/20'
                    : 'bg-green-500/15 text-green-600 border border-green-500/20'
                "
              >
                <ArrowUpCircle class="w-5 h-5" />
              </div>
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-semibold text-primary-text">
                    Restrict Withdrawal
                  </h4>
                  <span
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                    :class="
                      restrictions.restrict_withdrawal
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-green-500/10 text-green-700 border-green-500/20'
                    "
                  >
                    {{
                      restrictions.restrict_withdrawal
                        ? "Restricted"
                        : "Allowed"
                    }}
                  </span>
                </div>
                <p class="text-[11px] text-secondary-text leading-relaxed">
                  {{
                    isAccountMode
                      ? "Block withdrawal requests from this trading account."
                      : "Block the client from submitting or processing fund withdrawal requests."
                  }}
                </p>
              </div>
            </div>

            <!-- Custom Switch -->
            <button
              type="button"
              role="switch"
              :aria-checked="restrictions.restrict_withdrawal"
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="
                restrictions.restrict_withdrawal ? 'bg-red-500' : 'bg-primary/20'
              "
              @click.stop="
                restrictions.restrict_withdrawal =
                  !restrictions.restrict_withdrawal
              "
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="
                  restrictions.restrict_withdrawal
                    ? 'translate-x-4'
                    : 'translate-x-0'
                "
              />
            </button>
          </div>
        </div>

        <!-- Modified Changes Notice -->
        <div
          v-if="hasChanges"
          class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs"
        >
          <Info class="w-4 h-4 shrink-0" />
          <span>{{ changedCount }} transaction restriction setting(s) modified.</span>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background"
      >
        <button
          :disabled="isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          :disabled="!hasChanges || isSubmitting"
          class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? "Saving..." : "Save Changes" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import {
  X,
  Loader2,
  SlidersHorizontal,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Info,
  Wallet,
} from "lucide-vue-next";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: null },
  account: { type: Object, default: null },
  type: { type: String, default: "" }, // 'client' | 'account'
});

const emit = defineEmits(["close", "success"]);

const snackbar = useSnackbarStore();
const isSubmitting = ref(false);

const isAccountMode = computed(() => {
  if (props.type === "account") return true;
  if (props.type === "client") return false;
  return Boolean(props.account && !props.client);
});

const accountId = computed(() => {
  return (
    props.account?.account_id ??
    props.account?.id ??
    props.account?.trading_account_id ??
    null
  );
});

const accountNumber = computed(() => {
  return props.account?.account_number ?? "";
});

const clientName = computed(() => {
  if (isAccountMode.value) {
    return (
      props.account?.client_name ??
      props.account?.user?.name ??
      props.client?.name ??
      "—"
    );
  }
  return props.client?.name ?? "—";
});

const clientEmail = computed(() => {
  if (isAccountMode.value) {
    return props.account?.user?.email ?? props.client?.email ?? "";
  }
  return props.client?.email ?? "";
});

const initialLetter = computed(() => {
  if (isAccountMode.value) {
    return clientName.value && clientName.value !== "—"
      ? clientName.value.charAt(0).toUpperCase()
      : "A";
  }
  return props.client?.name ? props.client.name.charAt(0).toUpperCase() : "C";
});

const restrictions = reactive({
  restrict_deposit: false,
  restrict_internal_transfer: false,
  restrict_withdrawal: false,
});

const initialRestrictions = reactive({
  restrict_deposit: false,
  restrict_internal_transfer: false,
  restrict_withdrawal: false,
});

watch(
  () => [props.open, props.client, props.account],
  ([isOpen]) => {
    if (isOpen) {
      const target = isAccountMode.value ? props.account : props.client;
      if (target) {
        const dep = Boolean(target.restrict_deposit);
        const transfer = Boolean(target.restrict_internal_transfer);
        const withdr = Boolean(target.restrict_withdrawal);

        restrictions.restrict_deposit = dep;
        restrictions.restrict_internal_transfer = transfer;
        restrictions.restrict_withdrawal = withdr;

        initialRestrictions.restrict_deposit = dep;
        initialRestrictions.restrict_internal_transfer = transfer;
        initialRestrictions.restrict_withdrawal = withdr;

        isSubmitting.value = false;
      }
    }
  },
  { immediate: true },
);

const setAll = (value) => {
  restrictions.restrict_deposit = value;
  restrictions.restrict_internal_transfer = value;
  restrictions.restrict_withdrawal = value;
};

const changedPayload = computed(() => {
  const payload = {};
  if (restrictions.restrict_deposit !== initialRestrictions.restrict_deposit) {
    payload.restrict_deposit = restrictions.restrict_deposit;
  }
  if (
    restrictions.restrict_internal_transfer !==
    initialRestrictions.restrict_internal_transfer
  ) {
    payload.restrict_internal_transfer =
      restrictions.restrict_internal_transfer;
  }
  if (
    restrictions.restrict_withdrawal !==
    initialRestrictions.restrict_withdrawal
  ) {
    payload.restrict_withdrawal = restrictions.restrict_withdrawal;
  }
  return payload;
});

const changedCount = computed(() => {
  return Object.keys(changedPayload.value).length;
});

const hasChanges = computed(() => {
  return changedCount.value > 0;
});

const handleSubmit = () => {
  if (isAccountMode.value) {
    const accId = accountId.value;
    if (!accId) return;
    if (!hasChanges.value) {
      closeDialog();
      return;
    }

    isSubmitting.value = true;

    apiRequest(
      urls.KEYS.PATCH,
      urls.tradingAccounts.transactionRestrictions(accId),
      {
        data: changedPayload.value,
        isTokenRequired: true,
        onSuccess: (res) => {
          snackbar.show(
            res?.message ||
              "Trading account transaction restrictions updated successfully.",
            "success",
          );
          isSubmitting.value = false;
          emit("success", res?.data);
          closeDialog();
        },
        onFailure: (err) => {
          snackbar.show(
            err?.message ||
              "Failed to update trading account transaction restrictions.",
            "error",
          );
          isSubmitting.value = false;
        },
      },
    );
  } else {
    if (!props.client?.id) return;
    if (!hasChanges.value) {
      closeDialog();
      return;
    }

    isSubmitting.value = true;

    apiRequest(urls.KEYS.PATCH, urls.clientList.update, {
      look_up_key: props.client.id,
      data: changedPayload.value,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show(
          res?.message || "Transaction restrictions updated successfully.",
          "success",
        );
        isSubmitting.value = false;
        emit("success", res?.data);
        closeDialog();
      },
      onFailure: (err) => {
        snackbar.show(
          err?.message || "Failed to update transaction restrictions.",
          "error",
        );
        isSubmitting.value = false;
      },
    });
  }
};

const closeDialog = () => {
  emit("close");
};
</script>
