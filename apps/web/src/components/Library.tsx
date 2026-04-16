import { usePaletteStore } from "../store/palette";
import type { Palette } from "@hueshift/types";

function PaletteCard({
  palette,
  onSelect,
  onDelete,
}: {
  palette: Palette;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border border-border rounded-lg p-3 hover:border-muted-foreground transition-colors group">
      <button onClick={onSelect} className="w-full text-left space-y-2">
        <div className="flex gap-1 h-8 rounded-md overflow-hidden">
          {palette.colors.slice(0, 6).map((c, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: c.scale?.[500] ?? c.hex }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground truncate">
              {palette.name}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {palette.source.type} &middot;{" "}
              {new Date(palette.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="mt-2 text-[10px] text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
      >
        Delete
      </button>
    </div>
  );
}

export function Library({
  onClose,
}: {
  onClose: () => void;
}) {
  const { savedPalettes, deleteSavedPalette, loadPalette } = usePaletteStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Library ({savedPalettes.length}/20)
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Close
          </button>
        </div>

        {savedPalettes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No saved palettes yet. Generate a palette and click "Save" to add it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedPalettes.map((p) => (
              <PaletteCard
                key={p.id}
                palette={p}
                onSelect={() => {
                  loadPalette(p);
                  onClose();
                }}
                onDelete={() => deleteSavedPalette(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
