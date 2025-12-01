import { Config, Plugin } from '@rspress/core';
import { resolve, join } from 'path';
import { readFileSync } from 'fs';
import { RunTimeTemplate } from './RunTimeTemplate';
import { pluginVue2 } from './rsbuild-plugin-vue2';
import { pluginVue3 } from './rsbuild-plugin-vue3';
import { pluginVue } from './rsbuild-plugin-vue';
import RspackVueReplacePlugin from './rspack-vue-replace-plugin';
import { pluginBabel } from '@rsbuild/plugin-babel';
// import { pluginVue } from '@rsbuild/plugin-vue';



import { createPathToPattern } from '../utils';
// const loadPkg = (file: string) => {
//   return JSON.parse(readFileSync(file, 'utf-8'));
// };

// const pkg = loadPkg(resolve(root, './package.json'));


const rspackVueLoader = require.resolve('./rspack-vue-loader');

export interface RspressPluginVueOptions {
  // include?: Array<RegExp>;
  // exclude?: Array<RegExp>;
  setup?: string;
  mode?: 'vue2' | 'vue3';
  language?: string[],
  /** 需要包含编译的vue 文件目录  */
  include?: string[];
  /** 
   * 指定 vue 版本路径
   * ./node_modules/vue
   */
  vuePath?: string;
  vueLoaderOptions?: any;
}

export function createRepressPluginVue(options: RspressPluginVueOptions | RspressPluginVueOptions[]) {


  const entrys = options instanceof Array ? options : [options];



  // const include = (options?.include || []).concat([/\.(?:jsx|tsx)$/]);
  // const exclude = (options?.exclude || []).concat([
  //   /[/\\](\.rspress|[@]rspress[/\\]plugin-preview)[/\\](?:[\s\S]+?)\.(?:jsx|tsx)$/
  // ]);
  // const pattern = createPathToPattern({
  //   root,
  //   include: include,
  //   exclude: exclude
  // });
  const runTimeTemplates = entrys.map(entry => {
    const runtime = new RunTimeTemplate({
      mode: entry.mode,
      vuePath: entry.vuePath,
      language: entry.language,
      setup: entry.setup,
      include: entry.include,
      vueLoaderOptions: entry.vueLoaderOptions
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

  const vue3Path = runTimeTemplates.find(p => p.options.mode === 'vue3')?.options?.vuePath;

  const plugin = {
    name: `rspress-plugin-vue`,
    config(config, utils) {
      return config;
    },
    builderConfig: {
      tools: {
        bundlerChain: (chain, { env, CHAIN_ID }) => {
          chain.module
            .rule('POST_VUE_JS')
            .test(/\.js$/)
            .resourceQuery(/\?vue&type=template/)
            .use('rspackVueLoader')
            .options({
              vuePath: vue3Path
            })
            .loader(rspackVueLoader);
        },
        rspack: {
          plugins: [
            new RspackVueReplacePlugin()
          ]
        }
      },
      plugins: [
        // pluginBabel({
        //   include: pattern.include,
        //   exclude: pattern.exclude,
        // }),
        pluginVue({
          entrys: runTimeTemplates
        })
        // pluginVue(),
        // pluginVueJsx(),
        // rsbuildInnerPluginVue({
          
        // })
      ],
    },
  } as Plugin

  return {
    plugin,
    language,
    previewCodeTransform
  };
}