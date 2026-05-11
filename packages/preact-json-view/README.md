# preact-json-viewer

基于Preact的JSON查看器

```bash
pnpm install preact-json-viewer
```

```tsx
import { JsonViewer } from 'preact-json-viewer';

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
- 基于preact 框架渲染
- 样式仿造chrome devtools 中的json查看器
- 延迟渲染，意味着可以显示对象或数组
- 支持部分JavaScript字面量显示成原始值
  - String
  - Number、BigInt
  - Boolean
  - Date
  - RegExp


- 暂不支持
  - 暂不支持展开超大对象或数组
  - 暂不支持Map等类型展开
  - 暂不支持对于new Number、new Object 等JavaScript进行原始对象区分（全部转换为单值 toString()）