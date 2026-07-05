# Website Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite jidalii.github.io as a personal brand site — developer + photographer — with a Morandi Warm color system, dark-first theme, real code as hero typography, bento photo gallery, and integrated about/experience page.

**Architecture:** Astro 5 static site. Replace all components, layouts, and styles with the new design system from `samples/direction-a-warm-paper.html`. Keep blog content, remark plugins, and utility functions. Delete unused components (Donate, Comment, Friends, Feed, Archive). CSS custom properties for design tokens; Tailwind v4 for component-level utilities (spacing, grid, typography).

**Tech Stack:** Astro 5, Solid.js (lightbox + search islands), Tailwind CSS v4, sharp (image optimization), View Transitions API.

## Global Constraints

- Dark-first: `:root` = dark mode tokens, light via `@media (prefers-color-scheme: light)` + `[data-theme]` manual override
- 3 section band colors: warm (`#141311`), cool (`#141915`), anchor (`#0E1719`) — dark mode defaults
- 3 accents: yellow (`#C4A04A`), indigo (`#7B94B0`), terracotta (`#A8644C`)
- Typography: Source Serif 4 (display), Inter (body), JetBrains Mono (code) — Google Fonts
- Hero signature: real Go code from Presto Labs `keygen.go` rendered as decorative typography at 0.48rem/45% opacity
- Bento gallery: 6×3 grid, 4 preset shapes (1×1, 2×1, 1×2, 2×2), ~50% photo coverage
- Noise grain overlay (SVG feTurbulence, 3.5-5% opacity)
- Scroll reveals via IntersectionObserver + CSS transitions
- Alt photo paths: `../public/images/photos/` in sample → `src/content/photos/` in production
- Tailwind CSS v4 for component utilities (spacing, grid, typography); custom properties for design tokens; `@utility` for section bands/accents
- Zero JS by default; only 3 islands: Search, PhotoLightbox, ThemeToggle (inline script)
- Lighthouse ≥ 95, FCP < 1.0s, LCP < 1.5s
- English only, i18n key pattern preserved for future Chinese

---

## Subsystem 1: Design System & Layout Foundation

### Task 1.1: Upgrade Tailwind to v4, set up design tokens

**Files:**
- Modify: `src/styles/index.css` (Tailwind v4 CSS-first setup)
- Modify: `tailwind.config.js` → remove (v4 uses CSS)
- Modify: `astro.config.mjs` (update @astrojs/tailwind to v5)
- Modify: `package.json` (update tailwindcss to v4)

**Interfaces:**
- Produces: CSS custom properties for colors/typography + Tailwind v4 `@theme` referencing them. Consumed by every component.

- [ ] **Step 1: Update dependencies**

```bash
pnpm add tailwindcss@^4 @astrojs/tailwind@^5
pnpm remove tailwindcss@^3
```

- [ ] **Step 2: Replace src/styles/index.css — Tailwind v4 CSS-first config with design tokens**

```css
/* src/styles/index.css */
@import 'tailwindcss';
@import url('./github-markdown.css');
@import url('./remark-aside.css');

/* ═══ FONTS ═══ */
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400;1,8..60,500&family=Inter:wght@300;400;450;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@font-face {
  font-family: "jetbrains-mono";
  src: url('./JetBrainsMono-Regular.ttf');
}

/* ═══ DESIGN TOKENS — dark-first ═══ */
:root {
  --color-band-warm:   #141311;
  --color-band-cool:   #141915;
  --color-band-anchor: #0E1719;
  --color-bg:          var(--color-band-warm);
  --color-card:        #0E0D0B;
  --color-border:      #262420;
  --color-text-primary:   #F0EDE7;
  --color-text-secondary: #9C968D;
  --color-text-tertiary:  #635F58;
  --color-text-inverse:   #141311;
  --color-accent-yellow:     #C4A04A;
  --color-accent-yellow-hov: #D4B45A;
  --color-accent-blue:       #7B94B0;
  --color-accent-blue-hov:   #8FA8C0;
  --color-accent-terracotta: #A8644C;
  --font-display: 'Source Serif 4', Georgia, serif;
  --font-body:    'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:    'JetBrains Mono', 'SF Mono', monospace;
  --max-reading:  680px;
  --max-content:  1080px;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Tailwind v4 theme — reference our tokens */
@theme {
  --color-*: initial; /* reset default Tailwind colors */
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --font-mono: var(--font-mono);
}

/* Light mode */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --color-band-warm:   #F2EFEA;
    --color-band-cool:   #DDE0D6;
    --color-band-anchor: #CDD5D0;
    --color-bg:          var(--color-band-warm);
    --color-card:        #F5F2ED;
    --color-border:      #DDD9D1;
    --color-text-primary:   #141311;
    --color-text-secondary: #6B665E;
    --color-text-tertiary:  #9C9790;
    --color-text-inverse:   #F8F7F4;
    --color-accent-yellow:     #B8952E;
    --color-accent-yellow-hov: #9C7D22;
    --color-accent-blue:       #5C7090;
    --color-accent-blue-hov:   #4A5E7A;
    --color-accent-terracotta: #B8755E;
  }
}
[data-theme="dark"] {
  --color-band-warm:   #141311; --color-band-cool: #141915;
  --color-band-anchor: #0E1719; --color-bg: var(--color-band-warm);
  --color-card: #0E0D0B; --color-border: #262420;
  --color-text-primary: #F0EDE7; --color-text-secondary: #9C968D;
  --color-text-tertiary: #635F58; --color-text-inverse: #141311;
  --color-accent-yellow: #C4A04A; --color-accent-yellow-hov: #D4B45A;
  --color-accent-blue: #7B94B0; --color-accent-blue-hov: #8FA8C0;
  --color-accent-terracotta: #A8644C;
}
[data-theme="light"] {
  --color-band-warm:   #F2EFEA; --color-band-cool: #DDE0D6;
  --color-band-anchor: #CDD5D0; --color-bg: var(--color-band-warm);
  --color-card: #F5F2ED; --color-border: #DDD9D1;
  --color-text-primary: #141311; --color-text-secondary: #6B665E;
  --color-text-tertiary: #9C9790; --color-text-inverse: #F8F7F4;
  --color-accent-yellow: #B8952E; --color-accent-yellow-hov: #9C7D22;
  --color-accent-blue: #5C7090; --color-accent-blue-hov: #4A5E7A;
  --color-accent-terracotta: #B8755E;
}

/* ═══ GLOBAL RESETS ═══ */
body{
  font-family:var(--font-body);
  background:var(--color-bg);
  color:var(--color-text-primary);
  line-height:1.6;
  transition:background .4s,color .4s;
}

/* Noise grain */
body::after{
  content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;
  opacity:.04;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat:repeat;background-size:256px 256px;
}
@media(prefers-color-scheme:dark){body::after{opacity:.05}}
[data-theme="dark"] body::after{opacity:.05}
[data-theme="light"] body::after{opacity:.035}
```

