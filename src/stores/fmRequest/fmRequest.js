// /stores/fmRequest/fmRequest.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { perPageOptions } from "@/constants/pagination";

export const useFmRequestStore = defineStore("fmRequest", () => {
  const data = ref([]);
  const filters = ref({});
  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  const search = ref("");
  let debounceTimer = null;

  const isLoading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);
  const isSubmitting = ref(false);

  const snackbar = useSnackbarStore();

  const fetchFmRequests = (
    force = false,
    page = 1,
    status = null,
    searchQuery = "",
  ) => {
    if (isFetched.value && !force) return;

    isLoading.value = true;

    const successHandler = (res) => {
      data.value = res?.data || [];
      filters.value = res?.filters || {};
      pagination.value = res?.pagination || pagination.value;

      isLoading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      isLoading.value = false;
      error.value = err;
      snackbar.show(err?.error || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.fm.requestList, {
      params: {
        page,
        per_page: pagination.value.per_page,
        status,
        search: searchQuery,
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const acceptRequest = (id, payload = null, message = null) => {
    isSubmitting.value = true;

    const successHandler = () => {
      isSubmitting.value = false;
      snackbar.show("Request accepted successfully.", "success");
      fetchFmRequests(true);
    };

    const failureHandler = (err) => {
      isSubmitting.value = false;
      snackbar.show(err?.error || "Failed to accept request.", "error");
    };

    const data = { ...(payload || {}) };
    if (message) {
      data.message = message;
    }

    apiRequest(urls.KEYS.POST, urls.fm.acceptRequest, {
      look_up_key: id,
      data: Object.keys(data).length > 0 ? data : undefined,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const rejectRequest = (id, reason = null) => {
    isSubmitting.value = true;

    const successHandler = () => {
      isSubmitting.value = false;
      snackbar.show("Request rejected successfully.", "success");
      fetchFmRequests(true);
    };

    const failureHandler = (err) => {
      isSubmitting.value = false;
      snackbar.show(err?.error || "Failed to reject request.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.fm.rejectRequest, {
      look_up_key: id,
      data: reason ? { reason } : undefined,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const setSearch = (query, status = null) => {
    search.value = query;
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      isFetched.value = false;
      fetchFmRequests(true, 1, status, search.value);
    }, 400);
  };

  const updatePerPage = (newPerPage, status = null) => {
    pagination.value.per_page = Number(newPerPage);
    pagination.value.page = 1;
    isFetched.value = false;
    fetchFmRequests(true, 1, status, search.value);
  };

  const reset = () => {
    data.value = [];
    filters.value = {};
    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    };
    search.value = "";
    isLoading.value = false;
    error.value = null;
    isFetched.value = false;
    isSubmitting.value = false;
  };

  return {
    data,
    filters,
    pagination,
    search,
    perPageOptions,
    isLoading,
    error,
    isFetched,
    isSubmitting,
    fetchFmRequests,
    setSearch,
    updatePerPage,
    reset,
    acceptRequest,
    rejectRequest,
  };
});
