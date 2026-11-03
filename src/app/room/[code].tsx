import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
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
import { Avatar } from '../../components/Avatar';
import { useUserStore } from '../../store/userStore';
import { DUMMY_GAMES_MAP, type GameId } from '../../data/dummy';

function isValidGameId(val: unknown): val is GameId {
  return val === 'carrom' || val === 'chess' || val === 'snakes' || val === 'ludo';
}

export default function PrivateRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    game?: string;
    host?: string;
  }>();

  const gameId: GameId = isValidGameId(params.game) ? params.game : 'carrom';
  const game = DUMMY_GAMES_MAP[gameId];
  const roomCode = (params.code ?? 'KHEL42').toUpperCase();

  const { name, photoUri } = useUserStore();
  const hostName = name ? `${name} · You` : 'Aanya · You';
  const hostInitials = (name || 'AA').slice(0, 2).toUpperCase();
  const hostPhoto = photoUri ? { uri: photoUri } : undefined;

  const [kabirJoined, setKabirJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [altCode, setAltCode] = useState('');
  const [altError, setAltError] = useState(false);

  // After 4 seconds, Kabir joins automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      setKabirJoined(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join my ${game.title} table on Khel Club! Room code: ${roomCode}`,
      });
    } catch {
      // ignore cancelled share
    }
  };

  const handleStartGame = () => {
    if (!kabirJoined) return;
    router.replace(`/game/${gameId}`);
  };

  const handleTryJoinAgain = () => {
    const clean = altCode.trim().toUpperCase();
    if (clean === 'KHEL42') {
      setAltError(false);
      router.replace({
        pathname: '/room/[code]',
        params: { code: 'KHEL42', game: gameId, host: '0' },
      });
    } else {
      setAltError(true);
    }
  };

  const playersReadyCount = kabirJoined ? 4 : 3;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            <Text style={s.headerTitle}>Your private table</Text>
            <Text style={s.headerSub}>{game.title} · Friends only</Text>
          </View>
          <TouchableOpacity style={s.iconBtn} hitSlop={8}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.ink}
            />
          </TouchableOpacity>
        </View>

        {/* ── Lavender Room Created card ── */}
        <View style={s.roomCard}>
          <View style={s.roomBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.violet} />
            <Text style={s.roomBadgeText}>ROOM CREATED</Text>
          </View>
          <Text style={s.roomTitle}>The evening club</Text>
          <Text style={s.roomBody}>
            Share the code with your friends to bring everyone to the same table.
          </Text>

          {/* White code box */}
          <View style={s.codeBox}>
            <View>
              <Text style={s.codeLabel}>ROOM CODE</Text>
              <Text style={s.codeValue}>{roomCode}</Text>
            </View>
            <TouchableOpacity
              style={s.copyBtn}
              onPress={handleCopyCode}
              hitSlop={8}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={18}
                color={colors.violet}
              />
              <Text style={s.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>

          <Button
            label="Share invite"
            variant="primary"
            onPress={handleShareInvite}
            leftIcon={
              <Ionicons
                name="share-social-outline"
                size={18}
                color={colors.paper}
              />
            }
          />
        </View>

        {/* ── Table settings card ── */}
        <View style={s.settingsCard}>
          <View style={s.settingsLeft}>
            <View style={s.settingsIcon}>
              <Ionicons name="options-outline" size={20} color={colors.violet} />
            </View>
            <View>
              <Text style={s.settingsLabel}>Table settings</Text>
              <Text style={s.settingsValue}>4 players · 2 vs 2</Text>
            </View>
          </View>
          <View style={s.casualChip}>
            <Text style={s.casualChipText}>Casual</Text>
          </View>
        </View>

        {/* ── Players section ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            Players · {playersReadyCount} of 4
          </Text>
          <TouchableOpacity onPress={handleShareInvite} hitSlop={8}>
            <Text style={s.sectionLink}>Invite friends</Text>
          </TouchableOpacity>
        </View>

        <View style={s.playersList}>
          {/* Player 1: Host */}
          <View style={s.playerRow}>
            <Avatar source={hostPhoto} initials={hostInitials} size="md" online />
            <View style={s.playerInfo}>
              <Text style={s.playerName}>{hostName}</Text>
              <Text style={s.playerMeta}>Host · Team A</Text>
            </View>
            <View style={s.checkCircle}>
              <Ionicons name="checkmark" size={16} color={colors.paper} />
            </View>
          </View>

          {/* Player 2: Meera */}
          <View style={s.playerRow}>
            <Avatar initials="ME" size="md" online />
            <View style={s.playerInfo}>
              <Text style={s.playerName}>Meera</Text>
              <Text style={s.playerMeta}>Ready · Team B</Text>
            </View>
            <View style={s.checkCircle}>
              <Ionicons name="checkmark" size={16} color={colors.paper} />
            </View>
          </View>

          {/* Player 3: Arjun */}
          <View style={s.playerRow}>
            <Avatar initials="AR" size="md" online />
            <View style={s.playerInfo}>
              <Text style={s.playerName}>Arjun</Text>
              <Text style={s.playerMeta}>Ready · Team A</Text>
            </View>
            <View style={s.checkCircle}>
              <Ionicons name="checkmark" size={16} color={colors.paper} />
            </View>
          </View>

          {/* Player 4: Kabir (dashed waiting or joined) */}
          {kabirJoined ? (
            <View style={s.playerRow}>
              <Avatar initials="KA" size="md" online />
              <View style={s.playerInfo}>
                <Text style={s.playerName}>Kabir</Text>
                <Text style={s.playerMeta}>Ready · Team B</Text>
              </View>
              <View style={s.checkCircle}>
                <Ionicons name="checkmark" size={16} color={colors.paper} />
              </View>
            </View>
          ) : (
            <View style={s.emptySlotRow}>
              <View style={s.emptyAvatar}>
                <Ionicons
                  name="hourglass-outline"
                  size={18}
                  color={colors.textMuted}
                />
              </View>
              <View style={s.playerInfo}>
                <Text style={s.emptySlotTitle}>
                  Waiting for Kabir · Team B
                </Text>
                <Text style={s.playerMeta}>Invite sent · Joining soon</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Start / Waiting button ── */}
        <View style={s.startSection}>
          <Button
            label={
              kabirJoined ? 'Start game' : 'Waiting for 1 more player'
            }
            variant="primary"
            disabled={!kabirJoined}
            onPress={handleStartGame}
          />
          <Text style={s.startHelper}>
            The host can start when all 4 players are ready.
          </Text>
        </View>

        {/* ── Have a different invite? card ── */}
        <View style={s.altCard}>
          <Text style={s.altTitle}>Have a different invite?</Text>
          <Text style={s.altSub}>
            Enter another 6-character room code to switch tables.
          </Text>
          <View style={s.altInputRow}>
            <TextInput
              style={[s.altInput, altError && s.altInputError]}
              placeholder="Enter 6-digit code"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              maxLength={6}
              value={altCode}
              onChangeText={(t) => {
                setAltCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                if (altError) setAltError(false);
              }}
            />
            <Button
              label="Try joining again"
              variant="soft"
              onPress={handleTryJoinAgain}
              style={s.altBtn}
            />
          </View>
          {altError && (
            <View style={s.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={colors.error}
              />
              <Text style={s.errorText}>
                Room not found. Check the code with your friend, then try again.
              </Text>
            </View>
          )}
        </View>

        {/* ── Leave room ── */}
        <TouchableOpacity
          style={s.leaveBtn}
          onPress={() => router.replace('/(tabs)/games')}
          hitSlop={10}
        >
          <Text style={s.leaveText}>Leave room</Text>
        </TouchableOpacity>
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

  // Room card
  roomCard: {
    backgroundColor: colors.lavender,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  roomBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
    letterSpacing: 1,
  },
  roomTitle: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  roomBody: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: -spacing.xs,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paper,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  codeLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.violet,
    letterSpacing: 4,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.lavender,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  copyText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Table settings
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
  settingsValue: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  casualChip: {
    backgroundColor: colors.saffronSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  casualChipText: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },

  // Players section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -spacing.xs,
  },
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
  playersList: {
    gap: spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerInfo: { flex: 1, gap: 2 },
  playerName: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  playerMeta: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.ivory,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  emptyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotTitle: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },

  // Start section
  startSection: {
    gap: spacing.xs,
  },
  startHelper: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Different invite card
  altCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  altTitle: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  altSub: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
  altInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  altInput: {
    flex: 1,
    height: sizes.buttonHeight,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.ivory,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
    letterSpacing: 2,
  },
  altInputError: {
    borderColor: colors.error,
  },
  altBtn: {
    paddingHorizontal: spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorSoft,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    color: colors.error,
  },

  // Leave button
  leaveBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  leaveText: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.error,
  },
});