- [ ] **Step 3: Remove tailwind.config.js and update astro.config.mjs**

```bash
rm tailwind.config.js
```

In `astro.config.mjs`, update the tailwind integration: `tailwind()` (v5 auto-detects).

- [ ] **Step 4: Verify Tailwind v4 works**

Run: `pnpm dev`
Check: Tailwind compiles, design tokens visible in DevTools, dark/light toggle works

- [ ] **Step 5: Commit**

```bash
git add src/styles/index.css astro.config.mjs package.json pnpm-lock.yaml
git rm tailwind.config.js
git commit -m "feat: upgrade to Tailwind v4 with Morandi Warm design tokens"
```

### Task 1.2: Create section band system (Tailwind utility layer)

**Files:**
- Create: `src/styles/bands.css`
- Modify: `src/styles/index.css` (add `@import url('./bands.css');` after Tailwind import)

**Interfaces:**
- Produces: `.section-band`, `.band-warm`, `.band-cool`, `.band-anchor` utility classes with gradient transitions

- [ ] **Step 1: Write bands.css as Tailwind-compatible utilities**

```css
/* src/styles/bands.css — 3-zone Morandi section bands. Imported after Tailwind. */

@utility section-band {
  position: relative;
  padding: 80px 0;
}
.section-band::before{
  content:'';position:absolute;top:0;left:0;right:0;
  height:100px;pointer-events:none;
}
.band-warm{background:var(--color-band-warm)}
.band-cool{background:var(--color-band-cool)}
.band-anchor{background:var(--color-band-anchor)}
.band-warm::before{background:linear-gradient(to bottom,var(--color-band-anchor),var(--color-band-warm))}
.band-cool::before{background:linear-gradient(to bottom,var(--color-band-warm),var(--color-band-cool))}
.band-anchor::before{background:linear-gradient(to bottom,var(--color-band-cool),var(--color-band-anchor))}

@utility section {
  max-width: var(--max-content);
  margin-left: auto; margin-right: auto;
  padding-left: 28px; padding-right: 28px;
}
@utility section-label {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 500;
  color: var(--color-accent-yellow); letter-spacing: 0.14em;
  text-transform: uppercase; margin-bottom: 36px;
}
@utility section-heading {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 500; margin-bottom: 44px;
  color: var(--color-text-primary);
}
@utility accent-rule {
  width: 40px; height: 2px;
  background: var(--color-accent-terracotta);
  margin: 0 0 48px 0; border-radius: 1px; opacity: 0.7;
}
```

- [ ] **Step 2: Import bands.css in index.css**

Add `@import url('./bands.css');` after the Tailwind `@import 'tailwindcss';` line in `src/styles/index.css`

- [ ] **Step 3: Commit**

```bash
git add src/styles/bands.css src/styles/index.css
git commit -m "feat: add section band system with gradient transitions"
```

### Task 1.3: Create header, footer, and base layout

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/layouts/BaseLayout.astro`
- Delete: `src/layouts/MainLayout.astro`, `src/layouts/IndexPage.astro`, `src/layouts/BlogPost.astro`
- Delete: `src/components/HeaderLink.astro`, `src/components/ThemeIcon.astro`, `src/components/MenuIcon.astro`, `src/components/SidebarIcon.astro`, `src/components/Profile.astro`, `src/components/BlogAside.astro`

**Interfaces:**
- Produces: `<BaseLayout>` wrapper (nav + slot + footer), consumed by all pages
- Header: fixed nav with Blog · Photos · About links + theme toggle button
- Footer: copyright + GitHub/LinkedIn/Twitter/Résumé links

- [ ] **Step 1: Create Header.astro**

```astro
---
// src/components/Header.astro
---
<header>
  <nav>
    <div class="nav-inner">
      <a href="/" class="nav-logo">Jida Li</a>
      <ul class="nav-links">
        <li><a href="/blog/1">Blog</a></li>
        <li><a href="/photos">Photos</a></li>
        <li><a href="/about">About</a></li>
        <li><button id="theme-toggle" aria-label="Toggle theme" title="System → Light → Dark">◐</button></li>
      </ul>
    </div>
  </nav>
</header>

