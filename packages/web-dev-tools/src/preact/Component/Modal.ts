import { useState, useEffect, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: any;
}

let modalCount = 0;
let zIndex = 9000;

const addClass = (doms: any[], className: string) => {
  doms.filter(p => p.classList).forEach(p => p.classList.add(className));
}

const removeClass = (doms: any[], className: string) => {
  doms.filter(p => p.classList).forEach(p => p.classList.remove(className));
}

export const Modal = (props: ModalProps) => {
  const {
    visible,
    onClose,
    children,
  } = props;

  useEffect(() => {
    let count = 0;
    if (visible) {
      zIndex = zIndex + 2;
      modalCount = modalCount + 1;
      count = 1;
      addClass([document.documentElement, document.body], '__vm_modal--visible');
    }
    return () => {
      if (count) {
        modalCount = modalCount - 1;
      }
      if (!modalCount) {
        removeClass([document.documentElement, document.body], '__vm_modal--visible');
      }
    }
  }, [visible]);


  if (!visible) {
    return null;
  }
  return html`
    <div className="__vm_modal_wrapper">
      <div className="__vm_modal_mask" onClick=${onClose} style="z-index: ${zIndex};"></div>
      <div className="__vm_modal" style="z-index: ${zIndex + 1};">
        ${children}
      </div>
    </div>
  `;
}