import type { HarmonyType } from "@hueshift/types";
import { parseToOklch, oklchToHex, oklchToCss, oklch, gamutClamp } from "./oklch.js";

/**
 * Harmony definitions — base offsets that get heavily randomized.
 * These are starting points, not fixed positions.
 */
const HARMONY_DEFINITIONS: Record<
  HarmonyType,
  Array<{ offset: number; chromaRange: [number, number]; lightnessRange: [number, number] }>
> = {
  mono: [
    { offset: 0, chromaRange: [0.6, 1.0], lightnessRange: [-0.08, 0.08] },
  ],
  analogous: [
    { offset: -35, chromaRange: [0.5, 0.9],  lightnessRange: [-0.05, 0.12] },
    { offset: 0,   chromaRange: [0.8, 1.0],  lightnessRange: [-0.04, 0.04] },
    { offset: 30,  chromaRange: [0.55, 0.95], lightnessRange: [-0.10, 0.06] },
  ],
  complementary: [
    { offset: 0,   chromaRange: [0.8, 1.0],  lightnessRange: [-0.04, 0.04] },
    { offset: 180, chromaRange: [0.4, 0.9],  lightnessRange: [-0.08, 0.12] },
  ],
  triadic: [
    { offset: 0,   chromaRange: [0.8, 1.0],  lightnessRange: [-0.04, 0.04] },
    { offset: 120, chromaRange: [0.35, 0.85], lightnessRange: [-0.06, 0.14] },
    { offset: 240, chromaRange: [0.3, 0.8],  lightnessRange: [-0.08, 0.10] },
  ],
  "split-complementary": [
    { offset: 0,   chromaRange: [0.8, 1.0],  lightnessRange: [-0.04, 0.04] },
    { offset: 150, chromaRange: [0.35, 0.85], lightnessRange: [-0.06, 0.12] },
    { offset: 210, chromaRange: [0.4, 0.9],  lightnessRange: [-0.08, 0.10] },
  ],
};

/**
 * Simple seeded PRNG (mulberry32).
 */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Return a random float in [min, max] using the rng */
function randRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/**
 * Generate harmony colors from a base color.
 *
 * Each call produces a DRAMATICALLY different palette — hue offsets
 * are randomized by ±25°, chroma and lightness are picked from wide
 * ranges. This is what makes pressing "regenerate" feel like coolors.co
 * rather than a subtle tweak.
 *
 * The base color (offset=0) stays closer to the user's pick (±12° hue)
 * while secondary/accent colors explore widely.
 */
export function generateHarmonyColors(
  baseColor: string,
  harmony: HarmonyType,
  options: { seed?: number } = {},
): Array<{ hex: string; oklch: string; hue: number }> {
  const base = parseToOklch(baseColor);
  const baseHue = base.h ?? 0;
  const baseChroma = base.c ?? 0;
  const baseLightness = base.l;
  const defs = HARMONY_DEFINITIONS[harmony];

  const rng = mulberry32(options.seed ?? (Date.now() ^ (Math.random() * 0xffffffff)));

  return defs.map((def) => {
    // Base color (offset=0) gets moderate exploration
    // Non-base colors get wild exploration
    const isBase = def.offset === 0;

    // Hue: base ±12°, others ±25° around their theoretical position
    const hueWander = isBase
      ? randRange(rng, -12, 12)
      : randRange(rng, -25, 25);

    // Chroma: pick from the defined range, scaled by the base chroma
    const chromaScale = randRange(rng, def.chromaRange[0], def.chromaRange[1]);

    // Lightness: pick from the defined range
    const lightnessShift = randRange(rng, def.lightnessRange[0], def.lightnessRange[1]);

    const h = (baseHue + def.offset + hueWander + 360) % 360;
    const c = Math.max(0.01, baseChroma * chromaScale);
    const l = Math.max(0.15, Math.min(0.85, baseLightness + lightnessShift));

    const color = gamutClamp(oklch(l, c, h));
    return {
      hex: oklchToHex(color),
      oklch: oklchToCss(color),
      hue: h,
    };
  });
}

/**
 * Generate neutral colors to accompany a palette.
 * Each regeneration shifts the neutral temperature (warm vs cool)
 * and saturation level significantly.
 */
export function generateNeutrals(
  baseColor: string,
  options: { seed?: number } = {},
): Array<{ hex: string; oklch: string; name: string }> {
  const base = parseToOklch(baseColor);
  const baseHue = base.h ?? 0;
  const rng = mulberry32(options.seed ?? (Date.now() ^ (Math.random() * 0xffffffff)));

  // Significant hue drift (±20°) and chroma variation (0.5x to 1.8x)
  // This makes neutrals feel warm-gray, cool-gray, or tinted differently each time
  const hueShift = randRange(rng, -20, 20);
  const chromaMult = randRange(rng, 0.5, 1.8);

  const neutralShades = [
    { name: "neutral-50",  l: 0.97, c: 0.003 },
    { name: "neutral-100", l: 0.93, c: 0.006 },
    { name: "neutral-200", l: 0.88, c: 0.010 },
    { name: "neutral-300", l: 0.80, c: 0.014 },
    { name: "neutral-400", l: 0.64, c: 0.018 },
    { name: "neutral-500", l: 0.53, c: 0.018 },
    { name: "neutral-600", l: 0.43, c: 0.016 },
    { name: "neutral-700", l: 0.35, c: 0.014 },
    { name: "neutral-800", l: 0.26, c: 0.012 },
    { name: "neutral-900", l: 0.19, c: 0.010 },
    { name: "neutral-950", l: 0.14, c: 0.008 },
  ];

  return neutralShades.map(({ name, l, c }) => {
    const color = gamutClamp(oklch(l, c * chromaMult, baseHue + hueShift));
    return {
      hex: oklchToHex(color),
      oklch: oklchToCss(color),
      name,
    };
  });
}
