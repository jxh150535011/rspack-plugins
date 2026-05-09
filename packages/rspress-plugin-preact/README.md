
## 支rspress 构建 vue

- 仅支持.vue 文件
- 支持vue2、vue3 但是同时只能构建一个版本

## 说明

依赖 pluginPreview 插件


```tsx

import { createRepressPluginVue } from './packages/rspress-plugin-vue';

const root = process.cwd();

## 下面以vue2为例

const repressPluginVue2 = createRepressPluginVue({
  mode: 'vue2',
  vuePath: resolve(root, './test-packages/vue2-test/node_modules/vue/dist/vue.esm.js'),
  include: [
    resolve(root, './test-packages/vue2-test')
  ],
})

const repressPluginVue3 = createRepressPluginVue({
  mode: 'vue3',
  vuePath: resolve(root, './test-packages/vue3-test/node_modules/vue'),
  include: [
    resolve(root, './test-packages/vue3-test')
  ],
})

plugins: [
  pluginPreview({
    previewLanguages: [...repressPluginVue2.language],
    previewCodeTransform(codeInfo) {
      const content = repressPluginVue2.previewCodeTransform(codeInfo);
      if (content) {
        return content;
      }
      return codeInfo.code
    },
  }),
  repressPluginVue2.plugin,
],
```

## issuse
[issuse](https://github.com/jxh150535011/rspress-plugin-vue/issues)