import {
  Button,
  GlobalToken,
  Popconfirm,
  Popover,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { AlertHistoryItem, AlertHistoryUpdateRequest } from "./history";
import type { ColumnsType } from "antd/es/table";
import { TagsOutlined } from "@ant-design/icons";
import Big from "big.js";
interface AlertHistoryColumnsProps {
  token: GlobalToken;
  updateRun: (id: string, data: AlertHistoryUpdateRequest) => void;
  handleSilence: (record: AlertHistoryItem) => void;
}

export function GetAlertHistorycolumns(
  props: AlertHistoryColumnsProps,
): ColumnsType<AlertHistoryItem> {
  const { token, updateRun, handleSilence } = props;
  return [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "聚合ID",
      dataIndex: "alertSendRecordID",
      width: 100,
      sorter: (a, b) =>
        new Big(a.alertSendRecordID)
          .minus(new Big(b.alertSendRecordID))
          .toNumber(),
    },
    {
      title: "告警指纹",
      width: "10%",
      dataIndex: "fingerprint",
      sorter: (a, b) => a.fingerprint.localeCompare(b.fingerprint),
    },
    {
      title: "告警名称",
      dataIndex: "alertname",
      sorter: (a, b) => a.alertname.localeCompare(b.alertname),
      width: 150,
      render: (alertname: string) => (
        <Tooltip placement="topLeft" title={alertname}>
          {alertname}
        </Tooltip>
      ),
    },
    {
      title: "告警级别",
      dataIndex: "severity",
      width: 100,
      sorter: (a, b) => a.severity.localeCompare(b.severity),
    },
    {
      title: "开始时间",
      dataIndex: "startsAt",
      width: 230,
      sorter: (a, b) => a.startsAt.localeCompare(b.startsAt),
    },
    {
      title: "结束时间",
      dataIndex: "endsAt",
      width: 230,
      render: (endsAt: string) => {
        if (endsAt === null) {
          return <>告警未恢复</>;
        } else {
          return endsAt;
        }
      },
    },
    {
      title: "标签",
      dataIndex: "labels",
      width: 100,
      align: "center",
      render: (labels: Record<string, string>) => {
        if (!labels || Object.keys(labels).length === 0) return "-";
        const entries = Object.entries(labels);
        const fullTagsContent = (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              padding: "4px",
              maxWidth: "400px",
              wordBreak: "break-all",
            }}
          >
            {entries.map(([key, value]) => (
              <Tag
                key={key}
                bordered={false}
                color="processing"
                style={{
                  whiteSpace: "normal",
                  height: "auto",
                  display: "inline-block",
                  padding: "4px 8px",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                <span style={{ fontWeight: 600 }}>{key}:</span> {value}
              </Tag>
            ))}
          </div>
        );

        return (
          <Popover
            color={token.colorBgElevated}
            content={fullTagsContent}
            title="全部标签详情"
            placement="top"
            trigger="hover"
          >
            <Button
              type="text"
              icon={
                <TagsOutlined
                  style={{ fontSize: "18px", color: token.colorPrimary }}
                />
              }
            >
              <span style={{ marginLeft: 4, color: token.colorTextSecondary }}>
                {entries.length}
              </span>
            </Button>
          </Popover>
        );
      },
    },
    {
      title: "静默",
      dataIndex: "isSilenced",
      render(value: boolean) {
        if (!value) {
          return "未静默";
        } else if (value) {
          return "已静默";
        }
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: string) => {
        let color = "";
        if (status === "firing") {
          color = "red";
        } else {
          color = "green";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 170,
      render: (_, record) => {
        if (record.status !== "firing") {
          return null;
        }

        return (
          <Space size={0}>
            <Button
              type="link"
              size="small"
              onClick={() => {
                handleSilence(record);
              }}
            >
              静默
            </Button>

            <Popconfirm
              title="手动恢复告警"
              description="确定要将此告警标记为已恢复吗？"
              onConfirm={() => {
                updateRun(record.id, {
                  status: "resolved",
                });
              }}
              okText="确定"
              cancelText="取消"
              placement="left"
            >
              <Button type="link" size="small">
                标记恢复
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
}
