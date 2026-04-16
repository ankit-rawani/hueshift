import { usePaletteStore } from "../store/palette";

export function ContrastReport() {
  const palette = usePaletteStore((s) => s.palette);

  if (!palette) return null;

  const { contrastReport } = palette;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Contrast
        </h3>
        <span
          className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider
            ${contrastReport.overallPass
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/15 text-red-400 border border-red-500/20"
            }`}
        >
          {contrastReport.overallPass ? "AA Pass" : "AA Fail"}
        </span>
      </div>

      <div className="space-y-1">
        {contrastReport.pairs.map((pair, i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface transition-colors"
          >
            {/* Color pair preview */}
            <div className="relative w-8 h-5 shrink-0">
              <div
                className="absolute left-0 top-0 w-5 h-5 rounded-md border border-border/30"
                style={{ backgroundColor: pair.background }}
              />
              <div
                className="absolute left-3 top-0 w-5 h-5 rounded-md border border-border/30"
                style={{ backgroundColor: pair.foreground }}
              />
            </div>

            {/* Results */}
            <div className="flex gap-2 items-center flex-1 min-w-0">
              {pair.results.map((r, j) => (
                <div key={j} className="flex items-center gap-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      r.passes ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {r.standard === "apca" ? "APCA" : r.standard === "wcag-aa" ? "AA" : "AAA"}{" "}
                    <span className="text-foreground/70">{r.ratio.toFixed(1)}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Fix suggestion */}
            {pair.results[0] && !pair.results[0].passes && pair.results[0].suggestion && (
              <div
                className="w-4 h-4 rounded-sm border border-border/30 shrink-0"
                style={{ backgroundColor: pair.results[0].suggestion }}
                title={`Suggested: ${pair.results[0].suggestion}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
