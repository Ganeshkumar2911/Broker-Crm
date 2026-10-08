import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { perPageOptions } from "@/constants/pagination";

export const usePlatfromTicketsStore = defineStore("platfromTickets", () => {
  // ─── List State ────────────────────────────────────────
  const data = ref([]);

  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  // ✅ Persist filters between route/tab changes
  const filters = reactive({
    filter: "all",
    status: "",
    priority: "",
    search: "",
    sort: "desc",
    assigned_staff_id: "",
  });

  // ─── Detail State ──────────────────────────────────────
  const detail = ref(null);
  const detailLoading = ref(false);

  const isLoading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);

  const snackbar = useSnackbarStore();

  // ─── Static Filter Options ─────────────────────────────
  const filterOptions = {
    dateFilters: [
      { label: "All", value: "all" },
      { label: "Today", value: "today" },
      { label: "Last 7 Days", value: "last_7_days" },
      { label: "Last 30 Days", value: "last_30_days" },
      { label: "Latest", value: "latest" },
    ],

    statuses: [
      { label: "Open", value: "open" },
      { label: "Pending", value: "pending" },
      { label: "Closed", value: "closed" },
      { label: "Resolved", value: "resolved" },
    ],

    priorities: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Urgent", value: "urgent" },
    ],

    sorts: [
      { label: "Newest First", value: "desc" },
      { label: "Oldest First", value: "asc" },
    ],
  };

  // ─── Helpers ───────────────────────────────────────────
  const buildParams = (page = pagination.value.page || 1) => {
    const params = {
      page,
      per_page: pagination.value.per_page,
      sort: filters.sort,
    };

    if (filters.filter) {
      params.filter = filters.filter;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.priority) {
      params.priority = filters.priority;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.assigned_staff_id) {
      params.assigned_staff_id = filters.assigned_staff_id;
    }

    return params;
  };

  // ─── Fetch Tickets List ────────────────────────────────
  const fetchTickets = (force = false, page = pagination.value.page || 1) => {
    if (isFetched.value && !force && page === pagination.value.page) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    const successHandler = (res) => {
      data.value = res?.data || [];

      pagination.value = res?.pagination || {
        page: 1,
        per_page: 10,
        total_items: 0,
        total_pages: 0,
      };

      pagination.value.page = page;

      isLoading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      isLoading.value = false;
      error.value = err;

      snackbar.show(
        err?.message || err?.error || "Something went wrong.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.platformTickets.list, {
      params: buildParams(page),
      isTokenRequired: true,
      cancelPrevious: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const updatePerPage = (newPerPage) => {
    pagination.value.per_page = Number(newPerPage);
    pagination.value.page = 1;
    fetchTickets(true, 1);
  };

  // ─── Fetch Ticket Detail ──────────────────────────────
  const fetchTicketDetail = (id, silent = false) => {
    if (!id) return;

    // Reset detail only if switching to a different ticket ID
    if (detail.value && String(detail.value.id) !== String(id)) {
      detail.value = null;
    }

    // Only set detailLoading to true if detail is not already loaded and not silent
    if (!detail.value && !silent) {
      detailLoading.value = true;
    }

    const successHandler = (res) => {
      const newData = res?.data || null;
      if (
        detail.value &&
        newData &&
        String(detail.value.id) === String(newData.id)
      ) {
        Object.assign(detail.value, newData);
      } else {
        detail.value = newData;
      }
      detailLoading.value = false;
    };

    const failureHandler = (err) => {
      detailLoading.value = false;
      snackbar.show(
        err?.message || err?.error || "Something went wrong.",
        "error",
      );
    };

    apiRequest(urls.KEYS.GET, urls.platformTickets.detail, {
      look_up_key: id,
      isTokenRequired: true,
      cancelPrevious: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Add Comment ───────────────────────────────────────
  const addComment = (id, payload, onDone) => {
    if (!id) return;

    actionLoading.value = true;

    const commentText =
      typeof payload === "string"
        ? payload
        : payload?.comment || payload?.message || payload?.content || "";

    const requestBody = {
      comment: commentText,
      message: commentText,
    };

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Comment added successfully.", "success");

      // Silent background refresh
      fetchTicketDetail(id, true);

      onDone?.(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(
        err?.message || err?.error || "Something went wrong.",
        "error",
      );
    };

    apiRequest(urls.KEYS.POST, urls.platformTickets.comment, {
      look_up_key: id,
      data: requestBody,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Update Ticket Status ───────────────────────────────
  const updateTicketStatus = (id, payload, onDone) => {
    if (!id) return;

    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Ticket status updated.", "success");

      // Silent background refresh
      fetchTicketDetail(id, true);

      // refresh listing if needed
      fetchTickets(true);

      onDone?.(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(
        err?.message || err?.error || "Something went wrong.",
        "error",
      );
    };

    apiRequest(urls.KEYS.PATCH, urls.platformTickets.updateStatus, {
      look_up_key: id,
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Add Attachment ────────────────────────────────────
  const addAttachment = (id, formData, onDone) => {
    if (!id) return;

    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(
        res?.message || "Attachment uploaded successfully.",
        "success",
      );

      // Silent background refresh
      fetchTicketDetail(id, true);

      onDone?.(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(
        err?.message || err?.error || "Something went wrong.",
        "error",
      );
    };

    apiRequest(urls.KEYS.POST, urls.platformTickets.attachment, {
      look_up_key: id,
      data: formData,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Filters ───────────────────────────────────────────
  const setFilters = (nextFilters = {}) => {
    Object.assign(filters, nextFilters);
  };

  const applyFilters = () => {
    pagination.value.page = 1;
    isFetched.value = false;

    fetchTickets(true, 1);
  };

  const resetFilters = () => {
    filters.filter = "all";
    filters.status = "";
    filters.priority = "";
    filters.search = "";
    filters.sort = "desc";
    filters.assigned_staff_id = "";

    pagination.value.page = 1;
    isFetched.value = false;

    fetchTickets(true, 1);
  };

  // ─── Assign Staff to Ticket ───────────────────────────────
  const assignTicket = (ticketId, staffId, onDone) => {
    if (!ticketId) return;

    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(
        res?.message || "Staff assigned to ticket successfully.",
        "success",
      );
      fetchTickets(true);
      if (detail.value?.id === ticketId) {
        fetchTicketDetail(ticketId, true);
      }
      onDone?.(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(
        err?.message || err?.error || "Failed to assign staff.",
        "error",
      );
    };

    apiRequest(urls.KEYS.PATCH, urls.platformTickets.assign, {
      look_up_key: ticketId,
      data: {
        assigned_staff_id: staffId,
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Pagination ────────────────────────────────────────
  const changePage = (page) => {
    pagination.value.page = page;
    fetchTickets(true, page);
  };

  // ─── Reset ─────────────────────────────────────────────
  // ❌ Filters intentionally NOT reset
  // so state persists between tabs/routes
  const reset = () => {
    data.value = [];

    detail.value = null;
    detailLoading.value = false;

    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    };

    isLoading.value = false;
    actionLoading.value = false;
    error.value = null;
    isFetched.value = false;
  };

  // ─── Create Ticket For User (Admin) ───────────────────
  const createTicketForUser = (payload, onDone) => {
    actionLoading.value = true;

    const ticketData = {
      user_id: payload.user_id,
      subjectCategory: payload.subjectCategory,
      subject_category: payload.subjectCategory,
      subject:
        payload.subjectCategory === "others"
          ? payload.subject
          : payload.subjectCategory || payload.subject,
      description: payload.description,
      priority: payload.priority || "medium",
    };

    // Add due_at only when priority is urgent
    if (
      payload.priority === "urgent" &&
      payload.due_at !== null &&
      payload.due_at !== undefined
    ) {
      ticketData.due_at = String(payload.due_at);
    }

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Ticket created successfully.", "success");
      fetchTickets(true);
      onDone?.(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(
        err?.message || err?.error || "Failed to create ticket.",
        "error",
      );
    };

    apiRequest(urls.KEYS.POST, urls.platformTickets.createAdminTicket, {
      data: ticketData,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  return {
    // state
    data,
    detail,
    pagination,
    filters,
    filterOptions,
    perPageOptions,

    isLoading,
    detailLoading,
    actionLoading,
    error,
    isFetched,

    // list
    fetchTickets,
    createTicketForUser,
    assignTicket,
    changePage,
    updatePerPage,

    // detail
    fetchTicketDetail,
    addComment,
    addAttachment,
    updateTicketStatus,

    // filters
    setFilters,
    applyFilters,
    resetFilters,

    // reset
    reset,
  };
});
