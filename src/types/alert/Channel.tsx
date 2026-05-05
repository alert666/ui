import type { ColumnsType } from "antd/es/table";
import { Badge, Tag, Typography, Tooltip, Space, Button } from "antd";
import { GlobalToken } from "antd/es/theme/interface";
import dayjs from "dayjs"; // 建议引入 dayjs 处理时间
import { AlertChannelItem } from "./channel";
import { ChannelType } from "../enum";

interface GetAlertChannelColumnsProps {
  token: GlobalToken;
  handleEdit: (record: AlertChannelItem) => void;
  deleteHander: (data: AlertChannelItem) => void;
}

export function GetAlertChannelColumns(
  props: GetAlertChannelColumnsProps,
): ColumnsType<AlertChannelItem> {
  const { token, handleEdit, deleteHander } = props;

  return [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (time: string) => (
        <span style={{ color: token.colorTextDescription, fontSize: "12px" }}>
          {dayjs(time).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      title: "通道名称",
      dataIndex: "name",
      fixed: "left",
      render: (name: string) => (
        <Typography.Text copyable strong>
          {name}
        </Typography.Text>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          [ChannelType.FEI_SHU_APP]: "blue",
          [ChannelType.FEI_SHU_BOOT]: "cyan",
          [ChannelType.WEB_HOOK]: "purple",
        };
        return (
          <Tag color={colorMap[type] || "default"}>{getChannelType(type)}</Tag>
        );
      },
    },
    {
      title: "聚合状态",
      dataIndex: "aggregationStatus",
      render: (status: number) => (
        <Badge
          status={status === 1 ? "processing" : "default"}
          text={status === 1 ? "已开启" : "已关闭"}
        />
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: number) => (
        <Badge
          status={status === 1 ? "success" : "error"}
          text={status === 1 ? "启用" : "禁用"}
        />
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      ellipsis: true,
      render: (desc: string) => (
        <Tooltip title={desc}>
          <span style={{ color: token.colorTextDescription }}>
            {desc || "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "操作",
      ellipsis: true,
      render: (_, record: AlertChannelItem) => {
        return (
          <Space size={8}>
            <Button
              onClick={() => {
                handleEdit(record);
              }}
              type="link"
            >
              修改
            </Button>
            <Button
              onClick={() => {
                deleteHander(record);
              }}
              type="link"
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];
}

const getChannelType = (tye: string): string => {
  switch (tye) {
    case ChannelType.FEI_SHU_APP:
      return "飞书应用";
    case ChannelType.FEI_SHU_BOOT:
      return "飞书机器人";
    case ChannelType.WEB_HOOK:
      return "Webhook";
    default:
      return "未知类型";
  }
};
