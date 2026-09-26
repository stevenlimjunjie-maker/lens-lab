import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, sans, serif } from "./theme";
import { Caption, Masthead, Pill, SceneFrame, useLayout, useSpring } from "./ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Content area between the masthead and the captions. */
function Stage({ children }: { children: React.ReactNode }) {
  const { u, vertical } = useLayout();
  const style: React.CSSProperties = vertical
    ? { left: 80 * u, right: 80 * u, top: 560 * u, height: 1000 * u }
    : { left: 120 * u, right: 120 * u, top: 330 * u, height: 560 * u };
  return <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>{children}</div>;
}

// ------------------------------------------------------------------ 1 Hook

export function Hook({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const zoom = interpolate(frame, [0, duration], [1.15, 1], clamp);
  const bracket = useSpring(8);
  const t1 = useSpring(20);
  const t2 = useSpring(48);
  const dial = interpolate(frame, [30, 150], [0, 220], clamp);
  return (
    <SceneFrame duration={duration} bg={C.dark}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img src={staticFile("samples/street-1280.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75), rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.7))" }} />
      {[
        { top: 60, left: 60, b: "borderTop borderLeft" },
        { top: 60, right: 60, b: "borderTop borderRight" },
        { bottom: 60, left: 60, b: "borderBottom borderLeft" },
        { bottom: 60, right: 60, b: "borderBottom borderRight" },
      ].map((p, i) => {
        const st: React.CSSProperties = { position: "absolute", width: 90 * u, height: 90 * u, opacity: bracket, transform: `scale(${2 - bracket})` };
        (["top", "left", "right", "bottom"] as const).forEach((k) => {
          if (p[k as keyof typeof p] !== undefined) st[k] = (p[k as keyof typeof p] as number) * u;
        });
        p.b.split(" ").forEach((b) => ((st as Record<string, unknown>)[b] = `${5 * u}px solid #fff`));
        return <div key={i} style={st} />;
      })}
      <div style={{ position: "absolute", left: 100 * u, right: 100 * u, top: (vertical ? 520 : 250) * u, color: "#fff" }}>
        <div style={{ fontVariant: "small-caps", textTransform: "lowercase", letterSpacing: "0.08em", fontWeight: 600, fontSize: 38 * u, opacity: t1 }}>
          Lens Lab
        </div>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 700,
            fontSize: (vertical ? 108 : 104) * u,
            lineHeight: 1.08,
            marginTop: 16 * u,
            opacity: t1,
            transform: `translateY(${(1 - t1) * 40 * u}px)`,
          }}
        >
          Your phone camera can do more than auto.
        </div>
        <div style={{ fontSize: 44 * u, marginTop: 30 * u, opacity: t2, color: "rgba(255,255,255,0.9)" }}>
          Here is what every setting does, in 80 seconds.
        </div>
      </div>
      <div style={{ position: "absolute", bottom: (vertical ? 260 : 120) * u, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 60 * u }}>
        {["ISO", "SHUTTER", "LENS"].map((l, i) => (
          <div key={l} style={{ textAlign: "center", color: "#fff", opacity: t2 }}>
            <svg width={150 * u} height={150 * u} viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.5)" />
              <g transform={`rotate(${dial * (i % 2 ? -1 : 1) * (0.6 + i * 0.2)} 40 40)`}>
                {Array.from({ length: 24 }, (_, k) => (
                  <line key={k} x1="40" y1="7" x2="40" y2={k % 3 === 0 ? 15 : 11} stroke={k === 0 ? C.caution : "rgba(255,255,255,0.8)"} strokeWidth={k === 0 ? 3 : 1.2} transform={`rotate(${k * 15} 40 40)`} />
                ))}
              </g>
            </svg>
            <div style={{ fontSize: 28 * u, fontWeight: 600, letterSpacing: "0.1em" }}>{l}</div>
          </div>
        ))}
      </div>
    </SceneFrame>
  );
}

// ------------------------------------------------------------------ 2 Exposure

