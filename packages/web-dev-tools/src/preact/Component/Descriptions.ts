import { useState } from 'preact/hooks';
import { html } from 'htm/preact';

export interface DescriptionsProps {
  options: any[];
}
export const Descriptions = (props: DescriptionsProps) => {
  const { options = [] } = props;

  return html`
    <div className="__vm_descriptions">
      ${options.map((item, index) => html`
        <div 
          key="${item.key || index}"
          className="__vm_descriptions_item"
        >
          <div className="__vm_descriptions_item_label">
            ${item.label}
          </div>
          <div className="__vm_descriptions_item_value">
            ${item.value}
          </div>
        </div>
      `)}
    </div>
  `;
}