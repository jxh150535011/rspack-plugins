import { VueLoaderPlugin } from 'rspack-vue-loader';
import { VueLoaderPlugin as LegacyVueLoaderPlugin } from 'vue-loader';
import { RunTimeTemplate } from './RunTimeTemplate';
import { RspackReactRefreshLoaderPlugin } from './rspack-react-refresh-loader-plugin';
const PLUGIN_VUE_NAME = 'plugin:vue';

interface VueLoaderOptions {
  compilerOptions?: Record<string, any>;
  experimentalInlineMatchResource?: boolean;
  [key: string]: any;
}

interface SplitChunksOptions {
  vue?: boolean;
  router?: boolean;
}

interface PluginVueOptions {
  splitChunks?: any;
  entrys: RunTimeTemplate[]
}

function pluginVue(options: PluginVueOptions) {

  const { entrys = [] } = options;

  const vue3Entry = entrys.find(p => p.mode === 'vue3');
  const vue2Entry = entrys.find(p => p.mode === 'vue2');

  return {
    name: PLUGIN_VUE_NAME,
    setup(api: any) {
      // foo 为了绕过底层的判断 这里只匹配vue3 模板
      const VUE_REGEXP = /\.vue$/;
      const CSS_MODULES_REGEX = /\.modules?\.\w+$/i;
      // @ts-ignore
      api.modifyEnvironmentConfig((config, { mergeEnvironmentConfig }) => {
        const merged = mergeEnvironmentConfig({
          source: {
            define: {
              __VUE_OPTIONS_API__: true,
              __VUE_PROD_DEVTOOLS__: false,
              __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
            },
            include: [/\.vue\.js$/],
          },
        }, config);

        if (merged.output.cssModules.auto === true) {
          merged.output.cssModules.auto = (path: string, query: string) => {
            if (VUE_REGEXP.test(path) || path.includes('.vue.css')) {
              return query.includes('type=style') && query.includes('module=');
            }
            return CSS_MODULES_REGEX.test(path);
          };
        }

        return merged;
      });
      // @ts-ignore
      api.modifyBundlerChain((chain, { CHAIN_ID }) => {
        // 添加 .vue 扩展名
        chain.resolve.extensions.add('.vue');
        if (!chain.resolve.alias.get('vue$') && vue2Entry?.vuePath) {
          chain.resolve.alias.set('vue$', vue2Entry.vuePath)
        }

        // if (vue2Entry) {
        //   chain.resolve.alias.set('vue-template-compiler$', require.resolve(vue2Entry?.vueLoaderOptions?.compiler));
        // }


        for(let i = 0; i < entrys.length; i++) {
          const entry = entrys[i];
          const ruleId = `rule-${entry.mode}-${i}`
          if (entry.mode === 'vue3') {
            //配置 vue-loader 选项
            const userLoaderOptions = entry.vueLoaderOptions ?? {};
            const compilerOptions: Record<string, any> = {
              preserveWhitespace: false,
              ...userLoaderOptions.compilerOptions,
            };
            
            const vueLoaderOptions: VueLoaderOptions = {
              experimentalInlineMatchResource: true,
              ...userLoaderOptions,
              compilerOptions,
            };


            // 配置 vue 文件处理规则
            chain.module
              .rule(ruleId)
              .test(VUE_REGEXP)
              .include
                .add(entry.include)
              .end()
              .use('vue-loader')
              .loader(require.resolve('rspack-vue-loader'))
              .options(vueLoaderOptions);

          } else {
              const userLoaderOptions = entry.vueLoaderOptions ?? {};
              const compilerOptions = {
                  whitespace: 'condense',
                  ...userLoaderOptions.compilerOptions
              };
              const vueLoaderOptions = {
                  experimentalInlineMatchResource: true,
                  ...userLoaderOptions,
                  compilerOptions
              };
              // rspack-vue-loader 和 vue-loader 内部做了一个这个嗅探，如果检测到了 foo.vue
              // 但是又不是 rspack-vue-loader (vue-loader) 就报错
              // 因此他们只能二选 1 所以对他们进行补丁
              chain.module
                .rule(ruleId)
                .test(/\.vue$/)
                .include
                  .add(entry.include)
                  .end()
                .use('vue-loader')
                .loader(require.resolve('vue-loader'))
                .options(vueLoaderOptions);
          }

        }

        if (vue3Entry) {
          // 添加 VueLoaderPlugin
          chain.plugin('vue3-loader-plugin')
            .before(CHAIN_ID.PLUGIN.REACT_FAST_REFRESH)
            .use(VueLoaderPlugin);
        }
        if (vue2Entry) {
          chain.plugin('vue2-loader-plugin')
            .before(CHAIN_ID.PLUGIN.REACT_FAST_REFRESH)
            .use(LegacyVueLoaderPlugin);
        }

        chain.module.rule(CHAIN_ID.RULE.JS).exclude.add((file: any) => {
          if (/\.vue/.test(file)) {
            return true;
          }
          return false;
        });

        chain.plugin('disabled-react-refresh-loader').use(RspackReactRefreshLoaderPlugin);


        // 配置 CSS 处理规则
        chain.module
          .rule(CHAIN_ID.RULE.CSS)
          .test(/\.(?:css|postcss|pcss)$/);

        // // 添加 VueLoaderPlugin
        // chain.plugin(CHAIN_ID.PLUGIN.VUE_LOADER_PLUGIN)
        //   .before(CHAIN_ID.PLUGIN.REACT_FAST_REFRESH)
        //   .use(VueLoaderPlugin);
      });

    },
  };
}

export { pluginVue };
export type { PluginVueOptions, VueLoaderOptions, SplitChunksOptions };