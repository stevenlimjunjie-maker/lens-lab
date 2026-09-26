// Dev-only: rendered at 1200x630 and screenshotted into public/og.png by scripts/gen-og.mjs.
import { LogoMark } from "@/components/ui/LogoMark";

export default function DevOg() {
  return (
    <div id="og" style={{ width: 1200, height: 630 }} className="relative overflow-hidden bg-[#0d0d10]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/samples/street-1280.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute top-0 left-0 h-2 w-full bg-white" />
      <div className="relative flex h-full flex-col justify-center gap-6 px-20">
        <div className="flex items-center gap-4">
          <LogoMark size={64} />
          <span className="serif text-4xl font-bold text-white">Lens Lab</span>
        </div>
        <h1 className="max-w-3xl text-[64px] leading-[1.08] font-bold text-white">Phone camera settings, explained and simulated.</h1>
        <p className="smallcaps text-2xl text-white/85">Exposure · lenses · white balance · focus · RAW</p>
      </div>
    </div>
  );
}
