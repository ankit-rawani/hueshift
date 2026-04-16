import type { PaletteColor, SemanticTokens, PaletteMode } from "@hueshift/types";
import { parseToOklch, oklchToHex, oklch, gamutClamp } from "./oklch.js";
import { checkContrast } from "./contrast.js";

/**
 * Map a set of palette colors to semantic roles.
 * Produces beautiful, usable tokens — not just darkest/lightest picks.
 */
export function mapSemanticTokens(
  colors: PaletteColor[],
  mode: PaletteMode = "light",
): SemanticTokens {
  const parsed = colors.map((c) => ({
    ...c,
    oklch: parseToOklch(c.hex),
  }));

  const byLightness = [...parsed].sort((a, b) => a.oklch.l - b.oklch.l);
  const byChroma = [...parsed].sort(
    (a, b) => (b.oklch.c ?? 0) - (a.oklch.c ?? 0),
  );

  const isLight = mode === "light" || mode === "both";

  // ── Background & Foreground ──
  // For light mode: a near-white with a whisper of the dominant hue
  // For dark mode: a rich dark (not pure black) with subtle hue tinting
  const dominantHue = (byChroma[0]?.oklch.h ?? 0);

  const bgColor = isLight
    ? oklchToHex(gamutClamp(oklch(0.98, 0.004, dominantHue)))
    : oklchToHex(gamutClamp(oklch(0.15, 0.012, dominantHue)));

  const fgColor = isLight
    ? oklchToHex(gamutClamp(oklch(0.18, 0.010, dominantHue)))
    : oklchToHex(gamutClamp(oklch(0.93, 0.006, dominantHue)));

  // ── Primary ── most saturated non-neutral
  const primaryEntry = byChroma.find((c) => (c.oklch.c ?? 0) > 0.04) ?? byChroma[0];
  const primaryHex = primaryEntry.hex;
  const primaryFg = computeContrastingFg(primaryHex, dominantHue);

  // ── Secondary ── desaturated version of primary for subtle emphasis
  const secondaryL = isLight ? 0.94 : 0.22;
  const secondaryC = isLight ? 0.015 : 0.025;
  const secondaryHex = oklchToHex(gamutClamp(oklch(secondaryL, secondaryC, dominantHue)));
  const secondaryFg = isLight
    ? oklchToHex(gamutClamp(oklch(0.35, 0.02, dominantHue)))
    : oklchToHex(gamutClamp(oklch(0.80, 0.015, dominantHue)));

  // ── Muted ── for disabled states, subtle backgrounds
  const mutedL = isLight ? 0.95 : 0.20;
  const mutedC = isLight ? 0.008 : 0.015;
  const mutedHex = oklchToHex(gamutClamp(oklch(mutedL, mutedC, dominantHue)));
  const mutedFgL = isLight ? 0.50 : 0.60;
  const mutedFg = oklchToHex(gamutClamp(oklch(mutedFgL, 0.015, dominantHue)));

  // ── Accent ── hue-distant from primary for visual pop
  const primaryHue = primaryEntry.oklch.h ?? 0;
  const accentCandidates = byChroma.filter(
    (c) =>
      c !== primaryEntry &&
      (c.oklch.c ?? 0) > 0.03 &&
      Math.abs(((c.oklch.h ?? 0) - primaryHue + 180) % 360 - 180) > 25,
  );
  const accentEntry = accentCandidates[0] ?? byChroma[1] ?? primaryEntry;
  const accentHex = accentEntry.hex;
  const accentFg = computeContrastingFg(accentHex, accentEntry.oklch.h ?? 0);

  // ── Destructive ── contextual red/coral that harmonizes with the palette
  const redHue = findBestDestructiveHue(dominantHue);
  const destructiveL = isLight ? 0.55 : 0.60;
  const destructiveHex = oklchToHex(gamutClamp(oklch(destructiveL, 0.22, redHue)));
  const destructiveFg = computeContrastingFg(destructiveHex, redHue);

  // ── Border ── subtle, harmonized
  const borderL = isLight ? 0.88 : 0.28;
  const borderC = isLight ? 0.008 : 0.012;
  const borderColor = oklchToHex(gamutClamp(oklch(borderL, borderC, dominantHue)));

  // ── Ring ── primary at higher lightness, lower chroma (focus rings)
  const ringColor = oklchToHex(
    gamutClamp(
      oklch(
        Math.min(0.80, (primaryEntry.oklch.l) + 0.15),
        (primaryEntry.oklch.c ?? 0) * 0.5,
        primaryHue,
      ),
    ),
  );

  return {
    background: bgColor,
    foreground: fgColor,
    primary: primaryHex,
    "primary-foreground": primaryFg,
    secondary: secondaryHex,
    "secondary-foreground": secondaryFg,
    muted: mutedHex,
    "muted-foreground": mutedFg,
    accent: accentHex,
    "accent-foreground": accentFg,
    destructive: destructiveHex,
    "destructive-foreground": destructiveFg,
    border: borderColor,
    ring: ringColor,
  };
}

/**
 * Find a destructive-red hue that doesn't clash with the dominant palette hue.
 * If the palette is already red-ish, shift the destructive toward coral/orange.
 */
function findBestDestructiveHue(dominantHue: number): number {
  const baseRed = 25; // OKLCH red-orange
  const distance = Math.abs(((dominantHue - baseRed + 180) % 360) - 180);

  // If the palette is already near red, shift destructive to be distinguishable
  if (distance < 40) {
    return dominantHue > baseRed ? 5 : 40; // Push to crimson or orange
  }
  return baseRed;
}

/**
 * Compute a foreground color that has AA contrast against the given background.
 * Uses tinted near-white/near-black instead of pure white/black for cohesion.
 */
function computeContrastingFg(bgHex: string, hue: number = 0): string {
  const warmWhite = oklchToHex(gamutClamp(oklch(0.96, 0.006, hue)));
  const warmDark = oklchToHex(gamutClamp(oklch(0.18, 0.010, hue)));

  const whiteResult = checkContrast(warmWhite, bgHex, "wcag-aa");
  if (whiteResult.passes) return warmWhite;
  return warmDark;
}
