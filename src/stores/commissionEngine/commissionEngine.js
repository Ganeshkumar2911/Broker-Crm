import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useCommissionEngineStore = defineStore("commissionEngine", () => {
  const snackbar = useSnackbarStore();

  // ─── 1. Primary State (Direct Data Storage) ────────────
  // Referral link search results: { q, total, items: [...] }
  const referralLinks = ref([]);
  const referralLinksTotal = ref(0);
  const selectedReferralLink = ref(null);

  // Rate Matrix Data: { referral_link_id, referral_link_code, referral_link_name, ib_id, method, methods, symbol_groups, tabs, ... }
  const rateGrid = ref(null);
  const activeGroupConfigId = ref(null);

  // Symbol Groups: [ { id, name, code, sort_order, is_active, member_count }, ... ]
  const symbolGroups = ref([]);
  const activeSymbolGroup = ref(null);
  const symbolGroupMembers = ref([]);

  // Symbols Catalog: { total, page, per_page, items: [...] }
  const symbolsList = ref([]);
  const symbolsPagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
  });

  // Sync Status: { configured, deals_table, sync_interval_seconds, cursor, totals, ... }
  const syncStatus = ref(null);

  // Workflow Settings: { auto_wallet_credit, commission_workflow_balance_approval, mode, description, ... }
  const workflowSettings = ref(null);

  // Open / Closed Trades: { total, page, per_page, items: [...] }
  const tradesList = ref([]);
  const tradesPagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
    total: 0,
    pages: 1,
  });

  // Pending / Commissions: { total, page, per_page, items: [...] }
  const commissionsList = ref([]);
  const commissionsPagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
    total: 0,
    pages: 1,
  });

  // Master Payout Summary: { total_ibs, require_approval_count, auto_settlement_count, inactive_settings_count, configured_count, unconfigured_count, master_state, legacy_global_workflow_deprecated }
  const masterPayoutSummary = ref(null);

  // Per-IB Payout Settings: { ib_id, payout_mode, settlement_frequency, settle_hour, settle_minute, weekly_weekday, monthly_day, is_active, updated_at, updated_by, exists }
  const currentIbPayoutSettings = ref(null);

  // Settlement Batches: { total, page, per_page, items: [...] }
  const settlementBatches = ref([]);
  const settlementPagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
    total: 0,
    pages: 1,
  });

  // IB Search Options
  const ibSearchOptions = ref([]);

  // Demo Wallets: { items: [...], total, page, per_page, pages }
  const demoWalletsList = ref([]);
  const demoWalletsPagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
    total: 0,
    pages: 1,
  });
  const selectedDemoWallet = ref(null);

  // Demo Wallet Transactions: { items: [...], total, page, per_page, pages }
  const demoTransactionsList = ref([]);
  const demoTransactionsPagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 1,
    total: 0,
    pages: 1,
  });

  // Approvals Workflow State
  const approvalPeriods = ref({ frequency: "monthly", options: [] });
  const approvalsSummary = ref(null);
  const approvalEntriesList = ref([]);
  const approvalEntriesPagination = ref({
    page: 1,
    per_page: 50,
    total_items: 0,
    total_pages: 1,
    total: 0,
    pages: 1,
  });

  // Recalc Revert Date (ETL Settings) State
  const recalcRevertMasterSummary = ref(null);
  const currentIbRecalcRevert = ref(null);
  const recalcRunResult = ref(null);

  // ─── 2. In-Flight Tracking (Prevents Parallel Duplicate Requests) ─
  const inFlight = {
    referralLinks: false,
    rateGrid: false,
    symbolGroups: false,
    symbolGroupMembers: false,
    symbolsList: false,
    syncStatus: false,
    workflowSettings: false,
    tradesList: false,
    commissionsList: false,
    masterPayoutSummary: false,
    currentIbPayoutSettings: false,
    settlementBatches: false,
    demoWallets: false,
    demoTransactions: false,
    demoWalletDetail: false,
    approvalPeriods: false,
    approvalsSummary: false,
    approvalEntries: false,
    approveIbPeriod: false,
    recalcRevertMaster: false,
    currentIbRecalcRevert: false,
    runRecalcRevert: false,
  };

  // ─── 3. isFetched Tracking (Prevents Redundant API Calls) ─
  const isFetched = ref({
    referralLinks: false,
    rateGrid: false,
    symbolGroups: false,
    symbolGroupMembers: false,
    symbolsList: false,
    syncStatus: false,
    workflowSettings: false,
    tradesList: false,
    commissionsList: false,
    masterPayoutSummary: false,
    currentIbPayoutSettings: false,
    settlementBatches: false,
    demoWallets: false,
    demoTransactions: false,
    approvalsSummary: false,
    recalcRevertMaster: false,
    currentIbRecalcRevert: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const ratesLoading = ref(false);
  const searchLoading = ref(false);
  const syncLoading = ref(false);
  const settingsLoading = ref(false);
  const settlementLoading = ref(false);
  const runSettlementLoading = ref(false);
  const demoWalletsLoading = ref(false);
  const demoTransactionsLoading = ref(false);
  const approvalsLoading = ref(false);
  const approvalPeriodsLoading = ref(false);
  const approvalEntriesLoading = ref(false);
  const approveIbLoading = ref(false);
  const recalcRevertLoading = ref(false);
  const runRecalcLoading = ref(false);
  const error = ref(null);

  // ─── 5. Reset Helper ──────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      referralLinks: false,
      rateGrid: false,
      symbolGroups: false,
      symbolGroupMembers: false,
      symbolsList: false,
      syncStatus: false,
      workflowSettings: false,
      tradesList: false,
      commissionsList: false,
      masterPayoutSummary: false,
      currentIbPayoutSettings: false,
      settlementBatches: false,
      demoWallets: false,
      demoTransactions: false,
      approvalsSummary: false,
      recalcRevertMaster: false,
      currentIbRecalcRevert: false,
    };
  };

  // ─── 6. Referral Links Search Action ───────────────────
  const searchReferralLinks = (params = {}, force = false) => {
    if (inFlight.referralLinks) return;
    const isDefault = !params.q && (!params.limit || params.limit === 20);
    if (isFetched.value.referralLinks && !force && isDefault) return;

    inFlight.referralLinks = true;
    searchLoading.value = true;
    error.value = null;

    const queryParams = {
      q: params.q !== undefined ? params.q : "",
      limit: params.limit || 20,
      active_only: params.active_only !== undefined ? params.active_only : true,
    };

    const successHandler = (res) => {
      if (res?.data?.items) {
        referralLinks.value = Array.isArray(res.data.items)
          ? res.data.items
          : [];
        referralLinksTotal.value = res.data.total || referralLinks.value.length;
      } else if (Array.isArray(res?.data)) {
        referralLinks.value = res.data;
        referralLinksTotal.value = res.data.length;
      } else {
        referralLinks.value = [];
        referralLinksTotal.value = 0;
      }
      if (isDefault) {
        isFetched.value.referralLinks = true;
      }
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to search referral links";
      snackbar.show(err?.message || "Failed to search referral links", "error");
    };

    const finallyHandler = () => {
      inFlight.referralLinks = false;
      searchLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.referralLinksSearch, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 7. Rate Grid Fetch Action ─────────────────────────
  const fetchRateGrid = (referralLinkId, method = "per_lot", force = false) => {
    if (!referralLinkId) return;
    if (inFlight.rateGrid) return;

    inFlight.rateGrid = true;
    ratesLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      rateGrid.value = res?.data || null;
      isFetched.value.rateGrid = true;

      // Select first tab if current active tab is not in returned tabs
      if (rateGrid.value?.tabs?.length) {
        const hasActive = rateGrid.value.tabs.some(
          (t) => t.broker_group_config_id === activeGroupConfigId.value,
        );
        if (!hasActive || !activeGroupConfigId.value) {
          activeGroupConfigId.value =
            rateGrid.value.tabs[0].broker_group_config_id;
        }
      } else {
        activeGroupConfigId.value = null;
      }
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load rate matrix";
      snackbar.show(err?.message || "Failed to load rate matrix", "error");
    };

    const finallyHandler = () => {
      inFlight.rateGrid = false;
      ratesLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.rates(referralLinkId), {
      params: { method },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 8. Save Rate Matrix (One Tab) ─────────────────────
  const saveRates = (referralLinkId, payload) => {
    if (!referralLinkId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      const msg = res?.message || "Commission rates saved successfully";
      snackbar.show(msg, "success");
      // Re-fetch rates matrix to guarantee data consistency
      const activeMethod =
        payload?.method || rateGrid.value?.method || "per_lot";
      fetchRateGrid(referralLinkId, activeMethod, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to save commission rates", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.PUT,
      urls.ibCommission.saveRates(referralLinkId),
      {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  // ─── 9. Symbol Groups Actions ──────────────────────────
  const fetchSymbolGroups = (
    params = { active_only: false },
    force = false,
  ) => {
    if (inFlight.symbolGroups) return;
    if (isFetched.value.symbolGroups && !force) return;

    inFlight.symbolGroups = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      symbolGroups.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.symbolGroups = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch symbol groups";
      snackbar.show(err?.message || "Failed to fetch symbol groups", "error");
    };

    const finallyHandler = () => {
      inFlight.symbolGroups = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.symbolGroups, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const createSymbolGroup = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Symbol group created successfully",
        "success",
      );
      fetchSymbolGroups({ active_only: false }, true);
      // Invalidate symbols cache because mapping might have changed
      isFetched.value.symbolsList = false;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create symbol group", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.symbolGroups, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateSymbolGroup = (groupId, payload) => {
    if (!groupId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Symbol group updated successfully",
        "success",
      );
      fetchSymbolGroups({ active_only: false }, true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to update symbol group", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.PUT,
      urls.ibCommission.symbolGroupDetail(groupId),
      {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const deleteSymbolGroup = (groupId) => {
    if (!groupId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Symbol group deleted successfully",
        "success",
      );
      fetchSymbolGroups({ active_only: false }, true);
      isFetched.value.symbolsList = false;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to delete symbol group", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.DELETE,
      urls.ibCommission.symbolGroupDetail(groupId),
      {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  // ─── 10. Symbol Group Members Actions ──────────────────
  const fetchSymbolGroupMembers = (groupId, force = false) => {
    if (!groupId) return;
    if (inFlight.symbolGroupMembers) return;

    inFlight.symbolGroupMembers = true;
    loading.value = true;

    const successHandler = (res) => {
      symbolGroupMembers.value = Array.isArray(res?.data) ? res.data : [];
      isFetched.value.symbolGroupMembers = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch group members", "error");
    };

    const finallyHandler = () => {
      inFlight.symbolGroupMembers = false;
      loading.value = false;
    };

    return apiRequest(
      urls.KEYS.GET,
      urls.ibCommission.symbolGroupMembers(groupId),
      {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const assignSymbolsToGroup = (groupId, payload) => {
    if (!groupId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(res?.message || "Symbols assigned successfully", "success");
      fetchSymbolGroupMembers(groupId, true);
      fetchSymbolGroups({ active_only: false }, true);
      fetchSymbols(
        {
          page: symbolsPagination.value.page,
          per_page: symbolsPagination.value.per_page,
        },
        true,
      );
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to assign symbols", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.POST,
      urls.ibCommission.symbolGroupMembers(groupId),
      {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  const unassignSymbols = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Symbols unassigned successfully",
        "success",
      );
      fetchSymbolGroups({ active_only: false }, true);
      fetchSymbols(
        {
          page: symbolsPagination.value.page,
          per_page: symbolsPagination.value.per_page,
        },
        true,
      );
      if (activeSymbolGroup.value?.id) {
        fetchSymbolGroupMembers(activeSymbolGroup.value.id, true);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to unassign symbols", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.symbolGroupsUnassign, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 11. Symbols Catalog Actions ───────────────────────
  const fetchSymbols = (params = {}, force = false) => {
    if (inFlight.symbolsList) return;
    const isDefault =
      !params.q &&
      !params.unmapped_only &&
      (!params.page || params.page === 1) &&
      (!params.per_page || params.per_page === 10);
    if (isFetched.value.symbolsList && !force && isDefault) return;

    inFlight.symbolsList = true;
    loading.value = true;

    const queryParams = {
      q: params.q || undefined,
      unmapped_only:
        params.unmapped_only !== undefined ? params.unmapped_only : false,
      page: params.page || 1,
      per_page: params.per_page || 10,
    };

    const successHandler = (res) => {
      if (res?.data?.items) {
        const page = res.data.page || queryParams.page;
        const per_page = res.data.per_page || queryParams.per_page;
        const total =
          res.data.total !== undefined
            ? res.data.total
            : symbolsList.value.length;
        const pages = Math.max(1, Math.ceil(total / per_page));

        symbolsList.value = Array.isArray(res.data.items) ? res.data.items : [];
        symbolsPagination.value = {
          page,
          per_page,
          total_items: total,
          total_pages: pages,
          total,
          pages,
        };
      } else if (Array.isArray(res?.data)) {
        symbolsList.value = res.data;
        symbolsPagination.value = {
          page: 1,
          per_page: res.data.length,
          total_items: res.data.length,
          total_pages: 1,
          total: res.data.length,
          pages: 1,
        };
      } else {
        symbolsList.value = [];
        symbolsPagination.value = {
          page: 1,
          per_page: 10,
          total_items: 0,
          total_pages: 1,
          total: 0,
          pages: 1,
        };
      }
      if (isDefault) {
        isFetched.value.symbolsList = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch symbols catalog", "error");
    };

    const finallyHandler = () => {
      inFlight.symbolsList = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.symbols, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 12. Sync Actions ──────────────────────────────────
  const fetchSyncStatus = (force = false) => {
    if (inFlight.syncStatus) return;
    if (isFetched.value.syncStatus && !force) return;

    inFlight.syncStatus = true;
    syncLoading.value = true;

    const successHandler = (res) => {
      syncStatus.value = res?.data || null;
      isFetched.value.syncStatus = true;
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch sync status", "error");
    };

    const finallyHandler = () => {
      inFlight.syncStatus = false;
      syncLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.syncStatus, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const triggerDealsSync = () => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Deals sync triggered successfully",
        "success",
      );
      fetchSyncStatus(true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to trigger deals sync", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.syncDeals, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const triggerSymbolsSync = () => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || "Symbols sync triggered successfully",
        "success",
      );
      fetchSyncStatus(true);
      fetchSymbols(
        { page: 1, per_page: symbolsPagination.value.per_page },
        true,
      );
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to trigger symbols sync", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.syncSymbols, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 13. Workflow Settings Actions ─────────────────────
  const fetchWorkflowSettings = (force = false) => {
    if (inFlight.workflowSettings) return;
    if (isFetched.value.workflowSettings && !force) return;

    inFlight.workflowSettings = true;
    error.value = null;

    const successHandler = (res) => {
      workflowSettings.value = res?.data || null;
      isFetched.value.workflowSettings = true;
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to fetch commission workflow settings",
        "error",
      );
    };

    const finallyHandler = () => {
      inFlight.workflowSettings = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.workflowSettings, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const updateWorkflowSettings = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      workflowSettings.value = res?.data || null;
      const isAuto = res?.data?.auto_wallet_credit;
      snackbar.show(
        res?.message ||
          (isAuto
            ? "Workflow updated: Auto wallet credit enabled (no pending approval required)"
            : "Workflow updated: Commissions will require admin approval before crediting wallet"),
        "success",
      );
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to update workflow settings",
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PUT, urls.ibCommission.workflowSettings, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 14. Open / Closed Trades Actions ──────────────────
  const fetchTrades = (params = {}, force = false) => {
    if (inFlight.tradesList) return;
    const isDefault =
      !params.status &&
      !params.login &&
      !params.ib_id &&
      !params.symbol &&
      !params.date_from &&
      !params.date_to &&
      (!params.page || params.page === 1) &&
      (!params.per_page || params.per_page === 10);

    if (isFetched.value.tradesList && !force && isDefault) return;

    inFlight.tradesList = true;
    loading.value = true;

    const queryParams = {
      status: params.status || undefined,
      login: params.login || undefined,
      ib_id: params.ib_id || undefined,
      symbol: params.symbol || undefined,
      date_from: params.date_from || undefined,
      date_to: params.date_to || undefined,
      date_field: params.date_field || "close_time",
      page: params.page || 1,
      per_page: params.per_page || 10,
    };

    const successHandler = (res) => {
      if (res?.data?.items) {
        const page = res.data.page || queryParams.page;
        const per_page = res.data.per_page || queryParams.per_page;
        const total =
          res.data.total !== undefined ? res.data.total : res.data.items.length;
        const pages = Math.max(1, Math.ceil(total / per_page));

        tradesList.value = Array.isArray(res.data.items) ? res.data.items : [];
        tradesPagination.value = {
          page,
          per_page,
          total_items: total,
          total_pages: pages,
          total,
          pages,
        };
      } else if (Array.isArray(res?.data)) {
        tradesList.value = res.data;
        tradesPagination.value = {
          page: 1,
          per_page: res.data.length,
          total_items: res.data.length,
          total_pages: 1,
          total: res.data.length,
          pages: 1,
        };
      } else {
        tradesList.value = [];
        tradesPagination.value = {
          page: 1,
          per_page: 10,
          total_items: 0,
          total_pages: 1,
          total: 0,
          pages: 1,
        };
      }
      if (isDefault) {
        isFetched.value.tradesList = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch trades", "error");
    };

    const finallyHandler = () => {
      inFlight.tradesList = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.trades, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const rebuildTrades = (payload = { limit: 2000 }) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      const d = res?.data || {};
      snackbar.show(
        res?.message ||
          `Trades rebuilt: ${d.positions ?? 0} positions, ${d.upserted ?? 0} upserted, ${d.closed ?? 0} closed.`,
        "success",
      );
      fetchTrades(
        {
          page: tradesPagination.value.page,
          per_page: tradesPagination.value.per_page,
        },
        true,
      );
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to rebuild trades", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.rebuildTrades, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 15. Pending / Commissions Actions ─────────────────
  const fetchCommissions = (params = {}, force = false) => {
    if (inFlight.commissionsList) return;
    const isDefault =
      !params.status &&
      !params.login &&
      !params.ib_id &&
      !params.trade_id &&
      !params.symbol &&
      !params.date_from &&
      !params.date_to &&
      (!params.page || params.page === 1) &&
      (!params.per_page || params.per_page === 10);

    if (isFetched.value.commissionsList && !force && isDefault) return;

    inFlight.commissionsList = true;
    loading.value = true;

    const queryParams = {
      status: params.status || undefined,
      wallet_target: params.wallet_target || undefined,
      ib_id: params.ib_id || undefined,
      login: params.login || undefined,
      trade_id: params.trade_id || undefined,
      symbol: params.symbol || undefined,
      date_from: params.date_from || undefined,
      date_to: params.date_to || undefined,
      date_field: params.date_field || "created_at",
      page: params.page || 1,
      per_page: params.per_page || 10,
    };

    const successHandler = (res) => {
      if (res?.data?.items) {
        const page = res.data.page || queryParams.page;
        const per_page = res.data.per_page || queryParams.per_page;
        const total =
          res.data.total !== undefined ? res.data.total : res.data.items.length;
        const pages = Math.max(1, Math.ceil(total / per_page));

        commissionsList.value = Array.isArray(res.data.items)
          ? res.data.items
          : [];
        commissionsPagination.value = {
          page,
          per_page,
          total_items: total,
          total_pages: pages,
          total,
          pages,
        };
      } else if (Array.isArray(res?.data)) {
        commissionsList.value = res.data;
        commissionsPagination.value = {
          page: 1,
          per_page: res.data.length,
          total_items: res.data.length,
          total_pages: 1,
          total: res.data.length,
          pages: 1,
        };
      } else {
        commissionsList.value = [];
        commissionsPagination.value = {
          page: 1,
          per_page: 10,
          total_items: 0,
          total_pages: 1,
          total: 0,
          pages: 1,
        };
      }
      if (isDefault) {
        isFetched.value.commissionsList = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to fetch commissions", "error");
    };

    const finallyHandler = () => {
      inFlight.commissionsList = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.commissions, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const calculateCommissions = (
    payload = { limit: 100, login: null, reclaim_skipped: true },
  ) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      const d = res?.data || {};
      if (d.mode === "auto_wallet" || d.auto_wallet_credit) {
        snackbar.show(
          res?.message ||
            `Calculated ${d.trades_processed ?? 0} trades. ${d.auto_wallet_credited ?? 0} commissions credited directly to IB wallet!`,
          "success",
        );
      } else {
        snackbar.show(
          res?.message ||
            `Calculated ${d.trades_processed ?? 0} trades. ${d.pending_entries ?? 0} pending commissions created awaiting admin approval.`,
          "success",
        );
      }
      fetchCommissions(
        {
          page: commissionsPagination.value.page,
          per_page: commissionsPagination.value.per_page,
        },
        true,
      );
      fetchTrades(
        {
          page: tradesPagination.value.page,
          per_page: tradesPagination.value.per_page,
        },
        true,
      );
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to calculate commissions", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.calculateCommissions, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const approveCommission = (id) => {
    if (!id) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message ||
          `Commission #${id} approved and wallet credited successfully.`,
        "success",
      );
      fetchCommissions(
        {
          page: commissionsPagination.value.page,
          per_page: commissionsPagination.value.per_page,
        },
        true,
      );
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || `Failed to approve commission #${id}`,
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.approveCommission(id), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const rejectCommission = (id, reason = "") => {
    if (!id) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show(
        res?.message || `Commission #${id} rejected successfully.`,
        "success",
      );
      fetchCommissions(
        {
          page: commissionsPagination.value.page,
          per_page: commissionsPagination.value.per_page,
        },
        true,
      );
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || `Failed to reject commission #${id}`,
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.ibCommission.rejectCommission(id), {
      data: { reason: reason || undefined },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const bulkApproveCommissions = (ids = []) => {
    if (!ids || ids.length === 0) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      const appCount = res?.data?.approved?.length ?? ids.length;
      const failCount = res?.data?.failed?.length ?? 0;
      snackbar.show(
        res?.message ||
          `Bulk approval complete: ${appCount} approved successfully${failCount > 0 ? `, ${failCount} failed` : ""}.`,
        "success",
      );
      fetchCommissions(
        {
          page: commissionsPagination.value.page,
          per_page: commissionsPagination.value.per_page,
        },
        true,
      );
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to bulk approve commissions",
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.POST,
      urls.ibCommission.bulkApproveCommissions,
      {
        data: { ids },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  // ─── 16. Master Payout Settings Actions ────────────────
  const fetchMasterPayoutSummary = (force = false) => {
    if (inFlight.masterPayoutSummary) return;
    if (isFetched.value.masterPayoutSummary && !force) return;

    inFlight.masterPayoutSummary = true;
    settingsLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      masterPayoutSummary.value = res?.data || null;
      isFetched.value.masterPayoutSummary = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch master payout summary";
      snackbar.show(
        err?.message || "Failed to fetch master payout summary",
        "error",
      );
    };

    const finallyHandler = () => {
      inFlight.masterPayoutSummary = false;
      settingsLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.payoutAllSettings, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const applyPayoutToAll = (payload) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      const msg =
        res?.message || "Payout settings applied to all IBs successfully";
      snackbar.show(msg, "success");
      fetchMasterPayoutSummary(true);
      if (currentIbPayoutSettings.value?.ib_id) {
        fetchIbPayoutSettings(currentIbPayoutSettings.value.ib_id, true);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to apply payout settings to all IBs",
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PUT, urls.ibCommission.payoutAllSettings, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 17. Single IB Payout Settings Actions ─────────────
  const fetchIbPayoutSettings = (ibId, force = false) => {
    if (!ibId) return;
    if (inFlight.currentIbPayoutSettings) return;

    inFlight.currentIbPayoutSettings = true;
    settingsLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      currentIbPayoutSettings.value = res?.data || null;
      isFetched.value.currentIbPayoutSettings = true;
    };

    const failureHandler = (err) => {
      error.value =
        err?.message || `Failed to fetch payout settings for IB #${ibId}`;
      snackbar.show(
        err?.message || `Failed to fetch payout settings for IB #${ibId}`,
        "error",
      );
    };

    const finallyHandler = () => {
      inFlight.currentIbPayoutSettings = false;
      settingsLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.ibPayoutSettings(ibId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const saveIbPayoutSettings = (ibId, payload) => {
    if (!ibId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      currentIbPayoutSettings.value = res?.data || null;
      snackbar.show(
        res?.message || `Payout settings saved for IB #${ibId}`,
        "success",
      );
      fetchMasterPayoutSummary(true);
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || `Failed to save payout settings for IB #${ibId}`,
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PUT, urls.ibCommission.ibPayoutSettings(ibId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 18. Settlement Batches Actions ────────────────────
  const fetchSettlements = (params = {}, force = false) => {
    if (inFlight.settlementBatches) return;
    const isDefault =
      !params.ib_id &&
      !params.period_type &&
      !params.period_key &&
      !params.status &&
      (!params.page || params.page === 1) &&
      (!params.per_page || params.per_page === 10);

    if (isFetched.value.settlementBatches && !force && isDefault) return;

    inFlight.settlementBatches = true;
    settlementLoading.value = true;

    const queryParams = {
      ib_id: params.ib_id || undefined,
      period_type: params.period_type || undefined,
      period_key: params.period_key || undefined,
      status: params.status || undefined,
      page: params.page || 1,
      per_page: params.per_page || 10,
    };

    const successHandler = (res) => {
      if (res?.data?.items) {
        const page = res.data.page || queryParams.page;
        const per_page = res.data.per_page || queryParams.per_page;
        const total =
          res.data.total !== undefined ? res.data.total : res.data.items.length;
        const pages = Math.max(1, Math.ceil(total / per_page));

        settlementBatches.value = Array.isArray(res.data.items)
          ? res.data.items
          : [];
        settlementPagination.value = {
          page,
          per_page,
          total_items: total,
          total_pages: pages,
          total,
          pages,
        };
      } else if (Array.isArray(res?.data)) {
        settlementBatches.value = res.data;
        settlementPagination.value = {
          page: 1,
          per_page: res.data.length,
          total_items: res.data.length,
          total_pages: 1,
          total: res.data.length,
          pages: 1,
        };
      } else {
        settlementBatches.value = [];
        settlementPagination.value = {
          page: 1,
          per_page: 10,
          total_items: 0,
          total_pages: 1,
          total: 0,
          pages: 1,
        };
      }
      if (isDefault) {
        isFetched.value.settlementBatches = true;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to fetch settlement batches",
        "error",
      );
    };

    const finallyHandler = () => {
      inFlight.settlementBatches = false;
      settlementLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.settlements, {
      params: queryParams,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const runSettlement = (payload = {}) => {
    runSettlementLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const isDryRun = !!payload.dry_run;
        if (isDryRun) {
          snackbar.show(
            res?.message ||
              "Settlement dry-run completed successfully (preview only).",
            "info",
          );
        } else {
          snackbar.show(
            res?.message ||
              "Settlement executed and wallet credited successfully!",
            "success",
          );
          fetchSettlements(
            {
              page: settlementPagination.value.page,
              per_page: settlementPagination.value.per_page,
            },
            true,
          );
          fetchCommissions(
            {
              page: commissionsPagination.value.page,
              per_page: commissionsPagination.value.per_page,
            },
            true,
          );
        }
        resolve(res);
      };

      const failureHandler = (err) => {
        snackbar.show(err?.message || "Settlement run failed", "error");
        reject(err);
      };

      const finallyHandler = () => {
        runSettlementLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.ibCommission.runSettlements, {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 19. Search IBs Helper ─────────────────────────────
  const searchIbs = (query = "") => {
    const searchQuery = String(query).trim();
    searchLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        let list = [];
        if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (res?.data?.items && Array.isArray(res.data.items)) {
          list = res.data.items;
        }
        const options = list.map((ib) => {
          const id = ib.ib_id || ib.id || ib.user_id;
          const name =
            ib.ib_name || ib.name || ib.label_name || ib.email || `IB #${id}`;
          const email = ib.email || ib.ib_email || "";
          return {
            label: email ? `${name} (${email})` : `${name} (ID: ${id})`,
            value: id,
            ib_id: id,
            name,
            email,
            referral_code: ib.referral_code || ib.code || "",
          };
        });
        ibSearchOptions.value = options;
        searchLoading.value = false;
        resolve(options);
      };

      const failureHandler = (err) => {
        searchLoading.value = false;
        reject(err);
      };

      const finallyHandler = () => {
        searchLoading.value = false;
      };

      apiRequest(urls.KEYS.GET, urls.ibLedger.allIbs, {
        params: { search: searchQuery },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 20. Fetch Demo Wallets ────────────────────────────
  const fetchDemoWallets = (params = {}, force = false) => {
    if (inFlight.demoWallets) return;
    if (isFetched.value.demoWallets && !force) return;

    inFlight.demoWallets = true;
    demoWalletsLoading.value = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      const data = res?.data;
      demoWalletsList.value = data?.items || (Array.isArray(data) ? data : []);
      demoWalletsPagination.value = {
        page: data?.page || params.page || 1,
        per_page: data?.per_page || params.per_page || 10,
        total_items: data?.total || demoWalletsList.value.length,
        total_pages:
          data?.pages ||
          Math.ceil((data?.total || 1) / (data?.per_page || 10)) ||
          1,
        total: data?.total || demoWalletsList.value.length,
        pages: data?.pages || 1,
      };
      isFetched.value.demoWallets = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load demo wallets";
      snackbar.show(err?.message || "Failed to load demo wallets", "error");
    };

    const finallyHandler = () => {
      inFlight.demoWallets = false;
      demoWalletsLoading.value = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.demoWallets, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 21. Get Single Demo Wallet by IB ──────────────────
  const fetchDemoWalletByIb = (ibId) => {
    if (!ibId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      selectedDemoWallet.value = res?.data || null;
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to load demo wallet details",
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.demoWalletByIb(ibId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 22. Get Single Demo Wallet by User ────────────────
  const fetchDemoWalletByUser = (userId) => {
    if (!userId) return;
    actionLoading.value = true;

    const successHandler = (res) => {
      selectedDemoWallet.value = res?.data || null;
    };

    const failureHandler = (err) => {
      snackbar.show(
        err?.message || "Failed to load demo wallet details",
        "error",
      );
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(
      urls.KEYS.GET,
      urls.ibCommission.demoWalletByUser(userId),
      {
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      },
    );
  };

  // ─── 23. Fetch Demo Wallet Transactions ────────────────
  const fetchDemoTransactions = (params = {}, force = false) => {
    if (inFlight.demoTransactions) return;
    if (isFetched.value.demoTransactions && !force) return;

    inFlight.demoTransactions = true;
    demoTransactionsLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      const data = res?.data;
      demoTransactionsList.value =
        data?.items || (Array.isArray(data) ? data : []);
      demoTransactionsPagination.value = {
        page: data?.page || params.page || 1,
        per_page: data?.per_page || params.per_page || 10,
        total_items: data?.total || demoTransactionsList.value.length,
        total_pages:
          data?.pages ||
          Math.ceil((data?.total || 1) / (data?.per_page || 10)) ||
          1,
        total: data?.total || demoTransactionsList.value.length,
        pages: data?.pages || 1,
      };
      isFetched.value.demoTransactions = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load demo transactions";
      snackbar.show(
        err?.message || "Failed to load demo transactions",
        "error",
      );
    };

    const finallyHandler = () => {
      inFlight.demoTransactions = false;
      demoTransactionsLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.demoWalletTransactions, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── 24. Approvals / Draft Commission Workflow Actions ──
  const fetchApprovalPeriods = (frequency = "monthly", count = 12) => {
    inFlight.approvalPeriods = true;
    approvalPeriodsLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        approvalPeriods.value = res?.data || { frequency, options: [] };
        resolve(approvalPeriods.value);
      };

      const failureHandler = (err) => {
        snackbar.show(err?.message || "Failed to load approval periods", "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.approvalPeriods = false;
        approvalPeriodsLoading.value = false;
      };

      apiRequest(urls.KEYS.GET, urls.ibCommission.approvalPeriods, {
        params: { frequency, count },
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  const fetchApprovalsSummary = (params = {}, force = false) => {
    if (inFlight.approvalsSummary) return;
    if (isFetched.value.approvalsSummary && !force) return;

    inFlight.approvalsSummary = true;
    approvalsLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      approvalsSummary.value = res?.data || null;
      isFetched.value.approvalsSummary = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load commission approvals workflow";
      snackbar.show(err?.message || "Failed to load commission approvals workflow", "error");
    };

    const finallyHandler = () => {
      inFlight.approvalsSummary = false;
      approvalsLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.approvalsSummary, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchApprovalEntries = (params = {}, force = false) => {
    inFlight.approvalEntries = true;
    approvalEntriesLoading.value = true;

    const successHandler = (res) => {
      const data = res?.data;
      approvalEntriesList.value = data?.items || (Array.isArray(data) ? data : []);
      approvalEntriesPagination.value = {
        page: data?.page || params.page || 1,
        per_page: data?.per_page || params.per_page || 50,
        total_items: data?.total || approvalEntriesList.value.length,
        total_pages: data?.pages || Math.ceil((data?.total || 1) / (data?.per_page || 50)) || 1,
        total: data?.total || approvalEntriesList.value.length,
        pages: data?.pages || 1,
      };
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to load IB approval line items", "error");
    };

    const finallyHandler = () => {
      inFlight.approvalEntries = false;
      approvalEntriesLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.approvalEntries, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const approveIbPeriod = (payload = {}) => {
    inFlight.approveIbPeriod = true;
    approveIbLoading.value = true;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const d = res?.data || {};
        const isDryRun = !!payload.dry_run;
        if (isDryRun) {
          snackbar.show(
            res?.message || `Dry-run preview: ${d.approved_count || 0} entries totaling $${Number(d.total_amount || 0).toFixed(2)} ready for approval to ${d.wallet_target || "main"} wallet.`,
            "info"
          );
        } else {
          snackbar.show(
            res?.message || `Approved ${d.approved_count || 0} commissions ($${Number(d.total_amount || 0).toFixed(2)}) credited to ${d.wallet_target || "main"} wallet!`,
            "success"
          );
          // Refresh summary
          fetchApprovalsSummary(
            {
              frequency: payload.frequency,
              period_key: payload.period_key,
            },
            true
          );
        }
        resolve(res);
      };

      const failureHandler = (err) => {
        snackbar.show(err?.message || "Failed to approve IB period commissions", "error");
        reject(err);
      };

      const finallyHandler = () => {
        inFlight.approveIbPeriod = false;
        approveIbLoading.value = false;
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.ibCommission.approveIbPeriod, {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  // ─── 24. Recalc Revert Date (ETL Settings) Actions ─────
  const fetchRecalcRevertMaster = (force = false) => {
    if (inFlight.recalcRevertMaster) return;
    if (isFetched.value.recalcRevertMaster && !force) return;

    inFlight.recalcRevertMaster = true;
    recalcRevertLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      recalcRevertMasterSummary.value = res?.data || null;
      isFetched.value.recalcRevertMaster = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to fetch master recalc revert settings";
      snackbar.show(err?.message || "Failed to fetch master recalc revert settings", "error");
    };

    const finallyHandler = () => {
      inFlight.recalcRevertMaster = false;
      recalcRevertLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.recalcRevertMaster, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const saveUniversalRecalcRevert = (payload) => {
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const msg = res?.message || "Universal recalc revert settings saved successfully";
        snackbar.show(msg, "success");
        fetchRecalcRevertMaster(true);
        if (currentIbRecalcRevert.value?.ib_id) {
          fetchIbRecalcRevert(currentIbRecalcRevert.value.ib_id, true);
        }
        resolve(res);
      };

      const failureHandler = (err) => {
        snackbar.show(err?.message || "Failed to save universal recalc revert settings", "error");
        reject(err);
      };

      const finallyHandler = () => {
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.PUT, urls.ibCommission.recalcRevertMaster, {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  const fetchIbRecalcRevert = (ibId, force = false) => {
    if (!ibId) return;
    if (inFlight.currentIbRecalcRevert) return;

    inFlight.currentIbRecalcRevert = true;
    recalcRevertLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      currentIbRecalcRevert.value = res?.data || null;
      isFetched.value.currentIbRecalcRevert = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || `Failed to fetch recalc revert settings for IB #${ibId}`;
      snackbar.show(err?.message || `Failed to fetch recalc revert settings for IB #${ibId}`, "error");
    };

    const finallyHandler = () => {
      inFlight.currentIbRecalcRevert = false;
      recalcRevertLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.ibCommission.ibRecalcRevert(ibId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const saveIbRecalcRevert = (ibId, payload) => {
    if (!ibId) return;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        currentIbRecalcRevert.value = res?.data || null;
        snackbar.show(res?.message || `Recalc revert settings saved for IB #${ibId}`, "success");
        fetchRecalcRevertMaster(true);
        resolve(res);
      };

      const failureHandler = (err) => {
        snackbar.show(err?.message || `Failed to save recalc revert settings for IB #${ibId}`, "error");
        reject(err);
      };

      const finallyHandler = () => {
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.PUT, urls.ibCommission.ibRecalcRevert(ibId), {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };

  const runRecalcRevert = (payload = {}) => {
    runRecalcLoading.value = true;
    actionLoading.value = true;

    return new Promise((resolve, reject) => {
      const successHandler = (res) => {
        const d = res?.data || {};
        const isDryRun = !!payload.dry_run;
        if (isDryRun) {
          snackbar.show(
            res?.message ||
              `Dry-run preview: ${d.trades_processed ?? 0} trades evaluated, ${d.entries_created ?? 0} commissions would be created.`,
            "info"
          );
        } else {
          snackbar.show(
            res?.message ||
              `Recalculation complete: ${d.trades_processed ?? 0} trades processed, ${d.entries_created ?? 0} pending commissions created.`,
            "success"
          );
          // Refresh list of pending commissions
          fetchCommissions({ status: "pending" }, true);
          fetchRecalcRevertMaster(true);
        }
        recalcRunResult.value = res?.data || res;
        resolve(res);
      };

      const failureHandler = (err) => {
        snackbar.show(err?.message || "Failed to execute recalc revert run", "error");
        reject(err);
      };

      const finallyHandler = () => {
        runRecalcLoading.value = false;
        actionLoading.value = false;
      };

      apiRequest(urls.KEYS.POST, urls.ibCommission.runRecalcRevert, {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
        onFinally: finallyHandler,
      });
    });
  };


  return {
    // State
    referralLinks,
    referralLinksTotal,
    selectedReferralLink,
    rateGrid,
    activeGroupConfigId,
    symbolGroups,
    activeSymbolGroup,
    symbolGroupMembers,
    symbolsList,
    symbolsPagination,
    syncStatus,
    workflowSettings,
    tradesList,
    tradesPagination,
    commissionsList,
    commissionsPagination,
    masterPayoutSummary,
    currentIbPayoutSettings,
    settlementBatches,
    settlementPagination,
    ibSearchOptions,
    demoWalletsList,
    demoWalletsPagination,
    selectedDemoWallet,
    demoTransactionsList,
    demoTransactionsPagination,
    approvalPeriods,
    approvalsSummary,
    approvalEntriesList,
    approvalEntriesPagination,
    recalcRevertMasterSummary,
    currentIbRecalcRevert,
    recalcRunResult,

    // Loading & tracking
    inFlight,
    isFetched,
    loading,
    actionLoading,
    ratesLoading,
    searchLoading,
    syncLoading,
    settingsLoading,
    settlementLoading,
    runSettlementLoading,
    demoWalletsLoading,
    demoTransactionsLoading,
    approvalsLoading,
    approvalPeriodsLoading,
    approvalEntriesLoading,
    approveIbLoading,
    recalcRevertLoading,
    runRecalcLoading,
    error,

    // Actions
    resetFetchedFlags,
    searchReferralLinks,
    fetchRateGrid,
    saveRates,
    fetchSymbolGroups,
    createSymbolGroup,
    updateSymbolGroup,
    deleteSymbolGroup,
    fetchSymbolGroupMembers,
    assignSymbolsToGroup,
    unassignSymbols,
    fetchSymbols,
    fetchSyncStatus,
    triggerDealsSync,
    triggerSymbolsSync,
    fetchWorkflowSettings,
    updateWorkflowSettings,
    fetchTrades,
    rebuildTrades,
    fetchCommissions,
    calculateCommissions,
    approveCommission,
    rejectCommission,
    bulkApproveCommissions,
    fetchMasterPayoutSummary,
    applyPayoutToAll,
    fetchIbPayoutSettings,
    saveIbPayoutSettings,
    fetchSettlements,
    runSettlement,
    searchIbs,
    fetchDemoWallets,
    fetchDemoWalletByIb,
    fetchDemoWalletByUser,
    fetchDemoTransactions,
    fetchApprovalPeriods,
    fetchApprovalsSummary,
    fetchApprovalEntries,
    approveIbPeriod,
    fetchRecalcRevertMaster,
    saveUniversalRecalcRevert,
    fetchIbRecalcRevert,
    saveIbRecalcRevert,
    runRecalcRevert,
  };
});
