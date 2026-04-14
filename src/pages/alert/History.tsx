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
  PlusOutlined,
  AudioMutedOutlined,
  SyncOutlined,
  FireOutlined,
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
import { PageOptionEnum } from "@/types/enum";

const AlertHistoryPage = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<AlertHistoryFormValues>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDim, setActiveDim] = useState<string>("alertName");

  const {
    data: alertHistoryData,
    loading,
    run,
    refresh: alertRefresh,
  } = useRequest(GetAlertHistoryList, { manual: true });

  // --- 逻辑 1: 解析 URL 构造请求参数并发起请求 ---
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const status = searchParams.get("status");

    // 1. 【核心修复】检查必要参数是否完整
    // 如果这三个核心参数有一个缺失，就说明 URL 处于“非就绪”状态
    if (!page || !pageSize) {
      const newParams = new URLSearchParams(searchParams);
      if (!page) newParams.set("page", PageOptionEnum.DEFAULTPAGE.toString());
      if (!pageSize)
        newParams.set("pageSize", PageOptionEnum.DEFAULTPAGESIZE.toString());
      if (!status) newParams.set("status", "firing");

      // 更新 URL，replace: true 保证不会产生多余的浏览器历史记录
      // 这一步执行后，useEffect 会因为 searchParams 改变而再次触发
      setSearchParams(newParams, { replace: true });

      // 🌟 关键：补全 URL 期间直接返回，拦截本次不完整的请求
      return;
    }

    // 2. 如果代码执行到这里，说明 page, pageSize, status 都在 URL 里了
    // 此时只发一次完整的请求
    const urlStartsAt = searchParams.get("startsAt");
    const urlEndsAt = searchParams.get("endsAt");

    // 重置搜索框显示（如果需要）
    form.setFieldsValue({
      searchValue: undefined,
    });

    const params: AlertHistoryListRequest = {
      page: Number(page),
      pageSize: Number(pageSize),
      status: status || undefined,
      alertSendRecordId: searchParams.get("alertSendRecordId")
        ? Number(searchParams.get("alertSendRecordId"))
        : undefined,
      severity: searchParams.get("severity") || undefined,
      alertName: searchParams.get("alertName") || undefined,
      fingerprint: searchParams.get("fingerprint") || undefined,
      instance: searchParams.get("instance") || undefined,
      startsAt: urlStartsAt || undefined,
      endsAt: urlEndsAt || undefined,
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
      form.setFieldValue("searchValue", undefined);
    }

    // 🌟 处理时间：设置 URL 并清空输入框
    if (startsAt && dayjs.isDayjs(startsAt)) {
      newSearchParams.set("startsAt", startsAt.unix().toString());
      form.setFieldValue("startsAt", null); // UI 清空
    }
    if (endsAt && dayjs.isDayjs(endsAt)) {
      newSearchParams.set("endsAt", endsAt.unix().toString());
      form.setFieldValue("endsAt", null); // UI 清空
    }

    setSearchParams(newSearchParams);
  };

  const handleReset = () => {
    form.resetFields();
    // 重置后回到默认状态
    const status = searchParams.get("status");
    const tenant = searchParams.get("tenant") || "all";
    if (status) {
      setSearchParams({
        page: PageOptionEnum.DEFAULTPAGE.toString(),
        pageSize: PageOptionEnum.DEFAULTPAGESIZE.toString(),
        status: status,
        tenant: tenant,
      });
    } else {
      setSearchParams({
        page: PageOptionEnum.DEFAULTPAGE.toString(),
        pageSize: PageOptionEnum.DEFAULTPAGESIZE.toString(),
        status: "firing",
        tenant: tenant,
      });
    }
  };

  // --- 逻辑 3: 渲染已选条件标签 ---
  const renderFilterTags = useMemo(() => {
    const nodes: React.ReactNode[] = [];

    // 渲染常规维度
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

    // 渲染标签维度
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

    // 渲染时间标签
    const st = searchParams.get("startsAt");
    if (st) {
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
          开始于: {dayjs.unix(Number(st)).format("YYYY-MM-DD HH:mm:ss")}
        </Tag>,
      );
    }

    const et = searchParams.get("endsAt");
    if (et) {
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
          结束于: {dayjs.unix(Number(et)).format("YYYY-MM-DD HH:mm:ss")}
        </Tag>,
      );
    }

    return nodes;
  }, [searchParams, setSearchParams]);

  // --- 其他方法 (handleSilence等) 保持不变 ---
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
  const [silenceForm] = Form.useForm<{
    endsAt: dayjs.Dayjs;
    comment: string;
  }>();

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
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label="静默原因"
            rules={[{ required: true, message: "请输入静默原因" }]}
          >
            <Input.TextArea placeholder="请输入原因" rows={3} />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        const values = await silenceForm.validateFields();
        const payload: CreateAlertSilenceRequest = {
          cluster: record.cluster,
          type: 1,
          fingerprint: record.fingerprint,
          status: 1,
          startsAt: dayjs().unix(),
          endsAt: values.endsAt.unix(),
          comment: values.comment,
          createdBy: "console",
        };
        createSilenceRun(payload);
      },
    });
  };

  // useMount(() => {
  //   const page = searchParams.get("page");
  //   const pageSize = searchParams.get("pageSize");
  //   const status = searchParams.get("status");
  //   if (!page || !pageSize || !status) {
  //     const newParams = new URLSearchParams(searchParams);
  //     if (!page) newParams.set("page", PageOptionEnum.DEFAULTPAGE.toString());
  //     if (!pageSize)
  //       newParams.set("pageSize", PageOptionEnum.DEFAULTPAGESIZE.toString());
  //     if (!status) newParams.set("status", "firing");
  //     setSearchParams(newParams, {
  //       replace: true,
  //     });
  //   }
  // });

  return (
    <div className="px-2">
      <div
        className="m-2 p-4"
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
                      placeholder="输入并回车"
                      allowClear
                      onPressEnter={() => form.submit()}
                    />
                  )}
                </Form.Item>
              </Space.Compact>
            </Col>

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
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => form.submit()}
                  // 稍微加深主色调的质感
                  style={{ borderRadius: "6px", fontWeight: 500 }}
                >
                  添加筛选
                </Button>

                <Button
                  icon={<FireOutlined />}
                  onClick={handleReset}
                  // 使用 danger 颜色但开启 ghost 模式，使其看起来专业而不刺眼
                  danger
                  ghost
                  style={{ borderRadius: "6px" }}
                >
                  Firing告警
                </Button>

                <Button
                  icon={<SyncOutlined />}
                  onClick={() => alertRefresh()}
                  loading={loading}
                  type="text"
                  className="bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  style={{ borderRadius: "6px" }}
                >
                  刷新
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
        size="small"
        extraHeight={renderFilterTags.length > 0 ? 210 : 100}
        loading={loading || updateLoading || createSilenceLoading}
        columns={GetAlertHistorycolumns({ token, updateRun, handleSilence })}
        dataSource={alertHistoryData?.list || []}
        pagination={{
          style: { marginRight: 16 },
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          current:
            Number(searchParams.get("page")) || PageOptionEnum.DEFAULTPAGE,
          pageSize:
            Number(searchParams.get("pageSize")) ||
            PageOptionEnum.DEFAULTPAGESIZE,
          total: alertHistoryData?.total || 0,
          onChange: (p, s) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", p.toString());
            params.set("pageSize", s.toString());
            setSearchParams(params);
          },
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} 条，共 ${total} 条数据`,
        }}
      />
    </div>
  );
};

export default AlertHistoryPage;
