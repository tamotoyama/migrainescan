# MigraineScan — Data & Risk Scoring Model

**Version:** 1.0  
**Status:** Locked for v1

---

## 1. Model Purpose

This model classifies packaged food ingredient data against a curated database of common migraine-related trigger signals and produces a structured result for MigraineScan.

It is designed for:
- explainability
- conservative classification
- user personalization
- packaged-food ingredient lists
- fast client-side execution

It is **not** designed to:
- predict a migraine event
- model dose, serving size, or cumulative dietary load
- replace clinical guidance
- assess symptom history
- make universal “safe” claims

---

## 2. Guardrails

### Core design principles
1. Conservative over permissive
2. Explainability over black box
3. User-specific weighting over generic averages
4. Visible uncertainty instead of false certainty
5. Trigger relevance, not medical certainty

### Meaning of terms
- **Severity** = how concerning a trigger signal is within the product context
- **Confidence** = how certain the app is that the signal was correctly identified and mapped
- **Verdict** = final product-level classification for the user

### Final verdict labels
- `SAFE`
- `REVIEW`
- `AVOID`

### Trigger-level severity labels
- `mild`
- `moderate`
- `significant`

### Trigger-level confidence labels
- `low`
- `medium`
- `high`

---

## 3. Trigger Taxonomy (v1)

MigraineScan v1 uses exactly 7 trigger groups.

### 1. Tyramine
Commonly associated with aged, cured, or fermented foods.

Typical ingredient signals:
- aged cheese
- cultured cheese
- cured meats
- salami
- pepperoni
- fermented soy products in certain contexts

### 2. Histamine
Commonly associated with fermented, aged, or alcohol-adjacent foods.

Typical signals:
- wine ingredients
- vinegar-heavy products in some contexts
- fermented ingredients
- aged fish products
- certain preserved items

### 3. MSG / Glutamates
Includes direct and indirect glutamate-related additives.

Typical signals:
- monosodium glutamate
- msg
- yeast extract
- hydrolyzed protein
- hydrolyzed vegetable protein
- autolyzed yeast

### 4. Nitrates / Nitrites
Commonly associated with processed meats.

Typical signals:
- sodium nitrate
- sodium nitrite
- potassium nitrate
- cured meat preservative language

### 5. Artificial Sweeteners
Primarily centered on aspartame, with related sweeteners tracked conservatively.

Typical signals:
- aspartame
- acesulfame potassium
- sucralose
- saccharin

### 6. Caffeine
Tracked by default as mild concern, even without explicit user sensitivity.

Typical signals:
- caffeine
- coffee extract
- guarana
- green tea extract in certain products
- yerba mate in stimulant products

### 7. Alcohol
Tracks explicit alcohol presence in packaged products and alcohol-forward ingredients.

Typical signals:
- wine
- red wine
- cooking wine
- rum
- bourbon
- beer
- alcohol

---

## 4. Recommended Trigger Database Shape

```ts
export type TriggerCategory =
  | "tyramine"
  | "histamine"
  | "msg_glutamates"
  | "nitrates_nitrites"
  | "artificial_sweeteners"
  | "caffeine"
  | "alcohol";

export type SeverityLevel = "mild" | "moderate" | "significant";
export type ConfidenceLevel = "low" | "medium" | "high";
export type SensitivityLevel = "none" | "mild" | "moderate" | "high" | "unknown";

export interface TriggerEntry {
  id: string;
  displayName: string;
  category: TriggerCategory;
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  patterns: string[];
  wholeWordOnly: boolean;
  explanation: string;
  caveat?: string;
  aliases?: string[];
}
```

---

## 5. Example Database Entries

```ts
{
  id: "msg_explicit",
  displayName: "Monosodium Glutamate (MSG)",
  category: "msg_glutamates",
  severity: "significant",
  confidence: "high",
  patterns: ["monosodium glutamate", "msg"],
  wholeWordOnly: true,
  explanation: "MSG is a commonly reported migraine trigger for some people and is frequently discussed in trigger-elimination diets."
}

{
  id: "yeast_extract",
  displayName: "Yeast Extract",
  category: "msg_glutamates",
  severity: "moderate",
  confidence: "medium",
  patterns: ["yeast extract", "autolyzed yeast", "hydrolyzed vegetable protein", "hydrolyzed protein"],
  wholeWordOnly: true,
  explanation: "Some glutamate-related additives are discussed as migraine triggers in sensitive individuals.",
  caveat: "This signal is less direct than explicit MSG labeling."
}

{
  id: "sodium_nitrite",
  displayName: "Nitrites",
  category: "nitrates_nitrites",
  severity: "significant",
  confidence: "high",
  patterns: ["sodium nitrite", "potassium nitrite", "nitrite"],
  wholeWordOnly: true,
  explanation: "Nitrites are a well-known concern in processed meats for people who monitor common migraine triggers."
}
```

---

## 6. Base Weighting

Recommended base score values:

| Severity | Base weight |
|---|---:|
| mild | 1.0 |
| moderate | 2.0 |
| significant | 3.5 |

### Confidence modifiers
| Confidence | Multiplier |
|---|---:|
| low | 0.85 |
| medium | 1.0 |
| high | 1.15 |

