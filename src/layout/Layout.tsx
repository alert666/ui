import { GetMemuItem } from "@/route";
import { Layout, Menu, Spin, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { useEffect, useMemo, useState } from "react";
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

interface openKeys {
  openKey: string[];
  selectKeys: string[];
}

interface menuType {
  key: string;
  keyPath: string[];
}

const perfix = "/workspace/";

const LayoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. 优先实时反映 URL 状态
  const urlTenant = searchParams.get("tenant");
  const [openKey, setOpenkey] = useState<openKeys>({
    openKey: [],
    selectKeys: [],
  });

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { data: userData, loading: userLoad } = useRequest(UserInfo, {
    onSuccess: (data) => setUser(data),
  });

  const { data: tenantData, loading: tenantLoading } =
    useRequest(GetTenantOptions);

  // 租户切换处理
  const handleTenantChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set("tenant", value);
      return prev;
    });
    localStorage.setItem("tenant", value);
  };

  // 核心逻辑：自动补全 URL 参数
  useEffect(() => {
    // 仅当 URL 中没有租户信息时才进行同步
    if (!urlTenant) {
      const localTenant = localStorage.getItem("tenant");

      if (localTenant) {
        // 如果本地有缓存，同步到 URL
        handleTenantChange(localTenant);
      } else if (tenantData && tenantData.length > 0) {
        // 如果本地没缓存，等接口返回后选第一个
        handleTenantChange(tenantData[0].value);
      }
    }
  }, [urlTenant, tenantData]); // 仅监听 urlTenant 的变化和列表加载情况

  // 侧边栏菜单点击
  const menuClick = (item: menuType) => {
    setOpenkey({
      openKey: [item.keyPath[1]],
      selectKeys: [item.keyPath[0]],
    });

    const pathName = perfix + [...item.keyPath].reverse().join("/");

    // 2. 🌟 重点：创建一个新的参数对象，只保留必须跨页面流转的参数
    const newParams = new URLSearchParams();

    // 只保留租户 ID
    const tenant = searchParams.get("tenant");
    if (tenant) {
      newParams.set("tenant", tenant);
    }

    // 关键：始终带上当前的 searchParams
    navigate({
      pathname: pathName,
      search: newParams.toString() ? `?${newParams.toString()}` : "",
    });
  };

  const menuChange = (openKeys: string[]) => {
    setOpenkey((pre) => ({ ...pre, openKey: openKeys }));
  };

  const menuItems = useMemo(() => {
    return GetMemuItem(userData?.roles || []);
  }, [userData?.roles]);

  useEffect(() => {
    const path = location.pathname.split("/");
    if (path.length >= 4) {
      setOpenkey({
        openKey: [path[2]],
        selectKeys: [path[3]],
      });
    }
  }, [location.pathname]);

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
      />

      <Layout style={{ padding: "16px", background: "transparent" }}>
        <Sider
          width={240}
          style={{
            background: colorBgContainer,
            height: "100%",
            overflow: "auto",
            borderRadius: borderRadiusLG,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Menu
            style={{
              background: colorBgContainer,
              height: "100%",
              borderRight: 0,
              borderRadius: borderRadiusLG,
            }}
            items={menuItems}
            mode="inline"
            onClick={menuClick}
            onOpenChange={menuChange}
            openKeys={openKey.openKey}
            selectedKeys={openKey.selectKeys}
          />
        </Sider>

        <Content
          style={{
            marginLeft: "16px",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: "auto",
            minHeight: 0,
            borderLeft: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* 只有当租户信息确定后才渲染内容，防止业务组件发起没有 X-Tenant-Id 的请求 */}
          {urlTenant ? (
            <Outlet />
          ) : (
            <div className="p-10">
              <Spin fullscreen description="获取租户信息..." />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
