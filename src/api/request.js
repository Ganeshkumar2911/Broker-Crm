import axios from "axios";
import authToken from "../common/authToken";
import router from "../router";

// ─── Constants

const DEFAULT_BASE_URL =
  typeof window !== "undefined" &&
  window.location.hostname === "admin.panthercapitals.com"
    ? "https://admin.panthercapitals.com/admin/"
    : "https://admin.panthercapitals.com/admin/";

const BASE_URL = DEFAULT_BASE_URL;

const DEFAULT_TIMEOUT = 2 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 2;
const RETRYABLE_STATUS_CODES = [502, 503, 504];
const NO_BODY_METHODS = ["get", "delete", "head", "options"];
const ALLOWED_METHODS = ["get", "post", "patch", "put", "delete"];

// ─── Request Deduplication (takeLatest)

const pendingRequests = new Map();

const generateRequestKey = (method, url) => {
  return `${method.toUpperCase()}:${url}`;
};

const cancelPreviousRequest = (requestKey) => {
  const existing = pendingRequests.get(requestKey);
  if (existing) {
    existing.abortController.abort();
  }
};

const cleanupRequest = (requestKey, controller) => {
  const current = pendingRequests.get(requestKey);

  if (current?.abortController === controller) {
    pendingRequests.delete(requestKey);
  }
};

const getBaseUrl = () => {
  if (typeof window === "undefined") return BASE_URL;
  let url = localStorage.getItem("custom_base_url");
  if (!url) return BASE_URL;

  url = url.trim();
  if (!url.endsWith("/")) {
    url += "/";
  }
  if (!url.endsWith("/admin/")) {
    if (url.endsWith("admin/")) {
      // already ends with admin/
    } else {
      url += "admin/";
    }
  }
  return url;
};

// ─── Axios Instance

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
});

// ─── Request Interceptor

axiosInstance.interceptors.request.use(
  (config) => {
    let base = getBaseUrl();
    if (config.skipAdminPrefix) {
      base = base.replace(/\/admin\/?$/, "/");
    }
    config.baseURL = base;

    if (config.isTokenRequired !== false) {
      const { accessToken } = authToken.getToken();
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ── 401: logout (bypass for 2FA setup/confirm/verify/login endpoints)
    if (error.response?.status === 401) {
      const url = String(originalRequest?.url || "");
      const is2faAuthUrl =
        url.includes("/2fa/") ||
        url.includes("/login/verify-2fa") ||
        url.includes("/login");
      const skipAuthRedirect = originalRequest?.skipAuthRedirect || is2faAuthUrl;

      if (!skipAuthRedirect) {
        authToken.removeToken();
        localStorage.removeItem("role");
        localStorage.removeItem("lastActivityTimestamp");
        localStorage.removeItem("custom_base_url");
        router.push({ name: "login" });
      }
      return Promise.reject(error);
    }

    // ── Retry on transient server errors
    const shouldRetry =
      RETRYABLE_STATUS_CODES.includes(error.response?.status) &&
      (originalRequest._retryCount ?? 0) < MAX_RETRY_ATTEMPTS;

    if (shouldRetry) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      const delay = 300 * originalRequest._retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return axiosInstance(originalRequest);
    }

    handleError(error);
    return Promise.reject(error);
  },
);

// ─── Global Error Handler
const handleError = (error) => {
  // Cancelled request — not an error
  if (error.code === "ERR_CANCELED") {
    console.warn("Request cancelled:", error.message);
    return;
  }

  // Network / no-response errors
  if (!error.response) {
    console.error("Network error:", error.message || "Unknown network error");
    return;
  }

  const { status, statusText, data } = error.response;

  switch (status) {
    case 404:
      console.error(`Not found (404): ${error.config?.url}`);
      break;

    case 500:
    case 502:
    case 503:
      console.error(`Server error (${status}): ${statusText}`);
      break;

    default: {
      const message = data?.message;

      if (!message) {
        console.error("Unexpected error occurred");
        return;
      }

      // Validation errors come as { field: string[] }
      if (typeof message === "object") {
        Object.entries(message).forEach(([field, messages]) => {
          const msgs = Array.isArray(messages) ? messages : [messages];
          msgs.forEach((msg) => console.error(`Validation [${field}]:`, msg));
        });
      } else {
        console.error("API error:", message);
      }
    }
  }
};

// ─── apiRequest
const apiRequest = (
  method,
  url,
  {
    headers = {},
    params = {},
    data = {},
    look_up_key = null,
    onSuccess = null,
    onFailure = null,
    onFinally = null,
    responseType = "json",
    onUploadProgress = null,
    onDownloadProgress = null,
    isTokenRequired = true,
    skipAdminPrefix = false,
    skipAuthRedirect = false,
    signal = null, // ← use AbortController.signal per-request
    timeout = null,
    cancelPrevious = false,
  } = {},
) => {
  if (!ALLOWED_METHODS.includes(method)) {
    throw new Error(
      `Method "${method}" is not allowed. Use one of: ${ALLOWED_METHODS.join(", ")}`,
    );
  }
  if (!url) {
    throw new Error("URL is required");
  }
  if (look_up_key !== null && look_up_key !== undefined) {
    url = `${url.replace(/\/$/, "")}/${look_up_key}`;
  }

  let abortController = null;
  let requestKey = null;

  if (cancelPrevious) {
    requestKey = generateRequestKey(method, url);
    abortController = new AbortController();
    cancelPreviousRequest(requestKey);
    pendingRequests.set(requestKey, { abortController });
  }
  const config = {
    method,
    url,
    headers,
    params,
    responseType,
    onUploadProgress,
    onDownloadProgress,
    isTokenRequired,
    skipAdminPrefix,
    skipAuthRedirect,
    ...(signal && { signal }),
    signal: abortController?.signal || signal,
    ...(timeout != null && { timeout }),
  };

  // Do not send a body for methods that don't support it (unless data payload is explicitly provided)
  if (
    !NO_BODY_METHODS.includes(method) ||
    (method === "delete" && data && Object.keys(data).length > 0)
  ) {
    config.data = data;
  }

  return axiosInstance(config)
    .then((response) => {
      if (onSuccess) onSuccess(response.data);
      return response.data;
    })
    .catch((error) => {
      if (error.code === "ERR_CANCELED") {
        console.warn("Request cancelled:", error.message);
        throw error;
      }

      if (onFailure) {
        onFailure(error.response?.data ?? error);
        return;
      }

      throw error;
    })
    .finally(() => {
      if (requestKey) {
        cleanupRequest(requestKey, abortController);
      }

      if (onFinally) onFinally();
    });
};

export { axiosInstance };
export default apiRequest;
