<template>
  <div class="min-h-screen flex bg-[#0A0A0A]">
    <!-- LEFT SIDE HERO IMAGE -->
    <div class="hidden lg:flex lg:w-1/2 pl-4 pt-4">
      <div
        class="w-full h-[calc(100vh-24px)] overflow-hidden rounded-tr-3xl rounded-tl-3xl rounded-br-3xl rounded-bl-none shadow-2xl"
      >
        <img
          :src="bgImage"
          alt="Login Background"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- RIGHT SIDE AUTH / SETUP CONTAINER -->
    <div
      class="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 bg-[#0A0A0A]"
    >
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-6">
          <div class="flex justify-center mb-4">
            <img
              src="/logo_full.svg"
              alt="Panther Capitals"
              class="h-12 object-contain"
            />
          </div>
        </div>

        <!-- 1. Forced 2FA Setup Step -->
        <TwoFactorSetupStep
          v-if="isSetupMode"
          :temp-token="tempToken"
          @completed="handleSetupCompleted"
        />

        <!-- 2. Standard 2FA Verification Step -->
        <TwoFactorAuthStep
          v-else
          :loading="twoFactorStore.loading || isSubmitting"
          :resend-timer="resendTimer"
          :error="error"
          @submit="handleVerify"
          @resend="restartTimer"
        />

        <!-- Footer -->
        <div class="mt-8 text-center">
          <button
            type="button"
            @click="backToLogin"
            class="text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            ← Back to Login
          </button>

          <p class="mt-6 text-center text-[11px] leading-5 text-white/40">
            Panther Capitals Ltd we don't offer services to residents of certain
            countries, including: Syria, North Korea, Iran, Iraq, Mauritius, USA,
            Canada, Sudan, Myanmar, Yemen, Afghanistan, Vanuatu, and those within
            the European Economic Area (EEA).
          </p>

          <div class="mt-5 flex items-center justify-center gap-2">
            <button class="text-[11px] text-white/50 hover:text-white cursor-pointer">
              Terms & Conditions
            </button>
            <span class="text-white/20">|</span>
            <button class="text-[11px] text-white/50 hover:text-white cursor-pointer">
              Privacy Policy
            </button>
            <span class="text-white/20">|</span>
            <button class="text-[11px] text-white/50 hover:text-white cursor-pointer">
              Risk Disclosure
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTwoFactorStore } from "@/stores/twoFactor/twoFactor";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import authToken from "@/common/authToken";
import bgImage from "@/assets/Login-img.jpeg";
import TwoFactorAuthStep from "./components/TwoFactorAuthStep.vue";
import TwoFactorSetupStep from "./components/TwoFactorSetupStep.vue";

const route = useRoute();
const router = useRouter();
const twoFactorStore = useTwoFactorStore();
const snackbar = useSnackbarStore();

const isSubmitting = ref(false);
const error = ref("");
const resendTimer = ref(30);
let timerInterval = null;

const tempToken = computed(() => {
  return (
    sessionStorage.getItem("2fa_temp_token") ||
    route.query.temp_token ||
    route.query.token ||
    ""
  );
});

const isSetupMode = computed(() => {
  return (
    sessionStorage.getItem("2fa_is_setup") === "true" ||
    route.query.setup === "true"
  );
});

onMounted(() => {
  startTimer();

  // If no temporary token found and not authenticated, redirect to login
  const token = authToken.getToken().accessToken;
  if (!tempToken.value && !token) {
    snackbar.show("Session expired. Please log in again.", "info");
    router.replace({
      path: "/login",
      query: route.query,
    });
  }
});

const startTimer = () => {
  resendTimer.value = 30;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
};

const restartTimer = () => {
  startTimer();
};

const handleVerify = async (payload) => {
  if (isSubmitting.value || twoFactorStore.loading) return;

  error.value = "";
  isSubmitting.value = true;

  try {
    await twoFactorStore.verifyLogin2fa({
      totp_code: payload.totp_code,
      backup_code: payload.backup_code,
      dont_ask_device: payload.dont_ask_device,
      temp_token: tempToken.value,
      redirect: route.query.redirect,
    });
  } catch (err) {
    error.value =
      err?.error ||
      err?.message ||
      "Invalid verification code. Please check and try again.";
  } finally {
    isSubmitting.value = false;
  }
};

const handleSetupCompleted = () => {
  const redirectUrl =
    route.query.redirect ||
    sessionStorage.getItem("2fa_redirect") ||
    "/dashboard";

  // Clean up
  sessionStorage.removeItem("2fa_temp_token");
  sessionStorage.removeItem("2fa_email");
  sessionStorage.removeItem("2fa_role");
  sessionStorage.removeItem("2fa_redirect");
  sessionStorage.removeItem("2fa_is_setup");

  router.push(redirectUrl).catch(() => {
    window.location.href = redirectUrl;
  });
};

const backToLogin = () => {
  sessionStorage.removeItem("2fa_temp_token");
  sessionStorage.removeItem("2fa_email");
  sessionStorage.removeItem("2fa_role");
  sessionStorage.removeItem("2fa_redirect");
  sessionStorage.removeItem("2fa_is_setup");
  router.push("/login");
};

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
