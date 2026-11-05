import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { useUserStore } from '../../store/userStore';
import { DUMMY_FRIENDS } from '../../data/dummy';
import { playSound } from '../../services/sound';
import { DiceTile } from '../../features/games/shared/DiceTile';
import { Board } from '../../features/games/ludo/Board';
import {
  useLudoStore,
  LUDO_COLOR_META,
  type LudoPlayer,
} from '../../features/games/ludo/store';
import {
  chooseBotMove,
  countHome,
  type LudoColor,
} from '../../features/games/ludo/logic';

const DICE_ANIM_MS = 600;
const BOT_ROLL_DELAY_MS = 900;
const BOT_MOVE_DELAY_MS = 700;
const AUTO_MOVE_DELAY_MS = 400;
const SKIP_DELAY_MS = 900;

function colorsForCount(n: number): LudoColor[] {
  if (n === 2) return ['red', 'yellow'];
  if (n === 3) return ['red', 'green', 'yellow'];
  return ['red', 'green', 'yellow', 'blue'];
}

export default function LudoGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ players?: string; mode?: string }>();

  const parsed = Number(params.players);
  const playerCount = parsed >= 2 && parsed <= 4 ? parsed : 4;
  const mode =
    params.mode === 'friends' || params.mode === 'online' || params.mode === 'bots'
      ? params.mode
      : 'bots';

  const userName = useUserStore((st) => st.name) || 'Aanya';
  const userPhotoUri = useUserStore((st) => st.photoUri);
  const addRewards = useUserStore((st) => st.addRewards);

  const players = useLudoStore((st) => st.players);
  const tokens = useLudoStore((st) => st.tokens);
  const currentPlayerIndex = useLudoStore((st) => st.currentPlayerIndex);
  const lastRoll = useLudoStore((st) => st.lastRoll);
  const isRolling = useLudoStore((st) => st.isRolling);
  const phase = useLudoStore((st) => st.phase);
  const movable = useLudoStore((st) => st.movable);
  const activeMove = useLudoStore((st) => st.activeMove);
  const moveLog = useLudoStore((st) => st.moveLog);
  const winner = useLudoStore((st) => st.winner);
  const threeSixesCancel = useLudoStore((st) => st.threeSixesCancel);

  const startGame = useLudoStore((st) => st.startGame);
  const roll = useLudoStore((st) => st.roll);
  const commitRoll = useLudoStore((st) => st.commitRoll);
  const moveToken = useLudoStore((st) => st.moveToken);
  const selectToken = useLudoStore((st) => st.selectToken);
  const nextTurn = useLudoStore((st) => st.nextTurn);
  const setThreeSixesCancel = useLudoStore((st) => st.setThreeSixesCancel);
  const reset = useLudoStore((st) => st.reset);

  const [toast, setToast] = useState<string | null>(null);
  const rewardedRef = useRef<string | null>(null);

  const buildPlayers = useCallback((): LudoPlayer[] => {
    const cs = colorsForCount(playerCount);
    const botsOn = mode !== 'friends';
    const user: LudoPlayer = {
      id: 'user',
      name: userName,
      displayName: `${userName} · You`,
      color: cs[0],
      isBot: false,
      isUser: true,
      avatar: { photoUri: userPhotoUri, initials: userName.slice(0, 2).toUpperCase() },
    };
    const others: LudoPlayer[] = DUMMY_FRIENDS.slice(0, playerCount - 1).map((f, i) => ({
      id: f.id,
      name: f.name,
      displayName: f.name,
      color: cs[i + 1],
      isBot: botsOn,
      isUser: false,
      avatar: { photoUri: null, initials: f.initials },
    }));
    return [user, ...others];
  }, [mode, playerCount, userName, userPhotoUri]);

  useEffect(() => {
    rewardedRef.current = null;
    startGame(buildPlayers());
    return () => reset();
  }, [buildPlayers, startGame, reset]);

  const current = players[currentPlayerIndex];
  const nextPlayer = players.length > 0 ? players[(currentPlayerIndex + 1) % players.length] : undefined;

  const handleRoll = useCallback(() => {
    const v = roll();
    if (v !== null) {
      playSound('dice');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, [roll]);

  // Settle the dice after the shake animation
  useEffect(() => {
    if (!isRolling) return undefined;
    const t = setTimeout(() => commitRoll(), DICE_ANIM_MS);
    return () => clearTimeout(t);
  }, [isRolling, commitRoll]);

  // Bot rolls automatically
  useEffect(() => {
    if (!current || !current.isBot || phase !== 'roll' || isRolling || winner) return undefined;
    const t = setTimeout(handleRoll, BOT_ROLL_DELAY_MS);
    return () => clearTimeout(t);
  }, [current, phase, isRolling, winner, handleRoll]);

  // After a roll: skip when nothing can move, bots choose, humans auto-move a single option
  useEffect(() => {
    if (!current || phase !== 'select' || winner) return undefined;

    if (movable.length === 0) {
      const t = setTimeout(() => nextTurn(), SKIP_DELAY_MS);
      return () => clearTimeout(t);
    }
    if (current.isBot) {
      const t = setTimeout(() => {
        const id = chooseBotMove(tokens, current.color, lastRoll ?? 0) ?? movable[0];
        moveToken(id);
      }, BOT_MOVE_DELAY_MS);
      return () => clearTimeout(t);
    }
    if (movable.length === 1) {
      const t = setTimeout(() => moveToken(movable[0]), AUTO_MOVE_DELAY_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [current, phase, movable, tokens, lastRoll, winner, moveToken, nextTurn]);

  // Winner effects
  useEffect(() => {
    if (!winner) return;
    playSound('win');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (winner.isUser && rewardedRef.current !== winner.id) {
      rewardedRef.current = winner.id;
      addRewards(60, 25);
    }
  }, [winner, addRewards]);

  const handleCapture = useCallback(() => {
    playSound('capture');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, []);

  const handleReachHome = useCallback(() => {
    playSound('home');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((c) => (c === msg ? null : c)), 2000);
  };

  const goLobby = () => router.replace('/(tabs)/games?game=ludo');

  const confirmLeave = () => {
    Alert.alert('Leave game?', 'Are you sure you want to leave this table? Progress will be lost.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => (router.canGoBack() ? router.back() : goLobby()),
      },
    ]);
  };

  const openSettings = () => {
    Alert.alert(
      'Table rules',
      `Three sixes in a row cancel your turn: ${threeSixesCancel ? 'ON' : 'OFF'}.`,
      [
        {
          text: threeSixesCancel ? 'Turn OFF' : 'Turn ON',
          onPress: () => setThreeSixesCancel(!threeSixesCancel),
        },
        { text: 'Done', style: 'cancel' },
      ],
    );
  };

  const playAgain = () => {
    rewardedRef.current = null;
    startGame(buildPlayers());
  };

  const isHumanTurn = !!current && !current.isBot;
  const highlight = isHumanTurn && phase === 'select' && !winner;
  const colorLabel = current ? LUDO_COLOR_META[current.color].label.toLowerCase() : '';

  const { title, sub } = useMemo(() => {
    if (!current) return { title: '', sub: '' };
    const name = current.isUser ? 'You' : current.name;
    if (phase === 'roll' || lastRoll === null) {
      return {
        title: `Roll the dice, ${current.name}`,
        sub: 'Roll a six to bring a token out.',
      };
    }
    if (phase === 'select' && movable.length === 0) {
      return { title: `${name} rolled ${lastRoll}`, sub: 'No move possible. Passing the turn.' };
    }
    if (lastRoll === 6) {
      return {
        title: 'A six! Nice one.',
        sub: `Choose a ${colorLabel} token to move. You roll again after your move.`,
      };
    }
    return {
      title: `${name} rolled ${lastRoll}`,
      sub: current.isBot ? `${current.name} is choosing a token…` : 'Choose a token to move.',
    };
  }, [current, phase, lastRoll, movable.length, colorLabel]);

  const waitingForSelect = isHumanTurn && phase === 'select' && movable.length > 0;
  const rollDisabled = phase !== 'roll' || isRolling || !isHumanTurn || !!winner;

  const renderCard = (p: LudoPlayer) => {
    const isCurrent = current?.id === p.id && !winner;
    const isNext = nextPlayer?.id === p.id && !isCurrent;
    const home = countHome(tokens, p.color);
    const status = isCurrent ? 'Your turn' : isNext ? 'Up next' : `${home} home`;
    return (
      <View key={p.id} style={[s.playerCard, isCurrent && s.playerCardActive]}>
        <Avatar
          source={p.avatar.photoUri ? { uri: p.avatar.photoUri } : undefined}
          initials={p.avatar.initials}
          size="sm"
        />
        <View style={s.playerText}>
          <Text style={s.playerName} numberOfLines={1}>
            {p.displayName}
          </Text>
          <Text style={[s.playerSub, isCurrent && s.playerSubActive]} numberOfLines={1}>
            {LUDO_COLOR_META[p.color].label} · {status}
          </Text>
        </View>
      </View>
    );
  };

  const topPlayers = players.slice(0, 2);
  const bottomPlayers = players.slice(2);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <TouchableOpacity style={s.iconBtn} onPress={confirmLeave} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.ink} />
          </TouchableOpacity>
          <View style={s.headerText}>
            <Text style={s.headerTitle}>Ludo</Text>
            <Text style={s.headerSub}>
              The evening club · {players.length || playerCount} friends
            </Text>
          </View>
          <TouchableOpacity style={s.iconBtn} onPress={openSettings} hitSlop={8}>
            <Ionicons name="options-outline" size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={s.chipRow}>
          <View style={s.chip}>
            <Text style={s.chipText}>Classic · 4 tokens</Text>
          </View>
          <Text style={s.mutedText}>Safe squares marked ☆</Text>
        </View>

        <View style={s.cardsRow}>{topPlayers.map(renderCard)}</View>

        <Board
          tokens={tokens}
          movable={movable}
          highlightMovable={highlight}
          activeMove={activeMove}
          onTokenPress={selectToken}
          onMoveComplete={nextTurn}
          onCapture={handleCapture}
          onReachHome={handleReachHome}
        />

        {bottomPlayers.length > 0 && <View style={s.cardsRow}>{bottomPlayers.map(renderCard)}</View>}

        <View style={s.turnCard}>
          <View style={s.turnTop}>
            <DiceTile value={lastRoll ?? 4} isRolling={isRolling} />
            <View style={s.turnTextCol}>
              <Text style={s.turnTitle}>{title}</Text>
              <Text style={s.turnSub}>{sub}</Text>
            </View>
          </View>
          {waitingForSelect ? (
            <Button label="Roll dice · move a token first" variant="soft" disabled onPress={() => {}} />
          ) : (
            <Button label="Roll dice" variant="primary" disabled={rollDisabled} onPress={handleRoll} />
          )}
        </View>

        <View style={s.logCard}>
          <MaterialCommunityIcons name="history" size={20} color={colors.textMuted} />
          <Text style={s.logText} numberOfLines={2}>
            {moveLog[0] ?? 'Roll a six to bring a token out.'}
          </Text>
        </View>

        <View style={s.bottomRow}>
          <TouchableOpacity onPress={() => showToast('Coming soon')} hitSlop={10}>
            <Text style={s.chatText}>Chat & reactions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmLeave} hitSlop={10}>
            <Text style={s.leaveText}>Leave game</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {toast && (
        <View style={s.toastWrap} pointerEvents="none">
          <View style={s.toastPill}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.paper} />
            <Text style={s.toastText}>{toast}</Text>
          </View>
        </View>
      )}

      <Modal visible={winner !== null} transparent animationType="fade" onRequestClose={goLobby}>
        <Pressable style={s.overlay}>
          <View style={s.modalCard}>
            <View style={s.trophy}>
              <Ionicons name="trophy" size={32} color={colors.saffron} />
            </View>
            <Text style={s.modalTitle}>{winner?.name ?? 'Player'} wins! 🎉</Text>
            <Text style={s.modalSub}>
              {winner?.isUser
                ? 'All four tokens made it home!'
                : `${winner?.name} brought all four tokens home. Great game!`}
            </Text>
            {winner?.isUser && (
              <View style={s.rewardsRow}>
                <View style={[s.rewardChip, { backgroundColor: colors.lavender }]}>
                  <Ionicons name="sparkles" size={15} color={colors.violet} />
                  <Text style={[s.rewardText, { color: colors.violet }]}>+60 club pts</Text>
                </View>
                <View style={[s.rewardChip, { backgroundColor: colors.saffronSoft }]}>
                  <MaterialCommunityIcons name="circle-multiple-outline" size={16} color={colors.saffron} />
                  <Text style={[s.rewardText, { color: colors.ink }]}>+25 coins</Text>
                </View>
              </View>
            )}
            <View style={s.modalBtns}>
              <Button label="Play again" variant="primary" onPress={playAgain} />
              <Button label="Back to lobby" variant="outline" onPress={goLobby} />
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.pageMargin,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, marginLeft: spacing.xs },
  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  headerSub: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted, marginTop: 1 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: {
    backgroundColor: colors.saffronSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  chipText: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.ink },
  mutedText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  cardsRow: { flexDirection: 'row', gap: spacing.sm },
  playerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  playerCardActive: { backgroundColor: colors.lavender, borderColor: colors.violet },
  playerText: { flex: 1, gap: 2 },
  playerName: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  playerSub: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  playerSubActive: { color: colors.violet },
  turnCard: { backgroundColor: colors.lavender, borderRadius: radius.card, padding: spacing.lg, gap: spacing.md },
  turnTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  turnTextCol: { flex: 1, gap: 2 },
  turnTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  turnSub: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.violet,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logText: {
    flex: 1,
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
  },
  chatText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.violet,
  },
  leaveText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  toastWrap: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.pageMargin,
    right: spacing.pageMargin,
    alignItems: 'center',
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  toastText: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.paper },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.pageMargin,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.paper,
    borderRadius: radius.hero,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  trophy: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.saffronSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  rewardsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  rewardText: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold },
  modalBtns: { width: '100%', gap: spacing.sm, marginTop: spacing.xs },
});
