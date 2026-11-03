import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme/theme';
import { Button } from '../components/Button';
import { OtpInput } from '../components/OtpInput';

const CORRECT_CODE = '482619';
const RESEND_SECONDS = 30;

function formatPhone(digits: string) {
  // Format 10 digits as XXXXX XXXXX
  const d = digits.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 5) return d;
  return d.slice(0, 5) + ' ' + d.slice(5);
}

function formatTime(secs: number) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const displayPhone = `+91 ${formatPhone(phone ?? '')}`;

  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setCountdown(RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handleVerify = () => {
    if (code.length < 6) return;
    setLoading(true);
    // Simulate async check
    setTimeout(() => {
      setLoading(false);
      if (code === CORRECT_CODE) {
        router.replace('/profile-setup');
      } else {
        setError(true);
      }
    }, 600);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCode('');
    setError(false);
    startTimer();
  };

  const handleChangeCode = (val: string) => {
    setCode(val);
    if (error) setError(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verify your number</Text>
            <View style={styles.shieldWrap}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.violet} />
            </View>
          </View>

          {/* ── Lavender icon tile ── */}
          <View style={styles.iconTile}>
            <Ionicons name="chatbubble-ellipses-outline" size={30} color={colors.violet} />
          </View>

          {/* ── Title + body ── */}
          <Text style={styles.title}>Check your messages</Text>
          <Text style={styles.body}>
            Enter the 6-digit code sent to{' '}
            <Text style={styles.phoneHighlight}>{displayPhone}</Text>
            {'. It\'s valid for 5 minutes.'}
          </Text>

          {/* ── Change number link ── */}
          <TouchableOpacity onPress={() => router.back()} style={styles.changeRow} hitSlop={8}>
            <Text style={styles.changeLink}>Change number</Text>
          </TouchableOpacity>

          {/* ── OTP Input ── */}
          <Text style={styles.inputLabel}>Verification code</Text>
          <OtpInput value={code} onChange={handleChangeCode} />

          {/* ── Error box ── */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
              <View style={styles.errorTextWrap}>
                <Text style={styles.errorTitle}>That code doesn't match</Text>
                <Text style={styles.errorBody}>
                  Check the SMS and enter all 6 digits again. If your code has expired, request a new one.
                </Text>
                <TouchableOpacity onPress={handleResend} hitSlop={8}>
                  <Text style={styles.errorResend}>Send a new code →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Verify button ── */}
          <Button
            label="Verify & continue"
            variant="primary"
            disabled={code.length < 6}
            loading={loading}
            onPress={handleVerify}
            style={styles.cta}
          />

          {/* ── Resend row ── */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive a code?</Text>
            {countdown > 0 ? (
              <Text style={styles.resendCountdown}>
                Resend code in {formatTime(countdown)}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} hitSlop={8}>
                <Text style={styles.resendLink}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Info card ── */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.violet} />
            </View>
            <Text style={styles.infoText}>
              Keep your code private. Khel Club will never ask you to share it.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  shieldWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon tile
  iconTile: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },

  // Text
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    lineHeight: 36,
  },
  body: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  phoneHighlight: {
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },

  // Change number
  changeRow: { alignSelf: 'flex-start', marginTop: -spacing.xs },
  changeLink: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Label
  inputLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: -spacing.xs,
  },

  // Error box
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorTextWrap: { flex: 1, gap: spacing.xs },
  errorTitle: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.error,
  },
  errorBody: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorResend: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.error,
    marginTop: spacing.xs,
  },

  // CTA
  cta: { marginTop: spacing.xs },

  // Resend
  resendRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  resendLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
  resendCountdown: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

