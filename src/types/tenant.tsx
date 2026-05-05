import { Popconfirm, TableProps, Tooltip } from "antd";
import dayjs from "dayjs"; // 建议使用 dayjs 处理时间，antd 自带
import { TenantRecord } from "./tenant";
import { Result } from "ahooks/lib/useRequest/src/types";
import { ApiResponse } from ".";

export interface GetTenantColumnsProps {
  TenantDelResult: Result<ApiResponse<unknown>, [id: string]>;
  setEditingRecord: React.Dispatch<React.SetStateAction<TenantRecord | null>>;
  setCreateTenantOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GetTenantColumns = (
  props: GetTenantColumnsProps,
): TableProps<TenantRecord>["columns"] => {
  const { TenantDelResult, setEditingRecord, setCreateTenantOpen } = props;

  return [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-bold">{text}</span>,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <Tooltip
          title={text}
          placement="topLeft"
          styles={{
            root: { maxWidth: "300px" },
            container: { wordBreak: "break-all" },
          }}
        >
          {text || "-"}
        </Tooltip>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => (
        <span style={{ color: "#8c8c8c" }}>
          {dayjs(text).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <span>
          <a
            style={{ marginRight: 16 }}
            onClick={() => {
              setEditingRecord(record);
              setCreateTenantOpen(true);
            }}
          >
            编辑
          </a>
          {/* 使用 Popconfirm 包裹删除按钮 */}
          <Popconfirm
            title="删除租户"
            description={`确定要删除租户 "${record.name}" 吗？`}
            onConfirm={() => TenantDelResult.run(record.id)} // 用户点击“确定”后触发
            okText="确定"
            cancelText="取消"
            okButtonProps={{
              danger: true,
              loading: TenantDelResult.loading,
            }} // 让确定按钮显示为红色
          >
            <a style={{ color: "red" }}>删除</a>
          </Popconfirm>
        </span>
      ),
    },
  ];
};
