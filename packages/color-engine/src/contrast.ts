import { wcagContrast } from "culori";
import type { ContrastResult, ContrastStandard, ContrastPair, ContrastReport } from "@hueshift/types";
import { parseToOklch, oklchToHex, oklch, gamutClamp } from "./oklch.js";

/**
 * WCAG 2.1 minimum contrast ratios.
 */
const WCAG_THRESHOLDS = {
  "wcag-aa": { normal: 4.5, large: 3.0 },
  "wcag-aaa": { normal: 7.0, large: 4.5 },
} as const;

/**
 * Compute WCAG 2.1 contrast ratio between two colors.
 */
export function getContrastRatio(fg: string, bg: string): number {
  const fgParsed = parseToOklch(fg);
  const bgParsed = parseToOklch(bg);
  return wcagContrast(fgParsed, bgParsed);
}

/**
 * APCA (Accessible Perceptual Contrast Algorithm) approximation.
 * Uses the APCA-W3 simplified formula.
 */
export function getApcaContrast(fg: string, bg: string): number {
  const fgOklch = parseToOklch(fg);
  const bgOklch = parseToOklch(bg);

  // APCA uses luminance (Y) — approximate from OKLCH L
  // L in OKLCH ≈ cube root of Y, so Y ≈ L^3
  const fgY = Math.pow(fgOklch.l, 3);
  const bgY = Math.pow(bgOklch.l, 3);

  // Simplified APCA polarity-aware contrast
  const SAPC = bgY > fgY
    ? (Math.pow(bgY, 0.56) - Math.pow(fgY, 0.57)) * 1.14
    : (Math.pow(bgY, 0.65) - Math.pow(fgY, 0.62)) * 1.14;

  const Lc = Math.abs(SAPC) * 100;
  return Math.round(Lc * 10) / 10;
}

/**
 * Check contrast between two colors against a standard.
 */
export function checkContrast(
  fg: string,
  bg: string,
  standard: ContrastStandard = "wcag-aa",
  textSize: "normal" | "large" = "normal",
): ContrastResult {
  if (standard === "apca") {
    const contrast = getApcaContrast(fg, bg);
    // APCA thresholds: 60+ for body text, 45+ for large text
    const threshold = textSize === "large" ? 45 : 60;
    return {
      passes: contrast >= threshold,
      ratio: contrast,
      standard: "apca",
      suggestion: contrast < threshold ? suggestFix(fg, bg, standard, textSize) : undefined,
    };
  }

  const ratio = getContrastRatio(fg, bg);
  const threshold = WCAG_THRESHOLDS[standard][textSize];
  return {
    passes: ratio >= threshold,
    ratio: Math.round(ratio * 100) / 100,
    standard,
    suggestion: ratio < threshold ? suggestFix(fg, bg, standard, textSize) : undefined,
  };
}

/**
 * Suggest an adjusted foreground color that passes the contrast threshold.
 * Shifts lightness while preserving hue and chroma.
 */
function suggestFix(
  fg: string,
  bg: string,
  standard: ContrastStandard,
  textSize: "normal" | "large",
): string | undefined {
  const fgColor = parseToOklch(fg);
  const bgColor = parseToOklch(bg);

  // Determine direction: if bg is light, darken fg; if bg is dark, lighten fg
  const direction = bgColor.l > 0.5 ? -1 : 1;
  const step = 0.02;

  let adjusted = { ...fgColor };
  for (let i = 0; i < 40; i++) {
    adjusted = { ...adjusted, l: Math.max(0, Math.min(1, adjusted.l + direction * step)) };
    const clamped = gamutClamp(adjusted);

    if (standard === "apca") {
      const contrast = getApcaContrast(oklchToHex(clamped), bg);
      const threshold = textSize === "large" ? 45 : 60;
      if (contrast >= threshold) return oklchToHex(clamped);
    } else {
      const ratio = getContrastRatio(oklchToHex(clamped), bg);
      const threshold = WCAG_THRESHOLDS[standard][textSize];
      if (ratio >= threshold) return oklchToHex(clamped);
    }
  }

  return undefined;
}

/**
 * Generate a contrast report for a set of foreground/background pairs.
 */
export function generateContrastReport(pairs: Array<{ fg: string; bg: string }>): ContrastReport {
  const results: ContrastPair[] = pairs.map(({ fg, bg }) => ({
    foreground: fg,
    background: bg,
    results: [
      checkContrast(fg, bg, "wcag-aa"),
      checkContrast(fg, bg, "wcag-aaa"),
      checkContrast(fg, bg, "apca"),
    ],
  }));

  return {
    pairs: results,
    overallPass: results.every((p) => p.results[0].passes), // AA pass as baseline
  };
}