<style>
  nav{
    position:fixed;top:0;left:0;right:0;z-index:100;
    background:color-mix(in srgb,var(--color-bg) 90%,transparent);
    backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  }
  .nav-inner{
    max-width:var(--max-content);margin:0 auto;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 28px;height:60px;
  }
  .nav-logo{
    font-family:var(--font-display);font-size:1.25rem;font-weight:500;
    color:var(--color-text-primary);text-decoration:none;letter-spacing:.02em;
  }
  .nav-links{display:flex;gap:36px;align-items:center;list-style:none}
  .nav-links a{
    color:var(--color-text-secondary);text-decoration:none;
    font-size:.82rem;font-weight:450;letter-spacing:.02em;transition:color .2s;
  }
  .nav-links a:hover{color:var(--color-text-primary)}
  #theme-toggle{
    background:none;border:1px solid var(--color-border);border-radius:20px;
    width:34px;height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:.9rem;color:var(--color-text-secondary);transition:all .2s;line-height:1;
  }
  #theme-toggle:hover{border-color:var(--color-accent-yellow);color:var(--color-accent-yellow)}
  @media(max-width:768px){.nav-links{gap:20px}.nav-links a{font-size:.76rem}}
</style>

<script>
  var K='theme-pref';
  function get(){return localStorage.getItem(K)}
  document.getElementById('theme-toggle').onclick=function(){
    var cur=get(),next;
    if(!cur||cur==='system')next='light';
    else if(cur==='light')next='dark';
    else next='system';
    if(next==='system'){document.documentElement.removeAttribute('data-theme');localStorage.removeItem(K)}
    else{document.documentElement.setAttribute('data-theme',next);localStorage.setItem(K,next)}
  };
  (function(){var s=get();if(s&&s!=='system')document.documentElement.setAttribute('data-theme',s)})();
</script>
```

- [ ] **Step 2: Create Footer.astro**

```astro
---
// src/components/Footer.astro
---
<footer>
  <span class="footer-text">&copy; 2026 Jida Li</span>
  <ul class="footer-links">
    <li><a href="https://github.com/jidalii" target="_blank" rel="noopener">GitHub</a></li>
    <li><a href="https://linkedin.com/in/jida-li" target="_blank" rel="noopener">LinkedIn</a></li>
    <li><a href="https://x.com/0xcocacolaL" target="_blank" rel="noopener">Twitter</a></li>
    <li><a href="/CV_Jida_Li.pdf">Résumé</a></li>
  </ul>
</footer>

<style>
  footer{
    display:flex;justify-content:space-between;align-items:center;padding:0;
  }
  .footer-text{font-size:.78rem;color:var(--color-text-tertiary)}
  .footer-links{display:flex;gap:24px;list-style:none}
  .footer-links a{font-size:.78rem;color:var(--color-text-tertiary);transition:color .2s}
  .footer-links a:hover{color:var(--color-text-primary)}
  @media(max-width:768px){footer{flex-direction:column;gap:16px;text-align:center}}
</style>
```

- [ ] **Step 3: Create BaseLayout.astro**

```astro
---
// src/layouts/BaseLayout.astro
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/index.css';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>Jida Li — Developer &amp; Photographer</title>
    <script is:inline src="/toggle-theme.js"></script>
    <slot name="head" />
  </head>
  <body>
    <Header />
    <main>
      <slot />
    </main>
    <div class="section-band band-anchor" style="padding:48px 0">
      <div class="section">
        <Footer />
      </div>
    </div>
  </body>
</html>
```

- [ ] **Step 4: Verify layout loads**

Run: `pnpm dev`
Check: navigation visible, theme toggle cycles dark/light/system, footer renders at bottom

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/layouts/BaseLayout.astro
git rm src/layouts/MainLayout.astro src/layouts/IndexPage.astro src/layouts/BlogPost.astro
git rm src/components/HeaderLink.astro src/components/ThemeIcon.astro src/components/MenuIcon.astro src/components/SidebarIcon.astro src/components/Profile.astro src/components/BlogAside.astro
git commit -m "feat: add header, footer, BaseLayout; remove old layout components"
```

### Task 1.4: Migrate BaseHead to new design

**Files:**
- Modify: `src/components/BaseHead.astro`
- Modify: `src/consts.ts` (keep only site.title, site.description, site.favicon, site.url; add author name)

**Interfaces:**
- Consumes: `site` from consts.ts
- Produces: `<head>` content consumed by BaseLayout via `<slot name="head">`

- [ ] **Step 1: Simplify consts.ts to only needed fields**

```ts
// src/consts.ts
export const site = {
  title: "Jida Li",
  description: "Developer & Photographer — Building a Better Decentralized World.",
  favicon: '/favicon.svg',
  url: 'https://jidalii.github.io',
  author: "Jida Li",
  recentBlogSize: 5,
  postPageSize: 10,
}

export const infoLinks = [
  { icon: 'ri-github-fill',  name: 'github',    outlink: 'https://github.com/jidalii' },
  { icon: 'ri-linkedin-fill', name: 'linkedin', outlink: 'https://www.linkedin.com/in/jida-li/' },
  { icon: 'ri-twitter-fill', name: 'twitter',   outlink: 'https://x.com/0xcocacolaL' },
  { icon: 'ri-instagram-fill',name: 'instagram', outlink: 'https://www.instagram.com/jida_leeeee/' },
]

// Remove: config, categories, donate, comment, friendshipLinks — no longer used
```

- [ ] **Step 2: Simplify BaseHead.astro — remove comment system and donate references**

```astro
---
// src/components/BaseHead.astro
import { site } from "../consts";
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/svg+xml" href={site.favicon} />
<link rel="canonical" href={canonicalURL} />
<meta name="description" content={site.description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={site.title} />
<meta property="og:description" content={site.description} />
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content={site.title} />
<meta property="twitter:description" content={site.description} />
<title>{site.title}</title>
```

- [ ] **Step 3: Commit**

```bash
git add src/consts.ts src/components/BaseHead.astro
git commit -m "refactor: simplify consts and BaseHead for new design"
```

### Task 1.5: Add scroll reveal utility and responsive cleanup

**Files:**
- Create: `src/styles/reveal.css`
- Create: `src/styles/responsive.css`
- Modify: `src/styles/index.css` (add imports)

**Interfaces:**
- Produces: `.reveal` / `.reveal-stagger` classes for scroll animations; responsive overrides

- [ ] **Step 1: Write reveal.css**

