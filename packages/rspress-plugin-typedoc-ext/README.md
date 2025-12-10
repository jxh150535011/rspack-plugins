# rspress-plugin-typedoc-ext
- 对rspress-plugin-typedoc 的扩展
- 支持在统一个项目中，构建出多个api文档

```tsx
pluginTypeDocExt([
  {
    entryPoints: [
      './test-packages/utils-test/src/index.ts'
    ],
    outDir: './docs/utils-test'
  },
  {
    entryPoints: [
      './test-packages/utils-test/src/core.ts'
    ],
    outDir: './docs/utils-core'
  }
]),
```