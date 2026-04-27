import { UpdateApi } from "@/services/api";
import type { Api } from "@/types/api/api";
import { useRequest } from "ahooks";
import {
  App,
  Form,
  Input,
  Descriptions,
  Tag,
  Divider,
  type InputRef,
} from "antd";
import { useEffect, useRef } from "react";
import ModalComponent from "../base/Modal";

interface UpdatePolicyComponentProps {
  open: boolean;
  onCancel: () => void;
  refresh: () => void;
  data: Api;
}

// 辅助函数：Method 颜色
const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: "green",
    POST: "blue",
    PUT: "orange",
    DELETE: "red",
  };
  return colors[method?.toUpperCase()] || "default";
};

// 辅助函数：Effect 颜色
const getEffectTag = (effect: string) => {
  if (effect?.toLowerCase() === "allow")
    return <Tag color="success">Allow</Tag>;
  if (effect?.toLowerCase() === "deny") return <Tag color="error">Deny</Tag>;
  return <Tag>{effect || "N/A"}</Tag>;
};

const UpdatePolicyComponent = ({
  open,
  onCancel,
  refresh,
  data,
}: UpdatePolicyComponentProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  // 修复 ESLint: 明确指定 InputRef 类型，避免使用 any
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        description: data.description,
      });
    }
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, [data, open, form]);

  const { run: upRun, loading: upLoad } = useRequest(UpdateApi, {
    manual: true,
    onSuccess: () => {
      message.success("修改成功");
      refresh();
      onCancel();
    },
  });

  const handleOk = () => {
    form.validateFields().then((values) => {
      upRun(data.id, { description: values.description });
    });
  };

  return (
    <ModalComponent
      title="修改 API 描述"
      open={open}
      handleOk={handleOk}
      handleCancel={onCancel}
      confirmLoading={upLoad}
      destroyOnHidden
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <Descriptions
          column={2}
          bordered
          size="small"
          styles={{
            label: { width: "90px", color: "#666" },
          }}
        >
          <Descriptions.Item label="API 名称" span={2}>
            <span style={{ fontWeight: 600 }}>{data.name}</span>
          </Descriptions.Item>
          <Descriptions.Item label="方法">
            <Tag color={getMethodColor(data.method)}>{data.method}</Tag>
          </Descriptions.Item>
          {/* 新增 effect 字段反显 */}
          <Descriptions.Item label="策略影响">
            {getEffectTag(data.effect as string)}
          </Descriptions.Item>
          <Descriptions.Item label="请求路径" span={2}>
            <code style={{ fontSize: "12px", wordBreak: "break-all" }}>
              {data.path}
            </code>
          </Descriptions.Item>
        </Descriptions>
      </div>

      <Divider
        orientation="horizontal"
        plain
        style={{ fontSize: "12px", color: "#999" }}
      >
        编辑信息
      </Divider>

      <Form preserve={false} form={form} layout="vertical">
        <Form.Item
          name="description"
          label="功能描述"
          rules={[
            { required: true, message: "请输入描述内容" },
            { max: 200, message: "描述最多 200 字" },
          ]}
        >
          <Input.TextArea
            ref={inputRef}
            rows={4}
            placeholder="请简要说明该 API 的用途..."
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </ModalComponent>
  );
};

export default UpdatePolicyComponent;
