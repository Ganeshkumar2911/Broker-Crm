import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useLoyaltyStore = defineStore("loyalty", () => {
  const snackbar = useSnackbarStore();

  // ─── State ─────────────────────────────────────────────
  const programsList = ref([]);
  const program = ref(null);
  const tiers = ref([]);
  const rewards = ref([]);
  const storeProducts = ref([]);
  const storeProductsPagination = ref({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 1,
  });
  const storeRedemptions = ref([]);
  const storeRedemptionsPagination = ref({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 1,
  });
  const activeRedemption = ref(null);
  const enrollments = ref([]);
  const enrollmentDetail = ref(null);
  const deals = ref([]);
  const backfillJobs = ref([]);
  const activeBackfillJob = ref(null);

  // ─── In-Flight & isFetched Tracking ────────────────────
  const inFlight = {
    programsList: false,
    program: false,
    tiers: false,
    storeProducts: false,
    rewards: false,
    storeRedemptions: false,
    enrollments: false,
    deals: false,
    backfill: false,
  };

  const isFetched = ref({
    programsList: false,
    program: false,
    tiers: false,
    storeProducts: false,
    rewards: false,
    storeRedemptions: false,
    enrollments: false,
    deals: false,
    backfill: false,
  });

  const loading = ref(false);
  const actionLoading = ref(false);
  const detailLoading = ref(false);
  const error = ref(null);

  const resetFetchedFlags = () => {
    isFetched.value = {
      programsList: false,
      program: false,
      tiers: false,
      storeProducts: false,
      rewards: false,
      storeRedemptions: false,
      enrollments: false,
      deals: false,
      backfill: false,
    };
  };

  // ─── Programs List & Management ─────────────────────────
  const fetchProgramsList = (params = {}, force = false) => {
    if (inFlight.programsList) return;
    if (isFetched.value.programsList && !force) return;

    inFlight.programsList = true;

    const successHandler = (res) => {
      programsList.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.programsList = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch programs list", "error");
    };

    const finallyHandler = () => {
      inFlight.programsList = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.programs, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const createProgram = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Loyalty program created successfully",
        "success",
      );
      fetchProgramsList({}, true);
      if (res?.data) {
        program.value = res.data;
        resetFetchedFlags();
        isFetched.value.program = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to create loyalty program",
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.createProgram, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchProgram = (programId = null, force = false) => {
    if (inFlight.program) return;
    if (isFetched.value.program && !force && !programId) return;

    inFlight.program = true;
    loading.value = true;
    error.value = null;

    const params = programId ? { program_id: programId } : {};

    const successHandler = (res) => {
      const prevId = program.value?.id;
      program.value = res?.data || null;
      isFetched.value.program = true;

      // If switched to a different program, clear stale child collections immediately
      if (prevId && program.value?.id && prevId !== program.value.id) {
        tiers.value = [];
        storeProducts.value = [];
        rewards.value = [];
        storeRedemptions.value = [];
        enrollments.value = [];
        deals.value = [];
        backfillJobs.value = [];

        isFetched.value.tiers = false;
        isFetched.value.storeProducts = false;
        isFetched.value.rewards = false;
        isFetched.value.storeRedemptions = false;
        isFetched.value.enrollments = false;
        isFetched.value.deals = false;
        isFetched.value.backfill = false;
      }
    };

    const failureHandler = (err) => {
      error.value = err;
      snackbar.show(err?.message || "Failed to fetch loyalty program", "error");
    };

    const finallyHandler = () => {
      inFlight.program = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.program, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateProgram = (programId, payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      if (res?.data) {
        program.value = res.data;
        if (Array.isArray(programsList.value)) {
          const idx = programsList.value.findIndex((p) => p.id === programId);
          if (idx !== -1) {
            programsList.value[idx] = {
              ...programsList.value[idx],
              ...res.data,
            };
          }
        }
        // If config changed, also refresh tiers list since copy-on-write generates new tier config rows
        fetchTiers(programId, true);
      } else {
        // Fallback: fetch program & tiers
        fetchProgram(programId, true);
        fetchTiers(programId, true);
      }
      snackbar.show(res?.message || "Program updated successfully", "success");
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update program", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.loyalty.updateProgram(programId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Tiers Actions ─────────────────────────────────────
  const fetchTiers = (programId, force = false) => {
    if (!programId) return;
    if (inFlight.tiers) return;
    if (isFetched.value.tiers && !force) return;

    inFlight.tiers = true;
    loading.value = true;

    const successHandler = (res) => {
      tiers.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.tiers = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch tiers", "error");
    };

    const finallyHandler = () => {
      inFlight.tiers = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.tiers(programId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const createTier = (programId, payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Tier created successfully", "success");
      fetchTiers(programId, true);
      if (program.value?.id === programId) {
        fetchProgram(programId, true);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create tier", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.createTier(programId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateTier = (tierId, payload, programId) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Tier updated successfully", "success");
      if (programId) {
        // Re-fetch tier list to get active config tier IDs and refresh program config_version
        fetchTiers(programId, true);
        if (program.value?.id === programId) {
          fetchProgram(programId, true);
        }
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update tier", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.loyalty.updateTier(tierId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Store Products Actions (/admin/loyalty/store/products) ─────
  const fetchStoreProducts = (params = {}, force = false) => {
    const isDefaultQuery = Object.keys(params).length <= 1;
    if (inFlight.storeProducts) return;
    if (isFetched.value.storeProducts && !force && isDefaultQuery) return;

    inFlight.storeProducts = true;
    loading.value = true;

    const successHandler = (res) => {
      if (res?.data?.items) {
        storeProducts.value = Array.isArray(res.data.items)
          ? res.data.items
          : [];
        storeProductsPagination.value = {
          page: res.data.page || 1,
          per_page: res.data.per_page || 20,
          total: res.data.total || storeProducts.value.length,
          pages: res.data.pages || 1,
        };
      } else if (Array.isArray(res?.data)) {
        storeProducts.value = res.data;
        storeProductsPagination.value = {
          page: 1,
          per_page: res.data.length,
          total: res.data.length,
          pages: 1,
        };
      } else {
        storeProducts.value = [];
      }
      if (isDefaultQuery) {
        isFetched.value.storeProducts = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch store products", "error");
    };

    const finallyHandler = () => {
      inFlight.storeProducts = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.storeProducts, {
      // params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const createStoreProduct = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Store product created successfully",
        "success",
      );
      fetchStoreProducts({ program_id: payload.program_id }, true);
      if (program.value?.id === payload.program_id) {
        fetchProgram(payload.program_id, true);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create store product", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.createStoreProduct, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateStoreProduct = (productId, payload, programId = null) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Store product updated successfully",
        "success",
      );
      fetchStoreProducts(programId ? { program_id: programId } : {}, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update store product", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.PATCH,
      urls.loyalty.updateStoreProduct(productId),
      {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const deleteStoreProduct = (productId, programId = null) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Product deactivated successfully",
        "success",
      );
      fetchStoreProducts(programId ? { program_id: programId } : {}, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to deactivate product", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.DELETE,
      urls.loyalty.deleteStoreProduct(productId),
      {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  // ─── Legacy Rewards Actions ────────────────────────────
  const fetchRewards = (programId, force = false) => {
    if (!programId) return;
    if (inFlight.rewards) return;
    if (isFetched.value.rewards && !force) return;

    inFlight.rewards = true;

    const successHandler = (res) => {
      rewards.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.rewards = true;
    };

    const failureHandler = () => {
      // Quiet fail if using storeProducts
    };

    const finallyHandler = () => {
      inFlight.rewards = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.rewards(programId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const createReward = (programId, payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Reward created successfully", "success");
      fetchRewards(programId, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create reward", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.createReward(programId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateReward = (rewardId, payload, programId) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Reward updated successfully", "success");
      if (programId) {
        fetchRewards(programId, true);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update reward", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.loyalty.updateReward(rewardId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Store Redemptions Actions (/admin/loyalty/store/redemptions) ──
  const fetchStoreRedemptions = (params = {}, force = false) => {
    const isDefaultQuery = Object.keys(params).length <= 1;
    if (inFlight.storeRedemptions) return;
    if (isFetched.value.storeRedemptions && !force && isDefaultQuery) return;

    inFlight.storeRedemptions = true;
    loading.value = true;

    const successHandler = (res) => {
      if (res?.data?.items) {
        storeRedemptions.value = Array.isArray(res.data.items)
          ? res.data.items
          : [];
        storeRedemptionsPagination.value = {
          page: res.data.page || 1,
          per_page: res.data.per_page || 20,
          total: res.data.total || storeRedemptions.value.length,
          pages: res.data.pages || 1,
        };
      } else if (Array.isArray(res?.data)) {
        storeRedemptions.value = res.data;
        storeRedemptionsPagination.value = {
          page: 1,
          per_page: res.data.length,
          total: res.data.length,
          pages: 1,
        };
      } else {
        storeRedemptions.value = [];
      }
      if (isDefaultQuery) {
        isFetched.value.storeRedemptions = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to fetch store redemptions",
        "error",
      );
    };

    const finallyHandler = () => {
      inFlight.storeRedemptions = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.storeRedemptions, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchStoreRedemptionDetail = (redemptionId) => {
    detailLoading.value = true;

    const successHandler = (res) => {
      activeRedemption.value = res?.data || null;
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to fetch redemption details",
        "error",
      );
    };

    const finallyHandler = () => {
      detailLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.GET,
      urls.loyalty.storeRedemptionDetail(redemptionId),
      {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const approveStoreRedemption = (redemptionId, payload = {}, params = {}) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Redemption approved successfully",
        "success",
      );
      fetchStoreRedemptions(params, true);
      if (activeRedemption.value?.id === redemptionId && res?.data) {
        activeRedemption.value = res.data;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to approve redemption", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.POST,
      urls.loyalty.approveStoreRedemption(redemptionId),
      {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const rejectStoreRedemption = (redemptionId, payload = {}, params = {}) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Redemption rejected and points restored",
        "success",
      );
      fetchStoreRedemptions(params, true);
      if (activeRedemption.value?.id === redemptionId && res?.data) {
        activeRedemption.value = res.data;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to reject redemption", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.POST,
      urls.loyalty.rejectStoreRedemption(redemptionId),
      {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const fulfillStoreRedemption = (redemptionId, payload = {}, params = {}) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Redemption fulfilled successfully",
        "success",
      );
      fetchStoreRedemptions(params, true);
      if (activeRedemption.value?.id === redemptionId && res?.data) {
        activeRedemption.value = res.data;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fulfill redemption", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.POST,
      urls.loyalty.fulfillStoreRedemption(redemptionId),
      {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  // ─── Enrollments Actions ───────────────────────────────
  const fetchEnrollments = (params = {}, force = false) => {
    const isDefaultQuery = Object.keys(params).length <= 1;
    if (inFlight.enrollments) return;
    if (isFetched.value.enrollments && !force && isDefaultQuery) return;

    inFlight.enrollments = true;
    loading.value = true;

    const successHandler = (res) => {
      enrollments.value = Array.isArray(res?.data) ? res.data : [];
      if (isDefaultQuery) {
        isFetched.value.enrollments = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch enrollments", "error");
    };

    const finallyHandler = () => {
      inFlight.enrollments = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.enrollments, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const createEnrollment = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Enrollment created successfully",
        "success",
      );
      fetchEnrollments({}, true);
      if (program.value?.id) {
        fetchProgram(program.value.id, true);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create enrollment", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.createEnrollment, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchEnrollmentDetail = (enrollmentId) => {
    detailLoading.value = true;

    const successHandler = (res) => {
      enrollmentDetail.value = res?.data || null;
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to fetch enrollment details",
        "error",
      );
    };

    const finallyHandler = () => {
      detailLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.GET,
      urls.loyalty.enrollmentDetail(enrollmentId),
      {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const updateEnrollmentAccount = (enrollmentId, tradingAccountId) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Trading account updated successfully",
        "success",
      );
      if (res?.data) {
        enrollmentDetail.value = { ...enrollmentDetail.value, ...res.data };
      }
      fetchEnrollments({}, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update trading account", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.PATCH,
      urls.loyalty.updateEnrollment(enrollmentId),
      {
        data: { trading_account_id: Number(tradingAccountId) },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const deenrollMember = ({ enrollmentId, userId, programId, reason = "" } = {}) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Member de-enrolled successfully",
        "success",
      );
      if (res?.data) {
        enrollmentDetail.value = { ...enrollmentDetail.value, ...res.data };
      }
      fetchEnrollments({}, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to de-enroll member", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    if (enrollmentId) {
      return apiRequest(
        urls.KEYS.POST,
        urls.loyalty.deenrollById(enrollmentId),
        {
          data: reason ? { reason } : {},
          isTokenRequired: true,
          onSuccess: successHandler,
          onFailure: failureHandler,
          onFinally: finallyHandler,
        },
      );
    }

    return apiRequest(
      urls.KEYS.POST,
      urls.loyalty.deenroll,
      {
        data: {
          user_id: userId,
          program_id: programId,
          ...(reason ? { reason } : {}),
        },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const attachAccountToEnrollment = (enrollmentId, payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Trading account attached successfully",
        "success",
      );
      if (res?.data) {
        enrollmentDetail.value = { ...enrollmentDetail.value, ...res.data };
      }
      fetchEnrollments({}, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to attach account", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.POST,
      urls.loyalty.attachEnrollmentAccount(enrollmentId),
      {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const detachAccountFromEnrollment = (enrollmentId, accountId) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Trading account detached successfully",
        "success",
      );
      if (res?.data) {
        enrollmentDetail.value = { ...enrollmentDetail.value, ...res.data };
      }
      fetchEnrollments({}, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to detach account", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.DELETE,
      urls.loyalty.detachEnrollmentAccount(enrollmentId, accountId),
      {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const creditWallet = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      const typeLabel =
        payload.transaction_type === "withdrawal"
          ? "withdrawn"
          : payload.transaction_type === "deposit"
            ? "deposited"
            : "credited";
      snackbar.show(
        res?.message || `Loyalty points ${typeLabel} successfully`,
        "success",
      );
      if (res?.data?.available_points !== undefined) {
        if (
          enrollmentDetail.value &&
          (enrollmentDetail.value.id === payload.enrollment_id ||
            enrollmentDetail.value.user_id === payload.user_id)
        ) {
          enrollmentDetail.value.available_points = res.data.available_points;
        }
      }
      fetchEnrollments({}, true);
    };

    const failureHandler = (err) => {
      const typeLabel =
        payload.transaction_type === "withdrawal" ? "withdraw" : "adjust";
      snackbar.show(
        err?.message || `Failed to ${typeLabel} loyalty points`,
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.creditWallet, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Deals Actions ─────────────────────────────────────
  const fetchDeals = (params = {}, force = false) => {
    const isDefaultQuery = Object.keys(params).length <= 1;
    if (inFlight.deals) return;
    if (isFetched.value.deals && !force && isDefaultQuery) return;

    inFlight.deals = true;
    loading.value = true;

    const successHandler = (res) => {
      deals.value = Array.isArray(res?.data) ? res.data : [];
      if (isDefaultQuery) {
        isFetched.value.deals = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch loyalty deals", "error");
    };

    const finallyHandler = () => {
      inFlight.deals = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.deals, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── MT5 History Backfill Actions ───────────────────────
  const startBackfill = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Backfill job queued successfully",
        "success",
      );
      fetchBackfillJobs({}, true);
      if (res?.data) {
        activeBackfillJob.value = res.data;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to start backfill job", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.loyalty.backfill, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchBackfillJobs = (params = {}, force = false) => {
    const isDefaultQuery = Object.keys(params).length === 0;
    if (inFlight.backfill) return;
    if (isFetched.value.backfill && !force && isDefaultQuery) return;

    inFlight.backfill = true;
    loading.value = true;

    const successHandler = (res) => {
      backfillJobs.value = Array.isArray(res?.data) ? res.data : [];
      if (isDefaultQuery) {
        isFetched.value.backfill = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch backfill jobs", "error");
    };

    const finallyHandler = () => {
      inFlight.backfill = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.backfill, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchBackfillJobStatus = (jobId) => {
    const successHandler = (res) => {
      if (res?.data) {
        activeBackfillJob.value = res.data;
        const index = backfillJobs.value.findIndex((j) => j.id === jobId);
        if (index !== -1) {
          backfillJobs.value[index] = res.data;
        }
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch job status", "error");
    };

    return apiRequest(urls.KEYS.GET, urls.loyalty.backfillDetail(jobId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  return {
    // State
    programsList,
    program,
    tiers,
    rewards,
    storeProducts,
    storeProductsPagination,
    storeRedemptions,
    storeRedemptionsPagination,
    activeRedemption,
    enrollments,
    enrollmentDetail,
    deals,
    backfillJobs,
    activeBackfillJob,
    isFetched,
    loading,
    actionLoading,
    detailLoading,
    error,
    resetFetchedFlags,
    // Programs
    fetchProgramsList,
    createProgram,
    fetchProgram,
    updateProgram,
    // Tiers
    fetchTiers,
    createTier,
    updateTier,
    // Store Products & Rewards
    fetchStoreProducts,
    createStoreProduct,
    updateStoreProduct,
    deleteStoreProduct,
    fetchRewards,
    createReward,
    updateReward,
    // Store Redemptions
    fetchStoreRedemptions,
    fetchStoreRedemptionDetail,
    approveStoreRedemption,
    rejectStoreRedemption,
    fulfillStoreRedemption,
    // Enrollments & Wallets
    fetchEnrollments,
    createEnrollment,
    fetchEnrollmentDetail,
    updateEnrollmentAccount,
    deenrollMember,
    attachAccountToEnrollment,
    detachAccountFromEnrollment,
    creditWallet,
    // Deals & Backfill
    fetchDeals,
    startBackfill,
    fetchBackfillJobs,
    fetchBackfillJobStatus,
  };
});
