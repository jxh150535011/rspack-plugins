
import 'core-js/es/object/has-own';
import 'core-js/es/array/flat-map';

import { startMonitor } from './index';
// @ts-ignore
window.WebDevTools = {
  startMonitor,
}