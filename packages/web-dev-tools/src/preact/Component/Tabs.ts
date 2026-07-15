import { useState } from 'preact/hooks';
import { html } from 'htm/preact';

export interface TabsProps {
  options: any[];
  activeKey: string;
  type?: string;
  onChange?: (tab: any) => void;
}
export const Tabs = (props: TabsProps) => {
  const { options = [], type = '', activeKey, onChange } = props;

  const handleClick = (tab: any) => {
    onChange?.(tab);
  }

  if (!options?.length) {
    return null;
  }

  return html`
    <div className="__vm_tabs ${type}">
      ${options.map((tab) => html`
        <div 
          key="${tab.value}"
          className="__vm_tab ${activeKey === tab.value ? 'active' : ''}"
          onClick=${() => handleClick(tab)}
        >
          ${tab.label}
        </div>
      `)}
    </div>
  `;
}