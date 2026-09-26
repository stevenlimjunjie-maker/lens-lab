/**
 * All platform specific copy lives here so it can be reviewed in one place.
 * Rules: no invented specs, approximate focal lengths only, and "on supported
 * models" wherever a feature depends on the phone.
 */

import type { SceneId } from "./scenes";

export type Platform = "samsung" | "iphone";

export const PLATFORM_LABEL: Record<Platform, string> = {
  samsung: "On Samsung",
  iphone: "On iPhone",
};

// ---------------------------------------------------------------- lenses

export type LensId = "ultra" | "main" | "tele";

export type LensInfo = {
  id: LensId;
  name: string;
  zoom: number;
  button: string;
  focal: string;
  bestFor: string[];
  watchOut: string;
};

export const LENSES: LensInfo[] = [
  {
    id: "ultra",
    name: "Ultra-wide",
    zoom: 0.5,
    button: "0.5x",
    focal: "approx. 13mm equivalent",
    bestFor: ["Big landscapes and skies", "Architecture and interiors", "Tight spaces and group shots"],
    watchOut:
      "Straight lines bend and faces near the edges stretch. Keep people towards the centre and hold the phone level. Ultra-wide cameras are often weaker in low light.",
  },
  {
    id: "main",
    name: "Main (wide)",
    zoom: 1,
    button: "1x",
    focal: "approx. 24 to 26mm equivalent",
    bestFor: ["Everyday photos", "Low light and Night mode", "The sharpest, cleanest detail"],
    watchOut:
      "This is usually the biggest sensor with the brightest lens, so switch back to 1x when light gets poor.",
  },
  {
    id: "tele",
    name: "Telephoto",
    zoom: 3,
    button: "3x",
    focal: "approx. 2x to 5x, depending on model",
    bestFor: ["Portraits with flattering proportions", "Compressed backgrounds and stacked layers", "Details you cannot walk closer to"],
    watchOut:
      "Available on supported models only. It gathers less light than the main camera, so in dim scenes the phone may quietly crop the main camera instead.",
  },
];

export const LENS_NOTES = {
  samsung:
    "Tap the lens buttons above the shutter (for example 0.6x or 0.5x, 1x, and a telephoto option on supported models) or pinch to zoom. Numbers vary by model. Beyond the longest optical lens you are cropping, and detail drops fast.",
  iphone:
    "Tap 0.5x, 1x and the telephoto button (2x, 3x or 5x depending on model) above the shutter, or touch and hold a button to open the zoom dial. Some models offer a 2x option cropped from the high resolution main sensor.",
};

// ---------------------------------------------------------------- where controls live

export type ControlLocation = { control: string; samsung: string; iphone: string };

export const CONTROL_LOCATIONS: ControlLocation[] = [
  {
    control: "ISO and shutter speed",
    samsung: "Camera, More, Pro. Tap ISO or Speed and drag the scale. Pro mode allows long exposures on many models.",
    iphone:
      "Not available as manual controls in the stock Camera app. The phone sets them automatically. Third-party apps such as Halide or Lightroom Mobile offer manual ISO and shutter.",
  },
  {
    control: "Exposure compensation (EV)",
    samsung: "In Photo mode, tap to focus then drag the brightness slider. In Pro mode, tap EV (available while ISO or speed is on Auto).",
    iphone: "Tap to focus, then drag the sun icon up or down. Or tap the arrow at the top, then the plus minus icon, and slide.",
  },
  {
    control: "White balance",
    samsung: "Pro mode, WB. Drag the Kelvin scale or pick Auto.",
    iphone:
      "No Kelvin control in the stock app. Photographic Styles (on supported models) change the overall look. Fix colour afterwards with Warmth and Tint in Photos.",
  },
  {
    control: "Manual focus",
    samsung: "Pro mode, Focus (MF). Drag the slider; focus peaking outlines sharp edges in colour on supported models.",
    iphone: "Tap to focus. Touch and hold to lock focus and exposure (AE/AF LOCK). No manual focus slider in the stock app.",
  },
  {
    control: "Metering",
    samsung: "Pro mode, metering icon: Centre-weighted, Matrix or Spot.",
    iphone: "Automatic. Tapping the screen sets the point the camera focuses and meters on.",
  },
  {
    control: "RAW",
    samsung:
      "Turn on RAW copies in camera settings (in Advanced picture options on many models) and shoot in Pro mode, or use the Expert RAW app on supported models.",
    iphone: "On Pro models: Settings, Camera, Formats, turn on Apple ProRAW. Then tap RAW in the camera.",
  },
];

