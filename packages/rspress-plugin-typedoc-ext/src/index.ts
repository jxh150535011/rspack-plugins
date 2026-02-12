import path from 'node:path';
import type { RspressPlugin, NavItem } from '@rspress/core';

import { access, mkdir, writeFile, unlink, chmod } from 'node:fs/promises';
import { join, resolve, relative, dirname } from 'path';
import { existsSync, readFileSync, mkdirSync } from 'fs';

import { TypeDocExt } from './TypeDocExt';


const updateConfigEffect = (config: any, baseRoute: string) => {
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
  outDir: string,
  title?: string,
  typeDocOptions?: any,
  /** 是否启用， 默认为 true */
  enable?: boolean;
}

/** 
 * @rspress/plugin-typedoc 的插件 改造扩展
 * 一旦配置了 outDir 目录，就不能完全灵活定义
 *  */
export function pluginTypeDocExt(options: PluginTypeDocExtOptions | PluginTypeDocExtOptions[]): RspressPlugin {

  const entrys = options instanceof Array ? options : [options];

  return {
    name: 'plugin-typedoc-ext',
    async config(config: any) {

      const docRoot = config.root;
      const items = entrys.map(entry => {
        return new TypeDocExt({
          ...entry,
          docRoot,
        });
      }).filter(p => !!p)
      
      for(let i = 0; i < items.length; i++) {
        items[i].init();
      }
      await Promise.all(items.map(item => item.bootstrap()))


      for(let i = 0; i < items.length; i++) {
        updateConfigEffect(config, items[i].apiPageRoute)
      }

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