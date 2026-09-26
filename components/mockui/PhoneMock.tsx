/**
 * Simplified, generic drawings of where controls sit in each camera app.
 * Not screenshots and not exact replicas: layouts vary by model and version.
 */

export type SamsungSpot = "pro-bar" | "iso" | "speed" | "ev" | "focus" | "wb" | "metering" | "lenses" | "more" | "modes" | "raw" | "portrait" | "night";
export type IphoneSpot = "ev" | "lock" | "lenses" | "modes" | "arrow" | "night" | "fstop" | "raw" | "styles" | "macro";

const HL = "#f59e0b";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 200 400" className="mx-auto block h-auto w-full max-w-[210px]" role="img" aria-label={label}>
      <rect x="4" y="4" width="192" height="392" rx="26" fill="#111" />
      <rect x="10" y="10" width="180" height="380" rx="21" fill="#1b1b1f" />
      {children}
    </svg>
  );
}

function Viewfinder({ y = 62, h = 220 }: { y?: number; h?: number }) {
  return (
    <g>
      <defs>
        <linearGradient id="vf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fa7cf" />
          <stop offset="0.55" stopColor="#c6d9e8" />
          <stop offset="0.56" stopColor="#6a8f5a" />
          <stop offset="1" stopColor="#4d6d40" />
        </linearGradient>
      </defs>
      <rect x="10" y={y} width="180" height={h} fill="url(#vf-sky)" />
      <path d={`M10 ${y + h * 0.56} L60 ${y + h * 0.36} L100 ${y + h * 0.5} L140 ${y + h * 0.32} L190 ${y + h * 0.5} L190 ${y + h * 0.56} Z`} fill="#6b7a8f" />
    </g>
  );
}

function Ring({ x, y, w, h, on }: { x: number; y: number; w: number; h: number; on: boolean }) {
  if (!on) return null;
  return <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx="8" fill="none" stroke={HL} strokeWidth="3" />;
}

function T({ x, y, s = 9, c = "#e5e5e5", w = 500, children, a = "middle" }: { x: number; y: number; s?: number; c?: string; w?: number; children: React.ReactNode; a?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fontSize={s} fill={c} fontWeight={w} textAnchor={a} fontFamily="IBM Plex Sans, system-ui, sans-serif">
      {children}
    </text>
  );
}

export function SamsungMock({ spot, label }: { spot?: SamsungSpot; label: string }) {
  const pro = ["iso", "speed", "ev", "focus", "wb", "metering", "pro-bar"].includes(spot ?? "");
  const items = [
    { k: "metering", t: "◉" },
    { k: "iso", t: "ISO" },
    { k: "speed", t: "SPEED" },
    { k: "ev", t: "EV" },
    { k: "focus", t: "MF" },
    { k: "wb", t: "WB" },
  ];
  const modeText = spot === "portrait" ? "PORTRAIT" : spot === "night" ? "NIGHT" : pro ? "PRO" : "PHOTO";
  return (
    <Frame label={label}>
      {/* top bar */}
      <circle cx="30" cy="36" r="6" fill="none" stroke="#e5e5e5" strokeWidth="1.5" />
      <T x={70} y={39}>3:4</T>
      <Ring x={58} y={28} w={24} h={14} on={spot === "raw"} />
      <T x={110} y={39}>{spot === "raw" ? "RAW" : "HDR"}</T>
      <circle cx="170" cy="36" r="6" fill="none" stroke="#e5e5e5" strokeWidth="1.5" />
      <Viewfinder />
      {pro && (
        <g>
          {spot === "focus" && (
            <path d="M60 140 L100 120 L140 140" stroke="#39ff14" strokeWidth="2" fill="none" />
          )}
          <rect x="10" y="252" width="180" height="30" fill="rgba(0,0,0,0.55)" />
          {items.map((it, i) => {
            const x = 22 + i * 31;
            return (
              <g key={it.k}>
                <T x={x} y={271} s={8} c={spot === it.k ? HL : "#f5f5f5"} w={600}>
                  {it.t}
                </T>
                <Ring x={x - 13} y={259} w={26} h={16} on={spot === it.k} />
              </g>
            );
          })}
          <Ring x={12} y={254} w={176} h={26} on={spot === "pro-bar"} />
        </g>
      )}
      {spot === "portrait" && (
        <g>
          <ellipse cx="100" cy="170" rx="28" ry="36" fill="#a8704f" />
          <rect x="40" y="248" width="120" height="6" rx="3" fill="#555" />
          <circle cx="120" cy="251" r="7" fill={HL} />
          <T x={100} y={242} s={8}>Blur strength</T>
        </g>
      )}
      {spot === "night" && <T x={100} y={170} s={11} w={600}>Hold still</T>}
      {/* lens buttons */}
      <g>
        {["0.6", "1x", "3"].map((z, i) => (
          <g key={z}>
            <circle cx={70 + i * 30} cy="300" r="11" fill={i === 1 ? "#f5f5f5" : "rgba(255,255,255,0.18)"} />
            <T x={70 + i * 30} y={303} s={8} c={i === 1 ? "#111" : "#f5f5f5"} w={600}>
              {z}
            </T>
          </g>
        ))}
        <Ring x={56} y={286} w={88} h={28} on={spot === "lenses"} />
      </g>
      {/* mode strip */}
      <g>
        <T x={40} y={330} s={8} c="#a1a1aa">PORTRAIT</T>
        <T x={100} y={330} s={9} c="#facc15" w={700}>{modeText}</T>
        <T x={160} y={330} s={8} c="#a1a1aa">MORE</T>
        <Ring x={140} y={320} w={40} h={14} on={spot === "more"} />
        <Ring x={20} y={320} w={160} h={14} on={spot === "modes" || spot === "portrait" || spot === "night"} />
      </g>
      {/* shutter */}
      <rect x="30" y="348" width="26" height="26" rx="6" fill="#444" />
      <circle cx="100" cy="361" r="19" fill="#f5f5f5" />
      <circle cx="100" cy="361" r="15" fill="none" stroke="#1b1b1f" strokeWidth="2" />
      <circle cx="160" cy="361" r="12" fill="#333" />
    </Frame>
  );
}

