import { useEffect, useState, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  DatePicker,
  Row,
  Col,
  theme,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  AudioMutedOutlined,
} from "@ant-design/icons";
import { useRequest } from "ahooks";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";

import DynamicTable from "@/components/base/DynamicTable";
import { GetAlertHistorycolumns } from "@/types/alert/History.tsx";
import {
  AlertHistoryItem,
  AlertHistoryListRequest,
  AlertHistoryFormValues,
  SEARCH_DIMENSIONS,
} from "@/types/alert/history";
import {
  GetAlertHistoryList,
  UpdateAlertHistory,
} from "@/services/alertHistory";
import { CreateAlertSilence } from "@/services/alertSilence";
import useApp from "antd/es/app/useApp";
import { CreateAlertSilenceRequest } from "@/types/alert/silence";

const AlertHistoryPage = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<AlertHistoryFormValues>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDim, setActiveDim] = useState("alertName");

  const {
    data: alertHistoryData,
    loading,
    run,
    refresh: alertRefresh,
  } = useRequest(GetAlertHistoryList, { manual: true });

  // --- 逻辑 1: 解析 URL 构造请求参数 ---
  useEffect(() => {
    const params: AlertHistoryListRequest = {
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
      status: searchParams.get("status") || undefined,
      alertSendRecordId:
        Number(searchParams.get("alertSendRecordId")) || undefined,
      severity: searchParams.get("severity") || undefined,
      alertName: searchParams.get("alertName") || undefined,
      fingerprint: searchParams.get("fingerprint") || undefined,
      instance: searchParams.get("instance") || undefined,
      startsAt: searchParams.get("startsAt") || undefined,
      endsAt: searchParams.get("endsAt") || undefined,
      labels: searchParams.getAll("labels"),
    };

    run(params);
  }, [searchParams, run, form]);

  // --- 逻辑 2: 处理添加筛选条件 ---
  const onHandleSearch = (values: AlertHistoryFormValues) => {
    const { searchKey, searchValue, startsAt, endsAt } = values;
    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.set("page", "1");

    // 处理维度搜索
    if (searchValue) {
      const dimension = SEARCH_DIMENSIONS.find((d) => d.value === searchKey);
      if (dimension?.isLabel) {
        const labelStr = `${searchKey}=${searchValue}`;
        const existingLabels = newSearchParams.getAll("labels");
        if (!existingLabels.includes(labelStr)) {
          newSearchParams.append("labels", labelStr);
        }
      } else {
        newSearchParams.set(searchKey, searchValue);
      }
      form.setFieldValue("searchValue", ""); // 清空
    }

    // 🌟 处理时间并清空表单
    if (startsAt) {
      newSearchParams.set("startsAt", startsAt.toISOString());
      form.setFieldValue("startsAt", null); // 🌟 清空 UI
    }
    if (endsAt) {
      newSearchParams.set("endsAt", endsAt.toISOString());
      form.setFieldValue("endsAt", null); // 🌟 清空 UI
    }

    setSearchParams(newSearchParams);
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({ page: "1", pageSize: "10", status: "firing" });
  };

  // --- 逻辑 3: 渲染已选条件标签 ---
  const renderFilterTags = useMemo(() => {
    const nodes: React.ReactNode[] = [];

    // 1. 内置字段
    SEARCH_DIMENSIONS.filter((d) => !d.isLabel).forEach((dim) => {
      const val = searchParams.get(dim.value);
      if (val) {
        nodes.push(
          <Tag
            key={dim.value}
            closable
            onClose={() => {
              const p = new URLSearchParams(searchParams);
              p.delete(dim.value);
              setSearchParams(p);
            }}
          >
            {dim.label}:{" "}
            {dim.options?.find((o) => o.value === val)?.label || val}
          </Tag>,
        );
      }
    });

    // 2. Labels
    searchParams.getAll("labels").forEach((labelStr) => {
      nodes.push(
        <Tag
          key={labelStr}
          color="blue"
          closable
          onClose={() => {
            const allLabels = searchParams
              .getAll("labels")
              .filter((l) => l !== labelStr);
            const p = new URLSearchParams(searchParams);
            p.delete("labels");
            allLabels.forEach((l) => p.append("labels", l));
            setSearchParams(p);
          }}
        >
          标签: {labelStr}
        </Tag>,
      );
    });

    // 3. 时间标签（支持显示时分秒）
    if (searchParams.get("startsAt")) {
      nodes.push(
        <Tag
          key="st"
          closable
          onClose={() => {
            const p = new URLSearchParams(searchParams);
            p.delete("startsAt");
            setSearchParams(p);
          }}
        >
          开始于:{" "}
          {dayjs(searchParams.get("startsAt")).format("YYYY-MM-DD HH:mm:ss")}
        </Tag>,
      );
    }
    if (searchParams.get("endsAt")) {
      nodes.push(
        <Tag
          key="et"
          closable
          onClose={() => {
            const p = new URLSearchParams(searchParams);
            p.delete("endsAt");
            setSearchParams(p);
          }}
        >
          结束于:{" "}
          {dayjs(searchParams.get("endsAt")).format("YYYY-MM-DD HH:mm:ss")}
        </Tag>,
      );
    }

    return nodes;
  }, [searchParams, setSearchParams]);

  const { run: updateRun, loading: updateLoading } = useRequest(
    UpdateAlertHistory,
    {
      manual: true,
      onSuccess: () => {
        alertRefresh();
      },
    },
  );
  const { modal } = useApp();
  const [silenceForm] = Form.useForm();
  const { run: createSilenceRun, loading: createSilenceLoading } = useRequest(
    CreateAlertSilence,
    {
      manual: true,
      onSuccess: () => {
        message.success(`静默创建成功`);
        alertRefresh();
      },
    },
  );
  const handleSilence = (record: AlertHistoryItem) => {
    // 默认结束时间设为当前时间 + 2小时
    const defaultEndTime = dayjs().add(2, "h");

    silenceForm.setFieldsValue({
      endsAt: defaultEndTime,
      comment: "",
    });

    modal.confirm({
      title: "配置告警静默",
      width: 500,
      icon: <AudioMutedOutlined />,
      content: (
        <Form form={silenceForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="告警信息">
            <Typography.Text strong>{record.alertname}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
              指纹: {record.fingerprint}
            </Typography.Text>
          </Form.Item>

          <Form.Item
            name="endsAt"
            label="静默结束时间"
            rules={[{ required: true, message: "请选择结束时间" }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
              placeholder="请选择静默结束时间"
              // 限制：不能选择今天以前的日期
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
              // 可选：设置快捷选项
              presets={[
                { label: "1小时后", value: dayjs().add(1, "h") },
                { label: "12小时后", value: dayjs().add(12, "h") },
                { label: "明天此时", value: dayjs().add(1, "d") },
                { label: "下周此时", value: dayjs().add(7, "d") },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label="静默原因"
            rules={[{ required: true, message: "请输入静默原因" }]}
          >
            <Input.TextArea
              placeholder="例如：数据库例行维护、已知网络波动等"
              rows={3}
            />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        const values = await silenceForm.validateFields();

        const payload: CreateAlertSilenceRequest = {
          cluster: record.cluster,
          type: 1, // 指纹静默
          fingerprint: record.fingerprint,
          status: 1,
          startsAt: dayjs().toISOString(), // 默认从现在开始
          endsAt: values.endsAt.toISOString(), // 直接使用选择器的时间
          comment: values.comment,
          createdBy: "console",
        };
        createSilenceRun(payload);
      },
    });
  };

  return (
    <div className="px-4">
      <div
        className="mb-4 p-4"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Form form={form} layout="inline" onFinish={onHandleSearch}>
          <Row gutter={[12, 12]} align="middle" className="w-full">
            <Col>
              <Space.Compact>
                <Form.Item name="searchKey" noStyle initialValue="alertName">
                  <Select
                    style={{ width: 110 }}
                    listHeight={300}
                    onChange={(val) => {
                      setActiveDim(val);
                      form.setFieldValue("searchValue", undefined);
                    }}
                  >
                    {SEARCH_DIMENSIONS.map((d) => (
                      <Select.Option key={d.value} value={d.value}>
                        {d.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="searchValue" noStyle>
                  {SEARCH_DIMENSIONS.find((d) => d.value === activeDim)
                    ?.type === "select" ? (
                    <Select
                      style={{ width: 150 }}
                      placeholder="请选择"
                      options={
                        SEARCH_DIMENSIONS.find((d) => d.value === activeDim)
                          ?.options
                      }
                      onChange={() => form.submit()}
                    />
                  ) : (
                    <Input
                      style={{ width: 200 }}
                      placeholder="输入并回车添加"
                      allowClear
                      onPressEnter={() => form.submit()}
                    />
                  )}
                </Form.Item>
              </Space.Compact>
            </Col>

            {/* 🌟 这里的 DatePicker 增加了 showTime */}
            <Col>
              <Form.Item name="startsAt" noStyle>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="开始时间"
                  onOk={() => form.submit()}
                />
              </Form.Item>
            </Col>

            <Col>
              <Form.Item name="endsAt" noStyle>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="结束时间"
                  onOk={() => form.submit()}
                />
              </Form.Item>
            </Col>

            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => form.submit()}
                >
                  添加筛选
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        {renderFilterTags.length > 0 && (
          <div className="mt-3 flex items-start">
            <Typography.Text
              type="secondary"
              className="mr-2 mt-1"
              style={{ fontSize: 12 }}
            >
              已选条件:
            </Typography.Text>
            <Space size={[0, 8]} wrap>
              {renderFilterTags}
            </Space>
          </div>
        )}
      </div>

      <DynamicTable<AlertHistoryItem>
        size="middle"
        extraHeight={renderFilterTags.length > 0 ? 210 : 80}
        loading={loading || updateLoading || createSilenceLoading}
        columns={GetAlertHistorycolumns({ token, updateRun, handleSilence })}
        dataSource={alertHistoryData?.list || []}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 10,
          total: alertHistoryData?.total || 0,
          onChange: (p, s) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", p.toString());
            params.set("pageSize", s.toString());
            setSearchParams(params);
          },
        }}
      />
    </div>
  );
};

export default AlertHistoryPage;
