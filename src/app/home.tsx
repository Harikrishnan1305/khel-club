import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { colors, fontSize, fontWeight, spacing, radius } from '../theme/theme';

/**
 * Home screen — temporary placeholder until Phase 2 tabs are built.
 * Shows the user's name and coin balance so we can confirm onboarding saved correctly.
 */
export default function HomeScreen() {
  const { name, coins, clubId } = useUserStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        {/* Icon */}
        <View style={styles.icon}>
          <Ionicons name="game-controller-outline" size={40} color={colors.violet} />
        </View>

        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>{name || 'Player'} 👋</Text>

        {/* Club ID */}
        {clubId && (
          <View style={styles.clubPill}>
            <Text style={styles.clubText}>{clubId}</Text>
          </View>
        )}

        {/* Coins */}
        <View style={styles.coinsRow}>
          <Ionicons name="logo-bitcoin" size={18} color={colors.saffron} />
          <Text style={styles.coinsText}>{coins} club coins</Text>
        </View>

        <Text style={styles.sub}>Main tabs coming in Phase 2</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
  name: {
    fontSize: fontSize.display,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  clubPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  clubText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
    letterSpacing: 1.5,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  coinsText: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  sub: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});

