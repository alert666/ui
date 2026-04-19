import React, { useEffect } from "react";
import {
  Form,
  Input,
  Modal,
  ModalProps,
  Select,
  Switch,
  theme,
  App,
} from "antd";
import CodeEditor from "../codeEditor/CodeEditor";
import {
  CHANNEL_SEARCH_DIMENSIONS,
  AlertChannelItem,
  CreateAlertChanneRequest,
  UpdateAlertChanneRequest,
} from "@/types/alert/channel";

export interface EditAlertChannelProps extends ModalProps {
  // 当前编辑的行数据，新增时为 {} 或 null
  data?: AlertChannelItem | null;
  // 统一的保存回调（由父组件决定是创建还是更新）
  onSave?: (data: CreateAlertChanneRequest | UpdateAlertChanneRequest) => void;
}

const EditAlertChannel: React.FC<EditAlertChannelProps> = (props) => {
  const { data, onSave, ...modalProps } = props;
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  // 监听 Modal 打开，进行数据回显和转换
  useEffect(() => {
    if (modalProps.open) {
      if (data?.id) {
        // 编辑模式：对象转字符串，数字转布尔
        form.setFieldsValue({
          ...data,
          status: data.status === 1,
          aggregationStatus: data.aggregationStatus === 1,
          config: data.config ? JSON.stringify(data.config, null, 2) : "{}",
        });
      } else {
        // 新增模式：重置表单
        form.resetFields();
      }
    }
  }, [data, modalProps.open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 数据发往后端前的转换：字符串转回对象，布尔转回数字
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
        // 此处不处理 Form 校验失败，Form 自己会变红
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
          label="详细配置 (JSON)"
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
