import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { orderBy } from 'lodash-es';

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

export interface PatchGeneratedApiDocsOptions {
  absoluteApiDir: string;
  generateFiles: string[];
  entryFileName: string;
}

async function generateMetaJson(options: PatchGeneratedApiDocsOptions) {

  const { absoluteApiDir, generateFiles, entryFileName } = options;
  const files = await getFiles(absoluteApiDir);

  // 生成meta.json 文件
  let meta = files.map(file => {
    if (file.name === '_meta.json') {
      return;
    }
    return {
      type:  file.isDir ? 'dir' : 'file',
      label: file.name.slice(0, 1).toUpperCase() + file.name.slice(1),
      name: file.name,
    }
  }).filter(item => !!item);

  // 对 meta 进行排序 , 优先显示 entryFileName ， 之后是文件， 再文件夹
  meta = orderBy(meta, (item) => {
    if (entryFileName === item.name) {
      return 0;
    }
    if (item.type === 'file') {
      return 1;
    }
    return 2
  });

  const includeSet = new Set(generateFiles)
  // 将其余的 目录加入到 摘要中
  const appendMeta = meta.filter(item => includeSet.has(item.name));

  const contents = await Promise.all(appendMeta.map(async (item, index) => {
    const metaItem = appendMeta[index];
    if (metaItem.type === 'dir') {
      const dirPath = path.join(absoluteApiDir, metaItem.name);
      const files = await getFiles(dirPath);
      const fileItems = files.filter(file => !file.isDir);
      const dirName = item.name;

      const fileContents = fileItems.map(file => {
        const ext = path.extname(file.name);
        const name = path.basename(file.name, ext);
        return `- [${name}](./${dirName}/${file.name})`
      }).join('\n');

      return `### ${item.label}\n\n${fileContents}\n`
    } else {
      return `### ${item.label}\n\n- [${item.name}](./${item.name})\n`
    }
  }));

  // apppendContent 新增的文案内容
  return {
    apppendContent: contents.join('\n'),
    meta,
  }
}



export async function patchGeneratedApiDocs(options: PatchGeneratedApiDocsOptions) {

  const { absoluteApiDir, generateFiles, entryFileName } = options;

  await patchLinks(absoluteApiDir);
  const metaJsonPath = path.join(absoluteApiDir, '_meta.json');
  const { apppendContent, meta } = await generateMetaJson(options);


  const entryFileNamePath = path.join(absoluteApiDir, entryFileName);
  let content;
  const hasEntryFile = existsSync(entryFileNamePath);
  if (hasEntryFile) {
    content = await fs.readFile(entryFileNamePath, 'utf-8');
  }
  const newContent = [
    content || '',
    '',
    apppendContent
  ].join('\n');
  await fs.writeFile(entryFileNamePath, newContent);
  await fs.writeFile(metaJsonPath, JSON.stringify(meta, null, 2));
}