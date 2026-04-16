# hueshift-mcp

The color palette brain your coding agent plugs into.

Generate accessible, OKLCH-based palettes from a hex color or image — then pipe them directly into your code as Tailwind v4 tokens, CSS variables, or design-token JSON. Works with Claude Code, Cursor, Windsurf, Claude Desktop, and any MCP-compatible client.

## Why

Every AI coding agent defaults to the same generic colors — pure black text, flat grays, dated gradients, low-contrast pairs. Hueshift fixes that. Generate a real palette, check accessibility, and export production-ready tokens without leaving your editor.

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

Generate a full color palette from a base hex color. Returns 11-shade scales (50–950) for each harmony color, semantic tokens for light/dark mode, and a WCAG/APCA contrast report.

| Parameter | Required | Default | Description |
|---|---|---|---|
| `base_hex` | yes | — | Base hex color, e.g. `"#3b82f6"` |
| `harmony` | no | `analogous` | `mono`, `analogous`, `complementary`, `triadic`, `split-complementary` |
| `include_neutrals` | no | `true` | Include a harmonized neutral scale |
| `name` | no | — | Palette name |

### `generate_palette_from_image`

Extract dominant colors from a local image file and generate a palette.

| Parameter | Required | Default | Description |
|---|---|---|---|
| `image_path` | yes | — | Absolute path to the image (PNG, JPG, WebP) |
| `count` | no | `6` | Number of colors to extract |
| `weight_central` | no | `true` | Weight central pixels higher (useful for logos) |
| `name` | no | — | Palette name |

### `export_palette`

Export a palette as ready-to-paste code. Supports Tailwind v4, CSS custom properties, SCSS, W3C design tokens, JSON, and hex list.

| Parameter | Required | Default | Description |
|---|---|---|---|
| `base_hex` or `palette_id` | yes | — | Source color or saved palette ID/slug |
| `format` | yes | — | `tailwind-v4`, `css-vars`, `scss`, `design-tokens-w3c`, `json`, `hex-list` |
| `harmony` | no | `analogous` | Harmony type (when using `base_hex`) |
| `include_dark_mode` | no | `true` | Include dark mode tokens |

### `check_contrast`

Check WCAG AA, AAA, and APCA contrast between two colors. Suggests an adjusted color when the pair fails.

| Parameter | Required | Default | Description |
|---|---|---|---|
| `foreground` | yes | — | Foreground color (hex) |
| `background` | yes | — | Background color (hex) |
| `standard` | no | `wcag-aa` | `wcag-aa`, `wcag-aaa`, `apca` |
| `text_size` | no | `normal` | `normal`, `large` |

### `suggest_semantic_tokens`

Generate semantic UI tokens (background, foreground, primary, muted, accent, destructive, border, ring) for both light and dark mode.

| Parameter | Required | Default | Description |
|---|---|---|---|
| `base_hex` | yes | — | Base hex color |
| `harmony` | no | `analogous` | Harmony type |

### `generate_scale`

Generate an 11-shade color scale (50–950) from a single hex color. Useful for creating a Tailwind-style color ramp from a brand color.

| Parameter | Required | Default | Description |
|---|---|---|---|
| `hex` | yes | — | Base hex color |

### `get_palette`

Retrieve a previously saved palette by its ID or slug.

### `list_my_palettes`

List all saved palettes with summaries.

## Example usage

**Image to Tailwind config:**

```
You: I've uploaded a hero image at ./assets/hero.jpg.
     Use its colors to theme my Tailwind v4 config.

Agent: [calls generate_palette_from_image → export_palette("tailwind-v4")]
       "I extracted a palette from your hero image — warm terracotta primary,
       cool stone neutrals, sage accent. I've updated app/globals.css with
       the @theme block."
```

**Hex to full design system:**

```
You: Our brand color is #3b82f6. Generate a palette and apply it.

Agent: [calls generate_palette_from_hex → export_palette("css-vars")]
       "Generated an analogous palette with primary, secondary, accent, and
       neutral scales. Light and dark mode tokens are ready."
```

**Contrast check:**

```
You: Is this text readable? fg=#6b7280 on bg=#f3f4f6

Agent: [calls check_contrast]
       "WCAG AA fails for normal text (ratio 4.2:1, needs 4.5:1).
       Suggestion: darken to #5b6370 for a 5.1:1 ratio."
```

## How it works

- All colors computed in **OKLCH** (perceptually uniform) and gamut-clamped to sRGB
- Semantic tokens map raw colors to UI roles following shadcn/ui conventions: `background`, `foreground`, `primary`, `muted`, `accent`, `destructive`, `border`, `ring`
- Palettes auto-save to `~/.hueshift/palettes.json` for retrieval across sessions
- Contrast checks use WCAG 2.1 and APCA algorithms with auto-fix suggestions
- Each regeneration produces dramatically different palettes (coolors.co-style exploration)

## License

MIT
