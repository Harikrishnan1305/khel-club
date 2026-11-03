import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/theme';

export type ChipVariant = 'online' | 'yourTurn' | 'waiting' | 'notConnected';

interface ChipProps {
  variant: ChipVariant;
  label?: string;
  style?: ViewStyle;
}

const chipConfig: Record<ChipVariant, { bg: string; dot: string; text: string; defaultLabel: string }> = {
  online: {
    bg: colors.successSoft,
    dot: colors.success,
    text: colors.success,
    defaultLabel: 'Online',
  },
  yourTurn: {
    bg: colors.surfaceAlt,
    dot: colors.violet,
    text: colors.violet,
    defaultLabel: 'Your Turn',
  },
  waiting: {
    bg: colors.saffronSoft,
    dot: colors.warning,
    text: colors.ink,
    defaultLabel: 'Waiting',
  },
  notConnected: {
    bg: colors.errorSoft,
    dot: colors.error,
    text: colors.error,
    defaultLabel: 'Not Connected',
  },
};

export function Chip({ variant, label, style }: ChipProps) {
  const cfg = chipConfig[variant];
  return (
    <View style={[styles.container, { backgroundColor: cfg.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.text, { color: cfg.text }]}>{label ?? cfg.defaultLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    fontFamily: 'NunitoSans_600SemiBold',
  },
});

