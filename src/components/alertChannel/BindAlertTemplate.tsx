import { useEffect, useState } from "react";
import {
  Drawer,
  Table,
  Button,
  Space,
  Input,
  Typography,
  GlobalToken,
  Tag,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useRequest } from "ahooks";
import {
  GetAlertTemplate,
  GetAlertTemplateList,
} from "@/services/alertTemplate";
import { AlertTemplateRecord } from "@/types/alert/template";
import {
  AlertChannelItem,
  UpdateAlertChanneRequest,
} from "@/types/alert/channel";
import AlertTemplateModal from "../alertTemplate/EditAlertTemplate";
import { UpdateAlertChannel } from "@/services/alertChannel";
import { MessageInstance } from "antd/es/message/interface";

interface BindProps {
  token: GlobalToken;
  message: MessageInstance;
  visible: boolean;
  record: AlertChannelItem;
  onCloseCabk: () => void;
}

const BindAlertTemplateComponent: React.FC<BindProps> = ({
  token,
  message,
  visible,
  record,
  onCloseCabk,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, loading, run } = useRequest(GetAlertTemplateList, {
    manual: true,
  });

  const fetchList = () => {
    run({
      page,
      pageSize,
      name: searchText || undefined,
    });
  };

  useEffect(() => {
    if (visible) {
      fetchList();
    }
  }, [page, pageSize, searchText, visible]);

  // ------ 预览功能 ------
  const getAlertTemplateResult = useRequest(GetAlertTemplate, { manual: true });
  const [viewAlertTemplate, setViewAlertTemplate] = useState<boolean>(false);

  // ------ 修改逻辑 ------
  const updateResult = useRequest(UpdateAlertChannel, {
    manual: true,
    onSuccess: () => {
      message.success("绑定成功");
      onClose();
    },
  });

  const onClose = () => {
    onCloseCabk();
    setSelectedRowKeys([]);
    setPage(1);
    setPageSize(10);
    setSearchText("");
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "模板名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, item: AlertTemplateRecord) => (
        <Space>
          <Typography.Text strong>{text}</Typography.Text>
          {/* 增加视觉提示：如果是当前已绑定的，展示标签 */}
          {item.id.toString() === record?.alertTemplateID?.toString() && (
            <Tag color="blue">当前绑定</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "操作",
      width: 80,
      render: (_: unknown, item: AlertTemplateRecord) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setViewAlertTemplate(true);
            getAlertTemplateResult.run(item.id);
          }}
        >
          预览
        </Button>
      ),
    },
  ];

  const handleSave = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择一个要绑定的模板");
      return;
    }

    const selectedId = selectedRowKeys[0].toString();

    // 双重检查逻辑
    if (record.alertTemplateID?.toString() === selectedId) {
      message.error("该模板已经是当前绑定模板");
      return;
    }

    const submitData: UpdateAlertChanneRequest = {
      ...record,
      templateID: selectedId,
    };

    updateResult.run(submitData);
  };

  return (
    <>
      <AlertTemplateModal
        width="60%"
        token={token}
        visible={viewAlertTemplate}
        onClose={() => setViewAlertTemplate(false)}
        record={getAlertTemplateResult.data || ({} as AlertTemplateRecord)}
        descriptionEdit={true}
      />

      <Drawer
        title={
          <Space>
            <span>绑定模板</span>
            <Typography.Text
              type="secondary"
              style={{ fontSize: "12px", fontWeight: "normal" }}
            >
              渠道: {record?.name}
            </Typography.Text>
          </Space>
        }
        size="40%"
        onClose={onClose}
        open={visible}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button
              onClick={handleSave}
              type="primary"
              loading={updateResult.loading}
              disabled={selectedRowKeys.length === 0}
            >
              保存绑定
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary">
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            请选择一个新的告警模板进行关联。
          </Typography.Text>
        </div>

        <Input
          placeholder="搜索模板名称..."
          prefix={<SearchOutlined />}
          allowClear
          value={searchText}
          style={{ marginBottom: 16 }}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
        />

        <Table
          loading={loading}
          rowSelection={{
            type: "radio",
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            // --- 核心优化 1：禁用当前已绑定的模板 ---
            getCheckboxProps: (item: AlertTemplateRecord) => ({
              disabled:
                item.id.toString() === record?.alertTemplateID?.toString(),
              name: item.name,
            }),
          }}
          onRow={(item) => ({
            onClick: () => {
              // --- 核心优化 2：点击行时也要判断是否禁用 ---
              if (item.id.toString() !== record?.alertTemplateID?.toString()) {
                setSelectedRowKeys([item.id]);
              }
            },
            // 增加点击禁选行的视觉反馈（可选）
            style: {
              cursor:
                item.id.toString() === record?.alertTemplateID?.toString()
                  ? "not-allowed"
                  : "pointer",
              opacity:
                item.id.toString() === record?.alertTemplateID?.toString()
                  ? 0.6
                  : 1,
            },
          })}
          columns={columns}
          dataSource={data?.list}
          rowKey="id"
          size="small"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Drawer>
    </>
  );
};

export default BindAlertTemplateComponent;
