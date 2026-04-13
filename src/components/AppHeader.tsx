import { useContext, useMemo } from "react";
import { GlobalContext } from "@/components/ThemeProvider";
import {
  Avatar,
  Button,
  Dropdown,
  Space,
  Spin,
  Divider,
  Typography,
  Select,
} from "antd";
import {
  MailOutlined,
  PoweroffOutlined,
  UserOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import ThemeToggle from "./ThemeToggle";
import { UserLogout } from "@/services/user";
import { useRequest } from "ahooks";
import { UserInfoResponse } from "@/types/user/user";
import Logo from "@/assets/logo.png";

interface AppHeaderProps {
  background: string;
  userData: UserInfoResponse | undefined;
  userLoad: boolean;
  currentTenant: string | null;
  tenants: { label: string; value: string }[];
  tenantLoading: boolean;
  onTenantChange: (value: string) => void;
}

export default function AppHeader({
  background,
  userData,
  userLoad,
  currentTenant,
  tenants,
  tenantLoading,
  onTenantChange,
}: AppHeaderProps) {
  const { theme } = useContext(GlobalContext);
  const isDark = theme === "dark";

  const { run: logoutRun } = useRequest(UserLogout, {
    manual: true,
    onSuccess: () => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    },
  });

  const processedOptions = useMemo(() => {
    const allOption = { label: "所有租户", value: "all" };
    // 将“所有租户”放在数组第一项，后面跟着原始的 tenants 列表
    return [allOption, ...tenants];
  }, [tenants]);

  // 用户个人信息下拉卡片
  const dropdownContent = () => {
    const menuBg = isDark ? "#23232a" : "#fff";
    const menuFont = isDark ? "#fff" : "#222";
    const menuBorder = isDark ? "#303030" : "#e5e7eb";
    const roleBg = isDark ? "#243a5a" : "#e3f2fd";
    const roleColor = isDark ? "#90caf9" : "#1976d2";

    return (
      <div
        className="min-w-[300px] p-0 shadow-2xl rounded-lg overflow-hidden"
        style={{
          background: menuBg,
          color: menuFont,
          border: `1px solid ${menuBorder}`,
        }}
      >
        <div
          className="p-4"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #23232a 0%, #243a5a 100%)"
              : "linear-gradient(135deg, #e3f2fd 0%, #fff 100%)",
          }}
        >
          <div className="flex items-start gap-4">
            <Avatar
              size={64}
              src={userData?.avatar}
              icon={!userData?.avatar && <UserOutlined />}
              style={{
                border: `2px solid ${menuBorder}`,
                background: isDark ? "#18181c" : "#fff",
              }}
            />
            <div className="flex-1">
              <Typography.Title
                level={5}
                className="!mb-1"
                style={{ color: isDark ? "#fff" : "#1976d2", marginTop: 0 }}
              >
                {userData?.nickName || userData?.name || "未知用户"}
              </Typography.Title>
              <div className="flex flex-wrap gap-2">
                {userData?.roles?.map((role) => (
                  <span
                    key={role.name}
                    style={{
                      background: roleBg,
                      color: roleColor,
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      border: `1px solid ${menuBorder}`,
                    }}
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 text-sm">
          <div className="flex items-center gap-3">
            <UserOutlined style={{ color: isDark ? "#888" : "#1976d2" }} />
            <span className="truncate">{userData?.name || "未设置"}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <MailOutlined style={{ color: isDark ? "#888" : "#1976d2" }} />
            <span className="truncate">{userData?.email || "未设置"}</span>
          </div>
        </div>

        <Divider style={{ margin: "4px 0", borderColor: menuBorder }} />

        <div className="p-2 flex gap-1">
          <Button
            type="text"
            icon={<UserOutlined />}
            onClick={() => window.open("/user/info", "_blank")}
            className="flex-1 text-sm"
            style={{ color: menuFont }}
          >
            个人信息
          </Button>
          <Button
            danger
            type="text"
            icon={<PoweroffOutlined />}
            onClick={() => logoutRun()}
            className="flex-1 text-sm"
          >
            退出登录
          </Button>
        </div>
      </div>
    );
  };

  const borderColor = isDark ? "#303030" : "#f0f0f0";
  const fontColor = isDark ? "#fff" : "#222";
  const SIDER_WIDTH = 240;
  return (
    <div
      className="flex items-center justify-between px-4 h-16 transition-all duration-300"
      style={{
        backgroundColor: isDark ? background || "#18181c" : "#fff",
        borderBottom: `1px solid ${borderColor}`,
        color: fontColor,
      }}
    >
      {/* 左侧区域：Logo + 租户选择 */}
      <div className="flex items-center">
        <div
          style={{
            width: SIDER_WIDTH - 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={Logo} style={{ width: 130 }} alt="Logo" />
        </div>

        {/* 垂直分割线 */}
        <div className="h-6 w-[1px] bg-gray-300 dark:bg-gray-700 mx-2" />
        <div className="flex pl-4 items-center gap-1 ml-2 text-gray-400 dark:text-gray-500">
          <ApartmentOutlined style={{ fontSize: 16 }} />
          <span style={{ fontSize: 14, userSelect: "none" }}>当前租户</span>
        </div>
        <Select
          variant="borderless"
          showSearch
          loading={tenantLoading}
          placeholder="选择租户"
          value={currentTenant || undefined}
          onChange={onTenantChange}
          className="min-w-[150px] font-medium"
          options={processedOptions}
          style={{ color: fontColor }}
          popupStyle={{ borderRadius: 8, width: 200 }}
        />
      </div>

      {/* 右侧区域：工具栏 */}
      <Space size={16}>
        <ThemeToggle />
        {userLoad ? (
          <Spin size="small" />
        ) : (
          <Dropdown
            popupRender={dropdownContent}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
              <span className="text-sm font-medium hidden md:block">
                {userData?.nickName || userData?.name}
              </span>
              <Avatar
                src={userData?.avatar}
                icon={!userData?.avatar && <UserOutlined />}
                style={{ background: isDark ? "#333" : "#1976d2" }}
              />
            </div>
          </Dropdown>
        )}
      </Space>
    </div>
  );
}
