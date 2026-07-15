import { useState } from 'preact/hooks';
import { html } from 'htm/preact';

export interface CollapseProps {
  options: any[];
  defaultActiveKey?: string[];
  type?: string;
  onChange?: (item: any) => void;
}
export const Collapse = (props: CollapseProps) => {
  const { options = [], type = '', defaultActiveKey, onChange } = props;
  const [activeKey, setActiveKey] = useState(defaultActiveKey || []);

  const handleClick = (item: any) => {
    if (activeKey.includes(item.value)) {
      setActiveKey(activeKey.filter((key) => key !== item.value));
    } else {
      setActiveKey([...activeKey, item.value]);
    }
    onChange?.(item);
  }

  return html`
    <div className="__vm_collapse ${type}">
      ${options.map((item) => html`
        <div 
          key="${item.value}"
          className="__vm_collapse_item ${activeKey.includes(item.value) ? 'active' : ''}"
          
        >
          <div className="__vm_collapse_item__header" onClick=${() => handleClick(item)}>
            <div className="__vm_collapse_item__header_expand"></div>
            <div>${item.label}</div>
          </div>
          <div className="__vm_collapse_item__body">
            ${item.children}
          </div>
        </div>
      `)}
    </div>
  `;
}