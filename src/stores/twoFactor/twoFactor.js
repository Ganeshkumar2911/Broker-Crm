import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import authToken from "@/common/authToken";
import router from "@/router";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useMyPermissionsStore } from "@/stores/rbac/myPermissions";

export const useTwoFactorStore = defineStore("twoFactor", () => {
  const snackbar = useSnackbarStore();

  // ─── 1. Primary State ─────────────────────────────────
  const statusData = ref({
    feature_enabled: true,
    totp_enabled: false,
    enrollment_mandatory: false,
    required_actions: [],
    issuer_name: "Panther Trade",
    backup_codes_remaining: 0,
    confirmed_at: null,
  });

  const settingsData = ref({
    is_enabled: false,
    enrollment_mandatory: false,
    require_login: false,
    require_withdrawal: false,
    require_password_change: false,
    require_profile_update: false,
    require_internal_transfer: false,
    issuer_name: "Panther Trade",
  });

  const selectedStaff2fa = ref(null);

  // ─── 2. In-Flight Tracking ────────────────────────────
  const inFlight = {
    status: false,
    settings: false,
    verifyLogin2fa: false,
    setup: false,
    confirm: false,
    disable: false,
    regenerate: false,
    saveSettings: false,
    resetUser: false,
    resetStaff: false,
    staff2fa: false,
  };

  // ─── 3. isFetched Tracking ────────────────────────────
  const isFetched = ref({
    status: false,
    settings: false,
  });

  // ─── 4. Loading & Error Flags ─────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const settingsLoading = ref(false);
  const error = ref(null);

  // ─── 5. Reset Helper ──────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      status: false,
      settings: false,
    };
  };

  // ─── 6. Get Self 2FA Status Action ────────────────────
  const get2faStatus = (force = false) => {
    if (inFlight.status) return Promise.resolve(statusData.value);
    if (isFetched.value.status && !force) return Promise.resolve(statusData.value);

    inFlight.status = true;
    loading.value = true;
    error.value = null;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const data = res?.data || res;
        if (data) {
          statusData.value = {
            feature_enabled: data.feature_enabled ?? true,
            totp_enabled: Boolean(data.totp_enabled),
            enrollment_mandatory: Boolean(data.enrollment_mandatory),
            required_actions: Array.isArray(data.required_actions) ? data.required_actions : [],
            issuer_name: data.issuer_name || "Panther Trade",
            backup_codes_remaining: data.backup_codes_remaining || 0,
            confirmed_at: data.confirmed_at || null,
          };
        }
        isFetched.value.status = true;
        resolve(statusData.value);
      };

      const failureHandler = (err) => {
        error.value = err?.message || err?.error || "Failed to fetch 2FA status";
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.status = false;
        loading.value = false;
      };

      apiRequest(urls.KEYS.GET, urls.twoFactor.status, {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 7. Setup 2FA Action (Get QR / Secret) ────────────
  const setup2fa = (customTempToken = null) => {
    const tempToken = customTempToken || sessionStorage.getItem("2fa_temp_token") || null;
    const headers = {};
    if (tempToken) {
      headers["Authorization"] = `Bearer ${tempToken}`;
    }

    inFlight.setup = true;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        resolve(res?.data || res);
      };

      const failureHandler = (err) => {
        const msg = err?.message || err?.error || "Failed to initialize 2FA setup.";
        snackbar.show(msg, "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.setup = false;
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.twoFactor.setup, {
        headers,
        isTokenRequired: !tempToken,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 8. Confirm 2FA Action (Verify Code & Activate) ───
  const confirm2fa = (code, customTempToken = null) => {
    const tempToken = customTempToken || sessionStorage.getItem("2fa_temp_token") || null;
    const headers = {};
    if (tempToken) {
      headers["Authorization"] = `Bearer ${tempToken}`;
    }

    inFlight.confirm = true;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const accessToken = res?.access_token || res?.data?.access_token || res?.token;
        const userRole = res?.role || res?.data?.role || sessionStorage.getItem("2fa_role") || "staff";
        if (accessToken) {
          authToken.setToken(accessToken, userRole);
        }

        statusData.value.totp_enabled = true;
        isFetched.value.status = false; // invalidate cache

        resolve(res?.data || res);
      };

      const failureHandler = (err) => {
        const msg = err?.message || err?.error || "Invalid 2FA verification code.";
        snackbar.show(msg, "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.confirm = false;
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.twoFactor.confirm, {
        data: {
          code: String(code).trim(),
          totp_code: String(code).trim(),
        },
        headers,
        isTokenRequired: !tempToken,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 9. Disable 2FA Action ────────────────────────────
  const disable2fa = (payload) => {
    inFlight.disable = true;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        statusData.value.totp_enabled = false;
        statusData.value.backup_codes_remaining = 0;
        isFetched.value.status = false;
        snackbar.show(res?.message || "2FA disabled successfully.", "success");
        resolve(res);
      };

      const failureHandler = (err) => {
        const msg = err?.message || err?.error || "Failed to disable 2FA.";
        snackbar.show(msg, "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.disable = false;
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.twoFactor.disable, {
        data: {
          password: payload.password,
          totp_code: payload.totp_code || undefined,
          backup_code: payload.backup_code || undefined,
        },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 10. Regenerate Backup Codes Action ───────────────
  const regenerateBackupCodes = (totpCode) => {
    inFlight.regenerate = true;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const data = res?.data || res;
        if (data?.backup_codes && Array.isArray(data.backup_codes)) {
          statusData.value.backup_codes_remaining = data.backup_codes.length;
        }
        snackbar.show(res?.message || "Backup codes regenerated successfully.", "success");
        resolve(data);
      };

      const failureHandler = (err) => {
        const msg = err?.message || err?.error || "Failed to regenerate backup codes.";
        snackbar.show(msg, "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.regenerate = false;
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.twoFactor.regenerateBackupCodes, {
        data: {
          totp_code: String(totpCode).trim(),
        },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 11. Verify Login 2FA Action (During Auth Flow) ───
  const verifyLogin2fa = (payload) => {
    if (inFlight.verifyLogin2fa) return Promise.reject(new Error("Verification in progress"));

    inFlight.verifyLogin2fa = true;
    loading.value = true;
    actionLoading.value = true;
    error.value = null;

    const tempToken = payload.temp_token || sessionStorage.getItem("2fa_temp_token") || "";

    const reqData = {};
    if (payload.totp_code) {
      reqData.totp_code = String(payload.totp_code).trim();
    }
    if (payload.backup_code) {
      reqData.backup_code = String(payload.backup_code).trim();
    }
    if (payload.dont_ask_device !== undefined) {
      reqData.dont_ask_device = payload.dont_ask_device;
    }

    return new Promise((resolve, reject) => {
      const successHandler = async (res) => {
        const accessToken = res?.access_token || res?.data?.access_token || res?.token;
        const userRole = res?.role || res?.data?.role || sessionStorage.getItem("2fa_role") || "staff";
        if (accessToken) {
          authToken.setToken(accessToken, userRole);
        }

        // Clean up temporary session
        sessionStorage.removeItem("2fa_temp_token");
        sessionStorage.removeItem("2fa_email");
        sessionStorage.removeItem("2fa_role");
        sessionStorage.removeItem("2fa_redirect");
        sessionStorage.removeItem("2fa_is_setup");

        const myPermissionsStore = useMyPermissionsStore();
        try {
          await myPermissionsStore.fetchMyPermissions(true);
        } catch (_) {
          // ignore
        }

        snackbar.show(res?.message || "Logged in successfully!", "success");

        const redirectUrl =
          payload.redirect ||
          sessionStorage.getItem("2fa_redirect") ||
          myPermissionsStore.firstAllowedPath ||
          "/dashboard";

        router.push(redirectUrl).catch(() => {
          window.location.href = redirectUrl;
        });

        resolve(res);
      };

      const failureHandler = (err) => {
        const msg = err?.error || err?.message || "Invalid verification or backup code.";
        error.value = msg;
        snackbar.show(msg, "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.verifyLogin2fa = false;
        loading.value = false;
        actionLoading.value = false;
      };

      const headers = {};
      if (tempToken) {
        headers["Authorization"] = `Bearer ${tempToken}`;
      }

      apiRequest(urls.KEYS.POST, urls.twoFactor.verifyLogin2fa, {
        data: reqData,
        headers,
        isTokenRequired: false,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 12. Fetch Platform 2FA Settings ──────────────────
  const fetchSettings = (force = false) => {
    if (inFlight.settings) return Promise.resolve(settingsData.value);
    if (isFetched.value.settings && !force) return Promise.resolve(settingsData.value);

    inFlight.settings = true;
    settingsLoading.value = true;
    error.value = null;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        if (res?.data) {
          settingsData.value = { ...res.data };
        }
        isFetched.value.settings = true;
        resolve(settingsData.value);
      };

      const failureHandler = (err) => {
        const msg = err?.message || err?.error || "Failed to load 2FA settings";
        snackbar.show(msg, "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.settings = false;
        settingsLoading.value = false;
      };

      apiRequest(urls.KEYS.GET, urls.twoFactor.settings, {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 13. Save Platform 2FA Settings ───────────────────
  const saveSettings = (payload) => {
    inFlight.saveSettings = true;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        if (res?.data) {
          settingsData.value = { ...res.data };
          isFetched.value.settings = true;
        }
        snackbar.show(res?.message || "2FA settings updated successfully", "success");
        resolve(res);
      };

      const failureHandler = (err) => {
        const msg = err?.message || err?.error || "Failed to update 2FA settings";
        snackbar.show(msg, "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.saveSettings = false;
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.PUT, urls.twoFactor.settings, {
        data: payload || settingsData.value,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 14. Reset User 2FA (Admin for Clients / Users) ───
  const resetUser2fa = (userId) => {
    inFlight.resetUser = true;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(
          res?.message || "User 2FA has been reset successfully.",
          "success"
        );
        resolve(res?.data || res);
      };

      const failureHandler = (err) => {
        const msg = err?.message || err?.error || "Failed to reset user 2FA.";
        snackbar.show(msg, "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.resetUser = false;
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.twoFactor.reset(userId), {
        data: {},
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 15. Fetch Staff 2FA Details (Superadmin) ─────────
  const fetchStaff2fa = (userId) => {
    inFlight.staff2fa = true;
    loading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        selectedStaff2fa.value = res?.data || res;
        resolve(selectedStaff2fa.value);
      };

      const failureHandler = (err) => {
        // Modal uses local fallback properties from the staff record if endpoint is not implemented on backend
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.staff2fa = false;
        loading.value = false;
      };

      apiRequest(urls.KEYS.GET, urls.twoFactor.staffStatus(userId), {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 16. Reset Staff 2FA (Superadmin) ─────────────────
  const resetStaff2fa = (userId) => {
    inFlight.resetStaff = true;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(
          res?.message || "Staff 2FA has been reset successfully.",
          "success"
        );
        resolve(res?.data || res);
      };

      const failureHandler = (err) => {
        const msg = err?.message || err?.error || "Failed to reset staff 2FA.";
        snackbar.show(msg, "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.resetStaff = false;
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.twoFactor.reset(userId), {
        data: {},
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  return {
    statusData,
    settingsData,
    selectedStaff2fa,
    loading,
    actionLoading,
    settingsLoading,
    error,
    isFetched,
    resetFetchedFlags,
    get2faStatus,
    setup2fa,
    confirm2fa,
    disable2fa,
    regenerateBackupCodes,
    verifyLogin2fa,
    fetchSettings,
    saveSettings,
    resetUser2fa,
    fetchStaff2fa,
    resetStaff2fa,
  };
});
export default useTwoFactorStore;
