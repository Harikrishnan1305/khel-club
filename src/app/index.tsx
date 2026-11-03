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

const DURATION = 2500;
const GAMES = ['CARROM', 'CHESS', 'SNAKES', 'LUDO'];

export default function SplashScreen() {
  const router = useRouter();
  const progress = useSharedValue(0);

  useEffect(() => {
    // Animate progress bar 0 → 1 over DURATION ms
    progress.value = withTiming(1, {
      duration: DURATION,
      easing: Easing.out(Easing.quad),
    });

    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, DURATION);

    return () => clearTimeout(timer);
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <LinearGradient
      // lavender → white radial-style: top center → bottom
      colors={[colors.lavender, colors.surface]}
      locations={[0, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* Tagline near top */}
      <Text style={styles.tagline}>GOOD TIMES. GREAT GAMES.</Text>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Icon block */}
      <View style={styles.iconWrap}>
        {/* Rotated rounded-square */}
        <View style={styles.iconSquare}>
          <Ionicons name="game-controller-outline" size={36} color={colors.white} />
        </View>
        {/* Saffron dot — top-right of the icon */}
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

      {/* Spacer */}
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
    // 15° rotation
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
