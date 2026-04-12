import { Modal } from "antd";

interface ModalComponentProps extends React.ComponentProps<typeof Modal> {
  open: boolean;
  title?: string | React.ReactNode;
  handleCancel: () => void;
  handleOk?: () => void;
  confirmLoading: boolean;
  children?: React.ReactNode;
}

const ModalComponent = ({
  title,
  open,
  handleCancel,
  handleOk,
  confirmLoading,
  children,
  style,
  styles,
  ...rest
}: ModalComponentProps) => {
  return (
    <Modal
      {...rest}
      style={style}
      styles={{
        body: {
          margin: "20px",
          // ...styles?.body,
        },
        ...styles,
      }}
      mask={false}
      okText="确认"
      cancelText="取消"
      title={title}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
    >
      {children}
    </Modal>
  );
};

export default ModalComponent;
