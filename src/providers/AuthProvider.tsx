import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithApple,
  signOut as firebaseSignOut,
  sendPasswordReset,
  subscribeToAuthState,
} from '../firebase/auth';
import { logError } from '../firebase/crashlytics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInApple: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        await signUpWithEmail(email, password);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign up failed.';
        setError(message);
        logError(err instanceof Error ? err : new Error(String(err)), { context: 'signUp' });
        return { success: false, error: message };
      }
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        await signInWithEmail(email, password);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign in failed.';
        setError(message);
        logError(err instanceof Error ? err : new Error(String(err)), { context: 'signIn' });
        return { success: false, error: message };
      }
    },
    [],
  );

  const signInApple = useCallback(async () => {
    try {
      setError(null);
      await signInWithApple();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Apple sign in failed.';
      setError(message);
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'signInApple' });
      return { success: false, error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'signOut' });
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordReset(email);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send reset email.';
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'resetPassword' });
      return { success: false, error: message };
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signUp, signIn, signInApple, signOut, resetPassword, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
