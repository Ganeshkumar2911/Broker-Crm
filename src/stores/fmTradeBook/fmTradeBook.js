import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useTickerStore } from "@/stores/ws/ticker";

// Default schema fallback matching API contract
const defaultFilterSchema = {
  deals: {
    action: {
      aliases: ["type", "order_type"],
      multi: true,
      options: [
        { label: "BUY", value: "BUY" },
        { label: "SELL", value: "SELL" },
      ],
      type: "enum",
    },
    entry: {
      multi: true,
      options: [
        { label: "IN", value: "IN" },
        { label: "OUT", value: "OUT" },
        { label: "INOUT", value: "INOUT" },
        { label: "OUT_BY", value: "OUT_BY" },
      ],
      type: "enum",
    },
    from_date: {
      aliases: ["time_from"],
      type: "date",
    },
    result: {
      options: [
        { label: "profit", value: "profit" },
        { label: "loss", value: "loss" },
        { label: "breakeven", value: "breakeven" },
      ],
      type: "enum",
    },
    search: {
      type: "string",
    },
    symbol: {
      aliases: ["symbols"],
      multi: true,
      type: "string",
    },
    to_date: {
      aliases: ["time_to"],
      type: "date",
    },
  },
  follower_book: {
    include: {
      default: "all",
      multi: true,
      options: [
        { label: "positions", value: "positions" },
        { label: "orders", value: "orders" },
        { label: "deals", value: "deals" },
        { label: "all", value: "all" },
      ],
      type: "enum",
    },
    section_overrides: {
      note: "Prefix any filter with a section name, e.g. positions_status=OPEN or deals_per_page=50.",
      prefixes: ["positions_", "orders_", "deals_"],
      type: "meta",
    },
  },
  master_trades: {
    closed_from: {
      type: "date",
    },
    closed_to: {
      type: "date",
    },
    from_date: {
      aliases: ["opened_from"],
      type: "date",
    },
    order_type: {
      aliases: ["type", "action"],
      multi: true,
      options: [
        { label: "BUY", value: "BUY" },
        { label: "SELL", value: "SELL" },
      ],
      type: "enum",
    },
    result: {
      options: [
        { label: "profit", value: "profit" },
        { label: "loss", value: "loss" },
        { label: "breakeven", value: "breakeven" },
      ],
      type: "enum",
    },
    search: {
      type: "string",
    },
    status: {
      multi: true,
      options: [
        { label: "OPEN", value: "OPEN" },
        { label: "CLOSED", value: "CLOSED" },
      ],
      type: "enum",
    },
    symbol: {
      aliases: ["symbols"],
      multi: true,
      type: "string",
    },
    to_date: {
      aliases: ["opened_to"],
      type: "date",
    },
    trade_source: {
      multi: true,
      options: [
        { label: "manual", value: "manual" },
        { label: "sync", value: "sync" },
      ],
      type: "enum",
    },
  },
  orders: {
    from_date: {
      aliases: ["setup_from"],
      type: "date",
    },
    search: {
      type: "string",
    },
    state: {
      multi: true,
      options: [
        { label: "STARTED", value: "STARTED" },
        { label: "PLACED", value: "PLACED" },
        { label: "CANCELED", value: "CANCELED" },
        { label: "PARTIAL", value: "PARTIAL" },
        { label: "FILLED", value: "FILLED" },
        { label: "REJECTED", value: "REJECTED" },
        { label: "EXPIRED", value: "EXPIRED" },
      ],
      type: "enum",
    },
    symbol: {
      aliases: ["symbols"],
      multi: true,
      type: "string",
    },
    to_date: {
      aliases: ["setup_to"],
      type: "date",
    },
    type: {
      aliases: ["order_type", "action"],
      multi: true,
      options: [
        { label: "BUY", value: "BUY" },
        { label: "SELL", value: "SELL" },
      ],
      type: "enum",
    },
  },
  positions: {
    action: {
      aliases: ["type", "order_type"],
      multi: true,
      options: [
        { label: "BUY", value: "BUY" },
        { label: "SELL", value: "SELL" },
      ],
      type: "enum",
    },
    closed_from: {
      type: "date",
    },
    closed_to: {
      type: "date",
    },
    from_date: {
      aliases: ["opened_from"],
      type: "date",
    },
    result: {
      options: [
        { label: "profit", value: "profit" },
        { label: "loss", value: "loss" },
        { label: "breakeven", value: "breakeven" },
      ],
      type: "enum",
    },
    search: {
      type: "string",
    },
    status: {
      multi: true,
      options: [
        { label: "OPEN", value: "OPEN" },
        { label: "CLOSED", value: "CLOSED" },
      ],
      type: "enum",
    },
    symbol: {
      aliases: ["symbols"],
      multi: true,
      type: "string",
    },
    to_date: {
      aliases: ["opened_to"],
      type: "date",
    },
  },
};

