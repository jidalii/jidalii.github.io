# UI 色彩科学 — jidalii.github.io

> 日期：2026-07-19 · 本文档记录全站色彩体系：token 架构、实测对比度、使用规则与变更历史。
> 所有对比度数值均由 WCAG 2.x 相对亮度公式实际计算（非估算）。

---

## 1. 色彩架构：三个层次

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1  Band 底色系统（页面明度弧线）                      │
│  warm #F2F1ED → cool #C7D9D6 → warm → ink #141311        │
├─────────────────────────────────────────────────────────┤
│  Layer 2  文本层级（每个 band 有独立的文本色板）              │
│  primary / secondary / tertiary（对比度递减）                │
├─────────────────────────────────────────────────────────┤
│  Layer 3  金色强调层级（三档，按用途严格分工）                 │
│  deco 装饰 / text 文本 / deep 填充                          │
└─────────────────────────────────────────────────────────┘
```

**明度弧线**是页面节奏的核心：浅（hero）→ 灰绿（experience）→ 浅（photos）→ **墨（footer）**。
ink footer 是全页唯一的深色区域（明度 < 0.1），承担"视觉锚点"角色——没有它，整页都漂浮在中高明度区间。

## 2. Token 全表

### Band 底色

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-band-warm` | `#F2F1ED` | 主底色（暖纸白），hero / photos / 常规页面 |
| `--color-band-cool` | `#C7D9D6` | 对比带（灰绿），experience / skills |
| `--color-band-anchor` | `#B8CCC8` | 中间过渡带 |
| `--color-ink` | `#141311` | 深色锚点（footer），兼作 text-primary |

### 文本色（暖带 warm 上）

| Token | Hex | 对比度 (on warm) | 等级 |
|-------|-----|------|------|
| `--color-text-primary` | `#141311` | 16.43:1 | AAA |
| `--color-text-secondary` | `#6B665E` | 5.04:1 | AA |
| `--color-text-tertiary` | `#9C9790` | 2.57:1 | ❌ 仅装饰/非关键文本 |
| `--color-text-inverse` | `#F8F7F4` | 17.33:1 (on ink) | AAA |

### 文本色（冷带 cool 上）— 独立色板

冷带为绿色调，暖灰文本在其上对比度不足或色相冲突，因此冷带有自己的一套：

| 色值 | 用途 | 对比度 (on cool) | 等级 |
|------|------|------|------|
| `#141311` | 标题/正文 | 12.67:1 | AAA |
| `#4A5654` | 次级（日期、公司、标签） | 5.21:1 | AA |
| `#3F4A47` | 正文（summary、skills 列表） | 6.28:1 | AA |
| ~~`#9C9790`~~ | tertiary 在冷带上 | 1.98:1 | ❌ 禁止使用 |
| ~~`#6B665E`~~ | secondary 在冷带上 | ~3.4:1 | ❌ 禁止使用 |

### 金色强调层级（三档分工）

| Token | Hex | 角色 | 允许用途 |
|-------|-----|------|---------|
| `--color-accent-gold` | `#C4A04A` | **装饰** | 时间线圆点/竖线、footer 链接 hover、GlyphMatrix 渐变端色 |
| `--color-accent-gold-text` | `#7A5F18` | **文本** | eyebrow、section-label、小字标签（on warm：5.34:1 AA ✓） |
| `--color-accent-gold-deep` | `#6E5717` | **填充** | 按钮底色（配 inverse 文本：6.45:1 AA ✓） |

> ⚠️ 历史教训：`#B8952E`（旧 `--color-accent-yellow`）在暖底上仅 2.52:1，不能直接用作小字文本色。
> `#8A6D1F`（第一代 gold-text）实测 4.33:1，仍未过小字 AA 的 4.5:1——所以有了 `#7A5F18`。
> **金色装饰色（on cool 1.69:1）只能用于非信息性元素**：点、线、hover 态。

### 其他强调色

| Token | Hex | 对比度 | 用途 |
|-------|-----|--------|------|
| `--color-accent-blue` | `#5C7090` | 4.45:1 on warm / 3.43:1 on cool | 链接（仅暖带/白底使用） |
| 冷带链接/按钮 | `#41546E` | 5.27:1 on cool | timeline toggle 等冷带交互文本 |
| `--color-accent-terracotta` | `#B8755E` | — | accent-rule 装饰条 |

## 3. Band 使用规则

1. **暖带上的 section-label** → `--color-accent-gold-text`（金色，5.34:1）
2. **冷带上的 section-label** → `#4A5654`（灰绿，5.21:1）
   由 `bands.css` 的 `.band-cool .section-label` 全局规则保证，新页面自动生效。
3. **冷带上的正文/次级文本** → 必须用冷带色板（`#3F4A47` / `#4A5654`），禁止直接用 `--color-text-secondary/tertiary`。
4. **不要在 band 上加 CSS 渐变**（见 §4）。
5. 冷带与暖带交界处必须有 GlyphMatrix 分隔带过渡。

## 4. 过渡机制：为什么 band 必须是纯色

站点的带间过渡由 **GlyphMatrix**（字形矩阵分隔带）完成：它在 ~140px 高度内把上一条 band 的颜色抖动渐变到下一条 band 的颜色。

