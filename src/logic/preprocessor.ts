// Pure logic layer — no React, no Firebase, no side effects.
import type {
  RawProductInput,
  PreprocessedProduct,
  CandidateTriggerMatch,
  TriggerCategory,
  ConfidenceLevel,
} from '../types';

export const PREPROCESSOR_VERSION = '1.3.0';

// ─── Alias map ────────────────────────────────────────────────────────────────
// Maps common abbreviated / alternate forms to their canonical normalized form.
// E-number entries apply after normalizeIngredientsText() collapses "e 250" → "e250".

const ALIAS_MAP: Record<string, string> = {
  // Short names & brand aliases
  'msg': 'monosodium glutamate',
  'hvp': 'hydrolyzed vegetable protein',
  'acesulfame k': 'acesulfame potassium',
  'acesulfame-k': 'acesulfame potassium',
  'ace-k': 'acesulfame potassium',
  'nutrasweet': 'aspartame',
  'equal sweetener': 'aspartame',
  // Nitrite / Nitrate E-numbers
  'e249': 'potassium nitrite',
  'e250': 'sodium nitrite',
  'e251': 'sodium nitrate',
  'e252': 'potassium nitrate',
  // MSG / Glutamate E-numbers
  'e621': 'monosodium glutamate',
  'e627': 'disodium guanylate',
  'e631': 'disodium inosinate',
  // Sweetener E-numbers
  'e950': 'acesulfame potassium',
  'e951': 'aspartame',
  'e954': 'saccharin',
  'e955': 'sucralose',
};

// ─── Candidate signal map ──────────────────────────────────────────────────────
// Quick-scan patterns used by the preprocessor to identify candidates before
// full matching. These do NOT replace the ingredient database — they help
// surface useful hints to the matcher and attach ambiguity flags.

interface CandidateRule {
  pattern: string;
  category: TriggerCategory;
  confidenceHint: ConfidenceLevel;
  notes?: string[];
}

