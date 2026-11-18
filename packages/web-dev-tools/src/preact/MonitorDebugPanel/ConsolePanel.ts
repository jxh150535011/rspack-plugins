import { Component, render } from 'preact';
import { useState, useMemo, useRef } from 'preact/hooks';
import { html } from 'htm/preact';
import { List, Input, Button, ToolBar } from '../Component';
import { objectParse } from '../../utils';
import { JsonView } from 'preact-tiny-json-view';
import type { MonitorConsoleDataType  } from '../../types';

export interface ConsolePanelProps {
  list: MonitorConsoleDataType[];
  readOnly?: boolean;
  onClear?: () => void;
  refreshKey?: string;
}

export const ConsolePanel = (props: ConsolePanelProps) => {
  const { list = [], readOnly = false, onClear, refreshKey } = props;

  const toolBarRef = useRef<any>(null);

  const [keyword, setKeyword] = useState('');
  const [currentRefreshKey, setCurrentRefreshKey] = useState(refreshKey || '');


  const handleRefresh = () => {
    setCurrentRefreshKey(currentRefreshKey + 1);
  }

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword);
  }

  const options = useMemo(() => {
    return list.map((item) => {
      return {
        key: item.id,
        keyword: (item.message || []).join(' ').toLowerCase(),
        value: (item.message || []).map(value => {
          const obj = objectParse(value);
          if (typeof obj === 'string') {
            return obj;
          }
          return html`
            <${JsonView} value=${obj} />
          `
        }),
        className: item.type || 'info',
      }
    })
  }, [list, refreshKey, currentRefreshKey]);

  const filterOptions = useMemo(() => {
    if (!keyword) {
      return options;
    }
    const search = keyword.toLowerCase();
    return options.filter((item: any) => {
      return item.keyword.includes(search) || false;
    });
  }, [options, keyword]);

  const handleClearClick = () => {
    toolBarRef.current?.setScrollTop(0);
    onClear?.();
  }


  return html`
    <div class="__vm_debug-console-panel">
      <${ToolBar} customRef="${toolBarRef}">
        <${Input} value="${keyword}" placeholder="Filter" onChange="${handleSearch}" size="small" />
        ${!readOnly ? html`
          <${Button} type="primary" size="small" onClick="${handleClearClick}">Clear</${Button}>
          <${Button} type="primary" size="small" onClick="${handleRefresh}">Refresh</${Button}>
        ` : null}
      </${ToolBar}>
      <${List} className="console" options=${filterOptions} />
    </div>
  `;
}