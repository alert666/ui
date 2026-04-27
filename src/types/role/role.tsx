import { Button, Tag, Tooltip, Space, Typography } from "antd";
import type { RoleItem } from "./role";
import { MessageInstance } from "antd/es/message/interface";
import { HookAPI } from "antd/es/modal/useModal";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface RoleColumnsProps {
  modal: HookAPI;
  message: MessageInstance;
  delRun: (id: string) => void;
  setRoleId: (id: string) => void;
  setEditOpen: (editRole: boolean) => void;
  delLoad: boolean;
}

export function GetRolecolumns({
  modal,
  delRun,
  setEditOpen,
  setRoleId,
  delLoad,
  message,
}: RoleColumnsProps) {
  return [
    {
      title: "角色 ID",
      dataIndex: "id",
      width: 100,
      sorter: (a: RoleItem, b: RoleItem) => Number(a.id) - Number(b.id),
      render: (id: string) => (
        <Text
          copyable={{ text: String(id) }}
          type="secondary"
          style={{ fontSize: "12px" }}
        >
          {String(id)}
        </Text>
      ),
    },
    {
      title: "角色名称",
      dataIndex: "name",
      minWidth: 160,
      sorter: (a: RoleItem, b: RoleItem) => a.name.localeCompare(b.name),
      render: (name: string, record: RoleItem) => {
        const isAdmin = name === "admin" || String(record.id) === "1";
        return (
          <Space>
            {isAdmin ? (
              <SettingOutlined style={{ color: "#faad14" }} />
            ) : (
              <UserOutlined />
            )}
            <Text strong>{name}</Text>
            {isAdmin && <Tag color="gold">系统内置</Tag>}
          </Space>
        );
      },
    },
    {
      title: "角色描述",
      dataIndex: "description",
      minWidth: 250,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text || "暂无描述"} placement="topLeft">
          <Text type="secondary">{text || "-"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: unknown, record: RoleItem) => {
        const isAdmin = record.name === "admin" || String(record.id) === "1";

        return (
          <Space size="middle">
            <Button
              type="link"
              size="small"
              onClick={() => {
                setRoleId(record.id);
                setEditOpen(true);
              }}
            >
              修改
            </Button>
            <Button
              type="link"
              size="small"
              danger
              disabled={isAdmin} // UI 上禁用删除按钮
              loading={delLoad}
              onClick={() => {
                modal.confirm({
                  title: "确认删除角色",
                  content: (
                    <span>
                      确定要删除角色 <Text code>{record.name}</Text>{" "}
                      吗？删除后关联用户的权限可能会受影响。
                    </span>
                  ),
                  okText: "确认删除",
                  cancelText: "取消",
                  okButtonProps: { danger: true },
                  onOk: () => {
                    // 二次兜底校验
                    if (isAdmin) {
                      message.error("系统内置角色禁止删除");
                      return;
                    }
                    delRun(record.id);
                  },
                });
              }}
            >
              <Tooltip title={isAdmin ? "内置角色无法删除" : ""}>删除</Tooltip>
            </Button>
          </Space>
        );
      },
    },
  ];
}