const CANDIDATE_RULES: CandidateRule[] = [
  // MSG / Glutamates
  { pattern: 'monosodium glutamate', category: 'msg_glutamates', confidenceHint: 'high' },
  { pattern: 'yeast extract',        category: 'msg_glutamates', confidenceHint: 'medium' },
  { pattern: 'autolyzed yeast',      category: 'msg_glutamates', confidenceHint: 'medium' },
  { pattern: 'hydrolyzed vegetable protein', category: 'msg_glutamates', confidenceHint: 'medium' },
  { pattern: 'hydrolyzed soy protein',       category: 'msg_glutamates', confidenceHint: 'medium' },
  { pattern: 'hydrolyzed corn protein',      category: 'msg_glutamates', confidenceHint: 'medium' },
  { pattern: 'hydrolyzed wheat protein',     category: 'msg_glutamates', confidenceHint: 'medium' },
  { pattern: 'hydrolyzed protein',           category: 'msg_glutamates', confidenceHint: 'medium', notes: ['indirect_glutamate_signal'] },
  { pattern: 'glutamate',            category: 'msg_glutamates', confidenceHint: 'high' },
  { pattern: 'disodium guanylate',   category: 'msg_glutamates', confidenceHint: 'high' },
  { pattern: 'disodium inosinate',   category: 'msg_glutamates', confidenceHint: 'high' },

  // Nitrates / Nitrites
  { pattern: 'sodium nitrite',   category: 'nitrates_nitrites', confidenceHint: 'high' },
  { pattern: 'sodium nitrate',   category: 'nitrates_nitrites', confidenceHint: 'high' },
  { pattern: 'potassium nitrite',category: 'nitrates_nitrites', confidenceHint: 'high' },
  { pattern: 'potassium nitrate',category: 'nitrates_nitrites', confidenceHint: 'high' },

  // Artificial sweeteners
  { pattern: 'aspartame',           category: 'artificial_sweeteners', confidenceHint: 'high' },
  { pattern: 'acesulfame potassium',category: 'artificial_sweeteners', confidenceHint: 'high' },
  { pattern: 'sucralose',           category: 'artificial_sweeteners', confidenceHint: 'high' },
  { pattern: 'saccharin',           category: 'artificial_sweeteners', confidenceHint: 'medium' },

  // Caffeine
  { pattern: 'caffeine',          category: 'caffeine', confidenceHint: 'high' },
  { pattern: 'coffee extract',    category: 'caffeine', confidenceHint: 'medium' },
  { pattern: 'guarana',           category: 'caffeine', confidenceHint: 'high' },
  { pattern: 'green tea extract', category: 'caffeine', confidenceHint: 'medium' },
  { pattern: 'yerba mate',        category: 'caffeine', confidenceHint: 'medium' },

  // Alcohol — wines
  { pattern: 'red wine',      category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'white wine',    category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'cooking wine',  category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'marsala wine',  category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'cooking sherry',category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'sherry wine',   category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'port wine',     category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'rice wine',     category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'sake',          category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'mirin',         category: 'alcohol', confidenceHint: 'medium' },
  { pattern: 'vermouth',      category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'champagne',     category: 'alcohol', confidenceHint: 'high' },
  // Alcohol — spirits
  { pattern: 'alcohol',     category: 'alcohol', confidenceHint: 'medium' },
  { pattern: 'rum',         category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'bourbon',     category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'whiskey',     category: 'alcohol', confidenceHint: 'high' },
  // Alcohol — beer
  { pattern: 'beer',        category: 'alcohol', confidenceHint: 'medium' },
  { pattern: 'stout',       category: 'alcohol', confidenceHint: 'medium' },
  { pattern: 'lager',       category: 'alcohol', confidenceHint: 'medium' },
  { pattern: 'pale ale',    category: 'alcohol', confidenceHint: 'medium' },

  // Tyramine

  { pattern: 'aged cheese',    category: 'tyramine', confidenceHint: 'medium' },
  { pattern: 'aged cheddar',   category: 'tyramine', confidenceHint: 'medium' },
  { pattern: 'salami',         category: 'tyramine', confidenceHint: 'medium' },
  { pattern: 'pepperoni',      category: 'tyramine', confidenceHint: 'medium' },
  { pattern: 'prosciutto',     category: 'tyramine', confidenceHint: 'medium' },
  { pattern: 'miso',           category: 'tyramine', confidenceHint: 'low', notes: ['fermented_context_inferred'] },

  // Histamine
  { pattern: 'wine vinegar',       category: 'histamine', confidenceHint: 'medium' },
  { pattern: 'red wine vinegar',   category: 'histamine', confidenceHint: 'medium' },
  { pattern: 'anchovies',          category: 'histamine', confidenceHint: 'medium' },
  { pattern: 'smoked salmon',      category: 'histamine', confidenceHint: 'medium' },

  // Natural nitrate sources (celery/beet powders used as "uncured" preservatives)
  { pattern: 'celery powder',      category: 'nitrates_nitrites', confidenceHint: 'low', notes: ['natural_nitrate_source'] },
  { pattern: 'celery juice powder',category: 'nitrates_nitrites', confidenceHint: 'low', notes: ['natural_nitrate_source'] },
  { pattern: 'celery juice',       category: 'nitrates_nitrites', confidenceHint: 'low', notes: ['natural_nitrate_source'] },
  { pattern: 'celery extract',     category: 'nitrates_nitrites', confidenceHint: 'low', notes: ['natural_nitrate_source'] },
  { pattern: 'beet juice powder',  category: 'nitrates_nitrites', confidenceHint: 'low', notes: ['natural_nitrate_source'] },
  { pattern: 'beet juice',         category: 'nitrates_nitrites', confidenceHint: 'low', notes: ['natural_nitrate_source'] },

  // Chocolate / Cocoa (caffeine + theobromine)
  { pattern: 'cocoa',              category: 'caffeine', confidenceHint: 'medium' },
  { pattern: 'cacao',              category: 'caffeine', confidenceHint: 'medium' },
  { pattern: 'dark chocolate',     category: 'caffeine', confidenceHint: 'medium' },
  { pattern: 'chocolate liquor',   category: 'caffeine', confidenceHint: 'medium' },
  { pattern: 'cocoa powder',       category: 'caffeine', confidenceHint: 'medium' },
  { pattern: 'cocoa solids',       category: 'caffeine', confidenceHint: 'medium' },

  // Natural flavors / seasoning (low-confidence glutamate signal)
  { pattern: 'natural flavors',    category: 'msg_glutamates', confidenceHint: 'low', notes: ['indirect_glutamate_signal'] },
  { pattern: 'natural flavor',     category: 'msg_glutamates', confidenceHint: 'low', notes: ['indirect_glutamate_signal'] },
  { pattern: 'natural seasoning',  category: 'msg_glutamates', confidenceHint: 'low', notes: ['indirect_glutamate_signal'] },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildPreprocessedProduct(
  input: RawProductInput,
): PreprocessedProduct {
  const hadIngredientsText = input.ingredientsTextRaw.trim().length > 0;
  const usedFallbackFields = !hadIngredientsText && (
    (input.ingredientsTags?.length ?? 0) > 0 ||
    (input.additivesTags?.length ?? 0) > 0
  );

  const normalized = hadIngredientsText
    ? normalizeIngredientsText(input.ingredientsTextRaw)
    : '';

  // Language check runs on normalized text BEFORE alias expansion so that
  // E-number → English canonical substitutions don't inflate the English score.
  const nonEnglish = hadIngredientsText && !looksLikeEnglish(normalized);

  const aliasExpanded = expandAliases(normalized);
  const tokens = tokenizeIngredients(aliasExpanded);

  const dataCompleteness =
    !hadIngredientsText && !usedFallbackFields
      ? 'missing_ingredients'
      : hadIngredientsText && !nonEnglish
        ? 'complete'
        : 'partial';

  const ambiguityFlags: string[] = [];
  if (!hadIngredientsText) {
    ambiguityFlags.push('missing_ingredients_text');
  }
  if (usedFallbackFields) {
    ambiguityFlags.push('partial_product_metadata');
  }
  if (nonEnglish) {
    ambiguityFlags.push('non_english_ingredients');
  }

  const candidateTriggerMatches = extractCandidateTriggerMatches(
    input,
    aliasExpanded,
    ambiguityFlags,
  );

  // All E-number ranges used in scoring + keyword fallbacks
  const RELEVANT_ADDITIVE_PATTERNS = [
    'e249', 'e250', 'e251', 'e252',           // nitrites / nitrates
    'e621', 'e627', 'e631',                    // glutamates
    'e950', 'e951', 'e954', 'e955',            // sweeteners
    'msg', 'glutamate', 'nitrite', 'nitrate',  // keyword fallbacks
  ];
  const detectedAdditiveTags = (input.additivesTags ?? []).filter((tag) => {
    const lower = tag.toLowerCase();
    return RELEVANT_ADDITIVE_PATTERNS.some((p) => lower.includes(p));
  });

  return {
    barcode: input.barcode,
    productName: input.productName,
    brandName: input.brandName,
    ingredientsTextRaw: input.ingredientsTextRaw,
    ingredientsTextNormalized: aliasExpanded,
    ingredientTokens: tokens,
    detectedAdditiveTags,
    candidateTriggerMatches,
    ambiguityFlags,
    dataCompleteness,
    sourceMeta: {
      productFound: input.productFound,
      hadIngredientsText,
      usedFallbackFields,
    },
  };
}

// ─── Normalization ────────────────────────────────────────────────────────────

export function normalizeIngredientsText(raw: string): string {
  return raw
    // Decode HTML entities before any other processing
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#\d+;/g, ' ')
    .toLowerCase()
    // Strip Unicode noise characters
    .replace(/\u00AD/g, '')        // soft hyphen — invisible, breaks word matching
    .replace(/\u00A0/g, ' ')       // non-breaking space → regular space
    .replace(/\u200B/g, '')        // zero-width space
    .replace(/\u200C/g, '')        // zero-width non-joiner
    // Normalize whitespace
    .replace(/\r\n|\r|\n/g, ', ')
    .replace(/\s+/g, ' ')
    // Remove trademark / copyright symbols
    .replace(/[®™©]/g, '')
    // Normalize curly quotes and special dashes
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[–—]/g, '-')
    // Collapse spaced E-numbers so alias map can match: "e 250" → "e250"
    .replace(/\be\s+(\d{3,4}[a-z]?)\b/g, 'e$1')
    // Remove leading/trailing noise
    .replace(/^\s*ingredients?:?\s*/i, '')
    .trim();
}

