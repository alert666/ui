import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Divider,
  GlobalToken,
  Row,
  Col,
} from "antd";
import { Base64 } from "js-base64";
import CodeEditor from "../codeEditor/CodeEditor";

// 定义接口
export interface CreateAlertTemplate {
  name: string;
  description: string;
  template: string;
  aggregationTemplate: string;
  alertChannelID?: number;
}

interface CreateAlertTemplateModalProps {
  token: GlobalToken;
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateAlertTemplate) => Promise<void> | void;
  loading?: boolean;
}

const CreateAlertTemplateModal: React.FC<CreateAlertTemplateModalProps> = ({
  token,
  visible,
  onClose,
  onSave,
  loading,
}) => {
  const [form] = Form.useForm();

  // 每次打开时重置表单
  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 构造符合后端接口的 Payload
      const payload: CreateAlertTemplate = {
        ...values,
        // 编码模板内容
        template: Base64.encode(values.template || ""),
        aggregationTemplate: Base64.encode(values.aggregationTemplate || ""),
      };

      if (onSave) {
        await onSave(payload);
        onClose(); // 成功后关闭
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  return (
    <Modal
      title="新建告警模板"
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      width="70%"
      centered
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={loading} onClick={handleOk}>
            立即创建
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        style={{ marginTop: 20 }}
      >
        {/* 基础信息行 */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="name"
              label="模板名称"
              rules={[{ required: true, message: "请输入模板名称" }]}
            >
              <Input placeholder="例如: 飞书告警通知" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: "请输入描述" }]}
            >
              <Input placeholder="输入该模板的用途" />
            </Form.Item>
          </Col>
        </Row>

        <Divider
          orientation="horizontal"
          plain
          style={{ fontSize: "12px", color: "#999" }}
        >
          内容配置 (YAML)
        </Divider>

        {/* 模板编辑区域 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="template"
              label="普通模板"
              rules={[{ required: true, message: "普通模板内容不能为空" }]}
            >
              <CodeEditor token={token} language="yaml" height="450px" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="aggregationTemplate"
              label="聚合模板"
              initialValue="" // 给个默认空字符串
            >
              <CodeEditor token={token} language="yaml" height="450px" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateAlertTemplateModal;
