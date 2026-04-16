# Palette MCP — Build Document

*Working title: **Hueshift** (placeholder). The color-palette tool your coding agent plugs into.*

---

## 1. Executive summary

A web-based color palette tool paired with a first-class MCP server. Users can generate accessible, modern (OKLCH-based) palettes from three inputs — a natural-language prompt, a reference image, or a base hex color — and either use them on the website or pipe them directly into Claude Code, Cursor, Windsurf, or any MCP-compatible coding agent as ready-to-paste Tailwind v4 tokens, CSS variables, or design-token JSON.

The core insight: every existing color tool treats "the website" and "the coding agent" as two different worlds. They aren't anymore. A developer who uses Claude Code wants the palette they just liked on your site to appear in their code in one command, without copy-pasting hex values.

---

## 2. Problem & validated pain points

From research across developer communities, AI coding forums, and competitor reviews:

**For solo developers and vibe-coders:**
- Choosing colors eats hours of Pinterest, Dribbble, and Figma hopping.
- Self-generated palettes "feel wrong" but they can't articulate why.
- They forget which colors they used on past projects and rebuild from scratch.

**For designer-developer handoffs:**
- "Which blue was that again?" — colors drift between Figma, Slack screenshots, and CSS.
- No shared source of truth; renaming and versioning are ad hoc.
- Exporting palettes to Tailwind configs, SCSS vars, or CSS custom properties is manual.

**For users of AI coding agents (this is the hot, growing segment):**
- Claude Code, Cursor, Codex, Gemini CLI all default to "generic" palettes — pure `#000` text, flat grays, dated gradients, low-contrast combinations.
- Agents drift across sessions: prompt 1 uses one blue, prompt 3 uses another.
- Entire products (StyleSeed, Impeccable, TypeUI, Taste Skill) exist *only* to fix agent design output — validating both the pain and the willingness to install tools to fix it.
- None of those products do dynamic palette generation from an image or prompt. They ship static rules.

**Cross-cutting:**
- Accessibility (WCAG contrast) is almost always an afterthought, caught in QA rather than at palette-design time.
- Tailwind v4 moved the web to OKLCH; most palette tools still output sRGB hex only, forcing manual conversion.
- Dark mode variants are usually hand-rolled and inconsistent with the light palette.

---

## 3. Competitive landscape & the gap

| Tool | Web UI | Image → palette | Prompt → palette | OKLCH / Tailwind v4 | MCP server | AI-agent focus |
|---|---|---|---|---|---|---|
| Coolors | ✅ excellent | ✅ | Partial (chatbot) | Partial | ❌ | ❌ |
| Khroma | ✅ | ❌ | Implicit (learns taste) | ❌ | ❌ | ❌ |
| ColorMagic | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Colormind | ✅ basic | ❌ | ❌ | ❌ | ❌ | ❌ |
| Shinesfox | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Palettemaker | ✅ | ❌ | ❌ | Partial | ❌ | ❌ |
| UIColors.app | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| MCPMarket "Color Palette" skills | ❌ | ❌ | ❌ (math-only) | Some | Skill files only | ✅ |
| StyleSeed / Impeccable / Taste Skill | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ (rules only) |
| **Hueshift (this)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Nobody is in the bottom-right quadrant.** The web-tool players don't care about agents. The agent-tool players ship static rules, not dynamic generation. We sit in the middle and win both sides.

---

## 4. Product vision & positioning

**One-liner:** *"The color palette brain your coding agent plugs into."*

**Longer positioning:** A web-based palette tool — generate from a prompt, image, or base color — that doubles as an MCP server. Whatever you save on the site is available instantly inside Claude Code, Cursor, or Windsurf. OKLCH-first. Accessibility-checked by default. One install command.

**Three product pillars:**
1. **Modern color engine.** OKLCH-native, P3-aware, APCA/WCAG contrast baked in, semantic token output (not just `primary-500` but `background`, `foreground`, `accent`, `muted`, `destructive`).
2. **Three input modes.** Prompt, image, or hex — pick whichever matches how the user is thinking.
3. **Agent-first distribution.** MCP server, Claude Code skill, Cursor rule file — wherever developers already work.

