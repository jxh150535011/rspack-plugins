import path from 'node:path';
import type { RspressPlugin, NavItem } from '@rspress/core';
import { Application, TSConfigReader } from 'typedoc';
import { load } from 'typedoc-plugin-markdown';
import { patchGeneratedApiDocs } from './patch';
import { access, mkdir, writeFile, unlink, chmod } from 'node:fs/promises';
import { join, resolve, relative, dirname } from 'path';
import { existsSync, unlinkSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs';


const root = process.cwd();


const updateConfigEffect = async (config: any, baseRoute: string) => {
  // 2. Generate "api" nav bar
  config.themeConfig = config.themeConfig || {};
  config.themeConfig.nav = config.themeConfig.nav || [];
  const { nav } = config.themeConfig;

  const baseRoutePrefix = baseRoute.slice(0, baseRoute.length - 1); // /api

  // avoid that user config "api" in doc/_meta.json
  function isApiAlreadyInNav(navList: NavItem[]) {
    return navList.some(item => {
      if (
        'link' in item &&
        typeof item.link === 'string' &&
        item.link.startsWith(baseRoutePrefix)
      ) {
        return true;
      }
      return false;
    });
  }

  // Note: TypeDoc does not support i18n
  if (Array.isArray(nav)) {
    if (!isApiAlreadyInNav(nav)) {
      nav.push({
        text: 'API',
        link: baseRoute,
      });
    }
  } else if ('default' in nav) {
    if (!isApiAlreadyInNav(nav.default)) {
      nav.default.push({
        text: 'API',
        link: baseRoute,
      });
    }
  }
}

export interface PluginTypeDocExtOptions {
  entryPoints?: string[],
  outDir?: string,
  title?: string,
}

/** 
 * @rspress/plugin-typedoc 的插件 改造扩展
 * 一旦配置了 outDir 目录，就不能完全灵活定义
 *  */
export function pluginTypeDocExt(options: PluginTypeDocExtOptions): RspressPlugin {
  const outDir = options.outDir || '';

  const entryPoints = (options.entryPoints || []).map(entryPoint => resolve(root, entryPoint));

  const absoluteApiDir = resolve(root, outDir);
  // 删除这个几个文件夹
  ['functions', 'interfaces', 'types', '_meta.json'].forEach(async (name) => {
    const filePath = join(absoluteApiDir, name);
    if (existsSync(filePath)) {
      chmodSync(filePath, 0o777);
      // 删除这个文件夹
      rmSync(filePath, { recursive: true, force: true })
    }
  });
  if (!existsSync(absoluteApiDir)) {
    mkdirSync(absoluteApiDir, { recursive: true });
  }
  const metaJsonPath = path.join(absoluteApiDir, '_meta.json');
  writeFileSync(metaJsonPath, '[]');

  return {
    name: 'plugin-typedoc-ext',
    async config(config: any) {
      const app = new Application();
      const docRoot = config.root;
      // 必需输出到doc 目录中
      const relativeApiDir = relative(docRoot, outDir);
      // 这个文件夹输出的路由
      const apiPageRoute = `/${relativeApiDir.replace(/(^\/)|(\/$)/, '')}/`; // e.g: /api/

      app.options.addReader(new TSConfigReader());
      load(app);


      app.bootstrap({
        name: options.title || '概要',
        entryPoints,
        theme: 'markdown',
        disableSources: true,
        readme: 'none',
        githubPages: false,
        requiredToBeDocumented: ['Class', 'Function', 'Interface'],
        plugin: ['typedoc-plugin-markdown'],
        // @ts-expect-error - FIXME: current version of MarkdownTheme has no export, bump related package versions
        hideBreadcrumbs: true,
        hideMembersSymbol: true,
        allReflectionsHaveOwnDocument: true,
        cleanOutputDir: false,
      });
      const project = app.convert();

      if (project) {
        // 1. Generate doc/api, doc/api/_meta.json by typedoc
        await app.generateDocs(project, absoluteApiDir);
        await patchGeneratedApiDocs(absoluteApiDir);
      }

      await updateConfigEffect(config, apiPageRoute);

      return config;
    },
    // @ts-ignore
    async beforeBuild(config, isProd: boolean) {

      
    },
    // @ts-ignore
    async afterBuild(config, isProd: boolean) {

    },
  };
}