/** Simple aperture-blade mark drawn in SVG. */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const blades = [0, 60, 120, 180, 240, 300];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="15" fill="#111" />
      <g transform="translate(16 16)">
        {blades.map((a) => (
          <path key={a} d="M0 -12 L10.4 -6 L3.5 -2 Z" fill={a % 120 === 0 ? "#1d4ed8" : "#4c6ef5"} transform={`rotate(${a})`} />
        ))}
        <circle r="4.2" fill="#fafafa" />
      </g>
    </svg>
  );
}
