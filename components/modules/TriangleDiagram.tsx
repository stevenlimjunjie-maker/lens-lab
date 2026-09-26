/** Static exposure triangle diagram. */
export function TriangleDiagram() {
  return (
    <svg viewBox="0 0 360 250" className="mx-auto block h-auto w-full max-w-md" role="img" aria-labelledby="tri-t tri-d">
      <title id="tri-t">The exposure triangle</title>
      <desc id="tri-d">
        ISO, shutter speed and aperture all change brightness. Each has a side effect: ISO adds noise, slow shutter adds blur, a wide
        aperture blurs the background. On phones the aperture is fixed, and EV nudges the automatic result.
      </desc>
      <polygon points="180,22 330,220 30,220" fill="#fafafa" stroke="#111" strokeWidth="1.5" />
      <circle cx="180" cy="130" r="36" fill="#ffffff" stroke="#1d4ed8" strokeWidth="2" />
      <text x="180" y="126" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1d4ed8" fontFamily="var(--font-serif)">Exposure</text>
      <text x="180" y="143" textAnchor="middle" fontSize="11" fill="#3f3f46">EV nudges it</text>
      <g fontFamily="var(--font-sans)">
        <circle cx="180" cy="22" r="7" fill="#111" />
        <text x="196" y="20" fontSize="14" fontWeight="600" fill="#111">Shutter speed</text>
        <text x="196" y="37" fontSize="11" fill="#b91c1c">slow = motion blur</text>
        <circle cx="30" cy="220" r="7" fill="#111" />
        <text x="18" y="244" fontSize="14" fontWeight="600" fill="#111">ISO</text>
        <text x="50" y="244" fontSize="11" fill="#b91c1c">high = noise</text>
        <circle cx="330" cy="220" r="7" fill="#111" />
        <text x="342" y="244" textAnchor="end" fontSize="14" fontWeight="600" fill="#111">Aperture</text>
        <text x="270" y="206" textAnchor="middle" fontSize="11" fill="#7a4a00">fixed on phones</text>
      </g>
    </svg>
  );
}