// ---------------------------------------------------------------- pro controls module

export const WB_PRESETS = [
  { k: 2800, label: "Candle or tungsten bulb" },
  { k: 3200, label: "Warm indoor lamp" },
  { k: 4000, label: "Fluorescent or neutral LED" },
  { k: 5500, label: "Daylight or flash" },
  { k: 6500, label: "Cloudy sky" },
  { k: 7500, label: "Open shade" },
];

export const METERING = [
  {
    id: "matrix" as const,
    name: "Matrix",
    alt: "also called evaluative or multi",
    text: "Reads the whole frame and balances it. Great for most scenes, but a big bright sky can pull a face too dark.",
  },
  {
    id: "center" as const,
    name: "Centre-weighted",
    alt: "",
    text: "Averages the frame but gives most weight to the middle. Predictable for portraits with the subject in the centre.",
  },
  {
    id: "spot" as const,
    name: "Spot",
    alt: "",
    text: "Measures only a small point. Put it on the face or subject you care about and everything else follows. Tap the photo to move the spot.",
  },
];

export const RAW_POINTS = [
  "JPEG and HEIF files are processed and compressed in the phone. Clipped highlights are gone for good.",
  "RAW keeps more of the sensor data: more latitude to recover skies, lift shadows and fix white balance later.",
  "RAW files are much larger and need editing. Phone processing (like multi-frame noise reduction) is partly or fully skipped, depending on the RAW mode.",
];

export const RAW_PLATFORM = {
  samsung: [
    "Pro mode can save a RAW copy (DNG) next to the JPEG once RAW is turned on in camera settings.",
    "Expert RAW (a separate app or a mode in More on supported models) combines multi-frame processing with a DNG file and manual controls.",
    "Resolution: most photos are saved at a pixel-binned 12MP by default; a high resolution mode is available on supported models for good light.",
  ],
  iphone: [
    "Apple ProRAW on Pro models keeps Apple's multi-frame processing and still gives a flexible DNG file.",
    "High resolution (48MP) capture is available on supported models; the default is a smaller, binned file.",
    "Without ProRAW, third-party apps can capture RAW on many models.",
  ],
};

// ---------------------------------------------------------------- phone features overview

export const FEATURES: Record<Platform, { name: string; text: string }[]> = {
  samsung: [
    { name: "Pro mode", text: "Manual ISO, shutter speed, EV, white balance in Kelvin, manual focus with focus peaking, and metering modes." },
    { name: "Pro Video", text: "The same manual controls for video, plus audio options, on supported models." },
    { name: "Expert RAW", text: "Multi-frame RAW capture with manual controls, on supported models." },
    { name: "Night mode", text: "Captures several frames over a few seconds and merges them. Hold still until it finishes." },
    { name: "Portrait", text: "Simulates background blur. Adjust blur strength while shooting and change the effect later in Gallery." },
    { name: "Scene optimizer", text: "Auto adjusts colour and contrast for detected scenes. Turn it off in camera settings for a more natural look." },
    { name: "Resolution modes", text: "Pick default binned 12MP or a high resolution option (on supported models) from the top bar." },
  ],
  iphone: [
    { name: "Exposure compensation", text: "Brighten or darken the automatic exposure, from -2 to +2." },
    { name: "AE/AF Lock", text: "Touch and hold to lock focus and exposure, so recomposing does not change them." },
    { name: "Night mode", text: "Turns on in low light. Tap the moon icon to change the capture time; on a tripod it can go longer." },
    { name: "Portrait", text: "Tap the f-number to adjust depth control while shooting or later in Photos, and choose Portrait Lighting effects." },
    { name: "Photographic Styles", text: "Set a consistent tone and warmth that is applied as you shoot, on supported models." },
    { name: "ProRAW and 48MP", text: "Flexible RAW files and high resolution capture on Pro models and other supported models." },
    { name: "Macro", text: "Switches to the ultra-wide camera for close focus on supported models. A macro toggle can be shown in settings." },
    { name: "Live Photo Long Exposure", text: "Turn a Live Photo of moving water or traffic into a smooth long exposure in Photos." },
  ],
};

