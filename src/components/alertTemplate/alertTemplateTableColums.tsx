import { ApiResponse } from "@/types";
import { AlertTemplateRecord } from "@/types/alert/template";
import { Result } from "ahooks/lib/useRequest/src/types";
import {
  Button,
  GlobalToken,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";

const ellipsisStyle: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export interface GetAlertTemplateColumnsProps {
  token: GlobalToken;
  setAlertTemplateRecord: React.Dispatch<
    React.SetStateAction<AlertTemplateRecord>
  >;
  alertTemplateDelteResult: Result<ApiResponse<unknown>, [id: string]>;
  onCopyClick: (record: AlertTemplateRecord) => void;
  setAlertTemplateDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GetAlertTemplateColumns = (
  props: GetAlertTemplateColumnsProps,
) => {
  const {
    token,
    setAlertTemplateRecord,
    alertTemplateDelteResult,
    onCopyClick,
    setAlertTemplateDrawerOpen,
  } = props;

  return [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      maxWidth: 70,
    },
    {
      title: "模板名称",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name: string) => (
        <Typography.Text copyable strong style={{ color: token.colorPrimary }}>
          {name}
        </Typography.Text>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      responsive: ["lg"],
      render: (text: string) => (
        <Tooltip title={text}>
          <div style={ellipsisStyle}>{text || "-"}</div>
        </Tooltip>
      ),
    },
    {
      title: "渠道",
      dataIndex: "alertChannel",
      key: "alertChannelID",
      ellipsis: true,
      responsive: ["md"] as Array<"md">,
      render: (_: unknown, record: AlertTemplateRecord) => {
        const name =
          record.alertChannel?.name || String(record.alertChannelID) || "-";
        return (
          <Tooltip title={name}>
            <div style={ellipsisStyle}>{name}</div>
          </Tooltip>
        );
      },
    },
    {
      title: "接收者",
      key: "receiver",
      width: "40%",
      render: (_: unknown, record: AlertTemplateRecord) => {
        const typeConfig: Record<string, { color: string; label: string }> = {
          open_id: { color: "cyan", label: "Open ID" },
          user_id: { color: "purple", label: "User ID" },
          email: { color: "green", label: "Email" },
          chat_id: { color: "orange", label: "Chat ID" },
        };

        if (!record.receiveId) return "-";
        let ids = [];
        try {
          const parsed = JSON.parse(record.receiveId);
          ids = Array.isArray(parsed) ? parsed : [];
        } catch {
          ids = [];
        }
        if (ids.length === 0) return "-";

        const cfg = typeConfig[record.receiveIdType];
        const color = cfg?.color || "default";
        const label = cfg?.label || record.receiveIdType || "-";

        const text = ids.join(", ");
        return (
          <Tooltip title={`${label}: ${text}`}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              <Tag
                color={color}
                style={{
                  margin: 0,
                  flexShrink: 0,
                  fontWeight: 500,
                  lineHeight: "18px",
                  fontSize: 12,
                }}
              >
                {label}
              </Tag>
              <Typography.Text
                ellipsis
                style={{ fontSize: 13, flex: 1, minWidth: 0 }}
              >
                {text}
              </Typography.Text>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      responsive: ["md"] as Array<"md">,
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right" as const,
      width: 200,
      render: (_: unknown, record: AlertTemplateRecord) => (
        <Space size="small">
          <Button size="small" onClick={() => onCopyClick(record)}>
            拷贝
          </Button>
          <Button
            size="small"
            onClick={() => {
              setAlertTemplateRecord(record);
              setAlertTemplateDrawerOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除名称为: ${record.name} 的告警模板吗？此操作不可恢复。`}
            onConfirm={() => {
              alertTemplateDelteResult.run(record.id);
            }}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
};
