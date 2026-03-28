# MigraineScan — Product Requirements Document

**Version:** 1.0  
**Status:** Approved for build  
**Platform:** iOS first  
**Build target:** Claude Code one-shot implementation

---

## 1. Product Vision

MigraineScan is an educational food label scanner for people who want help identifying common migraine-related food triggers in packaged foods.

It helps users:
- scan a food barcode quickly
- detect common migraine trigger ingredients
- understand why an ingredient may matter
- personalize results based on their own sensitivities
- reduce uncertainty in grocery and packaged-food decisions

MigraineScan does not diagnose, treat, or predict migraines. It is a conservative, educational decision-support tool for packaged food labels.

### Product tagline
**Reduce uncertainty before you eat.**

---

## 2. Problem Statement

Many people who are prone to migraines suspect that some packaged foods or ingredients worsen their symptoms, but label reading is difficult in real time.

Current problems:
- ingredient lists are long, technical, and easy to misread
- migraine trigger information online is inconsistent and often too generic
- most migraine apps focus on tracking attacks, not in-store food decisions
- generic food scanners do not personalize for migraine trigger sensitivities
- people need fast, low-cognitive-load guidance, not research homework in the grocery aisle

MigraineScan fills this gap by making common trigger detection faster, clearer, and more explainable.

---

## 3. Product Positioning

### Category
Condition-specific food scanner

### Positioning statement
For people who want to make more confident packaged-food choices around migraines, MigraineScan is a barcode-based label scanner that detects common migraine trigger ingredients and explains them in plain language. Unlike generic health apps or migraine journals, it is optimized for fast, conservative, in-the-moment label literacy.

### Experience pillars
- Calm
- Clear
- Conservative
- Explainable
- Low-stimulation
- Honest about uncertainty

---

## 4. Goals

### Primary goals
- Ship a working iOS app that scans barcodes and classifies products using migraine trigger logic
- Support user personalization by trigger and sensitivity level
- Keep the first-scan experience fast and easy
- Build trust through clear explanations and conservative language
- Convert users from one free lifetime scan to a premium subscription

### Secondary goals
- Store premium scan history with stable historical snapshots
- Establish a reusable migraine-specific scoring engine
- Launch with App Store-safe health language and subscription flows

---

## 5. Non-Goals

v1 will not include:
- symptom logs
- migraine diary
- medication tracking
- wearable integrations
- fresh produce scanning
- manual ingredient entry
- AI-generated dietary advice
- social/community features
- Android support
- annual subscription
- doctor dashboards
- HealthKit integration

---

## 6. Target Users

### Primary audience
Adults who:
- experience migraines or suspect food-triggered migraines
- buy packaged foods
- want simple help interpreting ingredient labels
- prefer actionable guidance over extensive tracking

### Secondary audience
- caregivers buying for someone with migraines
- recently diagnosed or self-educating users
- “just exploring” users who are not sure of their trigger pattern yet

---

## 7. Core Personas

### Persona 1 — Diagnosed and cautious
A user who has migraines diagnosed by a clinician and has been told to watch possible food triggers. They want a practical tool that helps them shop faster and with less anxiety.

### Persona 2 — Suspected food-trigger migraines
A user who notices patterns but is not sure which ingredients matter. They want a conservative screening tool and education.

### Persona 3 — Just exploring
A health-conscious user who is not sure food is a trigger, but wants a simple way to learn without reading every label manually.

### Persona 4 — Caregiver/shopper
Someone shopping for a spouse, partner, parent, or child who deals with migraines and wants clearer packaged-food choices.

---

## 8. Jobs To Be Done

| Job | Situation | Desired outcome |
|---|---|---|
| “Scan this product and help me decide” | In store or at home before eating | Fast, understandable result |
| “Explain why this ingredient is being flagged” | After a result | Build trust and understanding |
| “Tailor the app to my triggers” | During setup or later in profile | More relevant verdicts |
| “See what I scanned before” | Premium use at home | Quick access to past decisions |
| “Know whether the app is guessing” | On uncertain products | Visible confidence and data completeness |

---

## 9. Core Product Decisions

These are locked for v1:
- App name: `MigraineScan`
- Auth required before scan
- No guest mode
- Email/password + Apple Sign In
- Onboarding happens after successful account creation for new users
- 1 free scan for lifetime of free account
- History is premium-only
- Personalization is free
- Standalone RevenueCat project and entitlement
- Conservative scoring bias
- Historical results preserve trigger profile snapshot at scan time
- Caffeine defaults to mild REVIEW-level concern

