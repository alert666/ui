import { AlertSilence, Matcher } from "@/types/alert/silence";
import {
  Space,
  Tag,
  Typography,
  Tooltip,
  Badge,
  Button,
  Popconfirm,
  GlobalToken,
} from "antd";
import { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  UserOutlined,
  PartitionOutlined,
  KeyOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ApiResponse } from "@/types";
import { Result } from "ahooks/lib/useRequest/src/types";
const { Text } = Typography;

interface GetAlertSilenceColumnsProps {
  token: GlobalToken;
  deleteResult: Result<ApiResponse<unknown>, [id: string]>;
}

export const GetAlertSilenceColumns = (
  props: GetAlertSilenceColumnsProps,
): ColumnsType<AlertSilence> => {
  return [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (id) => <Text type="secondary">#{id}</Text>,
    },
    {
      title: "所属集群",
      dataIndex: "cluster",
      key: "cluster",
      width: 120,
      render: (name: string) => (
        <Typography.Text
          copyable
          strong
          style={{ color: props.token.colorPrimary }}
        >
          {name}
        </Typography.Text>
      ),
    },
    {
      title: "静默规则 / 指纹",
      key: "match_rule",
      minWidth: 400,
      render: (_, record) => {
        // 解构数据，设置默认值防止 null 报错
        const { matchers = [], fingerprint } = record;

        // 1. 优先判断指纹静默
        if (fingerprint) {
          return (
            <Space>
              <Tag
                icon={<KeyOutlined />}
                color="cyan"
                style={{ borderRadius: "4px" }}
              >
                指纹静默
              </Tag>
              <Text code copyable={{ text: fingerprint }}>
                {fingerprint}
              </Text>
            </Space>
          );
        }

        // 2. 判断 Label 匹配静默 (确保 matchers 不为 null 且有长度)
        if (matchers && matchers.length > 0) {
          const displayCount = 3;
          const hasMore = matchers.length > displayCount;
          const itemsToShow = matchers.slice(0, displayCount);

          return (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Tag
                icon={<PartitionOutlined />}
                style={{ border: "none", backgroundColor: "#f5f5f5" }}
              >
                标签匹配
              </Tag>
              {itemsToShow.map((m, index) => (
                <ModernMatcher key={index} m={m} />
              ))}
              {hasMore && (
                <Tooltip
                  title={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {matchers.slice(displayCount).map((m, i) => (
                        <div key={i}>{`${m.name} ${m.type} ${m.value}`}</div>
                      ))}
                    </div>
                  }
                >
                  <Tag
                    color="default"
                    style={{ cursor: "pointer", borderRadius: "6px" }}
                  >
                    +{matchers.length - displayCount} ...
                  </Tag>
                </Tooltip>
              )}
            </div>
          );
        }

        // 3. 兜底显示
        return <Text type="secondary">无匹配信息</Text>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => {
        const configs = {
          0: { status: "default" as const, text: "禁用", color: "#8c8c8c" },
          1: {
            status: "processing" as const,
            text: "生效中",
            color: "#52c41a",
          },
          2: { status: "warning" as const, text: "已过期", color: "#faad14" },
        };
        const config = configs[status as keyof typeof configs] || configs[0];
        return (
          <Badge
            color={config.color}
            text={config.text}
            style={{ fontWeight: 500 }}
          />
        );
      },
    },
    {
      title: "有效期",
      key: "times",
      width: 250,
      render: (_, record) => {
        const end = dayjs(record.endsAt);
        const now = dayjs();
        const isExpired = end.isBefore(now);

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              始：{dayjs(record.startsAt).format("YYYY-MM-DD HH:mm")}
            </Text>
            <Space size={4}>
              <Text style={{ fontSize: "12px" }}>
                终：{end.format("YYYY-MM-DD HH:mm")}
              </Text>
              {isExpired ? (
                <Tag variant="filled" style={{ margin: 0, fontSize: "11px" }}>
                  已过期
                </Tag>
              ) : (
                <Tag
                  color="orange"
                  variant="filled"
                  style={{ margin: 0, fontSize: "11px" }}
                >
                  生效中
                </Tag>
              )}
            </Space>
          </div>
        );
      },
    },
    {
      title: "创建人",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 100,
      render: (text) => (
        <Space size={4}>
          <UserOutlined style={{ color: "#bfbfbf", fontSize: "12px" }} />
          <Text style={{ fontSize: "13px" }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除该模板吗？"
          description="删除后将无法找回，请谨慎操作。"
          onConfirm={() => {
            props.deleteResult.run(record.id);
          }}
          okText="确定"
          cancelText="取消"
          okButtonProps={{ loading: props.deleteResult.loading }}
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];
};
const ModernMatcher = ({ m }: { m: Matcher }) => {
  const isRegex = m.type.includes("~");

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "stretch",
        borderRadius: "6px",
        border: "1px solid #d9d9d9",
        overflow: "hidden",
        margin: "4px",
        fontSize: "13px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      {/* Key 部分 */}
      <div
        style={{
          backgroundColor: "#f0f5ff",
          color: "#0050b3",
          padding: "2px 8px",
          borderRight: "1px solid #adc6ff",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
        }}
      >
        {m.name}
      </div>

      {/* 运算符 部分 */}
      <div
        style={{
          backgroundColor: "#fff",
          color: isRegex ? "#722ed1" : "#8c8c8c",
          padding: "2px 6px",
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          fontFamily: "monospace",
        }}
      >
        {m.type}
      </div>

      {/* Value 部分 */}
      <div
        style={{
          backgroundColor: isRegex ? "#f9f0ff" : "#f6ffed",
          color: isRegex ? "#531dab" : "#389e0d",
          padding: "2px 8px",
          borderLeft: "1px dotted #d9d9d9",
          fontFamily: "SFMono-Regular, Consolas, Monaco, monospace",
        }}
      >
        {m.value}
      </div>
    </div>
  );
};
