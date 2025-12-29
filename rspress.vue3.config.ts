import { resolve } from 'path';
import { defineConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';
import { createRepressPluginVue } from './packages/rspress-plugin-vue';

const root = process.cwd();

const docRoot = resolve(root, './test-packages/vue3-test/docs')
const repressPluginVue = createRepressPluginVue({
  mode: 'vue3',
  vuePath: resolve(root, './test-packages/vue3-test/node_modules/vue'),
  include: [
    resolve(root, './test-packages/vue3-test')
  ],
  // vueLoaderOptions: {
  //   experimentalInlineMatchResource: true
  // }
})

export default defineConfig({
  // 文档根目录
  root: docRoot,
  // 文档标题
  title: '测试',
  outDir: 'dist/vue3-test',
  plugins: [
    pluginPreview({
      iframeOptions: {
        devPort: 9081,
      },
      previewLanguages: ['tsx', 'ts', 'jsx', 'js',...repressPluginVue.language],
      previewCodeTransform(codeInfo) {
        let content = repressPluginVue.previewCodeTransform(codeInfo);
        if (content) {
          return content;
        }
        return codeInfo.code
      },
    }),
    repressPluginVue.plugin,
  ],
  builderConfig: {
    resolve: {
      alias: {
        '@test/vue3': resolve(root, './test-packages/vue3-test/src'),
      },
    },
    server: {
      port: 9082,
    },
  },
});