# 首页设计评审与优化方案

> 日期：2026-07-18 · 范围：`http://localhost:4321/`（首页）· 目标：解决页面"扁平"问题
> 方法：ui-ux-pro-max skill 设计数据库 + 全页截图分析 + 源码审查

---

## 1. 现状盘点

**已有视觉资产（值得保留的识别度）：**

| 资产 | 位置 | 说明 |
|------|------|------|
| 暖纸底色 `#F2F1ED` | `--color-band-warm` | 类纸张的编辑感基调 |
| 灰绿 band `#C7D9D6` | `--color-band-cool` | 区块色彩节奏 |
| Source Serif 4 + Inter + JetBrains Mono | `index.css:29-31` | 编辑/杂志式字体系统 |
| GlyphMatrix 分隔带 | `GlyphMatrix.astro` | 全站最有辨识度的元素 |
| Bento 照片墙 | `BentoGallery.astro` | 最丰富的视觉内容 |

**页面结构：** Hero（暖）→ 字形矩阵分隔 → Experience 时间线（灰绿）→ 字形矩阵分隔 → Photos bento → Footer

---

## 2. 诊断：为什么看起来"平"

### 2.1 所有元素都在同一平面
每个区块都是「文字直接放在纯色底上」。全页没有任何阴影、海拔、重叠或层叠关系。Flat design 也需要**分层**来制造深度——目前是字面意义的"一张平面"。

### 2.2 Hero 唯一的"深度元素"是失败的
`Hero.astro:58` 的 Go 代码块使用 `github-dark-dimmed` 语法主题（为深色背景设计的配色），却以 `opacity:.45` 放在浅色暖底上，渲染成一团不可读的灰雾。首屏右上方约 40% 的区域实际上是空置的。

### 2.3 最强的资产被埋在最底部
标题写着 "Developer & **Photographer**"，但页面前 ~70% 全是文字。摄影——最丰富的视觉内容——最后才出现。

### 2.4 色板没有深色锚点
暖白 + 灰绿 + 暗金 + 灰蓝的明度全部集中在中高区间，全页没有任何深色元素给眼睛"抓点"。
⚠️ 附带可访问性问题：金色 eyebrow `#B8952E` 在 `#F2F1ED` 上对比度仅 **~2.5:1**，未达 WCAG AA 的 4.5:1（小字号文本）。

### 2.5 画廊网格有明显空洞 + Experience 右半空置
- `BentoGallery.astro`：12 格网格只放 6 张照片 + 5 个 `empty` 空格 + 1 个 CTA，截图中空洞清晰可见——读起来像 bug 而非设计。
- Experience 时间线只占据容器左 ~55%，右侧是无效留白。
- 中段标题 `section-heading` 仅 `1.5rem`，与 `h1` 的 `clamp(2.6rem,5.5vw,4.5rem)` 之间断层，页面中段没有字体量级支撑。

---

## 3. 优化方案（按优先级）

### P0 — Hero：把代码块变成"真实物体"
放弃淡彩水印路线，改为深色「终端卡片」：

```css
.hero-code {
  background: #141311;          /* 深色底 → dark-dimmed 主题瞬间变正确 */
  color: #adbac7;
  font-size: .72rem;            /* 从 .48rem 提升到可读 */
  opacity: 1;                   /* 不再半透明 */
  border-radius: 12px;
  padding: 24px;
  transform: rotate(1.2deg);    /* 轻微倾斜 → 手工感 */
  box-shadow:
    0 1px 2px rgba(20,19,17,.08),
    0 8px 24px rgba(20,19,17,.12),
    0 24px 64px rgba(20,19,17,.10);  /* 多层柔和阴影 */
}
```

一举三得：多出一个平面、补上了缺失的深色锚点、代码变得可读。

### P0 — Hero：放入摄影元素
在终端卡片上叠一张「照片打印件」：白色卡纸边框 + 旋转 ~3° + 阴影，部分压在卡片之上。

