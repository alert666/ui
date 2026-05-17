import { ApiResponse } from "@/types";
import { AlertTemplateRecord, EditTemplateState } from "@/types/alert/template";
import { Result } from "ahooks/lib/useRequest/src/types";
import { Button, Popconfirm, Space } from "antd";
import dayjs from "dayjs";

// 定义操作回调的接口
export interface GetAlertTemplateColumnsProps {
  setEditTemplate: React.Dispatch<React.SetStateAction<EditTemplateState>>;
  setAlertTemplateRecord: React.Dispatch<
    React.SetStateAction<AlertTemplateRecord>
  >;
  alertTemplateDelteResult: Result<ApiResponse<unknown>, [id: string]>;
  setAlertTemplateDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GetAlertTemplateColumns = (
  props: GetAlertTemplateColumnsProps,
) => {
  const {
    setEditTemplate,
    setAlertTemplateRecord,
    alertTemplateDelteResult,
    setAlertTemplateDrawerOpen,
  } = props;
  return [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "模板名称",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "模板",
      dataIndex: "template",
      key: "template",
      render: (_: string, record: AlertTemplateRecord) => (
        <Button
          type="link"
          onClick={() => {
            setEditTemplate({
              templateDetailOpen: true,
              templateRecord: record,
              aggregation: false,
            });
          }}
        >
          查看
        </Button>
      ),
    },
    {
      title: "聚合模板",
      dataIndex: "aggregationTemplate",
      key: "aggregationTemplate",
      render: (_: string, record: AlertTemplateRecord) => (
        <Button
          type="link"
          onClick={() => {
            setEditTemplate({
              templateDetailOpen: true,
              templateRecord: record,
              aggregation: true,
            });
          }}
        >
          查看
        </Button>
      ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right" as const,
      render: (_: unknown, record: AlertTemplateRecord) => (
        <Space size="middle">
          <Button
            size="small"
            onClick={() => {
              setAlertTemplateRecord(record);
              setAlertTemplateDrawerOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除名称为:${record.name}的告警模板吗？此操作不可恢复。`}
            onConfirm={() => {
              alertTemplateDelteResult.run(record.id);
            }}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
};
