import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, ViewStyle } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/theme';
import { Button } from '../Button/Button';

interface GameCardProps {
  title: string;
  subtitle?: string;
  playingCount?: number;
  image?: ImageSourcePropType;
  onPlay?: () => void;
  style?: ViewStyle;
}

export function GameCard({ title, subtitle, playingCount, image, onPlay, style }: GameCardProps) {
  return (
    <View style={[styles.card, style]}>
      {image && (
        <Image source={image} style={styles.image} resizeMode="cover" />
      )}
      {!image && <View style={styles.imagePlaceholder} />}
      <View style={styles.body}>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          {playingCount !== undefined && (
            <View style={styles.countRow}>
              <View style={styles.greenDot} />
              <Text style={styles.countText}>{playingCount.toLocaleString()} playing</Text>
            </View>
          )}
        </View>
        <Button label="Play Now" variant="primary" onPress={onPlay} style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 140,
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surfaceAlt,
  },
  body: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  info: { flex: 1, gap: 3 },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  countText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
  btn: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
});

