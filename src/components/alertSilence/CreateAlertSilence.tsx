import React, { useMemo } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Space,
  Card,
  Row,
  Col,
  Segmented,
  Typography,
  Divider,
  theme,
  App,
} from "antd";
import Icon, {
  PlusOutlined,
  DeleteOutlined,
  TagOutlined,
  AuditOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import ModalComponent from "../base/Modal"; // 请确保路径正确
import type { GetProps } from "antd";
import { CreateAlertSlienceReq } from "@/types/alert/silence";

// --- 类型定义 ---
interface InternalFormValues extends Omit<
  CreateAlertSlienceReq,
  "startsAt" | "endsAt"
> {
  timeRange: [Dayjs, Dayjs];
}

export interface AlertSilenceCreatorProps {
  open: boolean;
  handleCancel: () => void;
  handleOk: (value: CreateAlertSlienceReq) => void;
  loading: boolean;
}

type CustomIconProps = GetProps<typeof Icon>;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// --- 自定义图标 ---
const FingerprintSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 1024 1024"
    width="1em"
    height="1em"
    fill="currentColor"
    {...props}
  >
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z m-136.2-468.8c0-75.2 61-136.2 136.2-136.2s136.2 61 136.2 136.2v110.4c0 11.6-9.4 21-21 21s-21-9.4-21-21V347.2c0-52-42.3-94.2-94.2-94.2s-94.2 42.3-94.2 94.2v400.1c0 11.6-9.4 21-21 21s-21-9.4-21-21V415.2z m272.4 0v110.4c0 75.2-61 136.2-136.2 136.2s-136.2-61-136.2-136.2V347.2c0-11.6 9.4-21 21-21s21 9.4 21 21v68c0 52 42.3 94.2 94.2 94.2s94.2-42.3 94.2-94.2V347.2c0-11.6 9.4-21 21-21s21 9.4 21 21v68z" />
  </svg>
);
const FingerprintIcon = (props: CustomIconProps) => (
  <Icon component={FingerprintSvg} {...props} />
);

// --- 主组件 ---
const AlertSilenceCreator: React.FC<AlertSilenceCreatorProps> = ({
  open,
  handleCancel,
  handleOk,
  loading,
}) => {
  const { modal } = App.useApp();
  const { token } = theme.useToken();
  const [form] = Form.useForm<InternalFormValues>();

  // 监听表单变化
  const formValues = Form.useWatch([], form);
  const silenceType = Form.useWatch("type", form) || 2;

  // 格式化预览 JSON
  const generatedJson = useMemo((): CreateAlertSlienceReq | null => {
    if (!formValues?.timeRange) return null;
    const [start, end] = formValues.timeRange;

    const base = {
      status: 1,
      type: silenceType,
      startsAt: start ? start.unix() : 0,
      endsAt: end ? end.unix() : 0,
      comment: formValues.comment || "",
    };

    return silenceType === 2
      ? { ...base, matchers: formValues.matchers || [] }
      : { ...base, fingerprint: formValues.fingerprint || "" };
  }, [formValues, silenceType]);

  const onCancel = () => {
    form.resetFields();
    handleCancel();
  };

  // 创建逻辑（包含校验和二次确认）
  const onCreate = async () => {
    try {
      // 1. 表单校验
      await form.validateFields();
      if (!generatedJson) return;

      // 2. 二次确认
      const confirmRef = modal.confirm({
        centered: true,
        title: "确认创建静默规则？",
        icon: <ExclamationCircleFilled />,
        // content: silenceType === 2 ? "..." : "...",
        okText: "确认创建",
        cancelText: "取消",
        onOk: async () => {
          try {
            await handleOk(generatedJson);
            onCancel();
          } catch (error) {
            confirmRef.destroy();
            throw error;
          }
        },
      });
    } catch (error) {
      console.error("Validate failed:", error);
    }
  };

  return (
    <ModalComponent
      open={open}
      // centered
      handleCancel={onCancel}
      width="1000px"
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={onCreate}
        >
          立即创建
        </Button>,
      ]}
      confirmLoading={loading}
    >
      <Card
        variant="borderless"
        title={
          <Title level={4} style={{ margin: 0 }}>
            静默规则配置
          </Title>
        }
      >
        <Form<InternalFormValues>
          form={form}
          layout="vertical"
          initialValues={{
            type: 2,
            comment: "",
            matchers: [{ name: "namespace", type: "=", value: "system" }],
            timeRange: [dayjs(), dayjs().add(1, "hour")],
          }}
        >
          <Form.Item name="type" label="静默维度">
            <Segmented
              block
              size="large"
              options={[
                {
                  label: "标签匹配 (Label)",
                  value: 2,
                  icon: <TagOutlined />,
                },
                {
                  label: "指纹匹配 (Fingerprint)",
                  value: 1,
                  icon: <FingerprintIcon />,
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label="静默备注"
            rules={[{ required: true, message: "请填写备注" }]}
          >
            <Input.TextArea
              placeholder="例：数据库维护期间屏蔽相关告警"
              autoSize={{ minRows: 2 }}
            />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="生效时段"
            rules={[{ required: true, message: "请选择时间范围" }]}
          >
            <RangePicker showTime style={{ width: "100%" }} size="large" />
          </Form.Item>

          <Divider />

          {silenceType === 2 ? (
            <div
              style={{
                background: token.colorFillAlter,
                padding: "20px",
                borderRadius: token.borderRadiusLG,
              }}
            >
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Space size="small">
                  <TagOutlined />
                  <Text strong>匹配规则 (Matchers)</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  支持正则匹配 =~
                </Text>
              </div>

              <Form.List name="matchers">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row
                        key={key}
                        gutter={12}
                        align="middle"
                        style={{ marginBottom: 12 }}
                      >
                        {/* 标签名 - 占 8/24 */}
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "name"]}
                            rules={[{ required: true, message: "必填" }]}
                            style={{ marginBottom: 0 }} // 去除 Item 默认底边距，由 Row 统一控制
                          >
                            <Input placeholder="标签名 (Key)" />
                          </Form.Item>
                        </Col>

                        {/* 操作符 - 占 4/24 */}
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "type"]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              options={["=", "=~", "!=", "!~"].map((op) => ({
                                label: op,
                                value: op,
                              }))}
                            />
                          </Form.Item>
                        </Col>

                        {/* 标签值 - 占 10/24 */}
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, "value"]}
                            rules={[{ required: true, message: "必填" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="标签值 (Value)" />
                          </Form.Item>
                        </Col>

                        {/* 删除按钮 - 占 2/24 */}
                        <Col span={2} style={{ textAlign: "right" }}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Col>
                      </Row>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() => add({ name: "", type: "=", value: "" })}
                      block
                      icon={<PlusOutlined />}
                      style={{ marginTop: 8 }}
                    >
                      添加匹配项
                    </Button>
                  </>
                )}
              </Form.List>
            </div>
          ) : (
            <Card
              size="small"
              styles={{ body: { background: token.colorFillAlter } }}
            >
              <Form.Item
                name="fingerprint"
                label="告警指纹 (Fingerprint)"
                rules={[
                  { required: true, message: "请输入指纹" },
                  {
                    pattern: /^[a-f0-9]{16}$/,
                    message: "请输入16位十六进制指纹",
                  },
                ]}
              >
                <Input
                  prefix={<AuditOutlined />}
                  placeholder="例如: 060c3ec7f26a12a2"
                />
              </Form.Item>
            </Card>
          )}
        </Form>
      </Card>
    </ModalComponent>
  );
};

export default AlertSilenceCreator;
