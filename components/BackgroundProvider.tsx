'use client';

import { useEffect, useState } from 'react';

export default function BackgroundProvider() {
  const [bgUrl, setBgUrl] = useState('');
  const [opacity, setOpacity] = useState(0.15);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.settings?.backgroundUrl) {
          setBgUrl(data.settings.backgroundUrl);
        }
        if (typeof data?.settings?.backgroundOpacity === 'number') {
          setOpacity(data.settings.backgroundOpacity);
        }
      })
      .catch(() => {});
  }, []);

  if (!bgUrl) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
}
