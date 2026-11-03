import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, spacing } from '../theme/theme';

/**
 * Profile setup screen — placeholder until Phase 2.
 */
export default function ProfileSetupScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>Profile Setup</Text>
        <Text style={styles.sub}>Coming soon — Phase 2</Text>
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
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
  },
  sub: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
});

