// Core OKLCH utilities
export { parseToOklch, oklchToHex, oklchToCss, oklch, gamutClamp } from "./oklch.js";

// Scale generation
export { generateScale, findClosestStop } from "./scale.js";

// Harmony generation
export { generateHarmonyColors, generateNeutrals } from "./harmony.js";

// Contrast checking
export {
  getContrastRatio,
  getApcaContrast,
  checkContrast,
  generateContrastReport,
} from "./contrast.js";

// Semantic token mapping
export { mapSemanticTokens } from "./semantic.js";

// Palette generation
export { generatePaletteFromHex, getPaletteTokens } from "./generate.js";

// Export formatting
export { exportPalette } from "./export.js";

// Image extraction
export {
  extractColorsFromImageData,
  generatePaletteFromImageData,
} from "./image.js";
export type { ImageExtractionOptions } from "./image.js";

// Prompt generation
export {
  generatePaletteFromPrompt,
  parsePromptResponse,
  buildPromptMessage,
  PALETTE_SYSTEM_PROMPT,
} from "./prompt.js";

// Re-export types
export type * from "@hueshift/types";
