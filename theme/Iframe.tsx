import React from 'react';

export interface IframeProps {
  src: string;
}
export const Iframe = (props: IframeProps) => {
  return (
    <div className="webview-iframe">
      {/* @ts-ignore */}
      <iframe src="/iframe-vue2-test"></iframe>
    </div>
  );
}