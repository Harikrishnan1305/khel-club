// ─── Pure Snakes & Ladders Game Logic (No React / RN imports) ───────────────

export const BOARD_SIZE = 10;
export const TOTAL_SQUARES = 100;
export const DEFAULT_EXTRA_TURN_ON_SIX = true;

/**
 * Ladders mapped from bottom square → top square.
 * Follows the attached Figma board visual exactly:
 *   3 → 22, 8 → 30, 28 → 55, 58 → 77
 * (Prompt text also mentioned 28→84 and 75→96; Figma draws 28→55 and omits 75→96.)
 */
export const LADDERS: Readonly<Record<number, number>> = {
  3: 22,
  8: 30,
  28: 55,
  58: 77,
};

/**
 * Snakes mapped from head square → tail square.
 * Follows the attached Figma board visual exactly:
 *   52 → 31 (orange), 65 → 44 (purple), 97 → 74 (green)
 */
export const SNAKES: Readonly<Record<number, number>> = {
  52: 31,
  65: 44,
  97: 74,
};

export interface BoardCell {
  /** 0 = top row (91..100), 9 = bottom row (1..10) */
  row: number;
  /** 0 = leftmost column, 9 = rightmost column */
  col: number;
}

export type MoveVia = 'ladder' | 'snake' | null;

export interface MoveResult {
  from: number;
  to: number;
  landed: number;
  via: MoveVia;
  won: boolean;
}

/**
 * Converts a board square number (1–100) into 0-indexed { row, col } coordinates
 * where row 0 is the top row and row 9 is the bottom row.
 *
 * Serpentine numbering from bottom to top:
 * - Row from bottom 0 (squares 1–10): left to right (col 0 → 9), row = 9
 * - Row from bottom 1 (squares 11–20): right to left (col 9 → 0), row = 8
 * - ...
 * - Row from bottom 9 (squares 91–100): right to left (col 9 → 0), row = 0
 */
export function squareToCell(n: number): BoardCell {
  const clamped = Math.max(1, Math.min(TOTAL_SQUARES, Math.floor(n)));
  const zeroBased = clamped - 1;
  const rowFromBottom = Math.floor(zeroBased / BOARD_SIZE);
  const posInRow = zeroBased % BOARD_SIZE;

  const row = BOARD_SIZE - 1 - rowFromBottom;
  const col =
    rowFromBottom % 2 === 0 ? posInRow : BOARD_SIZE - 1 - posInRow;

  return { row, col };
}

/**
 * Inverse of squareToCell: returns the square number (1–100) at { row, col }.
 */
export function cellToSquare(row: number, col: number): number {
  const rowFromBottom = BOARD_SIZE - 1 - row;
  const posInRow =
    rowFromBottom % 2 === 0 ? col : BOARD_SIZE - 1 - col;
  return rowFromBottom * BOARD_SIZE + posInRow + 1;
}

/**
 * Rolls a standard 6-sided die, returning an integer 1..6.
 */
export function rollDice(randomFn: () => number = Math.random): number {
  const n = Math.floor(randomFn() * 6) + 1;
  return Math.max(1, Math.min(6, n));
}

/**
 * Applies a dice roll to a player's current position (0..100).
 * - Exact roll required to reach 100; if position + roll > 100, player stays put.
 * - Landing on a ladder bottom climbs to its top.
 * - Landing on a snake head slides to its tail.
 */
export function applyMove(
  position: number,
  roll: number,
  ladders: Readonly<Record<number, number>> = LADDERS,
  snakes: Readonly<Record<number, number>> = SNAKES,
): MoveResult {
  const target = position + roll;

  if (target > TOTAL_SQUARES) {
    return {
      from: position,
      to: position,
      landed: position,
      via: null,
      won: position === TOTAL_SQUARES,
    };
  }

  const landed = target;

  if (ladders[landed] !== undefined) {
    const to = ladders[landed];
    return {
      from: position,
      to,
      landed,
      via: 'ladder',
      won: to === TOTAL_SQUARES,
    };
  }

  if (snakes[landed] !== undefined) {
    const to = snakes[landed];
    return {
      from: position,
      to,
      landed,
      via: 'snake',
      won: to === TOTAL_SQUARES,
    };
  }

  return {
    from: position,
    to: landed,
    landed,
    via: null,
    won: landed === TOTAL_SQUARES,
  };
}

/**
 * Determines whether the current player gets an extra turn after this roll.
 * By default, rolling a 6 grants an extra turn unless the game is already won.
 */
export function shouldGrantExtraTurn(
  roll: number,
  won: boolean,
  extraTurnOnSix: boolean = DEFAULT_EXTRA_TURN_ON_SIX,
): boolean {
  return extraTurnOnSix && roll === 6 && !won;
}

/**
 * Builds the step-by-step square path for token animation:
 * 1. Each intermediate square from `from + 1` up to `landed` (1 step per square).
 * 2. If `via` is 'ladder' or 'snake', the final jump/slide square `to` is returned separately.
 */
export function buildWalkSquares(move: MoveResult): {
  walkSquares: number[];
  slideTo: number | null;
} {
  if (move.landed === move.from) {
    return { walkSquares: [], slideTo: null };
  }
  const walkSquares: number[] = [];
  for (let sq = move.from + 1; sq <= move.landed; sq += 1) {
    walkSquares.push(sq);
  }
  const slideTo = move.via !== null && move.to !== move.landed ? move.to : null;
  return { walkSquares, slideTo };
}

/**
 * Formats a human-readable move log sentence matching the Figma log card.
 */
export function formatMoveLog(
  playerName: string,
  roll: number,
  move: MoveResult,
): string {
  if (move.landed === move.from) {
    return `${playerName} rolled ${roll} on ${move.from} — needs an exact roll to finish.`;
  }
  if (move.via === 'ladder') {
    return `${playerName} rolled ${roll} to ${move.landed} and climbed a ladder to ${move.to}.`;
  }
  if (move.via === 'snake') {
    return `${playerName} rolled ${roll} to ${move.landed} and was bitten by a snake and slid to ${move.to}.`;
  }
  if (move.won) {
    return `${playerName} rolled ${roll} and moved from ${move.from} → ${move.to} to win!`;
  }
  return `${playerName} rolled ${roll} and moved from ${move.from} → ${move.to}.`;
}