```css
.hero-print {
  background: #fff;
  padding: 10px 10px 34px;      /* 底部留白模拟拍立得 */
  transform: rotate(-2.5deg);
  box-shadow: 0 12px 40px rgba(20,19,17,.18);
}
```

层次变为：纸底 → 深色卡片 → 照片打印件，三层深度；"Photographer" 的身份在首屏即可见。

### P0 — 修复画廊空洞
二选一：
- 网格改为 4×2（7 张照片 + 1 CTA = 8 格填满）；
- 或保留 12 格但加 `grid-auto-flow: dense` 并让部分照片跨格（如一张 2×2 主图），同时增加照片数量。

满格 = 设计感；空洞 = 故障感。

### P1 — Experience：给它一个"布局"，而不是一根列
- 双栏：左侧 sticky 栏（label + heading + 描述），右侧时间线条目。填满右侧死区并制造滚动层次。
- 时间线竖线改为金色渐变：`linear-gradient(#C4A04A, transparent)`。
- `section-heading` 从 `1.5rem` 提升至 ~`2.25rem`，补上中段字体量级。

### P1 — 增加一条深色 band 锚定全页
Footer 改为墨色（`#141311` 底 + `#F8F7F4` 字，`--color-text-inverse` 已存在）。
滚动旅程变为：浅 → 灰绿 → 浅 → **墨**，全页有了明度弧线而不是一条平洗。

### P2 — 纸感纹理替代数学级平涂
在暖色 band 上叠加 3–4% 透明度的胶片颗粒（SVG `feTurbulence` data-URI，`pointer-events:none`，`position:fixed`）。静态纹理，不影响 `prefers-reduced-motion`，对摄影师身份非常贴题。
可选：每个 band 加几乎不可察觉的纵向渐变（如 `#F2F1ED → #ECEAE4`）。

### P2 — 修复金色对比度
- 文本用深金：`#8A6D1F`（≈4.6:1，过 AA）
- 亮金 `#B8952E` / `#C4A04A` 只用于装饰性笔画与大号元素

---

## 4. 建议的 Token 调整

```css
:root {
  /* 新增 */
  --color-ink:            #141311;  /* 深色锚点：终端卡片 / footer */
  --color-accent-gold-text: #8A6D1F; /* 文本级金色（AA 合规） */
  --shadow-card:
    0 1px 2px rgba(20,19,17,.08),
    0 8px 24px rgba(20,19,17,.12),
    0 24px 64px rgba(20,19,17,.10);
  --shadow-print: 0 12px 40px rgba(20,19,17,.18);
}

/* 修改 */
/* section-heading: 1.5rem → 2.25rem */
```

---

## 5. 设计方向参考（skill 数据库）

- **Editorial Grid / Magazine** — 不对称网格、print-inspired 排版、大图、reveal on scroll
- **E-Ink / Paper** — 纸张纹理、暖底、低刺激色彩（与现有方向一致）
- ~~Dark Mode (OLED)~~ — 数据库首选，但与现有暖色编辑身份冲突，**不采纳**；仅借用其"深色锚点"思路做局部深色元素

## 6. 验收清单（实施后核对）

- [ ] 首屏存在 ≥3 个视觉层级（纸底 / 深色卡片 / 照片）
- [ ] 首屏可见至少 1 张摄影作品
- [ ] 画廊网格无空洞
- [ ] 全页至少 1 个深色（明度 < 0.2）区块
- [ ] 金色文本对比度 ≥ 4.5:1
- [ ] 阴影均为多层柔和阴影，无生硬单层投影
- [ ] 纹理静态叠加，不干扰 `prefers-reduced-motion`
- [ ] 375px / 768px / 1440px 三档验证
- [ ] 微交互时长保持 150–300ms，easing 沿用 `--ease-out-expo`

## 7. 实施顺序建议

1. **第一批（改动小、效果最大）**：`Hero.astro` 终端卡片 + 照片打印件；`BentoGallery.astro` 网格修复
2. **第二批**：Experience 双栏 + footer 深色化
3. **第三批**：颗粒纹理、渐变、token 精修
