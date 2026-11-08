// Köpenick copy of the Mauer light presets (+ dusk, morning).
// Light presets per time of day. The sun is CAMERA-RELATIVE and frozen per shot (world.ts update()):
// az = degrees from the shot camera's forward axis (0 = sun straight ahead = backlight, +90 = screen right,
// 180 = behind camera), el = elevation. lit/shade/lift are LINEAR RGB multipliers for shade.ts (may exceed 1).
// Field names follow lighting.md 9.1 exactly (the CHAR and POST agents read them); values are tuned on renders.
type C3 = [number, number, number];
export type LightPreset = {
  az: number; el: number;
  lit: C3; shade: C3; lift: C3; lambert: number; sideK: number; term: number;      // world two-tone (shade.ts)
  charTint: C3; charShade: number; charGrad: number; bodyGrad: number; sideTint: C3; // character cards (cast.ts)
  blob: C3; actorShadow: boolean;                                                    // contact blobs / card shadows
  top: string; hor: string; skyCurve: C3; fog: string; fogNear: number; fogFar: number; sunDisc: string; // depth.md 6.5
  sunCol: string; sunI: number; sky: string; ground: string; hemiI: number;         // three lights (unpatched mats only)
  bias: number; normalBias: number;
};
export type LightName = "day" | "golden" | "night" | "indoor" | "dusk" | "morning" | "fog";
export const LIGHTS: Record<LightName, LightPreset> = {
  day: {
    az: 75, el: 48,
    lit: [1.58, 1.5, 1.33], shade: [0.3, 0.29, 0.36], lift: [0.05, 0.06, 0.11], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.94, 0.92], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.92, 0.90, 0.96],
    blob: [0.62, 0.58, 0.58], actorShadow: false,
    top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0.0, 0.5, 0.6], fog: "#b8d0ec", fogNear: 70, fogFar: 760, sunDisc: "#000000",
    sunCol: "#fff3e0", sunI: 2.8, sky: "#dcecff", ground: "#b49a78", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
  golden: {
    az: 6, el: 7,
    lit: [1.5, 0.68, 0.24], shade: [0.15, 0.15, 0.3], lift: [0.04, 0.06, 0.17], lambert: 0.35, sideK: 0.82, term: 0.07,
    charTint: [1.0, 0.78, 0.56], charShade: 0.88, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.85, 0.80, 0.95],
    blob: [0.75, 0.74, 0.9], actorShadow: true,
    top: "#6a4f8c", hor: "#ffd08a", skyCurve: [0.05, 0.6, 1.0], fog: "#efb489", fogNear: 50, fogFar: 380, sunDisc: "#ffcf9e",
    sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.5,
    bias: -0.0006, normalBias: 0.03,
  },
  // night (Mauer short): moonlight from behind-right, deep blue shade, faces kept readable by the card tint normalisation;
  // warm practicals (lamps, windows) are emissive + bloom in world.ts
  night: {
    az: 135, el: 38,
    lit: [0.43, 0.48, 0.82], shade: [0.16, 0.18, 0.38], lift: [0.03, 0.04, 0.1], lambert: 0.3, sideK: 0.85, term: 0.2,
    charTint: [0.8, 0.86, 1.0], charShade: 0.88, charGrad: 0.08, bodyGrad: 0.22, sideTint: [0.82, 0.84, 1.0],
    blob: [0.6, 0.62, 0.8], actorShadow: false,
    top: "#121845", hor: "#3a4486", skyCurve: [0.0, 0.5, 0.6], fog: "#323c7c", fogNear: 40, fogFar: 520, sunDisc: "#000000",
    sunCol: "#c8d4ff", sunI: 2.0, sky: "#3a4486", ground: "#1c1a30", hemiI: 0.4,
    bias: -0.00025, normalBias: 0.015,
  },
  // indoor press room: warm ceiling light from high front-right
  indoor: {
    az: 55, el: 58,
    lit: [1.5, 1.33, 1.06], shade: [0.46, 0.38, 0.44], lift: [0.06, 0.04, 0.05], lambert: 0.3, sideK: 0.88, term: 0.25,
    charTint: [1.0, 0.92, 0.84], charShade: 0.88, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.94, 0.88, 0.92],
    blob: [0.6, 0.55, 0.55], actorShadow: false,
    top: "#d9b98f", hor: "#e8cfa8", skyCurve: [0.0, 0.5, 0.6], fog: "#e8cfa8", fogNear: 200, fogFar: 1200, sunDisc: "#000000",
    sunCol: "#ffe6c4", sunI: 2.6, sky: "#f3dcc0", ground: "#8a6a50", hemiI: 0.5,
    bias: -0.0003, normalBias: 0.012,
  },
  // Köpenick: fair at dusk (low warm sun behind the stage, violet shade, practicals on)
  dusk: {
    az: 20, el: 8,
    lit: [1.35, 0.78, 0.46], shade: [0.17, 0.16, 0.32], lift: [0.05, 0.05, 0.15], lambert: 0.35, sideK: 0.84, term: 0.08,
    charTint: [1.0, 0.84, 0.72], charShade: 0.88, charGrad: 0.09, bodyGrad: 0.22, sideTint: [0.86, 0.82, 0.96],
    blob: [0.7, 0.68, 0.86], actorShadow: false,
    top: "#3b3a78", hor: "#ffb27a", skyCurve: [0.05, 0.6, 1.0], fog: "#d99a8c", fogNear: 45, fogFar: 380, sunDisc: "#ffcf9e",
    sunCol: "#ffab5e", sunI: 4.5, sky: "#c8a8c0", ground: "#6a5a70", hemiI: 0.5,
    bias: -0.0006, normalBias: 0.03,
  },
  // Ballon: cool early morning in the forest (low soft sun from the side, pale haze)
  morning: {
    az: 70, el: 22,
    lit: [1.4, 1.36, 1.28], shade: [0.34, 0.36, 0.46], lift: [0.05, 0.06, 0.1], lambert: 0.32, sideK: 0.86, term: 0.2,
    charTint: [1.0, 0.97, 0.95], charShade: 0.88, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.9, 0.9, 0.98],
    blob: [0.6, 0.58, 0.62], actorShadow: false,
    top: "#8fb0d8", hor: "#dfe6ea", skyCurve: [0.0, 0.5, 0.6], fog: "#cfd9df", fogNear: 18, fogFar: 260, sunDisc: "#000000",
    sunCol: "#f4f6ff", sunI: 2.6, sky: "#e8eef8", ground: "#7a6a60", hemiI: 0.5,
    bias: -0.0003, normalBias: 0.015,
  },
  // Ballon: night fog (first attempt): flat blue-grey moon haze, short fog
  fog: {
    az: 140, el: 40,
    lit: [0.5, 0.56, 0.78], shade: [0.24, 0.27, 0.42], lift: [0.05, 0.06, 0.12], lambert: 0.25, sideK: 0.88, term: 0.25,
    charTint: [0.82, 0.88, 1.0], charShade: 0.9, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.85, 0.87, 1.0],
    blob: [0.6, 0.62, 0.8], actorShadow: false,
    top: "#2a3462", hor: "#56628e", skyCurve: [0.0, 0.5, 0.6], fog: "#58648c", fogNear: 6, fogFar: 85, sunDisc: "#000000",
    sunCol: "#c8d4ff", sunI: 2.0, sky: "#3a4486", ground: "#1c1a30", hemiI: 0.4,
    bias: -0.00025, normalBias: 0.015,
  },
};

