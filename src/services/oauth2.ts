import { OAuthLoginResponse } from "@/types/user/user";
import { get, post } from "./http";

export function GetOAuth2Provider(): Promise<string[]> {
  return get("/api/v1/oauth2/provider");
}

export function OAuthLogin(
  code: string,
  state: string,
): Promise<OAuthLoginResponse> {
  return get(`/api/v1/oauth2/callback?code=${code}&state=${state}`);
}

export function OAuth2Activate(
  id: string,
  password: string,
  confirmPassword: string,
  state: string,
): Promise<OAuthLoginResponse> {
  return post(`/api/v1/oauth2/${id}?state=${state}`, {
    password,
    confirmPassword,
  });
}
