
export function domReady(success: any, error: any) {
  let timer: any;
  const initDOMContentLoaded = (ev?: any) => {
    if (timer) {
      clearTimeout(timer);
    }
    if (ev === 'timeout') {
      error();
    } else {
      success();
    }
    window.removeEventListener('DOMContentLoaded', initDOMContentLoaded);
  }
  // 等待10秒后触发检测规则 ，如果10秒内没有触发DOMContentLoaded事件，就触发一次检测规则
  // 而且这个属于一个异常的页面访问
  timer = setTimeout(() => {
    initDOMContentLoaded('timeout');
  }, 10000);
  if(document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initDOMContentLoaded);
  } else {
    initDOMContentLoaded();
  }
}