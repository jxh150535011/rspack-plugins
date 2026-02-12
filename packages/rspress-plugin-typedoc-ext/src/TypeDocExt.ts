import { existsSync, unlinkSync, mkdirSync, writeFileSync, chmodSync, rmSync, readFileSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'path';


import { Application, TSConfigReader } from 'typedoc';
import { load } from 'typedoc-plugin-markdown';
import { patchGeneratedApiDocs } from './patch';

const root = process.cwd();

export interface TypeDocExtOptions {
  entryPoints?: string[];
  outDir: string;
  title?: string;
  docRoot: string;
  enable?: boolean;
  typeDocOptions?: any;
}
export class TypeDocExt {
  public options!: TypeDocExtOptions;
  public entryPoints!: string[];
  public root!: string;
  public docRoot!: string;
  public absoluteApiDir!: string;
  public relativeApiDir!: string;
  public apiPageRoute!: string;
  public enable!: boolean;

  constructor(options: TypeDocExtOptions) {
    this.options = options;
    this.root = root;
    this.enable = options.enable === false ? false: true;
    this.docRoot = options.docRoot;
    this.entryPoints = (options.entryPoints || []).map(entryPoint => resolve(this.root, entryPoint));
    this.absoluteApiDir = resolve(root, options.outDir);
    // 必需输出到doc 目录中
    this.relativeApiDir = relative(this.docRoot, options.outDir);
    // 这个文件夹输出的路由
    this.apiPageRoute = `/${this.relativeApiDir.replace(/(^\/)|(\/$)/, '')}/`; // e.g: /api/
  }
  clear() {
    // 删除这个几个文件夹
    ['functions', 'interfaces', 'types', '_meta.json'].forEach(async (name) => {
      const filePath = join(this.absoluteApiDir, name);
      if (existsSync(filePath)) {
        chmodSync(filePath, 0o777);
        // 删除这个文件夹
        rmSync(filePath, { recursive: true, force: true })
      }
    });
    if (!existsSync(this.absoluteApiDir)) {
      mkdirSync(this.absoluteApiDir, { recursive: true });
    }
    const metaJsonPath = join(this.absoluteApiDir, '_meta.json');
    writeFileSync(metaJsonPath, '[]');
  }
  repair() {
    const metaJsonPath = join(this.absoluteApiDir, '_meta.json');
    const hasMeta = existsSync(metaJsonPath);
    if (!hasMeta) {
      return;
    }
    const meta = JSON.parse(readFileSync(metaJsonPath, 'utf-8'));
    if (meta instanceof Array) {
      for(let i = 0; i < meta.length; i++) {
        const item = typeof meta[i] === 'object' ? meta[i] : null;
        // if (!item && item)
        // 目前只有缺少目录 会报错
        if (item?.type === 'dir') {
          const dir = join(this.absoluteApiDir, item.name);
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
        }
      }
    }
  }
  init() {
    // 如果启用状态 就清空
    if (this.enable) {
      this.clear();
      return;
    }
    // 修复一下
    this.repair();
  }
  async bootstrap() {

    if (!this.enable) {
      return;
    }


   
  
  // // 📌 Markdown 输出配置
  // out: './docs',  // 输出目录，所有文件都将以 .md 格式输出
  
  // // 📌 重要：确保每个符号单独文件
  // allReflectionsHaveOwnDocument: true,  // 每个类/函数等生成独立 .md 文件
  
  // // 📌 可选但推荐的 Markdown 配置
  // hideBreadcrumbs: true,      // 隐藏面包屑导航
  // hideMembersSymbol: true,    // 隐藏成员符号
  // entryDocument: 'README.md', // 入口文档名称
  // hidePageHeader: false,      // 是否隐藏页头
  // hidePageTitle: false,       // 是否隐藏页面标题
  
  // // 其他配置...
  // name: this.options.title || '概要',
  // disableSources: true,
  // readme: 'none',
  // githubPages: false,
  // cleanOutputDir: false,

    const app = await Application.bootstrapWithPlugins({
      name: this.options.title || '概要',
      entryPoints: this.entryPoints,
      // theme: 'markdown',
      out: this.absoluteApiDir,
      // markdownItOptions: {
      //   fileExtension: '.md',
      // },
      // theme: 'typedoc-plugin-markdown',
      plugin: ['typedoc-plugin-markdown'],
      // disableSources: true,
      // readme: 'none',
      // githubPages: false,
      // requiredToBeDocumented: ['Class', 'Function', 'Interface'],
      // // @ts-expect-error - FIXME: current version of MarkdownTheme has no export, bump related package versions
      // hideBreadcrumbs: true,
      cleanOutputDir: false,
      ...this.options.typeDocOptions,
    })
    // const app = new Application();
    // app.options.addReader(new TSConfigReader());
    // load(app);

    // app.bootstrap({
    //   name: this.options.title || '概要',
    //   entryPoints: this.entryPoints,
    //   theme: 'markdown',
    //   disableSources: true,
    //   readme: 'none',
    //   githubPages: false,
    //   requiredToBeDocumented: ['Class', 'Function', 'Interface'],
    //   plugin: ['typedoc-plugin-markdown'],
    //   // @ts-expect-error - FIXME: current version of MarkdownTheme has no export, bump related package versions
    //   hideBreadcrumbs: true,
    //   cleanOutputDir: false,
    // });
    const project = await app.convert();
    if (!project) {
      process.exit(1);
    }

    if (project) {
      // 1. Generate doc/api, doc/api/_meta.json by typedoc
      await app.generateOutputs(project);
      await patchGeneratedApiDocs(this.absoluteApiDir);
    }
  }
}