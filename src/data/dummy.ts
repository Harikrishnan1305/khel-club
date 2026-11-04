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

// ─── Friends tab ─────────────────────────────────────────────────────────────
export interface DummyClubFriend {
  id: string;
  name: string;
  initials: string;
  online: boolean;
  status: string; // e.g. "Online · Ready to play"
}

export const DUMMY_CLUB_FRIENDS: DummyClubFriend[] = [
  { id: 'meera',  name: 'Meera',  initials: 'ME', online: true,  status: 'Online · Ready to play' },
  { id: 'arjun',  name: 'Arjun',  initials: 'AR', online: true,  status: 'Online · In the lobby' },
  { id: 'kabir',  name: 'Kabir',  initials: 'KA', online: true,  status: 'Online · Ready to play' },
  { id: 'ishaan', name: 'Ishaan', initials: 'IS', online: false, status: 'Offline · Seen 2h ago' },
  { id: 'nila',   name: 'Nila',   initials: 'NI', online: false, status: 'Offline · Seen yesterday' },
  { id: 'dev',    name: 'Dev',    initials: 'DE', online: false, status: 'Offline · Seen yesterday' },
];

export interface DummyPlayedWith {
  id: string;
  name: string;
  initials: string;
  detail: string;
}

export const DUMMY_PLAYED_WITH: DummyPlayedWith[] = [
  { id: 'riya',  name: 'Riya',  initials: 'RI', detail: 'Ludo · Today' },
  { id: 'sahil', name: 'Sahil', initials: 'SA', detail: 'Carrom · Yesterday' },
];

// ─── Leaderboard tab ─────────────────────────────────────────────────────────
export interface DummyLeaderEntry {
  id: string;
  rank: number;
  name: string;
  initials: string;
  points: number;
}

export const DUMMY_PODIUM: DummyLeaderEntry[] = [
  { id: 'rohan', rank: 1, name: 'Rohan', initials: 'RO', points: 4820 },
  { id: 'meera', rank: 2, name: 'Meera', initials: 'ME', points: 4160 },
  { id: 'arjun', rank: 3, name: 'Arjun', initials: 'AR', points: 3940 },
];

export const DUMMY_LEADERBOARD_ROWS: DummyLeaderEntry[] = [
  { id: 'kabir',  rank: 4, name: 'Kabir',  initials: 'KA', points: 3720 },
  { id: 'nila',   rank: 5, name: 'Nila',   initials: 'NI', points: 3480 },
  { id: 'ishaan', rank: 6, name: 'Ishaan', initials: 'IS', points: 3290 },
];

export const DUMMY_FRIENDS_LEADERBOARD: DummyLeaderEntry[] = [
  { id: 'meera', rank: 1, name: 'Meera', initials: 'ME', points: 4160 },
  { id: 'arjun', rank: 2, name: 'Arjun', initials: 'AR', points: 3940 },
  { id: 'kabir', rank: 3, name: 'Kabir', initials: 'KA', points: 3720 },
];

export const USER_RANK = 18;
export const USER_POINTS_FALLBACK = 2480;

// ─── Profile tab ─────────────────────────────────────────────────────────────
export const DUMMY_PROFILE_STATS = { played: 120, wins: 72, winRate: 60 };

export interface DummyGameHistory {
  id: GameId;
  title: string;
  imageKey: string;
  played: number;
  wins: number;
  winRate: number; // percent
}

export const DUMMY_GAME_HISTORY: DummyGameHistory[] = [
  { id: 'carrom', title: 'Carrom',           imageKey: 'card_carrom', played: 40, wins: 26, winRate: 65 },
  { id: 'chess',  title: 'Chess',            imageKey: 'card_chess',  played: 30, wins: 18, winRate: 60 },
  { id: 'snakes', title: 'Snakes & Ladders', imageKey: 'card_snakes', played: 20, wins: 10, winRate: 50 },
  { id: 'ludo',   title: 'Ludo',             imageKey: 'card_ludo',   played: 30, wins: 18, winRate: 60 },
];

export interface DummyLatestMatch {
  id: string;
  title: string;
  detail: string;
  result: 'Won' | 'Lost';
}

export const DUMMY_LATEST_MATCHES: DummyLatestMatch[] = [
  { id: '1', title: 'Carrom vs Meera',  detail: 'Yesterday · 25–18',    result: 'Won'  },
  { id: '2', title: 'Chess vs Kabir',   detail: '30 Oct · Checkmate',   result: 'Won'  },
  { id: '3', title: 'Ludo with friends', detail: '29 Oct · Finished 3rd', result: 'Lost' },
];

// ─── Settings ────────────────────────────────────────────────────────────────
export type LanguageId = 'en' | 'ta' | 'hi';

export const DUMMY_LANGUAGES: { id: LanguageId; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'ta', label: 'Tamil · தமிழ்' },
  { id: 'hi', label: 'Hindi · हिन्दी' },
];