// ---------------------------------------------------------------- scenario presets

export type Preset = {
  id: string;
  name: string;
  scene: SceneId;
  iso: number;
  shutter: number;
  ev: number;
  wbK: number;
  handheld: boolean;
  portrait?: boolean;
  summary: string;
  why: string[];
  samsung: string[];
  iphone: string[];
  cheat: { iso: string; shutter: string; ev: string; wb: string; samsung: string; iphone: string };
};

export const PRESETS: Preset[] = [
  {
    id: "portrait",
    name: "Portrait",
    scene: "portrait",
    iso: 64,
    shutter: 1 / 250,
    ev: 0.3,
    wbK: 5600,
    handheld: true,
    portrait: true,
    summary: "Sharp eyes, soft background, natural skin.",
    why: [
      "1/250s freezes small movements and expressions.",
      "Low ISO keeps skin smooth and free of grain.",
      "Portrait mode simulates a wide aperture to blur the background, because the phone lens itself has a fixed aperture.",
      "A touch of +EV keeps faces bright, especially against a bright sky.",
    ],
    samsung: [
      "Open Camera and swipe to Portrait.",
      "Pick a background effect and set the blur strength.",
      "Tap the face to focus, then nudge brightness up slightly.",
      "Use the telephoto option on supported models for more flattering proportions.",
      "Adjust the blur later in Gallery if needed.",
    ],
    iphone: [
      "Swipe to Portrait and step back until the label turns yellow.",
      "Tap the f-number and slide to set the depth effect.",
      "Tap the face, then drag the sun icon up a little.",
      "Choose a Portrait Lighting effect if you like.",
      "Change the f-number later in Photos, Edit.",
    ],
    cheat: {
      iso: "50 to 200",
      shutter: "1/250s or faster",
      ev: "0 to +0.3",
      wb: "Auto or 5500K",
      samsung: "Portrait mode, telephoto on supported models, adjust blur after in Gallery",
      iphone: "Portrait mode, tap f-number for depth, adjust later in Photos",
    },
  },
  {
    id: "night",
    name: "Night",
    scene: "night",
    iso: 1250,
    shutter: 1 / 25,
    ev: -0.3,
    wbK: 3400,
    handheld: true,
    summary: "Clean, bright city lights without blowing out the lamps.",
    why: [
      "Night mode merges several frames, which cuts noise far below a single high ISO shot.",
      "Around 1/25s handheld is the slowest most people can hold with stabilisation; brace against something.",
      "A little -EV keeps street lamps and signs from clipping to white.",
      "A warmer Kelvin (about 3400K) keeps street light looking natural rather than orange.",
    ],
    samsung: [
      "Let Night mode switch on, or pick it from More.",
      "Hold still (or use a tripod) until the capture finishes.",
      "For manual control, use Pro mode: ISO 800 to 1600, speed about 1/25s, WB about 3400K.",
      "Tap the brightest light and lower EV if it clips.",
    ],
    iphone: [
      "Night mode turns on automatically; the moon icon shows the seconds.",
      "Tap the moon icon to set the capture time (longer on a tripod).",
      "Tap a light and drag the sun icon down a little to protect highlights.",
      "Hold still until the capture finishes.",
    ],
    cheat: {
      iso: "800 to 1600 (Night mode stacks frames)",
      shutter: "1/15 to 1/30s handheld, longer on a tripod",
      ev: "-0.3 to -0.7",
      wb: "3200 to 4000K",
      samsung: "Night mode, or Pro mode on a tripod",
      iphone: "Night mode, tap moon icon to set time, tripod for longer",
    },
  },
  {
    id: "sports",
    name: "Sports and action",
    scene: "street",
    iso: 160,
    shutter: 1 / 1000,
    ev: 0,
    wbK: 5500,
    handheld: true,
    summary: "Freeze fast movement.",
    why: [
      "1/1000s stops a cyclist or runner cold. 1/250s is the minimum for most action.",
      "Raise ISO as needed to keep the shutter fast. A little grain beats a blurry subject.",
      "Burst mode gives you more chances at the peak moment.",
    ],
    samsung: [
      "Pro mode: set Speed to 1/1000s and ISO to Auto, or raise ISO yourself.",
      "Swipe the shutter button to the edge to shoot a burst (choose this in camera settings).",
      "Pre-focus by tapping where the action will be.",
    ],
    iphone: [
      "The stock app has no shutter control. Shoot in good light so it picks a fast speed.",
      "Slide the shutter button to the left to shoot a burst on supported models.",
      "Tap and hold where the action will be to lock focus and exposure.",
      "For a fixed shutter speed, use a third-party manual camera app.",
    ],
    cheat: {
      iso: "Auto or 200 to 800",
      shutter: "1/500 to 1/2000s",
      ev: "0",
      wb: "Auto",
      samsung: "Pro mode shutter priority style: fast speed, ISO Auto, burst",
      iphone: "Good light, burst, AE/AF lock, or a manual app",
    },
  },
  {
    id: "food",
    name: "Food",
    scene: "food",
    iso: 320,
    shutter: 1 / 60,
    ev: 0.3,
    wbK: 3000,
    handheld: true,
    summary: "True colours under warm restaurant light.",
    why: [
      "Warm bulbs make everything orange. Setting about 3000K neutralises the cast.",
      "1/60s is safe handheld for a still plate.",
      "A little +EV gives a bright, appetising look.",
      "Shoot from above or at 45 degrees with window light when you can.",
    ],
    samsung: [
      "Food mode (in More on supported models) adds a selective blur and colour boost.",
      "Or Pro mode: WB about 3000K, ISO 200 to 400, speed about 1/60s.",
      "Tap the dish to focus and lift brightness slightly.",
    ],
    iphone: [
      "Tap the dish to focus and drag the sun icon up a little.",
      "Turn off flash and use window light.",
      "Fix the warm cast afterwards with Warmth in Photos, or use a Photographic Style.",
      "Get close with Macro on supported models for texture.",
    ],
    cheat: {
      iso: "100 to 400",
      shutter: "1/60s or faster",
      ev: "+0.3",
      wb: "Match the light, 2800 to 3400K indoors",
      samsung: "Food mode or Pro mode with Kelvin WB",
      iphone: "Tap to focus, lift EV, fix Warmth in Photos",
    },
  },
  {
    id: "landscape",
    name: "Landscape",
    scene: "landscape",
    iso: 50,
    shutter: 1 / 500,
    ev: -0.3,
    wbK: 5500,
    handheld: true,
    summary: "Detail from the sky to the foreground.",
    why: [
      "Lowest ISO for the cleanest detail.",
      "-EV protects the bright sky; shadows can be lifted later, clipped skies cannot.",
      "Daylight WB (about 5500K) keeps golden hour warmth instead of neutralising it.",
      "Phone lenses already have deep depth of field, so near and far stay sharp.",
    ],
    samsung: [
      "Use 1x for the best quality, or 0.6x or 0.5x for big skies.",
      "Pro mode: ISO 50 to 100, WB 5500K, EV -0.3.",
      "Turn on the grid lines in settings and keep the horizon level.",
      "Try the high resolution mode on supported models in good light.",
    ],
    iphone: [
      "Use 1x, or 0.5x for sweeping views.",
      "Tap the sky and drag the sun icon down until the clouds show detail.",
      "Turn on Grid and Level in Settings, Camera.",
      "Shoot ProRAW on Pro models to rescue the sky later.",
    ],
    cheat: {
      iso: "Lowest (50 to 100)",
      shutter: "1/250s or faster handheld",
      ev: "-0.3 to -0.7",
      wb: "5500K to keep warm light",
      samsung: "Pro mode low ISO, grid, high resolution mode on supported models",
      iphone: "Lower EV for the sky, Grid and Level, ProRAW on Pro models",
    },
  },
  {
    id: "street",
    name: "Street",
    scene: "street",
    iso: 100,
    shutter: 1 / 800,
    ev: -0.3,
    wbK: 5500,
    handheld: true,
    summary: "Quick, sharp candids in daylight.",
    why: [
      "1/500s or faster freezes people walking or cycling past.",
      "Slight -EV keeps skies and white walls from blowing out.",
      "Fixed settings mean you can shoot the moment without fiddling.",
    ],
    samsung: [
      "Pro mode: speed 1/500s or faster, ISO Auto, EV -0.3.",
      "Use Quick launch (double press the side key) to open the camera fast.",
      "Tap and pre-focus on the spot where people will pass.",
    ],
    iphone: [
      "Open the camera from the lock screen or with the Camera Control or Action button on supported models.",
      "Touch and hold to lock focus and exposure on the spot people will pass.",
      "Drag the sun icon down a little in bright sun.",
    ],
    cheat: {
      iso: "100 to 400",
      shutter: "1/500s or faster",
      ev: "-0.3",
      wb: "Auto or 5500K",
      samsung: "Pro mode fast speed, Quick launch",
      iphone: "AE/AF lock on the spot, lower EV slightly",
    },
  },
  {
    id: "indoor",
    name: "Low-light indoor",
    scene: "indoor",
    iso: 1600,
    shutter: 1 / 160,
    ev: 0,
    wbK: 2900,
    handheld: true,
    summary: "Pets and kids indoors without motion blur.",
    why: [
      "Moving pets need 1/125s to 1/250s even indoors.",
      "That forces ISO up. Some grain is the price of a sharp subject.",
      "Warm lamps sit around 2700 to 3000K; matching it removes the orange cast.",
      "Turn on more lights or move near a window to lower ISO.",
    ],
    samsung: [
      "Pro mode: speed 1/160s, ISO Auto (or 1600), WB about 2900K.",
      "Stay on the 1x main camera, it handles low light best.",
      "Burst for the moment the pet is facing you.",
    ],
    iphone: [
      "Add light first: lamps on, move near a window.",
      "Night mode may turn on; tap the moon icon to turn it off for moving pets.",
      "Stay on 1x and use burst.",
      "Correct warmth afterwards in Photos if skin looks orange.",
    ],
    cheat: {
      iso: "800 to 3200",
      shutter: "1/125 to 1/250s for movement",
      ev: "0",
      wb: "2700 to 3200K",
      samsung: "Pro mode fast speed, 1x lens, Kelvin WB",
      iphone: "More light, Night mode off for motion, 1x, burst",
    },
  },
];

