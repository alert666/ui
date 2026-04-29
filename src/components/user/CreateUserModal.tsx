import { UserRegistry } from "@/services/user";
import { useRequest } from "ahooks";
import { App, Col, Form, Input, Row, Tag } from "antd";
import ModalComponent from "../base/Modal";
import TransferComponent from "../base/Transfer";
import { ListRole } from "@/services/role";
import { Rolecolumns } from "@/types/user/user.tsx";
import { useEffect, useState } from "react";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
}
const CreateUserModal = ({ open, onClose, refresh }: CreateUserModalProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { run, loading } = useRequest(UserRegistry, {
    manual: true,
    debounceWait: 300,
    onSuccess: () => {
      message.success("创建成功");
      handleCancel();
      refresh();
    },
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    const req = {
      ...values,
      rolesID: targetKeys.map((id) => Number(id)),
    };
    console.log("req", req);
    run(req);
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const { run: roleListRun, data: roleListData } = useRequest(ListRole, {
    manual: true,
    defaultParams: [{ page: 0, pageSize: 0 }],
  });

  const [targetKeys, setTargetKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (open === true) {
      roleListRun({ page: 0, pageSize: 0 });
    }
  }, [open, roleListRun]);
  return (
    <ModalComponent
      title="创建用户"
      className="min-w-2/3"
      open={open}
      handleCancel={handleCancel}
      handleOk={handleOk}
      confirmLoading={loading}
      closable={false}
    >
      <div>
        <div className="font-bold text-12 mb-4">基础信息</div>
        <Form form={form} size="middle">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="名称"
                rules={[
                  { required: true, min: 2, max: 20, message: "请输入名称" },
                  {
                    pattern: /^[A-Za-z0-9-_]+$/,
                    message: "名称必须只包含字母、数字、下划线和连字符",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: "请输入邮箱" },
                  { type: "email", message: "请输入有效的邮箱地址" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  {
                    required: true,
                    min: 8,
                    max: 20,
                    message: "密码长度在 8-20 个字符",
                  },
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nickName"
                label="昵称"
                rules={[{ min: 2, max: 20, message: "昵称长度在 2-20 个字符" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mobile"
                label="手机号"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="avatar" label="头像">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <div>
        <div className="font-bold text-12 mb-4">角色信息</div>
        <TransferComponent
          extraHeight={530}
          titles={[
            <Tag color="blue">未关联角色</Tag>,
            <Tag color="green">已关联角色</Tag>,
          ]}
          dataSource={(roleListData?.list || []).map((item) => ({
            ...item,
            key: item.id,
          }))}
          filterOption={(input, item) => item.name.includes(input)}
          columns={Rolecolumns()}
          targetKeys={targetKeys}
          setTargetKeys={setTargetKeys}
        />
      </div>
    </ModalComponent>
  );
};

export default CreateUserModal;
