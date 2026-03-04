// OrthoSolve SVG Logo Component
import React from 'react';

interface OrthoSolveLogoProps {
  width?: number | string;
  className?: string;
}

export default function OrthoSolveLogo({ width = 220, className = '' }: OrthoSolveLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 600"
      width={width}
      className={className}
      role="img"
      aria-label="ORTHOSOLVE logo"
    >
      <defs>
        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E57C6"/>
          <stop offset="100%" stopColor="#0B2A7A"/>
        </linearGradient>
        <mask id="ringMask">
          <rect width="100%" height="100%" fill="black"/>
          <circle cx="260" cy="300" r="145" fill="white"/>
          <circle cx="220" cy="335" r="55" fill="black"/>
        </mask>
        <clipPath id="outerClip">
          <circle cx="260" cy="300" r="145"/>
        </clipPath>
      </defs>

      <circle cx="260" cy="300" r="145" fill="url(#blueGrad)" mask="url(#ringMask)"/>

      <g clipPath="url(#outerClip)" mask="url(#ringMask)">
        <rect x="90" y="330" width="340" height="16" fill="#19B7FF"/>
        <rect x="90" y="355" width="340" height="16" fill="#14AFFF"/>
        <rect x="90" y="380" width="340" height="16" fill="#10A6FF"/>
        <rect x="90" y="405" width="340" height="16" fill="#0B9CFF"/>
        <rect x="90" y="430" width="340" height="16" fill="#0590FF"/>
      </g>

      <g fontFamily="Montserrat, Avenir, 'Helvetica Neue', Arial, sans-serif">
        <text x="470" y="290" fontSize="120" letterSpacing="6" fill="#1E4FC1" fontWeight="600">
          ORTHOSOLVE
        </text>
        <line x1="470" y1="352" x2="640" y2="352" stroke="#157AE6" strokeWidth="3" opacity="0.85"/>
        <line x1="1035" y1="352" x2="1205" y2="352" stroke="#157AE6" strokeWidth="3" opacity="0.85"/>
        <text x="840" y="365" fontSize="64" textAnchor="middle" letterSpacing="10" fill="#F2F6FF"
              fontFamily="Georgia, 'Times New Roman', Times, serif" fontWeight="500">
          EX OS MOTUS
        </text>
        <text x="840" y="440" fontSize="44" textAnchor="middle" letterSpacing="8" fill="#19B7FF" fontWeight="500">
          SCIENCE OF MOVEMENT
        </text>
      </g>
    </svg>
  );
}
