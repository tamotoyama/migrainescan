import type {
  TriggerProfile,
  SensitivityLevel,
  PersonalizationCompletion,
} from '../types';

export function getDefaultTriggerProfile(): TriggerProfile {
  return {
    tyramine: 'unknown',
    histamine: 'unknown',
    msg_glutamates: 'unknown',
    nitrates_nitrites: 'unknown',
    artificial_sweeteners: 'unknown',
    caffeine: 'unknown',
    alcohol: 'unknown',
  };
}

export function applyConservativeDefaults(
  partial: Partial<TriggerProfile>,
): TriggerProfile {
  const defaults = getDefaultTriggerProfile();
  return { ...defaults, ...partial };
}

export function isProfileCompleteEnough(profile: TriggerProfile): boolean {
  const values = Object.values(profile) as SensitivityLevel[];
  return values.some((v) => v !== 'unknown');
}

export function computePersonalizationCompletion(
  profile: TriggerProfile,
): PersonalizationCompletion {
  const values = Object.values(profile) as SensitivityLevel[];
  const sensitivityCountCompleted = values.filter((v) => v !== 'unknown').length;
  const selectedAnyTriggers = sensitivityCountCompleted > 0;
  const isCompleteEnoughForTailoredResults = sensitivityCountCompleted >= 2;
  return {
    selectedAnyTriggers,
    sensitivityCountCompleted,
    isCompleteEnoughForTailoredResults,
  };
}
