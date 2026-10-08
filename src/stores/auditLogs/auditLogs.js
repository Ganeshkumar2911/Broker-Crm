import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useAuditLogsStore = defineStore("auditLogs", () => {
  const data = ref([]);
  const actionsFilters = ref({});
  const loading = ref(false);
  const isFetched = ref(false);
  const error = ref(null);

  const pagination = ref({
    page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 0,
  });

  const filters = reactive({
    entity: null,
    module: null,
    action: null,
    status: null,
    user_id: null,
  });

  const snackbar = useSnackbarStore();

  // ─── Helpers ─────────────────────────────────────────
  const cleanFilters = (payload = {}) =>
    Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );

  // ─── Fetch Audit Logs ────────────────────────────────
  const fetchAuditLogs = (force = false) => {
    if (isFetched.value && !force) return;

    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      data.value = res?.data || [];
      actionsFilters.value = res?.filters || {};
      pagination.value = res?.pagination || {
        page: 1,
        per_page: 20,
        total_items: 0,
        total_pages: 0,
      };
      loading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;
      snackbar.show(err?.message || "Failed to fetch audit logs.", "error");
    };

    const params = cleanFilters({
      page: pagination.value.page,
      per_page: pagination.value.per_page,
      entity: filters.entity,
      module: filters.module,
      action: filters.action,
      status: filters.status,
      user_id: filters.user_id,
    });

    apiRequest(urls.KEYS.GET, urls.auditLogs.list, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Apply Filters ───────────────────────────────────
  const applyFilters = (nextFilters) => {
    if (nextFilters) {
      Object.assign(filters, nextFilters);
    }
    pagination.value.page = 1;
    isFetched.value = false;
    fetchAuditLogs(true);
  };

  // ─── Reset Filters ───────────────────────────────────
  const resetFilters = () => {
    Object.assign(filters, {
      entity: null,
      module: null,
      action: null,
      status: null,
      user_id: null,
    });
    applyFilters();
  };

  // ─── Search Clients ──────────────────────────────────
  const searchClients = (query = "") => {
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.clientLedger.allClients, {
        params: query ? { find_all: true, search: query } : {},
        isTokenRequired: true,
        onSuccess: (res) => {
          const list = (res?.data || []).map((c) => {
            const name = c.name ? c.name.trim() : "";
            const email = c.email ? c.email.trim() : "";
            const label =
              name && email
                ? `${name} (${email})`
                : name || email || `User ${c.id}`;
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

  // ─── Update Per Page ─────────────────────────────────
  const updatePerPage = (perPage) => {
    pagination.value.per_page = perPage;
    pagination.value.page = 1;
    isFetched.value = false;
    fetchAuditLogs(true);
  };

  // ─── Reset Store ─────────────────────────────────────
  const reset = () => {
    data.value = [];
    actionsFilters.value = {};
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
      entity: null,
      module: null,
      action: null,
      status: null,
      user_id: null,
    });
  };

  return {
    data,
    loading,
    isFetched,
    error,
    pagination,
    filters,
    actionsFilters,
    fetchAuditLogs,
    applyFilters,
    resetFilters,
    searchClients,
    updatePerPage,
    reset,
  };
});

