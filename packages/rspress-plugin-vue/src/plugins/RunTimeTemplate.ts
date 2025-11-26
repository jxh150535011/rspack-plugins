import { join, resolve } from 'path';
import { md5, replaceImportPaths, mkdirAndClear } from '../utils';
import { writeFileSync } from 'fs';

import { Vue2RunTimeTemplate } from './Vue2RunTimeTemplate';
import { Vue3RunTimeTemplate } from './Vue3RunTimeTemplate';

const root = process.cwd();

export interface RunTimeTemplateOptions {
  /** 编译模式 */
  mode?: 'vue2' | 'vue3',
  /** vue lib 目录 */
  vuePath?: string;
  /** 启动构建目录 */
  setup?: string;
  /** 项目根目录 */
  root?: string;
  include?: string[];
  vueLoaderOptions?: any;
}

export class RunTimeTemplate {
  options!: RunTimeTemplateOptions;
  output!: string;
  include!: string[];
  mode!: string;
  vueLoaderOptions?: any;
  vuePath?: string;
  constructor(options: RunTimeTemplateOptions) {
    this.options = options;
    this.mode = options.mode || 'vue3';
    this.output = resolve(root, './node_modules/.rspress-plugin-vue/' + this.mode);
    this.include = (options.include || []).concat([this.output]);
    this.vueLoaderOptions = options.vueLoaderOptions;
    this.vuePath = options.vuePath;
  }
  clear() {
    mkdirAndClear(this.output)
  }
  generate(codeInfo: any) {

    const { code, language } = codeInfo;
    if (this.mode !== language) {
      return;
    }
    const { root, setup, vuePath } = this.options;
    const output = this.output;
    let source = code;
    if (root) {
      source = replaceImportPaths({
        source: code || '',
        sourceDir: root
      });
    }
    const ext = /<template>/.test(source) ? `.vue` : '.tsx';
    
    const file = join(output, md5(source) + ext);
    writeFileSync(file, source, 'utf-8');
    if (this.mode === 'vue2') {
      return new Vue2RunTimeTemplate({
        file,
        vuePath,
        setup
      }).toString();
    }
    return new Vue3RunTimeTemplate({
      file,
      vuePath,
      setup
    }).toString();
  }
}
