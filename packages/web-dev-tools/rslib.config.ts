import { defineConfig } from '@rslib/core';
import { pluginPreact } from '@rsbuild/plugin-preact';
import { pluginLess } from '@rsbuild/plugin-less';

export default defineConfig({
  plugins: [
    pluginPreact(),
    pluginLess(),
  ],
  source: {
    entry: {
      index: ['./src/**', '!**/.DS_Store'],
    }
  },
  lib: [
    {
      format: 'esm',
      dts: {
        distPath: 'types'
      },
      bundle: false,
      output: {
        filename: {
          js: '[name].mjs',
        },
        distPath: {
          root: 'esm',
        }
      },
    },
    {
      format: 'cjs',
      bundle: false,
      output: {
        filename: {
          js: '[name].cjs',
        },
        distPath: {
          root: 'cjs',
        }
      },
    },
  ],
  output: {
    target: 'web',
  },
});
