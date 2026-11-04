import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius, sizes } from '../../theme/theme';
import { useUserStore } from '../../store/userStore';
import {
  DUMMY_PROFILE_STATS,
  DUMMY_GAME_HISTORY,
  DUMMY_LATEST_MATCHES,
  USER_RANK,
  USER_POINTS_FALLBACK,
} from '../../data/dummy';

const GAME_IMAGES: Record<string, ImageSourcePropType> = {
  card_carrom: require('../../../assets/images/card_carrom.png'),
  card_chess: require('../../../assets/images/card_chess.png'),
  card_snakes: require('../../../assets/images/card_snakes.png'),
  card_ludo: require('../../../assets/images/card_ludo.png'),
};

type AvatarIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
const AVATAR_ICONS: Record<string, AvatarIcon> = {
  cat: 'cat',
  bird: 'bird',
  rabbit: 'rabbit',
  turtle: 'turtle',
  fish: 'fish',
};

function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { name, username, photoUri, avatarId, coins, points, clubId } = useUserStore();

  const displayName = name || 'Aanya Sharma';
  const handle = `@${username || 'aanya_plays'}`;
  const displayClubId = clubId ?? 'KC2048';
  const displayPoints = points > 0 ? points : USER_POINTS_FALLBACK;
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarIcon = avatarId ? AVATAR_ICONS[avatarId] : undefined;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

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
          <Text style={s.headerTitle}>Your club profile</Text>
          <TouchableOpacity
            style={s.headerIcon}
            onPress={() => router.push('/settings')}
            hitSlop={10}
          >
            <Ionicons name="options-outline" size={22} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* ── Identity ── */}
        <View style={s.identity}>
          <View style={s.photo}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.photoImg} />
            ) : avatarIcon ? (
              <MaterialCommunityIcons name={avatarIcon} size={56} color={colors.violet} />
            ) : (
              <Text style={s.photoInitials}>{initials}</Text>
            )}
          </View>
          <Text style={s.name}>{displayName}</Text>
          <Text style={s.handle}>
            {handle} · Club ID {displayClubId}
          </Text>
          <View style={s.regularChip}>
            <Text style={s.regularChipText}>Club regular · Joined October 2026</Text>
          </View>
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => router.push('/profile-setup')}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={16} color={colors.violet} />
            <Text style={s.editText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats card ── */}
        <View style={s.statsCard}>
          <View style={s.statCol}>
            <Text style={s.statNum}>{DUMMY_PROFILE_STATS.played}</Text>
            <Text style={s.statLabel}>Played</Text>
          </View>
          <View style={s.statCol}>
            <Text style={s.statNum}>{DUMMY_PROFILE_STATS.wins}</Text>
            <Text style={s.statLabel}>Wins</Text>
          </View>
          <View style={s.statCol}>
            <Text style={s.statNum}>{DUMMY_PROFILE_STATS.winRate}%</Text>
            <Text style={s.statLabel}>Win rate</Text>
          </View>
        </View>

        {/* ── Coins + points ── */}
        <View style={s.miniRow}>
          <View style={[s.miniCard, { backgroundColor: colors.saffronSoft }]}>
            <MaterialCommunityIcons
              name="circle-multiple-outline"
              size={26}
              color={colors.saffron}
            />
            <View>
              <Text style={s.miniNum}>{fmt(coins)}</Text>
              <Text style={s.miniLabel}>Club coins</Text>
            </View>
          </View>
          <View style={[s.miniCard, { backgroundColor: colors.lavender }]}>
            <Ionicons name="trophy-outline" size={24} color={colors.violet} />
            <View>
              <Text style={s.miniNum}>{fmt(displayPoints)}</Text>
              <Text style={s.miniLabel}>#{USER_RANK} · All India</Text>
            </View>
          </View>
        </View>

        {/* ── Game history ── */}
        <Text style={s.sectionTitle}>Your game history</Text>
        <View style={s.historyLabels}>
          <Text style={s.tinyLabel}>ALL TIME</Text>
          <Text style={s.tinyLabel}>PLAYED / WINS</Text>
        </View>
        <View style={s.list}>
          {DUMMY_GAME_HISTORY.map((g) => (
            <View key={g.id} style={s.historyCard}>
              <Image
                source={GAME_IMAGES[g.imageKey]}
                style={s.thumb}
                resizeMode="cover"
              />
              <View style={s.historyInfo}>
                <Text style={s.historyTitle}>{g.title}</Text>
                <View style={s.track}>
                  <View style={[s.fill, { width: `${g.winRate}%` }]} />
                </View>
                <Text style={s.historySub}>{g.winRate}% win rate</Text>
              </View>
              <Text style={s.historyScore}>
                {g.played} / {g.wins}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Latest matches ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Latest matches</Text>
          <TouchableOpacity hitSlop={8}>
            <Text style={s.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={s.matches}>
          {DUMMY_LATEST_MATCHES.map((m) => {
            const won = m.result === 'Won';
            return (
              <View key={m.id} style={s.matchRow}>
                <View style={s.matchInfo}>
                  <Text style={s.matchTitle}>{m.title}</Text>
                  <Text style={s.matchDetail}>{m.detail}</Text>
                </View>
                <View
                  style={[
                    s.resultChip,
                    { backgroundColor: won ? colors.successSoft : colors.errorSoft },
                  ]}
                >
                  <Text
                    style={[s.resultText, { color: won ? colors.success : colors.error }]}
                  >
                    {m.result}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: sizes.tabBarHeight + spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PHOTO = 110;

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
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Identity
  identity: { alignItems: 'center', gap: spacing.sm },
  photo: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: PHOTO / 2,
    backgroundColor: colors.lavender,
    borderWidth: 3,
    borderColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImg: { width: PHOTO, height: PHOTO },
  photoInitials: {
    fontSize: fontSize.display,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.violet,
  },
  name: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  handle: { fontSize: fontSize.sm, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  regularChip: {
    backgroundColor: colors.lavender,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  regularChipText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: sizes.minTouch,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  editText: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.violet,
    borderRadius: radius.hero,
    paddingVertical: spacing.lg,
  },
  statCol: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.paper,
  },
  statLabel: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.lavender },

  // Mini cards
  miniRow: { flexDirection: 'row', gap: spacing.md },
  miniCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  miniNum: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  miniLabel: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textSecondary },

  // Section
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLink: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },
  historyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.sm,
  },
  tinyLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },

  // History
  list: { gap: spacing.sm },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.lavender,
  },
  historyInfo: { flex: 1, gap: 5 },
  historyTitle: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  track: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.lavender,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.violet },
  historySub: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  historyScore: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },

  // Matches
  matches: { gap: spacing.lg },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  matchInfo: { flex: 1, gap: 2 },
  matchTitle: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  matchDetail: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  resultChip: {
    minWidth: 52,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  resultText: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold },
});
