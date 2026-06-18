# Repository Guidelines

## Project Structure & Module Organization

This is a React + TypeScript frontend built with Vite, Ant Design (antd), and TailwindCSS v4.

```
src/
├── components/     # Shared UI components (base/, alert*, user, role, etc.)
├── pages/          # Page-level components (alert/, user/, role/, login/, etc.)
├── services/       # API service layer (http.ts + domain-specific services)
├── stores/         # Zustand state stores
├── types/          # TypeScript type definitions, organized by domain
├── hooks/          # Custom React hooks
├── assets/         # Static assets (images, SVGs)
├── layout/         # Layout wrapper component (Layout.tsx)
├── utils/          # Utility functions
├── route.ts        # React Router v7 route definitions and menu config
├── App.tsx         # Root component (ThemeProvider, error modal, router)
└── main.tsx        # Entry point
```

Path aliases: `@/` maps to `src/` (configured in both `tsconfig.json` and `vite.config.ts`).

## Build, Test, and Development Commands

| Command | Description |
|---|---|
| `npm run dev` or `yarn dev` | Start Vite dev server with hot reload on `--host` |
| `npm run build` or `yarn build` | Type-check with `tsc -b` then produce a production bundle |
| `npm run lint` or `yarn lint` | Run ESLint across the entire project |
| `npm run preview` or `yarn preview` | Preview the production build locally |
| `make build` | Build Docker image with auto-generated tag (branch-commit-timestamp) |
| `make push` | Push the Docker image to the registry |
| `make build-push` | Build and push in one step |

The dev server proxies `/api` requests to `http://localhost:8080` (configurable in `vite.config.ts`).

## Coding Style & Naming Conventions

- **Indentation:** 2 spaces (ESLint-enforced).
- **File extensions:** `.tsx` for components, `.ts` for logic, types, and services.
- **Naming:** PascalCase for components and their files (e.g., `CreateUserModal.tsx`), camelCase for utilities and hooks.
- **Exports:** Default exports are used for page components; named exports for most other modules.
- **Styling:** TailwindCSS utility classes (v4) combined with Ant Design components. Avoid inline styles unless unavoidable.
- **Linting:** `eslint.config.js` enforces TypeScript recommended rules and React Hooks rules. Run `npm run lint` before committing.

## Testing Guidelines

The project currently does not have a dedicated test runner or coverage framework configured. A `src/test/Test.tsx` page exists for manual development smoke-testing. Adding Vitest (already compatible with the Vite toolchain) is recommended for future test coverage.

## Commit & Pull Request Guidelines

- **Commit style:** Use a concise prefix to categorize the change, followed by a colon and a brief description in Chinese or English. Examples from the Git history:
  - `feature: 创建静默规则`
  - `fix: 修复 Makefile 问题`
  - `add: 增加 Dockerfile`
  - `refactor/alert` (branch naming for larger refactors)
- **Branch naming:** Use descriptive slugs like `feature/alertmanager-config` or `refactor/alert`. Merge into `main` via pull request.
- **Pull requests:** Include a clear description of the change and link to any relevant issues. Screenshots are encouraged for UI changes.

## Architecture Overview

- **Routing:** React Router v7 with nested layouts. Routes are defined in `src/route.ts`, which also exports the sidebar menu configuration (`GetMenuItem`).
- **State management:** Zustand stores in `src/stores/` (e.g., `userStore.ts`, `useErrorStore.ts`).
- **API layer:** Axios-based HTTP client in `src/services/http.ts`. Domain services (e.g., `src/services/user.ts`) import this client and provide typed API calls.
- **Authentication:** OAuth2 flow supporting Lark (飞书) and Keycloak. Login pages at `/login` and `/oauth/login`.
- **Error handling:** API errors are captured via a global error store and displayed in a modal (`ErrorModal`).

## Deployment

Production deployment uses Docker with an auto-generated image tag (`<branch>-<short-sha>-<timestamp>`). The `Dockerfile` builds the static output and serves it behind Nginx. A `docker-compose.yaml` is provided for local orchestration with Caddy as the reverse proxy.
