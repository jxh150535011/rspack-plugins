export const namespace = '__pjv';

export const classnames = (className: string | string[]) => {
  
  return `${namespace}-${className}`;
};