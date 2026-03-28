# MigraineScan — CLAUDE.md

This file is the master build brief for Claude Code. Read it first, then execute the project in the order described here.

MigraineScan is an iOS-first React Native / Expo food scanner app for people who want to identify common migraine-related food triggers from packaged foods. Users scan a barcode, the app fetches product data from OpenFoodFacts, runs a client-side preprocessing + scoring pipeline, and shows a conservative, educational verdict.

**MigraineScan is an educational label-literacy tool. It is not a medical device, diagnostic tool, treatment advisor, or symptom tracker.**

---

## 1. Non-Negotiable Product Guardrails

### Scope
MigraineScan helps users:
- scan packaged foods by barcode
- detect common migraine-related trigger ingredients
- understand why a trigger was flagged
- personalize detection based on their trigger sensitivities
- store past scan results
- subscribe for unlimited scanning and history

MigraineScan does **not**:
- diagnose migraines
- predict whether a user will definitely get a migraine
- tell users what medication to take
- track symptoms, attacks, pain scores, or medication doses
- provide AI-generated medical advice
- claim a food is universally “safe”

### Health language rules
Always write copy with these constraints:
- Prefer: “may be a trigger,” “commonly reported trigger,” “based on your profile,” “no common triggers detected in our database”
- Never say: “migraine-safe,” “this will trigger a migraine,” “medically approved,” “doctor recommended”
- SAFE means: no common triggers detected in our database
- REVIEW means: contains one or more ingredients that may be migraine triggers for some people
- AVOID means: contains multiple or stronger migraine trigger signals based on the app’s database and the user’s profile

### Product promise
The app’s emotional promise is:
> Reduce uncertainty before you eat.

The app should feel calm, clear, trustworthy, and slightly clinical without being cold.

---

## 2. Project Summary

### App name
**MigraineScan**

### Platform
- iOS only for v1
- Expo SDK 55
- EAS development and production builds
- Expo Go may be used for some UI iteration, but native-integrated flows must be tested in development builds on a physical iPhone

### Tech stack
- React Native + Expo
- TypeScript strict mode
- React Navigation v7
- Firebase Authentication
  - email/password
  - Apple Sign In via Expo Apple Authentication
- Firestore
- RevenueCat React Native SDK
- OpenFoodFacts public API
- expo-camera
- Firebase Crashlytics via React Native Firebase in development/production builds
- Firebase Analytics or event logging hooks kept lightweight and optional
- React Context provider pattern only; no Redux/Zustand

### Monetization
- 1 free scan for the lifetime of a free account
- after that, upgrade required for any additional scans
- history is premium-only
- personalization is free
- no guest mode
- users must sign up or sign in before scanning

---

## 3. High-Level Architecture

Preserve the strongest ThyraScan conventions:
- providers at the app root
- all domain logic in `src/logic/`
- no business logic in screens
- strict separation between:
  1. ingredient database
  2. preprocessing
  3. matcher
  4. scoring
  5. verdict generation
- result screen only receives structured output; it never re-scores

### Root providers in `App.tsx`
1. `SafeAreaProvider`
2. `AuthProvider`
3. `SubscriptionProvider`
4. `UserProfileProvider`
5. `NavigationContainer`

### Folder structure
```text
src/
├── firebase/
│   ├── config.ts
│   ├── auth.ts
│   ├── firestore.ts
│   ├── analytics.ts
│   └── crashlytics.ts
├── services/
│   ├── openFoodFacts.ts
│   └── revenueCat.ts
├── logic/
│   ├── ingredientDatabase.ts
│   ├── preprocessor.ts
│   ├── ingredientMatcher.ts
│   ├── scoringEngine.ts
│   ├── verdictGenerator.ts
│   ├── scanLimiter.ts
│   └── profileDefaults.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useSubscription.ts
│   ├── useUserProfile.ts
│   └── useScanLimit.ts
├── navigation/
│   ├── AppNavigator.tsx
│   ├── AuthStack.tsx
│   ├── OnboardingStack.tsx
│   ├── MainTabNavigator.tsx
│   └── RootStackParamList.ts
├── screens/
│   ├── auth/
│   ├── onboarding/
│   ├── main/
│   └── modals/
├── components/
│   ├── common/
│   ├── result/
│   ├── onboarding/
│   └── paywall/
├── styles/
│   └── theme.ts
└── types/
    └── index.ts
```

