import React, { useEffect } from "react";
import {
  Modal, // 替换为 Modal
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

interface AlertTemplateModalProps extends React.ComponentProps<typeof Modal> {
  token: GlobalToken;
  visible: boolean;
  onClose: () => void;
  record: AlertTemplateRecord;
  alertTemplateUpdateResult?: Result<
    ApiResponse<unknown>,
    [id: string, data: AlertTemplateUpdateReq]
  >;
  descriptionEdit?: boolean; // false 为可编辑，true 为禁用
}

const AlertTemplateModal: React.FC<AlertTemplateModalProps> = ({
  token,
  visible,
  onClose,
  record,
  alertTemplateUpdateResult,
  descriptionEdit = false,
  ...rest
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        description: record.description,
        template: record.template,
        aggregationTemplate: record.aggregationTemplate,
      });
    }
  }, [record, form, visible]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // 如果处于预览模式，不执行保存
      if (descriptionEdit) return;

      const template = Base64.encode(values.template || "");
      const aggregationTemplate = Base64.encode(
        values.aggregationTemplate || "",
      );

      if (record) {
        const data = {
          description: values.description,
          template: template,
          aggregationTemplate: aggregationTemplate,
        };
        await alertTemplateUpdateResult?.runAsync(record.id, data);
        onClose();
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  if (!record && visible) return null;

  return (
    <Modal
      {...rest}
      title={descriptionEdit ? "预览告警模板" : "编辑告警模板"}
      centered
      open={visible}
      onCancel={onClose}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose}>{descriptionEdit ? "关闭" : "取消"}</Button>
          {!descriptionEdit && ( // 仅在非只读模式下显示保存按钮
            <Button
              onClick={handleSave}
              loading={alertTemplateUpdateResult?.loading}
              type="primary"
            >
              保存修改
            </Button>
          )}
        </Space>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* 基础信息部分 */}
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
          <Descriptions.Item label="名称">{record?.name}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {record?.createdAt
              ? dayjs(record.createdAt).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新">
            {record?.updatedAt
              ? dayjs(record.updatedAt).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="horizontal">可编辑部分</Divider>

        <Form.Item
          name="description"
          label="描述"
          rules={[{ required: !descriptionEdit, message: "请输入描述" }]}
        >
          <Input.TextArea
            disabled={descriptionEdit}
            rows={2}
            placeholder="请输入模板描述"
          />
        </Form.Item>

        <Divider orientation="horizontal">模板内容 (只读)</Divider>

        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="template"
            label="普通模板 (template)"
            style={{ flex: 1 }}
          >
            <CodeEditor
              token={token}
              value={record?.template}
              language="yaml"
              readOnly
              height="300px" // 建议给编辑器固定高度
            />
          </Form.Item>

          <Form.Item
            name="aggregationTemplate"
            label="聚合模板 (aggregationTemplate)"
            style={{ flex: 1 }}
          >
            <CodeEditor
              token={token}
              value={record?.aggregationTemplate}
              language="yaml"
              readOnly
              height="300px"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default AlertTemplateModal;
