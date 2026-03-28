// Pure logic layer — no React, no Firebase, no side effects.
import type {
  RawProductInput,
  PreprocessedProduct,
  CandidateTriggerMatch,
  TriggerCategory,
  ConfidenceLevel,
} from '../types';

export const PREPROCESSOR_VERSION = '1.0.0';

// ─── Alias map ────────────────────────────────────────────────────────────────
// Maps common abbreviated / alternate forms to their canonical normalized form.

const ALIAS_MAP: Record<string, string> = {
  'msg': 'monosodium glutamate',
  'hvp': 'hydrolyzed vegetable protein',
  'acesulfame k': 'acesulfame potassium',
  'acesulfame-k': 'acesulfame potassium',
  'ace-k': 'acesulfame potassium',
  'nutrasweet': 'aspartame',
  'equal sweetener': 'aspartame',
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

  // Alcohol
  { pattern: 'red wine',    category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'white wine',  category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'cooking wine',category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'alcohol',     category: 'alcohol', confidenceHint: 'medium' },
  { pattern: 'rum',         category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'bourbon',     category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'whiskey',     category: 'alcohol', confidenceHint: 'high' },
  { pattern: 'beer',        category: 'alcohol', confidenceHint: 'medium' },

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

  const aliasExpanded = expandAliases(normalized);
  const tokens = tokenizeIngredients(aliasExpanded);

  const dataCompleteness =
    !hadIngredientsText && !usedFallbackFields
      ? 'missing_ingredients'
      : hadIngredientsText
        ? 'complete'
        : 'partial';

  const ambiguityFlags: string[] = [];
  if (!hadIngredientsText) {
    ambiguityFlags.push('missing_ingredients_text');
  }
  if (usedFallbackFields) {
    ambiguityFlags.push('partial_product_metadata');
  }

  const candidateTriggerMatches = extractCandidateTriggerMatches(
    input,
    aliasExpanded,
    ambiguityFlags,
  );

  const detectedAdditiveTags = (input.additivesTags ?? [])
    .filter((tag) => tag.startsWith('en:e6') || tag.includes('msg') || tag.includes('glutamate'));

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
    .toLowerCase()
    // Normalize whitespace
    .replace(/\r\n|\r|\n/g, ', ')
    .replace(/\s+/g, ' ')
    // Remove trademark / copyright symbols
    .replace(/[®™©]/g, '')
    // Normalize curly quotes and special dashes
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[–—]/g, '-')
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

  // Also surface any relevant additives tags from OFF
  for (const tag of input.additivesTags ?? []) {
    const lower = tag.toLowerCase();
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
  }

  return matches;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
