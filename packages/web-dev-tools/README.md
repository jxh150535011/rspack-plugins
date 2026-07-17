# start

A lightweight debugging panel featuring a Chrome DevTools-inspired UI. It supports data reporting and allows reported data to be forwarded to a backend interface for in-depth analysis.

```bash
pnpm install web-debug-toolkit
```

## Example


【Recommendation】Web Runtime mode: package web-debug-toolkit into a single runtime bundle.

```tsx
<script src="https://unpkg.com/web-debug-toolkit@1.0.1/web/static/js/index.js" />

<script>
if (window.WebDebugToolkit) {
  window.WebDebugToolkit.startMonitor({
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



npm mode

```tsx
import { startMonitor } from 'web-debug-toolkit';


startMonitor({
  // enable debug
  debug: true,
  // enable whiteScreen
  whiteScreen: {
    root: '#root',
    placeholder: 'Not supported',
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