import { usePaletteStore } from "../store/palette";
import type { SemanticTokens } from "@hueshift/types";

function PreviewSurface({ tokens, label }: { tokens: SemanticTokens; label: string }) {
  const bg = tokens.background ?? "#fff";
  const fg = tokens.foreground ?? "#000";
  const primary = tokens.primary ?? "#3b82f6";
  const primaryFg = tokens["primary-foreground"] ?? "#fff";
  const muted = tokens.muted ?? "#f1f5f9";
  const mutedFg = tokens["muted-foreground"] ?? "#64748b";
  const accent = tokens.accent ?? "#f1f5f9";
  const accentFg = tokens["accent-foreground"] ?? "#1e293b";
  const destructive = tokens.destructive ?? "#ef4444";
  const border = tokens.border ?? "#e2e8f0";
  const secondary = tokens.secondary ?? "#f1f5f9";
  const secondaryFg = tokens["secondary-foreground"] ?? "#1e293b";

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ backgroundColor: bg, color: fg, borderColor: border }}
    >
      {/* Top bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-between border-b"
        style={{ borderColor: border }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={{ backgroundColor: primary }} />
          <span className="text-xs font-semibold" style={{ color: fg }}>AppName</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: muted }} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Revenue", value: "$12.4k", color: primary },
            { label: "Users", value: "2,847", color: accent },
            { label: "Growth", value: "+18%", color: primary },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg p-2.5 border"
              style={{ borderColor: border, backgroundColor: muted + "40" }}
            >
              <div className="text-[9px] uppercase tracking-wider font-medium" style={{ color: mutedFg }}>
                {stat.label}
              </div>
              <div className="text-sm font-bold mt-0.5" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Progress section */}
        <div className="rounded-lg border p-3" style={{ borderColor: border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold" style={{ color: fg }}>
              Project Alpha
            </span>
            <span className="text-[10px] font-medium" style={{ color: primary }}>72%</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: muted }}>
            <div
              className="h-1.5 rounded-full"
              style={{ backgroundColor: primary, width: "72%" }}
            />
          </div>
          <div className="flex items-center gap-3 mt-2">
            {[
              { label: "Design", color: primary },
              { label: "Dev", color: accent },
              { label: "Review", color: mutedFg },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[9px]" style={{ color: mutedFg }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons + input */}
        <div className="space-y-2">
          <div
            className="w-full px-3 py-2 rounded-lg border text-[11px]"
            style={{
              backgroundColor: "transparent",
              color: mutedFg,
              borderColor: border,
            }}
          >
            Search anything...
          </div>

          <div className="flex gap-2">
            <button
              className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: primary, color: primaryFg }}
            >
              Continue
            </button>
            <button
              className="flex-1 px-3 py-2 rounded-lg text-[11px] font-medium border"
              style={{ backgroundColor: secondary, color: secondaryFg, borderColor: border }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-2 rounded-lg text-[11px] font-medium"
              style={{ backgroundColor: destructive + "18", color: destructive }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { label: "Active", bg: primary, fg: primaryFg },
            { label: "Featured", bg: accent, fg: accentFg },
            { label: "Draft", bg: muted, fg: mutedFg },
            { label: "New", bg: secondary, fg: secondaryFg },
          ].map((tag) => (
            <span
              key={tag.label}
              className="px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: tag.bg, color: tag.fg }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Mode label */}
      <div
        className="px-4 py-1.5 border-t text-center"
        style={{ borderColor: border }}
      >
        <span className="text-[9px] font-medium uppercase tracking-widest" style={{ color: mutedFg }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export function LivePreview() {
  const { lightTokens, darkTokens, activeMode, setActiveMode } = usePaletteStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Preview
        </h3>
        <div className="flex rounded-lg border border-border/50 overflow-hidden bg-surface">
          {(["light", "dark", "both"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all
                ${activeMode === mode
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-3 ${activeMode === "both" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {(activeMode === "light" || activeMode === "both") && (
          <PreviewSurface tokens={lightTokens} label="Light" />
        )}
        {(activeMode === "dark" || activeMode === "both") && (
          <PreviewSurface tokens={darkTokens} label="Dark" />
        )}
      </div>
    </div>
  );
}
