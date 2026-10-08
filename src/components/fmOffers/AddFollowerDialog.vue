<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="handleClose"
      />
    </Transition>

    <!-- Side Panel Drawer -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-xl sm:max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <!-- Dialog Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-primary-border shrink-0 bg-background/50"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
            >
              <UserPlus class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-primary-text truncate">
                  Add Follower to Fund Manager
                </h3>
                <span
                  v-if="resolvedFmId"
                  class="text-xs font-mono font-bold px-2 py-0.5 rounded-md border border-primary/20 bg-primary/10 text-primary"
                >
                  FM #{{ resolvedFmId }}
                </span>
              </div>
              <p class="text-xs text-secondary-text truncate mt-0.5">
                Subscribe a client trading account to this Fund Manager strategy
              </p>
            </div>
          </div>
          <button
            type="button"
            class="btn-icon p-1.5"
            @click="handleClose"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Form Content -->
        <div class="p-6 space-y-5 text-xs overflow-y-auto flex-1 no-scrollbar">
        <!-- Error Banner -->
        <div
          v-if="errorMessage"
          class="p-3.5 rounded-xl bg-primary-red/10 border border-primary-red/20 text-primary-red flex items-start gap-2.5 text-xs"
        >
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="font-semibold">Unable to process request</p>
            <p class="text-[11px] opacity-90 mt-0.5 leading-relaxed">
              {{ errorMessage }}
            </p>
          </div>
          <button
            type="button"
            class="text-primary-red hover:opacity-70 cursor-pointer"
            @click="errorMessage = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- 1. Client Picker -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label
              class="font-bold text-primary-text flex items-center gap-1.5"
            >
              <span>1. Select Client</span>
              <span class="text-primary-red">*</span>
            </label>
            <span
              v-if="selectedClient"
              class="text-[10px] text-secondary-text font-mono"
            >
              ID: #{{ selectedClient.value }}
            </span>
          </div>

          <BaseSelect
            v-model="form.user_id"
            :options="clientOptions"
            :isLoading="isSearchingClients"
            placeholder="Search by client name, email, or user ID..."
            searchable
            isShowMail
            class="w-full"
            @search="handleClientSearch"
          />

          <!-- Client Preview Card -->
          <div
            v-if="selectedClient"
            class="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-between gap-3 text-xs mt-1"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0"
              >
                {{
                  (selectedClient.name ||
                    selectedClient.label ||
                    "U")[0].toUpperCase()
                }}
              </div>
              <div class="min-w-0">
                <p class="font-bold text-primary-text truncate">
                  {{ selectedClient.name || selectedClient.label }}
                </p>
                <p class="text-[11px] text-secondary-text font-mono truncate">
                  {{ selectedClient.email || "No email" }}
                </p>
              </div>
            </div>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-mono bg-background border border-primary-border text-secondary-text shrink-0"
            >
              User #{{ selectedClient.value }}
            </span>
          </div>
        </div>

        <!-- 2. Pick Account Type (Mode) -->
        <div class="space-y-2">
          <label
            class="font-bold text-primary-text flex items-center justify-between"
          >
            <span class="flex items-center gap-1.5">
              <span>2. Account Type (Mode)</span>
              <span class="text-primary-red">*</span>
            </span>
            <span class="text-[10px] text-secondary-text">
              Default: Real
            </span>
          </label>

          <div class="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              class="flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer"
              :class="
                form.mode === 'copy_trading'
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-background/60 border-primary-border text-secondary-text hover:text-primary-text hover:border-primary/40'
              "
              :disabled="disabledModes.copy_trading"
              @click="setMode('copy_trading')"
            >
              <div class="flex items-center justify-between w-full mb-1">
                <span class="font-bold text-xs">Copy Trading</span>
                <span
                  class="w-2 h-2 rounded-full"
                  :class="
                    form.mode === 'copy_trading'
                      ? 'bg-primary'
                      : 'bg-transparent border border-secondary-text'
                  "
                />
              </div>
              <p class="text-[10px] opacity-80 leading-relaxed">
                Deposits into FM coverage account; trades replicated
                proportionally.
              </p>
            </button>

            <button
              type="button"
              class="flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer"
              :class="
                form.mode === 'real'
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-background/60 border-primary-border text-secondary-text hover:text-primary-text hover:border-primary/40'
              "
              :disabled="disabledModes.real"
              @click="setMode('real')"
            >
              <div class="flex items-center justify-between w-full mb-1">
                <span class="font-bold text-xs">Real Account</span>
                <span
                  class="w-2 h-2 rounded-full"
                  :class="
                    form.mode === 'real'
                      ? 'bg-primary'
                      : 'bg-transparent border border-secondary-text'
                  "
                />
              </div>
              <p class="text-[10px] opacity-80 leading-relaxed">
                Independent real trading account participating directly in
                strategy.
              </p>
            </button>
          </div>

          <p
            v-if="modeNotice"
            class="text-[10px] text-amber-500 flex items-center gap-1 mt-1"
          >
            <AlertTriangle class="w-3 h-3 shrink-0" />
            <span>{{ modeNotice }}</span>
          </p>
        </div>

        <!-- 3. Eligible Accounts Selection -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label
              class="font-bold text-primary-text flex items-center gap-1.5"
            >
              <span>3. Eligible Trading Account</span>
              <span class="text-primary-red">*</span>
            </label>
            <span
              v-if="accountsLoaded"
              class="text-[10px] font-mono text-secondary-text"
            >
              {{ availableAccounts.length }} available
            </span>
          </div>

          <!-- Loading accounts -->
          <div
            v-if="accountsLoading"
            class="flex items-center justify-center gap-2 py-6 rounded-xl border border-primary-border bg-background/40 text-secondary-text"
          >
            <Loader2 class="w-4 h-4 animate-spin text-primary" />
            <span>Checking eligible accounts for client & mode...</span>
          </div>

          <!-- Helper: Client not selected yet -->
          <div
            v-else-if="!form.user_id"
            class="p-4 rounded-xl border border-dashed border-primary-border bg-background/30 text-center text-secondary-text"
          >
            <Wallet class="w-5 h-5 mx-auto mb-1.5 opacity-40" />
            <p class="text-xs font-semibold">Select a client above</p>
            <p class="text-[11px] text-secondary-text/80 mt-0.5">
              Eligible accounts matching the FM's currency and criteria will
              load automatically.
            </p>
          </div>

          <!-- Empty accounts state -->
          <div
            v-else-if="accountsLoaded && availableAccounts.length === 0"
            class="p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 space-y-1.5"
          >
            <div class="flex items-center gap-2 font-bold text-xs">
              <AlertTriangle class="w-4 h-4 shrink-0" />
              <span>No eligible accounts for this client/FM/mode</span>
            </div>
            <ul
              class="text-[11px] opacity-90 list-disc list-inside space-y-0.5 pl-1"
            >
              <li>Must have positive balance (> 0)</li>
              <li>Must match the Fund Manager's broker currency</li>
              <li>Must not already be following this Fund Manager</li>
              <li>Master and coverage accounts are skipped for Real mode</li>
            </ul>
          </div>

          <!-- Accounts List Selection -->
          <div v-else class="space-y-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="acc in availableAccounts"
                :key="acc.trading_account_id"
                class="p-3 rounded-xl border text-left transition-all cursor-pointer relative"
                :class="
                  form.trading_account_id === acc.trading_account_id
                    ? 'bg-primary/10 border-primary text-primary shadow-xs'
                    : 'bg-background/60 border-primary-border text-primary-text hover:border-primary/40'
                "
                @click="selectAccount(acc)"
              >
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-xs"
                      >#{{ acc.account_number }}</span
                    >
                    <span
                      v-if="acc.account_type"
                      class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-background border border-primary-border text-secondary-text"
                    >
                      {{ acc.account_type }}
                    </span>
                  </div>
                  <div
                    class="w-4 h-4 rounded-full flex items-center justify-center border"
                    :class="
                      form.trading_account_id === acc.trading_account_id
                        ? 'border-primary bg-primary text-white'
                        : 'border-secondary-text/50 bg-transparent'
                    "
                  >
                    <Check
                      v-if="form.trading_account_id === acc.trading_account_id"
                      class="w-3 h-3"
                    />
                  </div>
                </div>

                <div
                  class="flex items-center justify-between text-[10px] text-secondary-text mt-0.5"
                >
                  <span>{{ acc.broker || "Broker" }}</span>
                  <span class="font-mono capitalize">{{ acc.trading_type || form.mode }}</span>
                  <span class="font-mono font-bold text-primary">Equity: {{ acc.equity != null ? formatCurrency(acc.equity, acc.broker_currency) : '-' }}</span>
                </div>

                <div
                  class="flex items-baseline justify-between mt-2 pt-1 border-t border-primary-border/40"
                >
                  <span class="text-[10px] text-secondary-text">Balance</span>
                  <span class="font-mono font-extrabold text-xs text-primary">
                    {{ formatCurrency(acc.balance, acc.broker_currency) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Offer Selection (Optional) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label
              class="font-bold text-primary-text flex items-center gap-1.5"
            >
              <span>4. Offer Assignment</span>
              <span class="text-[10px] font-normal text-secondary-text"
                >(Optional)</span
              >
            </label>
            <span class="text-[10px] text-secondary-text">
              Defaults to FM base fees if omitted
            </span>
          </div>

          <BaseSelect
            v-model="form.offer_id"
            :options="offerSelectOptions"
            :isLoading="offersLoading"
            placeholder="Select offer or use FM default fees..."
            class="w-full"
          />

          <!-- Selected Offer Details Card -->
          <div
            v-if="selectedOffer"
            class="p-3.5 rounded-xl bg-background border border-primary-border space-y-2 text-xs"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-bold text-primary-text">
                  {{ selectedOffer.name }}
                </p>
                <p
                  v-if="selectedOffer.offer_code"
                  class="text-[10px] font-mono text-primary font-bold"
                >
                  Code: {{ selectedOffer.offer_code }}
                </p>
              </div>
              <span
                class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
                :class="
                  selectedOffer.is_active
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                "
              >
                {{
                  selectedOffer.is_active ? "Active Offer" : "Inactive Offer"
                }}
              </span>
            </div>

            <div
              class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-primary-border/60"
            >
              <div>
                <span
                  class="text-[9px] uppercase text-secondary-text block font-semibold"
                  >Perf Fee</span
                >
                <span class="font-bold font-mono text-primary-text"
                  >{{ selectedOffer.performance_fee ?? 0 }}%</span
                >
              </div>
              <div>
                <span
                  class="text-[9px] uppercase text-secondary-text block font-semibold"
                  >Mgmt Fee</span
                >
                <span class="font-bold font-mono text-primary-text"
                  >{{ selectedOffer.management_fee ?? 0 }}%</span
                >
              </div>
              <div>
                <span
                  class="text-[9px] uppercase text-secondary-text block font-semibold"
                  >Reg Fee</span
                >
                <span class="font-bold font-mono text-primary-text">
                  {{
                    formatCurrency(
                      selectedOffer.registration_fee,
                      activeCurrency,
                    )
                  }}
                </span>
              </div>
              <div>
                <span
                  class="text-[9px] uppercase text-secondary-text block font-semibold"
                  >Min Balance</span
                >
                <span class="font-bold font-mono text-primary">
                  {{
                    formatCurrency(
                      selectedOffer.minimum_balance,
                      activeCurrency,
                    )
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- Minimum Balance Warning Check -->
          <div
            v-if="balanceWarning"
            class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-[11px] flex items-start gap-2"
          >
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p class="font-bold">Insufficient Balance Warning</p>
              <p class="mt-0.5 leading-relaxed">
                Selected account balance ({{
                  formatCurrency(
                    selectedAccount?.balance,
                    selectedAccount?.broker_currency,
                  )
                }}) is lower than the offer's minimum balance requirement ({{
                  formatCurrency(
                    selectedOffer?.minimum_balance,
                    activeCurrency,
                  )
                }}). The join will be rejected by the backend.
              </p>
            </div>
          </div>
        </div>

        <!-- 5. Lot Settings (Optional Collapsible) -->
        <div
          class="border border-primary-border rounded-xl p-3.5 bg-background/40 space-y-2.5"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs text-primary-text"
              >5. Lot Settings (Optional)</span
            >
            <span class="text-[10px] text-secondary-text"
              >Default lot rules applied if omitted</span
            >
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                class="text-[11px] font-semibold text-secondary-text block mb-1"
                >Lot Sizing Type</label
              >
              <BaseSelect
                v-model="form.lot_type"
                :options="lotTypeOptions"
                placeholder="Default / System rule"
              />
            </div>
            <div>
              <label
                class="text-[11px] font-semibold text-secondary-text block mb-1"
                >Lot Sizing Value</label
              >
              <input
                v-model="form.lot_value"
                type="text"
                placeholder="e.g. 1.0 or 0.1"
                class="w-full h-8.5 px-3 rounded-lg bg-card-background border border-primary-border text-primary-text text-xs outline-none focus:border-primary transition-colors font-mono"
              />
            </div>
          </div>
          <p class="text-[10px] text-secondary-text">
            • <strong>Fixed:</strong> execute trades with exact lot volume. •
            <strong>Multiplier:</strong> scale proportionally to master trade
            volume.
          </p>
        </div>

        <!-- 6. Confirmation Notice (Required UX Copy) -->
        <div
          class="p-3.5 rounded-xl bg-primary-yellow/10 border border-primary-yellow/25 text-primary-yellow text-xs space-y-1"
        >
          <div class="flex items-center gap-1.5 font-bold">
            <ShieldAlert class="w-4 h-4 shrink-0 text-amber-500" />
            <span>Important: Standard Follower Enrollment Rules Apply</span>
          </div>
          <p class="text-[11px] opacity-90 leading-relaxed">
            This is <strong>not</strong> a free admin override. The operation
            executes under standard client join rules:
          </p>
          <ul
            class="text-[11px] opacity-90 list-disc list-inside space-y-0.5 pl-1"
          >
            <li>
              Any configured registration fee will be charged to the client
              account.
            </li>
            <li>Minimum capital / balance limits are strictly enforced.</li>
            <li>
              Copy-trading accounts deposit funds into the Fund Manager coverage
              account.
            </li>
          </ul>
        </div>
      </div>

      <!-- Action Footer -->
      <div
        class="flex items-center justify-between gap-3 px-6 py-4 border-t border-primary-border shrink-0 bg-background/50"
      >
        <button
          type="button"
          class="btn-secondary"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          Cancel
        </button>

        <button
          type="button"
          :disabled="isSubmitDisabled"
          class="btn-primary"
          @click="handleSubmit"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{
            isSubmitting ? "Adding Follower..." : "Confirm & Add Follower"
          }}</span>
        </button>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import {
  UserPlus,
  X,
  AlertCircle,
  AlertTriangle,
  Wallet,
  Check,
  Loader2,
  ShieldAlert,
} from "lucide-vue-next";
import BaseSelect from "@/components/common/BaseSelect.vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useClientLedgerStore } from "@/stores/clientLedger/clientLedger";

