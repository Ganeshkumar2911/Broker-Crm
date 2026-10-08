import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const usePaymentSettingsStore = defineStore("paymentSettings", () => {
  const snackbar = useSnackbarStore();

  // ─────────────────────────────────────
  // State
  // ─────────────────────────────────────
  const restrictions = ref({
    restrict_deposit: false,
    restrict_withdrawal: false,
    restrict_internal_transfer: false,
    updated_count: null,
    scope: "all_clients",
  });

  const loading = ref(false);
  const updateLoading = ref(false);
  const updatingKey = ref(null);
  const error = ref(null);
  const isFetched = ref(false);

  // ─────────────────────────────────────
  // Update Bulk Restrictions (All Clients)
  // ─────────────────────────────────────
  const updateBulkRestrictions = (payload, keyName = null, onSuccess, onFailure) => {
    updateLoading.value = true;
    if (keyName) updatingKey.value = keyName;
    error.value = null;

    const successHandler = (res) => {
      updateLoading.value = false;
      updatingKey.value = null;
      const resData = res?.data || {};

      restrictions.value = {
        ...restrictions.value,
        ...resData,
        ...payload,
      };

      isFetched.value = true;

      snackbar.show(
        res?.message || "Transaction restrictions updated successfully.",
        "success"
      );

      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      updateLoading.value = false;
      updatingKey.value = null;
      error.value = err;

      snackbar.show(
        err?.response?.data?.message ||
          err?.message ||
          err?.error ||
          "Failed to update transaction restrictions.",
        "error"
      );

      if (onFailure) onFailure(err);
    };

    apiRequest(urls.KEYS.PATCH, urls.paymentSettings.bulkRestrictions, {
      isTokenRequired: true,
      data: payload,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ─────────────────────────────────────
  // Reset
  // ─────────────────────────────────────
  const reset = () => {
    restrictions.value = {
      restrict_deposit: false,
      restrict_withdrawal: false,
      restrict_internal_transfer: false,
      updated_count: null,
      scope: "all_clients",
    };
    loading.value = false;
    updateLoading.value = false;
    updatingKey.value = null;
    error.value = null;
    isFetched.value = false;
  };

  return {
    restrictions,
    loading,
    updateLoading,
    updatingKey,
    error,
    isFetched,
    updateBulkRestrictions,
    reset,
  };
});
