import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { UserProfileDoc, TriggerProfile } from '../types';
import {
  getUserDoc,
  updateUserProfile,
} from '../firebase/firestore';
import { logError } from '../firebase/crashlytics';
import { useAuth } from '../hooks/useAuth';
import {
  applyConservativeDefaults,
  computePersonalizationCompletion,
  isProfileCompleteEnough,
} from '../logic/profileDefaults';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfileState {
  userDoc: UserProfileDoc | null;
  loading: boolean;
  error: string | null;
  triggerProfile: TriggerProfile;
  profileComplete: boolean;
  onboardingComplete: boolean;
  personalizationCompletion: ReturnType<typeof computePersonalizationCompletion>;
  saveProfile: (updates: Partial<UserProfileDoc>) => Promise<void>;
  refresh: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const UserProfileContext = createContext<UserProfileState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState<UserProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setUserDoc(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const doc = await getUserDoc(user.uid);
      setUserDoc(doc);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load profile.';
      setError(message);
      logError(err instanceof Error ? err : new Error(String(err)), { context: 'fetchUserProfile' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = useCallback(
    async (updates: Partial<UserProfileDoc>) => {
      if (!user) return;
      try {
        await updateUserProfile(user.uid, updates);
        setUserDoc((prev) => (prev ? { ...prev, ...updates } : null));
      } catch (err) {
        logError(err instanceof Error ? err : new Error(String(err)), { context: 'saveProfile' });
        throw err;
      }
    },
    [user],
  );

  const triggerProfile: TriggerProfile = applyConservativeDefaults(
    userDoc?.triggerProfile ?? {},
  );

  const profileComplete = isProfileCompleteEnough(triggerProfile);
  const onboardingComplete = userDoc?.onboardingComplete ?? false;
  const personalizationCompletion = computePersonalizationCompletion(triggerProfile);

  return (
    <UserProfileContext.Provider
      value={{
        userDoc,
        loading,
        error,
        triggerProfile,
        profileComplete,
        onboardingComplete,
        personalizationCompletion,
        saveProfile,
        refresh: fetchProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}
