import React, { useEffect } from "react";
import {
  Form,
  Input,
  Modal,
  ModalProps,
  Popover,
  Select,
  Switch,
  Typography,
  theme,
  App,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import CodeEditor from "../codeEditor/CodeEditor";
import {
  CHANNEL_SEARCH_DIMENSIONS,
  AlertChannelItem,
  CreateAlertChanneRequest,
  UpdateAlertChanneRequest,
} from "@/types/alert/channel";

const CONFIG_HINT = (
  <div
    style={{ maxWidth: 560, fontSize: 12, maxHeight: 520, overflowY: "auto" }}
  >
    <Typography.Text strong style={{ fontSize: 12 }}>
      配置格式参考：
    </Typography.Text>
    <div style={{ marginTop: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        <strong>飞书自建应用</strong> — Channel.Config 存入 App ID +
        Secret（传输凭证）；Template 指定 ReceiveIdType / ReceiveId 确定接收者
      </Typography.Text>
      <pre
        style={{
          margin: "4px 0 0",
          fontSize: 11,
          color: "#666",
          background: "#f5f5f5",
          padding: "4px 8px",
          borderRadius: 4,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {`{"app_id":"cli_xxx","app_secret":"xxx"}`}
      </pre>
    </div>
    <div style={{ marginTop: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        <strong>飞书机器人</strong> — Channel.Config 存入 Webhook URL +
        Secret；Template 接收者字段留空（URL 已决定目标）
      </Typography.Text>
      <pre
        style={{
          margin: "4px 0 0",
          fontSize: 11,
          color: "#666",
          background: "#f5f5f5",
          padding: "4px 8px",
          borderRadius: 4,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {`{"webhook_url":"https://open.feishu.cn/xxx","secret":"xxx"}`}
      </pre>
    </div>
    <div style={{ marginTop: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        <strong>钉钉机器人</strong> — Channel.Config 存入 Webhook URL +
        Secret；Template 接收者字段留空
      </Typography.Text>
      <pre
        style={{
          margin: "4px 0 0",
          fontSize: 11,
          color: "#666",
          background: "#f5f5f5",
          padding: "4px 8px",
          borderRadius: 4,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {`{"webhook_url":"https://oapi.dingtalk.com/robot/send?access_token=xxx","secret":"SECxxx"}`}
      </pre>
    </div>
    <div style={{ marginTop: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        <strong>邮件 SMTP</strong> — Channel.Config 存入 SMTP 凭证
      </Typography.Text>
      <pre
        style={{
          margin: "4px 0 0",
          fontSize: 11,
          color: "#666",
          background: "#f5f5f5",
          padding: "4px 8px",
          borderRadius: 4,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
{`{
  "smtp_host": "xxx",
  "smtp_port": 465,
  "username": "xxx",
  "password": "xxx"
}`}
      </pre>
      <Typography.Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: "block" }}>
        模板中 ReceiveIdType = email，ReceiveId 填入收件邮箱地址
      </Typography.Text>
    </div>
    <div style={{ marginTop: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        <strong>通用 Webhook</strong>
      </Typography.Text>
      <pre
        style={{
          margin: "4px 0 0",
          fontSize: 11,
          color: "#666",
          background: "#f5f5f5",
          padding: "4px 8px",
          borderRadius: 4,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {`{"url":"https://example.com/webhook","secret":"xxx","headers":{"X-Custom":"value"}}`}
      </pre>
    </div>
  </div>
);

export interface EditAlertChannelProps extends ModalProps {
  data?: AlertChannelItem | null;
  onSave?: (data: CreateAlertChanneRequest | UpdateAlertChanneRequest) => void;
}

const EditAlertChannel: React.FC<EditAlertChannelProps> = (props) => {
  const { data, onSave, ...modalProps } = props;
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  useEffect(() => {
    if (modalProps.open) {
      if (data?.id) {
        form.setFieldsValue({
          ...data,
          status: data.status === 1,
          aggregationStatus: data.aggregationStatus === 1,
          config: data.config ? JSON.stringify(data.config, null, 2) : "{}",
        });
      } else {
        form.resetFields();
      }
    }
  }, [data, modalProps.open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        id: data?.id,
        status: values.status ? 1 : 0,
        aggregationStatus: values.aggregationStatus ? 1 : 0,
        config: JSON.parse(values.config),
      };
      onSave?.(payload);
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        message.error("配置项 JSON 格式不正确，请检查");
      } else if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  return (
    <Modal
      {...modalProps}
      onOk={handleOk}
      destroyOnHidden
      mask={{ closable: false }}
      closable={false}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        initialValues={{ status: true, aggregationStatus: true }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 24px",
          }}
        >
          <Form.Item
            name="name"
            label="通道名称"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input disabled={!!data?.id} placeholder="例如: 运维飞书群" />
          </Form.Item>

          <Form.Item name="type" label="通道类型" rules={[{ required: true }]}>
            <Select
              disabled={!!data?.id}
              options={
                CHANNEL_SEARCH_DIMENSIONS.find((d) => d.value === "type")
                  ?.options
              }
              placeholder="请选择通道类型"
            />
          </Form.Item>
        </div>

        <div style={{ display: "flex", gap: "40px" }}>
          <Form.Item name="status" label="是否启用" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item
            name="aggregationStatus"
            label="聚合通知"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="禁用" />
          </Form.Item>
        </div>

        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="请输入描述信息" rows={2} />
        </Form.Item>

        <Form.Item
          name="config"
          label={
            <span>
              详细配置 (JSON)
              <Popover
                content={CONFIG_HINT}
                title={null}
                trigger="click"
                placement="right"
              >
                <InfoCircleOutlined
                  style={{
                    marginLeft: 6,
                    color: token.colorTextQuaternary,
                    cursor: "pointer",
                  }}
                />
              </Popover>
            </span>
          }
          rules={[
            { required: true, message: "配置不能为空" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                try {
                  JSON.parse(value);
                  return Promise.resolve();
                } catch {
                  return Promise.reject(new Error("请输入合法的 JSON 格式"));
                }
              },
            },
          ]}
        >
          <CodeEditor token={token} language="json" height="300px" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditAlertChannel;
