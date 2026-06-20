// services/http.ts
import { ErrorItem } from "@/components/ErrList";
import { useErrorStore } from "@/stores/useErrorStore";
import { ApiResponse } from "@/types";
import axios, { AxiosError } from "axios";
import qs from "qs";

const apiClient = axios.create({
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: "repeat" });
  },
});

// ---------------------------------------------------------------
// Token refresh state: prevents concurrent refresh calls
// ---------------------------------------------------------------
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
}

async function tryRefresh(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    clearTokens();
    throw new Error("no refresh token");
  }
  // Use plain axios (not apiClient) to avoid interceptors loop
  const { data } = await axios({
    method: "post",
    url: "/api/v1/user/refresh",
    data: { refreshToken },
    withCredentials: true,
  });
  if (data.code !== 0) {
    throw new Error(data.error || "refresh failed");
  }
  const { token, refreshToken: newRefreshToken } = data.data;
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", newRefreshToken);
  return token;
}

// ---------------------------------------------------------------
// Request interceptor: attach access token
// ---------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    const tenantId =
      new URLSearchParams(window.location.search).get("tenant") ||
      localStorage.getItem("last_tenant_id");
    if (tenantId) {
      config.headers["X-Tenant-Id"] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------
// Response interceptor
// ---------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 0) {
      return res.data;
    }
    useErrorStore.getState().addError({
      error: res.message || "network error, please try again later",
      requestId: res.requestId || "",
    });
    return Promise.reject(
      new Error(res.message || "network error, please try again later"),
    );
  },
  async (error: AxiosError) => {
    const apiRes = error.response?.data as ApiResponse;
    const status = error.response?.status;
    const requestId = error.response?.headers["x-request-id"] || "";
    const originalConfig = error.config!;

    // --- 401: attempt token refresh ---
    if (status === 401 && !originalConfig.url?.includes("/user/refresh")) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await tryRefresh();
          // Retry the original request
          originalConfig.headers["Authorization"] = `Bearer ${newToken}`;
          // Resolve all queued requests
          pendingQueue.forEach((p) => p.resolve(newToken));
          pendingQueue = [];
          return apiClient(originalConfig);
        } catch (refreshError) {
          pendingQueue.forEach((p) => p.reject(refreshError));
          pendingQueue = [];
          clearTokens();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Refresh already in progress — queue this request
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalConfig.headers["Authorization"] = `Bearer ${token}`;
            resolve(apiClient(originalConfig));
          },
          reject,
        });
      });
    }

    // --- Other errors ---
    const errorMessages = {
      401: "unauthorized, please login",
      403: "access forbidden",
    } as const;

    const errState: ErrorItem = {
      error: "",
      requestId,
    };

    if (status && status in errorMessages) {
      errState.error = errorMessages[status as keyof typeof errorMessages];
      useErrorStore.getState().addError(errState);
      return Promise.reject(new Error(errState.error));
    }

    if (error.config?.url !== "/api/v1/user/login") {
      errState.error = apiRes?.error || error.message || "network error";
      useErrorStore.getState().addError(errState);
    }

    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------
// Wrapped HTTP methods
// ---------------------------------------------------------------
export const get = <T>(url: string, params?: unknown): Promise<T> => {
  return apiClient.get(url, { params });
};
export const post = <T>(url: string, data: unknown): Promise<T> => {
  return apiClient.post(url, data);
};
export const put = <T>(url: string, data: unknown): Promise<T> => {
  return apiClient.put(url, data);
};
export const del = <T>(url: string): Promise<T> => {
  return apiClient.delete(url);
};
export const patch = <T>(url: string, data: unknown): Promise<T> => {
  return apiClient.patch(url, data);
};