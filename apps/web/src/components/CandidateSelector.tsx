import { usePaletteStore } from "../store/palette";

export function CandidateSelector() {
  const { candidates, palette, selectCandidate } = usePaletteStore();

  if (candidates.length <= 1) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Variations
      </h3>
      <div className="flex gap-2">
        {candidates.map((candidate, i) => (
          <button
            key={candidate.id}
            onClick={() => selectCandidate(i)}
            className={`flex-1 rounded-xl border p-2.5 transition-all
              ${
                palette?.id === candidate.id
                  ? "border-primary/40 ring-1 ring-primary/20 bg-primary/5"
                  : "border-border/30 hover:border-border bg-surface"
              }`}
          >
            <div className="flex gap-0.5 h-5 rounded-md overflow-hidden">
              {candidate.colors.slice(0, 5).map((c, j) => (
                <div
                  key={j}
                  className="flex-1"
                  style={{ backgroundColor: c.scale?.[500] ?? c.hex }}
                />
              ))}
            </div>
            <div className="text-[9px] text-muted-foreground mt-1.5 truncate font-medium">
              {candidate.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
