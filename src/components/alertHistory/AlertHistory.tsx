import { Descriptions, Tag, Tabs, Empty, Badge, Space, Typography } from "antd";
import {
  ClockCircleOutlined,
  InfoCircleOutlined,
  BellOutlined,
  CodeOutlined,
  TagsOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Matcher } from "@/types/alert/silence";
import { AlertHistoryItem } from "@/types/alert/history";

const { Text } = Typography;

export interface AlertDetailContentProps {
  data: AlertHistoryItem | undefined;
}

export const AlertDetailContent = (props: AlertDetailContentProps) => {
  const { data } = props;
  if (!data) return <Empty />;

  // 格式化静默规则中的 Matchers
  const renderMatchers = (matchers: Matcher[]) => {
    if (!matchers || !Array.isArray(matchers) || matchers.length === 0)
      return "无";
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {matchers.map((m, index) => (
          <Tag key={index} color="orange" style={{ margin: "2px 0" }}>
            <Text code strong style={{ color: "#d46b08" }}>
              {m.name}
            </Text>
            <span style={{ margin: "0 4px" }}>{m.type}</span>
            <Text strong>{m.value}</Text>
          </Tag>
        ))}
      </div>
    );
  };

  // 渲染静默类型
  const renderSilenceType = (type: number) => {
    switch (type) {
      case 1:
        return <Tag color="cyan">指纹静默</Tag>;
      case 2:
        return (
          <Tag color="blue" icon={<TagsOutlined />}>
            标签静默
          </Tag>
        );
      default:
        return <Tag>未知类型 ({type})</Tag>;
    }
  };

  // 统一的配置
  const tabContentStyle: React.CSSProperties = {
    height: "80vh",
    overflowY: "auto",
    padding: "12px 4px",
  };

  const commonLabelStyle: React.CSSProperties = {
    width: "120px",
    whiteSpace: "nowrap",
  };

  return (
    <Tabs
      defaultActiveKey="1"
      styles={{ root: { padding: "0 8px" } }}
      items={[
        {
          key: "1",
          label: (
            <span>
              <InfoCircleOutlined /> 详情预览
            </span>
          ),
          children: (
            <div style={tabContentStyle}>
              <Descriptions
                title="基础信息"
                bordered
                column={1}
                size="small"
                style={{ marginBottom: 16 }}
                styles={{ label: commonLabelStyle }}
              >
                <Descriptions.Item label="ID">
                  <Text strong>{data.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="告警名称">
                  <Text strong>{data.alertname}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={data.status === "firing" ? "red" : "green"}>
                    {data.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="严重程度">
                  <Tag
                    color={data.severity === "critical" ? "magenta" : "orange"}
                  >
                    {data.severity}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="实例">
                  {data.instance}
                </Descriptions.Item>
                <Descriptions.Item label="开始时间">
                  {data.startsAt || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="恢复时间">
                  {data.endsAt || "进行中"}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title="标签与内容"
                bordered
                column={1}
                size="small"
                styles={{ label: commonLabelStyle }}
              >
                <Descriptions.Item label="告警摘要">
                  {data.annotations?.summary}
                </Descriptions.Item>
                <Descriptions.Item label="详细描述">
                  {data.annotations?.description}
                </Descriptions.Item>
                <Descriptions.Item label="标签组">
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {Object.entries(data.labels || {}).map(([key, val]) => (
                      <Tag
                        key={key}
                        color="blue"
                        style={{ borderRadius: "10px" }}
                      >
                        <span style={{ color: "#8c8c8c" }}>{key}: </span>
                        {String(val)}
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          ),
        },
        {
          key: "2",
          label: (
            <span>
              <BellOutlined /> 发送记录
            </span>
          ),
          children: (
            <div style={tabContentStyle}>
              {data.alertSendRecord ? (
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  styles={{ label: commonLabelStyle }}
                >
                  <Descriptions.Item label="记录 ID">
                    <Text code>{data.alertSendRecord.id}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="发送状态">
                    <Badge
                      status={
                        data.alertSendRecord.sendStatus === "success"
                          ? "success"
                          : "error"
                      }
                      text={
                        data.alertSendRecord.sendStatus === "success"
                          ? "发送成功"
                          : "发送失败"
                      }
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="发送次数">
                    {data.sendCount} 次
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {data.alertSendRecord.createdAt}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    {data.alertSendRecord.updatedAt}
                  </Descriptions.Item>
                  {data.alertSendRecord.errorMessage && (
                    <Descriptions.Item label="错误原因">
                      <Text type="danger">
                        {data.alertSendRecord.errorMessage}
                      </Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              ) : (
                <Empty description="该告警尚未产生发送记录" />
              )}
            </div>
          ),
        },
        {
          key: "3",
          label: (
            <span>
              <ClockCircleOutlined /> 静默策略
            </span>
          ),
          children: (
            <div style={tabContentStyle}>
              {data.alertSilence ? (
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  styles={{ label: commonLabelStyle }}
                >
                  <Descriptions.Item label="静默规则 ID">
                    <Text code>{data.alertSilence.id}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="静默类型">
                    {renderSilenceType(data.alertSilence.type)}
                  </Descriptions.Item>
                  <Descriptions.Item label="静默原因">
                    {data.alertSilence.comment || "无"}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建者">
                    <Tag icon={<IdcardOutlined />}>
                      {data.alertSilence.createdBy}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="匹配规则">
                    {renderMatchers(data.alertSilence.matchers)}
                  </Descriptions.Item>
                  <Descriptions.Item label="有效时间">
                    <Space orientation="vertical" size={0}>
                      <span>
                        <Text type="secondary">起：</Text>
                        {data.alertSilence.startsAt}
                      </span>
                      <span>
                        <Text type="secondary">止：</Text>
                        {data.alertSilence.endsAt}
                      </span>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Empty description="该告警未被任何静默规则命中" />
              )}
            </div>
          ),
        },
        {
          key: "4",
          label: (
            <span>
              <CodeOutlined /> 原始 JSON
            </span>
          ),
          children: (
            <div
              style={{
                height: "80vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <pre
                style={{
                  flex: 1,
                  margin: 0,
                  padding: "16px",
                  background: "#001529",
                  color: "#d1d1d1",
                  borderRadius: "8px",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  overflow: "auto",
                  fontFamily:
                    "Menlo, Monaco, Consolas, 'Courier New', monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ),
        },
      ]}
    />
  );
};
