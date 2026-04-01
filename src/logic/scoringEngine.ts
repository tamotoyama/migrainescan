// Pure, deterministic, synchronous — no side effects.
import type {
  MatchedTrigger,
  TriggerProfile,
  ScoreResult,
  ScoredTrigger,
  SensitivityLevel,
  SeverityLevel,
  ConfidenceLevel,
  TriggerCategory,
} from '../types';

// ─── Weight tables ────────────────────────────────────────────────────────────

const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  mild:        1.0,
  moderate:    2.0,
  significant: 3.5,
};

const CONFIDENCE_MULTIPLIERS: Record<ConfidenceLevel, number> = {
  low:    0.85,
  medium: 1.0,
  high:   1.15,
};

const SENSITIVITY_MULTIPLIERS: Record<SensitivityLevel, number> = {
  none:    0.5,
  mild:    1.0,
  moderate:1.25,
  high:    1.5,
  unknown: 1.15,
};

// Caffeine guarantees at least REVIEW when detected (spec: "mild REVIEW-level concern")
const CAFFEINE_MIN_WEIGHT = 1.5; // equals REVIEW threshold

// Incomplete profile conservative modifier
const INCOMPLETE_PROFILE_MODIFIER = 0.5;

// Repeated category pressure (per additional hit above 1)
const CATEGORY_REPEAT_BUMP = 0.25;

// ─── Main scorer ──────────────────────────────────────────────────────────────

export function scoreMatches(
  matches: MatchedTrigger[],
  profile: TriggerProfile,
  profileComplete: boolean,
): ScoreResult {
  if (matches.length === 0) {
    return {
      totalScore: 0,
      scoredTriggers: [],
      profileCompletenessModifierApplied: false,
      categoryBreakdown: {},
      confidenceSummary: 'high',
    };
  }

  const scoredTriggers: ScoredTrigger[] = [];
  const categoryBreakdown: Partial<Record<TriggerCategory, number>> = {};
  const categoryHitCount: Partial<Record<TriggerCategory, number>> = {};

  let rawTotal = 0;

  for (const match of matches) {
    const { entry, confidenceOverride } = match;
    const category = entry.category as TriggerCategory;

    const userSensitivity: SensitivityLevel =
      profile[category as keyof TriggerProfile] ?? 'unknown';

    const confidence: ConfidenceLevel = confidenceOverride ?? entry.confidence;

    const severityWeight = SEVERITY_WEIGHTS[entry.severity];
    const confidenceMultiplier = CONFIDENCE_MULTIPLIERS[confidence];
    const sensitivityMultiplier = SENSITIVITY_MULTIPLIERS[userSensitivity];

    let weight = severityWeight * confidenceMultiplier * sensitivityMultiplier;

    // Caffeine minimum rule — always at least mild concern, unless user opted out
    if (category === 'caffeine' && userSensitivity !== 'none') {
      weight = Math.max(weight, CAFFEINE_MIN_WEIGHT);
    }

    // Track per-category hit count for repeat bump
    const hitCount = (categoryHitCount[category] ?? 0) + 1;
    categoryHitCount[category] = hitCount;
    if (hitCount > 1) {
      weight += CATEGORY_REPEAT_BUMP * (hitCount - 1);
    }

    rawTotal += weight;
    categoryBreakdown[category] = (categoryBreakdown[category] ?? 0) + weight;

    scoredTriggers.push({
      id: entry.id,
      displayName: entry.displayName,
      category,
      severity: entry.severity,
      confidence,
      matchedPattern: match.matchedPattern,
      explanation: entry.explanation,
      caveat: entry.caveat,
      userSensitivityAtScan: userSensitivity,
      weightApplied: weight,
    });
  }

  // Apply incomplete profile modifier
  const profileCompletenessModifierApplied = !profileComplete;
  if (profileCompletenessModifierApplied) {
    rawTotal += INCOMPLETE_PROFILE_MODIFIER;
  }

  // Sort by weight descending for display
  scoredTriggers.sort((a, b) => b.weightApplied - a.weightApplied);

  const confidenceSummary = computeConfidenceSummary(scoredTriggers);

  return {
    totalScore: rawTotal,
    scoredTriggers,
    profileCompletenessModifierApplied,
    categoryBreakdown,
    confidenceSummary,
  };
}

// ─── Confidence summary ───────────────────────────────────────────────────────

function computeConfidenceSummary(
  scored: ScoredTrigger[],
): ConfidenceLevel {
  if (scored.length === 0) return 'high';

  const totalWeight = scored.reduce((sum, s) => sum + s.weightApplied, 0);
  if (totalWeight === 0) return 'high';

  const highShare = scored
    .filter((s) => s.confidence === 'high')
    .reduce((sum, s) => sum + s.weightApplied, 0) / totalWeight;
  const lowShare = scored
    .filter((s) => s.confidence === 'low')
    .reduce((sum, s) => sum + s.weightApplied, 0) / totalWeight;

  if (lowShare > 0.5) return 'low';
  if (highShare >= 0.5) return 'high';
  return 'medium';
}
