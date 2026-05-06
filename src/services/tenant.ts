import {
  TenantCreateReq,
  TenantListRequest,
  TenantListRes,
  TenantUpdateReq,
} from "@/types/tenant";
import { del, get, post, put } from "./http";
import { ApiResponse } from "@/types";

export function GetTenantOptions(): Promise<
  { label: string; value: string }[]
> {
  return get<{ label: string; value: string }[]>("/api/v1/tenant/options");
}

export function TenantList(params: TenantListRequest): Promise<TenantListRes> {
  return get<TenantListRes>("/api/v1/tenant", params);
}

export function TenantCreate(data: TenantCreateReq): Promise<ApiResponse> {
  return post<ApiResponse>("/api/v1/tenant", data);
}

export function TenantDelete(id: string): Promise<ApiResponse> {
  return del<ApiResponse>(`/api/v1/tenant/${id}`);
}

export function TenantUpdate(
  id: string,
  data: TenantUpdateReq,
): Promise<ApiResponse> {
  return put<ApiResponse>(`/api/v1/tenant/${id}`, data);
}
