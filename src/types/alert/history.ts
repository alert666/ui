import dayjs from "dayjs"; // 确保引入了 dayjs

export interface AlertHistoryFormValues {
  // 搜索维度：对应左侧 Select
  searchKey: string;
  // 搜索值：对应右侧 Input 或 Select
  searchValue?: string;
  // 开始时间：对应 DatePicker
  startsAt?: dayjs.Dayjs | null;
  // 结束时间：对应 DatePicker
  endsAt?: dayjs.Dayjs | null;
}

export const SEARCH_DIMENSIONS = [
  { label: "告警名称", value: "alertName", type: "input", isLabel: false },
  { label: "告警实例", value: "instance", type: "input", isLabel: false },
  { label: "告警指纹", value: "fingerprint", type: "input", isLabel: false },
  {
    label: "告警状态",
    value: "status",
    type: "select",
    isLabel: false,
    options: [
      { label: "告警中", value: "firing" },
      { label: "已恢复", value: "resolved" },
    ],
  },
  {
    label: "告警级别",
    value: "severity",
    type: "select",
    isLabel: false,
    options: [
      { label: "critical", value: "critical" },
      { label: "warning", value: "warning" },
      { label: "info", value: "info" },
    ],
  },
  {
    label: "聚合ID",
    value: "alertSendRecordId",
    type: "input",
    isLabel: false,
  },
  { label: "名称空间", value: "namespace", type: "input", isLabel: true },
  { label: "Job", value: "job", type: "input", isLabel: true },
  { label: "Pod", value: "pod", type: "input", isLabel: true },
];

export interface AlertHistoryListRequest {
  page: number;
  pageSize: number;
  status?: string | undefined;
  alertName?: string;
  alertSendRecordId?: number;
  severity?: string;
  startsAt?: string;
  endsAt?: string;
  fingerprint?: string;
  instance?: string;
  labels?: string[];
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
export interface AlertHistoryUpdateRequest {
  status: string;
}

export interface FiringCountByTenantResponse {
  cluster: string;
  count: number;
}