### User sensitivity modifiers
| Sensitivity | Multiplier |
|---|---:|
| none | 0.5 |
| mild | 1.0 |
| moderate | 1.25 |
| high | 1.5 |
| unknown | 1.15 |

### Caffeine rule
Caffeine gets a default baseline of **mild concern** even when user sensitivity is unknown.

---

## 7. Conservative Modifier Rules

These rules intentionally bias the system toward caution.

### Incomplete profile modifier
If the profile is not complete enough for tailored results:
- add `+0.5` to total score
- mark `profileCompletenessModifierApplied = true`

### Multiple mild triggers rule
If 2 or more mild triggers are matched, floor final verdict at `REVIEW`

### Repeated category pressure
If multiple entries from the same trigger category are matched:
- sum them
- then add a small repetition bump per additional hit in the same category

### Low-data caution rule
If ingredients data is partial or ambiguous:
- do not auto-upgrade to AVOID solely because of ambiguity
- do allow confidence summary to decrease
- add a “data may be incomplete” note

---

## 8. Suggested Verdict Thresholds

Recommended starting thresholds:

| Total score | Verdict |
|---|---|
| 0 to < 1.5 | SAFE |
| 1.5 to < 4.5 | REVIEW |
| 4.5+ | AVOID |

### Overrides
- Any significant high-confidence trigger with user sensitivity `high` should strongly trend toward `AVOID`
- Two moderate triggers with at least medium confidence should generally be `AVOID` or high `REVIEW`
- No matched triggers with complete ingredients data can be `SAFE`
- Missing ingredients data should not produce `SAFE`; instead use a neutral no-data result flow outside normal scoring if the pipeline cannot classify

---

## 9. Confidence Summary Logic

The result screen needs both trigger-level and result-level confidence.

### Trigger-level confidence
Stored per matched trigger.

### Result-level confidence summary
A simple overall value:
- `high` if most matched signals are explicit and ingredients are complete
- `medium` if signals are mixed direct/indirect
- `low` if data is incomplete or many signals are alias-based / ambiguous

This should be generated from:
- ingredient completeness
- ratio of high-confidence to medium/low confidence matches
- ambiguity flags present

---

## 10. Trigger Definitions and Guidance

### Tyramine
- likely often represented indirectly via aged/cured ingredients rather than explicit “tyramine”
- use category mapping carefully
- confidence may often be medium, not high

### Histamine
- similar to tyramine, often category-inferred
- keep explanations especially cautious
- do not overflag generic vinegar products unless the product context supports it

### MSG / Glutamates
- highest practical ROI for barcode detection
- explicit msg = high confidence
- yeast extract / hydrolyzed proteins = medium confidence

### Nitrates / Nitrites
- strong scannable category
- high confidence when explicitly listed

### Artificial Sweeteners
- aspartame should carry highest concern in this category
- sucralose / acesulfame K can still be tracked but often at lower severity unless the user selected sensitivity

### Caffeine
- mild default concern
- escalate heavily if user marked high sensitivity
- energy drinks or stimulant-forward products may accumulate multiple caffeine-pattern hits

### Alcohol
- only flag when explicit ingredient signal exists
- avoid guessing based on category names alone if ingredients do not support it

---

## 11. Recommended Severity Defaults by Trigger Type

| Trigger category | Example default severity |
|---|---|
| tyramine | moderate |
| histamine | moderate |
| msg_glutamates explicit | significant |
| msg_glutamates indirect | moderate |
| nitrates_nitrites | significant |
| artificial_sweeteners aspartame | significant |
| artificial_sweeteners other | moderate |
| caffeine | mild |
| alcohol | moderate |

These are defaults, not hard rules.

---

## 12. Example Product Outcomes

### Example A — Deli meat with sodium nitrite
Matches:
- nitrites (significant, high confidence)

User sensitivity:
- nitrates/nitrites = high

Likely outcome:
- total score high
- verdict: `AVOID`

### Example B — Diet soda with aspartame + caffeine
Matches:
- artificial sweeteners / aspartame (significant, high confidence)
- caffeine (mild, high confidence)

User profile:
- artificial sweeteners = moderate
- caffeine = unknown

Likely outcome:
- verdict: `AVOID`

### Example C — Snack food with yeast extract
Matches:
- yeast extract (moderate, medium confidence)

User profile:
- msg/glutamates = unknown

Likely outcome:
- verdict: `REVIEW`

### Example D — Plain product with no relevant matches
Matches:
- none
- ingredients complete

Likely outcome:
- verdict: `SAFE`

### Example E — Product exists but ingredients missing
No scoring verdict.
Use a no-data UX:
- “This product has no ingredient information in the database. Check the label directly.”

---

## 13. UI Messaging Guidance

Never say:
- “This will trigger a migraine.”
- “This food is migraine-safe.”
- “This food is dangerous.”

Prefer:
- “Contains ingredients that may be migraine triggers for some people.”
- “Contains stronger migraine trigger signals based on your profile.”
- “No common migraine triggers were detected in our database.”

---

## 14. Versioning

Version the model explicitly:
- `scoringModelVersion = "1.0.0"`

Store the version with scan history so future changes can be debugged against historical results.

---

## 15. Recommendation for Implementation Simplicity

For v1:
- store database as a typed array in `ingredientDatabase.ts`
- do not try to remote-config trigger rules
- keep the scoring engine deterministic and synchronous
- optimize for explainability, not ML sophistication
