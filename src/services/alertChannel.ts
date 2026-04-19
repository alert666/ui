import {
  AlertAlertChannelListResponse,
  CreateAlertChanneRequest,
  GetAlertChannelListRequest,
  UpdateAlertChanneRequest,
} from "@/types/alert/channel";
import { del, get, post, put } from "./http";
import { ApiResponse } from "@/types";

export function GetAlertChannelList(
  params: GetAlertChannelListRequest,
): Promise<AlertAlertChannelListResponse> {
  return get<AlertAlertChannelListResponse>("/api/v1/alertChannel", params);
}

export function UpdateAlertChannel(
  data: UpdateAlertChanneRequest,
): Promise<AlertAlertChannelListResponse> {
  const { id, ...body } = data;
  return put<AlertAlertChannelListResponse>(`/api/v1/alertChannel/${id}`, body);
}

export function CreateAlertChannel(
  data: CreateAlertChanneRequest,
): Promise<ApiResponse> {
  return post<ApiResponse>(`/api/v1/alertChannel`, data);
}

export function DeleteAlertChannel(id: string): Promise<ApiResponse> {
  return del<ApiResponse>(`/api/v1/alertChannel/${id}`);
}