```css
/* src/styles/reveal.css */
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s var(--ease-out-expo),transform .7s var(--ease-out-expo)}
.reveal.visible{opacity:1;transform:translateY(0)}
.reveal-stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s var(--ease-out-expo),transform .6s var(--ease-out-expo)}
.reveal-stagger.visible>:nth-child(1){transition-delay:0s;opacity:1;transform:translateY(0)}
.reveal-stagger.visible>:nth-child(2){transition-delay:.1s;opacity:1;transform:translateY(0)}
.reveal-stagger.visible>:nth-child(3){transition-delay:.2s;opacity:1;transform:translateY(0)}
```

- [ ] **Step 2: Write reveal.js inline script for BaseLayout**

Add to Bottom of BaseLayout.astro `<body>`:

```html
<script>
  var obs=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting)e.target.classList.add('visible')
  })},{threshold:.15,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal,.reveal-stagger').forEach(function(el){obs.observe(el)});
</script>
```

- [ ] **Step 3: Import in index.css**

Add `@import url('./reveal.css');` and `@import url('./responsive.css');` after bands import.

- [ ] **Step 4: Commit**

```bash
git add src/styles/reveal.css src/styles/responsive.css src/styles/index.css src/layouts/BaseLayout.astro
git commit -m "feat: add scroll reveals, responsive utilities"
```

---

## Subsystem 2: Homepage

### Task 2.1: Create hero section with code signature

**Files:**
- Create: `src/components/Hero.astro`

**Interfaces:**
- Produces: `<Hero>` — 2-col grid: text left, decorative Go code right. Consumed by `pages/index.astro`.

- [ ] **Step 1: Create Hero.astro**

```astro
---
// src/components/Hero.astro
---
<div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-15 items-start pt-44 md:pt-48 pb-24 md:pb-28 px-5 md:px-7" style="max-width:var(--max-content);margin:0 auto">
  <div class="min-w-0">
    <p class="hero-eyebrow mb-7">Developer &amp; Photographer</p>
    <h1 class="font-display text-primary">Building a <em class="italic font-normal">better</em><br>decentralized world.</h1>
    <p class="text-secondary text-lg mt-7 max-w-[540px]" style="line-height:1.7">
      Backend engineer by trade, photographer by instinct. I write about distributed systems,
      blockchain infrastructure, and the craft of writing code that moves money safely.
    </p>
    <div class="hero-accent-line mt-10"></div>
  </div>
  <div class="hero-code">
for {
    select {
    case msg := &lt;-c.P.OutCh:
        ...
    case msg := &lt;-c.P.EndCh:
        secretShare := msg.LocalSecrets
        ...
        partySecretJson := PartySecretJson{
            PubkeyX: msg.EDDSAPub.X().Text(16),
            PubkeyY: msg.EDDSAPub.Y().Text(16),
            Curve:   curveStr(c.Curve),
        }
        ...
        newWallet := &amp;MPCNewWalletMsg{
            CurveType:       pb.CurveType_ED25519,
            PartySecret:     secretShare.Xi.Text(16),
            PartySecretJson: base64.StdEncoding.EncodeToString(secretBytes),
            LocalSaveData:   base64.StdEncoding.EncodeToString(bz),
        }
        c.msgMu.Lock()
        defer c.msgMu.Unlock()
        c.Wallet = newWallet
        return
    case &lt;-time.After(time.Hour):
        return
    }
}
  </div>
</div>

<style>
  /* Grid + spacing via Tailwind utilities in the template. */
  /* Only custom properties and special effects here. */
  .hero-eyebrow{
    font-family:var(--font-mono);font-size:.68rem;
    color:var(--color-accent-yellow);letter-spacing:.14em;
    text-transform:uppercase;
  }
  .hero-accent-line{width:32px;height:2px;background:var(--color-accent-yellow)}
  .hero-code{
    font-family:var(--font-mono);font-size:.48rem;line-height:1.4;
    color:var(--color-text-tertiary);opacity:.4;max-width:400px;
    white-space:pre;overflow:hidden;user-select:none;
  }
  @media(max-width:768px){.hero-code{font-size:.44rem;opacity:.3;max-width:100%}}
</style>
```

- [ ] **Step 2: Rewrite pages/index.astro to use BaseLayout + Hero**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import { getCollectionByName } from '../utils/getCollectionByName';
import { orderBySticky } from '../utils/orderBySticky';
import _ from 'lodash';

const blogs = await getCollectionByName('blog');
const sorted = await orderBySticky(blogs);
const latest = sorted.slice(0, 5);
---

<BaseLayout>
  <div class="section-band band-warm" style="padding-top:0;padding-bottom:0">
    <Hero />
  </div>

  <div class="section-band band-cool">
    <div class="accent-rule"></div>
    <section class="section reveal">
      <p class="section-label">Latest Articles</p>
      <div class="blog-list">
        {latest.map(post => (
          <a href={`/blog/${post.slug}`} class="blog-item">
            <span class="blog-item-date">{new Date(post.data.date).toISOString().slice(0,7)}</span>
            <span class="blog-item-content">
              <h4>{post.data.title}</h4>
              <p>{post.data.description || ''}</p>
            </span>
            <span class="blog-item-meta">{post.data.readingTime?.text || ''}</span>
          </a>
        ))}
      </div>
    </section>
  </div>
</BaseLayout>

