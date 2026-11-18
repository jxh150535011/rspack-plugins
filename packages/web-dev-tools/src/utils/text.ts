export async function copyText(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch(e) {
      const success = execCommandCopy(text);
      return success;
    }
  }
  return execCommandCopy(text);
}

/**
 * 使用 execCommand 复制（兼容性最好）
 */
function execCommandCopy(text: string) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // 设置样式使其不可见
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.style.zIndex = '-1';
    document.body.appendChild(textarea);
    // 选中文本
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    // 执行复制 
    const success = document.execCommand('copy');
    // 清理
    document.body.removeChild(textarea);
    
    return success;
  } catch (error) {
    console.error('execCommand 复制失败:', error);
    return false;
  }
}