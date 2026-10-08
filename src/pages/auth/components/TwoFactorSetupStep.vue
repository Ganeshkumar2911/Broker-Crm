<template>
  <div class="text-center">
    <!-- 1. Backup Codes Display (After confirmation) -->
    <div v-if="backupCodes.length > 0" class="text-left animate-fade-in">
      <div class="text-center mb-5">
        <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Backup Codes
        </h1>
        <p class="text-xs sm:text-sm text-white/60 mt-1.5 font-normal">
          Save these backup codes in a safe place. They will not be shown again.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2.5 bg-white/5 p-4 rounded-xl border border-white/15 mb-5 font-mono text-xs text-white text-center select-all">
        <div
          v-for="(code, idx) in backupCodes"
          :key="idx"
          class="p-2.5 bg-black/40 rounded-lg border border-white/10 tracking-wider font-semibold"
        >
          {{ code }}
        </div>
      </div>

      <div class="space-y-3">
        <button
          type="button"
          class="btn-secondary w-full py-2.5 px-4 text-xs sm:text-sm font-semibold"
          @click="copyBackupCodes"
        >
          <Copy :size="15" />
          <span>{{ copied ? "Copied to Clipboard!" : "Copy All Backup Codes" }}</span>
        </button>

        <button
          type="button"
          class="btn-primary w-full py-3 text-xs sm:text-sm font-bold shadow-sm"
          @click="$emit('completed')"
        >
          <span>Continue to Dashboard</span>
        </button>
      </div>
    </div>

    <!-- 2. QR Code Setup Screen -->
    <div v-else>
      <div class="text-center mb-5">
        <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Set Up Two-Factor Authentication
        </h1>
        <p class="text-xs sm:text-sm text-white/60 mt-1.5 font-normal">
          Scan the QR code with Google Authenticator or enter the key manually.
        </p>
      </div>

      <!-- Loading QR Code State -->
      <div v-if="setupLoading" class="py-8 flex flex-col items-center justify-center gap-2">
        <Loader2 class="w-8 h-8 animate-spin text-white" />
        <span class="text-xs text-white/60">Generating authenticator QR code…</span>
      </div>

      <div v-else class="space-y-4 text-left">
        <!-- QR Code Canvas / Image Display -->
        <div class="flex justify-center p-3 bg-white rounded-xl border border-white/20 w-fit mx-auto shadow-sm">
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="Authenticator QR Code"
            class="w-40 h-40 object-contain rounded"
          />
        </div>

        <!-- Secret Key with Copy -->
        <div v-if="secretKey" class="bg-white/5 p-3 rounded-xl border border-white/15 flex items-center justify-between gap-2">
          <div class="overflow-hidden">
            <span class="block text-[10px] text-white/50 font-medium">Secret Key:</span>
            <code class="text-xs font-mono font-bold text-white tracking-wider truncate block">
              {{ secretKey }}
            </code>
          </div>
          <button
            type="button"
            class="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Copy Secret Key"
            @click="copySecretKey"
          >
            <Copy :size="16" />
          </button>
        </div>

        <!-- Form for 6-digit confirmation code -->
        <form @submit.prevent="handleConfirmSubmit" class="space-y-4 pt-1">
          <label class="block text-xs font-semibold text-white/80">
            Enter the 6-digit code from your app:
          </label>
          <div class="flex items-center justify-center gap-2 sm:gap-2.5">
            <input
              v-for="(digit, idx) in otpDigits"
              :id="`setup-otp-${idx}`"
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

          <p v-if="errorMsg" class="text-xs text-primary-red text-center mt-2">
            {{ errorMsg }}
          </p>

          <button
            type="submit"
            :disabled="confirmLoading || otpDigits.join('').length !== 6"
            class="btn-primary w-full py-3 text-xs sm:text-sm font-bold mt-5 shadow-sm"
          >
            <Loader2 v-if="confirmLoading" :size="16" class="animate-spin text-white" />
            <span>{{ confirmLoading ? "Enabling 2FA…" : "Enable & Continue" }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { Loader2, Copy } from "lucide-vue-next";
import QRCode from "qrcode";
import { useTwoFactorStore } from "@/stores/twoFactor/twoFactor";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const props = defineProps({
  tempToken: { type: String, default: "" },
});

const emit = defineEmits(["completed"]);

const twoFactorStore = useTwoFactorStore();
const snackbar = useSnackbarStore();

const setupLoading = ref(true);
const confirmLoading = ref(false);
const qrDataUrl = ref("");
const secretKey = ref("");
const otpDigits = ref(["", "", "", "", "", ""]);
const errorMsg = ref("");
const backupCodes = ref([]);
const copied = ref(false);

onMounted(async () => {
  await fetchSetupInfo();
});

const fetchSetupInfo = async () => {
  setupLoading.value = true;
  errorMsg.value = "";
  try {
    const res = await twoFactorStore.setup2fa(props.tempToken);
    const data = res?.data || res;
    secretKey.value = data?.secret || "";

    const otpauthUri = data?.otpauth_uri || "";
    if (otpauthUri) {
      qrDataUrl.value = await QRCode.toDataURL(otpauthUri, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    }

    nextTick(() => {
      document.getElementById("setup-otp-0")?.focus();
    });
  } catch (err) {
    errorMsg.value = err?.message || err?.error || "Failed to load 2FA setup information.";
  } finally {
    setupLoading.value = false;
  }
};

const copySecretKey = () => {
  if (!secretKey.value) return;
  navigator.clipboard.writeText(secretKey.value);
  snackbar.show("Secret key copied to clipboard!", "success");
};

const copyBackupCodes = () => {
  if (backupCodes.value.length === 0) return;
  navigator.clipboard.writeText(backupCodes.value.join("\n"));
  copied.value = true;
  snackbar.show("Backup codes copied to clipboard!", "success");
  setTimeout(() => {
    copied.value = false;
  }, 3000);
};

const handleInput = (index, event) => {
  const value = event.target.value.replace(/\D/g, "");
  errorMsg.value = "";

  if (value.length > 0) {
    otpDigits.value[index] = value[0];
    if (index < 5) {
      document.getElementById(`setup-otp-${index + 1}`)?.focus();
    }
  } else {
    otpDigits.value[index] = "";
  }
};

const handleKeydown = (index, event) => {
  if (event.key === "Backspace") {
    if (!otpDigits.value[index] && index > 0) {
      otpDigits.value[index - 1] = "";
      document.getElementById(`setup-otp-${index - 1}`)?.focus();
    }
  } else if (event.key === "ArrowLeft" && index > 0) {
    document.getElementById(`setup-otp-${index - 1}`)?.focus();
  } else if (event.key === "ArrowRight" && index < 5) {
    document.getElementById(`setup-otp-${index + 1}`)?.focus();
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
  document.getElementById(`setup-otp-${focusIndex}`)?.focus();
};

const handleConfirmSubmit = async () => {
  const code = otpDigits.value.join("");
  if (code.length !== 6) {
    errorMsg.value = "Please enter all 6 digits of the code.";
    return;
  }

  confirmLoading.value = true;
  errorMsg.value = "";

  try {
    const res = await twoFactorStore.confirm2fa(code, props.tempToken);
    const data = res?.data || res;
    if (data?.backup_codes && Array.isArray(data.backup_codes)) {
      backupCodes.value = data.backup_codes;
    } else {
      emit("completed");
    }
  } catch (err) {
    errorMsg.value = err?.message || err?.error || "Invalid authenticator code. Please try again.";
  } finally {
    confirmLoading.value = false;
  }
};
</script>
