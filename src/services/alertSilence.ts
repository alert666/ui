import { CreateAlertSilenceRequest } from "@/types/alert/silence";
import { post } from "./http";
import { ApiResponse } from "@/types";

export function CreateAlertSilence(
  data: CreateAlertSilenceRequest,
): Promise<ApiResponse> {
  return post<ApiResponse>("/api/v1/alertSilence", data);
}