// ---------------------------------------------------------------- quiz

export type QuizItem = {
  id: string;
  scene: SceneId;
  problem: string;
  params: {
    stops: number;
    iso?: number;
    shutter?: number;
    handheld?: boolean;
    wbK?: number;
    focus?: "near" | "far";
    portrait?: boolean;
  };
  options: string[];
  answer: number;
  explain: string;
};

export const QUIZ: QuizItem[] = [
  {
    id: "motion",
    scene: "street",
    problem: "The cyclist is smeared but the buildings are sharp.",
    params: { stops: 0, shutter: 1 / 30, iso: 50 },
    options: ["Raise EV", "Use a faster shutter speed, about 1/500s", "Switch to the ultra-wide lens", "Lower the Kelvin value"],
    answer: 1,
    explain: "Only the moving subject is blurred, so the shutter was open too long. A faster speed freezes it; raise ISO to keep the brightness.",
  },
  {
    id: "noise",
    scene: "night",
    problem: "The night shot is covered in speckles and colour blotches.",
    params: { stops: 0, iso: 6400, shutter: 1 / 250 },
    options: ["Lower ISO and use Night mode or a tripod", "Use a faster shutter", "Raise EV", "Turn on the ultra-wide lens"],
    answer: 0,
    explain: "Grain comes from high ISO. Night mode (stacking frames) or a steady, slower shutter lets you use a lower ISO.",
  },
  {
    id: "bright",
    scene: "landscape",
    problem: "The sky is pure white and the snowy peaks have no detail.",
    params: { stops: 1.7 },
    options: ["Raise ISO", "Lower EV (exposure compensation)", "Use a slower shutter", "Set white balance to 7500K"],
    answer: 1,
    explain: "Everything is too bright and the highlights are clipped. Lowering EV brings back the sky. On iPhone drag the sun icon down.",
  },
  {
    id: "orange",
    scene: "food",
    problem: "The whole dinner looks orange.",
    params: { stops: 0.2, wbK: 6500 },
    options: ["Raise EV", "Set white balance to about 3000K (or Auto)", "Use a faster shutter", "Lower ISO"],
    answer: 1,
    explain: "Warm bulbs plus a daylight or cloudy white balance give an orange cast. Match the light at about 3000K, or fix Warmth in Photos on iPhone.",
  },
  {
    id: "dark",
    scene: "indoor",
    problem: "The living room is murky and the dog is hard to see.",
    params: { stops: -2.2, iso: 400, shutter: 1 / 250 },
    options: ["Lower ISO", "Raise ISO or EV to brighten", "Use a faster shutter", "Switch to spot metering on the lamp"],
    answer: 1,
    explain: "The exposure is about two stops under. Raise ISO (or EV in auto) while keeping the shutter fast enough for the dog.",
  },
  {
    id: "shake",
    scene: "night",
    problem: "Everything is doubled and blurry, even the buildings.",
    params: { stops: 0, shutter: 1 / 4, iso: 100, handheld: true },
    options: ["Raise EV", "Brace the phone or use a tripod, or a faster shutter", "Change white balance", "Switch to the telephoto lens"],
    answer: 1,
    explain: "When the whole frame is blurred it is camera shake, not subject motion. Steady the phone or use a faster shutter.",
  },
  {
    id: "focus",
    scene: "portrait",
    problem: "The trees are sharp but the face is soft.",
    params: { stops: 0, focus: "far", portrait: true },
    options: ["Tap the face to focus (or lock AE/AF on it)", "Lower ISO", "Raise EV", "Use a slower shutter"],
    answer: 0,
    explain: "Focus landed on the background. Tap the face, or touch and hold to lock focus and exposure there.",
  },
  {
    id: "blue",
    scene: "portrait",
    problem: "Skin looks cold and grey-blue on a sunny day.",
    params: { stops: 0, wbK: 3200 },
    options: ["Raise the white balance to about 5500K", "Lower EV", "Raise ISO", "Use the ultra-wide lens"],
    answer: 0,
    explain: "A tungsten white balance (3200K) in daylight turns everything blue. Set about 5500K or Auto.",
  },
];

// ---------------------------------------------------------------- about

export const SOURCES = [
  { title: "Samsung support: camera and Pro mode guides", url: "https://www.samsung.com/us/support/" },
  { title: "Apple iPhone User Guide: Camera", url: "https://support.apple.com/guide/iphone/welcome/ios" },
  { title: "Remotion documentation (video rendering)", url: "https://www.remotion.dev/docs/" },
];
