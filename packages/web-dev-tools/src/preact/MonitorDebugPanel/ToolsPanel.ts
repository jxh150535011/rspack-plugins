import { Component, render, Provider, Fragment } from 'preact';
import { useState, useRef, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';
import { Button, QRCode } from '../Component';
import { getConfig, setConfig } from '../../store';
import { getMonitorAllData, uuidv7 } from '../../utils';
import type { Monitor } from '../../core';


export interface ToolsPanelProps {
  instance: Monitor;
}

export const ToolsPanel = (props: ToolsPanelProps) => {


  const { instance } = props;
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const reportUUid = useRef(uuidv7());

  const handleReload = () => {
    window.location.reload();
  }

  const reportMonitorData = async () => {
    const config = getConfig();
    const disableIgnoreDebug = window.location.href.includes('__disable_ignore_debug=1');
    const url = `${config.endpoint}${disableIgnoreDebug ? '/api/monitor/create' : '/api/monitor/create?__ignore_debug=1'}`;

    const monitorData = getMonitorAllData(instance);
    
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        uuid: reportUUid.current,
        env: config.env,
        type: 'info',
        content: JSON.stringify(monitorData),
      })
    });
  }

  const handleReport = async () => {
    try {
      setMessage('');
      setLoading(true);
      const response = await reportMonitorData();
      // @ts-ignore
      if (response?.success) {
        setMessage('成功上传');
      } else {
        // @ts-ignore
        setMessage(response?.message || '上报数据失败');
      }
    } catch (error) {
      // @ts-ignore
      window.originalConsole?.error('上报数据失败', error);
      setMessage('上报数据失败');
    } finally {
      setLoading(false);
    }
  }


  return html`
    <div className="__vm_debug-tools-panel">
      ${message && html`<div className="__vm_debug-tools-panel_message">${message}</div>`}
      <div className="__vm_debug-tools-panel_inner">
        <${Button} disabled=${loading} type="primary" onClick=${handleReport}>上报数据</${Button}>
        <${Button} onClick=${handleReload}>刷新页面</${Button}>
      </div>
    </div>
  `;
}