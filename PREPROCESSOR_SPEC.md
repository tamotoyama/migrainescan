# MigraineScan — Preprocessor Specification

**Version:** 1.0  
**Status:** Required for v1

---

## 1. Why the Preprocessor Exists

OpenFoodFacts gives you raw product data, but raw product data is not stable enough to feed directly into a migraine trigger matcher.

The preprocessor exists to:
- normalize messy ingredient strings
- reduce false negatives from formatting differences
- reduce false positives from naive string matching
- identify candidate trigger signals before scoring
- preserve enough raw context for debugging and history snapshots

This is a core product-quality layer, not an optional utility.

---

## 2. Pipeline Placement

```text
OpenFoodFacts raw product
  -> preprocess
  -> ingredient matcher
  -> scoring engine
  -> verdict generator
  -> UI + Firestore snapshot
```

The matcher and scorer should never have to guess about basic text cleanup or alias normalization.

---

## 3. Inputs

### Required input contract
```ts
interface RawProductInput {
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

---

## 4. Outputs

### Preprocessed output contract
```ts
interface CandidateTriggerMatch {
  triggerCategory:
    | "tyramine"
    | "histamine"
    | "msg_glutamates"
    | "nitrates_nitrites"
    | "artificial_sweeteners"
    | "caffeine"
    | "alcohol";
  source: "ingredient_text" | "ingredients_tag" | "additives_tag" | "category_hint";
  matchedText: string;
  normalizedText: string;
  confidenceHint: "low" | "medium" | "high";
  notes?: string[];
}

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

---

## 5. Core Responsibilities

### 5.1 Normalize ingredient text
- lowercase text
- normalize repeated whitespace
- replace curly quotes / special punctuation with safe equivalents
- preserve commas and semicolons long enough to support token splitting
- strip obvious noise like duplicated spaces and trailing punctuation

### 5.2 Tokenize ingredients
Create:
- full normalized string
- token array
- phrase windows if needed for multi-word matching

### 5.3 Alias expansion
Map common aliases into normalized candidate language.

Examples:
- `msg` -> `monosodium glutamate`
- `hydrolyzed vegetable protein` -> glutamate-related signal
- `acesulfame k` -> `acesulfame potassium`
- `yerba mate extract` -> caffeine-related signal

### 5.4 Additive / tag handling
If OpenFoodFacts provides useful additives or ingredients tags:
- preserve them
- surface them as candidate signals
- never let tags override explicit missing-ingredient states silently

### 5.5 Ambiguity handling
The preprocessor must add flags like:
- `missing_ingredients_text`
- `used_category_hint`
- `indirect_glutamate_signal`
- `fermented_context_inferred`
- `partial_product_metadata`

### 5.6 Preserve raw source
Keep `ingredientsTextRaw` untouched for history/debugging.

---

## 6. Recommended Normalization Rules

### Text cleanup
- trim leading/trailing whitespace
- collapse multiple spaces into one
- replace newlines with commas or spaces consistently
- lowercase everything
- remove trademark symbols and decorative punctuation

### Ingredient delimiters
Support splitting by:
- commas
- semicolons
- periods where appropriate
- parentheses, but preserve parenthetical content in normalized string

### Examples
`"Water, Sugar, MONOSODIUM GLUTAMATE (MSG), Natural Flavor."`
becomes:
- normalized: `water, sugar, monosodium glutamate (msg), natural flavor`
- tokens include:
  - water
  - sugar
  - monosodium glutamate
  - msg
  - natural flavor

---

## 7. Candidate Signal Generation

The preprocessor should not make the final scoring decision, but it should produce useful candidate signals.

### Example candidate generation
If ingredient string includes:
- `monosodium glutamate` -> candidate `msg_glutamates`, high confidence
- `yeast extract` -> candidate `msg_glutamates`, medium confidence
- `sodium nitrite` -> candidate `nitrates_nitrites`, high confidence
- `aspartame` -> candidate `artificial_sweeteners`, high confidence
- `coffee extract` -> candidate `caffeine`, medium confidence

### Context-sensitive categories
Tyramine and histamine often need more careful inference.
Do not aggressively infer from weak signals.

Examples:
- `aged cheddar cheese` can support tyramine more strongly than generic `cheese`
- `red wine vinegar` may support histamine/alcohol context, but usually not with high confidence
- generic `vinegar` alone should not be treated as a strong histamine signal

---

## 8. Data Completeness Rules

### `complete`
Use when:
- ingredients text is present and usable

### `partial`
Use when:
- ingredients text exists but is weak, truncated, or tags were needed for assistance

### `missing_ingredients`
Use when:
- product exists but there is no usable ingredients text

The app should not score a normal SAFE verdict for `missing_ingredients`.

---

## 9. Failure Handling

### Product not found
Do not preprocess normal output.
Return a clear service-level failure state.

### Missing ingredients
Return a `PreprocessedProduct` only if useful metadata exists, but `dataCompleteness` must be `missing_ingredients`.

### Malformed payload
Fail safely:
- log to Crashlytics
- produce a recoverable UI error
- do not crash the scan flow

---

## 10. Suggested Implementation Structure

### File
`src/logic/preprocessor.ts`

### Recommended functions
```ts
normalizeIngredientsText(raw: string): string
tokenizeIngredients(normalized: string): string[]
extractCandidateTriggerMatches(input: RawProductInput, normalized: string): CandidateTriggerMatch[]
buildPreprocessedProduct(input: RawProductInput): PreprocessedProduct
```

### Keep it pure
The preprocessor should be a pure logic layer:
- no React
- no navigation
- no Firestore
- no analytics side effects

---

## 11. Ambiguity Philosophy

When uncertain:
- preserve the ambiguity visibly
- do not silently discard every weak signal
- do not inflate a weak signal into a definitive match

Examples:
- explicit ingredient mention -> high confidence
- accepted alias -> medium confidence
- category hint or weak contextual inference -> low confidence with note

---

## 12. Example Input / Output

### Input
```json
{
  "barcode": "1234567890123",
  "productFound": true,
  "productName": "Diet Cola",
  "brandName": "Example Brand",
  "ingredientsTextRaw": "Carbonated water, caramel color, aspartame, caffeine, natural flavors",
  "ingredientsTags": [],
  "additivesTags": [],
  "categoriesTags": ["beverages", "soft-drinks"]
}
```

### Output summary
```json
{
  "barcode": "1234567890123",
  "productName": "Diet Cola",
  "brandName": "Example Brand",
  "ingredientsTextNormalized": "carbonated water, caramel color, aspartame, caffeine, natural flavors",
  "ingredientTokens": ["carbonated water", "caramel color", "aspartame", "caffeine", "natural flavors"],
  "candidateTriggerMatches": [
    {
      "triggerCategory": "artificial_sweeteners",
      "source": "ingredient_text",
      "matchedText": "aspartame",
      "normalizedText": "aspartame",
      "confidenceHint": "high"
    },
    {
      "triggerCategory": "caffeine",
      "source": "ingredient_text",
      "matchedText": "caffeine",
      "normalizedText": "caffeine",
      "confidenceHint": "high"
    }
  ],
  "ambiguityFlags": [],
  "dataCompleteness": "complete"
}
```

---

## 13. Product Decisions Embedded in This Spec

- preprocessing is required before matching
- no direct raw `String.includes()` scoring against the raw ingredient blob
- preserve raw and normalized forms
- ambiguous signals should be visible to the pipeline
- missing ingredients is a distinct state, not a SAFE verdict
