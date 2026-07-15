import { tryToURL } from './url';
export const formatSize = (size: number) => {
  if (!size) {
    return '0';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(size) / Math.log(1024));
  const unit = units[index];
  return `${(size / Math.pow(1024, index)).toFixed(1)} ${unit}`;
}


export const getUrlName = (url: string) => {
  if (!url) {
    return '';
  }
  const uri = tryToURL(url);
  if (!uri) {
    return '';
  }
  if (!uri.pathname || uri.pathname === '/') {
    return uri.hostname;
  }
  let suffix = '';
  const str = uri.pathname.replace(/\/+$/, ($0) => {
    suffix = $0;
    return '';
  });
  const index = str.lastIndexOf('/');
  return str.substring(index + 1) + suffix;
}


export const objectToList = (obj: any) => {
  const entries = Object.entries(obj || {});
  return entries.map(([key, value]) => ({
    label: key,
    value: value,
    key,
  }));
}


export const objectStringify = (arg: any) => {
  try {
    return JSON.stringify(arg);
  } catch (e) {
    return JSON.stringify(String(arg));
  }
}

export const objectParse = (content: any) => {
  try {
    const result = JSON.parse(content);
    return result;
  } catch(e) {
    return null;
  }
}