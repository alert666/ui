import {
  AlertTemplateUpdateReq,
  EditTemplateState,
} from "@/types/alert/template";
import ModalComponent from "../base/Modal";
import CodeEditor from "../codeEditor/CodeEditor";
import { Button, GlobalToken, Space } from "antd";
import { useState, useEffect } from "react";
import {
  EditOutlined,
  SaveOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { ApiResponse } from "@/types";
import { Result } from "ahooks/lib/useRequest/src/types";
import { Base64 } from "js-base64";

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

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempValue, setTempValue] = useState<string>("");

  // 当外部传入的 record 变化时，同步本地临时值
  useEffect(() => {
    if (editTemplate.template !== "") {
      setTempValue(editTemplate.template);
    }
  }, [editTemplate]);

  const handleCancel = () => {
    setIsEditing(false);
    setEditTemplate({
      templateDetailOpen: false,
      template: "",
      aggregation: false,
      templateID: "",
    });
  };

  const handleEditToggle = () => {
    // 更新逻辑
    if (isEditing) {
      const base64Content = Base64.encode(tempValue);
      const data: AlertTemplateUpdateReq = {};
      if (editTemplate.aggregation) {
        data.aggregationTemplate = base64Content;
      } else {
        data.template = base64Content;
      }
      alertTemplateUpdateResult.run(editTemplate.templateID, data);
    } else {
      // 开启编辑模式
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    // 恢复为原始值并关闭编辑模式
    setTempValue(editTemplate.template);
    setIsEditing(false);
  };

  // 自定义 Modal 底部按钮
  const renderFooter = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Space>
        {isEditing && (
          <Button icon={<RollbackOutlined />} onClick={handleCancelEdit}>
            取消编辑
          </Button>
        )}
      </Space>
      <Space>
        <Button onClick={handleCancel}>关闭详情</Button>
        <Button
          type={isEditing ? "primary" : "default"}
          icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
          onClick={handleEditToggle}
        >
          {isEditing ? "完成并保存" : "进入编辑"}
        </Button>
      </Space>
    </div>
  );

  return (
    <ModalComponent
      title={"查看模板详细信息"}
      open={editTemplate.templateDetailOpen}
      handleCancel={handleCancel}
      confirmLoading={false}
      closable={true}
      keyboard={false}
      width="60%"
      footer={renderFooter()}
    >
      <div style={{ marginBottom: 16 }}>
        <CodeEditor
          readOnly={!isEditing} // 修正：非编辑状态下只读
          value={tempValue}
          onChange={(val) => setTempValue(val || "")}
          token={token}
          language="yaml"
          height="700px"
          title={isEditing ? "正在编辑模板..." : "查看模式 (只读)"}
        />
      </div>
    </ModalComponent>
  );
}

export default AlertTemplateDetailComponent;
