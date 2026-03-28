import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { logError, logMessage } from './crashlytics';
import type { UserProfileDoc, ScanHistoryDoc, ScanResult, AuthProviderType } from '../types';
import { getDefaultTriggerProfile } from '../logic/profileDefaults';

const USERS_COLLECTION = 'users';

// ─── User document ────────────────────────────────────────────────────────────

interface CreateUserDocParams {
  email: string | null;
  authProvider: AuthProviderType;
}

export async function createUserDoc(
  uid: string,
  params: CreateUserDocParams,
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const docData: Omit<UserProfileDoc, 'uid'> = {
      email: params.email,
      authProvider: params.authProvider,
      createdAt: now,
      updatedAt: now,
      onboardingComplete: false,
      profileMode: null,
      triggerProfile: getDefaultTriggerProfile(),
      freeScanCount: 0,
      lastScanAt: null,
    };
    await setDoc(doc(db, USERS_COLLECTION, uid), { uid, ...docData });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { context: 'createUserDoc' });
    throw err;
  }
}

export async function getUserDoc(uid: string): Promise<UserProfileDoc | null> {
  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfileDoc;
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { context: 'getUserDoc' });
    return null;
  }
}

export async function updateUserProfile(
  uid: string,
  partial: Partial<Omit<UserProfileDoc, 'uid' | 'createdAt' | 'authProvider'>>,
): Promise<void> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      ...partial,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { context: 'updateUserProfile' });
    throw err;
  }
}

// ─── Scan limit ───────────────────────────────────────────────────────────────

export function incrementFreeScanCount(uid: string): void {
  updateDoc(doc(db, USERS_COLLECTION, uid), {
    freeScanCount: increment(1),
    lastScanAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).catch((err) => {
    logError(err instanceof Error ? err : new Error(String(err)), { context: 'incrementFreeScanCount' });
  });
}

// ─── Scan history ─────────────────────────────────────────────────────────────

export async function saveScanHistory(uid: string, scanResult: ScanResult): Promise<void> {
  const ref = doc(collection(db, USERS_COLLECTION, uid, 'scans'));

  // Firestore rejects any document containing `undefined` values (even nested in arrays).
  // ScoredTrigger.caveat is optional — strip it when absent rather than writing undefined.
  const sanitizedTriggers = scanResult.scoreResult.scoredTriggers.map((t) => {
    const entry: ScanHistoryDoc['scoredTriggers'][number] = {
      id: t.id,
      displayName: t.displayName,
      category: t.category,
      severity: t.severity,
      confidence: t.confidence,
      matchedPattern: t.matchedPattern,
      explanation: t.explanation,
      userSensitivityAtScan: t.userSensitivityAtScan,
      weightApplied: t.weightApplied,
    };
    if (t.caveat !== undefined) entry.caveat = t.caveat;
    return entry;
  });

  const historyDoc: ScanHistoryDoc = {
    scanId: ref.id,
    userId: uid,
    barcode: scanResult.barcode,
    productName: scanResult.productName,
    brandName: scanResult.brandName ?? null,
    scannedAt: scanResult.scannedAt,
    verdict: scanResult.verdict,
    verdictMessage: scanResult.verdictMessage,
    totalScore: scanResult.scoreResult.totalScore,
    scoredTriggers: sanitizedTriggers,
    triggerProfileSnapshot: scanResult.triggerProfileSnapshot,
    scoringModelVersion: scanResult.scoringModelVersion,
    preprocessorVersion: scanResult.preprocessorVersion,
  };

  setDoc(ref, historyDoc).catch((err) => {
    logError(err instanceof Error ? err : new Error(String(err)), { context: 'saveScanHistory' });
    logMessage(`Failed to save scan history for barcode: ${scanResult.barcode}`);
  });
}

export async function getScanHistory(
  userId: string,
  limitCount = 50,
): Promise<ScanHistoryDoc[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION, userId, 'scans'),
      orderBy('scannedAt', 'desc'),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ScanHistoryDoc);
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { context: 'getScanHistory' });
    return [];
  }
}
