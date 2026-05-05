import { Api } from "./api/api";

// list 公共参数
export interface ListReq {
  page: number;
  pageSize: number;
}

// 定义搜索维度
export interface SearchDimension {
  label: string;
  value: string;
  type: "input" | "select";
}

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg?: string;
  error: string;
  requestId?: string;
}

export interface Options {
  label: string;
  value: string;
}

export interface PolicyOptions extends Options {
  rawData: Api;
}
