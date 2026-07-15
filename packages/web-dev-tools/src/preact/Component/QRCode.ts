import { useState, useRef, useLayoutEffect } from 'preact/hooks';
import { html } from 'htm/preact';
// import qrcode from 'qrcode';

export interface QRCodeProps {
  value: string;
  size?: number;
  logoText?: string;
}


export const QRCode = (props: QRCodeProps) => {
  const { value, size = 200, logoText } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const style = {
    width: size + 'px',
    height: size + 'px',
  }

  useLayoutEffect(() => {
    const $canvas = canvasRef.current;
    if (!$canvas) {
      return;
    }

    // qrcode.toCanvas($canvas, value, {
    //   width: size * 2,
    //   errorCorrectionLevel: 'H',
    //   scale: 2,
    //   margin: 1
    // }, () => {

    //   $canvas.style.width = size + 'px';
    //   $canvas.style.height = size + 'px';

    //   const ctx: any = $canvas.getContext('2d');
    //   const logoSize = Math.floor($canvas.width * 0.28); // Logo 占比
    //   const x = ($canvas.width - logoSize) / 2;
    //   const y = ($canvas.height - logoSize) / 2;
    //   ctx.fillStyle = '#ffffff';
    //   ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8); // 加白边

    //   ctx.fillStyle = '#000000';
    //   ctx.font = 'bold 32px Arial';
    //   ctx.textAlign = 'center'; 
    //   ctx.textBaseline = 'middle';
    //   ctx.fillText(logoText, x + logoSize / 2, y + logoSize / 2);

    // });
  }, [value, logoText, size]);

  return html`
    <div className="__vm_qrcode" style=${style}>
      <canvas ref=${canvasRef} />
    </div>
  `;
}