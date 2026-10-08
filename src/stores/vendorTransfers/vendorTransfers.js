import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { perPageOptions } from "@/constants/pagination";

export const useVendorTransfersStore = defineStore("vendorTransfers", () => {
  const snackbar = useSnackbarStore();

  const records = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);

  const pagination = reactive({
    page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 1,
  });

  const filters = reactive({
    status: null, // 'assigned' | 'completed' | 'cancelled'
    type: null, // 'deposit' | 'withdrawal'
  });

  const cleanFilters = () =>
    Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== null && value !== "" && value !== undefined
      )
    );

  const fetchTransfers = (force = false) => {
    if (isFetched.value && !force) return;

    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      records.value = res?.data || [];
      Object.assign(pagination, {
        page: res?.pagination?.page || 1,
        per_page: res?.pagination?.per_page || 20,
        total_items: res?.pagination?.total || res?.pagination?.total_items || 0,
        total_pages: res?.pagination?.total_pages || (res?.pagination?.total ? Math.ceil(res.pagination.total / (res.pagination.per_page || 20)) : 1),
      });
      isFetched.value = true;
      loading.value = false;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;
      snackbar.show(err?.message || "Failed to fetch vendor transfers.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.vendor.transfers, {
      params: {
        page: pagination.page,
        per_page: pagination.per_page,
        ...cleanFilters(),
      },
      cancelPrevious: true,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const updatePerPage = (payload) => {
    if (typeof payload === 'object' && payload !== null && 'per_page' in payload) {
      pagination.per_page = Number(payload.per_page);
      pagination.page = payload.page || 1;
    } else {
      pagination.per_page = Number(payload);
      pagination.page = 1;
    }
    fetchTransfers(true);
  };

  const applyFilters = (newFilters) => {
    if (newFilters) {
      Object.assign(filters, newFilters);
    }
    pagination.page = 1;
    isFetched.value = false;
    fetchTransfers(true);
  };

  const resetFilters = () => {
    Object.assign(filters, {
      status: null,
      type: null,
    });
    applyFilters();
  };

  const setPage = (page) => {
    pagination.page = page;
    isFetched.value = false;
    fetchTransfers(true);
  };

  const reset = () => {
    records.value = [];
    loading.value = false;
    error.value = null;
    isFetched.value = false;

    Object.assign(pagination, {
      page: 1,
      per_page: 20,
      total_items: 0,
      total_pages: 1,
    });

    Object.assign(filters, {
      status: null,
      type: null,
    });
  };

  return {
    records,
    loading,
    error,
    isFetched,
    pagination,
    filters,
    perPageOptions,

    fetchTransfers,
    applyFilters,
    resetFilters,
    setPage,
    updatePerPage,
    reset,
  };
});
