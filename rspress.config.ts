import { resolve } from 'path';
import { defineConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginTypeDocExt } from './packages/rspress-plugin-typedoc-ext';
// import { pluginTypeDocExt } from 'rspress-plugin-typedoc-ext';

const root = process.cwd();

export default defineConfig({
  // 文档根目录
  root: 'docs',
  // 文档标题
  title: '测试',
  outDir: 'dist',
  globalStyles: resolve(root, './theme/styles/index.css'),
  plugins: [
    pluginPreview({
      iframeOptions: {
        devPort: 9081,
      },
    }),
    pluginTypeDocExt([
      {
        entryPoints: [
          './test-packages/utils-test/src/index.ts'
        ],
        outDir: './docs/utils-test',
        enable: true,
        generateFiles: ['cases', 'test.md'],
        typeDocOptions: {
          sourceLinkExternal: true,
          readme: 'none',
        },
      },
      {
        entryPoints: [
          './test-packages/utils-test/src/core.ts'
        ],
        outDir: './docs/utils-core',
        enable: true,
        entryFileName: 'index.md',
        typeDocOptions: {
          sourceLinkExternal: true,
          readme: 'none',
        },
      }
    ]),
  ],
  builderConfig: {
    resolve: {
      alias: {
        '@test/utils': resolve(root, './test-packages/utils-test/src'),
      },
    },
    source: {
      define: {},
    },
    plugins: [],
    server: {
      port: 9080,
    },
  },
});