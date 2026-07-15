import { useState, useEffect, useMemo, useRef } from 'preact/hooks';
import { html } from 'htm/preact';
import './styles.less';

import { lazy, initContainer } from './utils';
const MonitorDebugPanelModalLazy = lazy(() => import('../MonitorDebugPanelModal'));


export interface MonitorContainerProps {
  instance: any;
  moveEnable?: boolean;
}

export const MonitorContainer = (props: MonitorContainerProps) => {
  const { instance, moveEnable } = props;
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleClose = () => {
    setVisible(false);
  }

  const modal = useMemo(() => {
    if (!visible) {
      return null;
    }
    return html`<${MonitorDebugPanelModalLazy} instance=${instance} visible=${visible} onClose=${handleClose} />`;
  }, [visible]);

  const handleSwitchClick = () => {
    setVisible(true);
  }

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    initContainer(containerRef.current, moveEnable, handleSwitchClick);
  }, [containerRef.current]);

  return html`<div class="__vm" ref=${containerRef}>
    <div class="__vm_switch">调试反馈</div>
    <div class="__vm_panel">
      ${modal}
    </div>
  </div>`;
}