export const useFmTradeBookStore = defineStore("fmTradeBook", () => {
  const snackbar = useSnackbarStore();
  const tickerStore = useTickerStore();

  // Context & Mode
  const mode = ref("fm"); // 'fm' | 'follower'
  const contextId = ref(null);
  const accountInfo = ref(null);
  const activeTab = ref("positions"); // 'positions' | 'orders' | 'deals'

  // Tab Data Lists
  const positions = ref([]);
  const orders = ref([]);
  const deals = ref([]);

  // Summary Metrics
  const summary = ref({
    // Positions
    total_positions: 0,
    open_positions: 0,
    closed_positions: 0,
    winning_positions: 0,
    losing_positions: 0,
    win_rate: null,
    // Orders
    total_orders: 0,
    filled_orders: 0,
    rejected_orders: 0,
    // Deals
    total_deals: 0,
    in_deals: 0,
    out_deals: 0,
    total_commission: 0,
    total_storage: 0,
    // Common / FM Master
    total_volume: 0,
    total_profit: 0,
    total_lot: 0,
    total_pnl: 0,
    total_trades: 0,
    open_trades: 0,
    closed_trades: 0,
    floating_pnl: 0,
    realized_pnl: 0,
  });

  // Filter definitions from API
  const availableFilters = ref(defaultFilterSchema);

  // Pagination
  const pagination = ref({
    page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });

  // Filter State (Dynamic key-values)
  const filters = reactive({
    search: "",
    sort_by: "",
    sort_order: "desc",
  });

  const isLoading = ref(false);
  const isRefreshing = ref(false);
  const followerLoading = ref(false);

  // Active section key based on mode and tab
  const currentSectionKey = computed(() => {
    if (mode.value === "fm") return "master_trades";
    if (activeTab.value === "orders") return "orders";
    if (activeTab.value === "deals") return "deals";
    return "positions";
  });

  // Current active section filter definitions
  const currentSectionFilters = computed(() => {
    if (!availableFilters.value) return {};
    return availableFilters.value[currentSectionKey.value] || {};
  });

  // Set context before fetching
  const setContext = ({ type = "fm", id = null, info = null }) => {
    mode.value = type;
    contextId.value = id;
    if (info) accountInfo.value = info;
  };

  // Fetch Follower specifics if needed
  const fetchFollowerInfo = (followerId) => {
    if (!followerId) return;
    followerLoading.value = true;

    const successHandler = (res) => {
      if (res?.data) {
        accountInfo.value = res.data;
      }
    };

    const failureHandler = (err) => {
      console.warn("Follower trade book details fallback:", err);
    };

    const finallyHandler = () => {
      followerLoading.value = false;
    };

    apiRequest(urls.KEYS.GET, urls.tradeBook.followerDetails, {
      look_up_key: followerId,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // Fetch Filter Metadata from API
  const fetchFilters = () => {
    const successHandler = (res) => {
      if (res?.data) {
        availableFilters.value = res.data;

        // If symbols exist in any filter section, subscribe to ticker store
        const extractedSymbols = [];
        Object.values(res.data).forEach((section) => {
          if (section && typeof section === "object") {
            if (Array.isArray(section.symbol?.options)) {
              section.symbol.options.forEach((opt) => {
                const s = typeof opt === "string" ? opt : opt.value;
                if (s) extractedSymbols.push(s);
              });
            }
            if (Array.isArray(section.symbols)) {
              extractedSymbols.push(...section.symbols);
            }
          }
        });

        if (extractedSymbols.length > 0) {
          tickerStore.updateTickerList([...new Set(extractedSymbols)]);
        }
      }
    };

    const failureHandler = (err) => {
      console.warn("Could not load trade book filter options from API:", err);
    };

    apiRequest(urls.KEYS.GET, urls.tradeBook.filters, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // Build Request Parameters dynamically based on active filters and schema
  const buildParams = () => {
    const params = {
      page: pagination.value.page,
      per_page: pagination.value.per_page,
      sort_order: filters.sort_order || "desc",
    };

    if (filters.sort_by) {
      params.sort_by = filters.sort_by;
    }

    // Attach Context Filter
    if (mode.value === "fm" && contextId.value) {
      params.fm_id = contextId.value;
    } else if (mode.value === "follower" && contextId.value) {
      params.follower_id = contextId.value;
    }

    if (accountInfo.value?.trading_account_id) {
      params.trading_account_id = accountInfo.value.trading_account_id;
    } else if (accountInfo.value?.account_number) {
      params.account_number = accountInfo.value.account_number;
    }

    // Dynamic filters from current active section
    const sectionSchema = currentSectionFilters.value;
    Object.keys(sectionSchema).forEach((fieldKey) => {
      const fieldDef = sectionSchema[fieldKey];
      if (fieldDef?.type === "meta") return;

      const val = filters[fieldKey];
      if (val !== undefined && val !== null && val !== "") {
        params[fieldKey] = Array.isArray(val) ? val.join(",") : val;
      }
    });

    // Support search
    if (filters.search && filters.search.trim() !== "") {
      params.search = filters.search.trim();
    }

    // Date range filters (from_date / to_date)
    if (filters.from_date) {
      params.from_date = filters.from_date;
    }
    if (filters.to_date) {
      params.to_date = filters.to_date;
    }

    // Backwards compatibility mappings for status/state/action/type
    if (params.order_type && !params.type) {
      params.type = params.order_type;
    }
    if (params.action && !params.type) {
      params.type = params.action;
    }

    return params;
  };

  // Main Data Fetch for Active Tab
  const fetchTradesData = (forceRefresh = false) => {
    if (forceRefresh) {
      isRefreshing.value = true;
    } else {
      isLoading.value = true;
    }

    let endpoint = urls.tradeBook.positions;
    let lookUpKey = null;
    const params = buildParams();

    // FM Mode uses master-trades endpoint: GET /trade-book/master-trades/:fm_id
    if (mode.value === "fm" && contextId.value) {
      endpoint = urls.tradeBook.masterTrades;
      lookUpKey = contextId.value;
    } else {
      // Follower mode uses positions / orders / deals
      if (activeTab.value === "orders") {
        endpoint = urls.tradeBook.orders;
      } else if (activeTab.value === "deals") {
        endpoint = urls.tradeBook.deals;
      } else {
        endpoint = urls.tradeBook.positions;
      }
    }

    const successHandler = (res) => {
      const items = res?.data || [];

      if (mode.value === "fm") {
        positions.value = items;
      } else if (activeTab.value === "positions") {
        positions.value = items;
      } else if (activeTab.value === "orders") {
        orders.value = items;
      } else if (activeTab.value === "deals") {
        deals.value = items;
      }

      // Automatically subscribe all unique trade symbols to ticker store right after API response
      if (items.length > 0) {
        const uniqueSymbols = [
          ...new Set(items.map((trade) => trade?.symbol)),
        ].filter(Boolean);

        if (uniqueSymbols.length > 0) {
          tickerStore.updateTickerList(uniqueSymbols);
        }
      }

      // Directly assign summary, pagination, and sort/filters from API response
      summary.value = res?.summary || {};

      if (res?.pagination) {
        pagination.value = res.pagination;
      }

      if (res?.sort?.sort_by) {
        filters.sort_by = res.sort.sort_by;
      }
      if (res?.sort?.sort_order) {
        filters.sort_order = res.sort.sort_order;
      }
      if (res?.filters?.sort_by) {
        filters.sort_by = res.filters.sort_by;
      }
      if (res?.filters?.sort_order) {
        filters.sort_order = res.filters.sort_order;
      }
    };

    const failureHandler = (err) => {
      console.error(`Failed to fetch trade book data:`, err);
      snackbar.show(
        err?.message || `Failed to load trade book data.`,
        "error"
      );
    };

    const finallyHandler = () => {
      isLoading.value = false;
      isRefreshing.value = false;
    };

    apiRequest(urls.KEYS.GET, endpoint, {
      ...(lookUpKey ? { look_up_key: lookUpKey } : {}),
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // Tab switching
  const setActiveTab = (tab) => {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    summary.value = {};
    pagination.value.page = 1;

    // Clear tab-specific filters but preserve global date range and search filters
    const preservedFrom = filters.from_date || filters.start_date;
    const preservedTo = filters.to_date || filters.end_date;
    const preservedSearch = filters.search;

    Object.keys(filters).forEach((key) => {
      if (key === "sort_by" || key === "sort_order") return;
      filters[key] = "";
    });

    if (preservedFrom) {
      filters.from_date = preservedFrom;
    }
    if (preservedTo) {
      filters.to_date = preservedTo;
    }
    if (preservedSearch) {
      filters.search = preservedSearch;
    }

    // Set default sort for active tab
    if (tab === "positions") {
      filters.sort_by = "time_create";
    } else if (tab === "orders") {
      filters.sort_by = "time_setup";
    } else if (tab === "deals") {
      filters.sort_by = "time";
    }

    fetchTradesData();
  };

  let searchTimer = null;
  const setSearch = (searchStr) => {
    filters.search = searchStr;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      pagination.value.page = 1;
      fetchTradesData(true);
    }, 400);
  };

  // Dynamic filter setter for any key
  const setDynamicFilter = (key, value) => {
    filters[key] = value;
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  // Dynamic date range setter
  const setDynamicDateRange = (fromKey, toKey, rangeVal) => {
    if (rangeVal && Array.isArray(rangeVal) && rangeVal.length === 2) {
      filters[fromKey] = rangeVal[0];
      filters[toKey] = rangeVal[1];
    } else {
      filters[fromKey] = "";
      filters[toKey] = "";
    }
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  // Backward compatible setters
  const setStatusFilter = (statusVal) => {
    setDynamicFilter("status", statusVal);
  };

  const setTypeFilter = (typeVal) => {
    setDynamicFilter("type", typeVal);
  };

  const setSymbolFilter = (symVal) => {
    setDynamicFilter("symbol", symVal);
  };

  const setDateFilter = (startDate, endDate) => {
    setDynamicDateRange("from_date", "to_date", startDate && endDate ? [startDate, endDate] : null);
  };

  const setSort = (sortBy, sortOrder) => {
    filters.sort_by = sortBy;
    if (sortOrder) filters.sort_order = sortOrder;
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  const setPage = (newPage) => {
    pagination.value.page = newPage;
    fetchTradesData(true);
  };

  const setPerPage = (payload) => {
    const newPerPage = typeof payload === "object" && payload !== null ? payload.per_page : payload;
    pagination.value.per_page = Number(newPerPage);
    pagination.value.page = 1;
    fetchTradesData(true);
  };

  const resetFilters = (fetch = true) => {
    // Clear all dynamic filter keys in filters
    Object.keys(filters).forEach((key) => {
      if (key === "sort_by" || key === "sort_order") return;
      filters[key] = "";
    });

    if (activeTab.value === "positions") {
      filters.sort_by = "time_create";
    } else if (activeTab.value === "orders") {
      filters.sort_by = "time_setup";
    } else if (activeTab.value === "deals") {
      filters.sort_by = "time";
    } else {
      filters.sort_by = "";
    }
    filters.sort_order = "desc";
    pagination.value.page = 1;

    if (fetch) {
      fetchTradesData(true);
    }
  };

  const resetAll = () => {
    positions.value = [];
    orders.value = [];
    deals.value = [];
    contextId.value = null;
    accountInfo.value = null;
    activeTab.value = "positions";
    pagination.value.page = 1;
    resetFilters(false);
  };

  return {
    mode,
    contextId,
    accountInfo,
    activeTab,
    positions,
    orders,
    deals,
    summary,
    availableFilters,
    currentSectionKey,
    currentSectionFilters,
    pagination,
    filters,
    isLoading,
    isRefreshing,
    followerLoading,
    setContext,
    fetchFollowerInfo,
    fetchFilters,
    fetchTradesData,
    setActiveTab,
    setSearch,
    setDynamicFilter,
    setDynamicDateRange,
    setStatusFilter,
    setTypeFilter,
    setSymbolFilter,
    setDateFilter,
    setSort,
    setPage,
    setPerPage,
    resetFilters,
    resetAll,
  };
});
