import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useBlogStore = defineStore("blog", () => {
  const snackbar = useSnackbarStore();

  /* --------------------------------------------
   * State
   * ------------------------------------------ */
  const blogs = ref([]);
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);
  const isFetched = ref(false);

  /* --------------------------------------------
   * Fetch Blogs (GET /blogs)
   * ------------------------------------------ */
  const fetchBlogs = (force = false) => {
    if (isFetched.value && !force) return;

    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      loading.value = false;
      isFetched.value = true;

      if (res?.data && Array.isArray(res.data)) {
        blogs.value = res.data;
      } else if (Array.isArray(res)) {
        blogs.value = res;
      } else if (res?.blogs && Array.isArray(res.blogs)) {
        blogs.value = res.blogs;
      } else {
        blogs.value = [];
      }
    };

    const failureHandler = (err) => {
      loading.value = false;
      error.value = err;
      isFetched.value = true;
      snackbar.show(err?.message || "Failed to fetch blogs.", "error");
    };

    apiRequest(urls.KEYS.GET, urls.blogs.list, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  /* --------------------------------------------
   * Create Blog (POST /create-blog)
   * Form Payload:
   * - title: string (Required)
   * - category: string (Required)
   * - description: string (Required)
   * - content: string (Required)
   * - status: string (Optional, default: "Published")
   * - image: File (Optional)
   * - meta_title: string (Optional)
   * - meta_description: string (Optional)
   * - meta_keywords: string (Optional)
   * ------------------------------------------ */
  const createBlog = (payload, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Article published successfully.", "success");
      fetchBlogs(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to create article.", "error");
    };

    apiRequest(urls.KEYS.POST, urls.blogs.create, {
      isTokenRequired: true,
      data: payload,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  /* --------------------------------------------
   * Update Blog (PUT /blogs/:id)
   * ------------------------------------------ */
  const updateBlog = (id, payload, onSuccess) => {  
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      snackbar.show(res?.message || "Article updated successfully.", "success");
      fetchBlogs(true);
      if (onSuccess) onSuccess(res);
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to update article.", "error");
    };

    apiRequest(urls.KEYS.PUT, urls.blogs.update, {
      isTokenRequired: true,
      look_up_key: id,
      data: payload,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  /* --------------------------------------------
   * Delete Blog (DELETE /blogs/:id)
   * ------------------------------------------ */
  const deleteBlog = (id, onSuccess) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      actionLoading.value = false;
      blogs.value = blogs.value.filter((b) => String(b.id) !== String(id));
      snackbar.show(res?.message || "Article deleted successfully.", "success");
      fetchBlogs(true);
      if (onSuccess) onSuccess();
    };

    const failureHandler = (err) => {
      actionLoading.value = false;
      snackbar.show(err?.message || "Failed to delete article.", "error");
    };

    apiRequest(urls.KEYS.DELETE, urls.blogs.delete, {
      isTokenRequired: true,
      look_up_key: id,
      onSuccess: successHandler,
      onFailure: failureHandler,
    });
  };

  return {
    blogs,
    loading,
    actionLoading,
    error,
    isFetched,
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
  };
});
