import { useState, useEffect } from "react";
import { usePaletteStore } from "../store/palette";

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

const PRESET_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f97316",
  "#10b981", "#06b6d4", "#eab308", "#ef4444",
];

export function HexInput() {
  const { baseHex, setBaseHex, generate, harmony, setHarmony } =
    usePaletteStore();
  const [input, setInput] = useState(baseHex);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    setInput(baseHex);
  }, [baseHex]);

  function handleChange(value: string) {
    if (value.length > 0 && !value.startsWith("#")) {
      value = "#" + value;
    }
    setInput(value);

    if (HEX_REGEX.test(value)) {
      setValid(true);
      setBaseHex(value);
      generate({ explore: false });
    } else {
      setValid(value.length < 7);
    }
  }

  const harmonies: Array<{ value: typeof harmony; label: string; icon: string }> = [
    { value: "mono", label: "Mono", icon: "1" },
    { value: "analogous", label: "Analogous", icon: "3" },
    { value: "complementary", label: "Complement", icon: "2" },
    { value: "triadic", label: "Triadic", icon: "3" },
    { value: "split-complementary", label: "Split", icon: "3" },
  ];

  return (
    <div className="space-y-5">
      {/* Color picker */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
          Base Color
        </label>
        <div className="relative">
          <input
            type="color"
            value={HEX_REGEX.test(input) ? input : "#3b82f6"}
            onChange={(e) => handleChange(e.target.value)}
            className="absolute inset-0 w-full h-14 opacity-0 cursor-pointer z-10"
          />
          <div
            className="h-14 rounded-xl border border-border/50 flex items-center justify-center gap-3 transition-all hover:border-primary/40"
            style={{
              background: `linear-gradient(135deg, ${HEX_REGEX.test(input) ? input : "#3b82f6"} 0%, ${HEX_REGEX.test(input) ? input : "#3b82f6"}88 100%)`,
            }}
          >
            <span className="text-sm font-mono font-medium drop-shadow-lg"
              style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {input || "#3b82f6"}
            </span>
          </div>
        </div>

        <div className="mt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="#3b82f6"
            maxLength={7}
            spellCheck={false}
            className={`w-full px-3 py-2 rounded-lg border text-sm font-mono tracking-wider
              ${valid ? "border-border/50" : "border-destructive/50"}
              bg-surface text-foreground placeholder-muted-foreground/50
              focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30
              transition-all`}
          />
        </div>
        {!valid && (
          <p className="text-[10px] text-destructive mt-1 font-medium">
            Enter a valid hex (e.g. #3b82f6)
          </p>
        )}
      </div>

      {/* Preset swatches */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
          Quick Pick
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleChange(color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110
                ${baseHex === color ? "border-foreground scale-110 shadow-lg" : "border-transparent hover:border-border"}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Harmony selector */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2">
          Harmony
        </label>
        <div className="space-y-1">
          {harmonies.map((h) => (
            <button
              key={h.value}
              onClick={() => setHarmony(h.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${
                  harmony === h.value
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent"
                }`}
            >
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold bg-border/50">
                {h.icon}
              </span>
              {h.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
