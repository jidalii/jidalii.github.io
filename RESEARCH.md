# Website Redesign Research

> **Goal**: Rewrite jidalii.github.io as a personal brand site — developer + photographer.
> **Tone**: 高级感 (premium), 耐看 (timeless), 文艺气息 (literary/artistic), not super fancy.
> **Reference**: contralabs.com component design & animation philosophy.

---

## 1. Who is Jida? (Identity Synthesis)

From resume + existing blog + photos:

| Dimension | Details |
|-----------|---------|
| **Day job** | Blockchain/Backend Developer @ Presto Labs (Shanghai). MPC signing, DeFi integration, HFT feeders. |
| **Past** | Neo Smart Economy (faucet, DEX), CASP Research Lab @ BU (MPC, secure data pipelines). |
| **Education** | Boston University CS, GPA 3.93. |
| **Stack** | Go, Solidity, Python, Circom, JS/TS, C, SQL/NoSQL. Kafka, Redis, Docker, gRPC. |
| **Blog topics** | Go concurrency (goroutines, channels, select, singleflight, sync), Solana account models, UniswapV3, locks, DNS/DHCP/WebSocket. Deeply technical, tutorial-style. |
| **Photography** | 95+ photos on Nikon Z 6_2. Lightroom-edited exports. Portraits, landscapes, street — cinematic and intentional. |
| **Motto** | "Build a Better Decentralized World." |

**Core brand tension**: The precision of systems engineering × the eye of a photographer. Every design choice should honor both. The site is where code meets craft.

**Primary audience**: Technical hiring managers and fellow engineers.
**Secondary**: Photography enthusiasts, collaborators.
**Single job**: Convince the visitor that Jida is both deeply competent (real code on display, substantive blog) and has artistic taste (photography gallery) — in under 30 seconds.

---

## 2. Reference Site Analysis: contralabs.com

Contra Labs is Contra's platform for human evaluation of AI models. Their marketing site (Framer build by Alex Karpodinis, designed by Heed Collective) won community acclaim. Key design patterns:

### 2.1 Signature Moves

1. **"Digital Renaissance" concept** — Classical art references fused with tech imagery (renaissance woman typing on a dithered keyboard). A single bold thematic gesture that unifies the entire site.

2. **Per-page preloaders → hero transitions** — Each page has a unique animated preloader that *dissolves seamlessly into the hero section*. Not a spinning loader — a tone-setting, branded micro-moment.

3. **Scroll-driven narrative** — Dynamic motion tied to scroll position. Animations enhance content flow without competing. Restraint in quantity, precision in timing.

4. **Custom interactions beyond framework limits** — Pushed past Framer's native capabilities with custom code where the vision demanded it.

### 2.2 What to Steal / Adapt

| From Contra Labs | How to apply for Jida |
|------------------|----------------------|
| Page-specific animated entrances | A single, subtle hero animation on homepage — perhaps a code-to-photo morph or a shutter-click transition |
| Scroll-triggered reveals | Blog posts, photo grids fading/rising into view with staggered timing |
| Thematic unity (Digital Renaissance) | "Code as Craft" — developer precision meets photographic eye |
| Restrained animation — not scattered | One orchestrated moment per section, not dozens of micro-interactions |
| Dithered texture / grainy feel | Could translate to subtle film grain on photo gallery, or a terminal-inspired code aesthetic |

### 2.3 Contralabs Color System (extracted from screenshots)

Sampled from three contralabs.com screenshots (3024×1646px). All three show the same structural pattern: **dark-first canvas, section zones that shift on 3 axes (hue, lightness, saturation), multiple accent colors with distinct roles.**

#### Screenshot 1 (`image.png`) — Full page scroll

```text
y%    hex       L     sat   zone
───   ────────  ───   ────  ───────────────────────────
0%    #EEEDE9   237    3%   Light warm grey — near white
⋮     ⋮          ⋮     ⋮    
25%   #F0EEEA   238    2%   
                            ← transition (ΔL: 24, Δsat: 9%)
30%   #EAEBE6   234    4%   
35%   #C9DBD6   213   11%   Light teal enters
⋮     ⋮          ⋮     ⋮    
85%   #B5D1CC   200   13%   Stable teal — SAME hue, desaturated
                            ← transition (ΔL: 114!)
95%   #336568    86   49%   Dark teal footer — highest saturation
```

