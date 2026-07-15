import { Component, render } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';
import { Table, List, Button, showToast, Input } from '../Component';
import { JsonView } from 'preact-tiny-json-view';
import { toJson } from '../../utils';

const menus = [
  {
    value: 'storage',
    label: 'Storage',
    level: 0,
    children: [
      {
        value: 'localStorage',
        label: 'Local Storage',
        level: 1,
      },
      {
        value: 'sessionStorage',
        label: 'Session Storage',
        level: 1,
      },
      {
        value: 'cookie',
        label: 'Cookie',
        level: 1,
      },
    ],
  },
]

const ApplicationPanelMenu = (props: any) => {
  const { activeKey, onActiveKeyChange } = props;
  const items = menus.flatMap((item) => [item, ...item.children]);

  const nodes = items.map((item) => {
    const active = item.value === activeKey;
    const onClick = () => {
      if (item.level) {
        onActiveKeyChange?.(item.value);
        return;
      }
    }
    return (
      html`
        <div className="__vm_menu_item __vm_menu_item_level_${item.level} ${active ? 'active' : ''}" onClick="${onClick}">
          ${item.label}
        </div>
      `
    )
  })

  return html`
    <div className="__vm_debug-application-panel_menu">
      ${nodes}
    </div>
  `;
}


const columns = [
  {
    title: 'Key',
    field: 'key',
    width: 175,
  },
  {
    title: 'Value',
    field: 'value',
    width: 200,
  },
]
export interface ApplicationPanelProps {
  data: any;
  onRefresh?: () => void;
  readOnly?: boolean;
}

export const ApplicationPanel = (props: ApplicationPanelProps) => {
  const { data, onRefresh, readOnly } = props;
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [menuKey, setMenuKey] = useState<string>('localStorage');
  const handleActiveKeyChange = (key: string) => {
    setSelectedRow(null);
    setKeyword('');
    setMenuKey(key);
  }

  // 数据列表
  const list = useMemo(() => data?.[menuKey] || [], [data, menuKey]);

  const rowKey = 'key';

  const rowHeight = 20;

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
  }

  const previewNode = useMemo(() => {
    if (!selectedRow) {
      return (
        html`
          <div className="__vm_debug-application-panel_preview_empty">没有指定数据项</div>
        `
      )
    }
    const obj = toJson(selectedRow.value, selectedRow.value);
    // 增加key 每次更新全部初始化
    return html`
      <${JsonView} key="${Date.now()}" value="${obj}" />
    `;
  }, [selectedRow]);

  const handleClearClick = () => {
    if (['localStorage', 'sessionStorage'].includes(menuKey)) {
      // @ts-ignore
      const storage = window[menuKey];
      storage?.clear();
    } else if (menuKey === 'cookie') {
      document.cookie = '';
    }
    showToast({
      content: '已清除',
    });
    onRefresh?.();
  }

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword);
  }

  const rawList = useMemo(() => {
    return list.map((item: any) => {
      return {
        ...item,
        keyword: [item.key || '', item.value || ''].join(' ').toLowerCase(),
      }
    });
  }, [list]);


  const filterList = useMemo(() => {
    if (!keyword) {
      return rawList;
    }
    const search = keyword.toLowerCase();
    return rawList.filter((item: any) => {
      return item.keyword.includes(search);
    });
  }, [rawList, keyword]);


  return html`
    <div className="__vm_debug-application-panel">
      <${ApplicationPanelMenu} activeKey="${menuKey}" onActiveKeyChange="${handleActiveKeyChange}" />
      <div className="__vm_debug-application-panel_content">
        <div className="__vm_debug-application-panel_toolbar">
          <${Input} value="${keyword}" placeholder="Filter" onChange="${handleSearch}" size="small" />
          ${!readOnly ? html`
            <${Button} type="primary" size="small" onClick="${handleClearClick}">Clear</${Button}>
          ` : null}
        </div>
        <${Table}
          data=${filterList}
          bordered="true"
          rowHeight="${rowHeight}"
          rowKey="${rowKey}"
          onRowClick="${handleRowClick}"
          columns=${columns}
        />
        <div className="__vm_debug-application-panel_preview">
          ${previewNode}
        </div>
      </div>
      
    </div>
  `;
}