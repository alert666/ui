import {
  Avatar,
  Button,
  Divider,
  Space,
  Switch,
  TableColumnsType,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React from "react";
import { UserListResponseItem, UserUpdateRequest } from "@/types/user/user";
import { HookAPI } from "antd/es/modal/useModal";
import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  MailOutlined,
  MobileOutlined,
  UserOutlined,
} from "@ant-design/icons";

interface GetUserColumnProps {
  updateUserLoad: boolean;
  updateUserRun: (data: UserUpdateRequest) => void;
  delUserLoad: boolean;
  delUserRun: (id: string) => void;
  editUserOpen: (id: string) => void;
  modal: HookAPI;
  setRestUserPWDState: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      id: string;
      password: string;
      name: string;
    }>
  >;
}

const { Text } = Typography;

export function GetUserColumn(
  props: GetUserColumnProps,
): TableColumnsType<UserListResponseItem> {
  const {
    updateUserLoad,
    updateUserRun,
    delUserLoad,
    delUserRun,
    editUserOpen,
    modal,
    setRestUserPWDState,
  } = props;

  return [
    {
      title: "用户信息",
      dataIndex: "name",
      key: "userInfo",
      ellipsis: true,
      width: "20%",
      render: (_: string, record: UserListResponseItem) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar}
            size={36}
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          >
            {record.name?.charAt(0)}
          </Avatar>
          <div className="flex flex-col min-w-0">
            <Text strong ellipsis>
              {record.name}
            </Text>
            {record.email && (
              <Text
                type="secondary"
                style={{ fontSize: "12px" }}
                ellipsis
                copyable={{ text: record.email }}
              >
                <MailOutlined style={{ marginRight: 4, opacity: 0.6 }} />
                {record.email}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "昵称",
      dataIndex: "nickName",
      width: "10%",
      ellipsis: true,
      responsive: ["lg"],
      render: (nick: string) =>
        nick ? <Text>{nick}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "部门",
      dataIndex: "department",
      width: "10%",
      ellipsis: true,
      responsive: ["lg"],
      render: (dept: string) =>
        dept ? <Tag color="blue">{dept}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: "手机",
      dataIndex: "mobile",
      width: "10%",
      ellipsis: true,
      responsive: ["md"],
      render: (mobile: string) =>
        mobile ? (
          <Tooltip title={mobile}>
            <Text copyable={{ text: mobile }}>
              <MobileOutlined style={{ marginRight: 4, opacity: 0.6 }} />
              {mobile}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: "5%",
      align: "center",
      render: (status: number, record: UserListResponseItem) => {
        const isAdmin = record.id === "1" || record.name === "admin";
        return (
          <Tooltip
            title={
              isAdmin
                ? "系统核心账号不可禁用"
                : status === 1
                  ? "点击禁用"
                  : "点击启用"
            }
          >
            <Switch
              checked={status === 1}
              size="small"
              loading={updateUserLoad}
              disabled={isAdmin}
              onChange={(checked) => {
                updateUserRun({ id: record.id, status: checked ? 1 : 2 });
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      align: "center",
      render: (_: string, record: UserListResponseItem) => {
        const isAdmin = record.id === "1" || record.name === "admin";
        return (
          <Space size={0} separator={<Divider orientation="vertical" />}>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => editUserOpen(record.id)}
            >
              修改
            </Button>

            <Button
              type="link"
              size="small"
              icon={<KeyOutlined />}
              disabled={record.status === 2}
              onClick={() =>
                setRestUserPWDState({
                  open: true,
                  id: record.id,
                  password: "",
                  name: record.name,
                })
              }
            >
              重置密码
            </Button>

            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={isAdmin}
              loading={delUserLoad}
              onClick={() => {
                modal.confirm({
                  title: "确认删除",
                  icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
                  content: `确定要删除用户 "${record.name}" 吗？`,
                  okText: "确定",
                  okType: "danger",
                  cancelText: "取消",
                  onOk: () => delUserRun(record.id),
                });
              }}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];
}
interface DataType {
  id: string;
  name: string;
  description: string;
}

export function Rolecolumns(): TableColumnsType<DataType> {
  return [
    {
      dataIndex: "id",
      title: "ID",
      width: "20%",
    },
    {
      dataIndex: "name",
      title: "Name",
      width: "30%",
    },
    {
      dataIndex: "description",
      title: "Description",
      ellipsis: true,
      width: "50%",
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
  ];
}
