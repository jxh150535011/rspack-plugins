declare global {
  interface Window {
    
  }
}
declare const window:  Window;

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}