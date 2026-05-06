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
import { ApartmentOutlined, SearchOutlined } from "@ant-design/icons";
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
    const name = searchParams.get("name");
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
      name: name ? name : undefined,
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
            alignItems: "center", // 改为 center 对齐更美观
            marginBottom: 16,
            gap: 16,
          }}
        >
          {/* 左侧搜索区：所有搜索相关的放在 Form 内部 */}
          <Form
            form={searchForm}
            onFinish={onHandleSearch} // 只有这样回车才会触发搜索逻辑
            initialValues={{ searchKey: activeDim }}
            style={{ display: "flex", flex: 1 }}
          >
            <Space size={8}>
              <Space.Compact style={{ boxShadow: "0 2px 0 rgba(0,0,0,0.015)" }}>
                <Form.Item name="searchKey" noStyle>
                  <Select
                    style={{ width: 110 }}
                    onChange={(val) => {
                      setActiveDim(val);
                      // 注意：这里手动清除值，确保维度切换时数据干净
                      searchForm.setFieldValue("searchValue", undefined);
                    }}
                    options={TEHANT_SEARCH_DIMENSIONS.map((dim) => ({
                      label: dim.label,
                      value: dim.value,
                    }))}
                  />
                </Form.Item>

                <Form.Item name="searchValue" noStyle>
                  {/* 确保 getSearchValue 返回的是 antd 的 Input */}
                  {getSearchValue(TEHANT_SEARCH_DIMENSIONS)}
                </Form.Item>
              </Space.Compact>

              <Button
                type="primary"
                onClick={() => {
                  searchForm.submit();
                }}
                icon={<SearchOutlined />}
              >
                查询
              </Button>

              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form>

          <Button
            type="primary"
            icon={<ApartmentOutlined />}
            onClick={() => setCreateTenantOpen(true)}
          >
            新建租户
          </Button>
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
