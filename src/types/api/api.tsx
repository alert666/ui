import { Button, Tag, Tooltip } from "antd";
import type { Api } from "./api";
import { HookAPI } from "antd/es/modal/useModal";
import { MessageInstance } from "antd/es/message/interface";
export type DataType = {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
};

export const ApiColumns = () => {
  return [
    // {
    //   dataIndex: "id",
    //   title: "ID",
    // },
    {
      dataIndex: "name",
      title: "名称",
    },
    {
      dataIndex: "method",
      title: "方法",
    },
    {
      dataIndex: "path",
      title: "路径",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      dataIndex: "effect",
      title: "效果",
      ellipsis: true,
      render: (effect: string) => (
        <Tooltip placement="topLeft" title={effect}>
          <span>{effect}</span>
        </Tooltip>
      ),
    },
    {
      dataIndex: "description",
      title: "描述",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
  ];
};

export interface ApiListColumnsProps {
  modal: HookAPI;
  message: MessageInstance;
  deleteApiRun: (id: string) => void;
  deleteApiLoad: boolean;
  setUpdateApiOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateApiData: React.Dispatch<React.SetStateAction<Api>>;
}

export function ApiListColumns({
  modal,
  message,
  deleteApiRun,
  deleteApiLoad,
  setUpdateApiOpen,
  setUpdateApiData,
}: ApiListColumnsProps) {
  return [
    {
      title: "ID",
      dataIndex: "id",
      width: 150,
    },
    {
      title: "名称",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "路径",
      dataIndex: "path",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "方法",
      dataIndex: "method",
      width: 80,
      render: (text: string) => (
        <Tag color="geekblue">{text.toUpperCase()}</Tag>
      ),
    },
    {
      title: "效果",
      dataIndex: "effect",
      width: 80,
      render: (effect: string) => (
        <Tag color="geekblue">{effect.toUpperCase()}</Tag>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "操作",
      dataIndex: "action",
      width: "10%",
      render: (_: unknown, record: Api) => (
        <div className="flex gap-2">
          <Button
            type="link"
            onClick={() => {
              setUpdateApiOpen(true);
              setUpdateApiData(record);
            }}
          >
            修改
          </Button>
          <Button
            type="link"
            danger
            loading={deleteApiLoad}
            onClick={() => {
              modal.confirm({
                title: "删除确认",
                content: `确定要删除API【${record.name}】吗？`,
                okText: "确定",
                cancelText: "取消",
                okType: "danger",
                onOk: () => {
                  if (record.name === "admin" || record.id === "1") {
                    message.error("操作失败");
                    return;
                  }
                  deleteApiRun(record.id.toString());
                },
              });
            }}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];
}
