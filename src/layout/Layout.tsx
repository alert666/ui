import { Layout, Menu, Spin, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useRequest } from "ahooks";
import { UserInfo } from "@/services/user";
import useUserStore from "@/stores/userStore";
import { GetTenantOptions } from "@/services/tenant";
import { GetFiringCountByTenant } from "@/services/alertHistory";
import { GetMemuItem } from "@/route";
import { FiringCountByTenantResponse } from "@/types/alert/history";

interface MenuClickParams {
  key: string;
  keyPath: string[];
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

const PREFIX = "/workspace/";
const ALERT_HISTORY_PATH = "/workspace/alert/history";

const LayoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const urlTenant = searchParams.get("tenant");

  const firingCountReq = useRequest(GetFiringCountByTenant, {
    manual: true,
    pollingInterval: 30000,
    pollingWhenHidden: false,
  });

  useEffect(() => {
    const path = location.pathname;

    firingCountReq.mutate(undefined);

    if (path.includes(ALERT_HISTORY_PATH)) {
      firingCountReq.run();
    } else {
      firingCountReq.cancel();
    }
  }, [location.pathname, urlTenant]);

  const currentCountsMap = useMemo(() => {
    const path = location.pathname;

    const rawData = firingCountReq.data as unknown as
      | FiringCountByTenantResponse[]
      | undefined;
    const res: Record<string, number> = {};

    if (path.includes(ALERT_HISTORY_PATH) && Array.isArray(rawData)) {
      rawData.forEach((item) => {
        if (item.cluster !== undefined) {
          res[item.cluster] = item.count;
        }
      });
    }

    return res;
  }, [firingCountReq.data]);

  const { data: userData, loading: userLoad } = useRequest(UserInfo, {
    onSuccess: (data) => setUser(data),
  });

  const { data: tenantData, loading: tenantLoading } =
    useRequest(GetTenantOptions);

  const handleTenantChange = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("tenant", value);
          return next;
        },
        { replace: true },
      );
      localStorage.setItem("tenant", value);
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (urlTenant === null && tenantData && tenantData.length > 0) {
      const localTenant = localStorage.getItem("tenant");
      const exists = tenantData.find((t) => t.value === localTenant);
      const defaultVal = exists ? localTenant! : tenantData[0].value;
      handleTenantChange(defaultVal);
    }
  }, [urlTenant, tenantData, handleTenantChange]);

  const menuState = useMemo(() => {
    const pathParts = location.pathname.split("/");
    return {
      selectedKeys: [pathParts[pathParts.length - 1]],
      openKeys: [pathParts[2]],
    };
  }, [location.pathname]);

  // ------ 修改 html 的 Title ------
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const pageKey = pathParts[pathParts.length - 1];
    const pageTitle = PAGE_TITLES[pageKey];
    document.title = pageTitle ? `${pageTitle} - Alertmanager` : "Alertmanager";
  }, [location.pathname]);

  const PAGE_TITLES: Record<string, string> = {
    tenant: "租户管理",
    user: "用户列表",
    role: "角色列表",
    api: "API列表",
    history: "告警历史",
    channel: "告警通道",
    template: "告警模版",
    silence: "告警静默",
    alertmanager: "告警配置",
  };

  const [manualOpenKeys, setManualOpenKeys] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (menuState.openKeys[0]) {
      setManualOpenKeys(menuState.openKeys);
    }
  }, [menuState.openKeys]);

  const menuClick = ({ keyPath, domEvent }: MenuClickParams) => {
    const pathName = PREFIX + [...keyPath].reverse().join("/");
    const tenant = searchParams.get("tenant");
    const url = `${pathName}${tenant ? `?tenant=${tenant}` : ""}`;
    if (domEvent.ctrlKey || domEvent.metaKey) {
      window.open(url, "_blank");
    } else {
      navigate(url);
    }
  };

  const menuItems = useMemo(
    () => GetMemuItem(userData?.roles || []),
    [userData?.roles],
  );

  return (
    <Layout className="h-screen overflow-hidden">
      <AppHeader
        userData={userData}
        userLoad={userLoad}
        background={colorBgContainer}
        currentTenant={urlTenant}
        tenants={tenantData || []}
        tenantLoading={tenantLoading}
        onTenantChange={handleTenantChange}
        firingCounts={currentCountsMap}
      />

      <Layout style={{ margin: "6px", background: "transparent" }}>
        <Sider
          width={200}
          style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
        >
          <Menu
            style={{
              background: "transparent",
              height: "100%",
              borderRight: 0,
            }}
            items={menuItems}
            mode="inline"
            onClick={menuClick}
            onOpenChange={setManualOpenKeys}
            openKeys={manualOpenKeys}
            selectedKeys={menuState.selectedKeys}
          />
        </Sider>

        <Content
          style={{
            marginLeft: "6px",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: "auto",
          }}
        >
          {urlTenant !== null ? (
            <Outlet />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Spin size="large" fullscreen description="正在载入工作空间..." />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
