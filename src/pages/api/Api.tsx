import CreateApiComponent from "@/components/api/CreatePolicy";
import { DeleteApi, GetApiList } from "@/services/api";
import { useRequest } from "ahooks";
import { SyncOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import { useEffect, useState } from "react";
import DynamicTable from "@/components/base/DynamicTable";
import { ApiListColumns } from "@/types/api/api.tsx";
import { useParams } from "@/hooks/useParams";
import useApp from "antd/es/app/useApp";
import Search from "antd/es/input/Search";
import UpdatePolicyComponent from "@/components/api/UpdatePolicy";
import { Api, ApiListRequest } from "@/types/api/api";
const PolicyPage = () => {
  const { modal, message } = useApp();
  const { getParam, setParams, replaceParams } = useParams();
  const page = getParam("page") || "1";
  const pageSize = getParam("pageSize") || "10";
  const searchName = getParam("name") || "";
  const searchPath = getParam("path") || "";
  const searchMethod = getParam("method") || "";
  const [searchObject, setSearchObject] = useState({
    key: "name",
    value: searchName,
  });

  const {
    run: apiListRun,
    data: apiListData,
    loading: apiListLoading,
    refresh: apiListRefresh,
  } = useRequest(GetApiList, {
    manual: true,
  });

  // 搜索处理（点击搜索按钮时触发）
  const handleSearch = () => {
    if (searchObject.value === "") {
      return;
    }
    replaceParams({
      page: page,
      pageSize: pageSize,
      [searchObject.key]: searchObject.value,
    });
    apiListRun({
      page: Number(page),
      pageSize: Number(pageSize),
      [searchObject.key]: searchObject.value,
    });
  };

  const handleClear = () => {
    setSearchObject((prev) => {
      return {
        ...prev,
        value: "",
      };
    });
    replaceParams({
      page: page,
      pageSize: pageSize,
    });
    apiListRun({
      page: Number(page),
      pageSize: Number(pageSize),
    });
  };

  // 分页变化处理
  const handlePageChange = (page: number, size: number) => {
    setParams({
      page: page.toString(),
      pageSize: size.toString(),
    });
  };

  const [createApiOpen, setCreateApiOpen] = useState(false);
  const { run: deleteApiRun, loading: deleteApiLoad } = useRequest(DeleteApi, {
    manual: true,
    onSuccess: () => {
      apiListRefresh();
    },
  });

  const [updateApiOpen, setUpdateApiOpen] = useState(false);
  const [updateApiData, setUpdateApiData] = useState({} as Api);

  const runList = () => {
    const params: ApiListRequest = {
      page: Number(page),
      pageSize: Number(pageSize),
    };
    setSearchObject((prev) => {
      if (prev.value !== null) {
        switch (prev.key) {
          case "name":
            params.name = prev.value || "";
            break;
          case "path":
            params.path = prev.value || "";
            break;
          case "method":
            params.method = prev.value || "";
            break;
          default:
            break;
        }
      }
      apiListRun(params);
      return prev;
    });
  };

  useEffect(() => {
    if (searchName !== "") {
      setSearchObject({
        key: "name",
        value: searchName,
      });
    } else if (searchPath !== "") {
      setSearchObject({
        key: "path",
        value: searchPath,
      });
    } else if (searchMethod !== "") {
      setSearchObject({
        key: "method",
        value: searchMethod,
      });
    }
  }, [searchName, searchPath, searchMethod]);

  useEffect(() => {
    setParams({
      page: page,
      pageSize: pageSize,
    });
    runList();
  }, [page, pageSize]);
  return (
    <div className="px-4">
      <div className="flex justify-between p-2">
        <div className="flex gap-4">
          <Search
            placeholder="名称前缀搜索"
            value={searchObject.value}
            onChange={(e) =>
              setSearchObject({
                key: searchObject.key,
                value: e.target.value,
              })
            }
            onSearch={handleSearch}
            onClear={handleClear}
            allowClear
            addonBefore={
              <Select
                value={searchObject.key}
                onChange={(val) => {
                  setSearchObject({
                    key: val,
                    value: searchObject.value,
                  });
                }}
                style={{ width: 100 }}
              >
                <Select.Option value="name">名称</Select.Option>
                <Select.Option value="path">路径</Select.Option>
                <Select.Option value="method">方法</Select.Option>
              </Select>
            }
          />
          <Button
            type="primary"
            onClick={() => {
              setCreateApiOpen(true);
            }}
          >
            创建API
          </Button>
        </div>
        <div className="pr-3">
          <Button icon={<SyncOutlined />} onClick={() => apiListRefresh()} />
        </div>
      </div>

      <DynamicTable
        extraHeight={80}
        loading={apiListLoading}
        columns={ApiListColumns({
          modal,
          message,
          deleteApiRun,
          deleteApiLoad,
          setUpdateApiOpen,
          setUpdateApiData,
        })}
        dataSource={apiListData?.list || []}
        pagination={{
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} 条，共 ${total} 条数据`,
          current: Number(page),
          pageSize: Number(pageSize),
          total: apiListData?.total || 0,
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
      <UpdatePolicyComponent
        open={updateApiOpen}
        data={updateApiData}
        onCancel={() => {
          setUpdateApiOpen(false);
        }}
        refresh={apiListRefresh}
      />
      <CreateApiComponent
        open={createApiOpen}
        onCancel={() => {
          setCreateApiOpen(false);
        }}
        refresh={apiListRefresh}
      />
    </div>
  );
};

export default PolicyPage;
