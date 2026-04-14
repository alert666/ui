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
}

const PREFIX = "/workspace/";
// 统一路径常量，确保匹配一致
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

  // 1. 定义请求 (manual 模式)
  const firingCountReq = useRequest(GetFiringCountByTenant, {
    manual: true,
    pollingInterval: 30000,
    pollingWhenHidden: false,
  });

  // 2. 🌟 统一调度器：处理 运行、停止、重置数据
  useEffect(() => {
    const path = location.pathname;

    // 每当路径或租户改变时，立即将旧数据清空（置零）
    firingCountReq.mutate(undefined);

    // 逻辑判定：是否在告警历史页面
    if (path.includes(ALERT_HISTORY_PATH)) {
      // 开启请求
      firingCountReq.run();
    } else {
      // 停止轮询
      firingCountReq.cancel();
    }

    // 依赖项包含路径和租户ID，确保切换时触发重置和重新判定
  }, [location.pathname, urlTenant]);

  // 3. 🌟 数据计算：提取统计数据并映射到租户
  const currentCountsMap = useMemo(() => {
    const path = location.pathname;

    // 安全地进行类型转换
    const rawData = firingCountReq.data as unknown as
      | FiringCountByTenantResponse[]
      | undefined;
    const res: Record<string, number> = {};

    // 只有路径匹配且数据存在时才处理映射
    if (path.includes(ALERT_HISTORY_PATH) && Array.isArray(rawData)) {
      rawData.forEach((item) => {
        if (item.cluster !== undefined) {
          res[item.cluster] = item.count;
        }
      });
    }

    return res;
  }, [location.pathname, firingCountReq.data]);

  // 4. 基础数据获取：用户信息、租户列表
  const { data: userData, loading: userLoad } = useRequest(UserInfo, {
    onSuccess: (data) => setUser(data),
  });

  const { data: tenantData, loading: tenantLoading } =
    useRequest(GetTenantOptions);

  // 5. 租户自动补全与切换逻辑
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
    // 自动补全租户：如果URL没租户，从本地拿或取列表第一个
    if (urlTenant === null && tenantData && tenantData.length > 0) {
      const localTenant = localStorage.getItem("tenant");
      const exists = tenantData.find((t) => t.value === localTenant);
      const defaultVal = exists ? localTenant! : tenantData[0].value;
      handleTenantChange(defaultVal);
    }
  }, [urlTenant, tenantData, handleTenantChange]);

  // 6. 侧边栏菜单状态同步 (由 URL 驱动)
  const menuState = useMemo(() => {
    const pathParts = location.pathname.split("/");
    return {
      selectedKeys: [pathParts[pathParts.length - 1]],
      openKeys: [pathParts[2]],
    };
  }, [location.pathname]);

  const [manualOpenKeys, setManualOpenKeys] = useState<string[]>([]);

  // 路径变化时同步展开状态
  useEffect(() => {
    if (menuState.openKeys[0]) {
      setManualOpenKeys(menuState.openKeys);
    }
  }, [menuState.openKeys]);

  const menuClick = ({ keyPath }: MenuClickParams) => {
    const pathName = PREFIX + [...keyPath].reverse().join("/");
    const tenant = searchParams.get("tenant");
    // 跳转时保持租户参数，丢弃其他分页/搜索参数
    navigate(`${pathName}${tenant ? `?tenant=${tenant}` : ""}`);
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
          width={240}
          style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
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
