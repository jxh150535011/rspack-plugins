import { useState } from 'preact/hooks';
import { html } from 'htm/preact';

export interface ButtonProps {
  className?: string;
  children?: any;
  type?: 'primary' | 'secondary';
  onClick?: any;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}


export const Button = (props: ButtonProps) => {
  const { className, children, type, onClick, disabled, size } = props;

  const handleClick = () => {
    if (disabled) {
      return;
    }
    onClick?.();
  }

  return html`
    <div className="__vm_button ${className} ${type} ${disabled ? 'disabled' : ''} ${size}" onClick=${handleClick}>
      ${children}
    </div>
  `;
}