<style>
  .blog-list{display:flex;flex-direction:column}
  .blog-item{
    display:grid;grid-template-columns:100px 1fr 80px;align-items:baseline;gap:24px;
    padding:26px 0;border-bottom:1px solid var(--color-border);
    text-decoration:none;color:inherit;transition:padding-left .3s,background .2s;
  }
  .blog-item:hover{padding-left:8px;background:linear-gradient(to right,color-mix(in srgb,var(--color-accent-blue) 5%,transparent),transparent)}
  .blog-item-date{font-family:var(--font-mono);font-size:.72rem;color:var(--color-text-tertiary);font-weight:500}
  .blog-item-content h4{font-family:var(--font-display);font-size:1.15rem;font-weight:500;color:var(--color-text-primary);margin-bottom:4px}
  .blog-item-content p{font-size:.82rem;color:var(--color-text-secondary);line-height:1.5}
  .blog-item-meta{font-family:var(--font-mono);font-size:.7rem;color:var(--color-text-tertiary);text-align:right}
  @media(max-width:768px){.blog-item{grid-template-columns:1fr;gap:4px}.blog-item-date{order:-1}.blog-item-meta{text-align:left}}
</style>
```

- [ ] **Step 3: Verify homepage renders**

Run: `pnpm dev`
Check: hero with code on right, blog list below, section bands alternate, scroll reveals work

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat: homepage with code-as-typography hero and blog list"
```

---

## Subsystem 3: Blog

### Task 3.1: Create blog post layout and reading view

**Files:**
- Create: `src/layouts/BlogPostLayout.astro`
- Modify: `src/pages/blog/[...slug].astro`
- Modify: `src/pages/blog/[page].astro`
- Delete: `src/components/PostTitle.astro`, `src/components/PostView.astro`, `src/components/PostViewTitle.astro`, `src/components/BlogFooter.astro` (merge into BlogPostLayout)
- Delete: `src/components/ScrollToTop.astro`, `src/components/Toc.astro`

- [ ] **Step 1: Create BlogPostLayout.astro — reading column with prev/next nav**

```astro
---
// src/layouts/BlogPostLayout.astro
import BaseLayout from './BaseLayout.astro';
const { entry, prevPost, nextPost, lastModified, readingTime } = Astro.props;
const { Content } = await entry.render();
---
<BaseLayout>
  <div class="section-band band-warm" style="padding-top:140px">
    <article class="reading-column">
      <header class="post-header">
        <p class="post-eyebrow">
          {entry.data.category && <span>{entry.data.category}</span>}
          {entry.data.date && <span> · {new Date(entry.data.date).toISOString().slice(0,10)}</span>}
        </p>
        <h1>{entry.data.title}</h1>
        <p class="post-meta">
          Jida Li · {readingTime?.text || ''}
          {lastModified && <span> · Updated {lastModified}</span>}
        </p>
        <div class="post-divider"></div>
      </header>
      <div class="markdown-body">
        <Content />
      </div>
      <div class="post-divider"></div>
      <nav class="post-nav">
        {prevPost ? <a href={`/blog/${prevPost.slug}`} class="post-nav-prev">← {prevPost.data.title}</a> : <span></span>}
        {nextPost ? <a href={`/blog/${nextPost.slug}`} class="post-nav-next">{nextPost.data.title} →</a> : <span></span>}
      </nav>
    </article>
  </div>
</BaseLayout>

<style>
  .reading-column{max-width:var(--max-reading);margin:0 auto;padding:0 24px 100px}
  .post-eyebrow{font-family:var(--font-mono);font-size:.7rem;color:var(--color-accent-yellow);margin-bottom:24px}
  .post-header h1{font-family:var(--font-display);font-size:clamp(1.8rem,4vw,2.8rem);font-weight:500;margin-bottom:12px}
  .post-meta{font-size:.85rem;color:var(--color-text-tertiary);margin-bottom:32px}
  .post-divider{width:100%;height:1px;background:var(--color-border);margin:40px 0}
  .post-nav{display:flex;justify-content:space-between;font-size:.85rem}
  .post-nav a{max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  @media(max-width:768px){.reading-column{padding:0 20px 80px}.post-nav{flex-direction:column;gap:12px}.post-nav a{max-width:100%}}
</style>
```

- [ ] **Step 2: Rewrite blog/[...slug].astro**

```astro
---
import { getCollection } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';
import { sortPostsByDate } from '../../utils/sortPostsByDate';

export async function getStaticPaths() {
  const entries = (await getCollection('blog')).filter(({data}) => import.meta.env.PROD ? !data.draft : true);
  return entries.map(entry => ({ params: { slug: entry.slug }, props: { entry } }));
}

const { entry } = Astro.props;
const { remarkPluginFrontmatter } = await entry.render();
const posts = await getCollection('blog');
const filtered = posts.filter(({data}) => import.meta.env.PROD ? !data.draft : true);
const sorted = sortPostsByDate(filtered);
const idx = sorted.findIndex(p => p.data.title === entry.data.title);
const prevPost = idx > 0 ? sorted[idx - 1] : null;
const nextPost = idx < sorted.length - 1 ? sorted[idx + 1] : null;
---

<BlogPostLayout
  {entry}
  {prevPost}
  {nextPost}
  lastModified={remarkPluginFrontmatter.lastModified}
  readingTime={remarkPluginFrontmatter.readingTime}
/>
```

- [ ] **Step 3: Rewrite blog/[page].astro — paginated blog listing**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { site } from '../../consts';

export async function getStaticPaths({ paginate }) {
  const { getCollection } = await import('astro:content');
  const posts = await getCollection('blog');
  const filtered = posts.filter(({data}) => import.meta.env.PROD ? !data.draft : true);
  const sorted = filtered.sort((a,b) => b.data.date.valueOf() - a.data.date.valueOf());
  return paginate(sorted, { pageSize: site.postPageSize });
}

const { page } = Astro.props;
---

<BaseLayout>
  <div class="section-band band-warm" style="padding-top:140px">
    <section class="section">
      <h2 class="section-heading">Blog</h2>
      <div class="blog-list">
        {page.data.map(post => (
          <a href={`/blog/${post.slug}`} class="blog-item">
            <span class="blog-item-date">{new Date(post.data.date).toISOString().slice(0,7)}</span>
            <span class="blog-item-content">
              <h4>{post.data.title}</h4>
              <p>{post.data.description || ''}</p>
            </span>
          </a>
        ))}
      </div>
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Verify blog routes**

