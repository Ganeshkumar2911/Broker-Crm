import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import notificationSound from "@/assets/notification.wav";

export const useNotificationsStore = defineStore("notifications", () => {
  const myNotifications = ref([]);
  const adminNotifications = ref([]);
  const myLoading = ref(false);
  const myMoreLoading = ref(false);
  const adminLoading = ref(false);
  const createLoading = ref(false);
  const isMyFetched = ref(false);
  const isAdminFetched = ref(false);

  const myPagination = ref({
    page: 1,
    total_pages: 1,
    per_page: 10,
    total: 0,
    has_more: false,
  });

  const adminPagination = ref({
    page: 1,
    total_pages: 1,
    per_page: 10,
    total: 0,
  });

  const readStatusLogs = ref([]);
  const readStatusLoading = ref(false);
  const readStatusPagination = ref({
    page: 1,
    total_pages: 1,
    per_page: 10,
    total: 0,
  });

  const snackbar = useSnackbarStore();

  // ─── Preload & Unlock Notification Sound ───────────────────────────
  let notificationAudio = null;
  if (typeof window !== "undefined") {
    notificationAudio = new Audio(notificationSound);
    notificationAudio.volume = 1.0;

    const unlockAudio = () => {
      if (!notificationAudio) return;
      notificationAudio
        .play()
        .then(() => {
          notificationAudio.pause();
          notificationAudio.currentTime = 0;
        })
        .catch(() => {});
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
  }

  const playNotificationSound = () => {
    try {
      if (!notificationAudio) {
        notificationAudio = new Audio(notificationSound);
      }
      notificationAudio.currentTime = 0;
      notificationAudio.play().catch((err) => {
        console.warn("Notification sound blocked or failed:", err);
      });
    } catch (err) {
      console.warn("Audio playback error:", err);
    }
  };

  // Computed unread count for current user
  const unreadCount = computed(() => {
    return myNotifications.value.filter((n) => !n.is_read).length;
  });

  // ─── Fetch Logged-in User's Notifications (Page 1) ─────────────────
  const fetchMyNotifications = (force = false) => {
    if (myLoading.value) return;
    if (isMyFetched.value && !force) return;

    myLoading.value = true;

    const successHandler = (res) => {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      myNotifications.value = list;
      if (res && typeof res === "object") {
        const page = res.current_page || 1;
        const totalPages = res.pages || 1;
        myPagination.value = {
          page,
          total_pages: totalPages,
          per_page: res.per_page || 10,
          total: res.total ?? list.length,
          has_more: page < totalPages,
        };
      }
      myLoading.value = false;
      isMyFetched.value = true;
    };

    const failureHandler = (err) => {
      myLoading.value = false;
    };

    apiRequest(urls.KEYS.GET, urls.notifications.myNotifications, {
      params: { page: 1 },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Fetch More Notifications (Append Next Page) ────────────────────
  const fetchMoreMyNotifications = () => {
    if (myMoreLoading.value || myLoading.value) return;
    if (myPagination.value.page >= myPagination.value.total_pages) return;

    const nextPage = myPagination.value.page + 1;
    myMoreLoading.value = true;

    const successHandler = (res) => {
      const newList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      const existingIds = new Set(myNotifications.value.map((n) => n.id));
      newList.forEach((item) => {
        if (!existingIds.has(item.id)) {
          myNotifications.value.push(item);
        }
      });

      if (res && typeof res === "object") {
        const page = res.current_page || nextPage;
        const totalPages = res.pages || myPagination.value.total_pages;
        myPagination.value = {
          page,
          total_pages: totalPages,
          per_page: res.per_page || 10,
          total: res.total ?? myNotifications.value.length,
          has_more: page < totalPages,
        };
      }
      myMoreLoading.value = false;
    };

    const failureHandler = (err) => {
      myMoreLoading.value = false;
    };

    apiRequest(urls.KEYS.GET, urls.notifications.myNotifications, {
      params: { page: nextPage },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Add Single Notification from WebSocket ───────────────────────
  const addNotification = (data) => {
    console.log("🔔 WebSocket received new_notification:", data);
    if (!data) return;
    const item = typeof data === "object" ? data : null;
    if (!item) return;

    // Avoid duplicate entries if already present
    const exists = myNotifications.value.some((n) => n.id === item.id);
    if (!exists) {
      myNotifications.value.unshift({
        ...item,
        is_read: item.is_read ?? false,
      });
      myPagination.value.total += 1;
    }
    playNotificationSound();
  };

  // ─── Fetch Admin Historical Notification List ──────────────────────
  const fetchAdminNotifications = (page = 1, force = false) => {
    if (adminLoading.value && !force) return;

    adminLoading.value = true;

    const successHandler = (res) => {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      adminNotifications.value = list;
      if (res && typeof res === "object") {
        adminPagination.value = {
          page: res.current_page || page,
          total_pages: res.pages || 1,
          per_page: res.per_page || 10,
          total: res.total ?? list.length,
        };
      }
      adminLoading.value = false;
      isAdminFetched.value = true;
    };

    const failureHandler = (err) => {
      adminLoading.value = false;
      snackbar.show(err?.message || "Failed to fetch system notifications.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.notifications.adminList, {
      params: { page },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Fetch Read Status Logs (GET /notifications/read-status/<id>) ──
  const fetchReadStatusLogs = (id, filters = {}) => {
    if (!id) return;
    readStatusLoading.value = true;

    const params = {
      page: filters.page || 1,
    };
    if (filters.status) params.status = filters.status;
    if (filters.role) params.role = filters.role;

    const successHandler = (res) => {
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      readStatusLogs.value = list;
      if (res && typeof res === "object") {
        readStatusPagination.value = {
          page: res.current_page || params.page,
          total_pages: res.pages || 1,
          per_page: res.per_page || 10,
          total: res.total ?? list.length,
        };
      }
      readStatusLoading.value = false;
    };

    const failureHandler = (err) => {
      readStatusLoading.value = false;
      snackbar.show(err?.message || "Failed to fetch read status logs.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.notifications.readStatus, {
      look_up_key: id,
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Mark Notification(s) as Read ─────────────────────────────────
  const markAsRead = (notificationIds) => {
    if (!notificationIds) return;
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    if (ids.length === 0) return;

    const targetItems = myNotifications.value.filter((n) => ids.includes(n.id) && !n.is_read);
    if (targetItems.length === 0) return;

    // Optimistic update
    const prevStates = targetItems.map((item) => ({
      item,
      is_read: item.is_read,
      read_at: item.read_at,
    }));

    targetItems.forEach((item) => {
      item.is_read = true;
      item.read_at = new Date().toISOString();
    });

    const successHandler = () => {
      // Successfully marked as read on server
    };

    const failureHandler = () => {
      // Revert if API fails
      prevStates.forEach(({ item, is_read, read_at }) => {
        item.is_read = is_read;
        item.read_at = read_at;
      });
    };

    apiRequest(urls.KEYS.PUT, urls.notifications.markRead, {
      data: { notification_ids: ids },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Mark All Unread Notifications as Read ─────────────────────────
  const markAllAsRead = () => {
    const unreadIds = myNotifications.value.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  // ─── Create & Dispatch Notification (Admin) ─────────────────────────
  const createNotification = (payload, onDone) => {
    createLoading.value = true;

    const successHandler = (res) => {
      createLoading.value = false;
      snackbar.show(res?.msg || "Notification created & dispatched successfully.", "success");
      fetchAdminNotifications(adminPagination.value.page, true);
      fetchMyNotifications(true);
      if (onDone) onDone();
    };

    const failureHandler = (err) => {
      createLoading.value = false;
      snackbar.show(err?.message || "Failed to create notification.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.notifications.create, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const updateLoadingId = ref(null);

  // ─── Update Notification (Admin PUT /notifications/<id>) ───────────
  const updateNotification = (id, payload, onDone) => {
    updateLoadingId.value = id;

    const successHandler = (res) => {
      updateLoadingId.value = null;
      snackbar.show(res?.msg || "Notification updated successfully.", "success");
      fetchAdminNotifications(adminPagination.value.page, true);
      fetchMyNotifications(true);
      if (onDone) onDone();
    };

    const failureHandler = (err) => {
      updateLoadingId.value = null;
      snackbar.show(err?.message || "Failed to update notification.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.notifications.update, {
      look_up_key: id,
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const sendLoadingId = ref(null);

  // ─── Trigger / Activate Notification (Admin PUT /notifications/send/<id>) ──
  const sendNotification = (id, onDone) => {
    sendLoadingId.value = id;

    const successHandler = (res) => {
      sendLoadingId.value = null;
      snackbar.show(res?.msg || "Notification activated & sent successfully.", "success");
      const found = adminNotifications.value.find((n) => n.id === id);
      if (found) {
        found.is_active = true;
      }
      fetchAdminNotifications(adminPagination.value.page, true);
      fetchMyNotifications(true);
      if (onDone) onDone();
    };

    const failureHandler = (err) => {
      sendLoadingId.value = null;
      snackbar.show(err?.message || "Failed to send notification.", "error");
    };

    apiRequest(urls.KEYS.PUT, `${urls.notifications.send}/${id}`, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  return {
    myNotifications,
    adminNotifications,
    myPagination,
    adminPagination,
    readStatusLogs,
    readStatusLoading,
    readStatusPagination,
    myLoading,
    myMoreLoading,
    adminLoading,
    createLoading,
    updateLoadingId,
    sendLoadingId,
    unreadCount,
    fetchMyNotifications,
    fetchMoreMyNotifications,
    addNotification,
    playNotificationSound,
    fetchAdminNotifications,
    fetchReadStatusLogs,
    markAsRead,
    markAllAsRead,
    createNotification,
    updateNotification,
    sendNotification,
  };
});
