import { useState } from "react";
import { usePaletteStore } from "../store/palette";
import type { ExportFormat } from "@hueshift/types";

const FORMATS: Array<{ value: ExportFormat; label: string; ext: string }> = [
  { value: "tailwind-v4", label: "Tailwind v4", ext: ".css" },
  { value: "css-vars", label: "CSS Vars", ext: ".css" },
  { value: "scss", label: "SCSS", ext: ".scss" },
  { value: "design-tokens-w3c", label: "Tokens", ext: ".json" },
  { value: "json", label: "JSON", ext: ".json" },
  { value: "hex-list", label: "Hex", ext: ".txt" },
];

export function ExportPanel() {
  const { exportFormat, setExportFormat, getExportCode, palette } =
    usePaletteStore();
  const [copied, setCopied] = useState(false);

  if (!palette) return null;

  const code = getExportCode();

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Export
      </h3>

      <div className="flex gap-1 flex-wrap">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            onClick={() => setExportFormat(f.value)}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all
              ${
                exportFormat === f.value
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative group">
        <pre className="bg-surface border border-border/50 rounded-xl p-3 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-64 overflow-y-auto text-foreground/80 selection:bg-primary/20">
          {code}
        </pre>
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider
            transition-all
            ${copied
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-surface/90 text-muted-foreground border border-border/50 opacity-0 group-hover:opacity-100 hover:text-foreground hover:border-primary/30"
            }`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
