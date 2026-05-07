import { Button, Space } from "antd";
import dayjs from "dayjs";
import { ListReq } from "..";

export interface AlertTemplateListReq extends ListReq {
  name?: string;
}

export interface AlertTemplateListRes {
  total: number;
  page: number;
  pageSize: number;
  list: AlertTemplateRecord[];
}

export interface AlertTemplateRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  template: string;
  aggregationTemplate: string;
}

// 定义操作回调的接口
export interface GetAlertTemplateColumnsProps {
  setTemplateDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTemplateRecord: React.Dispatch<React.SetStateAction<AlertTemplateRecord>>;
}

export const GetAlertTemplateColumns = (
  props: GetAlertTemplateColumnsProps,
) => {
  const { setTemplateDetailOpen, setTemplateRecord } = props;
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
      title: "模板内容",
      dataIndex: "template",
      key: "template",
      render: (_: string, record: AlertTemplateRecord) => (
        <Button
          type="link"
          onClick={() => {
            setTemplateDetailOpen(true);
            setTemplateRecord(record);
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
      render: () => (
        <Space size="middle">
          <Button size="small">编辑</Button>
          <Button size="small" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];
};
