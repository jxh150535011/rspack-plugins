
export interface Vue3RunTimeTemplateOptions {
  code?: string;
  file: string;
  setup?: string;
  vuePath?: string;
}
export class Vue3RunTimeTemplate {
  options;
  constructor(options: Vue3RunTimeTemplateOptions) {
    this.options = options;
  }
  toString() {
    const { code, file, setup, vuePath = 'vue' } = this.options;
    const compontentKey = '__Compontent';
    const injectCompontentCode = `import ${compontentKey} from '${file}';`;
    const injectSetupCode = setup ? `import setup from '${setup}';` : 'const setup = () => {};';
    return `
import React, { useRef, useLayoutEffect } from 'react';
import { createApp } from '${vuePath}';
${injectSetupCode}
${injectCompontentCode}

const RunTime = (props) => {
  const ref = useRef();
  useLayoutEffect(() => {
    const app = createApp(${compontentKey});
    setup({ app });
    app.mount(ref.current)
    return () => {
      app.unmount(ref.current);
    }
  }, [
    ref.current
  ]);
  return <div ref={ref}></div>
}

export default RunTime;
`;
  }
}