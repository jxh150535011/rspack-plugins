import path from 'node:path';
import type { RspressPlugin, NavItem } from '@rspress/core';
import { join, resolve, relative, dirname } from 'path';
import { existsSync, unlinkSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { glob }  from 'glob';

const root = process.cwd();

const mkdirAsync = async (dir: string) => {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

export interface PluginCopyOptionsCopyItem {
  from: string,
  to: string,
}

export interface PluginCopyOptions {
  entrys?: PluginCopyOptionsCopyItem[],
}

/** 
 * 用于拷贝迁移文档
 *  */
export function pluginCopy(options: PluginCopyOptions): RspressPlugin {
 
  const runCopy = async (item: PluginCopyOptionsCopyItem) => {
    const files = await glob(item.from, {
      cwd: root,
      absolute: true,
      dot: false,
    });

    const getOutputFile = (file: string, options: any) => {
      const keys = Object.keys(options);
      let output = item.to;
      for(let i = 0; i < keys.length; i++){
        const key = keys[i];
        output = output.replace(`[${key}]`, options[key]);
      }
      return output;
    }

    
    for(let i = 0; i < files.length; i++){
      const file = files[i];
      const ext = path.extname(file);
      const fileName = path.basename(file, ext);
      const output = getOutputFile(file, {
        name: fileName,
        ext,
      });

      const dir = dirname(output);
      await mkdirAsync(dir);
      const content = await readFile(file, 'utf-8');
      await writeFile(output, content, 'utf-8');
    }
  }


  return {
    name: 'plugin-copy',
    async config(config: any) {
      const entrys = options.entrys || [];
      for(let i = 0; i < entrys.length; i++){
        const item = entrys[i];
        await runCopy(item);
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