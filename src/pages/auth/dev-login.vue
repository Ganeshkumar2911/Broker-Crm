<script setup>
import { ref, reactive, onMounted } from "vue";
import { Mail, Lock, Eye, EyeOff, Loader2, Globe } from "lucide-vue-next";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import apiRequest from "@/api/request";
import authToken from "@/common/authToken";
import urls from "@/api/urls";
import { useRouter } from "vue-router";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";
import bgImage from "@/assets/Login-img.jpeg";
import BaseSelect from "@/components/common/BaseSelect.vue";

const router = useRouter();
const snackbar = useSnackbarStore();

const loading = ref(false);
const showPassword = ref(false);

const presetUrls = [
  { label: "Vaibhav Anand", value: "https://zpj8dpf6-2504.inc1.devtunnels.ms" },
  {
    label: "Pulkit 💦",
    value: "https://848ncvt5-2504.euw.devtunnels.ms",
  },
  {
    label: "Lokesh",
    value: "https://ls01t281-2504.inc1.devtunnels.ms",
  },
  {
    label: "Production",
    value: "https://1pz4zm0b-2504.euw.devtunnels.ms",
  },
  {
    label: "Sarkari",
    value: "https://w2llv2cm-2504.inc1.devtunnels.ms",
  },
];

const form = reactive({
  email: "",
  password: "",
  baseUrl: "",
});

const errors = reactive({
  email: "",
  password: "",
  baseUrl: "",
});

// Load saved custom base URL on mounted
onMounted(() => {
  const savedUrl = localStorage.getItem("custom_base_url");
  if (savedUrl) {
    form.baseUrl = savedUrl;
  }
});

// ─── Validation ─────────────────────────────────────────
const validate = () => {
  let valid = true;

  if (!form.email) {
    errors.email = "Email is required.";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
    valid = false;
  }

  if (!form.password) {
    errors.password = "Password is required.";
    valid = false;
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
    valid = false;
  }

  if (!form.baseUrl) {
    errors.baseUrl = "Base URL is required.";
    valid = false;
  } else {
    try {
      const url = new URL(form.baseUrl.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.baseUrl = "URL must start with http:// or https://";
        valid = false;
      }
    } catch (_) {
      errors.baseUrl = "Enter a valid URL.";
      valid = false;
    }
  }

  return valid;
};

const clearError = (field) => {
  errors[field] = "";
};

const resetToDefault = () => {
  form.baseUrl = "";
  localStorage.removeItem("custom_base_url");
  snackbar.show("Target Base URL reset to default.", "success");
};

// ─── API Call ─────────────────────────────────────────
const handleLogin = () => {
  if (!validate()) return;

  loading.value = true;

  // Save the custom URL first so the login request hits this URL
  localStorage.setItem("custom_base_url", form.baseUrl.trim());

  const successHandler = async (res) => {
    // ── Detect role from response body or JWT token payload ──
    let userRole = res?.role || res?.data?.role;
    const accessToken = res?.access_token || res?.data?.access_token;
    const tempToken = res?.temp_token || res?.data?.temp_token || res?.token || res?.data?.token;

    if (!userRole) {
      const tokenToInspect = accessToken || tempToken;
      if (tokenToInspect) {
        try {
          const parts = tokenToInspect.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            userRole = payload?.role;
          }
        } catch (_) {}
      }
    }

    const isSuperAdminOrAdmin = userRole === 'superadmin' || userRole === 'admin';

    // ── Check if 2FA authentication or forced setup is required (Bypassed for superadmin/admin) ──
    const is2FaRequired = !isSuperAdminOrAdmin && Boolean(
      res?.requires_2fa === true ||
      res?.data?.requires_2fa === true ||
      res?.is_2fa_enabled === true ||
      res?.data?.is_2fa_enabled === true ||
      res?.requires_2fa_setup === true ||
      res?.data?.requires_2fa_setup === true
    );

    if (is2FaRequired || (!isSuperAdminOrAdmin && tempToken && !accessToken)) {
      const isSetup = Boolean(res?.requires_2fa_setup || res?.data?.requires_2fa_setup);
      if (tempToken) {
        sessionStorage.setItem("2fa_temp_token", tempToken);
      }
      sessionStorage.setItem("2fa_email", form.email.trim());
      if (userRole) {
        sessionStorage.setItem("2fa_role", userRole);
      }
      if (isSetup) {
        sessionStorage.setItem("2fa_is_setup", "true");
      } else {
        sessionStorage.removeItem("2fa_is_setup");
      }
      loading.value = false;
      router.push({
        path: "/2fa",
        query: {
          ...(isSetup ? { setup: "true" } : {}),
        },
      });
      return;
    }

    if (accessToken) {
      authToken.setToken(accessToken, userRole);
    }
    const myPermissionsStore = useMyPermissionsStore();
    try {
      await myPermissionsStore.fetchMyPermissions(true);
    } catch (_) {
      // ignore
    }
    loading.value = false;
    snackbar.show("Connected to target host successfully.", "success");
    const targetPath = myPermissionsStore.firstAllowedPath || "/dashboard";
    router.push(targetPath).catch(() => {
      window.location.href = targetPath;
    });
  };

  const failureHandler = (err) => {
    loading.value = false;
    snackbar.show(
      err?.error || "Authentication failed on target host.",
      "error",
    );
  };

  apiRequest(urls.KEYS.POST, urls.auth.login, {
    data: {
      email: form.email,
      password: form.password,
    },
    isTokenRequired: false,
    onSuccess: successHandler,
    onFailure: failureHandler,
  });
};
</script>

