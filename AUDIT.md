# Design Audit — RESEARCH.md

> Audited against the frontend-design principles.
> Date: 2026-07-04

---

## Critical

### 1. No signature element — the single biggest gap

> *"Spend your boldness in one place. Let the signature element be the one memorable thing."*

"Code as Craft" is named as a philosophy but never materializes as **the one thing a visitor remembers**. The ghost code in the hero is at 10% opacity — decoration, not a signature. The SVG brackets are generic. Contralabs has a renaissance woman on a dithered keyboard. We have nothing at that level.

**Recommended actions:**

| Option | Description | Risk level |
|--------|-------------|------------|
| A | **Real code as hero typography** — a genuine Go snippet rendered large with syntax highlighting, treated as display type. No photo, no name until scroll. | High |
| B | **Full-bleed photograph as hero** — a single image with one line of copy. Let the photographer speak first. Developer identity inferred through navigation. | Medium |
| C | **Interactive terminal** — live typing effect that writes, deletes, rewrites a real function. The process made visible. | High (perf) |

### 2. No page purpose is stated

> *"Name one concrete subject, its audience, and the page's single job."*

The document describes Jida but never answers: **who is this for, and what should they do?**

**Fix**: Add to §1:
```
Primary audience: Technical hiring managers and fellow engineers.
Secondary: Photography enthusiasts, collaborators.
Single job: Convince the visitor Jida is deeply competent (blog)
           and interesting (photography) in under 30 seconds.
```

---

## High

### 3. Typography is inconsistent with the sample

§4.3 discusses Editorial New, PP Editorial, and Cormorant Garamond. The sample uses **Source Serif 4**. The body face is still "Inter or Geist" — undecided.

**Fix**: Lock in Source Serif 4 (display) + Inter (body) + JetBrains Mono (code). Update §4.3. Remove alternatives.

### 4. Color palette table is from the first draft

§4.2 shows hex values (`#F0EDE7`, `#3D3935`) that don't match the actual 3-band + 3-accent system in the sample:

| Old (stale) | New (actual) |
|-------------|-------------|
| `#F0EDE7` bg | `#141311` dark / `#F2EFEA` light (band-warm) |
| `#C4A04A` yellow | `#C4A04A` (same, but now accent-yellow) |
| No blue | `#7B94B0` accent-blue |
| No terracotta | `#A8644C` accent-terracotta |

**Fix**: Replace §4.2 with the actual 3-band + 3-accent system. Delete Direction B or move to appendix — Direction A was chosen (decision #8).

### 5. Photo gallery has two conflicting layout descriptions

§6.3: "CSS Grid Masonry — images retain their native aspect ratios (no cropping)."
§6.5: "Bento Grid Preset System — 6×3 grid, `object-fit: cover`."

These are contradictory. The bento grid (§6.5) is more developed and matches contralabs reference.

**Fix**: Remove §6.3 or rewrite it to describe the bento grid. Commit to one layout system.

---

## Medium

### 6. Copy/content strategy is absent

> *"Words appear in a design for one reason: to make it easier to understand, and therefore easier to use. They are design material, not decoration."*

The document has zero discussion of:
- Hero copy (current text is placeholder)
- About page bio
- Section label conventions
- Photo caption voice ("Location, Date" vs narrative?)
- Error/empty state messaging

**Fix**: Add §12 "Copy Strategy" with at minimum:
- 2-3 hero headline candidates
- About page bio draft (~100 words)
- Section label convention (current: monospace uppercase, e.g. "FEATURED")
- Photo caption voice decision

### 7. Hero is the template answer

> *"A big number with a small label, supporting stats, and a gradient accent is the template answer, only use if that's truly the best option."*

The current hero plan (§7.3, §4.5 wireframe): "Name + tagline + subtle animation." For a developer+photographer, the most characteristic thing is not their name — it's a photograph they took, or code they wrote, or the tension between them.

**Fix**: See issue #1 — the hero and the signature element should be the same decision.

### 8. No aesthetic risk is visible

> *"Take one real aesthetic risk you can justify."*

The Morandi palette is tasteful. The three accents are reasoned. The section bands are disciplined. Everything is defensible, **nothing is bold**. Contralabs' risk: putting a renaissance painting on a tech site.

Candidates that haven't been explored:
- All photography on homepage, code only through blog links
- A full-bleed terminal as the hero surface
- About page as the homepage — no landing page at all

---

## Low

### 9. Section 2.3 contralabs color analysis is overlong

The L/sat tables are raw research data. They're valuable as reference but belong in an appendix, not the main body. The "Key findings" summary is sufficient.

**Fix**: Move detailed vertical scan tables to the appendix, keep only the 6 bullet-point findings.

### 10. Decisions log is internally inconsistent

Decision #2: "Two directions sampled — warm vs cool. Pick one." (implies open)
Decision #8: "Direction A: Morandi Warm (暖调)." (implies closed)

**Fix**: Update decision #2 to reflect that Direction A was chosen.

### 11. The SVG illustration strategy isn't documented

The sample has a code-bracket SVG in the hero at 6% opacity, and ghost code at 10%. These are decorative, not illustrative — they don't carry meaning the way contralabs' renaissance woman does. The research doc should state what kind of illustrations (if any) the site uses, and why.

---

## Summary

| # | Priority | Issue | Status |
|---|----------|-------|--------|
| 1 | Critical | No signature element | ✅ Real code from bnb-chain/tss-lib as hero typography |
| 2 | Critical | No page purpose stated | ✅ Audience + single job added to §1 |
| 3 | High | Typography inconsistent with sample | ✅ Source Serif 4 + Inter + JetBrains Mono locked |
| 4 | High | Color table stale | ✅ Replaced with 3-band + 3-accent system |
| 5 | High | Gallery layout conflict | ✅ §6.3 rewritten to bento grid |
| 6 | Medium | No copy strategy | ⏳ Add §12 |
| 7 | Medium | Hero is template answer | ✅ Resolved by #1 — code is the hero |
| 8 | Medium | No aesthetic risk | ✅ Real code as display type IS the risk |
| 9 | Low | Contralabs data too long | ⏳ Move to appendix |
| 10 | Low | Decisions log inconsistency | ✅ Fixed #2 |
| 11 | Low | Illustration strategy undocumented | ✅ Replaced by signature element (§4.2.1) |
