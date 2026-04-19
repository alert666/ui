import { DeleteRole, ListRole } from "@/services/role";
import { useRequest, useUnmount } from "ahooks";
import { Button, Input, Select, Space } from "antd";
import { useEffect, useState } from "react";
import { GetRolecolumns } from "@/types/role/role.tsx";
import useApp from "antd/es/app/useApp";
import RoleEditComponent from "@/components/role/RoleEdit";
import DynamicTable from "@/components/base/DynamicTable";
import { useParams } from "@/hooks/useParams";
import CreateRoleComponent from "@/components/role/CreateRole";
import { SyncOutlined } from "@ant-design/icons";
import { RoleListRequest } from "@/types/role/role";
const RolePage = () => {
  const { modal, message } = useApp();
  const { getParam, setParams, replaceParams, clearParams } = useParams();
  const page = getParam("page") || "1";
  const pageSize = getParam("pageSize") || "10";
  const name = getParam("name");
  const [searchObject, setSearchObject] = useState({
    key: "name",
    value: name,
  });

  const {
    data: roleData,
    loading: roleLoad,
    refresh: refreshRoleList,
    run,
  } = useRequest(ListRole, {
    manual: true,
  });

  const { run: delRun, loading: delLoad } = useRequest(DeleteRole, {
    manual: true,
    debounceWait: 500,
    onSuccess: () => {
      message.success("删除成功");
      refreshRoleList();
    },
  });

  const [roleId, setRoleId] = useState("");
  const [editOpen, setEditOpen] = useState<boolean>(false);

  // // 分页变化处理
  const handlePageChange = (page: number, size: number) => {
    setParams({
      page: page.toString(),
      pageSize: size.toString(),
    });
  };

  // // 搜索处理（点击搜索按钮时触发）
  const handleSearch = () => {
    if (!searchObject.value) {
      return;
    }
    setParams({
      [searchObject.key]: searchObject.value,
    });
    run({
      page: Number(page),
      pageSize: Number(pageSize),
      [searchObject.key]: searchObject.value,
    });
  };

  const handleClear = () => {
    setSearchObject({
      key: "name",
      value: "",
    });
    replaceParams({
      page: page,
      pageSize: pageSize,
      tenant: getParam("tenant") || localStorage.getItem("tanant") || "default",
    });
    run({
      page: Number(page),
      pageSize: Number(pageSize),
    });
  };

  const [createRoleOpen, setCreateRoleOpen] = useState<boolean>(false);

  const runList = () => {
    const params: RoleListRequest = {
      page: Number(page),
      pageSize: Number(pageSize),
    };
    setSearchObject((prev) => {
      if (prev.value !== null) {
        switch (prev.key) {
          case "name":
            params.name = prev.value || "";
            break;
          default:
            break;
        }
      }
      run(params);
      return prev;
    });
  };

  useEffect(() => {
    setParams({ page: page, pageSize: pageSize });
    runList();
  }, [page, pageSize]);

  useUnmount(() => {
    clearParams();
  });

  return (
    <div className="px-4">
      <div className="flex justify-between p-2">
        <div className="flex gap-4">
          <Space.Compact style={{ minWidth: "400px", maxWidth: "600px" }}>
            <Select
              options={[
                {
                  label: "名称",
                  value: "name",
                },
              ]}
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
            />
            <Input.Search
              placeholder={`按名称前缀搜索`}
              style={{ width: "100%" }}
              value={searchObject.value || ""}
              onChange={(e) =>
                setSearchObject((prev) => {
                  return {
                    ...prev,
                    value: e.target.value,
                  };
                })
              }
              onSearch={handleSearch}
              onClear={handleClear}
              allowClear
            />
          </Space.Compact>
          <Button
            type="primary"
            onClick={() => {
              setCreateRoleOpen(true);
            }}
          >
            创建角色
          </Button>
        </div>
        <div className="pr-3">
          <Button icon={<SyncOutlined />} onClick={() => refreshRoleList()} />
        </div>
      </div>

      <DynamicTable
        extraHeight={80}
        loading={roleLoad}
        columns={GetRolecolumns({
          setRoleId,
          modal,
          message,
          delRun,
          setEditOpen,
          delLoad,
        })}
        locale={{
          emptyText: "暂无数据",
          triggerAsc: "点击升序",
          triggerDesc: "点击降序",
          cancelSort: "取消排序",
        }}
        dataSource={roleData?.list || []}
        pagination={{
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} 条，共 ${total} 条数据`,
          current: Number(page),
          pageSize: Number(pageSize),
          total: roleData?.total || 0,
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
      <RoleEditComponent
        id={roleId}
        message={message}
        refreshRoleList={refreshRoleList}
        open={editOpen}
        handleCancel={() => {
          setEditOpen(false);
        }}
      />
      <CreateRoleComponent
        open={createRoleOpen}
        message={message}
        onClose={() => {
          setCreateRoleOpen(false);
        }}
        refreshRoleList={refreshRoleList}
      />
    </div>
  );
};

export default RolePage;