// ─── Alias expansion ──────────────────────────────────────────────────────────

export function expandAliases(text: string): string {
  let result = text;
  for (const [alias, canonical] of Object.entries(ALIAS_MAP)) {
    // Use word-boundary-aware replacement
    const pattern = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'gi');
    result = result.replace(pattern, canonical);
  }
  return result;
}

// ─── Tokenization ─────────────────────────────────────────────────────────────

export function tokenizeIngredients(normalized: string): string[] {
  if (!normalized.trim()) return [];

  return normalized
    // Split on commas and semicolons — preserve parenthetical content
    .split(/[,;]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    // Flatten parenthetical sub-ingredients by also including the content
    .flatMap((token) => {
      const inner = token.match(/\(([^)]+)\)/);
      if (inner) {
        const parentPart = token.replace(/\([^)]*\)/, '').trim();
        const innerParts = inner[1].split(/[,;]/).map((p) => p.trim()).filter(Boolean);
        return [parentPart, ...innerParts].filter(Boolean);
      }
      return [token];
    });
}

// ─── Candidate trigger extraction ─────────────────────────────────────────────

export function extractCandidateTriggerMatches(
  input: RawProductInput,
  normalizedText: string,
  ambiguityFlags: string[],
): CandidateTriggerMatch[] {
  const matches: CandidateTriggerMatch[] = [];
  const seen = new Set<string>();

  for (const rule of CANDIDATE_RULES) {
    const pattern = new RegExp(`\\b${escapeRegex(rule.pattern)}\\b`, 'i');
    if (pattern.test(normalizedText)) {
      const key = `${rule.category}:${rule.pattern}`;
      if (!seen.has(key)) {
        seen.add(key);
        if (rule.notes) {
          for (const note of rule.notes) {
            if (!ambiguityFlags.includes(note)) {
              ambiguityFlags.push(note);
            }
          }
        }
        matches.push({
          triggerCategory: rule.category,
          source: 'ingredient_text',
          matchedText: rule.pattern,
          normalizedText: rule.pattern,
          confidenceHint: rule.confidenceHint,
          notes: rule.notes,
        });
      }
    }
  }

  // Cross-reference "No Nitrates Added" label claims against natural nitrate sources.
  // Products claiming no nitrates but using celery/beet powder get a specific flag
  // so the ResultScreen can surface an accurate warning to the user.
  const noNitratesClaim = (input.labelsTags ?? []).some((t) => {
    const l = t.toLowerCase();
    return l.includes('no-added-nitrate') || l.includes('no-nitrite') || l.includes('uncured');
  });
  const hasNaturalNitrate = matches.some(
    (m) => m.notes?.includes('natural_nitrate_source'),
  );
  if (noNitratesClaim && hasNaturalNitrate) {
    if (!ambiguityFlags.includes('natural_nitrate_deception_label')) {
      ambiguityFlags.push('natural_nitrate_deception_label');
    }
  }

  // Also surface any relevant additives tags from OFF
  for (const tag of input.additivesTags ?? []) {
    const lower = tag.toLowerCase();

    // MSG / Glutamates
    if (lower.includes('e621') || lower.includes('glutamate')) {
      const key = 'msg_glutamates:additives_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({
          triggerCategory: 'msg_glutamates',
          source: 'additives_tag',
          matchedText: tag,
          normalizedText: 'monosodium glutamate',
          confidenceHint: 'high',
        });
      }
    }
    // Disodium guanylate (E627) / inosinate (E631)
    if (lower.includes('e627') || lower.includes('guanylate')) {
      const key = 'msg_glutamates:e627_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'msg_glutamates', source: 'additives_tag', matchedText: tag, normalizedText: 'disodium guanylate', confidenceHint: 'high' });
      }
    }
    if (lower.includes('e631') || lower.includes('inosinate')) {
      const key = 'msg_glutamates:e631_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'msg_glutamates', source: 'additives_tag', matchedText: tag, normalizedText: 'disodium inosinate', confidenceHint: 'high' });
      }
    }
    // Nitrites / Nitrates
    if (lower.includes('e249') || lower.includes('potassium nitrite')) {
      const key = 'nitrates_nitrites:e249_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'nitrates_nitrites', source: 'additives_tag', matchedText: tag, normalizedText: 'potassium nitrite', confidenceHint: 'high' });
      }
    }
    if (lower.includes('e250') || lower.includes('sodium nitrite')) {
      const key = 'nitrates_nitrites:e250_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'nitrates_nitrites', source: 'additives_tag', matchedText: tag, normalizedText: 'sodium nitrite', confidenceHint: 'high' });
      }
    }
    if (lower.includes('e251') || lower.includes('sodium nitrate')) {
      const key = 'nitrates_nitrites:e251_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'nitrates_nitrites', source: 'additives_tag', matchedText: tag, normalizedText: 'sodium nitrate', confidenceHint: 'high' });
      }
    }
    if (lower.includes('e252') || lower.includes('potassium nitrate')) {
      const key = 'nitrates_nitrites:e252_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'nitrates_nitrites', source: 'additives_tag', matchedText: tag, normalizedText: 'potassium nitrate', confidenceHint: 'high' });
      }
    }
    // Artificial sweeteners
    if (lower.includes('e950') || lower.includes('acesulfame')) {
      const key = 'artificial_sweeteners:e950_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'artificial_sweeteners', source: 'additives_tag', matchedText: tag, normalizedText: 'acesulfame potassium', confidenceHint: 'high' });
      }
    }
    if (lower.includes('e951') || lower.includes('aspartame')) {
      const key = 'artificial_sweeteners:e951_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'artificial_sweeteners', source: 'additives_tag', matchedText: tag, normalizedText: 'aspartame', confidenceHint: 'high' });
      }
    }
    if (lower.includes('e954') || lower.includes('saccharin')) {
      const key = 'artificial_sweeteners:e954_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'artificial_sweeteners', source: 'additives_tag', matchedText: tag, normalizedText: 'saccharin', confidenceHint: 'high' });
      }
    }
    if (lower.includes('e955') || lower.includes('sucralose')) {
      const key = 'artificial_sweeteners:e955_tag';
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ triggerCategory: 'artificial_sweeteners', source: 'additives_tag', matchedText: tag, normalizedText: 'sucralose', confidenceHint: 'high' });
      }
    }
  }

  return matches;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

