import { useState, useRef, useEffect, useImperativeHandle } from 'preact/hooks';;
import { html } from 'htm/preact';
import { debounce } from 'lodash-es';

export interface ToolBarProps {
  className?: string;
  children?: any;
  customRef?: any;
}


export const ToolBar = (props: ToolBarProps) => {
  const { className, children, customRef } = props;
  const targetRef = useRef<HTMLDivElement>(null);

  const [scrollTopState, setScrollTopState] = useState(0);
  useEffect(() => {
    const $parent = targetRef.current?.parentElement;
    if (!$parent) {
      return;
    }
    const handleScroll = debounce(() => {
      setScrollTopState($parent.scrollTop);
    }, 40);
    // 监听父级滚动，进行滚动同步
    $parent.addEventListener('scroll', handleScroll);
    return () => {
      $parent.removeEventListener('scroll', handleScroll);
    };
  }, [targetRef.current]);

  const setScrollTop = (scrollTop: number) => {
    setScrollTopState(scrollTop);
  };

  // if (customRef) {
  //   customRef.current = {
  //     setScrollTop
  //   }
  // }

  useImperativeHandle(customRef, () => {
    return {
      setScrollTop
    }
  }, []);


  // useEffect(() => {
  //   const $parent = ref.current?.parentElement;
  //   if (!$parent) {
  //     return;
  //   }
  //   if ($parent.scrollTop < scrollTop) {
  //     setScrollTop($parent.scrollTop);
  //   }
  //   // window.originConsole.log($parent.scrollTop, scrollTop);
  //   // $parent.scrollTop = 0;
  // }, [refreshKey]);

  const style = {
    transform: `translateY(${scrollTopState}px)`,
  };

  return html`
    <div className="__vm_toolbar ${className}" ref="${targetRef}">
      <div className="__vm_toolbar__inner" style="${style}">
        ${children}
      </div>
    </div>
  `;
}