#### Screenshot 2 (`image copy.png`) — Warm-leaning page

```text
y%    hex       L     sat   zone
───   ────────  ───   ────  ───────────────────────────
0%    #D0CCC2   203    8%   Warm beige
⋮     ⋮          ⋮     ⋮    
30%   #CFD0C7   206    7%   
35%   #A8A698   164   11%   Muted olive — hue shifts green
⋮     ⋮          ⋮     ⋮    
75%   #897D69   128   18%   Warm brown — hue shifts warm
                            ← transition (ΔL: 62!)
85%   #C5C3B6   193   10%   Jumps back to light warm grey
⋮     ⋮          ⋮     ⋮    
100%  #ECEBE6   234    5%   Near-white footer
```

#### Screenshot 3 (`image copy 2.png`) — The richest example

```text
y%    hex       L     sat   zone      technique
───   ────────  ───   ────  ────────  ──────────────────────
0%    #B1CEC9   197   14%   Light      Low sat, high lightness
⋮                                  teal
26%   #B5D2CC   201   14%             
                                     ← ΔL: −90, Δsat: +20%
28%   #4D7472   104   34%   Dark      SAME hue as top —
⋮                                  teal      2.4× more saturated,
64%   #506B64    98   25%             90 L-points darker
                                     ← hue shifts blue→olive
66%   #747B69   119   15%   Olive     Different hue angle,
⋮                                  green      warmer, desaturated
86%   #5F685F   100    9%             
                                     ← narrow accent band
88%   #795C54   100   31%   █ BRICK   Third accent — muted
                           █ RED      terracotta, brief
                                     ← 
90%   #487678   104   40%   Deep      Same teal hue, highest
⋮                                   teal      saturation of all
98%   #477577   103   40%             
```

#### Key findings

1. **Three-axis shifts between zones** — contralabs doesn't just change lightness. Each zone shifts **hue**, **lightness**, AND **saturation** simultaneously. Same-hue zones (light teal → dark teal) vary saturation 2-3× while dropping lightness 90 points.

2. **Three accent colors** (not two):
   | Accent | Role | Our Morandi equivalent |
   |--------|------|----------------------|
   | Electric Blue | Tech categories, CTA outlines | Dusty Indigo `#7B94B0` |
   | Neon Green | Verified, active, human validation | Mustard Yellow `#C4A04A` |
   | Brick Red | Structural punctuation, thin accent bands | Muted Terracotta (TBD) |

3. **Dark-first architecture** — Dark mode (`#0B0B0B`–`#121212`) is the primary canvas. Light mode (from screenshot 1: `#EEEDE9` base) is the alternative. Both have section color zones.

4. **Pure black for structural depth** — `#000000` used for cards and headers against the dark charcoal canvas, creating depth without borders.

5. **Section zones are stable within themselves** — within a zone, color barely varies (±3 L-points). Transitions happen in narrow bands (~5-10% of page height). Zones last for 20-40% of the page.

6. **Footer is the most saturated zone** — consistently the highest saturation (40-49%) and darkest (L=86-103), anchoring the page.

### 2.4 What to NOT Do

- No renaissance pastiche — Jida is not a creative agency
- No page-specific preloaders — overkill for a personal site, hurts performance
- No Framer — not the right tool (see framework section)

---

## 3. Framework Recommendation: **Astro** (Keep & Upgrade)

### 3.1 Why Stay with Astro

| Factor | Astro 5 | Next.js 15 | Nuxt 3 | Framer |
|--------|---------|------------|--------|--------|
| **Content collections (MDX)** | ✅ Native, type-safe | Manual + contentlayer | Manual | ❌ |
| **Static output** | ✅ Default | ISR/SSG | SSG | Blocked |
| **Image optimization** | ✅ Built-in (sharp) | ✅ next/image | ✅ | 🟡 Limited |
| **Zero JS by default** | ✅ Islands | ❌ Hydrate all | ❌ Hydrate all | ❌ |
| **Framework components** | React, Solid, Vue, Svelte | React only | Vue only | N/A |
| **PageSpeed potential** | 100 | 90-95 | 90-95 | 70-85 |
| **Photo gallery handling** | ✅ Collections + sharp | ✅ | ✅ | Manual |
| **Deploy anywhere** | ✅ Static HTML | 🟡 Node/Vercel | 🟡 Node | Framer only |

