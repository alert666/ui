import {
  AlertTemplateListReq,
  AlertTemplateListRes,
} from "@/types/alert/template";
import { get } from "./http";

export function GetAlertTemplateList(
  params: AlertTemplateListReq,
): Promise<AlertTemplateListRes> {
  return get<AlertTemplateListRes>("/api/v1/alertTemplate", params);
}