---

## 10. User Journey

### New user
1. Download app
2. Open app
3. Sign up
4. Complete personalization
5. Scan first product
6. See result
7. Use up free scan
8. Hit paywall on next attempt to scan

### Returning free user
1. Open app
2. View account, update profile
3. Tap scan
4. Redirect to paywall because free scan has already been used

### Returning premium user
1. Open app
2. Scan freely
3. View history
4. Adjust profile if needed

---

## 11. Personalization

### Profile mode options
- Doctor-diagnosed migraines
- Suspected food-trigger migraines
- Just exploring

### v1 trigger set
1. Tyramine
2. Histamine
3. MSG / Glutamates
4. Nitrates / Nitrites
5. Artificial Sweeteners
6. Caffeine
7. Alcohol

### Per-trigger sensitivity options
- None
- Mild
- Moderate
- High
- Not sure / unknown

### Personalization product behavior
- Users should be encouraged to complete personalization
- Personalization can be skipped in parts, but incomplete profiles should trigger a nudge and conservative scoring modifier
- The app should say that more complete profile details improve accuracy
- The app should never block the user with guilt-heavy prompts

---

## 12. Core Features

### P0 — Must ship
- Firebase auth
- Sign up / sign in
- Apple Sign In
- Trigger profile onboarding
- Barcode scanner
- OpenFoodFacts lookup
- Preprocessing pipeline
- Trigger matching and scoring
- SAFE / REVIEW / AVOID verdict
- Confidence + trigger explanation UI
- 1 free lifetime scan limit
- RevenueCat paywall
- Premium entitlement check
- Profile screen
- Disclaimer screen
- Crash reporting
- Basic analytics hooks

### P1 — Strongly preferred
- Premium scan history
- Restore purchases
- Profile update flow
- Result history detail
- Empty/error/loading states on all screens
- “complete your profile” result nudge

### Future
- Re-score old scans
- Manual ingredient search
- Annual subscription
- Android
- Attack diary
- Export/share history
- Better caching
- Custom product pages

---

## 13. Success Metrics

### Acquisition
- App Store conversion from product page
- branded and problem-intent keyword discovery

### Activation
- sign-up completion rate
- onboarding completion rate
- time to first scan
- first result view rate

### Monetization
- paywall view to purchase conversion
- purchase completion
- restore success rate
- revenue per active user

### Engagement
- repeat opens
- profile completion rate
- premium history engagement
- support tickets related to confusing results

### Trust / quality
- crash-free sessions
- scan success rate
- low percentage of “wrong result” complaints
- App Store rating

---

## 14. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| OpenFoodFacts product coverage gaps | High | Clear not-found and no-ingredients UX |
| Users interpret results as medical advice | High | Repeated disclaimer and cautious wording |
| False negatives reduce trust | High | Conservative scoring bias and data completeness notes |
| Subscription friction hurts monetization | Medium | Simple paywall, restore purchases, clear value proposition |
| Incomplete personalization reduces perceived quality | Medium | Result nudges and strong onboarding copy |
| Similarity to sister apps feels too template-like | Medium | Distinct visual system and migraine-specific logic |
| Native flow issues in Expo Go | Medium | Use development builds for native features |

---

## 15. App Store / Policy Guidance

The app must be presented as:
- educational
- informational
- not diagnostic
- not a substitute for clinician advice

All product copy must avoid:
- guaranteed outcomes
- medical certainty
- “safe for migraine sufferers”
- “doctor approved”

The app must have:
- visible disclaimer during onboarding
- visible disclaimer on results
- visible disclaimer in account/about
- clear subscription terms
- restore purchases
- working sign-in flow for review

---

## 16. Pricing and Monetization

### Free
- account creation
- personalization
- exactly 1 lifetime scan
- no premium history

### Premium
- unlimited scans
- scan history
- future premium features can be added under same entitlement

### RevenueCat
- standalone app project
- one entitlement
- one monthly subscription for v1

---

## 17. Key UX Principles

- low-stimulation visual design
- one obvious CTA per screen
- result first, details second
- explanations should be expandable but not overwhelming
- users should understand what happened in under 5 seconds
- every network-dependent flow needs a recovery path

---

## 18. Open Questions That Are Already Resolved

These are resolved; do not reopen during implementation:
- free scan limit is not daily
- profile changes do not rewrite history
- auth happens before personalization
- no guest mode
- keep current scope to packaged foods only
