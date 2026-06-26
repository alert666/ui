# 仓库指南

## 项目结构与模块组织

这是一个基于 Vite、Ant Design v5 (antd) 和 TailwindCSS v4 构建的 React + TypeScript 前端项目。

```
src/
├── components/     # 共享 UI 组件（base/*、alert*、user、role 等）
├── pages/          # 页面级组件（alert/*、user/*、role/*、login/* 等）
├── services/       # API 服务层（http.ts + 领域级服务）
├── stores/         # Zustand 状态管理
├── types/          # TypeScript 类型定义，按领域组织
├── hooks/          # 自定义 React Hooks
├── assets/         # 静态资源（图片、SVG）
├── layout/         # 布局包装组件（Layout.tsx）
├── utils/          # 工具函数
├── route.ts        # React Router v7 路由定义和菜单配置
├── App.tsx         # 根组件（ThemeProvider、错误弹窗、路由）
└── main.tsx        # 入口文件
```

路径别名：`@/` 映射到 `src/`（在 `tsconfig.json` 和 `vite.config.ts` 中配置）。

## 构建、测试与开发命令

| 命令                                | 说明                                                 |
| ----------------------------------- | ---------------------------------------------------- |
| `npm run dev` 或 `yarn dev`         | 启动 Vite 开发服务器，热重载，监听 `--host`          |
| `npm run build` 或 `yarn build`     | 使用 `tsc -b` 类型检查后生成生产构建                 |
| `npm run lint` 或 `yarn lint`       | 在全部项目上运行 ESLint                              |
| `npm run preview` 或 `yarn preview` | 本地预览生产构建                                     |
| `make build`                        | 构建 Docker 镜像，自动生成标签（分支-commit-时间戳） |
| `make push`                         | 推送 Docker 镜像到镜像仓库                           |
| `make build-push`                   | 一步完成构建和推送                                   |

开发服务器会将 `/api` 请求代理到 `http://localhost:8080`（可在 `vite.config.ts` 中配置）。

## 编码风格与命名规范

- **缩进**：2 个空格（ESLint 强制）。
- **文件扩展名**：组件使用 `.tsx`，逻辑、类型和服务使用 `.ts`。
- **命名**：组件及组件文件使用 PascalCase（如 `CreateUserModal.tsx`），工具函数和 Hooks 使用 camelCase。
- **导出**：页面组件使用默认导出；其他模块主要使用命名导出。
- **样式**：TailwindCSS 工具类（v4）配合 Ant Design 组件。除非必要，避免使用内联样式。
- **Linting**：`eslint.config.js` 强制执行 TypeScript 推荐规则和 React Hooks 规则。提交前请运行 `npm run lint`。

## 测试指南

项目当前没有配置专门的测试运行器或覆盖率框架。`src/test/Test.tsx` 页面可用于手动开发冒烟测试。建议后续使用 Vitest（与 Vite 工具链兼容）来增加测试覆盖率。

## 提交与 PR 规范

- **提交风格**：使用简洁的前缀对变更分类，后跟冒号和简短的中文或英文描述。Git 历史示例：
  - `feature: 创建静默规则`
  - `fix: 修复 Makefile 问题`
  - `add: 增加 Dockerfile`
  - `refactor/alert`（大型重构时使用的分支名）
- **分支命名**：使用描述性的分支名，如 `feature/alertmanager-config` 或 `refactor/alert`。通过 Pull Request 合并到 `main`。
- **Pull Request**：包含清晰的变更描述，并关联相关 Issue。UI 变更鼓励附带截图。

## 架构概述

- **路由**：React Router v7，支持嵌套布局。路由定义在 `src/route.ts` 中，该文件也导出了侧边栏菜单配置（`GetMenuItem`）。
- **状态管理**：Zustand 状态库位于 `src/stores/`（如 `userStore.ts`、`useErrorStore.ts`）。
- **API 层**：基于 Axios 的 HTTP 客户端位于 `src/services/http.ts`。领域级服务（如 `src/services/user.ts`）导入该客户端并提供类型化的 API 调用。
- **认证**：支持飞书和 Keycloak 的 OAuth2 登录流程。登录页面位于 `/login` 和 `/oauth/login`。
- **错误处理**：API 错误通过全局错误状态捕获，并在弹窗（`ErrorModal`）中展示。

## 部署

生产部署使用 Docker，镜像标签自动生成（`<分支>-<短 commit SHA>-<时间戳>`）。`Dockerfile` 构建静态输出并通过 Nginx 提供服务。`docker-compose.yaml` 使用 Caddy 作为反向代理，提供本地编排运行。