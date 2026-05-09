import { join, resolve } from 'path';
import { md5, replaceImportPaths, mkdirAndClear } from '../utils';
import { writeFileSync } from 'fs';

import { PreactRunTimeTemplate } from './PreactRunTimeTemplate';

const root = process.cwd();

export interface RunTimeTemplateOptions {
  /** preact lib 目录 */
  libPath?: string;
  /** 启动构建目录 */
  setup?: string;
  /** 项目根目录 */
  root?: string;
  include?: string[];
  /** 支持的语言 */
  language?: string[]
}

export class RunTimeTemplate {
  options!: RunTimeTemplateOptions;
  output!: string;
  include!: string[];
  libPath?: string;
  language!: string[];
  languageSet!: Set<string>;
  constructor(options: RunTimeTemplateOptions) {
    this.options = options;
    this.output = resolve(root, './node_modules/.rspress-plugin-preact/preact');
    this.include = (options.include || []).concat([this.output]);
    this.libPath = options.libPath;
    this.language = options.language || ['preact'];
    this.languageSet = new Set(this.language);
  }
  clear() {
    mkdirAndClear(this.output)
  }
  generate(codeInfo: any) {

    const { code, language } = codeInfo;
    if (!this.languageSet.has(language)) {
      return;
    }
    const { root, setup, libPath } = this.options;
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
    return new PreactRunTimeTemplate({
      file,
      libPath,
      setup
    }).toString();
  }
}
