import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType, ViewStyle } from 'react-native';
import { colors, fontSize, fontWeight } from '../../theme/theme';

export type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  source?: ImageSourcePropType;
  initials?: string;
  online?: boolean;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, number> = { sm: 32, md: 44, lg: 64 };
const fontMap: Record<AvatarSize, number> = { sm: fontSize.xs, md: fontSize.md, lg: fontSize.xl };
const dotMap: Record<AvatarSize, number> = { sm: 8, md: 10, lg: 14 };

export function Avatar({ source, initials = '?', online = false, size = 'md', style }: AvatarProps) {
  const dim = sizeMap[size];
  const fSize = fontMap[size];
  const dotSize = dotMap[size];

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.circle, { width: dim, height: dim, borderRadius: dim / 2 }]}>
        {source ? (
          <Image source={source} style={{ width: dim, height: dim, borderRadius: dim / 2 }} />
        ) : (
          <Text style={[styles.initials, { fontSize: fSize }]}>
            {initials.slice(0, 2).toUpperCase()}
          </Text>
        )}
      </View>
      {online && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', alignSelf: 'flex-start' },
  circle: {
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: fontWeight.bold,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.violet,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});