**Verdict**: Astro 5 is the correct choice. Content-heavy site (blog + photo gallery), needs static output, benefits from zero-JS default, and allows Solid.js islands where interactivity is needed (search, photo lightbox).

### 3.2 Proposed Stack

```text
Astro 5
├── MDX (blog posts, bio content)
├── Solid.js (interactive islands: search, photo lightbox, theme toggle)
├── Tailwind CSS v4 (utility styling)
├── GSAP / Motion One (scroll animations)
├── sharp (image optimization via Astro)
├── View Transitions API (page transitions, Astro-native)
└── Deploy: GitHub Pages (existing), Vercel (option)
```

### 3.3 Content Architecture

```
src/content/
├── blog/           # 16 existing posts, MDX
│   ├── golang/
│   ├── basics/
│   ├── DeFi/
│   ├── network/
│   └── solana/
├── photos/         # NEW: photo collection
│   ├── lr-export/  # 47 edited photos
│   └── originals/  # 95+ originals (subset displayed)
├── experience/     # NEW: structured work data
│   └── jobs.yaml   # or MDX per role
└── pages/          # NEW: standalone pages
    ├── about.md    # bio + photo
    └── ...
```

---

## 4. Visual Design System

### 4.1 Design Philosophy: "Code as Craft"

The site blends two worlds:
- **Developer**: precision, structure, monospace, dark terminals, clean logic
- **Photographer**: light, grain, cinema, patience, the decisive moment

The visual system should feel like a **gallery space designed by an engineer** — warm but exact, tactile but systematic.

### 4.2 Color Palette → **Morandi Warm + 3 Accents** (Direction A chosen)

Dark-first architecture (contralabs-style). All colors grey-mixed — desaturated, dusty, powdery. No pure white, no pure black, no saturated color.

**3 section band colors** — warm ⇄ cool alternating rhythm, anchor at bottom:

| Token | Dark mode | Light mode | Role |
|-------|-----------|------------|------|
| `--color-band-warm` | `#141311` | `#F2EFEA` | Primary canvas — warm brown-black / paper |
| `--color-band-cool` | `#141915` | `#DDE0D6` | Olive-sage — hue shifts green (cf. contralabs `#B0CFCB`) |
| `--color-band-anchor` | `#0E1719` | `#CDD5D0` | Deep pine footer — most saturated (cf. contralabs `#2A595C`) |

**Structural & text:**

| Token | Dark mode | Light mode | Role |
|-------|-----------|------------|------|
| `--color-card` | `#0E0D0B` | `#F5F2ED` | Structural black/white for cards, headers |
| `--color-text-primary` | `#F0EDE7` | `#141311` | Headings, body |
| `--color-text-secondary` | `#9C968D` | `#6B665E` | Descriptions, metadata |
| `--color-text-tertiary` | `#635F58` | `#9C9790` | Captions, dates |

**3 accents** (contralabs-style multi-accent model):

| Token | Dark mode | Light mode | Role | contralabs equivalent |
|-------|-----------|------------|------|----------------------|
| `--color-accent-yellow` | `#C4A04A` | `#B8952E` | CTAs, active nav, hero line, dots | Neon Green (human, warm) |
| `--color-accent-blue` | `#7B94B0` | `#5C7090` | Inline links, code keywords, ghost code | Electric Blue (tech, cool) |
| `--color-accent-terracotta` | `#A8644C` | `#B8755E` | Thin decorative rules between hue shifts | Brick Red (punctuation) |

Reference sample: `samples/direction-a-warm-paper.html`

### 4.2.1 Signature Element: Code as Hero Typography

> *"Spend your boldness in one place."*

