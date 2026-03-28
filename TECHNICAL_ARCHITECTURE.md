# MigraineScan — Technical Architecture

**Version:** 1.0  
**Status:** Build-ready

---

## 1. Architecture Overview

MigraineScan is an iOS-first Expo / React Native app with Firebase for auth + data, RevenueCat for subscriptions, OpenFoodFacts for product lookup, and a client-side trigger classification pipeline.

### Design principles
- no custom backend for v1
- all trigger scoring runs on device
- no scoring logic in screens
- typed contracts between every layer
- fire-and-forget persistence from scan flow
- stable historical snapshots
- conservative health-language handling

### Stack
- Expo SDK 55
- React Native
- TypeScript strict mode
- React Navigation v7
- Firebase JS SDK for Auth + Firestore
- React Native Firebase Crashlytics for native crash reporting in dev/prod builds
- Expo Apple Authentication
- expo-camera
- RevenueCat React Native SDK
- EAS Build / Submit

---

## 2. Recommended Setup Decisions

### Firebase setup
Use:
- Firebase modular JS SDK for Authentication and Firestore
- React Native Firebase only for Crashlytics if needed in native builds

Rationale:
- simplest and most standard for Expo-managed auth + Firestore
- reliable with EAS development and production builds
- avoids overcomplicating app data access
- still supports native crash reporting

### Navigation
Use:
- root native stack
- auth stack
- onboarding stack
- main bottom tabs
- scanner and paywall as modal stack screens

Rationale:
- clean gating
- matches ThyraScan pattern
- easy to reason about with auth/onboarding states

### State management
Use provider/context only:
- `AuthProvider`
- `SubscriptionProvider`
- `UserProfileProvider`
- `ScanLimitProvider` can be omitted if hook-based from profile/subscription is simpler

No external global state library.

---

## 3. App Bootstrap Flow

At app launch:
1. initialize Firebase
2. initialize RevenueCat
3. resolve auth state
4. if authenticated:
   - load user profile from Firestore
   - fetch premium entitlement
5. decide route:
   - unauthenticated -> auth stack
   - authenticated with incomplete onboarding -> onboarding stack
   - authenticated with completed onboarding -> main app

### Important loading rule
Do not show the main app until:
- auth state is known
- profile load has finished
- entitlement check has either finished or failed gracefully

Use a single `AuthLoadingScreen` or root loading screen.

---

## 4. Folder Structure

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
│   ├── RootStackParamList.ts
│   ├── AppNavigator.tsx
│   ├── AuthStack.tsx
│   ├── OnboardingStack.tsx
│   └── MainTabNavigator.tsx
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

## 5. Data Models

### User document
Path: `/users/{userId}`

```ts
interface UserProfileDoc {
  id: string;
  email: string | null;
  authProvider: "password" | "apple";
  createdAt: Timestamp;
  updatedAt: Timestamp;

  onboardingCompleted: boolean;
  profileMode: "doctor_diagnosed" | "suspected_food_trigger" | "just_exploring" | null;

  triggerProfile: {
    tyramine: "none" | "mild" | "moderate" | "high" | "unknown";
    histamine: "none" | "mild" | "moderate" | "high" | "unknown";
    msg_glutamates: "none" | "mild" | "moderate" | "high" | "unknown";
    nitrates_nitrites: "none" | "mild" | "moderate" | "high" | "unknown";
    artificial_sweeteners: "none" | "mild" | "moderate" | "high" | "unknown";
    caffeine: "none" | "mild" | "moderate" | "high" | "unknown";
    alcohol: "none" | "mild" | "moderate" | "high" | "unknown";
  };

  personalizationCompletion: {
    selectedAnyTriggers: boolean;
    sensitivityCountCompleted: number;
    isCompleteEnoughForTailoredResults: boolean;
  };

  subscriptionStatus: "free" | "premium" | "unknown";
  entitlementActive: boolean;

  lifetimeFreeScansUsed: number; // 0 or 1 for v1
  lastScanAt: Timestamp | null;
}
```

### Scan history document
Path: `/scan_history/{scanId}`

