import { useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Descriptions,
  Divider,
  GlobalToken,
} from "antd";
import {
  AlertTemplateRecord,
  AlertTemplateUpdateReq,
} from "@/types/alert/template";
import CodeEditor from "../codeEditor/CodeEditor";
import { Result } from "ahooks/lib/useRequest/src/types";
import { ApiResponse } from "@/types";
import { Base64 } from "js-base64";
import dayjs from "dayjs";
interface AlertTemplateDrawerProps {
  toke: GlobalToken;
  visible: boolean;
  onClose: () => void;
  record: AlertTemplateRecord;
  alertTemplateUpdateResult: Result<
    ApiResponse<unknown>,
    [id: string, data: AlertTemplateUpdateReq]
  >;
}

const AlertTemplateDrawer: React.FC<AlertTemplateDrawerProps> = ({
  toke,
  visible,
  onClose,
  record,
  alertTemplateUpdateResult,
}) => {
  const [form] = Form.useForm();

  // 当 record 变化时，重置表单值
  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        description: record.description,
        template: record.template, // 注入表单，validateFields 才能拿到
        aggregationTemplate: record.aggregationTemplate, // 注入表单
      });
    }
  }, [record, form]);

  const handleSave = async () => {
    const values: AlertTemplateRecord = await form.validateFields();
    const template = Base64.encode(values.template);
    const aggregationTemplate = Base64.encode(values.aggregationTemplate);
    if (record) {
      const data = {
        description: values.description,
        template: template,
        aggregationTemplate: aggregationTemplate,
      };
      alertTemplateUpdateResult.run(record.id, data);
      onClose();
    }
  };

  if (!record) return null;

  return (
    <Drawer
      title="查看/编辑告警模板"
      size="50%"
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button
            onClick={handleSave}
            loading={alertTemplateUpdateResult.loading}
            type="primary"
          >
            保存修改
          </Button>
        </Space>
      }
    >
      <Form<AlertTemplateRecord> form={form} layout="vertical">
        {/* 只读的基础信息部分 */}
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="名称">{record.name}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(record.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新">
            {dayjs(record.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="horizontal">可编辑部分</Divider>

        {/* 唯一可编辑的字段 */}
        <Form.Item
          name="description"
          label="描述"
          rules={[{ required: true, message: "请输入描述" }]}
        >
          <Input.TextArea rows={2} placeholder="请输入模板描述" />
        </Form.Item>

        <Divider orientation="horizontal">模板内容 (只读)</Divider>

        {/* 只读的模板内容 */}
        <Form.Item name="template" label="普通模板 (template)">
          <CodeEditor
            token={toke}
            value={record.template}
            language="yaml"
            readOnly
          />
        </Form.Item>

        <Form.Item
          name="aggregationTemplate"
          label="聚合模板 (aggregationTemplate)"
        >
          <CodeEditor
            token={toke}
            value={record.aggregationTemplate}
            language="yaml"
            readOnly
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AlertTemplateDrawer;
