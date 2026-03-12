import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
          borderRadius: 32
        }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0070f3" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="48" fill="none" stroke="url(#g)" strokeWidth="10" />
          <circle cx="80" cy="80" r="24" fill="#0b0f19" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

