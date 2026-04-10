import { AlertHistoryItem } from "./history";
import type { ColumnsType } from "antd/es/table";
import Big from "big.js";
// interface AlertHistoryColumnsProps {
//   modal: HookAPI;
//   message: MessageInstance;
//   delRun: (id: string) => void;
//   setRoleId: (id: string) => void;
//   setEditOpen: (editRole: boolean) => void;
//   delLoad: boolean;
// }

// 引入 Ant Design 的 ColumnsType

export function GetAlertHistorycolumns(): ColumnsType<AlertHistoryItem> {
  return [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a, b) => new Big(a.id).minus(new Big(b.id)).toNumber(),
    },
    {
      title: "告警指纹",
      dataIndex: "fingerprint",
      sorter: (a, b) => a.fingerprint.localeCompare(b.fingerprint),
    },
    {
      title: "告警名称",
      dataIndex: "alertname",
      ellipsis: true,
      sorter: (a, b) => a.alertname.localeCompare(b.alertname),
    },
    {
      title: "开始时间",
      dataIndex: "startsAt",
      ellipsis: true,
      sorter: (a, b) => a.startsAt.localeCompare(b.startsAt),
    },
    {
      title: "结束时间",
      dataIndex: "endsAt",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      ellipsis: true,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
  ];
}
