export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lens-lab-six.vercel.app";

export const SITE_NAME = "Lens Lab";

export const SITE_DESCRIPTION =
  "An interactive lab that teaches how the camera settings on Samsung Galaxy and iPhone phones work: exposure, lenses, white balance, focus, RAW and real shooting scenarios.";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  blurb: string;
  number?: string;
};

export const NAV: NavItem[] = [
  { href: "/lab/exposure", label: "Exposure", short: "Exposure", number: "01", blurb: "ISO, shutter speed and EV on a live photo, with histogram and clipping warnings." },
  { href: "/lab/lenses", label: "Lenses and zoom", short: "Lenses", number: "02", blurb: "Ultra-wide, main and telephoto on the same scene, and where digital zoom starts to hurt." },
  { href: "/lab/pro-controls", label: "Pro controls and RAW", short: "Pro", number: "03", blurb: "White balance in Kelvin, manual focus with peaking, metering modes and RAW recovery." },
  { href: "/lab/scenarios", label: "Scenarios", short: "Scenes", number: "04", blurb: "Seven shooting situations, the settings that fit them, and the steps on each phone." },
  { href: "/quiz", label: "Fix the photo quiz", short: "Quiz", number: "05", blurb: "Spot what went wrong in a photo and pick the setting that fixes it." },
  { href: "/cheat-sheet", label: "Cheat sheet", short: "Cheat sheet", number: "06", blurb: "A printable summary of settings per scenario for Samsung and iPhone." },
];

export const ABOUT: NavItem = {
  href: "/about",
  label: "About and sources",
  short: "About",
  blurb: "Sources, image credits and the fine print on model differences.",
};