---

## 4. Canonical User Flow

### First-time user
1. Launch app
2. Authentication screen
3. Create account or sign in
4. If new account and onboarding not complete:
   - Welcome / Intro
   - Profile mode select
   - Trigger selection
   - Sensitivity per trigger
   - How it works / disclaimer
5. Home / Scan tab
6. Scan barcode
7. View result
8. If free scan already used, scanner entry point redirects to paywall

### Returning user
1. Launch app
2. Auth restored
3. If onboarding completed, land on Home
4. Can scan if premium or free scan unused
5. Can view Account
6. History only if premium

### Existing authenticated user who skipped some profile details
- They can still use the app
- The app applies conservative defaults
- Result screen and Account screen should nudge them to complete trigger sensitivities for better tailoring

---

## 5. Screen Inventory

### Auth stack
- `WelcomeAuthScreen`
- `SignUpScreen`
- `SignInScreen`
- `ForgotPasswordScreen` (lightweight, optional if time allows)
- `AuthLoadingScreen`

### Onboarding stack
- `OnboardingIntroScreen`
- `ProfileModeScreen`
- `TriggerSelectionScreen`
- `TriggerSensitivityScreen`
- `HowItWorksScreen`

### Main app
- `HomeScreen`
- `ScannerScreen`
- `ResultScreen`
- `HistoryScreen`
- `ProfileScreen`
- `DisclaimerScreen`
- `PaywallScreen`
- `NotFoundProductScreen` or shared error state modal
- `NoIngredientDataScreen` or shared message state modal

### Tabs
- Scan
- History
- Account

### Modal presentations
- Scanner
- Paywall

---

## 6. Personalization Model

### Profile mode options
- `doctor_diagnosed`
- `suspected_food_trigger`
- `just_exploring`

### Trigger set (v1 max 7)
1. Tyramine
2. Histamine
3. MSG / Glutamates
4. Nitrates / Nitrites
5. Artificial Sweeteners
6. Caffeine
7. Alcohol

### Per-trigger sensitivity choices
- `none`
- `mild`
- `moderate`
- `high`
- `unknown`

Use `unknown` as the default when the user did not set a trigger explicitly.

### Personalization rules
- Users should be encouraged to complete personalization
- Personalization is technically skippable to avoid forcing health disclosures, but the UI should strongly encourage completion
- Incomplete personalization should increase conservative weighting, not hide risk
- Historical scans should preserve the trigger profile snapshot used at the time of scanning
- If the user updates their profile later, past scans remain unchanged
- Result detail may show:
  - “This result reflects your profile at the time of scan.”
- Do not automatically re-score history
- Re-scoring can be a future feature but is out of scope for v1

---

## 7. Scoring Philosophy

There are **three separate output concepts**:

### Trigger-level severity
- `mild`
- `moderate`
- `significant`

### Trigger-level confidence
- `low`
- `medium`
- `high`

### Product-level verdict
- `SAFE`
- `REVIEW`
- `AVOID`

These are not interchangeable.

### Conservative bias rules
- If the app is unsure, bias upward to a more cautious classification
- If user profile is incomplete, add a conservative modifier
- If multiple mild triggers are present, escalate to REVIEW
- If a trigger is strongly profile-relevant, increase weight
- Caffeine defaults to a mild REVIEW-level trigger even if the user has not explicitly selected sensitivity

