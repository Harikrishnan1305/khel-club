import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, {
  Rect,
  Text as SvgText,
  Line,
  Path,
  Circle,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import {
  colors,
  gameColors,
  spacing,
  radius,
  fontWeight,
} from '../../../theme/theme';
import {
  BOARD_SIZE,
  LADDERS,
  SNAKES,
  squareToCell,
  cellToSquare,
  buildWalkSquares,
  type MoveVia,
} from './logic';
import {
  PLAYER_COLOR_META,
  type SnakesPlayer,
  type ActiveMove,
} from './store';

export const STEP_DURATION_MS = 250;
export const SLIDE_PAUSE_MS = 80;
export const SLIDE_DURATION_MS = 480;
export const OVERSHOOT_DURATION_MS = 260;

interface Point {
  x: number;
  y: number;
}

const CELL_PALETTE = [
  gameColors.snakes.cellMint,
  gameColors.snakes.cellPeach,
  gameColors.snakes.cellCream,
  gameColors.snakes.cellSand,
] as const;

function getCellFill(row: number, col: number, square: number): string {
  if (square === 100) {
    return gameColors.snakes.winCell;
  }
  // Soft pastel alternating pattern matching the Figma board
  const idx = (row * 3 + col) % CELL_PALETTE.length;
  return CELL_PALETTE[idx];
}

function getSquareCenter(
  square: number,
  cellSize: number,
  verticalBias: number = 0.56,
): Point {
  const { row, col } = squareToCell(square);
  return {
    x: (col + 0.5) * cellSize,
    y: (row + verticalBias) * cellSize,
  };
}

function getSharedOffset(
  indexInGroup: number,
  groupSize: number,
  cellSize: number,
): Point {
  if (groupSize <= 1) return { x: 0, y: 0 };
  const d = cellSize * 0.17;
  if (groupSize === 2) {
    return indexInGroup === 0 ? { x: -d, y: 0 } : { x: d, y: 0 };
  }
  const offsets: Point[] = [
    { x: -d, y: -d * 0.7 },
    { x: d, y: -d * 0.7 },
    { x: -d, y: d * 0.75 },
    { x: d, y: d * 0.75 },
  ];
  return offsets[indexInGroup % offsets.length];
}

function getSnakeColor(headSquare: number, index: number): string {
  if (headSquare === 97) return gameColors.snakes.snakeGreen;
  if (headSquare === 65) return gameColors.snakes.snakePurple;
  if (headSquare === 52) return gameColors.snakes.snakeOrange;
  const fallback = [
    gameColors.snakes.snakeGreen,
    gameColors.snakes.snakePurple,
    gameColors.snakes.snakeOrange,
  ];
  return fallback[index % fallback.length];
}

interface AnimatedTokenProps {
  player: SnakesPlayer;
  cellSize: number;
  tokenSize: number;
  offset: Point;
  activeMove: ActiveMove | null;
}

function AnimatedToken({
  player,
  cellSize,
  tokenSize,
  offset,
  activeMove,
}: AnimatedTokenProps) {
  const targetCenter = getSquareCenter(player.position, cellSize);
  const finalX = targetCenter.x + offset.x - tokenSize / 2;
  const finalY = targetCenter.y + offset.y - tokenSize / 2;

  const translateX = useSharedValue(finalX);
  const translateY = useSharedValue(finalY);
  const scale = useSharedValue(1);
  const lastHandledNonce = useRef<number>(0);

  useEffect(() => {
    if (
      activeMove &&
      activeMove.playerId === player.id &&
      activeMove.nonce !== lastHandledNonce.current
    ) {
      lastHandledNonce.current = activeMove.nonce;
      const { walkSquares, slideTo } = buildWalkSquares(activeMove.result);

      if (walkSquares.length === 0) {
        // Overshoot: subtle bounce in place
        scale.value = withSequence(
          withTiming(1.18, { duration: OVERSHOOT_DURATION_MS / 2 }),
          withTiming(1, { duration: OVERSHOOT_DURATION_MS / 2 }),
        );
        translateX.value = withTiming(finalX, { duration: 180 });
        translateY.value = withTiming(finalY, { duration: 180 });
        return;
      }

      const xSteps: number[] = [];
      const ySteps: number[] = [];

      walkSquares.forEach((sq, idx) => {
        const isFinalPoint = slideTo === null && idx === walkSquares.length - 1;
        const c = getSquareCenter(sq, cellSize);
        const px = c.x + (isFinalPoint ? offset.x : 0) - tokenSize / 2;
        const py = c.y + (isFinalPoint ? offset.y : 0) - tokenSize / 2;

        xSteps.push(
          withTiming<number>(px, {
            duration: STEP_DURATION_MS,
            easing: Easing.inOut(Easing.quad),
          }),
        );
        ySteps.push(
          withTiming<number>(py, {
            duration: STEP_DURATION_MS,
            easing: Easing.inOut(Easing.quad),
          }),
        );
      });

      if (slideTo !== null) {
        const dest = getSquareCenter(slideTo, cellSize);
        const destX = dest.x + offset.x - tokenSize / 2;
        const destY = dest.y + offset.y - tokenSize / 2;

        xSteps.push(
          withDelay(
            SLIDE_PAUSE_MS,
            withTiming<number>(destX, {
              duration: SLIDE_DURATION_MS,
              easing: Easing.inOut(Easing.cubic),
            }),
          ),
        );
        ySteps.push(
          withDelay(
            SLIDE_PAUSE_MS,
            withTiming<number>(destY, {
              duration: SLIDE_DURATION_MS,
              easing: Easing.inOut(Easing.cubic),
            }),
          ),
        );
      }

      if (xSteps.length === 1) {
        translateX.value = xSteps[0];
        translateY.value = ySteps[0];
      } else {
        translateX.value = withSequence<number>(xSteps[0], ...xSteps.slice(1));
        translateY.value = withSequence<number>(ySteps[0], ...ySteps.slice(1));
      }

      scale.value = withSequence(
        withTiming(1.12, { duration: 140 }),
        withTiming(1, { duration: 180 }),
      );
      return;
    }

    // Non-moving token or initial/reset position update
    translateX.value = withTiming(finalX, { duration: 200 });
    translateY.value = withTiming(finalY, { duration: 200 });
  }, [
    activeMove,
    cellSize,
    finalX,
    finalY,
    offset.x,
    offset.y,
    player.id,
    player.position,
    scale,
    tokenSize,
    translateX,
    translateY,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const tokenBg = PLAYER_COLOR_META[player.color].hex;
  const initialLetter = (player.name || 'P').charAt(0).toUpperCase();

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.token,
        {
          width: tokenSize,
          height: tokenSize,
          borderRadius: tokenSize / 2,
          backgroundColor: tokenBg,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          s.tokenLetter,
          { fontSize: Math.max(10, Math.round(tokenSize * 0.48)) },
        ]}
      >
        {initialLetter}
      </Text>
    </Animated.View>
  );
}

export interface SnakesBoardProps {
  players: SnakesPlayer[];
  activeMove: ActiveMove | null;
  onSlideStart?: (via: MoveVia) => void;
  onMoveComplete?: () => void;
}

export function Board({
  players,
  activeMove,
  onSlideStart,
  onMoveComplete,
}: SnakesBoardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const boardSize = Math.max(260, Math.floor(screenWidth - spacing.pageMargin * 2));
  const cellSize = boardSize / BOARD_SIZE;
  const tokenSize = Math.max(20, Math.round(cellSize * 0.56));

  const onSlideStartRef = useRef(onSlideStart);
  const onMoveCompleteRef = useRef(onMoveComplete);
  onSlideStartRef.current = onSlideStart;
  onMoveCompleteRef.current = onMoveComplete;

  // Trigger slide and completion callbacks synced with token animation durations
  useEffect(() => {
    if (!activeMove) return;

    const { walkSquares, slideTo } = buildWalkSquares(activeMove.result);
    const walkDuration =
      walkSquares.length > 0
        ? walkSquares.length * STEP_DURATION_MS
        : OVERSHOOT_DURATION_MS;

    let slideTimer: ReturnType<typeof setTimeout> | null = null;
    if (slideTo !== null && activeMove.result.via) {
      slideTimer = setTimeout(() => {
        onSlideStartRef.current?.(activeMove.result.via);
      }, walkDuration + SLIDE_PAUSE_MS);
    }

    const totalDuration =
      walkDuration +
      (slideTo !== null ? SLIDE_PAUSE_MS + SLIDE_DURATION_MS : 0) +
      40;

    const completeTimer = setTimeout(() => {
      onMoveCompleteRef.current?.();
    }, totalDuration);

    return () => {
      if (slideTimer) clearTimeout(slideTimer);
      clearTimeout(completeTimer);
    };
  }, [activeMove]);

  // Precompute ladders geometry
  const ladderElements = useMemo(() => {
    return Object.entries(LADDERS).map(([bottomStr, top]) => {
      const bottom = Number(bottomStr);
      const p1 = getSquareCenter(bottom, cellSize, 0.52);
      const p2 = getSquareCenter(top, cellSize, 0.52);

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      // Perpendicular unit vector
      const px = -uy;
      const py = ux;

      const railOffset = cellSize * 0.14;
      const leftStart = { x: p1.x + px * railOffset, y: p1.y + py * railOffset };
      const leftEnd = { x: p2.x + px * railOffset, y: p2.y + py * railOffset };
      const rightStart = { x: p1.x - px * railOffset, y: p1.y - py * railOffset };
      const rightEnd = { x: p2.x - px * railOffset, y: p2.y - py * railOffset };

      const rungSpacing = cellSize * 0.25;
      const rungCount = Math.max(3, Math.floor(len / rungSpacing) - 1);
      const rungs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

      for (let i = 1; i <= rungCount; i += 1) {
        const t = i / (rungCount + 1);
        const cx = p1.x + dx * t;
        const cy = p1.y + dy * t;
        rungs.push({
          x1: cx + px * railOffset,
          y1: cy + py * railOffset,
          x2: cx - px * railOffset,
          y2: cy - py * railOffset,
        });
      }

      return {
        key: `ladder-${bottom}-${top}`,
        leftStart,
        leftEnd,
        rightStart,
        rightEnd,
        rungs,
      };
    });
  }, [cellSize]);

  // Precompute snakes geometry (smooth S-curves + head & eyes)
  const snakeElements = useMemo(() => {
    return Object.entries(SNAKES).map(([headStr, tail], idx) => {
      const head = Number(headStr);
      const h = getSquareCenter(head, cellSize, 0.45);
      const t = getSquareCenter(tail, cellSize, 0.55);

      const dx = t.x - h.x;
      const dy = t.y - h.y;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len;
      const py = dx / len;

      const bend = cellSize * (head === 97 ? 0.65 : 0.48) * (idx % 2 === 0 ? 1 : -1);

      const c1x = h.x + dx * 0.3 + px * bend;
      const c1y = h.y + dy * 0.3 + py * bend;
      const c2x = h.x + dx * 0.7 - px * bend * 0.85;
      const c2y = h.y + dy * 0.7 - py * bend * 0.85;

      const d = `M ${h.x} ${h.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${t.x} ${t.y}`;
      const color = getSnakeColor(head, idx);
      const headRadius = cellSize * 0.17;
      const eyeOffset = headRadius * 0.42;

      return {
        key: `snake-${head}-${tail}`,
        d,
        color,
        head: h,
        headRadius,
        leftEye: { x: h.x - eyeOffset, y: h.y - headRadius * 0.15 },
        rightEye: { x: h.x + eyeOffset, y: h.y - headRadius * 0.15 },
      };
    });
  }, [cellSize]);

  // Group players by position to offset tokens on the same square
  const tokenOffsets = useMemo(() => {
    const groups = new Map<number, string[]>();
    players.forEach((p) => {
      const list = groups.get(p.position) ?? [];
      list.push(p.id);
      groups.set(p.position, list);
    });

    const result = new Map<string, Point>();
    players.forEach((p) => {
      const list = groups.get(p.position) ?? [p.id];
      const idx = list.indexOf(p.id);
      result.set(p.id, getSharedOffset(idx, list.length, cellSize));
    });
    return result;
  }, [players, cellSize]);

  return (
    <View style={[s.boardWrap, { width: boardSize, height: boardSize }]}>
      <Svg width={boardSize} height={boardSize}>
        {/* 10x10 Grid Cells & Numbers */}
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((__, col) => {
            const sq = cellToSquare(row, col);
            const x = col * cellSize;
            const y = row * cellSize;
            const fill = getCellFill(row, col, sq);

            return (
              <G key={`cell-${sq}`}>
                <Rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={fill}
                  stroke={gameColors.snakes.gridLine}
                  strokeWidth={0.8}
                />
                <SvgText
                  x={x + cellSize * 0.11}
                  y={y + cellSize * 0.31}
                  fill={colors.ink}
                  fontSize={Math.max(8, Math.round(cellSize * 0.25))}
                  fontWeight="700"
                >
                  {sq}
                </SvgText>
                {sq === 100 && (
                  <SvgText
                    x={x + cellSize * 0.11}
                    y={y + cellSize * 0.64}
                    fill={colors.ink}
                    fontSize={Math.max(7, Math.round(cellSize * 0.22))}
                    fontWeight="800"
                  >
                    WIN
                  </SvgText>
                )}
              </G>
            );
          }),
        )}

        {/* Ladders */}
        {ladderElements.map((lad) => (
          <G key={lad.key}>
            {lad.rungs.map((r, rIdx) => (
              <Line
                key={`${lad.key}-rung-${rIdx}`}
                x1={r.x1}
                y1={r.y1}
                x2={r.x2}
                y2={r.y2}
                stroke={gameColors.snakes.ladder}
                strokeWidth={Math.max(1.8, cellSize * 0.055)}
                strokeLinecap="round"
              />
            ))}
            <Line
              x1={lad.leftStart.x}
              y1={lad.leftStart.y}
              x2={lad.leftEnd.x}
              y2={lad.leftEnd.y}
              stroke={gameColors.snakes.ladder}
              strokeWidth={Math.max(2.4, cellSize * 0.075)}
              strokeLinecap="round"
            />
            <Line
              x1={lad.rightStart.x}
              y1={lad.rightStart.y}
              x2={lad.rightEnd.x}
              y2={lad.rightEnd.y}
              stroke={gameColors.snakes.ladder}
              strokeWidth={Math.max(2.4, cellSize * 0.075)}
              strokeLinecap="round"
            />
          </G>
        ))}

        {/* Snakes */}
        {snakeElements.map((sn) => (
          <G key={sn.key}>
            <Path
              d={sn.d}
              stroke={sn.color}
              strokeWidth={Math.max(6, cellSize * 0.24)}
              strokeLinecap="round"
              fill="none"
            />
            <Circle
              cx={sn.head.x}
              cy={sn.head.y}
              r={sn.headRadius}
              fill={sn.color}
            />
            {/* Eyes */}
            <Circle
              cx={sn.leftEye.x}
              cy={sn.leftEye.y}
              r={sn.headRadius * 0.24}
              fill={colors.paper}
            />
            <Circle
              cx={sn.rightEye.x}
              cy={sn.rightEye.y}
              r={sn.headRadius * 0.24}
              fill={colors.paper}
            />
            <Circle
              cx={sn.leftEye.x}
              cy={sn.leftEye.y}
              r={sn.headRadius * 0.12}
              fill={colors.ink}
            />
            <Circle
              cx={sn.rightEye.x}
              cy={sn.rightEye.y}
              r={sn.headRadius * 0.12}
              fill={colors.ink}
            />
          </G>
        ))}
      </Svg>

      {/* Animated Player Tokens Overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {players.map((player) => (
          <AnimatedToken
            key={player.id}
            player={player}
            cellSize={cellSize}
            tokenSize={tokenSize}
            offset={tokenOffsets.get(player.id) ?? { x: 0, y: 0 }}
            activeMove={activeMove}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  boardWrap: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: gameColors.snakes.boardBorder,
    backgroundColor: gameColors.snakes.cellCream,
    alignSelf: 'center',
  },
  token: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
    borderColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  tokenLetter: {
    color: colors.paper,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
