import type { Palette, PaletteColor, PaletteStyle, PaletteMode } from "@hueshift/types";
import { parseToOklch, oklchToHex, oklchToCss } from "./oklch.js";
import { generateScale } from "./scale.js";
import { mapSemanticTokens } from "./semantic.js";
import { generateContrastReport } from "./contrast.js";

/**
 * The system prompt that encodes Hueshift's taste opinions.
 * This is the core IP — it shapes the quality of AI-generated palettes.
 */
export const PALETTE_SYSTEM_PROMPT = `You are an expert UI designer generating color palettes for modern web applications.

RULES — follow every one:
1. Output OKLCH values. Never use pure black (oklch(0 0 0)) — use oklch(0.22 0.01 260) for "near-black."
2. Never use pure white (oklch(1 0 0)) — use oklch(0.98 0.005 260) for "near-white."
3. Maintain WCAG AA contrast (4.5:1) between foreground and background by default.
4. Favor perceptually balanced chroma: neutrals at ~0.01–0.04, primaries at 0.12–0.22, accents up to 0.28.
5. Never generate 5 saturated colors. A good palette has 1–2 hero colors, 2–3 supporting, rest neutral.
6. Consider the vibe:
   - fintech = restrained chroma, trustworthy blues/greens
   - creative = higher chroma, unusual hues
   - editorial = warm neutrals with one cool accent
   - medical/health = clean whites, calming blues/greens
   - ecommerce = energetic, warm accents for CTAs
   - minimal = near-zero chroma, one subtle accent
7. Always include at least 2 neutral shades (low chroma) for backgrounds and text.
8. Each palette must have exactly the roles: background, foreground, primary, secondary, muted, accent, destructive.

OUTPUT FORMAT — respond with ONLY a JSON array of palette objects, no other text:
[
  {
    "name": "palette name",
    "description": "one sentence describing the feel",
    "colors": [
      { "name": "role-name", "oklch": "oklch(L C H)", "role": "semantic-role" }
    ]
  }
]

Each color object must have:
- name: a descriptive color name (e.g. "ocean-blue", "warm-slate")
- oklch: valid OKLCH CSS string, e.g. "oklch(0.64 0.18 260)"
- role: one of "background", "foreground", "primary", "secondary", "muted", "accent", "destructive"`;

/**
 * Build the user prompt for palette generation.
 */
export function buildPromptMessage(
  prompt: string,
  options: {
    count?: number;
    style?: PaletteStyle;
    mode?: PaletteMode;
  } = {},
): string {
  const { count = 3, style, mode = "both" } = options;

  let msg = `Generate ${count} color palette${count > 1 ? "s" : ""} for: "${prompt}"`;

  if (style) {
    msg += `\nStyle preference: ${style}`;
  }

  if (mode === "dark") {
    msg += `\nOptimize for dark mode (dark backgrounds, light foregrounds).`;
  } else if (mode === "light") {
    msg += `\nOptimize for light mode (light backgrounds, dark foregrounds).`;
  } else {
    msg += `\nOptimize for light mode. Dark mode will be auto-derived.`;
  }

  msg += `\n\nReturn exactly ${count} palette variations as a JSON array.`;

  return msg;
}

/**
 * Parse the raw AI response into Palette objects.
 */
export function parsePromptResponse(
  responseText: string,
  originalPrompt: string,
): Palette[] {
  // Extract JSON from the response (handle markdown code blocks)
  let jsonStr = responseText.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to find array bounds if there's extra text
  const arrayStart = jsonStr.indexOf("[");
  const arrayEnd = jsonStr.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd !== -1) {
    jsonStr = jsonStr.slice(arrayStart, arrayEnd + 1);
  }

  let rawPalettes: Array<{
    name: string;
    description?: string;
    colors: Array<{
      name: string;
      oklch: string;
      role?: string;
    }>;
  }>;

  try {
    rawPalettes = JSON.parse(jsonStr);
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  if (!Array.isArray(rawPalettes)) {
    rawPalettes = [rawPalettes as typeof rawPalettes[0]];
  }

  let promptIdCounter = 0;

  return rawPalettes.map((raw) => {
    const colors: PaletteColor[] = raw.colors.map((c) => {
      let hex: string;
      try {
        const oklchParsed = parseToOklch(c.oklch);
        hex = oklchToHex(oklchParsed);
      } catch {
        // Fallback — try parsing as-is
        try {
          hex = oklchToHex(parseToOklch(c.oklch));
        } catch {
          hex = "#808080";
        }
      }

      const { scale } = generateScale(hex);

      return {
        name: c.name,
        hex,
        oklch: c.oklch,
        role: c.role as PaletteColor["role"],
        scale,
      };
    });

    const lightTokens = mapSemanticTokens(colors, "light");
    const contrastPairs = [
      { fg: lightTokens.foreground!, bg: lightTokens.background! },
      { fg: lightTokens["primary-foreground"]!, bg: lightTokens.primary! },
    ].filter((p) => p.fg && p.bg);

    const contrastReport = generateContrastReport(contrastPairs);

    const id = `prm_${Date.now().toString(36)}_${(promptIdCounter++).toString(36)}`;
    const slug = (raw.name ?? "prompt-palette")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return {
      id,
      slug,
      name: raw.name ?? "Prompt Palette",
      description: raw.description,
      colors,
      mode: "both" as PaletteMode,
      contrastReport,
      source: { type: "prompt" as const, value: originalPrompt },
      createdAt: new Date().toISOString(),
      public: false,
      url: "",
    };
  });
}

/**
 * Generate palettes from prompt using fetch to Anthropic API.
 * This works in both browser and Node environments.
 */
export async function generatePaletteFromPrompt(
  prompt: string,
  apiKey: string,
  options: {
    count?: number;
    style?: PaletteStyle;
    mode?: PaletteMode;
  } = {},
): Promise<Palette[]> {
  const userMessage = buildPromptMessage(prompt, options);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: PALETTE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errBody}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text?: string }>;
  };

  const textBlock = data.content.find((b) => b.type === "text");
  if (!textBlock?.text) {
    throw new Error("No text in API response");
  }

  return parsePromptResponse(textBlock.text, prompt);
}
