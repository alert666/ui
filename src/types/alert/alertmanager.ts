// alertmanager 命令类型
export enum AlertManagerCommandType {
  GET_ALERTMANAGER_CONFIG = 1,
  UPDATE_ALERTMANAGER_CONFIG = 5,
}

// 命令请求参数
export interface AlertManagerCommandReq {
  type: AlertManagerCommandType;
  description: string;
  params?: Record<string, unknown>;
}

// 获取配置的响应
export interface AlertManagerConfigResponse {
  commandType: number;
  ok: boolean;
  data: string;
}

// 更新配置的响应
export interface AlertManagerUpdateResponse {
  success: boolean;
  message?: string;
}