```ts
interface ScanHistoryDoc {
  id: string;
  userId: string;
  barcode: string;
  productName: string;
  brandName: string | null;
  scannedAt: Timestamp;

  verdict: "SAFE" | "REVIEW" | "AVOID";
  verdictMessage: string;

  scoreSummary: {
    totalScore: number;
    profileCompletenessModifierApplied: boolean;
    confidenceSummary: "low" | "medium" | "high";
    dataCompleteness: "complete" | "partial" | "missing_ingredients";
  };

  matchedTriggers: Array<{
    id: string;
    displayName: string;
    category: string;
    severity: "mild" | "moderate" | "significant";
    confidence: "low" | "medium" | "high";
    matchedPattern: string;
    explanation: string;
    caveat?: string;
    userSensitivityAtScan: "none" | "mild" | "moderate" | "high" | "unknown";
    weightApplied: number;
  }>;

  categoryBreakdown: Record<string, number>;

  triggerProfileSnapshot: UserProfileDoc["triggerProfile"];
  profileModeSnapshot: UserProfileDoc["profileMode"];

  sourceSnapshot: {
    ingredientTextRaw: string;
    ingredientTextNormalized: string;
    ingredientsMissing: boolean;
    openFoodFactsProductFound: boolean;
  };

  appMeta: {
    appVersion: string;
    scoringModelVersion: string;
    preprocessorVersion: string;
  };
}
```

### Why this is the right balance
Store enough to:
- debug weird results
- preserve historical explainability
- improve future scoring
- inspect what users actually saw

Do not store:
- symptom logs
- headache diaries
- medication notes
- freeform health notes

---

## 6. Navigation State Model

```text
RootStack
├── AuthStack
│   ├── WelcomeAuth
│   ├── SignUp
│   ├── SignIn
│   └── ForgotPassword
├── OnboardingStack
│   ├── OnboardingIntro
│   ├── ProfileMode
│   ├── TriggerSelection
│   ├── TriggerSensitivity
│   └── HowItWorks
└── MainTabs
    ├── Home
    ├── History
    └── Profile

Modal routes on RootStack:
- Scanner
- Result
- Paywall
- Disclaimer
```

---

## 7. Scan Flow

```text
HomeScreen
  -> tap Scan
  -> check entitlement and free scan eligibility
  -> if cannot scan: open Paywall
  -> else open Scanner

ScannerScreen
  -> request camera permission
  -> render camera preview + barcode overlay
  -> use processing mutex to avoid duplicate scans
  -> on barcode detect:
       fetch product from OpenFoodFacts
       preprocess product payload
       match triggers
       score result
       generate verdict
       asynchronously record scan usage and save history
       navigate to Result with full scoring result

ResultScreen
  -> render verdict, explanations, disclaimer, nudge
```

### Important mutex rule
Use a `processingRef` boolean or similar to prevent multiple barcode detections from firing while current work is active.

---

## 8. OpenFoodFacts Service Contract

### Service file
`src/services/openFoodFacts.ts`

### Return contract
```ts
interface ProductLookupResult {
  barcode: string;
  productFound: boolean;
  productName: string;
  brandName: string | null;
  ingredientsTextRaw: string;
  ingredientsTags?: string[];
  additivesTags?: string[];
  categoriesTags?: string[];
}
```

### Explicit error classes
- `ProductNotFoundError`
- `NetworkError`
- `ServiceUnavailableError`

### Timeout / retry
- apply a reasonable timeout
- perform one retry on transient network/service failures
- do not retry product-not-found
- log failures to Crashlytics

---

## 9. Preprocessing Pipeline

The preprocessor is a first-class layer, not a helper utility.

### Input
Raw product data from OpenFoodFacts

### Output
Normalized analysis payload for matcher/scorer:
```ts
interface PreprocessedProduct {
  barcode: string;
  productName: string;
  brandName: string | null;

  ingredientsTextRaw: string;
  ingredientsTextNormalized: string;
  ingredientTokens: string[];

  detectedAdditiveTags: string[];
  candidateTriggerMatches: CandidateTriggerMatch[];
  ambiguityFlags: string[];
  dataCompleteness: "complete" | "partial" | "missing_ingredients";

  sourceMeta: {
    productFound: boolean;
    hadIngredientsText: boolean;
    usedFallbackFields: boolean;
  };
}
```

