import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useRbacModulesStore = defineStore("rbacModules", () => {
  const snackbar = useSnackbarStore();

  // State
  const resources = ref([]);
  const actions = ref([]);
  const permissionsMapping = ref([]);

  const loadingResources = ref(false);
  const loadingActions = ref(false);
  const loadingPermissions = ref(false);
  const actionLoading = ref(false);

  const error = ref(null);
  const isFetched = ref(false);

  // Filters
  const filters = ref({
    resourceSearch: "",
    actionSearch: "",
    permissionSearch: "",
    resourceFilterId: null,
    actionFilterId: null,
  });

  // ===========================
  // Resources CRUD
  // ===========================

  const fetchResources = (force = false) => {
    if (loadingResources.value) return;
    loadingResources.value = true;
    error.value = null;

    const successHandler = (res) => {
      resources.value = res?.data || [];
      loadingResources.value = false;
    };

    const failureHandler = (err) => {
      loadingResources.value = false;
      error.value = err;
      snackbar.show(err?.message || "Failed to fetch resources.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.rbac.resources.list, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const createResource = (payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Resource created successfully.", "success");
      fetchResources(true);
      fetchPermissionsMapping(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to create resource.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.rbac.resources.create, {
      isTokenRequired: true,
      data: {
        name: payload.name,
        slug: payload.slug,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const updateResource = (resourceId, payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Resource updated successfully.", "success");
      fetchResources(true);
      fetchPermissionsMapping(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to update resource.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.rbac.resources.update, {
      isTokenRequired: true,
      look_up_key: resourceId,
      data: {
        name: payload.name,
        slug: payload.slug,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const deleteResource = (resourceId, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Resource deleted successfully.", "success");
      fetchResources(true);
      fetchPermissionsMapping(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to delete resource.", "error");
    };

    apiRequest(urls.KEYS.DELETE, urls.rbac.resources.delete, {
      isTokenRequired: true,
      look_up_key: resourceId,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ===========================
  // Actions CRUD
  // ===========================

  const fetchActions = (force = false) => {
    if (loadingActions.value) return;
    loadingActions.value = true;

    const successHandler = (res) => {
      actions.value = res?.data || [];
      loadingActions.value = false;
    };

    const failureHandler = (err) => {
      loadingActions.value = false;
      snackbar.show(err?.message || "Failed to fetch actions.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.rbac.actions.list, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const createAction = (payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Action created successfully.", "success");
      fetchActions(true);
      fetchPermissionsMapping(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to create action.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.rbac.actions.create, {
      isTokenRequired: true,
      data: {
        name: payload.name,
        slug: payload.slug,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const updateAction = (actionId, payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Action updated successfully.", "success");
      fetchActions(true);
      fetchPermissionsMapping(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to update action.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.rbac.actions.update, {
      isTokenRequired: true,
      look_up_key: actionId,
      data: {
        name: payload.name,
        slug: payload.slug,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const deleteAction = (actionId, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Action deleted successfully.", "success");
      fetchActions(true);
      fetchPermissionsMapping(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to delete action.", "error");
    };

    apiRequest(urls.KEYS.DELETE, urls.rbac.actions.delete, {
      isTokenRequired: true,
      look_up_key: actionId,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ===========================
  // Permissions Mapping CRUD
  // ===========================

  const fetchPermissionsMapping = (force = false) => {
    if (loadingPermissions.value) return;
    loadingPermissions.value = true;

    const successHandler = (res) => {
      permissionsMapping.value = res?.data || [];
      loadingPermissions.value = false;
      isFetched.value = true;
    };

    const failureHandler = (err) => {
      loadingPermissions.value = false;
      snackbar.show(err?.message || "Failed to fetch permissions mapping.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.rbac.permissionsMapping.list, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const createPermissionMapping = (payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Permission created successfully.", "success");
      fetchPermissionsMapping(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to create permission mapping.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.rbac.permissionsMapping.create, {
      isTokenRequired: true,
      data: {
        resource_id: payload.resource_id,
        action_id: payload.action_id,
        code: payload.code,
      },
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  const deletePermissionMapping = (permissionId, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Permission mapping deleted successfully.", "success");
      fetchPermissionsMapping(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to delete permission mapping.", "error");
    };

    apiRequest(urls.KEYS.DELETE, urls.rbac.permissionsMapping.delete, {
      isTokenRequired: true,
      look_up_key: permissionId,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  // ===========================
  // Fetch All
  // ===========================

  const fetchAll = (force = false) => {
    fetchResources(force);
    fetchActions(force);
    fetchPermissionsMapping(force);
  };

  const reset = () => {
    resources.value = [];
    actions.value = [];
    permissionsMapping.value = [];
    loadingResources.value = false;
    loadingActions.value = false;
    loadingPermissions.value = false;
    actionLoading.value = false;
    error.value = null;
    isFetched.value = false;
  };

  return {
    resources,
    actions,
    permissionsMapping,
    loadingResources,
    loadingActions,
    loadingPermissions,
    actionLoading,
    error,
    isFetched,
    filters,

    fetchResources,
    createResource,
    updateResource,
    deleteResource,

    fetchActions,
    createAction,
    updateAction,
    deleteAction,

    fetchPermissionsMapping,
    createPermissionMapping,
    deletePermissionMapping,

    fetchAll,
    reset,
  };
});
