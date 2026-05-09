import { resolve } from 'path';
import { defineConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginPreact } from '@rsbuild/plugin-preact';
import { pluginLess } from '@rsbuild/plugin-less';

import pkg from './package.json';
const root = process.cwd();

export default defineConfig({
  // 文档根目录
  root: 'docs',
  outDir: 'dist',
  plugins: [
    pluginPreview({
      previewMode: 'iframe',
      iframeOptions: {
        devPort: 9084,
        builderConfig: {
          resolve: {
            alias: {
              [pkg.name]: resolve(root, pkg.main),
            },
          },
          plugins: [
            pluginPreact()
          ],
        },
      },
      // previewLanguages: ['tsx', 'ts', 'jsx', 'js',...repressPluginPreact.language],
      // previewCodeTransform(codeInfo) {
      //   let content = repressPluginPreact.previewCodeTransform(codeInfo);
      //   if (content) {
      //     return content;
      //   }
      //   return codeInfo.code
      // },
    }),
  ],
  builderConfig: {
    resolve: {
      alias: {
        [pkg.name]: resolve(root, pkg.main),
      },
    },
    source: {
      define: {},
    },
    plugins: [
      pluginLess(),
    ],
    server: {
      port: 9080,
    },
  },
});