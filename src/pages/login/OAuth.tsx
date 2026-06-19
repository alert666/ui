import { Card, Form, Input, Button, message, Progress } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRequest } from "ahooks";
import { OAuth2Activate, OAuthLogin } from "@/services/oauth2";
import { UserStatus } from "@/types/user/user";
import { useParams } from "@/hooks/useParams";
import useUserStore from "@/stores/userStore";
import bgImage from "@/assets/login.png";

export default function UpdatePasswordPage() {
  const { getParam } = useParams();
  const state = getParam("state");
  const code = getParam("code");
  const { setUser } = useUserStore();
  const [form] = Form.useForm();
  const [strength, setStrength] = useState(0);
  const navigate = useNavigate();
  const [updateUser, setupdateUser] = useState(false);

  const handlePasswordChange = (value: string) => {
    let s = 0;
    if (value.length >= 8) s += 30;
    if (/[A-Z]/.test(value)) s += 20;
    if (/[0-9]/.test(value)) s += 20;
    if (/[^A-Za-z0-9]/.test(value)) s += 30;
    setStrength(s);
  };

  const { run: loginRun, data } = useRequest(OAuthLogin, {
    manual: true,
    onSuccess: (data) => {
      if (data) {
        if (data.token !== "" && data.user.status === UserStatus.Active) {
          setUser(data.user);
          localStorage.setItem("token", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          navigate("/workspace");
        }
        setupdateUser(true);
      }
    },
  });

  const { run: activateRun, loading: activateLoading } = useRequest(
    OAuth2Activate,
    {
      manual: true,
      onSuccess: (data) => {
        if (data) {
          if (data.token !== "" && data.user.status === UserStatus.Active) {
            setupdateUser(false);
            localStorage.setItem("token", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);
            setUser(data.user);
            navigate("/workspace");
          }
        }
      },
    }
  );

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!data?.user.id || !state) {
      message.error("用户ID不存在");
      return;
    }
    activateRun(data.user.id, values.password, values.confirmPassword, state);
  };

  useEffect(() => {
    if (state && code) {
      loginRun(code, state);
    }
  }, [state, code, loginRun]);
  return (
    <>
      {updateUser && (
        <div
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="flex justify-center items-center h-screen bg-gray-50"
        >
          <Card
            title="更新密码"
            className="shadow-lg rounded-2xl w-full max-w-md"
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: "请输入密码" },
                  { min: 8, message: "密码至少 8 位" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
              </Form.Item>

              {form.getFieldValue("password") && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">密码强度</div>
                  <Progress
                    percent={strength}
                    size="small"
                    status={
                      strength < 40
                        ? "exception"
                        : strength < 80
                        ? "active"
                        : "success"
                    }
                  />
                </div>
              )}

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "请确认密码" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入密码"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={activateLoading}
                  block
                  className="rounded-lg"
                >
                  更新密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}
    </>
  );
}
