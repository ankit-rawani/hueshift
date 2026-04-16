import { useState } from "react";
import { usePaletteStore } from "../store/palette";
import type { PaletteColor } from "@hueshift/types";

function ScaleRow({ color, index }: { color: PaletteColor; index: number }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [hoveredStop, setHoveredStop] = useState<string | null>(null);

  if (!color.scale) return null;

  const stops = Object.entries(color.scale) as Array<[string, string]>;

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color.scale[500] ?? color.hex }}
        />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {color.name}
        </span>
      </div>

      <div className="flex gap-[3px] rounded-xl overflow-hidden">
        {stops.map(([stop, hex]) => {
          const isHovered = hoveredStop === stop;
          const isCopied = copied === hex;

          return (
            <button
              key={stop}
              onClick={() => copyHex(hex)}
              onMouseEnter={() => setHoveredStop(stop)}
              onMouseLeave={() => setHoveredStop(null)}
              className="group relative flex-1 cursor-pointer transition-all duration-200"
              style={{ transform: isHovered ? "scaleY(1.08)" : "scaleY(1)" }}
              title={`${stop}: ${hex}`}
            >
              <div
                className="h-12 sm:h-14 transition-all"
                style={{ backgroundColor: hex }}
              />
              {/* Hover overlay */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-150
                  ${isHovered ? "opacity-100" : "opacity-0"}`}
                style={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(2px)",
                }}
              >
                <span className="text-[9px] font-mono font-bold text-white">
                  {isCopied ? "OK" : stop}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Show hex of hovered stop */}
      <div className="h-5 mt-1">
        {hoveredStop && (
          <span className="text-[10px] font-mono text-muted-foreground">
            {hoveredStop}: {color.scale?.[parseInt(hoveredStop) as keyof typeof color.scale] ?? ""}
          </span>
        )}
      </div>
    </div>
  );
}

export function PaletteSwatches() {
  const palette = usePaletteStore((s) => s.palette);

  if (!palette) return null;

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Scales
      </h3>
      {palette.colors.map((color, i) => (
        <ScaleRow key={color.name} color={color} index={i} />
      ))}
    </div>
  );
}
