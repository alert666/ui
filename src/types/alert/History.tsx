import {
  Button,
  GlobalToken,
  Popconfirm,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { AlertHistoryItem, AlertHistoryUpdateRequest } from "./history";
import type { ColumnsType } from "antd/es/table";
import { TagsOutlined, ClockCircleOutlined } from "@ant-design/icons";
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
      title: "告警名称",
      dataIndex: "alertname",
      fixed: "left",
      width: 150,
      sorter: (a, b) => a.alertname.localeCompare(b.alertname),
      ellipsis: {
        showTitle: false,
      },
      render: (alertname: string) => (
        <Tooltip placement="topLeft" title={alertname}>
          <Typography.Text strong>{alertname}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: "聚合ID",
      dataIndex: "alertSendRecordID",
      width: 100,
      responsive: ["md"], // 中等屏幕及以上显示
      sorter: (a, b) =>
        new Big(a.alertSendRecordID)
          .minus(new Big(b.alertSendRecordID))
          .toNumber(),
    },
    {
      title: "租户",
      dataIndex: "cluster",
      width: 100,
      responsive: ["sm"], // 平板及以上显示
      sorter: (a, b) => a.cluster.localeCompare(b.cluster),
    },
    {
      title: "开始时间",
      dataIndex: "startsAt",
      width: 180,
      sorter: (a, b) => a.startsAt.localeCompare(b.startsAt),
      render: (startsAt: string, record) => {
        if (record.endsAt) {
          return (
            <Tooltip
              title={
                <span>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  恢复时间: {record.endsAt}
                </span>
              }
            >
              <span
                style={{
                  textDecoration: "underline",
                  textDecorationStyle: "dashed",
                  textUnderlineOffset: "4px",
                  cursor: "help",
                  color: token.colorInfoText,
                }}
              >
                {startsAt}
              </span>
            </Tooltip>
          );
        }
        return startsAt;
      },
    },
    {
      title: "结束时间",
      dataIndex: "endsAt",
      width: 180,
      responsive: ["lg"], // 大屏幕才显示独立列，小屏通过开始时间悬浮查看
      render: (endsAt: string) => {
        return endsAt === null ? (
          <Tag color="error">告警未恢复</Tag>
        ) : (
          <Typography.Text type="secondary">{endsAt}</Typography.Text>
        );
      },
    },
    {
      title: "状态 - 级别",
      key: "status_severity",
      width: 150,
      render: (_, record) => {
        const isFiring = record.status === "firing";
        const severityMap: Record<string, { color: string; label: string }> = {
          critical: { color: "#ff4d4f", label: "严重" },
          warning: { color: "#faad14", label: "警告" },
          info: { color: "#1890ff", label: "提示" },
          default: { color: "#999", label: record.severity },
        };
        const sev =
          severityMap[record.severity.toLowerCase()] || severityMap.default;

        return (
          <div
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "4px 0 0 4px", // 左圆角
                backgroundColor: isFiring
                  ? `${token.colorError}10`
                  : `${token.colorSuccess}10`,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                border: `1px solid ${isFiring ? token.colorError : token.colorSuccess}30`,
                borderRight: "none",
              }}
            >
              <Typography.Text
                strong
                style={{
                  fontSize: "12px",
                  color: isFiring ? token.colorError : token.colorSuccess,
                }}
              >
                {isFiring ? "告警" : "恢复"}
              </Typography.Text>
            </span>

            <span
              style={{
                padding: "2px 8px",
                borderRadius: "0 4px 4px 0", // 右圆角
                backgroundColor: `${sev.color}`,
                color: "#fff",
                fontSize: "12px",
                fontWeight: "bold",
                border: `1px solid ${sev.color}`,
              }}
            >
              {sev.label}
            </span>
          </div>
        );
      },
    },
    {
      title: "标签",
      dataIndex: "labels",
      width: 80,
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
              maxWidth: "350px",
            }}
          >
            {entries.map(([key, value]) => (
              <Tag
                key={key}
                color="processing"
                style={{ margin: 0, height: "auto", whiteSpace: "normal" }}
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
            title="标签详情"
            placement="top"
            trigger="click" // 移动端点击比悬浮更好用
          >
            <Button
              type="text"
              size="small"
              icon={
                <TagsOutlined
                  style={{ fontSize: "16px", color: token.colorPrimary }}
                />
              }
            >
              {entries.length}
            </Button>
          </Popover>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 140,
      render: (_, record) => {
        if (record.status !== "firing") {
          return <Typography.Text>已恢复</Typography.Text>;
        }

        return (
          <Space size={8}>
            <Typography.Link onClick={() => handleSilence(record)}>
              静默
            </Typography.Link>

            <Popconfirm
              title="手动恢复告警"
              description="确定标记为已恢复？"
              onConfirm={() => updateRun(record.id, { status: "resolved" })}
              okText="确定"
              cancelText="取消"
              placement="left"
            >
              <Typography.Link type="danger">恢复</Typography.Link>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
}
