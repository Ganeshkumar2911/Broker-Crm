<template>
  <div>
    <!-- Backdrop Overlay -->
    <Transition name="backdrop">
      <div
        class="fixed inset-0 z-100 bg-black/50 backdrop-blur-xs cursor-pointer"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer">
      <div
        class="fixed right-0 top-0 bottom-0 z-101 w-full max-w-lg bg-card-background border-l border-primary-border flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex justify-between items-center p-5 border-b border-primary-border shrink-0 bg-card-background/90 backdrop-blur-md">
          <h3 class="text-lg font-semibold text-primary-text">Edit Program Settings</h3>
          <button @click="$emit('close')" class="text-secondary-text hover:text-primary-text cursor-pointer">
            <HugeIcon :icon="Cancel01Icon" :size="20" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Status</label>
          <BaseSelect
            v-model="formData.status"
            :options="[
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Paused', value: 'paused' },
              { label: 'Ended', value: 'ended' }
            ]"
            placeholder="Select Status"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Name</label>
          <input v-model="formData.name" type="text" class="input-field px-3 py-2 text-sm w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-secondary-text mb-1">Description</label>
          <textarea v-model="formData.description" rows="3" class="input-field px-3 py-2 text-sm w-full"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-text mb-1">Currency</label>
            <input v-model="formData.currency" type="text" class="input-field px-3 py-2 text-sm w-full uppercase" />
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-text mb-1">Min Redemption Amount</label>
            <input v-model="formData.min_redemption_amount" type="number" step="0.01" class="input-field px-3 py-2 text-sm w-full" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-text mb-1">Plan Lock Days</label>
            <input v-model="formData.plan_lock_days" type="number" min="0" step="1" class="input-field px-3 py-2 text-sm w-full" />
            <p class="text-[11px] text-secondary-text mt-0.5">0 = no lock (default 30)</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-text mb-1">Min Trade Duration (sec)</label>
            <input v-model="formData.min_trade_duration_seconds" type="number" min="0" step="1" class="input-field px-3 py-2 text-sm w-full" />
            <p class="text-[11px] text-secondary-text mt-0.5">Hold time strictly required to earn (0 = disabled, default 120s)</p>
          </div>
        </div>

        <!-- Eligibility Rules -->
        <div class="pt-4 border-t border-primary-border">
          <h4 class="text-sm font-semibold text-primary-text mb-3">Eligibility Rules</h4>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <label class="flex items-center gap-2 text-sm text-secondary-text">
              <input type="checkbox" v-model="formData.eligibility_rules.require_kyc" class="rounded border-primary-border bg-background text-primary" />
              Require KYC
            </label>
            <label class="flex items-center gap-2 text-sm text-secondary-text">
              <input type="checkbox" v-model="formData.eligibility_rules.require_live" class="rounded border-primary-border bg-background text-primary" />
              Require Live
            </label>
            <label class="flex items-center gap-2 text-sm text-secondary-text">
              <input type="checkbox" v-model="formData.eligibility_rules.exclude_copy_accounts" class="rounded border-primary-border bg-background text-primary" />
              Exclude Copy Accounts
            </label>
            <label class="flex items-center gap-2 text-sm text-secondary-text">
              <input type="checkbox" v-model="formData.eligibility_rules.earn_on_copy_fills" class="rounded border-primary-border bg-background text-primary" />
              Earn on Copy Fills
            </label>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1">Trading Types (comma separated)</label>
              <input v-model="formData.eligibility_rules.trading_types" type="text" placeholder="e.g. real" class="input-field px-3 py-1.5 text-sm w-full" />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1">Exclude Account Categories (comma separated)</label>
              <input v-model="formData.eligibility_rules.exclude_account_categories" type="text" placeholder="e.g. cent, pamm" class="input-field px-3 py-1.5 text-sm w-full" />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1">Exclude Account Roles (comma separated)</label>
              <input v-model="formData.eligibility_rules.exclude_account_roles" type="text" placeholder="e.g. follower, master" class="input-field px-3 py-1.5 text-sm w-full" />
            </div>
            <div>
              <label class="block text-xs font-medium text-secondary-text mb-1">Allowed Group Codes (leave empty for all)</label>
              <input v-model="formData.eligibility_rules.allowed_group_codes" type="text" placeholder="e.g. GROUP_A, GROUP_B" class="input-field px-3 py-1.5 text-sm w-full" />
            </div>
          </div>
        </div>

        <!-- Instrument Rules -->
        <div class="pt-4 border-t border-primary-border">
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-sm font-semibold text-primary-text">Instrument Rules</h4>
            <button type="button" @click="addInstrumentRule" class="text-xs text-primary hover:underline font-medium cursor-pointer">
              + Add Rule
            </button>
          </div>
          
          <label class="flex items-center gap-2 text-sm text-secondary-text mb-4">
            <input type="checkbox" v-model="formData.instrument_rules.normalize_suffixes" class="rounded border-primary-border bg-background text-primary" />
            Normalize Suffixes
          </label>

          <div v-if="formData.instrument_rules.rules.length === 0" class="text-xs text-secondary-text italic mb-2">
            No rules defined. All symbols are eligible by default.
          </div>

          <div class="space-y-3">
            <div v-for="(rule, index) in formData.instrument_rules.rules" :key="index" class="p-3 bg-background border border-primary-border rounded-lg relative">
              <button type="button" @click="removeInstrumentRule(index)" class="absolute top-2 right-2 text-secondary-text hover:text-primary-red cursor-pointer">
                <HugeIcon :icon="Cancel01Icon" :size="14" />
              </button>
              
              <div class="grid grid-cols-2 gap-3 mb-3 pr-6">
                <div>
                  <label class="block text-xs font-medium text-secondary-text mb-1">Match Type</label>
                  <BaseSelect
                    v-model="rule.match"
                    :options="[{ label: 'Exact', value: 'exact' }, { label: 'Prefix', value: 'prefix' }]"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-secondary-text mb-1">Priority</label>
                  <input v-model="rule.priority" type="number" step="1" class="input-field px-3 py-1.5 text-sm w-full" />
                </div>
              </div>
              
              <div class="mb-3">
                <label class="flex items-center gap-2 text-sm text-secondary-text">
                  <input type="checkbox" v-model="rule.eligible" class="rounded border-primary-border bg-background text-primary" />
                  Eligible for Cashback
                </label>
              </div>

              <div v-if="rule.match === 'exact'">
                <label class="block text-xs font-medium text-secondary-text mb-1">Symbols (comma separated)</label>
                <input v-model="rule._symbolsStr" type="text" placeholder="e.g. XAUUSD, EURUSD" class="input-field px-3 py-1.5 text-sm w-full uppercase" />
              </div>
              <div v-if="rule.match === 'prefix'">
                <label class="block text-xs font-medium text-secondary-text mb-1">Prefix Pattern</label>
                <input v-model="rule.pattern" type="text" placeholder="e.g. XAU" class="input-field px-3 py-1.5 text-sm w-full uppercase" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 p-5 border-t border-primary-border bg-card-background shrink-0">
        <button
          type="button"
          class="flex-1 px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text border border-primary-border rounded-lg cursor-pointer transition hover:bg-background"
          @click="$emit('close')"
          :disabled="store.actionLoading"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center justify-center gap-2 cursor-pointer transition"
          @click="handleSubmit"
          :disabled="store.actionLoading"
        >
          <HugeIcon v-if="store.actionLoading" :icon="Loading03Icon" :size="16" class="animate-spin" />
          Save Changes
        </button>
      </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { useCashbackStore } from "@/stores/cashback/cashback";