/** world-only look per light (sky stops by elevation in degrees, river colours, cloud palette). All colours are
 *  ON-SCREEN targets under the current PBR-Neutral tone map; world.ts pre-inverts the tone map (shade.ts untone). */
export type WorldLook = {
  sky: { c: string[]; e: number[] };                         // 5 stops: c[i] at elevation e[i] (deg), smoothstep between
  water: { near: string; mid: string; far: string; crest: string; trough: string; glint: string; shade: C3 };
  bounce: C3;                                                 // shade.ts uBounce: albedo x bounce on shaded faces turned to the lens
  sat: number;                                                // shade.ts uSat: world albedo saturation (1 = as painted)
  cloud: { lit: string; mid: string; shade: string };
};
export const LOOK: Record<LightName, WorldLook> = {
  day: {
    // depth.md 2.2: horizon #9fb6e6 just above the skyline, upper sky #5e93d9 at ~20 deg (grade: frame top #5997e2)
    sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0, 0, 0],
    sat: 1.08,
  },
  golden: {
    // sunset, not dusk: #ffd08a horizon, peach/orange through ~10 deg, warm rose at 20, muted warm mauve only near the top
    // (the golden grade adds ~+11/255 blue to shadows/mids, so these lean warm)
    sky: { c: ["#ffc47c", "#f7ae78", "#e8967c", "#c4848e", "#8a6f8a"], e: [0, 4, 10, 20, 40] },
    water: { near: "#1e3a6e", mid: "#355f96", far: "#d4a48e", crest: "#d9a088", trough: "#16294f", glint: "#ffe2b0", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.1,
  },
  night: {
    sky: { c: ["#3e4a8e", "#34407f", "#26306a", "#1b2356", "#10163e"], e: [0, 3, 8, 16, 40] },
    water: { near: "#1e3a6e", mid: "#203c70", far: "#28407a", crest: "#4a64a0", trough: "#10204a", glint: "#c0d0ff", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#5a66a8", mid: "#465294", shade: "#323c78" },
    bounce: [0, 0, 0],
    sat: 0.78,
  },
  indoor: {
    sky: { c: ["#e8cfa8", "#e2c49a", "#d9b98f", "#d0ad84", "#c8a47a"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0.03, 0.015, 0.0],
    sat: 1.05,
  },
  dusk: {
    sky: { c: ["#ffb47a", "#f0988a", "#b47a98", "#665a96", "#2f3470"], e: [0, 4, 10, 20, 42] },
    water: { near: "#1e3a6e", mid: "#355f96", far: "#d4a48e", crest: "#d9a088", trough: "#16294f", glint: "#ffe2b0", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#ffc29a", mid: "#d08a98", shade: "#6c6aa4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.08,
  },
  morning: {
    sky: { c: ["#dfe6ea", "#cfdbe6", "#b4c8e0", "#9fbadc", "#86a8d4"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0, 0, 0],
    sat: 1.0,
  },
  fog: {
    sky: { c: ["#58648c", "#4c5884", "#3e4a7a", "#323e6c", "#242e58"], e: [0, 3, 8, 16, 40] },
    water: { near: "#1e3a6e", mid: "#203c70", far: "#28407a", crest: "#4a64a0", trough: "#10204a", glint: "#c0d0ff", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#5a66a8", mid: "#465294", shade: "#323c78" },
    bounce: [0, 0, 0],
    sat: 0.95,
  },

};
