import {
  AlertSilenceListReq,
  AlertSilenceListRes,
  CreateAlertSlienceReq,
} from "@/types/alert/silence";
import { get, post } from "./http";
import { ApiResponse } from "@/types";

export function GetAlertSilenceList(
  params: AlertSilenceListReq,
): Promise<AlertSilenceListRes> {
  return get<AlertSilenceListRes>("/api/v1/alertSilence", params);
}

export function CreateAlertSilence(
  data: CreateAlertSlienceReq,
): Promise<ApiResponse> {
  return post<ApiResponse>("/api/v1/alertSilence", data);
}
