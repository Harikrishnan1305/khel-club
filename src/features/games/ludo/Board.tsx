import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Rect, Circle, Polygon, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, radius } from '../../../theme/theme';
import {
  GRID,
  TRACK,
  HOME_COLUMN,
  START_TRACK_INDICES,
  STAR_TRACK_INDICES,
  COLOR_ORDER,
  YARD_ORIGIN,
  FINISHED,
  START_INDEX,
  tokenGridPosition,
  type LudoColor,
  type LudoToken,
  type GridPoint,
} from './logic';
import { LUDO_COLOR_META, type LudoActiveMove } from './store';

export const STEP_MS = 180;
export const CAPTURE_MS = 380;

function starPoints(cx: number, cy: number, outer: number): string {
  const inner = outer * 0.42;
  const pts: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(' ');
}

function sharedOffset(index: number, size: number, cell: number): GridPoint {
  if (size <= 1) return { x: 0, y: 0 };
  const d = cell * 0.17;
  if (size === 2) return index === 0 ? { x: -d, y: 0 } : { x: d, y: 0 };
  const o = [
    { x: -d, y: -d },
    { x: d, y: -d },
    { x: -d, y: d },
    { x: d, y: d },
  ];
  return o[index % o.length];
}

function walkPath(move: LudoActiveMove): number[] {
  if (move.from === 0) return [1];
  const out: number[] = [];
  for (let p = move.from + 1; p <= move.to; p += 1) out.push(p);
  return out;
}

export function moveDuration(move: LudoActiveMove): number {
  return walkPath(move).length * STEP_MS;
}

interface TokenViewProps {
  token: LudoToken;
  cell: number;
  size: number;
  offset: GridPoint;
  isMovable: boolean;
  activeMove: LudoActiveMove | null;
  onPress: (id: string) => void;
}

