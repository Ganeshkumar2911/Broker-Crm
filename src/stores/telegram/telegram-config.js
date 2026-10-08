import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const emptyAuditLogData = {};

export const useTelegramConfigurationStore = defineStore(
  "telegramConfiguration",
  () => {
    const snackbar = useSnackbarStore();

    const data = ref([]);
    const isFetched = ref(false);

    const auditLogData = ref(emptyAuditLogData);
    const loading = ref(false);
    const actionLoading = ref(false);
    const toggleAction = ref({
      togglePending: false,
      toggleField: "",
    });
    const deleteLoading = ref(false);

    const showModal = ref(false);
    const editingData = ref(null);

    const isEdit = computed(() => !!editingData.value);

    // ───────────────────────────────────────────────────────────
    // Helper: turn a value into a real boolean regardless of
    // whether the API sends true/false, "true"/"false", 1/0, "1"/"0"
    // ───────────────────────────────────────────────────────────
    const toBool = (val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "number") return val === 1;
      if (typeof val === "string")
        return val.toLowerCase() === "true" || val === "1";
      return !!val;
    };

    // ───────────────────────────────────────────────────────────
    // Helper: Convert a FLAT ARRAY response into the
    // { MODULE: { ENTITY: { ACTION: { SUCCESS, FAILED } } } } shape.
    // Only used if the API ever sends rows instead of a grouped object.
    // ───────────────────────────────────────────────────────────
    const convertToAuditLogData = (configurations) => {
      const result = {};

      if (!Array.isArray(configurations)) return result;

      configurations.forEach((config) => {
        const module = config.module;
        const entity = config.entity;
        const action = config.action;

        if (!module || !entity || !action) return;

        if (!result[module]) result[module] = {};
        if (!result[module][entity]) result[module][entity] = {};
        if (!result[module][entity][action]) {
          result[module][entity][action] = { SUCCESS: false, FAILED: false };
        }

        const target = result[module][entity][action];

        if (
          Object.prototype.hasOwnProperty.call(config, "notify_on_success") ||
          Object.prototype.hasOwnProperty.call(config, "notify_on_failed")
        ) {
          target.SUCCESS = toBool(config.notify_on_success);
          target.FAILED = toBool(config.notify_on_failed);
        } else if (
          Object.prototype.hasOwnProperty.call(config, "status") &&
          Object.prototype.hasOwnProperty.call(config, "value")
        ) {
          const statusKey = String(config.status).toUpperCase();
          if (statusKey === "SUCCESS") {
            target.SUCCESS = toBool(config.value);
          } else if (statusKey === "FAILED") {
            target.FAILED = toBool(config.value);
          }
        } else if (
          Object.prototype.hasOwnProperty.call(config, "SUCCESS") ||
          Object.prototype.hasOwnProperty.call(config, "FAILED")
        ) {
          target.SUCCESS = toBool(config.SUCCESS);
          target.FAILED = toBool(config.FAILED);
        }
      });

      return result;
    };

    // ───────────────────────────────────────────────────────────
    // Helper: Normalize an ALREADY GROUPED object
    // { MODULE: { ENTITY: { ACTION: { SUCCESS, FAILED } } } }
    // — just makes sure SUCCESS/FAILED are real booleans.
    // ───────────────────────────────────────────────────────────
    const normalizeGroupedData = (obj) => {
      const result = {};

      for (const moduleKey in obj) {
        result[moduleKey] = {};
        for (const entityKey in obj[moduleKey]) {
          result[moduleKey][entityKey] = {};
          for (const actionKey in obj[moduleKey][entityKey]) {
            const val = obj[moduleKey][entityKey][actionKey] || {};
            result[moduleKey][entityKey][actionKey] = {
              SUCCESS: toBool(val.SUCCESS),
              FAILED: toBool(val.FAILED),
            };
          }
        }
      }

      return result;
    };

    // ─── Fetch all configurations from API
    // FIX: API returns data ALREADY GROUPED as
    // { MODULE: { ENTITY: { ACTION: { SUCCESS, FAILED } } } } —
    // it is NOT a flat array. Previously convertToAuditLogData()
    // was always called, which immediately returns {} for
    // anything that isn't an array — so auditLogData stayed
    // empty forever and the UI showed nothing.
    const fetchConfigurations = (force = false) => {
      loading.value = true;

      apiRequest(urls.KEYS.GET, urls.telegram_config.list, {
        isTokenRequired: true,

        onSuccess(res) {
          const raw = res?.data ?? res ?? {};

          if (Array.isArray(raw)) {
            // Flat array of rows -> needs conversion
            data.value = raw;
            auditLogData.value = convertToAuditLogData(raw);
          } else {
            // Already grouped object -> just normalize booleans
            data.value = raw;
            auditLogData.value = normalizeGroupedData(raw);
          }

          loading.value = false;
        },

        onFailure(err) {
          loading.value = false;
          snackbar.show(
            err.message || "Failed to load configurations",
            "error",
          );
        },
      });
    };

    // ───────────────────────────────────────────────────────────
    // Low level API wrappers, wrapped in Promises so we can await
    // multiple calls (e.g. SUCCESS + FAILED, or several actions)
    // and only fetch/notify once at the end instead of spamming
    // requests/snackbars.
    // ───────────────────────────────────────────────────────────
    const createConfigurationRequest = (payload) => {
      return new Promise((resolve, reject) => {
        apiRequest(urls.KEYS.POST, urls.telegram_config.create, {
          data: payload,
          isTokenRequired: true,
          onSuccess: (res) => resolve(res),
          onFailure: (err) => reject(err),
        });
      });
    };

    const updateConfigurationRequest = (payload) => {
      return new Promise((resolve, reject) => {
        apiRequest(urls.KEYS.PUT, urls.telegram_config.update, {
          data: payload,
          isTokenRequired: true,
          onSuccess: (res) => resolve(res),
          onFailure: (err) => reject(err),
        });
      });
    };

    const createConfiguration = (payload) => {
      actionLoading.value = true;
      createConfigurationRequest(payload)
        .then(() => {
          actionLoading.value = false;
          snackbar.show("Configuration created successfully", "success");
          fetchConfigurations();
          closeModal();
        })
        .catch((err) => {
          actionLoading.value = false;
          snackbar.show(
            err?.message || "Failed to create configuration",
            "error",
          );
        });
    };

    const updateConfiguration = (payload) => {
      actionLoading.value = true;
      updateConfigurationRequest(payload)
        .then(() => {
          actionLoading.value = false;
          snackbar.show("Configuration updated successfully", "success");
          fetchConfigurations();
          closeModal();
        })
        .catch((err) => {
          actionLoading.value = false;
          snackbar.show(
            err?.message || "Failed to update configuration",
            "error",
          );
        });
    };

    const deleteConfiguration = (id) => {
      deleteLoading.value = true;

      apiRequest(urls.KEYS.DELETE, urls.telegram_config.delete, {
        look_up_key: id,
        isTokenRequired: true,

        onSuccess() {
          deleteLoading.value = false;
          snackbar.show("Configuration deleted", "success");
          fetchConfigurations();
        },

        onFailure(err) {
          deleteLoading.value = false;
          snackbar.show(err.message, "error");
        },
      });
    };

    const addConfiguration = (newConfig) => {
      const { module, entity, action, success, failed } = newConfig;

      const payload = {
        module,
        entity,
        action,
        notify_on_success: !!success,
        notify_on_failed: !!failed,
      };

      actionLoading.value = true;
      createConfigurationRequest(payload)
        .then(() => {
          if (!auditLogData.value[module]) auditLogData.value[module] = {};
          if (!auditLogData.value[module][entity])
            auditLogData.value[module][entity] = {};
          auditLogData.value[module][entity][action] = {
            SUCCESS: !!success,
            FAILED: !!failed,
          };

          actionLoading.value = false;
          snackbar.show("Configuration created successfully", "success");
          showModal.value = false;
        })
        .catch((err) => {
          actionLoading.value = false;
          snackbar.show(
            err?.message || "Failed to create configuration",
            "error",
          );
        });
    };

    const updateAuditLogConfiguration = async (updatedConfig) => {
      const { moduleKey, entityKey, actions } = updatedConfig;

      alert("clicked");
      console.log("config", updatedConfig);

      const original = auditLogData.value?.[moduleKey]?.[entityKey] || {};
      const requests = [];

      Object.keys(actions).forEach((actionKey) => {
        const newVal = actions[actionKey];
        const oldVal = original[actionKey] || {};

        if (!!newVal.SUCCESS !== !!oldVal.SUCCESS) {
          requests.push(
            updateConfigurationRequest({
              module: moduleKey,
              entity: entityKey,
              action: actionKey,
              status: "SUCCESS",
              value: String(!!newVal.SUCCESS),
            }),
          );
        }

        if (!!newVal.FAILED !== !!oldVal.FAILED) {
          requests.push(
            updateConfigurationRequest({
              module: moduleKey,
              entity: entityKey,
              action: actionKey,
              status: "FAILED",
              value: String(!!newVal.FAILED),
            }),
          );
        }
      });

      if (requests.length === 0) {
        snackbar.show("No changes to save", "info");
        closeModal();
        return;
      }

      actionLoading.value = true;
      try {
        await Promise.all(requests);

        auditLogData.value[moduleKey][entityKey] = { ...actions };

        actionLoading.value = false;
        snackbar.show("Configuration updated successfully", "success");
        fetchConfigurations();
        closeModal();
      } catch (err) {
        actionLoading.value = false;
        snackbar.show(
          err?.message || "Failed to update configuration",
          "error",
        );
      }
    };

    const toggleAuditLogAction = async ({
      moduleKey,
      entityKey,
      actionKey,
      status,
      value,
    }) => {
      toggleAction.value.toggleField = `${moduleKey}-${entityKey}-${actionKey}-${status}`;
      toggleAction.value.togglePending = true;

      const payload = {
        module: moduleKey,
        entity: entityKey,
        action: actionKey,
        status,
        value: String(value),
      };

      const successHandler = () => {
        auditLogData.value[moduleKey][entityKey][actionKey][status] = value;

        toggleAction.value.togglePending = false;
        toggleAction.value.toggleField = "";

        snackbar.show("Configuration updated successfully", "success");
      };

      const failureHandler = (err) => {
        toggleAction.value.toggleField = "";
        toggleAction.value.togglePending = false;
        snackbar.show(err?.message || "Something went wrong.", "error");
      };

      // await updateConfigurationRequest();

      apiRequest(urls.KEYS.PUT, urls.telegram_config.update, {
        data: payload,
        isTokenRequired: true,
        onSuccess: successHandler,
        onFailure: failureHandler,
      });
    };

    const openAdd = () => {
      editingData.value = null;
      showModal.value = true;
    };

    const openEdit = (item) => {
      editingData.value = { ...item };
      showModal.value = true;
    };

    const closeModal = () => {
      editingData.value = null;
      showModal.value = false;
    };

    const submit = (payload) => {
      if (isEdit.value) {
        updateConfiguration({ ...payload, id: editingData.value.id });
      } else {
        createConfiguration(payload);
      }
    };

    return {
      data,
      auditLogData,
      loading,
      actionLoading,
      deleteLoading,
      showModal,
      editingData,
      isEdit,

      fetchConfigurations,
      createConfiguration,
      updateConfiguration,
      deleteConfiguration,
      addConfiguration,
      updateAuditLogConfiguration,
      toggleAuditLogAction,

      openAdd,
      openEdit,
      closeModal,
      submit,
      toggleAction,
    };
  },
);
