<script setup>
import { ref, reactive, computed } from 'vue'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-vue-next'
import { useSnackbarStore } from '@/stores/snackbar/snackbar'
import apiRequest from '@/api/request'
import authToken from '@/common/authToken'
import urls from '@/api/urls'
import { useRouter } from 'vue-router'
import { useMyPermissionsStore } from '@/stores/rbac/myPermissions'
import logoLight from '@/assets/logo_full.svg'
// import logoDark from '@/assets/logo_dark_full.png'
import bgImage from '@/assets/Login-img.jpeg'

const router = useRouter()
const snackbar = useSnackbarStore()

const loading = ref(false)
const showPassword = ref(false)

// Compute logo based on theme in localStorage
// const logo = computed(() => {
//   const theme = localStorage.getItem('theme')
//   return theme === 'light' ? logoDark : logoLight
// })

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

// ─── Validation ─────────────────────────────────────────
const validate = () => {
  let valid = true

  if (!form.email) {
    errors.email = 'Email is required.'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    valid = false
  }

  return valid
}

const clearError = (field) => {
  errors[field] = ''
}

// ─── API Call ─────────────────────────────────────────
const handleLogin = () => {
  if (!validate()) return

  loading.value = true

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
    const targetPath = myPermissionsStore.firstAllowedPath || "/dashboard";
    router.push(targetPath).catch(() => {
      window.location.href = targetPath;
    });
  };

  const failureHandler = (err) => {
    loading.value = false
    snackbar.show(err?.error || 'Something went wrong.', 'error')
  }

  apiRequest(urls.KEYS.POST, urls.auth.login, {
    data: {
      email: form.email,
      password: form.password,
    },
    isTokenRequired: false,
    onSuccess: successHandler,
    onFailure: failureHandler,
  })
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-screen flex bg-[#0A0A0A]">

    <!-- LEFT SIDE -->
   <div class="hidden lg:flex lg:w-1/2 pl-4 pt-4">
  <div
    class="w-full h-[calc(100vh-24px)] overflow-hidden
           rounded-tr-3xl rounded-tl-3xl rounded-br-3xl rounded-bl-none
           shadow-2xl"
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
            Admin Login
          </h1>

          <p class="mt-2 text-sm text-white/60">
            Login to continue to your workspace
          </p>
        </div>

        <!-- Form -->
        <div>

          <!-- Email -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-white mb-2">
              Email Address
            </label>

            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              class="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary outline-none transition"
              :class="{ 'border-red-500': errors.email }"
              @focus="clearError('email')"
            />

            <p
              v-if="errors.email"
              class="text-xs text-red-400 mt-1"
            >
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
                class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                @click="showPassword = !showPassword"
              >
                <EyeOff
                  v-if="showPassword"
                  :size="18"
                />

                <Eye
                  v-else
                  :size="18"
                />
              </button>

            </div>

            <p
              v-if="errors.password"
              class="text-xs text-red-400 mt-1"
            >
              {{ errors.password }}
            </p>
          </div>

          <!-- Forgot -->
          <!--   <div class="flex justify-end mb-6">
            <button
              class="text-xs text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </div> -->

          <!-- Login -->
          <button
            type="button"
            :disabled="loading"
            @click="handleLogin"
            class="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-black transition hover:opacity-90 hover:cursor-pointer  disabled:opacity-60"
            style="background: linear-gradient(180deg, #E0CA3C 0%, #FFE74D 100%)"
          >
            <Loader2
              v-if="loading"
              class="animate-spin"
              :size="18"
            />

            <span>
              {{ loading ? "Logging in..." : "Login" }}
            </span>
          </button>

        </div>

        <!-- Footer -->
        <div class="mt-8">

          <!-- <p class="text-center text-sm text-white/70">
            Don't have an account?

            <button
              class="text-primary font-semibold ml-1 hover:underline"
              @click="goToRegister"
            >
              Sign Up
            </button>
          </p> -->

          <p
            class="mt-6 text-center text-[11px] leading-5 text-white/40"
          >
            Panther Capitals Ltd we don't offer services to residents of
            certain countries, including: Syria, North Korea, Iran, Iraq,
            Mauritius, USA, Canada, Sudan, Myanmar, Yemen, Afghanistan,
            Vanuatu, and those within the European Economic Area (EEA).
          </p>

          <div
            class="mt-5 flex items-center justify-center gap-2"
          >
            <button class="text-[11px] text-white/50 hover:text-white">
              Terms & Conditions
            </button>

            <span class="text-white/20">|</span>

            <button class="text-[11px] text-white/50 hover:text-white">
              Privacy Policy
            </button>

            <span class="text-white/20">|</span>

            <button class="text-[11px] text-white/50 hover:text-white">
              Risk Disclosure
            </button>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>