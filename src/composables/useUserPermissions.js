import { ref, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

// Shared Module-level State across all composable instances
const userPermissions = ref({});
const allPermissions = ref({});

const loading = ref(false);
const allPermissionsLoading = ref(false);
const actionLoading = ref(false);
const error = ref(null);

export function useUserPermissions() {
  const snackbar = useSnackbarStore();

  // Map permission code -> integer id from allPermissions registry
  const codeToIdMap = computed(() => {
    const map = {};
    Object.values(allPermissions.value || {}).forEach((permList) => {
      if (Array.isArray(permList)) {
        permList.forEach((p) => {
          if (p.code && p.id !== undefined && p.id !== null) {
            map[p.code] = p.id;
          }
        });
      }
    });
    return map;
  });

  // Extract integer permission ID or code string from permission object/code
  const getPermId = (item) => {
    if (item === null || item === undefined) return null;
    if (typeof item === "number") return item;
    if (typeof item === "string") {
      return codeToIdMap.value[item] ?? item;
    }
    const directId =
      item.id ?? item.permission_id ?? item.permissionId ?? item.perm_id;
    if (directId !== undefined && directId !== null) return directId;
    if (item.code) {
      return codeToIdMap.value[item.code] ?? item.code ?? null;
    }
    return null;
  };

  // Helper: flatten all user permission items
  const flatUserPermissions = computed(() => {
    const items = [];
    Object.values(userPermissions.value || {}).forEach((permList) => {
      if (Array.isArray(permList)) {
        permList.forEach((item) => items.push(item));
      }
    });
    return items;
  });

  // Set of all permission IDs user currently possesses
  const userPermissionIdsSet = computed(() => {
    const set = new Set();
    flatUserPermissions.value.forEach((item) => {
      const id = getPermId(item);
      if (id !== null && id !== undefined) {
        set.add(id);
      }
    });
    return set;
  });

  // 1. Role Permissions (flag_custom === false)
  const rolePermissions = computed(() => {
    const result = {};
    Object.entries(userPermissions.value || {}).forEach(([resource, list]) => {
      if (!Array.isArray(list)) return;
      const roleOnly = list.filter((p) => !p.flag_custom);
      if (roleOnly.length > 0) {
        result[resource] = roleOnly;
      }
    });
    return result;
  });

  const rolePermissionsCount = computed(() => {
    let count = 0;
    Object.values(rolePermissions.value).forEach((list) => {
      count += list.length;
    });
    return count;
  });

  // 2. Custom Permissions (flag_custom === true)
  const customPermissions = computed(() => {
    const result = {};
    Object.entries(userPermissions.value || {}).forEach(([resource, list]) => {
      if (!Array.isArray(list)) return;
      const customOnly = list.filter((p) => p.flag_custom);
      if (customOnly.length > 0) {
        result[resource] = customOnly;
      }
    });
    return result;
  });

  const customPermissionsCount = computed(() => {
    let count = 0;
    Object.values(customPermissions.value).forEach((list) => {
      count += list.length;
    });
    return count;
  });

  // 3. Available Permissions (All system permissions minus existing user permissions)
  const availablePermissions = computed(() => {
    const result = {};
    const assignedSet = userPermissionIdsSet.value;
    Object.entries(allPermissions.value || {}).forEach(([resource, list]) => {
      if (!Array.isArray(list)) return;
      const unassigned = list.filter((p) => {
        const id = getPermId(p);
        return id !== null && !assignedSet.has(id);
      });
      if (unassigned.length > 0) {
        result[resource] = unassigned;
      }
    });
    return result;
  });

  const availablePermissionsCount = computed(() => {
    let count = 0;
    Object.values(availablePermissions.value).forEach((list) => {
      count += list.length;
    });
    return count;
  });

  // API Methods

  // Fetch User Permissions
  const fetchUserPermissions = (userId) => {
    if (!userId) return;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      userPermissions.value = res?.data?.permissions || res?.data || {};
      loading.value = false;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;
      snackbar.show(
        err?.message || "Failed to fetch user permissions.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.rbac.userPermissions.me, {
      isTokenRequired: true,
      params: { user_id: userId },
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // Fetch All Available Permissions
  const fetchAllPermissions = (force = false) => {
    if (Object.keys(allPermissions.value).length > 0 && !force) {
      return;
    }

    allPermissionsLoading.value = true;

    const successHandler = (res) => {
      allPermissions.value = res?.data || {};
      allPermissionsLoading.value = false;
    };

    const failureHandler = (err) => {
      allPermissionsLoading.value = false;
      snackbar.show(
        err?.message || "Failed to fetch available permissions.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.rbac.userPermissions.all, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // Disable Role Permissions
  const disableRolePermissions = (userId, permissionIds, onSuccess) => {
    const cleanIds = (permissionIds || [])
      .map((item) => {
        const resolved = getPermId(item);
        if (typeof resolved === "string" && codeToIdMap.value[resolved]) {
          return codeToIdMap.value[resolved];
        }
        return resolved;
      })
      .filter((id) => id !== null && id !== undefined);

    if (cleanIds.length === 0) {
      snackbar.show("Please select at least one permission.", "warning");
      return;
    }
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(
        res?.message || "Selected role permissions disabled successfully.",
        "success",
      );
      fetchUserPermissions(userId);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(
        err?.message || "Failed to disable role permissions.",
        "error",
      );
    };

    apiRequest(urls.KEYS.PUT, urls.rbac.userPermissions.manage, {
      isTokenRequired: true,
      look_up_key: userId,
      data: {
        permission_ids: cleanIds,
        effect: "DENY",
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // Grant Custom Permissions
  const grantCustomPermissions = (userId, permissionIds, onSuccess) => {
    const cleanIds = (permissionIds || [])
      .map((item) => {
        const resolved = getPermId(item);
        if (typeof resolved === "string" && codeToIdMap.value[resolved]) {
          return codeToIdMap.value[resolved];
        }
        return resolved;
      })
      .filter((id) => id !== null && id !== undefined);

    if (cleanIds.length === 0) {
      snackbar.show("Please select at least one permission.", "warning");
      return;
    }
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(
        res?.message || "Custom permissions granted successfully.",
        "success",
      );
      fetchUserPermissions(userId);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(
        err?.message || "Failed to grant custom permissions.",
        "error",
      );
    };

    apiRequest(urls.KEYS.PUT, urls.rbac.userPermissions.manage, {
      isTokenRequired: true,
      look_up_key: userId,
      data: {
        permission_ids: cleanIds,
        effect: "ALLOW",
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // Remove Custom Permissions
  const removeCustomPermissions = (userId, permissionIds, onSuccess) => {
    const cleanIds = (permissionIds || [])
      .map((item) => {
        const resolved = getPermId(item);
        if (typeof resolved === "string" && codeToIdMap.value[resolved]) {
          return codeToIdMap.value[resolved];
        }
        return resolved;
      })
      .filter((id) => id !== null && id !== undefined);

    if (cleanIds.length === 0) {
      snackbar.show("Please select at least one permission.", "warning");
      return;
    }
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(
        res?.message || "Custom permission overrides removed successfully.",
        "success",
      );
      fetchUserPermissions(userId);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(
        err?.message || "Failed to remove custom permissions.",
        "error",
      );
    };

    apiRequest(urls.KEYS.DELETE, urls.rbac.userPermissions.manage, {
      isTokenRequired: true,
      look_up_key: userId,
      data: {
        permission_ids: cleanIds,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  return {
    // State
    userPermissions,
    allPermissions,
    loading,
    allPermissionsLoading,
    actionLoading,
    error,

    // Computed
    codeToIdMap,
    rolePermissions,
    rolePermissionsCount,
    customPermissions,
    customPermissionsCount,
    availablePermissions,
    availablePermissionsCount,

    // Helpers
    getPermId,

    // Methods
    fetchUserPermissions,
    fetchAllPermissions,
    disableRolePermissions,
    grantCustomPermissions,
    removeCustomPermissions,
  };
}