Run: `pnpm dev`
Check: `/blog/1` shows paginated list, `/blog/golang/concurrency/singleflight` (or any slug) shows reading view with prev/next

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BlogPostLayout.astro src/pages/blog/[...slug].astro src/pages/blog/[page].astro
git rm src/components/PostTitle.astro src/components/PostView.astro src/components/PostViewTitle.astro src/components/BlogFooter.astro
git rm src/components/ScrollToTop.astro src/components/Toc.astro
git commit -m "feat: blog reading view and paginated listing with new layout"
```

---

## Subsystem 4: Photo Gallery

### Task 4.1: Create photo content collection and bento grid component

**Files:**
- Create: `src/content/photos/` (one .md per photo for frontmatter)
- Create: `src/components/BentoGallery.astro`
- Modify: `src/content/config.ts` (add photos collection)

- [ ] **Step 1: Add photos collection to config.ts**

```ts
// Add to src/content/config.ts
const photos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    date: z.date().optional(),
    location: z.string().optional(),
    camera: z.string().optional(),
    group: z.string().optional(),
    featured: z.boolean().default(false),
    bento: z.object({
      shape: z.enum(['1x1','2x1','1x2','2x2']),
      col: z.number().min(1).max(6),
      row: z.number().min(1).max(3),
    }).optional(),
    image: z.string(),
  }),
});

export const collections = { blog, feed, photos };
```

- [ ] **Step 2: Create BentoGallery.astro — 6×3 CSS grid, preset shapes**

```astro
---
// src/components/BentoGallery.astro
const { photos } = Astro.props;
---
<div class="bento-gallery" style="background:var(--color-band-warm)">
  {photos.map((photo, i) => {
    const s = photo.data.bento?.shape || '1x1';
    const isLast = i === photos.length - 1;
    if (isLast && photo.data._cta) {
      return (
        <div class="bento-gallery-item gallery-cta" style="grid-column:5/7;grid-row:3/4">
          <a href="/photos" class="gallery-cta-link">
            <span class="gallery-cta-label">{photo.data.title || 'View gallery'}</span>
            <span class="gallery-cta-btn">View full gallery →</span>
          </a>
        </div>
      );
    }
    return (
      <div class={`bento-gallery-item${s === '2x1' ? ' span-2' : ''}${s === '1x2' ? ' span-2r' : ''}${s === '2x2' ? ' span-2 span-2r' : ''}`}
           style={`grid-column:${photo.data.bento?.col || 'auto'};grid-row:${photo.data.bento?.row || 'auto'}`}>
        <img src={photo.data.image} alt={photo.data.title || ''} loading="lazy" />
        {photo.data.title && <span class="bento-gallery-caption">{photo.data.title}</span>}
      </div>
    );
  })}
</div>

