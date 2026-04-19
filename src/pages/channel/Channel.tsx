import DynamicTable from "@/components/base/DynamicTable";
import {
  CreateAlertChannel,
  DeleteAlertChannel,
  GetAlertChannelList,
  UpdateAlertChannel,
} from "@/services/alertChannel";
import {
  AlertChannelItem,
  CHANNEL_SEARCH_DIMENSIONS,
  CreateAlertChanneRequest,
  GetAlertChannelListRequest,
  UpdateAlertChanneRequest,
} from "@/types/alert/channel";
import { PageOptionEnum } from "@/types/enum";
import { useRequest } from "ahooks";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GetAlertChannelColumns } from "@/types/alert/Channel.tsx";
import { App, Button, Form, Input, Select, Space, Tag, theme } from "antd";
import { PlusOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import EditAlertChannel from "@/components/alertChannel/Channel";

function AlertChannel() {
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const [searchForm] = Form.useForm();
  const activeKey = Form.useWatch("searchKey", searchForm);
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. 列表请求
  const alertChannelListRes = useRequest(GetAlertChannelList, { manual: true });

  // 2. 更新请求
  const updateAlertChannelResult = useRequest(UpdateAlertChannel, {
    manual: true,
    onSuccess: () => {
      message.success("更新成功");
      setEditModalOpen(false);
      alertChannelListRes.refresh();
    },
  });

  // 3. 创建请求
  const createAlertChannelResult = useRequest(CreateAlertChannel, {
    manual: true,
    onSuccess: () => {
      message.success("创建成功");
      setEditModalOpen(false);
      alertChannelListRes.refresh();
    },
  });

  // 4. 删除请求
  const deleteAlertChannelResult = useRequest(DeleteAlertChannel, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      alertChannelListRes.refresh();
    },
  });

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AlertChannelItem | null>(
    null,
  );

  // 同步 URL 参数到列表请求
  useEffect(() => {
    const page =
      searchParams.get("page") || PageOptionEnum.DEFAULTPAGE.toString();
    const pageSize =
      searchParams.get("pageSize") || PageOptionEnum.DEFAULTPAGESIZE.toString();
    const type = searchParams.get("type") as GetAlertChannelListRequest["type"];
    const name = searchParams.get("name");

    const params: GetAlertChannelListRequest = {
      page: Number(page),
      pageSize: Number(pageSize),
      type: type || undefined,
      name: name || undefined,
    };

    alertChannelListRes.run(params);
  }, [searchParams]);

  // 搜索处理
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
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({
      page: PageOptionEnum.DEFAULTPAGE.toString(),
      pageSize: PageOptionEnum.DEFAULTPAGESIZE.toString(),
    });
  };

  // 动态渲染搜索输入框
  const SearchBar = () => {
    const currentDim =
      CHANNEL_SEARCH_DIMENSIONS.find((d) => d.value === activeKey) ||
      CHANNEL_SEARCH_DIMENSIONS[0];
    if (currentDim.type === "select") {
      return (
        <Select
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

  // 筛选标签
  const renderFilterTags = useMemo(() => {
    const nodes: React.ReactNode[] = [];
    CHANNEL_SEARCH_DIMENSIONS.forEach((item) => {
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

  // 弹窗保存逻辑
  const handleModalSave = (
    values: CreateAlertChanneRequest | UpdateAlertChanneRequest,
  ) => {
    if (editingRecord?.id) {
      modal.confirm({
        title: "确认更新",
        content: `确定保存对通道 "${values.name}" 的修改吗？`,
        onOk: () =>
          updateAlertChannelResult.run(values as UpdateAlertChanneRequest),
      });
    } else {
      createAlertChannelResult.run(values);
    }
  };

  // 操作按钮处理
  const handleEdit = (record: AlertChannelItem) => {
    setEditingRecord(record);
    setEditModalOpen(true);
  };

  const handleCreateOpen = () => {
    setEditingRecord(null);
    setEditModalOpen(true);
  };

  const deleteHander = (record: AlertChannelItem) => {
    modal.confirm({
      title: "确认删除",
      content: `确定删除通道 "${record.name}" 吗？此操作不可撤销。`,
      okType: "danger",
      onOk: () => deleteAlertChannelResult.run(record.id),
    });
  };

  return (
    <>
      <EditAlertChannel
        open={editModalOpen}
        data={editingRecord}
        confirmLoading={
          editingRecord?.id
            ? updateAlertChannelResult.loading
            : createAlertChannelResult.loading
        }
        title={
          editingRecord?.id ? `编辑通道: ${editingRecord.name}` : "新建通道"
        }
        width={800}
        centered
        onCancel={() => setEditModalOpen(false)}
        onSave={handleModalSave}
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
          <Form form={searchForm} onFinish={onHandleSearch} style={{ flex: 1 }}>
            <Space.Compact>
              <Form.Item name="searchKey" noStyle initialValue="name">
                <Select
                  style={{ width: 110, textAlign: "center" }}
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
                onClick={() => alertChannelListRes.refresh()}
                type="text"
                style={{ marginLeft: 8 }}
              />
            </Space.Compact>
          </Form>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateOpen}
          >
            新建通道
          </Button>
        </div>

        {renderFilterTags.length > 0 && (
          <div
            className="mt-4 p-2 border-t border-dashed"
            style={{ borderColor: token.colorBorderSecondary }}
          >
            <Space wrap>{renderFilterTags}</Space>
          </div>
        )}
      </div>

      <DynamicTable<AlertChannelItem>
        size="large"
        loading={alertChannelListRes.loading}
        columns={GetAlertChannelColumns({ token, handleEdit, deleteHander })}
        dataSource={alertChannelListRes.data?.list || []}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 15,
          total: alertChannelListRes.data?.total || 0,
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

export default AlertChannel;
