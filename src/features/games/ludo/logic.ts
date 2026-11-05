// ─── Pure Ludo game logic (no React / RN imports) ────────────────────────────
//
// Board: 15x15 grid. Colours clockwise: red (top-left), green (top-right),
// yellow (bottom-right), blue (bottom-left).
//
// Token progress: 0 = in yard, 1..51 = on the shared track (relative to the
// token's own start cell, 1 = start cell), 52..56 = home column, 57 = finished.
//
// Rules chosen where the brief allowed a choice:
// - Blocks: two or more tokens of the SAME colour on one non-safe track cell
//   form a block and cannot be captured (opponents may still land there).
// - Captures happen only on a single opponent token on a non-safe track cell.
// - Rolling a 6, capturing, or reaching home grants an extra turn.
// - Three 6s in a row cancel the turn (setting, default ON).
// - If no token can move, the turn passes (even after a 6).

export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export const COLOR_ORDER: LudoColor[] = ['red', 'green', 'yellow', 'blue'];
export const GRID = 15;
export const TRACK_LENGTH = 52;
export const TRACK_LAST_PROGRESS = 51;
export const HOME_COLUMN_FIRST = 52;
export const FINISHED = 57;
export const TOKENS_PER_PLAYER = 4;

export interface Cell {
  row: number;
  col: number;
}

export interface GridPoint {
  x: number;
  y: number;
}

export interface LudoToken {
  id: string;
  color: LudoColor;
  index: number; // 0..3 within its colour
  progress: number;
}

export interface LudoSettings {
  threeSixesCancel: boolean;
}

export const DEFAULT_LUDO_SETTINGS: LudoSettings = { threeSixesCancel: true };

function buildTrack(): Cell[] {
  const t: Cell[] = [];
  for (let c = 1; c <= 5; c += 1) t.push({ row: 6, col: c });
  for (let r = 5; r >= 0; r -= 1) t.push({ row: r, col: 6 });
  t.push({ row: 0, col: 7 }, { row: 0, col: 8 });
  for (let r = 1; r <= 5; r += 1) t.push({ row: r, col: 8 });
  for (let c = 9; c <= 14; c += 1) t.push({ row: 6, col: c });
  t.push({ row: 7, col: 14 }, { row: 8, col: 14 });
  for (let c = 13; c >= 9; c -= 1) t.push({ row: 8, col: c });
  for (let r = 9; r <= 14; r += 1) t.push({ row: r, col: 8 });
  t.push({ row: 14, col: 7 }, { row: 14, col: 6 });
  for (let r = 13; r >= 9; r -= 1) t.push({ row: r, col: 6 });
  for (let c = 5; c >= 0; c -= 1) t.push({ row: 8, col: c });
  t.push({ row: 7, col: 0 }, { row: 6, col: 0 });
  return t;
}

/** The 52-cell main track, clockwise, starting at Red's start cell. */
export const TRACK: readonly Cell[] = buildTrack();

export const START_INDEX: Readonly<Record<LudoColor, number>> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

/** 5 home-column cells per colour, ordered from the track towards the centre. */
export const HOME_COLUMN: Readonly<Record<LudoColor, readonly Cell[]>> = {
  red: [1, 2, 3, 4, 5].map((c) => ({ row: 7, col: c })),
  green: [1, 2, 3, 4, 5].map((r) => ({ row: r, col: 7 })),
  yellow: [13, 12, 11, 10, 9].map((c) => ({ row: 7, col: c })),
  blue: [13, 12, 11, 10, 9].map((r) => ({ row: r, col: 7 })),
};

/** Track indices of the 4 start cells and the 4 star cells (start + 8). */
export const START_TRACK_INDICES: readonly number[] = COLOR_ORDER.map(
  (c) => START_INDEX[c],
);
export const STAR_TRACK_INDICES: readonly number[] = COLOR_ORDER.map(
  (c) => (START_INDEX[c] + 8) % TRACK_LENGTH,
);
export const SAFE_TRACK_INDICES: readonly number[] = [
  ...START_TRACK_INDICES,
  ...STAR_TRACK_INDICES,
];

