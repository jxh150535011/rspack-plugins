import { options } from 'preact';
import type { MonitorConsoleDataType, MonitorNetworkDataType, MonitorMessageType } from './types';
import { objectStringify, domReady } from './utils';
const windowProxy: any = window;
// import { cloneDeep } from 'lodash-es';

let id = 1;
const getId = () => {
  const newId = id++;
  return String(newId);
}

// 只记录最大 400 条数据
const maxLength = 400;


const readResponse = (response: Response, callback: any) => {
  if(!response.body || !response.headers) {
    return callback({
      size: 0,
    });
  }
  const contentType = response.headers.get('content-type');
  response.clone().blob().then((blob) => {
    if (contentType === 'application/json') {
      blob.text().then((content) => {
        return callback({
          size: blob.size,
          body: {
            content,
            type: contentType,
          },
        });
      });
      return;
    }
    return callback({
      size: blob.size,
    });
  });
}

const getXHRRequestBody = (xhr: XMLHttpRequest, body: any) => {
  // 简化判断
  // @ts-ignore
  const contentType = xhr._requestHeaders['Content-Type'] || xhr._requestHeaders['content-type'];
  if (contentType === 'application/json') {
    return {
      content: typeof body === 'string' ? body : JSON.stringify(body),
      type: contentType,
    };
  }
}



const getXHRResonseBody = (xhr: XMLHttpRequest, responseHeaders: any = {}) => {
  // @ts-ignore
  const contentType = responseHeaders['Content-Type'] || responseHeaders['content-type'];
  if (contentType === 'application/json') {
    const size = new Blob([xhr.responseText], { type: contentType }).size;
    return {
      content: xhr.responseText,
      type: contentType,
      size,
    };
  }
}

const getFetchRequestBody = (config: any) => {
  const headers = config?.headers || {};
  const contentType = headers['Content-Type'] || headers['content-type'];
  if (contentType === 'application/json') {
    return {
      content: typeof config?.body === 'string' ? config?.body : JSON.stringify(config?.body),
      type: contentType,
    };
  }
}


const getRequestParams = (url: string, params?: any) => {
  try {
    const uri = new URL(url);
    const searchParams = uri.searchParams;
    const newParams = Object.fromEntries(searchParams.entries());
    return {
      ...newParams,
      ...params,
    }
  } catch (e) {
    return {};
   }
}

const parseXHRHeaders = (headersStr: string) => {
  const headers = {};
  if (!headersStr) return headers;
  headersStr.split('\n').forEach(line => {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex !== -1) {
      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();
      if (key) {
        // @ts-ignore
        headers[key] = value;
      }
    }
  });
  return headers;
};


const normalizeUrl = (url: string) => {
  // 处理https:// 开头的url
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  return window.location.origin + url;
};

/** 是否忽略调试请求 */
const isIgnoreDebug = (options: any) => {
  const url = options?.url;
  if (!url || url.indexOf('__ignore_debug=1') > -1) {
    return true;
  }
  return false;
}

/** 
 * 一些必要的拦截器，需要在初始化时就进行捕捉
 * 这里的逻辑尽量简单，避免引入复杂的依赖
 * 禁止使用 async 等语法糖，减少打包体积
 *  */
export class Monitor {
  data!: {
    console: MonitorConsoleDataType[];
    network: MonitorNetworkDataType[];
  };

  // @ts-ignore
  destroyConsole?: any;

  originalConsole!: any;

  timer?: any;

  listeners = new Set<any>();

