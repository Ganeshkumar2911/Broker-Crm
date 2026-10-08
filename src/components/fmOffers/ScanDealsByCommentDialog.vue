<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-5xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-primary-border shrink-0"
        >
          <div>
            <h3 class="text-lg font-bold text-primary-text">
              Scan Deals by Comment
            </h3>
            <p class="text-xs text-secondary-text mt-0.5">
              Scan MT5 deals across all followers of FM #{{ fmId }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-auto p-4 space-y-5">
          <!-- Filters -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div class="lg:col-span-2">
              <label
                class="block text-xs font-semibold text-secondary-text mb-1"
                >Comment String <span class="text-rose-500">*</span></label
              >
              <input
                v-model="form.comment"
                type="text"
                placeholder="e.g. Performance fee"
                class="w-full h-9 px-3 text-xs rounded-lg bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-secondary-text mb-1"
                >Offer (Optional)</label
              >
              <BaseSelect
                v-model="form.offer_id"
                :options="offerOptions"
                class="w-full h-9"
                py="1.5"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-secondary-text mb-1"
                >Match Mode</label
              >
              <BaseSelect
                v-model="form.match"
                :options="matchModes"
                class="w-full h-9"
                py="1.5"
              />
            </div>
            <div class="lg:col-span-2">
              <label
                class="block text-xs font-semibold text-secondary-text mb-1"
                >Date Range (Optional)</label
              >
              <BaseDatePicker
                v-model="dateRange"
                mode="range"
                py="1.5"
                value-format="YYYY-MM-DD"
                placeholder="Select date range"
                disable-future
              />
            </div>
          </div>

          <div
            class="flex flex-wrap items-center gap-6 bg-background/50 p-3 rounded-lg border border-primary-border"
          >
            <label
              class="flex items-center gap-2 cursor-pointer text-sm font-medium text-primary-text"
            >
              <input
                v-model="form.case_sensitive"
                type="checkbox"
                class="rounded border-primary-border bg-background w-4 h-4 accent-primary"
              />
              Case Sensitive
            </label>
            <label
              class="flex items-center gap-2 cursor-pointer text-sm font-medium text-primary-text"
            >
              <input
                v-model="form.include_deals"
                type="checkbox"
                class="rounded border-primary-border bg-background w-4 h-4 accent-primary"
              />
              Include Deal Records
              <span
                class="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded ml-1"
                >Slower</span
              >
            </label>
            <div class="flex-1 min-w-5"></div>
            <button
              @click="handleScan"
              :disabled="loading || !form.comment"
              class="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors"
            >
              <Search class="w-4 h-4" v-if="!loading" />
              <RotateCw class="w-4 h-4 animate-spin" v-else />
              {{ loading ? "Scanning..." : "Scan Deals" }}
            </button>
          </div>

          <div
            v-if="result && result.errors && result.errors.length"
            class="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-xs text-rose-500"
          >
            <div class="font-bold flex items-center gap-1.5 mb-1">
              <AlertTriangle class="w-4 h-4" /> Warnings ({{
                result.errors.length
              }})
            </div>
            <ul class="list-disc pl-5 space-y-0.5 opacity-90">
              <li v-for="(err, i) in result.errors.slice(0, 5)" :key="i">
                Follower {{ err.follower_id }} (Acc: {{ err.account_number }}):
                {{ err.message || err.error }}
              </li>
              <li v-if="result.errors.length > 5">
                ...and {{ result.errors.length - 5 }} more.
              </li>
            </ul>
          </div>

          <!-- Summary -->
          <div v-if="result" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              class="bg-card-background border border-primary-border rounded-xl p-4 shadow-2xs"
            >
              <div
                class="text-[11px] text-secondary-text uppercase font-bold tracking-wide"
              >
                Followers Scanned
              </div>
              <div class="text-xl font-black text-primary-text mt-1">
                {{ result.summary.followers_scanned }}
              </div>
            </div>
            <div
              class="bg-card-background border border-primary-border rounded-xl p-4 shadow-2xs"
            >
              <div
                class="text-[11px] text-secondary-text uppercase font-bold tracking-wide"
              >
                With Matches
              </div>
              <div class="text-xl font-black text-primary-text mt-1">
                {{ result.summary.followers_with_matches }}
              </div>
            </div>
            <div
              class="bg-card-background border border-primary-border rounded-xl p-4 shadow-2xs"
            >
              <div
                class="text-[11px] text-secondary-text uppercase font-bold tracking-wide"
              >
                Total Deals
              </div>
              <div class="text-xl font-black text-primary-text mt-1">
                {{ result.summary.total_deals }}
              </div>
            </div>
            <div
              class="bg-card-background border border-primary-border rounded-xl p-4 shadow-2xs"
            >
              <div
                class="text-[11px] text-secondary-text uppercase font-bold tracking-wide"
              >
                Total Net USD
              </div>
              <div
                class="text-xl font-black mt-1"
                :class="
                  result.summary.total_net_usd < 0
                    ? 'text-rose-500'
                    : 'text-emerald-500'
                "
              >
                {{ formatAmount(result.summary.total_net_usd) }}
              </div>
            </div>
          </div>

          <!-- Table -->
          <div
            v-if="result && result.rows.length"
            class="overflow-x-auto border border-primary-border rounded-xl"
          >
            <table class="w-full text-left text-xs whitespace-nowrap">
              <thead
                class="bg-background/80 border-b border-primary-border text-secondary-text uppercase text-[10px] font-bold tracking-wider"
              >
                <tr>
                  <th class="px-4 py-3">Follower</th>
                  <th class="px-4 py-3">Account</th>
                  <th class="px-4 py-3">Offer</th>
                  <th class="px-4 py-3 text-right">Deals</th>
                  <th class="px-4 py-3 text-right">Volume</th>
                  <th class="px-4 py-3 text-right">Performance Fee (USD)</th>
                  <th class="px-4 py-3 text-right">Comm USD</th>
                  <!-- <th class="px-4 py-3 text-right">Swap USD</th> -->
                  <th class="px-4 py-3 text-right">Net USD</th>
                  <th class="px-4 py-3 text-center" v-if="form.include_deals">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody
                class="divide-y divide-primary-border/60 text-primary-text bg-card-background"
              >
                <template v-for="row in result.rows" :key="row.follower_id">
                  <tr class="hover:bg-background/50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="font-bold">{{ row.user_name || "—" }}</div>
                      <div class="text-[10px] text-secondary-text">
                        {{ row.user_email || "—" }}
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="font-mono font-bold">
                        {{ row.account_number }}
                      </div>
                      <div
                        class="text-[10px] uppercase font-semibold text-secondary-text mt-0.5"
                      >
                        {{ row.broker_currency || "USD" }}
                        <!-- <span v-if="row.is_cent" class="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm ml-1 border border-primary/20">CENT</span> -->
                      </div>
                    </td>
                    <td class="px-4 py-3 font-medium">
                      {{ row.offer_name || "—" }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono font-medium">
                      {{ row.deal_count }}
                    </td>
                    <td class="px-4 py-3 text-right font-mono">
                      {{ fmt(row.volume_lots) }}
                    </td>
                    <td
                      class="px-4 py-3 text-right font-mono"
                      :class="
                        row.profit_usd < 0
                          ? 'text-rose-500'
                          : 'text-emerald-500'
                      "
                    >
                      {{ formatAmount(row.profit_usd, row.broker_currency) }}
                    </td>
                    <td
                      class="px-4 py-3 text-right font-mono"
                      :class="
                        row.commission_usd < 0
                          ? 'text-rose-500'
                          : 'text-emerald-500'
                      "
                    >
                      {{
                        formatAmount(row.commission_usd, row.broker_currency)
                      }}
                    </td>
                    <!-- <td class="px-4 py-3 text-right font-mono" :class="row.swap_usd < 0 ? 'text-rose-500' : 'text-emerald-500'">{{ formatAmount(row.swap_usd, row.broker_currency) }}</td> -->
                    <td
                      class="px-4 py-3 text-right font-bold font-mono"
                      :class="
                        row.net_usd < 0 ? 'text-rose-500' : 'text-emerald-500'
                      "
                    >
                      {{ formatAmount(row.net_usd, row.broker_currency) }}
                    </td>
                    <td class="px-4 py-3 text-center" v-if="form.include_deals">
                      <button
                        @click="toggleRow(row.follower_id)"
                        class="px-2.5 py-1 rounded-md border border-primary-border text-primary hover:bg-primary/10 font-medium text-[11px] transition-colors"
                      >
                        {{
                          expandedRows.includes(row.follower_id)
                            ? "Hide Deals"
                            : "View Deals"
                        }}
                      </button>
                    </td>
                  </tr>
                  <tr
                    v-if="
                      form.include_deals &&
                      expandedRows.includes(row.follower_id) &&
                      row.deals
                    "
                  >
                    <td colspan="10" class="p-0 border-b-0">
                      <div
                        class="bg-background/80 p-4 border-y border-primary-border/60 shadow-inner"
                      >
                        <div
                          class="font-bold text-xs mb-2 text-primary-text flex items-center gap-2"
                        >
                          <List class="w-4 h-4 text-secondary-text" /> Matching
                          Deals ({{ row.deals.length }})
                        </div>
                        <div
                          class="overflow-x-auto border border-primary-border rounded-lg bg-card-background"
                        >
                          <table
                            class="w-full text-left text-[11px] whitespace-nowrap"
                          >
                            <thead
                              class="bg-background border-b border-primary-border/60 text-secondary-text font-semibold uppercase tracking-wider text-[9px]"
                            >
                              <tr>
                                <th class="px-3 py-2">Ticket</th>
                                <th class="px-3 py-2">Time</th>
                                <th class="px-3 py-2">Symbol</th>
                                <th class="px-3 py-2">Action</th>
                                <th class="px-3 py-2 text-right">Volume</th>
                                <th class="px-3 py-2 text-right">Price</th>
                                <th class="px-3 py-2 text-right">Profit</th>
                                <th class="px-3 py-2 text-right">Net USD</th>
                                <th class="px-3 py-2">Comment</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-primary-border/40">
                              <tr
                                v-for="deal in row.deals"
                                :key="deal.deal"
                                class="hover:bg-background/30"
                              >
                                <td class="px-3 py-2 font-mono font-medium">
                                  {{ deal.deal }}
                                </td>
                                <td class="px-3 py-2 text-secondary-text">
                                  {{ deal.time }}
                                </td>
                                <td class="px-3 py-2 font-bold">
                                  {{ deal.symbol }}
                                </td>
                                <td
                                  class="px-3 py-2 font-bold"
                                  :class="
                                    deal.action === 0
                                      ? 'text-blue-500'
                                      : deal.action === 1
                                        ? 'text-rose-500'
                                        : ''
                                  "
                                >
                                  {{
                                    deal.action === 0
                                      ? "BUY"
                                      : deal.action === 1
                                        ? "SELL"
                                        : deal.action
                                  }}
                                </td>
                                <td class="px-3 py-2 text-right font-mono">
                                  {{ fmt(deal.volume_lots) }}
                                </td>
                                <td
                                  class="px-3 py-2 text-right font-mono text-secondary-text"
                                >
                                  {{ deal.price }}
                                </td>
                                <td
                                  class="px-3 py-2 text-right font-mono"
                                  :class="
                                    deal.profit_usd < 0
                                      ? 'text-rose-500'
                                      : 'text-emerald-500'
                                  "
                                >
                                  {{
                                    formatAmount(
                                      deal.profit_usd,
                                      row.broker_currency,
                                      row.is_cent,
                                    )
                                  }}
                                </td>
                                <td
                                  class="px-3 py-2 text-right font-bold font-mono"
                                  :class="
                                    deal.profit_usd +
                                      deal.commission_usd +
                                      deal.swap_usd <
                                    0
                                      ? 'text-rose-500'
                                      : 'text-emerald-500'
                                  "
                                >
                                  {{
                                    formatAmount(
                                      deal.profit_usd +
                                        deal.commission_usd +
                                        deal.swap_usd,
                                      row.broker_currency,
                                      row.is_cent,
                                    )
                                  }}
                                </td>
                                <td
                                  class="px-3 py-2 text-secondary-text max-w-50 truncate"
                                  :title="deal.comment"
                                >
                                  {{ deal.comment }}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <div
            v-else-if="result"
            class="flex flex-col items-center justify-center py-16 border border-dashed border-primary-border rounded-xl bg-background/50"
          >
            <Search class="w-10 h-10 text-secondary-text/50 mb-3" />
            <p class="text-sm font-bold text-primary-text">
              No matching deals found.
            </p>
            <p class="text-xs text-secondary-text mt-1">
              Try broadening your search criteria.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { X, Search, RotateCw, AlertTriangle, List } from "lucide-vue-next";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  open: Boolean,
  fmId: {
    type: [Number, String],
    required: true,
  },
});
const emit = defineEmits(["close"]);
const snackbar = useSnackbarStore();

