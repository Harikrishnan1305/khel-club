import { create } from 'zustand';
import { gameColors } from '../../../theme/theme';
import {
  createInitialTokens,
  getMovableTokens,
  applyMove,
  evaluateRoll,
  checkWinner,
  rollDice,
  formatMoveLog,
  DEFAULT_LUDO_SETTINGS,
  type LudoColor,
  type LudoToken,
} from './logic';

export const LUDO_COLOR_META: Record<LudoColor, { label: string; hex: string }> = {
  red: { label: 'Red', hex: gameColors.ludo.red },
  green: { label: 'Green', hex: gameColors.ludo.green },
  yellow: { label: 'Yellow', hex: gameColors.ludo.yellow },
  blue: { label: 'Blue', hex: gameColors.ludo.blue },
};

export interface LudoPlayer {
  id: string;
  name: string;
  displayName: string;
  color: LudoColor;
  isBot: boolean;
  isUser: boolean;
  avatar: { photoUri?: string | null; initials: string };
}

export interface LudoActiveMove {
  nonce: number;
  tokenId: string;
  color: LudoColor;
  tokenIndex: number;
  from: number;
  to: number;
  captured: string[];
  reachedHome: boolean;
  extraTurn: boolean;
}

export type LudoPhase = 'roll' | 'select' | 'moving';

export interface LudoState {
  players: LudoPlayer[];
  tokens: LudoToken[];
  currentPlayerIndex: number;
  lastRoll: number | null;
  pendingRoll: number | null;
  isRolling: boolean;
  phase: LudoPhase;
  movable: string[];
  consecutiveSixes: number;
  activeMove: LudoActiveMove | null;
  moveLog: string[];
  winner: LudoPlayer | null;
  threeSixesCancel: boolean;
}

export interface LudoActions {
  startGame: (players: LudoPlayer[]) => void;
  roll: () => number | null;
  commitRoll: () => void;
  selectToken: (tokenId: string) => void;
  moveToken: (tokenId: string) => void;
  nextTurn: () => void;
  setThreeSixesCancel: (enabled: boolean) => void;
  reset: () => void;
}

let moveNonce = 1;

const initial: LudoState = {
  players: [],
  tokens: [],
  currentPlayerIndex: 0,
  lastRoll: null,
  pendingRoll: null,
  isRolling: false,
  phase: 'roll',
  movable: [],
  consecutiveSixes: 0,
  activeMove: null,
  moveLog: [],
  winner: null,
  threeSixesCancel: DEFAULT_LUDO_SETTINGS.threeSixesCancel,
};

export const useLudoStore = create<LudoState & LudoActions>()((set, get) => ({
  ...initial,

  startGame: (players) =>
    set({
      ...initial,
      threeSixesCancel: get().threeSixesCancel,
      players,
      tokens: createInitialTokens(players.map((p) => p.color)),
      moveLog: ['Roll a six to bring a token out.'],
    }),

  roll: () => {
    const s = get();
    if (s.phase !== 'roll' || s.isRolling || s.winner || s.players.length === 0) {
      return null;
    }
    const value = rollDice();
    set({ isRolling: true, pendingRoll: value });
    return value;
  },

  commitRoll: () => {
    const s = get();
    if (!s.isRolling) return;
    const player = s.players[s.currentPlayerIndex];
    const value = s.pendingRoll ?? rollDice();
    const ev = evaluateRoll(s.consecutiveSixes, value, s.threeSixesCancel);

    if (ev.cancelled) {
      set({
        isRolling: false,
        pendingRoll: null,
        lastRoll: value,
        consecutiveSixes: 0,
        phase: 'select',
        movable: [],
        activeMove: null,
        moveLog: [
          `${player.name} rolled three sixes in a row. Turn cancelled.`,
          ...s.moveLog,
        ].slice(0, 40),
      });
      return;
    }

    const movable = getMovableTokens(s.tokens, player.color, value);
    set({
      isRolling: false,
      pendingRoll: null,
      lastRoll: value,
      consecutiveSixes: ev.consecutiveSixes,
      phase: 'select',
      movable,
      activeMove: null,
      moveLog:
        movable.length === 0
          ? [`${player.name} rolled ${value}. No move possible.`, ...s.moveLog].slice(0, 40)
          : s.moveLog,
    });
  },

  moveToken: (tokenId) => {
    const s = get();
    if (s.phase !== 'select' || !s.movable.includes(tokenId) || s.lastRoll === null) {
      return;
    }
    const player = s.players[s.currentPlayerIndex];
    const res = applyMove(s.tokens, tokenId, s.lastRoll);
    if (!res) return;
    const token = s.tokens.find((t) => t.id === tokenId) as LudoToken;
    moveNonce += 1;
    set({
      tokens: res.tokens,
      phase: 'moving',
      movable: [],
      activeMove: {
        nonce: moveNonce,
        tokenId,
        color: res.color,
        tokenIndex: token.index,
        from: res.from,
        to: res.to,
        captured: res.captured,
        reachedHome: res.reachedHome,
        extraTurn: res.extraTurn,
      },
      moveLog: [formatMoveLog(player.name, s.lastRoll, res), ...s.moveLog].slice(0, 40),
    });
  },

  selectToken: (tokenId) => get().moveToken(tokenId),

  nextTurn: () => {
    const s = get();
    if (s.players.length === 0 || s.winner) return;

    const winnerColor = checkWinner(
      s.tokens,
      s.players.map((p) => p.color),
    );
    if (winnerColor) {
      const w = s.players.find((p) => p.color === winnerColor) ?? null;
      set({
        phase: 'roll',
        activeMove: null,
        movable: [],
        winner: w,
        moveLog: w
          ? [`${w.name} brought all four tokens home!`, ...s.moveLog].slice(0, 40)
          : s.moveLog,
      });
      return;
    }

    if (s.activeMove?.extraTurn) {
      set({ phase: 'roll', activeMove: null, movable: [] });
      return;
    }

    set({
      currentPlayerIndex: (s.currentPlayerIndex + 1) % s.players.length,
      consecutiveSixes: 0,
      phase: 'roll',
      activeMove: null,
      movable: [],
    });
  },

  setThreeSixesCancel: (enabled) => set({ threeSixesCancel: enabled }),

  reset: () => set({ ...initial, threeSixesCancel: get().threeSixesCancel }),
}));