The hero does not open with a name or tagline. It opens with **real Go code** — the GG18 ECDSA threshold signing implementation from [bnb-chain/tss-lib](https://github.com/bnb-chain/tss-lib), rendered large as typography. The code IS the statement: this person writes production MPC signing services. The visitor knows within 3 seconds what kind of developer this is.

- Source: `ecdsa/signing/round_1.go` — Binance's threshold signature library
- Rendered in JetBrains Mono with syntax highlighting (indigo keywords, mustard function names, muted strings)
- Appears below the hero text as a typographic block, not a code container
- Fades in last in the hero entrance sequence (600ms delay)
- The editor/IDE framing is deliberately absent — no window chrome, no line numbers, no dots. Just the code, treated as typography.

This is the aesthetic risk: **real code as display type**. It could feel cold, but against the warm Morandi canvas with mustard + indigo syntax highlighting, it reads as craft.

### 4.3 Typography → **Source Serif 4 + Inter + JetBrains Mono**

All three faces locked. No alternatives.

#### Display: **Source Serif 4** (serif, headings only)
- Google Fonts. Classic serif with authority — matches contralabs' choice.

- Weights: 400 (regular), 500 (medium), 600 (semibold), italic variants.
- Usage: H1-H3, hero statements, section headers, timeline roles.
- Used *only* at larger sizes — never below 1rem.

#### Body: **Inter** (sans-serif, body + UI)
- Google Fonts. Proven rendering at all sizes, excellent CJK pairing.

- Weights: 300, 400, 450, 500, 600.
- Usage: Body text, navigation, metadata, tags, buttons, captions.

#### Mono: **JetBrains Mono** (code, technical labels)
- Already bundled as TTF in the project.
- Usage: Code blocks, section eyebrows (monospace uppercase), dates, reading time, hero-code.

#### Type Scale

```
Hero:       clamp(2.5rem, 5vw, 5rem)     // Display serif
H1:         clamp(2rem, 4vw, 3.5rem)      // Display serif
H2:         clamp(1.5rem, 3vw, 2.25rem)   // Display serif
H3:         1.25rem                         // Sans-serif medium
Body:       1rem / 16px                    // Sans-serif, 1.6 line-height
Small:      0.875rem                       // Captions, metadata
Mono:       0.85rem                        // Code, technical labels
```

### 4.4 Layout Principles

1. **Generous negative space** — Sections breathe. 120px+ vertical rhythm between major sections.
2. **Single column for reading** — Blog posts max 680px wide, centered. No sidebars in reading mode.
3. **Asymmetric grids for galleries** — Photos in a masonry or varied-column layout. Not uniform squares.
4. **Staggered reveal on scroll** — Content sections fade up with 100-200ms stagger between children.
5. **Horizontal rules as section dividers** — 1px hairline, no decorative separators.

### 4.5 Layout ASCII Wireframes

#### Homepage

```
┌──────────────────────────────────────────────┐
│  [nav]  JIDA LI    Blog  Photos  About  [○]  │  ← fixed, minimal
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│           Jida Li                             │  ← hero: large display serif
│           Developer & Photographer           │  ← subtitle sans-serif
│           ───────                            │  ← 1px hairline, 40px wide
│           Build a Better Decentralized       │
│           World.                             │
│                                              │
│                    ↓                         │  ← subtle scroll indicator
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│   ┌─────────────────┐  ┌─────────────────┐  │
│   │   LATEST POST   │  │  FEATURED PHOTO │  │
│   │                 │  │                 │  │
│   │  Concurrency    │  │   [photo]       │  │  ← bento-style cards
│   │  in Go: sync    │  │                 │  │
│   │                 │  │                 │  │
│   │  Read →         │  │  Gallery →      │  │
│   └─────────────────┘  └─────────────────┘  │
│                                              │
├──────────────────────────────────────────────┤
│  [footer: links, copyright, minimal]         │
└──────────────────────────────────────────────┘
```

#### Photo Gallery Page

```
┌──────────────────────────────────────────────┐
│  Photos / 摄影                                │  ← section header, serif
│  A selection of moments captured on          │
│  Nikon Z 6_2.                                │
├──────────────────────────────────────────────┤
│  ┌─────┐ ┌───┐ ┌──────┐ ┌───┐ ┌─────┐      │
│  │     │ │   │ │      │ │   │ │     │      │
│  │  A  │ │ B │ │  C   │ │ D │ │  E  │      │  ← masonry layout
│  │     │ │   │ │      │ │   │ │     │      │     varied aspect ratios
│  └─────┘ └───┘ └──────┘ └───┘ └─────┘      │
│  ┌──────┐ ┌───┐ ┌─────┐ ┌──────┐ ┌───┐     │
│  │      │ │   │ │     │ │      │ │   │     │
│  │  F   │ │ G │ │  H  │ │  I   │ │ J │     │
│  │      │ │   │ │     │ │      │ │   │     │
│  └──────┘ └───┘ └─────┘ └──────┘ └───┘     │
│                                              │
│  [click → lightbox with full-res image]      │
└──────────────────────────────────────────────┘
```

#### Blog Post (Reading View)

```
┌──────────────────────────────────────────────┐
│                                              │
│           2025 · Go · Concurrency            │  ← eyebrow (category/date)
│                                              │
│     Concurrency in Go (1): sync              │  ← H1, serif display
│                                              │
│     Jida Li  ·  8 min read                   │  ← metadata
│                                              │
│     ────────────────────────────             │  ← hairline, 680px
│                                              │
│     Content starts here. Body text at        │
│     16px, 1.6 line-height, max-width         │  ← reading column, 680px
│     680px. Comfortable measure.              │
│                                              │
│     ```go                                    │
│     func main() {                            │  ← code blocks in Slate bg
│         fmt.Println("hello")                 │     JetBrains Mono
│     }                                        │
│     ```                                      │
│                                              │
│     ────────────────────────────             │
│                                              │
│     ← Prev post    Next post →               │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 5. Animation Strategy

### 5.1 Philosophy

One orchestrated moment per section, not dozens of scattered micro-interactions. Motion should feel inevitable, not decorative. Contra Labs uses animation to *tell a story* — each transition has narrative purpose.

### 5.2 Specific Animation Plan

| Element | Technique | Library | Timing |
|---------|-----------|---------|--------|
| **Page transitions** | Astro View Transitions API — crossfade between pages | Native | 300ms |
| **Hero entrance** | Text fade-up + subtle letter-spacing animation on the serif display name | Motion One | 600ms, ease-out |
| **Section reveals** | Staggered fade-up on scroll, 100ms stagger per child | Motion One + IntersectionObserver | 400ms per item |
| **Photo grid** | Images fade in with slight scale (0.97→1) on scroll into view | Motion One | 500ms, ease-out |
| **Photo hover** | Subtle scale (1→1.02) + very faint overlay | CSS transition | 200ms |
| **Photo lightbox** | Expand from grid position → full viewport, backdrop blur | Solid.js + Motion | 350ms, spring |
| **Blog card hover** | Border-color shift + subtle lift (translateY -2px) | CSS | 150ms |
| **Dark mode toggle** | View Transition API — seamless morph between themes | Native + CSS | 400ms |
| **Scroll indicator** | Subtle pulsing chevron, fades out after first scroll | CSS keyframe | 2s loop, fades on scroll |

### 5.3 What We Deliberately Avoid

- No cursor followers / custom cursors
- No parallax (heavy, often janky on mobile)
- No page preloaders (hurts performance, feels 2024)
- No text scramble/glitch effects (clashes with 高级感)
- No 3D/WebGL (heavy, not Jida's brand)
- Animation respects `prefers-reduced-motion`

### 5.4 Library Choice: **Motion One** (5KB)

- Tiny (5KB vs GSAP's 30KB+)
- Native Web Animations API under the hood
- Scroll-triggered animations (`scroll()`)
- Spring physics for lightbox
- Tree-shakeable
- Enough for our needs, not overkill

---

## 6. Photo Gallery Architecture

### 6.1 Photo Inventory

| Source | Count | Format | Typical Size | Notes |
|--------|-------|--------|-------------|-------|
| `lr_export/` | 47 | JPEG | ~700KB, 240dpi | Edited, Lightroom exports |
| `photos/` | 95 | JPEG (original) | ~2MB | Camera originals |

- Camera: Nikon Z 6_2
- Mix of aspect ratios: some panoramas (4906×2088), standard 3:2, portraits
- All benefit from optimization for web

### 6.2 Image Pipeline

```
Source photos (2-7MB JPEG)
    ↓
Astro asset optimization (sharp)
    ↓
├── Thumbnail: 400px wide, WebP, quality 75  (~15KB)
├── Gallery: 1200px wide, WebP, quality 82     (~80KB)
└── Full: 2400px wide, WebP, quality 85        (~200KB)
    ↓
<picture> with fallback JPEG
    ↓
lazy loading (loading="lazy")
    ↓
Lightbox loads full-res on click
```

### 6.3 Gallery Layout → Bento Grid

- **6×3 bento grid** on homepage (full viewport: `100vw`, max 1400×700px). See §6.5 for preset system.
- **4 preset shapes** only: 1×1, 2×1, 1×2, 2×2. No free-form spans.
- **~50% photo coverage, ~50% 留白** across 18 cells. Empty cells show `--color-band-warm`.
- **Gallery background**: `--color-band-warm` (`#EBEAE4`-range warm paper).
- **Full gallery page** (`/photos`): masonry layout with all curated photos, native aspect ratios, lightbox on click.
- Each photo shows caption on hover (gradient overlay from bottom).
- Bottom-right cell reserved for "View full gallery" CTA card (`#7F9A96` slate green bg + `#EFEFEA` light button).
- Staggered scroll reveal on the full gallery page.

### 6.4 Lightbox (Solid.js Island)

- Only interactive component needing JS
- Click photo → expand to viewport-fit with backdrop blur
- Left/right arrow navigation
- Close on click-outside, Escape, or X button
- Respects EXIF orientation

### 6.5 Bento Grid Preset System

The bento gallery uses a **6×3 grid** (18 cells). Photos are placed using a limited set of preset shapes and positions — not free-form arbitrary spans. Each photo in the content collection references a preset by key.

**Allowed shapes (span presets):**

| Key | grid-column | grid-row | Cells | Use case |
|-----|-------------|----------|-------|----------|
| `1x1` | span 1 | span 1 | 1 | Standard photo |
| `2x1` | span 2 | span 1 | 2 | Landscape, panorama |
| `1x2` | span 1 | span 2 | 2 | Tall portrait |
| `2x2` | span 2 | span 2 | 4 | Hero/featured photo |

**Grid coordinates** (6 columns × 3 rows, 1-indexed):

```
col: 1  2  3  4  5  6
row 1: [ ][ ][ ][ ][ ][ ]
row 2: [ ][ ][ ][ ][ ][ ]
row 3: [ ][ ][ ][ ][ ][ ]
```

A photo's position is defined by its top-left cell `(col, row)` + its shape preset. The layout is configured in the photo collection frontmatter:

```yaml
# src/content/photos/portrait-series.md
---
title: "Portrait Series"
image: "PS524083.jpg"
bento:
  shape: "2x1"       # from preset list
  col: 1             # top-left column (1-6)
  row: 1             # top-left row (1-3)
group: portrait
featured: true
---
```

**Constraints:**
- Only 4 shapes allowed — no custom `grid-column: 3/6` or arbitrary spans
- Column + shape width must not exceed column 6 (e.g. `col: 5` + `2x1` = cols 5-6, valid. `col: 5` + `2x2` would overflow, invalid)
- Row + shape height must not exceed row 3
- Photos must not overlap — validation at build time via Astro content schema or a simple checker
- Target: ~50% photo coverage, ~50% 留白 across the 18 cells
- The bottom-right cell(s) are reserved for the "View full gallery" CTA card
- Gallery background: `--color-band-warm`

This preset system keeps the gallery editable without touching CSS — Jida just sets `shape`, `col`, and `row` in each photo's frontmatter.

### 6.6 Photo Curation Strategy

47 edited photos + 95 originals = ~142 total. Not all are portfolio-worthy.

1. **Select 30-40 best photos** for the main gallery
2. **Group by theme**: Landscape, Street, Portrait, Night
3. **Store as data collection** in `src/content/photos/` with frontmatter:
   ```yaml
   ---
   title: "Huangpu Sunset"
   date: 2025-11-15
   location: "Shanghai, China"
   camera: "Nikon Z 6_2"
   lens: "24-70mm f/4"
   group: landscape
   featured: true
   ---
   ```
4. Actual image files stay in `public/images/photos/` or are imported via Astro assets

---

## 7. Page Structure

### 7.1 Site Map

```
/                   Home (hero + latest blog + featured photo)
/blog               Blog listing (paginated)
/blog/[slug]        Blog post (reading view)
/photos             Photo gallery (masonry)
/about              About page (bio + experience timeline + skills + resume PDF)
/search             Full-text search (keep existing Solid.js search)
/rss.xml            RSS feed
/CV_Jida_Li.pdf     Downloadable resume
```

### 7.2 Navigation

- Fixed top bar, clean and minimal
- Logo: "Jida Li" in serif or a simple monogram
- Links: Blog · Photos · About
- Theme toggle (sun/moon)
- No hamburger on desktop, hamburger on mobile

### 7.3 Homepage Content

1. **Hero**: Name + tagline + subtle animation
2. **Bio snippet**: 2-3 sentences about who Jida is
3. **Latest blog post**: Featured card with title, date, description
4. **Featured photo**: Single hero photo, link to gallery
5. **Footer**: Social links, copyright

### 7.4 Blog Page

- List view (not cards) with title, date, category, reading time
- Clean type hierarchy
- Pagination (existing pattern)
- Category filter tags at top

### 7.5 About Page (integrated — bio + experience + skills)

- Bio photo (portrait from photos collection)
- Bio text (can write in MDX)
- **Experience timeline** — integrated as a section within /about, not a separate route
- Vertical timeline with subtle scroll animation
- Each role: company, title, dates, key achievements
- Data-driven from `src/content/experience/` YAML/MDX collection
- Animate the timeline line drawing on scroll
- Skills (compact, not list-heavy)
- Social links
- **Resume PDF** — downloadable from /about and linked as `/CV_Jida_Li.pdf`

### 7.6 ~~Experience Page~~ → Integrated into /about

Decision: No separate `/experience` route. A unified `/about` page feels more personal and cohesive for a 文艺 site. Having both bio and professional history on one page tells a complete story.

---

## 8. Component Architecture

### 8.1 Reusable Components

```
src/components/
├── ui/
│   ├── Button.astro
│   ├── Divider.astro           # 1px hairline
│   ├── Eyebrow.astro           # Small label above headings
│   └── SectionHeading.astro    # H2 with consistent styling
├── layout/
│   ├── Header.astro            # Fixed nav
│   ├── Footer.astro            # Minimal footer
│   ├── PageLayout.astro        # Base layout wrapper
│   └── ReadingLayout.astro     # Narrow column for blog posts
├── blog/
│   ├── BlogCard.astro          # Blog listing item
│   ├── BlogList.astro          # Blog list container
│   └── CodeBlock.astro         # (handled by Expressive Code, keep existing)
├── photo/
│   ├── PhotoGrid.astro         # Masonry grid
│   ├── PhotoCard.astro         # Single photo in grid
│   ├── PhotoLightbox.tsx       # Solid.js lightbox island
│   └── PhotoMetadata.astro     # EXIF/caption display
├── home/
│   ├── Hero.astro              # Hero section with animation
│   ├── LatestPost.astro        # Featured blog card
│   └── FeaturedPhoto.astro     # Featured photo card
├── about/
│   ├── Bio.astro               # Bio section
│   ├── ExperienceTimeline.astro # Work experience timeline
│   └── Skills.astro            # Skills display
├── search/
│   └── Search.tsx              # Solid.js search (keep + restyle)
└── shared/
    ├── ThemeToggle.astro       # Dark/light toggle
    ├── ScrollReveal.astro      # Reusable scroll-reveal wrapper
    ├── ViewTransition.astro    # Page transition wrapper
    └── SocialLinks.astro       # GitHub, LinkedIn, Twitter, etc.
```

### 8.2 Island Architecture (Solid.js for Interactive Bits)

Only 3 components need client-side JS:

1. **Search** (`client:load`) — full-text search, immediate
2. **PhotoLightbox** (`client:idle`) — lightbox, low priority
3. **ThemeToggle** (`client:load` or inline script) — instant, no flicker

Everything else: `.astro` components → static HTML, zero JS.

---

## 9. Migration Plan

### Phase 1: Foundation (1-2 sessions)
- Upgrade Astro 4 → 5
- Set up new design tokens (colors, typography, spacing)
- Build new `PageLayout`, `Header`, `Footer`
- Implement dark/light theme

### Phase 2: Core Pages (2-3 sessions)
- Rewrite homepage with new hero + featured sections
- Rewrite blog listing + blog post layouts
- Migrate existing 16 blog posts (frontmatter update only)

### Phase 3: New Features (2-3 sessions)
- Build photo gallery collection + masonry grid
- Build photo lightbox (Solid.js)
- Build `/about` page with bio + experience timeline

### Phase 4: Polish (1-2 sessions)
- Scroll animations (Motion One)
- View Transitions between pages
- Responsive QA
- Performance audit
- Accessibility check

### Migration Notes
- **Keep**: All blog post `.md` files, `remarkPlugin/`, `utils/`, `astro.config.mjs` (updated)
- **Rewrite**: All components, layouts, styles, pages
- **Remove**: `tailwind.config.js` → migrate to Tailwind v4 CSS-first config
- **Remove**: Donate, friends, Waline/Giscus comment components (not used)
- **Keep but restyle**: Search, Expressive Code, TOC functionality

---

## 10. Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 95 |
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 1.5s |
| Total JS (homepage) | < 15KB (only theme toggle inline) |
| Total JS (gallery) | < 25KB (lightbox island) |
| Total JS (search) | < 30KB (Solid.js + search logic) |
| Image optimization | All photos WebP, responsive sizes |
| Accessibility | WCAG AA, reduced-motion support |

---

## 11. Decisions Log

| # | Question | Decision |
|---|----------|----------|
| 1 | Photo curation | ✅ 35 photos selected and copied to `public/images/photos/`. Review and adjust. |
| 2 | Color palette | ✅ Morandi Warm (Direction A) chosen. 3 bands + 3 accents. Dark-first. |
| 3 | Experience page | ✅ Integrated into `/about` as a section. No separate route. |
| 4 | i18n | ✅ English only for now. Leave architecture open for Chinese later (keep i18n key pattern). |
| 5 | Resume download | ✅ Downloadable from /about, linked as `/CV_Jida_Li.pdf`. |
| 6 | Blog tags/categories | ✅ All 16 posts updated. Consistent lowercase tags, 4 top-level categories. |
| 7 | Dark-first or light-first | ✅ System-default with manual toggle. Light `#F8F7F4`, dark `#141311`. |
| 8 | First direction to build | ✅ **Direction A: Morandi Warm** (暖调). Dusty mustard `#C4A04A`. |
| 9 | Signature element | ✅ **Real code as hero typography.** GG18 ECDSA TSS from bnb-chain/tss-lib rendered as display type. Code IS the statement — developer identity proven before any bio text. |

---

## Appendix: Quick Reference

### Contra Labs Animation Keywords (for inspiration search)
- "digital renaissance" + "framer"
- "preloader hero transition"
- "scroll-based animation framer"
- "dithered texture web design"
- "custom code interactions" + "framer"

### Design References to Study
- leerob.io — developer minimalism done right
- stefanvitasovic.com — Swiss-print-inspired, sophisticated
- sebsaaaa.com — Next.js + Framer Motion, restrained motion
- Several Awwwards portfolios in "minimal" category
- Photo-centric sites: magnumphotos.com, lensculture.com

### Technical References
- Astro View Transitions: https://docs.astro.build/en/guides/view-transitions/
- Motion One: https://motion.dev/
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Astro Image Optimization: https://docs.astro.build/en/guides/images/
