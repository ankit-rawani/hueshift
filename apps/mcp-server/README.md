# hueshift-mcp

MCP server for generating OKLCH-based color palettes, semantic UI tokens, and accessibility-checked color scales.

Works with Claude Code, Cursor, Windsurf, and any MCP-compatible client.

## Install

### Claude Code

```bash
claude mcp add hueshift-mcp -- npx hueshift-mcp@latest
```

### Cursor / Windsurf

Add to your MCP config (`.cursor/mcp.json` or equivalent):

```json
{
  "mcpServers": {
    "hueshift": {
      "command": "npx",
      "args": ["hueshift-mcp@latest"]
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hueshift": {
      "command": "npx",
      "args": ["hueshift-mcp@latest"]
    }
  }
}
```

## Tools

### `generate_palette_from_hex`

Generate a full color palette from a base hex color. Returns 11-shade scales (50-950) for each color, semantic tokens for light/dark mode, and a contrast report.

**Parameters:**
- `base_hex` (required) — Base hex color, e.g. `"#3b82f6"`
- `harmony` — `mono`, `analogous`, `complementary`, `triadic`, `split-complementary` (default: `analogous`)
- `include_neutrals` — Include a harmonized neutral scale (default: `true`)
- `name` — Palette name

### `generate_palette_from_image`

Extract dominant colors from a local image file (PNG, JPG, WebP) and generate a palette.

**Parameters:**
- `image_path` (required) — Absolute path to the image
- `count` — Number of colors to extract (default: `6`)
- `weight_central` — Weight central pixels higher (default: `true`)
- `name` — Palette name

### `export_palette`

Export a palette as ready-to-paste code.

**Parameters:**
- `base_hex` or `palette_id` — Source color or saved palette
- `format` (required) — `tailwind-v4`, `css-vars`, `scss`, `design-tokens-w3c`, `json`, `hex-list`
- `harmony` — Harmony type (default: `analogous`)
- `include_dark_mode` — Include dark mode tokens (default: `true`)

### `check_contrast`

Check WCAG AA, AAA, and APCA contrast between two colors. Suggests adjusted colors when the pair fails.

**Parameters:**
- `foreground` (required) — Foreground color (hex)
- `background` (required) — Background color (hex)
- `standard` — `wcag-aa`, `wcag-aaa`, `apca` (default: `wcag-aa`)
- `text_size` — `normal`, `large` (default: `normal`)

### `suggest_semantic_tokens`

Generate semantic UI tokens (background, foreground, primary, muted, accent, destructive, border, ring) for light and dark mode.

**Parameters:**
- `base_hex` (required) — Base hex color
- `harmony` — Harmony type (default: `analogous`)

### `get_palette`

Retrieve a previously saved palette by ID or slug.

### `list_my_palettes`

List all saved palettes with summaries.

### `generate_scale`

Generate an 11-shade color scale (50-950) from a single hex color.

## How it works

- All colors are computed in **OKLCH** (perceptually uniform) and gamut-clamped to sRGB
- Palettes auto-save to `~/.hueshift/palettes.json` for retrieval across sessions
- Semantic tokens map raw colors to UI roles following shadcn/ui conventions
- Contrast checks use WCAG 2.1 and APCA algorithms

## License

MIT
