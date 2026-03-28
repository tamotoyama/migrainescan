import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SplashScreenView } from '../../components/splash/SplashScreenView';

export function AuthLoadingScreen() {
  return <SplashScreenView />;
}

const _styles = StyleSheet.create({
  container: { flex: 1 },
});
