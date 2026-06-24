import { useEffect, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Divider,
  GlobalToken,
  Row,
  Col,
} from "antd";
import { Base64 } from "js-base64";
import CodeEditor from "../codeEditor/CodeEditor";
import { useRequest } from "ahooks";
import { GetAlertChannelList } from "@/services/alertChannel";

// 定义接口
export interface CreateAlertTemplate {
  name: string;
  description: string;
  template: string;
  aggregationTemplate: string;
  alertChannelID: number;
  receiveIdType: string;
  receiveId: string[];
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
  const watchedChannelID = Form.useWatch("alertChannelID", form);

  // 获取告警渠道列表（分页拉取，pageSize 上限 100）
  const channelListResult = useRequest(
    async () => {
      const pageSize = 100;
      const firstPage = await GetAlertChannelList({ page: 1, pageSize });
      const total = firstPage.total;
      const allList = [...firstPage.list];

      if (total > pageSize) {
        const totalPages = Math.ceil(total / pageSize);
        for (let p = 2; p <= totalPages; p++) {
          const page = await GetAlertChannelList({ page: p, pageSize });
          allList.push(...page.list);
        }
      }

      return { ...firstPage, list: allList };
    },
    { ready: visible },
  );

  // 根据选中的渠道类型决定模板编辑器语言：email → html，其他 → yaml
  const editorLang = useMemo(() => {
    if (!watchedChannelID) return "yaml";
    const ch = (channelListResult.data?.list || []).find(
      (c) => Number(c.id) === watchedChannelID,
    );
    return ch?.type === "email" ? "html" : "yaml";
  }, [watchedChannelID, channelListResult.data]);

  // 编辑器区域标题
  const editorLabel =
    editorLang === "html" ? "内容配置 (HTML)" : "内容配置 (YAML)";

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

        {/* 渠道和接收者行 */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="alertChannelID"
              label="关联告警渠道"
              rules={[{ required: true, message: "请选择告警渠道" }]}
            >
              <Select
                placeholder="选择告警渠道"
                loading={channelListResult.loading}
                options={(channelListResult.data?.list || []).map((ch) => ({
                  label: ch.name,
                  value: Number(ch.id),
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="receiveIdType"
              label="接收者类型"
              rules={[{ required: true, message: "请选择接收者类型" }]}
            >
              <Select
                placeholder="选择接收者类型"
                options={[
                  { label: "Open ID", value: "open_id" },
                  { label: "User ID", value: "user_id" },
                  { label: "Email", value: "email" },
                  { label: "Chat ID", value: "chat_id" },
                  { label: "Remote", value: "remote" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="receiveId"
              label="接收者ID"
              rules={[{ required: true, message: "请输入至少一个接收者ID" }]}
            >
              <Select
                mode="tags"
                placeholder="输入后回车添加，支持多个"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider
          orientation="horizontal"
          plain
          style={{ fontSize: "12px", color: "#999" }}
        >
          {editorLabel}
        </Divider>

        {/* 模板编辑区域 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="template"
              label="普通模板"
              rules={[{ required: true, message: "普通模板内容不能为空" }]}
            >
              <CodeEditor token={token} language={editorLang} height="450px" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="aggregationTemplate"
              label="聚合模板"
              initialValue="" // 给个默认空字符串
            >
              <CodeEditor token={token} language={editorLang} height="450px" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateAlertTemplateModal;
