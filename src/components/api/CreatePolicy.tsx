import { CreateApi } from "@/services/api";
import { useRequest } from "ahooks";
import {
  App,
  Form,
  Input,
  Select,
  Segmented,
  Space,
  Typography,
  Divider,
  Modal,
} from "antd";
import {
  CheckCircleOutlined,
  StopOutlined,
  ApiOutlined,
  LinkOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface CreateApiComponentProps {
  open: boolean;
  onCancel: () => void;
  refresh: () => void;
}

const CreateApiComponent = ({
  open,
  onCancel,
  refresh,
}: CreateApiComponentProps) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  // 统一的退出处理
  const handleCancelInternal = () => {
    form.resetFields();
    onCancel();
  };

  const { run: createRun, loading: createLoad } = useRequest(CreateApi, {
    manual: true,
    onSuccess: () => {
      message.success("策略创建成功");
      refresh();
      handleCancelInternal();
    },
  });

  const handleOk = () => {
    form.validateFields().then((values) => {
      createRun(values);
    });
  };

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={handleCancelInternal}
      confirmLoading={createLoad}
      destroyOnHidden // 关闭时销毁子元素，确保状态重置
      title={
        <Space>
          <ApiOutlined style={{ color: "#1677ff" }} />
          <span>新增 API 策略</span>
        </Space>
      }
      width={520}
      okText="确定"
      cancelText="取消"
    >
      <Divider style={{ margin: "12px 0" }} />
      <Form
        form={form}
        layout="vertical"
        initialValues={{ effect: "allow", method: "GET" }}
      >
        <Form.Item
          name="name"
          label={<Text strong>策略识别名</Text>}
          extra="唯一标识，例如：LogQueryPolicy"
          rules={[
            { required: true, message: "请输入策略名称" },
            { pattern: /^[a-zA-Z0-9_]+$/, message: "仅支持字母、数字、下划线" },
          ]}
        >
          <Input
            prefix={<EditOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="输入策略名称"
          />
        </Form.Item>

        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="method"
            label={<Text strong>请求方法</Text>}
            style={{ flex: 1 }}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                {
                  value: "GET",
                  label: <b style={{ color: "#52c41a" }}>GET</b>,
                },
                {
                  value: "POST",
                  label: <b style={{ color: "#1890ff" }}>POST</b>,
                },
                {
                  value: "PUT",
                  label: <b style={{ color: "#faad14" }}>PUT</b>,
                },
                {
                  value: "DELETE",
                  label: <b style={{ color: "#f5222d" }}>DELETE</b>,
                },
                { value: "*", label: "*" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="effect"
            label={<Text strong>执行效果</Text>}
            style={{ flex: 1 }}
            rules={[{ required: true }]}
          >
            <Segmented
              block
              options={[
                {
                  label: (
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      <span>允许</span>
                    </Space>
                  ),
                  value: "allow",
                },
                {
                  label: (
                    <Space>
                      <StopOutlined style={{ color: "#ff4d4f" }} />
                      <span>禁止</span>
                    </Space>
                  ),
                  value: "deny",
                },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="path"
          label={<Text strong>API 路径</Text>}
          rules={[
            { required: true, message: "请输入访问路径" },
            { pattern: /^[*a-zA-Z0-9/_\-:]+$/, message: "路径格式不正确" },
          ]}
        >
          <Input
            prefix={<LinkOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="/api/v1/resource/*"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={<Text strong>策略描述</Text>}
          rules={[{ required: true, message: "请简述此策略用途" }]}
        >
          <Input.TextArea
            rows={3}
            showCount
            maxLength={100}
            placeholder="描述该权限规则的使用场景..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateApiComponent;
