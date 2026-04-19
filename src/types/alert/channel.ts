import { ChannelType } from "../enum";

export interface AlertChannelItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  type: string;
  status: number;
  aggregationStatus: number;
  config: string;
  description: string;
  alertTemplateID: number;
}

export interface GetAlertChannelListRequest {
  page: number;
  pageSize: number;
  type?: "feishuApp" | "feishuBoot" | "webhook" | undefined;
  name?: string | undefined;
}

export interface AlertAlertChannelListResponse {
  page: number;
  pageSize: number;
  total: number;
  list: AlertChannelItem[];
}

export const CHANNEL_SEARCH_DIMENSIONS = [
  { label: "名称", value: "name", type: "input" },
  {
    label: "类型",
    value: "type",
    type: "select",
    options: [
      { label: "飞书应用", value: ChannelType.FEI_SHU_APP },
      { label: "飞书机器人", value: ChannelType.FEI_SHU_BOOT },
      { label: "webhook", value: ChannelType.WEB_HOOK },
    ],
  },
];

export interface UpdateAlertChanneRequest {
  id: number;
  name: string;
  type: string;
  status: number;
  aggregationStatus: number;
  config: JSON;
  description: string;
  templateID: number;
}

export interface CreateAlertChanneRequest {
  name: string;
  type: string;
  status: number;
  aggregationStatus: number;
  config: JSON;
  description: string;
}
