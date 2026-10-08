import { defineStore } from "pinia";
import { ref } from "vue";

import apiRequest from "@/api/request";
import urls from "@/api/urls";

import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useRbacRolesStore = defineStore("rbacRoles", () => {
  // Snackbar
  const snackbar = useSnackbarStore();

  // ===========================
  // State
  // ===========================

  const records = ref([]);

  // Complete permissions object
  const permissions = ref({});

  // Selected role permissions
  const selectedRolePermissions = ref([]);

  const loading = ref(false);
  const permissionLoading = ref(false);
  const actionLoading = ref(false);

  const error = ref(null);

  const isFetched = ref(false);

  // ===========================
  // Filters
  // ===========================

  const filters = ref({
    search: "",
  });

  // ===========================
  // Fetch Roles
  // ===========================

  const fetchRoles = (force = false) => {
    if (isFetched.value && !force) {
      return;
    }

    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      records.value = res?.data || [];

      loading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;

      snackbar.show(err?.message || "Failed to fetch roles.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.rbac.roles.list, {
      isTokenRequired: true,

      params: {
        search: filters.value.search || undefined,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ===========================
  // Fetch All Permissions
  // ===========================

  const fetchPermissions = () => {
    permissionLoading.value = true;

    const successHandler = (res) => {
      permissions.value = res?.data || {};
      permissionLoading.value = false;
    };

    const failureHandler = (err) => {
      permissionLoading.value = false;

      snackbar.show(err?.message || "Failed to fetch permissions.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.rbac.roles.permissions, {
      isTokenRequired: true,

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ===========================
  // Fetch Role Permissions
  // ===========================

  const fetchRolePermissions = (roleId) => {
    permissionLoading.value = true;

    const successHandler = (res) => {
      const permissionIds = [];

      Object.values(res?.data || {}).forEach((resource) => {
        resource.forEach((permission) => {
          permissionIds.push(permission.id);
        });
      });

      selectedRolePermissions.value = permissionIds;

      permissionLoading.value = false;
    };

    const failureHandler = (err) => {
      permissionLoading.value = false;

      snackbar.show(
        err?.message || "Failed to fetch role permissions.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.rbac.roles.permissions, {
      isTokenRequired: true,

      params: {
        role_id: roleId,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ===========================
  // Filter Methods
  // ===========================

  const applyFilters = () => {
    fetchRoles(true);
  };

  const resetFilters = () => {
    filters.value = {
      search: "",
    };

    fetchRoles(true);
  };
  // ===========================
  // Create Role
  // ===========================

  const createRole = (payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Role created successfully.", "success");

      fetchRoles(true);

      if (onSuccess) {
        onSuccess(res);
      }
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to create role.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.rbac.roles.create, {
      isTokenRequired: true,

      data: {
        name: payload.name,
        description: payload.description,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ===========================
  // Update Role
  // ===========================

  const updateRole = (roleId, payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Role updated successfully.", "success");

      fetchRoles(true);

      if (onSuccess) {
        onSuccess(res);
      }
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to update role.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.rbac.roles.update, {
      isTokenRequired: true,

      look_up_key: roleId,

      data: {
        name: payload.name,
        description: payload.description,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ===========================
  // Delete Role
  // ===========================

  const deleteRole = (roleId, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Role deleted successfully.", "success");

      fetchRoles(true);

      if (onSuccess) {
        onSuccess(res);
      }
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to delete role.", "error");
    };

    apiRequest(urls.KEYS.DELETE, urls.rbac.roles.delete, {
      isTokenRequired: true,

      look_up_key: roleId,

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ===========================
  // Assign Permissions
  // ===========================

  const assignPermissions = (roleId, permissionIds, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(
        res?.message || "Permissions updated successfully.",
        "success",
      );

      fetchRoles(true);
      fetchRolePermissions(roleId);

      if (onSuccess) {
        onSuccess(res);
      }
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to update permissions.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.rbac.roles.assignPermissions, {
      isTokenRequired: true,

      look_up_key: roleId,

      data: {
        permission_ids: permissionIds,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };
  // ===========================
  // Reset
  // ===========================

  const reset = () => {
    records.value = [];
    permissions.value = {};
    selectedRolePermissions.value = [];
    loading.value = false;
    permissionLoading.value = false;
    actionLoading.value = false;
    error.value = null;
    isFetched.value = false;
    filters.value = {
      search: "",
    };
  };

  // ===========================
  // Return
  // ===========================

  return {
    // State
    records,
    permissions,
    selectedRolePermissions,
    filters,

    loading,
    permissionLoading,
    actionLoading,

    error,
    isFetched,

    // APIs
    fetchRoles,
    fetchPermissions,
    fetchRolePermissions,

    createRole,
    updateRole,
    deleteRole,

    assignPermissions,

    // Helpers
    applyFilters,
    resetFilters,
    reset,
  };
});
