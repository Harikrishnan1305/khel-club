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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  radius,
} from '../../theme/theme';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { useUserStore } from '../../store/userStore';
import { DUMMY_FRIENDS } from '../../data/dummy';
import { playSound } from '../../services/sound';
import { Board } from '../../features/games/snakes/Board';
import {
  useSnakesStore,
  PLAYER_COLOR_META,
  type SnakesPlayer,
  type PlayerColorKey,
} from '../../features/games/snakes/store';
import { rollDice, type MoveVia } from '../../features/games/snakes/logic';

const DICE_ROLL_ANIM_MS = 600;
const BOT_TURN_DELAY_MS = 900;

// 3x3 grid dot indices (0..8) for standard dice faces 1..6
const DICE_DOTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function triggerHapticImpact() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

function triggerHapticNotification(type: Haptics.NotificationFeedbackType) {
  Haptics.notificationAsync(type).catch(() => {});
}

interface DiceTileProps {
  value: number;
  isRolling: boolean;
}

function DiceTile({ value, isRolling }: DiceTileProps) {
  const [displayFace, setDisplayFace] = useState<number>(value || 4);
  const rotateDeg = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRolling) {
      rotateDeg.value = withRepeat(
        withSequence(
          withTiming(-14, { duration: 75 }),
          withTiming(14, { duration: 75 }),
        ),
        -1,
        true,
      );
      scale.value = withSequence(
        withTiming(1.08, { duration: 120 }),
        withTiming(0.96, { duration: 120 }),
      );

      const interval = setInterval(() => {
        setDisplayFace(rollDice());
      }, 85);

      return () => {
        clearInterval(interval);
      };
    }

    cancelAnimation(rotateDeg);
    rotateDeg.value = withTiming(0, { duration: 120 });
    scale.value = withSequence(
      withTiming(1.12, { duration: 100 }),
      withTiming(1, { duration: 120 }),
    );
    setDisplayFace(value || 4);
    return undefined;
  }, [isRolling, value, rotateDeg, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotateDeg.value}deg` },
      { scale: scale.value },
    ],
  }));

  const activeDots = DICE_DOTS[displayFace] ?? DICE_DOTS[4];

  return (
    <Animated.View style={[s.diceTile, animStyle]}>
      <View style={s.diceGrid}>
        {Array.from({ length: 9 }).map((_, idx) => {
          const visible = activeDots.includes(idx);
          return (
            <View key={idx} style={s.diceCell}>
              {visible && <View style={s.diceDot} />}
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default function SnakesGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ players?: string; mode?: string }>();

  const parsedPlayers = Number(params.players);
  const playerCount =
    parsedPlayers >= 2 && parsedPlayers <= 4 ? parsedPlayers : 4;
  const mode =
    params.mode === 'friends' || params.mode === 'online' || params.mode === 'bots'
      ? params.mode
      : 'bots';

  const userName = useUserStore((st) => st.name) || 'Aanya';
  const userPhotoUri = useUserStore((st) => st.photoUri);
  const addRewards = useUserStore((st) => st.addRewards);

  const players = useSnakesStore((st) => st.players);
  const currentPlayerIndex = useSnakesStore((st) => st.currentPlayerIndex);
  const lastRoll = useSnakesStore((st) => st.lastRoll);
  const isRolling = useSnakesStore((st) => st.isRolling);
  const isMoving = useSnakesStore((st) => st.isMoving);
  const activeMove = useSnakesStore((st) => st.activeMove);
  const moveLog = useSnakesStore((st) => st.moveLog);
  const winner = useSnakesStore((st) => st.winner);
  const extraTurnOnSix = useSnakesStore((st) => st.extraTurnOnSix);

  const startGame = useSnakesStore((st) => st.startGame);
  const roll = useSnakesStore((st) => st.roll);
  const commitRoll = useSnakesStore((st) => st.commitRoll);
  const nextTurn = useSnakesStore((st) => st.nextTurn);
  const setExtraTurnOnSix = useSnakesStore((st) => st.setExtraTurnOnSix);
  const reset = useSnakesStore((st) => st.reset);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const rewardedWinnerRef = useRef<string | null>(null);

  const buildInitialPlayers = useCallback((): SnakesPlayer[] => {
    const colorOrder: PlayerColorKey[] = ['violet', 'green', 'blue', 'red'];
    const otherAreBots = mode !== 'friends';

    const userPlayer: SnakesPlayer = {
      id: 'user',
      name: userName,
      displayName: `${userName} · You`,
      color: colorOrder[0],
      isBot: false,
      isUser: true,
      position: 1,
      avatar: {
        photoUri: userPhotoUri,
        initials: userName.slice(0, 2).toUpperCase(),
      },
    };

    const others: SnakesPlayer[] = DUMMY_FRIENDS.slice(0, playerCount - 1).map(
      (friend, idx) => ({
        id: friend.id,
        name: friend.name,
        displayName: friend.name,
        color: colorOrder[idx + 1] ?? 'green',
        isBot: otherAreBots,
        isUser: false,
        position: 1,
        avatar: {
          photoUri: null,
          initials: friend.initials,
        },
      }),
    );

    return [userPlayer, ...others];
  }, [mode, playerCount, userName, userPhotoUri]);

  // Initialize game on mount, reset on unmount
  useEffect(() => {
    rewardedWinnerRef.current = null;
    startGame(buildInitialPlayers());
    return () => {
      reset();
    };
  }, [buildInitialPlayers, startGame, reset]);

  const currentPlayer = players[currentPlayerIndex] ?? players[0];

  const handleStartRoll = useCallback(() => {
    const rolled = roll();
    if (rolled !== null) {
      playSound('dice');
      triggerHapticImpact();
    }
  }, [roll]);

  // Settle the dice after 600ms of shaking & random faces
  useEffect(() => {
    if (!isRolling) return undefined;
    const timer = setTimeout(() => {
      commitRoll();
    }, DICE_ROLL_ANIM_MS);
    return () => clearTimeout(timer);
  }, [isRolling, commitRoll]);

  // Bot auto-rolls after 900ms when it is a bot's turn
  useEffect(() => {
    if (
      !currentPlayer ||
      !currentPlayer.isBot ||
      isRolling ||
      isMoving ||
      winner !== null
    ) {
      return undefined;
    }
    const timer = setTimeout(() => {
      handleStartRoll();
    }, BOT_TURN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [currentPlayer, isRolling, isMoving, winner, handleStartRoll]);

  // Award points & coins and play sound when someone wins
  useEffect(() => {
    if (!winner) return;
    playSound('win');
    triggerHapticNotification(Haptics.NotificationFeedbackType.Success);

    if (winner.isUser && rewardedWinnerRef.current !== winner.id) {
      rewardedWinnerRef.current = winner.id;
      addRewards(50, 20);
    }
  }, [winner, addRewards]);

  const handleSlideStart = useCallback((via: MoveVia) => {
    if (via === 'ladder') {
      playSound('ladder');
      triggerHapticNotification(Haptics.NotificationFeedbackType.Success);
    } else if (via === 'snake') {
      playSound('snake');
      triggerHapticNotification(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  const handleMoveComplete = useCallback(() => {
    nextTurn();
  }, [nextTurn]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2000);
  };

  const confirmLeaveGame = () => {
    Alert.alert(
      'Leave game?',
      'Are you sure you want to leave this table? Current board progress will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/games?game=snakes');
            }
          },
        },
      ],
    );
  };

  const handleOpenSettings = () => {
    Alert.alert(
      'Table rules',
      `Extra turn on rolling a 6 is currently ${extraTurnOnSix ? 'ON' : 'OFF'}.`,
      [
        {
          text: extraTurnOnSix ? 'Turn OFF extra roll on 6' : 'Turn ON extra roll on 6',
          onPress: () => setExtraTurnOnSix(!extraTurnOnSix),
        },
        { text: 'Done', style: 'cancel' },
      ],
    );
  };

  const handlePlayAgain = () => {
    rewardedWinnerRef.current = null;
    startGame(buildInitialPlayers());
  };

  const handleBackToLobby = () => {
    router.replace('/(tabs)/games?game=snakes');
  };

  const turnTitle = useMemo(() => {
    if (!currentPlayer) return 'Your turn';
    if (currentPlayer.isUser || mode === 'friends') {
      return `Your turn, ${currentPlayer.name}`;
    }
    return `${currentPlayer.name}’s turn`;
  }, [currentPlayer, mode]);

  const turnSubtitle = useMemo(() => {
    if (!currentPlayer) return '';
    if (currentPlayer.isBot) {
      return `${currentPlayer.name} is on ${currentPlayer.position}. Rolling the dice…`;
    }
    return `You're on ${currentPlayer.position}. Where will the dice take you?`;
  }, [currentPlayer]);

  const rollDisabled =
    isRolling || isMoving || winner !== null || Boolean(currentPlayer?.isBot);

  const latestLog =
    moveLog[0] ?? 'Roll the dice to begin. Exact roll needed to reach 100.';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={confirmLeaveGame}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.ink} />
          </TouchableOpacity>

          <View style={s.headerTextWrap}>
            <Text style={s.headerTitle}>Snakes & Ladders</Text>
            <Text style={s.headerSub}>
              The evening club · {players.length || playerCount} players
            </Text>
          </View>

          <TouchableOpacity
            style={s.iconBtn}
            onPress={handleOpenSettings}
            hitSlop={8}
          >
            <Ionicons name="options-outline" size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* ── Race to 100 chip + Exact roll text ── */}
        <View style={s.ruleBannerRow}>
          <View style={s.raceChip}>
            <Text style={s.raceChipText}>Race to 100</Text>
          </View>
          <Text style={s.exactRollText}>Exact roll to finish</Text>
        </View>

        {/* ── SVG Board ── */}
        <Board
          players={players}
          activeMove={activeMove}
          onSlideStart={handleSlideStart}
          onMoveComplete={handleMoveComplete}
        />

        {/* ── 2x2 Player Cards Grid ── */}
        <View style={s.playersGrid}>
          {players.map((p, idx) => {
            const isCurrent = idx === currentPlayerIndex && winner === null;
            const colorLabel = PLAYER_COLOR_META[p.color].label;
            const photoSource = p.avatar.photoUri
              ? { uri: p.avatar.photoUri }
              : undefined;

            return (
              <View
                key={p.id}
                style={[s.playerCard, isCurrent && s.playerCardActive]}
              >
                <Avatar
                  source={photoSource}
                  initials={p.avatar.initials}
                  size="sm"
                />
                <View style={s.playerCardText}>
                  <Text style={s.playerName} numberOfLines={1}>
                    {p.displayName}
                  </Text>
                  <Text
                    style={[
                      s.playerSquare,
                      isCurrent && s.playerSquareActive,
                    ]}
                    numberOfLines={1}
                  >
                    {colorLabel} · Square {p.position}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Lavender Turn & Dice Card ── */}
        <View style={s.turnCard}>
          <View style={s.turnTopRow}>
            <DiceTile value={lastRoll ?? 4} isRolling={isRolling} />
            <View style={s.turnTextCol}>
              <Text style={s.turnTitle}>{turnTitle}</Text>
              <Text style={s.turnSub}>{turnSubtitle}</Text>
            </View>
          </View>

          <Button
            label={isRolling ? 'Rolling…' : 'Roll dice'}
            variant="primary"
            disabled={rollDisabled}
            onPress={handleStartRoll}
          />
        </View>

        {/* ── White Move Log Card ── */}
        <View style={s.logCard}>
          <MaterialCommunityIcons
            name="history"
            size={20}
            color={colors.textMuted}
          />
          <Text style={s.logText} numberOfLines={2}>
            {latestLog}
          </Text>
        </View>

        {/* ── Bottom Row: Chat & Leave game ── */}
        <View style={s.bottomActionsRow}>
          <TouchableOpacity
            onPress={() => showToast('Chat coming soon')}
            hitSlop={10}
          >
            <Text style={s.chatText}>Chat · 2 new messages</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={confirmLeaveGame} hitSlop={10}>
            <Text style={s.leaveText}>Leave game</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <View style={s.toastWrap} pointerEvents="none">
          <View style={s.toastPill}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color={colors.paper}
            />
            <Text style={s.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* ── Winner Modal ── */}
      <Modal
        visible={winner !== null}
        transparent
        animationType="fade"
        onRequestClose={handleBackToLobby}
      >
        <Pressable style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.trophyCircle}>
              <Ionicons name="trophy" size={32} color={colors.saffron} />
            </View>

            <Text style={s.modalTitle}>
              {winner?.name ?? 'Player'} wins! 🎉
            </Text>

            <Text style={s.modalSubtitle}>
              {winner?.isUser
                ? 'Reached square 100 with an exact roll!'
                : `${winner?.name} reached square 100 first. Great game!`}
            </Text>

            <View style={s.rewardsRow}>
              <View style={[s.rewardChip, { backgroundColor: colors.lavender }]}>
                <Ionicons name="sparkles" size={15} color={colors.violet} />
                <Text style={[s.rewardChipText, { color: colors.violet }]}>
                  {winner?.isUser ? '+50 club pts' : '+10 club pts'}
                </Text>
              </View>
              {winner?.isUser && (
                <View
                  style={[
                    s.rewardChip,
                    { backgroundColor: colors.saffronSoft },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="circle-multiple-outline"
                    size={16}
                    color={colors.saffron}
                  />
                  <Text style={[s.rewardChipText, { color: colors.ink }]}>
                    +20 coins
                  </Text>
                </View>
              )}
            </View>

            <View style={s.modalBtns}>
              <Button
                label="Play again"
                variant="primary"
                onPress={handlePlayAgain}
              />
              <Button
                label="Back to lobby"
                variant="outline"
                onPress={handleBackToLobby}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.pageMargin,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
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
  headerTextWrap: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  headerSub: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    marginTop: 1,
  },

  // Rule banner row
  ruleBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  raceChip: {
    backgroundColor: colors.saffronSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  raceChipText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  exactRollText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },

  // 2x2 Player Cards Grid
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  playerCard: {
    width: '48.5%',
    flexGrow: 1,
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
  playerCardActive: {
    backgroundColor: colors.lavender,
    borderColor: colors.violet,
  },
  playerCardText: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  playerSquare: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  playerSquareActive: {
    color: colors.violet,
  },

  // Lavender Turn Card
  turnCard: {
    backgroundColor: colors.lavender,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  turnTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  diceTile: {
    width: 56,
    height: 56,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.paper,
    padding: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  diceGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  diceCell: {
    width: '33.33%',
    height: '33.33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.violet,
  },
  turnTextCol: {
    flex: 1,
    gap: 2,
  },
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

  // Move Log Card
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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

  // Bottom Row
  bottomActionsRow: {
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

  // Toast
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
  toastText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.paper,
  },

  // Winner Modal
  modalOverlay: {
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
  trophyCircle: {
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
  modalSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  rewardChipText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
  },
  modalBtns: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
