/** 尝试转换为 URL 对象 */
export const tryToURL = (url?: string) => {
  try {
    // @ts-ignore
    return new URL(url);
  } catch (e) {
    return null;
  }
}