import { resolve } from 'path';
import { defineConfig } from 'rspress/config';
import { pluginPreview } from '@rspress/plugin-preview';
import { pluginPreact } from '@rsbuild/plugin-preact';

import pkg from './package.json';

const root = process.cwd();

export default defineConfig({
  // 文档根目录
  root: 'docs',
  outDir: 'dist',
  plugins: [
    pluginPreview(),
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
      pluginPreact(),
    ],
    server: {
      port: 9080,
    },
  },
});