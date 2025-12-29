
import rspackPluginVue2 from 'unplugin-vue2/rspack';
import { VueLoaderPlugin } from 'vue-loader'

function parseVueRequest(id: any) {
  const [filename, rawQuery] = id.split("?", 2);
  const query: any = Object.fromEntries(new URLSearchParams(rawQuery));
  if (query.vue != null) {
    query.vue = true;
  }
  if (query.index != null) {
    query.index = Number(query.index);
  }
  if (query.raw != null) {
    query.raw = true;
  }
  if (query.scoped != null) {
    query.scoped = true;
  }
  return {
    filename,
    query
  };
}

// @ts-ignore
const isVirtualModule = (request)=>{
    if (!request) return false;
    return /[\\/]node_modules[\\/].virtual/.test(request) || request.startsWith('\0');
};
// @ts-ignore
const isPreprocessorRule = (preprocessRuleId, toMatchRuleId)=>{
    if (preprocessRuleId === toMatchRuleId) return true;
    if (new RegExp(`${preprocessRuleId}-\\d`).test(toMatchRuleId)) return true;
    return false;
};
// @ts-ignore
const isScopedStyle = (request)=>{
    if (!request) return false;
    const { query } = parseVueRequest(request)
    return 'style' === query.type || 'css' === query.lang;
};

export interface PluginUnpluginVue2Options {

  lessLoaderOptions?: any;

}

const pluginUnpluginVue2 = (options?: PluginUnpluginVue2Options)=> {

  const { lessLoaderOptions = {} } = options || {};
  const { include: lessInclude = /\.less$/ } = lessLoaderOptions || {};

  return {
    name: 'plugin-unplugin-vue2',
    // @ts-ignore
    setup (api) {
        const callerName = api.context.callerName;
        const isRslib = 'rslib' === callerName;
        // @ts-ignore
        api.modifyRspackConfig((config, utils)=>{
            config.plugins.push(rspackPluginVue2());
        });
        api.modifyBundlerChain({
          // @ts-ignore
            handler: (chain, { CHAIN_ID })=>{
                for(const ruleId in chain.module.rules.entries()) {
                  if (CHAIN_ID.RULE.CSS === ruleId || isPreprocessorRule(CHAIN_ID.RULE.LESS, ruleId) || isPreprocessorRule(CHAIN_ID.RULE.SASS, ruleId) || isPreprocessorRule(CHAIN_ID.RULE.STYLUS, ruleId)) {
                    const baseRule = chain.module.rules.get(ruleId);
                    if (baseRule) {
                      baseRule.enforce('post');
                    } 
                  }
                }
                chain.resolve.extensions.add('.vue');
                if (CHAIN_ID.RULE.LESS) {
                  const cssRawRule = chain.module.rules.get(CHAIN_ID.RULE.LESS);
                  if (cssRawRule) {
                    chain.module
                      .rule(CHAIN_ID.RULE.LESS)
                      .test(lessInclude)
                      .type('asset/source')
                      .resourceQuery(cssRawRule.get('resourceQuery'));
                  }
                }
                if (!chain.module.rules.has('vue')) {
                    chain.module
                      .rule('vue')
                      .test(/\.vue$/)
                      .use('vue-loader')
                      .loader(require.resolve('vue-loader'));
                }
                chain.plugin('vue-loader-plugin').use(VueLoaderPlugin);

            },
            order: 'post'
        });
        if (isRslib) {
          // @ts-ignore
            api.modifyRspackConfig((config)=>{
              // @ts-ignore
                if (Array.isArray(config.externals)) config.externals.unshift(async (data, callback)=>{
                    const { request, context } = data;
                    let result = false;
                    if (isVirtualModule(request) || isVirtualModule(context)) result = true;
                    else if (isScopedStyle(request)) result = true;
                    if (result) return callback(void 0, false);
                    callback();
                });
            });
            api.processAssets({
                stage: 'additional'
                // @ts-ignore
            }, ({ assets, compilation })=>{
                for (const key of Object.keys(assets))if (isVirtualModule(key)) compilation.deleteAsset(key);
            });
        }
    }
}
};

export {
  pluginUnpluginVue2
}