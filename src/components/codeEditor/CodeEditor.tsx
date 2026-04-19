import React, { useRef } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor"; // 引入 monaco 类型
import { Button, GlobalToken, Space, Typography } from "antd";
import { FormatPainterOutlined } from "@ant-design/icons";

// 配置使用本地安装的 monaco-editor，确保主题切换响应更快且不依赖外网
loader.config({ monaco });

interface CodeEditorProps {
  token: GlobalToken;
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: "json" | "yaml" | "javascript" | "sql" | "markdown";
  readOnly?: boolean;
  height?: string | number;
  title?: string;
  showFormat?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "json",
  readOnly = false,
  height = "300px",
  title,
  showFormat = true,
  token,
}) => {
  // 修复类型：使用 IStandaloneCodeEditor 替代 any
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // 获取 Ant Design Token

  /**
   * 判断当前是否为深色模式
   * Ant Design 5.0 中，可以通过检测背景色的亮度或特定的 Token 来判断
   */
  const isDark =
    token.colorBgContainer.includes("rgb(20") || // 默认暗色背景通常较深
    token.colorBgContainer === "#141414" || // AntD 默认暗色
    token.colorTextBase === "rgba(255, 255, 255, 0.85)"; // 简单判定法

  // 当编辑器挂载完成
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // 自动格式化代码
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  };

  // 监听主题变化，手动触发编辑器重新渲染（可选，Monaco 属性变化通常会自动触发）
  const editorTheme = isDark ? "vs-dark" : "vs";

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        overflow: "hidden",
        background: token.colorBgContainer,
        transition: "all 0.3s", // 平滑过渡
      }}
    >
      {/* 顶部工具栏 */}
      {(title || showFormat) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 12px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorFillAlter,
          }}
        >
          <Typography.Text type="secondary" strong style={{ fontSize: "12px" }}>
            {title || language.toUpperCase()}
          </Typography.Text>
          <Space>
            {showFormat && !readOnly && (
              <Button
                size="small"
                type="text"
                icon={<FormatPainterOutlined />}
                onClick={formatCode}
                style={{ fontSize: "12px" }}
              >
                格式化
              </Button>
            )}
          </Space>
        </div>
      )}

      {/* 编辑器本体 */}
      <Editor
        height={height}
        language={language}
        value={value}
        theme={editorTheme} // 动态切换主题
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 8, bottom: 8 },
          // 这里的背景色通常由主题控制，但我们可以微调以适配 AntD
          renderLineHighlight: "all",
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
        onChange={(val) => onChange?.(val)}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default CodeEditor;
