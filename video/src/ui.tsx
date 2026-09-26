import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sans, serif } from "./theme";

/** Layout helper: unit scale and orientation. */
export function useLayout() {
  const { width, height, fps } = useVideoConfig();
  const vertical = height > width;
  const u = Math.min(width, height) / 1080;
  return { width, height, fps, vertical, u };
}

export function useSpring(delay = 0, config = { damping: 200 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
}

/** Fades a whole scene in and out. */
export function SceneFrame({
  children,
  duration,
  bg = C.paper,
}: {
  children: React.ReactNode;
  duration: number;
  bg?: string;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: bg, opacity, fontFamily: sans }}>{children}</AbsoluteFill>;
}

/** Masthead: thin rule plus small caps section label, like the site. */
export function Masthead({ label, title, dark }: { label: string; title: string; dark?: boolean }) {
  const { u, vertical } = useLayout();
  const s = useSpring(4);
  const ink = dark ? "#ffffff" : C.ink;
  return (
    <div
      style={{
        position: "absolute",
        left: 80 * u,
        right: 80 * u,
        top: (vertical ? 170 : 70) * u,
        opacity: s,
        transform: `translateY(${(1 - s) * 30 * u}px)`,
      }}
    >
      <div style={{ height: 3 * u, background: ink, width: `${s * 100}%` }} />
      <div
        style={{
          marginTop: 14 * u,
          fontVariant: "small-caps",
          textTransform: "lowercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          fontSize: 34 * u,
          color: dark ? "rgba(255,255,255,0.8)" : C.muted,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: serif, fontWeight: 700, fontSize: (vertical ? 82 : 76) * u, lineHeight: 1.1, color: ink, marginTop: 8 * u }}>
        {title}
      </div>
    </div>
  );
}

/** Caption bar at the bottom, always readable. */
export function Caption({ lines }: { lines: { from: number; to: number; text: string }[] }) {
  const frame = useCurrentFrame();
  const { u, vertical } = useLayout();
  const current = lines.find((l) => frame >= l.from && frame < l.to);
  if (!current) return null;
  const o = interpolate(frame, [current.from, current.from + 6, current.to - 6, current.to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: (vertical ? 190 : 60) * u,
        display: "flex",
        justifyContent: "center",
        padding: `0 ${60 * u}px`,
        opacity: o,
      }}
    >
      <div
        style={{
          background: "rgba(17,17,17,0.9)",
          color: "#fff",
          fontSize: (vertical ? 46 : 40) * u,
          lineHeight: 1.3,
          fontWeight: 500,
          padding: `${16 * u}px ${28 * u}px`,
          borderRadius: 14 * u,
          maxWidth: (vertical ? 960 : 1400) * u,
          textAlign: "center",
        }}
      >
        {current.text}
      </div>
    </div>
  );
}

export function Pill({ children, color, u }: { children: React.ReactNode; color: string; u: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: color,
        color: color === C.caution ? C.ink : "#fff",
        borderRadius: 999,
        padding: `${8 * u}px ${22 * u}px`,
        fontWeight: 600,
        fontSize: 34 * u,
      }}
    >
      {children}
    </span>
  );
}
