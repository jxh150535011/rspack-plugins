import { Monitor, getDefaultMonitorCoreInstance } from './core';

/** 初始化监控容器 */
const initDebugMonitor = (instance: Monitor, options: StartMonitorOptions) => {
  // @ts-ignore
  import('./preact/renderDebugMonitor').then((module) => {
    // @ts-ignore
    module.default?.({
      instance,
      options,
    });
  });
}

/** 初始化白屏处理检测逻辑 */
const initWhiteScreenMonitor = (instance: Monitor, options: StartMonitorOptions) => {
  // @ts-ignore
  import('./preact/renderWhiteScreenMonitor').then((module) => {
    // @ts-ignore
    module.default?.({
      instance,
      root: options.whiteScreen?.root || '#root',
      placeholder: options.whiteScreen?.placeholder,
    });
  });
}


/**
 * 开启资源调试监控
 */

// 声明 DOM API 类型
declare const document: any;
declare const window: any;
declare const performance: any;
declare const XMLHttpRequest: any;

export interface StartMonitorOptions {
  debug?: boolean;
  /** 上报开关 */
  report?: boolean;

  /** 上报接口 */
  endpoint?: string;

  /** 所属环境 */
  env?: string;

  /** 白屏检测配置 */
  whiteScreen?: {
    root?: string;
    placeholder?: string;
  }
}

/** 
 * 白屏检测（脚本兼容性检测）
 * 检测目标节点是否为空白， 如果为空白，则渲染兜底内容
 * 
 *  */
export const startMonitor = (options: StartMonitorOptions = {}) => {
  const { debug = false, report = false, whiteScreen } = options;
  const { root = '' } = whiteScreen || {};
  let monitorKeys: string[] = [];

  if (debug) {
    // 监控控制台 、 网络、存储、资源、系统事件
    monitorKeys = monitorKeys.concat(['console', 'network', 'storage', 'system']);
  }
  if (report) {
    monitorKeys = monitorKeys.concat(['console', 'network', 'storage', 'system']);
  }

  // 仅监控白屏，就只需要 触发 console 事件
  if (whiteScreen) {
    monitorKeys = monitorKeys.concat(['console']);
  }


  // 如果debug 和 report 都为false 则不开启监控
  if (!monitorKeys.length) {
    return;
  }
  // 初始化监听器
  const instance = getDefaultMonitorCoreInstance({
    enableKeys: monitorKeys,
  });
  // 开始debug监控
  if (debug) {
    initDebugMonitor(instance, options);
  }
  if(root) {
    initWhiteScreenMonitor(instance, options);
    return;
  }
}
