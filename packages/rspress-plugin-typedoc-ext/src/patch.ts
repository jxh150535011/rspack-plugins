import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

async function patchLinks(outputDir: string) {
  // Patch links in markdown files
  // Scan all the markdown files in the output directory
  // replace
  // 1. [foo](bar) -> [foo](./bar)
  // 2. [foo](./bar) -> [foo](./bar) no change
  // 3. [foo](http(s)://...) -> [foo](http(s)://...) no change
  const normalizeLinksInFile = async (filePath: string) => {
    const content = await fs.readFile(filePath, 'utf-8');
    // 1. [foo](bar) -> [foo](./bar)
    const newContent = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, p1, p2) => {
        if (
          // 2. [foo](./bar) -> [foo](./bar) no change
          ['/', '.'].includes(p2[0]) ||
          // 3. [foo](http(s)://...) -> [foo](http(s)://...) no change
          p2.startsWith('http://') ||
          p2.startsWith('https://')
        ) {
          return `[${p1}](${p2})`;
        }
        return `[${p1}](./${p2})`;
      },
    );
    await fs.writeFile(filePath, newContent);
  };

  const traverse = async (dir: string) => {
    const files = await fs.readdir(dir);
    const filePaths = files.map(file => path.join(dir, file));
    const stats = await Promise.all(filePaths.map(fp => fs.stat(fp)));

    await Promise.all(
      stats.map((stat, index) => {
        const file = files[index];
        const filePath = filePaths[index];
        if (stat.isDirectory()) {
          return traverse(filePath);
        }
        if (stat.isFile() && /\.mdx?/.test(file)) {
          return normalizeLinksInFile(filePath);
        }
      }),
    );
  };
  await traverse(outputDir);
}

async function getFiles(absoluteApiDir: string) {
  const files = await fs.readdir(absoluteApiDir);
  const filePaths = files.map(file => path.join(absoluteApiDir, file));
  const stats = await Promise.all(filePaths.map(fp => fs.stat(fp)));
  return stats.map((stat, index) => {
    return {
      name: files[index],
      path: filePaths[index],
      isDir: stat.isDirectory(),
    }
  })
}

async function generateMetaJson(absoluteApiDir: string) {

  const files = await getFiles(absoluteApiDir);
  const dirs = files.filter(item => item.isDir).map(item => item.name);

  const meta = dirs.map(dir => ({
    type: 'dir',
    label: dir.slice(0, 1).toUpperCase() + dir.slice(1),
    name: dir,
  }));

  // 读取不存在的目录，排出掉 
  // functions , interfaces, types

  const excludeSet = new Set(['functions', 'interfaces', 'types'])
  const excludeDirItems = meta.filter(item => !excludeSet.has(item.name));

  const contents = await Promise.all(excludeDirItems.map(async (item, index) => {
    const dirPath = path.join(absoluteApiDir, dirs[index]);
    const files = await getFiles(dirPath);
    const fileItems = files.filter(file => !file.isDir);
    const dirName = item.name;

    const fileContents = fileItems.map(file => {
      const ext = path.extname(file.name);
      const name = path.basename(file.name, ext);
      return `- [${name}](./${dirName}/${file.name})`
    }).join('\n');

    return `### ${item.label}\n\n${fileContents}\n`
  }));

  // apppendContent 新增的文案内容
  return {
    apppendContent: contents.join('\n'),
    meta: ['index', ...meta],
  }
}

export async function patchGeneratedApiDocs(absoluteApiDir: string) {
  await patchLinks(absoluteApiDir);
  const metaJsonPath = path.join(absoluteApiDir, '_meta.json');
  const { apppendContent, meta } = await generateMetaJson(absoluteApiDir);


  const readeMePath = path.join(absoluteApiDir, 'README.md');
  let content;
  const hasExists = existsSync(readeMePath);
  if (hasExists) {
    content = await fs.readFile(readeMePath, 'utf-8');
  }
  const newContent = (content || '').replace('## Table of contents\n', [
    '## Table of contents',
    '',
    apppendContent
  ].join('\n'));
  await fs.writeFile(path.join(absoluteApiDir, 'index.md'), newContent);
  if (hasExists) {
    await fs.unlink(path.join(absoluteApiDir, 'README.md'));
  }
  
  // Delete .nojekyll file if it exists
  const nojekyllPath = path.join(absoluteApiDir, '.nojekyll');
  if (existsSync(nojekyllPath)) {
    await fs.unlink(nojekyllPath);
  }
  
  await fs.writeFile(metaJsonPath, JSON.stringify(meta, null, 2));
}