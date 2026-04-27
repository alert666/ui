import { DeleteRole, ListRole } from "@/services/role";
import { RoleListRequest } from "@/types/role/role";
import { GetRolecolumns } from "@/types/role/role.tsx";
import { PlusOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { App, Button, Form, Input, Select, Space, Tag, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DynamicTable from "@/components/base/DynamicTable";
import CreateRoleComponent from "@/components/role/CreateRole";
import RoleEditComponent from "@/components/role/RoleEdit";
import { PageOptionEnum } from "@/types/enum";

// 定义搜索维度
const ROLE_SEARCH_DIMENSIONS = [
  { label: "角色名称", value: "name", type: "input" },
  // 如果未来有其他搜索维度（如 code），可以在此直接添加
];

const RolePage = () => {
  const { modal, message } = App.useApp();
  const { token } = theme.useToken();
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. 列表请求
  const listRoleRes = useRequest(ListRole, { manual: true });

  // 2. 删除请求
  const deleteRoleRes = useRequest(DeleteRole, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      listRoleRes.refresh();
    },
  });

  // 3. 弹窗状态
  const [editOpen, setEditOpen] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [createRoleOpen, setCreateRoleOpen] = useState(false);

  // 核心逻辑：监听 URL 参数并同步请求
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    if (!page || !pageSize) {
      const newParams = new URLSearchParams(searchParams);
      if (!page) newParams.set("page", PageOptionEnum.DEFAULTPAGE.toString());
      if (!pageSize)
        newParams.set("pageSize", PageOptionEnum.DEFAULTPAGESIZE.toString());
      // 更新 URL，replace: true 保证不会产生多余的浏览器历史记录
      // 这一步执行后，useEffect 会因为 searchParams 改变而再次触发
      setSearchParams(newParams, { replace: true });
      // 🌟 关键：补全 URL 期间直接返回，拦截本次不完整的请求
      return;
    }

    const name = searchParams.get("name");

    const params: RoleListRequest = {
      page: Number(page),
      pageSize: Number(pageSize),
      name: name || undefined,
    };

    listRoleRes.run(params);
  }, [searchParams]);

  // 搜索提交
  const onHandleSearch = (values: {
    searchKey: string;
    searchValue: string;
  }) => {
    const { searchKey, searchValue } = values;
    const newParams = new URLSearchParams(searchParams);

    newParams.set("page", "1"); // 搜索时重置回第一页

    // 清除旧的搜索键值，设置新的
    ROLE_SEARCH_DIMENSIONS.forEach((dim) => newParams.delete(dim.value));

    if (searchValue) {
      newParams.set(searchKey, searchValue);
    }
    setSearchParams(newParams);

    searchForm.resetFields();
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({ page: "1", pageSize: "10" });
  };

  // 筛选标签渲染
  const renderFilterTags = useMemo(() => {
    return ROLE_SEARCH_DIMENSIONS.map((item) => {
      const val = searchParams.get(item.value);
      if (!val) return null;
      return (
        <Tag
          key={item.value}
          closable
          color="blue"
          onClose={() => {
            const p = new URLSearchParams(searchParams);
            p.delete(item.value);
            setSearchParams(p);
          }}
        >
          {item.label}: {val}
        </Tag>
      );
    }).filter(Boolean);
  }, [searchParams]);

  return (
    <div className="p-4">
      {/* 搜索栏 */}
      <div
        className="mb-4 p-4"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        }}
      >
        <div className="flex justify-between items-start">
          <Form
            form={searchForm}
            onFinish={onHandleSearch}
            initialValues={{ searchKey: "name" }}
          >
            <Space.Compact>
              <Form.Item name="searchKey" noStyle>
                <Select
                  style={{ width: 110 }}
                  options={ROLE_SEARCH_DIMENSIONS.map((d) => ({
                    label: d.label,
                    value: d.value,
                  }))}
                />
              </Form.Item>
              <Form.Item name="searchValue" noStyle>
                <Input
                  style={{ width: 220 }}
                  placeholder="输入名称搜索..."
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
                icon={<SyncOutlined spin={listRoleRes.loading} />}
                onClick={() => listRoleRes.refresh()}
              />
            </Space.Compact>
          </Form>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateRoleOpen(true)}
          >
            创建角色
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

      {/* 数据表格 */}
      <DynamicTable
        loading={listRoleRes.loading}
        dataSource={listRoleRes.data?.list || []}
        columns={GetRolecolumns({
          setRoleId,
          modal,
          message,
          delRun: deleteRoleRes.run,
          delLoad: deleteRoleRes.loading,
          setEditOpen,
        })}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 10,
          total: listRoleRes.data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条数据`,
          onChange: (p, s) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", p.toString());
            params.set("pageSize", s.toString());
            setSearchParams(params);
          },
        }}
        bordered
      />

      {/* 弹窗组件 */}
      <RoleEditComponent
        id={roleId}
        message={message}
        refreshRoleList={listRoleRes.refresh}
        open={editOpen}
        handleCancel={() => setEditOpen(false)}
      />

      <CreateRoleComponent
        open={createRoleOpen}
        message={message}
        onClose={() => setCreateRoleOpen(false)}
        refreshRoleList={listRoleRes.refresh}
      />
    </div>
  );
};

export default RolePage;
