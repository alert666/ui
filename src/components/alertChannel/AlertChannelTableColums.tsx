import type { ColumnsType } from "antd/es/table";
import {
  Badge,
  Tag,
  Typography,
  Tooltip,
  Space,
  Button,
  Popconfirm,
} from "antd";
import { GlobalToken } from "antd/es/theme/interface";
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { AlertChannelItem } from "@/types/alert/channel";
import { ChannelType } from "@/types/enum";

interface GetAlertChannelColumnsProps {
  token: GlobalToken;
  handleEdit: (record: AlertChannelItem) => void;
  deleteHander: (data: AlertChannelItem) => void;
}

export function GetAlertChannelColumns(
  props: GetAlertChannelColumnsProps,
): ColumnsType<AlertChannelItem> {
  const {
    token,
    handleEdit,
    deleteHander,
  } = props;

  return [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "通道名称",
      dataIndex: "name",
      fixed: "left",
      width: 150,
      render: (name: string) => (
        <Typography.Text copyable strong style={{ color: token.colorPrimary }}>
          {name}
        </Typography.Text>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      width: 120,
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          [ChannelType.FEI_SHU_APP]: "blue",
          [ChannelType.FEI_SHU_BOOT]: "cyan",
          [ChannelType.WEB_HOOK]: "purple",
          [ChannelType.EMAIL]: "green",
        };
        return (
          <Tag color={colorMap[type] || "default"}>{getChannelType(type)}</Tag>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status: number) => (
        <Badge
          status={status === 1 ? "success" : "error"}
          text={status === 1 ? "启用" : "禁用"}
        />
      ),
    },

    {
      title: "聚合开启",
      dataIndex: "aggregationStatus",
      width: 110,
      render: (status: number) => (
        <Badge
          status={status === 1 ? "processing" : "default"}
          text={status === 1 ? "是" : "否"}
        />
      ),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt", // 建议展示更新时间，比创建时间对运维更有意义
      width: 180,
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
      render: (time: string) => (
        <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
          {dayjs(time).format("YYYY-MM-DD HH:mm:ss")}
        </Typography.Text>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (desc: string) => (
        <Tooltip title={desc} placement="topLeft">
          <span style={{ color: token.colorTextDescription }}>
            {desc || "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 220,
      render: (_, record: AlertChannelItem) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            修改
          </Button>
          <Popconfirm
            title="确认删除该渠道？"
            description="此操作将永久移除该报警通道配置。"
            onConfirm={() => deleteHander(record)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            icon={<InfoCircleOutlined style={{ color: "red" }} />}
            placement="topLeft"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
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
    case ChannelType.EMAIL:
      return "邮件";
    default:
      return "未知类型";
  }
};
