import AlertTemplateDetailComponent from "@/components/alertTemplate/alertTemplateDetial";
import AlertTemplateDrawer from "@/components/alertTemplate/EditAlertTemplate";
import DynamicTable from "@/components/base/DynamicTable";
import {
  DeleteAlertTemplate,
  GetAlertTemplateList,
  UpdateAlertTemplate,
} from "@/services/alertTemplate";
import {
  AlertTemplateListReq,
  AlertTemplateRecord,
  EditTemplateState,
  GetAlertTemplateColumns,
} from "@/types/alert/template";
import { PageOptionEnum } from "@/types/enum";
import { useRequest } from "ahooks";
import { message, theme } from "antd";
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

  // ------ 监听 URL 参数，自动发起 AlertTemplateList 接口调用 ------
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
  const [editTemplate, setEditTemplate] = useState<EditTemplateState>(
    {} as EditTemplateState,
  );

  // ------ 更新告警模板请求 ------
  const alertTemplateUpdateResult = useRequest(UpdateAlertTemplate, {
    manual: true,
    onSuccess: () => {
      message.success("更新成功");
      alertTemplateResult.refresh();
    },
  });

  // ------ 编辑 AlertTemplate ------
  const [alertTemplateDrawerOpen, setAlertTemplateDrawerOpen] =
    useState<boolean>(false);
  const [alertTemplateRecord, setAlertTemplateRecord] =
    useState<AlertTemplateRecord>({} as AlertTemplateRecord);

  // ------ 删除 AlertTemplate ------
  const alertTemplateDelteResult = useRequest(DeleteAlertTemplate, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
    },
  });

  return (
    <>
      <AlertTemplateDetailComponent
        token={token}
        editTemplate={editTemplate}
        setEditTemplate={setEditTemplate}
        alertTemplateUpdateResult={alertTemplateUpdateResult}
      />
      <AlertTemplateDrawer
        toke={token}
        visible={alertTemplateDrawerOpen}
        onClose={() => {
          setAlertTemplateRecord({} as AlertTemplateRecord);
          setAlertTemplateDrawerOpen(false);
        }}
        record={alertTemplateRecord}
        alertTemplateUpdateResult={alertTemplateUpdateResult}
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
            alignItems: "center",
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
          setEditTemplate,
          setAlertTemplateRecord,
          alertTemplateDelteResult,
          setAlertTemplateDrawerOpen,
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
