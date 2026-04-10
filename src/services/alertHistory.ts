import {
  AlertHistoryListRequest,
  AlertHistoryListResponse,
} from "@/types/alert/history";
import { get } from "./http";

export function GetAlertHistoryList(
  params: AlertHistoryListRequest,
): Promise<AlertHistoryListResponse> {
  return get<AlertHistoryListResponse>("/api/v1/alertHistory", params);
}