export function Exposure({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const draw = interpolate(frame, [15, 70], [0, 1], clamp);
  const a = useSpring(70);
  const b = useSpring(130);
  const c = useSpring(190);
  const d = useSpring(260);
  const perim = 3 * 520;
  return (
    <SceneFrame duration={duration}>
      <Masthead label="01 · Exposure" title="The exposure triangle" />
      <Stage>
        <svg viewBox="0 0 900 760" style={{ width: "100%", height: "100%" }}>
          <polygon points="450,70 820,640 80,640" fill={C.section} stroke={C.ink} strokeWidth="4" strokeDasharray={perim * 1.2} strokeDashoffset={perim * 1.2 * (1 - draw)} />
          <g opacity={a} fontFamily={sans}>
            <circle cx="450" cy="70" r="16" fill={C.ink} />
            <text x="450" y="40" textAnchor="middle" fontSize="44" fontWeight="600" fill={C.ink}>Shutter speed</text>
            <text x="480" y="130" fontSize="32" fill={C.bad}>slow = motion blur</text>
          </g>
          <g opacity={b} fontFamily={sans}>
            <circle cx="80" cy="640" r="16" fill={C.ink} />
            <text x="60" y="705" fontSize="44" fontWeight="600" fill={C.ink}>ISO</text>
            <text x="60" y="748" fontSize="32" fill={C.bad}>high = noise</text>
          </g>
          <g opacity={c} fontFamily={sans}>
            <circle cx="820" cy="640" r="16" fill={C.ink} />
            <text x="850" y="705" textAnchor="end" fontSize="44" fontWeight="600" fill={C.ink}>Aperture</text>
            <text x="850" y="748" textAnchor="end" fontSize="32" fill="#7a4a00">fixed on most phones</text>
          </g>
          <g opacity={d} transform={`translate(450 420) scale(${0.6 + d * 0.4})`}>
            <circle r="110" fill="#fff" stroke={C.blue} strokeWidth="6" />
            <text y="-6" textAnchor="middle" fontSize="44" fontWeight="700" fill={C.blue} fontFamily={serif}>Exposure</text>
            <text y="44" textAnchor="middle" fontSize="30" fill={C.ink2} fontFamily={sans}>EV nudges it</text>
          </g>
        </svg>
      </Stage>
      <Caption
        lines={[
          { from: 0, to: 120, text: "Three settings control brightness." },
          { from: 120, to: 250, text: "Each one has a side effect: blur, noise or depth of field." },
          { from: 250, to: duration, text: "Phones fix the aperture and fake background blur in Portrait mode." },
        ]}
      />
    </SceneFrame>
  );
}

// ------------------------------------------------------------------ 3 Lenses

export function Lenses({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const lenses = [
    { z: "0.5x", name: "Ultra-wide", deg: 108, f: "approx. 13mm" },
    { z: "1x", name: "Main", deg: 74, f: "approx. 24 to 26mm" },
    { z: "3x", name: "Telephoto", deg: 28, f: "approx. 2x to 5x" },
  ];
  const warn = useSpring(200);
  return (
    <SceneFrame duration={duration}>
      <Masthead label="02 · Lenses" title="Three lenses, not one" />
      <Stage>
        <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: 30 * u, width: "100%", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 24 * u, width: "100%", justifyContent: "center" }}>
            {lenses.map((l, i) => {
              const s = interpolate(frame, [20 + i * 45, 50 + i * 45], [0, 1], clamp);
              const half = ((l.deg / 2) * Math.PI) / 180;
              const R = 200;
              return (
                <div key={l.z} style={{ flex: 1, textAlign: "center", opacity: s }}>
                  <svg viewBox="0 0 440 260" style={{ width: "100%" }}>
                    <path
                      d={`M220 240 L${220 - Math.sin(half) * R * s} ${240 - Math.cos(half) * R} A ${R} ${R} 0 0 1 ${220 + Math.sin(half) * R * s} ${240 - Math.cos(half) * R} Z`}
                      fill={C.blue}
                      fillOpacity="0.16"
                      stroke={C.blue}
                      strokeWidth="3"
                    />
                    <rect x="200" y="232" width="40" height="20" rx="4" fill={C.ink} />
                  </svg>
                  <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 64 * u, color: C.blue }}>{l.z}</div>
                  <div style={{ fontSize: 34 * u, fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 26 * u, color: C.muted }}>{l.f}</div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              opacity: warn,
              transform: `translateY(${(1 - warn) * 20 * u}px)`,
              background: "#fdeeee",
              borderLeft: `${10 * u}px solid ${C.bad}`,
              padding: `${22 * u}px ${28 * u}px`,
              fontSize: 36 * u,
              borderRadius: 10 * u,
              maxWidth: 900 * u,
              flexShrink: 0,
            }}
          >
            <b style={{ color: C.bad }}>Past the longest lens?</b> That is digital zoom: fewer real pixels, less detail.
          </div>
        </div>
      </Stage>
      <Caption
        lines={[
          { from: 0, to: 170, text: "Each zoom button is a separate camera with its own field of view." },
          { from: 170, to: duration, text: "Walk closer or switch lenses before you pinch to zoom." },
        ]}
      />
    </SceneFrame>
  );
}

