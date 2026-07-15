import { useState, useMemo } from 'preact/hooks';
import { JsonView } from 'preact-tiny-json-view';
import { html } from 'htm/preact';
import type { MonitorNetworkDataType  } from '../../types';
import { Collapse, Tabs, Modal, Descriptions, Button } from '../Component';
import { objectToList, toJson } from '../../utils';



export interface NetWorkPanelDetailModalProps {
  data?: MonitorNetworkDataType;
  onClose: () => void;
}

const tabs = [
  {
    value: 'headers',
    label: 'Headers',
  },
  {
    value: 'payload',
    label: 'Payload',
  },
  {
    value: 'preview',
    label: 'Preview',
  },
  {
    value: 'response',
    label: 'Response',
  },
]

export const NetWorkPanelHeaderTabContent = (props: any) => {
  const { data } = props;

  const columns = useMemo(() => {
    if (!data) {
      return [];
    }

    const requestHeaders = objectToList(toJson(data?.request?.headers || {}));
    const responseHeaders = objectToList(toJson(data?.response?.headers || {}));
    const generalOptions = [
      {
        value: data.url,
        label: 'Request URL',
        key: 'url',
      },
      {
        value: data.method,
        label: 'Request Method',
        key: 'method',
      },
      {
        value: data.status,
        label: 'Status',
        key: 'status',
      },
    ]

    return [
      {
        value: 'general',
        label: `General (${generalOptions.length})`,
        collapsed: !generalOptions.length,
        children:  html`
          <${Descriptions} options=${generalOptions} />
        `,
      },
      {
        value: 'responseHeaders',
        label: `Response Headers (${responseHeaders.length})`,
        collapsed: !responseHeaders.length,
        children:  html`
          <${Descriptions} options=${responseHeaders} />
        `,
      },
      {
        value: 'requestHeaders',
        label: `Request Headers (${requestHeaders.length})`,
        collapsed: !requestHeaders.length,
        children:  html`
          <${Descriptions} options=${requestHeaders} />
        `,
      },
    ]
  }, [data])

  const defaultActiveKey = columns.filter((item) => !item.collapsed).map((item) => item.value);

  return html`
    <${Collapse} options=${columns} defaultActiveKey=${defaultActiveKey} />
  `;
}

const renderBody = (body: any) => {
  if (!body) {
    return null;
  }
  if (body?.type === 'application/json') {
    const obj = toJson(body.content);
    return html`
      <${JsonView} value="${obj}" />
    `;
  }
  return html`
    <pre>${body?.content || ''}</pre>
  `
}


export const NetWorkPanelPayloadTabContent = (props: any) => {
  const { data } = props;

  const columns = useMemo(() => {
    if (!data) {
      return [];
    }
    const queryStringParams = objectToList(toJson(data?.request?.params || {}));
    const requestBodyNode = renderBody(data?.request?.body);
    return [
      {
        value: 'queryStringParams',
        label: `Query String Params (${queryStringParams.length})`,
        key: 'queryStringParams',
        collapsed: !queryStringParams.length,
        children:  html`
          <${Descriptions} options=${queryStringParams} />
        `,
      },
      requestBodyNode ? {
        value: 'requestPayload',
        label: 'Request Payload',
        key: 'requestPayload',
        collapsed: false,
        children: requestBodyNode,
      } : null,
    ].filter(p => !!p)
  }, [data])

  const defaultActiveKey = columns.filter((item) => !item.collapsed).map((item) => item.value);

  return html`
    <${Collapse} options=${columns} defaultActiveKey=${defaultActiveKey} />
  `;
}

export const NetWorkPanelPreviewTabContent = (props: any) => {
  const { data } = props;

  const body = data?.response?.body;
  const error = data?.response?.error;

  const bodyNode = useMemo(() => {
    return renderBody(body);
  }, [body]);

  if (error) {
    return html`
      <div className="__vm_debug-netowrk-panel__content_response">
        <pre>${error}</pre>
      </div>
    `
  }

  return html`
    <div className="__vm_debug-netowrk-panel__content_response">${error || bodyNode}</div>
  `

}

export const NetWorkPanelResponseTabContent = (props: any) => {
  const { data } = props;
  return (
    html`
      <div className="__vm_debug-netowrk-panel__content_response">${data?.response?.error || data?.response?.body?.content || ''}</div>
    `
  )
}



async function copyText(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch(e) {
      const success = execCommandCopy(text);
      return success;
    }
  }
  return execCommandCopy(text);
}

/**
 * 使用 execCommand 复制（兼容性最好）
 */
function execCommandCopy(text: string) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // 设置样式使其不可见
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.style.zIndex = '-1';
    document.body.appendChild(textarea);
    // 选中文本
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    // 执行复制 
    const success = document.execCommand('copy');
    // 清理
    document.body.removeChild(textarea);
    
    return success;
  } catch (error) {
    console.error('execCommand 复制失败:', error);
    return false;
  }
}

export const NetWorkPanelDetailModal = (props: NetWorkPanelDetailModalProps) => {
  const { data, onClose } = props;
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const activeTabKey = activeTab?.value;

  const [tip, setTip] = useState('');

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  }

  const tools = useMemo(() => {
    if (!['preview', 'response'].includes(activeTabKey)) {
      return [];
    }
    return [
      {
        value: 'copy',
        label: 'Copy',
        key: 'copy',
      },
    ]
  }, [activeTabKey])

  const handleToolAction = async (item: any) => {
    if (item.value === 'copy') {
      const flag = await copyText(data?.response?.body?.content || '');
      setTip(flag ? '已拷贝(推荐: Tool -> 上报数据 全量传输数据)' : '拷贝失败');
      setTimeout(() => {
        setTip('');
      }, 4000);
    }
  }

  return html`
    <${Modal} visible="${!!data}" onClose="${onClose}">
      <div class="__vm_debug-netowrk-panel-modal">
        <${Tabs} options=${tabs} activeKey=${activeTabKey} onChange=${handleTabChange} />
         <div class="__vm_debug-netowrk-panel__content">
            ${activeTabKey === 'headers' && html`
              <${NetWorkPanelHeaderTabContent} data=${data} />
            `}
            ${activeTabKey === 'payload' && html`
              <${NetWorkPanelPayloadTabContent} data=${data} />
            `}
            ${activeTabKey === 'preview' && html`
              <${NetWorkPanelPreviewTabContent} data=${data} />
            `}
            ${activeTabKey === 'response' && html`
              <${NetWorkPanelResponseTabContent} data=${data} />
            `}
         </div>
         ${tools.length ? html`
          <div class="__vm_debug-netowrk-panel__toolbar">
            ${tools.map((item) => html`
              <${Button} size="small" onClick=${() => handleToolAction(item)}>${item.label}</Button>
            `)}
            ${tip && html`
              <div>${tip}</div>
            `}
          </div>
         ` : null}

      </div>
    </${Modal}>
  `;
}