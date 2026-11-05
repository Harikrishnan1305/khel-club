import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius, sizes } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { useUserStore } from '../../store/userStore';
import { DUMMY_CLUB_FRIENDS, DUMMY_PLAYED_WITH } from '../../data/dummy';

export default function FriendsScreen() {
  const router = useRouter();
  const clubId = useUserStore((s) => s.clubId) ?? 'KC2048';

  const [query, setQuery] = useState('');
  const [inviteVisible, setInviteVisible] = useState(true);

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return DUMMY_CLUB_FRIENDS;
    const q = trimmed.toLowerCase();
    return DUMMY_CLUB_FRIENDS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.initials.toLowerCase().includes(q),
    );
  }, [trimmed]);

  const onlineCount = DUMMY_CLUB_FRIENDS.filter((f) => f.online).length;
  const showEmpty = trimmed.length > 0 && filtered.length === 0;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  const shareInvite = async () => {
    try {
      await Share.share({
        message: `Join me on Khel Club! Add my Club ID ${clubId} and let's play.`,
      });
    } catch {
      // share dismissed
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color={colors.ink} />
            </TouchableOpacity>
            <View style={s.headerText}>
              <Text style={s.headerTitle}>Better together</Text>
              <Text style={s.headerSub}>Your club, one invite away</Text>
            </View>
            <TouchableOpacity onPress={shareInvite} hitSlop={10} style={s.headerIcon}>
              <Ionicons name="person-add-outline" size={22} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {/* ── Search ── */}
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={s.searchInput}
              placeholder="Search name or Club ID"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {showEmpty ? (
            /* ── Empty search state ── */
            <View style={s.emptyWrap}>
              <View style={s.emptyTile}>
                <Ionicons name="search" size={30} color={colors.violet} />
              </View>
              <Text style={s.emptyTitle}>No clubmate found</Text>
              <Text style={s.emptyBody}>
                {`We couldn't find "${trimmed}". Check the spelling or ask your friend for their Club ID.`}
              </Text>
              <Button
                label="Clear search"
                variant="soft"
                onPress={() => setQuery('')}
                style={s.emptyBtn}
              />
              <TouchableOpacity onPress={shareInvite} hitSlop={8}>
                <Text style={s.link}>Or invite a friend to Khel Club →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* ── Action buttons ── */}
              <View style={s.actionRow}>
                <TouchableOpacity
                  style={[s.actionBtn, s.actionBtnSoft]}
                  onPress={shareInvite}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-add-outline" size={18} color={colors.violet} />
                  <Text style={s.actionText}>Add friends</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, s.actionBtnOutline]}
                  onPress={shareInvite}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-social-outline" size={18} color={colors.violet} />
                  <Text style={s.actionText}>Share my ID</Text>
                </TouchableOpacity>
              </View>

              {/* ── Game invitation card ── */}
              {inviteVisible && trimmed.length === 0 && (
                <View style={s.inviteCard}>
                  <View style={s.inviteTop}>
                    <Text style={s.inviteLabel}>GAME INVITATION</Text>
                    <Text style={s.inviteTime}>2 min ago</Text>
                  </View>
                  <View style={s.inviteRow}>
                    <Avatar initials="ME" online size="lg" />
                    <View style={s.inviteInfo}>
                      <Text style={s.inviteTitle}>Meera saved you a seat</Text>
                      <Text style={s.inviteSub}>Chess · 10 min · Casual friends game</Text>
                    </View>
                  </View>
                  <View style={s.inviteBtns}>
                    <Button
                      label="Accept invite"
                      variant="primary"
                      onPress={() => router.push('/game/chess')}
                      style={s.inviteBtn}
                    />
                    <TouchableOpacity
                      style={[s.inviteBtn, s.notNowBtn]}
                      onPress={() => setInviteVisible(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.notNowText}>Not now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── Your friends ── */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Your friends · {DUMMY_CLUB_FRIENDS.length}</Text>
                <Text style={s.sectionLink}>{onlineCount} online</Text>
              </View>

              <View style={s.list}>
                {filtered.map((f) => (
                  <View key={f.id} style={s.friendRow}>
                    <Avatar initials={f.initials} online={f.online} size="lg" />
                    <View style={s.friendInfo}>
                      <Text style={s.friendName}>{f.name}</Text>
                      <Text
                        style={[s.friendStatus, f.online && s.friendStatusOnline]}
                        numberOfLines={1}
                      >
                        {f.status}
                      </Text>
                    </View>
                    {f.online ? (
                      <TouchableOpacity style={[s.rowBtn, s.rowBtnInvite]} activeOpacity={0.8}>
                        <Text style={s.rowBtnInviteText}>Invite</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={[s.rowBtn, s.rowBtnProfile]} activeOpacity={0.8}>
                        <Text style={s.rowBtnProfileText}>Profile</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* ── Recently played with ── */}
              {trimmed.length === 0 && (
                <>
                  <View style={s.sectionHeader}>
                    <Text style={s.sectionTitle}>Recently played with</Text>
                    <TouchableOpacity hitSlop={8}>
                      <Text style={s.sectionLink}>See all</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.list}>
                    {DUMMY_PLAYED_WITH.map((p) => (
                      <View key={p.id} style={s.playedRow}>
                        <Avatar initials={p.initials} size="md" />
                        <View style={s.friendInfo}>
                          <Text style={s.friendName}>{p.name}</Text>
                          <Text style={s.friendStatus}>{p.detail}</Text>
                        </View>
                        <TouchableOpacity hitSlop={8}>
                          <Ionicons name="person-add-outline" size={22} color={colors.violet} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <Text style={s.footer}>Your Club ID · {clubId}</Text>
            </>
          )}

          <View style={{ height: sizes.tabBarHeight + spacing.lg }} />
        </ScrollView>
      </KeyboardAvoidingView>
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

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.ink,
  },

  // Actions
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: sizes.minTouch,
    borderRadius: radius.button,
  },
  actionBtnSoft: { backgroundColor: colors.lavender },
  actionBtnOutline: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border },
  actionText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Invitation card
  inviteCard: {
    backgroundColor: colors.lavender,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  inviteTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inviteLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
    letterSpacing: 1,
  },
  inviteTime: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  inviteInfo: { flex: 1, gap: 2 },
  inviteTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  inviteSub: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textSecondary },
  inviteBtns: { flexDirection: 'row', gap: spacing.sm },
  inviteBtn: { flex: 1, height: sizes.minTouch + 4, borderRadius: radius.button },
  notNowBtn: {
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notNowText: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  sectionLink: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Friend rows
  list: { gap: spacing.md },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  friendInfo: { flex: 1, gap: 2 },
  friendName: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  friendStatus: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
  friendStatusOnline: { color: colors.success },
  rowBtn: {
    minWidth: 70,
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBtnInvite: { backgroundColor: colors.lavender },
  rowBtnInviteText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },
  rowBtnProfile: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.border },
  rowBtnProfileText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Recently played with
  playedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.md,
  },

  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },

  // Empty state
  emptyWrap: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emptyTile: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  emptyBtn: { alignSelf: 'stretch', backgroundColor: colors.lavender },
  link: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },
});
