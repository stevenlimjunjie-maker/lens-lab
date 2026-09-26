import { Audio, Series, staticFile } from "remotion";
import { Cta, Exposure, Focus, Hook, Lenses, Raw, Tips, WhiteBalance } from "./scenes";
import { C } from "./theme";

export type MainProps = {
  /** Optional licensed background track in video/public. Leave empty for a silent video. */
  music?: string;
  url: string;
};

export const SAMSUNG_TIPS = [
  "Pro mode: set shutter to 1/500s or faster to freeze motion.",
  "Set white balance in Kelvin under indoor lights.",
  "Manual focus plus focus peaking for close-ups.",
  "Shoot RAW in Pro mode or Expert RAW, on supported models.",
  "Stay on 1x in low light and let Night mode work.",
];

export const IPHONE_TIPS = [
  "Tap to focus, then drag the sun icon to set brightness.",
  "Touch and hold for AE/AF Lock before you recompose.",
  "Portrait mode: change the f-number now or later in Photos.",
  "Night mode: tap the moon icon to set the time, brace the phone.",
  "Turn on ProRAW on Pro models for tricky light.",
];

export const SCENES = [180, 360, 300, 240, 210, 240, 330, 330, 210];
export const TOTAL = SCENES.reduce((a, b) => a + b, 0);

export function Main({ music, url }: MainProps) {
  const [hook, exp, lens, wb, focus, raw, sam, iph, cta] = SCENES;
  return (
    <>
      {music ? <Audio src={staticFile(music)} volume={0.35} /> : null}
      <Series>
        <Series.Sequence durationInFrames={hook}>
          <Hook duration={hook} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={exp}>
          <Exposure duration={exp} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={lens}>
          <Lenses duration={lens} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={wb}>
          <WhiteBalance duration={wb} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={focus}>
          <Focus duration={focus} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={raw}>
          <Raw duration={raw} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sam}>
          <Tips duration={sam} label="06 · Samsung Galaxy" title="Top 5 tips on Samsung" tips={SAMSUNG_TIPS} accent={C.blue} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={iph}>
          <Tips duration={iph} label="07 · iPhone" title="Top 5 tips on iPhone" tips={IPHONE_TIPS} accent={C.good} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={cta}>
          <Cta duration={cta} url={url} />
        </Series.Sequence>
      </Series>
    </>
  );
}
