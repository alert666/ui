import { AlertSilence, Matcher } from "@/types/alert/silence";
import { Space, Tag, Typography, Tooltip, Badge, Button, Divider } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

export const GetAlertSilenceColumns = (): ColumnsType<AlertSilence> => {
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
    },
    {
      title: "匹配规则 (Matchers)",
      dataIndex: "matchers",
      key: "matchers",
      minWidth: 400,
      render: (matchers: Matcher[]) => {
        const displayCount = 4;
        const hasMore = matchers.length > displayCount;
        const itemsToShow = matchers.slice(0, displayCount);

        return (
          <div
            style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}
          >
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
      title: "开始时间",
      dataIndex: "startsAt",
      key: "startsAt",
      width: 180,
      sorter: (a, b) => dayjs(a.startsAt).unix() - dayjs(b.startsAt).unix(),
      render: (text) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text style={{ fontSize: "13px", fontWeight: 500 }}>
            <PlayCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
            {dayjs(text).format("YYYY-MM-DD HH:mm")}
          </Text>
        </div>
      ),
    },
    {
      title: "结束时间",
      dataIndex: "endsAt",
      key: "endsAt",
      width: 280, // 增加宽度以容纳一行显示
      sorter: (a, b) => dayjs(a.endsAt).unix() - dayjs(b.endsAt).unix(),
      render: (text) => {
        const end = dayjs(text);
        const now = dayjs();
        const isExpired = end.isBefore(now);
        const diffDays = end.diff(now, "day");

        return (
          <div
            style={{
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ClockCircleOutlined
              style={{ color: isExpired ? "#bfbfbf" : "#ff4d4f" }}
            />

            {/* 日期文本 */}
            <Text
              type={isExpired ? "secondary" : undefined}
              style={{
                fontSize: "13px",
                color: isExpired ? "#bfbfbf" : "inherit",
              }}
            >
              {end.format("YYYY-MM-DD HH:mm")}
            </Text>

            {/* 动态状态标签 */}
            {isExpired ? (
              <Tag
                variant="filled"
                style={{
                  color: "#bfbfbf",
                  backgroundColor: "#f5f5f5",
                  fontSize: "11px",
                  margin: 0,
                }}
              >
                已过期
              </Tag>
            ) : (
              <Tag
                variant="filled"
                color={diffDays < 3 ? "red" : "orange"}
                style={{ fontSize: "11px", margin: 0 }}
              >
                {diffDays === 0 ? "今天到期" : `剩 ${diffDays} 天`}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "创建人",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 120,
      render: (text) => (
        <Space size={4}>
          <UserOutlined style={{ color: "#bfbfbf" }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "备注",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
      render: (text) => <Text type="secondary">{text || "无备注"}</Text>,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space separator={<Divider orientation="vertical" />}>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => console.log("Edit", record.id)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => console.log("Delete", record.id)}
            />
          </Tooltip>
        </Space>
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
