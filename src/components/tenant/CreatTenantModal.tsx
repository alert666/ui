import { Form, Input } from "antd";
import ModalComponent from "../base/Modal";
import { useRequest } from "ahooks";
import { TenantCreate, TenantUpdate } from "@/services/tenant";
import { TenantCreateReq, TenantRecord } from "@/types/tenant";
import { useEffect } from "react";
import { MessageInstance } from "antd/es/message/interface";

export interface CreateTenantComponentProps {
  message: MessageInstance;
  tenantListRefresh: () => void;
  createTenantOpen: boolean;
  setCreateTenantOpen: React.Dispatch<React.SetStateAction<boolean>>;
  initialData?: TenantRecord | null;
  setInitialData: React.Dispatch<React.SetStateAction<TenantRecord | null>>;
}

function CreateTenantComponent(props: CreateTenantComponentProps) {
  const {
    message,
    tenantListRefresh,
    createTenantOpen,
    setCreateTenantOpen,
    initialData,
    setInitialData,
  } = props;
  const [form] = Form.useForm();

  // 是否为更新模式
  const isEdit = !!initialData;

  // 1. 创建请求
  const createReq = useRequest(TenantCreate, {
    manual: true,
    debounceWait: 100,
    onSuccess: () => {
      message.success("创建成功");
      handleSuccess();
    },
  });

  // 2. 更新请求
  const updateReq = useRequest(TenantUpdate, {
    manual: true,
    debounceWait: 100,
    onSuccess: () => {
      message.success("更新成功");
      handleSuccess();
    },
    onFinally: () => {
      setInitialData(null);
    },
  });

  // 成功后的统一处理
  const handleSuccess = () => {
    setCreateTenantOpen(false);
    form.resetFields();
    tenantListRefresh();
  };

  // 3. 监听 initialData，当打开 Modal 或切换编辑项时回显数据
  useEffect(() => {
    if (createTenantOpen) {
      if (initialData) {
        // 更新模式：填充数据
        form.setFieldsValue({
          name: initialData.name,
          description: initialData.description,
        });
      } else {
        // 创建模式：重置为空
        form.resetFields();
      }
    }
  }, [initialData, createTenantOpen, form]);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (isEdit && initialData) {
        updateReq.run(initialData.id, { description: values.description });
      } else {
        createReq.run(values);
      }
    } catch (error) {
      console.error("校验失败:", error);
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setCreateTenantOpen(false);
  };

  return (
    <ModalComponent
      title={isEdit ? "更新租户" : "创建新租户"}
      open={createTenantOpen}
      handleCancel={handleModalCancel}
      handleOk={handleModalOk}
      // 这里的 loading 状态需要合并两个请求
      confirmLoading={createReq.loading || updateReq.loading}
    >
      <Form<TenantCreateReq> form={form} layout="vertical">
        <Form.Item
          label="租户名称"
          name="name"
          tooltip={isEdit ? "租户名称创建后不可修改" : ""}
          rules={[
            { required: true, message: "请输入租户名称" },
            { min: 2, max: 20, message: "名称长度需在 2-20 个字符之间" },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
              message: "名称只能包含字母、数字、下划线和中划线",
            },
          ]}
        >
          {/* 🌟 核心逻辑：如果是更新模式，禁用名称输入框 */}
          <Input placeholder="例如：test-tenant" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
          rules={[{ max: 200, message: "描述最多不能超过 200 个字符" }]}
        >
          <Input.TextArea
            placeholder="请输入租户的详细描述信息..."
            rows={4}
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </ModalComponent>
  );
}

export default CreateTenantComponent;
