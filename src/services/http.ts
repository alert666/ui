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
    // arrayFormat: 'repeat' 作用：
    // 将 { labels: ['a', 'b'] } 序列化为 labels=a&labels=b
    return qs.stringify(params, { arrayFormat: "repeat" });
  },
});

// 请求拦截器：添加 token 等
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

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
  (error: AxiosError) => {
    const apiRes = error.response?.data as ApiResponse;
    const status = error.response?.status;
    const requestId = error.response?.headers["x-request-id"] || "";
    // 定义错误消息映射
    const errorMessages = {
      401: "unauthorized, please login",
      403: "access forbidden",
    } as const;

    // 构建错误状态
    const errState: ErrorItem = {
      error: "",
      requestId: requestId,
    };

    // 处理特定状态码的错误
    if (status && status in errorMessages) {
      errState.error = errorMessages[status as keyof typeof errorMessages];
      useErrorStore.getState().addError(errState);

      // 401 状态特殊处理：清除 token
      if (status === 401) {
        localStorage.removeItem("token");
      }

      return Promise.reject(new Error(errState.error));
    }

    // 处理一般错误（排除登录接口）
    if (error.config?.url !== "/api/v1/user/login") {
      errState.error = apiRes?.error || error.message || "network error";
      useErrorStore.getState().addError(errState);
    }

    return Promise.reject(error);
  },
);

// 封装 GET 请求
export const get = <T>(url: string, params?: unknown): Promise<T> => {
  return apiClient.get(url, { params });
};

// 封装 POST 请求
export const post = <T>(url: string, data: unknown): Promise<T> => {
  return apiClient.post(url, data);
};

// 封装 PUT 请求
export const put = <T>(url: string, data: unknown): Promise<T> => {
  return apiClient.put(url, data);
};

// 封装 DELETE 请求
export const del = <T>(url: string): Promise<T> => {
  return apiClient.delete(url);
};

//
export const patch = <T>(url: string, data: unknown): Promise<T> => {
  return apiClient.patch(url, data);
};
