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

const menuItem: MenuItem[] = [];

const adminMemuItem: MenuItem[] = [
  {
    key: "ram",
    icon: null,
    label: "用户",
    children: [
      {
        key: "user",
        icon: null,
        label: "用户列表",
      },
      {
        key: "role",
        icon: null,
        label: "角色列表",
      },
      {
        key: "api",
        icon: null,
        label: "API列表",
      },
    ],
  },
  {
    key: "alert",
    icon: null,
    label: "告警",
    children: [
      {
        key: "history",
        icon: null,
        label: "告警历史",
      },
    ],
  },
];

const GetMemuItem = (_: Role[]): MenuItem[] => {
  const menum: MenuItem[] = [];
  menum.push(...adminMemuItem);
  // roles.some((role) => {
  //   if (role.name === "admin" || role.id === "1") {
  //     menum.push(...adminMemuItem);
  //   }
  // });

  if (menuItem.length > 0) {
    menum.push(...menuItem);
  }

  return menum;
};

export { GetMemuItem };
export default router;
