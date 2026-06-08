import { GetAlertSilenceColumns } from "@/components/alertSilence/AlertSilenceTableColums";
import AlertSilenceCreator from "@/components/alertSilence/CreateAlertSilence";
import DynamicTable from "@/components/base/DynamicTable";
import {
  CreateAlertSilence,
  DeleteAlertSilence,
  GetAlertSilenceList,
} from "@/services/alertSilence";
import {
  AlertSilence,
  AlertSilenceListReq,
  CreateAlertSlienceReq,
  SILEMCE_SEARCH_DIMENSIONS,
} from "@/types/alert/silence";
import { PageOptionEnum } from "@/types/enum";
import { useRequest } from "ahooks";
import { App, Button, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GetUserOptions } from "@/services/user";
import SearchFilter from "@/components/base/SearchFilter";

function AlertSilencePage() {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [searchParams, setSearchParams] = useSearchParams();
  // ------ silence 列表请求 ------
  const alertSilenceListRes = useRequest(GetAlertSilenceList, { manual: true });

  // ------ Url 驱动获取 alertSilence 列表 ------
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const rawStatus = searchParams.get("status"); // 1. 提前获取 status
    const createdBy = searchParams.get("createdBy"); // 1. 提前获取 status
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
      createdBy: createdBy ? createdBy : undefined,
    };

    alertSilenceListRes.run(params);
  }, [searchParams]);

  // ------ 创建 AlertSilence ------
  const [createAlertSilenceOpen, setCreateAlertSilenceOpen] =
    useState<boolean>(false);

  const handleCancel = () => {
    setCreateAlertSilenceOpen(false);
  };

  const createSilenceResult = useRequest(CreateAlertSilence, {
    manual: true,
    debounceWait: 200,
    onSuccess: () => {
      message.success("创建成功");
    },
  });

  // ------ 搜索逻辑 ------
  const userOptionsResult = useRequest(GetUserOptions);
  // 使用 useMemo 将基础配置和接口数据合成
  const searchDimensions = useMemo(() => {
    return SILEMCE_SEARCH_DIMENSIONS.map((dim) => {
      if (dim.value === "createdBy") {
        return { ...dim, options: userOptionsResult.data };
      }
      return dim;
    });
  }, [userOptionsResult.data]);

  // ------ 删除逻辑 ------
  const deleteResult = useRequest(DeleteAlertSilence, {
    manual: true,
    debounceWait: 100,
    onSuccess: () => {
      alertSilenceListRes.refresh();
    },
  });

  return (
    <>
      <AlertSilenceCreator
        open={createAlertSilenceOpen}
        handleCancel={handleCancel}
        loading={createSilenceResult.loading}
        handleOk={async (value: CreateAlertSlienceReq) => {
          await createSilenceResult.runAsync(value);
          alertSilenceListRes.refresh();
        }}
      />

      <SearchFilter
        dimensions={searchDimensions}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onRefresh={() => alertSilenceListRes.refresh()}
        extra={
          <Button
            type="primary"
            onClick={() => setCreateAlertSilenceOpen(true)}
          >
            新建静默
          </Button>
        }
      />

      <DynamicTable<AlertSilence>
        size="large"
        loading={alertSilenceListRes.loading}
        columns={GetAlertSilenceColumns({ token, deleteResult })}
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
