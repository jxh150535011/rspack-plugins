import { useState, useRef, useLayoutEffect } from 'preact/hooks';
import { html } from 'htm/preact';

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  placeholder?: string;
}


export const Input = (props: InputProps) => {
  const { value, onChange, size, placeholder } = props;
  const isComposingRef = useRef<boolean>(false);
  const timerRef = useRef<number>(0);
  const [currentValue, setCurrentValue] = useState<string>(value);

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };
  const setValue = (newValue: string) => {
    setCurrentValue(newValue);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // @ts-ignore
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 40);
  }
  const handleCompositionEnd = (e: any) => {
    const newValue = e.target.value;
    isComposingRef.current = false;
    setValue(newValue);
  };



  const handleInput = (e: any) => {
    const newValue = e.target.value;
    if (isComposingRef.current) {
      return;
    }
    setValue(newValue);
  }
  useLayoutEffect(() => {
    if (currentValue !== value) {
      setCurrentValue(value);
    }
  }, [value]);

  return html`
    <div className="__vm_input ${size}">
      <input
        value=${currentValue}
        onInput=${handleInput}
        onCompositionStart=${handleCompositionStart}
        onCompositionEnd=${handleCompositionEnd} />
      ${placeholder && !currentValue ? html`
        <div className="__vm_input_placeholder">${placeholder}</div>
      ` : null}
    </div>
  `;
}