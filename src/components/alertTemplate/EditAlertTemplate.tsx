import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Descriptions,
  Divider,
  GlobalToken,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  SaveOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import {
  AlertTemplateRecord,
  AlertTemplateUpdateReq,
} from "@/types/alert/template";
import CodeEditor from "../codeEditor/CodeEditor";
import { Result } from "ahooks/lib/useRequest/src/types";
import { ApiResponse } from "@/types";
import { Base64 } from "js-base64";
import dayjs from "dayjs";
import { useRequest } from "ahooks";
import { GetAlertChannelList } from "@/services/alertChannel";

const safeDecode = (str: string) => {
  if (!str) return "";
  try {
    if (Base64.isValid(str)) return Base64.decode(str);
    return str;
  } catch {
    return str;
  }
};

interface AlertTemplateModalProps extends React.ComponentProps<typeof Modal> {
  token: GlobalToken;
  visible: boolean;
  onClose: () => void;
  record: AlertTemplateRecord;
  alertTemplateUpdateResult?: Result<
    ApiResponse<unknown>,
    [id: string, data: AlertTemplateUpdateReq]
  >;
}

const AlertTemplateModal: React.FC<AlertTemplateModalProps> = ({
  token,
  visible,
  onClose,
  record,
  alertTemplateUpdateResult,
  ...rest
}) => {
  const [form] = Form.useForm();
  const watchedChannelID = Form.useWatch("alertChannelID", form);
  const [isEditing, setIsEditing] = useState(false);

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

  // 根据选中的渠道类型决定编辑器语言：email → html，其他 → yaml
  const editorLang = useMemo(() => {
    const chId = watchedChannelID ?? record?.alertChannelID;
    if (!chId) return "yaml";
    const ch = (channelListResult.data?.list || []).find(
      (c) => Number(c.id) === chId
    );
    return ch?.type === "email" ? "html" : "yaml";
  }, [watchedChannelID, channelListResult.data, record?.alertChannelID]);

  const editorLabel = editorLang === "html" ? "模板内容 (HTML)" : "模板内容 (YAML)";

  const decodedTemplate = useMemo(
    () => safeDecode(record?.template || ""),
    [record?.template],
  );
  const decodedAggTemplate = useMemo(
    () => safeDecode(record?.aggregationTemplate || ""),
    [record?.aggregationTemplate],
  );

  useEffect(() => {
    if (visible && record) {
      // Parse receiveId from JSON string to array
      let receiveIdArr: string[] = [];
      if (record.receiveId) {
        try {
          const parsed = JSON.parse(record.receiveId);
          receiveIdArr = Array.isArray(parsed) ? parsed : [];
        } catch {
          receiveIdArr = [];
        }
      }
      form.setFieldsValue({
        alertChannelID: record.alertChannelID,
        receiveIdType: record.receiveIdType,
        receiveId: receiveIdArr,
        description: record.description,
        template: decodedTemplate,
        aggregationTemplate: decodedAggTemplate,
      });
      setIsEditing(false);
    }
  }, [record, form, visible, decodedTemplate, decodedAggTemplate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    let receiveIdArr: string[] = [];
    if (record.receiveId) {
      try {
        const parsed = JSON.parse(record.receiveId);
        receiveIdArr = Array.isArray(parsed) ? parsed : [];
      } catch {
        receiveIdArr = [];
      }
    }
    form.setFieldsValue({
      alertChannelID: record.alertChannelID,
      receiveIdType: record.receiveIdType,
      receiveId: receiveIdArr,
      description: record.description,
      template: decodedTemplate,
      aggregationTemplate: decodedAggTemplate,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      Modal.confirm({
        title: "确认保存",
        content: `确定保存对模板 "${record?.name}" 的修改吗？`,
        okText: "确定",
        cancelText: "取消",
        onOk: async () => {
          const data = {
            description: values.description,
            template: Base64.encode(values.template || ""),
            aggregationTemplate: Base64.encode(values.aggregationTemplate || ""),
            alertChannelID: values.alertChannelID,
            receiveIdType: values.receiveIdType,
            receiveId: values.receiveId,
          };
          await alertTemplateUpdateResult?.runAsync(record.id, data);
          setIsEditing(false);
          onClose();
        },
      });
    } catch {
      // validation failed — form shows inline errors, confirm dialog never opened
    }
  };

  if (!record && visible) return null;

  return (
    <Modal
      {...rest}
      title={isEditing ? "编辑告警模板" : "查看告警模板"}
      centered
      open={visible}
      onCancel={onClose}
      destroyOnHidden
      width="80%"
      footer={
        <Space>
          {isEditing ? (
            <>
              <Button
                icon={<RollbackOutlined />}
                onClick={handleCancelEdit}
              >
                取消编辑
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={alertTemplateUpdateResult?.loading}
              >
                保存修改
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose}>关闭</Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>
            </>
          )}
        </Space>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Descriptions column={4} bordered size="small">
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

        <Divider orientation="horizontal" plain>
          基础配置
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="alertChannelID"
              label="关联告警渠道"
              rules={[{ required: true, message: "请选择告警渠道" }]}
            >
              <Select
                disabled={!isEditing}
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
                disabled={!isEditing}
                placeholder="选择接收者类型"
                options={[
                  { label: "Open ID", value: "open_id" },
                  { label: "User ID", value: "user_id" },
                  { label: "Email", value: "email" },
                  { label: "Chat ID", value: "chat_id" },
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
                disabled={!isEditing}
                placeholder="输入后回车添加，支持多个"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="描述"
          rules={[{ required: true, message: "请输入描述" }]}
        >
          <Input.TextArea
            disabled={!isEditing}
            rows={2}
            placeholder="请输入模板描述"
          />
        </Form.Item>

        <Divider orientation="horizontal" plain>
          {editorLabel}
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="template"
              label="普通模板"
              rules={[{ required: true, message: "普通模板内容不能为空" }]}
            >
              <CodeEditor
                token={token}
                language={editorLang}
                height="450px"
                readOnly={!isEditing}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="aggregationTemplate" label="聚合模板">
              <CodeEditor
                token={token}
                language={editorLang}
                height="450px"
                readOnly={!isEditing}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AlertTemplateModal;
