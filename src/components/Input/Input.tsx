import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, helper, containerStyle, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.violet
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, { borderColor }]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textSecondary,
  },
  inputWrap: {
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  input: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textPrimary,
    flex: 1,
  },
  error: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.error,
  },
  helper: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
});

