import { GetAlertSilenceColumns } from "@/components/alertSilence/AlertSilenceTableColums";
import AlertSilenceCreator from "@/components/alertSilence/CreateAlertSilence";
import DynamicTable from "@/components/base/DynamicTable";
import {
  CreateAlertSilence,
  GetAlertSilenceList,
} from "@/services/alertSilence";
import {
  AlertSilence,
  AlertSilenceListReq,
  CreateAlertSlienceReq,
  SILEMCE_SEARCH_DIMENSIONS,
} from "@/types/alert/silence";
import { PageOptionEnum } from "@/types/enum";
import { useRequest } from "ahooks";
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
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { GetUserOptions } from "@/services/user";

function AlertSilencePage() {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [searchParams, setSearchParams] = useSearchParams();

  // ------ silence 列表请求 ------
  const alertSilenceListRes = useRequest(GetAlertSilenceList, { manual: true });

  // ------ Url 驱动获取 alertSilence 列表 ------
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const rawStatus = searchParams.get("status"); // 1. 提前获取 status

    // 2. 统一拦截判断：如果任一核心参数缺失，则补全 URL 并拦截请求
    if (!page || !pageSize || rawStatus === null) {
      const newParams = new URLSearchParams(searchParams);

      if (!page) {
        newParams.set("page", PageOptionEnum.DEFAULTPAGE.toString());
      }
      if (!pageSize) {
        newParams.set("pageSize", PageOptionEnum.DEFAULTPAGESIZE.toString());
      }
      if (rawStatus === null) {
        // 如果 URL 里没有 status 参数，设置为默认值 "1"
        newParams.set("status", "1");
      }

      // 更新 URL，这会触发下一次 useEffect 执行
      setSearchParams(newParams, { replace: true });
      return;
    }

    // 3. 此时 page, pageSize, status 肯定都存在于 URL 中
    const statusNum = Number(rawStatus);

    // 校验 status 是否在合法范围 [0, 1, 2] 内，防止用户手动输入非法值
    const validatedStatus: AlertSilenceListReq["status"] = [0, 1, 2].includes(
      statusNum,
    )
      ? (statusNum as AlertSilenceListReq["status"])
      : 1;

    const params: AlertSilenceListReq = {
      page: Number(page),
      pageSize: Number(pageSize),
      status: validatedStatus,
    };

    alertSilenceListRes.run(params);
  }, [searchParams]);

  // ------ 创建 AlertSilence ------
  const [createAlertSilenceOpen, setCreateAlertSilenceOpen] =
    useState<boolean>(false);

  const handleCancel = () => {
    setCreateAlertSilenceOpen(false);
  };

  const createSilenceResult = useRequest(CreateAlertSilence, {
    manual: true,
    debounceWait: 200,
    onSuccess: () => {
      message.success("创建成功");
    },
  });

  // ------ 搜索逻辑 ------
  const [searchForm] = Form.useForm();
  const activeKey = Form.useWatch("searchKey", searchForm);

  const userOptionsResult = useRequest(GetUserOptions);
  // 使用 useMemo 将基础配置和接口数据合成
  const searchDimensions = useMemo(() => {
    return SILEMCE_SEARCH_DIMENSIONS.map((dim) => {
      if (dim.value === "createdBy") {
        return { ...dim, options: userOptionsResult.data };
      }
      return dim;
    });
  }, [userOptionsResult.data]);

  // 搜索逻辑
  const onHandleSearch = (values: {
    searchKey: string;
    searchValue: string;
  }) => {
    const { searchKey, searchValue } = values;
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    if (searchValue) {
      newSearchParams.set(searchKey, searchValue);
    } else {
      newSearchParams.delete(searchKey);
    }
    setSearchParams(newSearchParams);
    searchForm.setFieldValue("searchValue", undefined);
  };

  // 动态渲染搜索输入框
  const SearchBar = () => {
    const currentDim =
      searchDimensions.find((d) => d.value === activeKey) ||
      searchDimensions[0];
    if (currentDim.type === "select") {
      return (
        <Select
          showSearch={{
            filterOption: (input, option) => {
              const label = (option?.label ?? "").toString().toLowerCase();
              const value = (option?.value ?? "").toString().toLowerCase();
              const search = input.toLowerCase();
              return label.includes(search) || value.includes(search);
            },
          }}
          style={{ width: 160 }}
          placeholder="请选择"
          options={currentDim.options}
          allowClear
        />
      );
    }
    return (
      <Input
        style={{ width: 200 }}
        placeholder={`输入${currentDim.label}搜索...`}
        allowClear
        prefix={<SearchOutlined />}
        onPressEnter={() => searchForm.submit()}
      />
    );
  };

  // 重置逻辑
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({
      page: PageOptionEnum.DEFAULTPAGE.toString(),
      pageSize: PageOptionEnum.DEFAULTPAGESIZE.toString(),
      status: "1",
      tenant: localStorage.getItem("tenant") || "",
    });
  };

  // 筛选标签
  const renderFilterTags = useMemo(() => {
    const nodes: React.ReactNode[] = [];
    searchDimensions.forEach((item) => {
      const val = searchParams.get(item.value);
      if (val) {
        const displayVal =
          item.options?.find((o) => o.value === val)?.label || val;
        nodes.push(
          <Tag
            key={item.value}
            closable
            color="geekblue"
            onClose={() => {
              const p = new URLSearchParams(searchParams);
              p.delete(item.value);
              setSearchParams(p);
            }}
          >
            {item.label}: {displayVal}
          </Tag>,
        );
      }
    });
    return nodes;
  }, [searchParams]);

  return (
    <>
      <AlertSilenceCreator
        open={createAlertSilenceOpen}
        handleCancel={handleCancel}
        loading={createSilenceResult.loading}
        handleOk={async (value: CreateAlertSlienceReq) => {
          await createSilenceResult.runAsync(value);
          alertSilenceListRes.refresh();
        }}
      />
      <div
        className="m-2 p-2"
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
          <Form form={searchForm} onFinish={onHandleSearch}>
            <Space.Compact>
              <Form.Item name="searchKey" noStyle initialValue="createdBy">
                <Select
                  style={{ width: 110, textAlign: "center" }}
                  showSearch
                  options={searchDimensions.map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                />
              </Form.Item>
              <Form.Item name="searchValue" noStyle>
                {SearchBar()}
              </Form.Item>
              <Button
                type="primary"
                onClick={() => searchForm.submit()}
                icon={<SearchOutlined />}
              />
              <Button onClick={handleReset}>重置</Button>
              <Button
                icon={<SyncOutlined />}
                onClick={() => alertSilenceListRes.refresh()}
                type="text"
                style={{ marginLeft: 8 }}
              />
            </Space.Compact>
          </Form>

          <Button
            type="primary"
            onClick={() => {
              setCreateAlertSilenceOpen(true);
            }}
          >
            创建静默
          </Button>
        </div>

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
            </Typography.Text>{" "}
            <Space wrap>{renderFilterTags}</Space>
          </div>
        )}
      </div>

      <DynamicTable<AlertSilence>
        size="large"
        loading={alertSilenceListRes.loading}
        columns={GetAlertSilenceColumns()}
        dataSource={alertSilenceListRes.data?.list || []}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 15,
          total: alertSilenceListRes.data?.total || 0,
          onChange: (p, s) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", p.toString());
            params.set("pageSize", s.toString());
            setSearchParams(params);
          },
        }}
      />
    </>
  );
}

export default AlertSilencePage;
