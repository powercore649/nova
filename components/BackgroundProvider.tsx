'use client';

import { useEffect, useState } from 'react';

export default function BackgroundProvider() {
  const [bgUrl, setBgUrl] = useState('');
  const [opacity, setOpacity] = useState(0.15);
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        const url: string = data?.settings?.backgroundUrl || '';
        const op: number = typeof data?.settings?.backgroundOpacity === 'number'
          ? data.settings.backgroundOpacity
          : 0.15;
        setOpacity(op);

        if (!url) return;

        // If it's a data URL (base64), convert to blob URL to avoid huge inline style
        if (url.startsWith('data:')) {
          try {
            const [header, base64] = url.split(',');
            const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
            const binary = atob(base64);
            const arr = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
            const blob = new Blob([arr], { type: mime });
            const blobUrl = URL.createObjectURL(blob);
            setObjectUrl(blobUrl);
          } catch {
            setBgUrl(url);
          }
        } else {
          setBgUrl(url);
        }
      })
      .catch(() => {});

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const src = objectUrl || bgUrl;
  if (!src) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
}