/** Yard origin (in grid units) for each colour's 6x6 corner. */
export const YARD_ORIGIN: Readonly<Record<LudoColor, GridPoint>> = {
  red: { x: 0, y: 0 },
  green: { x: 9, y: 0 },
  yellow: { x: 9, y: 9 },
  blue: { x: 0, y: 9 },
};

// ─── Position helpers ────────────────────────────────────────────────────────

export function trackIndexFor(color: LudoColor, progress: number): number | null {
  if (progress < 1 || progress > TRACK_LAST_PROGRESS) return null;
  return (START_INDEX[color] + progress - 1) % TRACK_LENGTH;
}

/** Board cell for a progress value; null in the yard or when finished. */
export function progressToCell(color: LudoColor, progress: number): Cell | null {
  const ti = trackIndexFor(color, progress);
  if (ti !== null) return TRACK[ti];
  if (progress >= HOME_COLUMN_FIRST && progress < FINISHED) {
    return HOME_COLUMN[color][progress - HOME_COLUMN_FIRST];
  }
  return null;
}

const FINISH_DIR: Record<LudoColor, GridPoint> = {
  red: { x: -1, y: 0 },
  green: { x: 0, y: -1 },
  yellow: { x: 1, y: 0 },
  blue: { x: 0, y: 1 },
};

/** Centre of a token in continuous grid units (cell centre = col + 0.5). */
export function tokenGridPosition(
  color: LudoColor,
  tokenIndex: number,
  progress: number,
): GridPoint {
  if (progress <= 0) {
    const o = YARD_ORIGIN[color];
    return {
      x: o.x + 2 + (tokenIndex % 2) * 2,
      y: o.y + 2 + Math.floor(tokenIndex / 2) * 2,
    };
  }
  if (progress >= FINISHED) {
    const d = FINISH_DIR[color];
    const spread = (tokenIndex - 1.5) * 0.28;
    return {
      x: 7.5 + d.x * 0.6 + -d.y * spread,
      y: 7.5 + d.y * 0.6 + d.x * spread,
    };
  }
  const cell = progressToCell(color, progress) as Cell;
  return { x: cell.col + 0.5, y: cell.row + 0.5 };
}

export function isSafeProgress(color: LudoColor, progress: number): boolean {
  if (progress >= HOME_COLUMN_FIRST) return true;
  const ti = trackIndexFor(color, progress);
  return ti !== null && SAFE_TRACK_INDICES.includes(ti);
}

// ─── Tokens & dice ───────────────────────────────────────────────────────────

export function createInitialTokens(colors: readonly LudoColor[]): LudoToken[] {
  const tokens: LudoToken[] = [];
  colors.forEach((color) => {
    for (let i = 0; i < TOKENS_PER_PLAYER; i += 1) {
      tokens.push({ id: `${color}-${i}`, color, index: i, progress: 0 });
    }
  });
  return tokens;
}

export function rollDice(randomFn: () => number = Math.random): number {
  return Math.max(1, Math.min(6, Math.floor(randomFn() * 6) + 1));
}

export function getMovableTokens(
  tokens: readonly LudoToken[],
  color: LudoColor,
  roll: number,
): string[] {
  const ids: string[] = [];
  tokens.forEach((t) => {
    if (t.color !== color || t.progress >= FINISHED) return;
    if (t.progress === 0) {
      if (roll === 6) ids.push(t.id);
      return;
    }
    if (t.progress + roll <= FINISHED) ids.push(t.id);
  });
  return ids;
}

export interface LudoMoveResult {
  tokens: LudoToken[];
  tokenId: string;
  color: LudoColor;
  roll: number;
  from: number;
  to: number;
  captured: string[];
  reachedHome: boolean;
  leftYard: boolean;
  extraTurn: boolean;
}

