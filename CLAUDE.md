# Hueshift — CLAUDE.md

## Project Overview

Hueshift is a web-based color palette tool + MCP server. Users generate OKLCH-based palettes from hex input or image upload and export them as Tailwind v4 tokens, CSS vars, or design-token JSON. The MCP server lets coding agents (Claude Code, Cursor, etc.) use palettes directly.

## Monorepo Layout

- `packages/types/` — Shared TypeScript types (Palette, Color, SemanticTokens, ExportFormat, etc.)
- `packages/color-engine/` — Pure TypeScript color engine. No UI, no network. Uses `culori` for OKLCH math. Includes image extraction (k-means), scale generation, harmony, contrast, semantic mapping, and export formatting.
- `apps/web/` — Vite + React + Tailwind v4 + Zustand. The generator UI with hex input, image upload, live preview, export panel, contrast report, palette library, and shareable URLs.
- `apps/mcp-server/` — MCP server over stdio using `@modelcontextprotocol/sdk`. 8 tools. Persists palettes to `~/.hueshift/palettes.json`.

## Commands

```bash
pnpm install              # install all dependencies
pnpm dev                  # start web app dev server (port 5173)
pnpm --filter @hueshift/color-engine test        # run color engine tests (vitest)
pnpm --filter @hueshift/color-engine typecheck   # typecheck color engine
```

## Key Architecture Decisions

- **OKLCH-first**: All colors stored and computed in OKLCH. Hex/RGB is a derived view. Use `culori` for conversions.
- **Color engine is the shared core**: Both the web app and MCP server import from `@hueshift/color-engine`. Never duplicate color logic.
- **Semantic tokens over raw colors**: The engine maps raw palette colors to semantic roles (background, foreground, primary, muted, accent, destructive, border, ring). Exports use these tokens.
- **Scale generation**: 11 stops (50–950) with predefined lightness stops, chroma curve (peaks at 500–600), and slight hue rotation at extremes for naturalness.
- **Gamut clamping**: All output colors are clamped to sRGB using culori's perceptual chroma reduction.
- **MCP palette persistence**: Palettes are saved to `~/.hueshift/palettes.json` by both ID and slug for retrieval via `get_palette` and `list_my_palettes`.
- **Web palette library**: Uses localStorage (`hueshift-library` key), max 20 palettes.
- **Shareable URLs**: Palette data encoded in URL hash fragment (`#p=<base64>`).

## Conventions

- Package manager: **pnpm** with workspaces
- All packages use `"type": "module"` (ESM)
- Import paths use `.js` extension (TypeScript ESM convention)
- Tailwind v4 is used — `@theme` block, not `tailwind.config.js`
- No `next.js` — static Vite app deployed to Cloudflare Pages
- culori types are declared in `packages/color-engine/src/culori.d.ts` (culori v4 doesn't ship types)

## MCP Server Tools

8 tools: `generate_palette_from_hex`, `generate_palette_from_image`, `generate_scale`, `export_palette`, `check_contrast`, `suggest_semantic_tokens`, `get_palette`, `list_my_palettes`.

## What's Not Built Yet

- Auth, user accounts (needs Cloudflare D1)
- Public gallery, trending, search
- HTTP transport for MCP server (needs Cloudflare Workers)
- Figma plugin
- Team workspaces, brand guardrails
