import type { PaletteColor, Palette } from "@hueshift/types";
import { parseToOklch, oklchToHex, oklchToCss, oklch, gamutClamp } from "./oklch.js";
import { generateScale } from "./scale.js";
import { mapSemanticTokens } from "./semantic.js";
import { generateContrastReport } from "./contrast.js";

// ── K-Means Color Extraction ──

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(rgb: RGB): string {
  return (
    "#" +
    ((1 << 24) | (Math.round(rgb.r) << 16) | (Math.round(rgb.g) << 8) | Math.round(rgb.b))
      .toString(16)
      .slice(1)
  );
}

function rgbDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2,
  );
}

/**
 * K-means clustering on RGB pixel data.
 */
function kMeans(
  pixels: RGB[],
  k: number,
  maxIterations = 20,
): { centroids: RGB[]; counts: number[] } {
  // Initialize centroids using k-means++ strategy
  const centroids: RGB[] = [];
  centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

  for (let i = 1; i < k; i++) {
    const distances = pixels.map((p) => {
      const minDist = Math.min(...centroids.map((c) => rgbDistance(p, c)));
      return minDist * minDist;
    });
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalDist;
    for (let j = 0; j < pixels.length; j++) {
      r -= distances[j];
      if (r <= 0) {
        centroids.push(pixels[j]);
        break;
      }
    }
    if (centroids.length <= i) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    }
  }

  let assignments = new Array(pixels.length).fill(0);
  const counts = new Array(k).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    const newAssignments = pixels.map((p) => {
      let minDist = Infinity;
      let closest = 0;
      for (let i = 0; i < k; i++) {
        const dist = rgbDistance(p, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }
      return closest;
    });

    // Check convergence
    const changed = newAssignments.some((a, i) => a !== assignments[i]);
    assignments = newAssignments;
    if (!changed) break;

    // Update centroids
    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0 }));
    counts.fill(0);

    for (let i = 0; i < pixels.length; i++) {
      const c = assignments[i];
      sums[c].r += pixels[i].r;
      sums[c].g += pixels[i].g;
      sums[c].b += pixels[i].b;
      counts[c]++;
    }

    for (let i = 0; i < k; i++) {
      if (counts[i] > 0) {
        centroids[i] = {
          r: sums[i].r / counts[i],
          g: sums[i].g / counts[i],
          b: sums[i].b / counts[i],
        };
      }
    }
  }

  // Final count
  counts.fill(0);
  for (const a of assignments) counts[a]++;

  return { centroids, counts };
}

/**
 * Sample pixels from ImageData, with optional central weighting.
 */
function samplePixels(
  imageData: { data: Uint8ClampedArray; width: number; height: number },
  options: { maxSamples?: number; weightCentral?: boolean } = {},
): RGB[] {
  const { maxSamples = 10000, weightCentral = false } = options;
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const step = Math.max(1, Math.floor(totalPixels / maxSamples));
  const pixels: RGB[] = [];

  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let i = 0; i < totalPixels; i += step) {
    const offset = i * 4;
    const a = data[offset + 3];
    // Skip transparent pixels
    if (a < 128) continue;

    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    // Skip near-white and near-black (often backgrounds)
    if (r > 245 && g > 245 && b > 245) continue;
    if (r < 10 && g < 10 && b < 10) continue;

    const pixel: RGB = { r, g, b };

    if (weightCentral) {
      // Add central pixels multiple times to weight them
      const x = i % width;
      const y = Math.floor(i / width);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
      const weight = dist < 0.3 ? 3 : dist < 0.6 ? 2 : 1;
      for (let w = 0; w < weight; w++) {
        pixels.push(pixel);
      }
    } else {
      pixels.push(pixel);
    }
  }

  return pixels;
}

/**
 * Detect background color by sampling edge pixels.
 */
function detectBackground(
  imageData: { data: Uint8ClampedArray; width: number; height: number },
): RGB | null {
  const { data, width, height } = imageData;
  const edgePixels: RGB[] = [];

  // Sample from edges (top, bottom, left, right rows)
  for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 50))) {
    // Top row
    const topOff = x * 4;
    edgePixels.push({ r: data[topOff], g: data[topOff + 1], b: data[topOff + 2] });
    // Bottom row
    const botOff = ((height - 1) * width + x) * 4;
    edgePixels.push({ r: data[botOff], g: data[botOff + 1], b: data[botOff + 2] });
  }

  for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 50))) {
    // Left column
    const leftOff = y * width * 4;
    edgePixels.push({ r: data[leftOff], g: data[leftOff + 1], b: data[leftOff + 2] });
    // Right column
    const rightOff = (y * width + width - 1) * 4;
    edgePixels.push({ r: data[rightOff], g: data[rightOff + 1], b: data[rightOff + 2] });
  }

  if (edgePixels.length === 0) return null;

  // Find dominant edge color (simple averaging — works for solid backgrounds)
  const { centroids, counts } = kMeans(edgePixels, 3, 10);
  const maxIdx = counts.indexOf(Math.max(...counts));
  return centroids[maxIdx];
}

