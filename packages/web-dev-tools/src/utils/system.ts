
import type { Monitor } from '../core';
import type { MonitorStorageDataType } from '../types';

export const getNavigationEntryInfo = () => {
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  if (!navigationEntry) {
    return;
  }
  const navigationStart = navigationEntry.startTime;
  // @ts-ignore
  const domainLookupStart = navigationEntry.domainLookupStart;
  // @ts-ignore
  const domainLookupEnd = navigationEntry.domainLookupEnd;
  // @ts-ignore
  const connectStart = navigationEntry.connectStart;
  // @ts-ignore
  const connectEnd = navigationEntry.connectEnd;
  // @ts-ignore
  const requestStart = navigationEntry.requestStart;
  // @ts-ignore
  const responseStart = navigationEntry.responseStart;
  // @ts-ignore
  const domContentLoadedEventEnd = navigationEntry.domContentLoadedEventEnd;
  // @ts-ignore
  const loadEventEnd = navigationEntry.loadEventEnd;

    // 计算关键性能指标
  const dnsTime = domainLookupEnd - domainLookupStart;
  const tcpTime = connectEnd - connectStart;
  const ttfb = responseStart - requestStart; // Time To First Byte
  const domReady = domContentLoadedEventEnd - navigationStart;
  const loadTime = loadEventEnd - navigationStart;

  return {
    dns: `${Math.round(dnsTime)}ms`,
    tcp: `${Math.round(tcpTime)}ms`,
    ttfb: `${Math.round(ttfb)}ms`,
    domReady: `${Math.round(domReady)}ms`,
    loadTime: `${Math.round(loadTime)}ms`,
  }
}

/**
 * 获取终端信息
 */
export const getClientInfo = () => {

  const screen = window.screen;

  return [
    {
      id: 'location',
      label: 'Location',
      value: window.location.href,
    },
    {
      id: 'useragent',
      label: 'UserAgent',
      value: navigator.userAgent,
    },
    {
      id: 'screen',
      label: 'Screen',
      value: JSON.stringify({
        availHeight: screen.availHeight,
        availWidth: screen.availWidth,
        // @ts-ignore
        availTop: screen.availTop,
        // @ts-ignore
        availLeft: screen.availLeft,
        height: screen.height,
        width: screen.width,
        // @ts-ignore
        isExtended: screen.isExtended,
      }),
    },
    {
      id: 'navigation',
      label: 'Navigation',
      value: JSON.stringify(getNavigationEntryInfo()),
    }
  ]
}

export const getStorageItems = (storage: any) => {
  const keys = Object.keys(storage);
  return keys.map(key => {
    return {
      key,
      value: storage.getItem(key) || '',
    }
  }) as MonitorStorageDataType[]
}

const getCookieItems = () => {
  const cookies = document.cookie.split(';');
  return cookies.map(cookie => {
    const [key, value] = cookie.split('=');
    if (!value) {
      return null;
    }
    return {
      key: key,
      value: decodeURIComponent(value),
    }
  }).filter(p => !!p) as MonitorStorageDataType[]

}


export const getMonitorAllData = (instance: Monitor) => {
  const clientInfo = getClientInfo();
  return {
    ...instance.getData(),
    system: clientInfo,
    localStorage: getStorageItems(window.localStorage),
    sessionStorage: getStorageItems(window.sessionStorage),
    cookie: getCookieItems(),
  };
}