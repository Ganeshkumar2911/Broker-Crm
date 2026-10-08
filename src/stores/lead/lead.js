import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useLeadStageStore } from "@/stores/leadStage/leadStage";

export const useLeadStore = defineStore("lead", () => {
  const snackbar = useSnackbarStore();

  // State
  const leads = ref([]);
  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
  });

  const filters = reactive({
    search: "",
    stage: "",
    staff: "",
    source: "",
    priority: "",
    country: "",
    tag_ids: "",
  });

  const currentLead = ref(null);
  const leadHistory = ref([]);
  const dashboardMetrics = ref(null);

  const loading = ref(false);
  const actionLoading = ref(false);
  const detailLoading = ref(false);
  const historyLoading = ref(false);
  const metricsLoading = ref(false);
  const error = ref(null);

  // ─── Actions ────────────────────────────────────────────────────────

  // Helper to refresh stage counts after lead modifications
  const refreshStageCounts = () => {
    const leadStageStore = useLeadStageStore();
    leadStageStore.fetchStages(true);
  };

  // 1. Get All Leads (Paginated & Filtered)
  const fetchLeads = (
    page = pagination.value.page || 1,
    perPage = pagination.value.per_page,
  ) => {
    loading.value = true;
    error.value = null;

    if (page) {
      pagination.value.page = Number(page);
    }
    if (perPage) {
      pagination.value.per_page = Number(perPage);
    }

    const params = {
      page: pagination.value.page,
      per_page: pagination.value.per_page,
    };

    if (filters.search) params.search = filters.search;
    if (filters.stage) params.stage = filters.stage;
    if (filters.staff) params.staff = filters.staff;
    if (filters.source) params.source = filters.source;
    if (filters.priority) params.priority = filters.priority;
    if (filters.country) params.country = filters.country;
    if (filters.tag_ids) params.tag_ids = filters.tag_ids;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        leads.value = res?.data || [];
        if (res?.pagination) {
          pagination.value = {
            ...res.pagination,
            page: Number(res.pagination.page || page),
          };
        }
        resolve(res);
      };

      const failureHandler = (err) => {
        error.value = err;
        if (err?.code !== "ERR_CANCELED") {
          snackbar.show(
            err?.message ||
              err?.response?.data?.message ||
              "Failed to fetch leads",
            "error",
          );
        }
        reject(err);
      };

      const finallyHandler = () => {
        loading.value = false;
      };

      apiRequest(urls.KEYS.GET, urls.lead.list, {
        isTokenRequired: true,
        params,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // 2. Create Lead
  const createLead = (payload) => {
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        actionLoading.value = false;
        snackbar.show(
          res?.message || res?.data?.message || "Lead created successfully",
          "success",
        );
        fetchLeads(1);
        fetchDashboardMetrics();
        refreshStageCounts();
        resolve(res);
      };

      const failureHandler = (err) => {
        actionLoading.value = false;
        snackbar.show(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to create lead",
          "error",
        );
        reject(err);
      };

      apiRequest(urls.KEYS.POST, urls.lead.list, {
        isTokenRequired: true,
        data: payload,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // 3. Get Lead by ID
  const fetchLeadById = (leadId) => {
    detailLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        detailLoading.value = false;
        currentLead.value = res?.data || res;
        resolve(currentLead.value);
      };

      const failureHandler = (err) => {
        detailLoading.value = false;
        snackbar.show(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch lead details",
          "error",
        );
        reject(err);
      };

      apiRequest(urls.KEYS.GET, urls.lead.detail, {
        look_up_key: leadId,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // 4. Update Lead
  const updateLead = (leadId, payload) => {
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        actionLoading.value = false;
        snackbar.show(
          res?.message || res?.data?.message || "Lead updated successfully",
          "success",
        );
        fetchLeads();
        if (currentLead.value?.id === leadId) {
          fetchLeadById(leadId);
        }
        fetchDashboardMetrics();
        refreshStageCounts();
        resolve(res);
      };

      const failureHandler = (err) => {
        actionLoading.value = false;
        snackbar.show(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to update lead",
          "error",
        );
        reject(err);
      };

      apiRequest(urls.KEYS.PATCH, urls.lead.detail, {
        look_up_key: leadId,
        isTokenRequired: true,
        data: payload,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // 5. Assign Lead
  const assignLead = (leadId, staffId) => {
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        actionLoading.value = false;
        snackbar.show(
          res?.message || res?.data?.message || "Lead assigned successfully",
          "success",
        );
        fetchLeads();
        if (currentLead.value?.id === leadId) {
          fetchLeadById(leadId);
        }
        resolve(res);
      };

      const failureHandler = (err) => {
        actionLoading.value = false;
        snackbar.show(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to assign lead",
          "error",
        );
        reject(err);
      };

      apiRequest(urls.KEYS.PATCH, urls.lead.assign, {
        look_up_key: leadId,
        isTokenRequired: true,
        data: { assigned_staff_id: staffId },
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // 6. Get Lead History
  const fetchLeadHistory = (leadId) => {
    historyLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        historyLoading.value = false;
        leadHistory.value = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        resolve(leadHistory.value);
      };

      const failureHandler = (err) => {
        historyLoading.value = false;
        snackbar.show(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch lead history",
          "error",
        );
        reject(err);
      };

      apiRequest(urls.KEYS.GET, urls.lead.history, {
        look_up_key: leadId,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // 7. Get Dashboard Metrics
  const fetchDashboardMetrics = () => {
    metricsLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        metricsLoading.value = false;
        dashboardMetrics.value = res?.data || res || {};
        resolve(dashboardMetrics.value);
      };

      const failureHandler = (err) => {
        metricsLoading.value = false;
        snackbar.show(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch dashboard metrics",
          "error",
        );
        reject(err);
      };

      apiRequest(urls.KEYS.GET, urls.lead.dashboard, {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    });
  };

  // Reset Filters
  const resetFilters = () => {
    filters.search = "";
    filters.stage = "";
    filters.staff = "";
    filters.source = "";
    filters.priority = "";
    filters.country = "";
    filters.tag_ids = "";
    fetchLeads(1);
  };

  return {
    leads,
    pagination,
    filters,
    currentLead,
    leadHistory,
    dashboardMetrics,
    loading,
    actionLoading,
    detailLoading,
    historyLoading,
    metricsLoading,
    error,
    fetchLeads,
    createLead,
    fetchLeadById,
    updateLead,
    assignLead,
    fetchLeadHistory,
    fetchDashboardMetrics,
    resetFilters,
  };
});
