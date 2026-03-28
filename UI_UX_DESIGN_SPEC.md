# MigraineScan — UI / UX Design Specification

**Version:** 1.0  
**Status:** Build-ready

---

## 1. Design Philosophy

MigraineScan sits at the intersection of health anxiety, sensory sensitivity, and fast decision-making.

The design must feel:
- calm
- low-stimulation
- trustworthy
- modern
- educational
- gentle, not sleepy
- different from ThyraScan and ADHD Food Scanner

### Key differentiation rule
Do **not** make this app a purple clone of ThyraScan.

MigraineScan should feel like a sibling in the same product family, but with a more muted, cooler, lower-stimulation visual identity:
- less saturated
- more airy
- cooler color temperature
- softer contrast
- more progressive disclosure

---

## 2. Brand Identity

### Design direction
Use a **misty indigo / slate / cool blue-gray** palette.

### Color tokens
| Token | Hex | Usage |
|---|---|---|
| `colors.primary` | `#5B6EE1` | Primary CTA, active states |
| `colors.primaryDark` | `#4758C9` | Pressed primary button |
| `colors.primaryLight` | `#EEF1FF` | Light tint backgrounds |
| `colors.background` | `#FBFCFE` | Main background |
| `colors.secondaryBackground` | `#F3F6FB` | Cards, grouped sections |
| `colors.surface` | `#FFFFFF` | Elevated cards |
| `colors.textPrimary` | `#1F2A44` | Headlines and body |
| `colors.textSecondary` | `#667085` | Hints, timestamps |
| `colors.border` | `#E4EAF3` | Dividers and card strokes |
| `colors.verdictSafe` | `#2EAD6F` | SAFE |
| `colors.verdictSafeBg` | `#EAF8F0` | SAFE background |
| `colors.verdictReview` | `#C27A1A` | REVIEW |
| `colors.verdictReviewBg` | `#FFF4DF` | REVIEW background |
| `colors.verdictAvoid` | `#D25A5A` | AVOID |
| `colors.verdictAvoidBg` | `#FDEEEE` | AVOID background |
| `colors.error` | `#D64545` | destructive actions only |
| `colors.white` | `#FFFFFF` | white |
| `colors.black` | `#000000` | black |

### Why this system
- distinct from ThyraScan purple
- calmer and more sensory-friendly
- still premium and health-adjacent
- enough contrast for accessibility without harshness

---

## 3. Typography

Use system font / SF Pro.

### Scale
- Hero headline: 30
- Screen title: 26
- Section title: 20
- Body: 16
- Secondary body: 14
- Microcopy / labels: 12

### Weights
- Hero / titles: 700 to 800
- Body: 400 to 500
- Labels / pills: 600 to 700
- Verdict chips: 800 with slight letter spacing

---

## 4. Spacing and Shape

### Spacing scale
- xs: 4
- sm: 8
- md: 16
- lg: 24
- xl: 32
- xxl: 40

### Radius scale
- sm: 10
- md: 14
- lg: 18
- xl: 22

### Card style
- white surface
- soft border
- light shadow
- radius 18
- padding 16 to 20

### Buttons
- height 56
- full width primary CTA on key screens
- radius 16
- clear pressed state
- no aggressive gradients

---

## 5. Motion and Interaction Tone

Keep motion gentle:
- standard native transitions
- no flashy animations
- subtle loading states
- avoid abrupt attention-grabbing motion

Scanner and result should feel efficient, not playful.

---

## 6. Information Architecture

```text
MigraineScan
├── Auth
│   ├── WelcomeAuth
│   ├── SignUp
│   ├── SignIn
│   └── ForgotPassword
├── Onboarding
│   ├── Intro
│   ├── ProfileMode
│   ├── TriggerSelection
│   ├── TriggerSensitivity
│   └── HowItWorks
└── Main App
    ├── Tab: Scan
    ├── Tab: History
    ├── Tab: Account
    ├── Scanner (modal)
    ├── Result
    ├── Paywall (modal)
    └── Disclaimer
```

---

## 7. Screen Specifications

## 7.1 Welcome / Auth Entry
Purpose:
- quick explanation
- sign up or sign in

Layout:
- small wordmark
- hero headline
- one-sentence supporting copy
- primary CTA: Create Account
- secondary CTA: Sign In
- tiny disclaimer footer link or text

Suggested headline:
**Scan packaged foods for common migraine triggers**

Supporting copy:
**Get a fast, conservative ingredient review tailored to your sensitivities.**

---

## 7.2 Sign Up
Fields:
- email
- password
- confirm password

Buttons:
- Create Account
- Continue with Apple

Notes:
- keep simple
- no extra profile fields here
- after successful account creation, go to onboarding

---

## 7.3 Sign In
Fields:
- email
- password

Buttons:
- Sign In
- Continue with Apple
- Forgot Password

---

## 7.4 Onboarding Intro
Purpose:
- explain value before asking for personalization

Layout:
- soft icon or simple illustration
- title
- three feature bullets
- CTA

Suggested copy:
Title:
**Reduce uncertainty before you eat**

Feature bullets:
- Scan packaged foods in seconds
- Detect common migraine trigger ingredients
- Personalize results to your sensitivities

---

## 7.5 Profile Mode Screen
Purpose:
- frame the app around user context

Options:
- Doctor-diagnosed migraines
- Suspected food-trigger migraines
- Just exploring

