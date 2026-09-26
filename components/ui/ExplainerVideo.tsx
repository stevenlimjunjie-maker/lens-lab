"use client";

import { useEffect, useState } from "react";

/** Shows the vertical cut on phones and the landscape cut on wider screens. */
export function ExplainerVideo() {
  const [vertical, setVertical] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setVertical(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const name = vertical ? "lens-lab-vertical" : "lens-lab-landscape";
  return (
    <figure className="mx-auto w-full max-w-3xl">
      <video
        key={name}
        className={`mx-auto block w-full rounded-lg bg-black ${vertical ? "max-h-[80vh] w-auto max-w-full" : "aspect-video"}`}
        style={vertical ? { aspectRatio: "9 / 16" } : undefined}
        controls
        playsInline
        preload="none"
        poster={`/video/${name}-poster.jpg`}
        aria-describedby="video-desc"
      >
        <source src={`/video/${name}.mp4`} type="video/mp4" />
        Your browser cannot play this video.
      </video>
      <figcaption id="video-desc" className="mt-2 text-[14px] text-muted">
        About 80 seconds, captioned, no sound. Covers exposure, lenses, white balance, focus, RAW and the top tips for each
        platform. {vertical ? "Showing the vertical version." : "Showing the landscape version."}{" "}
        <a className="text-blue underline" href={`/video/${vertical ? "lens-lab-landscape" : "lens-lab-vertical"}.mp4`}>
          Open the {vertical ? "landscape" : "vertical"} version
        </a>
      </figcaption>
    </figure>
  );
}
