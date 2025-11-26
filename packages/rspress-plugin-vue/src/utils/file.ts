import { rm } from 'fs/promises';
import { rmSync, mkdirSync, existsSync } from 'fs';

export const rmAsync = async (dir?: string) => {
  if (!dir) {
    return;
  }
  return rm(dir, { recursive: true, force: true });
}

export const mkdirAndClear = (dir?: string) => {
  if (!dir) {
    return;
  }
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    return;
  }
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true })
}