import { Config, Plugin } from '@rspress/core';
import { RunTimeTemplate } from './RunTimeTemplate';

export interface RspressPluginPreactOptions {
  setup?: string;
  language?: string[],
  /** 
   * 指定 preact 版本路径
   * ./node_modules/preact
   */
  libPath?: string;
}

export function createRepressPluginPreact(options: RspressPluginPreactOptions | RspressPluginPreactOptions[]) {


  const entrys = options instanceof Array ? options : [options];


  const runTimeTemplates = entrys.map(entry => {
    const runtime = new RunTimeTemplate({
      libPath: entry.libPath,
      language: entry.language,
      setup: entry.setup,
    });
    runtime.clear();
    return runtime;
  })

  const languageSet = new Set(runTimeTemplates.flatMap(p => p.language))

  const language = Array.from(languageSet.values())


  const previewCodeTransform = (codeInfo: any) => {
    if (!languageSet.has(codeInfo.language)) {
      return null;
    }
    for(let i = 0; i < runTimeTemplates.length; i++) {
      let content = runTimeTemplates[i].generate(codeInfo);
      if (content) {
        return content;
      }
    }
  }

  const plugin = {
    name: `rspress-plugin-preact`,
    config(config, utils) {
      return config;
    },
  } as Plugin

  return {
    plugin,
    language,
    previewCodeTransform
  };
}