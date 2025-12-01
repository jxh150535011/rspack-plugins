import React from 'react';
import { Iframe } from '../../theme/Iframe';
const isDev = process.env.NODE_ENV === 'development';

export const frontmatter = {
  // 声明布局类型
  pageType: 'custom',
};
export default function DemoPage() {
  if (isDev) {
    return (
      <div>运行 doc:vue2 访问 http://localhost:9081/vue2-test/index.html</div>
    )
  }
  return (
    <Iframe src="/vue2-test"></Iframe>
  );
}