import { defineConfig } from '@rslib/core';
import { pluginUnpluginVue2 } from '../../packages/rsbuild-plugin-unplugin-vue';

export default defineConfig({
  plugins: [pluginUnpluginVue2()],
  lib: [
    {
      format: 'esm',
      dts: {
        distPath: 'types'
      },
      bundle: false,
      output: {
        distPath: {
          root: 'esm',
        }
      },
    },
    {
      format: 'cjs',
      bundle: false,
      output: {
        distPath: {
          root: 'cjs',
        }
      },
    },
  ],
});
