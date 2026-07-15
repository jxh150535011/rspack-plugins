import type { Monitor } from '../core';
import { MonitorMessageType } from '../types';
import { domReady } from '../utils';


const initDetectionRules = (instance: Monitor, rule: any) => {
  const $target = document.querySelector(rule.target);
  if (!$target) {
    // 未来这里要打点， 如果找不到目标元素 是一个很奇怪的异常情况
    return;
  }
  // 目前只有控制台触发一个逻辑
  const callback = (messages: MonitorMessageType[]) => {
    if ($target.innerHTML) {
      instance.removeListener(callback);
      return;
    }
    const hasSyntaxError = messages.some(item => {
      // 并且找到错误信息
      // @ts-ignore
      if (item.type === 'console' && item.data?.type === 'error') {
        // @ts-ignore
        const message = item.data?.message?.[0];
        if (/Unexpected token|SyntaxError|Script error./.test(message)) {
          return true;
        }
      }
    });
    if (hasSyntaxError) {
      $target.innerHTML = rule.placeholder || '';
      instance.removeListener(callback);
    }
  }
  instance.addListener(callback);
  setTimeout(() => {
    const currentMessages = (instance.getData()?.console || []).map(item => ({
      data: item,
      type: 'console',
    }));
    callback(currentMessages);
  }, rule.delay || 0);
}

export interface RenderWhiteScreenMonitorOptions {
  instance: Monitor;
  root: string;
  detectionRules?: any[];
  placeholder?: string;
}


export default (options: RenderWhiteScreenMonitorOptions) => {
  const { instance, root, detectionRules, placeholder } = options;
  // 检测规则
  const currentDetectionRules = [{
    target: root,
    delay: 400,
    placeholder,
  }].concat(detectionRules || []);

  const handleCallback = () => {
    currentDetectionRules.forEach(rule => {
      initDetectionRules(instance, rule);
    })
  }
  // 等待10秒后触发检测规则 ，如果10秒内没有触发DOMContentLoaded事件，就触发一次检测规则
  // 而且这个属于一个异常的页面访问
  domReady(handleCallback, handleCallback)
}