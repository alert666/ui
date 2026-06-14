import {
  AlertManagerCommandReq,
  AlertManagerCommandType,
  AlertManagerConfigResponse,
} from "@/types/alert/alertmanager";
import { post } from "./http";

// 获取 alertmanager 配置
export function GetAlertManagerConfig(): Promise<AlertManagerConfigResponse> {
  const req: AlertManagerCommandReq = {
    type: AlertManagerCommandType.GET_ALERTMANAGER_CONFIG,
    description: "获取alertmanager配置",
  };
  return post<AlertManagerConfigResponse>(`/api/v1/agents/commands/wait`, req);
}

// 更新 alertmanager 配置
export function UpdateAlertManagerConfig(config: string): Promise<unknown> {
  const req: AlertManagerCommandReq = {
    type: AlertManagerCommandType.UPDATE_ALERTMANAGER_CONFIG,
    description: "更新alertmanager配置",
    params: {
      "alertmanager.yaml": config,
    },
  };
  return post<unknown>(`/api/v1/agents/commands/wait`, req);
}
