import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './RootStackParamList';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { MainTabNavigator } from './MainTabNavigator';
import { ResultScreen } from '../screens/main/ResultScreen';
import { ScannerScreen } from '../screens/main/ScannerScreen';
import { PaywallScreen } from '../screens/modals/PaywallScreen';
import { DisclaimerScreen } from '../screens/main/DisclaimerScreen';
import { EditTriggerSensitivityScreen } from '../screens/modals/EditTriggerSensitivityScreen';
import { EditProfileModeScreen } from '../screens/modals/EditProfileModeScreen';
import { HistoryDetailScreen } from '../screens/main/HistoryDetailScreen';
import { AuthLoadingScreen } from '../screens/auth/AuthLoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

const Root = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { onboardingComplete, loading: profileLoading } = useUserProfile();

  if (authLoading || (user && profileLoading)) {
    return <AuthLoadingScreen />;
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Root.Screen name="Auth" component={AuthStack} />
      ) : !onboardingComplete ? (
        <Root.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <>
          <Root.Screen name="Main" component={MainTabNavigator} />
          <Root.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
          />
          <Root.Screen
            name="ResultModal"
            component={ResultScreen}
            options={{ animation: 'slide_from_bottom', presentation: 'card' }}
          />
          <Root.Screen
            name="PaywallModal"
            component={PaywallScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Root.Screen
            name="Disclaimer"
            component={DisclaimerScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Root.Screen
            name="EditTriggerSensitivityModal"
            component={EditTriggerSensitivityScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Root.Screen
            name="EditProfileModeModal"
            component={EditProfileModeScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Root.Screen
            name="HistoryDetail"
            component={HistoryDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Root.Navigator>
  );
}
