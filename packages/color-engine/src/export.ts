import type { ExportFormat, ExportResult, SemanticTokens, PaletteColor, ColorScale } from "@hueshift/types";

/**
 * Export a palette in the requested format.
 */
export function exportPalette(
  colors: PaletteColor[],
  semanticTokens: SemanticTokens,
  format: ExportFormat,
  options: {
    includeDarkMode?: boolean;
    darkTokens?: SemanticTokens;
  } = {},
): ExportResult {
  switch (format) {
    case "tailwind-v4":
      return exportTailwindV4(colors, semanticTokens, options);
    case "css-vars":
      return exportCssVars(semanticTokens, options);
    case "scss":
      return exportScss(semanticTokens);
    case "design-tokens-w3c":
      return exportDesignTokens(colors, semanticTokens);
    case "json":
      return exportJson(colors, semanticTokens);
    case "hex-list":
      return exportHexList(colors);
  }
}

function exportTailwindV4(
  colors: PaletteColor[],
  tokens: SemanticTokens,
  options: { includeDarkMode?: boolean; darkTokens?: SemanticTokens },
): ExportResult {
  let code = `@theme {\n`;

  // Semantic tokens as CSS custom properties
  for (const [role, value] of Object.entries(tokens)) {
    if (value) {
      code += `  --color-${role}: ${value};\n`;
    }
  }

  code += `\n`;

  // Color scales
  for (const color of colors) {
    if (color.scale) {
      for (const [stop, hex] of Object.entries(color.scale)) {
        code += `  --color-${color.name}-${stop}: ${hex};\n`;
      }
      code += `\n`;
    }
  }

  code += `}\n`;

  if (options.includeDarkMode && options.darkTokens) {
    code += `\n@variant dark {\n  @theme {\n`;
    for (const [role, value] of Object.entries(options.darkTokens)) {
      if (value) {
        code += `    --color-${role}: ${value};\n`;
      }
    }
    code += `  }\n}\n`;
  }

  return { code, filenameSuggestion: "globals.css" };
}

function exportCssVars(
  tokens: SemanticTokens,
  options: { includeDarkMode?: boolean; darkTokens?: SemanticTokens },
): ExportResult {
  let code = `:root {\n`;
  for (const [role, value] of Object.entries(tokens)) {
    if (value) {
      code += `  --${role}: ${value};\n`;
    }
  }
  code += `}\n`;

  if (options.includeDarkMode && options.darkTokens) {
    code += `\n@media (prefers-color-scheme: dark) {\n  :root {\n`;
    for (const [role, value] of Object.entries(options.darkTokens)) {
      if (value) {
        code += `    --${role}: ${value};\n`;
      }
    }
    code += `  }\n}\n`;
  }

  return { code, filenameSuggestion: "theme.css" };
}

function exportScss(tokens: SemanticTokens): ExportResult {
  let code = `// Hueshift palette\n`;
  for (const [role, value] of Object.entries(tokens)) {
    if (value) {
      code += `$${role}: ${value};\n`;
    }
  }
  return { code, filenameSuggestion: "_palette.scss" };
}

function exportDesignTokens(
  colors: PaletteColor[],
  tokens: SemanticTokens,
): ExportResult {
  const dtTokens: Record<string, unknown> = {};

  // Semantic tokens
  for (const [role, value] of Object.entries(tokens)) {
    if (value) {
      dtTokens[role] = {
        $type: "color",
        $value: value,
      };
    }
  }

  // Scale tokens
  for (const color of colors) {
    if (color.scale) {
      dtTokens[color.name] = {};
      for (const [stop, hex] of Object.entries(color.scale)) {
        (dtTokens[color.name] as Record<string, unknown>)[stop] = {
          $type: "color",
          $value: hex,
        };
      }
    }
  }

  const code = JSON.stringify(dtTokens, null, 2);
  return { code, filenameSuggestion: "tokens.json" };
}

function exportJson(
  colors: PaletteColor[],
  tokens: SemanticTokens,
): ExportResult {
  const code = JSON.stringify({ colors, semanticTokens: tokens }, null, 2);
  return { code, filenameSuggestion: "palette.json" };
}

function exportHexList(colors: PaletteColor[]): ExportResult {
  const code = colors.map((c) => c.hex).join("\n");
  return { code, filenameSuggestion: "palette.txt" };
}
