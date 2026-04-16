import { parse, formatHex, formatCss, converter, clampChroma } from "culori";
import type { Oklch } from "culori";

const toOklch = converter("oklch");

/**
 * Parse any CSS color string to OKLCH.
 */
export function parseToOklch(color: string): Oklch {
  const parsed = parse(color);
  if (!parsed) throw new Error(`Invalid color: ${color}`);
  return toOklch(parsed);
}

/**
 * Convert an OKLCH color to hex string.
 */
export function oklchToHex(color: Oklch): string {
  const clamped = clampChroma(color, "oklch");
  return formatHex(clamped);
}

/**
 * Format an OKLCH color as a CSS oklch() string.
 */
export function oklchToCss(color: Oklch): string {
  const clamped = clampChroma(color, "oklch");
  return formatCss(clamped);
}

/**
 * Create an OKLCH color object.
 */
export function oklch(l: number, c: number, h: number): Oklch {
  return { mode: "oklch", l, c, h };
}

/**
 * Clamp to sRGB gamut using culori's perceptual chroma reduction.
 */
export function gamutClamp(color: Oklch): Oklch {
  return clampChroma(color, "oklch") as Oklch;
}