const matchModes = [
  { label: "Starts With", value: "starts_with" },
  { label: "Ends With", value: "ends_with" },
  { label: "Contains", value: "contains" },
  { label: "Exact Match", value: "exact" },
];

const form = reactive({
  comment: "Performance fee",
  match: "starts_with",
  offer_id: "",
  from_date: "",
  to_date: "",
  case_sensitive: false,
  include_deals: false,
});

const offers = ref([]);
const offerOptions = computed(() => {
  if (!offers.value || offers.value.length === 0) {
    return [{ label: "No Offers Available", value: "" }];
  }
  const opts = [{ label: "All Offers", value: "" }];
  offers.value.forEach((o) => {
    opts.push({
      label: o.name || o.offer_code || `Offer #${o.id}`,
      value: String(o.id),
    });
  });
  return opts;
});

const fetchOffers = () => {
  if (!props.fmId) return;
  apiRequest(urls.KEYS.GET, `${urls.fm.offers}/${props.fmId}`, {
    isTokenRequired: true,
    onSuccess: (res) => {
      offers.value = res?.data || [];
    },
  });
};

const dateRange = computed({
  get: () => {
    if (!form.from_date && !form.to_date) return null;
    return [form.from_date || null, form.to_date || null];
  },
  set: (val) => {
    if (Array.isArray(val)) {
      form.from_date = val[0] || "";
      form.to_date = val[1] || "";
    } else if (val && typeof val === "object") {
      form.from_date = val.start || "";
      form.to_date = val.end || "";
    } else {
      form.from_date = "";
      form.to_date = "";
    }
  },
});

