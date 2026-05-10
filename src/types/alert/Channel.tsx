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
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"; // 引入图标
import dayjs from "dayjs";
import { AlertChannelItem } from "./channel";
import { ChannelType } from "../enum";
import { AlertTemplateRecord } from "./template";
import { Result } from "ahooks/lib/useRequest/src/types";

interface GetAlertChannelColumnsProps {
  token: GlobalToken;
  handleEdit: (record: AlertChannelItem) => void;
  deleteHander: (data: AlertChannelItem) => void;
  getAlertTemplateResult: Result<AlertTemplateRecord, [id: string]>;
  setBindAlertTemplateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertChannelRecord: React.Dispatch<React.SetStateAction<AlertChannelItem>>;
}

export function GetAlertChannelColumns(
  props: GetAlertChannelColumnsProps,
): ColumnsType<AlertChannelItem> {
  const {
    token,
    handleEdit,
    deleteHander,
    getAlertTemplateResult,
    setBindAlertTemplateOpen,
    setAlertChannelRecord,
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
      title: "模板 ID",
      dataIndex: "alertTemplateID",
      width: 130,
      render: (id: string) => {
        if (!id || id === "0") return <Tag color="default">未绑定</Tag>;

        const isLoading =
          getAlertTemplateResult.params?.[0] === id &&
          getAlertTemplateResult.loading;

        return (
          <Space size={4}>
            <Typography.Text code>{id}</Typography.Text>
            <Tooltip title="预览模板详情">
              <Button
                type="text"
                size="small"
                loading={isLoading}
                icon={<EyeOutlined style={{ color: token.colorInfo }} />}
                onClick={() => getAlertTemplateResult.run(id)}
              />
            </Tooltip>
          </Space>
        );
      },
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
            icon={<LinkOutlined />}
            onClick={() => {
              setAlertChannelRecord(record);
              setBindAlertTemplateOpen(true);
            }}
          >
            绑定
          </Button>
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
    default:
      return "未知类型";
  }
};
