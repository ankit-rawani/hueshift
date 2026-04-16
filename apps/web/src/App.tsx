import { useEffect, useState, useCallback } from "react";
import { usePaletteStore } from "./store/palette";
import type { InputTab } from "./store/palette";
import { HexInput } from "./components/HexInput";
import { ImageInput } from "./components/ImageInput";
import { PaletteSwatches } from "./components/PaletteSwatches";
import { LivePreview } from "./components/LivePreview";
import { ContrastReport } from "./components/ContrastReport";
import { ExportPanel } from "./components/ExportPanel";
import { CandidateSelector } from "./components/CandidateSelector";
import { Library } from "./components/Library";

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const palette = usePaletteStore((s) => s.palette);

  function handleShare() {
    if (!palette) return;

    const shareData = {
      n: palette.name,
      c: palette.colors.map((c) => ({
        n: c.name,
        h: c.hex,
      })),
      s: palette.source,
    };

    const hash = btoa(JSON.stringify(shareData));
    const url = `${window.location.origin}${window.location.pathname}#p=${hash}`;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    window.history.replaceState(null, "", `#p=${hash}`);
  }

  return (
    <button
      onClick={handleShare}
      className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors"
    >
      {copied ? "Link Copied!" : "Share"}
    </button>
  );
}

