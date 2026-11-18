/** 简单的store 不做响应  */

let config = {
  endpoint: '',
  env: 'unknown',
  name: 'unknown',
}
export const setConfig = (options: any) => {
  config = {
    ...config,
    ...options,
  }
}

export const getConfig = () => {
  return config;
}
