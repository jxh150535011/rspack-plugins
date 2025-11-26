import { glob }  from 'glob';
import dotenv from 'dotenv';
import { resolve, dirname, basename } from 'path';
import { existsSync } from 'fs';
import { readFile, stat, mkdir, copyFile, rm, readdir, writeFile } from 'fs/promises';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { getPackage } from './utils.js';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const depolyConfig = {
  root: process.cwd(),
  packageDir: process.env.PACKAGES_DIR,
  publishRegistry: process.env.PUBLISH_REGISTRY,
  packageOutputDir: process.env.PACKAGES_OUTPUT_DIR,
};

console.log('depolyConfig', depolyConfig);

const publish = async (moduleRoot, pkg, config) => {
  const cmd = ['publish'];
  if (config.publishRegistry) {
    cmd.push('--registry');
    cmd.push(config.publishRegistry);
  }
  if (!isProd) {
    cmd.push('--tag');
    cmd.push('beta');
  }

  const publishResult = spawnSync('npm', cmd, {
    cwd: moduleRoot,
    stdio: 'inherit',
  });
  if (publishResult.status) {
    process.exit(publishResult.status);
  }
}

const run = async (config) => {

  // 需要推送的模块 根目录
  const packageRoot = resolve(config.root, config.packageOutputDir);
  const fileNames = await readdir(packageRoot, { withFileTypes: false });
  for(let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    const moduleRoot = resolve(packageRoot, fileName);
    const pkg = await getPackage(moduleRoot);
    console.log(`${i + 1} / ${fileNames.length} 开始发布模块:${pkg.name}`);
    await publish(moduleRoot, pkg, config);
  }
  console.log(`模块推送完成`);
};

run(depolyConfig);