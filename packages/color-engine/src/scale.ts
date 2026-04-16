import type { ColorScale } from "@hueshift/types";
import { parseToOklch, oklchToHex, oklchToCss, oklch, gamutClamp } from "./oklch.js";

/**
 * Lightness stops tuned for each scale position.
 * Wider spacing in the mid-tones gives the palette more visual range.
 */
const LIGHTNESS_STOPS: Record<keyof ColorScale, number> = {
  50:  0.97,
  100: 0.93,
  200: 0.87,
  300: 0.78,
  400: 0.68,
  500: 0.58,
  600: 0.48,
  700: 0.39,
  800: 0.31,
  900: 0.23,
  950: 0.16,
};

/**
 * Chroma curve — the key to beautiful scales.
 * Peak chroma lands at 400-500 where the eye is most sensitive.
 * Tails off steeply at extremes (pure whites/blacks can't hold chroma).
 * Values are multipliers against the base color's chroma.
 */
const CHROMA_CURVE: Record<keyof ColorScale, number> = {
  50:  0.10,
  100: 0.22,
  200: 0.45,
  300: 0.72,
  400: 0.92,
  500: 1.0,
  600: 0.95,
  700: 0.80,
  800: 0.62,
  900: 0.42,
  950: 0.28,
};

/**
 * Hue rotation curve — warm shift toward light end, cool shift toward dark end.
 * This mimics how natural materials behave under varying illumination:
 * highlights trend warmer, shadows trend cooler.
 */
const HUE_SHIFT: Record<keyof ColorScale, number> = {
  50:  4,
  100: 3,
  200: 2,
  300: 1,
  400: 0,
  500: 0,
  600: -1,
  700: -2,
  800: -3,
  900: -4,
  950: -5,
};

/**
 * Some hues need their chroma capped to stay in gamut without ugly clipping.
 * Blues and purples can push harder; yellows and cyans clip early.
 */
function maxChromaForHue(h: number): number {
  // Normalize hue
  h = ((h % 360) + 360) % 360;
  // Yellow zone (80-110) clips at lower chroma
  if (h >= 80 && h <= 110) return 0.16;
  // Cyan zone (170-200) also limited
  if (h >= 170 && h <= 200) return 0.14;
  // Red-magenta can go high
  if (h >= 0 && h <= 40 || h >= 330) return 0.28;
  // Blue-purple sweet spot
  if (h >= 250 && h <= 310) return 0.26;
  return 0.22;
}

const SCALE_KEYS: (keyof ColorScale)[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

/**
 * Generate an 11-shade OKLCH color scale from a base color.
 * Uses perceptually-tuned curves with hue-aware chroma capping.
 */
export function generateScale(baseColor: string): {
  scale: ColorScale;
  oklchScale: Record<keyof ColorScale, string>;
} {
  const base = parseToOklch(baseColor);
  const baseChroma = base.c ?? 0;
  const baseHue = base.h ?? 0;
  const maxC = maxChromaForHue(baseHue);

  const scale = {} as ColorScale;
  const oklchScale = {} as Record<keyof ColorScale, string>;

  for (const stop of SCALE_KEYS) {
    const l = LIGHTNESS_STOPS[stop];
    // Apply chroma curve, but clamp to hue-specific maximum
    const rawC = baseChroma * CHROMA_CURVE[stop];
    const c = Math.min(rawC, maxC * CHROMA_CURVE[stop]);
    const h = baseHue + HUE_SHIFT[stop];

    const color = gamutClamp(oklch(l, c, h));
    scale[stop] = oklchToHex(color);
    oklchScale[stop] = oklchToCss(color);
  }

  return { scale, oklchScale };
}

/**
 * Find the scale stop closest to a given color's lightness.
 */
export function findClosestStop(color: string): keyof ColorScale {
  const parsed = parseToOklch(color);
  const l = parsed.l;
  let closest: keyof ColorScale = 500;
  let minDist = Infinity;

  for (const stop of SCALE_KEYS) {
    const dist = Math.abs(LIGHTNESS_STOPS[stop] - l);
    if (dist < minDist) {
      minDist = dist;
      closest = stop;
    }
  }

  return closest;
}
