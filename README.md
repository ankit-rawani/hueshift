# Hueshift

The color palette brain your coding agent plugs into.

A web-based color palette tool paired with a first-class MCP server. Generate accessible, OKLCH-based palettes from a hex color or image and pipe them directly into Claude Code, Cursor, Windsurf, or any MCP-compatible coding agent as ready-to-paste Tailwind v4 tokens, CSS variables, or design-token JSON.

## Monorepo Structure

```
packages/types/          — Shared TypeScript types
packages/color-engine/   — OKLCH color engine (scale generation, harmony, contrast, semantic tokens, export, image extraction)
apps/web/                — Vite + React + Tailwind v4 web app
apps/mcp-server/         — MCP server (stdio transport)
```

## Getting Started

```bash
pnpm install
pnpm dev          # starts the web app at http://localhost:5173
```

## Web App Features

- **Hex input** — enter a brand color, pick harmony type, get a full palette
- **Image input** — drag-drop an image, extract dominant colors via k-means
- **Live preview** — realistic UI mockup (dashboard card + buttons + tags) updates in real time
- **Light/Dark mode** — auto-generated dark mode with contrast-preserving inversion
- **6 export formats** — Tailwind v4, CSS vars, SCSS, W3C design tokens, JSON, hex list
- **Contrast report** — WCAG AA/AAA + APCA indicators on every fg/bg pair
- **Palette library** — save up to 20 palettes to localStorage
- **Shareable URLs** — palette data encoded in URL hash for sharing
- **Keyboard shortcuts** — Space to regenerate, C to copy

## MCP Server

Add to Claude Code:

```bash
claude mcp add hueshift -- npx tsx $(pwd)/apps/mcp-server/src/index.ts
```

Palettes are auto-saved to `~/.hueshift/palettes.json` for retrieval across sessions.

### Available Tools

| Tool | Description |
|---|---|
| `generate_palette_from_hex` | Generate a full OKLCH palette from a base hex color |
| `generate_palette_from_image` | Extract colors from a local image file |
| `generate_scale` | Generate an 11-shade scale (50-950) from a single hex |
| `export_palette` | Export by base hex or saved palette ID to any format |
| `check_contrast` | Check WCAG AA/AAA and APCA contrast between two colors |
| `suggest_semantic_tokens` | Map colors to semantic UI roles |
| `get_palette` | Retrieve a previously saved palette by ID or slug |
| `list_my_palettes` | List all saved palettes |

### Example

```
You: Generate a palette from #10b981 called "emerald-fintech" and export as Tailwind v4
Agent: [calls generate_palette_from_hex → export_palette]
Agent: "Here's your @theme block with 11-shade scales and semantic tokens..."

You: Use the palette I saved as "emerald-fintech" for this landing page
Agent: [calls get_palette → export_palette]
```

## Color Engine Features

- **OKLCH-first** — perceptually uniform, P3-aware, sRGB gamut-clamped
- **11-shade scales** (50–950) with chroma curves and hue rotation
- **5 harmony types** — mono, analogous, complementary, triadic, split-complementary
- **Image extraction** — k-means clustering with background detection and central weighting
- **Semantic token mapping** — background, foreground, primary, muted, accent, destructive, border, ring
- **Contrast checking** — WCAG AA/AAA + APCA with auto-fix suggestions
- **6 export formats** — Tailwind v4, CSS vars, SCSS, W3C design tokens, JSON, hex list
- **Dark mode** — auto-generated with contrast-preserving inversion

## Tech Stack

- **Frontend:** Vite, React, TypeScript, Tailwind CSS v4, Zustand
- **Color math:** culori
- **MCP:** @modelcontextprotocol/sdk
- **Package manager:** pnpm workspaces
