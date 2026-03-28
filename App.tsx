import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import {
  Lora_400Regular,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';

import { initializeRevenueCat } from './src/services/revenueCat';
import { logError } from './src/firebase/crashlytics';
import { AuthProvider } from './src/providers/AuthProvider';
import { SubscriptionProvider } from './src/providers/SubscriptionProvider';
import { UserProfileProvider } from './src/providers/UserProfileProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/styles/theme';

// Keep splash visible until fonts and async init are done
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 400 });

export default function App() {
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Lora_400Regular,
    Lora_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await initializeRevenueCat();
      } catch (err) {
        logError(err instanceof Error ? err : new Error(String(err)), {
          context: 'appInitRevenueCat',
        });
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appReady, fontsLoaded]);

  if (!appReady || !fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <View style={styles.flex} onLayout={onLayoutRootView}>
          <StatusBar style="dark" backgroundColor={theme.colors.background} />
          <AuthProvider>
            <SubscriptionProvider>
              <UserProfileProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </UserProfileProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