---

## 5. Target users

**Primary (year-one focus):**
- **Indie developers / vibe-coders** building side projects with Claude Code or Cursor. Strong design sensibility gap, high willingness to install tools, active on X and Reddit.
- **Frontend developers at small teams** who own both code and some design decisions.

**Secondary:**
- **Designers exploring AI tooling** — they come for the web palette features, stay for the handoff export.
- **Agencies and freelancers** — fast client iteration, brand color extraction from client assets.

**Personas to keep in mind while building:**
- *"Arjun, indie SaaS builder":* ships 3 projects a year with Claude Code; frustrated that every MVP looks the same; will pay $5/mo if it feels premium.
- *"Priya, senior frontend at a 10-person startup":* owns design system; uses Tailwind v4; wants palette + dark-mode tokens she can drop into the repo without modification.
- *"Marcus, design-engineer at an agency":* pitches 2–3 client directions per week; needs to generate variations fast from a logo image.

---

## 6. Core features

### v1 — launch scope (6–8 weeks of work)

**Web app:**
1. **Prompt → palette.** Textarea. "Warm fintech palette, trustworthy, not boring." Generates 3–5 candidate palettes.
2. **Image → palette.** Drag-drop upload, or paste URL. Extracts 5–7 dominant colors, snaps to harmonic relationships.
3. **Hex → palette.** Enter a brand color, generate a full 11-shade OKLCH scale (50–950) plus semantic tokens.
4. **Live preview surface.** One realistic UI mockup (a dashboard card + button + form) that updates as colors change. Keep it to ONE surface in v1 — no need to match Coolors' 15.
5. **Export panel:** Tailwind v4 `@theme` block, CSS custom properties, design tokens JSON (W3C format), SCSS variables, hex list, PNG mood board.
6. **WCAG / APCA contrast indicators** on every pair (bg/fg, primary/bg, etc.). Red/yellow/green dots, click for details.
7. **Dark mode variant.** Auto-generated from light palette; user can tweak.
8. **Save to library** (requires free account). Up to 20 palettes free tier.
9. **Shareable palette URL** — `/p/abc123` page with OG image for X/LinkedIn.
10. **One-line MCP install** — top banner of every palette detail page: `npx @hueshift/mcp install`.

**MCP server (the differentiator):**

Tools exposed:
- `generate_palette_from_prompt(prompt, count?, style?)` → returns candidate palettes
- `generate_palette_from_image(image_url_or_base64, count?)` → extracts palette from image
- `generate_palette_from_hex(hex, harmony?)` → full OKLCH scale + semantic tokens
- `get_palette(id_or_slug)` → fetches a saved palette from user's library
- `list_my_palettes()` → user's saved palettes (requires API key binding)
- `check_contrast(fg, bg, target?)` → WCAG + APCA results
- `export_palette(id, format)` → returns code in requested format (Tailwind v4, CSS vars, JSON, SCSS)
- `suggest_semantic_tokens(palette_id)` → maps colors to `background`, `foreground`, `primary`, `muted`, `accent`, `destructive`

Agent usage looks like:
```
You: "Use the palette I saved as 'warm-fintech' for this landing page"
Agent: [calls get_palette("warm-fintech") → export_palette(id, "tailwind_v4")]
Agent: "I've updated @theme with your palette. Here's the diff..."
```

Or from scratch:
```
You: "I uploaded a photo of the Istanbul skyline to @mockup.jpg.
      Generate a palette from it and apply it to my Tailwind config."
Agent: [calls generate_palette_from_image, then export_palette]
```

### v1.5 — weeks 9–14

