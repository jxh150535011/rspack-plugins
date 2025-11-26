export const PLUGIN_API_ID = Symbol('rsbuild-inner-plugin-vue');
const VUE_REGEXP = /\.vue$/;
const CSS_MODULES_REGEX = /\.modules?\.\w+$/i;
const VUE_FILE_EXTENSIONS = new Set(['.vue', '.js', '.jsx', '.mjs', '.ts', '.tsx']);
// @ts-ignore
export default (options) => {
    const { pattern } = options;
    return {
        name: 'rsbuild-inner-plugin-vue',
        // @ts-ignore
        setup: async (api) => {
            // api.modifyRsbuildConfig((userConfig, { mergeRsbuildConfig }) => {
            // });
            // api.modifyWebpackConfig((config, { mergeConfig }) => {
            // });
            // api.modifyRspackConfig((chain, { CHAIN_ID }) => {
            // });
            // @ts-ignore
            api.modifyBundlerChain(async (chain, { CHAIN_ID, environment }) => {
              // @ts-ignore
              chain.module.rule(CHAIN_ID.RULE.JS).exclude.add((file) => {
                if (pattern.match(file)) {
                  return true;
                }
                return false;
              });
              // chain.plugin(CHAIN_ID.PLUGIN.VUE_LOADER_PLUGIN).use(RspackVueLoaderPlugin);
            });
        },
    };
};