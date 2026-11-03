import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  radius,
} from '../theme/theme';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { useUserStore } from '../store/userStore';
import { DUMMY_GAMES_MAP, type GameId } from '../data/dummy';

function isValidGameId(val: unknown): val is GameId {
  return val === 'carrom' || val === 'chess' || val === 'snakes' || val === 'ludo';
}

function formatElapsed(secs: number): string {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function MatchmakingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ game?: string; players?: string }>();

  const gameId: GameId = isValidGameId(params.game) ? params.game : 'carrom';
  const game = DUMMY_GAMES_MAP[gameId];
  const playersCount = params.players === '4' ? 4 : 2;

  const { name, photoUri } = useUserStore();
  const initials = (name || 'Player').slice(0, 2).toUpperCase();
  const photoSource = photoUri ? { uri: photoUri } : undefined;

  const [elapsed, setElapsed] = useState(0);

  // Pulse animations for the concentric rings
  const outerPulse = useSharedValue(1);
  const innerPulse = useSharedValue(1);

  // Sequential dots animation
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    outerPulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    innerPulse.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    const makeDotAnim = (delayMs: number) =>
      withDelay(
        delayMs,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 }),
          ),
          -1,
          true,
        ),
      );

    dot1.value = makeDotAnim(0);
    dot2.value = makeDotAnim(200);
    dot3.value = makeDotAnim(400);
  }, [outerPulse, innerPulse, dot1, dot2, dot3]);

  // Live elapsed timer + auto match after 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    const matchTimeout = setTimeout(() => {
      router.replace(`/game/${gameId}`);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(matchTimeout);
    };
  }, [gameId, router]);

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outerPulse.value }],
  }));
  const innerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerPulse.value }],
  }));

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

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
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.ink} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Finding your table</Text>
            <Text style={s.headerSub}>
              {game.title} · Online · {playersCount} players
            </Text>
          </View>
          <View style={s.iconBtn}>
            <Ionicons name="globe-outline" size={20} color={colors.violet} />
          </View>
        </View>

        {/* ── MATCHMAKING chip ── */}
        <View style={s.chipWrap}>
          <View style={s.matchChip}>
            <View style={s.matchDot} />
            <Text style={s.matchChipText}>MATCHMAKING</Text>
          </View>
        </View>

        {/* ── Concentric pulsing rings + VS stage ── */}
        <View style={s.stageWrap}>
          <Animated.View style={[s.outerRing, outerRingStyle]} />
          <Animated.View style={[s.innerRing, innerRingStyle]} />

          <View style={s.vsRow}>
            {/* Left: Player avatar */}
            <View style={s.playerSlot}>
              <View style={s.avatarBorder}>
                <Avatar
                  source={photoSource}
                  initials={initials}
                  size="lg"
                  online
                />
              </View>
              <Text style={s.slotLabel}>You</Text>
            </View>

            {/* Center: Saffron VS badge */}
            <View style={s.vsCircle}>
              <Text style={s.vsText}>VS</Text>
            </View>

            {/* Right: Searching opponent circle */}
            <View style={s.playerSlot}>
              <View style={s.searchCircle}>
                <Ionicons
                  name="person-add-outline"
                  size={28}
                  color={colors.violet}
                />
              </View>
              <Text style={s.slotLabel}>Searching…</Text>
            </View>
          </View>
        </View>

        {/* ── Title + Body ── */}
        <Text style={s.title}>A good match takes{'\n'}a moment.</Text>
        <Text style={s.body}>
          Looking for a player with a similar skill level. Your table will be
          ready soon.
        </Text>

        {/* ── 3 animated dots + elapsed timer ── */}
        <View style={s.timerSection}>
          <View style={s.dotsRow}>
            <Animated.View style={[s.seqDot, dot1Style]} />
            <Animated.View style={[s.seqDot, dot2Style]} />
            <Animated.View style={[s.seqDot, dot3Style]} />
          </View>
          <Text style={s.elapsedText}>
            {formatElapsed(elapsed)} elapsed · Usually under 30 seconds
          </Text>
        </View>

        {/* ── Wisdom tip card ── */}
        <View style={s.tipCard}>
          <View style={s.tipIconWrap}>
            <Ionicons name="bulb-outline" size={22} color={colors.saffron} />
          </View>
          <View style={s.tipTextWrap}>
            <Text style={s.tipTitle}>A little {game.title} wisdom</Text>
            <Text style={s.tipBody}>{game.wisdomTip}</Text>
          </View>
        </View>

        {/* ── Cancel search button ── */}
        <Button
          label="Cancel search"
          variant="outline"
          onPress={() => router.back()}
          style={s.cancelBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.pageMargin,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
  },

  // Header
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  headerSub: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },

  // Chip
  chipWrap: { marginTop: spacing.xs },
  matchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.lavender,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  matchDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.violet,
  },
  matchChipText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
    letterSpacing: 1.5,
  },

  // Concentric rings + VS
  stageWrap: {
    width: 260,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.lavender,
    opacity: 0.45,
  },
  innerRing: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: colors.lavender,
    opacity: 0.85,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    zIndex: 2,
  },
  playerSlot: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
  },
  vsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.paper,
    marginBottom: spacing.md,
  },
  vsText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.paper,
  },
  searchCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.violet,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.ink,
  },

  // Title & body
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 34,
  },
  body: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: -spacing.sm,
  },

  // Dots + timer
  timerSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  seqDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.violet,
  },
  elapsedText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },

  // Wisdom tip card
  tipCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.saffronSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextWrap: { flex: 1, gap: 4 },
  tipTitle: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  tipBody: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Cancel button
  cancelBtn: {
    width: '100%',
    marginTop: spacing.xs,
  },
});

