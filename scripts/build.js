import { glob }  from 'glob';
import dotenv from 'dotenv';
import { resolve, dirname, basename } from 'path';
import { existsSync } from 'fs';
import { readFile, stat, mkdir, copyFile, rm, readdir, writeFile } from 'fs/promises';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { getLatestTag, getPackage } from './utils.js';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const md5 = (content) => {
  const hash = createHash('md5');
  hash.update(content);
  return hash.digest('hex');
}

/** 获取全年范围内小时偏移量 */
const getHourOffset = (date) => {
  const offset = date.getTime() - new Date(date.getFullYear(), 0, 1, 0, 0, 0).getTime();
  return Math.floor(offset / (1000 * 60 * 60));
}

/** 生成版本号 */
const genVersion = () => {
  if (process.env.VERSION === 'package') {
    return;
  }
  // 如果是开发环境，版本号规则为 1.0.0-beta.1.hash
  if (!isProd) {
    const version = process.env.VERSION || '1.0.0';
    const timestamp = new Date().getTime();
    // 获取一年当中的第几天
    const date = new Date();
    // nodejs 
    const hash = md5(version + String(date.getTime())).substring(0, 4);
    const hour = getHourOffset(date);
    // {前置版本}-{测试版标识}-{年份}.{全年小时偏移量}.{hash}
    // 1.0.0-beta-24.23445.abcd;
    return `${version}-beta-${String(date.getFullYear()).substring(2)}.${hour}.${hash}`;
  }
  // 正式环境版本，基于git tag  来生成
  return getLatestTag();
}

const buildConfig = {
  root: process.cwd(),
  packageDir: process.env.PACKAGES_DIR,
  packageOutputDir: process.env.PACKAGES_OUTPUT_DIR,
  version: genVersion()
};

const mkdirAsync = async (dir) => {
  if (existsSync(dir)) {
    return dir;
  }
  await mkdir(dir, { recursive: true });
  return dir;
}


/** 支持批量拷贝文件夹 */
const copyFileAsync = async (src, dest, options) => {
  const stats = options?.stats || await stat(src);
  if (stats.isFile()) {
    await copyFile(src, dest);
    return;
  }
  await mkdirAsync(dest);
  const entries = await readdir(src, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    await copyFileAsync(srcPath, destPath, {
      stats: entry,
    });
  }));
}




/** 获取这些模块的依赖（仅针对含有workspace的依赖） */
const getDependencies = (pkg) => {
  const dependencies = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  const keys = Object.keys(dependencies);
  return keys.filter((key) => {
    const version = dependencies[key];
    return version && version.startsWith('workspace:');
  }).reduce((acc, key) => {
    acc[key] = dependencies[key];
    return acc;
  }, {});
}


const getAnalyzeDependencies = async (packages) => {
  // 访问记录会被有序添加
  const visibleSet = new Set();
  const packagesMap = new Map(packages.map((item) => [item.name, item]));
  const dfs = (packageName, historySet) => {
    if (historySet.has(packageName)) {
      throw new Error(`循环依赖: ${packageName}`);
    }
    // 获取模块依赖
    const dependencieKeys = Object.keys(packagesMap.get(packageName)?.dependencies || {});
    historySet.add(packageName);
    // 过滤出已被其他模块依赖的模块， 不需要重复添加访问
    const unVisitedDependencieKeys = dependencieKeys.filter((key) => !visibleSet.has(key));
    for(let i = 0; i < unVisitedDependencieKeys.length; i++) {
      dfs(unVisitedDependencieKeys[i], historySet);
    }
    visibleSet.add(packageName);
    historySet.delete(packageName);
  }

  for (const item of packages) {
    if (!visibleSet.has(item.name)) {
      dfs(item.name, new Set());
    }
  }
  // 获取模块依赖链路次数
  const keys = Array.from(visibleSet.values());
  
  return keys.map((key) => packagesMap.get(key)).filter(p => !!p);
}

const buildModule = async (item) => {
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: item.dir,
    stdio: 'inherit',
  });
  if (result.status) {
    process.exit(result.status);
  }
};

/** 解析模块返回依赖关系列表 */
const getAnalyzePackages = async (dirs) => {
  // 找到所有的模块
  let packages = await Promise.all(dirs.map(async (dir) => {
    const pkg = await getPackage(dir);
    if (!pkg) {
      return;
    }
    return {
      name: pkg.name,
      pkg,
      dir,
      dependencies: getDependencies(pkg),
    };
  }));
  packages = packages.filter(p => !!p)

  // 构建依赖次序, 索引最小的为根模块，不依赖于取其他模块， 如果发现模块循环依赖，即使报错

  packages = await getAnalyzeDependencies(packages);

  return packages;

};


const copyBuildModule = async (item, config, packages) => {
  const output = resolve(config.packageOutputDir, basename(item.dir));
  await mkdirAsync(output);

  const fileRules = [
    'package.json',
    'README.md',
  ].concat(item.pkg.files || []);

  const files = await glob(fileRules, {
    cwd: item.dir,
  });

  // 批量拷贝这些文件
  await Promise.all(files.map(async (file) => {
    const src = resolve(item.dir, file);
    const stats = await stat(src);
    const dest = resolve(output, file);
    await copyFileAsync(src, dest);
  }));

  // 重新设置package.json
  const newPkg = {
    ...item.pkg,
    name: item.name,
    version: config.version || item.pkg.version,
    private: false,
    dependencies: {
      ...item.pkg.dependencies,
    },
    devDependencies: {
      ...item.pkg.devDependencies,
    },
    // 不做文件路口嗅探 ，默认直接重新设置
    main: './cjs/index.js',
    types: './es/index.d.ts',
    module: './esm/index.js',
    publishConfig: {
      registry: config.publishRegistry,
    },
  };

  // 对所有的 packages 匹配依赖模块，重新设置版本依赖
  const dependencies = newPkg.dependencies;
  const devDependencies = newPkg.devDependencies;
  for (let i = 0; i < packages.length; i++) {
    const item = packages[i];
    if (newPkg.dependencies[item.name]) {
      newPkg.dependencies[item.name] = config.version;
    }
    if (newPkg.devDependencies[item.name]) {
      newPkg.devDependencies[item.name] = config.version;
    }
  }
  // 重新写入package.json
  await writeFile(resolve(output, 'package.json'), JSON.stringify(newPkg, null, 2), 'utf-8');

};

/** 开始拷贝模块 并调整版本号 */
const copyPackages = async (packages, config) => {
  await rm(config.packageOutputDir, { recursive: true, force: true });
  await mkdirAsync(config.packageOutputDir);
  await Promise.all(packages.map(async (item) => {
    await copyBuildModule(item, config, packages);
  }));
}


const run = async (config) => {
  const files = await glob(config.packageDir, {
    absolute: true,
  });
  const packages = await getAnalyzePackages(files);

  for(let i = 0; i < packages.length; i++) {
    const item = packages[i];
    console.log(`${i + 1} / ${packages.length} 开始编译模块:${item.name}`);
    await buildModule(item);
  }

  console.log('开始设置模块版本号');
  await copyPackages(packages, config);
  console.log(`模块编译完成`);
};

run(buildConfig);
