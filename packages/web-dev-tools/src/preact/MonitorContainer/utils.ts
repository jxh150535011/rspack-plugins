import { useState, useEffect, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';
import { h, Component } from 'preact';
import { toJson } from '../../utils';
import { showToast } from '../Component';


// @ts-ignore
const isTouch = 'ontouchstart' in window;

const moveEventMap = isTouch ? {
  start: 'touchstart',
  move: 'touchmove',
  end: 'touchend',
} : {
  start: 'mousedown',
  move: 'mousemove',
  end: 'mouseup',
};

export const bindMoveEvent = ($container: HTMLElement, callback: any) => {
  let posData: any = {
    start: null,
    current: null,
    delta: null,
    end: null,
  }

  const getPos = isTouch ? (e: any) => {
    const touch = e.touches[0];
    if (!touch) return undefined;
    // @ts-ignore
    return [touch.clientX, touch.clientY];
  } : (e: any) => {
    return [e.clientX, e.clientY];
  }

  const updatePos = (pos: any) => {
    posData.current = pos;
    posData.delta = [
      pos[0] - posData.start[0],
      pos[1] - posData.start[1],
    ]
  }

  const handleMoveEvent = (e: any) => {
    e.preventDefault();
    if (!posData.start) {
      return;
    }
    const pos = getPos(e);
    updatePos(pos);
    callback(posData);
  }
  const handleMoveEndEvent = (e: any) => {
    e.preventDefault();
    document.removeEventListener(moveEventMap.move, handleMoveEvent);
    document.removeEventListener(moveEventMap.end, handleMoveEndEvent);
    if (!posData.start) {
      return;
    }
    const pos = getPos(e);
    updatePos(pos || posData.current);
    posData.end = posData.current;
    callback(posData);
  }
  $container.addEventListener(moveEventMap.start, (e: any) => {
    e.preventDefault();
    const currentPos = getPos(e);
    posData = {
      start: currentPos,
      current: currentPos,
    };
    callback(posData);
    document.addEventListener(moveEventMap.move, handleMoveEvent, { passive: false });
    document.addEventListener(moveEventMap.end, handleMoveEndEvent, { passive: false });
  });

}


/**
 * pos 当前滚动定位
 */
const monitorData = toJson(window.localStorage.getItem('__MONITOR_DATA') || '{}');
interface ContainerLayoutInfo {
  pos: number[];
  containerRect: DOMRect;
  clientSize: number[];
}

const getContainerLayoutInfo = ($container: HTMLElement) => {
  const clientWidth = document.documentElement.clientWidth;
  const clientHeight = document.documentElement.clientHeight;
  const clientSize = [clientWidth, clientHeight];
  const containerRect = $container.getBoundingClientRect();
  const initLeft = clientWidth - containerRect.width - 10;
  const initTop = clientHeight - containerRect.height - 10;
  const pos = [initLeft, initTop];
  return {
    pos,
    containerRect,
    clientSize,
  } as ContainerLayoutInfo
}

const setPos = (newPos: number[], $container: HTMLElement, layoutInfo: ContainerLayoutInfo) => {
  const { containerRect, clientSize } = layoutInfo;
  let left = Math.min(newPos[0], clientSize[0] - containerRect.width - 10);
  left = Math.max(left, 10);
  let top = Math.min(newPos[1], clientSize[1] - containerRect.height - 10);
  top = Math.max(top, 10);
  $container.style.top = `${top}px`;
  $container.style.left = `${left}px`;
  return [left, top];
}

const saveMonitorData = (layoutInfo: ContainerLayoutInfo) => {
  const { pos, containerRect, clientSize } = layoutInfo;
  monitorData.pos = pos;
  window.localStorage.setItem('__MONITOR_DATA', JSON.stringify(monitorData));
}

const bindContainer = ($container: HTMLElement, layoutInfo: ContainerLayoutInfo, onClick?: any) => {
  const updatePos = (deltaPos: number[]) => {
    const pos = layoutInfo.pos;
    const newPos = [pos[0] + deltaPos[0], pos[1] + deltaPos[1]];
    return setPos(newPos, $container, layoutInfo);
  }
  bindMoveEvent($container, (posData: any) => {
    if (!posData.delta) {
      return;
    }
    const newPos = updatePos(posData.delta);
    if (!posData.end) {
      return;
    }
    const isMove = Math.abs(posData.delta[1]) > 5 || Math.abs(posData.delta[0]) > 5;
    layoutInfo.pos = newPos;
    saveMonitorData(layoutInfo);
    //  如果事件结束，并且判断不是移动，就触发点击事件
    
    if (posData.end && !isMove) {
      onClick?.();
    }
  });
}

export  const initContainer = ($container: HTMLElement, moveEnable?: boolean, handleSwitchClick?: any) => {
  const $switch = $container.querySelector('.__vm_switch') as HTMLElement;
  // const $panel = $container.querySelector('.__vm_panel') as HTMLElement;
  const layoutInfo = getContainerLayoutInfo($switch);
  if (moveEnable) {
    layoutInfo.pos = setPos(monitorData.pos || layoutInfo.pos, $switch, layoutInfo);
  }
  $switch.style.visibility = 'visible';
  bindContainer($switch, layoutInfo, handleSwitchClick);
}

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, error: null };
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ hasError: true, error });
  }

  render() {
    const { fallback } = this.props;
    if (this.state.hasError) {
      if (fallback) {
        return fallback();
      }
      // @ts-ignore
      const message = this.state.error?.message || JSON.stringify(this.state.error);
      showToast({ content: message });
      return h('div', {
        style: {
          display: 'none',
        },
      }, message);
    }
    return this.props.children;
  }
}

export function lazy(importFn: any) {
  return function LazyWrapper(props: any) {
    const [result, setResult] = useState({
      loading: true,
      error: null,
      Component: null,
    });
    useEffect(() => {
      importFn()
        .then((module: any) => {
          setResult({
            ...result,
            loading: false,
            Component: module.default || module,
          });
        })
        .catch((e: any) => {
          // @ts-ignore
          window.originConsole?.error(e);
          setResult({
            ...result,
            loading: false,
            error: e?.message || '渲染失败',
          });
        });
    }, []);

    if (result.error || !result.Component) return null;
    return html`
    <${ErrorBoundary} fallback=${props.fallback}>
      ${h(result.Component, props)}
    </${ErrorBoundary}>
    `;
  };
}

