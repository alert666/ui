import { ListReq, SearchDimension } from ".";

export const TEHANT_SEARCH_DIMENSIONS: SearchDimension[] = [
  { label: "租户名称", value: "name", type: "input" },
];

export interface TenantFormValues {
  // 搜索维度：对应左侧 Select
  searchKey: string;
  // 搜索值：对应右侧 Input 或 Select
  searchValue?: string;
}

export interface TenantListRes {
  total: number;
  page: number;
  pageSize: number;
  list: TenantRecord[];
}

export interface TenantRecord {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantListRequest extends ListReq {
  name?: string;
}

export interface TenantCreateReq {
  name: string;
  description: string;
}

export interface TenantUpdateReq {
  description: string;
}