这要求两侧 band 是**纯色**——分隔带的背景色直接取 band 色 token，逐像素衔接：

```
band（纯色 #C7D9D6）┐
                    ├─ 无缝 → GlyphMatrix dither ─ 无缝 →┐ band（纯色 #F2F1ED）
分隔带 bg #C7D9D6 ──┘                                    └── 分隔带末端 #F2F1ED
```

2026-07-19 曾尝试给 band 加纵向 CSS 渐变（`#C7D9D6→#BFD3CF`），导致 band 底边（`#BFD3CF`）与分隔带顶边（`#C7D9D6`）色值错位，出现可见色阶，已回退。**band 的视觉变化交给 GlyphMatrix，不用 CSS 渐变。**

## 5. 颗粒纹理

全站胶片颗粒（2026-07-20 起改为 **band 级背景层**，照片保持纯净）：

**机制**：颗粒不是全局覆盖层，而是每个 band 的 `background-image`，通过
`background-blend-mode: soft-light` 与 band 底色混合。照片、卡片等子元素绘制在
band 背景层之上，因此 bento 里的照片不受颗粒影响。tile 由 token
`--grain-texture`（`index.css`）单点提供，全站引用同一 SVG。

| 参数 | 值 | 原因 |
|------|-----|------|
| `feColorMatrix saturate 0` | 去色 | 彩色噪点会污染低饱和的 Morandi 色板；中性颗粒才是"胶片感" |
| `baseFrequency` | 0.9 | 细颗粒（0.75 偏粗糙） |
| `numOctaves` | 2 | 越少越细腻 |
| rect `opacity` | 0.55 | 烘焙进 SVG 的强度；soft-light 下暖/冷/墨三种底都清晰可辨 |
| 混合模式 | `soft-light` | 普通混合在亮带上要么不可见（≤0.07）、要么像白灰（≥0.1）；soft-light 按底色明暗双向调制，任何带上都自然 |
| tile 尺寸 | 256px | 重复不可见 |
| 动画 | 无 | 静态纹理，天然兼容 `prefers-reduced-motion` |

**作用范围**：`.section-band`（全站，含 about/blog/photos）、`.bento-gallery`、
`.site-footer`。`.band-dither` 分隔带不加颗粒（字形场本身就是纹理）。

**注意**：不要对 band 元素使用 `background` 简写覆写底色——简写会重置
`background-image` 冲掉颗粒。覆写底色请用 `background-color`（如 experiment.astro）。

历史：`body::after` 普通混合 0.04（亮带上不可见）→ 全页 soft-light 覆盖层
（照片被双重加粒）→ band 级背景（现状）。

## 6. 深色锚点（ink）上的规则

| 元素 | 色值 | 对比度 on ink | 等级 |
|------|------|------|------|
| 主文本 | `#F8F7F4` | 17.33:1 | AAA |
| footer 链接 | `#8B867E` | 5.14:1 | AA |
| footer 版权小字 | `#6B665E` | 3.26:1 | AA-large（仅非关键小字） |
| 链接 hover | `#C4A04A` | 7.49:1 | AAA |

## 7. 变更日志

| 日期 | 变更 | Before → After |
|------|------|------|
| 2026-07-18 | 金色文本 AA 修复（eyebrow / section-label / blog 标签） | `#B8952E` 2.52:1 → `#7A5F18` 5.34:1 |
| 2026-07-18 | 冷带文本独立色板 | `#9C9790` 1.98:1 → `#4A5654` 5.21:1 / `#3F4A47` 6.28:1 |
| 2026-07-18 | 冷带 toggle 按钮 | `#5C7090` 3.43:1 → `#41546E` 5.27:1 |
| 2026-07-18 | footer 深色锚点 | 浅底 tertiary 2.57:1 → ink + `#8B867E` 5.14:1 |
| 2026-07-19 | Résumé 按钮 | `#B8952E` 底 2.66:1 → `#6E5717` 底 6.45:1 |
| 2026-07-19 | band CSS 渐变 | 尝试后回退（与 GlyphMatrix 过渡冲突，见 §4） |
| 2026-07-19 | 颗粒纹理精修 | 彩色噪点 0.035 → 中性细颗粒 0.04 |
| 2026-07-20 | 颗粒改 band 级背景 | 全页覆盖层（照片双重加粒）→ band 背景 + soft-light（照片纯净） |

## 8. 新增颜色的流程

1. **先算对比度**（WCAG 相对亮度公式；本文所有数值都是实算的，不要目测）
2. 阈值：正文 ≥ 4.5:1，大号文本（≥18pt/14pt bold）≥ 3:1，装饰无要求但不得承担信息
3. 检查所属 band：暖带 / 冷带 / ink 各有独立色板，跨带复用前必须重算
4. 金色一律归入三档层级（deco / text / deep），不允许第四档
5. 命名语义化（`--color-*-text` / `--color-*-deep`），禁止在组件里写裸 hex——冷带色板（`#4A5654`/`#3F4A47`）目前是例外，待后续 token 化

---

*相关文档：[homepage-design-review.md](./homepage-design-review.md)（首页结构/布局评审）*
