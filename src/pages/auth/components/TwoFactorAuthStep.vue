<template>
  <div class="text-center">
    <!-- Heading & Subheading -->
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-white tracking-tight">
        Two-Factor Authentication
      </h1>
      <p class="text-xs sm:text-sm text-white/60 mt-1.5 font-normal">
        {{
          isBackupMode
            ? "Enter an 8-character backup code from your saved codes."
            : "Enter the 6-digit verification code from your authenticator app to continue."
        }}
      </p>
    </div>

    <!-- 2FA Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4 text-left">
      <!-- 1. TOTP 6-digit input boxes -->
      <div v-if="!isBackupMode" class="flex items-center justify-center gap-2 sm:gap-2.5 my-6">
        <input
          v-for="(digit, idx) in otpDigits"
          :id="`two-factor-box-${idx}`"
          :key="idx"
          v-model="otpDigits[idx]"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          class="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-2xl font-bold rounded-xl border border-white/15 bg-white/5 text-white outline-none transition-colors focus:border-primary focus:bg-white/10"
          :class="{
            '!border-primary-green !bg-primary-green/10 !text-primary-green': otpDigits[idx],
            '!border-primary-red ring-1 ring-primary-red/20': errorMsg,
          }"
          @input="handleInput(idx, $event)"
          @keydown="handleKeydown(idx, $event)"
          @paste="handlePaste"
        />
      </div>

      <!-- 2. Backup Code single input -->
      <div v-else class="my-6">
        <label class="block text-xs font-semibold text-white/80 mb-1.5">
          Backup Code
        </label>
        <input
          id="backup-code-input"
          v-model="backupCode"
          type="text"
          placeholder="e.g. A1B2-C3D4"
          maxlength="14"
          class="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder:text-white/30 text-sm outline-none focus:border-primary font-mono uppercase tracking-widest text-center transition-colors"
          :class="{ '!border-primary-red ring-1 ring-primary-red/20': errorMsg }"
          @input="errorMsg = ''"
        />
      </div>

      <!-- Don't ask again on this device checkbox -->
      <div class="flex items-center justify-start gap-2 select-none pt-1">
        <label class="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
          <input
            v-model="dontAskDevice"
            type="checkbox"
            class="custom-checkbox"
          />
          <span class="text-xs text-white/70">Don't ask again on this device</span>
        </label>
        <span
          class="inline-flex items-center text-white/40 hover:text-white cursor-help p-0.5 transition-colors"
          title="Trust this browser for 30 days"
        >
          <Info :size="13" class="stroke-[2.2]" />
        </span>
      </div>

      <!-- Error Message -->
      <p v-if="errorMsg" class="text-xs text-primary-red text-center mt-2">
        {{ errorMsg }}
      </p>

      <!-- Submit / Verify Button -->
      <button
        type="submit"
        :disabled="loading || isSubmitDisabled"
        class="btn-primary w-full py-3 text-sm font-bold mt-5 shadow-sm"
      >
        <Loader2 v-if="loading" :size="16" class="animate-spin text-white" />
        <span>{{ loading ? "Verifying…" : (isBackupMode ? "Verify Backup Code" : "Verify Code") }}</span>
      </button>

      <!-- Use a different method Link -->
      <div class="text-center pt-2">
        <button
          type="button"
          class="text-xs font-semibold text-white/80 hover:text-white hover:underline transition-colors cursor-pointer"
          @click="toggleMethod"
        >
          {{ isBackupMode ? "Use Authenticator App" : "Use a backup code instead" }}
        </button>
      </div>

      <!-- Help Prompt & Countdown Timer -->
      <p class="text-center text-xs text-white/50 pt-4 leading-relaxed">
        Didn't receive the code? Check your
        <strong class="text-white font-semibold">Google Authenticator app</strong>
        or try again in
        <strong class="text-white font-semibold">{{ resendTimer > 0 ? `${resendTimer}s` : "a moment." }}</strong>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { Loader2, Info } from "lucide-vue-next";

const props = defineProps({
  loading: { type: Boolean, default: false },
  resendTimer: { type: Number, default: 30 },
  error: { type: String, default: "" },
});

const emit = defineEmits(["submit", "resend"]);

const otpDigits = ref(["", "", "", "", "", ""]);
const backupCode = ref("");
const isBackupMode = ref(false);
const dontAskDevice = ref(false);
const errorMsg = ref(props.error);

watch(
  () => props.error,
  (newErr) => {
    errorMsg.value = newErr || "";
  }
);

onMounted(() => {
  focusFirstInput();
});

const focusFirstInput = () => {
  nextTick(() => {
    if (isBackupMode.value) {
      document.getElementById("backup-code-input")?.focus();
    } else {
      document.getElementById("two-factor-box-0")?.focus();
    }
  });
};

const isSubmitDisabled = computed(() => {
  if (isBackupMode.value) {
    return !backupCode.value.trim();
  }
  return otpDigits.value.join("").length !== 6;
});

const handleInput = (index, event) => {
  const value = event.target.value.replace(/\D/g, "");
  errorMsg.value = "";

  if (value.length > 0) {
    otpDigits.value[index] = value[0];
    if (index < 5) {
      document.getElementById(`two-factor-box-${index + 1}`)?.focus();
    }
  } else {
    otpDigits.value[index] = "";
  }

  // Auto-submit if all 6 digits entered
  const currentCode = otpDigits.value.join("");
  if (currentCode.length === 6 && !props.loading) {
    handleSubmit();
  }
};

const handleKeydown = (index, event) => {
  if (event.key === "Backspace") {
    if (!otpDigits.value[index] && index > 0) {
      otpDigits.value[index - 1] = "";
      document.getElementById(`two-factor-box-${index - 1}`)?.focus();
    }
  } else if (event.key === "ArrowLeft" && index > 0) {
    document.getElementById(`two-factor-box-${index - 1}`)?.focus();
  } else if (event.key === "ArrowRight" && index < 5) {
    document.getElementById(`two-factor-box-${index + 1}`)?.focus();
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const pasted = (event.clipboardData || window.clipboardData).getData("text");
  const digits = pasted.replace(/\D/g, "").slice(0, 6);
  if (!digits) return;

  for (let i = 0; i < 6; i++) {
    otpDigits.value[i] = digits[i] || "";
  }
  const focusIndex = Math.min(digits.length, 5);
  document.getElementById(`two-factor-box-${focusIndex}`)?.focus();

  if (digits.length === 6 && !props.loading) {
    handleSubmit();
  }
};

const toggleMethod = () => {
  isBackupMode.value = !isBackupMode.value;
  errorMsg.value = "";
  focusFirstInput();
};

const handleSubmit = () => {
  if (isBackupMode.value) {
    const code = backupCode.value.trim();
    if (!code) {
      errorMsg.value = "Please enter your backup code.";
      return;
    }
    emit("submit", {
      backup_code: code,
      dont_ask_device: dontAskDevice.value,
    });
  } else {
    const code = otpDigits.value.join("");
    if (code.length !== 6) {
      errorMsg.value = "Please enter all 6 digits of the verification code.";
      return;
    }
    emit("submit", {
      totp_code: code,
      dont_ask_device: dontAskDevice.value,
    });
  }
};
</script>
