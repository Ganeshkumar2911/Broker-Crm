<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  Sliders,
  CheckCircle2,
  RotateCcw,
  Info,
  Loader2,
  Lock,
} from "lucide-vue-next";
import { useWatchlistStore } from "@/stores/watchlist/watchlist";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const store = useWatchlistStore();
const { hasPermission } = usePermissionCheck();

const canUpdateSettings = computed(() => {
  return hasPermission("watchlist.settings_update");
});

const form = ref({
  max_watchlists_per_user: 5,
  max_symbols_per_watchlist: 50,
});

const isDirty = ref(false);

onMounted(() => {
  store.fetchSettings();
});

watch(
  () => store.settings,
  (val) => {
    if (val) {
      form.value = {
        max_watchlists_per_user: val.max_watchlists_per_user ?? 5,
        max_symbols_per_watchlist: val.max_symbols_per_watchlist ?? 50,
      };
      isDirty.value = false;
    }
  },
  { immediate: true, deep: true },
);

function onFieldChange() {
  if (!canUpdateSettings.value) return;
  isDirty.value = true;
}

async function handleSave() {
  if (!canUpdateSettings.value) return;
  await store.saveSettings({
    max_watchlists_per_user: Number(form.value.max_watchlists_per_user) || 0,
    max_symbols_per_watchlist:
      Number(form.value.max_symbols_per_watchlist) || 0,
  });
  isDirty.value = false;
}

function handleReset() {
  form.value = {
    max_watchlists_per_user: store.settings.max_watchlists_per_user ?? 5,
    max_symbols_per_watchlist: store.settings.max_symbols_per_watchlist ?? 50,
  };
  isDirty.value = false;
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header Summary -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div>
        <h2 class="text-xl font-bold text-primary-text">Watchlist Settings</h2>
        <p class="text-xs text-secondary-text mt-1">
          Global limit caps apply to all clients and fund managers across the
          platform.
        </p>
      </div>
      <!-- <div class="flex items-center gap-2">
        <span
          class="text-xs font-mono text-secondary-text bg-card-background border border-primary-border px-3 py-1.5 rounded-lg"
        >
          PATCH /admin/watchlist/settings
        </span>
      </div> -->
    </div>

    <!-- Main Settings Card -->
    <div
      class="bg-card-background border border-primary-border rounded-2xl p-6 shadow-sm"
    >
      <div
        class="flex items-center gap-2.5 pb-4 mb-6 border-b border-primary-border"
      >
        <div
          class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
        >
          <Sliders class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-primary-text">
            Limits & Thresholds
          </h3>
          <p class="text-xs text-secondary-text">
            Configure watchlist quotas and maximum capacity
          </p>
        </div>
      </div>

      <!-- Settings Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Max Watchlists per user -->
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-secondary-text uppercase tracking-wider"
          >
            Max Watchlists Per User
          </label>
          <input
            v-model.number="form.max_watchlists_per_user"
            type="number"
            min="0"
            :disabled="!canUpdateSettings || store.settingsSaving"
            placeholder="0 for unlimited"
            class="input-field px-4 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            @input="onFieldChange"
          />
          <p class="text-xs text-secondary-text flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
            Set to <code class="text-primary font-mono font-medium">0</code> or
            empty for unlimited watchlists.
          </p>
        </div>

        <!-- Max Symbols per watchlist -->
        <div class="space-y-2">
          <label
            class="block text-xs font-semibold text-secondary-text uppercase tracking-wider"
          >
            Max Symbols Per Watchlist
          </label>
          <input
            v-model.number="form.max_symbols_per_watchlist"
            type="number"
            min="0"
            :disabled="!canUpdateSettings || store.settingsSaving"
            placeholder="0 for unlimited"
            class="input-field px-4 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            @input="onFieldChange"
          />
          <p class="text-xs text-secondary-text flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
            Enforced in real-time when clients or fund managers add symbols.
          </p>
        </div>
      </div>

      <!-- Informational Callout Box -->
      <div
        class="mt-6 p-4 rounded-xl bg-background border border-primary-border/80 flex items-start gap-3"
      >
        <Info class="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div class="text-xs text-secondary-text leading-relaxed">
          <span class="font-semibold text-primary-text">Policy Behavior:</span>
          Changing these limits does not remove existing watchlists or assigned
          symbols. New creations and additions are blocked once the user reaches
          the configured threshold.
        </div>
      </div>

      <!-- Action Buttons -->
      <div
        v-if="canUpdateSettings"
        class="mt-8 pt-5 border-t border-primary-border flex items-center gap-3"
      >
        <button
          type="button"
          :disabled="store.settingsSaving"
          class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
          @click="handleSave"
        >
          <Loader2 v-if="store.settingsSaving" class="w-4 h-4 animate-spin" />
          <CheckCircle2 v-else class="w-4 h-4" />
          <span>{{
            store.settingsSaving ? "Saving Changes..." : "Save Settings"
          }}</span>
        </button>

        <button
          type="button"
          :disabled="store.settingsSaving"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          @click="handleReset"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Reset Draft</span>
        </button>
      </div>
      <div
        v-else
        class="mt-8 pt-5 border-t border-primary-border flex items-center gap-2 text-xs text-secondary-text"
      >
        <Lock class="w-3.5 h-3.5" />
        <span>You have view-only access to Watchlist Settings.</span>
      </div>
    </div>
  </div>
</template>
