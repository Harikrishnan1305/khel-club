import { create } from 'zustand';
import { colors, gameColors } from '../../../theme/theme';
import {
  applyMove,
  rollDice,
  formatMoveLog,
  shouldGrantExtraTurn,
  DEFAULT_EXTRA_TURN_ON_SIX,
  type MoveResult,
} from './logic';

export type PlayerColorKey = 'violet' | 'green' | 'blue' | 'red';

export const PLAYER_COLOR_META: Record<
  PlayerColorKey,
  { label: string; hex: string }
> = {
  violet: { label: 'Violet', hex: colors.violet },
  green:  { label: 'Green',  hex: gameColors.ludo.green },
  blue:   { label: 'Blue',   hex: gameColors.ludo.blue },
  red:    { label: 'Red',    hex: gameColors.ludo.red },
};

export interface SnakesPlayerAvatar {
  photoUri?: string | null;
  initials: string;
}

export interface SnakesPlayer {
  id: string;
  name: string;
  displayName: string;
  color: PlayerColorKey;
  isBot: boolean;
  isUser: boolean;
  position: number;
  avatar: SnakesPlayerAvatar;
}

export interface ActiveMove {
  nonce: number;
  playerId: string;
  playerIndex: number;
  roll: number;
  result: MoveResult;
}

export interface SnakesGameState {
  players: SnakesPlayer[];
  currentPlayerIndex: number;
  lastRoll: number | null;
  pendingRoll: number | null;
  isRolling: boolean;
  isMoving: boolean;
  activeMove: ActiveMove | null;
  moveLog: string[];
  winner: SnakesPlayer | null;
  extraTurnOnSix: boolean;
}

export interface SnakesGameActions {
  startGame: (players: SnakesPlayer[]) => void;
  roll: () => number | null;
  commitRoll: () => ActiveMove | null;
  nextTurn: () => void;
  setExtraTurnOnSix: (enabled: boolean) => void;
  reset: () => void;
}

let moveNonceCounter = 1;

const initialState: SnakesGameState = {
  players: [],
  currentPlayerIndex: 0,
  lastRoll: 4,
  pendingRoll: null,
  isRolling: false,
  isMoving: false,
  activeMove: null,
  moveLog: [],
  winner: null,
  extraTurnOnSix: DEFAULT_EXTRA_TURN_ON_SIX,
};

export const useSnakesStore = create<SnakesGameState & SnakesGameActions>()(
  (set, get) => ({
    ...initialState,

    startGame: (players) => {
      const normalized = players.map((p) => ({
        ...p,
        position: p.position >= 1 && p.position <= 100 ? p.position : 1,
      }));
      set({
        players: normalized,
        currentPlayerIndex: 0,
        lastRoll: 4,
        pendingRoll: null,
        isRolling: false,
        isMoving: false,
        activeMove: null,
        moveLog: ['Roll the dice to begin. Exact roll needed to reach 100.'],
        winner: null,
      });
    },

    roll: () => {
      const state = get();
      if (
        state.isRolling ||
        state.isMoving ||
        state.winner !== null ||
        state.players.length === 0
      ) {
        return null;
      }
      const value = rollDice();
      set({
        isRolling: true,
        pendingRoll: value,
      });
      return value;
    },

    commitRoll: () => {
      const state = get();
      if (!state.isRolling || state.players.length === 0) {
        return null;
      }
      const player = state.players[state.currentPlayerIndex];
      if (!player) {
        set({ isRolling: false, pendingRoll: null });
        return null;
      }

      const diceValue = state.pendingRoll ?? rollDice();
      const result = applyMove(player.position, diceValue);
      const logLine = formatMoveLog(player.name, diceValue, result);

      moveNonceCounter += 1;
      const activeMove: ActiveMove = {
        nonce: moveNonceCounter,
        playerId: player.id,
        playerIndex: state.currentPlayerIndex,
        roll: diceValue,
        result,
      };

      const updatedPlayers = state.players.map((p, idx) =>
        idx === state.currentPlayerIndex ? { ...p, position: result.to } : p,
      );

      set({
        players: updatedPlayers,
        lastRoll: diceValue,
        pendingRoll: null,
        isRolling: false,
        isMoving: true,
        activeMove,
        moveLog: [logLine, ...state.moveLog].slice(0, 40),
      });

      return activeMove;
    },

    nextTurn: () => {
      const state = get();
      if (state.players.length === 0) return;

      const active = state.activeMove;
      const currentPlayer = state.players[state.currentPlayerIndex];

      if (active?.result.won && currentPlayer) {
        set({
          isMoving: false,
          winner: currentPlayer,
        });
        return;
      }

      const rollValue = active?.roll ?? state.lastRoll ?? 1;
      const extraTurn = shouldGrantExtraTurn(
        rollValue,
        false,
        state.extraTurnOnSix,
      );

      if (extraTurn && currentPlayer) {
        const bonusLine = `${currentPlayer.name} rolled a 6 and gets an extra turn!`;
        set({
          isMoving: false,
          moveLog: [bonusLine, ...state.moveLog].slice(0, 40),
        });
        return;
      }

      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
      set({
        currentPlayerIndex: nextIndex,
        isMoving: false,
      });
    },

    setExtraTurnOnSix: (enabled) => set({ extraTurnOnSix: enabled }),

    reset: () => set({ ...initialState }),
  }),
);
