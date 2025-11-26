export default function(this: any, source: any) {
  const options = this.getOptions();
  const vuePath = options?.vuePath;
  // 通常是vue3 则进行替换
  // import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"
  if (!vuePath || !/\}\s+from\s+\"vue\"/.test(source)) {
    return source;
  }
  return source.replace(/\}\s+from\s+\"vue\"/g, `} from "${vuePath}"`)
};;