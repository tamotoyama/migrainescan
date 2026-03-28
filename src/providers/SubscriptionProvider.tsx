import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  getCustomerStatus,
  purchasePremium,
  restorePurchases,
  identifyRevenueCatUser,
  resetRevenueCatUser,
} from '../services/revenueCat';
import { logError } from '../firebase/crashlytics';
import { useAuth } from '../hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubscriptionState {
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  purchase: () => Promise<{ success: boolean; error?: string }>;
  restore: () => Promise<{ success: boolean; isPremium: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const SubscriptionContext = createContext<SubscriptionState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const status = await getCustomerStatus();
      setIsPremium(status.isPremium);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load subscription status.';
      setError(message);
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'fetchSubscriptionStatus' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Identify user with RevenueCat when auth state changes
  useEffect(() => {
    if (user) {
      identifyRevenueCatUser(user.uid).catch((err) => {
        logError(err instanceof Error ? err : new Error(String(err)), { context: 'identifyRevenueCatUser' });
      });
    } else {
      resetRevenueCatUser().catch((err) => {
        logError(err instanceof Error ? err : new Error(String(err)), { context: 'resetRevenueCatUser' });
      });
      setIsPremium(false);
      setLoading(false);
      return;
    }

    fetchStatus();
  }, [user, fetchStatus]);

  const purchase = useCallback(async () => {
    try {
      setError(null);
      const result = await purchasePremium();
      if (result.success) setIsPremium(true);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Purchase failed.';
      setError(message);
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'purchase' });
      return { success: false, error: message };
    }
  }, []);

  const restore = useCallback(async () => {
    try {
      setError(null);
      const result = await restorePurchases();
      if (result.isPremium) setIsPremium(true);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Restore failed.';
      setError(message);
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'restore' });
      return { success: false, isPremium: false, error: message };
    }
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{ isPremium, loading, error, purchase, restore, refresh: fetchStatus }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