/** Applies a move. Returns null if the token cannot legally move by `roll`. */
export function applyMove(
  tokens: readonly LudoToken[],
  tokenId: string,
  roll: number,
): LudoMoveResult | null {
  const token = tokens.find((t) => t.id === tokenId);
  if (!token) return null;
  if (!getMovableTokens(tokens, token.color, roll).includes(tokenId)) return null;

  const from = token.progress;
  const to = from === 0 ? 1 : from + roll;
  const next = tokens.map((t) => (t.id === tokenId ? { ...t, progress: to } : t));

  const captured: string[] = [];
  const landingTrack = trackIndexFor(token.color, to);
  if (landingTrack !== null && !SAFE_TRACK_INDICES.includes(landingTrack)) {
    const byColor = new Map<LudoColor, LudoToken[]>();
    next.forEach((t) => {
      if (t.color === token.color) return;
      if (trackIndexFor(t.color, t.progress) === landingTrack) {
        byColor.set(t.color, [...(byColor.get(t.color) ?? []), t]);
      }
    });
    byColor.forEach((group) => {
      // A group of 2+ same-colour tokens is a block and is safe.
      if (group.length === 1) captured.push(group[0].id);
    });
  }

  const finalTokens = next.map((t) =>
    captured.includes(t.id) ? { ...t, progress: 0 } : t,
  );
  const reachedHome = to === FINISHED;

  return {
    tokens: finalTokens,
    tokenId,
    color: token.color,
    roll,
    from,
    to,
    captured,
    reachedHome,
    leftYard: from === 0,
    extraTurn: roll === 6 || captured.length > 0 || reachedHome,
  };
}

export function countHome(tokens: readonly LudoToken[], color: LudoColor): number {
  return tokens.filter((t) => t.color === color && t.progress === FINISHED).length;
}

export function checkWinner(
  tokens: readonly LudoToken[],
  colors: readonly LudoColor[],
): LudoColor | null {
  for (const c of colors) {
    if (countHome(tokens, c) === TOKENS_PER_PLAYER) return c;
  }
  return null;
}

/** Tracks consecutive sixes; three in a row cancel the turn when enabled. */
export function evaluateRoll(
  consecutiveSixes: number,
  roll: number,
  threeSixesCancel: boolean = DEFAULT_LUDO_SETTINGS.threeSixesCancel,
): { consecutiveSixes: number; cancelled: boolean } {
  const sixes = roll === 6 ? consecutiveSixes + 1 : 0;
  if (threeSixesCancel && sixes >= 3) {
    return { consecutiveSixes: 0, cancelled: true };
  }
  return { consecutiveSixes: sixes, cancelled: false };
}

/**
 * Bot priority: capture > reach home > leave yard on a 6 > land on a safe
 * cell > advance the front-most token.
 */
export function chooseBotMove(
  tokens: readonly LudoToken[],
  color: LudoColor,
  roll: number,
): string | null {
  const movable = getMovableTokens(tokens, color, roll);
  if (movable.length === 0) return null;

  let bestId = movable[0];
  let bestScore = -1;
  movable.forEach((id) => {
    const res = applyMove(tokens, id, roll);
    if (!res) return;
    let score = res.from; // front-most token preferred (0..56)
    if (isSafeProgress(color, res.to) && res.to < FINISHED) score += 400;
    if (res.leftYard) score += 600;
    if (res.reachedHome) score += 800;
    if (res.captured.length > 0) score += 1000;
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  });
  return bestId;
}

export function formatMoveLog(
  playerName: string,
  roll: number,
  result: LudoMoveResult,
): string {
  if (result.captured.length > 0) {
    return `${playerName} rolled ${roll} and captured a token!`;
  }
  if (result.reachedHome) {
    return `${playerName} rolled ${roll} and brought a token home.`;
  }
  if (result.leftYard) {
    return `${playerName} rolled ${roll} and brought a token out.`;
  }
  return `${playerName} rolled ${roll} and moved a token to ${result.to}.`;
}
