import { defineStore } from "pinia";
import { ref } from "vue";

import apiRequest from "@/api/request";
import urls from "@/api/urls";

import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useMediaGroupsStore = defineStore("mediaGroups", () => {
  const snackbar = useSnackbarStore();

  /* --------------------------------------------
   * State
   * ------------------------------------------ */

  const records = ref([]);

  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
    has_next: false,
    has_prev: false,
  });

  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);

  /* --------------------------------------------
   * Fetch Groups
   * ------------------------------------------ */

  const fetchGroups = (force = false, page = pagination.value.page) => {
    if (isFetched.value && !force && page === pagination.value.page) return;

    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      records.value = res?.media_groups || [];

      pagination.value = {
        page: res?.pagination?.page ?? 1,
        per_page: res?.pagination?.per_page ?? 10,
        total: res?.pagination?.total ?? 0,
        pages: res?.pagination?.pages ?? 1,
        has_next: res?.pagination?.has_next ?? false,
        has_prev: res?.pagination?.has_prev ?? false,
      };

      isFetched.value = true;
      loading.value = false;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;

      snackbar.show(err?.message || "Failed to fetch media groups.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.media.groups.list, {
      isTokenRequired: true,

      params: {
        page,
        per_page: pagination.value.per_page,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  /* --------------------------------------------
   * Pagination
   * ------------------------------------------ */

  const changePage = (page) => {
    pagination.value.page = page;
    fetchGroups(true, page);
  };

  /* --------------------------------------------
   * Create Group
   * ------------------------------------------ */

  const createGroup = (payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(
        res?.message || "Media group created successfully.",
        "success",
      );

      fetchGroups(true);

      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to create media group.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.media.groups.create, {
      isTokenRequired: true,

      data: payload,

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  /* --------------------------------------------
   * Update Group
   * ------------------------------------------ */

  const updateGroup = (id, payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(
        res?.message || "Media group updated successfully.",
        "success",
      );

      fetchGroups(true);

      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to update media group.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.media.groups.update, {
      isTokenRequired: true,

      look_up_key: id,

      data: payload,

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  /* --------------------------------------------
   * Delete Group
   * ------------------------------------------ */

  const deleteGroup = (id) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(
        res?.message || "Media group deleted successfully.",
        "success",
      );

      fetchGroups(true);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to delete media group.", "error");
    };

    apiRequest(urls.KEYS.DELETE, urls.media.groups.delete, {
      isTokenRequired: true,

      look_up_key: id,

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  /* --------------------------------------------
   * Reset
   * ------------------------------------------ */

  const reset = () => {
    records.value = [];

    pagination.value = {
      page: 1,
      per_page: 10,
      total: 0,
      pages: 1,
      has_next: false,
      has_prev: false,
    };

    loading.value = false;
    actionLoading.value = false;
    error.value = null;
    isFetched.value = false;
  };

  return {
    records,
    pagination,

    loading,
    actionLoading,
    error,
    isFetched,

    fetchGroups,
    changePage,

    createGroup,
    updateGroup,
    deleteGroup,

    reset,
  };
});
