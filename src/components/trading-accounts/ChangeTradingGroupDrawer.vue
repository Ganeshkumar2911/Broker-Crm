<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="closeDrawer"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0"
        >
          <div>
            <div class="flex items-center gap-2">
              <Layers class="h-4 w-4 text-primary" />
              <h3 class="text-sm font-semibold text-primary-text">
                Change Trading Group
              </h3>
            </div>
            <p class="text-[11px] text-secondary-text mt-0.5">
              Account #{{ accountNumber }} · {{ clientName }} (User ID:
              {{ userId }})
            </p>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition cursor-pointer"
            @click="closeDrawer"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <!-- Current Account Details Card -->
          <div
            class="bg-background/50 border border-primary-border rounded-xl p-4 space-y-4"
          >
            <div
              class="flex items-center justify-between border-b border-primary-border/60 pb-2.5"
            >
              <span
                class="text-xs font-semibold text-primary-text flex items-center gap-1.5"
              >
                <User class="w-3.5 h-3.5 text-secondary-text" /> Account Summary
              </span>
              <span
                class="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase"
                :class="
                  account?.is_active
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-primary-red/10 text-primary-red border-primary-red/20'
                "
              >
                {{ account?.is_active ? "Active" : "Inactive" }}
              </span>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-secondary-text block text-[11px]"
                  >Account ID</span
                >
                <span class="font-medium font-mono text-primary-text">{{
                  accountId || "—"
                }}</span>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px]"
                  >Account Number</span
                >
                <span class="font-medium font-mono text-primary-text">{{
                  accountNumber
                }}</span>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px]"
                  >Current Category</span
                >
                <span class="font-medium text-primary-text uppercase">{{
                  account?.account_category || "—"
                }}</span>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px]"
                  >Account Type</span
                >
                <span class="font-medium text-primary-text capitalize">{{
                  account?.account_type || account?.trading_type || "—"
                }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-secondary-text block text-[11px]"
                  >Current Broker Group</span
                >
                <span
                  class="font-mono font-medium text-primary-text break-all bg-background p-1.5 rounded border border-primary-border/60 block mt-0.5 text-[11px]"
                >
                  {{ account?.broker_group || "—" }}
                </span>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px]"
                  >Server</span
                >
                <span class="font-medium text-primary-text">{{
                  account?.server || "—"
                }}</span>
              </div>
              <div>
                <span class="text-secondary-text block text-[11px]"
                  >Broker / Platform</span
                >
                <span class="font-medium text-primary-text">{{
                  account?.broker || "—"
                }}</span>
              </div>
              <div v-if="account?.badge">
                <span class="text-secondary-text block text-[11px]">Badge</span>
                <span class="font-medium text-primary-text">{{
                  account.badge
                }}</span>
              </div>
              <div v-if="account?.broker_leverage">
                <span class="text-secondary-text block text-[11px]"
                  >Leverage</span
                >
                <span class="font-medium text-primary-text"
                  >1:{{ account.broker_leverage }}</span
                >
              </div>
            </div>

            <!-- Financial Metrics Strip -->
            <div
              class="grid grid-cols-3 gap-2 pt-3 border-t border-primary-border/60 text-[11px]"
            >
              <div
                class="bg-background/80 p-2 rounded-lg border border-primary-border/40"
              >
                <span class="text-secondary-text block text-[10px]"
                  >Balance</span
                >
                <span class="font-semibold text-primary-text font-mono"
                  >${{ formatNum(account?.balance) }}</span
                >
              </div>
              <div
                class="bg-background/80 p-2 rounded-lg border border-primary-border/40"
              >
                <span class="text-secondary-text block text-[10px]"
                  >Equity</span
                >
                <span class="font-semibold text-primary-text font-mono"
                  >${{ formatNum(account?.equity) }}</span
                >
              </div>
              <div
                class="bg-background/80 p-2 rounded-lg border border-primary-border/40"
              >
                <span class="text-secondary-text block text-[10px]">PnL</span>
                <span
                  class="font-semibold font-mono"
                  :class="
                    Number(account?.pnl ?? 0) >= 0
                      ? 'text-primary-green'
                      : 'text-primary-red'
                  "
                >
                  {{ Number(account?.pnl ?? 0) >= 0 ? "+" : "" }}${{
                    formatNum(account?.pnl)
                  }}
                </span>
              </div>
            </div>

            <!-- Client Info Collapsible / Summary -->
            <div
              v-if="account?.user"
              class="pt-2 border-t border-primary-border/60 text-[11px] space-y-1"
            >
              <span
                class="text-secondary-text block text-[10px] font-semibold uppercase"
                >Client Profile</span
              >
              <div class="flex items-center justify-between text-primary-text">
                <span>{{ account.user.name }} ({{ account.user.email }})</span>
                <span
                  class="text-secondary-text capitalize"
                  v-if="account.user.country"
                  >{{ account.user.country }}</span
                >
              </div>
            </div>
          </div>

          <!-- Select New Group Section -->
          <div class="space-y-4">
            <h4
              class="text-xs font-semibold text-primary-text uppercase tracking-wide flex items-center gap-1.5"
            >
              <Filter class="w-3.5 h-3.5 text-primary" /> Select New Broker
              Group
            </h4>

            <!-- Category Selection -->
            <div>
              <label
                class="block text-xs text-secondary-text font-medium mb-1.5"
                >Account Category</label
              >
              <BaseSelect
                v-model="selectedCategory"
                :options="categoryOptions"
                placeholder="Select an Account Category"
                :is-loading="changeGroupStore.categoriesLoading"
                searchable
                top
                variant="surface"
                @update:model-value="handleCategoryChange"
              />
            </div>

            <!-- Account Type -->
            <div v-if="selectedCategory">
              <label
                class="block text-xs text-secondary-text font-medium mb-1.5"
                >Account Type</label
              >
              <div
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize bg-primary/10 text-primary border-primary/20 select-none"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    accountType === 'live'
                      ? 'bg-primary-green'
                      : 'bg-primary-yellow'
                  "
                />
                <span>{{ accountType }}</span>
              </div>
            </div>

            <!-- MT5 Groups List -->
            <div v-if="selectedCategory">
              <label
                class="block text-xs text-secondary-text font-medium mb-1.5"
              >
                Available Groups (Added)
              </label>

              <!-- Loading State -->
              <div
                v-if="changeGroupStore.mt5GroupsLoading"
                class="p-6 text-center text-xs text-secondary-text flex items-center justify-center gap-2"
              >
                <Loader2 class="w-4 h-4 animate-spin text-primary" /> Fetching
                group configurations...
              </div>

              <!-- Empty State -->
              <div
                v-else-if="addedGroups.length === 0"
                class="p-4 rounded-xl border border-dashed border-primary-border bg-background/40 text-center text-xs text-secondary-text"
              >
                No active added groups found for category
                <span class="font-semibold uppercase text-primary-text">{{
                  selectedCategory
                }}</span>
                ({{ accountType }}).
              </div>

              <!-- Available Groups Cards -->
              <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
                <div
                  v-for="grp in addedGroups"
                  :key="grp.config_id || grp.group"
                  class="p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none"
                  :class="
                    selectedGroupObj?.group === grp.group
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-primary-border bg-background/60 hover:border-primary-border/80 hover:bg-background'
                  "
                  @click="selectedGroupObj = grp"
                >
                  <div class="mt-0.5">
                    <div
                      class="w-4 h-4 rounded-full border flex items-center justify-center"
                      :class="
                        selectedGroupObj?.group === grp.group
                          ? 'border-primary bg-primary'
                          : 'border-primary-border'
                      "
                    >
                      <div
                        v-if="selectedGroupObj?.group === grp.group"
                        class="w-1.5 h-1.5 rounded-full bg-white"
                      />
                    </div>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <span
                        class="text-xs font-semibold text-primary-text truncate"
                      >
                        {{ grp.label || grp.badge || "Group" }}
                      </span>
                      <div class="flex items-center gap-1 shrink-0">
                        <span
                          v-if="grp.badge"
                          class="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
                        >
                          {{ grp.badge }}
                        </span>
                        <span
                          v-if="grp.is_default"
                          class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium"
                        >
                          Default
                        </span>
                      </div>
                    </div>

                    <p
                      class="text-[11px] font-mono text-secondary-text truncate mt-1"
                    >
                      {{ grp.group }}
                    </p>

                    <div
                      class="flex items-center gap-3 text-[10px] text-secondary-text mt-1.5"
                    >
                      <span
                        >Currency:
                        <strong class="text-primary-text">{{
                          grp.currency
                        }}</strong></span
                      >
                      <span v-if="grp.leverage"
                        >Leverage:
                        <strong class="text-primary-text"
                          >1:{{ grp.leverage }}</strong
                        ></span
                      >
                      <span v-if="grp.margin_mode" class="capitalize"
                        >Margin: {{ grp.margin_mode.replace("_", " ") }}</span
                      >
                    </div>

                    <p
                      v-if="account?.broker_group === grp.group"
                      class="text-[10px] text-primary-blue font-medium mt-1"
                    >
                      (Current Group)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-6 py-4 border-t border-primary-border bg-card-background flex items-center gap-3 shrink-0"
        >
          <button
            type="button"
            class="flex-1 rounded-lg border border-primary-border px-4 py-2.5 text-xs font-medium text-secondary-text transition-colors hover:bg-background hover:text-primary-text disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            :disabled="changeGroupStore.submitting"
            @click="closeDrawer"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            :disabled="
              changeGroupStore.submitting ||
              !selectedGroupObj?.group ||
              selectedGroupObj?.group === account?.broker_group
            "
            @click="submitChangeGroup"
          >
            <Loader2
              v-if="changeGroupStore.submitting"
              class="h-3.5 w-3.5 animate-spin"
            />
            <span>{{
              changeGroupStore.submitting ? "Updating..." : "Change Group"
            }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { X, Layers, User, Filter, Loader2 } from "lucide-vue-next";
import { useChangeBrokerGroupStore } from "@/stores/tradingAccounts/changeBrokerGroup";
import BaseSelect from "@/components/common/BaseSelect.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  account: { type: Object, default: null },
});

