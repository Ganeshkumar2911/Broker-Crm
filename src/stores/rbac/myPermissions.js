import { ref, computed } from "vue";
import { defineStore } from "pinia";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { navItems } from "@/config/navItems";

export const useMyPermissionsStore = defineStore("myPermissions", () => {
  const permissions = ref({});
  const userId = ref(null);
  const loading = ref(false);
  const isFetched = ref(false);
  const error = ref(null);

  // Flattened set of permission codes for fast lookup e.g. 'analytics.view'
  const userCodes = computed(() => {
    const codes = new Set();
    const raw = permissions.value;
    if (!raw) return codes;

    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        if (typeof item === "string" && item) codes.add(item);
        else if (item?.code) codes.add(item.code);
      });
      return codes;
    }

    Object.values(raw).forEach((permList) => {
      if (Array.isArray(permList)) {
        permList.forEach((item) => {
          if (typeof item === "string" && item) codes.add(item);
          else if (item?.code) codes.add(item.code);
        });
      }
    });
    return codes;
  });

  const hasNoPermissions = computed(() => {
    return isFetched.value && userCodes.value.size === 0;
  });

  // Check if user has a specific permission code, an array of codes (ANY), or custom function
  const hasPermission = (codeOrCodes) => {
    if (!codeOrCodes) return true;
    if (typeof codeOrCodes === "string") {
      return userCodes.value.has(codeOrCodes);
    }
    if (Array.isArray(codeOrCodes)) {
      if (codeOrCodes.length === 0) return true;
      return codeOrCodes.some((code) => userCodes.value.has(code));
    }
    if (typeof codeOrCodes === "function") {
      return codeOrCodes(userCodes.value);
    }
    return true;
  };

  // Find the first navigation path the user has permission to access
  const firstAllowedPath = computed(() => {
    const allowed = navItems.find((item) => hasPermission(item.permission));
    return allowed ? allowed.to : "/dashboard";
  });

  // Check if user has ANY of the given permission codes
  const hasAnyPermission = (codes = []) => {
    if (!codes || codes.length === 0) return true;
    return codes.some((code) => userCodes.value.has(code));
  };

  // Check if user has ALL of the given permission codes
  const hasAllPermissions = (codes = []) => {
    if (!codes || codes.length === 0) return true;
    return codes.every((code) => userCodes.value.has(code));
  };

  // Check if user has ANY permission in a given module (e.g. 'client', 'email', 'kyc', 'ib_commission')
  const hasModulePermission = (moduleName) => {
    if (!moduleName) return true;
    const moduleList = permissions.value[moduleName];
    if (Array.isArray(moduleList) && moduleList.length > 0) return true;
    // Fallback: check if user has any permission starting with module prefix
    for (const code of userCodes.value) {
      if (
        code.startsWith(`${moduleName}.`) ||
        code.startsWith(`${moduleName}_`) ||
        code === moduleName
      ) {
        return true;
      }
    }
    return false;
  };

  let inFlightPromise = null;

  // Fetch logged-in user permissions
  const fetchMyPermissions = (force = false) => {
    if (isFetched.value && !force) return Promise.resolve(permissions.value);
    if (loading.value && inFlightPromise) return inFlightPromise;

    loading.value = true;
    error.value = null;

    inFlightPromise = new Promise((resolve, reject) => {
      const successHandler = (res) => {
        permissions.value = res?.data?.permissions || res?.data || {};
        userId.value = res?.data?.user_id || null;
        loading.value = false;
        isFetched.value = true;
        inFlightPromise = null;
        resolve(permissions.value);
      };

      const failureHandler = (err) => {
        loading.value = false;
        error.value = err;
        isFetched.value = true;
        inFlightPromise = null;
        console.error("Failed to fetch user permissions:", err);
        reject(err);
      };

      apiRequest(urls.KEYS.GET, urls?.rbac?.userPermissions?.me, {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });

    return inFlightPromise;
  };

  const reset = () => {
    permissions.value = {};
    userId.value = null;
    loading.value = false;
    isFetched.value = false;
    error.value = null;
    inFlightPromise = null;
  };

  return {
    permissions,
    userId,
    loading,
    isFetched,
    error,
    userCodes,
    hasNoPermissions,
    firstAllowedPath,

    // Helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModulePermission,

    // Actions
    fetchMyPermissions,
    reset,
  };
});
