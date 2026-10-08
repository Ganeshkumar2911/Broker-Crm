<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-background border border-primary-border rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
    >
      <div class="space-y-1.5 max-w-2xl">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"
          >
            <ShieldCheck class="w-4.5 h-4.5" />
          </div>
          <h3 class="text-base font-bold text-primary-text">
            Two-Factor Authentication (2FA)
          </h3>
        </div>
        <p class="text-xs text-secondary-text leading-relaxed">
          Manage global Google Authenticator rules and requirements. These rules apply platform-wide across all clients and staff.
        </p>
      </div>
    </div>

    <!-- Main Settings Card -->
    <div
      v-if="hasPermission(['two_factor.view'])"
      class="bg-card-background border border-primary-border rounded-2xl p-6 shadow-xs"
    >
      <div v-if="twoFactorStore.settingsLoading" class="flex justify-center p-8">
        <Loader2 class="w-6 h-6 animate-spin text-primary" />
      </div>

      <div v-else class="space-y-8">
        <!-- Global Switches -->
        <div class="space-y-5">
          <div class="flex items-center gap-3">
            <input
              id="is_enabled"
              type="checkbox"
              v-model="localForm.is_enabled"
              class="custom-checkbox"
            />
            <label for="is_enabled" class="text-sm font-semibold text-primary-text cursor-pointer select-none">
              Feature enabled
            </label>
          </div>
          <div class="flex items-center gap-3">
            <input
              id="enrollment_mandatory"
              type="checkbox"
              v-model="localForm.enrollment_mandatory"
              class="custom-checkbox"
            />
            <label for="enrollment_mandatory" class="text-sm font-semibold text-primary-text cursor-pointer select-none">
              Force all users to enroll
            </label>
          </div>
        </div>

        <div class="border-t border-primary-border pt-6">
          <h4 class="text-sm font-bold text-primary-text mb-1.5">Where to require code</h4>
          <p class="text-xs text-secondary-text mb-5 max-w-2xl">
            These “require on …” rules only ask for an authenticator code when the user has already turned on 2FA. Use “Force all users to enroll” if everyone must set it up.
          </p>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <input
                id="require_login"
                type="checkbox"
                v-model="localForm.require_login"
                class="custom-checkbox"
              />
              <label for="require_login" class="text-sm font-medium text-primary-text cursor-pointer select-none">
                Require on login
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="require_withdrawal"
                type="checkbox"
                v-model="localForm.require_withdrawal"
                class="custom-checkbox"
              />
              <label for="require_withdrawal" class="text-sm font-medium text-primary-text cursor-pointer select-none">
                Require on withdrawal
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="require_password_change"
                type="checkbox"
                v-model="localForm.require_password_change"
                class="custom-checkbox"
              />
              <label for="require_password_change" class="text-sm font-medium text-primary-text cursor-pointer select-none">
                Require on password change
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="require_profile_update"
                type="checkbox"
                v-model="localForm.require_profile_update"
                class="custom-checkbox"
              />
              <label for="require_profile_update" class="text-sm font-medium text-primary-text cursor-pointer select-none">
                Require on profile update
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="require_internal_transfer"
                type="checkbox"
                v-model="localForm.require_internal_transfer"
                class="custom-checkbox"
              />
              <label for="require_internal_transfer" class="text-sm font-medium text-primary-text cursor-pointer select-none">
                Require on internal transfer
              </label>
            </div>
          </div>
        </div>

        <div class="border-t border-primary-border pt-6 max-w-sm">
          <label class="block text-xs font-bold text-primary-text mb-1.5">
            Issuer name
          </label>
          <input
            type="text"
            v-model="localForm.issuer_name"
            placeholder="e.g. Panther Trade"
            class="input-field px-3.5 py-2.5 text-xs font-medium"
          />
          <span class="text-[11px] text-secondary-text mt-1 block">
            Label shown inside Google Authenticator app for users.
          </span>
        </div>

        <div class="border-t border-primary-border pt-6 flex justify-end gap-3" v-if="hasPermission(['two_factor.update'])">
          <button
            type="button"
            @click="loadSettings"
            :disabled="twoFactorStore.actionLoading || twoFactorStore.settingsLoading"
            class="btn-secondary px-4 py-2"
          >
            Reload
          </button>
          <button
            type="button"
            @click="handleSaveSettings"
            :disabled="twoFactorStore.actionLoading || twoFactorStore.settingsLoading"
            class="btn-primary px-4 py-2"
          >
            <Loader2 v-if="twoFactorStore.actionLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ twoFactorStore.actionLoading ? "Saving..." : "Save Changes" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { ShieldCheck, Loader2 } from "lucide-vue-next";
import { useTwoFactorStore } from "@/stores/twoFactor/twoFactor";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { usePermissionCheck } from "@/composables/usePermissionCheck";

const twoFactorStore = useTwoFactorStore();
const snackbar = useSnackbarStore();
const { hasPermission } = usePermissionCheck();

const localForm = ref({
  is_enabled: false,
  enrollment_mandatory: false,
  require_login: false,
  require_withdrawal: false,
  require_password_change: false,
  require_profile_update: false,
  require_internal_transfer: false,
  issuer_name: "Panther Trade",
});

const syncLocalForm = () => {
  localForm.value = { ...twoFactorStore.settingsData };
};

const loadSettings = async () => {
  try {
    await twoFactorStore.fetchSettings(true);
    syncLocalForm();
  } catch (_) {
    // snackbar handled in store
  }
};

const handleSaveSettings = async () => {
  if (!localForm.value.issuer_name?.trim()) {
    snackbar.show("Issuer name is required", "error");
    return;
  }

  try {
    await twoFactorStore.saveSettings(localForm.value);
    syncLocalForm();
  } catch (_) {
    // snackbar handled in store
  }
};

watch(
  () => twoFactorStore.settingsData,
  () => {
    syncLocalForm();
  },
  { deep: true }
);

onMounted(() => {
  if (hasPermission(["two_factor.view"])) {
    loadSettings();
  }
});
</script>
