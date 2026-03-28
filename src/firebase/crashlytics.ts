// Crashlytics wrapper — never throws, never crashes the app.
// In development builds, errors are logged to console only.
// In production builds with @react-native-firebase/crashlytics,
// import crashlytics from '@react-native-firebase/crashlytics' and uncomment.

export function logError(err: unknown, context?: string | { context: string }): void {
  try {
    const contextStr = typeof context === 'object' && context !== null ? context.context : context;
    const message = err instanceof Error ? err.message : String(err);
    if (__DEV__) {
      console.error(`[Crashlytics] ${contextStr ? `(${contextStr}) ` : ''}${message}`, err);
    }
    // Production:
    // const cl = crashlytics();
    // if (context) cl.log(context);
    // cl.recordError(err instanceof Error ? err : new Error(message));
  } catch {
    // Crashlytics itself must never crash the app
  }
}

export function logMessage(message: string): void {
  try {
    if (__DEV__) {
      console.warn(`[Crashlytics] ${message}`);
    }
    // Production:
    // crashlytics().log(message);
  } catch {
    // Silent
  }
}

export function setAttribute(key: string, value: string): void {
  try {
    // Production:
    // crashlytics().setAttribute(key, value);
  } catch {
    // Silent
  }
}
