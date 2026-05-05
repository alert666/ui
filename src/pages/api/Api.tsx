import CreateApiComponent from "@/components/api/CreatePolicy";
import UpdatePolicyComponent from "@/components/api/UpdatePolicy";
import DynamicTable from "@/components/base/DynamicTable";
import { DeleteApi, GetApiList } from "@/services/api";
import { Api, ApiListRequest } from "@/types/api/api";
import { ApiListColumns } from "@/types/api/api.tsx";
import { PageOptionEnum } from "@/types/enum";
import { PlusOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { App, Button, Form, Input, Select, Space, Tag, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

// 定义搜索维度
const SEARCH_DIMENSIONS = [
  { label: "名称", value: "name", type: "input" },
  { label: "路径", value: "path", type: "input" },
  {
    label: "方法",
    value: "method",
    type: "select",
    options: [
      { label: "GET", value: "GET" },
      { label: "POST", value: "POST" },
      { label: "PUT", value: "PUT" },
      { label: "DELETE", value: "DELETE" },
      { label: "PATCH", value: "PATCH" },
    ],
  },
];

const PolicyPage = () => {
  const { modal, message } = App.useApp();
  const { token } = theme.useToken();
  const [searchForm] = Form.useForm();
  const activeKey = Form.useWatch("searchKey", searchForm);
  const [searchParams, setSearchParams] = useSearchParams();

  // 弹窗状态
  const [createApiOpen, setCreateApiOpen] = useState(false);
  const [updateApiOpen, setUpdateApiOpen] = useState(false);
  const [updateApiData, setUpdateApiData] = useState({} as Api);

  // 1. 获取列表请求
  const apiListRes = useRequest(GetApiList, { manual: true });

  // 2. 删除请求
  const deleteApiRes = useRequest(DeleteApi, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      apiListRes.refresh();
    },
  });

  // 核心逻辑：监听 URL 参数变化并触发请求
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

    const params: ApiListRequest = {
      page: Number(page),
      pageSize: Number(pageSize),
      name: searchParams.get("name") || undefined,
      path: searchParams.get("path") || undefined,
      method: searchParams.get("method") || undefined,
    };

    apiListRes.run(params);
  }, [searchParams]);

  // 处理搜索提交
  const onHandleSearch = (values: {
    searchKey: string;
    searchValue: string;
  }) => {
    const { searchKey, searchValue } = values;
    const newParams = new URLSearchParams(searchParams);

    // 搜索时重置页码，并清除之前旧的搜索键值对
    newParams.set("page", "1");
    SEARCH_DIMENSIONS.forEach((dim) => newParams.delete(dim.value));

    if (searchValue) {
      newParams.set(searchKey, searchValue);
    }
    setSearchParams(newParams);
    searchForm.resetFields();
  };

  // 重置搜索
  const handleReset = () => {
    if (searchForm) {
      searchForm.resetFields();
      setSearchParams({ page: "1", pageSize: "10" });
    }
  };

  // 渲染筛选标签
  const renderFilterTags = useMemo(() => {
    return SEARCH_DIMENSIONS.map((item) => {
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

  // 动态搜索输入框
  const SearchInput = () => {
    const currentDim =
      SEARCH_DIMENSIONS.find((d) => d.value === activeKey) ||
      SEARCH_DIMENSIONS[0];
    if (currentDim.type === "select") {
      return (
        <Select
          style={{ width: 160 }}
          placeholder="请选择"
          options={currentDim.options}
          allowClear
          onChange={() => searchForm.submit()}
        />
      );
    }
    return (
      <Input
        style={{ width: 220 }}
        placeholder={`输入${currentDim.label}前缀搜索...`}
        allowClear
        onPressEnter={() => searchForm.submit()}
      />
    );
  };

  return (
    <div className="p-4">
      {/* 搜索与操作栏 */}
      <div
        className="mb-4 p-4"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
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
                  style={{ width: 100 }}
                  options={SEARCH_DIMENSIONS.map((d) => ({
                    label: d.label,
                    value: d.value,
                  }))}
                />
              </Form.Item>
              <Form.Item name="searchValue" noStyle>
                {SearchInput()}
              </Form.Item>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => searchForm.submit()}
              />
              <Button onClick={handleReset}>重置</Button>
              <Button
                type="text"
                icon={<SyncOutlined spin={apiListRes.loading} />}
                onClick={() => apiListRes.refresh()}
              />
            </Space.Compact>
          </Form>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateApiOpen(true)}
          >
            创建 API
          </Button>
        </div>

        {renderFilterTags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
            <Space wrap>{renderFilterTags}</Space>
          </div>
        )}
      </div>

      {/* 数据表格 */}
      <DynamicTable
        size="large"
        loading={apiListRes.loading}
        dataSource={apiListRes.data?.list || []}
        columns={ApiListColumns({
          modal,
          message,
          deleteApiRun: deleteApiRes.run,
          deleteApiLoad: deleteApiRes.loading,
          setUpdateApiOpen,
          setUpdateApiData,
        })}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 10,
          total: apiListRes.data?.total || 0,
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
      <UpdatePolicyComponent
        open={updateApiOpen}
        data={updateApiData}
        onCancel={() => setUpdateApiOpen(false)}
        refresh={apiListRes.refresh}
      />

      <CreateApiComponent
        open={createApiOpen}
        onCancel={() => setCreateApiOpen(false)}
        refresh={apiListRes.refresh}
      />
    </div>
  );
};

export default PolicyPage;
