import type { Monitor } from '../core';
import { render, Provider } from 'preact';
import { html } from 'htm/preact';
import { MonitorContainer } from './MonitorContainer';
import { getConfig, setConfig } from '../store';


export interface RenderDebugMonitorOptions {
  instance: Monitor;
  options?: {
    endpoint?: string;
    env?: string;
  }
}

export default (options: RenderDebugMonitorOptions) => {
  const { instance, options : config } = options;
  const $container = document.createElement('div');
  document.body.appendChild($container);
  // 保存配置
  setConfig(config);
  render(html`<${MonitorContainer} instance=${instance} moveEnable={true} />`, $container);
}
