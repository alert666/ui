import AlertTemplateModal from "@/components/alertTemplate/EditAlertTemplate";
import DynamicTable from "@/components/base/DynamicTable";
import {
  CopyAlertTemplate,
  CreateAlertTemplate,
  DeleteAlertTemplate,
  GetAlertTemplateList,
  UpdateAlertTemplate,
} from "@/services/alertTemplate";
import {
  AlertTemplateListReq,
  AlertTemplateRecord,
  CreateAlertTemplateReq,
  TEMPLATE_SEARCH_DIMENSIONS,
} from "@/types/alert/template";
import { PageOptionEnum } from "@/types/enum";
import { useRequest } from "ahooks";
import { Button, Form, Input, message, Modal, theme } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CreateAlertTemplateModal from "@/components/alertTemplate/CreateAlertTemplate";
import { GetAlertTemplateColumns } from "@/components/alertTemplate/alertTemplateTableColums";
import SearchFilter from "@/components/base/SearchFilter";

function AlertTemplatePage() {
  // ------ 变量定义 ------
  const { token } = theme.useToken();
  const [searchParams, setSearchParams] = useSearchParams();

  // ------ 告警模版列表请求 ------
  const alertTemplateResult = useRequest(GetAlertTemplateList, {
    manual: true,
  });

  // ------ 监听 URL 参数，自动发起 AlertTemplateList 接口调用 ------
  useEffect(() => {
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const name = searchParams.get("name");
    if (!page || !pageSize) {
      const newParams = new URLSearchParams(searchParams);
      if (!page) newParams.set("page", PageOptionEnum.DEFAULTPAGE.toString());
      if (!pageSize)
        newParams.set("pageSize", PageOptionEnum.DEFAULTPAGESIZE.toString());
      setSearchParams(newParams, { replace: true });
      return;
    }

    const params: AlertTemplateListReq = {
      page: page ? Number(page) : PageOptionEnum.DEFAULTPAGE,
      pageSize: pageSize ? Number(pageSize) : PageOptionEnum.DEFAULTPAGESIZE,
      name: name ? name : undefined,
    };
    alertTemplateResult.run(params);
  }, [searchParams]);

  // ------ 更新告警模板请求 ------
  const alertTemplateUpdateResult = useRequest(UpdateAlertTemplate, {
    manual: true,
    onSuccess: () => {
      message.success("更新成功");
      alertTemplateResult.refresh();
    },
  });

  // ------ 编辑 AlertTemplate ------
  const [alertTemplateDrawerOpen, setAlertTemplateDrawerOpen] =
    useState<boolean>(false);
  const [alertTemplateRecord, setAlertTemplateRecord] =
    useState<AlertTemplateRecord>({} as AlertTemplateRecord);

  // ------ 删除 AlertTemplate ------
  const alertTemplateDelteResult = useRequest(DeleteAlertTemplate, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      alertTemplateResult.refresh();
    },
  });

  // ------ 拷贝 AlertTemplate ------
  const copyResult = useRequest(CopyAlertTemplate, {
    manual: true,
    onSuccess: () => {
      message.success("拷贝成功");
      setCopyModalOpen(false);
      alertTemplateResult.refresh();
    },
  });
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyTarget, setCopyTarget] = useState<AlertTemplateRecord | null>(
    null,
  );
  const [copyForm] = Form.useForm();

  const handleCopyClick = (record: AlertTemplateRecord) => {
    setCopyTarget(record);
    copyForm.setFieldsValue({ name: (record.name || "") + "-Copy" });
    setCopyModalOpen(true);
  };

  const handleCopyOk = async () => {
    try {
      const values = await copyForm.validateFields();
      if (copyTarget) {
        copyResult.run(copyTarget.id, { name: values.name });
      }
    } catch {
      // validation failed
    }
  };

  // ------ 新建模版 ------
  const createResult = useRequest(CreateAlertTemplate, {
    manual: true,
    onSuccess: () => {
      alertTemplateResult.refresh();
    },
  });
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  const HandleCreateClose = () => {
    setCreateOpen(false);
  };
  const HandleCreateSave = (values: CreateAlertTemplateReq) => {
    createResult.run(values);
  };

  return (
    <>
      <CreateAlertTemplateModal
        token={token}
        visible={createOpen}
        onClose={HandleCreateClose}
        onSave={HandleCreateSave}
      />
      <AlertTemplateModal
        width="60%"
        token={token}
        visible={alertTemplateDrawerOpen}
        onClose={() => {
          setAlertTemplateRecord({} as AlertTemplateRecord);
          setAlertTemplateDrawerOpen(false);
        }}
        record={alertTemplateRecord}
        alertTemplateUpdateResult={alertTemplateUpdateResult}
      />

      <Modal
        title="拷贝模板"
        open={copyModalOpen}
        onOk={handleCopyOk}
        onCancel={() => setCopyModalOpen(false)}
        confirmLoading={copyResult.loading}
        destroyOnHidden
      >
        <Form form={copyForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="新模板名称"
            rules={[{ required: true, message: "请输入新模板名称" }]}
          >
            <Input placeholder="请输入拷贝后的模板名称" />
          </Form.Item>
        </Form>
      </Modal>

      <SearchFilter
        dimensions={TEMPLATE_SEARCH_DIMENSIONS}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onRefresh={() => alertTemplateResult.refresh()}
        extra={
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            新建模板
          </Button>
        }
      />

      <DynamicTable
        size="large"
        loading={alertTemplateResult.loading}
        dataSource={alertTemplateResult.data?.list || []}
        columns={GetAlertTemplateColumns({
          token,
          setAlertTemplateRecord,
          alertTemplateDelteResult,
          onCopyClick: handleCopyClick,
          setAlertTemplateDrawerOpen,
        })}
        pagination={{
          current: Number(searchParams.get("page")) || 1,
          pageSize: Number(searchParams.get("pageSize")) || 10,
          total: alertTemplateResult.data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条数据`,
          onChange: (p, s) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", p.toString());
            params.set("pageSize", s.toString());
            setSearchParams(params);
          },
        }}
        bordered
      />
    </>
  );
}

export default AlertTemplatePage;