const loading = ref(false);
const result = ref(null);
const expandedRows = ref([]);

const toggleRow = (id) => {
  if (expandedRows.value.includes(id)) {
    expandedRows.value = expandedRows.value.filter((i) => i !== id);
  } else {
    expandedRows.value.push(id);
  }
};

const fmt = (val) => {
  const num = Number(val ?? 0);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatAmount = (val) => {
  const num = Number(val ?? 0);
  if (isNaN(num)) return "0.00";
  const formatted = Math.abs(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return num < 0 ? `-${formatted}` : formatted;
};

const handleScan = () => {
  if (!props.fmId || !form.comment) return;
  loading.value = true;
  result.value = null;
  expandedRows.value = [];

  const payload = {
    comment: form.comment,
    match: form.match,
    case_sensitive: form.case_sensitive,
    include_deals: form.include_deals,
  };

  if (form.from_date) payload.from_date = form.from_date;
  if (form.to_date) payload.to_date = form.to_date;
  if (form.offer_id) payload.offer_id = Number(form.offer_id);

  apiRequest(urls.KEYS.POST, urls.fm.dealsByComment(props.fmId), {
    data: payload,
    isTokenRequired: true,
    timeout: 120000, // Important: 120s timeout since it scans MT5
    onSuccess: (res) => {
      result.value = res;
    },
    onFailure: (err) => {
      snackbar.show(
        err?.message || err?.error || "Failed to scan deals",
        "error",
      );
    },
    onFinally: () => {
      loading.value = false;
    },
  });
};

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      // Reset on open if you want, or keep previous state
      if (!form.comment) {
        form.comment = "Performance fee";
      }
      fetchOffers();
    }
  },
);
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