### Confidence philosophy
Confidence reflects certainty of detection and mapping, not medical certainty.
Example:
- explicit “monosodium glutamate” in ingredients = high confidence
- “natural flavoring” is not enough to infer MSG = no flag
- “yeast extract” = medium confidence glutamate-related signal

---

## 8. Result Screen Rules

The result screen is the payoff. It must be calm and highly structured.

### Required elements
- product name
- brand if available
- verdict badge
- verdict message
- confidence summary
- trigger breakdown cards
- explanation cards
- data completeness note when needed
- disclaimer
- share action placeholder or button
- profile-completion nudge if sensitivities are incomplete

### Example messages
SAFE:
> No common migraine triggers were detected in our database.

REVIEW:
> Contains ingredients that may be migraine triggers for some people.

AVOID:
> Contains multiple or stronger migraine trigger signals based on your profile.

### Nudge examples
- “Add your trigger sensitivities for more tailored results.”
- “Your profile is incomplete. We’re using conservative defaults.”

Never present the nudge as guilt-inducing.

---

## 9. Firestore and External Service Rules

### Firestore writes
- writes from the scan flow must not block result navigation
- use fire-and-forget writes with `.catch()`
- if history save fails, the user still sees their result
- log failures to Crashlytics

### OpenFoodFacts
- use the public barcode endpoint
- normalize data before scoring
- handle:
  - product not found
  - missing ingredient data
  - network error
  - partial metadata
- keep a custom user agent string in requests if required by the API service expectations

### RevenueCat
- standalone app and entitlement for MigraineScan
- one premium entitlement
- monthly subscription for v1
- include restore purchases
- purchase and restore failures should show friendly retryable messaging

---

## 10. Error Handling Standards

Every screen that loads data must handle:
- loading
- empty
- error
- populated

### Scanner flow edge cases
Handle all of these explicitly:
- camera permission denied
- barcode scanned while processing another barcode
- scan limit reached before opening scanner
- product not found
- network timeout
- OpenFoodFacts service unavailable
- product exists but no ingredients
- ingredients too vague to classify confidently
- Firestore history save failure
- RevenueCat entitlement fetch failure

### Non-blocking principles
- no Firestore write should block result navigation
- non-critical logging failures should never crash the app
- paywall data failure should still show a basic purchase CTA with retry
- profile load failure should route the user to a recoverable account state, not a blank screen

---

## 11. Analytics and Crash Reporting

### Crashlytics
Required. Log:
- scanner failures
- Firestore write failures
- OpenFoodFacts service failures
- purchase failures
- auth failures
- profile save failures

### Analytics events
Implement hooks for:
- `auth_signup_started`
- `auth_signup_completed`
- `auth_signin_completed`
- `onboarding_started`
- `onboarding_completed`
- `profile_mode_selected`
- `trigger_profile_saved`
- `scan_button_tapped`
- `scan_success`
- `scan_product_not_found`
- `scan_missing_ingredients`
- `scan_limit_hit`
- `result_viewed`
- `paywall_viewed`
- `purchase_started`
- `purchase_completed`
- `purchase_restore_started`
- `purchase_restore_completed`

Keep analytics wrappers minimal and easy to disable.

---

## 12. Build Strategy for Claude Code

Your job is to generate the majority of this app in one pass. Do not over-optimize abstractions. Build the app in a way that is clean, reliable, and highly implementable.

### Priority order
1. types
2. theme
3. firebase config wrappers
4. external services
5. pure logic pipeline
6. providers/hooks
7. navigation
8. auth screens
9. onboarding screens
10. main screens
11. reusable components
12. polish

### Rules
- produce production-grade TypeScript
- no `any`
- no placeholder TODO comments unless the task truly requires credentials
- when credentials are required, leave exact environment variable names
- prefer simple, explicit code over clever abstractions
- do not invent features beyond scope
- do not add symptom tracking, journaling, or AI advice
- do not introduce a backend server
- keep all scoring logic on device

---

## 13. Exact Decisions Already Made

