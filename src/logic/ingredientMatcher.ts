// Pure logic layer — no React, no Firebase, no side effects.
import type {
  TriggerEntry,
  PreprocessedProduct,
  MatchedTrigger,
  ConfidenceLevel,
} from '../types';

// ─── Main matcher ─────────────────────────────────────────────────────────────

export function matchTriggers(
  preprocessed: PreprocessedProduct,
  database: TriggerEntry[],
): MatchedTrigger[] {
  const matches: MatchedTrigger[] = [];
  const matchedEntryIds = new Set<string>();

  const text = preprocessed.ingredientsTextNormalized;
  const tokens = preprocessed.ingredientTokens;

  for (const entry of database) {
    for (const pattern of entry.patterns) {
      const matched = entry.wholeWordOnly
        ? matchesWholeWord(text, tokens, pattern)
        : matchesSubstring(text, pattern);

      if (matched) {
        if (!matchedEntryIds.has(entry.id)) {
          matchedEntryIds.add(entry.id);

          // Check if preprocessor found a higher-confidence hint for this entry.
          // Also check normalizedText so that additive-tag hints (where matchedText
          // is the raw tag like 'en:e621' and normalizedText is 'monosodium glutamate')
          // propagate correctly to the matcher.
          const patternLower = pattern.toLowerCase();
          const candidateHint = preprocessed.candidateTriggerMatches.find(
            (c) =>
              c.triggerCategory === entry.category &&
              (
                c.matchedText.toLowerCase().includes(patternLower) ||
                c.normalizedText.toLowerCase().includes(patternLower)
              ),
          );

          const confidenceOverride: ConfidenceLevel | undefined =
            candidateHint && candidateHint.confidenceHint !== entry.confidence
              ? candidateHint.confidenceHint
              : undefined;

          matches.push({
            entry,
            matchedPattern: pattern,
            source: candidateHint?.source ?? 'ingredient_text',
            confidenceOverride,
          });
        }
        break; // Only match each entry once (first pattern that fires wins)
      }
    }
  }

  return matches;
}

// ─── Match strategies ─────────────────────────────────────────────────────────

function matchesWholeWord(
  fullText: string,
  tokens: string[],
  pattern: string,
): boolean {
  const lower = pattern.toLowerCase();

  // Check token list first (exact token match)
  if (tokens.some((t) => t === lower)) return true;

  // Fall back to word-boundary regex on the full normalized text
  const regex = new RegExp(`\\b${escapeRegex(lower)}\\b`, 'i');
  return regex.test(fullText);
}

function matchesSubstring(fullText: string, pattern: string): boolean {
  return fullText.toLowerCase().includes(pattern.toLowerCase());
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
