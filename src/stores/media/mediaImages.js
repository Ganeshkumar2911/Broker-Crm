import { defineStore } from "pinia";
import { ref } from "vue";

import apiRequest from "@/api/request";
import urls from "@/api/urls";

import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useMediaImagesStore = defineStore("mediaImages", () => {
  // Snackbar
  const snackbar = useSnackbarStore();

  // ===========================
  // State
  // ===========================

  const mediaGroup = ref(null);

  const records = ref([]);

  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1,
    has_next: false,
    has_prev: false,
  });

  const loading = ref(false);

  const actionLoading = ref(false);

  const error = ref(null);

  const isFetched = ref(false);

  // ===========================
  // Fetch Images
  // ===========================

  const fetchMediaImages = (
    groupId,
    page = pagination.value.page,
  ) => {
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      mediaGroup.value = res?.media_group || null;

      records.value = res?.media_images || [];

      pagination.value = {
        page: res?.pagination?.page ?? 1,
        per_page: res?.pagination?.per_page ?? 10,
        total: res?.pagination?.total ?? 0,
        pages: res?.pagination?.pages ?? 1,
        has_next: res?.pagination?.has_next ?? false,
        has_prev: res?.pagination?.has_prev ?? false,
      };

      isFetched.value = true;

      loading.value = false;
    };

    const failureHandler = (err) => {
      loading.value = false;

      error.value = err;

      snackbar.show(err?.message || "Failed to fetch media images.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.media.images.list, {
      look_up_key: groupId,

      isTokenRequired: true,

      params: {
        page,
        per_page: pagination.value.per_page,
      },

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };
  // ===========================
  // Upload Image
  // ===========================

  const uploadImage = (groupId, payload, onSuccess) => {
    actionLoading.value = true;

    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("media_group_id", groupId);

    if (payload.description) {
      formData.append("description", payload.description);
    }

    if (payload.image) {
      formData.append("image", payload.image);
    }

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Image uploaded successfully.", "success");

      fetchMediaImages(groupId, pagination.value.page);

      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to upload image.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.media.images.create, {
      isTokenRequired: true,

      isMultipart: true,

      data: formData,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  // ===========================
  // Update Image
  // ===========================

  const updateImage = (groupId, imageId, payload, onSuccess) => {
    actionLoading.value = true;

    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("media_group_id", groupId);

    if (payload.description) {
      formData.append("description", payload.description);
    }

    if (typeof payload.is_active !== "undefined") {
      formData.append("is_active", payload.is_active);
    }

    if (payload.image) {
      formData.append("image", payload.image);
    }

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Image updated successfully.", "success");

      fetchMediaImages(groupId, pagination.value.page);

      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to update image.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.media.images.update, {
      look_up_key: imageId,

      isTokenRequired: true,

      isMultipart: true,

      data: formData,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };
  // ===========================
  // Delete Image
  // ===========================

  const deleteImage = (groupId, imageId, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;

      snackbar.show(res?.message || "Image deleted successfully.", "success");

      fetchMediaImages(groupId, pagination.value.page);

      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;

      snackbar.show(err?.message || "Failed to delete image.", "error");
    };

    apiRequest(urls.KEYS.DELETE, urls.media.images.delete, {
      look_up_key: imageId,

      isTokenRequired: true,

      onSuccess: successHandler,

      onFailure: failureHandler,
    });
  };

  // ===========================
  // Pagination
  // ===========================

  const changePage = (groupId, page) => {
    pagination.value.page = page;

    fetchMediaImages(groupId, page);
  };

  // ===========================
  // Reset
  // ===========================

  const reset = () => {
    mediaGroup.value = null;

    records.value = [];

    pagination.value = {
      page: 1,
      per_page: 10,
      total: 0,
      pages: 1,
      has_next: false,
      has_prev: false,
    };

    loading.value = false;

    actionLoading.value = false;

    error.value = null;

    isFetched.value = false;
  };

  // ===========================
  // Return
  // ===========================

  return {
    // State
    mediaGroup,
    records,

    pagination,

    loading,
    actionLoading,

    error,

    isFetched,

    // APIs
    fetchMediaImages,

    uploadImage,
    updateImage,
    deleteImage,

    // Pagination
    changePage,

    // Helpers
    reset,
  };
});
