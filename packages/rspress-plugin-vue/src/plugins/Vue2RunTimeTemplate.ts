
export interface Vue2RunTimeTemplateOptions {
  code?: string;
  file: string;
  setup?: string;
  vuePath?: string;
}



export class Vue2RunTimeTemplate {
  options;
  constructor(options: Vue2RunTimeTemplateOptions) {
    this.options = options;
  }
  toString() {
    const { code, file, setup, vuePath = 'vue' } = this.options;
    const compontentKey = '__Compontent';
    const injectCompontentCode = `import ${compontentKey} from '${file}';`;
    const injectSetupCode = setup ? `import setup from '${setup}';` : 'const setup = () => {};';
    return `
import React, { useRef, useLayoutEffect } from 'react';
import Vue from '${vuePath}';
${injectSetupCode}
${injectCompontentCode}

const RunTime = (props) => {
  const ref = useRef();
  useLayoutEffect(() => {
    const app = new Vue({
      render: (h) => h(${compontentKey}),
    });
    setup({ app });
    app.$mount(ref.current);

    return () => {
      app.$destroy(ref.current);
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