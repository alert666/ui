import { ListReq } from "..";

export interface AlertSilenceListReq extends ListReq {
  status?: 0 | 1 | 2;
  createdBy?: string;
  startsAt?: number;
  endsAt?: number;
  Matchers?: Matcher[];
}

export interface AlertSilenceListRes {
  page: number;
  pageSize: number;
  total: number;
  list: AlertSilence[];
}

export interface CreateAlertSilenceRequest {
  type: number;
  status: number;
  fingerprint: string;
  startsAt: number;
  endsAt: number;
  comment: string;
}

export interface CreateAlertSlienceReq {
  status: number;
  type: number;
  startsAt: number;
  endsAt: number;
  comment: string;
  matchers?: Matcher[];
  fingerprint?: string;
}

export interface AlertSilence {
  id: string;
  createdAt: string;
  updatedAt: string;
  cluster: string;
  type: number;
  status: number;
  fingerprint: string;
  startsAt: number;
  endsAt: number;
  matchers: Matcher[];
  comment: string;
  createdBy: string;
}

export interface Matcher {
  name: string;
  value: string;
  type: string;
}

export const SILEMCE_SEARCH_DIMENSIONS = [
  {
    label: "状态",
    value: "status",
    type: "select",
    options: [
      { label: "启用", value: "1" },
      { label: "禁用", value: "0" },
      { label: "过期", value: "2" },
    ],
  },
  {
    label: "创建人",
    value: "createdBy",
    type: "select",
    options: [] as { label: string; value: string }[],
  },
];
