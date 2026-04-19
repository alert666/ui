import { userQuery, UserUpdateByAdmin } from "@/services/user";
import { EyeOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import {
  Button,
  Col,
  Drawer,
  Form,
  Image,
  Input,
  Popconfirm,
  Row,
  Tag,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { HookAPI } from "antd/es/modal/useModal";
import { useEffect, useState } from "react";
import { ListRole } from "@/services/role";
import TransferComponent from "../base/Transfer";
import { Rolecolumns } from "@/types/user/user.tsx";
interface EditUserProps {
  callback: () => void;
  modal: HookAPI;
  message: MessageInstance;
  open: boolean;
  id: string;
  onCancel: () => void;
  onOk?: () => void;
}

export default function EditUserComponent(props: EditUserProps) {
  const { modal, message, open, id, onCancel, callback } = props;
  const [form] = Form.useForm();
  const { run: updateUserRun, loading: updateUserLoad } = useRequest(
    UserUpdateByAdmin,
    {
      manual: true,
      onSuccess: () => {
        message.success("更新成功");
        setConfirmLoading(false);
        callback();
      },
    },
  );

  const { run: roleListRun, data: roleListData } = useRequest(ListRole, {
    manual: true,
    defaultParams: [{ page: 0, pageSize: 0 }],
    onSuccess: () => {
      userQueryRun(id);
    },
  });

  const { loading: userLoad, run: userQueryRun } = useRequest(userQuery, {
    manual: true,
    onSuccess: (data) => {
      if (data) {
        if (data.roles) {
          const roleNames = data.roles.map((role) => role.name);
          form.setFieldsValue({
            roles: roleNames,
          });
        }

        form.setFieldsValue({
          name: data.name,
          nickName: data.nickName,
          createdAt: data.createdAt,
          email: data.email,
          mobile: data.mobile,
          avatar: data.avatar,
        });
      }
      setTargetKeys(data?.roles?.map((role) => role.id) || []);
    },
  });

  useEffect(() => {
    if (open && id) {
      roleListRun({ page: 0, pageSize: 0 });
    }
  }, [open, id, roleListRun]);

  const [targetKeys, setTargetKeys] = useState<React.Key[]>([]);
  const drawerClose = () => {
    onCancel();
    form.resetFields();
    // setTargetKeys([]);
    setConfirmLoading(false);
  };
  const [confirmLoading, setConfirmLoading] = useState(false);
  const getDrawerFooter = () => {
    return (
      <div className="flex justify-end gap-6 p-3">
        <Popconfirm
          title="再次确认"
          description="确认保存用户信息？"
          open={confirmLoading}
          cancelText="取消"
          okText="确认"
          onCancel={() => {
            setConfirmLoading(false);
          }}
          onConfirm={() => {
            form.validateFields().then((values) => {
              const req = {
                id: id,
                name: values.name,
                nickName: values.nickName,
                email: values.email,
                mobile: values.mobile,
                avatar: values.avatar,
                rolesID: targetKeys.map((id) => Number(id)),
              };
              updateUserRun(req);
            });
          }}
          okButtonProps={{ loading: updateUserLoad }}
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
        size="60%"
        loading={userLoad}
        title="编辑用户信息"
        onClose={drawerClose}
        open={open}
        footer={getDrawerFooter()}
      >
        <div className="flex flex-col gap-4">
          <span className="text-lg font-bold">用户基础信息</span>
          <Form layout="vertical" form={form}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="名称"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="createdAt"
                  label="创建时间"
                  rules={[{ required: true }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nickName"
                  label="昵称"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="mobile" label="手机号">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="avatar"
                  label="头像"
                  rules={[{ required: true }]}
                >
                  <Input
                    addonAfter={
                      <EyeOutlined
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          backgroundColor: "#fff",
                        }}
                        title="预览头像"
                        onClick={() => {
                          modal.info({
                            title: "头像预览",
                            content: (
                              <Image src={form.getFieldValue("avatar")} />
                            ),
                            okText: "关闭",
                          });
                        }}
                      />
                    }
                  />
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
              <Tag color="blue">未关联角色</Tag>,
              <Tag color="green">已关联角色</Tag>,
            ]}
            filterOption={(input, item) => item.name.includes(input)}
            dataSource={(roleListData?.list || []).map((item) => ({
              ...item,
              key: item.id,
            }))}
            columns={Rolecolumns()}
          />
        </div>
      </Drawer>
    </>
  );
}
