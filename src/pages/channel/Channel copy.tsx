import DynamicTable from "@/components/base/DynamicTable";
import { GetAlertChannelList } from "@/services/alertChannel";
import {
  AlertChannelItem,
  CHANNEL_SEARCH_DIMENSIONS,
  GetAlertChannelListRequest,
} from "@/types/alert/channel";
import { PageOptionEnum } from "@/types/enum";
import { useRequest } from "ahooks";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GetAlertChannelColumns } from "@/types/alert/Channel.tsx";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  theme,
  Typography,
} from "antd";
import { SearchOutlined, SyncOutlined } from "@ant-design/icons";
import CodeEditor from "@/components/codeEditor/CodeEditor";

function AlertChannel() {
  const { token } = theme.useToken();
  const [searchForm] = Form.useForm<{
    searchKey: string;
    searchValue: string;
  }>();
  const activeKey = Form.useWatch("searchKey", searchForm);
  const [searchParams, setSearchParams] = useSearchParams();
  const alertChannelListRes = useRequest(GetAlertChannelList, { manual: true });
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const type = searchParams.get("type") as GetAlertChannelListRequest["type"];
    const name = searchParams.get("name");

    if (!page || !pageSize) {
      const newParams = new URLSearchParams(searchParams);
      if (!page) newParams.set("page", PageOptionEnum.DEFAULTPAGE.toString());
      if (!pageSize)
        newParams.set("pageSize", PageOptionEnum.DEFAULTPAGESIZE.toString());

      // 更新 URL，replace: true 保证不会产生多余的浏览器历史记录
      // 这一步执行后，useEffect 会因为 searchParams 改变而再次触发
      setSearchParams(newParams, { replace: true });
      return;
    }

    const params: GetAlertChannelListRequest = {
      page: Number(page),
      pageSize: Number(pageSize),
      type: type ? type : undefined,
      name: name ? name : undefined,
    };

    alertChannelListRes.run(params);
  }, [searchParams, alertChannelListRes.run]);

  const onHandleSearch = (values: {
    searchKey: string;
    searchValue: string;
  }) => {
    const { searchKey, searchValue } = values;
    if (searchValue === undefined) {
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", "1");
    if (searchValue) {
      newSearchParams.set(searchKey, searchValue);
    }
    setSearchParams(newSearchParams);
    searchForm.resetFields();
  };

  const SearchBar = () => {
    const currentDim =
      CHANNEL_SEARCH_DIMENSIONS.find((d) => d.value === activeKey) ||
      CHANNEL_SEARCH_DIMENSIONS[0];
    switch (currentDim.type) {
      case "select":
        return (
          <Select
            style={{ width: 160 }}
            placeholder="请选择内容"
            options={
              CHANNEL_SEARCH_DIMENSIONS.find((d) => d.value === activeKey)
                ?.options
            }
          />
        );
      default:
        return (
          <Input
            style={{ width: 200 }}
            placeholder={`输入${currentDim.label}搜索...`}
            allowClear
            prefix={<SearchOutlined />}
            onPressEnter={() => searchForm.submit()}
          />
        );
    }
  };
  const tenant = searchParams.get("tenant");
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({
      page: PageOptionEnum.DEFAULTPAGE.toString(),
      pageSize: PageOptionEnum.DEFAULTPAGESIZE.toString(),
      tenant: tenant || localStorage.getItem("tenant") || "default",
    });
  };

  const renderFilterTags = useMemo(() => {
    const nodes: React.ReactNode[] = [];
    CHANNEL_SEARCH_DIMENSIONS.forEach((item) => {
      const val = searchParams.get(item.value);
      if (val) {
        nodes.push(
          <Tag
            key={item.value}
            closable
            color="cyan"
            onClose={() => {
              const p = new URLSearchParams(searchParams);
              p.delete(item.value);
              setSearchParams(p);
            }}
          >
            {item.label}: {val}
          </Tag>,
        );
      }
    });
    return nodes;
  }, [searchParams, setSearchParams]);

  const [editForm] = Form.useForm<AlertChannelItem>();
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AlertChannelItem>(
    {} as AlertChannelItem,
  );

  // 打开编辑弹窗
  const handleEdit = (record: AlertChannelItem) => {
    setEditingRecord(record);
    setEditModalOpen(true);

    // 初始化表单值
    editForm.setFieldsValue({
      ...record,
      // 将对象转为格式化后的 JSON 字符串供编辑器使用
      config: JSON.stringify(record.config, null, 2),
    });
  };

  return (
    <>
      <Modal
        title={editingRecord ? `编辑通道: ${editingRecord.name}` : "新建通道"}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        // onOk={onUpdate}
        confirmLoading={alertChannelListRes.loading}
        width={800}
        centered
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 24px",
            }}
          >
            <Form.Item
              name="name"
              label="通道名称"
              rules={[{ required: true, message: "请输入名称" }]}
            >
              <Input disabled placeholder="例如: 运维飞书群" />
            </Form.Item>

            <Form.Item
              name="type"
              label="通道类型"
              rules={[{ required: true }]}
            >
              <Select
                disabled
                options={
                  CHANNEL_SEARCH_DIMENSIONS.find((d) => d.value === "type")
                    ?.options
                }
              />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: "40px" }}>
            <Form.Item name="status" label="状态" valuePropName="checked">
              <Switch checkedChildren="开启" unCheckedChildren="禁用" />
            </Form.Item>
            <Form.Item
              name="aggregationStatus"
              label="聚合状态"
              valuePropName="checked"
            >
              <Switch checkedChildren="开启" unCheckedChildren="禁用" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入描述信息" rows={2} />
          </Form.Item>

          <Form.Item
            name="config"
            label="详细配置 (JSON)"
            rules={[
              { required: true, message: "配置不能为空" },
              {
                validator: (_, value) => {
                  try {
                    if (!value) return Promise.resolve();
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject(new Error("请输入合法的 JSON 格式"));
                  }
                },
              },
            ]}
          >
            {/* 这里直接使用你封装的 CodeEditor */}
            <CodeEditor token={token} language="json" height="300px" />
          </Form.Item>
        </Form>
      </Modal>

      <div
        className="m-2 p-5"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Form form={searchForm} onFinish={onHandleSearch}>
          <Space.Compact style={{ boxShadow: "0 2px 0 rgba(0,0,0,0.015)" }}>
            <Form.Item name="searchKey" noStyle initialValue="name">
              <Select
                style={{ width: 110, textAlign: "center" }}
                className="bg-gray-50"
                options={CHANNEL_SEARCH_DIMENSIONS.map((item) => ({
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
              icon={<SyncOutlined spin={alertChannelListRes.loading} />}
              onClick={() => alertChannelListRes.refreshAsync()}
              type="text"
              style={{
                backgroundColor: token.colorFillAlter,
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Space.Compact>
        </Form>
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

      <DynamicTable<AlertChannelItem>
        size="large"
        extraHeight={renderFilterTags.length > 0 ? 80 : 100}
        loading={alertChannelListRes.loading}
        columns={GetAlertChannelColumns({
          token,
          handleEdit,
        })}
        dataSource={alertChannelListRes.data?.list || []}
        pagination={{
          style: { marginRight: 16 },
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          current:
            Number(searchParams.get("page")) || PageOptionEnum.DEFAULTPAGE,
          pageSize:
            Number(searchParams.get("pageSize")) ||
            PageOptionEnum.DEFAULTPAGESIZE,
          total: alertChannelListRes.data?.total || 0,
          onChange: (p, s) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", p.toString());
            params.set("pageSize", s.toString());
            setSearchParams(params);
          },
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} 条，共 ${total} 条数据`,
        }}
      />
    </>
  );
}

export default AlertChannel;
