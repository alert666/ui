import {
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
      title: "ID",
      dataIndex: "id",
      width: 60,
      responsive: ["md"], // 中等屏幕(768px)及以上显示
      render: (id: string) => (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {id}
        </Text>
      ),
    },
    {
      title: "用户信息",
      dataIndex: "name",
      key: "userInfo",
      render: (_: string, record: UserListResponseItem) => (
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}
        >
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: "12px", marginTop: 2 }}>
            {record.nickName || "—"}
          </Text>
        </div>
      ),
    },
    {
      title: "部门",
      dataIndex: "department",
      width: 100,
      responsive: ["lg"], // 大屏幕(992px)及以上显示
      render: (dept: string) => (
        <Tag color="blue" style={{ border: "none" }}>
          {dept || "通用"}
        </Tag>
      ),
    },
    {
      title: "联系方式",
      dataIndex: "email",
      width: 220,
      responsive: ["sm"], // 平板及以上显示
      render: (email: string, record: UserListResponseItem) => (
        <Space orientation="vertical" size={0} style={{ gap: "2px" }}>
          {email ? (
            <Text
              copyable={{ text: email, tooltips: ["点击复制", "复制成功"] }}
              style={{ fontSize: "13px" }}
            >
              <MailOutlined style={{ marginRight: 4, opacity: 0.6 }} />
              {email}
            </Text>
          ) : (
            <Text type="secondary">—</Text>
          )}
          {record.mobile && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              <MobileOutlined style={{ marginRight: 4, opacity: 0.6 }} />
              {record.mobile}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: "100px",
      align: "center",
      render: (status: number, record: UserListResponseItem) => {
        const isAdmin = record.id === "1" || record.name === "admin";
        return (
          <Tooltip title={isAdmin ? "系统核心账号不可禁用" : ""}>
            <div onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={status === 1}
                checkedChildren="开"
                unCheckedChildren="关"
                size="small"
                loading={updateUserLoad}
                disabled={isAdmin}
                onChange={(checked) => {
                  updateUserRun({ id: record.id, status: checked ? 1 : 2 });
                }}
              />
            </div>
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
          <Space separator={<Divider orientation="vertical" />} size={0}>
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
