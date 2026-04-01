// ─── Trigger taxonomy ───────────────────────────────────────────────────────

export type TriggerCategory =
  | 'tyramine'
  | 'histamine'
  | 'msg_glutamates'
  | 'nitrates_nitrites'
  | 'artificial_sweeteners'
  | 'caffeine'
  | 'alcohol';

export type SeverityLevel = 'mild' | 'moderate' | 'significant';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type SensitivityLevel = 'none' | 'mild' | 'moderate' | 'high' | 'unknown';
export type ScanVerdict = 'SAFE' | 'REVIEW' | 'AVOID';
export type ProfileMode =
  | 'doctor_diagnosed'
  | 'suspected_food_trigger'
  | 'just_exploring';
export type DataCompleteness = 'complete' | 'partial' | 'missing_ingredients';
export type AuthProviderType = 'password' | 'apple';

// ─── Ingredient database ────────────────────────────────────────────────────

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
}

// ─── User profile ───────────────────────────────────────────────────────────

export interface TriggerProfile {
  tyramine: SensitivityLevel;
  histamine: SensitivityLevel;
  msg_glutamates: SensitivityLevel;
  nitrates_nitrites: SensitivityLevel;
  artificial_sweeteners: SensitivityLevel;
  caffeine: SensitivityLevel;
  alcohol: SensitivityLevel;
}

export interface PersonalizationCompletion {
  selectedAnyTriggers: boolean;
  sensitivityCountCompleted: number;
  isCompleteEnoughForTailoredResults: boolean;
}

// ─── Firestore user document ─────────────────────────────────────────────────

export interface UserProfileDoc {
  uid: string;
  email: string | null;
  authProvider: AuthProviderType;
  createdAt: string;  // ISO string
  updatedAt: string;  // ISO string

  onboardingComplete: boolean;
  profileMode: ProfileMode | null;

  triggerProfile: Partial<TriggerProfile>;

  freeScanCount: number;       // incremented on each free scan
  lastScanAt: string | null;   // ISO string
}

// ─── OpenFoodFacts / product lookup ──────────────────────────────────────────

export interface RawProductInput {
  barcode: string;
  productFound: boolean;
  productName: string;
  brandName: string | null;
  ingredientsTextRaw: string;
  ingredientsTags?: string[];
  additivesTags?: string[];
  categoriesTags?: string[];
  labelsTags?: string[];
}

export interface ProductLookupResult {
  barcode: string;
  productFound: boolean;
  productName: string;
  brandName: string | null;
  ingredientsTextRaw: string;
  ingredientsTags?: string[];
  additivesTags?: string[];
  categoriesTags?: string[];
  labelsTags?: string[];
}

// ─── Preprocessing ───────────────────────────────────────────────────────────

export interface CandidateTriggerMatch {
  triggerCategory: TriggerCategory;
  source: 'ingredient_text' | 'ingredients_tag' | 'additives_tag' | 'category_hint';
  matchedText: string;
  normalizedText: string;
  confidenceHint: ConfidenceLevel;
  notes?: string[];
}

export interface PreprocessedProduct {
  barcode: string;
  productName: string;
  brandName: string | null;

  ingredientsTextRaw: string;
  ingredientsTextNormalized: string;
  ingredientTokens: string[];

  detectedAdditiveTags: string[];
  candidateTriggerMatches: CandidateTriggerMatch[];
  ambiguityFlags: string[];
  dataCompleteness: DataCompleteness;

  sourceMeta: {
    productFound: boolean;
    hadIngredientsText: boolean;
    usedFallbackFields: boolean;
  };
}

// ─── Matching & scoring ───────────────────────────────────────────────────────

export interface MatchedTrigger {
  entry: TriggerEntry;
  matchedPattern: string;
  source: CandidateTriggerMatch['source'];
  confidenceOverride?: ConfidenceLevel;
}

export interface ScoredTrigger {
  id: string;
  displayName: string;
  category: TriggerCategory;
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  matchedPattern: string;
  explanation: string;
  caveat?: string;
  userSensitivityAtScan: SensitivityLevel;
  weightApplied: number;
}

export interface ScoreResult {
  totalScore: number;
  scoredTriggers: ScoredTrigger[];
  profileCompletenessModifierApplied: boolean;
  categoryBreakdown: Partial<Record<TriggerCategory, number>>;
  confidenceSummary: ConfidenceLevel;
}

// ─── Final scan result ────────────────────────────────────────────────────────

export interface ScanResult {
  barcode: string;
  productName: string;
  brandName: string | null;

  verdict: ScanVerdict;
  verdictMessage: string;
  scoreResult: ScoreResult;

  profileComplete: boolean;
  showProfileNudge: boolean;
  dataCompletenessNote?: string;

  scannedAt: string;              // ISO string
  scoringModelVersion: string;
  preprocessorVersion: string;
  triggerProfileSnapshot: TriggerProfile;
}

// ─── Firestore scan history document ─────────────────────────────────────────

export interface ScanHistoryDoc {
  scanId: string;
  userId: string;
  barcode: string;
  productName: string;
  brandName: string | null;
  scannedAt: string;   // ISO string

  verdict: ScanVerdict;
  verdictMessage: string;
  totalScore: number;

  scoredTriggers: ScoredTrigger[];
  triggerProfileSnapshot: TriggerProfile;

  scoringModelVersion: string;
  preprocessorVersion: string;
}

// ─── Error types ──────────────────────────────────────────────────────────────

export class ProductNotFoundError extends Error {
  readonly barcode: string;
  constructor(barcode: string) {
    super(`Product not found for barcode: ${barcode}`);
    this.name = 'ProductNotFoundError';
    this.barcode = barcode;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message = 'Service temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}
