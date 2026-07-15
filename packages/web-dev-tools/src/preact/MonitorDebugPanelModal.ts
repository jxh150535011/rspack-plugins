import type { Monitor } from '../core';
import { render } from 'preact';
import { html } from 'htm/preact';
import { MonitorDebugPanel } from './MonitorDebugPanel';
import { Modal } from './Component';


export default (props: { instance: Monitor, visible: boolean, onClose: () => void }) => {
  const { instance, visible, onClose } = props;
  const handleClose = () => {
    onClose?.();
  }

  return html`
    <${Modal} visible=${visible} onClose=${handleClose}>
      <${MonitorDebugPanel} instance=${instance} />
    </${Modal}`
}