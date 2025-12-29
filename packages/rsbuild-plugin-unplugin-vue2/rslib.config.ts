import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    assetsInclude: /.png$/
  },
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
