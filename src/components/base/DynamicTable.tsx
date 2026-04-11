import { Table, TableProps } from "antd";
import { useEffect, useRef, useState } from "react";
// 定义基础接口，包含id属性
interface IdEntity {
  id: string;
}
interface DynamicTableProps<T extends IdEntity> extends TableProps<T> {
  extraHeight?: number;
}

export default function DynamicTable<T extends IdEntity>(
  props: DynamicTableProps<T>,
) {
  const { extraHeight, ...tableProps } = props;
  const [scrollY, setScrollY] = useState<string>();
  const tableRef = useRef<HTMLDivElement>(null);

  const updateTableHeight = () => {
    // 获取表头高度
    const headerElement = tableRef.current?.querySelector(".ant-table-thead");
    const headerHeight = headerElement ? headerElement.clientHeight : 0;

    // 获取表格元素距离顶部的距离
    const elementOffsetTop = tableRef.current?.offsetTop || 0;

    // 计算表格内容区域的高度
    const contentHeight = extraHeight
      ? elementOffsetTop + extraHeight + headerHeight
      : elementOffsetTop + headerHeight;
    const height = `calc(100vh - ${contentHeight}px)`;

    setScrollY(height);
  };

  useEffect(() => {
    // 组件加载后计算一次高度
    updateTableHeight();

    // 监听窗口大小变化，重新计算高度
    window.addEventListener("resize", updateTableHeight);
    return () => {
      window.removeEventListener("resize", updateTableHeight);
    };
  }, [extraHeight]);

  return (
    <div ref={tableRef}>
      <Table
        {...tableProps}
        rowKey={(record) => record.id}
        size={tableProps.size ? tableProps.size : "small"}
        scroll={{
          ...tableProps.scroll,
          y: scrollY,
        }}
      />
    </div>
  );
}
