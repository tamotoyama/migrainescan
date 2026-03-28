import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './RootStackParamList';
import { OnboardingIntroScreen } from '../screens/onboarding/OnboardingIntroScreen';
import { ProfileModeScreen } from '../screens/onboarding/ProfileModeScreen';
import { TriggerSelectionScreen } from '../screens/onboarding/TriggerSelectionScreen';
import { TriggerSensitivityScreen } from '../screens/onboarding/TriggerSensitivityScreen';
import { HowItWorksScreen } from '../screens/onboarding/HowItWorksScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingIntro"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="OnboardingIntro" component={OnboardingIntroScreen} />
      <Stack.Screen name="ProfileMode" component={ProfileModeScreen} />
      <Stack.Screen name="TriggerSelection" component={TriggerSelectionScreen} />
      <Stack.Screen name="TriggerSensitivity" component={TriggerSensitivityScreen} />
      <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
    </Stack.Navigator>
  );
}
