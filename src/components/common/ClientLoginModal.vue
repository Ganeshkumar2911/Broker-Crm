<script setup>
import { ref } from "vue";
import {
  LogIn,
  X,
  Loader2,
  ExternalLink,
  ShieldAlert,
  User,
  Mail,
  Phone,
  Globe,
} from "lucide-vue-next";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { getFlagCode, cleanCountryLabel } from "@/utils/countries";

const props = defineProps({
  open: { type: Boolean, default: false },
  client: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "success"]);

const snackbar = useSnackbarStore();
const loading = ref(false);

const handleProceedLogin = () => {
  if (!props.client?.id) return;
  loading.value = true;

  const successHandler = (res) => {
    loading.value = false;
    const secretCode = res?.data?.secret_code;
    if (secretCode) {
      snackbar.show(
        res?.message || "User dashboard secret token retrieved.",
        "success",
      );
      window.open(
        `https://portal.panthercapitals.com/login/user?token=${secretCode}`,
        "_blank",
      );
      emit("success");
      emit("close");
    } else {
      snackbar.show(res?.message || "Failed to retrieve secret code.", "error");
    }
  };

  const failureHandler = (err) => {
    loading.value = false;
    snackbar.show(
      err?.message ||
        err?.error ||
        "Failed to initialize client dashboard login.",
      "error",
    );
  };

  apiRequest(urls.KEYS.GET, urls.clientList.userDashboard, {
    look_up_key: props.client.id,
    isTokenRequired: true,
    onSuccess: successHandler,
    onFailure: failureHandler,
  });
};
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-all duration-300"
    @click="emit('close')"
  >
    <div
      class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md shadow-2xl overflow-hidden transform scale-100 transition-all duration-300"
      @click.stop
    >
      <!-- Header -->
      <div
        class="px-6 py-4 border-b border-primary-border flex items-center justify-between bg-card-background shrink-0"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
          >
            <LogIn class="w-4 h-4" />
          </div>
          <h2 class="text-sm font-bold text-primary-text">
            Login to Client Dashboard
          </h2>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4 bg-card-background">
        <!-- Target Domain Notice Banner -->
        <div
          class="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3"
        >
          <ShieldAlert class="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p
              class="text-xs font-semibold text-primary-text flex items-center gap-1.5"
            >
              <span>Redirecting to Client Portal</span>
              <span
                class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono"
              >
                portal.panthercapitals.com
              </span>
            </p>
            <p class="text-[11px] text-secondary-text leading-relaxed">
              You will be logged into the client's dashboard on
              <strong>portal.panthercapitals.com</strong> using a secure
              single-use access code.
            </p>
          </div>
        </div>

        <!-- Client Details Card -->
        <div
          class="bg-background border border-primary-border rounded-xl p-4 space-y-3"
        >
          <div
            class="flex items-center justify-between border-b border-primary-border/60 pb-2 font-medium"
          >
            <p class="text-[10px] uppercase tracking-wider text-secondary-text">
              Target Client Details
            </p>
            <span
              class="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20 font-mono"
            >
              ID: {{ client?.id || "—" }}
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <!-- Full Name -->
            <div class="flex items-center justify-between">
              <span
                class="text-secondary-text flex items-center gap-1.5 text-[11px]"
              >
                <User class="w-3.5 h-3.5 text-primary" />
                <span>Full Name:</span>
              </span>
              <span class="font-bold text-primary-text">
                {{
                  client?.name ||
                  `${client?.first_name || ""} ${client?.last_name || ""}`.trim() ||
                  "—"
                }}
              </span>
            </div>

            <!-- Email -->
            <div class="flex items-center justify-between">
              <span
                class="text-secondary-text flex items-center gap-1.5 text-[11px]"
              >
                <Mail class="text-primary w-3.5 h-3.5" />
                <span>Email Address:</span>
              </span>
              <span class="font-mono text-primary-text truncate max-w-[200px]">
                {{ client?.email || "—" }}
              </span>
            </div>

            <!-- Phone -->
            <div v-if="client?.phone" class="flex items-center justify-between">
              <span
                class="text-secondary-text flex items-center gap-1.5 text-[11px]"
              >
                <Phone class="w-3.5 h-3.5 text-primary" />
                <span>Phone:</span>
              </span>
              <span class="font-medium text-primary-text">
                {{ client?.phone }}
              </span>
            </div>

            <!-- Country -->
            <div
              v-if="client?.country"
              class="flex items-center justify-between"
            >
              <span
                class="text-secondary-text flex items-center gap-1.5 text-[11px]"
              >
                <Globe class="w-3.5 h-3.5 text-primary" />
                <span>Country:</span>
              </span>
              <span
                class="font-medium text-primary-text flex items-center gap-1.5"
              >
                <span
                  v-if="getFlagCode(client?.country)"
                  :class="[
                    'fi',
                    `fi-${getFlagCode(client?.country)}`,
                    'fis',
                    'w-4 h-3 flex-shrink-0',
                  ]"
                ></span>
                <span>{{ cleanCountryLabel(client?.country) || "—" }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-6 py-4 border-t border-primary-border flex gap-3 bg-card-background"
      >
        <button
          :disabled="loading"
          class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors disabled:opacity-60 cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          :disabled="loading"
          class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-btn-text-primary bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
          @click="handleProceedLogin"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <template v-else>
            <span>Proceed to Dashboard</span>
            <ExternalLink class="w-3.5 h-3.5" />
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
