// Analytics wrapper — thin and easy to disable.
// Set ANALYTICS_ENABLED = false to silence all events.

const ANALYTICS_ENABLED = true;

type EventParams = Record<string, string | number | boolean | undefined>;

function logEvent(name: string, params?: EventParams): void {
  if (!ANALYTICS_ENABLED) return;
  if (__DEV__) {
    console.warn(`[Analytics] ${name}`, params ?? '');
  }
  // In production builds with React Native Firebase Analytics:
  // import analytics from '@react-native-firebase/analytics';
  // analytics().logEvent(name, params).catch(() => {});
}

// ─── Auth events ──────────────────────────────────────────────────────────────

export const logAuthSignupStarted = () => logEvent('auth_signup_started');
export const logAuthSignupCompleted = (method?: 'email' | 'apple') =>
  logEvent('auth_signup_completed', { method });
export const logAuthSigninCompleted = (method?: 'email' | 'apple') =>
  logEvent('auth_signin_completed', { method });

// ─── Onboarding events ────────────────────────────────────────────────────────

export const logOnboardingStarted = () => logEvent('onboarding_started');
export const logOnboardingCompleted = () => logEvent('onboarding_completed');
export const logProfileModeSelected = (mode: string) =>
  logEvent('profile_mode_selected', { mode });
export const logTriggerProfileSaved = () => logEvent('trigger_profile_saved');

// ─── Scan events ──────────────────────────────────────────────────────────────

export const logScanButtonTapped = () => logEvent('scan_button_tapped');
export const logScanSuccess = (verdict: string) =>
  logEvent('scan_success', { verdict });
export const logScanProductNotFound = (barcode?: string) =>
  logEvent('scan_product_not_found', { barcode });
export const logScanMissingIngredients = () =>
  logEvent('scan_missing_ingredients');
export const logScanLimitHit = () => logEvent('scan_limit_hit');

// ─── Result events ────────────────────────────────────────────────────────────

export const logResultViewed = (verdict: string) =>
  logEvent('result_viewed', { verdict });

// ─── Paywall / purchase events ────────────────────────────────────────────────

export const logPaywallViewed = (source?: string) =>
  logEvent('paywall_viewed', { source });
export const logPurchaseStarted = () => logEvent('purchase_started');
export const logPurchaseCompleted = () => logEvent('purchase_completed');
export const logPurchaseRestoreStarted = () =>
  logEvent('purchase_restore_started');
export const logPurchaseRestoreCompleted = (isPremium?: boolean) =>
  logEvent('purchase_restore_completed', { isPremium });
