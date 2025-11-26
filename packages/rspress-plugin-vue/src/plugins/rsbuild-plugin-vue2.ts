import { createRequire } from 'node:module';
import { isPlainObject } from 'lodash-es';
import { VueLoaderPlugin } from 'vue-loader';
function _define_property(obj: any, key: any, value: any) {
  if (key in obj) Object.defineProperty(obj, key, {
    value: value,
    enumerable: true,
    configurable: true,
    writable: true
  });
  else obj[key] = value;
  return obj;
}
class VueLoader15PitchFixPlugin {
    apply(compiler: any) {
        const { NormalModule } = compiler.webpack;
        // @ts-ignore
        compiler.hooks.compilation.tap(this.name, (compilation)=>{
          const isExpCssOn = compilation.compiler.options?.experiments?.css;
          if (!isExpCssOn) return;
          // @ts-ignore
          NormalModule.getCompilationHooks(compilation).loader.tap(this.name, (loaderContext)=>{
              const loaderPath = loaderContext.loaders?.[0]?.path || '';
              if (/[?&]type=style/.test(loaderContext.resourceQuery) &&  /[\\/]vue-loader[\\/]lib[\\/]loaders[\\/]pitcher/.test(loaderPath)) {
                const seen = new Set();
                const loaders = [];
                for (const loader of loaderContext.loaders || []){
                  const identifier = 'string' == typeof loader ? loader : loader.path + loader.query;
                  if (!seen.has(identifier)) {
                      seen.add(identifier);
                      loaders.push(loader);
                  }
                }
                loaderContext.loaders = loaders;
              }
          });
        });
    }
    constructor(){
        _define_property(this, "name", 'VueLoader15PitchFixPlugin');
    }
}
// @ts-ignore
const applySplitChunksRule = (api, options = {
    vue: true,
    router: true
})=>{
    // @ts-ignore
    api.modifyBundlerChain((chain, { environment })=>{
        const { config } = environment;
        if ('split-by-experience' !== config.performance.chunkSplit.strategy) return;
        const currentConfig = chain.optimization.splitChunks.values();
        if (!isPlainObject(currentConfig)) return;
        const extraGroups = {};
        if (options.vue) {
          // @ts-ignore
          extraGroups.vue = {
            name: 'lib-vue',
            test: /node_modules[\\/](?:vue|vue-loader)[\\/]/,
            priority: 0
          }
        }
        if (options.router) {
          // @ts-ignore
          extraGroups.router = {
            name: 'lib-router',
            test: /node_modules[\\/]vue-router[\\/]/,
            priority: 0
          };
        }
        if (!Object.keys(extraGroups).length) return;
        chain.optimization.splitChunks({
            ...currentConfig,
            cacheGroups: {
                ...currentConfig.cacheGroups,
                ...extraGroups
            }
        });
    });
};
const src_require = createRequire(import.meta.url);
const PLUGIN_VUE2_NAME = 'rsbuild:vue2';
function pluginVue2(options: any) {
    
    return {
        name: PLUGIN_VUE2_NAME,
        setup(api: any) {
            const VUE_REGEXP = /\.vue$/;
            const CSS_MODULES_REGEX = /\.modules?\.\w+$/i;
            // @ts-ignore
            api.modifyEnvironmentConfig((config, { mergeEnvironmentConfig })=>{
              // @ts-ignore
                if (true === config.output.cssModules.auto) config.output.cssModules.auto = (path, query)=>{
                  if (VUE_REGEXP.test(path)) return query.includes('type=style') && query.includes('module=true');
                  return CSS_MODULES_REGEX.test(path);
                };
                const extraConfig = {
                    source: {
                      include: [
                        /\.vue/
                      ]
                    }
                };
                return mergeEnvironmentConfig(config, extraConfig);
            });
            // @ts-ignore
            api.modifyBundlerChain((chain, { CHAIN_ID })=>{
              console.log('options.include', options);
                chain.resolve.extensions.add('.vue');
                // if (!chain.resolve.alias.get('vue$')) chain.resolve.alias.set('vue$', 'vue/dist/vue.runtime.esm.js');
                // @ts-ignore
                const userLoaderOptions = options.vueLoaderOptions ?? {};
                const compilerOptions = {
                    whitespace: 'condense',
                    ...userLoaderOptions.compilerOptions
                };
                const vueLoaderOptions = {
                    experimentalInlineMatchResource: true,
                    ...userLoaderOptions,
                    compilerOptions
                };
                console.log('options.include', options.include);
                chain.module
                .rule(CHAIN_ID.RULE.VUE)
                .test(VUE_REGEXP)
                .include
                  .add(options.include)
                .end()
                .use(CHAIN_ID.USE.VUE)
                .loader(src_require.resolve('vue-loader'))
                .options(vueLoaderOptions);

                const rule = chain.module.rule(CHAIN_ID.RULE.VUE);

                chain.module
                  .rule(CHAIN_ID.RULE.CSS)
                  .test(/\.(?:css|postcss|pcss)$/);

                
                if (chain.module.rules.has(CHAIN_ID.RULE.JS)) {
                  applyResolveConfig(rule, chain.module.rule(CHAIN_ID.RULE.JS))
                };
                chain.plugin(CHAIN_ID.PLUGIN.VUE_LOADER_PLUGIN)
                  .before(CHAIN_ID.PLUGIN.REACT_FAST_REFRESH)
                  .use(VueLoaderPlugin);
                chain.plugin('vue-loader-15-pitch-fix').use(VueLoader15PitchFixPlugin);
            });
            // @ts-ignore
            applySplitChunksRule(api, options.splitChunks);
        }
    };
}
// @ts-ignore
function applyResolveConfig(vueRule, jsRule) {
    const fullySpecified = jsRule.resolve.get('fullySpecified');
    const aliases = jsRule.resolve.alias.entries();
    if (aliases) vueRule.resolve.alias.merge(aliases);
    if (void 0 !== fullySpecified) vueRule.resolve.fullySpecified(fullySpecified);
}
export { PLUGIN_VUE2_NAME, pluginVue2 };