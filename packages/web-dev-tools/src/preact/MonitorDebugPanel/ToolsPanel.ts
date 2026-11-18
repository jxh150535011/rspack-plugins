import { Component, render, Provider, Fragment } from 'preact';
import { useState, useRef, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';
import { Button } from '../Component';
import { getConfig, setConfig } from '../../store';
import { getMonitorAllData, uuidv7, copyText } from '../../utils';
import type { Monitor } from '../../core';



export interface ToolsPanelProps {
  instance: Monitor;
}

export const ToolsPanel = (props: ToolsPanelProps) => {


  const { instance } = props;
  const [message, setMessage] = useState('');
  const [successLink, setSuccessLink] = useState('');
  const [isCopyed, setIsCopyed] = useState(false);
  const [loading, setLoading] = useState(false);
  const reportUUid = useRef(uuidv7());

  const handleReload = () => {
    window.location.reload();
  }

  const reportMonitorData = async () => {
    const config = getConfig();
    const monitorData = getMonitorAllData(instance, config);
    const disableIgnoreDebug = window.location.href.includes('__disable_ignore_debug=1');
    const url = disableIgnoreDebug ? '/api/monitor/create' : '/api/monitor/create?__ignore_debug=1';
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        uuid: reportUUid.current,
        env: config.env,
        app_name: config.name,
        meta_content: JSON.stringify({
          url: window.location.href,
        }),
        type: 'info',
        content: JSON.stringify(monitorData),
      }),
    });
  }

  const handleReport = async () => {
    try {
      setMessage('');
      setSuccessLink('');
      setIsCopyed(false);
      setLoading(true);
      const response = await reportMonitorData();
      // @ts-ignore
      if (response?.success) {
        setSuccessLink(`https://localhost/debug/report?uuid=${reportUUid.current}`);
      } else {
        // @ts-ignore
        setMessage(response?.message || '上报数据失败');
      }
    } catch (error) {
      // @ts-ignore
      window.originConsole?.error('上报数据失败', error);
      setMessage('上报数据失败');
    } finally {
      setLoading(false);
    }
  }

  const urls = useMemo(() => {
    return [] as { url: string, name: string }[];
  }, []);


  const qrCodeNodes = useMemo(() => {
    return [];
    // return urls.map((url) => html`
    //   <${QRCode} key=${url.name} value=${url.url} logoText=${url.name} />
    // `)
  }, [urls])

  const handleCopyLink = async () => {
    await copyText(successLink);
    setIsCopyed(true);
  }


  return html`
    <div className="__vm_debug-tools-panel">
      ${message ? html`<div className="__vm_debug-tools-panel_message">${message}</div>` : null}
      ${successLink ? html`
        <div className="__vm_debug-tools-panel_message" onClick="${handleCopyLink}">
          ${isCopyed ? '已复制' : '点击复制链接'}:${successLink}
        </div>` : null}
      <div className="__vm_debug-tools-panel_inner">
        <${Button} disabled=${loading} type="primary" onClick=${handleReport}>上报数据</${Button}>
        <${Button} onClick=${handleReload}>刷新页面</${Button}>
      </div>
      <div className="__vm_debug-tools-panel_qrcode">
        ${qrCodeNodes}
      </div>
    </div>
  `;
}