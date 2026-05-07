import { AlertTemplateRecord } from "@/types/alert/template";
import ModalComponent from "../base/Modal";
import CodeEditor from "../codeEditor/CodeEditor";
import { Button, GlobalToken, Space } from "antd";
import { useState, useEffect } from "react";
import {
  EditOutlined,
  SaveOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

export interface AlertTemplateDetailComponentProps {
  token: GlobalToken;
  modelOpen: boolean;
  setTemplateDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  templateRecord: AlertTemplateRecord;
  setTemplateRecord: React.Dispatch<React.SetStateAction<AlertTemplateRecord>>;
  onSave?: (record: AlertTemplateRecord) => Promise<void>; // 增加保存回调
}

function AlertTemplateDetailComponent(
  props: AlertTemplateDetailComponentProps,
) {
  const {
    token,
    modelOpen,
    setTemplateDetailOpen,
    templateRecord,
    setTemplateRecord,
  } = props;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempValue, setTempValue] = useState<string>("");

  // 当外部传入的 record 变化时，同步本地临时值
  useEffect(() => {
    if (templateRecord?.template) {
      setTempValue(templateRecord.template);
    }
  }, [templateRecord]);

  const handleCancel = () => {
    setIsEditing(false);
    setTemplateDetailOpen(false);
    setTemplateRecord({} as AlertTemplateRecord);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // 如果当前是编辑状态，点击则执行保存逻辑
      handleSave();
    } else {
      // 开启编辑模式
      setIsEditing(true);
    }
  };

  const handleSave = async () => {};

  const handleCancelEdit = () => {
    // 恢复为原始值并关闭编辑模式
    setTempValue(templateRecord.template);
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
      open={modelOpen}
      handleCancel={handleCancel}
      confirmLoading={false}
      closable={true}
      keyboard={false}
      width="60%"
      // 如果你的 ModalComponent 支持 footer 属性，可以直接传进去
      // 否则你可以把 renderFooter 的内容放在 Modal 的底部
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