<style>
  .bento-gallery{
    display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(3,1fr);
    width:100vw;max-width:1400px;height:100vh;max-height:700px;margin:0 auto;
    gap:1px;
  }
  .bento-gallery-item{position:relative;overflow:hidden;background:var(--color-card);border-radius:4px}
  .bento-gallery-item img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease-out-expo)}
  .bento-gallery-item:hover img{transform:scale(1.03)}
  .bento-gallery-item.span-2{grid-column:span 2}
  .bento-gallery-item.span-2r{grid-row:span 2}
  .bento-gallery-caption{
    position:absolute;bottom:0;left:0;right:0;padding:20px 24px;
    background:linear-gradient(to top,rgba(0,0,0,.5),transparent);
    color:#F0EDE7;font-size:.78rem;font-weight:500;
    opacity:0;transform:translateY(8px);transition:opacity .3s,transform .3s;
  }
  .bento-gallery-item:hover .bento-gallery-caption{opacity:1;transform:translateY(0)}
  .gallery-cta{display:flex;align-items:center;justify-content:center;background:#7F9A96}
  .gallery-cta-link{display:flex;flex-direction:column;align-items:center;gap:10px;text-decoration:none}
  .gallery-cta-label{color:#F0EDE7;font-size:.82rem;font-weight:450}
  .gallery-cta-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;border-radius:4px;background:#EFEFEA;color:#2A3A37;font-size:.8rem;font-weight:500;transition:transform .2s}
  .gallery-cta-link:hover .gallery-cta-btn{background:#FFF;transform:translateY(-1px)}
  @media(max-width:768px){
    .bento-gallery{grid-template-columns:repeat(3,1fr);grid-template-rows:auto;height:auto;max-height:none}
    .bento-gallery-item.span-2{grid-column:span 2!important}
    .bento-gallery-item.span-2r{grid-row:span 1!important}
    .gallery-cta{grid-column:span 2!important;grid-row:auto!important}
  }
</style>
```

- [ ] **Step 3: Create sample photo content files**

Create `src/content/photos/gallery-preview.md`:

```yaml
---
bento:
  shape: "2x2"
  col: 1
  row: 1
image: "/images/photos/PS524083.jpg"
title: "Portrait series"
---
```

(Create ~5 more with preset shapes at different grid positions, ~50% coverage)

- [ ] **Step 4: Add bento gallery to homepage**

Insert BentoGallery into `pages/index.astro` after the blog list section-band.

- [ ] **Step 5: Verify gallery renders**

Run: `pnpm dev`
Check: bento grid fills viewport, photos at correct positions, CTA card at bottom-right, hover captions work

- [ ] **Step 6: Commit**

```bash
git add src/content/config.ts src/content/photos/ src/components/BentoGallery.astro src/pages/index.astro
git commit -m "feat: photo content collection and bento gallery component"
```

### Task 4.2: Create full photo gallery page and lightbox

**Files:**
- Create: `src/pages/photos/index.astro` (full gallery with masonry layout)
- Create: `src/components/PhotoLightbox.tsx` (Solid.js lightbox island)

- [ ] **Step 1: Create photos gallery page**

```astro
---
// src/pages/photos/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const photos = await getCollection('photos');
---

<BaseLayout>
  <div class="section-band band-warm" style="padding-top:140px">
    <section class="section">
      <p class="section-label">Gallery</p>
      <h2 class="section-heading">Photos</h2>
      <p style="color:var(--color-text-secondary);max-width:540px;margin-bottom:48px">A selection of moments captured on Nikon Z 6₂. Landscapes, streets, portraits.</p>
      <div class="photo-masonry">
        {photos.filter(p => p.data.image).map(photo => (
          <a href={photo.data.image} class="photo-masonry-item" data-fancybox="gallery">
            <img src={photo.data.image} alt={photo.data.title || ''} loading="lazy" />
            {photo.data.title && <span class="photo-caption">{photo.data.title}</span>}
          </a>
        ))}
      </div>
    </section>
  </div>
</BaseLayout>

<style>
  .photo-masonry{columns:3;column-gap:12px}
  .photo-masonry-item{display:block;break-inside:avoid;margin-bottom:12px;position:relative;overflow:hidden;border-radius:4px}
  .photo-masonry-item img{width:100%;display:block;transition:transform .5s var(--ease-out-expo)}
  .photo-masonry-item:hover img{transform:scale(1.03)}
  .photo-caption{position:absolute;bottom:0;left:0;right:0;padding:16px;background:linear-gradient(to top,rgba(0,0,0,.6),transparent);color:#F0EDE7;font-size:.75rem;opacity:0;transition:opacity .3s}
  .photo-masonry-item:hover .photo-caption{opacity:1}
  @media(max-width:768px){.photo-masonry{columns:2}}
  @media(max-width:480px){.photo-masonry{columns:1}}
</style>
```

- [ ] **Step 2: Create PhotoLightbox.tsx Solid.js island**

```tsx
// src/components/PhotoLightbox.tsx
import { createSignal, onCleanup } from 'solid-js';

export default function PhotoLightbox() {
  const [open, setOpen] = createSignal(false);
  const [src, setSrc] = createSignal('');

  const handleClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-fancybox]');
    if (target) {
      e.preventDefault();
      setSrc(target.getAttribute('href') || '');
      setOpen(true);
    }
  };

  const close = () => { setOpen(false); setSrc(''); };
  const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };

  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKey);
  onCleanup(() => {
    document.removeEventListener('click', handleClick);
    document.removeEventListener('keydown', handleKey);
  });

  return (
    <div class={`lightbox-overlay${open() ? ' open' : ''}`} onClick={close}>
      <button class="lightbox-close" onClick={close}>×</button>
      <img class="lightbox-img" src={src()} alt="" />
    </div>
  );
}
```

Add styles inline or via a companion CSS file.

- [ ] **Step 3: Verify gallery page**

Run: `pnpm dev`
Check: `/photos` shows masonry grid, click photo opens lightbox, Escape closes

- [ ] **Step 4: Commit**

```bash
git add src/pages/photos/ src/components/PhotoLightbox.tsx
git commit -m "feat: full photo gallery page with masonry layout and lightbox"
```

---

## Subsystem 5: About Page

### Task 5.1: Create experience content collection and about page

**Files:**
- Create: `src/content/experience/` (YAML or MDX per role)
- Create: `src/pages/about/index.astro`
- Create: `src/pages/about/about.md` (bio content)
- Modify: `src/content/config.ts` (add experience collection)

- [ ] **Step 1: Add experience collection schema**

```ts
const experience = defineCollection({
  type: 'data',
  schema: z.object({
    company: z.string(),
    role: z.string(),
    location: z.string(),
    start: z.string(),
    end: z.string(),
    highlights: z.array(z.string()),
  }),
});
```

- [ ] **Step 2: Create experience data**

`src/content/experience/presto-labs.yaml`:
```yaml
company: "Presto Labs"
role: "Blockchain Developer"
location: "Shanghai"
start: "2025-06"
end: "Present"
highlights:
  - "Designed and implemented MPC signing service for ED25519 and Keccak-256 in Go"
  - "Integrated DeFi protocols (AaveV3, UniswapV3, LfjV2) for HFT strategies"
  - "Designed realtime onchain CEX transfer feeder in Go"
```

(Create similar files for Neo and CASP Research Lab)

- [ ] **Step 3: Create about page**

```astro
---
// src/pages/about/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const jobs = (await getCollection('experience')).sort((a,b) => {
  if (a.data.end === 'Present') return -1;
  if (b.data.end === 'Present') return 1;
  return b.data.start.localeCompare(a.data.start);
});
---

