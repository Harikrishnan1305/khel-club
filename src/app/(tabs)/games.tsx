import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  radius,
  sizes,
} from '../../theme/theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import {
  DUMMY_GAMES,
  DUMMY_GAMES_MAP,
  type GameId,
} from '../../data/dummy';

const GAME_IMAGES: Record<string, ImageSourcePropType> = {
  card_carrom: require('../../../assets/images/card_carrom.png'),
  card_chess: require('../../../assets/images/card_chess.png'),
  card_snakes: require('../../../assets/images/card_snakes.png'),
  card_ludo: require('../../../assets/images/card_ludo.png'),
};

function isValidGameId(val: unknown): val is GameId {
  return val === 'carrom' || val === 'chess' || val === 'snakes' || val === 'ludo';
}

export default function GamesLobbyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ game?: string }>();

  const [selectedGameId, setSelectedGameId] = useState<GameId>(
    isValidGameId(params.game) ? params.game : 'carrom',
  );
  const [playersCount, setPlayersCount] = useState<2 | 4>(2);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [rulesModalVisible, setRulesModalVisible] = useState(false);

  useEffect(() => {
    if (isValidGameId(params.game)) {
      setSelectedGameId(params.game);
    }
  }, [params.game]);

  const game = DUMMY_GAMES_MAP[selectedGameId];

  // Ensure selected playersCount is valid for the selected game (e.g. Chess is 2 players)
  useEffect(() => {
    if (!game.playerOptions.includes(playersCount)) {
      setPlayersCount(2);
    }
  }, [selectedGameId, game.playerOptions, playersCount]);

  const handleFindMatch = () => {
    router.push({
      pathname: '/matchmaking',
      params: { game: selectedGameId, players: String(playersCount) },
    });
  };

  const handleCreateRoom = () => {
    router.push({
      pathname: '/room/[code]',
      params: { code: 'KHEL42', game: selectedGameId, host: '1' },
    });
  };

  const handleJoinRoomSubmit = () => {
    const clean = joinCode.trim().toUpperCase();
    if (clean.length !== 6) return;
    setJoinModalVisible(false);
    setJoinCode('');
    router.push({
      pathname: '/room/[code]',
      params: { code: clean, game: selectedGameId, host: '0' },
    });
  };

  const heroSrc = GAME_IMAGES[game.imageKey];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
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
            <Text style={s.headerTitle}>Find your game</Text>
            <Text style={s.headerSub}>Four classics. Endless good times.</Text>
          </View>
          <TouchableOpacity style={s.iconBtn} hitSlop={8}>
            <Ionicons name="search-outline" size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* ── Game selector tabs ── */}
        <View style={s.tabsRow}>
          {DUMMY_GAMES.map((g) => {
            const active = g.id === selectedGameId;
            return (
              <TouchableOpacity
                key={g.id}
                style={[s.gameTab, active && s.gameTabActive]}
                onPress={() => setSelectedGameId(g.id)}
                activeOpacity={0.8}
              >
                <Text style={[s.gameTabText, active && s.gameTabTextActive]}>
                  {g.shortTabLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Hero image ── */}
        <View style={s.heroWrap}>
          {heroSrc ? (
            <Image source={heroSrc} style={s.heroImage} resizeMode="cover" />
          ) : (
            <View style={[s.heroImage, s.heroPlaceholder]}>
              <Ionicons
                name="game-controller-outline"
                size={48}
                color={colors.violet}
              />
            </View>
          )}
        </View>

        {/* ── Game title + online chip ── */}
        <View style={s.titleRow}>
          <Text style={s.gameTitle}>{game.title}</Text>
          <View style={s.onlineChip}>
            <View style={s.greenDot} />
            <Text style={s.onlineChipText}>{game.playingCount} online</Text>
          </View>
        </View>

        {/* ── Description & info chips ── */}
        <Text style={s.description}>{game.description}</Text>
        <View style={s.infoChipsRow}>
          {game.infoChips.map((chipLabel) => (
            <View key={chipLabel} style={s.infoChip}>
              <Text style={s.infoChipText}>{chipLabel}</Text>
            </View>
          ))}
        </View>

        {/* ── Play Online card ── */}
        <Card style={s.onlineCard}>
          <View style={s.cardTopRow}>
            <View style={s.iconTileLavender}>
              <Ionicons name="globe-outline" size={22} color={colors.violet} />
            </View>
            <View style={s.cardTitleWrap}>
              <Text style={s.cardTitle}>Play Online</Text>
              <Text style={s.cardSub}>
                Match with random players at your level.
              </Text>
            </View>
          </View>

          {/* Segmented buttons: 2 players / 4 players */}
          <View style={s.segmentedRow}>
            {([2, 4] as const).map((count) => {
              const selected = playersCount === count;
              const supported = game.playerOptions.includes(count);
              return (
                <TouchableOpacity
                  key={count}
                  style={[
                    s.segmentBtn,
                    selected && s.segmentBtnSelected,
                    !supported && s.segmentBtnDisabled,
                  ]}
                  onPress={() => supported && setPlayersCount(count)}
                  activeOpacity={supported ? 0.75 : 1}
                >
                  <Ionicons
                    name={count === 2 ? 'people-outline' : 'grid-outline'}
                    size={16}
                    color={
                      !supported
                        ? colors.textMuted
                        : selected
                        ? colors.violet
                        : colors.ink
                    }
                  />
                  <Text
                    style={[
                      s.segmentText,
                      selected && s.segmentTextSelected,
                      !supported && s.segmentTextDisabled,
                    ]}
                  >
                    {count} players
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            label="Find a match"
            variant="primary"
            onPress={handleFindMatch}
            leftIcon={
              <Ionicons name="flash-outline" size={18} color={colors.paper} />
            }
          />
        </Card>

        {/* ── Play With Friends card (Lavender) ── */}
        <View style={s.friendsCard}>
          <View style={s.friendsHeaderRow}>
            <View style={s.privateBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.violet} />
              <Text style={s.privateBadgeText}>Private Room</Text>
            </View>
          </View>
          <Text style={s.friendsTitle}>Play With Friends</Text>
          <Text style={s.friendsSub}>
            Your people. Your own private table.
          </Text>
          <View style={s.friendsBtnsRow}>
            <Button
              label="Create Room"
              variant="primary"
              onPress={handleCreateRoom}
              style={s.flexBtn}
            />
            <Button
              label="Join Room"
              variant="outline"
              onPress={() => setJoinModalVisible(true)}
              style={s.flexBtn}
            />
          </View>
        </View>

        {/* ── Game Rules row card ── */}
        <TouchableOpacity
          style={s.rulesCard}
          onPress={() => setRulesModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={s.iconTileLavender}>
            <Ionicons name="book-outline" size={20} color={colors.violet} />
          </View>
          <View style={s.rulesTextWrap}>
            <Text style={s.rulesTitle}>Game Rules</Text>
            <Text style={s.rulesSub} numberOfLines={1}>
              {game.oneLineRule}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {/* ── Footer ── */}
        <Text style={s.footer}>
          Free to play. Coins celebrate progress, never cash.
        </Text>

        <View style={{ height: sizes.tabBarHeight + spacing.lg }} />
      </ScrollView>

      {/* ── Join Room Modal ── */}
      <Modal
        visible={joinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <Pressable
          style={s.modalOverlay}
          onPress={() => setJoinModalVisible(false)}
        >
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Join Private Room</Text>
              <TouchableOpacity
                onPress={() => setJoinModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={s.modalSub}>
              Enter the 6-character room code shared by your friend.
            </Text>
            <TextInput
              style={s.codeInput}
              placeholder="e.g. KHEL42"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              maxLength={6}
              value={joinCode}
              onChangeText={(t) =>
                setJoinCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))
              }
            />
            <Button
              label="Join"
              variant="primary"
              disabled={joinCode.trim().length !== 6}
              onPress={handleJoinRoomSubmit}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Game Rules Modal ── */}
      <Modal
        visible={rulesModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRulesModalVisible(false)}
      >
        <Pressable
          style={s.modalOverlay}
          onPress={() => setRulesModalVisible(false)}
        >
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{game.title} Rules</Text>
              <TouchableOpacity
                onPress={() => setRulesModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={s.rulesList}>
              {game.rulesDetail.map((rule, idx) => (
                <View key={idx} style={s.ruleBulletRow}>
                  <View style={s.ruleDot} />
                  <Text style={s.ruleBulletText}>{rule}</Text>
                </View>
              ))}
            </View>
            <Button
              label="Got it"
              variant="soft"
              onPress={() => setRulesModalVisible(false)}
            />
          </Pressable>
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
    paddingTop: spacing.md,
    gap: spacing.lg,
  },

  // Header
  header: {
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

  // Selector tabs
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gameTab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameTabActive: {
    backgroundColor: colors.violet,
    borderColor: colors.violet,
  },
  gameTabText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  gameTabTextActive: {
    color: colors.paper,
  },

  // Hero
  heroWrap: {
    width: '100%',
    height: 190,
    borderRadius: radius.hero,
    overflow: 'hidden',
    backgroundColor: colors.lavender,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title + online
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  gameTitle: {
    fontSize: fontSize.display,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
    flex: 1,
  },
  onlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  onlineChipText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.success,
  },

  // Description & info chips
  description: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: -spacing.sm,
  },
  infoChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoChip: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  infoChipText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.ink,
  },

  // Play Online card
  onlineCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconTileLavender: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleWrap: { flex: 1, gap: 2 },
  cardTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  cardSub: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  segmentBtnSelected: {
    backgroundColor: colors.lavender,
    borderColor: colors.violet,
  },
  segmentBtnDisabled: {
    opacity: 0.45,
  },
  segmentText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  segmentTextSelected: {
    color: colors.violet,
  },
  segmentTextDisabled: {
    color: colors.textMuted,
  },

  // Play With Friends card
  friendsCard: {
    backgroundColor: colors.lavender,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  friendsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  privateBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },
  friendsTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  friendsSub: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  friendsBtnsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },

  // Rules card
  rulesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rulesTextWrap: { flex: 1, gap: 2 },
  rulesTitle: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  rulesSub: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },

  // Footer
  footer: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: spacing.pageMargin,
  },
  modalSheet: {
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  modalSub: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
  },
  codeInput: {
    height: sizes.buttonHeight,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.ivory,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.xl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
    letterSpacing: 4,
    textAlign: 'center',
  },
  rulesList: {
    gap: spacing.sm,
  },
  ruleBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.violet,
    marginTop: 7,
  },
  ruleBulletText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
