import type { Monitor } from '../core';
import { render, Provider } from 'preact';
import { html } from 'htm/preact';
import { MonitorDebugPanel } from './MonitorDebugPanel';


export interface RenderMonitorPanelOptions {
  data: any;
  $container: HTMLElement;
}

export default (options: RenderMonitorPanelOptions) => {
  const { data, $container } = options;
  render(html`<${MonitorDebugPanel} data=${data} />`, $container);
  return () => {
    render(null, $container);
  }
}
