import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useEnhancedAuditLogsStore = defineStore("enhancedAuditLogs", () => {
  const data = ref([]);
  const filtersData = ref({
    modules: [],
    entity_types: [],
    actions: []
  });
  const loading = ref(false);
  const filterLoading = ref(false);
  const detailLoading = ref(false);
  const isFetched = ref(false);
  const error = ref(null);

  const pagination = ref({
    page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 0,
  });

  const filters = reactive({
    entity_type: null,
    module: null,
    action: null,
    source_id: null,
    destination_id: null,
    search: null,
    start_date: null,
    end_date: null,
  });

  const snackbar = useSnackbarStore();

  const cleanFilters = (payload = {}) =>
    Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );

  const fetchAuditLogs = (force = false) => {
    if (isFetched.value && !force) return;

    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      data.value = res?.data || [];
      if (res?.pagination) {
        pagination.value = res.pagination;
      }
      loading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;
      snackbar.show(err?.message || "Failed to fetch enhanced audit logs.", "error");
    };

    const params = cleanFilters({
      page: pagination.value.page,
      per_page: pagination.value.per_page,
      entity_type: filters.entity_type,
      module: filters.module,
      action: filters.action,
      source_id: filters.source_id,
      destination_id: filters.destination_id,
      search: filters.search,
      start_date: filters.start_date,
      end_date: filters.end_date,
    });

    return apiRequest(urls.KEYS.GET, urls.enhancedAuditLogs.list, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const fetchFilters = (module = null, entityType = null) => {
    filterLoading.value = true;

    const successHandler = (res) => {
      if (res?.step === 'modules') {
        filtersData.value.modules = res.modules || [];
      } else if (res?.step === 'entity_types') {
        filtersData.value.entity_types = res.entity_types || [];
      } else if (res?.step === 'actions') {
        filtersData.value.actions = res.actions || [];
      }
      filterLoading.value = false;
    };

    const failureHandler = (err) => {
      filterLoading.value = false;
      snackbar.show(err?.message || "Failed to fetch filters.", "error");
    };

    const params = cleanFilters({
      module,
      entity_type: entityType
    });

    return apiRequest(urls.KEYS.GET, urls.enhancedAuditLogs.filters, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };
  
  const fetchAuditDetails = (id) => {
    detailLoading.value = true;

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.enhancedAuditLogs.details(id), {
        isTokenRequired: true,
        onSuccess: (res) => {
          detailLoading.value = false;
          resolve(res?.data);
        },
        onFailure: (err) => {
          detailLoading.value = false;
          snackbar.show(err?.message || "Failed to fetch log details.", "error");
          reject(err);
        },
      });
    });
  };

  const fetchUserAuditLogs = (userId, page = 1, perPage = 20, force = false) => {
    if (!userId) return;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      data.value = res?.data || [];
      if (res?.pagination) {
        pagination.value = res.pagination;
      }
      loading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;
      snackbar.show(err?.message || "Failed to fetch client audit logs.", "error");
    };

    return apiRequest(urls.KEYS.GET, urls.enhancedAuditLogs.userTimeline(userId), {
      params: { page, per_page: perPage },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const fetchUserTimeline = (userId, page = 1, perPage = 20) => {
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.enhancedAuditLogs.userTimeline(userId), {
        params: { page, per_page: perPage },
        isTokenRequired: true,
        onSuccess: (res) => resolve(res),
        onFailure: (err) => reject(err),
      });
    });
  };

  const fetchStaffFlow = (sourceId, destinationId, page = 1, perPage = 20) => {
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.enhancedAuditLogs.staffFlow, {
        params: cleanFilters({
          source_id: sourceId,
          destination_id: destinationId,
          page,
          per_page: perPage,
        }),
        isTokenRequired: true,
        onSuccess: (res) => resolve(res),
        onFailure: (err) => reject(err),
      });
    });
  };

  const applyFilters = (nextFilters) => {
    if (nextFilters) {
      Object.assign(filters, nextFilters);
    }
    pagination.value.page = 1;
    isFetched.value = false;
    fetchAuditLogs(true);
  };

  const resetFilters = () => {
    Object.assign(filters, {
      entity_type: null,
      module: null,
      action: null,
      source_id: null,
      destination_id: null,
      search: null,
      start_date: null,
      end_date: null,
    });
    applyFilters();
  };

  const searchClients = (query = "") => {
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.clientLedger.allClients, {
        params: query ? { find_all: true, search: query } : { page: 1, per_page: 10 },
        isTokenRequired: true,
        onSuccess: (res) => {
          const list = (res?.data || []).slice(0, query ? undefined : 10).map((c) => {
            const name = c.name ? c.name.trim() : "";
            const email = c.email ? c.email.trim() : "";
            const label = name || email || `User ${c.id}`;
            return {
              label,
              value: c.id,
              email: c.email,
            };
          });
          resolve(list);
        },
        onFailure: (err) => {
          snackbar.show(err?.message || "Failed to search users.", "error");
          reject(err);
        },
      });
    });
  };

  const searchStaff = (query = "") => {
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.rbac.staff.list, {
        params: {
          page: 1,
          per_page: 10,
          search: query ? query : undefined,
        },
        isTokenRequired: true,
        onSuccess: (res) => {
          const list = (res?.data || []).map((s) => {
            const name = s.name ? s.name.trim() : "";
            const email = s.email ? s.email.trim() : "";
            const label = name || email || `Staff ${s.id}`;
            return {
              label,
              value: s.id,
              email: s.email,
            };
          });
          resolve(list);
        },
        onFailure: (err) => {
          snackbar.show(err?.message || "Failed to search staff.", "error");
          reject(err);
        },
      });
    });
  };

  const updatePerPage = (perPage) => {
    pagination.value.per_page = perPage;
    pagination.value.page = 1;
    isFetched.value = false;
    fetchAuditLogs(true);
  };

  const reset = () => {
    data.value = [];
    filtersData.value = { modules: [], entity_types: [], actions: [] };
    loading.value = false;
    isFetched.value = false;
    error.value = null;
    pagination.value = {
      page: 1,
      per_page: 20,
      total_items: 0,
      total_pages: 0,
    };
    Object.assign(filters, {
      entity_type: null,
      module: null,
      action: null,
      source_id: null,
      destination_id: null,
      search: null,
      start_date: null,
      end_date: null,
    });
  };

  return {
    data,
    filtersData,
    loading,
    filterLoading,
    detailLoading,
    isFetched,
    error,
    pagination,
    filters,
    fetchAuditLogs,
    fetchUserAuditLogs,
    fetchFilters,
    fetchAuditDetails,
    fetchUserTimeline,
    fetchStaffFlow,
    applyFilters,
    resetFilters,
    searchClients,
    searchStaff,
    updatePerPage,
    reset,
  };
});
