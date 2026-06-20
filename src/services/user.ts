import {
  UserInfoResponse,
  userListRequest,
  UserListRespose,
  userLoginRequest,
  userLoginResponse,
  UserRegistyRequest,
  UserUpdateRequest,
} from "@/types/user/user";
import { del, get, post, put } from "./http";
import { ApiResponse } from "@/types/index";
export function UserLogin(data: userLoginRequest): Promise<userLoginResponse> {
  return post<userLoginResponse>("/api/v1/user/login", data);
}

export function UserInfo(): Promise<UserInfoResponse> {
  return get<UserInfoResponse>("/api/v1/user/info");
}

export function UserLogout(): Promise<ApiResponse> {
  const refreshToken = localStorage.getItem("refreshToken") || "";
  return post<ApiResponse>("/api/v1/user/logout", { refreshToken });
}

export function RefreshToken(
  refreshToken: string,
): Promise<userLoginResponse> {
  return post<userLoginResponse>("/api/v1/user/refresh", { refreshToken });
}

// 获取用户列表
export function UserList(params: userListRequest): Promise<UserListRespose> {
  return get<UserListRespose>("/api/v1/user", params);
}

export function UserRegistry(data: UserRegistyRequest): Promise<unknown> {
  return post<ApiResponse>("/api/v1/user/register", data);
}

export function UserDelete(id: string): Promise<unknown> {
  return del<ApiResponse>(`/api/v1/user/${id}`);
}

export function userQuery(
  id: string,
  query?: string,
): Promise<UserInfoResponse> {
  return get<UserInfoResponse>(`/api/v1/user/${id}`, {
    query: query,
  });
}

export function UserUpdateByAdmin(
  data: UserUpdateRequest,
): Promise<ApiResponse> {
  return put<ApiResponse>(`/api/v1/user/${data.id}`, data);
}

export function UserUpdateBySelf(
  data: UserUpdateRequest,
): Promise<ApiResponse> {
  return put<ApiResponse>(`/api/v1/user/self`, data);
}

export function GetUserOptions(): Promise<{ label: string; value: string }[]> {
  return get<{ label: string; value: string }[]>("/api/v1/user/options");
}