// components/ThemeProvider.tsx
import { App, ConfigProvider, theme as antdTheme } from "antd";
import { createContext, useEffect, useMemo, useState } from "react";
import locale from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
dayjs.locale("zh-cn");

export const GlobalContext = createContext<{
  theme: "light" | "dark";
  setTheme: (mode: "light" | "dark") => void;
}>({
  theme: "light",
  setTheme: () => {},
});

const THEME_KEY = "app-theme";

function getDefaultTheme(): "light" | "dark" {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return "light";
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<"light" | "dark">(getDefaultTheme);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  const contextValue = useMemo(
    () => ({ theme: mode, setTheme: setMode }),
    [mode],
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      <ConfigProvider
        locale={locale}
        theme={{
          token: {
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
          },
          algorithm:
            mode === "dark"
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
          components: {
            Table: {
              fontSize: 14,
              padding: 8,
              headerBorderRadius: 8,
              // 1. 默认尺寸 (size="large" 或不填) 的 padding
              cellPaddingInline: 12, // 左右增加到 16px
              cellPaddingBlock: 12, // 上下增加到 12px (适中行高)
              // 2. 中等尺寸 (size="middle") 的 padding
              cellPaddingInlineMD: 12, // 左右 12px
              cellPaddingBlockMD: 8, // 上下 8px
              // 3. 小尺寸 (size="small") 的 padding
              cellPaddingInlineSM: 8, // 左右 8px
              cellPaddingBlockSM: 6, // 上下 6px
            },
            Pagination: {
              fontSize: 13,
            },
            Card: {
              padding: 16,
              paddingLG: 16,
              paddingSM: 12,
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </GlobalContext.Provider>
  );
}