const props = defineProps({
  open: { type: Boolean, default: false },
  fmId: { type: [Number, String], default: null },
  defaultOfferId: { type: [Number, String], default: null },
  currency: { type: String, default: "USD" },
});

const emit = defineEmits(["close", "created", "follower-added"]);

const snackbar = useSnackbarStore();
const clientLedgerStore = useClientLedgerStore();

// Form State
const form = reactive({
  user_id: null,
  mode: "real", // 'copy_trading' | 'real'
  trading_account_id: null,
  offer_id: null,
  lot_type: null,
  lot_value: "",
});

// Client search state
const clientOptions = ref([]);
const isSearchingClients = ref(false);
let clientSearchTimer = null;

// Accounts state
const availableAccounts = ref([]);
const accountsLoading = ref(false);
const accountsLoaded = ref(false);
const disabledModes = reactive({
  copy_trading: false,
  real: false,
});
const modeNotice = ref("");

// Offers state
const offers = ref([]);
const offersLoading = ref(false);

// Submission state
const isSubmitting = ref(false);
const errorMessage = ref("");

const resolvedFmId = computed(() => props.fmId);
const activeCurrency = computed(() => props.currency || "USD");

const lotTypeOptions = [
  { label: "Fixed Lot", value: "fixed" },
  { label: "Multiplier", value: "multiplier" },
];

