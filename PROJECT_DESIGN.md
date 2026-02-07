# CME Agent - Project Design (LOCKED)

> **Status**: DESIGN LOCKED
> **Locked Date**: February 7, 2026
> **Last Verified**: February 7, 2026

---

## 🔒 LOCKED ELEMENTS

### Color Palette

#### Navy (Primary Background)
| Token | Hex Code | Usage | Locked |
|-------|----------|-------|--------|
| Navy 900 | `#0D1321` | App background | ✅ |
| Navy 700 | `#1D2A3F` | Card backgrounds | ✅ |
| Navy 600 | `#2A3A52` | Secondary surfaces | ✅ |

#### Sand/Gold (Accent)
| Token | Hex Code | Usage | Locked |
|-------|----------|-------|--------|
| Sand 500 | `#A68B5B` | Primary gold accent | ✅ |
| Sand 400 | `#D4C4B0` | Secondary gold/text | ✅ |
| Sand 50 | `#FDFCFB` | Light text on dark | ✅ |

### Gold Gradient (Hero Cards)
```
LOCKED GRADIENT:
colors={['#C4A574', '#A68B5B', '#8B7349', '#705C3A']}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}
```
> ⚠️ DO NOT use bright yellow golds (#D4AF37, #C9A227) - Use muted brownish-gold only

---

### Layout & Components

#### Tab Navigation
| Element | Specification | Locked |
|---------|--------------|--------|
| Tab Count | Exactly 5 tabs | ✅ |
| Tab 1 | Home (house icon) | ✅ |
| Tab 2 | Licenses (document icon) | ✅ |
| Tab 3 | Certs (ribbon icon) | ✅ |
| Tab 4 | Courses (book icon) | ✅ |
| Tab 5 | Profile (person icon) | ✅ |
| Icon Library | Ionicons only | ✅ |
| Active Color | Sand 500 (#A68B5B) | ✅ |

#### Hero Card (California License)
| Element | Specification | Locked |
|---------|--------------|--------|
| Background | Gold gradient (see above) | ✅ |
| Circular Progress | Top-right corner position | ✅ |
| Bubble Overlay | Semi-transparent bokeh effect | ✅ |
| Category Pills | Rounded, semi-transparent | ✅ |

#### Typography
| Element | Specification | Locked |
|---------|--------------|--------|
| Icons | Ionicons ONLY (no emojis) | ✅ |
| Primary Text | White on gold cards | ✅ |
| Greeting | "Good [time]" format | ✅ |

---

### Visual Effects

#### Bubble/Bokeh Overlay
```
LOCKED SVG OVERLAY:
<Circle cx="80%" cy="20%" r="60" fill="rgba(255,255,255,0.08)" />
<Circle cx="20%" cy="70%" r="40" fill="rgba(255,255,255,0.05)" />
<Circle cx="90%" cy="80%" r="25" fill="rgba(255,255,255,0.06)" />
```

---

## Reference Mockup

The design was locked based on the approved mockup showing:
- Muted brownish-gold gradient (Sand palette)
- Circular progress indicator in top-right of California card
- 5-tab navigation bar
- Premium/luxury aesthetic with subtle bokeh effects

---

## Change Log

| Date | Element | Change | Approved By |
|------|---------|--------|-------------|
| 2026-02-07 | Full Design | Initial lock | User |
| 2026-02-07 | Gold Gradient | Fixed from bright yellow to muted Sand | User |
| 2026-02-07 | Circular Progress | Repositioned to top-right | User |

---

## Verification Screenshots

Production URL: https://cme-agent.vercel.app

Last verified: February 7, 2026 - All locked elements confirmed matching mockup.
