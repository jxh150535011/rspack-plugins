import { Component, render } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';
import VirtualList from 'preact-virtual-list';
import { formatSize, getUrlName } from '../../utils';
import { NetWorkPanelDetailModal } from './NetWorkPanelDetailModal';
import { Table, Input, Button } from '../Component';

import type { MonitorNetworkDataType  } from '../../types';

const columns = [
  {
    title: 'Name',
    field: 'name',
    width: 150,
    render(name: string, item: MonitorNetworkDataType) {
      return getUrlName(item.url);
    }
  },
  {
    title: 'Url',
    field: 'url',
    width: 150,
  },
  {
    title: 'Method',
    field: 'method',
    width: 60,
  },
  {
    title: 'Status',
    field: 'status',
    width: 50,
  },
  {
    title: 'Type',
    field: 'type',
    width: 70,
  },
  {
    title: 'Size',
    field: 'size',
    width: 80,
    render(size: number) {
      return formatSize(size);
    }
  },
  {
    title: 'Time',
    field: 'time',
    width: 80,
    render(time: number) {
      return `${Math.round(time)}ms`;
    }
  },
]
export interface NetworkPanelProps {
  list: MonitorNetworkDataType[];
  readOnly?: boolean;
  onClear?: () => void;
}

export const NetworkPanel = (props: NetworkPanelProps) => {
  const { list = [], readOnly = false, onClear } = props;
  const [keyword, setKeyword] = useState('');

  const [modalData, setModalData] = useState<MonitorNetworkDataType>();

  const rowHeight = 24;

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword);
  }

  const handleClick = (item: MonitorNetworkDataType) => {
    setModalData(item);
  }
  const handleClose = () => {
    // @ts-ignore
    setModalData(null);
  }

  const genRowClassName = (record: MonitorNetworkDataType) => {
    if (record.status >= 200 && record.status < 300) {
      return '';
    }
    return '__vm_tr-error';
  }

  const rawList = useMemo(() => {
    return list.map((item) => {
      return {
        ...item,
        keyword: (item.url || '').toLowerCase(),
      }
    });
  }, [list]);

  const filterList = useMemo(() => {
    if (!keyword) {
      return rawList;
    }
    const search = keyword.toLowerCase();
    return rawList.filter(item => item.keyword.includes(search));
  }, [rawList, keyword]);

  const handleClearClick = () => {
    onClear?.();
  }

  return html`
    <div className="__vm_debug-netowrk-panel">
      <div className="__vm_debug-netowrk-panel_toolbar">
        <${Input} value="${keyword}" placeholder="Filter" onChange="${handleSearch}" size="small" />
        ${!readOnly ? html`
          <${Button} type="primary" size="small" onClick="${handleClearClick}">Clear</${Button}>
        ` : null}
      </div>
      <${Table}
        columns="${columns}"
        bordered="true"
        data="${filterList}"
        rowHeight="${rowHeight}"
        rowClassName="${genRowClassName}"
        onRowClick="${handleClick}"
      />
      <${NetWorkPanelDetailModal} data="${modalData}" onClose="${handleClose}" />
    </div>
  `;
}