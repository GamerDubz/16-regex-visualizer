import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

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
          background: '#0b1720',
          borderRadius: 32,
        }}
      >
        <svg width="120" height="96" viewBox="0 0 40 32" fill="none">
          <g stroke="#5fd4e8" strokeWidth={3.4} strokeLinecap="square" strokeLinejoin="miter">
            <path d="M9 27 L17 5" />
            <path d="M17 5 L24 5" />
            <path d="M9 27 L2 27" />
            <path d="M23 27 L31 5" />
            <path d="M31 5 L38 5" />
            <path d="M23 27 L16 27" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  )
}
