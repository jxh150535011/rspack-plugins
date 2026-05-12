# preact-tiny-json-view

A Preact-based JSON viewer with Chrome DevTools-like styling. Supports lazy rendering for large objects/arrays and friendly display of common JavaScript literals.

```bash
pnpm install preact-tiny-json-view
```

## Example

```tsx
import { JsonView } from 'preact-tiny-json-view';

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

<JsonView json={json} />

```
![img](https://github.com/user-attachments/assets/80f2b0ef-2827-440a-a857-988b2bb16dbf)

## Features

- Built with Preact, lightweight and performant
- Chrome DevTools-inspired styling for better developer experience
- Lazy rendering to support large objects or arrays
- Displays common JavaScript literals as primitive values, including:
  - String
  - Number、BigInt
  - Boolean
  - Date
  - RegExp


## Current Limitations

- Cannot expand extremely large objects or arrays
- Does not support expanding types like Map
- Wrapper objects like new Number or new Object are not distinguished;