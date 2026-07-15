# web-dev-tools

A lightweight debugging panel featuring a Chrome DevTools-inspired UI. It supports data reporting and allows reported data to be forwarded to a backend interface for in-depth analysis.

```bash
pnpm install web-dev-tools
```

## Example


【Recommendation】Web Runtime mode: package web-dev-tools into a single runtime bundle.

```tsx
<script src="https://unpkg.com/web-dev-tools@1.0.0/web/index.js" />

<script>
if (window.WebDevTools) {
  window.WebDevTools.startMonitor({
    debug: true,
    // If there is a reporting/upload service, the server-side needs to be deployed. 
    // Server-side services are not currently provided.
    // endpoint: 'http://localhost:3000',
    whiteScreen: {
      root: '#app',
      placeholder: '<div style="position: absolute;width: 100%;text-align: center;top: 45%;">白屏</div>',
    }
  })
}
</script>
```



npm 模式

```tsx
import { startMonitor } from 'web-dev-tools';


startMonitor({
  // enable debug
  debug: true,
  // enable whiteScreen
  whiteScreen: {
    root: '#root',
    placeholder: '白屏',
  },
  // If there is a reporting/upload service, the server-side needs to be deployed. 
  // Server-side services are not currently provided.
  // endpoint: 'http://localhost:3000',
});

```

![img](https://cdn.jsdelivr.net/gh/jxh150535011/jxh150535011.github.io@master/demo/images/web-dev-tools.png)

## Features

- Runtime bundling — minimal blocking on the main entry point (size: 36kb, gzip: 12kb)
- Built-in data reporting — when paired with the server-side component built alongside, you can visualize reported data
- Dev Tools debugging mode support (TBD)


## Current Limitations

- Currently only captures request/response content for Ajax APIs