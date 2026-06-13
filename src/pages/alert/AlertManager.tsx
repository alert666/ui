import { useState, useEffect } from "react";
import { Button, Space, theme, Typography } from "antd";
import {
  EditOutlined,
  SaveOutlined,
  RollbackOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useRequest } from "ahooks";
import CodeEditor from "@/components/codeEditor/CodeEditor";
import {
  GetAlertManagerConfig,
  UpdateAlertManagerConfig,
} from "@/services/alertmanager";
import { Base64 } from "js-base64";
import useApp from "antd/es/app/useApp";
import { useSearchParams } from "react-router-dom";

const AlertManagerPage = () => {
  const { token } = theme.useToken();
  const [isEditing, setIsEditing] = useState(false);
  const [configContent, setConfigContent] = useState("");
  const { message } = useApp();
  const [searchParams] = useSearchParams();
  const tenant = searchParams.get("tenant") || "";
  // 获取配置
  const getAlertManagerConfigResult = useRequest(GetAlertManagerConfig, {
    manual: true,
    onSuccess: (data) => {
      const alertConfig = Base64.decode(data.data);
      setConfigContent(alertConfig);
    },
    onError: () => {
      setConfigContent("");
    },
  });

  // 更新配置
  const updateReq = useRequest(UpdateAlertManagerConfig, {
    manual: true,
    onSuccess: () => {
      message.success("配置更新成功");
      setIsEditing(false);
      getAlertManagerConfigResult.refresh();
    },
  });

  // 初始加载
  useEffect(() => {
    getAlertManagerConfigResult.run(tenant);
  }, [searchParams]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    console.log(configContent);
    const base64Config = Base64.encode(configContent);
    console.log(base64Config);

    updateReq.run(tenant, base64Config);
  };

  const handleCancelEdit = () => {
    setConfigContent(getAlertManagerConfigResult.data?.data || "");
    setIsEditing(false);
  };

  const handleRefresh = () => {
    getAlertManagerConfigResult.refresh();
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {/* 顶部操作栏 */}
      <div
        className="mb-4 p-4 flex items-center justify-between"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          AlertManager 配置
        </Typography.Title>
        <Space>
          {isEditing ? (
            <>
              <Button icon={<RollbackOutlined />} onClick={handleCancelEdit}>
                取消编辑
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={updateReq.loading}
              >
                保存配置
              </Button>
            </>
          ) : (
            <>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={getAlertManagerConfigResult.loading}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* 代码编辑器 */}
      <div
        className="flex-1"
        style={{
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          overflow: "hidden",
        }}
      >
        <CodeEditor
          loading={getAlertManagerConfigResult.loading}
          readOnly={!isEditing}
          value={configContent}
          onChange={(val) => setConfigContent(val || "")}
          token={token}
          language="yaml"
          height="calc(100vh - 220px)"
          title={isEditing ? "编辑中..." : "只读模式"}
        />
      </div>
    </div>
  );
};

export default AlertManagerPage;
