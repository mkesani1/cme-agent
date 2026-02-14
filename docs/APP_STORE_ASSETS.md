# App Store Assets Guide

This document outlines all the screenshots and assets needed for App Store and Google Play submissions.

## Screenshot Requirements

### Apple App Store

| Device | Resolution | Required |
|--------|-----------|----------|
| 6.7" iPhone (14 Pro Max) | 1290 × 2796 | Yes (primary) |
| 6.5" iPhone (11 Pro Max) | 1242 × 2688 | Yes |
| 5.5" iPhone (8 Plus) | 1242 × 2208 | Optional |
| 12.9" iPad Pro | 2048 × 2732 | If supporting iPad |

**Number of screenshots**: 5-10 per device size

### Google Play Store

| Device | Resolution | Required |
|--------|-----------|----------|
| Phone | 1080 × 1920 (min) | Yes |
| 7" Tablet | 1200 × 1920 | Recommended |
| 10" Tablet | 1920 × 1200 | Recommended |

**Number of screenshots**: 4-8 per device type

---

## Recommended Screenshots (5 Essential Screens)

### 1. Dashboard / Home Screen
**File**: `screenshot_01_dashboard.png`
**Caption**: "Track all your licenses at a glance"
**Shows**:
- Hero card with primary license
- Overall CME progress
- Upcoming renewal warnings
- Quick action buttons

### 2. License Management
**File**: `screenshot_02_licenses.png`
**Caption**: "Manage multiple state licenses"
**Shows**:
- List of all medical licenses
- Expiry dates with urgency indicators
- Progress bars for each license
- Add new license button

### 3. Smart Course Recommendations
**File**: `screenshot_03_courses.png`
**Caption**: "AI-powered course recommendations"
**Shows**:
- Smart Match tab selected
- Gap analysis summary card
- Top recommended courses with efficiency scores
- Multi-state coverage indicators

### 4. Certificate Upload
**File**: `screenshot_04_certificates.png`
**Caption**: "Digitize your CME certificates"
**Shows**:
- Certificate gallery view
- Upload button
- Certificate details
- Credit tracking

### 5. AI Assistant
**File**: `screenshot_05_assistant.png`
**Caption**: "Get expert CME guidance"
**Shows**:
- Chat interface
- Example conversation about renewals
- Helpful suggestions
- Professional tone

### 6. (Optional) Profile & Settings
**File**: `screenshot_06_profile.png`
**Caption**: "Your professional profile"
**Shows**:
- User profile card
- Subscription status
- Settings options
- Logout button

---

## Screenshot Design Guidelines

### Visual Style
- Use the app's actual UI (no mockups)
- Ensure demo data looks realistic
- Show the app in "light mode"
- Capture at highest device resolution

### Text Overlays (Optional but Recommended)
- Add brief captions above each screenshot
- Use CME Agent brand colors:
  - Primary Gold: #C4A574
  - Navy: #1a365d
  - Background: #FAF8F5
- Font: System font or Arial, bold
- Keep text under 40 characters

### Do's and Don'ts

**DO:**
- Show real app functionality
- Include diverse license states (TX, CA, NY)
- Show the urgency indicators (red/yellow borders)
- Highlight the AI features

**DON'T:**
- Include personal/real user data
- Show error states or loading screens
- Use placeholder text like "Lorem ipsum"
- Include device status bars with low battery

---

## Generating Screenshots

### Option 1: Simulator Screenshots (Recommended)

```bash
# iOS Simulator
xcrun simctl io booted screenshot screenshot.png

# Android Emulator
adb exec-out screencap -p > screenshot.png
```

### Option 2: Physical Device

1. Open app on device
2. Navigate to desired screen
3. Take screenshot:
   - **iPhone**: Side button + Volume Up
   - **Android**: Power + Volume Down

### Option 3: Expo Go

```bash
# Run app in development
npx expo start

# Take screenshots from Expo Go app
```

---

## Additional Required Assets

### App Icon
- **Size**: 1024 × 1024 px (no transparency for iOS)
- **Location**: `assets/icon.png`
- **Status**: ✅ Already configured in app.json

### Feature Graphic (Google Play only)
- **Size**: 1024 × 500 px
- **Purpose**: Promotional banner on Play Store
- **Suggested content**: App logo + tagline + medical imagery

### Promotional Video (Optional)
- **Length**: 15-30 seconds
- **Resolution**: 1080p minimum
- **Content**: App walkthrough showing key features

---

## App Store Metadata

### App Name
**iOS**: CME Agent (30 char max)
**Android**: CME Agent - Medical License & CME Tracker (50 char max)

### Subtitle (iOS only)
"Medical License & CME Tracker" (30 char max)

### Short Description (Android)
"Track medical licenses and CME credits with AI-powered recommendations" (80 char max)

### Keywords (iOS)
`CME, continuing medical education, medical license, CE credits, physician, nurse practitioner, PA, healthcare, renewal, tracker`

### Category
- **Primary**: Medical
- **Secondary**: Education / Productivity

---

## Checklist Before Submission

- [ ] 5+ screenshots per required device size
- [ ] Screenshots show actual app functionality
- [ ] Demo data looks professional and realistic
- [ ] Captions are clear and compelling
- [ ] App icon is 1024x1024 with no transparency
- [ ] Feature graphic created (Android)
- [ ] All text is spelled correctly
- [ ] No copyrighted imagery used
- [ ] Screenshots match current app version
