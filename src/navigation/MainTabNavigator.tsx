import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import type { MainTabParamList } from './RootStackParamList';
import { HomeScreen } from '../screens/main/HomeScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { theme } from '../styles/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── Brain + bolt icon (active/inactive tinted by color prop) ─────────────────

function ScanTabIcon({ color }: { color: string }) {
  return (
    <Svg width={26} height={28} viewBox="0 0 100 100">
      {/* Brain */}
      <Ellipse cx={50} cy={43} rx={24} ry={26} fill={color} />
      {/* Brain stem */}
      <Rect x={44} y={67} width={12} height={10} rx={3} fill={color} />
      {/* Lightning bolt */}
      <Polygon
        points="55,24 43,47 52,47 43,64 63,39 54,39"
        fill={color}
        opacity={0.45}
      />
    </Svg>
  );
}

function HistoryTabIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AccountTabIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: `${theme.colors.textSecondary}60`,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="ScanTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color }) => <ScanTabIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <HistoryTabIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => <AccountTabIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.white,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 11,
    fontWeight: '600',
  },
});
