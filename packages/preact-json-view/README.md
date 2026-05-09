# preact-json-viewer

基于Preact的JSON查看器

```bash
pnpm install preact-json-viewer
```

```tsx
import { JsonViewer } from 'preact-json-viewer';

const json = {
  array: [1, 2, 3],
  date: new Date(),
  object: {
    a: 1,
    b: 2,
  },
};

<JsonViewer json={json} />

```