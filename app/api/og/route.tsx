import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'nova-browser';
  const description = searchParams.get('description') || 'Your premium gateway to legendary source code.';
  const accent = searchParams.get('accent') || '#22c55e';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '-200px',
          left: '-200px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
          display: 'flex',
        }} />

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '48px',
        }}>
          <div style={{
            fontSize: '22px',
            fontWeight: 800,
            color: accent,
            letterSpacing: '-0.03em',
          }}>
            nova-browser
          </div>
        </div>

        {/* Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div style={{
            padding: '6px 16px',
            borderRadius: '999px',
            border: `1px solid ${accent}44`,
            background: `${accent}15`,
            color: accent,
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
          }}>
            📦 Project
          </div>
        </div>

        {/* Title */}
        <div style={{
          fontSize: title.length > 40 ? '52px' : '64px',
          fontWeight: 800,
          color: '#f2f5f2',
          lineHeight: 1.1,
          marginBottom: '24px',
          letterSpacing: '-0.02em',
          maxWidth: '900px',
          display: 'flex',
          flexWrap: 'wrap',
        }}>
          {title}
        </div>

        {/* Description */}
        {description && (
          <div style={{
            fontSize: '22px',
            color: '#a3b8ab',
            lineHeight: 1.5,
            maxWidth: '800px',
            display: 'flex',
            flexWrap: 'wrap',
          }}>
            {description.slice(0, 120)}{description.length > 120 ? '…' : ''}
          </div>
        )}

        {/* Bottom bar */}
        <div style={{
          position: 'absolute',
          bottom: '48px',
          left: '60px',
          right: '60px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6b7d70',
            fontSize: '16px',
          }}>
            novacorpbumpify.dpdns.org
          </div>
          <div style={{
            width: '48px',
            height: '4px',
            borderRadius: '2px',
            background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
            display: 'flex',
          }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
