import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius, sizes } from '../../theme/theme';
import { useUserStore } from '../../store/userStore';
import { Avatar } from '../../components/Avatar';
import { Chip } from '../../components/Chip';
import {
  DUMMY_GAMES,
  DUMMY_FRIENDS,
  DUMMY_RECENT,
  DUMMY_POPULAR,
  type GameId,
} from '../../data/dummy';

// Asset map — 1×1 placeholder PNGs live at these paths so Metro always resolves.
// Replace with real Figma exports when available.
const GAME_IMAGES: Record<string, ImageSourcePropType> = {
  card_carrom: require('../../../assets/images/card_carrom.png'),
  card_chess:  require('../../../assets/images/card_chess.png'),
  card_snakes: require('../../../assets/images/card_snakes.png'),
  card_ludo:   require('../../../assets/images/card_ludo.png'),
};

const BANNER_IMAGE: ImageSourcePropType = require('../../../assets/images/banner_carrom.png');

// ─── Greeting helper ─────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

// ─── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ title, linkLabel, onLink }: { title: string; linkLabel: string; onLink?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onLink} hitSlop={8}>
        <Text style={s.sectionLink}>{linkLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Game card (2×2 grid cell) ───────────────────────────────────────────────
function HomeGameCard({ id, title, tagline, playingCount, imageKey, onPlay }: {
  id: GameId; title: string; tagline: string;
  playingCount: string; imageKey: string; onPlay: () => void;
}) {
  const src: ImageSourcePropType = GAME_IMAGES[imageKey];
  return (
    <TouchableOpacity style={s.gameCard} onPress={onPlay} activeOpacity={0.85}>
      {src ? (
        <Image source={src} style={s.gameCardImage} resizeMode="cover" />
      ) : (
        <View style={[s.gameCardImage, s.gameCardPlaceholder]}>
          <Ionicons name="game-controller-outline" size={28} color={colors.violetLight} />
        </View>
      )}
      <View style={s.gameCardBody}>
        <Text style={s.gameCardTitle} numberOfLines={1}>{title}</Text>
        <Text style={s.gameCardTagline} numberOfLines={2}>{tagline}</Text>
        <View style={s.playingRow}>
          <View style={s.greenDot} />
          <Text style={s.playingText}>{playingCount} playing</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Home screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { name, coins, points, photoUri, avatarId } = useUserStore();

  const greeting = useMemo(() => getGreeting(), []);
  const displayPoints = points > 0 ? points : 2480;
  const displayName = name || 'Player';

  const initials = displayName.slice(0, 2).toUpperCase();
  const photoSource = photoUri ? { uri: photoUri } : undefined;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Avatar
              source={photoSource}
              initials={initials}
              online
              size="md"
            />
            <View>
              <Text style={s.greetingSmall}>{greeting}</Text>
              <Text style={s.greetingName}>{displayName} 👋</Text>
            </View>
          </View>
          <TouchableOpacity style={s.bellBtn}>
            <Ionicons name="notifications-outline" size={20} color={colors.ink} />
            <View style={s.bellDot} />
          </TouchableOpacity>
        </View>

        {/* ── Stat pills ── */}
        <View style={s.statRow}>
          <View style={[s.statPill, { backgroundColor: colors.saffronSoft }]}>
            <Ionicons name="logo-bitcoin" size={15} color={colors.saffron} />
            <Text style={s.statText}>{coins} coins</Text>
          </View>
          <View style={[s.statPill, { backgroundColor: colors.lavender }]}>
            <Ionicons name="sparkles-outline" size={15} color={colors.violet} />
            <Text style={[s.statText, { color: colors.violet }]}>{displayPoints} pts</Text>
          </View>
        </View>

        {/* ── Search bar ── */}
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search games or friends"
            placeholderTextColor={colors.textMuted}
            editable={false}
          />
        </View>

        {/* ── Hero banner ── */}
        {/* overflow:hidden on the banner clips the rotated image at the rounded corners */}
        <View style={s.heroBanner}>
          {/* Left: text capped at 55% so it never overlaps the image */}
          <View style={s.heroContent}>
            <Text style={s.heroLabel}>THE EVENING CLUB</Text>
            <Text style={s.heroTitle}>Old favourites.{'\n'}New memories.</Text>
            <Text style={s.heroBody}>Make room for your favourite people.</Text>
            <TouchableOpacity>
              <Text style={s.heroCta}>Start a room →</Text>
            </TouchableOpacity>
          </View>

          {/* Right: image absolutely positioned, rotated 8°, taller than banner → clips naturally */}
          <View style={s.heroImageWrap} pointerEvents="none">
            <Image
              source={BANNER_IMAGE}
              style={s.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* ── Pick your play (2×2 grid) ── */}
        <SectionHeader
          title="Pick your play"
          linkLabel="All games"
          onLink={() => router.push('/(tabs)/games')}
        />
        <View style={s.gamesGrid}>
          {DUMMY_GAMES.map((g) => (
            <HomeGameCard
              key={g.id}
              {...g}
              onPlay={() => router.push({ pathname: '/games', params: { game: g.id } })}
            />
          ))}
        </View>

        {/* ── Recently Played ── */}
        <SectionHeader
          title="Recently Played"
          linkLabel="History"
          onLink={() => {}}
        />
        {DUMMY_RECENT.map((item) => (
          <View key={item.id} style={s.recentCard}>
            {/* Thumbnail placeholder */}
            <View style={s.recentThumb}>
              <Ionicons name="game-controller-outline" size={22} color={colors.violet} />
            </View>
            <View style={s.recentInfo}>
              <Text style={s.recentTitle}>{item.title}</Text>
              <Text style={s.recentSub}>{item.subtitle}</Text>
              <TouchableOpacity hitSlop={8}>
                <Text style={s.recentPlay}>Play again →</Text>
              </TouchableOpacity>
            </View>
            <View style={[s.resultChip, { backgroundColor: colors.successSoft }]}>
              <Text style={[s.resultText, { color: colors.success }]}>{item.result}</Text>
            </View>
          </View>
        ))}

        {/* ── Popular Games ── */}
        <SectionHeader
          title="Popular Games"
          linkLabel="Explore"
          onLink={() => router.push('/(tabs)/games')}
        />
        <View style={s.popularList}>
          {DUMMY_POPULAR.map((item) => (
            <TouchableOpacity key={item.id} style={s.popularRow} activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/games', params: { game: item.id } })}>
              <View style={s.popularThumb}>
                <Ionicons name="game-controller-outline" size={20} color={colors.violet} />
              </View>
              <View style={s.popularInfo}>
                <Text style={s.popularTitle}>{item.title}</Text>
                <Text style={s.popularTagline}>{item.tagline}</Text>
              </View>
              <View style={s.onlineChip}>
                <View style={s.greenDot} />
                <Text style={s.onlineText}>{item.onlineCount} online</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Friends Online ── */}
        <SectionHeader
          title="Friends Online"
          linkLabel="See all"
          onLink={() => router.push('/(tabs)/friends')}
        />
        <View style={s.friendsRow}>
          {DUMMY_FRIENDS.map((f) => (
            <View key={f.id} style={s.friendCell}>
              <Avatar initials={f.initials} online={f.online} size="md" />
              <Text style={s.friendName} numberOfLines={1}>{f.name}</Text>
              <TouchableOpacity hitSlop={8}>
                <Text style={s.friendInvite}>Invite +</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bottom padding so tab bar doesn't cover content */}
        <View style={{ height: sizes.tabBarHeight + spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const GRID_GAP = spacing.sm;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.pageMargin, paddingTop: spacing.lg, gap: spacing.lg },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  greetingSmall: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  greetingName: { fontSize: fontSize.lg, fontFamily: 'NunitoSans_800ExtraBold', fontWeight: fontWeight.extrabold, color: colors.ink },
  bellBtn: {
    width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.paper,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
    position: 'relative',
  },
  bellDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.saffron, borderWidth: 1.5, borderColor: colors.paper },

  // Stat pills
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.pill },
  statText: { fontSize: fontSize.sm, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.ink },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.paper, borderRadius: radius.lg, paddingHorizontal: spacing.md,
    height: 46, borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: fontSize.md, fontFamily: 'NunitoSans_400Regular', color: colors.ink },

  // Hero banner
  heroBanner: {
    backgroundColor: colors.deepViolet,
    borderRadius: radius.hero,
    overflow: 'hidden',       // clips rotated image at rounded corners
    height: 172,
    flexDirection: 'row',
    position: 'relative',
  },
  // Text sits on the left, max 55% width — image won't overlap
  heroContent: {
    width: '55%',
    paddingVertical: spacing.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    gap: spacing.xs,
    justifyContent: 'center',
    zIndex: 1,
  },
  heroLabel: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.saffron, letterSpacing: 1.8 },
  heroTitle: { fontSize: fontSize.xl, fontFamily: 'NunitoSans_800ExtraBold', fontWeight: fontWeight.extrabold, color: colors.paper, lineHeight: 28 },
  heroBody: { fontSize: fontSize.sm, fontFamily: 'NunitoSans_400Regular', color: colors.lavender, lineHeight: 20 },
  heroCta: { fontSize: fontSize.sm, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.paper, marginTop: spacing.xs },
  // Image wrapper — absolute, pushed to the right, slightly overflows top/bottom for the rotate clip effect
  heroImageWrap: {
    position: 'absolute',
    right: -12,               // let the right edge bleed slightly for natural clipping
    top: -16,
    bottom: -16,
    width: '52%',             // wider than needed so rotation doesn't leave gaps
    transform: [{ rotate: '8deg' }],
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePlaceholder: { backgroundColor: colors.violetDark, alignItems: 'center', justifyContent: 'center' },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: 'NunitoSans_800ExtraBold', fontWeight: fontWeight.extrabold, color: colors.ink },
  sectionLink: { fontSize: fontSize.sm, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.violet },

  // 2×2 grid
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  gameCard: {
    width: '48.5%',
    backgroundColor: colors.paper, borderRadius: radius.card,
    overflow: 'hidden',
    shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  gameCardImage: { width: '100%', height: 100 },
  gameCardPlaceholder: { backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  gameCardBody: { padding: spacing.sm, gap: 3 },
  gameCardTitle: { fontSize: fontSize.md, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.ink },
  gameCardTagline: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted, lineHeight: 16 },
  playingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  playingText: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },

  // Recently played
  recentCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.paper, borderRadius: radius.card, padding: spacing.md,
    shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  recentThumb: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1, gap: 2 },
  recentTitle: { fontSize: fontSize.md, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.ink },
  recentSub: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  recentPlay: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.violet, marginTop: 2 },
  resultChip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  resultText: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, letterSpacing: 0.5 },

  // Popular games
  popularList: { gap: spacing.sm },
  popularRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.paper, borderRadius: radius.card, padding: spacing.md,
    shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  popularThumb: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  popularInfo: { flex: 1 },
  popularTitle: { fontSize: fontSize.md, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.ink },
  popularTagline: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  onlineChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successSoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  onlineText: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_600SemiBold', color: colors.success },

  // Friends
  friendsRow: { flexDirection: 'row', gap: spacing.lg },
  friendCell: { alignItems: 'center', gap: spacing.xs },
  friendName: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_600SemiBold', color: colors.ink },
  friendInvite: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_700Bold', fontWeight: fontWeight.bold, color: colors.violet },
});
