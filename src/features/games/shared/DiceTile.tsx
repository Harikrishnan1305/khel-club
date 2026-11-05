import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '../../../theme/theme';

// 3x3 grid dot indices (0..8) for standard dice faces 1..6
const DICE_DOTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

interface DiceTileProps {
  value: number;
  isRolling: boolean;
}

/** Dice face tile with shake + random faces while rolling. */
export function DiceTile({ value, isRolling }: DiceTileProps) {
  const [face, setFace] = useState<number>(value || 4);
  const rotateDeg = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRolling) {
      rotateDeg.value = withRepeat(
        withSequence(withTiming(-14, { duration: 75 }), withTiming(14, { duration: 75 })),
        -1,
        true,
      );
      scale.value = withSequence(
        withTiming(1.08, { duration: 120 }),
        withTiming(0.96, { duration: 120 }),
      );
      const interval = setInterval(() => {
        setFace(Math.floor(Math.random() * 6) + 1);
      }, 85);
      return () => clearInterval(interval);
    }
    cancelAnimation(rotateDeg);
    rotateDeg.value = withTiming(0, { duration: 120 });
    scale.value = withSequence(
      withTiming(1.12, { duration: 100 }),
      withTiming(1, { duration: 120 }),
    );
    setFace(value || 4);
    return undefined;
  }, [isRolling, value, rotateDeg, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateDeg.value}deg` }, { scale: scale.value }],
  }));

  const dots = DICE_DOTS[face] ?? DICE_DOTS[4];

  return (
    <Animated.View style={[s.tile, animStyle]}>
      <View style={s.grid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={s.cell}>
            {dots.includes(i) && <View style={s.dot} />}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  tile: {
    width: 56,
    height: 56,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.paper,
    padding: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '33.33%', height: '33.33%', alignItems: 'center', justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.violet },
});
