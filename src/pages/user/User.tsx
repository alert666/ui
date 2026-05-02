import { PlusOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  theme,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

// 业务组件与类型
import DynamicTable from "@/components/base/DynamicTable";
import CreateUserModal from "@/components/user/CreateUserModal";
import EditUserComponent from "@/components/user/EditUser";
import { UserDelete, UserList, UserUpdateByAdmin } from "@/services/user";
import { GetUserColumn } from "@/types/user/user.tsx";
import { userListRequest, UserListResponseItem } from "@/types/user/user";
import { PageOptionEnum } from "@/types/enum";
// 1. 定义表单值的接口
interface SearchFormValues {
  status: number;
  searchKey: string;
  searchValue: string;
}

const USER_SEARCH_DIMENSIONS = [
  { label: "名称", value: "name" },
  { label: "邮箱", value: "email" },
  { label: "手机号", value: "mobile" },
  { label: "部门", value: "department" },
];

const UserPage = () => {
  const { modal, message } = App.useApp();
  const { token } = theme.useToken();
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [restUserPWDState, setRestUserPWDState] = useState({
    open: false,
    id: "",
    password: "",
    name: "",
  });

  const userListReq = useRequest(UserList, { manual: true });

  const delUserReq = useRequest(UserDelete, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      userListReq.refresh();
    },
  });

  const updateUserReq = useRequest(UserUpdateByAdmin, {
    manual: true,
    onSuccess: () => {
      message.success("操作成功");
      userListReq.refresh();
      setRestUserPWDState((prev) => ({ ...prev, open: false, password: "" }));
    },
  });

  // 1. 核心逻辑：只负责请求数据，不再回填 Form 里的 searchValue
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    if (!page || !pageSize) {
      const newParams = new URLSearchParams(searchParams);
      if (!page) newParams.set("page", PageOptionEnum.DEFAULTPAGE.toString());
      if (!pageSize)
        newParams.set("pageSize", PageOptionEnum.DEFAULTPAGESIZE.toString());
      setSearchParams(newParams, { replace: true });
      return;
    }

    const params: userListRequest = {
      page,
      pageSize,
      status: Number(searchParams.get("status")) || 0,
      name: searchParams.get("name") || undefined,
      email: searchParams.get("email") || undefined,
      mobile: searchParams.get("mobile") || undefined,
      department: searchParams.get("department") || undefined,
    };

    userListReq.run(params);

    // 注意：这里删除了 searchForm.setFieldsValue 逻辑
    // 这样 Form 就不会在 URL 变化时被强制回填
  }, [searchParams]);

  // 2. 搜索提交：更新 URL 后立即清空 Form
  const onHandleSearch = (values: SearchFormValues) => {
    const { status, searchKey, searchValue } = values;
    if (!searchValue) {
      return;
    }
    const newParams = new URLSearchParams(searchParams);

    newParams.set("page", "1");
    newParams.set("status", status?.toString() || "0");

    // 清除旧维度
    USER_SEARCH_DIMENSIONS.forEach((d) => newParams.delete(d.value));

    if (searchValue) {
      newParams.set(searchKey, searchValue);
    }

    setSearchParams(newParams);

    // ✨ 关键优化：只清空输入框内容，保留搜索维度和状态的配置
    searchForm.setFieldsValue({ searchValue: "" });
  };

  // 3. 重置逻辑
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({
      page: "1",
      pageSize: searchParams.get("pageSize") || "10",
      status: "0",
    });
  };

  // 4. 分页处理
  const handlePageChange = (p: number, s: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p.toString());
    params.set("pageSize", s.toString());
    setSearchParams(params);
  };

  // 5. 筛选标签（这是唯一展示当前搜索条件的地方）
  const renderFilterTags = useMemo(() => {
    const tags: React.ReactNode[] = [];
    const status = searchParams.get("status");
    if (status && status !== "0") {
      tags.push(
        <Tag
          key="status"
          color="orange"
          closable
          onClose={() => {
            const p = new URLSearchParams(searchParams);
            p.delete("status");
            setSearchParams(p);
          }}
        >
          状态: {status === "1" ? "正常" : "禁用"}
        </Tag>,
      );
    }

    USER_SEARCH_DIMENSIONS.forEach((dim) => {
      const val = searchParams.get(dim.value);
      if (val) {
        tags.push(
          <Tag
            key={dim.value}
            color="blue"
            closable
            onClose={() => {
              const p = new URLSearchParams(searchParams);
              p.delete(dim.value);
              setSearchParams(p);
            }}
          >
            {dim.label}: {val}
          </Tag>,
        );
      }
    });
    return tags;
  }, [searchParams]);

  return (
    <div className="p-4">
      <div
        className="mb-4 p-4"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)", // 加入微阴影，对齐 RolePage
        }}
      >
        <div className="flex justify-between items-start">
          <Form
            form={searchForm}
            onFinish={onHandleSearch}
            layout="inline"
            initialValues={{ status: 0, searchKey: "name" }}
          >
            <Space.Compact>
              <Form.Item name="status" noStyle>
                <Select style={{ width: 110 }}>
                  <Select.Option value={0}>全部状态</Select.Option>
                  <Select.Option value={1}>正常</Select.Option>
                  <Select.Option value={2}>禁用</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="searchKey" noStyle>
                <Select style={{ width: 90 }}>
                  {USER_SEARCH_DIMENSIONS.map((d) => (
                    <Select.Option key={d.value} value={d.value}>
                      {d.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="searchValue" noStyle>
                <Input
                  placeholder="关键字搜索..."
                  style={{ width: 220 }}
                  allowClear
                  onPressEnter={() => searchForm.submit()}
                  prefix={<SearchOutlined />}
                />
              </Form.Item>
              <Button type="primary" onClick={() => searchForm.submit()}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button
                type="text"
                icon={<SyncOutlined spin={userListReq.loading} />}
                onClick={() => userListReq.refresh()}
              />
            </Space.Compact>
          </Form>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            创建用户
          </Button>
        </div>

        {renderFilterTags.length > 0 && (
          <div
            className="mt-3 pt-3 border-t border-dashed"
            style={{ borderColor: token.colorBorderSecondary }}
          >
            <Space wrap>{renderFilterTags}</Space>
          </div>
        )}
      </div>

      <DynamicTable<UserListResponseItem>
        loading={userListReq.loading}
        columns={GetUserColumn({
          updateUserLoad: updateUserReq.loading,
          updateUserRun: updateUserReq.run,
          delUserLoad: delUserReq.loading,
          delUserRun: delUserReq.run,
          editUserOpen: (id) => {
            setEditId(id);
            setIsEditOpen(true);
          },
          modal,
          setRestUserPWDState,
        })}
        dataSource={userListReq.data?.list || []}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 10,
          total: userListReq.data?.total || 0,
          onChange: handlePageChange,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条数据`,
        }}
        bordered
      />

      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        refresh={userListReq.refresh}
      />
      <EditUserComponent
        callback={userListReq.refresh}
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setEditId("");
        }}
        id={editId}
        modal={modal}
        message={message}
      />

      <Modal
        title={`重置密码: ${restUserPWDState.name}`}
        open={restUserPWDState.open}
        confirmLoading={updateUserReq.loading}
        onCancel={() =>
          setRestUserPWDState((prev) => ({ ...prev, open: false }))
        }
        destroyOnHidden
        onOk={() => {
          if (!restUserPWDState.password)
            return message.warning("请输入新密码");
          updateUserReq.run({
            id: restUserPWDState.id,
            password: restUserPWDState.password,
          });
        }}
      >
        <div className="py-4">
          <Typography.Text type="secondary" className="mb-2 block">
            请输入该用户的新登录密码：
          </Typography.Text>
          <Input.Password
            autoFocus
            autoComplete="new-password"
            placeholder="新密码"
            value={restUserPWDState.password}
            onChange={(e) =>
              setRestUserPWDState((p) => ({ ...p, password: e.target.value }))
            }
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserPage;
