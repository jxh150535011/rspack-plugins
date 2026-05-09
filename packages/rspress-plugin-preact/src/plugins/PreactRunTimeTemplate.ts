
export interface PreactRunTimeTemplateOptions {
  code?: string;
  file: string;
  setup?: string;
  libPath?: string;
}
export class PreactRunTimeTemplate {
  options;
  constructor(options: PreactRunTimeTemplateOptions) {
    this.options = options;
  }
  toString() {
    const { code, file, setup, libPath = 'preact' } = this.options;
    const compontentKey = '__Compontent';
    const injectCompontentCode = `import ${compontentKey} from ${JSON.stringify(file)};`;
    const injectSetupCode = setup ? `import setup from ${JSON.stringify(setup)};` : 'const setup = () => {};';
    return `
import React, { useRef, useLayoutEffect } from 'react';
import { render, createElement } from ${JSON.stringify(libPath)};
${injectSetupCode}
${injectCompontentCode}

const RunTime = (props) => {
  const ref = useRef();
  useLayoutEffect(() => {
    const app = createElement(${compontentKey});
    setup({ app });
    render(app, ref.current)
    return () => {
      render(null, ref.current);
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