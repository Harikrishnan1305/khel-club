import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/theme';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
}

export function OtpInput({ value, onChange }: OtpInputProps) {
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  // Use React.ElementRef<typeof TextInput> for correct ref type
  const refs = useRef<Array<React.ElementRef<typeof TextInput> | null>>([]);

  const digits = value.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);

  const handleChange = (text: string, idx: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const arr = [...digits];
    arr[idx] = digit;
    const next = arr.join('');
    onChange(next);
    if (digit && idx < OTP_LENGTH - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    idx: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, idx) => {
        const isFocused = focusedIdx === idx;
        return (
          <View
            key={idx}
            style={[
              styles.box,
              isFocused && styles.boxFocused,
              digit ? styles.boxFilled : null,
            ]}
          >
            <TextInput
              ref={(r) => {
                refs.current[idx] = r;
              }}
              style={styles.boxText}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(t) => handleChange(t, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              onFocus={() => setFocusedIdx(idx)}
              onBlur={() => setFocusedIdx(null)}
              selectionColor={colors.violet}
              caretHidden
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderColor: colors.violet,
    borderWidth: 2,
  },
  boxFilled: {
    borderColor: colors.violetLight,
  },
  boxText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textPrimary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
});
