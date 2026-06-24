/**
 * Team Collab Logo — A modern geometric "TC" monogram with interconnected nodes
 * symbolizing collaboration and teamwork.
 */
export default function TeamCollabLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background gradient definitions */}
      <defs>
        <linearGradient id="tcLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="tcNodeGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
      </defs>

      {/* Connection lines between nodes — represents collaboration */}
      <path d="M8 8 L24 8" stroke="url(#tcNodeGrad)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M8 8 L8 20" stroke="url(#tcNodeGrad)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M16 8 L16 24" stroke="url(#tcNodeGrad)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M16 24 L24 16" stroke="url(#tcNodeGrad)" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <path d="M8 8 L16 24" stroke="url(#tcNodeGrad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />

      {/* T — horizontal bar */}
      <rect x="5" y="5.5" width="22" height="4.5" rx="2.25" fill="url(#tcLogoGrad)" />
      {/* T — vertical stem */}
      <rect x="13.5" y="5.5" width="5" height="18" rx="2.5" fill="url(#tcLogoGrad)" />

      {/* C — open arc via path */}
      <path
        d="M26 18 C26 14, 24 11.5, 20 11.5"
        stroke="url(#tcLogoGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M26 18 C26 23, 23 26, 18 26"
        stroke="url(#tcLogoGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* Collaboration nodes */}
      <circle cx="8" cy="8" r="2.5" fill="white" opacity="0.95" />
      <circle cx="24" cy="8" r="2.5" fill="white" opacity="0.95" />
      <circle cx="16" cy="24" r="2.5" fill="white" opacity="0.95" />
      <circle cx="8" cy="20" r="1.8" fill="white" opacity="0.7" />
      <circle cx="24" cy="16" r="1.8" fill="white" opacity="0.7" />
    </svg>
  )
}
