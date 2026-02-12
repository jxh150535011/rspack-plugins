import axios, {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

export interface AxiosRequestConfigWithContext extends AxiosRequestConfig<any> {
  // 添加一个可选属性，避免空接口
  context?: any;
}
export interface TestOptions {

}
export const getTest = (options: TestOptions) => {
  return 1;
}