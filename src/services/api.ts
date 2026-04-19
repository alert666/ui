import {
  ApiListResponse,
  ApiCreateRequest,
  ApiListRequest,
  ApiUpdateRequest,
} from "@/types/api/api";
import { del, get, post, put } from "./http";
import { ApiResponse } from "@/types";

export function GetApiList(params: ApiListRequest): Promise<ApiListResponse> {
  return get<ApiListResponse>("/api/v1/api", params);
}

export function CreateApi(data: ApiCreateRequest): Promise<ApiResponse> {
  return post<ApiResponse>(`/api/v1/api`, data);
}

export function DeleteApi(id: string): Promise<ApiResponse> {
  return del<ApiResponse>(`/api/v1/api/${id}`);
}

export function UpdateApi(
  id: string,
  data: ApiUpdateRequest,
): Promise<ApiResponse> {
  return put<ApiResponse>(`/api/v1/api/${id}`, data);
}