- **Public palette gallery** with search, remix, fork. SEO flywheel.
- **"Trending this week"** signal (drives MCP's `get_trending_palettes` tool).
- **Claude Code skill file** (parallel distribution channel — some users will install the skill instead of the MCP).
- **Palette refinement via chat** — "make it less saturated," "shift warmer" — API-backed, uses Claude Haiku for cost.
- **Logo extraction mode** — auto-detects and removes background, weights central colors higher.
- **Figma plugin** — read palette from Hueshift URL, drop into file as styles.

### v2 — months 4–6

- **Team workspaces** — shared libraries, role-based access.
- **Brand guardrails** — pin certain colors as mandatory, let the engine fill around them.
- **"Palette lineage"** — track which projects used which palette; diff changes.
- **VS Code extension** for non-MCP users.
- **API access** (paid) for programmatic use outside the MCP.

---

## 7. MCP server specification

### Transport

Ship as both **stdio** (for local install via `npx`) and **HTTP** (for remote use via `claude mcp add --transport http`). Cloudflare Workers handles HTTP trivially.

### Installation UX

The golden install path — one command, runs anywhere:

```bash
npx @hueshift/mcp install
```

This auto-detects Claude Code, Cursor, Windsurf, Codex CLI, Gemini CLI, or OpenCode configs on the machine and writes the MCP server entry into each. Fallback: prints the JSON block with clear instructions.

For HTTP transport, a hosted endpoint at `mcp.hueshift.com`, authenticated with an API key tied to the user's account (for access to saved palettes).

### Tool schemas (TypeScript-style)

```ts
// Generate from prompt
generate_palette_from_prompt({
  prompt: string,                    // "warm fintech, trustworthy"
  count?: number,                    // default 3, max 5
  style?: "minimal" | "vibrant" | "muted" | "high-contrast" | "pastel",
  mode?: "light" | "dark" | "both",  // default "both"
}): Promise<Palette[]>

// Generate from image
generate_palette_from_image({
  source: { url: string } | { base64: string },
  count?: number,                    // default 5
  ignore_background?: boolean,       // default true — strip dominant neutral
  weight_central?: boolean,          // default true — logo-friendly
}): Promise<Palette[]>

// Generate scale from base hex
generate_palette_from_hex({
  base_hex: string,                  // "#3b82f6"
  harmony?: "mono" | "analogous" | "complementary" | "triadic" | "split-complementary",
  include_neutrals?: boolean,        // default true
}): Promise<Palette>

// Fetch saved palette
get_palette({
  id_or_slug: string,
}): Promise<Palette>

// List user's palettes (requires API key)
list_my_palettes({
  limit?: number,
  tag?: string,
}): Promise<PaletteSummary[]>

// Contrast check
check_contrast({
  foreground: string,                // hex or oklch
  background: string,
  standard?: "wcag-aa" | "wcag-aaa" | "apca",
  text_size?: "normal" | "large",
}): Promise<{
  passes: boolean,
  ratio: number,
  standard: string,
  suggestion?: string,               // adjusted color if fail
}>

// Export to code
export_palette({
  palette_id: string,
  format: "tailwind-v4" | "css-vars" | "scss" | "design-tokens-w3c" | "json" | "hex-list",
  include_dark_mode?: boolean,       // default true
  semantic_tokens?: boolean,         // default true
}): Promise<{ code: string, filename_suggestion: string }>

// Suggest semantic mapping
suggest_semantic_tokens({
  palette_id: string,
}): Promise<{
  background: string,
  foreground: string,
  primary: string,
  primary_foreground: string,
  secondary: string,
  muted: string,
  accent: string,
  destructive: string,
  border: string,
  ring: string,
}>

// Trending (v1.5)
get_trending_palettes({
  period?: "day" | "week" | "month",
  tag?: string,
  limit?: number,
}): Promise<PaletteSummary[]>
```

### Palette object shape

```ts
type Palette = {
  id: string,
  slug: string,
  name: string,
  description?: string,
  colors: Array<{
    name: string,           // "ocean-blue"
    oklch: string,          // "oklch(0.64 0.18 260)"
    hex: string,            // "#3b82f6"
    role?: string,          // "primary", "accent", etc.
    scale?: {               // full 50-950 if computed
      50: string, 100: string, ..., 950: string,
    }
  }>,
  mode: "light" | "dark" | "both",
  contrast_report: ContrastReport,
  source: {
    type: "prompt" | "image" | "hex",
    value: string,
  },
  created_at: string,
  public: boolean,
  url: string,             // https://hueshift.com/p/abc123
}
```

### Prompt engineering (for `generate_palette_from_prompt`)

The backend uses Claude Haiku (cheap, fast) with a structured JSON output prompt. The system prompt encodes our taste opinions — this is the core IP. A sketch:

> You are an expert UI designer generating palettes for modern web applications. Always:
> - Output OKLCH. Never use pure black (`oklch(0 0 0)`) — use `oklch(0.22 0.01 260)` for "near-black."
> - Maintain WCAG AA contrast (4.5:1) between foreground and background by default.
> - Favor perceptually balanced chroma: neutrals at ~0.01–0.04, primaries at 0.12–0.22, accents up to 0.28.
> - Never generate 5 saturated colors. A good palette has 1–2 hero colors, 2–3 supporting, rest neutral.
> - Consider the vibe: fintech = restrained chroma, trustworthy blues/greens; creative = higher chroma, unusual hues; editorial = warm neutrals with one cool accent.
> - Output valid JSON matching schema X.

This prompt is version-controlled and A/B tested. It's what separates us from Colormind's random outputs.

---

## 8. Web app specification

### Design principles

- **Ruthlessly uncluttered.** Users are there to pick colors, not navigate. Sidebar + canvas. That's it.
- **Keyboard-first.** Space to regenerate, L to lock, C to copy, 1–9 to switch themes.
- **No dark-pattern signups.** Generate and export without an account. Account only needed for save-library and MCP sync.
- **Speed.** First palette visible in under 2 seconds from page load.

### Page map

1. `/` — Hero with live palette animation. One CTA: "Generate a palette." Secondary CTA: "Connect to Claude Code."
2. `/new` — The generator. Three tabs (Prompt / Image / Hex). Left: inputs. Center: palette + preview. Right: export panel + contrast report.
3. `/p/:slug` — Palette detail page. Shared view. OG image. "Remix" and "Open in MCP" buttons.
4. `/library` — User's saved palettes (auth required).
5. `/explore` (v1.5) — Public gallery, trending, search.
6. `/docs` — MCP install docs, tool reference, integration guides for each agent.
7. `/pricing` — Simple, two-tier.

### Generator page wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  Hueshift                            [Library] [Docs] [Account] │
├─────────────┬──────────────────────────────────┬────────────────┤
│             │                                  │                │
│ [Prompt]    │   ┌─────────────────────────┐    │  Export        │
│ [ Image ]   │   │                         │    │  ┌──────────┐  │
│ [ Hex  ]    │   │   Live preview          │    │  │Tailwind v4│ │
│             │   │   (dashboard card)      │    │  └──────────┘  │
│ ───────     │   │                         │    │  [CSS vars]    │
│             │   └─────────────────────────┘    │  [Design tokens]│
│ "warm        │                                  │  [SCSS]        │
│  fintech,   │   ● ● ● ● ● ← palette swatches   │                │
│  premium"   │   locks: □ ■ □ □ □               │  ──────        │
│             │                                  │                │
│ Style:      │   Contrast: AA ✓  APCA 68 ✓     │  Contrast      │
│ [Minimal v] │                                  │  report ▼      │
│             │   [Regenerate] [Save] [Share]    │                │
│ Mode:       │                                  │  ──────        │
│ ◉ Both      │   ┌─ Dark mode preview ─────┐    │                │
│ ○ Light     │   │                         │    │  MCP           │
│ ○ Dark      │   └─────────────────────────┘    │  [Open in Claude│
│             │                                  │   Code] ▸       │
└─────────────┴──────────────────────────────────┴────────────────┘
```

### The one ad unit

Carbon Ads (or EthicalAds), right sidebar, bottom of export panel. Single tasteful unit, no motion, no takeovers. Never on `/` landing, never on shared `/p/:slug` pages (those are the viral surface — ad-free to encourage sharing).

---

## 9. Tech stack & architecture

### Frontend
- **Vite + React + TypeScript** (no Next.js needed — static hosting is cheaper)
- **Tailwind CSS v4** (eat our own dog food — all our exports target v4)
- **shadcn/ui** for primitives
- **culori** library for OKLCH math (best-in-class, small bundle)
- **colorthief** or custom k-means for client-side image extraction (fallback to server for complex cases)
- **Zustand** for state

### Backend
- **Cloudflare Workers** for MCP HTTP server, palette API, and auth
- **Cloudflare D1** (SQLite) for palette storage, user accounts
- **Cloudflare R2** for image uploads (cheaper than S3, zero egress)
- **Cloudflare KV** for rate-limit counters and trending cache
- **Anthropic API (Claude Haiku)** for prompt-based generation — cheapest capable model
- **Stripe** for subscriptions

### MCP server package
- **TypeScript**, `@modelcontextprotocol/sdk`
- Published on npm as `@hueshift/mcp`
- Supports stdio (local) and HTTP (remote via our Workers endpoint)
- Ships an installer that auto-detects agent configs on disk

### Hosting costs (projected at scale)

| Traffic level | Cloudflare | Anthropic API | Stripe | Total/mo |
|---|---|---|---|---|
| 0–10k visits | Free tier | ~$5 | — | ~$5 |
| 10k–100k visits | Free tier | ~$30–50 | small | ~$50 |
| 100k–500k visits | ~$20 | ~$150–300 | ~$30 | ~$200–350 |
| 500k+ | ~$50 | Scales with use | ~scales | Profitable |

Key economic lever: **cache aggressively**. Identical prompts → cached palette. Saved palettes → served from D1, zero LLM cost. Image extraction → client-side first, server only on fallback.

### Data model (simplified)

```sql
users (id, email, api_key, stripe_customer_id, tier, created_at)
palettes (id, slug, owner_id, name, colors_json, source_json, public, created_at)
palette_views (palette_id, viewed_at)           -- for trending
palette_uses (palette_id, used_via, used_at)    -- 'mcp', 'web', 'export'
exports (palette_id, format, count)             -- analytics
```

---

## 10. Color engine — the technical heart

This is where we out-execute competitors. Details matter.

### OKLCH-first internal representation

All palettes stored and computed in OKLCH. Hex/RGB is a derived view. This gives us:
- Perceptually uniform lightness for predictable scales
- Clean scale generation (keep H constant, vary L on a curve, vary C on a curve)
- Reliable dark-mode inversion

### Scale generation algorithm

For a base hex, generate 11 shades (50–950) using Tailwind v4's approach:

1. Convert base hex to OKLCH.
2. Anchor lightness at predefined stops: `[0.98, 0.95, 0.90, 0.82, 0.72, 0.62, 0.52, 0.42, 0.34, 0.26, 0.18]` for 50–950.
3. Chroma curve: peaks around 500–600, tapers at extremes (neutrals don't saturate near white/black).
4. Hue held constant, with slight warmth shift at extremes (hue rotation of 1–3° at each end for perceptual naturalness).
5. Verify each shade is in-gamut (P3 first, sRGB fallback with clipping).

### Semantic token mapping

Given a palette of 5–7 raw colors, map to semantic roles:
- **background** → lightest neutral in light mode, darkest in dark mode
- **foreground** → highest contrast vs background
- **primary** → most saturated non-neutral
- **primary-foreground** → auto-computed for AA contrast vs primary
- **muted** → low-chroma neutral at 2nd-lightest (light) or 2nd-darkest (dark)
- **accent** → second most saturated, hue-distant from primary
- **destructive** → if palette has red/orange, use it; else inject semantic red
- **border** → muted at slightly higher chroma
- **ring** → primary at 50% opacity

All mappings are deterministic but overridable by the user.

### Accessibility

- **WCAG 2.1** AA/AAA ratios on every foreground/background pair.
- **APCA** (the emerging standard, likely in WCAG 3) also reported — this is the forward-looking pitch.
- When a pair fails, the engine **suggests** an adjusted color (shift L until ratio passes, hold H and C).
- Dark mode generated with contrast-preserving inversion, not naive lightness flip.

### Image extraction

- **Client-side default**: k-means with 8–16 clusters over sampled pixels.
- **Server-side fallback** for very large images or when central-weighting is requested: a Worker that uses a small WASM build of color-thief.
- **Background detection**: dominant edge color → treated as background, deprioritized in palette.
- **Logo mode**: weight central pixels 3× higher.

---

## 11. Monetization

### Tiers

| | **Free** | **Pro — $6/mo or $48/yr** | **Team — $18/user/mo** (v2) |
|---|---|---|---|
| Generate unlimited palettes on the web | ✅ | ✅ | ✅ |
| Save palettes | 20 | Unlimited | Unlimited |
| MCP access | 50 calls/day | Unlimited | Unlimited |
| Public sharing | ✅ | ✅ | ✅ |
| Private palettes | ❌ | ✅ | ✅ |
| Image uploads > 5MB | ❌ | ✅ | ✅ |
| Export formats | Hex, Tailwind | All | All + Figma sync |
| Team workspaces | ❌ | ❌ | ✅ |
| Brand guardrails | ❌ | ❌ | ✅ |

### Ads

Single Carbon Ads unit on the generator page. Expected CPM $1.5–3 on dev/designer traffic. At 50k monthly uniques this is roughly $100–250/mo — meaningful but secondary to subs.

### Realistic revenue at 100k monthly visits (year-one target)

- ~1.5% free → Pro conversion = 1,500 paid users × $6 = **$9k MRR**
- Ads = **$200–400/mo**
- Blended: **~$110k ARR** at operating costs under $500/mo. Healthy solo/small-team business.

---

## 12. Launch plan (90 days)

### Weeks 1–6: Build v1

- Week 1–2: Web generator with hex mode + Tailwind v4 export + contrast checks. Ship to closed beta.
- Week 3: Add prompt mode (Haiku-backed).
- Week 4: Add image mode.
- Week 5: Auth, library, Stripe, shareable URLs.
- Week 6: MCP server v1 (stdio + HTTP), one-line installer, docs.

### Week 7: Soft launch

- Post to r/ClaudeAI, r/cursor, r/SideProject, Hacker News "Show HN," Indie Hackers.
- Tweet thread: "I was tired of Claude Code picking ugly colors, so I built..."
- Submit to the MCP community registry.
- Target: 2,000 signups, 50 paid.

### Weeks 8–9: Iterate on feedback

- Most-requested features first.
- Add gallery + trending if week 7 validated the core loop.
- Apply for Carbon Ads (needs traffic history).

### Week 10: Product Hunt launch

- Use your week 7 waitlist/early users for first-hour engagement.
- Prepare before/after screenshots: "AI agent's default colors vs Hueshift colors" — the demo that sells.

### Weeks 11–12: Content flywheel

- Blog posts targeting SEO: "How to generate Tailwind v4 palettes from an image," "WCAG-compliant color palettes for AI coding agents," "The Claude Code design problem and how to fix it."
- Guest appearances on dev YouTube / podcasts that cover Claude Code and Cursor.
- Partner with design-skill tool authors (StyleSeed, TypeUI) — they ship rules, we ship dynamic palettes; complementary not competitive.

---

## 13. Success metrics

### North-star metric
**Weekly palettes exported to an agent** — captures both acquisition (new users discovering MCP) and retention (repeat use). Ignore vanity metrics like signups.

### Supporting metrics
- MCP installs per week
- Free → Pro conversion rate (target: 1–2%)
- Palettes generated per user per week (target: 3+ for active users)
- `/p/:slug` page views from social (viral coefficient proxy)
- Time-to-first-export on new user (target: under 90 seconds)

---

## 14. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Coolors or Figma ships a competing MCP | Medium-high | Move fast, own the OKLCH / agent-first niche, build community before big players catch up |
| Anthropic API costs eat margin | Medium | Aggressive caching, cheap model (Haiku), eventually fine-tune a small model |
| MCP standard churn breaks the server | Low-medium | Pin SDK versions, ship updates fast, stdio fallback always works |
| "AI-ugly-UI" category gets crowded | High | Integrate with, don't compete with, rules-based tools. Be the data/engine layer. |
| Image extraction IP / licensing concerns for uploaded assets | Medium | Terms of service clarify users retain rights; delete uploads after 30 days on free tier |
| Low conversion from MCP-only users (they never visit the web) | Medium | MCP responses always include `url:` link back to the palette detail page, nudging web engagement |

---

## 15. What to build this week

Concrete first-week scope if you want to start immediately:

1. Buy the domain. Shortlist: `hueshift.dev`, `palettemcp.com`, `paletteforge.dev`, `chromastack.com`. Pick whichever is available and memorable.
2. Set up the monorepo: `apps/web`, `apps/mcp-server`, `packages/color-engine` (shared), `packages/types`.
3. Build the color engine package first — pure TypeScript, no UI, exhaustive tests. This is shared by web and MCP and is the thing you'll re-use forever. Use `culori` for OKLCH math, implement scale generation, semantic mapping, contrast checking.
4. Wire up a barebones web UI: hex input → palette → Tailwind v4 export. No auth, no DB. Just proves the engine works end-to-end.
5. Ship it to a Cloudflare Pages subdomain and start dogfooding. Generate a palette for Hueshift itself from its own tool.

Everything else is iteration on that spine.

---

## Appendix A — Example MCP interactions

**Interaction 1: Image to Tailwind config**

```
User (in Claude Code): I've uploaded a hero image at ./assets/hero.jpg.
                       Use its colors to theme my Tailwind v4 config.

Claude Code:
  [calls generate_palette_from_image with the file]
  [receives palette with 5 colors]
  [calls export_palette(id, "tailwind-v4")]
  [writes the @theme block to app/globals.css]

  "I extracted a palette from your hero image — warm terracotta
  primary, cool stone neutrals, sage accent. I've updated
  app/globals.css with the @theme block. The palette is also
  saved at https://hueshift.com/p/warm-terracotta if you want to
  tweak it."
```

**Interaction 2: Prompt with style constraint**

```
User: Generate a palette for a meditation app. Calm, premium,
      definitely not childish. Then apply it to the app.

Claude Code:
  [calls generate_palette_from_prompt("calm meditation app, premium",
     style: "muted")]
  [shows user 3 candidates]
  [user picks one]
  [calls export_palette + writes files]
```

**Interaction 3: Refining an existing palette**

```
User: The primary color in @globals.css feels too saturated.
      Tone it down but keep the same hue family.

Claude Code:
  [reads current palette, identifies primary]
  [calls check_contrast to ensure AA is maintained]
  [calls generate_palette_from_hex with adjusted chroma]
  [diffs and applies]
```

---

## Appendix B — Competitive differentiation summary

If a user asks "why not just use Coolors?":

| Coolors | Hueshift |
|---|---|
| Great palette tool, great gallery | Same quality, narrower scope |
| No MCP | First-class MCP |
| Hex-based export | OKLCH-first, Tailwind v4 native |
| WCAG only | WCAG + APCA |
| Image to palette ✅ | Image to palette + prompt-aware style ✅ |
| Built for designers | Built for developers using AI agents |

The pitch isn't "replace Coolors." It's "Coolors doesn't know your Claude Code exists. We do."
