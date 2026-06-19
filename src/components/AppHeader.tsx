import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "@/components/ThemeProvider";
import { Avatar, Button, Dropdown, Space, Divider, Select, Badge } from "antd";
import {
  MailOutlined,
  UserOutlined,
  ApartmentOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { UserLogout } from "@/services/user";
import { useRequest } from "ahooks";
import { UserInfoResponse } from "@/types/user/user";
import Logo from "@/assets/logo.png";
import UserProfileDrawer from "@/components/user/UserProfileDrawer";
import type { DefaultOptionType } from "antd/es/select";

interface CustomTenantOption extends DefaultOptionType {
  label: string;
  value: string;
  count: number;
}

interface AppHeaderProps {
  background: string;
  userData: UserInfoResponse | undefined;
  userLoad: boolean;
  currentTenant: string | null;
  tenants: { label: string; value: string }[];
  firingCounts: Record<string, number>;
  tenantLoading: boolean;
  onTenantChange: (value: string) => void;
}

// 🌟 白名单：定义哪些路径下【需要显示】租户切换
const SHOW_TENANT_PATHS = [
  "/workspace/alert/history",
  "/workspace/alert/silence",
  "/workspace/alert/template",
  // "/workspace/alert/channel",
  "/workspace/alert/alertmanager",
];

export default function AppHeader({
  background,
  userData,
  userLoad,
  currentTenant,
  tenants,
  firingCounts,
  tenantLoading,
  onTenantChange,
}: AppHeaderProps) {
  const { theme } = useContext(GlobalContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const isDark = theme === "dark";

  // 1. 判断当前页面是否在【显示】白名单内
  const isTenantVisible = useMemo(() => {
    return SHOW_TENANT_PATHS.some((path) => location.pathname.startsWith(path));
  }, [location.pathname]);

  // 2. 构造选项列表：自动加入“所有租户”并合并统计数量
  const options = useMemo<CustomTenantOption[]>(() => {
    const tenantOptions: CustomTenantOption[] = tenants.map((t) => ({
      label: t.label,
      value: t.value,
      count: firingCounts[t.value] || 0,
    }));

    return tenantOptions.sort((a, b) => {
      if (a.value === "") return -1;
      if (b.value === "") return 1;

      return b.count - a.count;
    });
  }, [tenants, firingCounts]);

  const { run: logoutRun } = useRequest(UserLogout, {
    manual: true,
    onSuccess: () => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    },
  });

  // 用户信息下拉卡片
  const dropdownContent = () => {
    const menuBg = isDark ? "#23232a" : "#fff";
    const menuFont = isDark ? "#fff" : "#222";
    const menuBorder = isDark ? "#303030" : "#e5e7eb";

    return (
      <div
        className="min-w-[300px] shadow-2xl rounded-lg overflow-hidden"
        style={{
          background: menuBg,
          color: menuFont,
          border: `1px solid ${menuBorder}`,
        }}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            <Avatar size={48} src={userData?.avatar} icon={<UserOutlined />} />
            {/* <div className="flex-1 min-w-0 pt-0.5">
              <div className="text-sm font-semibold truncate">
                {userData?.nickName || userData?.name || "未知用户"}
              </div>
            </div> */}
          </div>
        </div>

        {/* 🌟 重新加回用户信息详情区域 */}
        <div className="px-4 py-3 text-sm">
          <div className="flex items-center gap-3">
            <UserOutlined style={{ color: isDark ? "#888" : "#1677ff" }} />
            <span className="truncate">{userData?.name || "未设置"}</span>
          </div>
          {/* 这里是之前漏掉的邮箱 */}
          <div className="flex items-center gap-3 mt-2">
            <MailOutlined style={{ color: isDark ? "#888" : "#1677ff" }} />
            <span className="truncate">{userData?.email || "未设置"}</span>
          </div>
        </div>

        <Divider style={{ margin: "4px 0", borderColor: menuBorder }} />

        <div className="p-2 flex gap-1">
          <Button
            type="text"
            className="flex-1 text-sm"
            onClick={() => {
              setDropdownOpen(false);
              setDrawerOpen(true);
            }}
          >
            个人信息
          </Button>
          <Button
            danger
            type="text"
            icon={<PoweroffOutlined />}
            className="flex-1 text-sm"
            onClick={() => logoutRun()}
          >
            退出登录
          </Button>
        </div>
      </div>
    );
  };

  const borderColor = isDark ? "#303030" : "#f0f0f0";
  const SIDER_WIDTH = 180;

  return (
    <>
      <div
        className="flex items-center justify-between px-4 h-16 transition-all"
        style={{
          backgroundColor: isDark ? background || "#18181c" : "#fff",
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div className="flex items-center">
          <div
            style={{
              width: SIDER_WIDTH,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img src={Logo} style={{ width: 130 }} alt="Logo" />
          </div>

          {isTenantVisible && (
            <>
              <div className="h-6 w-[1px] bg-gray-300 dark:bg-gray-700 mx-2" />
              <div className="flex pl-4 items-center gap-1 ml-2 text-gray-400">
                <ApartmentOutlined style={{ fontSize: 16 }} />
                <span style={{ fontSize: 14, userSelect: "none" }}>
                  当前租户
                </span>
              </div>
              <Select
                variant="borderless"
                showSearch={{
                  filterOption: (input, option) => {
                    const label = (option?.label ?? "")
                      .toString()
                      .toLowerCase();
                    const value = (option?.value ?? "")
                      .toString()
                      .toLowerCase();
                    const search = input.toLowerCase();
                    return label.includes(search) || value.includes(search);
                  },
                }}
                loading={tenantLoading}
                value={currentTenant ?? ""}
                onChange={onTenantChange}
                options={options}
                className="min-w-[160px] font-medium px-2"
                popupStyle={{ borderRadius: 8, width: 240 }}
                optionRender={(option) => {
                  const data = option.data as CustomTenantOption;
                  const isGlobal = data.value === "";

                  return (
                    <div className="flex justify-between items-center w-full py-0.5">
                      <span
                        className="truncate mr-2"
                        style={{ maxWidth: "160px" }}
                      >
                        {data.label}
                      </span>

                      {data.count > 0 && (
                        <Badge
                          count={data.count}
                          overflowCount={99}
                          color={isGlobal ? "#1890ff" : "#ff4d4f"}
                          style={{
                            fontSize: "11px",
                            height: "18px",
                            lineHeight: "18px",
                            minWidth: "18px",
                            padding: "0 5px",
                          }}
                        />
                      )}
                    </div>
                  );
                }}
              />
            </>
          )}
        </div>

        <Space size={16} style={{ marginLeft: 30 }}>
          <ThemeToggle />
          {!userLoad && (
            <Dropdown
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
              popupRender={dropdownContent}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                <Avatar
                  src={userData?.avatar}
                  icon={<UserOutlined />}
                  style={{ background: isDark ? "#333" : "#1677ff" }}
                />
              </div>
            </Dropdown>
          )}
        </Space>
      </div>
      <UserProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
