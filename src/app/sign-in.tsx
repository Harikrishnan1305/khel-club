import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme/theme';
import { Button } from '../components/Button';

export default function SignInScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const isReady = phone.replace(/\D/g, '').length === 10;

  const handleSend = () => {
    if (!isReady) return;
    router.push({ pathname: '/otp', params: { phone: phone.replace(/\D/g, '') } });
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
          {/* ── Header row ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your club awaits</Text>
            <View style={styles.shieldWrap}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.violet} />
            </View>
          </View>

          {/* ── Lavender icon tile ── */}
          <View style={styles.iconTile}>
            <Ionicons name="game-controller-outline" size={30} color={colors.violet} />
          </View>

          {/* ── Title + body ── */}
          <Text style={styles.title}>Good games start{'\n'}with you.</Text>
          <Text style={styles.body}>
            Sign in or join the club with your mobile number. We'll send you a verification code.
          </Text>

          {/* ── Phone input ── */}
          <Text style={styles.inputLabel}>Mobile number</Text>
          <View style={styles.inputWrap}>
            <View style={styles.prefix}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <View style={styles.divider} />
            <TextInput
              style={styles.textInput}
              placeholder="98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
              returnKeyType="done"
              onSubmitEditing={handleSend}
            />
          </View>
          <Text style={styles.helper}>A 6-digit code will arrive by SMS.</Text>

          {/* ── Primary CTA ── */}
          <Button
            label="Send verification code"
            variant="primary"
            disabled={!isReady}
            onPress={handleSend}
            leftIcon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={isReady ? colors.white : colors.textMuted}
              />
            }
            style={styles.cta}
          />

          {/* ── OR divider ── */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          {/* ── Google button ── */}
          <Button
            label="Continue with Google"
            variant="outline"
            onPress={() => router.replace('/profile-setup')}
            leftIcon={
              <Text style={styles.googleG}>G</Text>
            }
          />

          {/* ── Saffron info box ── */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.saffron} />
            <Text style={styles.infoText}>
              A real community. Just games and good company — never cash stakes.
            </Text>
          </View>

          {/* ── Footer ── */}
          <Text style={styles.footer}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {' '}&{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
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

  // Input
  inputLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: -spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flag: { fontSize: fontSize.lg },
  prefixText: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textPrimary,
    height: '100%',
  },
  helper: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },

  // CTA
  cta: { marginTop: spacing.xs },

  // OR divider
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textMuted,
  },

  // Google G
  googleG: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.violet,
  },

  // Saffron info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.saffronSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.saffron,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Footer
  footer: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },
});
