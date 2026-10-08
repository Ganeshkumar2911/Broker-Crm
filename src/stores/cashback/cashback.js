import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useCashbackStore = defineStore("cashback", () => {
  const snackbar = useSnackbarStore();

  // ─── 1. Primary State (Direct Data Storage) ────────────
  const programs = ref([]);
  const activeProgram = ref(null);
  const plans = ref([]);
  const enrollments = ref([]);
  const transactions = ref([]);
  const redemptions = ref([]);

  const enrollmentsPagination = ref({ page: 1, per_page: 50, total: 0, limit: 50, offset: 0 });
  const transactionsPagination = ref({ page: 1, per_page: 50, total: 0, limit: 50, offset: 0 });
  const redemptionsPagination = ref({ page: 1, per_page: 50, total: 0, limit: 50, offset: 0 });

  // ─── 2. In-Flight Tracking ─
  const inFlight = {
    programs: false,
    plans: false,
    enrollments: false,
    transactions: false,
    redemptions: false,
  };

  // ─── 3. isFetched Tracking ─
  const isFetched = ref({
    programs: false,
    plans: false,
    enrollments: false,
    transactions: false,
    redemptions: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  // ─── 5. Reset Helper ──────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      programs: false,
      plans: false,
      enrollments: false,
      transactions: false,
      redemptions: false,
    };
  };

  // ─── Fetch Actions ──────────────────────────────────────
  const fetchPrograms = (params = {}, force = false) => {
    if (inFlight.programs) return;
    if (isFetched.value.programs && !force) return;

    inFlight.programs = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      // The API returns an array or single object for program?
      // Spec: GET /admin/cashback/programs returns array.
      programs.value = Array.isArray(res?.data) ? res.data : [];
      if (programs.value.length > 0) {
        activeProgram.value = programs.value[0];
      }
      isFetched.value.programs = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch cashback programs";
      snackbar.show(err?.message || "Failed to fetch programs", "error");
    };

    const finallyHandler = () => {
      inFlight.programs = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.cashback.programs, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchPlans = (programId, params = {}, force = false) => {
    if (!programId) return;
    if (inFlight.plans) return;
    if (isFetched.value.plans && !force) return;

    inFlight.plans = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      plans.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.plans = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch plans";
      snackbar.show(err?.message || "Failed to fetch plans", "error");
    };

    const finallyHandler = () => {
      inFlight.plans = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.cashback.plans(programId), {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchEnrollments = (params = {}, force = false) => {
    if (inFlight.enrollments) return;
    if (isFetched.value.enrollments && !force && Object.keys(params).length === 0) return;

    inFlight.enrollments = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      enrollments.value = Array.isArray(res?.data?.items) ? res.data.items : [];
      if (res?.data) {
        enrollmentsPagination.value = {
          total: res.data.total || 0,
          limit: res.data.limit || 50,
          offset: res.data.offset || 0,
        };
      }
      isFetched.value.enrollments = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch enrollments";
      snackbar.show(err?.message || "Failed to fetch enrollments", "error");
    };

    const finallyHandler = () => {
      inFlight.enrollments = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.cashback.enrollments, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchTransactions = (params = {}, force = false) => {
    if (inFlight.transactions) return;
    if (isFetched.value.transactions && !force && Object.keys(params).length === 0) return;

    inFlight.transactions = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      transactions.value = Array.isArray(res?.data?.items) ? res.data.items : [];
      if (res?.data) {
        transactionsPagination.value = {
          total: res.data.total || 0,
          limit: res.data.limit || 50,
          offset: res.data.offset || 0,
        };
      }
      isFetched.value.transactions = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch transactions";
      snackbar.show(err?.message || "Failed to fetch transactions", "error");
    };

    const finallyHandler = () => {
      inFlight.transactions = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.cashback.transactions, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchRedemptions = (params = {}, force = false) => {
    if (inFlight.redemptions) return;
    if (isFetched.value.redemptions && !force && Object.keys(params).length === 0) return;

    inFlight.redemptions = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      redemptions.value = Array.isArray(res?.data?.items) ? res.data.items : [];
      if (res?.data) {
        redemptionsPagination.value = {
          total: res.data.total || 0,
          limit: res.data.limit || 50,
          offset: res.data.offset || 0,
        };
      }
      isFetched.value.redemptions = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch redemptions";
      snackbar.show(err?.message || "Failed to fetch redemptions", "error");
    };

    const finallyHandler = () => {
      inFlight.redemptions = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.cashback.redemptions, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Mutation Actions ───────────────────────────────────
  const updateProgram = (programId, payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Program updated successfully", "success");
      fetchPrograms({}, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update program", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.cashback.updateProgram(programId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updatePlan = (planId, payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Plan updated successfully", "success");
      // Refetch plans for the active program
      if (activeProgram.value) {
        fetchPlans(activeProgram.value.id, {}, true);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update plan", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.cashback.updatePlan(planId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const enrollAccount = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Account enrolled successfully", "success");
      fetchEnrollments({}, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to enroll account", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.cashback.enrollments, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const unenrollAccount = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Account unenrolled successfully", "success");
      fetchEnrollments({}, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to unenroll account", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.cashback.unenroll, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  return {
    programs,
    activeProgram,
    plans,
    enrollments,
    transactions,
    redemptions,
    enrollmentsPagination,
    transactionsPagination,
    redemptionsPagination,
    loading,
    actionLoading,
    error,
    isFetched,
    resetFetchedFlags,
    fetchPrograms,
    fetchPlans,
    fetchEnrollments,
    fetchTransactions,
    fetchRedemptions,
    updateProgram,
    updatePlan,
    enrollAccount,
    unenrollAccount,
  };
});
