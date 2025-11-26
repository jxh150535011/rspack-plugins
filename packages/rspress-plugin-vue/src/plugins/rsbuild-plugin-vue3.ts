import { VueLoaderPlugin } from 'rspack-vue-loader';

const PLUGIN_VUE_NAME = 'plugin:vue3';

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
  vueLoaderOptions?: VueLoaderOptions;
  splitChunks?: SplitChunksOptions;
  include: string[];
}

function pluginVue3(options: PluginVueOptions) {
  return {
    name: PLUGIN_VUE_NAME,
    setup(api: any) {
      // foo 为了绕过底层的判断 这里只匹配vue3 模板
      // const VUE_REGEXP = /(\-vue3\.vue$|foo\.vue$)/;
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

        // 配置 vue-loader 选项
        const userLoaderOptions = options.vueLoaderOptions ?? {};
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
          .rule(CHAIN_ID.RULE.VUE)
          .test(VUE_REGEXP)
          .include
            .add(options.include)
          .end()
          .use(CHAIN_ID.USE.VUE)
          .loader(require.resolve('rspack-vue-loader'))
          .options(vueLoaderOptions);

        // 配置 CSS 处理规则
        chain.module
          .rule(CHAIN_ID.RULE.CSS)
          .test(/\.(?:css|postcss|pcss)$/);

        // 添加 VueLoaderPlugin
        chain.plugin(CHAIN_ID.PLUGIN.VUE_LOADER_PLUGIN)
          .before(CHAIN_ID.PLUGIN.REACT_FAST_REFRESH)
          .use(VueLoaderPlugin);
      });

      // 配置代码分割
      const configureSplitChunks = (
        api: any, 
        splitOptions: SplitChunksOptions = { vue: true, router: true }
      ) => {
        // @ts-ignore
        api.modifyBundlerChain((chain, { environment }) => {
          const { config } = environment;
          
          if (config.performance.chunkSplit.strategy !== 'split-by-experience') {
            return;
          }

          const currentConfig = chain.optimization.splitChunks.values();
          
          if (
            currentConfig === null ||
            typeof currentConfig !== 'object' ||
            Object.prototype.toString.call(currentConfig) !== '[object Object]'
          ) {
            return;
          }

          const extraGroups: Record<string, any> = {};

          if (splitOptions.vue) {
            extraGroups.vue = {
              name: 'lib-vue',
              test: /node_modules[\\/](?:vue|rspack-vue-loader|@vue[\\/]shared|@vue[\\/]reactivity|@vue[\\/]runtime-dom|@vue[\\/]runtime-core)[\\/]/,
              priority: 0,
            };
          }

          if (splitOptions.router) {
            extraGroups.router = {
              name: 'lib-router',
              test: /node_modules[\\/]vue-router[\\/]/,
              priority: 0,
            };
          }

          if (Object.keys(extraGroups).length > 0) {
            chain.optimization.splitChunks({
              ...currentConfig,
              cacheGroups: {
                ...extraGroups,
                ...currentConfig.cacheGroups,
              },
            });
          }
        });
      };

      configureSplitChunks(api, options.splitChunks);
    },
  };
}

export { pluginVue3 };
export type { PluginVueOptions, VueLoaderOptions, SplitChunksOptions };