UI:
- large selectable cards
- equal visual weight
- not judgmental
- support text under each option

---

## 7.6 Trigger Selection Screen
Purpose:
- select which trigger groups matter most

Display all 7 trigger groups in grouped cards or selectable rows.

Copy:
**Select the trigger types you want us to pay closest attention to.**

Secondary text:
**You can update these later in Account. If you skip any, we’ll use conservative defaults.**

---

## 7.7 Trigger Sensitivity Screen
Purpose:
- collect per-trigger sensitivity

UI:
- one row per trigger
- segmented control, chips, or tap-to-cycle cards
- choices: None / Mild / Moderate / High / Not Sure

This screen must feel manageable, not like a settings spreadsheet.

Recommendation:
- stacked cards
- each card contains trigger name + short helper text + horizontally scrollable chips

---

## 7.8 How It Works / Disclaimer Screen
Purpose:
- set expectations and reduce App Store risk

Include:
- scan barcode
- we analyze ingredients
- you get SAFE / REVIEW / AVOID plus explanations
- disclaimer card

Minimum disclaimer text:
**MigraineScan is an educational tool. It is not a medical device and does not provide medical advice. Food triggers vary by person. Always consult a qualified healthcare professional about dietary choices related to migraines.**

CTA:
- Finish Setup

---

## 7.9 Home Screen
Purpose:
- daily driver

Layout:
- wordmark small at top
- profile-completion indicator if incomplete
- large centered scan area graphic
- primary button: Scan Food
- scan eligibility text below
- if free scan already used and not premium, button copy becomes Upgrade to Scan

Examples:
- free with scan available: `1 free scan available`
- free with no scans left: `Your free scan has been used`
- premium: `Premium active — unlimited scans`

The screen should have one obvious action.

---

## 7.10 Scanner Screen
Purpose:
- barcode capture

Requirements:
- full-screen camera
- barcode overlay
- close button
- instruction text
- processing overlay after barcode detect

States:
- permission needed
- scanning
- processing
- error overlay
- no ingredient data overlay

Instruction copy:
**Align barcode within frame**

---

## 7.11 Result Screen
Purpose:
- the payoff

Layout order:
1. Product card
2. Large verdict badge
3. Verdict message
4. Confidence + data completeness row
5. Profile nudge card if incomplete
6. Trigger breakdown cards
7. Disclaimer card
8. Share / done action

### Trigger breakdown card structure
- trigger name
- severity pill
- confidence pill
- short explanation
- optional caveat
- optional “based on your profile” label

### Confidence row examples
- `Confidence: High`
- `Confidence: Medium`
- `Ingredient data may be incomplete`

### Nudge card example
**Complete your trigger sensitivities for more tailored results. We’re using conservative defaults right now.**

---

## 7.12 History Screen
Purpose:
- premium feature

Premium state:
- list of past scans
- product name
- verdict badge
- timestamp

Free state:
- premium gate card
- explanation of value
- CTA to upgrade

Empty state:
- icon
- “No scans yet”
- supporting text
- button back to scan

---

## 7.13 Profile Screen
Purpose:
- account management and settings

Sections:
- user email
- plan status
- upgrade card if free
- trigger profile settings
- profile mode setting
- disclaimer/about
- restore purchases
- sign out
- delete account

Important:
profile editing must be easy to discover because result quality depends on it.

---

## 7.14 Paywall Screen
Purpose:
- convert after free scan or when history is tapped

Content:
- headline
- 3 feature rows
- price
- Subscribe button
- Restore Purchases
- legal subscription text
- Privacy / Terms links

Suggested feature bullets:
- Unlimited food scans
- Full scan history
- Tailored migraine trigger detection

Keep it calm and premium, not aggressive.

---

## 7.15 Disclaimer Screen
Purpose:
- full readable explanation of app scope

Content sections:
1. what MigraineScan is
2. what it is not
3. how trigger detection works
4. limits of barcode/product databases
5. personalization and uncertainty
6. subscription/support/contact
7. app version

---

## 8. Microcopy Rules

Always:
- say “may”
- say “commonly reported”
- acknowledge individual variation
- keep explanations short

Never:
- imply diagnosis
- imply certainty
- imply treatment
- use fear-heavy copy

### Good examples
- “Contains ingredients that may be migraine triggers for some people.”
- “No common migraine triggers were detected in our database.”
- “We’re using conservative defaults because your profile is incomplete.”

### Bad examples
- “Safe for migraines”
- “This will trigger a migraine”
- “Dangerous”
- “Approved”

---

## 9. Accessibility and Cognitive Load

### Rules
- strong readable contrast without harsh saturation
- avoid dense paragraphs
- one primary CTA per screen
- cards should chunk information clearly
- result details should be scannable in under 5 seconds
- use progressive disclosure for caveats and longer explanations

This audience may be dealing with:
- light sensitivity
- cognitive fatigue
- stress and uncertainty

The interface must respect that.

---

## 10. Similarity / Differentiation Guidance

Keep from ThyraScan:
- calm trust
- strong hierarchy
- simple scan flow
- one obvious CTA
- well-structured results

Improve beyond ADHD app:
- better information architecture
- more refined visual rhythm
- richer result reasoning
- stronger premium polish

Different from ThyraScan by:
- palette
- screen density
- result emphasis
- profile personalization depth

Do not ship a recolor.
