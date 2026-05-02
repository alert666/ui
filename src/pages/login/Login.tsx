import { UserLogin } from "@/services/user";
import { useRequest } from "ahooks";
import { Button, Card, Checkbox, Form, Input, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import bgImage from "@/assets/login.png";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import OAuthComponent from "@/components/user/OAuth";
import useApp from "antd/es/app/useApp";
import Error from "@/utils/error";
const { Title } = Typography;
const LoginPage = () => {
  const app = useApp();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get("from");

  const { run: loginRun, loading: loginLoading } = useRequest(UserLogin, {
    manual: true,
    onSuccess: (res) => {
      localStorage.setItem("token", res?.token);
      navigate(from ? decodeURIComponent(from) : "/", { replace: true });
    },
    onError: (error: Error) => {
      Error(error, app.message);
    },
  });
  // 登录处理逻辑
  const onFinish = (values: { email: string; password: string }) => {
    loginRun(values);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="flex items-center justify-center min-h-screen from-indigo-500 via-purple-500 to-pink-500"
    >
      <Card
        className="max-w-lg p-8 w-full"
        style={{
          borderRadius: "12px",
          boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={2} className="text-center text-gray-800 mb-8 font-bold">
          用户登录
        </Title>

        <Form
          name="login"
          size="large"
          onFinish={onFinish}
          initialValues={{ remember: true }}
          wrapperCol={{ span: 18, offset: 3 }}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "请输入用户名!" }]}
            required={false}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              className="focus:ring-indigo-500 focus:border-indigo-500 custom-autofill-input"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            required={false}
            name="password"
            rules={[
              { required: true, message: "请输入密码!" },
              { message: "密码长度不能小于8位", min: 8 },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              className="focus:ring-indigo-500 focus:border-indigo-500"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item className="mt-6">
            <div>
              <Button
                block
                type="primary"
                htmlType="submit"
                loading={loginLoading}
              >
                登录
              </Button>
            </div>
          </Form.Item>
        </Form>
        <OAuthComponent />
      </Card>
    </div>
  );
};

export default LoginPage;
