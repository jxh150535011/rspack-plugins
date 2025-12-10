import { defineConfig } from '@rslib/core';
import { pluginUnpluginVue2 } from '../../packages/rsbuild-plugin-unplugin-vue2';
import { pluginVue2  } from '@rsbuild/plugin-vue2';
import { pluginLess  } from '@rsbuild/plugin-less';

export default defineConfig({
  // output: {
  //   emitAssets: true,
  //   emitCss: true
  // },
  output: {

  },
  tools: {
    rspack: (config, { addRules }) => {



      // addRules([
      //   {
      //     test: /\.(png|less|vue)$/,
      //     // converts asset to a separate file and exports the URL address.
      //     type: 'asset/resource',
      //     generator: {
      //       filename: (file: any) => {
      //         return file.filename.replace(/^src\//, '');
      //       }
      //     }
      //   },
      // ]);
      // addRules([
      //   {
      //     test: /\.less$/,
      //     use: 'less-loader',
      //     loader: 'less-loader'
      //   },
      // ]);
    },
  },
  plugins: [
    // pluginUnpluginVue2(),
    // pluginVue2(),
    pluginLess(),
  ],
  lib: [
    {
      format: 'esm',
      dts: {
        distPath: 'types'
      },
      bundle: false,
      // autoExternal: true,
      // autoExtension: false,
      source: {
        assetsInclude: [/\.vue$/],
      },
      output: {
        target: 'web',
        filename: {
          js: '[name].mjs',
          assets: (file: any) => {
            return file.filename.replace(/^src\//, '');
          },
          image: (file: any) => {
            return file.filename.replace(/^src\//, '');
          },
        },
        distPath: {
          root: 'esm',
          assets: './',
        }
      },
    },
    // {
    //   format: 'cjs',
    //   bundle: false,
    //   output: {
    //     distPath: {
    //       root: 'cjs',
    //     }
    //   },
    // },
  ],
});