// ------------------------------------------------------------------ 4 White balance

function kelvinRgb(k: number) {
  const t = k / 100;
  const r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332);
  const g = t <= 66 ? 99.47 * Math.log(t) - 161.12 : 288.12 * Math.pow(t - 60, -0.0755);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5 * Math.log(t - 10) - 305.04;
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v)));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}

export function WhiteBalance({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const k = interpolate(frame, [20, 90, 150, 200], [3000, 3000, 9000, 5500], clamp);
  const pos = (k - 2500) / 7500;
  // Photo tint: camera set warmer than light = orange, cooler = blue.
  const tint = interpolate(k, [3000, 5500, 9000], [-1, 0, 1]);
  const overlay = tint < 0 ? `rgba(60,110,255,${-tint * 0.55})` : `rgba(255,140,30,${tint * 0.55})`;
  const stops = [2500, 3500, 4500, 5500, 6500, 8000, 10000].map(kelvinRgb).join(",");
  return (
    <SceneFrame duration={duration}>
      <Masthead label="03 · White balance" title="Light has a colour" />
      <Stage>
        <div style={{ width: "100%", display: "flex", flexDirection: vertical ? "column" : "row", gap: (vertical ? 40 : 70) * u, alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: vertical ? "100%" : 680 * u, flexShrink: 0, maxWidth: 900 * u, aspectRatio: "4 / 3", borderRadius: 16 * u, overflow: "hidden" }}>
            <Img src={staticFile("samples/street-1280.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: overlay, mixBlendMode: "multiply" }} />
          </div>
          <div style={{ width: "100%", maxWidth: (vertical ? 900 : 640) * u }}>
            <div style={{ position: "relative", height: 24 * u, borderRadius: 999, background: `linear-gradient(90deg, ${stops})` }}>
              <div
                style={{
                  position: "absolute",
                  top: -14 * u,
                  left: `calc(${pos * 100}% - ${26 * u}px)`,
                  width: 52 * u,
                  height: 52 * u,
                  borderRadius: 999,
                  background: "#fff",
                  border: `${5 * u}px solid ${C.blue}`,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 * u, fontSize: 32 * u, color: C.muted }}>
              <span>2500K</span>
              <span style={{ fontFamily: serif, fontWeight: 700, color: C.ink, fontSize: 48 * u }}>{Math.round(k / 100) * 100}K</span>
              <span>10000K</span>
            </div>
          </div>
        </div>
      </Stage>
      <Caption
        lines={[
          { from: 0, to: 95, text: "Set it too low for daylight and the photo turns blue." },
          { from: 95, to: 170, text: "Too high and it turns orange." },
          { from: 170, to: duration, text: "Match the light: about 3000K indoors, 5500K in daylight." },
        ]}
      />
    </SceneFrame>
  );
}

// ------------------------------------------------------------------ 5 Focus

export function Focus({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const f = interpolate(frame, [20, 120], [0, 1], clamp);
  const blurNear = (1 - f) * 0 + f * 10;
  const blurFar = (1 - f) * 10;
  const peak = interpolate(frame, [110, 130], [0, 1], clamp);
  return (
    <SceneFrame duration={duration}>
      <Masthead label="04 · Focus" title="Put the sharpness where it matters" />
      <Stage>
        <svg viewBox="0 0 900 700" style={{ width: "100%", height: "100%" }}>
          <defs>
            <filter id="bn"><feGaussianBlur stdDeviation={blurNear} /></filter>
            <filter id="bf"><feGaussianBlur stdDeviation={blurFar} /></filter>
          </defs>
          <rect width="900" height="700" rx="20" fill={C.section} />
          <g filter="url(#bn)">
            <rect x="120" y="120" width="660" height="260" rx="10" fill="#8fa3b8" />
            {Array.from({ length: 10 }, (_, i) => (
              <rect key={i} x={150 + i * 62} y="160" width="36" height="60" fill="#3d4b5a" />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <rect key={i} x={150 + i * 62} y="260" width="36" height="60" fill="#3d4b5a" />
            ))}
          </g>
          <g filter="url(#bf)">
            <ellipse cx="300" cy="560" rx="170" ry="90" fill="#7b4b2a" />
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={180 + i * 30} cy={470 + (i % 3) * 20} r="24" fill={["#e03131", "#f59f00", "#f06595"][i % 3]} />
            ))}
          </g>
          <g opacity={peak} fill="none" stroke="#33ff44" strokeWidth="6">
            <rect x="120" y="120" width="660" height="260" rx="10" />
            {Array.from({ length: 10 }, (_, i) => (
              <rect key={i} x={150 + i * 62} y="160" width="36" height="60" />
            ))}
          </g>
          <g opacity={1 - peak} fill="none" stroke="#33ff44" strokeWidth="6">
            <ellipse cx="300" cy="560" rx="170" ry="90" />
          </g>
          <rect x="560" y="470" width="260" height="120" rx="14" fill="#111" opacity="0.85" />
          <text x="690" y="522" textAnchor="middle" fill="#fff" fontFamily={sans} fontSize="30" fontWeight="600">
            MF
          </text>
          <text x="690" y="566" textAnchor="middle" fill="#33ff44" fontFamily={sans} fontSize="28">
            {f < 0.5 ? "Near" : "Far"}
          </text>
        </svg>
      </Stage>
      <Caption
        lines={[
          { from: 0, to: 100, text: "Tap to focus. Touch and hold to lock focus and exposure." },
          { from: 100, to: duration, text: "Samsung Pro mode adds manual focus with green focus peaking." },
        ]}
      />
    </SceneFrame>
  );
}

// ------------------------------------------------------------------ 6 RAW

export function Raw({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const rec = interpolate(frame, [60, 150], [0, 1], clamp);
  const Panel = ({ raw }: { raw: boolean }) => {
    // JPEG sky clipped: recovery only makes it grey. RAW brings back clouds.
    const skyTop = raw ? `rgb(${255 - rec * 140},${255 - rec * 90},${255 - rec * 30})` : `rgb(${255 - rec * 70},${255 - rec * 70},${255 - rec * 70})`;
    return (
      <div style={{ flex: 1, textAlign: "center" }}>
        <svg viewBox="0 0 400 300" style={{ width: "100%", borderRadius: 14 * u }}>
          <rect width="400" height="200" fill={skyTop} />
          {raw && (
            <g opacity={rec} fill="#f2f5f8">
              <ellipse cx="110" cy="70" rx="70" ry="24" />
              <ellipse cx="150" cy="58" rx="46" ry="24" />
              <ellipse cx="290" cy="100" rx="80" ry="22" />
            </g>
          )}
          <polygon points="0,200 80,130 170,190 260,110 400,200" fill="#6b6f8f" />
          <rect y="200" width="400" height="100" fill="#4d6d40" />
          {!raw && rec < 0.2 && (
            <g opacity={1 - rec * 5}>
              {Array.from({ length: 20 }, (_, i) => (
                <line key={i} x1={i * 30 - 100} y1="0" x2={i * 30 + 100} y2="200" stroke={C.bad} strokeWidth="8" opacity="0.8" />
              ))}
            </g>
          )}
        </svg>
        <div style={{ fontSize: 40 * u, fontWeight: 600, marginTop: 16 * u }}>{raw ? "RAW" : "JPEG / HEIF"}</div>
        <div style={{ fontSize: 30 * u, color: raw ? C.good : C.bad, marginTop: 6 * u }}>{raw ? "Clouds come back" : "Flat grey, detail gone"}</div>
      </div>
    );
  };
  return (
    <SceneFrame duration={duration}>
      <Masthead label="05 · RAW" title="Keep the data, fix it later" />
      <Stage>
        <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: (vertical ? 24 : 40) * u, width: vertical ? "50%" : "72%" }}>
          <Panel raw={false} />
          <Panel raw />
        </div>
      </Stage>
      <Caption
        lines={[
          { from: 0, to: 120, text: "Pull back a blown sky: JPEG has nothing left to recover." },
          { from: 120, to: duration, text: "RAW keeps more sensor data. Samsung: Pro mode or Expert RAW. iPhone: ProRAW on Pro models." },
        ]}
      />
    </SceneFrame>
  );
}

