import { html } from 'htm/preact';
import { useState, useMemo } from 'preact/hooks';
import { ButtonProps, Button } from './Button';

interface CopyButtonProps extends ButtonProps {

}
export const CopyButton = (props: CopyButtonProps) => {

  const { onClick } = props;
  const [text, setText] = useState('复制');

  const handleClick = (e: any) => {
    onClick?.(e);
    setText('已复制');
    setTimeout(() => {
      setText('复制');
    }, 1000);
  }


  return html`
    <${Button} {...props} onClick=${handleClick}>${text}</${Button}>
  `
}