import {
  AlertTemplateListReq,
  AlertTemplateListRes,
  AlertTemplateRecord,
  AlertTemplateUpdateReq,
} from "@/types/alert/template";
import { del, get, put } from "./http";
import { ApiResponse } from "@/types";

export function GetAlertTemplateList(
  params: AlertTemplateListReq,
): Promise<AlertTemplateListRes> {
  return get<AlertTemplateListRes>("/api/v1/alertTemplate", params);
}

export function UpdateAlertTemplate(
  id: string,
  data: AlertTemplateUpdateReq,
): Promise<ApiResponse> {
  return put<ApiResponse>(`/api/v1/alertTemplate/${id}`, data);
}

export function DeleteAlertTemplate(id: string): Promise<ApiResponse> {
  return del<ApiResponse>(`/api/v1/alertTemplate/${id}`);
}

export function GetAlertTemplate(id: string): Promise<AlertTemplateRecord> {
  return get<AlertTemplateRecord>(`/api/v1/alertTemplate/${id}`);
}
