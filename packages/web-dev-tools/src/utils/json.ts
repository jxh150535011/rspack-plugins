/** 
 * 空字符串 处理为 undefined
 * 
 * @param data 要解析的 JSON 字符串
 * @param defaultValue 默认值  data  为空值 或  JSON.parse(data) 解析失败)
 * @returns 解析后的 JSON 对象或默认值
 *  */
export const toJson = (data: any, defaultValue?: any) => {
  if (!data) return defaultValue;
  if (typeof data === 'object') {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
};
