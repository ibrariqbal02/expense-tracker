import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tracks whether a token refresh is already in flight so concurrent
// 401s don't each trigger their own refresh request.
let isRefreshing = false;
let pendingRequests: Array<(retry: boolean) => void> = [];

const notifyPending = (retry: boolean) => {
  pendingRequests.forEach((resolve) => resolve(retry));
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt a refresh on 401s that haven't already been retried
    // and are not coming from the auth endpoints themselves.
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/logout") ||
      originalRequest?.url?.includes("/auth/refresh-token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes.
        return new Promise((resolve, reject) => {
          pendingRequests.push((retry: boolean) => {
            if (retry) {
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh-token");
        notifyPending(true);
        return api(originalRequest);
      } catch {
        // Refresh failed — the refresh token is expired or revoked.
        // Clear pending queue and redirect to login.
        notifyPending(false);
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
