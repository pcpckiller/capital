import { ImageResponse } from 'next/og';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

export default function Icon() {
  const r = 18;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent'
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0070f3" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="36" height="36" rx="8" fill="none" stroke="url(#g)" strokeOpacity="0.4" strokeWidth="2" />
          <circle cx="24" cy="24" r={r} fill="none" stroke="url(#g)" strokeWidth="4" />
          <circle cx="24" cy="24" r="9" fill="#0b0f19" fillOpacity="0.7" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

