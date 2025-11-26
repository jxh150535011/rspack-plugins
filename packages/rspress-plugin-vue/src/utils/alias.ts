import { fileURLToPath } from 'url';
import { dirname, resolve, extname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '../');
const anyQuote = `["']`;
const pathStringContent = `[^"'\r\n]+`;
const importString = `(?:${anyQuote}${pathStringContent}${anyQuote})`;
const funcStyle = `(?:\\b(?:import|require)\\s*\\(\\s*(\\/\\*.*\\*\\/\\s*)?${importString}\\s*\\))`;
const globalStyle = `(?:\\bimport\\s+${importString})`;
const globalMinimizedStyle = `(?:\\bimport${importString})`;
const fromStyle = `(?:\\bfrom\\s+${importString})`;
const fromMinimizedStyle = `(?:\\bfrom${importString})`;
const moduleStyle = `(?:\\bmodule\\s+${importString})`;
const importRegexString = `(?:${[
    funcStyle,
    globalStyle,
    globalMinimizedStyle,
    fromStyle,
    fromMinimizedStyle,
    moduleStyle
].join(`|`)})`;

const resolveFullPath = (sourceDir: string, importPath: string, ext?: string) => {
  if (!importPath.startsWith('.') ||
    ext && importPath.match(new RegExp(`\${ext}$`))) {
    return importPath;
  }
  const importExt = extname(importPath);
  if (ext && importExt !== ext) {
    const asFilePath = importPath.substring(0, importPath.length - importExt.length) + ext;
    return resolve(sourceDir, asFilePath);
  }
  return resolve(sourceDir, importPath);
};

export interface ReplaceImportPathsOptions {
  source: string;
  sourceDir: string;
  ext?: string;
}

export const replaceImportPaths = (options: ReplaceImportPathsOptions) => {
  const { source, sourceDir, ext } = options;
  return source.replace(new RegExp(importRegexString, 'g'), (importStatement) => {
    const stringRegex = new RegExp(`(?<pathWithQuotes>${anyQuote}(?<path>${pathStringContent})${anyQuote})`);
    return importStatement.replace(stringRegex, ($0, pathWithQuotes, path) => {
      const quote = pathWithQuotes[0];
      const fullPath = resolveFullPath(sourceDir, path, ext);
      return `${quote}${fullPath}${quote}`;
    });
  });
};