import { defineConfig } from '@rsbuild/core';
import { pluginPreact } from '@rsbuild/plugin-preact';
import { pluginLess } from '@rsbuild/plugin-less';

import pkg from './package.json';


// const publicPath = 'https://127.0.0.1';
const publicPath = `https://unpkg.com/${pkg.name}@${pkg.version}/web`;

// Docs: https://rsbuild.rs/config/
export default defineConfig({

  plugins: [
    pluginPreact(),
    pluginLess(),
  ],

  source: {
    include: [/node_modules/],
    entry: {
      index: {
        import: './src/runtime-entry.ts',
      },
    },
  },
  html: {
    template: './demo/index.html',
    inject: 'body',
    scriptLoading: 'blocking',
    tags: [
      {
        tag: 'script',
        append: true,
        head: false,
        // 自动执行脚本，用于测试
        children: `

          // 内置白屏检测
          // 例如 检测 类似脚本异常，导致的root 不可渲染 SyntaxError: Unexpected token
          alert(window.WebDevTools);
          if (window.WebDevTools) {
            window.WebDevTools.startMonitor({
              debug: true,
              whiteScreen: {
                root: '#root',
                placeholder: '页面加载白屏',
              }
            })
          }
        `,
      },
    ],
  },
  
  output: {
    distPath: 'web',
    assetPrefix: publicPath,
    inlineStyles: true,
    polyfill: 'off',
    // polyfill: 'entry',
    filename: {
      js: '[name].js',
    },
  },
  tools: {
    
    // swc: {
    //   jsc: {
    //     target: 'es5'
    //   },
    // },
    rspack: (config) => {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'async',
          minSize: 0,
          cacheGroups: {
            default: false,
            defaultVendors: false,
          },
        },
      };
      return config;
    },
  },
});
