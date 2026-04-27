import { Badge, Button, Space, Tag, Tooltip, Typography } from "antd";
import type { Api } from "./api";
import { HookAPI } from "antd/es/modal/useModal";
import { MessageInstance } from "antd/es/message/interface";
const { Text } = Typography;

export type DataType = {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
};

export const ApiColumns = () => {
  return [
    // {
    //   dataIndex: "id",
    //   title: "ID",
    // },
    {
      dataIndex: "name",
      title: "名称",
    },
    {
      dataIndex: "method",
      title: "方法",
    },
    {
      dataIndex: "path",
      title: "路径",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      dataIndex: "effect",
      title: "效果",
      ellipsis: true,
      render: (effect: string) => (
        <Tooltip placement="topLeft" title={effect}>
          <span>{effect}</span>
        </Tooltip>
      ),
    },
    {
      dataIndex: "description",
      title: "描述",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
  ];
};

const getMethodColor = (method: string) => {
  const map: Record<string, string> = {
    GET: "green",
    POST: "blue",
    PUT: "orange",
    DELETE: "red",
    PATCH: "cyan",
  };
  return map[method?.toUpperCase()] || "default";
};

// 辅助函数：根据效果返回颜色
const getEffectColor = (effect: string) => {
  return effect?.toLowerCase() === "allow" ? "success" : "error";
};

export interface ApiListColumnsProps {
  modal: HookAPI;
  message: MessageInstance;
  deleteApiRun: (id: string) => void;
  deleteApiLoad: boolean;
  setUpdateApiOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateApiData: React.Dispatch<React.SetStateAction<Api>>;
}

export function ApiListColumns({
  modal,
  message,
  deleteApiRun,
  deleteApiLoad,
  setUpdateApiOpen,
  setUpdateApiData,
}: ApiListColumnsProps) {
  return [
    {
      title: "ID",
      dataIndex: "id",
      width: 100,
      ellipsis: true,
      render: (id: string) => {
        // 1. 强制转换为字符串，并处理 null/undefined 的情况
        const strId = String(id || "");

        return (
          <Text
            copyable={{ text: strId }}
            type="secondary"
            style={{ fontSize: "12px" }}
          >
            {/* 2. 只有长度超过 6 位时才截取，否则直接显示 */}
            {strId.length > 6 ? `${strId.slice(-6)}...` : strId}
          </Text>
        );
      },
    },
    {
      title: "名称",
      dataIndex: "name",
      minWidth: 150,
      ellipsis: true,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "路径",
      dataIndex: "path",
      minWidth: 200,
      ellipsis: true,
      render: (path: string) => (
        <Tooltip title={path}>
          <code
            style={{
              background: "#f5f5f5",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "13px",
              color: "#096dd9",
            }}
          >
            {path}
          </code>
        </Tooltip>
      ),
    },
    {
      title: "方法",
      dataIndex: "method",
      width: 90,
      align: "center" as const,
      render: (method: string) => (
        <Tag
          color={getMethodColor(method)}
          style={{ fontWeight: 600, marginInlineEnd: 0 }}
        >
          {method.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "策略影响",
      dataIndex: "effect",
      width: 100,
      align: "center" as const,
      render: (effect: string) => (
        <Badge status={getEffectColor(effect)} text={effect.toUpperCase()} />
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      minWidth: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <span style={{ color: "#666" }}>{text || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "操作",
      dataIndex: "action",
      width: 140,
      fixed: "right" as const, // 固定操作列，防止列多时挤压
      align: "center" as const,
      render: (_: unknown, record: Api) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => {
              setUpdateApiData(record);
              setUpdateApiOpen(true);
            }}
          >
            修改
          </Button>
          <Button
            type="link"
            size="small"
            danger
            loading={deleteApiLoad}
            onClick={() => {
              modal.confirm({
                title: "确认删除",
                content: (
                  <span>
                    确定要删除 API <Text code>{record.name}</Text>{" "}
                    吗？该操作不可恢复。
                  </span>
                ),
                okText: "确定",
                cancelText: "取消",
                okButtonProps: { danger: true },
                onOk: () => {
                  // 建议：这种业务逻辑判断最好放在 service 层或 page 层，而不是 columns 定义里
                  if (record.id === "1") {
                    message.error("系统内置资源，禁止删除");
                    return;
                  }
                  deleteApiRun(record.id.toString());
                },
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
}
