// stores/clientDepth/clientDepth.js
import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useClientDepthStore = defineStore("clientDepth", () => {
  const currentUserId = ref(null);
  const overviewData = ref(null);
  const activeClient = ref(null);
  const loading = ref(false);
  const isFetched = ref(false);
  const error = ref(null);

  const setActiveClient = (client) => {
    if (!client) return;
    const incomingId = client.id ? String(client.id) : null;
    const currentId = activeClient.value?.id ? String(activeClient.value.id) : null;

    if (incomingId && currentId && incomingId !== currentId) {
      reset();
      activeClient.value = { ...client };
      currentUserId.value = incomingId;
    } else {
      activeClient.value = { ...(activeClient.value || {}), ...client };
      if (incomingId) {
        currentUserId.value = incomingId;
      }
    }
    try {
      localStorage.setItem("active_client", JSON.stringify(activeClient.value));
    } catch { }
  };

  const kycData = ref(null);
  const kycLoading = ref(false);
  const kycFetched = ref(false);
  const kycError = ref(null);

  const isSubmittingProfile = ref(false);
  const isSubmittingKyc = ref(false);

  const snackbar = useSnackbarStore();

  // ─── Fetch Client Overview ────────────────────────────────
  const fetchClientOverview = (userId, force = false) => {
    if (!userId) return;
    const strId = String(userId);

    if (currentUserId.value && String(currentUserId.value) !== strId) {
      overviewData.value = null;
      isFetched.value = false;
      currentUserId.value = strId;
    } else {
      currentUserId.value = strId;
    }

    if (loading.value) return;
    if (isFetched.value && !force && overviewData.value) return;

    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      overviewData.value = res?.data || res || null;
      loading.value = false;
      isFetched.value = true;
      const fetchedUser = overviewData.value?.user || (overviewData.value?.id ? overviewData.value : null);
      if (fetchedUser) {
        activeClient.value = { ...(activeClient.value || {}), ...fetchedUser };
        try {
          localStorage.setItem("active_client", JSON.stringify(activeClient.value));
        } catch { }
      }
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;
      snackbar.show(
        err?.message || "Failed to fetch client overview.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.overview, {
      look_up_key: userId,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Fetch Client KYC ─────────────────────────────────────
  const fetchClientKyc = (userId, force = false) => {
    if (!userId) return;
    const strId = String(userId);

    if (currentUserId.value && String(currentUserId.value) !== strId) {
      kycData.value = null;
      kycFetched.value = false;
      currentUserId.value = strId;
    } else {
      currentUserId.value = strId;
    }

    if (kycLoading.value) return;
    if (kycFetched.value && !force && kycData.value) return;

    kycLoading.value = true;
    kycError.value = null;

    const successHandler = (res) => {
      kycData.value = res?.data || res || null;
      kycLoading.value = false;
      kycFetched.value = true;
      const status = kycData.value?.kyc_status || kycData.value?.status;
      if (status && activeClient.value) {
        activeClient.value = { ...activeClient.value, kyc_status: status };
        try {
          localStorage.setItem("active_client", JSON.stringify(activeClient.value));
        } catch { }
      }
    };

    const failureHandler = (err) => {
      kycLoading.value = false;
      kycError.value = err;
      snackbar.show(
        err?.message || "Failed to fetch client KYC.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.kyc, {
      look_up_key: userId,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Update Client Profile ────────────────────────────────
  const updateClientProfile = (userId, profileData, callback) => {
    if (!userId) return;

    isSubmittingProfile.value = true;

    const successHandler = (res) => {
      isSubmittingProfile.value = false;
      snackbar.show(
        res?.message || "Profile details updated successfully.",
        "success",
      );
      if (res?.data || profileData) {
        const merged = {
          ...(activeClient.value || {}),
          ...profileData,
          ...(res?.data || {}),
        };
        setActiveClient(merged);
      }
      fetchClientOverview(userId, true);
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isSubmittingProfile.value = false;
      snackbar.show(
        err?.message || "Failed to update profile details.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(
      urls.KEYS.PATCH,
      urls.clientDepth.userUpdate || urls.clientList.update,
      {
        isTokenRequired: true,
        params: { user_id: userId },
        data: profileData,
        onSuccess: successHandler,
        onFailure: failureHandler,
      },
    );
  };

  // ─── Update Client KYC ────────────────────────────────────
  const updateClientKyc = (userId, kycPayload, callback) => {
    if (!userId) return;

    isSubmittingKyc.value = true;

    const successHandler = (res) => {
      isSubmittingKyc.value = false;
      snackbar.show(
        res?.message || "KYC verification updated successfully.",
        "success",
      );
      fetchClientKyc(userId, true);
      fetchClientOverview(userId, true);
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isSubmittingKyc.value = false;
      snackbar.show(
        err?.message || "Failed to update KYC status.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(
      urls.KEYS.PATCH,
      urls.clientDepth.updateKyc || urls.clientDepth.kyc,
      {
        isTokenRequired: true,
        look_up_key: userId,
        data: kycPayload,
        onSuccess: successHandler,
        onFailure: failureHandler,
      },
    );
  };

  // ─── Upload Client KYC Document ───────────────────────────
  const isUploadingDoc = ref(false);

  const uploadClientDocument = (userId, payload, callback) => {
    if (!userId) return;

    isUploadingDoc.value = true;

    const formData = new FormData();
    formData.append("user_id", userId);
    if (payload.doc_type) {
      formData.append("doc_type", payload.doc_type);
    }
    if (payload.front) {
      formData.append("front", payload.front);
    }
    if (payload.back) {
      formData.append("back", payload.back);
    }

    const successHandler = (res) => {
      isUploadingDoc.value = false;
      snackbar.show(
        res?.message || "KYC document uploaded successfully.",
        "success",
      );
      fetchClientKyc(userId, true);
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isUploadingDoc.value = false;
      snackbar.show(
        err?.message || "Failed to upload KYC document.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(
      urls.KEYS.PATCH,
      urls.clientDepth.uploadDocument || "/user-document-upload",
      {
        isTokenRequired: true,
        data: formData,
        onSuccess: successHandler,
        onFailure: failureHandler,
      },
    );
  };

  // ─── Approve / Reject Client Documents (Super Admin) ────────
  const isApprovingDoc = ref(false);

  const approveOrRejectClientDoc = (payload, callback) => {
    if (!payload?.user_id) return;

    isApprovingDoc.value = true;

    const successHandler = (res) => {
      isApprovingDoc.value = false;
      snackbar.show(
        res?.message ||
          (payload.kyc_status === "approved"
            ? "Document approved successfully."
            : "Document rejected successfully."),
        "success",
      );
      if (payload.kyc_status) {
        if (activeClient.value) {
          activeClient.value = { ...activeClient.value, kyc_status: payload.kyc_status };
        }
        if (overviewData.value?.user) {
          overviewData.value.user.kyc_status = payload.kyc_status;
        } else if (overviewData.value) {
          overviewData.value.kyc_status = payload.kyc_status;
        }
        try {
          localStorage.setItem("active_client", JSON.stringify(activeClient.value || { id: payload.user_id, kyc_status: payload.kyc_status }));
        } catch { }
      }
      if (payload.user_id) {
        fetchClientKyc(payload.user_id, true);
        fetchClientOverview(payload.user_id, true);
      }
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isApprovingDoc.value = false;
      snackbar.show(
        err?.message || err?.error || "Failed to update document approval status.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(
      urls.KEYS.POST,
      urls.clientDepth.docApproval || "/user-doc-approval",
      {
        isTokenRequired: true,
        data: payload,
        onSuccess: successHandler,
        onFailure: failureHandler,
      },
    );
  };

  // ─── User Charts State & Action ───────────────────────────
  const userChartsData = ref(null);
  const userChartsLoading = ref(false);
  const userChartsFetched = ref(false);
  const userChartsError = ref(null);

  const fetchUserCharts = (userId, params = {}, force = false) => {
    if (!userId) return;
    const strId = String(userId);

    if (currentUserId.value && String(currentUserId.value) !== strId) {
      userChartsData.value = null;
      userChartsFetched.value = false;
      currentUserId.value = strId;
    } else {
      currentUserId.value = strId;
    }

    if (userChartsLoading.value) return;
    if (userChartsFetched.value && !force && userChartsData.value && Object.keys(params).length === 0) return;

    userChartsLoading.value = true;
    userChartsError.value = null;

    const successHandler = (res) => {
      userChartsData.value = res?.data || res || null;
      userChartsLoading.value = false;
      userChartsFetched.value = true;
    };

    const failureHandler = (err) => {
      userChartsLoading.value = false;
      userChartsError.value = err;
      snackbar.show(
        err?.message || "Failed to fetch user charts data.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.userCharts, {
      // look_up_key: userId,
      params: { user_id: userId, ...params },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Account Details State & Action ───────────────────────
  const accountDetailsData = ref(null);
  const accountDetailsLoading = ref(false);
  const accountDetailsFetched = ref(false);
  const accountDetailsError = ref(null);

  const fetchAccountDetails = (userId, params = {}, force = false) => {
    if (!userId) return;
    const strId = String(userId);

    if (currentUserId.value && String(currentUserId.value) !== strId) {
      accountDetailsData.value = null;
      accountDetailsFetched.value = false;
      currentUserId.value = strId;
    } else {
      currentUserId.value = strId;
    }

    if (accountDetailsLoading.value) return;
    if (accountDetailsFetched.value && !force && accountDetailsData.value && Object.keys(params).length === 0) return;

    accountDetailsLoading.value = true;
    accountDetailsError.value = null;

    const successHandler = (res) => {
      accountDetailsData.value = res?.data || res || null;
      accountDetailsLoading.value = false;
      accountDetailsFetched.value = true;
    };

    const failureHandler = (err) => {
      accountDetailsLoading.value = false;
      accountDetailsError.value = err;
      snackbar.show(
        err?.message || "Failed to fetch account details.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.accountDetails, {
      // look_up_key: userId,
      params: { user_id: userId, ...params },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── User References (KYC Notes & Documents) ─────────────
  const userReferencesData = ref(null);
  const userReferencesLoading = ref(false);
  const userReferencesFetched = ref(false);
  const userReferencesError = ref(null);
  const isSubmittingReference = ref(false);
  const isDeletingReference = ref(false);

  const fetchUserReferences = (userId, force = false) => {
    if (!userId) return;
    const strId = String(userId);

    if (currentUserId.value && String(currentUserId.value) !== strId) {
      userReferencesData.value = null;
      userReferencesFetched.value = false;
      currentUserId.value = strId;
    } else {
      currentUserId.value = strId;
    }

    if (userReferencesLoading.value) return;
    if (userReferencesFetched.value && !force && userReferencesData.value) return;

    userReferencesLoading.value = true;
    userReferencesError.value = null;

    const successHandler = (res) => {
      userReferencesData.value = res?.data || res || { user_id: userId, notes: [], files: [] };
      userReferencesLoading.value = false;
      userReferencesFetched.value = true;
    };

    const failureHandler = (err) => {
      userReferencesLoading.value = false;
      userReferencesError.value = err;
      // Do not popup blocking error on initial empty states
      console.warn("Failed to fetch user references:", err);
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.userReferences, {
      params: { user_id: userId },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const addUserReference = (userId, payload, callback) => {
    if (!userId) return;

    isSubmittingReference.value = true;

    const successHandler = (res) => {
      isSubmittingReference.value = false;
      snackbar.show(
        res?.message || "KYC note / document added successfully.",
        "success",
      );
      fetchUserReferences(userId, true);
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isSubmittingReference.value = false;
      snackbar.show(
        err?.message || "Failed to add KYC note / document.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(urls.KEYS.POST, urls.clientDepth.userReferences, {
      params: { user_id: userId },
      isTokenRequired: true,
      data: payload,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const updateUserReference = (userId, payload, callback) => {
    if (!userId) return;

    isSubmittingReference.value = true;

    const successHandler = (res) => {
      isSubmittingReference.value = false;
      snackbar.show(
        res?.message || "KYC note / document updated successfully.",
        "success",
      );
      fetchUserReferences(userId, true);
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isSubmittingReference.value = false;
      snackbar.show(
        err?.message || "Failed to update KYC note / document.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(urls.KEYS.PATCH, urls.clientDepth.userReferences, {
      params: { user_id: userId },
      isTokenRequired: true,
      data: payload,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const deleteUserReference = (userId, payload, callback) => {
    if (!userId) return;

    isDeletingReference.value = true;

    const successHandler = (res) => {
      isDeletingReference.value = false;
      snackbar.show(
        res?.message || "KYC note / document deleted successfully.",
        "success",
      );
      fetchUserReferences(userId, true);
      if (typeof callback === "function") callback(null, res);
    };

    const failureHandler = (err) => {
      isDeletingReference.value = false;
      snackbar.show(
        err?.message || "Failed to delete KYC note / document.",
        "error",
      );
      if (typeof callback === "function") callback(err);
    };

    apiRequest(urls.KEYS.DELETE, urls.clientDepth.userReferences, {
      params: { user_id: userId, ...(payload || {}) },
      isTokenRequired: true,
      data: payload,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Client Notifications State & Action ──────────────────
  const clientNotificationsData = ref([]);
  const clientNotificationsLoading = ref(false);
  const clientNotificationsFetched = ref(false);
  const clientNotificationsError = ref(null);

  const fetchClientNotifications = (userId, params = {}, force = false) => {
    if (!userId) return;
    const strId = String(userId);

    if (currentUserId.value && String(currentUserId.value) !== strId) {
      clientNotificationsData.value = [];
      clientNotificationsFetched.value = false;
      currentUserId.value = strId;
    } else {
      currentUserId.value = strId;
    }

    if (clientNotificationsLoading.value) return;
    if (clientNotificationsFetched.value && !force && clientNotificationsData.value?.length > 0 && Object.keys(params).length === 0) return;

    clientNotificationsLoading.value = true;
    clientNotificationsError.value = null;

    const successHandler = (res) => {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      clientNotificationsData.value = list;
      clientNotificationsLoading.value = false;
      clientNotificationsFetched.value = true;
    };

    const failureHandler = (err) => {
      clientNotificationsLoading.value = false;
      clientNotificationsError.value = err;
      snackbar.show(
        err?.message || "Failed to fetch client notifications.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.clientDepth.notifications || urls.notifications.userDepth || "/admin/notification/user-depth", {
      params: { user_id: userId, ...params },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Reset Store ──────────────────────────────────────────
  const reset = () => {
    currentUserId.value = null;
    activeClient.value = null;
    overviewData.value = null;
    loading.value = false;
    isFetched.value = false;
    error.value = null;

    kycData.value = null;
    kycLoading.value = false;
    kycFetched.value = false;
    kycError.value = null;

    userChartsData.value = null;
    userChartsLoading.value = false;
    userChartsFetched.value = false;
    userChartsError.value = null;

    accountDetailsData.value = null;
    accountDetailsLoading.value = false;
    accountDetailsFetched.value = false;
    accountDetailsError.value = null;

    userReferencesData.value = null;
    userReferencesLoading.value = false;
    userReferencesFetched.value = false;
    userReferencesError.value = null;

    clientNotificationsData.value = [];
    clientNotificationsLoading.value = false;
    clientNotificationsFetched.value = false;
    clientNotificationsError.value = null;

    isSubmittingProfile.value = false;
    isSubmittingKyc.value = false;
    isUploadingDoc.value = false;
    isSubmittingReference.value = false;
    isDeletingReference.value = false;
  };

  return {
    currentUserId,
    overviewData,
    activeClient,
    loading,
    isLoading: loading,
    isFetched,
    error,

    kycData,
    kycLoading,
    kycFetched,
    kycError,

    userChartsData,
    userChartsLoading,
    userChartsFetched,
    userChartsError,

    accountDetailsData,
    accountDetailsLoading,
    accountDetailsFetched,
    accountDetailsError,

    userReferencesData,
    userReferencesLoading,
    userReferencesFetched,
    userReferencesError,

    clientNotificationsData,
    clientNotificationsLoading,
    clientNotificationsFetched,
    clientNotificationsError,

    isSubmittingProfile,
    isSubmittingKyc,
    isUploadingDoc,
    isApprovingDoc,
    isSubmittingReference,
    isDeletingReference,

    setActiveClient,
    fetchClientOverview,
    fetchClientKyc,
    fetchUserCharts,
    fetchAccountDetails,
    fetchUserReferences,
    fetchClientNotifications,
    addUserReference,
    updateUserReference,
    deleteUserReference,
    updateClientProfile,
    updateClientKyc,
    uploadClientDocument,
    approveOrRejectClientDoc,
    reset,
  };
});
