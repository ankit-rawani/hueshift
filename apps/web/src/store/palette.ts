import { create } from "zustand";
import type {
  Palette,
  HarmonyType,
  ExportFormat,
  SemanticTokens,
  PaletteMode,
} from "@hueshift/types";
import {
  generatePaletteFromHex,
  getPaletteTokens,
  exportPalette,
  generatePaletteFromImageData,
  parseToOklch,
  oklchToHex,
} from "@hueshift/color-engine";

export type InputTab = "hex" | "image";

interface PaletteState {
  // Input state
  activeTab: InputTab;
  baseHex: string;
  harmony: HarmonyType;

  // Palette state
  palette: Palette | null;
  candidates: Palette[];
  lightTokens: SemanticTokens;
  darkTokens: SemanticTokens;
  activeMode: PaletteMode;
  exportFormat: ExportFormat;

  // Loading / error
  isLoading: boolean;
  error: string | null;

  // Library
  savedPalettes: Palette[];

  // Locked color indices (preserved on regenerate)
  lockedIndices: Set<number>;

  // Last image data for re-extraction on regenerate
  lastImageData: ImageData | null;

  // Actions
  setActiveTab: (tab: InputTab) => void;
  setBaseHex: (hex: string) => void;
  setHarmony: (harmony: HarmonyType) => void;
  setActiveMode: (mode: PaletteMode) => void;
  setExportFormat: (format: ExportFormat) => void;
  toggleLock: (index: number) => void;

  generate: (options?: { explore?: boolean }) => void;
  generateFromImage: (imageData: ImageData) => Promise<void>;
  selectCandidate: (index: number) => void;

  savePalette: () => void;
  deleteSavedPalette: (id: string) => void;
  loadPalette: (palette: Palette) => void;
  loadLibrary: () => void;

  getExportCode: () => string;
}

function computeTokens(palette: Palette) {
  const lightTokens = getPaletteTokens(palette, "light");
  const darkTokens = getPaletteTokens(palette, "dark");
  return { lightTokens, darkTokens };
}

const LIBRARY_KEY = "hueshift-library";

function loadFromStorage(): Palette[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(palettes: Palette[]) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(palettes));
}

export const usePaletteStore = create<PaletteState>((set, get) => ({
  activeTab: "hex",
  baseHex: "#3b82f6",
  harmony: "analogous",
  palette: null,
  candidates: [],
  lightTokens: {},
  darkTokens: {},
  activeMode: "light",
  exportFormat: "tailwind-v4",
  isLoading: false,
  error: null,
  savedPalettes: loadFromStorage(),
  lockedIndices: new Set(),
  lastImageData: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setBaseHex: (hex) => set({ baseHex: hex }),

  setHarmony: (harmony) => {
    set({ harmony });
    get().generate({ explore: false });
  },

  setActiveMode: (mode) => set({ activeMode: mode }),
  setExportFormat: (format) => set({ exportFormat: format }),

  toggleLock: (index) => {
    const locked = new Set(get().lockedIndices);
    if (locked.has(index)) {
      locked.delete(index);
    } else {
      locked.add(index);
    }
    set({ lockedIndices: locked });
  },

  generate: (options?: { explore?: boolean }) => {
    const { baseHex, harmony, activeTab, lastImageData } = get();
    const explore = options?.explore ?? true;

    // If we're on the image tab and have stored image data, re-extract
    if (activeTab === "image" && lastImageData) {
      const palette = generatePaletteFromImageData(lastImageData, {
        count: 6,
        ignoreBackground: true,
        weightCentral: true,
      });
      const { lightTokens, darkTokens } = computeTokens(palette);
      set({ palette, candidates: [palette], lightTokens, darkTokens, error: null });
      return;
    }

    try {
      let hexToUse = baseHex;

      if (explore) {
        // Shift the base hue significantly on each regeneration (±40°)
        // so palettes explore different color territories, not just
        // subtle variations of the same thing. This is what makes
        // it feel like coolors.co.
        const base = parseToOklch(baseHex);
        const hueShift = (Math.random() - 0.5) * 80; // ±40°
        const chromaShift = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x
        const lightnessShift = (Math.random() - 0.5) * 0.15; // ±0.075

        const shifted = {
          mode: "oklch" as const,
          l: Math.max(0.25, Math.min(0.75, base.l + lightnessShift)),
          c: Math.max(0.04, (base.c ?? 0.1) * chromaShift),
          h: ((base.h ?? 0) + hueShift + 360) % 360,
        };
        hexToUse = oklchToHex(shifted);
      }

      const palette = generatePaletteFromHex(hexToUse, {
        harmony,
        includeNeutrals: true,
        mode: "both",
      });
      const { lightTokens, darkTokens } = computeTokens(palette);
      set({ palette, lightTokens, darkTokens, candidates: [], error: null });
    } catch {
      // Invalid hex — ignore
    }
  },

  generateFromImage: async (imageData) => {
    set({ isLoading: true, error: null, lastImageData: imageData });
    try {
      const palette = generatePaletteFromImageData(imageData, {
        count: 6,
        ignoreBackground: true,
        weightCentral: true,
      });

      const { lightTokens, darkTokens } = computeTokens(palette);
      set({
        palette,
        candidates: [palette],
        lightTokens,
        darkTokens,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Extraction failed",
      });
      throw err;
    }
  },

  selectCandidate: (index) => {
    const { candidates } = get();
    if (index < 0 || index >= candidates.length) return;
    const palette = candidates[index];
    const { lightTokens, darkTokens } = computeTokens(palette);
    set({ palette, lightTokens, darkTokens });
  },

  savePalette: () => {
    const { palette, savedPalettes } = get();
    if (!palette) return;
    if (savedPalettes.some((p) => p.id === palette.id)) return;
    if (savedPalettes.length >= 20) return;
    const updated = [palette, ...savedPalettes];
    saveToStorage(updated);
    set({ savedPalettes: updated });
  },

  deleteSavedPalette: (id) => {
    const updated = get().savedPalettes.filter((p) => p.id !== id);
    saveToStorage(updated);
    set({ savedPalettes: updated });
  },

  loadPalette: (palette) => {
    const { lightTokens, darkTokens } = computeTokens(palette);
    set({ palette, lightTokens, darkTokens, candidates: [] });
  },

  loadLibrary: () => {
    set({ savedPalettes: loadFromStorage() });
  },

  getExportCode: () => {
    const { palette, lightTokens, darkTokens, exportFormat } = get();
    if (!palette) return "";
    const result = exportPalette(palette.colors, lightTokens, exportFormat, {
      includeDarkMode: true,
      darkTokens,
    });
    return result.code;
  },
}));