const selectedClient = computed(() => {
  if (!form.user_id) return null;
  return (
    clientOptions.value.find((c) => String(c.value) === String(form.user_id)) ||
    null
  );
});

const selectedAccount = computed(() => {
  if (!form.trading_account_id) return null;
  return (
    availableAccounts.value.find(
      (a) => a.trading_account_id === form.trading_account_id,
    ) || null
  );
});

const selectedOffer = computed(() => {
  if (!form.offer_id) return null;
  return (
    offers.value.find((o) => String(o.id) === String(form.offer_id)) || null
  );
});

const offerSelectOptions = computed(() => {
  const list = [{ label: "No Offer (FM Default Fees)", value: null }];
  offers.value.forEach((o) => {
    const status = o.is_active ? "Active" : "Inactive";
    const pf = o.performance_fee != null ? `${o.performance_fee}% PF` : "";
    list.push({
      label: `${o.name || "Offer #" + o.id} (${status}${pf ? " · " + pf : ""})`,
      value: o.id,
    });
  });
  return list;
});

const balanceWarning = computed(() => {
  if (!selectedAccount.value || !selectedOffer.value) return false;
  const minBal = Number(selectedOffer.value.minimum_balance);
  const accBal = Number(selectedAccount.value.balance);
  if (isNaN(minBal) || isNaN(accBal)) return false;
  return accBal < minBal;
});

