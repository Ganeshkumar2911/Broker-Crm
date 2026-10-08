<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click="$emit('close')"
    >
      <div
        class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm p-6 shadow-2xl space-y-4"
        @click.stop
      >
        <div class="w-10 h-10 rounded-xl bg-primary-red/10 flex items-center justify-center text-primary-red">
          <ShieldAlert class="w-5 h-5" />
        </div>

        <div>
          <h3 class="text-sm font-bold text-primary-text">
            Disable / Reset Two-Factor Authentication?
          </h3>
          <p class="text-xs text-secondary-text mt-1.5 leading-relaxed">
            This will disable and remove the Google Authenticator setup and all backup codes for
            <strong class="text-primary-text font-semibold">{{ targetName || 'this user' }}</strong>.
            They will be able to log in with password and set up 2FA again.
          </p>
        </div>

        <div class="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            :disabled="loading"
            class="flex-1 btn-secondary py-2"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="loading"
            class="flex-1 btn-danger py-2"
            @click="$emit('confirm')"
          >
            <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ loading ? 'Processing…' : 'Disable / Reset 2FA' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ShieldAlert, Loader2 } from "lucide-vue-next";

defineProps({
  open: { type: Boolean, default: false },
  targetName: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});

defineEmits(["close", "confirm"]);
</script>
