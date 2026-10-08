import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { perPageOptions } from "@/constants/pagination";

export const usePaymentGatewayLogsStore = defineStore(
  "paymentGatewayLogs",
  () => {
    const snackbar = useSnackbarStore();

    // ─────────────────────────────────────
    // State
    // ─────────────────────────────────────
    const source = ref("logs"); // 'logs' | 'transaction'
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
      gateway: null,
      gateway_transaction_id: "",
      search: "",
      from_date: "",
      to_date: "",
    });

    // ─────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────
    const cleanFilters = () =>
      Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== null && value !== "" && value !== undefined,
        ),
      );

    // ─────────────────────────────────────
    // Fetch Data
    // ─────────────────────────────────────
    const fetchData = (force = false) => {
      if (isFetched.value && !force) return;

      loading.value = true;
      error.value = null;

      const queryParams = {
        source: source.value,
        page: pagination.page,
        per_page: pagination.per_page,
        ...cleanFilters(),
      };

      const successHandler = (res) => {
        records.value = res?.data || [];

        Object.assign(pagination, {
          page: res?.pagination?.page || 1,
          per_page: res?.pagination?.per_page || 10,
          total_items: res?.pagination?.total_items || 0,
          total_pages: res?.pagination?.total_pages || 1,
        });

        isFetched.value = true;
        loading.value = false;
      };

      const failureHandler = (err) => {
        loading.value = false;
        error.value = err;
        snackbar.show(
          err?.message || "Failed to fetch payment gateway data.",
          "error",
        );
      };

      apiRequest(urls.KEYS.GET, urls.paymentGatewayData.list, {
        params: queryParams,
        cancelPrevious: true,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    };

    // ─────────────────────────────────────
    // Actions
    // ─────────────────────────────────────
    const setSource = (newSource) => {
      if (source.value === newSource) return;
      source.value = newSource;
      pagination.page = 1;
      isFetched.value = false;
      fetchData(true);
    };

    const applyFilters = (newFilters) => {
      if (newFilters) {
        Object.assign(filters, newFilters);
      }
      pagination.page = 1;
      isFetched.value = false;
      fetchData(true);
    };

    const resetFilters = () => {
      Object.assign(filters, {
        gateway: null,
        gateway_transaction_id: "",
        search: "",
        from_date: "",
        to_date: "",
      });
      applyFilters();
    };

    const setPage = (page) => {
      pagination.page = page;
      isFetched.value = false;
      fetchData(true);
    };

    const updatePerPage = (newPerPage) => {
      pagination.per_page = Number(newPerPage);
      pagination.page = 1;
      isFetched.value = false;
      fetchData(true);
    };

    const reset = () => {
      records.value = [];
      loading.value = false;
      error.value = null;
      isFetched.value = false;
      source.value = "logs";

      Object.assign(pagination, {
        page: 1,
        per_page: 20,
        total_items: 0,
        total_pages: 1,
      });

      Object.assign(filters, {
        gateway: null,
        gateway_transaction_id: "",
        search: "",
        from_date: "",
        to_date: "",
      });
    };

    return {
      source,
      records,
      loading,
      error,
      isFetched,
      pagination,
      filters,
      perPageOptions,

      setSource,
      fetchData,
      applyFilters,
      resetFilters,
      setPage,
      updatePerPage,
      reset,
    };
  },
);
