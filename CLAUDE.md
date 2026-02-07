# CME Agent - Claude Development Guidelines

## LOCKED DESIGN SPECIFICATION
> **Status: LOCKED** - Design finalized February 2026
> Do not modify visual design without explicit user approval

---

## Design System Colors

### Navy Palette (Primary Background)
| Token | Hex | Usage |
|-------|-----|-------|
| Navy 900 | `#0D1321` | App background |
| Navy 700 | `#1D2A3F` | Card backgrounds |
| Navy 600 | `#2A3A52` | Secondary surfaces |

### Sand/Gold Palette (Accent)
| Token | Hex | Usage |
|-------|-----|-------|
| Sand 500 | `#A68B5B` | Primary gold accent |
| Sand 400 | `#D4C4B0` | Secondary gold/text |
| Sand 50 | `#FDFCFB` | Light text on dark |

### Gold Gradient (Hero Cards)
```typescript
colors={['#C4A574', '#A68B5B', '#8B7349', '#705C3A']}
start={{ x: 0, y: 0 }}
end={{ x: 1, y: 1 }}
```
> **IMPORTANT**: Use muted brownish-gold tones, NOT bright yellow (#D4AF37)

---

## Component Specifications

### Hero Card (California License)
- **Background**: Gold gradient with bubble/bokeh overlay
- **Circular Progress**: Position `top-right`, aligned with license label
- **Category Pills**: Rounded with semi-transparent background
- **Typography**: White text on gold gradient

### Secondary Cards (Texas, etc.)
- **Background**: Same gold gradient, more subtle
- **Checkmark**: Green success indicator
- **Layout**: Horizontal with chevron navigation

### Tab Bar
- **Tabs**: Exactly 5 tabs (Home, Licenses, Certs, Courses, Profile)
- **Icons**: Ionicons only, no emojis
- **Active State**: Sand 500 gold accent
- **Inactive State**: Gray muted

### Quick Actions
- **Background**: Navy 700 cards
- **Icons**: Ionicons in white
- **Border**: Subtle border with navy tones

---

## Visual Effects

### Bubble/Bokeh Overlay
```typescript
// SVG circles with low opacity for luxury feel
<Circle cx="80%" cy="20%" r="60" fill="rgba(255,255,255,0.08)" />
<Circle cx="20%" cy="70%" r="40" fill="rgba(255,255,255,0.05)" />
<Circle cx="90%" cy="80%" r="25" fill="rgba(255,255,255,0.06)" />
```

---

## Development Protocol

### Ralph Loops
When making UI changes, follow:
```
BUILD → TEST → VERIFY → REPEAT
```
1. Make code changes
2. Build with `npx expo export --platform web`
3. Deploy via git push (Vercel auto-deploys)
4. Verify with browser screenshot against mockup

---

## File Structure

### Key Files
- `app/(tabs)/index.tsx` - Dashboard/Home screen
- `app/(tabs)/profile.tsx` - Profile screen with gold card
- `app/(tabs)/licenses.tsx` - Licenses list
- `app/(tabs)/certifications.tsx` - Certifications
- `app/(tabs)/courses.tsx` - Courses browser
- `components/CustomTabBar.tsx` - 5-tab navigation

---

## Tech Stack
- **Framework**: Expo SDK 54 + React Native
- **Navigation**: Expo Router with custom tab bar
- **Styling**: StyleSheet + expo-linear-gradient
- **Icons**: @expo/vector-icons (Ionicons)
- **SVG**: react-native-svg for overlays
- **Deployment**: Vercel (static export from `dist/`)

---

## Deployment
```bash
# Build
npx expo export --platform web

# Deploy (auto via git)
git add . && git commit -m "message" && git push origin main
```

Production URL: https://cme-agent.vercel.app
