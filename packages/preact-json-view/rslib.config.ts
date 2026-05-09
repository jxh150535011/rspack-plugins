import { defineConfig } from '@rslib/core';
import { pluginPreact } from '@rsbuild/plugin-preact';

export default defineConfig({
  plugins: [
    pluginPreact(),
  ],
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
