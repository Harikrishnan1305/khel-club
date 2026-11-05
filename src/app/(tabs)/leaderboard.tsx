import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius, sizes } from '../../theme/theme';
import { Avatar } from '../../components/Avatar';
import { useUserStore } from '../../store/userStore';
import {
  DUMMY_PODIUM,
  DUMMY_LEADERBOARD_ROWS,
  DUMMY_FRIENDS_LEADERBOARD,
  USER_RANK,
  USER_POINTS_FALLBACK,
  type DummyLeaderEntry,
} from '../../data/dummy';

type Segment = 'india' | 'friends';
type Period = 'all' | 'week';

const GAME_FILTERS = ['All games', 'Carrom', 'Chess', 'Snakes', 'Ludo'] as const;

function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { name, username, photoUri, points } = useUserStore();

  const [segment, setSegment] = useState<Segment>('india');
  const [period, setPeriod] = useState<Period>('all');
  const [gameIdx, setGameIdx] = useState(0);

  const myName = name || 'Aanya';
  const myHandle = `@${username || 'aanya_plays'}`;
  const myPoints = points > 0 ? points : USER_POINTS_FALLBACK;
  const myInitials = myName.slice(0, 2).toUpperCase();
  const myPhoto = photoUri ? { uri: photoUri } : undefined;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  const first = DUMMY_PODIUM[0];
  const second = DUMMY_PODIUM[1];
  const third = DUMMY_PODIUM[2];

  const friendsRankForMe = DUMMY_FRIENDS_LEADERBOARD.length + 1;

  const renderRow = (e: DummyLeaderEntry) => (
    <View key={e.id} style={s.row}>
      <Text style={s.rank}>{e.rank}</Text>
      <Avatar initials={e.initials} size="md" />
      <View style={s.rowInfo}>
        <Text style={s.rowName}>{e.name}</Text>
        <Text style={s.rowSub}>Club player</Text>
      </View>
      <View style={s.pointsCol}>
        <Text style={s.points}>{fmt(e.points)}</Text>
        <Text style={s.pointsLabel}>club pts</Text>
      </View>
    </View>
  );

  const myRow = (rank: number) => (
    <View style={[s.row, s.myRow]}>
      <Text style={[s.rank, s.myRank]}>{rank}</Text>
      <Avatar source={myPhoto} initials={myInitials} size="md" />
      <View style={s.rowInfo}>
        <Text style={s.rowName}>{myName} · You</Text>
        <Text style={s.rowSub}>{myHandle}</Text>
      </View>
      <View style={s.pointsCol}>
        <Text style={s.points}>{fmt(myPoints)}</Text>
        <Text style={s.pointsLabel}>club pts</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={colors.ink} />
          </TouchableOpacity>
          <View style={s.headerText}>
            <Text style={s.headerTitle}>Club leaderboard</Text>
            <Text style={s.headerSub}>Good games deserve a little glory</Text>
          </View>
          <TouchableOpacity hitSlop={10} style={s.headerIcon}>
            <Ionicons name="information-circle-outline" size={24} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* ── Segmented control ── */}
        <View style={s.segTrack}>
          {(['india', 'friends'] as const).map((seg) => {
            const active = segment === seg;
            return (
              <TouchableOpacity
                key={seg}
                style={[s.segItem, active && s.segItemActive]}
                onPress={() => setSegment(seg)}
                activeOpacity={0.85}
              >
                <Text style={[s.segText, active && s.segTextActive]}>
                  {seg === 'india' ? 'All India' : 'Friends'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Filter chips ── */}
        <View style={s.chipsRow}>
          <TouchableOpacity
            style={[s.chip, s.chipLavender, period === 'all' && s.chipSelected]}
            onPress={() => setPeriod('all')}
            activeOpacity={0.8}
          >
            <Text style={[s.chipText, s.chipTextViolet]}>
              All time{period === 'all' ? ' ✓' : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.chip, s.chipSaffron, period === 'week' && s.chipSelected]}
            onPress={() => setPeriod('week')}
            activeOpacity={0.8}
          >
            <Text style={[s.chipText, s.chipTextInk]}>
              This week{period === 'week' ? ' ✓' : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setGameIdx((i) => (i + 1) % GAME_FILTERS.length)}
            hitSlop={8}
          >
            <Text style={s.gamesLink}>{GAME_FILTERS[gameIdx]} ⌄</Text>
          </TouchableOpacity>
        </View>

        {segment === 'india' ? (
          <>
            {/* ── Podium ── */}
            <View style={s.podiumCard}>
              <Ionicons name="trophy-outline" size={24} color={colors.saffron} />
              <Text style={s.podiumLabel}>THE CLUB'S FINEST</Text>

              <View style={s.podiumRow}>
                {/* 2nd */}
                <View style={s.podiumCol}>
                  <Avatar initials={second.initials} size="lg" />
                  <Text style={s.podName}>{second.name}</Text>
                  <Text style={s.podPts}>{fmt(second.points)} pts</Text>
                  <View style={[s.block, s.block2]}>
                    <Text style={s.blockNumLight}>2</Text>
                  </View>
                </View>
                {/* 1st */}
                <View style={s.podiumCol}>
                  <Avatar initials={first.initials} size="lg" />
                  <Text style={s.podName}>{first.name}</Text>
                  <Text style={s.podPts}>{fmt(first.points)} pts</Text>
                  <View style={[s.block, s.block1]}>
                    <Text style={s.blockNum1}>1</Text>
                  </View>
                </View>
                {/* 3rd */}
                <View style={s.podiumCol}>
                  <Avatar initials={third.initials} size="lg" />
                  <Text style={s.podName}>{third.name}</Text>
                  <Text style={s.podPts}>{fmt(third.points)} pts</Text>
                  <View style={[s.block, s.block3]}>
                    <Text style={s.blockNumLight}>3</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Your rank card ── */}
            <View style={s.rankCard}>
              <Ionicons name="trending-up" size={22} color={colors.violet} />
              <View style={s.rankText}>
                <Text style={s.rankTitle}>You're #{USER_RANK} in the club</Text>
                <Text style={s.rankSub}>
                  {fmt(myPoints)} club points · Keep the good games going.
                </Text>
              </View>
            </View>

            {/* ── Rows 4-6 ── */}
            <View style={s.list}>{DUMMY_LEADERBOARD_ROWS.map(renderRow)}</View>

            <Text style={s.dots}>···</Text>
            {myRow(USER_RANK)}
          </>
        ) : (
          <>
            <View style={s.rankCard}>
              <Ionicons name="people-outline" size={22} color={colors.violet} />
              <View style={s.rankText}>
                <Text style={s.rankTitle}>You're #{friendsRankForMe} among friends</Text>
                <Text style={s.rankSub}>
                  {fmt(myPoints)} club points · Invite more friends to climb.
                </Text>
              </View>
            </View>
            <View style={s.list}>
              {DUMMY_FRIENDS_LEADERBOARD.map(renderRow)}
              {myRow(friendsRankForMe)}
            </View>
          </>
        )}

        <Text style={s.footer}>
          Earn club points by finishing games and playing fairly. Points have no cash value.
        </Text>

        <View style={{ height: sizes.tabBarHeight + spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.pageMargin,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  headerSub: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Segmented
  segTrack: {
    flexDirection: 'row',
    backgroundColor: colors.lavender,
    borderRadius: radius.lg,
    padding: 4,
  },
  segItem: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segItemActive: { backgroundColor: colors.paper },
  segText: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  segTextActive: { color: colors.violet },

  // Chips
  chipsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipLavender: { backgroundColor: colors.lavender },
  chipSaffron: { backgroundColor: colors.saffronSoft },
  chipSelected: { borderColor: colors.violet },
  chipText: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold },
  chipTextViolet: { color: colors.violet },
  chipTextInk: { color: colors.ink },
  gamesLink: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Podium
  podiumCard: {
    backgroundColor: colors.saffronSoft,
    borderRadius: radius.hero,
    paddingTop: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
    gap: spacing.xs,
  },
  podiumLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.saffron,
    letterSpacing: 1.2,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  podiumCol: { flex: 1, alignItems: 'center', gap: 2 },
  podName: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  podPts: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  block: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  block1: { height: 84, backgroundColor: colors.violet },
  block2: { height: 56, backgroundColor: colors.lavender },
  block3: { height: 42, backgroundColor: colors.lavender },
  blockNum1: {
    fontSize: fontSize.display,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.paper,
  },
  blockNumLight: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.violet,
  },

  // Rank card
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.lavender,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  rankText: { flex: 1, gap: 2 },
  rankTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  rankSub: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textSecondary },

  // Rows
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  myRow: {
    backgroundColor: colors.lavender,
    borderWidth: 1.5,
    borderColor: colors.violet,
  },
  rank: {
    width: 24,
    textAlign: 'center',
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  myRank: { color: colors.violet },
  rowInfo: { flex: 1, gap: 2 },
  rowName: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  rowSub: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  pointsCol: { alignItems: 'flex-end' },
  points: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  pointsLabel: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },

  dots: {
    textAlign: 'center',
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textMuted,
    marginVertical: -spacing.sm,
  },
  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
});
