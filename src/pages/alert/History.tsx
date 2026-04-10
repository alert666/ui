import DynamicTable from "@/components/base/DynamicTable";
import { GetAlertHistorycolumns } from "@/types/alert/History.tsx";
import useApp from "antd/es/app/useApp";
import { useParams } from "@/hooks/useParams";
import {
  AlertHistoryItem,
  AlertHistoryListRequest,
} from "@/types/alert/history";
import { useRequest } from "ahooks";
import { GetAlertHistoryList } from "@/services/alertHistory";
import { useEffect, useState } from "react";

const AlertHistoryPage = () => {
  const { modal, message } = useApp();
  const { getParam, setParams, replaceParams, clearParams } = useParams();
  const page = getParam("page") || "1";
  const pageSize = getParam("pageSize") || "10";
  const status = getParam("status") || "firing";
  const name = getParam("teannt") || "";
  const [searchObject, setSearchObject] = useState({
    key: "name",
    value: name,
  });
  const {
    data: alertHistoryData,
    loading: alertHistoryLoading,
    refresh: refreshAlertHistoryList,
    run: alertHistoryListRun,
  } = useRequest(GetAlertHistoryList, {
    manual: true,
  });

  const runList = () => {
    const params: AlertHistoryListRequest = {
      page: Number(page),
      pageSize: Number(pageSize),
    };
    setSearchObject((prev) => {
      if (prev.value !== null) {
        switch (prev.key) {
          case "name":
            params.name = prev.value || "";
            break;
          default:
            break;
        }
      }
      alertHistoryListRun(params);
      return prev;
    });
  };

  // 分页变化处理
  const handlePageChange = (page: number, size: number) => {
    setParams({
      page: page.toString(),
      pageSize: size.toString(),
    });
  };

  // 搜索处理（点击搜索按钮时触发）
  const handleSearch = () => {
    if (searchObject.value === null) {
      return;
    }
    setParams({
      [searchObject.key]: searchObject.value,
    });
    alertHistoryListRun({
      page: Number(page),
      pageSize: Number(pageSize),
      [searchObject.key]: searchObject.value,
    });
  };

  useEffect(() => {
    setParams({ page: page, pageSize: pageSize });
    runList();
  }, [page, pageSize]);
  return (
    <>
      <DynamicTable<AlertHistoryItem>
        extraHeight={80}
        loading={alertHistoryLoading}
        columns={GetAlertHistorycolumns()}
        locale={{
          emptyText: "暂无数据",
          triggerAsc: "点击升序",
          triggerDesc: "点击降序",
          cancelSort: "取消排序",
        }}
        dataSource={alertHistoryData?.list || []}
        pagination={{
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} 条，共 ${total} 条数据`,
          current: Number(page),
          pageSize: Number(pageSize),
          // total: roleData?.total || 0,
          showSizeChanger: true,
          onChange: handlePageChange,
          locale: {
            items_per_page: "条/页",
            jump_to: "跳至",
            page: "页",
          },
        }}
        bordered
      />
    </>
  );
};

export default AlertHistoryPage;
