'use client';

import { useEffect, useRef } from 'react';

/**
 * Lightweight QR code generator using qrcode-generator algorithm
 * Loaded dynamically from a CDN script tag — no npm package needed.
 */

declare global {
  interface Window {
    qrcode?: any;
  }
}

interface Props {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

export default function QRCode({ value, size = 200, bgColor = '#080c09', fgColor = '#22c55e' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    function drawQR() {
      const canvas = canvasRef.current;
      if (!canvas || !window.qrcode) return;

      try {
        const qr = window.qrcode(0, 'M');
        qr.addData(value);
        qr.make();

        const moduleCount = qr.getModuleCount();
        const cellSize = Math.floor(size / moduleCount);
        const margin = Math.floor((size - cellSize * moduleCount) / 2);

        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        // Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Modules
        ctx.fillStyle = fgColor;
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              const x = margin + col * cellSize;
              const y = margin + row * cellSize;
              // Slightly rounded cells for aesthetics
              const r = Math.min(2, cellSize * 0.2);
              ctx.beginPath();
              ctx.roundRect(x, y, cellSize, cellSize, r);
              ctx.fill();
            }
          }
        }
      } catch (e) {
        console.error('QR generation failed', e);
      }
    }

    function loadScript() {
      if (window.qrcode) { drawQR(); return; }
      if (loadedRef.current) return;
      loadedRef.current = true;

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = () => {
        // qrcodejs sets window.QRCode, but we need qrcode-generator style
        // Use a different CDN that provides the functional API
        drawWithFallback();
      };
      script.onerror = () => drawWithFallback();
      document.head.appendChild(script);
    }

    function drawWithFallback() {
      // Use qrcode-generator from jsDelivr
      const canvas = canvasRef.current;
      if (!canvas) return;

      const script2 = document.createElement('script');
      script2.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
      script2.onload = drawQR;
      script2.onerror = () => {
        // Last resort: show text URL on canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = fgColor;
        ctx.font = `${size * 0.06}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('QR unavailable', size / 2, size / 2);
        ctx.fillText('(offline?)', size / 2, size / 2 + size * 0.1);
      };
      document.head.appendChild(script2);
    }

    loadScript();
  }, [value, size, bgColor, fgColor]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        borderRadius: 'var(--radius-md)',
        display: 'block',
        imageRendering: 'pixelated',
      }}
    />
  );
}
