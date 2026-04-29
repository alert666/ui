import { useContext, useMemo } from "react";
import { GlobalContext } from "@/components/ThemeProvider";
import {
  Avatar,
  Button,
  Dropdown,
  Space,
  Divider,
  Typography,
  Select,
  Tag,
} from "antd";
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

    return tenantOptions;
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
    const roleBg = isDark ? "#243a5a" : "#e3f2fd";
    const roleColor = isDark ? "#90caf9" : "#1976d2";

    return (
      <div
        className="min-w-[300px] shadow-2xl rounded-lg overflow-hidden"
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
            <Avatar size={64} src={userData?.avatar} icon={<UserOutlined />} />
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
                  <Tag
                    key={role.name}
                    variant="filled"
                    style={{
                      background: roleBg,
                      color: roleColor,
                      borderRadius: "10px",
                      fontSize: "11px",
                    }}
                  >
                    {role.name}
                  </Tag>
                ))}
              </div>
            </div>
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
            onClick={() => window.open("/user/info", "_blank")}
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
  const SIDER_WIDTH = 240;

  return (
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
            width: SIDER_WIDTH - 16,
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
              <span style={{ fontSize: 14, userSelect: "none" }}>当前租户</span>
            </div>

            <Select
              variant="borderless"
              showSearch
              loading={tenantLoading}
              value={currentTenant ?? ""} // 重要：null 匹配“所有租户”
              onChange={onTenantChange}
              options={options}
              className="min-w-[160px] font-medium px-2"
              popupStyle={{ borderRadius: 8, width: 240 }}
              optionRender={(option) => {
                const data = option.data as CustomTenantOption;
                const isGlobal = data.value === "";
                return (
                  <div className="flex justify-between items-center w-full py-0.5">
                    <span className="truncate" style={{ maxWidth: "140px" }}>
                      {data.label}
                    </span>
                    {data.count > 0 && (
                      <Tag
                        variant="filled"
                        color={isGlobal ? "processing" : "error"}
                        style={{
                          marginInlineEnd: 0,
                          borderRadius: "10px",
                          fontSize: "11px",
                          paddingInline: "6px",
                          lineHeight: "18px",
                          height: "18px",
                        }}
                      >
                        {data.count > 99 ? "99+" : data.count}
                      </Tag>
                    )}
                  </div>
                );
              }}
            />
          </>
        )}
      </div>

      <Space size={16}>
        <ThemeToggle />
        {!userLoad && (
          <Dropdown
            popupRender={dropdownContent}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full px-3 hover:bg-black/5 dark:hover:bg-white/5">
              <span className="text-sm font-medium">
                {userData?.nickName || userData?.name}
              </span>
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
  );
}
