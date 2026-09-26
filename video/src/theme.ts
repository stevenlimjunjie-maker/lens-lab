import { loadFont as loadSerif } from "@remotion/google-fonts/LibreBaskerville";
import { loadFont as loadSans } from "@remotion/google-fonts/IBMPlexSans";

export const serif = loadSerif("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;
export const sans = loadSans("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;

// Same tokens as the site.
export const C = {
  ink: "#111111",
  ink2: "#3f3f46",
  muted: "#52525b",
  paper: "#ffffff",
  section: "#fafafa",
  rule: "#e0e0e0",
  blue: "#1d4ed8",
  good: "#1a6b3a",
  caution: "#f59e0b",
  bad: "#b91c1c",
  dark: "#0d0d10",
};

export const FPS = 30;
