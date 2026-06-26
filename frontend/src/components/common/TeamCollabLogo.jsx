/**
 * Studios Logo — A modern geometric "S" monogram with interconnected nodes
 * symbolizing collaboration and creative studio culture.
 */
export default function StudiosLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="studioLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbd98a" />
          <stop offset="50%" stopColor="#e8912e" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="studioNodeGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fdecc3" />
          <stop offset="100%" stopColor="#fbd98a" />
        </linearGradient>
      </defs>

      {/* Connection lines — represents collaboration */}
      <path d="M6 10 L26 10" stroke="url(#studioNodeGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M6 10 L16 26" stroke="url(#studioNodeGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M26 10 L16 26" stroke="url(#studioNodeGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M8 16 L24 16" stroke="url(#studioNodeGrad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <path d="M12 22 L20 22" stroke="url(#studioNodeGrad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />

      {/* S — elegant flowing curve */}
      <path
        d="M22 7 C22 7, 26 9, 26 13 C26 17, 22 17, 20 17 C18 17, 14 17, 14 21 C14 25, 18 27, 20 27 C22 27, 26 25, 26 23"
        stroke="url(#studioLogoGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Collaboration nodes */}
      <circle cx="6" cy="10" r="2" fill="white" opacity="0.9" />
      <circle cx="26" cy="10" r="2" fill="white" opacity="0.9" />
      <circle cx="16" cy="26" r="2" fill="white" opacity="0.9" />
      <circle cx="8" cy="16" r="1.5" fill="white" opacity="0.6" />
      <circle cx="24" cy="16" r="1.5" fill="white" opacity="0.6" />
      <circle cx="12" cy="22" r="1.2" fill="white" opacity="0.5" />
      <circle cx="20" cy="22" r="1.2" fill="white" opacity="0.5" />
    </svg>
  )
}
