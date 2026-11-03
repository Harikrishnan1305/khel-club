import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/theme';

export type ButtonVariant = 'primary' | 'soft' | 'outline' | 'dark' | 'disabled';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle; pressedBg: string }
> = {
  primary: {
    container: { backgroundColor: colors.violet },
    text: { color: colors.white },
    pressedBg: colors.violetDark,
  },
  soft: {
    container: { backgroundColor: colors.surfaceAlt },
    text: { color: colors.violet },
    pressedBg: '#E5E1FA',
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.violet,
    },
    text: { color: colors.violet },
    pressedBg: colors.surfaceAlt,
  },
  dark: {
    container: { backgroundColor: colors.textPrimary },
    text: { color: colors.white },
    pressedBg: '#0D0D1A',
  },
  disabled: {
    container: { backgroundColor: colors.border },
    text: { color: colors.textMuted },
    pressedBg: colors.border,
  },
};

export function Button({
  label,
  variant = 'primary',
  onPress,
  leftIcon,
  loading = false,
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const effectiveVariant: ButtonVariant = disabled ? 'disabled' : variant;
  const vStyle = variantStyles[effectiveVariant];

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.75}
      onPress={disabled || loading ? undefined : onPress}
      style={[styles.base, vStyle.container, style]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text.color as string} />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
          <Text style={[styles.label, vStyle.text, textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 17,
    minWidth: 44,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    fontFamily: 'NunitoSans_700Bold',
  },
});

