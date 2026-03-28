// react-native-purchases requires a native module that is not available in Expo Go.
// We lazy-load it so the module evaluation itself never throws in Expo Go.
// All functions fall back to safe stubs when the native module is absent.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PurchasesModule = any;

function getPurchases(): PurchasesModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-purchases').default;
  } catch {
    return null;
  }
}

import type { PurchasesPackage } from 'react-native-purchases';
import { logError } from '../firebase/crashlytics';

const API_KEY_IOS =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? '';

const PREMIUM_ENTITLEMENT_ID = 'premium';

export interface CustomerStatus {
  isPremium: boolean;
  managementURL: string | null;
}

// ─── Initialization ───────────────────────────────────────────────────────────

export async function initializeRevenueCat(userId?: string): Promise<void> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) return; // Expo Go — skip silently
    if (__DEV__) {
      Purchases.setLogLevel('DEBUG');
    }
    Purchases.configure({ apiKey: API_KEY_IOS });
    if (userId) {
      await Purchases.logIn(userId);
    }
  } catch (err) {
    logError(err, 'initializeRevenueCat');
    // Non-fatal — app can still launch without RevenueCat
  }
}

export async function identifyRevenueCatUser(userId: string): Promise<void> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) return;
    await Purchases.logIn(userId);
  } catch (err) {
    logError(err, 'identifyRevenueCatUser');
  }
}

export async function resetRevenueCatUser(): Promise<void> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) return;
    await Purchases.logOut();
  } catch (err) {
    logError(err, 'resetRevenueCatUser');
  }
}

// ─── Customer info ────────────────────────────────────────────────────────────

export async function getCustomerStatus(): Promise<CustomerStatus> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) return { isPremium: false, managementURL: null };
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    return {
      isPremium: !!entitlement,
      managementURL: customerInfo.managementURL ?? null,
    };
  } catch (err) {
    logError(err, 'getCustomerStatus');
    // Return non-premium on failure — conservative default
    return { isPremium: false, managementURL: null };
  }
}

// ─── Offerings and packages ───────────────────────────────────────────────────

export async function getPremiumPackage(): Promise<PurchasesPackage | null> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) return null;
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return null;
    return current.monthly ?? current.availablePackages[0] ?? null;
  } catch (err) {
    logError(err, 'getPremiumPackage');
    return null;
  }
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export async function purchasePremium(): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) {
      return { success: false, errorMessage: 'Purchases not available in this environment.' };
    }
    const pkg = await getPremiumPackage();
    if (!pkg) {
      return {
        success: false,
        errorMessage: 'No subscription available. Please try again later.',
      };
    }
    const result = await Purchases.purchasePackage(pkg);
    const entitlement = result.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    return { success: !!entitlement };
  } catch (err) {
    logError(err, 'purchasePremium');
    return { success: false, errorMessage: mapPurchaseError(err) };
  }
}

// ─── Restore purchases ────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<{ success: boolean; isPremium: boolean; errorMessage?: string }> {
  try {
    const Purchases = getPurchases();
    if (!Purchases) {
      return { success: false, isPremium: false, errorMessage: 'Purchases not available in this environment.' };
    }
    const customerInfo = await Purchases.restorePurchases();
    const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    return { success: true, isPremium: !!entitlement };
  } catch (err) {
    logError(err, 'restorePurchases');
    return {
      success: false,
      isPremium: false,
      errorMessage: mapPurchaseError(err),
    };
  }
}

// ─── Error mapping ─────────────────────────────────────────────────────────────

function mapPurchaseError(err: unknown): string {
  const code = (err as { code?: number }).code;
  if (code === 1) return 'Purchase was cancelled.';
  if (code === 2) return 'This purchase is not available in your region.';
  if (code === 3) return 'You are not allowed to make purchases on this device.';
  const message = (err as { message?: string }).message ?? '';
  if (message.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  return 'Purchase could not be completed. Please try again.';
}
