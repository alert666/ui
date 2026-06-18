 # alert-ui
 
 基于 React 的前端管理界面 — 配合 [api-server](https://github.com/alert666/api-server) 使用，提供告警管理、用户权限、多租户隔离的完整 Web UI。
 
[![Build](https://img.shields.io/github/actions/workflow/status/alert666/api-server/docker-publish.yml?branch=main)](https://github.com/alert666/api-server/actions)
[![License](https://img.shields.io/github/license/alert666/api-server)](https://github.com/alert666/api-server/blob/main/LICENSE)
[![Go Version](https://img.shields.io/github/go-mod/go-version/alert666/api-server)](https://go.dev)

 ## 目录
 
- [alert-ui](#alert-ui)
  - [目录](#目录)
  - [简介](#简介)
  - [功能](#功能)
    - [告警管理](#告警管理)
    - [平台管理](#平台管理)
  - [技术栈](#技术栈)
  - [项目结构](#项目结构)
  - [快速开始](#快速开始)
    - [前置依赖](#前置依赖)
    - [本地运行](#本地运行)
  - [部署](#部署)
    - [Docker 镜像](#docker-镜像)
    - [本地构建镜像](#本地构建镜像)
    - [Docker Compose](#docker-compose)
    - [Nginx 配置](#nginx-配置)
  - [开发指南](#开发指南)
    - [添加新页面](#添加新页面)
    - [代码规范](#代码规范)
  - [相关项目](#相关项目)
  - [License](#license)
 
 ## 简介
 
 alert-ui 是告警管理平台的前端项目，配合 [api-server](https://github.com/alert666/api-server) 后端服务使用。提供从告警接收、静默、抑制、模板渲染到多渠道通知的完整可视化管理界面。
 
 在线预览：[qqlx.net](https://qqlx.net/)（只读账号：`readonly@qqlx.net` / `12345678`）
 
 ## 功能
 
 ### 告警管理
 
 - **告警历史** — 追踪告警生命周期（firing → resolved），支持按标签、时间范围、集群等多维度筛选与分页查询
 - **告警通道** — 管理通知渠道（飞书、邮件等），支持绑定告警模板
 - **告警模板** — 基于 Go template 的通知模板编辑，集成 Monaco 代码编辑器，支持一键复制模板
 - **告警静默** — 按标签匹配创建静默规则，支持定时生效/失效，按租户统计活跃静默数
 - **告警配置** — 查看 Alertmanager 状态与配置
 
 
 
 ### 平台管理
 
 - **多租户（集群）管理** — 租户粒度的告警隔离，每个租户对应一个集群
 - **用户管理** — 用户 CRUD，JWT 认证，支持绑定 OAuth2 账号
 
 
 
 - **角色管理** — 角色定义与分配
 
 
 
 - **接口权限管理** — 基于 Casbin 的 RBAC 细粒度 API 访问控制
 
 
 
 - **OAuth2 登录** — 支持飞书、Keycloak 等多种 OAuth2 Provider
 
 
 
 
 - **错误追踪** — 接口发生错误时通过 `requestId` 快速定位后端日志
 
 
 
 ## 技术栈
 
 | 类别        | 技术                                                         |
 | ----------- | ------------------------------------------------------------ |
 | 框架        | [React 19](https://react.dev)                                |
 | 语言        | [TypeScript](https://www.typescriptlang.org)                 |
 | UI 组件库   | [Ant Design 6](https://ant.design)                           |
 | 构建工具    | [Vite 6](https://vitejs.dev)                                 |
 | 路由        | [React Router 7](https://reactrouter.com)                    |
 | 状态管理    | [Zustand](https://zustand-demo.pmnd.rs)                      |
 | HTTP 客户端 | [Axios](https://axios-http.com)                              |
 | 代码编辑器  | [Monaco Editor](https://microsoft.github.io/monaco-editor)   |
 | 样式方案    | [Tailwind CSS 4](https://tailwindcss.com)                    |
 | 工具库      | [ahooks](https://ahooks.js.org)、[dayjs](https://day.js.org) |
 | 容器化      | Docker / Docker Compose                                      |
 | Web 服务器  | Nginx（OpenTelemetry 模块）                                  |
 
 ## 项目结构
 
 ```
 .
 ├── conf/                  # Nginx 站点配置
 ├── docs/img/              # 文档截图
 ├── public/                # 静态资源
 │   └── logo.svg           #   站点 Logo
 ├── src/
 │   ├── assets/            # 图片、图标资源
 │   ├── components/        # 可复用组件
 │   │   ├── alertChannel/  #   告警通道组件
 │   │   ├── alertHistory/  #   告警历史组件
 │   │   ├── alertSilence/  #   告警静默组件
 │   │   ├── alertTemplate/ #   告警模板组件
 │   │   ├── api/           #   API 权限组件
 │   │   ├── base/          #   通用组件（表格、弹窗、搜索等）
 │   │   ├── codeEditor/    #   代码编辑器（Monaco）
 │   │   ├── role/          #   角色组件
 │   │   ├── tenant/        #   租户组件
 │   │   └── user/          #   用户组件
 │   ├── hooks/             # 自定义 Hooks
 │   ├── layout/            # 页面布局
 │   ├── pages/             # 页面
 │   │   ├── alert/         #   告警页面
 │   │   ├── api/           #   API 权限页面
 │   │   ├── channel/       #   通道页面
 │   │   ├── login/         #   登录页面
 │   │   ├── role/          #   角色页面
 │   │   ├── tenant/        #   租户页面
 │   │   └── user/          #   用户页面
 │   ├── services/          # API 请求封装（Axios）
 │   ├── stores/            # 全局状态（Zustand）
 │   ├── types/             # TypeScript 类型定义
 │   └── utils/             # 工具函数
 ├── Dockerfile             # Docker 构建文件
 ├── Makefile               # 构建脚本
 ├── nginx.conf             # Nginx 主配置
 ├── alert.conf             # Nginx 站点配置
 └── vite.config.ts         # Vite 配置
 ```
 
 调用链路：`pages → components → services（API 请求）→ stores（状态管理）`。
 
 ## 快速开始
 
 ### 前置依赖
 
 - Node.js 18+
 - Yarn
 - 后端 api-server 已启动（默认 `http://localhost:8080`）
 
 ### 本地运行
 
 ```bash
 # 克隆仓库
 git clone https://github.com/alert666/ui.git
 cd ui
 
 # 安装依赖
 yarn install
 
 # 启动开发服务器
 yarn dev
 ```
 
 开发服务器默认监听 `http://localhost:5173`，Vite 已配置代理将 `/api` 请求转发到 `http://localhost:8080`。
 
 如需修改后端地址，编辑 [vite.config.ts](vite.config.ts) 中的 `server.proxy` 配置：
 
 ```ts
 server: {
   proxy: {
     "/api": {
       target: "http://your-backend:8080",
       changeOrigin: true,
     },
   },
 },
 ```
 
 ## 部署
 
 ### Docker 镜像
 
 预构建镜像可从以下仓库获取：
 
 - 阿里云容器镜像：`registry.cn-beijing.aliyuncs.com/qqlx/alertmanagerui:latest`
 
 镜像内置 Nginx + OpenTelemetry 模块，可直接提供静态文件服务。
 
 ### 本地构建镜像
 
 ```bash
 # 构建并推送
 make build-push
 
 # 仅构建
 make build
 
 # 仅推送
 make push
 ```
 
 Makefile 会自动生成包含分支名、Commit Hash 和时间戳的镜像 Tag（格式：`main-f4a5874-20260601-155722`）。
 
 ### Docker Compose
 
 项目提供 [docker-compose.yaml](docker-compose.yaml) 用于快速部署：
 
 ```bash
 docker compose up -d
 ```
 
 包含服务：
 
 | 服务    | 说明                    |
 | ------- | ----------------------- |
 | Nginx   | 反向代理 + 静态文件服务 |
 | Backend | api-server 后端服务     |
 
 ### Nginx 配置
 
 生产环境使用 Nginx 提供静态文件服务，配置见 [alert.conf](alert.conf)。核心要点：
 
 - 前端路由使用 `try_files $uri /index.html` 支持 SPA
 - `/api` 路径反向代理到后端 api-server
 - 静态资源启用 `etag on` + `Cache-Control: no-cache`，协商缓存
 - 集成 OpenTelemetry 模块用于分布式追踪
 
 ## 开发指南
 
 ### 添加新页面
 
 遵循项目分层结构，新增功能时按以下顺序添加代码：
 
 1. `src/types/` — 定义 TypeScript 类型
 2. `src/services/` — 封装 API 请求
 3. `src/components/` — 实现可复用组件
 4. `src/pages/` — 实现页面，组合组件
 5. `src/route.ts` — 注册路由
 6. `src/stores/` — 按需添加全局状态
 
 ### 代码规范
 
 ```bash
 # 运行 ESLint
 yarn lint
 ```
 
 ## 相关项目
 
 - 后端 API：[alert666/api-server](https://github.com/alert666/api-server)
 - Alertmanager Proto：[alert666/alertmanager-proto](https://github.com/alert666/alertmanager-proto)
 
 ## License
 
 [MIT](LICENSE)