// Words that appear frequently in English ingredient lists. If at least one is
// found in the normalized text we treat it as English and keep dataCompleteness
// as 'complete'. This prevents non-English product pages from producing false
// verdicts while still being useful when the OFF database returns English text.
const ENGLISH_INGREDIENT_INDICATORS = [
  'water', 'salt', 'sugar', 'flour', 'oil', 'starch', 'extract',
  'powder', 'contains', 'modified', 'natural', 'artificial',
  'sodium', 'calcium', 'potassium', 'acid', 'color', 'colour',
  'flavor', 'flavour', 'protein', 'wheat', 'corn', 'soy', 'milk',
  'cream', 'butter', 'syrup', 'enriched', 'reduced', 'dehydrated',
  'dried', 'concentrate', 'purified', 'filtered', 'less than',
];

export function looksLikeEnglish(normalizedText: string): boolean {
  if (normalizedText.trim().length < 10) return true; // too short to judge

  // Multiple E-numbers = valid European ingredient format that alias expansion handles fully.
  // Don't penalize these as "non-English" — they're structured, decodable data.
  const eNumberMatches = normalizedText.match(/\be\d{3,4}[a-z]?\b/g) ?? [];
  if (eNumberMatches.length >= 2) return true;

  for (const word of ENGLISH_INGREDIENT_INDICATORS) {
    if (new RegExp(`\\b${word}\\b`).test(normalizedText)) return true;
  }

  // If none of the indicator words appear, fall back to ASCII-ratio check.
  // Non-Latin scripts (Cyrillic, Chinese, Arabic, etc.) have very low ASCII
  // letter density.
  const asciiLetters = (normalizedText.match(/[a-z]/g) ?? []).length;
  const totalChars = normalizedText.replace(/\s/g, '').length;
  if (totalChars === 0) return true;
  return asciiLetters / totalChars > 0.5;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
