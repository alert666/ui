import { get } from "./http";

export function GetTenantOptions(): Promise<
  { label: string; value: string }[]
> {
  return get<{ label: string; value: string }[]>("/api/v1/tenant/options");
}
