import { ListReq } from "..";

export interface AlertTemplateListReq extends ListReq {
  name?: string;
}

export interface AlertTemplateUpdateReq {
  template?: string;
  aggregationTemplate?: string;
  description?: string;
}

export interface EditTemplateState {
  templateDetailOpen: boolean;
  templateRecord: AlertTemplateRecord;
  aggregation: boolean;
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
}

export interface CreateAlertTemplateReq {
  name: string;
  description: string;
  template: string;
  aggregationTemplate: string;
  alertChannelID?: number;
}
