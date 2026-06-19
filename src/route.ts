import { createBrowserRouter } from "react-router-dom";
import React from "react";
import {
  ApartmentOutlined,
  AuditOutlined,
  ApiOutlined,
  BellOutlined,
  FileTextOutlined,
  HistoryOutlined,
  MutedOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
import AlertSilencePage from "./pages/alert/AlertSilence";
import AlertManagerPage from "./pages/alert/AlertManager";
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
              {
                path: "alertmanager",
                Component: AlertManagerPage,
              },
              {
                path: "silence",
                Component: AlertSilencePage,
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
    icon: React.createElement(ApartmentOutlined),
    label: "租户",
  },
  {
    key: "ram",
    icon: React.createElement(TeamOutlined),
    label: "用户",
    children: [
      { key: "user", icon: React.createElement(UserOutlined), label: "用户列表" },
      { key: "role", icon: React.createElement(AuditOutlined), label: "角色列表" },
      { key: "api", icon: React.createElement(ApiOutlined), label: "API列表" },
    ],
  },
  {
    key: "alert",
    icon: React.createElement(BellOutlined),
    label: "告警",
    children: [
      { key: "history", icon: React.createElement(HistoryOutlined), label: "告警历史" },
      { key: "channel", icon: React.createElement(NodeIndexOutlined), label: "告警通道" },
      { key: "template", icon: React.createElement(FileTextOutlined), label: "告警模版" },
      { key: "silence", icon: React.createElement(MutedOutlined), label: "告警静默" },
      { key: "alertmanager", icon: React.createElement(SettingOutlined), label: "告警配置" },
    ],
  },
];

const GetMemuItem = (_: Role[]): MenuItem[] => {
  return commonMenuItem;
};

export { GetMemuItem };
export default router;