Do not revisit these unless explicitly told:
- app name is `MigraineScan`
- no guest mode
- auth required before scanning
- personalization is free
- history is premium-only
- free users get exactly 1 lifetime scan
- profile is captured after successful account creation for new users
- returning users go straight into the app if onboarding is complete
- caffeine defaults to mild REVIEW-level concern
- historical scan results preserve the trigger profile used at scan time
- app should be visually softer and cooler than ThyraScan, but clearly distinct
- use a cool indigo / slate / mist design system, not purple
- app is iOS-only for v1

---

## 14. Prompting Instructions for Claude Code

When implementing, follow this sequence as separate internal work phases even if you generate many files in one run.

### Phase 1 — Foundation
Create:
- `src/types/index.ts`
- `src/styles/theme.ts`
- `src/firebase/config.ts`
- `src/firebase/auth.ts`
- `src/firebase/firestore.ts`
- `src/firebase/analytics.ts`
- `src/firebase/crashlytics.ts`
- `src/services/openFoodFacts.ts`
- `src/services/revenueCat.ts`

### Phase 2 — Core logic
Create:
- `src/logic/ingredientDatabase.ts`
- `src/logic/preprocessor.ts`
- `src/logic/ingredientMatcher.ts`
- `src/logic/scoringEngine.ts`
- `src/logic/verdictGenerator.ts`
- `src/logic/scanLimiter.ts`
- `src/logic/profileDefaults.ts`

### Phase 3 — Providers and navigation
Create:
- `src/hooks/useAuth.ts`
- `src/hooks/useSubscription.ts`
- `src/hooks/useUserProfile.ts`
- `src/hooks/useScanLimit.ts`
- `src/navigation/RootStackParamList.ts`
- `src/navigation/AuthStack.tsx`
- `src/navigation/OnboardingStack.tsx`
- `src/navigation/MainTabNavigator.tsx`
- `src/navigation/AppNavigator.tsx`

### Phase 4 — Shared components
Create:
- loading spinner
- error card
- empty state
- scan button
- barcode overlay
- verdict badge
- trigger breakdown card
- confidence pill
- profile nudge card
- paywall feature row
- settings row
- disclaimer card

### Phase 5 — Screens
Create all screens listed in Section 5 with realistic UX states and copy.

### Phase 6 — App root and config
Create:
- `App.tsx`
- `app.config.ts`
- environment variable access
- package setup notes if needed

---

## 15. Coding Standards

- TypeScript strict mode only
- Styles via `StyleSheet.create`
- use theme tokens only, no magic numbers
- all shared types live in `src/types/index.ts`
- keep side effects out of pure logic files
- keep hooks thin; business logic belongs in `src/logic/`
- avoid raw `console.log`
- use `console.warn` / `console.error` only when necessary
- gate debug logging with `__DEV__`
- all async code must use try/catch or `.catch()`

---

## 16. Testing Standards

Build with testability in mind.

### Logic tests to make easy later
- preprocessing normalization
- alias mapping
- ingredient matching
- score calculation
- verdict generation
- scan limit decisions

### Manual QA paths that must work
- sign up with email/password
- sign in existing account
- Apple Sign In on device
- onboarding completion
- skip some sensitivities and still scan
- first free scan
- paywall after free scan consumed
- premium unlock
- restore purchases
- barcode success
- product not found
- missing ingredients
- network failure
- history locked when free
- history visible when premium
- change profile after scans; historical snapshots remain stable

---

## 17. Related Documents

Use these files as the canonical supporting specs:
- `PRD.md`
- `TECHNICAL_ARCHITECTURE.md`
- `DATA_RISK_SCORING_MODEL.md`
- `PREPROCESSOR_SPEC.md`
- `UI_UX_DESIGN_SPEC.md`

If there is a conflict:
1. health-safety language
2. data model integrity
3. scoring model integrity
4. UX clarity
5. implementation convenience

That order wins.