function TokenView({ token, cell, size, offset, isMovable, activeMove, onPress }: TokenViewProps) {
  const pos = tokenGridPosition(token.color, token.index, token.progress);
  const finalX = pos.x * cell + offset.x - size / 2;
  const finalY = pos.y * cell + offset.y - size / 2;

  const tx = useSharedValue(finalX);
  const ty = useSharedValue(finalY);
  const scale = useSharedValue(1);
  const pulse = useSharedValue(0);
  const handled = useRef(0);

  useEffect(() => {
    const isMover = activeMove?.tokenId === token.id;
    const wasCaptured = activeMove?.captured.includes(token.id) ?? false;

    if (activeMove && activeMove.nonce !== handled.current && (isMover || wasCaptured)) {
      handled.current = activeMove.nonce;

      if (isMover) {
        const path = walkPath(activeMove);
        const xs: number[] = [];
        const ys: number[] = [];
        path.forEach((p, i) => {
          const last = i === path.length - 1;
          const g = tokenGridPosition(token.color, token.index, p);
          xs.push(
            withTiming<number>(g.x * cell + (last ? offset.x : 0) - size / 2, {
              duration: STEP_MS,
              easing: Easing.inOut(Easing.quad),
            }),
          );
          ys.push(
            withTiming<number>(g.y * cell + (last ? offset.y : 0) - size / 2, {
              duration: STEP_MS,
              easing: Easing.inOut(Easing.quad),
            }),
          );
        });
        if (xs.length === 1) {
          tx.value = xs[0];
          ty.value = ys[0];
        } else if (xs.length > 1) {
          tx.value = withSequence<number>(xs[0], ...xs.slice(1));
          ty.value = withSequence<number>(ys[0], ...ys.slice(1));
        }
        scale.value = withSequence(
          withTiming(1.15, { duration: 120 }),
          withTiming(1, { duration: 160 }),
        );
      } else {
        // Captured: wait for the capturer to arrive, then fly back to the yard
        const delay = moveDuration(activeMove);
        tx.value = withDelay(
          delay,
          withTiming<number>(finalX, { duration: CAPTURE_MS, easing: Easing.inOut(Easing.cubic) }),
        );
        ty.value = withDelay(
          delay,
          withTiming<number>(finalY, { duration: CAPTURE_MS, easing: Easing.inOut(Easing.cubic) }),
        );
        scale.value = withDelay(
          delay,
          withSequence(
            withTiming(0.7, { duration: CAPTURE_MS / 2 }),
            withTiming(1, { duration: CAPTURE_MS / 2 }),
          ),
        );
      }
      return;
    }

    tx.value = withTiming(finalX, { duration: 200 });
    ty.value = withTiming(finalY, { duration: 200 });
  }, [activeMove, cell, finalX, finalY, offset.x, offset.y, size, token.color, token.id, token.index, tx, ty, scale]);

  useEffect(() => {
    if (isMovable) {
      pulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 520 }), withTiming(0, { duration: 520 })),
        -1,
        false,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = 0;
    }
  }, [isMovable, pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.22 }],
    opacity: 0.55 + pulse.value * 0.45,
  }));

  const ringSize = size + 8;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[s.tokenWrap, { width: size, height: size, zIndex: isMovable ? 5 : 2 }, style]}
    >
      {isMovable && (
        <Animated.View
          pointerEvents="none"
          style={[
            s.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              left: -4,
              top: -4,
            },
            ringStyle,
          ]}
        />
      )}
      <Pressable
        disabled={!isMovable}
        hitSlop={10}
        onPress={() => onPress(token.id)}
        style={[
          s.token,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: LUDO_COLOR_META[token.color].hex,
          },
        ]}
      >
        <View
          style={[
            s.gloss,
            { width: size * 0.34, height: size * 0.34, borderRadius: size * 0.17, top: size * 0.14, left: size * 0.16 },
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

export interface LudoBoardProps {
  tokens: LudoToken[];
  movable: string[];
  highlightMovable: boolean;
  activeMove: LudoActiveMove | null;
  onTokenPress: (tokenId: string) => void;
  onMoveComplete?: () => void;
  onCapture?: () => void;
  onReachHome?: () => void;
}

export function Board({
  tokens,
  movable,
  highlightMovable,
  activeMove,
  onTokenPress,
  onMoveComplete,
  onCapture,
  onReachHome,
}: LudoBoardProps) {
  const { width } = useWindowDimensions();
  const boardSize = Math.max(260, Math.floor(width - spacing.pageMargin * 2));
  const cell = boardSize / GRID;
  const tokenSize = cell * 0.7;

  const completeRef = useRef(onMoveComplete);
  const captureRef = useRef(onCapture);
  const homeRef = useRef(onReachHome);
  completeRef.current = onMoveComplete;
  captureRef.current = onCapture;
  homeRef.current = onReachHome;

  useEffect(() => {
    if (!activeMove) return undefined;
    const walk = moveDuration(activeMove);
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (activeMove.captured.length > 0) {
      timers.push(setTimeout(() => captureRef.current?.(), walk));
    }
    if (activeMove.reachedHome) {
      timers.push(setTimeout(() => homeRef.current?.(), walk));
    }
    const total = walk + (activeMove.captured.length > 0 ? CAPTURE_MS : 0) + 60;
    timers.push(setTimeout(() => completeRef.current?.(), total));
    return () => timers.forEach(clearTimeout);
  }, [activeMove]);

  const offsets = useMemo(() => {
    const groups = new Map<string, string[]>();
    tokens.forEach((t) => {
      if (t.progress <= 0 || t.progress >= FINISHED) return;
      const p = tokenGridPosition(t.color, t.index, t.progress);
      const key = `${p.x},${p.y}`;
      groups.set(key, [...(groups.get(key) ?? []), t.id]);
    });
    const res = new Map<string, GridPoint>();
    groups.forEach((ids) => {
      ids.forEach((id, i) => res.set(id, sharedOffset(i, ids.length, cell)));
    });
    return res;
  }, [tokens, cell]);

  const stroke = colors.border;
  const sw = 0.7;

  const startCells = new Map<number, LudoColor>();
  COLOR_ORDER.forEach((c) => startCells.set(START_INDEX[c], c));

  return (
    <View style={[s.board, { width: boardSize, height: boardSize }]}>
      <Svg width={boardSize} height={boardSize}>
        <Rect x={0} y={0} width={boardSize} height={boardSize} fill={colors.paper} />

        {/* Yards */}
        {COLOR_ORDER.map((c) => {
          const o = YARD_ORIGIN[c];
          const hex = LUDO_COLOR_META[c].hex;
          return (
            <G key={`yard-${c}`}>
              <Rect
                x={o.x * cell}
                y={o.y * cell}
                width={6 * cell}
                height={6 * cell}
                rx={cell * 0.7}
                fill={hex}
              />
              <Rect
                x={(o.x + 1) * cell}
                y={(o.y + 1) * cell}
                width={4 * cell}
                height={4 * cell}
                rx={cell * 0.55}
                fill={colors.paper}
              />
              {[0, 1, 2, 3].map((i) => {
                const p = tokenGridPosition(c, i, 0);
                return (
                  <Circle
                    key={`slot-${c}-${i}`}
                    cx={p.x * cell}
                    cy={p.y * cell}
                    r={cell * 0.5}
                    fill={hex}
                    fillOpacity={0.25}
                  />
                );
              })}
            </G>
          );
        })}

        {/* Track cells */}
        {TRACK.map((c, i) => {
          const startColor = startCells.get(i);
          const isStar = STAR_TRACK_INDICES.includes(i);
          const isStart = START_TRACK_INDICES.includes(i);
          const fill = startColor ? LUDO_COLOR_META[startColor].hex : colors.paper;
          return (
            <G key={`t-${i}`}>
              <Rect
                x={c.col * cell}
                y={c.row * cell}
                width={cell}
                height={cell}
                fill={fill}
                stroke={stroke}
                strokeWidth={sw}
              />
              {(isStar || isStart) && (
                <Polygon
                  points={starPoints((c.col + 0.5) * cell, (c.row + 0.5) * cell, cell * 0.32)}
                  fill={isStart ? colors.paper : colors.textMuted}
                />
              )}
            </G>
          );
        })}

        {/* Home columns */}
        {COLOR_ORDER.map((color) =>
          HOME_COLUMN[color].map((c, i) => (
            <Rect
              key={`h-${color}-${i}`}
              x={c.col * cell}
              y={c.row * cell}
              width={cell}
              height={cell}
              fill={LUDO_COLOR_META[color].hex}
              stroke={stroke}
              strokeWidth={sw}
            />
          )),
        )}

        {/* Centre triangles */}
        {(() => {
          const a = 6 * cell;
          const b = 9 * cell;
          const m = 7.5 * cell;
          const tri: Record<LudoColor, string> = {
            red: `${a},${a} ${a},${b} ${m},${m}`,
            green: `${a},${a} ${b},${a} ${m},${m}`,
            yellow: `${b},${a} ${b},${b} ${m},${m}`,
            blue: `${a},${b} ${b},${b} ${m},${m}`,
          };
          return COLOR_ORDER.map((c) => (
            <Polygon
              key={`tri-${c}`}
              points={tri[c]}
              fill={LUDO_COLOR_META[c].hex}
              stroke={colors.paper}
              strokeWidth={sw}
            />
          ));
        })()}
      </Svg>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {tokens.map((t) => (
          <TokenView
            key={t.id}
            token={t}
            cell={cell}
            size={tokenSize}
            offset={offsets.get(t.id) ?? { x: 0, y: 0 }}
            isMovable={highlightMovable && movable.includes(t.id)}
            activeMove={activeMove}
            onPress={onTokenPress}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  board: {
    alignSelf: 'center',
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  tokenWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  token: {
    borderWidth: 2,
    borderColor: colors.paper,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  gloss: {
    position: 'absolute',
    backgroundColor: colors.paper,
    opacity: 0.45,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: colors.violet,
  },
});
