// ─── Dummy data for Home & Lobby screens ─────────────────────────────────────
// Replace with real API/store data in Phase 4.

export type GameId = 'carrom' | 'chess' | 'snakes' | 'ludo';

export interface DummyGame {
  id: GameId;
  title: string;
  shortTabLabel: string;
  tagline: string;
  description: string;
  playingCount: string; // e.g. "1.2k"
  imageKey: string;
  infoChips: [string, string, string];
  playerOptions: number[];
  oneLineRule: string;
  rulesDetail: string[];
  wisdomTip: string;
}

export const DUMMY_GAMES: DummyGame[] = [
  {
    id: 'carrom',
    title: 'Carrom',
    shortTabLabel: 'Carrom',
    tagline: 'Flick. Pocket. Celebrate.',
    description:
      'Slide your striker, aim with precision, and pocket your pieces before your opponent. Classic wooden board feel made for friendly competition.',
    playingCount: '1.2k',
    imageKey: 'card_carrom',
    infoChips: ['2 or 4 players', '~10 min', 'Skill & strategy'],
    playerOptions: [2, 4],
    oneLineRule: 'Pocket all your coins and cover the red Queen to win.',
    rulesDetail: [
      'Each player or team is assigned either white or black coins.',
      'Slide the striker along your baseline and flick it to pocket your coins.',
      'Pocketing a coin gives you an extra turn.',
      'The red Queen can be pocketed once you have pocketed at least one of your coins, and must be covered on the very next shot.',
      'First side to clear all their coins wins the board!',
    ],
    wisdomTip:
      'Angle shots off the wooden frame to reach coins blocked near the center circle.',
  },
  {
    id: 'chess',
    title: 'Chess',
    shortTabLabel: 'Chess',
    tagline: 'Your next brilliant move.',
    description:
      'A calm, thoughtful 10-minute Rapid match. Outthink your friend across the 64 squares with clean visuals and zero distractions.',
    playingCount: '860',
    imageKey: 'card_chess',
    infoChips: ['2 players', '~10 min', 'Strategy'],
    playerOptions: [2],
    oneLineRule: '10-minute Rapid clocks. Checkmate the opponent king.',
    rulesDetail: [
      'Standard FIDE chess rules apply on an 8×8 board.',
      'Each player gets 10 minutes on their clock (Rapid format).',
      'In casual friend matches, undo requests require your opponent’s approval.',
      'Win by checkmate, opponent resignation, or when your opponent’s clock runs out.',
    ],
    wisdomTip:
      'Control the four center squares early and castle your King before launching an attack.',
  },
  {
    id: 'snakes',
    title: 'Snakes & Ladders',
    shortTabLabel: 'Snakes',
    tagline: 'A little luck, a lot of fun.',
    description:
      'Roll the dice, climb tall ladders, and dodge slippery snakes on the race to square 100. Easy to pick up for everyone in the family.',
    playingCount: '640',
    imageKey: 'card_snakes',
    infoChips: ['2 to 4 players', '~15 min', 'Luck & fun'],
    playerOptions: [2, 4],
    oneLineRule: 'Climb ladders, slide down snakes, and land on 100.',
    rulesDetail: [
      'Players take turns rolling the die and moving forward along the 10×10 serpentine board.',
      'Landing at the base of a ladder immediately boosts you up to the top.',
      'Landing on a snake’s head slides your token down to its tail.',
      'Rolling a 6 grants a bonus roll.',
      'You need the exact roll to land on square 100 and claim victory!',
    ],
    wisdomTip:
      'Even if you slide down a long snake near the top, one lucky ladder can bring you right back!',
  },
  {
    id: 'ludo',
    title: 'Ludo',
    shortTabLabel: 'Ludo',
    tagline: 'The classic group plan.',
    description:
      'Guide all four tokens out of your yard, race around the 52-square track, and reach the center home triangle before anyone else.',
    playingCount: '2.4k',
    imageKey: 'card_ludo',
    infoChips: ['2 to 4 players', '~15 min', 'Luck & fun'],
    playerOptions: [2, 4],
    oneLineRule: 'Roll a 6 to start, use safe star squares, race all 4 home.',
    rulesDetail: [
      'Roll a 6 to bring a token out of your starting yard onto the track.',
      'Rolling a 6 or capturing an opponent token grants an extra roll.',
      'Landing on a single opponent token sends it back to their yard.',
      'Squares marked with a star are safe zones where tokens cannot be captured.',
      'First player to bring all 4 tokens into the center home triangle wins!',
    ],
    wisdomTip:
      'Spread your risk across multiple tokens instead of rushing just one token around the board.',
  },
];

export const DUMMY_GAMES_MAP: Record<GameId, DummyGame> = {
  carrom: DUMMY_GAMES[0],
  chess: DUMMY_GAMES[1],
  snakes: DUMMY_GAMES[2],
  ludo: DUMMY_GAMES[3],
};

export interface DummyFriend {
  id: string;
  name: string;
  initials: string;
  online: boolean;
}

export const DUMMY_FRIENDS: DummyFriend[] = [
  { id: 'meera', name: 'Meera',  initials: 'ME', online: true },
  { id: 'arjun', name: 'Arjun',  initials: 'AR', online: true },
  { id: 'kabir', name: 'Kabir',  initials: 'KA', online: true },
];

export interface DummyRecentGame {
  id: string;
  title: string;
  subtitle: string;
  result: 'WON' | 'LOST' | 'DRAW';
  gameId: GameId;
}

export const DUMMY_RECENT: DummyRecentGame[] = [
  {
    id: '1',
    title: 'Carrom with Meera',
    subtitle: 'Yesterday · You won 25–18',
    result: 'WON',
    gameId: 'carrom',
  },
];

export interface DummyPopularGame {
  id: GameId;
  title: string;
  tagline: string;
  onlineCount: string;
}

export const DUMMY_POPULAR: DummyPopularGame[] = [
  { id: 'ludo',   title: 'Ludo',   tagline: "The club's favourite",    onlineCount: '2.4k' },
  { id: 'carrom', title: 'Carrom', tagline: 'A perfect evening flick', onlineCount: '1.2k' },
];