const isSubmitDisabled = computed(() => {
  return (
    !resolvedFmId.value ||
    !form.user_id ||
    !form.trading_account_id ||
    isSubmitting.value
  );
});

// Currency Formatter
const formatCurrency = (val, currency = null) => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const num = Number(val);
  const cur = (currency || activeCurrency.value || "USD").toUpperCase();
  let sym = "$";
  if (cur === "EUR") sym = "€";
  else if (cur === "GBP") sym = "£";
  else if (cur === "JPY") sym = "¥";
  else if (cur === "INR") sym = "₹";
  else if (cur === "USC" || cur === "CENT") sym = "¢";
  return `${sym}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur !== "USD" ? cur : ""}`.trim();
};

// Client Search Handler
const handleClientSearch = (query) => {
  clearTimeout(clientSearchTimer);
  isSearchingClients.value = true;

  clientSearchTimer = setTimeout(() => {
    const successHandler = (res) => {
      const results = res?.data || [];
      clientOptions.value = results.map((c) => ({
        label: `${c.client_name || c.user?.name || "Unknown"} - ${c.account_number || "N/A"} (${c.account_type || "N/A"})`,
        name: c.client_name || c.user?.name,
        value: c.user_id,
        email: c.user?.email || "",
      }));
    };

    const failureHandler = () => {
      clientOptions.value = [];
    };

    const finallyHandler = () => {
      isSearchingClients.value = false;
    };

    apiRequest(urls.KEYS.GET, urls.tradingAccounts.list, {
      params: {
        page: 1,
        per_page: 20,
        search_query: query || "",
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  }, 250);
};

const loadInitialClients = () => {
  isSearchingClients.value = true;

  const successHandler = (res) => {
    const results = res?.data || [];
    clientOptions.value = results.map((c) => ({
      label: `${c.client_name || c.user?.name || "Unknown"} - ${c.account_number || "N/A"} (${c.account_type || "N/A"})`,
      name: c.client_name || c.user?.name,
      value: c.user_id,
      email: c.user?.email || "",
    }));
  };

  const failureHandler = () => {
    clientOptions.value = [];
  };

  const finallyHandler = () => {
    isSearchingClients.value = false;
  };

  apiRequest(urls.KEYS.GET, urls.tradingAccounts.list, {
    params: {
      page: 1,
      per_page: 20,
    },
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
    onFinally: finallyHandler,
  });
};

// Fetch Eligible Accounts
const fetchAvailableAccounts = () => {
  if (!resolvedFmId.value || !form.user_id) {
    availableAccounts.value = [];
    accountsLoaded.value = false;
    return;
  }

  accountsLoading.value = true;
  form.trading_account_id = null;
  modeNotice.value = "";
  errorMessage.value = "";

  const endpoint =
    urls.fm.availableJoiners || "/fund_managers/followers/available-joiners";

  apiRequest(urls.KEYS.GET, endpoint, {
    params: {
      fm_id: resolvedFmId.value,
      user_id: form.user_id,
      mode: form.mode,
    },
    isTokenRequired: true,
    onSuccess: (res) => {
      accountsLoading.value = false;
      accountsLoaded.value = true;
      availableAccounts.value = Array.isArray(res?.data) ? res.data : [];

      // If only 1 account returned, select it automatically for convenience
      if (availableAccounts.value.length === 1) {
        form.trading_account_id = availableAccounts.value[0].trading_account_id;
      }
    },
    onFailure: (err) => {
      accountsLoading.value = false;
      accountsLoaded.value = true;
      availableAccounts.value = [];

      // Check if FM does not permit this trading mode
      if (
        err?.follower_account_type !== undefined ||
        err?.message?.toLowerCase?.().includes("trading type")
      ) {
        modeNotice.value =
          err?.message ||
          `Mode "${form.mode}" is not permitted by this Fund Manager.`;
      } else {
        errorMessage.value =
          err?.message || "Failed to load eligible accounts.";
      }
    },
  });
};

// Fetch Offers for this FM
const fetchOffers = () => {
  if (!resolvedFmId.value) return;
  offersLoading.value = true;

  const endpoint = `${urls.fm.offers}/${resolvedFmId.value}`;

  apiRequest(urls.KEYS.GET, endpoint, {
    isTokenRequired: true,
    onSuccess: (res) => {
      offersLoading.value = false;
      const list = Array.isArray(res?.data) ? res.data : [];
      // Sort offers: active first
      offers.value = list.sort(
        (a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0),
      );

      // Pre-select defaultOfferId if provided and exists
      if (
        props.defaultOfferId &&
        list.some((o) => String(o.id) === String(props.defaultOfferId))
      ) {
        form.offer_id = Number(props.defaultOfferId);
      }
    },
    onFailure: () => {
      offersLoading.value = false;
      offers.value = [];
    },
  });
};

const setMode = (modeVal) => {
  if (form.mode === modeVal) return;
  form.mode = modeVal;
  fetchAvailableAccounts();
};

const selectAccount = (acc) => {
  form.trading_account_id = acc.trading_account_id;
};

const resetForm = () => {
  form.user_id = null;
  form.mode = "copy_trading";
  form.trading_account_id = null;
  form.offer_id = props.defaultOfferId ? Number(props.defaultOfferId) : null;
  form.lot_type = null;
  form.lot_value = "";
  availableAccounts.value = [];
  accountsLoaded.value = false;
  errorMessage.value = "";
  modeNotice.value = "";
};

const handleClose = () => {
  if (isSubmitting.value) return;
  emit("close");
};

// Watchers
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm();
      loadInitialClients();
      fetchOffers();
    }
  },
  { immediate: true },
);