export function IphoneMock({ spot, label }: { spot?: IphoneSpot; label: string }) {
  const modeText = spot === "fstop" ? "PORTRAIT" : "PHOTO";
  return (
    <Frame label={label}>
      <circle cx="30" cy="36" r="6" fill="none" stroke="#e5e5e5" strokeWidth="1.5" />
      {/* top arrow */}
      <path d="M94 38 L100 32 L106 38" stroke="#f5f5f5" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Ring x={88} y={27} w={24} h={16} on={spot === "arrow"} />
      {spot === "night" ? (
        <g>
          <rect x="145" y="27" width="34" height="16" rx="8" fill="#facc15" />
          <T x={162} y={39} s={8} c="#111" w={700}>☾ 3s</T>
          <Ring x={145} y={27} w={34} h={16} on />
        </g>
      ) : spot === "raw" ? (
        <g>
          <T x={162} y={39} s={9} w={700}>RAW</T>
          <Ring x={146} y={28} w={32} h={15} on />
        </g>
      ) : (
        <circle cx="170" cy="36" r="6" fill="none" stroke="#e5e5e5" strokeWidth="1.5" />
      )}
      {spot === "fstop" && (
        <g>
          <circle cx="30" cy="36" r="9" fill="#1b1b1f" />
          <T x={30} y={40} s={11} c="#facc15" w={700}>ƒ</T>
          <Ring x={20} y={26} w={20} h={20} on />
        </g>
      )}
      <Viewfinder />
      {(spot === "ev" || spot === "lock") && (
        <g>
          <rect x="72" y="140" width="46" height="46" fill="none" stroke="#facc15" strokeWidth="1.5" />
          <line x1="128" y1="128" x2="128" y2="198" stroke="#facc15" strokeWidth="1.2" />
          <circle cx="128" cy="150" r="6" fill="#facc15" />
          {spot === "lock" && (
            <g>
              <rect x="64" y="72" width="72" height="16" rx="3" fill="#facc15" />
              <T x={100} y={84} s={8} c="#111" w={700}>AE/AF LOCK</T>
            </g>
          )}
          <Ring x={119} y={138} w={18} h={24} on={spot === "ev"} />
        </g>
      )}
      {spot === "styles" && (
        <g>
          <rect x="40" y="200" width="120" height="44" rx="8" fill="rgba(0,0,0,0.55)" />
          <rect x="50" y="210" width="24" height="24" rx="3" fill="#c98b6b" />
          <rect x="88" y="210" width="24" height="24" rx="3" fill="#8fa3b8" />
          <rect x="126" y="210" width="24" height="24" rx="3" fill="#e2b77f" />
          <Ring x={40} y={200} w={120} h={44} on />
        </g>
      )}
      {spot === "macro" && (
        <g>
          <circle cx="30" cy="270" r="10" fill="rgba(0,0,0,0.5)" />
          <T x={30} y={274} s={11} c="#facc15">✿</T>
          <Ring x={19} y={259} w={22} h={22} on />
        </g>
      )}
      {/* zoom buttons */}
      <g>
        <rect x="58" y="288" width="84" height="24" rx="12" fill="rgba(0,0,0,0.45)" />
        {[".5", "1x", "3"].map((z, i) => (
          <g key={z}>
            <circle cx={75 + i * 25} cy="300" r="9.5" fill={i === 1 ? "rgba(255,255,255,0.25)" : "transparent"} />
            <T x={75 + i * 25} y={303} s={8} c={i === 1 ? "#facc15" : "#f5f5f5"} w={600}>
              {z}
            </T>
          </g>
        ))}
        <Ring x={58} y={288} w={84} h={24} on={spot === "lenses"} />
      </g>
      {/* modes */}
      <g>
        <T x={48} y={330} s={8} c="#a1a1aa">VIDEO</T>
        <T x={100} y={330} s={9} c="#facc15" w={700}>{modeText}</T>
        <T x={152} y={330} s={8} c="#a1a1aa">{spot === "fstop" ? "PANO" : "PORTRAIT"}</T>
        <Ring x={20} y={320} w={160} h={14} on={spot === "modes"} />
      </g>
      <rect x="30" y="348" width="26" height="26" rx="6" fill="#444" />
      <circle cx="100" cy="361" r="19" fill="#f5f5f5" />
      <circle cx="100" cy="361" r="15" fill="none" stroke="#1b1b1f" strokeWidth="2" />
      <circle cx="160" cy="361" r="12" fill="#333" />
    </Frame>
  );
}
