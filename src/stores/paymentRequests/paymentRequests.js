import { defineStore } from "pinia";
import { ref, reactive } from "vue";

import apiRequest from "@/api/request";
import urls from "@/api/urls";

import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { perPageOptions } from "@/constants/pagination";

export const usePaymentRequestsStore = defineStore("paymentRequests", () => {
  // ─────────────────────────────────────
  // Snackbar
  // ─────────────────────────────────────

  const snackbar = useSnackbarStore();

  // ─────────────────────────────────────
  // State
  // ─────────────────────────────────────

  const records = ref([]);

  const loading = ref(false);

  const approveLoading = ref(false);

  const rejectLoading = ref(false);

  const cancelPaymaxisLoading = ref(false);

  const updateAmountLoading = ref(false);

  const error = ref(null);

  const isFetched = ref(false);

  // ─────────────────────────────────────
  // Summary
  // ─────────────────────────────────────

  const summary = reactive({
    pending_deposits: 0,
    approved_deposits: 0,
    rejected_deposits: 0,

    pending_withdrawals: 0,
    approved_withdrawals: 0,
    rejected_withdrawals: 0,
  });

  // ─────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────

  const pagination = reactive({
    page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 1,
  });

  const updatePerPage = (newPerPage) => {
    pagination.per_page = Number(newPerPage);
    pagination.page = 1;
    fetchRequests(1);
  };

  // ─────────────────────────────────────
  // Filters
  // ─────────────────────────────────────

  const filters = reactive({
    id: null,
    detailMode: false,
    type: null,
    approval_status: null,

    user_id: null,
    trading_account_id: null,

    from_date: "",
    to_date: "",
  });

  // ─────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────

  const cleanFilters = () =>
    Object.fromEntries(
      Object.entries(filters).filter(
        ([key, value]) => value !== null && value !== "" && value !== undefined && key !== 'detailMode'
      ),
    );

  // ─────────────────────────────────────
  // Fetch Requests
  // ─────────────────────────────────────

  const fetchRequests = (force = false) => {
    if (isFetched.value && !force) return;

    loading.value = true;

    error.value = null;

    const successHandler = (res) => {
      if (filters.detailMode && res?.data && !Array.isArray(res?.data)) {
        records.value = [res.data];
        Object.assign(pagination, {
          page: 1,
          per_page: 20,
          total_items: 1,
          total_pages: 1,
        });
      } else {
        records.value = res?.data || [];
        Object.assign(pagination, {
          page: res?.pagination?.page || 1,
          per_page: res?.pagination?.per_page || 20,
          total_items: res?.pagination?.total_items || 0,
          total_pages: res?.pagination?.total_pages || 1,
        });
      }

      Object.assign(summary, {
        pending_deposits: res?.summary?.pending_deposits || 0,
        approved_deposits: res?.summary?.approved_deposits || 0,
        rejected_deposits: res?.summary?.rejected_deposits || 0,
        pending_withdrawals: res?.summary?.pending_withdrawals || 0,
        approved_withdrawals: res?.summary?.approved_withdrawals || 0,
        rejected_withdrawals: res?.summary?.rejected_withdrawals || 0,
      });

      isFetched.value = true;
      loading.value = false;
    };

    const failureHandler = (err) => {
      loading.value = false;

      error.value = err;

      snackbar.show(
        err?.message || "Failed to fetch payment requests.",
        "error",
      );
    };

    let method = urls.KEYS.GET;
    let url = urls.paymentRequests.list;
    let options = {
      params: {
        page: pagination.page,
        per_page: pagination.per_page,
        ...cleanFilters(),
      },
      cancelPrevious: true,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    };

    if (filters.detailMode && filters.id) {
      url = `${urls.paymentRequests.list}/${filters.id}`;
      delete options.params.id;
      delete options.params.page;
      delete options.params.per_page;
    }

    apiRequest(method, url, options);
  };

  // ─────────────────────────────────────
  // Approve Request
  // ─────────────────────────────────────

  const approveRequest = (id, payload = null) => {
    approveLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Payment request approved successfully.",
        "success",
      );
      fetchRequests(true);
    };

    const failureHandler = (err) => {
      error.value = err;
      snackbar.show(
        err?.message || "Failed to approve payment request.",
        "error",
      );
    };

    const options = {
      look_up_key: id,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: () => {
        approveLoading.value = false;
      },
    };

    if (payload) {
      options.data = payload;
    }

    return apiRequest(urls.KEYS.POST, urls.paymentRequests.approve, options);
  };

  // ─────────────────────────────────────
  // Reject Request
  // ─────────────────────────────────────

  const rejectRequest = (id, payload = null) => {
    rejectLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Payment request rejected successfully.",
        "success",
      );
      fetchRequests(true);
    };

    const failureHandler = (err) => {
      error.value = err;
      snackbar.show(
        err?.message || "Failed to reject payment request.",
        "error",
      );
    };

    const options = {
      look_up_key: id,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: () => {
        rejectLoading.value = false;
      },
    };

    if (payload) {
      options.data = payload;
    }

    return apiRequest(urls.KEYS.POST, urls.paymentRequests.reject, options);
  };

  // ─────────────────────────────────────
  // Cancel Paymaxis Deposit
  // ─────────────────────────────────────

  const cancelPaymaxisDeposit = (id, payload = null) => {
    cancelPaymaxisLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Paymaxis deposit cancelled successfully.",
        "success",
      );
      fetchRequests(true);
    };

    const failureHandler = (err) => {
      error.value = err;
      snackbar.show(
        err?.message || "Failed to cancel Paymaxis deposit.",
        "error",
      );
    };

    const options = {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: () => {
        cancelPaymaxisLoading.value = false;
      },
    };

    if (payload) {
      options.data = payload;
    }

    return apiRequest(urls.KEYS.POST, urls.paymentRequests.paymaxisCancel(id), options);
  };

  // ─────────────────────────────────────
  // Update Request Amount (Bank Transfer)
  // ─────────────────────────────────────

  const updateRequestAmount = (id, amount) => {
    updateAmountLoading.value = true;
    error.value = null;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        snackbar.show(
          res?.message || "Payment request amount updated successfully.",
          "success",
        );
        const updated = res?.data;
        if (updated && updated.id) {
          const index = records.value.findIndex((r) => r.id === updated.id);
          if (index !== -1) {
            records.value[index] = { ...records.value[index], ...updated };
          }
        }
        fetchRequests(true);
        resolve(res);
      };

      const failureHandler = (err) => {
        error.value = err;
        snackbar.show(
          err?.message || "Failed to update payment request amount.",
          "error",
        );
        reject(err);
      };

      apiRequest(urls.KEYS.PATCH, urls.paymentRequests.updateAmount(id), {
        data: { amount: Number(amount) },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: () => {
          updateAmountLoading.value = false;
        },
      });
    });
  };

  // ─────────────────────────────────────
  // Filters
  // ─────────────────────────────────────

  const applyFilters = (newFilters) => {
    if (newFilters) {
      Object.assign(filters, newFilters);
    }

    pagination.page = 1;

    isFetched.value = false;

    fetchRequests(true);
  };

  const resetFilters = () => {
    Object.assign(filters, {
      id: null,
      detailMode: false,
      type: null,
      approval_status: null,

      user_id: null,
      trading_account_id: null,

      from_date: "",
      to_date: "",
    });

    applyFilters();
  };

  // ─────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────

  const setPage = (page) => {
    pagination.page = page;

    isFetched.value = false;

    fetchRequests(true);
  };

  // ─────────────────────────────────────
  // Search Clients
  // ─────────────────────────────────────

  const fetchAllClients = (searchQuery = "") => {
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const clients = (res?.data || []).map((client) => ({
          label: client.name,
          value: client.id,
          email: client.email,
        }));

        resolve(clients);
      };

      const failureHandler = (err) => {
        snackbar.show(err?.message || "Failed to fetch clients.", "error");

        reject(err);
      };

      apiRequest(urls.KEYS.GET, urls.clientLedger.allClients, {
        params: searchQuery ? { search: searchQuery } : {},

        isTokenRequired: true,

        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // ─────────────────────────────────────
  // Search Accounts
  // ─────────────────────────────────────

  const fetchAllAccounts = (searchQuery = "", clientId = null) => {
    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const accounts = res?.data;

        resolve(accounts);
      };

      const failureHandler = (err) => {
        snackbar.show(err?.message || "Failed to fetch accounts.", "error");

        reject(err);
      };

      const params = {};

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (clientId) {
        params.client_id = clientId;
      }

      apiRequest(urls.KEYS.GET, urls.clientLedger.allAccounts, {
        params,

        isTokenRequired: true,

        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // ─────────────────────────────────────
  // Reset
  // ─────────────────────────────────────

  const reset = () => {
    records.value = [];

    loading.value = false;

    approveLoading.value = false;

    rejectLoading.value = false;

    cancelPaymaxisLoading.value = false;

    error.value = null;

    isFetched.value = false;

    Object.assign(summary, {
      pending_deposits: 0,
      approved_deposits: 0,
      rejected_deposits: 0,

      pending_withdrawals: 0,
      approved_withdrawals: 0,
      rejected_withdrawals: 0,
    });

    Object.assign(pagination, {
      page: 1,
      per_page: 20,
      total_items: 0,
      total_pages: 1,
    });

    Object.assign(filters, {
      id: null,
      detailMode: false,
      type: null,
      approval_status: null,

      user_id: null,
      trading_account_id: null,

      from_date: "",
      to_date: "",
    });
  };

  return {
    // state
    records,

    loading,
    approveLoading,
    rejectLoading,
    cancelPaymaxisLoading,
    updateAmountLoading,

    error,
    isFetched,

    summary,
    pagination,
    filters,
    perPageOptions,

    // methods
    fetchRequests,

    approveRequest,
    rejectRequest,
    cancelPaymaxisDeposit,
    updateRequestAmount,

    applyFilters,
    resetFilters,

    setPage,
    updatePerPage,

    fetchAllClients,
    fetchAllAccounts,

    reset,
  };
});
