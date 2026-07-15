import { useState, useMemo} from 'preact/hooks';
import { html } from 'htm/preact';
import VirtualList from 'preact-virtual-list';
import { useSize } from './hooks';

export interface TableColumnsType {
  field: string;
  title: string;
  render?: (value: any) => any;
}


export interface TableCellProps {
  width: number;
  value: string;
}

export const TableCell = (props: TableCellProps) => {
  const { width, value } = props;
  return html`
    <div className="__vm_td" style="width: ${width}px;">
      ${value}
    </div>
  `;
}


export interface TableRowProps {
  record: any;
  onClick?: (record: any) => void;
  columns: any[];
  rowClassName?: string;
  active?: boolean;
}

export const TableRow = (props: TableRowProps) => {
  const { record, columns, rowClassName, onClick, active } = props;
  const cells = columns.map(col => {
    return {
      width: col.width,
      // @ts-ignore
      value: col.render(record[col.field], record),
    }
  });

  const handleClick = () => {
    onClick?.(record);
  }

  return html`
    <div className="${rowClassName} __vm_tr ${active ? 'active' : ''}" onClick="${handleClick}">
      ${cells.map(item => html`
        <${TableCell} width="${item.width}" value="${item.value}" />
      `)}
    </div>
  `;
}



export interface TableProps {
  data?: any[];
  bordered?: boolean;
  columns?: TableColumnsType[];
  className?: string;
  rowClassName?: string | ((record: any) => string);
  rowHeight?: number;
  onRowClick?: (record: any) => void;
  rowKey?: string;
}
export const Table = (props: TableProps) => {
  const { data = [], columns, className = '', rowClassName = '', rowHeight = 32, onRowClick, rowKey = 'id', bordered } = props;

  const [selectRowKeys, setSelectRowKeys] = useState<string[]>([]);

  const { ref, size } = useSize();


  const genRowClassName = (record: any) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(record);
    }
    return rowClassName;
  }


  const [rawColumns, tableWidth] = useMemo(() => {

    // document.documentElement.clientWidth
    const clientWidth = size.width;

    // 真实宽度最大宽度
    // @ts-ignore
    const tableWidth = (columns || []).reduce((acc, cur) => acc + (cur.width || 100), 0);
    // 折算比例
    const radio = clientWidth / tableWidth;

    const newColumns = (columns || []).map(col => {
      // @ts-ignore
      let width = col.width || 100;
      width = Math.max(width * radio, width);
      return {
        render(value: any) {
          return value;
        },
        ...col,
        width
      }
    });

    return [
      newColumns,
      Math.max(tableWidth, clientWidth),
    ];

  }, [columns, size.width]);

  const renderHeader = () => {
    return html`
      <div className="__vm_thead">
        <div className="__vm_tr">
          ${rawColumns.map(item => html`
            <${TableCell} width="${item.width}" value="${item.title}" />
          `)}
        </div>
      </div>
    `;
  }

  const handleRowClick = (record: any) => {
    onRowClick?.(record);
    setSelectRowKeys([record[rowKey]]);
  }

  const renderRow = (record: any) => {
    const isSelected = selectRowKeys.includes(record[rowKey]);
    const currentRowClassName = genRowClassName(record);
    return html`
      <${TableRow} active="${isSelected}" record="${record}" columns="${rawColumns}" rowClassName="${currentRowClassName}" onClick="${handleRowClick}" />
    `;
  }

  const header = useMemo(() => renderHeader(), [rawColumns]);

  const style = {
    width: `${tableWidth}px`,
    '--var-row-height': `${rowHeight}px`,
  }

  return html`
    <div className="__vm_table ${className} ${bordered ? 'bordered' : ''}" ref="${ref}">
      <div className="__vm_table_inner" style="${style}">
        ${header}
        <${VirtualList} sync className="__vm_tbody"
          data=${data}
          rowHeight=${rowHeight}
          renderRow=${renderRow}
        />
      </div>
    </div>
  `;
}