export interface AlertHistoryListRequest {
  page: number;
  pageSize: number;
  name?: string;
}

export interface AlertHistoryListResponse {
  page: number;
  pageSize: number;
  total: number;
  list: AlertHistoryItem[];
}

export interface AlertHistoryItem {
  id: string;
  createdAt: string;
  fingerprint: string;
  startsAt: string;
  cluster: string;
  status: "firing" | "resolved";
  endsAt: string | null;
  alertChannelId: number;
  alertSendRecordID: number;
  alertSilenceID: number;
  alertname: string;
  severity: string;
  instance: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  sendCount: number;
  isSilenced: boolean;
  alertChannel: unknown | null;
  alertSendRecord: unknown | null;
  alertSilence: unknown | null;
}