const props = defineProps({
  program: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const store = useCashbackStore();

const parseArray = (str) => {
  if (!str || str.trim() === "") return null;
  return str.split(',').map(s => s.trim()).filter(Boolean);
};

const joinArray = (arr) => {
  if (!arr || !Array.isArray(arr)) return "";
  return arr.join(", ");
};

const formData = ref({
  status: props.program.status,
  name: props.program.name,
  description: props.program.description,
  min_redemption_amount: props.program.min_redemption_amount,
  plan_lock_days: props.program.plan_lock_days ?? 30,
  min_trade_duration_seconds: props.program.min_trade_duration_seconds ?? 120,
  currency: props.program.currency ?? 'USD',
  instrument_rules: {
    normalize_suffixes: props.program.instrument_rules?.normalize_suffixes ?? true,
    rules: (props.program.instrument_rules?.rules || []).map(r => ({
      ...r,
      _symbolsStr: r.symbols ? r.symbols.join(", ") : ""
    }))
  },
  eligibility_rules: {
    require_kyc: props.program.eligibility_rules?.require_kyc ?? false,
    require_live: props.program.eligibility_rules?.require_live ?? true,
    exclude_copy_accounts: props.program.eligibility_rules?.exclude_copy_accounts ?? true,
    earn_on_copy_fills: props.program.eligibility_rules?.earn_on_copy_fills ?? false,
    trading_types: joinArray(props.program.eligibility_rules?.trading_types),
    exclude_account_categories: joinArray(props.program.eligibility_rules?.exclude_account_categories),
    exclude_account_roles: joinArray(props.program.eligibility_rules?.exclude_account_roles),
    allowed_group_codes: joinArray(props.program.eligibility_rules?.allowed_group_codes),
  }
});

const addInstrumentRule = () => {
  formData.value.instrument_rules.rules.push({
    match: "exact",
    eligible: true,
    priority: formData.value.instrument_rules.rules.length + 1,
    _symbolsStr: "",
    pattern: "",
  });
};

const removeInstrumentRule = (index) => {
  formData.value.instrument_rules.rules.splice(index, 1);
};

const handleSubmit = async () => {
  const payload = {};

  if (formData.value.status !== props.program.status) payload.status = formData.value.status;
  if (formData.value.name !== props.program.name) payload.name = formData.value.name;
  if (formData.value.description !== props.program.description) payload.description = formData.value.description;
  if (formData.value.min_redemption_amount !== props.program.min_redemption_amount) payload.min_redemption_amount = formData.value.min_redemption_amount;
  if (formData.value.plan_lock_days !== '' && Number(formData.value.plan_lock_days) !== Number(props.program.plan_lock_days ?? 30)) {
    payload.plan_lock_days = Math.max(0, parseInt(formData.value.plan_lock_days, 10) || 0);
  }
  if (formData.value.min_trade_duration_seconds !== '' && Number(formData.value.min_trade_duration_seconds) !== Number(props.program.min_trade_duration_seconds ?? 120)) {
    payload.min_trade_duration_seconds = Math.max(0, parseInt(formData.value.min_trade_duration_seconds, 10) || 0);
  }
  if (formData.value.currency !== (props.program.currency ?? 'USD')) payload.currency = formData.value.currency;

  const newInstrumentRules = {
    normalize_suffixes: formData.value.instrument_rules.normalize_suffixes,
    rules: formData.value.instrument_rules.rules.map(r => {
      const rule = { match: r.match, eligible: r.eligible, priority: r.priority };
      if (r.match === 'exact') {
        rule.symbols = parseArray(r._symbolsStr) || [];
      } else {
        rule.pattern = r.pattern;
      }
      return rule;
    })
  };

  const oldInstrumentRules = props.program.instrument_rules || { normalize_suffixes: true, rules: [] };
  if (JSON.stringify(newInstrumentRules) !== JSON.stringify(oldInstrumentRules)) {
    payload.instrument_rules = newInstrumentRules;
  }

  const newEligibility = {
    ...formData.value.eligibility_rules,
    trading_types: parseArray(formData.value.eligibility_rules.trading_types) || ["real"],
    exclude_account_categories: parseArray(formData.value.eligibility_rules.exclude_account_categories),
    exclude_account_roles: parseArray(formData.value.eligibility_rules.exclude_account_roles),
    allowed_group_codes: parseArray(formData.value.eligibility_rules.allowed_group_codes),
  };

  if (JSON.stringify(newEligibility) !== JSON.stringify(props.program.eligibility_rules || {})) {
    payload.eligibility_rules = newEligibility;
  }

  if (Object.keys(payload).length === 0) {
    emit("close");
    return;
  }

  await store.updateProgram(props.program.id, payload);
  if (!store.error) {
    emit("close");
  }
};
</script>
