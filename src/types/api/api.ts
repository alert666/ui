export interface ApiListResponse {
  total: number;
  page: number;
  pageSize: number;
  list: Api[];
}

export interface Api {
  id: string;
  name: string;
  path: string;
  method: string;
  description: string;
  effect: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiListRequest {
  page: number;
  pageSize: number;
  name?: string;
  path?: string;
  method?: string;
}

export interface ApiCreateRequest {
  name: string;
  description: string;
  path: string;
  method: string;
  effect: string;
}

export interface ApiUpdateRequest {
  description: string;
}