<template>
  <div class="min-h-screen flex bg-[#0A0A0A]">
    <!-- LEFT SIDE -->
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

    <!-- RIGHT SIDE -->
    <div
      class="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 bg-[#0A0A0A]"
    >
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-6">
            <img
              src="/logo_full.svg"
              alt="Panther Capitals"
              class="h-12 object-contain"
            />
          </div>

          <h1 class="text-2xl font-semibold text-white">
            Developer Login Override
          </h1>

          <p class="mt-2 text-sm text-amber-500 font-medium">
            Target custom environments in production
          </p>
        </div>

        <!-- Form -->
        <div>
          <!-- Base URL Override -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-white">
                Target Base URL
              </label>
              <button
                v-if="form.baseUrl"
                type="button"
                @click="resetToDefault"
                class="text-xs text-red-400 hover:text-red-300 font-medium transition cursor-pointer"
              >
                Reset to Default
              </button>
            </div>

            <!-- Preset Dropdown + Custom Input -->
            <div class="space-y-2">
              <BaseSelect
                v-model="form.baseUrl"
                :options="presetUrls"
                placeholder="Select environment preset..."
                searchable
                local-search
                variant="surface"
                py="2.5"
                @update:modelValue="clearError('baseUrl')"
              />

              <div class="relative">
                <input
                  v-model="form.baseUrl"
                  type="text"
                  placeholder="Or enter custom URL..."
                  class="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-primary outline-none transition"
                  :class="{ 'border-red-500': errors.baseUrl }"
                  @focus="clearError('baseUrl')"
                  @keyup.enter="handleLogin"
                />
              </div>
            </div>

            <p v-if="errors.baseUrl" class="text-xs text-red-400 mt-1">
              {{ errors.baseUrl }}
            </p>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-white mb-2">
              Super Admin Email
            </label>

            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              class="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary outline-none transition"
              :class="{ 'border-red-500': errors.email }"
              @focus="clearError('email')"
            />

            <p v-if="errors.email" class="text-xs text-red-400 mt-1">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-white mb-2">
              Password
            </label>

            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-white/40 focus:border-primary outline-none transition"
                :class="{ 'border-red-500': errors.password }"
                @focus="clearError('password')"
                @keyup.enter="handleLogin"
              />

              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>

            <p v-if="errors.password" class="text-xs text-red-400 mt-1">
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit -->
          <button
            type="button"
            @click="handleLogin"
            :disabled="loading"
            class="w-full rounded-lg bg-primary py-3 text.sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{
              loading ? "Connecting..." : "Connect to Environment"
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
