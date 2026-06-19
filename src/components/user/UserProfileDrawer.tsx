import { useRequest } from "ahooks";
import {
  App,
  Avatar,
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Tag,
  Typography,
  Divider,
} from "antd";
import {
  EditOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { UserInfo, UserUpdateBySelf } from "@/services/user";
import { UserUpdateRequest, UserUpPwdRequest } from "@/types/user/user";


interface UserProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileDrawer({ open, onClose }: UserProfileDrawerProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [showPwdModal, setShowPwdModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { data: userInfo, loading, refresh, run } = useRequest(UserInfo, {
    manual: true,
    onSuccess: (data) => {
      form.setFieldsValue(data);
    },
  });

  const { run: upRun, loading: upLoad } = useRequest(UserUpdateBySelf, {
    manual: true,
    debounceWait: 500,
    onSuccess: () => {
      message.success("修改成功");
      refresh();
    },
  });

  const { run: upPwdRun, loading: upPwdLoad } = useRequest(UserUpdateBySelf, {
    manual: true,
    onSuccess: () => {
      message.success("密码已修改，即将跳转登录页");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      timerRef.current = setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    },
  });

  useEffect(() => {
    if (open) {
      run();
    }
  }, [open, run]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onFinish = (values: UserUpdateRequest) => {
    upRun(values);
    onClose();
  };

  const onPwdFinish = (values: UserUpPwdRequest) => {
    if (!userInfo?.id) return;
    upPwdRun({
      id: userInfo.id,
      oldPassword: values.oldPassword,
      password: values.newPassword,
    });
  };

  return (
    <>
      <Drawer
        title="个人信息"
        open={open}
        onClose={onClose}
        size="large" styles={{ wrapper: { width: 480 } }}
        loading={loading}
        destroyOnHidden
      >
        {/* Profile header */}
        <div className="text-center mb-6">
          <Avatar
            src={userInfo?.avatar}
            size={80}
            icon={!userInfo?.avatar && <UserOutlined />}
            className="mb-3"
          />
          <Typography.Title level={4} className="!mb-1">
            {userInfo?.nickName || userInfo?.name || "未设置昵称"}
          </Typography.Title>
          <div className="flex justify-center gap-2 mt-2">
            {userInfo?.roles?.map((role) => (
              <Tag key={role.name} color="blue" className="border-0">
                {role.name}
              </Tag>
            ))}
            <Tag color={userInfo?.status === 1 ? "success" : "error"} className="border-0">
              {userInfo?.status === 1 ? "正常" : "禁用"}
            </Tag>
          </div>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* Read-only info */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <UserOutlined /> 基本信息
          </h4>
          <div className="space-y-3">
            {[
              { icon: null, label: "用户ID", value: userInfo?.id },
              { icon: null, label: "用户名", value: userInfo?.name },
              { icon: <MailOutlined />, label: "邮箱", value: userInfo?.email },
              { icon: <MobileOutlined />, label: "手机号", value: userInfo?.mobile },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center text-sm">
                <span className="w-20" style={{ color: "#8c8c8c" }}>{label}</span>
                <span>{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* Edit form */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <EditOutlined /> 修改信息
          </h4>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="small"
          >
            <Form.Item
              label="头像链接"
              name="avatar"
              rules={[
                { type: "url", message: "请输入有效的图片链接" },
                { required: true, message: "请输入头像链接" },
              ]}
            >
              <Input placeholder="输入新头像URL" allowClear />
            </Form.Item>
            <Form.Item
              label="昵称"
              name="nickName"
              rules={[{ required: false }]}
            >
              <Input placeholder="请输入昵称" allowClear />
            </Form.Item>
            <Form.Item
              label="手机号"
              name="mobile"
              rules={[
                { required: false },
                { pattern: /^1[3-9]d{9}$/, message: "手机号格式不正确" },
              ]}
            >
              <Input placeholder="请输入手机号" allowClear />
            </Form.Item>
            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" loading={upLoad} block>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* Password change */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <LockOutlined /> 账户安全
          </h4>
          <Button
            icon={<LockOutlined />}
            onClick={() => setShowPwdModal(true)}
            block
          >
            修改密码
          </Button>
        </div>
      </Drawer>

      <Modal
        title="修改密码"
        open={showPwdModal}
        onCancel={() => setShowPwdModal(false)}
        footer={null}
        destroyOnHidden
        centered
      >
        <Form
          form={pwdForm}
          layout="vertical"
          onFinish={onPwdFinish}
          style={{ marginTop: 8 }}
        >
          <Form.Item
            label="原密码"
            name="oldPassword"
            rules={[
              { required: true, message: "请输入原密码" },
              { min: 8, message: "密码至少8位" },
            ]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 8, message: "密码至少8位" },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setShowPwdModal(false)}>取消</Button>
            <Button type="primary" htmlType="submit" loading={upPwdLoad}>
              确认修改
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
