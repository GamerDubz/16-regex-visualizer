interface LogoProps {
  className?: string
}

/**
 * Original mark: the two forward-slash regex delimiters — /pattern/ — redrawn
 * as a pair of corner-bracket registration marks, the way a technical
 * drawing frames the thing it measures. Pure geometry, no text, works at
 * favicon and hero scale alike.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M9 29 L17 5" />
        <path d="M17 5 L24 5" />
        <path d="M9 29 L2 29" />
        <path d="M23 29 L31 5" />
        <path d="M31 5 L38 5" />
        <path d="M23 29 L16 29" />
      </g>
    </svg>
  )
}