// ------------------------------------------------------------------ 7/8 Tips

export function Tips({ duration, label, title, tips, accent }: { duration: number; label: string; title: string; tips: string[]; accent: string }) {
  const { u, vertical } = useLayout();
  const frame = useCurrentFrame();
  return (
    <SceneFrame duration={duration}>
      <Masthead label={label} title={title} />
      <Stage>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, width: "100%", display: "grid", gap: (vertical ? 28 : 18) * u }}>
          {tips.map((t, i) => {
            const start = 20 + i * 52;
            const s = interpolate(frame, [start, start + 14], [0, 1], clamp);
            return (
              <li
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28 * u,
                  opacity: s,
                  transform: `translateX(${(1 - s) * 60 * u}px)`,
                  background: C.section,
                  border: `${2 * u}px solid ${C.rule}`,
                  borderRadius: 16 * u,
                  padding: `${(vertical ? 26 : 18) * u}px ${28 * u}px`,
                }}
              >
                <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 64 * u, color: accent, width: 60 * u, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: (vertical ? 42 : 38) * u, lineHeight: 1.25, color: C.ink }}>{t}</span>
              </li>
            );
          })}
        </ol>
      </Stage>
    </SceneFrame>
  );
}

// ------------------------------------------------------------------ 9 CTA

