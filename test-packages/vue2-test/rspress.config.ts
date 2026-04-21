import { resolve } from 'path';
import { defineConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginVue2 } from '@rsbuild/plugin-vue2';
import { pluginCopy as rspressPluginCopy } from '../../packages/rspress-plugin-copy';
import { createRepressPluginVue } from '../../packages/rspress-plugin-vue';

const root = process.cwd();

const docRoot = resolve(root, './docs')
const repressPluginVue = createRepressPluginVue({
  mode: 'vue2',
  vuePath: resolve(root, './node_modules/vue/dist/vue.esm.js'),
  include: [
    root
  ],
  setup: resolve(root, './theme/setup.ts'),
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
      previewMode: 'iframe',
      iframeOptions: {
        devPort: 9082,
        builderConfig: {
          resolve: {
            alias: {
              '@test/vue2': resolve(root, './src'),
            },
          },
          plugins: [pluginVue2()],
        },
      },
      previewLanguages: ['vue2', 'vue3', 'vue'],
      previewCodeTransform(codeInfo) {
        let content = repressPluginVue.previewCodeTransform(codeInfo);
        if (content) {
          return content;
        }
        return codeInfo.code
      },

    }),
    // repressPluginVue.plugin,

    // pluginPreview({
    //   previewMode: 'iframe',
    //   previewLanguages: ['vue'],
    //   iframeOptions: {
    //     position: 'follow',
    //     customEntry: ({ demoPath }) => {
    //       return `
    //       import { createApp } from 'vue';
    //       import App from ${JSON.stringify(demoPath)};
    //       createApp(App).mount('#root');
    //       `;
    //     },
    //     builderConfig: {
    //       plugins: [pluginVue()],
    //     },
    //   },
    // }),
  ],
  builderConfig: {
    output: {
      assetPrefix: `/${baseName}`
    },
    server: {
      port: 9081,
    },
  },
});