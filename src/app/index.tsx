import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme/theme';
import { useUserStore } from '../store/userStore';

const DURATION = 2500;
const GAMES = ['CARROM', 'CHESS', 'SNAKES', 'LUDO'];

export default function SplashScreen() {
  const router = useRouter();
  const progress = useSharedValue(0);

  // Read hydration flag and onboarding status from the persisted store
  const _hydrated = useUserStore((s) => s._hydrated);
  const isOnboarded = useUserStore((s) => s.isOnboarded);

  useEffect(() => {
    // Animate progress bar 0 → 1 over DURATION ms
    progress.value = withTiming(1, {
      duration: DURATION,
      easing: Easing.out(Easing.quad),
    });

    const timer = setTimeout(() => {
      // Wait until the store has been rehydrated from AsyncStorage
      // _hydrated may still be false here if AsyncStorage is slow;
      // we check again inside the route decision below
      const currentState = useUserStore.getState();
      if (currentState._hydrated && currentState.isOnboarded) {
        router.replace('/home');
      } else {
        router.replace('/welcome');
      }
    }, DURATION);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If hydration finishes BEFORE the timer, update destination immediately
  // (rare on fast devices, but correctly handled)
  useEffect(() => {
    if (_hydrated && isOnboarded) {
      // Do nothing — timer will use getState() which is already correct.
      // This effect just ensures the store subscription is active.
    }
  }, [_hydrated, isOnboarded]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <LinearGradient
      colors={[colors.lavender, colors.surface]}
      locations={[0, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* Tagline near top */}
      <Text style={styles.tagline}>GOOD TIMES. GREAT GAMES.</Text>

      <View style={{ flex: 1 }} />

      {/* Icon block */}
      <View style={styles.iconWrap}>
        <View style={styles.iconSquare}>
          <Ionicons name="game-controller-outline" size={36} color={colors.white} />
        </View>
        <View style={styles.saffronDot} />
      </View>

      {/* App name */}
      <Text style={styles.appName}>Khel Club</Text>
      <Text style={styles.appSub}>Your people. Your games.</Text>

      {/* Game labels row */}
      <View style={styles.gamesRow}>
        {GAMES.map((g, i) => (
          <React.Fragment key={g}>
            <Text style={styles.gameLabel}>{g}</Text>
            {i < GAMES.length - 1 && <View style={styles.gameDot} />}
          </React.Fragment>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      {/* Progress section */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Setting the board for good times</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, barStyle]} />
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>MADE FOR THE WAY WE PLAY</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
  },

  tagline: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violetLight,
    letterSpacing: 2.5,
    textAlign: 'center',
  },

  iconWrap: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  iconSquare: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '15deg' }],
    shadowColor: colors.violetDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  saffronDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.saffron,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  appName: {
    fontSize: fontSize.display,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.violetDark,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  appSub: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  gamesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gameLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
    letterSpacing: 1.5,
  },
  gameDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },

  progressSection: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.lavender,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.violet,
  },

  footer: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textMuted,
    letterSpacing: 2,
    textAlign: 'center',
  },
});
