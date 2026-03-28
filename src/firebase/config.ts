import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
// firebase exports getReactNativePersistence only under the 'react-native' conditional export,
// but their package.json lists 'types' before 'react-native', so TS picks the browser types first.
// Metro resolves this correctly at runtime. See: https://github.com/firebase/firebase-js-sdk/issues/7135
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { getReactNativePersistence } from '@firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Guard against double-initialization in Expo fast refresh
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Use initializeAuth with AsyncStorage persistence so auth state survives app restarts.
// Falls back to getAuth() on Expo fast refresh when Auth is already initialized.
function getOrInitAuth(firebaseApp: FirebaseApp): Auth {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Auth already initialized (Expo fast refresh)
    return getAuth(firebaseApp);
  }
}

export const firebaseApp: FirebaseApp = app;
export const auth: Auth = getOrInitAuth(app);
export const db: Firestore = getFirestore(app);
