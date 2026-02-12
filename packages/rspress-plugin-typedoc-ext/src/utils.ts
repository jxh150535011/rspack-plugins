import { readdirSync, statSync } from 'fs';
import path from 'path';
export function transformModuleName(name: string) {
  return name.replace(/\//g, '_').replace(/-/g, '_');
}

export function getFilesSync(absoluteApiDir: string) {
  const files = readdirSync(absoluteApiDir);
  const filePaths = files.map(file => path.join(absoluteApiDir, file));
  const stats = filePaths.map(fp => statSync(fp));
  return stats.map((stat, index) => {
    return {
      name: files[index],
      path: filePaths[index],
      isDir: stat.isDirectory(),
    }
  })
}