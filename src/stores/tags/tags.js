import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useTagsStore = defineStore("tags", () => {
  const snackbar = useSnackbarStore();

  // State
  const tags = ref([]);
  const limits = ref({ lead: 10, user: 5 });
  const pagination = ref({
    page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 1,
  });

  const filters = reactive({
    search: "",
    status: "",
    color: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  const loading = ref(false);
  const actionLoading = ref(false);
  const limitsFetched = ref(false);
  const error = ref(null);

  // ─── Actions ────────────────────────────────────────────────────────

  // 1. Fetch Paginated Tags List
  const fetchTags = (page = pagination.value.page, perPage = pagination.value.per_page) => {
    loading.value = true;
    error.value = null;

    if (page) pagination.value.page = Number(page);
    if (perPage) pagination.value.per_page = Number(perPage);

    const params = {
      page: pagination.value.page,
      per_page: pagination.value.per_page,
    };

    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.color) params.color = filters.color;
    if (filters.sort_by) params.sort_by = filters.sort_by;
    if (filters.sort_order) params.sort_order = filters.sort_order;

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.tags.list, {
        isTokenRequired: true,
        params,
        onSuccess: (res) => {
          loading.value = false;
          tags.value = res?.data || [];
          if (res?.pagination) {
            pagination.value = {
              ...res.pagination,
              page: Number(res.pagination.page || page),
            };
          }
          resolve(res);
        },
        onFailure: (err) => {
          loading.value = false;
          error.value = err;
          if (err?.code !== "ERR_CANCELED") {
            snackbar.show(
              err?.message || err?.response?.data?.message || "Failed to fetch tags",
              "error"
            );
          }
          reject(err);
        },
      });
    });
  };

  const searchCache = reactive(new Map());

  const clearSearchCache = () => {
    searchCache.clear();
  };

  // 2. Search Tags (Autocomplete)
  const searchTags = (query = "", options = {}) => {
    const qTrimmed = query ? query.trim() : "";
    const status = options.status || "active";
    const sortBy = options.sortBy || options.sort_by || "usage_count";
    const sortOrder = options.sortOrder || options.sort_order || "desc";
    const page = options.page || 1;
    const perPage = options.perPage || options.limit || options.per_page || 20;

    const cacheKey = `${qTrimmed.toLowerCase()}_${status}_${sortBy}_${sortOrder}_${page}_${perPage}`;
    if (searchCache.has(cacheKey) && !options.force) {
      return Promise.resolve(searchCache.get(cacheKey));
    }

    const params = {
      page,
      per_page: perPage,
      status,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    if (qTrimmed) params.search = qTrimmed;
    if (options.color) params.color = options.color;

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.tags.list, {
        isTokenRequired: true,
        params,
        onSuccess: (res) => {
          const data = res?.data || [];
          searchCache.set(cacheKey, data);
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  };

  // 3. Fetch Tag Limits
  const fetchLimits = (force = false) => {
    if (limitsFetched.value && !force) {
      return Promise.resolve(limits.value);
    }
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, urls.tags.limits, {
        isTokenRequired: true,
        onSuccess: (res) => {
          limitsFetched.value = true;
          if (res?.data) {
            limits.value = {
              lead: res.data.lead ?? 10,
              user: res.data.user ?? 5,
            };
          }
          resolve(limits.value);
        },
        onFailure: () => {
          // Keep defaults if request fails
          resolve(limits.value);
        },
      });
    });
  };

  // 4. Create Tag
  const createTag = (payload) => {
    actionLoading.value = true;
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.tags.create, {
        isTokenRequired: true,
        data: payload,
        onSuccess: (res) => {
          actionLoading.value = false;
          clearSearchCache();
          snackbar.show(res?.message || "Tag created successfully", "success");
          fetchTags();
          resolve(res);
        },
        onFailure: (err) => {
          actionLoading.value = false;
          const msg = err?.response?.data?.message || err?.message || "Failed to create tag";
          snackbar.show(msg, "error");
          reject(err);
        },
      });
    });
  };

  // 5. Update Tag
  const updateTag = (id, payload) => {
    actionLoading.value = true;
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.PUT, urls.tags.update(id), {
        isTokenRequired: true,
        data: payload,
        onSuccess: (res) => {
          actionLoading.value = false;
          clearSearchCache();
          snackbar.show(res?.message || "Tag updated successfully", "success");
          fetchTags();
          resolve(res);
        },
        onFailure: (err) => {
          actionLoading.value = false;
          const msg = err?.response?.data?.message || err?.message || "Failed to update tag";
          snackbar.show(msg, "error");
          reject(err);
        },
      });
    });
  };

  // 6. Activate Tag
  const activateTag = (id) => {
    actionLoading.value = true;
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.tags.activate(id), {
        isTokenRequired: true,
        onSuccess: (res) => {
          actionLoading.value = false;
          clearSearchCache();
          snackbar.show(res?.message || "Tag activated", "success");
          fetchTags();
          resolve(res);
        },
        onFailure: (err) => {
          actionLoading.value = false;
          const msg = err?.response?.data?.message || err?.message || "Failed to activate tag";
          snackbar.show(msg, "error");
          reject(err);
        },
      });
    });
  };

  // 7. Deactivate Tag
  const deactivateTag = (id) => {
    actionLoading.value = true;
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, urls.tags.deactivate(id), {
        isTokenRequired: true,
        onSuccess: (res) => {
          actionLoading.value = false;
          clearSearchCache();
          snackbar.show(res?.message || "Tag deactivated", "success");
          fetchTags();
          resolve(res);
        },
        onFailure: (err) => {
          actionLoading.value = false;
          const msg = err?.response?.data?.message || err?.message || "Failed to deactivate tag";
          snackbar.show(msg, "error");
          reject(err);
        },
      });
    });
  };

  // 8. Delete Tag
  const deleteTag = (id, force = false) => {
    actionLoading.value = true;
    const url = force ? `${urls.tags.delete(id)}?force=true` : urls.tags.delete(id);

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.DELETE, url, {
        isTokenRequired: true,
        onSuccess: (res) => {
          actionLoading.value = false;
          clearSearchCache();
          snackbar.show(res?.message || "Tag deleted successfully", "success");
          fetchTags();
          resolve(res);
        },
        onFailure: (err) => {
          actionLoading.value = false;
          reject(err);
        },
      });
    });
  };

  // 9. Get Entity Tags
  const getEntityTags = (entityType, entityId) => {
    const url = urls.tags.assignments(entityType, entityId);
    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.GET, url, {
        isTokenRequired: true,
        onSuccess: (res) => resolve(res?.data || []),
        onFailure: (err) => reject(err),
      });
    });
  };

  // 10. Mutate Entity Tags (assign, remove, replace)
  const mutateEntityTags = (entityType, entityId, tagIds, mode = "assign") => {
    actionLoading.value = true;
    const url = urls.tags.assignments(entityType, entityId);
    const body = { tag_ids: tagIds, mode };

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, url, {
        isTokenRequired: true,
        data: body,
        onSuccess: (res) => {
          actionLoading.value = false;
          clearSearchCache();
          snackbar.show(res?.message || "Tags updated successfully", "success");
          resolve(res?.data || []);
        },
        onFailure: (err) => {
          actionLoading.value = false;
          const errData = err?.response?.data;
          const msg = errData?.message || err?.message || "Failed to update tags";
          snackbar.show(msg, "error");
          reject(err);
        },
      });
    });
  };

  // 11. Remove Single Tag from Entity
  const removeEntityTag = (entityType, entityId, tagId) => {
    actionLoading.value = true;
    const url = urls.tags.removeAssignment(entityType, entityId, tagId);

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.DELETE, url, {
        isTokenRequired: true,
        onSuccess: (res) => {
          actionLoading.value = false;
          clearSearchCache();
          snackbar.show(res?.message || "Tag removed", "success");
          resolve(res?.data || []);
        },
        onFailure: (err) => {
          actionLoading.value = false;
          const msg = err?.response?.data?.message || err?.message || "Failed to remove tag";
          snackbar.show(msg, "error");
          reject(err);
        },
      });
    });
  };

  // 12. Bulk Mutate Tags
  const bulkMutateTags = (entityType, entityIds, tagIds, mode = "assign") => {
    actionLoading.value = true;
    const url = urls.tags.bulkAssignments(entityType);
    const body = { entity_ids: entityIds, tag_ids: tagIds, mode };

    return new Promise((resolve, reject) => {
      apiRequest(urls.KEYS.POST, url, {
        isTokenRequired: true,
        data: body,
        onSuccess: (res) => {
          actionLoading.value = false;
          clearSearchCache();
          snackbar.show(res?.message || "Bulk tag operation completed", "success");
          resolve(res?.data || { success: [], failed: [] });
        },
        onFailure: (err) => {
          actionLoading.value = false;
          const msg = err?.response?.data?.message || err?.message || "Bulk tag operation failed";
          snackbar.show(msg, "error");
          reject(err);
        },
      });
    });
  };

  return {
    tags,
    limits,
    pagination,
    filters,
    loading,
    actionLoading,
    error,
    fetchTags,
    searchTags,
    fetchLimits,
    createTag,
    updateTag,
    activateTag,
    deactivateTag,
    deleteTag,
    getEntityTags,
    mutateEntityTags,
    removeEntityTag,
    bulkMutateTags,
  };
});
