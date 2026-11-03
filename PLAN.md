# Khel Club: Build Plan

Mobile game app (React Native + Expo + TypeScript) with 4 games: **Carrom, Chess, Snakes & Ladders, Ludo**.
Design source: Figma file "Untitled" (19 frames). Style: light theme, violet primary, Nunito Sans font.

## Rules for the AI agent
- Build ONE screen/feature per prompt. Commit after each.
- Always import colors/spacing/typography from `src/theme/theme.ts`. Never hardcode hex values.
- Boards (Ludo, Chess, Snakes & Ladders, Carrom) are drawn in code with `react-native-svg`. Do NOT export boards as images.
- No cash stakes anywhere. Coins and points are cosmetic only.

## Tech stack
- Expo (SDK latest) + TypeScript + expo-router
- react-native-svg, react-native-reanimated, react-native-gesture-handler
- zustand (state), @react-native-async-storage/async-storage (local save)
- chess.js (chess rules), matter-js (carrom physics)
- expo-audio (sounds), expo-haptics, @expo-google-fonts/nunito-sans
- Backend (phase 2): Firebase Auth (phone OTP + Google), Firestore / Realtime DB (rooms, matchmaking, friends, leaderboard)
- i18n: i18next (English, Tamil, Hindi, as in Settings screen)

## Screens (from Figma)
Auth flow: Splash, Welcome, Sign in, OTP verification, Profile setup
Main tabs: Home, Games, Friends, Leaderboard, Profile
Lobby flow: Game lobby, Private room, Matchmaking loading
Gameplay: Carrom, Chess, Snakes & Ladders, Ludo
Other: Settings, error/empty states (lost connection, no clubmate found)

## Navigation (expo-router)
```
app/
  _layout.tsx
  index.tsx                 -> Splash
  (auth)/welcome.tsx
  (auth)/sign-in.tsx
  (auth)/otp.tsx
  (auth)/profile-setup.tsx
  (tabs)/_layout.tsx        -> bottom bar: Home, Games, Friends, Leaderboard, Profile
  (tabs)/home.tsx
  (tabs)/games.tsx          -> Game lobby (param: game)
  (tabs)/friends.tsx
  (tabs)/leaderboard.tsx
  (tabs)/profile.tsx
  settings.tsx
  room/[code].tsx           -> Private room
  matchmaking.tsx
  game/carrom.tsx
  game/chess.tsx
  game/snakes.tsx
  game/ludo.tsx
```
Gameplay and auth screens have NO bottom tab bar.

## Folder structure
```
src/
  theme/theme.ts
  components/   (Button, Input, OtpInput, GameCard, Avatar, Chip, Card, TabBar, Toast)
  features/
    auth/
    home/
    lobby/
    friends/
    leaderboard/
    profile/
    games/
      snakes/   (board.tsx, logic.ts, store.ts)
      ludo/     (board.tsx, logic.ts, store.ts)
      chess/    (board.tsx, pieces/, store.ts, ai.ts)
      carrom/   (board.tsx, physics.ts, store.ts)
  store/        (user, settings, coins)
  services/     (firebase, sound, storage)
  i18n/
assets/
  images/ (hero, game-cards, avatars)
  icons/
  sounds/
```

## Assets to export from Figma
- Game card photos: carrom, chess, snakes & ladders, ludo (PNG 3x)
- Welcome hero image (PNG 3x)
- Home banner carrom image (PNG 3x)
- Club avatar icons: cat, bird, rabbit, turtle, fish (SVG)
- Tab bar and UI icons (SVG)
- Chess pieces, 12 pieces: `chess_king_white` etc. (SVG)
- Dice faces 1-6 (SVG, or draw with code)
- Splash logo (SVG)
Layer names: lowercase with underscores.

## Build phases (order matters)

### Phase 1: Foundation
1. Expo project + folders + install packages
2. `theme.ts`, Nunito Sans fonts loaded
3. Common components (Button states, Input states, OtpInput, Chip, Card, GameCard, Avatar)
4. Navigation shell with bottom tab bar

### Phase 2: UI with dummy data
5. Splash, Welcome, Sign in, OTP, Profile setup
6. Home, Games (lobby), Friends, Leaderboard, Profile, Settings
7. Private room, Matchmaking, error/empty states

### Phase 3: Games (offline, local pass-and-play + vs computer)
8. **Snakes & Ladders** (easiest): 10x10 serpentine board, dice, snake/ladder map, exact roll to finish at 100, 2-4 players
9. **Ludo**: 52-cell path + home columns, 4 tokens each, six = extra turn, capture, safe squares
10. **Chess**: chess.js rules, board UI, clocks, move history, undo (casual), draw, resign; simple AI later
11. **Carrom**: matter-js physics, striker slide + pull-back power, pockets, queen cover rule, 2 or 4 players

### Phase 4: Online features
12. Firebase Auth (phone OTP + Google)
13. Friends, Club ID, invites
14. Private rooms (6-character code), matchmaking
15. Realtime game sync (turn-based first: Chess, Snakes, Ludo; Carrom last)
16. Leaderboard, coins and points

### Phase 5: Polish and launch
17. Sounds, haptics, animations
18. Tamil / Hindi translations
19. Testing on real devices, EAS build, Google Play Console

## Game rules notes
- Snakes & Ladders: exact roll needed to reach 100.
- Ludo: Classic, 4 tokens, safe squares marked with a star.
- Chess: 8x8, clocks (10 min Rapid), undo only in casual friend games with approval.
- Carrom: 2 or 4 players, pocket coins then cover the queen.