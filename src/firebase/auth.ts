import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  OAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  User,
  NextOrObserver,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth } from './config';
import { createUserDoc } from './firestore';
import { logError } from './crashlytics';

// ─── Email / password ────────────────────────────────────────────────────────

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<User> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    await createUserDoc(user.uid, {
      email: user.email,
      authProvider: 'password',
    });
    return user;
  } catch (err) {
    logError(err, 'signUpWithEmail');
    throw mapAuthError(err);
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (err) {
    logError(err, 'signInWithEmail');
    throw mapAuthError(err);
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    logError(err, 'sendPasswordReset');
    throw mapAuthError(err);
  }
}

// ─── Apple Sign In ────────────────────────────────────────────────────────────

export async function signInWithApple(): Promise<User> {
  try {
    const nonce = generateNonce(32);
    const hashedNonce = await digestStringAsync(nonce);

    const appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    const { identityToken } = appleCredential;
    if (!identityToken) {
      throw new Error('Apple Sign In failed: no identity token returned');
    }

    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({
      idToken: identityToken,
      rawNonce: nonce,
    });

    const result = await signInWithCredential(auth, firebaseCredential);
    const user = result.user;

    // Only create a doc for genuinely new users
    if (result.operationType === 'signIn') {
      const metadata = user.metadata;
      const isNew = metadata.creationTime === metadata.lastSignInTime;
      if (isNew) {
        await createUserDoc(user.uid, {
          email: user.email,
          authProvider: 'apple',
        });
      }
    }

    return user;
  } catch (err) {
    if ((err as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Apple Sign In was cancelled');
    }
    logError(err, 'signInWithApple');
    throw mapAuthError(err);
  }
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    logError(err, 'signOut');
    throw mapAuthError(err);
  }
}

// ─── Auth state subscription ──────────────────────────────────────────────────

export function subscribeToAuthState(callback: NextOrObserver<User | null>) {
  return onAuthStateChanged(auth, callback);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapAuthError(err: unknown): Error {
  const code = (err as { code?: string }).code ?? '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/configuration-not-found': 'Authentication is not configured for this app. Please contact support.',
  };
  return new Error(messages[code] ?? 'Something went wrong. Please try again.');
}

function generateNonce(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function digestStringAsync(input: string): Promise<string> {
  // Expo Crypto is available via expo-crypto — use a simple implementation
  // for the nonce hash. In production builds, expo-crypto provides SHA-256.
  try {
    const { digestStringAsync: expoDigest, CryptoDigestAlgorithm } =
      await import('expo-crypto');
    return await expoDigest(CryptoDigestAlgorithm.SHA256, input);
  } catch {
    // Fallback: return input as-is (Expo Go limitation — dev builds work correctly)
    return input;
  }
}
