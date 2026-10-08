import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useBankRequestStore = defineStore("bankRequest", () => {
  const snackbar = useSnackbarStore();

  // ─── 1. Primary State (Direct Data Storage) ────────────
  const bankAccounts = ref([]);
  const userBankAccounts = ref([]);
  const selectedAccount = ref(null);
  const selectedUserId = ref(null);

  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
  });

  const filters = ref({
    approval_status: "pending",
    user_id: null,
    search: "",
  });

  // ─── 2. In-Flight Tracking (Prevents Parallel Duplicate Requests) ─
  const inFlight = {
    list: false,
    userAccounts: false,
  };

  // ─── 3. isFetched Tracking (Prevents Redundant API Calls) ─
  const isFetched = ref({
    list: false,
    userAccounts: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const userAccountsLoading = ref(false);
  const error = ref(null);

  // ─── 5. Reset Helper ──────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      list: false,
      userAccounts: false,
    };
  };

  // ─── 6. Fetch Bank Account Requests Queue (GET /admin/bank-accounts) ─
  const fetchBankAccounts = (params = {}, force = false) => {
    if (inFlight.list) return;
    if (isFetched.value.list && !force) return;

    inFlight.list = true;
    loading.value = true;
    error.value = null;

    const queryParams = { ...params };
    // If approval_status is 'all', omit or send null
    if (queryParams.approval_status === "all") {
      delete queryParams.approval_status;
    }
    // Clean empty user_id or search
    if (!queryParams.user_id) {
      delete queryParams.user_id;
    }
    if (!queryParams.search) {
      delete queryParams.search;
    }

    const successHandler = (res) => {
      if (Array.isArray(res?.data)) {
        bankAccounts.value = res.data;
      } else if (Array.isArray(res?.data?.items)) {
        bankAccounts.value = res.data.items;
      } else if (Array.isArray(res)) {
        bankAccounts.value = res;
      } else {
        bankAccounts.value = [];
      }

      if (res?.pagination) {
        pagination.value = res.pagination;
      } else if (res?.data?.pagination) {
        pagination.value = res.data.pagination;
      } else {
        pagination.value.total = bankAccounts.value.length;
      }

      isFetched.value.list = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch bank account requests";
      snackbar.show(err?.message || "Failed to fetch bank account requests", "error");
    };

    const finallyHandler = () => {
      inFlight.list = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.bankRequests.list, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 7. Fetch User Bank Accounts (GET /admin/users/bank-accounts/{user_id}) ─
  const fetchUserBankAccounts = (userId, force = false) => {
    if (!userId) return;
    if (inFlight.userAccounts) return;
    if (isFetched.value.userAccounts && selectedUserId.value === userId && !force) return;

    inFlight.userAccounts = true;
    userAccountsLoading.value = true;
    selectedUserId.value = userId;

    const successHandler = (res) => {
      if (Array.isArray(res?.data)) {
        userBankAccounts.value = res.data;
      } else if (Array.isArray(res)) {
        userBankAccounts.value = res;
      } else {
        userBankAccounts.value = [];
      }
      isFetched.value.userAccounts = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch user bank accounts", "error");
    };

    const finallyHandler = () => {
      inFlight.userAccounts = false;
      userAccountsLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.GET,
      typeof urls.bankRequests.userAccounts === "function"
        ? urls.bankRequests.userAccounts(userId)
        : urls.bankRequests.userAccounts,
      {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      }
    );
  };

  // ─── 8. Approve Bank Account (POST /admin/bank-accounts/{account_id}/approve) ─
  const approveBankAccount = (accountId, onSuccess) => {
    if (!accountId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Bank account approved successfully", "success");
      // Force refresh list to stay in sync with server
      fetchBankAccounts(filters.value, true);
      if (selectedUserId.value) {
        fetchUserBankAccounts(selectedUserId.value, true);
      }
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to approve bank account", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.POST,
      typeof urls.bankRequests.approve === "function"
        ? urls.bankRequests.approve(accountId)
        : urls.bankRequests.approve,
      {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      }
    );
  };

  // ─── 9. Reject Bank Account (POST /admin/bank-accounts/{account_id}/reject) ─
  const rejectBankAccount = (accountId, rejectionReason, onSuccess) => {
    if (!accountId) return;
    if (!rejectionReason || !rejectionReason.trim()) {
      snackbar.show("Please provide a rejection reason", "error");
      return;
    }

    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Bank account rejected successfully", "success");
      // Force refresh list
      fetchBankAccounts(filters.value, true);
      if (selectedUserId.value) {
        fetchUserBankAccounts(selectedUserId.value, true);
      }
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to reject bank account", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.POST,
      typeof urls.bankRequests.reject === "function"
        ? urls.bankRequests.reject(accountId)
        : urls.bankRequests.reject,
      {
        data: {
          rejection_reason: rejectionReason.trim(),
        },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      }
    );
  };

  // ─── 10. Enable / Disable Edit (PATCH /admin/users/bank-accounts/{user_id}/{account_id}/enable-edit) ─
  const toggleEnableEdit = (userId, accountId, flagEnableEdit, onSuccess) => {
    if (!userId || !accountId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message ||
          (flagEnableEdit
            ? "Bank account edit enabled for user"
            : "Bank account edit disabled for user"),
        "success"
      );
      fetchBankAccounts(filters.value, true);
      if (selectedUserId.value) {
        fetchUserBankAccounts(selectedUserId.value, true);
      }
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update edit permission", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.PATCH,
      typeof urls.bankRequests.enableEdit === "function"
        ? urls.bankRequests.enableEdit(userId, accountId)
        : urls.bankRequests.enableEdit,
      {
        data: {
          flag_enable_edit: Boolean(flagEnableEdit),
        },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      }
    );
  };

  return {
    // State
    bankAccounts,
    userBankAccounts,
    selectedAccount,
    selectedUserId,
    pagination,
    filters,
    loading,
    actionLoading,
    userAccountsLoading,
    error,
    isFetched,

    // Actions
    fetchBankAccounts,
    fetchUserBankAccounts,
    approveBankAccount,
    rejectBankAccount,
    toggleEnableEdit,
    resetFetchedFlags,
  };
});