watch(
  () => form.user_id,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      fetchAvailableAccounts();
    }
  },
);

watch(
  () => props.defaultOfferId,
  (defId) => {
    if (defId) form.offer_id = Number(defId);
  },
);

// Submit Handler
const handleSubmit = () => {
  if (isSubmitDisabled.value) return;

  isSubmitting.value = true;
  errorMessage.value = "";

  const payload = {
    fm_id: Number(resolvedFmId.value),
    user_id: Number(form.user_id),
    trading_account_id: Number(form.trading_account_id),
  };

  if (form.offer_id) {
    payload.offer_id = Number(form.offer_id);
  }

  if (form.lot_type) {
    payload.lot_type = form.lot_type;
  }

  if (form.lot_value && String(form.lot_value).trim()) {
    payload.lot_value = String(form.lot_value).trim();
  }

  const endpoint = urls.fm.addFollower || "/fund_managers/followers/add";

  apiRequest(urls.KEYS.POST, endpoint, {
    data: payload,
    isTokenRequired: true,
    onSuccess: (res) => {
      isSubmitting.value = false;
      const followerId = res?.data?.follower_id || res?.data?.id;
      snackbar.show(
        `Follower ${followerId ? "#" + followerId : ""} added successfully!`,
        "success",
      );
      emit("created", res?.data);
      emit("follower-added", res?.data);
      emit("close");
    },
    onFailure: (err) => {
      isSubmitting.value = false;
      const msg = err?.message || "Failed to add follower to Fund Manager.";
      errorMessage.value = msg;
      snackbar.show(msg, "error");
    },
  });
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
