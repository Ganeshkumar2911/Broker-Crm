import { defineStore } from "pinia";
import { ref } from "vue";

import apiRequest from "@/api/request";
import urls from "@/api/urls";

import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useRbacStaffStore = defineStore("rbacStaff", () => {
  // Snackbar
  const snackbar = useSnackbarStore();

  // =========================
  // State
  // =========================

  const records = ref([]);
  const roles = ref([]);

  const loading = ref(false);
  const actionLoading = ref(false);

  const error = ref(null);
  const isFetched = ref(false);

  // =========================
  // Filters
  // =========================

  const filters = ref({
    search: "",
  });

  // =========================
  // Pagination
  // =========================

  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
  });

  // =========================
  // Fetch Staff
  // =========================

  const fetchStaff = (force = false, page = pagination.value.page) => {
    if (isFetched.value && !force && page === pagination.value.page) {
      return;
    }

    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      records.value = res?.data || [];

      pagination.value = {
        page: res?.pagination?.page || 1,
        per_page: res?.pagination?.per_page || 10,
        total_items: res?.pagination?.total_items || 0,
        total_pages: res?.pagination?.total_pages || 1,
      };

      loading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;

      snackbar.show(err?.message || "Failed to fetch staff.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.rbac.staff.list, {
      isTokenRequired: true,

      params: {
        page,
        per_page: pagination.value.per_page,
        search: filters.value.search || undefined,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // =========================
  // Fetch Roles
  // =========================

  const fetchRoles = () => {
    const successHandler = (res) => {
      roles.value = res?.data || [];
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch roles.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.rbac.roles.list, {
      isTokenRequired: true,

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // =========================
  // Filter Methods
  // =========================

  const applyFilters = () => {
    pagination.value.page = 1;
    fetchStaff(true, 1);
  };

  const resetFilters = () => {
    filters.value = {
      search: "",
    };

    pagination.value.page = 1;

    fetchStaff(true, 1);
  };

  // =========================
  // Pagination Methods
  // =========================

  const changePage = (page) => {
    pagination.value.page = page;
    fetchStaff(true, page);
  };
  // =========================
  // Create Staff
  // =========================

  const createStaff = (payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Staff created successfully.", "success");

      fetchStaff(true, pagination.value.page);

      if (onSuccess) {
        onSuccess(res);
      }
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to create staff.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.rbac.staff.create, {
      isTokenRequired: true,
      data: payload,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // =========================
  // Update Staff Role
  // =========================

  const updateStaffRole = (staffId, roleId, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Role updated successfully.", "success");

      fetchStaff(true, pagination.value.page);

      if (onSuccess) {
        onSuccess(res);
      }
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to update role.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.rbac.staff.updateRole, {
      isTokenRequired: true,
      look_up_key: staffId,

      data: {
        role_id: roleId,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // =========================
  // Update Staff Status
  // =========================

  const updateStaffStatus = (staffId, status, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Status updated successfully.", "success");

      fetchStaff(true, pagination.value.page);

      if (onSuccess) {
        onSuccess(res);
      }
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to update status.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.rbac.staff.updateStatus, {
      isTokenRequired: true,
      look_up_key: staffId,

      data: {
        is_active: status,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // =========================
  // Delete Staff
  // =========================

  const deleteStaff = (staffId, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Staff deleted successfully.", "success");

      fetchStaff(true, pagination.value.page);

      if (onSuccess) {
        onSuccess(res);
      }
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to delete staff.", "error");
    };

    apiRequest(urls.KEYS.DELETE, urls.rbac.staff.delete, {
      isTokenRequired: true,
      look_up_key: staffId,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // =========================
  // Reset Staff Password
  // =========================

  const resetStaffPassword = (staffId, password, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Password reset successfully.", "success");

      if (onSuccess) {
        onSuccess(res);
      }
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to reset password.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.rbac.staff.resetPassword, {
      isTokenRequired: true,
      look_up_key: staffId,

      data: {
        password,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // =========================
  // Reset
  // =========================

  const reset = () => {
    records.value = [];
    roles.value = [];

    loading.value = false;
    actionLoading.value = false;

    error.value = null;
    isFetched.value = false;

    filters.value = {
      search: "",
    };

    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
    };
  };

  return {
    // State
    records,
    roles,
    loading,
    actionLoading,
    error,
    isFetched,

    // Filters
    filters,

    // Pagination
    pagination,

    // APIs
    fetchStaff,
    fetchRoles,
    createStaff,
    updateStaffRole,
    updateStaffStatus,
    deleteStaff,
    resetStaffPassword,

    // Methods
    applyFilters,
    resetFilters,
    changePage,
    reset,
  };
});
