import { execSync } from 'child_process';
import { resolve } from 'path';
import { stat, readFile } from 'fs/promises';

export function getLatestTag() {
  try {
    const tag = execSync('git describe --tags --abbrev=0').toString().trim();
    return tag;
  } catch (error) {
    console.error('获取最新tag失败:', error);
  }
}

export const getPackage = async (dir) => {
  const file = resolve(dir, 'package.json');
  const stats = await stat(file);
  if (!stats.isFile()) {
    return null;
  }
  const content = await readFile(file, 'utf-8');
  return JSON.parse(content);
}