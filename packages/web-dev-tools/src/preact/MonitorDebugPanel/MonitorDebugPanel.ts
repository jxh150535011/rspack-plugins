import { useState, useEffect, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';
import '../Component/styles.less';
import './styles.less';
import { ConsolePanel } from './ConsolePanel';
import { NetworkPanel } from './NetWorkPanel';
import { ApplicationPanel } from './ApplicationPanel';
import { ToolsPanel } from './ToolsPanel';
import { List, Tabs } from '../Component';
import { getClientInfo, getMonitorAllData } from '../../utils';

const defaultTabs = [
  {
    value: 'console',
    label: 'Log',
    children: [
      {
        value: 'all',
        label: 'All',
      },
      {
        value: 'log',
        label: 'Log',
      },
      {
        value: 'error',
        label: 'Error',
      },
      {
        value: 'debug',
        label: 'Debug',
      },
      {
        value: 'warn',
        label: 'Warn',
      },
      {
        value: 'info',
        label: 'Info',
      },
    ]
  },
  {
    value: 'system',
    label: 'System',
  },
  {
    value: 'network',
    label: 'Network',
    children: [
      {
        value: 'all',
        label: 'All',
      },
      {
        value: 'fetch',
        valueSet: new Set(['fetch', 'xhr']),
        label: 'Fetch/XHR',
      },
      {
        value: 'document',
        label: 'Doc',
      },
      {
        value: 'stylesheet',
        label: 'CSS',
      },
      {
        value: 'script',
        label: 'JS',
      },
      {
        value: 'img',
        label: 'Img',
      },
      {
        value: 'font',
        label: 'Font',
      },
      // {
      //   value: 'media',
      //   label: 'Media',
      // },
      // {
      //   value: 'manifest',
      //   label: 'Manifest',
      // },
      // {
      //   value: 'socket',
      //   label: 'Socket',
      // },
      // {
      //   value: 'wasm',
      //   label: 'Wasm',
      // },
      {
        value: 'other',
        label: 'Other',
      },
    ]
  },
  {
    value: 'application',
    label: 'Application',
  },
]

export const MonitorDebugPanel = (props: any) => {
  const { instance, data } = props;

  // 如果没有实例，就是只读模式
  const readOnly = !instance;

  const tabs = useMemo(() => {
    if (!readOnly) {
      return defaultTabs.concat([{
        value: 'tools',
        label: 'Tools',
      }])
    }
    return defaultTabs;
  }, [defaultTabs, readOnly]);


  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeSubTab, setActiveSubTab] = useState(tabs[0]?.children?.[0]);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setActiveSubTab(tab.children?.[0]);
  }

  const handleSubTabChange = (subTab: any) => {
    setActiveSubTab(subTab);
  }

  const activeTabKey = activeTab?.value;
  const activeSubTabKey = activeSubTab?.value;

  const activeSubTabKeySet = activeSubTab?.valueSet || new Set([activeSubTabKey]);

  const subOptions = activeTab?.children || [];


  const monitorData = useMemo(() => {
    let allData = data || {};
    if (instance) {
      allData = getMonitorAllData(instance);
    }
    return allData;
  }, [instance, data, refreshKey]);


  const currentList = useMemo(() => {
    // @ts-ignore
    let list = monitorData[activeTabKey] || [];
    if (activeSubTabKey && activeSubTabKey !== 'all') {
      // @ts-ignore
      list = list.filter(item => activeSubTabKeySet.has(item.type));
    }
    return list;
  }, [activeTabKey, activeSubTabKey, activeSubTabKeySet, refreshKey, monitorData]);

  // 应用数据对象， 数据结构单独拼接
  const appLicationData = useMemo(() => {
    if (activeTabKey === 'application') {
      return {
        localStorage:  monitorData.localStorage || [],
        sessionStorage: monitorData.sessionStorage || [],
        cookie: monitorData.cookie || [],
      }
    }
    return {};
  }, [activeTabKey, monitorData]);

  const handleClearConsole = () => {
    instance?.removeData?.('console');
    setRefreshKey(refreshKey + 1);
  }
  const handleClearNetwork = () => {
    instance?.removeData?.('network');
    setRefreshKey(refreshKey + 1);
  }


  const handleRefresh = () => {
    setRefreshKey(refreshKey + 1);
  }

  useEffect(() => {
    const handleRefreshEvent = () => {
      setRefreshKey(refreshKey + 1);
    }
    instance?.addListener(handleRefreshEvent);
    return () => {
      instance?.removeListener(handleRefreshEvent);
    }
  }, []);

  return html`
    <div class="__vm_debug-panel">
      <${Tabs} options=${tabs} activeKey=${activeTabKey} onChange=${handleTabChange} />
      <${Tabs} type="subtab" options=${subOptions} activeKey=${activeSubTabKey} onChange=${handleSubTabChange} />
      <div class="__vm_debug-panel__content">
        ${activeTabKey === 'console' && html`
          <${ConsolePanel} list=${currentList} readOnly=${readOnly} onClear=${handleClearConsole} />
        `}
        ${activeTabKey === 'system' && html`
          <div class="__vm_debug-console-panel">
            <${List} options=${currentList} className="default" />
          </div>
        `}
        ${activeTabKey === 'network' && html`
          <${NetworkPanel} list=${currentList} readOnly=${readOnly} onClear=${handleClearNetwork} />
        `}
        ${activeTabKey === 'application' && html`
          <${ApplicationPanel} data=${appLicationData} onRefresh=${handleRefresh} readOnly=${readOnly} />
        `}
        ${activeTabKey === 'tools' && html`
          ${instance ? html`<${ToolsPanel} instance=${instance} /> ` : null}
        `}
      </div>
    </div>
  `;
}