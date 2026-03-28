import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Polygon, Rect } from 'react-native-svg';
import { theme } from '../../styles/theme';

const { width } = Dimensions.get('window');

function AppIcon() {
  return (
    <View style={styles.iconContainer}>
      <Svg width={52} height={56} viewBox="0 0 100 100">
        {/* Brain */}
        <Ellipse cx={50} cy={43} rx={24} ry={26} fill="white" />
        {/* Brain stem */}
        <Rect x={44} y={67} width={12} height={10} rx={3} fill="white" />
        {/* Lightning bolt */}
        <Polygon
          points="55,24 43,47 52,47 43,64 63,39 54,39"
          fill="rgba(29,78,216,0.75)"
        />
      </Svg>
    </View>
  );
}

export function SplashScreenView() {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1600,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.6],
  });

  return (
    <LinearGradient
      colors={theme.gradients.splash as [string, string]}
      start={{ x: 0.8, y: 0 }}
      end={{ x: 0.2, y: 1 }}
      style={styles.container}
    >
      <View style={styles.centerContent}>
        <AppIcon />
        <Text style={styles.wordmark}>MigraineScan</Text>
        <Text style={styles.tagline}>Migraine trigger food scanning</Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      <Text style={styles.byline}>by SafeScan Systems</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
    marginBottom: theme.spacing.sm,
  },
  wordmark: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: theme.fontFamily.sans,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  byline: {
    position: 'absolute',
    bottom: 28,
    fontFamily: theme.fontFamily.sans,
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.4,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.6,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
});
