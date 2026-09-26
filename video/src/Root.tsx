import { Composition } from "remotion";
import { Main, TOTAL, type MainProps } from "./Main";
import { FPS } from "./theme";

const defaults: MainProps = { url: "lens-lab-six.vercel.app" };

export const Root = () => (
  <>
    <Composition id="Vertical" component={Main} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} defaultProps={defaults} />
    <Composition id="Landscape" component={Main} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={defaults} />
  </>
);
