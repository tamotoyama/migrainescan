import type { ScanResult, ScanHistoryDoc } from '../types';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  WelcomeAuth: undefined;
  SignUp: undefined;
  SignIn: undefined;
  ForgotPassword: undefined;
};

// ─── Onboarding Stack ─────────────────────────────────────────────────────────

export type OnboardingStackParamList = {
  OnboardingIntro: undefined;
  ProfileMode: undefined;
  TriggerSelection: undefined;
  TriggerSensitivity: undefined;
  HowItWorks: undefined;
};

// ─── Main Tab Navigator ───────────────────────────────────────────────────────

export type MainTabParamList = {
  ScanTab: undefined;
  HistoryTab: undefined;
  AccountTab: undefined;
};

// ─── Main Stack (inside each tab or modal) ────────────────────────────────────

export type MainStackParamList = {
  Home: undefined;
  Scanner: undefined;
  Result: { scanResult: ScanResult };
  History: undefined;
  Profile: undefined;
  Disclaimer: undefined;
  Paywall: { source?: string };
};

// ─── Root Navigator ───────────────────────────────────────────────────────────

export type RootStackParamList = {
  AuthLoading: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  Scanner: undefined;
  ResultModal: { scanResult: ScanResult };
  PaywallModal: { source?: string };
  Disclaimer: undefined;
  EditTriggerSensitivityModal: undefined;
  EditProfileModeModal: undefined;
  HistoryDetail: { scan: ScanHistoryDoc };
};