const emit = defineEmits(["close", "updated"]);

const changeGroupStore = useChangeBrokerGroupStore();

const selectedCategory = ref("");
const selectedGroupObj = ref(null);

const accountId = computed(
  () => props.account?.account_id ?? props.account?.id ?? null,
);
const accountNumber = computed(
  () => props.account?.account_number ?? accountId.value ?? "—",
);
const userId = computed(
  () => props.account?.user_id ?? props.account?.user?.id ?? "—",
);
const clientName = computed(
  () => props.account?.client_name || props.account?.user?.name || "—",
);
const accountType = computed(
  () => props.account?.account_type || props.account?.trading_type || "live",
);

const categoryOptions = computed(() => {
  return (changeGroupStore.categories || []).map((cat) => ({
    label: `${cat.account_category} (${cat.total_mt5_groups ?? 0} groups)`,
    value: cat.account_category,
  }));
});

// User requirement: "and from this respnce we will show only one which are is_added: true only to the user"
const addedGroups = computed(() => {
  return changeGroupStore.mt5Groups.filter((g) => g.is_added === true);
});

const formatNum = (val) =>
  Number(val ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedCategory.value = props.account?.account_category || "";
      selectedGroupObj.value = null;

      changeGroupStore.fetchCategories();

      if (selectedCategory.value) {
        changeGroupStore.fetchMt5Groups(
          selectedCategory.value,
          accountType.value,
        );
      }
    } else {
      selectedCategory.value = "";
      selectedGroupObj.value = null;
    }
  },
);

const handleCategoryChange = () => {
  selectedGroupObj.value = null;
  if (selectedCategory.value) {
    changeGroupStore.fetchMt5Groups(selectedCategory.value, accountType.value);
  }
};

const closeDrawer = () => {
  if (changeGroupStore.submitting) return;
  emit("close");
};

const submitChangeGroup = () => {
  if (
    changeGroupStore.submitting ||
    !selectedGroupObj.value?.group ||
    !userId.value ||
    !accountId.value
  ) {
    return;
  }

  const payload = {
    user_id: userId.value,
    trading_account_id: accountId.value,
    broker_group: selectedGroupObj.value.group,
  };

  changeGroupStore.changeBrokerGroup(payload, () => {
    emit("updated");
    emit("close");
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
