import React, { useRef, useState } from "react"; // 1. 引入 useState
import Editor, { OnMount, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Button, GlobalToken, Space, Typography, Tooltip } from "antd"; // 引入 Tooltip 增强体验
import {
  FormatPainterOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons"; // 2. 引入图标

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
  showWordWrap?: boolean; // 3. 增加显示切换换行的控制属性
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "json",
  readOnly = false,
  height = "300px",
  title,
  showFormat = true,
  showWordWrap = true, // 默认开启换行按钮
  token,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // 4. 定义换行状态，Monaco 的换行选项是 'on' | 'off'
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on");

  const isDark =
    token.colorBgContainer.includes("rgb(20") ||
    token.colorBgContainer === "#141414" ||
    token.colorTextBase === "rgba(255, 255, 255, 0.85)";

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  };

  // 5. 切换换行的函数
  const toggleWordWrap = () => {
    setWordWrap((prev) => (prev === "on" ? "off" : "on"));
  };

  const editorTheme = isDark ? "vs-dark" : "vs";

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        overflow: "hidden",
        background: token.colorBgContainer,
        transition: "all 0.3s",
      }}
    >
      {/* 顶部工具栏 */}
      {(title || showFormat || showWordWrap) && (
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
            {/* 6. 自动换行按钮 */}
            {showWordWrap && (
              <Tooltip
                title={wordWrap === "on" ? "禁用自动换行" : "启用自动换行"}
              >
                <Button
                  size="small"
                  icon={
                    wordWrap === "on" ? (
                      <MenuFoldOutlined />
                    ) : (
                      <MenuUnfoldOutlined />
                    )
                  }
                  onClick={toggleWordWrap}
                  style={{ fontSize: "12px" }}
                >
                  {wordWrap === "on" ? "已换行" : "未换行"}
                </Button>
              </Tooltip>
            )}

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
        theme={editorTheme}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: "all",
          wordWrap: wordWrap, // 7. 将状态应用到编辑器配置
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
