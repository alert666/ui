export interface userLoginRequest {
  email: string;
  password: string;
}

export interface userLoginResponse {
  token: string;
  refreshToken: string;
}

export interface userListRequest {
  page: string;
  pageSize: string;
  status?: number;
  name?: string;
  email?: string;
  mobile?: string;
  department?: string;
}

export interface UserListRespose {
  total: number;
  page: number;
  pageSize: number;
  list: UserListResponseItem[];
}

export interface UserListResponseItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  department: string;
  nickName: string;
  avatar: string;
  email: string;
  mobile: string;
  status: number;
}

export interface UserRegistyRequest {
  name: string;
  password: string;
  avatar: string;
  email: string;
  nickName: string;
  mobile: string;
  rolesID: number[];
}

export interface UserInfoResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  nickName: string;
  department: string;
  avatar: string;
  email: string;
  mobile: string;
  status: number;
  roles: Role[];
}

export interface Role {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
}

export interface UserUpdateRequest {
  id: string;
  name?: string;
  avatar?: string;
  mobile?: string;
  nickName?: string;
  email?: string;
  status?: number;
  oldPassword?: string;
  password?: string;
  roleIds?: number[];
}

export interface UserUpPwdRequest {
  oldPassword: string;
  newPassword: string;
}

export interface OAuthLoginResponse {
  user: UserInfoResponse;
  token: string;
  refreshToken: string;
}

export enum UserStatus {
  Active = 1,
  Disabled = 2,
  Inactive = 3,
}
