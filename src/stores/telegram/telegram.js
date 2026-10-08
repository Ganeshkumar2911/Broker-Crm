import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

// ✅ store id ab unique hai ("telegramSettings"), taaki kisi doosre
// settings store (jaise email settings) se conflict na ho
export const useTelegramSettingsStore = defineStore("telegramSettings", () => {
  // ─── State ─────────────────────────────────────────────
  const data = ref([]);
  const isLoading = ref(false);
  const actionLoading = ref(false);
  const deleteLoading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);
  const toggleLoading = ref(false);

  const pagination = ref({
    page: 1,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  // ✅ Modal related state
  const showModal = ref(false);
  const editingData = ref(null);

  const snackbar = useSnackbarStore();

  // ─── Getters ───────────────────────────────────────────
  const isEdit = computed(() => !!editingData.value);

  // ─── Helpers ───────────────────────────────────────────
  const cleanFilters = (filters = {}) =>
    Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );

  // ─── Modal Controls ────────────────────────────────────
  const openAdd = () => {
    editingData.value = null;
    showModal.value = true;
  };

  const openEdit = (record) => {
    editingData.value = { ...record };
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    editingData.value = null;
  };

  // ─── Fetch List ────────────────────────────────────────
  const fetchSettings = (force = false, page = 1, filters = {}) => {
    if (isFetched.value && !force) return;

    isLoading.value = true;

    const successHandler = (res) => {
      data.value = res?.data || [];
      pagination.value = res?.pagination || pagination.value;
      isLoading.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      isLoading.value = false;
      error.value = err;
      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.telegram.list, {
      params: {
        page,
        per_page: pagination.value.per_page,
        ...cleanFilters(filters),
      },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Create Setting ────────────────────────────────────
  const createSetting = (formData, onDone) => {
    actionLoading.value = true;

    const successHandler = () => {
      actionLoading.value = false;
      snackbar.show("Settings created successfully.", "success");
      fetchSettings(true);
      closeModal();
      onDone?.();
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.telegram.create, {
      data: formData,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Update Setting ────────────────────────────────────
  const updateSetting = (id, formData, onDone) => {
    if (!id) return;

    actionLoading.value = true;

    const successHandler = () => {
      actionLoading.value = false;
      snackbar.show("Settings updated successfully.", "success");
      fetchSettings(true);
      closeModal();
      onDone?.();
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.telegram.update, {
      look_up_key: id,
      data: formData,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Toggle Enable/Disable — LOCAL ONLY ────────────────
  const toggleStatus = (item) => {
    toggleLoading.value = true;

    const payload = {
      bot_token: item.bot_token,
      client_id: item.client_id,
      is_active: !item.is_active,
    };

    apiRequest(urls.KEYS.PUT, urls.telegram.update, {
      look_up_key: item.id,
      data: payload,
      isTokenRequired: true,

      onSuccess: () => {
        item.is_active = payload.is_active;

        toggleLoading.value = false;
        snackbar.show("Status updated successfully.", "success");
      },

      onFailure: (err) => {
        toggleLoading.value = false;
        snackbar.show(err?.message || "Something went wrong.", "error");
      },
    });
  };

  // ─── Submit (decides Create vs Update) ─────────────────
  const submit = (formData, onDone) => {
    if (isEdit.value) {
      console.log(editingData?.value?.id);
      updateSetting(editingData.value.id, formData, onDone);
    } else {
      createSetting(formData, onDone);
    }
  };

  // ─── Delete Setting ─────────────────────────────────────
  const deleteSetting = (id, onDone) => {
    if (!id) return;

    deleteLoading.value = true;

    const successHandler = () => {
      deleteLoading.value = false;
      snackbar.show("Settings deleted successfully.", "success");
      fetchSettings(true);
      onDone?.();
    };

    const failureHandler = (err) => {
      deleteLoading.value = false;
      snackbar.show(err?.message || "Something went wrong.", "error");
    };

    apiRequest(urls.KEYS.DELETE, urls.telegram.delete, {
      look_up_key: id,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─── Reset ─────────────────────────────────────────────
  const reset = () => {
    data.value = [];
    isLoading.value = false;
    actionLoading.value = false;
    deleteLoading.value = false;
    error.value = null;
    isFetched.value = false;

    pagination.value = {
      page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 0,
    };

    showModal.value = false;
    editingData.value = null;
  };

  // ─── Expose ────────────────────────────────────────────
  return {
    data,
    isLoading,
    actionLoading,
    deleteLoading,
    error,
    isFetched,
    pagination,

    // modal state
    showModal,
    editingData,
    isEdit,

    fetchSettings,
    createSetting,
    updateSetting,
    submit,
    deleteSetting,
    toggleStatus,

    openAdd,
    openEdit,
    closeModal,

    reset,
  };
});