### Responsibilities
- lowercase and normalize whitespace
- remove noisy punctuation while preserving useful separators
- normalize synonyms
- create tokens
- detect additive aliases
- attach ambiguity flags
- preserve raw ingredient text for history/debugging

---

## 10. Core Logic Layers

### `ingredientDatabase.ts`
Curated source of truth for trigger definitions.

### `preprocessor.ts`
Transforms raw product data into normalized tokens and candidate matches.

### `ingredientMatcher.ts`
Converts normalized data into matched trigger entries using pattern rules.

### `scoringEngine.ts`
Applies:
- base weights
- per-trigger severity
- confidence handling
- user sensitivity modifiers
- incomplete-profile conservative modifier
- verdict threshold calculations

### `verdictGenerator.ts`
Produces:
- final verdict
- verdict message
- confidence summary
- profile-completion nudge boolean
- display notes

No screen may bypass this pipeline.

---

## 11. Subscription Architecture

### RevenueCat service
Responsibilities:
- configure SDK
- fetch customer info
- expose entitlement active status
- purchase package
- restore purchases
- map SDK errors to friendly app-level messages

### Product assumptions
- one monthly product
- one premium entitlement

### UI behavior
- paywall visible when:
  - free scan already used
  - history tab tapped by free user
  - upgrade CTA tapped
- history list should either:
  - show premium gate screen for free users
  - or route to paywall directly

Do not create a confusing half-history experience in v1.

---

## 12. Auth Architecture

### Email/password
- sign up
- sign in
- password reset if implemented

### Apple Sign In
- supported on physical iOS device / dev/prod build
- store Apple-linked account cleanly
- if Apple email is private relay, still handle account creation with email possibly hidden

### Auth provider responsibilities
- subscribe to Firebase auth state
- expose loading flag
- expose signIn, signUp, signOut
- ensure new users get a Firestore user doc created

---

## 13. Error State Design

### Product not found
Meaning:
- barcode lookup succeeded
- product not found in OpenFoodFacts

UX:
- clear message
- retry or go back
- user should understand this is a database coverage issue, not necessarily a bad scan

### No ingredient data
Meaning:
- product exists
- no usable ingredients were provided

UX:
- distinct from product not found
- encourage checking package label directly

### Partial / uncertain data
Meaning:
- product exists
- incomplete or ambiguous ingredient info

UX:
- still show result if possible
- show lower confidence or completeness note

---

## 14. Logging and Observability

### Crashlytics
Log non-fatal events for:
- scanner permission issues
- lookup failures
- parsing failures
- malformed product payloads
- Firestore write failures
- profile save failures
- RevenueCat purchase or restore failures

### Analytics
Capture:
- auth
- onboarding
- scan
- result
- paywall
- purchase
- profile update

Do not overbuild analytics event abstraction. Keep it thin.

---

## 15. Offline / Caching Strategy

v1 recommendations:
- do not support offline new scans
- do support viewing saved history offline if previously loaded from Firestore cache
- rely on Firestore offline persistence where appropriate
- optionally cache the most recent result in local state only
- do not build an elaborate local product cache yet

---

## 16. Theme / UI Architecture

Keep all visual tokens in `src/styles/theme.ts`:
- colors
- spacing
- border radii
- typography scale
- shadows
- semantic colors for verdicts

No magic numbers inside screens unless dynamic calculation truly requires it.

---

## 17. Security / Env Setup

### Environment variables
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=
EXPO_PUBLIC_OPENFOODFACTS_USER_AGENT=

SENTRY_DSN=   # optional future
EAS_PROJECT_ID=
```

### Notes
- keep public Firebase web config in Expo public env vars
- keep RevenueCat keys in env/config, not hardcoded
- use EAS secrets where appropriate
- do not commit secrets files

---

## 18. Testing Strategy

### Manual device testing
Must test on physical iPhone:
- camera
- Apple Sign In
- RevenueCat purchase
- restore purchases

### Simulator testing
Use for:
- email auth flows
- layout
- navigation
- most account/profile flows

### Logic tests to make easy later
- matcher
- scorer
- verdict generator
- scan limiter
- preprocessing alias handling

### Regression checklist
- duplicate scan prevention
- one-time free scan limit
- paywall redirect
- incomplete profile nudge
- history lock for free user
- profile update does not mutate prior history
