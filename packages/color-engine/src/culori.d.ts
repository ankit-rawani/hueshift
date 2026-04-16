declare module "culori" {
  export interface Oklch {
    mode: "oklch";
    l: number;
    c: number;
    h?: number;
    alpha?: number;
  }

  export interface Color {
    mode: string;
    [key: string]: unknown;
  }

  export function parse(color: string): Color | undefined;
  export function formatHex(color: Color | Oklch): string;
  export function formatCss(color: Color | Oklch): string;
  export function converter(mode: string): (color: Color | Oklch) => Oklch;
  export function clampChroma(color: Oklch | Color, mode: string): Oklch & Color;
  export function wcagContrast(a: Color | Oklch, b: Color | Oklch): number;
}
