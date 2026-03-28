import type { TriggerEntry } from '../types';

export const SCORING_MODEL_VERSION = '1.0.0';
export const PREPROCESSOR_VERSION = '1.0.0';

export const TRIGGER_DATABASE: TriggerEntry[] = [
  // ─── Tyramine ──────────────────────────────────────────────────────────────

  {
    id: 'tyramine_aged_cheese',
    displayName: 'Aged Cheese',
    category: 'tyramine',
    severity: 'moderate',
    confidence: 'medium',
    patterns: ['aged cheese', 'aged cheddar', 'aged parmesan', 'aged gouda', 'aged swiss', 'sharp cheddar', 'extra sharp cheddar'],
    wholeWordOnly: false,
    explanation: 'Aged cheeses contain tyramine, a compound commonly discussed as a migraine trigger for sensitive individuals.',
    caveat: 'Tyramine content varies widely by aging process and brand.',
  },
  {
    id: 'tyramine_cultured_cheese',
    displayName: 'Cultured Cheese',
    category: 'tyramine',
    severity: 'mild',
    confidence: 'medium',
    patterns: ['cultured milk', 'cultured cream', 'blue cheese', 'gorgonzola', 'brie', 'camembert', 'roquefort', 'feta cheese'],
    wholeWordOnly: false,
    explanation: 'Some cultured and fermented cheeses contain tyramine and are often discussed in migraine trigger elimination diets.',
  },
  {
    id: 'tyramine_cured_meat',
    displayName: 'Cured Meat',
    category: 'tyramine',
    severity: 'moderate',
    confidence: 'medium',
    patterns: ['cured meat', 'cured pork', 'cured beef', 'salami', 'pepperoni', 'prosciutto', 'soppressata', 'chorizo', 'dry sausage'],
    wholeWordOnly: false,
    explanation: 'Cured and fermented meats contain tyramine due to their aging and fermentation process.',
    caveat: 'Tyramine levels are highest in heavily aged or fermented products.',
  },
  {
    id: 'tyramine_fermented_soy',
    displayName: 'Fermented Soy Product',
    category: 'tyramine',
    severity: 'mild',
    confidence: 'low',
    patterns: ['miso', 'tempeh', 'soy sauce', 'tamari', 'doenjang'],
    wholeWordOnly: true,
    explanation: 'Fermented soy products can contain tyramine and are noted in some migraine trigger discussions.',
    caveat: 'Tyramine content varies. Fresh tofu is generally not a concern.',
  },

  // ─── Histamine ────────────────────────────────────────────────────────────

  {
    id: 'histamine_wine_ingredient',
    displayName: 'Wine-Based Ingredient',
    category: 'histamine',
    severity: 'moderate',
    confidence: 'medium',
    patterns: ['wine', 'red wine', 'white wine', 'wine vinegar', 'red wine vinegar', 'white wine vinegar', 'champagne vinegar'],
    wholeWordOnly: true,
    explanation: 'Wine contains histamine and other biogenic amines commonly associated with migraine sensitivity.',
    caveat: 'Red wine tends to have higher histamine content than white wine.',
  },
  {
    id: 'histamine_aged_fish',
    displayName: 'Aged or Fermented Fish',
    category: 'histamine',
    severity: 'moderate',
    confidence: 'medium',
    patterns: ['anchovies', 'anchovy', 'smoked salmon', 'smoked fish', 'cured fish', 'sardines', 'tuna in oil', 'fermented fish'],
    wholeWordOnly: false,
    explanation: 'Aged, smoked, and fermented fish products can be high in histamine.',
  },
  {
    id: 'histamine_fermented_vinegar',
    displayName: 'Fermented Vinegar',
    category: 'histamine',
    severity: 'mild',
    confidence: 'low',
    patterns: ['balsamic vinegar', 'apple cider vinegar', 'malt vinegar'],
    wholeWordOnly: false,
    explanation: 'Some fermented vinegars contain small amounts of histamine, though evidence for most people is limited.',
    caveat: 'This is a low-confidence signal. Most people tolerate vinegar without issue.',
  },

  // ─── MSG / Glutamates ──────────────────────────────────────────────────────

  {
    id: 'msg_explicit',
    displayName: 'Monosodium Glutamate (MSG)',
    category: 'msg_glutamates',
    severity: 'significant',
    confidence: 'high',
    patterns: ['monosodium glutamate', 'msg'],
    wholeWordOnly: true,
    explanation: 'MSG is a commonly reported migraine trigger for some people and is frequently included in trigger-elimination diets.',
  },
  {
    id: 'msg_yeast_extract',
    displayName: 'Yeast Extract',
    category: 'msg_glutamates',
    severity: 'moderate',
    confidence: 'medium',
    patterns: ['yeast extract', 'autolyzed yeast', 'autolyzed yeast extract'],
    wholeWordOnly: true,
    explanation: 'Yeast extract contains free glutamates and is frequently discussed in the context of migraine triggers.',
    caveat: 'This signal is less direct than explicit MSG labeling.',
  },
  {
    id: 'msg_hydrolyzed_protein',
    displayName: 'Hydrolyzed Protein',
    category: 'msg_glutamates',
    severity: 'moderate',
    confidence: 'medium',
    patterns: [
      'hydrolyzed vegetable protein',
      'hydrolyzed soy protein',
      'hydrolyzed corn protein',
      'hydrolyzed wheat protein',
      'hydrolyzed protein',
      'hvp',
    ],
    wholeWordOnly: false,
    explanation: 'Hydrolyzed proteins are a source of free glutamates and are mentioned alongside MSG in many trigger discussions.',
    caveat: 'Free glutamate content varies by product and processing method.',
  },
  {
    id: 'msg_glutamate_additive',
    displayName: 'Glutamate Additive',
    category: 'msg_glutamates',
    severity: 'moderate',
    confidence: 'high',
    patterns: ['glutamate', 'potassium glutamate', 'calcium glutamate', 'magnesium glutamate', 'disodium guanylate', 'disodium inosinate'],
    wholeWordOnly: true,
    explanation: 'Glutamate-based additives are flavor enhancers related to MSG and sometimes discussed as migraine concerns.',
  },

  // ─── Nitrates / Nitrites ──────────────────────────────────────────────────

  {
    id: 'nitrite_sodium',
    displayName: 'Sodium Nitrite',
    category: 'nitrates_nitrites',
    severity: 'significant',
    confidence: 'high',
    patterns: ['sodium nitrite'],
    wholeWordOnly: true,
    explanation: 'Sodium nitrite is a preservative used in processed meats and is one of the most well-documented migraine trigger concerns.',
  },
  {
    id: 'nitrite_potassium',
    displayName: 'Potassium Nitrite',
    category: 'nitrates_nitrites',
    severity: 'significant',
    confidence: 'high',
    patterns: ['potassium nitrite'],
    wholeWordOnly: true,
    explanation: 'Potassium nitrite is used as a meat preservative and is discussed as a migraine trigger alongside sodium nitrite.',
  },
  {
    id: 'nitrate_sodium',
    displayName: 'Sodium Nitrate',
    category: 'nitrates_nitrites',
    severity: 'moderate',
    confidence: 'high',
    patterns: ['sodium nitrate'],
    wholeWordOnly: true,
    explanation: 'Sodium nitrate is a curing agent in processed meats that converts to nitrite and is commonly listed as a migraine concern.',
  },
  {
    id: 'nitrate_potassium',
    displayName: 'Potassium Nitrate',
    category: 'nitrates_nitrites',
    severity: 'moderate',
    confidence: 'high',
    patterns: ['potassium nitrate'],
    wholeWordOnly: true,
    explanation: 'Potassium nitrate (saltpeter) is used in cured meats and is a related nitrate compound discussed in migraine trigger literature.',
  },

  // ─── Artificial Sweeteners ────────────────────────────────────────────────

  {
    id: 'sweetener_aspartame',
    displayName: 'Aspartame',
    category: 'artificial_sweeteners',
    severity: 'significant',
    confidence: 'high',
    patterns: ['aspartame', 'nutrasweet', 'equal sweetener'],
    wholeWordOnly: true,
    explanation: 'Aspartame is one of the most frequently mentioned artificial sweeteners in migraine trigger discussions and scientific reviews.',
  },
  {
    id: 'sweetener_acesulfame',
    displayName: 'Acesulfame Potassium',
    category: 'artificial_sweeteners',
    severity: 'moderate',
    confidence: 'high',
    patterns: ['acesulfame potassium', 'acesulfame k', 'acesulfame-k', 'ace-k'],
    wholeWordOnly: false,
    explanation: 'Acesulfame potassium is a common artificial sweetener sometimes discussed in relation to migraine sensitivity.',
    caveat: 'Evidence is less robust than for aspartame.',
  },
  {
    id: 'sweetener_sucralose',
    displayName: 'Sucralose',
    category: 'artificial_sweeteners',
    severity: 'mild',
    confidence: 'medium',
    patterns: ['sucralose', 'splenda'],
    wholeWordOnly: true,
    explanation: 'Sucralose is an artificial sweetener mentioned in some migraine trigger reports, though evidence is limited compared to aspartame.',
    caveat: 'Individual sensitivity varies considerably.',
  },
  {
    id: 'sweetener_saccharin',
    displayName: 'Saccharin',
    category: 'artificial_sweeteners',
    severity: 'mild',
    confidence: 'medium',
    patterns: ['saccharin', 'sodium saccharin', 'sweet n low'],
    wholeWordOnly: false,
    explanation: 'Saccharin is an older artificial sweetener occasionally mentioned in migraine sensitivity discussions.',
  },

  // ─── Caffeine ─────────────────────────────────────────────────────────────

  {
    id: 'caffeine_explicit',
    displayName: 'Caffeine',
    category: 'caffeine',
    severity: 'mild',
    confidence: 'high',
    patterns: ['caffeine'],
    wholeWordOnly: true,
    explanation: 'Caffeine is a commonly reported migraine trigger, particularly related to withdrawal or high consumption. It appears explicitly on many product labels.',
  },
  {
    id: 'caffeine_coffee_extract',
    displayName: 'Coffee Extract',
    category: 'caffeine',
    severity: 'mild',
    confidence: 'medium',
    patterns: ['coffee extract', 'coffee flavor', 'instant coffee', 'coffee powder', 'espresso extract', 'espresso powder'],
    wholeWordOnly: false,
    explanation: 'Coffee-derived ingredients contain caffeine and are noted as migraine concerns in caffeine-sensitive individuals.',
  },
  {
    id: 'caffeine_guarana',
    displayName: 'Guarana',
    category: 'caffeine',
    severity: 'mild',
    confidence: 'high',
    patterns: ['guarana', 'guarana extract', 'paullinia cupana'],
    wholeWordOnly: false,
    explanation: 'Guarana is a natural caffeine source common in energy drinks and stimulant products.',
  },
  {
    id: 'caffeine_green_tea',
    displayName: 'Green Tea Extract',
    category: 'caffeine',
    severity: 'mild',
    confidence: 'medium',
    patterns: ['green tea extract', 'matcha extract', 'green coffee extract', 'green coffee bean extract'],
    wholeWordOnly: false,
    explanation: 'Green tea and green coffee extracts are concentrated sources of caffeine and related compounds.',
    caveat: 'Caffeine content varies by concentration and serving size.',
  },
  {
    id: 'caffeine_yerba_mate',
    displayName: 'Yerba Mate',
    category: 'caffeine',
    severity: 'mild',
    confidence: 'medium',
    patterns: ['yerba mate', 'yerba mate extract', 'ilex paraguariensis'],
    wholeWordOnly: false,
    explanation: 'Yerba mate contains caffeine and related stimulant compounds.',
  },

  // ─── Alcohol ──────────────────────────────────────────────────────────────

  {
    id: 'alcohol_wine',
    displayName: 'Wine',
    category: 'alcohol',
    severity: 'moderate',
    confidence: 'high',
    patterns: ['red wine', 'white wine', 'cooking wine', 'wine'],
    wholeWordOnly: true,
    explanation: 'Wine is among the most commonly reported alcohol-related migraine triggers, particularly red wine.',
    caveat: 'Red wine contains both alcohol and histamine, making it a dual trigger for some.',
  },
  {
    id: 'alcohol_spirits',
    displayName: 'Spirits / Liquor',
    category: 'alcohol',
    severity: 'moderate',
    confidence: 'high',
    patterns: ['rum', 'bourbon', 'whiskey', 'whisky', 'vodka', 'gin', 'brandy', 'cognac', 'scotch', 'tequila', 'mezcal'],
    wholeWordOnly: true,
    explanation: 'Distilled spirits are alcohol-forward ingredients included in some specialty products and cooking preparations.',
  },
  {
    id: 'alcohol_beer',
    displayName: 'Beer or Malt',
    category: 'alcohol',
    severity: 'moderate',
    confidence: 'medium',
    patterns: ['beer', 'ale', 'lager', 'stout', 'malt beverage'],
    wholeWordOnly: true,
    explanation: 'Beer-based ingredients contain alcohol and may be used in sauces, marinades, and specialty foods.',
  },
  {
    id: 'alcohol_explicit',
    displayName: 'Alcohol',
    category: 'alcohol',
    severity: 'mild',
    confidence: 'medium',
    patterns: ['alcohol', 'ethyl alcohol', 'ethanol'],
    wholeWordOnly: true,
    explanation: 'Explicit alcohol presence in ingredients is flagged as a migraine concern.',
    caveat: 'Small amounts used as flavor carriers are common and vary in significance.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTriggerById(id: string): TriggerEntry | undefined {
  return TRIGGER_DATABASE.find((t) => t.id === id);
}

export function getTriggersByCategory(
  category: TriggerEntry['category'],
): TriggerEntry[] {
  return TRIGGER_DATABASE.filter((t) => t.category === category);
}
