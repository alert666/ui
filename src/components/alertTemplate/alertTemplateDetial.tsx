import {
  AlertTemplateUpdateReq,
  EditTemplateState,
} from "@/types/alert/template";
import ModalComponent from "../base/Modal";
import CodeEditor from "../codeEditor/CodeEditor";
import { Button, GlobalToken, Space, Grid } from "antd"; // 引入 Grid
import { useState, useEffect, useMemo } from "react";
import {
  EditOutlined,
  SaveOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { ApiResponse } from "@/types";
import { Result } from "ahooks/lib/useRequest/src/types";
import { Base64 } from "js-base64";

// 引入 Antd 的断点钩子
const { useBreakpoint } = Grid;

export interface AlertTemplateDetailComponentProps {
  token: GlobalToken;
  editTemplate: EditTemplateState;
  setEditTemplate: React.Dispatch<React.SetStateAction<EditTemplateState>>;
  alertTemplateUpdateResult: Result<
    ApiResponse<unknown>,
    [id: string, data: AlertTemplateUpdateReq]
  >;
}

function AlertTemplateDetailComponent(
  props: AlertTemplateDetailComponentProps,
) {
  const { token, editTemplate, setEditTemplate, alertTemplateUpdateResult } =
    props;

  const screens = useBreakpoint(); // 获取当前屏幕断点
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempValue, setTempValue] = useState<string>("");

  // --- 响应式逻辑计算 ---

  // 1. 动态计算 Modal 宽度
  const modalWidth = useMemo(() => {
    if (screens.xxl) return "60%";
    if (screens.xl) return "75%";
    if (screens.lg) return "85%";
    if (screens.md) return "90%";
    return "98%"; // 手机端几乎全屏
  }, [screens]);

  // 2. 动态计算编辑器高度 (视口高度 - 头部底部预留空间)
  const editorHeight = useMemo(() => {
    if (screens.xs) return "400px"; // 手机端短一些
    return "calc(100vh - 320px)"; // 电脑端根据屏幕高度自适应
  }, [screens]);

  // ---------------------

  const safeDecode = (str: string) => {
    if (!str) return "";
    try {
      if (Base64.isValid(str)) return Base64.decode(str);
      return str;
    } catch {
      return str;
    }
  };

  useEffect(() => {
    if (editTemplate.templateDetailOpen && editTemplate.templateRecord?.id) {
      const rawValue = editTemplate.aggregation
        ? editTemplate.templateRecord.aggregationTemplate
        : editTemplate.templateRecord.template;
      setTempValue(safeDecode(rawValue || ""));
    }
  }, [editTemplate.templateDetailOpen, editTemplate.aggregation]);

  const handleCancel = () => {
    setIsEditing(false);
    setEditTemplate((prev) => ({ ...prev, templateDetailOpen: false }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      const record = editTemplate.templateRecord;
      if (!record?.id) return;
      const encodedValue = Base64.encode(tempValue);
      const payload: AlertTemplateUpdateReq = {
        ...record,
        template: editTemplate.aggregation
          ? Base64.encode(record.template)
          : encodedValue,
        aggregationTemplate: editTemplate.aggregation
          ? encodedValue
          : Base64.encode(record.aggregationTemplate),
      };

      alertTemplateUpdateResult.run(record.id, payload);
      setIsEditing(false);
      setEditTemplate((prev) => ({
        ...prev,
        templateRecord: {
          ...prev.templateRecord,
          [editTemplate.aggregation ? "aggregationTemplate" : "template"]:
            encodedValue,
        },
      }));
    } else {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    const record = editTemplate.templateRecord;
    const rawValue = editTemplate.aggregation
      ? record.aggregationTemplate
      : record.template;
    setTempValue(safeDecode(rawValue || ""));
    setIsEditing(false);
  };

  const renderFooter = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      <Space>
        {isEditing && (
          <Button
            icon={<RollbackOutlined />}
            onClick={handleCancelEdit}
            size={screens.xs ? "small" : "middle"}
          >
            {screens.xs ? "取消" : "取消编辑"}
          </Button>
        )}
      </Space>
      <Space>
        <Button onClick={handleCancel} size={screens.xs ? "small" : "middle"}>
          关闭
        </Button>
        <Button
          type={isEditing ? "primary" : "default"}
          icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
          onClick={handleEditToggle}
          loading={alertTemplateUpdateResult.loading}
          size={screens.xs ? "small" : "middle"}
        >
          {isEditing
            ? screens.xs
              ? "保存"
              : "完成并保存"
            : screens.xs
              ? "编辑"
              : "进入编辑"}
        </Button>
      </Space>
    </div>
  );

  return (
    <ModalComponent
      title={editTemplate.aggregation ? "聚合模板" : "普通模板"}
      open={editTemplate.templateDetailOpen}
      handleCancel={handleCancel}
      closable={true}
      width={modalWidth} // 使用动态宽度
      centered={!screens.xs} // 手机端置顶显示，电脑端居中
      style={screens.xs ? { top: 10, padding: 8 } : {}} // 手机端缩小边距
      footer={renderFooter()}
      destroyOnHidden
      confirmLoading={alertTemplateUpdateResult.loading}
    >
      <div style={{ marginBottom: screens.xs ? 8 : 16 }}>
        <CodeEditor
          readOnly={!isEditing}
          value={tempValue}
          onChange={(val) => setTempValue(val || "")}
          token={token}
          language="yaml"
          height={editorHeight} // 使用动态高度
          title={isEditing ? "编辑中..." : "只读模式"}
        />
      </div>
    </ModalComponent>
  );
}

export default AlertTemplateDetailComponent;
