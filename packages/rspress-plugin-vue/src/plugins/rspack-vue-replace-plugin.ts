export const RspackVueReplaceLoader = function(source: any) {
  console.log('RspackVueReplaceLoader', source);
};

export const RspackVueReplacePluginName = 'rspack-vue-replace-plugin';
class RspackVueReplacePlugin {
    shouldProcessFile(assetName: string) {
      if (/\.map$/.test(assetName)) {
        return false;
      }
      if (assetName.includes('Vue3TestDemo')) {
        return true;
      }
      return false;
    }
    apply(compiler: any) {
      // // 使用 compilation 钩子介入编译过程
      // compiler.hooks.compilation.tap('MyCustomPlugin', (compilation) => {
      //   // 你可以在这里通过 compilation 对象进行各种操作
      //   console.log('The compilation is starting.');
      // });

      // // 使用 emit 钩子在生成资源前进行操作
      // compiler.hooks.emit.tap('MyCustomPlugin', (compilation) => {
      //   // 操作 compilation.assets
      // });
    }
}
export default RspackVueReplacePlugin;