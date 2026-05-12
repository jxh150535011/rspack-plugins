# preact-tiny-json-view

基于Preact的JSON查看器，风格仿照 Chrome DevTools，支持大对象/数组的延迟渲染与常见 JavaScript 字面量的友好展示。

```bash
pnpm install preact-tiny-json-view
```

## 示例

```tsx
import { JsonViewer } from 'preact-tiny-json-view';

const arrayn = new Array(400).fill(1);
const json = {
  array: [1, 2, 3],
  array2: [
    [1, 2],
    [3, 4]
  ],
  arrayn,
  dateObj: new Date(),
  obj: {
    'first-child': 'hello',
    'second-child': 'world',
    'last-child': null,
  },
  str: 'hello world',
  strObj: new String('hello world'),
  numObj: new Number(10086),
  num: 1000,
  bigintObj: BigInt(10086),
  bigint: 10086n,
  boolObj: new Boolean(true),
  regExpObj: new RegExp('hello'),
  regExp: /hello/,
};

<JsonViewer json={json} />

```

## 特性

- 基于preact 框架渲染
- 仿 Chrome DevTools 样式，开发体验友好
- 延迟渲染，支持显示大型对象或数组
- 支持常见 JavaScript 字面量展示为原始值，包括：
  - String
  - Number、BigInt
  - Boolean
  - Date
  - RegExp


## 当前限制

- 暂不支持展开超大对象或数组
- 暂不支持Map等类型展开
- 暂不支持对于new Number、new Object 等JavaScript进行原始对象区分（全部转换为单值 toString()）