export function Cta({ duration, url }: { duration: number; url: string }) {
  const { u, vertical } = useLayout();
  const s = useSpring(10);
  const s2 = useSpring(40);
  return (
    <SceneFrame duration={duration} bg={C.dark}>
      <AbsoluteFill style={{ opacity: 0.35 }}>
        <Img src={staticFile("samples/night-1280.webp")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center", padding: 80 * u }}>
        <svg width={160 * u} height={160 * u} viewBox="0 0 32 32" style={{ opacity: s, transform: `rotate(${(1 - s) * -90}deg)` }}>
          <circle cx="16" cy="16" r="15" fill="#111" stroke="#fff" strokeWidth="0.6" />
          <g transform="translate(16 16)">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <path key={a} d="M0 -12 L10.4 -6 L3.5 -2 Z" fill={a % 120 === 0 ? C.blue : "#4c6ef5"} transform={`rotate(${a})`} />
            ))}
            <circle r="4.2" fill="#fafafa" />
          </g>
        </svg>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: (vertical ? 110 : 100) * u, marginTop: 40 * u, opacity: s, lineHeight: 1.1 }}>
          Try the Lens Lab
        </div>
        <div style={{ fontSize: 44 * u, marginTop: 24 * u, opacity: s2, maxWidth: 1200 * u }}>
          Drag the sliders, break the photo, then fix it.
        </div>
        <div style={{ marginTop: 50 * u, opacity: s2 }}>
          <Pill color={C.blue} u={u * 1.3}>
            {url}
          </Pill>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
}
