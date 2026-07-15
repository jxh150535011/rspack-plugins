import { Component, render } from 'preact';
import { useState, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';
import { List, Input, Button } from '../Component';
import { objectParse } from '../../utils';
import { JsonView } from 'preact-tiny-json-view';
import type { MonitorConsoleDataType  } from '../../types';

export interface ConsolePanelProps {
  list: MonitorConsoleDataType[];
  readOnly?: boolean;
  onClear?: () => void;
}

export const ConsolePanel = (props: ConsolePanelProps) => {
  const { list = [], readOnly = false, onClear } = props;

  const [keyword, setKeyword] = useState('');

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
  }, [list]);


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
    onClear?.();
  }



  return html`
    <div class="__vm_debug-console-panel">
      <div className="__vm_debug-console-panel_toolbar">
        <${Input} value="${keyword}" placeholder="Filter" onChange="${handleSearch}" size="small" />
        ${!readOnly ? html`
          <${Button} type="primary" size="small" onClick="${handleClearClick}">Clear</${Button}>
        ` : null}
      </div>
      <${List} className="console" options=${filterOptions} />
    </div>
  `;
}