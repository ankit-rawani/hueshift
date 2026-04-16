// ── Color types ──

export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export type PaletteColor = {
  name: string;
  oklch: string;
  hex: string;
  role?: SemanticRole;
  scale?: ColorScale;
};

// ── Semantic roles ──

export type SemanticRole =
  | "background"
  | "foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "destructive"
  | "destructive-foreground"
  | "border"
  | "ring";

export type SemanticTokens = {
  [K in SemanticRole]?: string;
};

// ── Contrast ──

export type ContrastStandard = "wcag-aa" | "wcag-aaa" | "apca";

export type ContrastResult = {
  passes: boolean;
  ratio: number;
  standard: ContrastStandard;
  suggestion?: string;
};

export type ContrastPair = {
  foreground: string;
  background: string;
  results: ContrastResult[];
};

export type ContrastReport = {
  pairs: ContrastPair[];
  overallPass: boolean;
};

// ── Palette ──

export type PaletteSource =
  | { type: "prompt"; value: string }
  | { type: "image"; value: string }
  | { type: "hex"; value: string };

export type PaletteMode = "light" | "dark" | "both";

export type Palette = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  colors: PaletteColor[];
  mode: PaletteMode;
  contrastReport: ContrastReport;
  source: PaletteSource;
  createdAt: string;
  public: boolean;
  url: string;
};

export type PaletteSummary = {
  id: string;
  slug: string;
  name: string;
  colors: string[]; // hex list
  mode: PaletteMode;
};

// ── Export formats ──

export type ExportFormat =
  | "tailwind-v4"
  | "css-vars"
  | "scss"
  | "design-tokens-w3c"
  | "json"
  | "hex-list";

export type ExportResult = {
  code: string;
  filenameSuggestion: string;
};

// ── Harmony types ──

export type HarmonyType =
  | "mono"
  | "analogous"
  | "complementary"
  | "triadic"
  | "split-complementary";

// ── Style presets ──

export type PaletteStyle =
  | "minimal"
  | "vibrant"
  | "muted"
  | "high-contrast"
  | "pastel";
