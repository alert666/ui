import { Button, Col, Drawer, Form, Input, Popconfirm, Row, Tag } from "antd";
import { useEffect, useState } from "react";
import { useRequest } from "ahooks";
import { QueryRole, UpdateRole } from "@/services/role";
import TransferComponent from "../base/Transfer";
import { MessageInstance } from "antd/es/message/interface";
import { GetApiList } from "@/services/api";
import { ApiColumns } from "@/types/api/api.tsx";
interface RoleEditComponentProps {
  id: string;
  open: boolean;
  message: MessageInstance;
  handleCancel: () => void;
  refreshRoleList: () => void;
}

const RoleEditComponent = ({
  id,
  message,
  open,
  refreshRoleList,
  handleCancel,
}: RoleEditComponentProps) => {
  const [form] = Form.useForm();
  const { run: queryRoleRun, loading: queryRoleloading } = useRequest(
    QueryRole,
    {
      manual: true,
      onSuccess: (data) => {
        form.setFieldsValue(data);
        setTargetKeys(data?.apis?.map((api) => api.id) || []);
      },
    },
  );

  useEffect(() => {
    if (open && id) {
      queryRoleRun(id);
      policyRun({ page: 0, pageSize: 0 });
    }
  }, [id, open]);

  const { run: policyRun, data: apiData } = useRequest(GetApiList, {
    manual: true,
  });

  const { run: updateRoleRun, loading: updateRoleLoad } = useRequest(
    UpdateRole,
    {
      manual: true,
      onSuccess: () => {
        message.success("修改成功");
        refreshRoleList();
        setConfirmLoading(false);
      },
    },
  );

  const [targetKeys, setTargetKeys] = useState<React.Key[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const drawerClose = () => {
    handleCancel();
    form.resetFields();
    setConfirmLoading(false);
  };

  const drawerOK = () => {
    form.validateFields().then((values) => {
      updateRoleRun(values.id, {
        description: values.description,
        apis: targetKeys.map((id) => Number(id)),
      });
    });
  };

  const getDrawerFooter = () => {
    return (
      <div className="flex justify-end gap-6 p-3">
        <Popconfirm
          title="再次确认"
          description="确认保存角色信息？"
          open={confirmLoading}
          cancelText="取消"
          onCancel={() => {
            setConfirmLoading(false);
          }}
          okText="确认"
          onConfirm={drawerOK}
          okButtonProps={{ loading: updateRoleLoad }}
        >
          <Button type="primary" onClick={() => setConfirmLoading(true)}>
            保存
          </Button>
        </Popconfirm>

        <Button onClick={drawerClose}>取消</Button>
      </div>
    );
  };
  return (
    <>
      <Drawer
        destroyOnHidden
        size="80%"
        loading={queryRoleloading}
        title="编辑角色信息"
        onClose={drawerClose}
        open={open}
        footer={getDrawerFooter()}
      >
        <div className="flex flex-col gap-4">
          <span className="text-lg font-bold">角色基础信息</span>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="角色ID"
                  rules={[{ required: true, message: "请输入角色描述" }]}
                  name="id"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="创建时间"
                  rules={[{ required: true, message: "请输入角色描述" }]}
                  name="createdAt"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="角色名称"
                  rules={[{ required: true, message: "请输入角色描述" }]}
                  name="name"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  required
                  rules={[{ required: true, message: "请输入角色描述" }]}
                  label="角色描述"
                  name="description"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-lg font-bold">用户角色信息</span>
          <TransferComponent
            extraHeight={530}
            targetKeys={targetKeys}
            setTargetKeys={setTargetKeys}
            titles={[
              <Tag color="blue">未关联API</Tag>,
              <Tag color="green">已关联API</Tag>,
            ]}
            filterOption={(input, item) => item.name.includes(input)}
            dataSource={(apiData?.list || []).map((item) => ({
              ...item,
              key: item.id,
            }))}
            columns={ApiColumns()}
          />
        </div>
      </Drawer>
    </>
  );
};
export default RoleEditComponent;
