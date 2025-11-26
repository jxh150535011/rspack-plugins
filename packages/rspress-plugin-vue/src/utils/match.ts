import { resolve, dirname } from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import micromatch from 'micromatch';
const __dir = dirname(fileURLToPath(import.meta.url));
export const pluginRoot = resolve(__dir, '../../');


const genRegExp = (str: any, root: string) => {
  if (str instanceof RegExp) {
    return str;
  }
  return micromatch.makeRe(resolve(root, str), {
    cwd: root
  });
};

export interface CreatePathToPatternOptions {
  root: string;
  include: any[];
  exclude: any[]
}


export const createPathToPattern = (options: CreatePathToPatternOptions) => {
  const { root, include = [], exclude = [] } = options;
  const includeRegExps = include.map((str) => genRegExp(str, root));
  const excludeRegExps = exclude.map((str) => genRegExp(str, root));
  return {
    include: includeRegExps,
    exclude: excludeRegExps,
    match: (file: string) => {
      let flag = true;
      if (includeRegExps.length) {
          flag = includeRegExps.some((pattern) => pattern.test(file));
      }
      if (flag && excludeRegExps.length) {
          return !excludeRegExps.some((pattern) => pattern.test(file));
      }
      return flag;
    }
  };
};


export const md5 = (context: any) => {
  return crypto.createHash('md5').update(context).digest('hex');
};