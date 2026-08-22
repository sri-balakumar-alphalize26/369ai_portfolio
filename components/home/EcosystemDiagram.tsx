/**
 * Replaces the generic stock photography the Odoo site used with something
 * that actually explains the product: how 369AI's pieces connect. The orange
 * growth arrow from the logo runs through the middle as the brand motif.
 * Pure inline SVG — scales crisply, weighs nothing, no licensing.
 */
export function EcosystemDiagram() {
  const nodes = [
    { label: 'POS', x: 34, y: 34 },
    { label: 'Vending', x: 246, y: 34 },
    { label: 'Robotics', x: 34, y: 274 },
    { label: 'Smart Locks', x: 246, y: 274 },
  ]

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <svg
        viewBox="0 0 380 360"
        role="img"
        aria-label="369AI ecosystem: POS, vending, robotics and smart locks all connected through a central ERP and cloud platform"
        className="w-full"
      >
        <defs>
          <linearGradient id="coreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60c0d8" />
            <stop offset="55%" stopColor="#1890c0" />
            <stop offset="100%" stopColor="#006090" />
          </linearGradient>
          <linearGradient id="arrowGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff7800" />
            <stop offset="100%" stopColor="#ff9000" />
          </linearGradient>
          <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connectors */}
        <g stroke="rgba(255,255,255,0.16)" strokeWidth="1.25" fill="none">
          {nodes.map((n) => (
            <line key={n.label} x1={n.x + 50} y1={n.y + 26} x2={190} y2={180} />
          ))}
        </g>

        {/* Data pulses travelling inward */}
        <g fill="#60c0d8">
          {nodes.map((n, i) => (
            <circle key={n.label} r="3.2">
              <animateMotion
                dur={`${2.8 + i * 0.45}s`}
                repeatCount="indefinite"
                path={`M${n.x + 50},${n.y + 26} L190,180`}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur={`${2.8 + i * 0.45}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* Orbit rings */}
        <g fill="none" stroke="rgba(96,192,216,0.28)" strokeWidth="1">
          <circle cx="190" cy="180" r="78" strokeDasharray="3 7">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 190 180"
              to="360 190 180"
              dur="26s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="190" cy="180" r="98" strokeDasharray="2 12" opacity="0.6">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 190 180"
              to="0 190 180"
              dur="38s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Expanding pulse from the core */}
        <circle cx="190" cy="180" r="56" fill="none" stroke="rgba(96,192,216,0.5)" strokeWidth="1">
          <animate attributeName="r" values="56;104;56" dur="4.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0;0.55" dur="4.5s" repeatCount="indefinite" />
        </circle>

        {/* The growth arrow — the logo's own motif, drawing itself upward */}
        <path
          d="M108 286 C150 250 196 214 250 132"
          fill="none"
          stroke="url(#arrowGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="400"
          style={{ animation: 'arrow-draw 2.2s var(--ease-out-soft) 0.4s both' }}
        />
        <path
          d="M232 122 L262 118 L256 148 Z"
          fill="url(#arrowGrad)"
          style={{ animation: 'word-rise 0.6s var(--ease-out-soft) 2.3s both' }}
        />

        {/* Core */}
        <circle cx="190" cy="180" r="50" fill="url(#coreGrad)" filter="url(#soften)" />
        <text x="190" y="175" textAnchor="middle" className="fill-white text-[15px] font-bold">
          ERP
        </text>
        <text x="190" y="194" textAnchor="middle" className="fill-[#cdeaf5] text-[10px]">
          + Cloud + AI
        </text>

        {/* Leaf nodes */}
        {nodes.map((n, i) => (
          <g key={n.label} style={{ animation: `word-rise 0.7s var(--ease-out-soft) ${0.6 + i * 0.12}s both` }}>
            <rect
              x={n.x}
              y={n.y}
              width="100"
              height="52"
              rx="13"
              fill="rgba(255,255,255,0.08)"
              stroke="rgba(255,255,255,0.18)"
            />
            <text
              x={n.x + 50}
              y={n.y + 31}
              textAnchor="middle"
              className="fill-white text-[12.5px] font-medium"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
