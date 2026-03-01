# CME Agent - Project Design (LOCKED)

> **Status**: DESIGN LOCKED
> **Locked Date**: March 1, 2026
> **Previous Design**: Navy + Gold (Dark Mode)
> **Current Design**: Meridian Teal (Light Mode)
> **Last Verified**: March 1, 2026

---

## 🔒 LOCKED ELEMENTS

### Color Palette

#### Primary & Accent (Meridian Teal)
| Token | Hex Code | Usage | Locked |
|-------|----------|-------|--------|
| Primary Accent | `#0077B6` | Primary teal accent | ✅ |
| Accent Light | `#00B4D8` | Cyan highlight | ✅ |
| Primary 800 | `#005A9C` | Dark teal | ✅ |
| Primary 700 | `#0064A6` | Medium-dark teal | ✅ |

#### Neutral (Light Mode Background)
| Token | Hex Code | Usage | Locked |
|-------|----------|-------|--------|
| Background | `#F0F7FA` | App background (light teal-white) | ✅ |
| Elevated/Card | `#FFFFFF` | Card backgrounds (pure white) | ✅ |
| Text Primary | `#0A1628` | Heading text (dark) | ✅ |
| Text Body | `#1A2B3C` | Body text (dark blue-gray) | ✅ |
| Text Secondary | `#4A6074` | Secondary text | ✅ |
| Text Muted | `#7A93A8` | Muted text | ✅ |

### Teal Gradient (Hero Cards)
```
LOCKED GRADIENT:
colors={['#00B4D8', '#0077B6', '#0064A6', '#005A9C']}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}
```
> Modern light-mode teal gradient from cyan to deep teal

### Status & Semantic Colors (UNCHANGED)
| Status | Hex Code | Light Variant | Locked |
|--------|----------|---------------|--------|
| Success | `#5D8A66` | `rgba(93, 138, 102, 0.15)` | ✅ |
| Warning | `#C4883A` | `rgba(196, 136, 58, 0.15)` | ✅ |
| Risk | `#B85C5C` | `rgba(184, 92, 92, 0.15)` | ✅ |

### Category Colors
| Category | Color | Locked |
|----------|-------|--------|
| General | `#0077B6` (Primary accent) | ✅ |
| Controlled Substances | `#C4883A` | ✅ |
| Risk Management | `#B85C5C` | ✅ |
| Ethics | `#5D8A66` | ✅ |
| Pain Management | `#8B5A8B` | ✅ |

### Border & Effects
| Element | Color | Locked |
|---------|-------|--------|
| Primary Border | `rgba(0, 119, 182, 0.15)` | ✅ |
| Light Border | `rgba(0, 119, 182, 0.08)` | ✅ |
| Divider | `#E8EEF2` | ✅ |
| Glow | `rgba(0, 119, 182, 0.2)` | ✅ |
| Overlay | `rgba(10, 22, 40, 0.8)` | ✅ |

---

### Layout & Components

#### Tab Navigation
| Element | Specification | Locked |
|---------|--------------|--------|
| Tab Count | Exactly 5 tabs | ✅ |
| Tab 1 | Home (house icon) | ✅ |
| Tab 2 | Licenses (document icon) | ✅ |
| Tab 3 | Courses (book icon) | ✅ |
| Tab 4 | Courses (book icon) | ✅ |
| Tab 5 | Profile (person icon) | ✅ |
| Icon Library | Ionicons only | ✅ |
| Active Color | Primary Accent (#0077B6) | ✅ |

#### Hero Card (Soonest-Expiring License)
| Element | Specification | Locked |
|---------|--------------|--------|
| Background | Teal gradient (see above) | ✅ |
| Circular Progress | Top-right corner position | ✅ |
| Bubble Overlay | Semi-transparent bokeh effect | ✅ |
| Category Pills | Rounded, semi-transparent | ✅ |
| Text | White on gradient | ✅ |

#### Typography
| Element | Specification | Locked |
|---------|--------------|--------|
| Icons | Ionicons ONLY (no emojis) | ✅ |
| Primary Text | Dark teal/navy on light backgrounds | ✅ |
| Card Text | Dark navy on white cards | ✅ |
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
| 2026-02-07 | Full Design | Initial lock (Navy + Gold dark mode) | User |
| 2026-02-07 | Gold Gradient | Fixed from bright yellow to muted Sand | User |
| 2026-02-07 | Circular Progress | Repositioned to top-right | User |
| 2026-03-01 | Complete Theme | Changed to Meridian Teal (Light Mode) | User |
| 2026-03-01 | Color System | All navy+gold replaced with teal+white | User |
| 2026-03-01 | Gradient | Changed to TEAL_GRADIENT throughout | User |

---

## Migration Notes (2026-03-01)

### Renamed Constants
- `GOLD_GRADIENT` → `TEAL_GRADIENT`

### Color Mapping (Old → New)
- `#0D1321` (Navy 900) → `#F0F7FA` (Background)
- `#151E2F` (Navy 800) → `#FFFFFF` (Elevated)
- `#1D2A3F` (Navy 700) → `#FFFFFF` (Cards)
- `#A68B5B` (Gold accent) → `#0077B6` (Teal accent)
- `#D4C4B0` (Sand 400) → `#4A6074` (Text secondary)
- `#FAF8F5` (Sand 100) → `#F0F7FA` (Light background)

### Unchanged
- All status colors (success, warning, risk) remain identical
- All category colors remain identical except General (now teal)
- Typography, spacing, and layout untouched
- Tab navigation structure unchanged

---

## Verification Screenshots

Production URL: https://cme-agent.vercel.app

Last verified: March 1, 2026 - All locked elements confirmed with Meridian Teal theme.