  constructor() {
    this.initData();
  }
  initData() {
    this.data = {
      console: [],
      network: [],
    };
  }
  /** 初始化监听器 */
  init(enableKeys: string[] = []) {
    if (enableKeys.includes('console')) {
      this.initConsole();
    }
    if (enableKeys.includes('network')) {
      this.initFetch();
    }
  }
  addListener(listener: (...args: any[]) => void) {
    this.listeners.add(listener);
  }
  removeListener(listener: (...args: any[]) => void) {
    this.listeners.delete(listener);
  }
  removeData(type: any) {
    // @ts-ignore
    this.data[type] = [];
  }
  emit(result?: MonitorMessageType) {
    const messages = result ? [result] : [];
    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }
    this.timer = requestAnimationFrame(() => {
      this.listeners.forEach(listener => listener(messages));
    });
  }
  collectData(type: any, item: any) {
    // @ts-ignore
    const items = this.data[type];
    // @ts-ignore
    items.push(item);
    if (items.length > maxLength) {
      items.shift();
    } 
    this.emit({
      type, 
      data: item,
    });
  }
  getData() {
    return this.data;
  }
  initConsole() {
    // 重写console方法来捕获日志
    const consoleMethods = ['log', 'info', 'warn', 'error', 'debug'];
    const originalConsole: any = {};

    const collect = this.collectData.bind(this);
    // @ts-ignore
    window.originalConsole = originalConsole;

    consoleMethods.forEach(method => {
      originalConsole[method] = console[method as keyof Console];
      // @ts-ignore
      console[method as keyof Console] = function(...args: any[]) {
        const logItem = {
          type: method,
          message: args.map(objectStringify),
          timestamp: Date.now(),
          id: getId(),
        };
        collect('console', logItem);
        originalConsole[method].apply(console, args);
      };
    });
    this.originalConsole = originalConsole;

    let lastError: any = null;
    let lastErrorTime: any;
    const handleError = (event: any) => {
      // @ts-ignore
      // const errorKey = error.stack || error.message;
      // if (lastError === errorKey) return;
      // lastError = errorKey;
      const errorItem = {
        type: 'error',
        message: [
          objectStringify(event.stack || event.message),
          objectStringify({
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack ? String(event.error?.stack) : null,
          }),
        ],
        timestamp: Date.now(),
        id: getId(),
      };
      collect('console', errorItem);
      // if (lastErrorTime) {
      //   clearTimeout(lastErrorTime);
      // }
      // lastErrorTime =setTimeout(() => {
      //   lastError = null;
      // }, 100);
    }

    const handleRejectError = (event: any) => {
      const rejectionItem = {
        type: 'error',
        message: [
          objectStringify(event.reason?.message || String(event.reason))
        ],
        timestamp: Date.now(),
        id: getId(),
      };
      collect('console', rejectionItem);
    }

    // 捕获错误日志
    window.addEventListener('error', handleError);

    // const originalError = window.onerror;
    // window.onerror = function(msg, url, line, col, event) {
    //   originalError?.(msg, url, line, col, event);
    //   handleError(event);
    // };

    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', handleRejectError);


    this.destroyConsole = () => {
      consoleMethods.forEach(method => {
        // @ts-ignore
        console[method as keyof Console] = originalConsole[method as keyof Console];
      });

      // 移除事件监听器
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejectError);
      // window.onerror = originalError;
    }
  }

  initFetch() {
    // 重写XMLHttpRequest来监控ajax请求
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHSend = XMLHttpRequest.prototype.send;
    
    // @ts-ignore
    XMLHttpRequest.prototype.open = function(this: any, ...args: any[]) {
      const [ method, url ] = args;
      this._startTime = performance.now();
      this._url = url;
      this._method = method;
      // @ts-ignore
      return originalXHROpen.apply(this, args);
    };

    // 拦截 setRequestHeader 来记录
    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
      // @ts-ignore
      if (!this._requestHeaders) {
        // @ts-ignore
        this._requestHeaders = {};
      }
      // @ts-ignore
      this._requestHeaders[header] = value;
      return originalSetRequestHeader.apply(this, [header, value]);
    };
    
    const collectXHRResource = (xhr: any, body?: any, error?: any) => {
      const fullUrl = normalizeUrl(xhr._url);
      if (isIgnoreDebug({ url: fullUrl })) {
        return;
      }
      const responseHeaders = parseXHRHeaders(xhr.getAllResponseHeaders());
      const responseBody = getXHRResonseBody(xhr, responseHeaders);
      const resource = {
        type: 'xhr',
        url: fullUrl,
        request: {
          headers: JSON.stringify(xhr._requestHeaders),
          params: JSON.stringify(getRequestParams(fullUrl)),
          body: getXHRRequestBody(xhr, body),
        },
        size: responseBody?.size || 0,
        response: {
          headers: JSON.stringify(responseHeaders),
          body: responseBody,
          error,
        },
        method: (xhr._method || 'GET').toUpperCase(),
        time: performance.now() - xhr._startTime,
        status: xhr.status,
        // statusText: xhr.statusText,
        timestamp: Date.now(),
        id: getId(),
      };
      this.collectData('network', resource);
    }

    // @ts-ignore
    XMLHttpRequest.prototype.send = function(this: any, ...sendArgs: any[]) {
      const xhr = this;
      const originalOnLoad = xhr.onload;
      const originalOnError = xhr.onerror;

      xhr.onload = function(...args: any[]) {
        collectXHRResource(this, sendArgs[0]);
        if (originalOnLoad) {
          originalOnLoad.apply(this, args);
        }
      };
      
      xhr.onerror = function(...args: any[]) {
        collectXHRResource(this, sendArgs[0], 'Network Error');
        if (originalOnError) {
          originalOnError.apply(this, args);
        }
      };
      // @ts-ignore
      return originalXHSend.apply(this, sendArgs);
    };

    // 重写fetch来监控fetch请求
    const originalFetch = window.fetch;

    const collectFetchResource = (options: any) => {
      if (isIgnoreDebug(options)) {
        return;
      }
      const { url, config, startTime, response, error } = options;
      
      const responseHeaders = response.headers ? Object.fromEntries?.(response.headers) : {};
      // @ts-ignore
      readResponse(response, ({size, body}) => {
        const fullUrl = normalizeUrl(url);
        const resource = {
          type: 'fetch',
          url: fullUrl,
          method: (config.method || 'GET').toUpperCase(),
          time: performance.now() - startTime,
          status: response.status,
          size,
          request: {
            headers: JSON.stringify(config.headers || {}),
            params: JSON.stringify(getRequestParams(fullUrl, config.params)),
            body: getFetchRequestBody(config),
          },
          response: {
            // @ts-ignore
            headers: JSON.stringify(responseHeaders),
            body,
            error,
          },
          // statusText: response.statusText,
          timestamp: Date.now(),
          id: getId(),
        };
        this.collectData('network', resource);
      });
    }

    // @ts-ignore
    window.fetch = function(this: any, ...args: any[]) {
      const [url, config = {}] = args;
      const startTime = performance.now();
      // @ts-ignore
      const promise = originalFetch.apply(this, args);
      promise.then(function(response: Response) {
        collectFetchResource({
          url,
          config,
          startTime,
          response,
        })
      }).catch(function(error: Error) {
        collectFetchResource({
          url,
          config,
          startTime,
          response: {
            status: 0,
            ok: false,
          },
          error: String(error)
        })
      })
      return promise;
    };


    // link	<link> 标签加载的资源	CSS 文件、favicon
    // script	<script> 标签加载的资源	JavaScript 文件
    // img	<img> 标签加载的资源	图片（JPG、PNG、WebP等）
    // css	CSS 中的资源（如 background-image）	通过 CSS 加载的图片、字体
    // fetch	Fetch API 请求	fetch() 发起的请求
    // xmlhttprequest	XMLHttpRequest 请求	new XMLHttpRequest()
    // iframe	<iframe> 或 <frame>	内嵌页面
    // object	<object> 标签	Flash、PDF 等插件内容
    // embed	<embed> 标签	嵌入的外部内容
    // svg	SVG 文件中的资源	SVG 图片或内部资源
    // video	<video> 标签	视频文件
    // audio	<audio> 标签	音频文件
    // track	<track> 标签	WebVTT 字幕文件
    // font	字体文件	@font-face 加载的字体
    // navigation	页面导航本身	页面跳转或刷新
    // beacon	Beacon API 请求	navigator.sendBeacon()
    // subresource	其他类型的子资源	无法明确分类的资源
    // other	未归类或未知类型	默认值
    

    // 资源重复收集依赖判断
    const duplicateEntrySet = new Set<string>();

    let duplicateEntrySetTimer: any;

    const collectEntry = (entry: any, type?: string, extra?: any) => {
      if (duplicateEntrySet.has(entry.name)) {
        return;
      }
      duplicateEntrySet.add(entry.name);

      if (duplicateEntrySetTimer) {
        clearTimeout(duplicateEntrySetTimer);
      }
      // 1秒后 清空重复资源集
      duplicateEntrySetTimer = setTimeout(() => {
        duplicateEntrySet.clear();
      }, 100);
      const resource = {
        type: type || entry.initiatorType,
        url: entry.name,
        method: entry.method || 'GET',
        size: entry.encodedBodySize,


        // 是否命中缓存
        hit: entry.encodedBodySize > 0 && entry.transferSize < 1,
        // duration: resourceEntry.duration.toFixed(2),
        // TTFB (Time to First Byte) - 面板中通常显示的加载时间
        time: (entry.responseStart - entry.requestStart),
        status: entry.status || 200,
        timestamp: Date.now(),
        id: getId(),
        ...extra
      };
      this.collectData('network', resource);
    }

    // 收集页面文档信息
    const collectDocEntry = (entry: any) => {
      // 只收集文档加载完成时的html资源
      const handleSuccess = () => {
        collectEntry(entry, 'document', {
          response: {
            body: {
              // 只要前20 kb 数据
              content: (document.documentElement.innerHTML || '').slice(0, 1024 * 20),
              type: 'text/html',
              size: entry.encodedBodySize,
            }
          },
        });
      }
      const handleError = () => {
        collectEntry(entry, 'document');
      }
      domReady(handleSuccess, handleError)
    }

    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      collectDocEntry(navigationEntry);
    }

    const resourceEntrySet = new Set(['script', 'link', 'img', 'font', 'other']);
    performance.getEntriesByType('resource').forEach((entry) => {
      // @ts-ignore
      if (resourceEntrySet.has(entry.initiatorType)) {
        collectEntry(entry);
      }
    })

    // 使用PerformanceObserver监控资源加载
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            // 使用 any 类型处理 entry
            // @ts-ignore
            if (resourceEntrySet.has(entry.initiatorType)) {
              collectEntry(entry);
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }

  }

  destroy() {
    this.initData();
    this.destroyConsole?.();
  }
}

export interface GetDefaultMonitorCoreInstanceOptions {
  enableKeys?: string[];
}
/** 创建监控核心实例 */
export const getDefaultMonitorCoreInstance = (options?: GetDefaultMonitorCoreInstanceOptions) => {
  if (windowProxy['__MONITOR__']) {
    return windowProxy['__MONITOR__'];
  }
  const instance = new Monitor();
  instance.init(options?.enableKeys || []);
  windowProxy['__MONITOR__'] = instance;
  return instance;
}