export interface ImageExtractionOptions {
  count?: number;
  ignoreBackground?: boolean;
  weightCentral?: boolean;
}

/**
 * Extract dominant colors from ImageData (canvas-sourced pixel data).
 * Works in both browser (Canvas API) and Node (with manual ImageData).
 */
export function extractColorsFromImageData(
  imageData: { data: Uint8ClampedArray; width: number; height: number },
  options: ImageExtractionOptions = {},
): PaletteColor[] {
  const { count = 6, ignoreBackground = true, weightCentral = false } = options;

  const pixels = samplePixels(imageData, { weightCentral });
  if (pixels.length === 0) return [];

  // Detect background to potentially exclude it
  let bgColor: RGB | null = null;
  if (ignoreBackground) {
    bgColor = detectBackground(imageData);
  }

  // Run k-means with extra clusters, then filter
  const k = Math.min(count + 3, 12);
  const { centroids, counts } = kMeans(pixels, k);

  // Sort by frequency (most dominant first)
  const indexed = centroids.map((c, i) => ({ color: c, count: counts[i] }));
  indexed.sort((a, b) => b.count - a.count);

  // Filter out background-like colors
  let filtered = indexed;
  if (bgColor) {
    filtered = indexed.filter((c) => rgbDistance(c.color, bgColor!) > 40);
  }

  // Filter out near-duplicates
  const unique: typeof filtered = [];
  for (const entry of filtered) {
    const isDuplicate = unique.some((u) => rgbDistance(u.color, entry.color) < 30);
    if (!isDuplicate) {
      unique.push(entry);
    }
  }

  return unique.slice(0, count).map((entry, i) => {
    const hex = rgbToHex(entry.color);
    const oklchColor = parseToOklch(hex);
    const { scale } = generateScale(hex);

    return {
      name: `color-${i + 1}`,
      hex,
      oklch: oklchToCss(oklchColor),
      scale,
    };
  });
}

let imageIdCounter = 0;

/**
 * Generate a full palette from extracted image colors.
 */
export function generatePaletteFromImageData(
  imageData: { data: Uint8ClampedArray; width: number; height: number },
  options: ImageExtractionOptions & { name?: string } = {},
): Palette {
  const colors = extractColorsFromImageData(imageData, options);

  if (colors.length === 0) {
    throw new Error("No colors could be extracted from the image");
  }

  // Add semantic color names based on OKLCH analysis
  const analyzed = colors.map((c) => {
    const oklch = parseToOklch(c.hex);
    return { ...c, _l: oklch.l, _c: oklch.c ?? 0, _h: oklch.h ?? 0 };
  });

  // Assign roles: most saturated = primary, etc.
  analyzed.sort((a, b) => b._c - a._c);
  if (analyzed[0]) analyzed[0].name = "primary";
  if (analyzed[1]) analyzed[1].name = "secondary";
  if (analyzed[2]) analyzed[2].name = "accent";
  // Rest remain as color-N, reassign neutrals
  for (let i = 3; i < analyzed.length; i++) {
    if (analyzed[i]._c < 0.04) {
      analyzed[i].name = `neutral-${i}`;
    } else {
      analyzed[i].name = `color-${i + 1}`;
    }
  }

  const paletteColors: PaletteColor[] = analyzed.map(({ _l, _c, _h, ...rest }) => rest);

  // Build semantic tokens
  const lightTokens = mapSemanticTokens(paletteColors, "light");
  const darkTokens = mapSemanticTokens(paletteColors, "dark");

  const contrastPairs = [
    { fg: lightTokens.foreground!, bg: lightTokens.background! },
    { fg: lightTokens["primary-foreground"]!, bg: lightTokens.primary! },
  ].filter((p) => p.fg && p.bg);

  const contrastReport = generateContrastReport(contrastPairs);

  const id = `img_${Date.now().toString(36)}_${(imageIdCounter++).toString(36)}`;
  const name = options.name ?? `image-palette-${id.slice(4, 10)}`;

  return {
    id,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    colors: paletteColors,
    mode: "both",
    contrastReport,
    source: { type: "image", value: "uploaded" },
    createdAt: new Date().toISOString(),
    public: false,
    url: "",
  };
}
