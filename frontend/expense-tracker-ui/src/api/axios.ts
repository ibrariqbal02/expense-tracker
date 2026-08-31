import axios from "axios";
import { refreshToken as refreshTokenService } from "../services/auth.services";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,

  headers: {
    "Content-Type": "application/json",
  },
});



api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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
        // refreshToken service call karo — woh localStorage mein naya token save karega
        await refreshTokenService();
        notifyPending(true);
        return api(originalRequest);
      } catch {
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