<BaseLayout>
  <!-- Bio section -->
  <div class="section-band band-warm" style="padding-top:140px">
    <section class="section">
      <p class="section-label">About</p>
      <h2 class="section-heading">Jida Li</h2>
      <div class="bio-content">
        <p>Backend engineer specializing in blockchain infrastructure and distributed systems. Currently building MPC signing services at Presto Labs in Shanghai. Boston University CS graduate (GPA 3.93).</p>
        <p>When I'm not writing Go, I'm behind a Nikon Z 6₂ — photography is how I practice seeing the world more carefully. The same patience that makes a good photograph makes good software.</p>
        <p style="margin-top:24px"><a href="/CV_Jida_Li.pdf" class="btn">Download Résumé ↓</a></p>
      </div>
    </section>
  </div>

  <!-- Experience timeline -->
  <div class="section-band band-cool">
    <div class="accent-rule"></div>
    <section class="section reveal">
      <p class="section-label">Experience</p>
      <div class="timeline">
        {jobs.map(job => (
          <div class="timeline-item">
            <p class="timeline-date">{job.data.start} — {job.data.end}</p>
            <p class="timeline-role">{job.data.role}</p>
            <p class="timeline-company">{job.data.company} · {job.data.location}</p>
            <ul class="timeline-desc">
              {job.data.highlights.map(h => <li>{h}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  </div>

  <!-- Skills -->
  <div class="section-band band-warm">
    <section class="section">
      <p class="section-label">Skills</p>
      <div class="skills-grid">
        <div><strong>Languages</strong><p>Go, C++, Python, Solidity, Rust, Circom, SQL</p></div>
        <div><strong>Frameworks</strong><p>Gin, Foundry, The Graph, go-zero, Streamlit, FastAPI</p></div>
        <div><strong>Infrastructure</strong><p>Kafka, Redis, Docker, PostgreSQL, Prometheus, Grafana, Linux</p></div>
      </div>
    </section>
  </div>
</BaseLayout>

<style>
  .bio-content{max-width:var(--max-reading)}
  .bio-content p{font-size:1.05rem;line-height:1.7;margin-bottom:16px}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:12px 24px;border-radius:4px;background:var(--color-accent-yellow);color:var(--color-text-inverse);font-size:.82rem;font-weight:500;text-decoration:none;transition:background .2s}
  .btn:hover{background:var(--color-accent-yellow-hov);color:var(--color-text-inverse)}
  .timeline{position:relative;padding-left:32px}
  .timeline::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:1px;background:var(--color-border)}
  .timeline-item{position:relative;padding-bottom:40px}
  .timeline-item:last-child{padding-bottom:0}
  .timeline-item::before{content:'';position:absolute;left:-36px;top:6px;width:10px;height:10px;border-radius:50%;background:var(--color-accent-yellow);box-shadow:0 0 0 4px color-mix(in srgb,var(--color-accent-yellow) 15%,transparent)}
  .timeline-date{font-family:var(--font-mono);font-size:.7rem;color:var(--color-text-tertiary);margin-bottom:4px}
  .timeline-role{font-family:var(--font-display);font-size:1.1rem;font-weight:500;color:var(--color-text-primary);margin-bottom:2px}
  .timeline-company{font-size:.85rem;color:var(--color-text-secondary);margin-bottom:8px}
  .timeline-desc{font-size:.82rem;color:var(--color-text-secondary);line-height:1.6;list-style:disc;padding-left:16px}
  .skills-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
  .skills-grid strong{font-family:var(--font-display);font-size:1rem;color:var(--color-text-primary);display:block;margin-bottom:8px}
  @media(max-width:768px){.skills-grid{grid-template-columns:1fr}}
</style>
```

- [ ] **Step 4: Verify about page**

Run: `pnpm dev`
Check: `/about` shows bio, timeline with dots, skills grid, resume download button

- [ ] **Step 5: Copy resume PDF to public/**

```bash
cp /Users/jidali/projects/resume/resume_en/Resume_Jida_Li.pdf public/CV_Jida_Li.pdf
```

- [ ] **Step 6: Commit**

```bash
git add src/content/experience/ src/pages/about/ src/content/config.ts public/CV_Jida_Li.pdf
git commit -m "feat: about page with bio, experience timeline, skills, and resume PDF"
```

---

## Subsystem 6: Search + Cleanup

### Task 6.1: Restyle search page

**Files:**
- Modify: `src/components/Search.jsx` (restyle to new design)
- Modify: `src/pages/search.astro` (use BaseLayout)

- [ ] **Step 1: Restyle Search.jsx — Morandi input styling**

Replace the search input styles to use `--color-bg`, `--color-text-*`, `--color-accent-yellow` variables. Keep the Solid.js search logic unchanged.

- [ ] **Step 2: Rewrite search.astro with BaseLayout**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollectionByName } from '../utils/getCollectionByName';
const posts = await getCollectionByName('blog');
---

<BaseLayout>
  <div class="section-band band-warm" style="padding-top:140px">
    <section class="section">
      <h2 class="section-heading">Search</h2>
      <Search client:only="solid-js" posts={posts} />
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Verify search works**

Run: `pnpm dev`
Check: `/search` — type a keyword, results appear with highlighted matches

- [ ] **Step 4: Commit**

```bash
git add src/components/Search.jsx src/pages/search.astro
git commit -m "refactor: restyle search with Morandi design tokens"
```

### Task 6.2: Remove unused pages and clean up

**Files to remove:**
- `src/pages/archive/` (both files) — no longer needed
- `src/pages/category/[category].astro` — no longer needed
- `src/pages/tags/[tag].astro` — no longer needed
- `src/pages/class_note/` — no longer needed
- `src/pages/message/` — no longer needed
- `src/pages/feed/` — no longer needed
- `src/components/Comment.astro`, `CommentAside.astro`, `GiscusComment.astro`, `WalineComment.astro`, `Donate.astro`, `FeedPostDate.astro`, `FeedPreview.astro`, `Friends.astro`
- `src/styles/donate.css`

**Files to keep:**
- `src/remarkPlugin/` — all 4 files (still used by blog build)
- `src/utils/` — all files
- `src/i18n/` — keep for future Chinese support
- `src/styles/github-markdown.css` — keep
- `src/styles/remark-aside.css` — keep

- [ ] **Step 1: Remove unused files**

```bash
rm -rf src/pages/archive src/pages/category src/pages/tags src/pages/class_note src/pages/message src/pages/feed
rm -f src/components/Comment.astro src/components/CommentAside.astro src/components/GiscusComment.astro
rm -f src/components/WalineComment.astro src/components/Donate.astro src/components/FeedPostDate.astro
rm -f src/components/FeedPreview.astro src/components/Friends.astro
rm -f src/styles/donate.css
```

- [ ] **Step 2: Verify build still succeeds**

Run: `pnpm build`
Expected: no import errors, all pages build successfully

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove unused pages, components, and styles"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-04-website-refactor.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
