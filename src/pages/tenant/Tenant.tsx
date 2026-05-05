import DynamicTable from "@/components/base/DynamicTable";
import { TenantDelete, TenantList } from "@/services/tenant";
import { useRequest } from "ahooks";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GetTenantColumns } from "@/types/tenant.tsx";
import { PageOptionEnum } from "@/types/enum";
import {
  TEHANT_SEARCH_DIMENSIONS,
  TenantFormValues,
  TenantListRequest,
  TenantRecord,
} from "@/types/tenant";
import {
  App,
  Button,
  Form,
  Input,
  Select,
  Space,
  Tag,
  theme,
  Typography,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { SearchDimension } from "@/types/index";
import CreateTenantComponent from "@/components/tenant/CreatTenantModal";

function Tenant() {
  // ------ 变量定义 ------
  const { token } = theme.useToken();
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDim, setActiveDim] = useState<string>("name");
  const { message } = App.useApp();
  // ------ 渲染搜索逻辑 ------
  const getSearchValue = (SearchDimension: SearchDimension[]) => {
    const activeDimension = SearchDimension.find((d) => d.value === activeDim);
    const searchType = activeDimension?.type;
    if (!searchType) {
      return <></>;
    }

    switch (searchType) {
      case "input":
        return (
          <Input
            style={{ width: 200 }}
            placeholder="搜索关键词..."
            allowClear
            prefix={
              <SearchOutlined style={{ color: token.colorTextQuaternary }} />
            }
            onPressEnter={() => searchForm.submit()}
          />
        );
    }
  };

  // ------ 渲染搜索条件展示 ------
  const renderFilterTags = useMemo(() => {
    const nodes: React.ReactNode[] = [];
    TEHANT_SEARCH_DIMENSIONS.forEach((dim) => {
      const val = searchParams.get(dim.value);
      if (val) {
        nodes.push(
          <Tag
            key={dim.value}
            closable
            color="cyan"
            onClose={() => {
              const p = new URLSearchParams(searchParams);
              p.delete(dim.value);
              setSearchParams(p);
            }}
          >
            {dim.label}: {searchParams.get(dim.value)}
          </Tag>,
        );
      }
    });
    return nodes;
  }, [searchParams, setSearchParams]);

  // ------ 租户列表接口 ------
  const tenantListResult = useRequest(TenantList, {
    manual: true,
  });

  // ------ 搜索逻辑 ------
  const onHandleSearch = (values: TenantFormValues) => {
    const { searchKey, searchValue } = values;
    const newSearchParams = new URLSearchParams(searchParams);
    // 搜索时重置到第一页
    newSearchParams.set("page", "1");

    if (searchValue) {
      newSearchParams.set(searchKey, searchValue);
    } else {
      // 如果值为空，删除对应的参数，否则 URL 会越来越长
      newSearchParams.delete(searchKey);
    }

    setSearchParams(newSearchParams);
    searchForm.setFieldValue("searchValue", undefined);
  };
  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({
      page: PageOptionEnum.DEFAULTPAGE.toString(),
      pageSize: PageOptionEnum.DEFAULTPAGESIZE.toString(),
    });
  };

  // ------ 创建租户逻辑 ------
  const [createTenantOpen, setCreateTenantOpen] = useState<boolean>(false);

  // ------ 删除租户逻辑 ------
  const TenantDelResult = useRequest(TenantDelete, {
    manual: true,
    debounceWait: 100,
    onSuccess: () => {
      message.success("删除成功");
      tenantListResult.refresh();
    },
  });

  // ------ 更新租户逻辑 ------
  const [editingRecord, setEditingRecord] = useState<TenantRecord | null>(null);

  // ------ 监听 URL 参数，自动发起接口调用 ------
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

    const params: TenantListRequest = {
      page: page ? Number(page) : PageOptionEnum.DEFAULTPAGE,
      pageSize: pageSize ? Number(pageSize) : PageOptionEnum.DEFAULTPAGESIZE,
    };
    tenantListResult.run(params);
  }, [searchParams]);

  return (
    <>
      <CreateTenantComponent
        message={message}
        tenantListRefresh={tenantListResult.refresh}
        createTenantOpen={createTenantOpen}
        setCreateTenantOpen={setCreateTenantOpen}
        initialData={editingRecord}
        setInitialData={setEditingRecord}
      />
      <div
        className="m-2 p-5"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Form
            form={searchForm}
            onFinish={onHandleSearch}
            initialValues={{ searchKey: activeDim }}
          >
            <Space.Compact style={{ boxShadow: "0 2px 0 rgba(0,0,0,0.015)" }}>
              <Form.Item name="searchKey" noStyle>
                <Select
                  style={{ width: 110, textAlign: "center" }}
                  onChange={(val) => {
                    setActiveDim(val);
                    searchForm.setFieldValue("searchValue", undefined);
                  }}
                  options={TEHANT_SEARCH_DIMENSIONS.map((dim) => ({
                    label: dim.label,
                    value: dim.value,
                  }))}
                />
              </Form.Item>

              {/* 🌟 必须设置 name="searchValue" */}
              <Form.Item name="searchValue" noStyle>
                {getSearchValue(TEHANT_SEARCH_DIMENSIONS)}
              </Form.Item>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCreateTenantOpen(true);
                }}
              >
                新建租户
              </Button>
              <Button type="primary" onClick={handleReset}>
                重置搜索
              </Button>
            </Space.Compact>
          </Form>
        </div>
        {/* 已选条件区域优化 */}
        {renderFilterTags.length > 0 && (
          <div
            className="mt-4 p-2 flex items-center border-t border-dashed"
            style={{ borderColor: token.colorBorderSecondary }}
          >
            <Typography.Text
              type="secondary"
              className="mr-3"
              style={{ fontSize: 12, display: "flex", alignItems: "center" }}
            >
              <SearchOutlined style={{ marginRight: 4 }} /> 当前筛选:
            </Typography.Text>
            <Space size={[0, 8]} wrap>
              {renderFilterTags}
            </Space>{" "}
          </div>
        )}
      </div>
      <DynamicTable
        size="large"
        loading={tenantListResult.loading}
        dataSource={tenantListResult.data?.list || []}
        columns={GetTenantColumns({
          TenantDelResult,
          setEditingRecord,
          setCreateTenantOpen,
        })}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 10,
          total: tenantListResult.data?.total || 0,
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
    </>
  );
}

export default Tenant;
