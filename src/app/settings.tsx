import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius, sizes } from '../theme/theme';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import { DUMMY_LANGUAGES } from '../data/dummy';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface ToggleRowProps {
  icon: IconName;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ icon, title, subtitle, value, onChange }: ToggleRowProps) {
  return (
    <View style={s.toggleRow}>
      <Ionicons name={icon} size={22} color={colors.violet} />
      <View style={s.rowText}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.violet }}
        thumbColor={colors.paper}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

interface LinkRowProps {
  icon: IconName;
  title: string;
  subtitle: string;
}

function LinkRow({ icon, title, subtitle }: LinkRowProps) {
  return (
    <TouchableOpacity style={s.toggleRow} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color={colors.violet} />
      <View style={s.rowText}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    sounds,
    music,
    notifications,
    language,
    setSounds,
    setMusic,
    setNotifications,
    setLanguage,
  } = useSettingsStore();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  const handleLogout = () => {
    useUserStore.getState().reset();
    router.replace('/welcome');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
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
            <Text style={s.headerTitle}>Club settings</Text>
            <Text style={s.headerSub}>Make yourself at home</Text>
          </View>
        </View>

        {/* ── The way you play ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>The way you play</Text>
          <ToggleRow
            icon="volume-medium-outline"
            title="Game sounds"
            subtitle="Dice, moves and little celebrations"
            value={sounds}
            onChange={setSounds}
          />
          <ToggleRow
            icon="musical-note-outline"
            title="Background music"
            subtitle="Keep the table quiet"
            value={music}
            onChange={setMusic}
          />
          <ToggleRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Invites, friends and club updates"
            value={notifications}
            onChange={setNotifications}
          />
        </View>

        {/* ── App language ── */}
        <View style={s.card}>
          <View style={s.langTitleRow}>
            <Ionicons name="language-outline" size={22} color={colors.violet} />
            <Text style={s.cardTitle}>App language</Text>
          </View>
          <Text style={s.langSub}>Choose the language you feel at home in.</Text>
          <View style={s.langList}>
            {DUMMY_LANGUAGES.map((l) => {
              const selected = language === l.id;
              return (
                <TouchableOpacity
                  key={l.id}
                  style={[s.langRow, selected && s.langRowSelected]}
                  onPress={() => setLanguage(l.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.langLabel, selected && s.langLabelSelected]}>{l.label}</Text>
                  <View style={[s.radio, selected && s.radioSelected]}>
                    {selected && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Here for you ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Here for you</Text>
          <LinkRow
            icon="shield-checkmark-outline"
            title="Privacy & safety"
            subtitle="Control your visibility and friend requests"
          />
          <LinkRow
            icon="help-circle-outline"
            title="Help & support"
            subtitle="Rules, account help and contact us"
          />
          <LinkRow
            icon="document-text-outline"
            title="Terms & Privacy Policy"
            subtitle="The important small print"
          />
        </View>

        {/* ── Log out ── */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.violet} />
          <Text style={s.logoutText}>Log out</Text>
        </TouchableOpacity>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerVersion}>Khel Club · Version 1.0.0</Text>
          <Text style={s.footerTag}>Made for good company. Played with heart.</Text>
        </View>
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
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },
  headerSub: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },

  // Cards
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.ink,
  },

  // Rows
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: sizes.minTouch },
  rowText: { flex: 1, gap: 2 },
  rowTitle: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.ink,
  },
  rowSub: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },

  // Language
  langTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  langSub: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  langList: { gap: spacing.sm },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.ivory,
  },
  langRowSelected: { backgroundColor: colors.lavender },
  langLabel: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.ink,
  },
  langLabelSelected: {
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.violet },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.violet },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: sizes.buttonHeight,
    borderRadius: radius.button,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Footer
  footer: { alignItems: 'center', gap: 4 },
  footerVersion: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
  },
  footerTag: { fontSize: fontSize.xs, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
});

