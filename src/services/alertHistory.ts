import {
  AlertHistoryListRequest,
  AlertHistoryListResponse,
  AlertHistoryUpdateRequest,
} from "@/types/alert/history";
import { get, put } from "./http";
import { ApiResponse } from "@/types";

export function GetAlertHistoryList(
  params: AlertHistoryListRequest,
): Promise<AlertHistoryListResponse> {
  return get<AlertHistoryListResponse>("/api/v1/alertHistory", params);
}

export function UpdateAlertHistory(
  id: string,
  data: AlertHistoryUpdateRequest,
): Promise<ApiResponse> {
  return put(`/api/v1/alertHistory/${id}`, data);
}
