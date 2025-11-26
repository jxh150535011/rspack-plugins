
import rspackPluginVue2 from 'unplugin-vue2/rspack';

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
const pluginUnpluginVue2 = ()=>({
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
                handler: (config, { CHAIN_ID })=>{
                    for(const ruleId in config.module.rules.entries())if (CHAIN_ID.RULE.CSS === ruleId || isPreprocessorRule(CHAIN_ID.RULE.LESS, ruleId) || isPreprocessorRule(CHAIN_ID.RULE.SASS, ruleId) || isPreprocessorRule(CHAIN_ID.RULE.STYLUS, ruleId)) {
                        const baseRule = config.module.rules.get(ruleId);
                        if (baseRule) baseRule.enforce('post');
                    }
                    config.resolve.extensions.add('.vue');
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
    });

export {
  pluginUnpluginVue2
}