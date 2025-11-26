class RspackReactRefreshLoaderPlugin {
    apply(compiler: any) {
        const rules = compiler.options.module.rules;
        // @ts-ignore
        const reactRefreshLoaderRuleIndex = rules.findIndex(p => p.use === 'builtin:react-refresh-loader');
        if (reactRefreshLoaderRuleIndex > -1) {
          rules.splice(reactRefreshLoaderRuleIndex, 1);
        }
    }
}
export {
  RspackReactRefreshLoaderPlugin
};