// stores/dashboard/dashboard.js
import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useDashboardStore = defineStore("dashboard", () => {
  const dashboard = ref(null);
  const userAccounts = ref({});
  const revenueAnalytics = ref(null);

  const dashboardLoading = ref(false);
  const revenueLoading = ref(false);
  const userAccountsLoading = ref(false);

  const error = ref(null);

  const revenueFilters = reactive({
    range: "weekly",
  });

  const dashboardFilters = reactive({
    start_date: "",
    end_date: "",
  });

  const snackbar = useSnackbarStore();

  // ─── Dashboard ─────────────────────────────────────────────
  const fetchDashboard = () => {
    dashboardLoading.value = true;

    const successHandler = (res) => {
      dashboard.value = res?.data || null;

      dashboardLoading.value = false;
    };

    const failureHandler = (err) => {
      dashboardLoading.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch dashboard.", "error");
    };

    const params = {};
    if (dashboardFilters.start_date && dashboardFilters.end_date) {
      params.start_date = dashboardFilters.start_date;
      params.end_date = dashboardFilters.end_date;
    }

    apiRequest(urls.KEYS.GET, urls.dashboard.list, {
      isTokenRequired: true,
      params,

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const fetchLiveUserAccounts = () => {
    userAccountsLoading.value = true;

    const successHandler = (res) => {
      userAccounts.value = res?.data || null;

      userAccountsLoading.value = false;
    };

    const failureHandler = (err) => {
      userAccountsLoading.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch dashboard.", "error");
    };
    apiRequest(urls.KEYS.GET, urls.dashboard.accounts, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Revenue Analytics ────────────────────────────────────
  const fetchRevenueAnalytics = () => {
    revenueLoading.value = true;

    const successHandler = (res) => {
      revenueAnalytics.value = res?.data || null;

      revenueLoading.value = false;
    };

    const failureHandler = (err) => {
      revenueLoading.value = false;

      error.value = err;

      snackbar.show(
        err?.message || "Failed to fetch revenue analytics.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.dashboard.revenueAnalytics, {
      isTokenRequired: true,

      params: {
        range: revenueFilters.range,
      },

      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Filters ──────────────────────────────────────────────
  const setRevenueFilters = (nextFilters = {}) => {
    Object.assign(revenueFilters, nextFilters);
  };

  const applyRevenueFilters = () => {
    fetchRevenueAnalytics();
  };

  const resetRevenueFilters = () => {
    revenueFilters.range = "weekly";

    fetchRevenueAnalytics();
  };

  const setDashboardFilters = (nextFilters = {}) => {
    Object.assign(dashboardFilters, nextFilters);
  };

  const applyDashboardFilters = () => {
    fetchDashboard();
  };

  const resetDashboardFilters = () => {
    dashboardFilters.start_date = "";
    dashboardFilters.end_date = "";

    fetchDashboard();
  };

  // ─── Reset ────────────────────────────────────────────────
  const reset = () => {
    dashboard.value = null;
    revenueAnalytics.value = null;

    dashboardLoading.value = false;
    revenueLoading.value = false;

    error.value = null;

    revenueFilters.range = "weekly";

    dashboardFilters.start_date = "";
    dashboardFilters.end_date = "";
  };

  const updateUserAccountsFromSocket = (data) => {
    if (!data) return;
    userAccounts.value = data;
  };

  return {
    dashboard,
    revenueAnalytics,

    dashboardLoading,
    revenueLoading,

    revenueFilters,
    dashboardFilters,

    error,

    userAccounts,
    userAccountsLoading,

    fetchDashboard,
    fetchRevenueAnalytics,
    fetchLiveUserAccounts,
    updateUserAccountsFromSocket,

    setRevenueFilters,
    applyRevenueFilters,
    resetRevenueFilters,

    setDashboardFilters,
    applyDashboardFilters,
    resetDashboardFilters,

    reset,
  };
});
