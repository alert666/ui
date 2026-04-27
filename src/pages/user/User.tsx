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
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

// 业务组件与类型
import DynamicTable from "@/components/base/DynamicTable";
import CreateUserModal from "@/components/user/CreateUserModal";
import EditUserComponent from "@/components/user/EditUser";
import { UserDelete, UserList, UserUpdateByAdmin } from "@/services/user";
import { GetUserColumn } from "@/types/user/user.tsx";
import { userListRequest, UserListResponseItem } from "@/types/user/user";
import { PageOptionEnum } from "@/types/enum";

const { Text } = Typography;

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

  // 1. 核心数据同步逻辑
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    // 补全默认分页参数
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

    // 只有当 Form 没被触摸（没有脏数据）时，或者 URL 变化时才同步 Form
    // 这样可以避免在输入时被 URL 强制覆盖
    const activeDim = USER_SEARCH_DIMENSIONS.find((d) =>
      searchParams.has(d.value),
    );
    const activeKey = activeDim?.value || "name";

    searchForm.setFieldsValue({
      status: params.status,
      searchKey: activeKey,
      searchValue: searchParams.get(activeKey) || "",
    });
  }, [searchParams, searchForm]);

  // 2. 优化后的搜索处理
  const onHandleSearch = useCallback(
    (values: any) => {
      const { status, searchKey, searchValue } = values;
      const newParams = new URLSearchParams(searchParams); // 继承当前所有参数（含 pageSize）

      newParams.set("page", "1"); // 搜索永远重置到第一页
      newParams.set("status", status?.toString() || "0");

      // 清除所有旧的搜索维度，避免 name=1&email=2 的冲突
      USER_SEARCH_DIMENSIONS.forEach((d) => newParams.delete(d.value));

      if (searchValue) {
        newParams.set(searchKey, searchValue);
      }

      setSearchParams(newParams);
      // 这里不需要 resetFields，因为上面的 useEffect 会负责同步。
      // 如果你点击搜索后想让输入框变空，逻辑上是不合理的，因为用户需要看到当前的过滤条件。
    },
    [searchParams, setSearchParams],
  );

  // 3. 重置逻辑
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({
      page: "1",
      pageSize: searchParams.get("pageSize") || "10",
      status: "0",
    });
  };

  const handlePageChange = (p: number, s: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p.toString());
    params.set("pageSize", s.toString());
    setSearchParams(params);
  };

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
  }, [searchParams, setSearchParams]);

  return (
    <div className="p-4">
      <div
        className="mb-4 p-4"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div className="flex justify-between items-start">
          {/* 使用 onFinish 处理搜索，避免手动操作状态引起的冲突 */}
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
                />
              </Form.Item>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => searchForm.submit()}
              />
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
          message,
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
          showTotal: (t) => `共 ${t} 条数据`,
        }}
        bordered
      />

      {/* 弹窗部分保持不变 */}
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
            placeholder="新密码"
            value={restUserPWDState.password}
            onChange={(e) =>
              setRestUserPWDState((p) => ({ ...p, password: e.target.value }))
            }
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserPage;
