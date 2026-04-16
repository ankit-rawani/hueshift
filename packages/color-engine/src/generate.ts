import type { Palette, PaletteColor, HarmonyType, PaletteMode } from "@hueshift/types";
import { parseToOklch, oklchToHex, oklchToCss } from "./oklch.js";
import { generateScale } from "./scale.js";
import { generateHarmonyColors, generateNeutrals } from "./harmony.js";
import { mapSemanticTokens } from "./semantic.js";
import { generateContrastReport } from "./contrast.js";

let idCounter = 0;
function makeId(): string {
  return `pal_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate a full palette from a base hex color.
 */
export function generatePaletteFromHex(
  baseHex: string,
  options: {
    harmony?: HarmonyType;
    includeNeutrals?: boolean;
    mode?: PaletteMode;
    name?: string;
    seed?: number;
  } = {},
): Palette {
  const {
    harmony = "mono",
    includeNeutrals = true,
    mode = "both",
    name,
    seed,
  } = options;

  const base = parseToOklch(baseHex);
  // Each call uses a unique seed so regeneration produces different palettes
  const callSeed = seed ?? (Date.now() ^ (Math.random() * 0xffffffff));
  const harmonyColors = generateHarmonyColors(baseHex, harmony, { seed: callSeed });

  const colors: PaletteColor[] = harmonyColors.map((hc, i) => {
    const { scale, oklchScale } = generateScale(hc.hex);
    const colorName = i === 0 ? "primary" : i === 1 ? "secondary" : `accent-${i}`;
    return {
      name: colorName,
      hex: hc.hex,
      oklch: hc.oklch,
      scale,
    };
  });

  if (includeNeutrals) {
    const neutrals = generateNeutrals(baseHex, { seed: callSeed + 1 });
    // Add a single "neutral" color entry with a scale built from neutral shades
    const neutralScale = {
      50: neutrals[0].hex,
      100: neutrals[1].hex,
      200: neutrals[2].hex,
      300: neutrals[3].hex,
      400: neutrals[4].hex,
      500: neutrals[5].hex,
      600: neutrals[6].hex,
      700: neutrals[7].hex,
      800: neutrals[8].hex,
      900: neutrals[9].hex,
      950: neutrals[10].hex,
    };

    colors.push({
      name: "neutral",
      hex: neutrals[5].hex,
      oklch: neutrals[5].oklch,
      scale: neutralScale,
    });
  }

  // Map semantic tokens
  const semanticColors: PaletteColor[] = [
    // Build a set of representative colors for semantic mapping
    ...colors.map((c) => ({
      ...c,
      hex: c.scale?.[500] ?? c.hex,
    })),
  ];

  // Add light and dark extremes from neutrals for bg/fg
  const neutralColor = colors.find((c) => c.name === "neutral");
  if (neutralColor?.scale) {
    semanticColors.push(
      { name: "light", hex: neutralColor.scale[50], oklch: "", },
      { name: "dark", hex: neutralColor.scale[950], oklch: "", },
    );
  }

  const lightTokens = mapSemanticTokens(semanticColors, "light");
  const darkTokens = mapSemanticTokens(semanticColors, "dark");

  // Generate contrast report for light mode semantic pairs
  const contrastPairs = [
    { fg: lightTokens.foreground!, bg: lightTokens.background! },
    { fg: lightTokens["primary-foreground"]!, bg: lightTokens.primary! },
    { fg: lightTokens["accent-foreground"]!, bg: lightTokens.accent! },
    { fg: lightTokens["muted-foreground"]!, bg: lightTokens.muted! },
  ].filter((p) => p.fg && p.bg);

  const contrastReport = generateContrastReport(contrastPairs);

  const paletteName = name ?? `palette-${baseHex.replace("#", "")}`;
  const id = makeId();

  return {
    id,
    slug: slugify(paletteName),
    name: paletteName,
    colors,
    mode,
    contrastReport,
    source: { type: "hex", value: baseHex },
    createdAt: new Date().toISOString(),
    public: false,
    url: `https://hueshift.com/p/${slugify(paletteName)}`,
  };
}

/**
 * Get semantic tokens for a palette.
 */
export function getPaletteTokens(palette: Palette, mode: PaletteMode = "light") {
  const semanticColors: PaletteColor[] = palette.colors.map((c) => ({
    ...c,
    hex: c.scale?.[500] ?? c.hex,
  }));

  const neutralColor = palette.colors.find((c) => c.name === "neutral");
  if (neutralColor?.scale) {
    semanticColors.push(
      { name: "light", hex: neutralColor.scale[50], oklch: "" },
      { name: "dark", hex: neutralColor.scale[950], oklch: "" },
    );
  }

  return mapSemanticTokens(semanticColors, mode);
}