function App() {
  const {
    activeTab,
    setActiveTab,
    generate,
    palette,
    savePalette,
    savedPalettes,
    setBaseHex,
  } = usePaletteStore();

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // Load shared palette from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#p=")) {
      try {
        const data = JSON.parse(atob(hash.slice(3)));
        if (data.c && Array.isArray(data.c)) {
          setBaseHex(data.c[0]?.h ?? "#3b82f6");
          setShowLanding(false);
          generate({ explore: false });
        }
      } catch {
        // Invalid hash — ignore
      }
    }
  }, []);

  // Initial generate
  useEffect(() => {
    if (!showLanding) {
      generate({ explore: false });
    }
  }, [showLanding]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        generate();
      }
    },
    [generate],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const tabs: Array<{ id: InputTab; label: string }> = [
    { id: "hex", label: "Hex" },
    { id: "image", label: "Image" },
  ];

  // Landing page
  if (showLanding) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-500" />
            <span className="text-lg font-bold text-foreground tracking-tight">
              Hueshift
            </span>
          </div>
          <nav aria-label="Main navigation" className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setLibraryOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Library
              {savedPalettes.length > 0 && (
                <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                  {savedPalettes.length}
                </span>
              )}
            </button>
          </nav>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <article className="max-w-2xl text-center space-y-6">
            {/* Palette swatch */}
            <div className="flex justify-center gap-2 mb-8" role="img" aria-label="Example color palette with blue, purple, pink, orange, and green swatches">
              {["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981"].map(
                (color, i) => (
                  <div
                    key={color}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg transition-transform hover:scale-110 hover:-translate-y-1"
                    style={{
                      backgroundColor: color,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ),
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              The color palette brain
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                your coding agent plugs into.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Generate accessible, OKLCH-based color palettes from a hex color
              or image. Export as Tailwind v4 tokens, CSS variables, or pipe
              directly into Claude Code via MCP.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setShowLanding(false)}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
              >
                Generate a Palette
              </button>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card">
                <code className="text-xs font-mono text-muted-foreground">
                  npx hueshift-mcp@latest
                </code>
              </div>
            </div>

            {/* Feature highlights */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left" aria-label="Key features">
              {[
                {
                  title: "OKLCH Color Scales",
                  desc: "Perceptually uniform 11-shade scales (50\u2013950). P3-aware, sRGB gamut-clamped. Tailwind v4 native.",
                },
                {
                  title: "MCP Server for AI Agents",
                  desc: "One command to connect Claude Code, Cursor, or Windsurf. 8 tools for palette generation, contrast checks, and export.",
                },
                {
                  title: "WCAG & APCA Contrast",
                  desc: "Accessibility checked on every color pair. Auto-fix suggestions when contrast fails. AA, AAA, and APCA standards.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-4 rounded-xl border border-border bg-card space-y-1.5"
                >
                  <h2 className="text-sm font-semibold text-foreground">
                    {f.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </section>

            {/* SEO content section — visible, useful, keyword-rich */}
            <section className="pt-16 pb-4 text-left max-w-xl mx-auto space-y-6">
              <h2 className="text-xl font-semibold text-foreground">How it works</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Enter a hex color or upload an image. Hueshift generates a
                  complete color palette using the <strong>OKLCH color space</strong> &mdash;
                  the same perceptually uniform format adopted by Tailwind CSS v4.
                  Choose from five harmony modes: monochromatic, analogous,
                  complementary, triadic, or split-complementary.
                </p>
                <p>
                  Each palette includes <strong>11-shade color scales</strong> (50&ndash;950)
                  and <strong>semantic UI tokens</strong> for both light and dark mode:
                  background, foreground, primary, secondary, muted, accent, destructive,
                  border, and ring &mdash; following shadcn/ui conventions.
                </p>
                <p>
                  Export as a <strong>Tailwind v4 @theme block</strong>, CSS custom
                  properties, SCSS variables, W3C design tokens, or plain JSON.
                  Every export includes dark mode variants and is ready to paste
                  into your project.
                </p>
              </div>

              <h2 className="text-xl font-semibold text-foreground pt-4">Use with AI coding agents</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  The <strong>hueshift-mcp</strong> npm package is an MCP server that
                  gives Claude Code, Cursor, Windsurf, and Claude Desktop direct
                  access to palette generation. Install with one command:
                </p>
                <code className="block bg-muted text-muted-foreground p-3 rounded-lg font-mono text-xs">
                  claude mcp add hueshift-mcp -- npx hueshift-mcp@latest
                </code>
                <p>
                  Your agent can generate palettes from hex colors or images,
                  check WCAG and APCA contrast, and export production-ready
                  Tailwind v4 tokens &mdash; all without leaving the editor.
                </p>
              </div>
            </section>
          </article>
        </main>

        <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground space-y-2">
          <p>
            Hueshift &mdash; OKLCH color palette generator for Tailwind v4 and AI coding agents.
            Free and <a href="https://github.com/ankitgdes/hueshift" className="underline hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">open source</a>.
          </p>
          <p>
            <a href="https://www.npmjs.com/package/hueshift-mcp" className="underline hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">npm: hueshift-mcp</a>
          </p>
        </footer>

        {libraryOpen && <Library onClose={() => setLibraryOpen(false)} />}
      </div>
    );
  }

  // Generator page
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLanding(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-500" />
            <span className="text-lg font-bold text-foreground tracking-tight">
              Hueshift
            </span>
          </button>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <span className="text-foreground font-medium">Generator</span>
          <button
            onClick={() => setLibraryOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Library
            {savedPalettes.length > 0 && (
              <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                {savedPalettes.length}
              </span>
            )}
          </button>
        </nav>
      </header>

      {/* Keyboard shortcut hint */}
      <div className="bg-muted/50 border-b border-border px-6 py-1.5 text-center">
        <span className="text-[10px] text-muted-foreground">
          <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
            Space
          </kbd>{" "}
          regenerate &middot;{" "}
          <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
            C
          </kbd>{" "}
          copy hex
        </span>
      </div>

      {/* Main content — 3-column layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-89px)]">
        {/* Left panel — inputs */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border p-4 space-y-6 shrink-0 overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Input
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg border border-border overflow-hidden mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors
                    ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "hex" && <HexInput />}
            {activeTab === "image" && <ImageInput />}
          </div>
        </aside>

        {/* Center — preview + swatches */}
        <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto">
          <CandidateSelector />
          <LivePreview />
          <PaletteSwatches />
        </main>

        {/* Right panel — export + contrast + actions */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border p-4 space-y-6 shrink-0 overflow-y-auto">
          {/* Actions */}
          {palette && (
            <div className="flex gap-2">
              <button
                onClick={savePalette}
                className="flex-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Save
              </button>
              <ShareButton />
              <button
                onClick={generate}
                className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors"
                title="Regenerate (Space)"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          )}

          <ExportPanel />
          <ContrastReport />

          {/* MCP CTA */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="text-xs font-semibold text-foreground">
              Use in Claude Code
            </div>
            <code className="block text-[11px] bg-muted text-muted-foreground p-2 rounded-md font-mono break-all">
              claude mcp add hueshift-mcp -- npx hueshift-mcp@latest
            </code>
          </div>
        </aside>
      </div>

      {libraryOpen && <Library onClose={() => setLibraryOpen(false)} />}
    </div>
  );
}

export default App;
