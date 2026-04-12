import { useMount, useRequest, useUnmount } from "ahooks";
import { Button, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { UserDelete, UserList, UserUpdateByAdmin } from "@/services/user";
import CreateUserModal from "@/components/user/CreateUserModal";
import useApp from "antd/es/app/useApp";
import DynamicTable from "@/components/base/DynamicTable";
import { userListRequest, UserListResponseItem } from "@/types/user/user";
import { useParams } from "@/hooks/useParams";
import { GetUserColumn } from "@/types/user/user.tsx";
import EditUserComponent from "@/components/user/EditUser";
import { SyncOutlined } from "@ant-design/icons";
const { Search } = Input;
const UserPage = () => {
  const { modal, message } = useApp();
  const { getParam, setParams, replaceParams, clearParams } = useParams();
  const page = getParam("page") || "1";
  const pageSize = getParam("pageSize") || "10";
  const name = getParam("name");
  const email = getParam("email");
  const mobile = getParam("mobile");
  const department = getParam("department");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userStatus, setUserStatus] = useState<number>(0);
  const [searchObject, setSearchObject] = useState({
    key: "name",
    value: name,
  });

  const runList = () => {
    const params: userListRequest = {
      page: page,
      pageSize: pageSize,
      status: userStatus,
    };

    setSearchObject((prev) => {
      if (prev.value !== null) {
        switch (prev.key) {
          case "name":
            params.name = prev.value || "";
            break;
          case "email":
            params.email = prev.value || "";
            break;
          case "mobile":
            params.mobile = prev.value || "";
            break;
          case "department":
            params.department = prev.value || "";
            break;
          default:
            break;
        }
      }
      run(params);
      return prev;
    });
  };

  // 数据请求（自动依赖分页参数）
  const {
    data,
    loading,
    refresh: refreshUserList,
    run,
  } = useRequest(UserList, {
    manual: true,
  });

  const { run: delUserRun, loading: delUserLoad } = useRequest(UserDelete, {
    manual: true,
    onSuccess: () => {
      refreshUserList();
    },
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const editUserOpen = (id: string) => {
    setIsEditOpen(true);
    setEditId(id);
  };
  const cancelEditUser = () => {
    setIsEditOpen(false);
    setEditId("");
  };

  const handleSearch = () => {
    if (searchObject.value === null) {
      return;
    }
    replaceParams({
      page: page,
      pageSize: pageSize,
      [searchObject.key]: searchObject.value,
    });
    runList();
  };

  const handleClear = () => {
    setSearchObject((prev) => {
      return {
        ...prev,
        value: "",
      };
    });
    replaceParams({
      page: page,
      pageSize: pageSize,
    });
    run({
      page: page,
      pageSize: pageSize,
    });
  };

  const { run: updateUserRun, loading: updateUserLoad } = useRequest(
    UserUpdateByAdmin,
    {
      manual: true,
      onSuccess: () => {
        message.success("更新成功");
        refreshUserList();
      },
    },
  );

  const handlePageChange = (page: number, pageSize: number) => {
    setParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
  };

  const [restUserPWDState, setRestUserPWDState] = useState({
    open: false,
    id: "",
    password: "",
    name: "",
  });

  useMount(() => {
    setParams({ page: page, pageSize: pageSize });
  });

  useUnmount(() => {
    clearParams();
  });

  useEffect(() => {
    if (email) {
      setSearchObject({ key: "email", value: email });
    } else if (mobile) {
      setSearchObject({ key: "mobile", value: mobile });
    } else if (department) {
      setSearchObject({ key: "department", value: department });
    } else if (name) {
      setSearchObject({ key: "name", value: name || "" });
    }
  }, [email, mobile, department, name]);

  useEffect(() => {
    runList();
  }, [page, pageSize, userStatus]);

  return (
    <div className="px-4">
      <div className="flex p-2 justify-between">
        <div className="flex gap-4">
          <Select
            value={userStatus}
            onChange={(val) => setUserStatus(val)}
            onSelect={(val) => setUserStatus(val)}
            placeholder="用户状态"
          >
            <Select.Option value={0}>全部状态</Select.Option>
            <Select.Option value={1}>正常状态</Select.Option>
            <Select.Option value={2}>禁用状态</Select.Option>
          </Select>
          <Search
            placeholder="按姓名 邮箱 部门前缀搜索"
            style={{ minWidth: "400px", maxWidth: "600px" }}
            value={searchObject.value || ""}
            onChange={(e) => {
              setSearchObject((prev) => {
                return {
                  ...prev,
                  value: e.target.value,
                };
              });
            }}
            onSearch={handleSearch}
            onClear={handleClear}
            allowClear
            addonBefore={
              <Select
                value={searchObject.key}
                onChange={(val) => {
                  setSearchObject((prev) => {
                    return {
                      ...prev,
                      key: val,
                    };
                  });
                }}
                style={{ width: 100 }}
              >
                <Select.Option value="name">名称</Select.Option>
                <Select.Option value="email">邮箱</Select.Option>
                <Select.Option value="department">部门</Select.Option>
              </Select>
            }
          />
          <Button type="primary" onClick={() => setCreateModalOpen(true)}>
            创建用户
          </Button>
        </div>

        <div className="pr-3">
          <Button icon={<SyncOutlined />} onClick={() => refreshUserList()} />
        </div>
      </div>

      <DynamicTable<UserListResponseItem>
        extraHeight={80}
        loading={loading}
        columns={GetUserColumn({
          message,
          updateUserLoad,
          updateUserRun,
          delUserLoad,
          delUserRun,
          editUserOpen,
          modal,
          setRestUserPWDState,
        })}
        dataSource={data?.list || []}
        locale={{
          emptyText: "暂无数据",
          triggerAsc: "点击升序",
          triggerDesc: "点击降序",
          cancelSort: "取消排序",
        }}
        pagination={{
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} 条，共 ${total} 条数据`,
          current: Number(page) || 1,
          pageSize: Number(pageSize) || 10,
          total: data?.total || 0,
          showSizeChanger: true,
          onChange: handlePageChange,
          locale: {
            items_per_page: "条/页",
            jump_to: "跳至",
            page: "页",
          },
        }}
        bordered
      />

      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        refresh={refreshUserList}
      />
      <EditUserComponent
        callback={refreshUserList}
        open={isEditOpen}
        onCancel={cancelEditUser}
        id={editId}
        modal={modal}
        message={message}
      />
      <Modal
        title={`重置 ${restUserPWDState.name} 的密码`}
        open={restUserPWDState.open}
        styles={{
          body: {
            padding: "20px 10px 20px 10px",
          },
        }}
        closable={false}
        okText="重置"
        cancelText="取消"
        onCancel={() =>
          setRestUserPWDState({ open: false, id: "", password: "", name: "" })
        }
        onOk={() => {
          updateUserRun({
            id: restUserPWDState.id,
            password: restUserPWDState.password,
          });
          setRestUserPWDState({ open: false, id: "", password: "", name: "" });
        }}
      >
        <Input.Password
          value={restUserPWDState.password}
          size="large"
          onChange={(e) =>
            setRestUserPWDState((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
        />
      </Modal>
    </div>
  );
};

export default UserPage;
