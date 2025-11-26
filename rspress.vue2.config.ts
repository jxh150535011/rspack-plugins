import { resolve } from 'path';
import { defineConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginCopy as rspressPluginCopy } from './packages/rspress-plugin-copy';
import { createRepressPluginVue } from './packages/rspress-plugin-vue';

const root = process.cwd();

const docRoot = resolve(root, './test-packages/vue2-test/docs')
const repressPluginVue = createRepressPluginVue({
  mode: 'vue2',
  vuePath: resolve(root, './test-packages/vue2-test/node_modules/vue/dist/vue.esm.js'),
  include: [
    resolve(root, './test-packages/vue2-test')
  ],
})

const baseName =  'iframe-vue2-test';

export default defineConfig({
  // 文档根目录
  root: docRoot,
  // 文档标题
  title: '测试',
  outDir: `dist/${baseName}`,
  base: baseName,
  themeConfig: {
    hideNavbar: 'always',
    
  },
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
    output: {
      assetPrefix: `/${baseName}`
    },
    resolve: {
      alias: {
        '@test/vue2': resolve(root, './test-packages/vue2-test/src'),
      },
    },
    server: {
      port: 9081,
    },
  },
});