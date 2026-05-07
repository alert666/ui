import AlertTemplateDetailComponent from "@/components/alertTemplate/alertTemplateDetial";
import DynamicTable from "@/components/base/DynamicTable";
import { GetAlertTemplateList } from "@/services/alertTemplate";
import {
  AlertTemplateListReq,
  AlertTemplateRecord,
  GetAlertTemplateColumns,
} from "@/types/alert/template";
import { PageOptionEnum } from "@/types/enum";
import { useRequest } from "ahooks";
import { theme } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function AlertTemplatePage() {
  // ------ 变量定义 ------
  const { token } = theme.useToken();
  // const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  // const [activeDim, setActiveDim] = useState<string>("name");
  // const { message } = App.useApp();

  // ------ 告警模版列表请求 ------
  const alertTemplateResult = useRequest(GetAlertTemplateList, {
    manual: true,
  });
  // ------ 监听 URL 参数，自动发起接口调用 ------
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const name = searchParams.get("name");
    if (!page || !pageSize) {
      const newParams = new URLSearchParams(searchParams);
      if (!page) newParams.set("page", PageOptionEnum.DEFAULTPAGE.toString());
      if (!pageSize)
        newParams.set("pageSize", PageOptionEnum.DEFAULTPAGESIZE.toString());
      setSearchParams(newParams, { replace: true });
      return;
    }

    const params: AlertTemplateListReq = {
      page: page ? Number(page) : PageOptionEnum.DEFAULTPAGE,
      pageSize: pageSize ? Number(pageSize) : PageOptionEnum.DEFAULTPAGESIZE,
      name: name ? name : undefined,
    };
    alertTemplateResult.run(params);
  }, [searchParams]);

  // ------ 查看 alertTemplate内容 ------
  const [templateDetailOpen, setTemplateDetailOpen] = useState<boolean>(false);
  const [templateRecord, setTemplateRecord] = useState<AlertTemplateRecord>(
    {} as AlertTemplateRecord,
  );
  return (
    <>
      <AlertTemplateDetailComponent
        token={token}
        modelOpen={templateDetailOpen}
        templateRecord={templateRecord}
        setTemplateDetailOpen={setTemplateDetailOpen}
        setTemplateRecord={setTemplateRecord}
      />
      <div
        className="m-2 p-5"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center", // 改为 center 对齐更美观
            marginBottom: 16,
            gap: 16,
          }}
        ></div>
      </div>
      <DynamicTable
        size="large"
        loading={alertTemplateResult.loading}
        dataSource={alertTemplateResult.data?.list || []}
        columns={GetAlertTemplateColumns({
          setTemplateDetailOpen,
          setTemplateRecord,
        })}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 10,
          total: alertTemplateResult.data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条数据`,
          onChange: (p, s) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", p.toString());
            params.set("pageSize", s.toString());
            setSearchParams(params);
          },
        }}
        bordered
      />
    </>
  );
}

export default AlertTemplatePage;
