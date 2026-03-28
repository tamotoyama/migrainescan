// Pure logic layer — no React, no Firebase, no side effects.
import type {
  ScoreResult,
  ScanResult,
  ScanVerdict,
  TriggerProfile,
  ConfidenceLevel,
  PreprocessedProduct,
} from '../types';
import { isProfileCompleteEnough } from './profileDefaults';

// ─── Verdict thresholds ───────────────────────────────────────────────────────

const THRESHOLD_SAFE   = 1.5;  // score < 1.5  → SAFE
const THRESHOLD_REVIEW = 4.5;  // score < 4.5  → REVIEW, else → AVOID

// ─── Main entry point ─────────────────────────────────────────────────────────

export function generateVerdict(
  preprocessed: PreprocessedProduct,
  scoreResult: ScoreResult,
  profile: TriggerProfile,
): ScanResult {
  let verdict = computeVerdict(scoreResult.totalScore);

  // Conservative modifier §7: 2+ mild-severity triggers → floor to REVIEW (spec §7)
  if (verdict === 'SAFE') {
    const mildCount = scoreResult.scoredTriggers.filter((t) => t.severity === 'mild').length;
    if (mildCount >= 2) verdict = 'REVIEW';
  }

  // Conservative modifier §8: missing ingredients must never produce SAFE (spec §8)
  if (verdict === 'SAFE' && preprocessed.dataCompleteness === 'missing_ingredients') {
    verdict = 'REVIEW';
  }

  const verdictMessage = generateVerdictMessage(verdict, scoreResult);
  const profileComplete = isProfileCompleteEnough(profile);
  const showProfileNudge = needsProfileNudge(profile, scoreResult);
  const dataCompletenessNote = buildDataCompletenessNote(preprocessed);

  return {
    barcode: preprocessed.barcode,
    productName: preprocessed.productName,
    brandName: preprocessed.brandName,
    verdict,
    verdictMessage,
    scoreResult,
    profileComplete,
    showProfileNudge,
    dataCompletenessNote,
    scannedAt: new Date().toISOString(),
    scoringModelVersion: '1.0.0',
    preprocessorVersion: '1.0.0',
    triggerProfileSnapshot: { ...profile },
  };
}

// ─── Verdict computation ──────────────────────────────────────────────────────

export function computeVerdict(totalScore: number): ScanVerdict {
  if (totalScore < THRESHOLD_SAFE) return 'SAFE';
  if (totalScore < THRESHOLD_REVIEW) return 'REVIEW';
  return 'AVOID';
}

// ─── Verdict messages ─────────────────────────────────────────────────────────

export function generateVerdictMessage(
  verdict: ScanVerdict,
  scoreResult: ScoreResult,
): string {
  const triggerCount = scoreResult.scoredTriggers.length;

  switch (verdict) {
    case 'SAFE':
      return 'No common migraine triggers were detected in our database.';

    case 'REVIEW':
      if (triggerCount === 1) {
        return 'Contains an ingredient that may be a migraine trigger for some people.';
      }
      return 'Contains ingredients that may be migraine triggers for some people.';

    case 'AVOID':
      return 'Contains multiple or stronger migraine trigger signals based on your profile.';
  }
}

// ─── Confidence summary ───────────────────────────────────────────────────────

export function generateConfidenceSummaryLabel(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case 'high':   return 'High confidence — triggers identified explicitly in ingredient list.';
    case 'medium': return 'Medium confidence — some signals may be indirect or ambiguous.';
    case 'low':    return 'Low confidence — detection is based on indirect signals only.';
  }
}

// ─── Profile nudge ────────────────────────────────────────────────────────────

export function needsProfileNudge(
  profile: TriggerProfile,
  scoreResult: ScoreResult,
): boolean {
  // Show nudge if profile is incomplete and there are any triggers found,
  // or if profile is entirely unset (all unknown) regardless of triggers.
  const allUnknown = Object.values(profile).every((v) => v === 'unknown');
  if (allUnknown) return true;
  if (!isProfileCompleteEnough(profile) && scoreResult.scoredTriggers.length > 0) return true;
  return false;
}

// ─── Data completeness note ───────────────────────────────────────────────────

function buildDataCompletenessNote(preprocessed: PreprocessedProduct): string | undefined {
  switch (preprocessed.dataCompleteness) {
    case 'missing_ingredients':
      return 'No ingredient data was available for this product. Results may be incomplete.';

    case 'partial':
      return 'Ingredient data for this product is limited. Results are based on partial information.';

    case 'complete':
      // Still surface ambiguity flags even when completeness = complete
      if (preprocessed.ambiguityFlags.includes('indirect_glutamate_signal')) {
        return 'Some signals in this product were detected indirectly and may not represent confirmed triggers.';
      }
      return undefined;
  }
}
