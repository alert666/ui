import { createBrowserRouter } from "react-router-dom";
import { MenuProps } from "antd";
import Root from "./pages/Root";
import RolePage from "./pages/role/Role";
import LayoutPage from "./layout/Layout";
import loginPage from "./pages/login/Login";
import UserPage from "./pages/user/User";
import PolicyPage from "./pages/api/Api";
import InfoPage from "./pages/user/Info";
import { Role } from "./types/user/user";
import Test from "./test/Test";
import OAuthPage from "./pages/login/OAuth";
import AlertHistoryPage from "./pages/alert/History";
import AlertChannelPage from "./pages/channel/Channel";
import Tenant from "./pages/tenant/Tenant";
import AlertTemplatePage from "./pages/alert/Template";
export type MenuItem = Required<MenuProps>["items"][number];

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        path: "/workspace",
        Component: LayoutPage,
        children: [
          {
            path: "tenant",
            Component: Tenant,
          },
          {
            path: "ram",
            children: [
              {
                path: "user",
                Component: UserPage,
              },
              {
                path: "role",
                Component: RolePage,
              },
              {
                path: "api",
                Component: PolicyPage,
              },
            ],
          },
          {
            path: "alert",
            children: [
              {
                path: "history",
                Component: AlertHistoryPage,
              },
              {
                path: "channel",
                Component: AlertChannelPage,
              },
              {
                path: "template",
                Component: AlertTemplatePage,
              },
            ],
          },
        ],
      },
      {
        path: "/user/info",
        Component: InfoPage,
      },
    ],
  },
  {
    path: "/login",
    Component: loginPage,
  },
  {
    path: "/oauth/login",
    Component: OAuthPage,
  },
  {
    path: "/test",
    Component: Test,
  },
]);

const commonMenuItem: MenuItem[] = [
  {
    key: "tenant",
    label: "租户",
  },
  {
    key: "ram",
    label: "用户",
    children: [
      { key: "user", label: "用户列表" },
      { key: "role", label: "角色列表" },
      { key: "api", label: "API列表" },
    ],
  },
  {
    key: "alert",
    label: "告警",
    children: [
      { key: "history", label: "告警历史" },
      { key: "channel", label: "告警通道" },
      { key: "template", label: "告警模版" },
    ],
  },
];

const GetMemuItem = (_: Role[]): MenuItem[] => {
  return commonMenuItem;
};

export { GetMemuItem };
export default router;
