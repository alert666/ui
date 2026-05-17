import { GetAlertSilenceColumns } from "@/components/alertSilence/AlertSilenceTableColums";
import DynamicTable from "@/components/base/DynamicTable";
import { GetAlertSilenceList } from "@/services/alertSilence";
import { AlertSilence, AlertSilenceListReq } from "@/types/alert/silence";
import { PageOptionEnum } from "@/types/enum";
import { useRequest } from "ahooks";
import { theme } from "antd";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function AlertSilencePage() {
  // const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const [searchParams, setSearchParams] = useSearchParams();

  // ------ silence 列表请求 ------
  const alertSilenceListRes = useRequest(GetAlertSilenceList, { manual: true });

  // ------ Url 驱动获取 alertSilence 列表 ------
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const rawStatus = searchParams.get("status"); // 1. 提前获取 status

    // 2. 统一拦截判断：如果任一核心参数缺失，则补全 URL 并拦截请求
    if (!page || !pageSize || rawStatus === null) {
      const newParams = new URLSearchParams(searchParams);

      if (!page) {
        newParams.set("page", PageOptionEnum.DEFAULTPAGE.toString());
      }
      if (!pageSize) {
        newParams.set("pageSize", PageOptionEnum.DEFAULTPAGESIZE.toString());
      }
      if (rawStatus === null) {
        // 如果 URL 里没有 status 参数，设置为默认值 "1"
        newParams.set("status", "1");
      }

      // 更新 URL，这会触发下一次 useEffect 执行
      setSearchParams(newParams, { replace: true });
      return;
    }

    // 3. 此时 page, pageSize, status 肯定都存在于 URL 中
    const statusNum = Number(rawStatus);

    // 校验 status 是否在合法范围 [0, 1, 2] 内，防止用户手动输入非法值
    const validatedStatus: AlertSilenceListReq["status"] = [0, 1, 2].includes(
      statusNum,
    )
      ? (statusNum as AlertSilenceListReq["status"])
      : 1;

    const params: AlertSilenceListReq = {
      page: Number(page),
      pageSize: Number(pageSize),
      status: validatedStatus,
    };

    alertSilenceListRes.run(params);
  }, [searchParams]);

  return (
    <>
      {" "}
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
            alignItems: "flex-start",
          }}
        >
          {/* 搜索 */}
        </div>

        {/* {renderFilterTags.length > 0 && (
          <div
            className="mt-4 p-2 border-t border-dashed"
            style={{ borderColor: token.colorBorderSecondary }}
          >
            <Space wrap>{renderFilterTags}</Space>
          </div>
        )} */}
      </div>
      <DynamicTable<AlertSilence>
        size="large"
        loading={alertSilenceListRes.loading}
        columns={GetAlertSilenceColumns()}
        dataSource={alertSilenceListRes.data?.list || []}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 15,
          total: alertSilenceListRes.data?.total || 0,
          onChange: (p, s) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", p.toString());
            params.set("pageSize", s.toString());
            setSearchParams(params);
          },
        }}
      />
    </>
  );
}

export default AlertSilencePage;
