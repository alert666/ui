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
  Space,
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
                <Form.Item label="头像" required>
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item
                      name="avatar"
                      noStyle
                      rules={[{ required: true, message: "请输入头像地址" }]}
                    >
                      <Input placeholder="输入头像 URL" allowClear />
                    </Form.Item>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => {
                        const avatarUrl = form.getFieldValue("avatar");
                        modal.info({
                          icon: null, // 💡 关键：移除左侧默认的 Info 图标，否则内容会偏右
                          centered: true,
                          okText: "关闭",
                          maskClosable: true,
                          content: (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column", // 垂直排列
                                alignItems: "center", // 水平居中
                                justifyContent: "center",
                                padding: "20px 0 10px 0",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: 600,
                                  marginBottom: "20px",
                                }}
                              >
                                头像预览
                              </div>
                              <Image
                                width={200}
                                height={200}
                                src={avatarUrl}
                                fallback="https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"
                                style={{
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "4px solid #f0f2f5",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                                preview={false}
                              />
                              {!avatarUrl && (
                                <div
                                  style={{ marginTop: 10, color: "#ff4d4f" }}
                                >
                                  暂无图片地址
                                </div>
                              )}
                            </div>
                          ),
                        });
                      }}
                      title="预览"
                    />
                  </Space.Compact>
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
