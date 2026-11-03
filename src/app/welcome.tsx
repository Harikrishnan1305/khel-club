import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme/theme';
import { Button } from '../components/Button';

// Hero image — a real 1×1 placeholder PNG lives at this path so Metro
// always resolves it. Replace welcome_hero.png with the real Figma export.
const heroSource = require('../../assets/images/welcome_hero.png');
/** True once a real hero image (>1 KB) has been dropped in. */
const HERO_READY = false; // flip to true after adding the real asset

interface FeatureRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
}

function FeatureRow({ icon, title, subtitle }: FeatureRowProps) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureTile}>
        <Ionicons name={icon} size={22} color={colors.violet} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSub}>{subtitle}</Text>
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.wordmark}>khel club.</Text>
          <TouchableOpacity onPress={() => router.replace('/sign-in')} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Hero image / placeholder */}
        {HERO_READY ? (
          <Image
            source={heroSource}
            style={styles.hero}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Ionicons name="image-outline" size={48} color={colors.violetLight} />
            <Text style={styles.heroPlaceholderText}>welcome_hero.png</Text>
          </View>
        )}

        {/* Welcome chip */}
        <View style={styles.chipWrap}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>WELCOME TO YOUR CLUB</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>A little friendly{'\n'}competition?</Text>

        {/* Body */}
        <Text style={styles.body}>
          Bring your people together. Rediscover the games you grew up with, wherever you are.
        </Text>

        {/* Feature rows */}
        <View style={styles.features}>
          <FeatureRow
            icon="people-outline"
            title="Play with friends"
            subtitle="One room. All your favourite people."
          />
          <FeatureRow
            icon="grid-outline"
            title="Four games, one place"
            subtitle="Carrom, Chess, Snakes & Ladders and Ludo."
          />
        </View>

        {/* CTA */}
        <Button
          label="Get Started"
          variant="primary"
          onPress={() => router.push('/sign-in')}
          leftIcon={
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          }
          style={styles.cta}
        />

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Just play. No cash stakes. Always good company.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  wordmark: {
    fontSize: fontSize.xl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.violet,
    letterSpacing: -0.5,
  },
  skip: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textMuted,
  },

  // Hero
  hero: {
    width: '100%',
    height: 260,
    borderRadius: 28,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  heroPlaceholder: {
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  heroPlaceholderText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.violetLight,
  },

  // Chip
  chipWrap: { marginBottom: spacing.sm },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
    letterSpacing: 1.5,
  },

  // Text
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },

  // Features
  features: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  featureSub: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    marginTop: 2,
  },

  // CTA
  cta: { marginBottom: spacing.md },

  // Footer
  footerNote: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
