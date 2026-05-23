import React, { useMemo } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { SearchOutlined, SyncOutlined } from "@ant-design/icons";
// import { SearchDimension } from "@/types/common"; // 建议统一存放

export interface SearchDimension {
  label: string;
  value: string;
  type: string;
  options?: { label: string; value: string }[];
}

interface SearchFilterProps {
  dimensions: SearchDimension[];
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
  onRefresh?: () => void;
  extra?: React.ReactNode; // 用于放置“新建”按钮
  initialValues?: Record<string, unknown>;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  dimensions,
  searchParams,
  setSearchParams,
  onRefresh,
  extra,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const activeKey = Form.useWatch("searchKey", form);

  // 处理搜索提交
  const onFinish = (values: { searchKey: string; searchValue: string }) => {
    const { searchKey, searchValue } = values;
    const newParams = new URLSearchParams(searchParams);

    newParams.set("page", "1");

    dimensions.forEach((dim) => newParams.delete(dim.value));

    if (searchValue?.trim()) {
      newParams.set(searchKey, searchValue.trim());
    }

    setSearchParams(newParams);
    form.setFieldValue("searchValue", undefined); // 清空输入框
  };

  // 重置逻辑
  const handleReset = () => {
    form.resetFields();
    // 恢复默认分页，保留可能需要的固定参数（如 tenant）
    const newParams = new URLSearchParams();
    newParams.set("page", "1");
    newParams.set("pageSize", searchParams.get("pageSize") || "10");
    setSearchParams(newParams);
  };

  // 渲染动态输入框
  const renderSearchInput = () => {
    const currentDim =
      dimensions.find((d) => d.value === activeKey) || dimensions[0];

    if (currentDim?.type === "select") {
      return (
        <Select
          style={{ width: 160 }}
          placeholder="请选择"
          options={currentDim.options}
          allowClear
          onChange={() => form.submit()} // 选择后直接搜索
        />
      );
    }
    return (
      <Input
        style={{ width: 200 }}
        placeholder={`输入${currentDim?.label}搜索...`}
        allowClear
        prefix={<SearchOutlined />}
        onPressEnter={() => form.submit()}
      />
    );
  };

  // 渲染标签
  const renderTags = useMemo(() => {
    const nodes: React.ReactNode[] = [];
    dimensions.forEach((item) => {
      const val = searchParams.get(item.value);
      if (val) {
        const displayVal =
          item.options?.find((o) => String(o.value) === val)?.label || val;
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
  }, [searchParams, dimensions]);

  return (
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
          justifyContent: "space-between", // 确保两端对齐
          alignItems: "center", // 垂直居中
          width: "100%", // 确保占满宽度
        }}
      >
        <Form
          form={form}
          onFinish={onFinish}
          initialValues={{ searchKey: dimensions[0]?.value }}
        >
          <Space.Compact>
            <Form.Item name="searchKey" noStyle>
              <Select
                style={{ width: 110, textAlign: "center" }}
                options={dimensions.map((d) => ({
                  label: d.label,
                  value: d.value,
                }))}
              />
            </Form.Item>
            <Form.Item name="searchValue" noStyle>
              {renderSearchInput()}
            </Form.Item>
            <Button
              type="primary"
              onClick={() => form.submit()}
              icon={<SearchOutlined />}
            />
            <Button onClick={handleReset}>重置</Button>
            {onRefresh && (
              <Button
                icon={<SyncOutlined />}
                onClick={onRefresh}
                type="text"
                style={{ marginLeft: 8 }}
              />
            )}
          </Space.Compact>
        </Form>
        {extra}
      </div>

      {renderTags.length > 0 && (
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
          <Space wrap>{renderTags}</Space>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
