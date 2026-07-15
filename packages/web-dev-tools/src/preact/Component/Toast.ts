
import { render, Provider} from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { html } from 'htm/preact';

export interface ToastProps {
  content: string;
  visible?: boolean;
  delay?: number;
}
export const Toast = (props: ToastProps) => {

  const { visible, delay } = props;
  const [currentVisible, setCurrentVisible] = useState(false);

  useEffect(() => {
    setCurrentVisible(visible || false);
    // @ts-ignore
    if (visible && delay > 0) {
      setTimeout(() => {
        setCurrentVisible(false);
      }, delay);
    }
  }, [visible, delay]);

  return html`
    <div className="__vm_toast ${currentVisible ? 'visible' : ''}">
      ${props.content}
    </div>
  `;
}

export const showToast = (props: ToastProps) => {

  const { content } = props; 
  const $div = document.createElement('div');
  const $vm = document.getElementsByClassName('__vm')[0];
  if (!$vm) {
    return;
  }
  $vm.appendChild($div);
  render(html`<${Toast} content=${content} visible=${true} delay=${4000} />`, $div);

  const destroy = () => {
    render(null, $div);
    $vm.removeChild($div);
  }

  setTimeout(() => {
    destroy();
  }, 4500);
}