<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click="$emit('close')"
    >
      <div
        class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md p-6 shadow-2xl space-y-5"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-primary-border pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck class="w-4.5 h-4.5 text-primary-green" v-if="twoFactorDetails?.totp_enabled" />
              <ShieldAlert class="w-4.5 h-4.5 text-secondary-text" v-else />
            </div>
            <div>
              <h3 class="text-base font-bold text-primary-text">
                Staff 2FA Information
              </h3>
              <p class="text-xs text-secondary-text truncate">
                {{ staff?.name }} ({{ staff?.email }})
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="py-10 flex flex-col items-center justify-center gap-2">
          <Loader2 class="w-7 h-7 animate-spin text-primary" />
          <span class="text-xs text-secondary-text">Loading 2FA details…</span>
        </div>

        <!-- Details Grid -->
        <div v-else class="space-y-3.5 text-xs">
          <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 bg-background border border-primary-border rounded-xl">
              <span class="text-[10px] text-secondary-text block">2FA Status</span>
              <span
                class="inline-flex items-center gap-1 mt-1 text-xs font-bold px-2 py-0.5 rounded-full border"
                :class="
                  twoFactorDetails?.totp_enabled
                    ? 'bg-primary-green/10 text-primary-green border-primary-green/20'
                    : 'bg-secondary-text/10 text-secondary-text border-primary-border'
                "
              >
                {{ twoFactorDetails?.totp_enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>

            <div class="p-3 bg-background border border-primary-border rounded-xl">
              <span class="text-[10px] text-secondary-text block">Backup Codes Remaining</span>
              <span class="font-bold text-primary-text mt-1 block text-sm">
                {{ twoFactorDetails?.backup_codes_remaining ?? '—' }}
              </span>
            </div>

            <div class="p-3 bg-background border border-primary-border rounded-xl">
              <span class="text-[10px] text-secondary-text block">Confirmed At</span>
              <span class="font-medium text-primary-text mt-1 block truncate">
                {{ twoFactorDetails?.confirmed_at || 'Not confirmed' }}
              </span>
            </div>

            <div class="p-3 bg-background border border-primary-border rounded-xl">
              <span class="text-[10px] text-secondary-text block">Issuer Name</span>
              <span class="font-medium text-primary-text mt-1 block truncate">
                {{ twoFactorDetails?.issuer_name || 'Panther Trade' }}
              </span>
            </div>
          </div>

          <!-- Info banner when disabled -->
          <div
            v-if="!twoFactorDetails?.totp_enabled"
            class="p-3 bg-background border border-primary-border rounded-xl text-secondary-text text-xs leading-relaxed"
          >
            Two-Factor Authentication is currently <strong class="text-primary-text font-semibold">Disabled</strong> for this staff member. If mandatory enrollment is turned on under System Settings, they will be prompted to set up 2FA upon next login.
          </div>

          <!-- Required Actions -->
          <div
            v-if="twoFactorDetails?.required_actions && twoFactorDetails.required_actions.length > 0"
            class="p-3 bg-background border border-primary-border rounded-xl"
          >
            <span class="text-[10px] text-secondary-text block mb-1">Required On</span>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="act in twoFactorDetails.required_actions"
                :key="act"
                class="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-semibold capitalize border border-primary/20"
              >
                {{ act }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-primary-border pt-4 flex items-center justify-between gap-3">
          <button
            v-if="canReset"
            type="button"
            :class="twoFactorDetails?.totp_enabled ? 'btn-danger' : 'btn-secondary'"
            @click="$emit('reset', staff)"
          >
            <ShieldOff v-if="twoFactorDetails?.totp_enabled" class="w-3.5 h-3.5" />
            <RefreshCw v-else class="w-3.5 h-3.5" />
            <span>{{ twoFactorDetails?.totp_enabled ? 'Disable 2FA' : 'Reset 2FA' }}</span>
          </button>
          <div v-else />

          <button
            type="button"
            class="btn-secondary px-4 py-2"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from "vue";
import { ShieldCheck, ShieldAlert, ShieldOff, X, Loader2, RefreshCw } from "lucide-vue-next";
import { useTwoFactorStore } from "@/stores/twoFactor/twoFactor";

const props = defineProps({
  open: { type: Boolean, default: false },
  staff: { type: Object, default: null },
  canReset: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "reset"]);

const twoFactorStore = useTwoFactorStore();
const loading = ref(false);
const twoFactorDetails = ref(null);

const fetchDetails = async () => {
  if (!props.staff?.id) return;
  loading.value = true;
  try {
    const res = await twoFactorStore.fetchStaff2fa(props.staff.id);
    twoFactorDetails.value = res?.data || res;
  } catch (_) {
    twoFactorDetails.value = {
      totp_enabled: Boolean(props.staff?.totp_enabled),
      backup_codes_remaining: 0,
      confirmed_at: props.staff?.totp_confirmed_at || null,
    };
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      twoFactorDetails.value = null;
      fetchDetails();
    }
  }
);
</script>
