import { ListReq } from "..";

export interface AlertTemplateListReq extends ListReq {
  name?: string;
}

export interface AlertTemplateUpdateReq {
  template?: string;
  aggregationTemplate?: string;
  description?: string;
  receiveIdType?: string;
  receiveId?: string[];
  alertChannelID?: number;
}

export interface AlertTemplateListRes {
  total: number;
  page: number;
  pageSize: number;
  list: AlertTemplateRecord[];
}

export interface AlertTemplateRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  template: string;
  aggregationTemplate: string;
  receiveIdType: string;
  receiveId: string[];
  alertChannelID: number;
  alertChannel?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface CreateAlertTemplateReq {
  name: string;
  description: string;
  template: string;
  aggregationTemplate: string;
  alertChannelID: number;
  receiveIdType: string;
  receiveId: string[];
}

export const TEMPLATE_SEARCH_DIMENSIONS = [
  {
    label: "模板名称",
    value: "name",
    type: "input",
    options: [] as { label: string; value: string }[],
  },
];
