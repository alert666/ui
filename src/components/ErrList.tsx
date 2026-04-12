import React, { useMemo, useState } from "react";
import { Modal, List, Alert, Typography, Button, Tooltip, Space } from "antd";

export interface ErrorItem {
  error: string;
  requestId?: string;
}

interface ErrorModalProps {
  errors: ErrorItem[];
  onClose: () => void;
}
const { Text, Paragraph } = Typography;
const SUPPORT_EMAIL = "qinquanliuxiang@qq.com";
const ErrorModal: React.FC<ErrorModalProps> = ({ errors, onClose }) => {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  // 错误信息的文本格式保持不变，依旧很好
  const copyableErrorText = useMemo(() => {
    if (errors.length === 0) {
      return "";
    }
    const jsonString = JSON.stringify(errors, null, 2);
    return `\`\`\`json\n${jsonString}\`\`\``;
  }, [errors]);

  const handleReportByEmail = () => {
    const SAFE_URL_LENGTH_LIMIT = 1500;
    const subject = "应用错误报告";
    let body = "";
    // 检查错误文本的长度
    if (copyableErrorText.length < SAFE_URL_LENGTH_LIMIT) {
      body = `你好，\n\n我在使用应用时遇到了以下问题。诊断信息如下：\n\n${copyableErrorText}\n\n`;
    } else {
      navigator.clipboard.writeText(copyableErrorText);
      body = `你好，\n\n我在使用应用时遇到了一个问题。\n\n由于错误信息过长，已自动为您复制到剪贴板中。\n\n请在此处粘贴 (Cmd+V 或 Ctrl+V) 即可。\n\n↓ ↓ ↓\n\n`;
    }

    body += "我的联系方式是: \n\n(请填写你的联系方式，例如邮箱或电话)\n";
    // 后续步骤保持不变
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  // 你可以保留独立的复制按钮，以防用户只想复制而不发送邮件
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(copyableErrorText).then(() => {
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    });
  };

  return (
    <Modal
      title={`发生了 ${errors.length} 个错误`}
      open={errors.length > 0}
      onCancel={onClose}
      closable={false}
      width="50%"
      mask={false}
      styles={{
        body: {
          maxHeight: "60vh",
          overflowY: "auto",
        },
      }}
      footer={[
        <>
          <Button key="close" onClick={onClose}>
            关闭
          </Button>

          <Button key="report" type="primary" onClick={handleReportByEmail}>
            通过邮件报告
          </Button>
        </>,
      ]}
    >
      <Paragraph>
        <Text type="secondary">
          你可以
          <Tooltip title={copyStatus === "copied" ? "已复制!" : ""}>
            <Typography.Link
              onClick={handleCopyToClipboard}
              style={{ margin: "0 4px" }}
            >
              {copyStatus === "copied" ? "复制详情 ✓" : "复制详情"}
            </Typography.Link>
          </Tooltip>
          ，或直接通过邮件将问题报告给开发团队。
        </Text>
      </Paragraph>
      {errors.length > 0 && (
        <List
          dataSource={errors}
          renderItem={(item, index) => (
            <List.Item className="mb-4">
              <Alert
                style={{ width: "100%" }}
                message={
                  <Space direction="vertical" className="text-sm" size={6}>
                    <Text strong>错误 {index + 1}</Text>
                    <Text type="secondary">{item.error}</Text>
                  </Space>
                }
                description={
                  <Space className="text-sm" size={6}>
                    <Text strong>请求 ID</Text>
                    <Text
                      copyable={{
                        tooltips: ["点击复制", "已复制"],
                      }}
                      type="secondary"
                    >
                      {item.requestId}
                    </Text>
                  </Space>
                }
                type="error"
                showIcon
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default ErrorModal;
