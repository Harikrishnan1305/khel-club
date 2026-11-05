import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// ─── Avatar options ───────────────────────────────────────────────────────────
type AvatarOption = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'cat',    label: 'Cat',    icon: 'cat'    },
  { id: 'bird',   label: 'Bird',   icon: 'bird'   },
  { id: 'rabbit', label: 'Rabbit', icon: 'rabbit' },
  { id: 'turtle', label: 'turtle', icon: 'turtle' },
  { id: 'fish',   label: 'Fish',   icon: 'fish'   },
];

// ─── Username validation ──────────────────────────────────────────────────────
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function validateUsername(u: string): 'empty' | 'invalid' | 'valid' {
  if (!u) return 'empty';
  if (!USERNAME_RE.test(u)) return 'invalid';
  return 'valid';
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ProfileSetupScreen() {
  const router = useRouter();

  const [name, setName]           = useState('');
  const [username, setUsername]   = useState('');
  const [photoUri, setPhotoUri]   = useState<string | null>(null);
  const [avatarId, setAvatarId]   = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);

  const usernameStatus = validateUsername(username);
  const canSubmit = name.trim().length > 0 && usernameStatus === 'valid';

  // ── Pick photo ──
  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setAvatarId(null); // photo overrides avatar
    }
  };

  // ── Select avatar ──
  const handleSelectAvatar = (id: string) => {
    setAvatarId(id);
    setPhotoUri(null); // avatar overrides photo
  };

  // ── Submit ──
  const handleSubmit = () => {
    if (!canSubmit) return;
    setSaving(true);

    // Dynamically import store to avoid circular deps at module level
    import('../store/userStore').then(({ useUserStore }) => {
      const store = useUserStore.getState();
      store.completeOnboarding(name.trim(), username.trim(), photoUri, avatarId);
      setSaving(false);
      router.replace('/(tabs)/home');
    });
  };

  // ── Photo preview ──
  const initials = name.trim().slice(0, 2).toUpperCase() || '?';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Make it yours</Text>
              <Text style={styles.headerSub}>One last step before you play</Text>
            </View>
            <View style={styles.sparkleWrap}>
              <Ionicons name="sparkles-outline" size={22} color={colors.violet} />
            </View>
          </View>

          {/* ── Display title ── */}
          <Text style={styles.displayTitle}>Meet your game face.</Text>

          {/* ── Photo circle ── */}
          <View style={styles.photoSection}>
            <View style={styles.photoWrap}>
              {/* Circle */}
              <View style={styles.photoCircle}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoImage} />
                ) : avatarId ? (
                  <MaterialCommunityIcons
                    name={AVATAR_OPTIONS.find((a) => a.id === avatarId)?.icon ?? 'account'}
                    size={56}
                    color={colors.violet}
                  />
                ) : (
                  <Text style={styles.photoInitials}>{initials}</Text>
                )}
              </View>
              {/* Camera badge */}
              <TouchableOpacity style={styles.cameraBadge} onPress={handlePickPhoto}>
                <Ionicons name="camera" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handlePickPhoto} hitSlop={8}>
              <Text style={styles.uploadLink}>Upload photo</Text>
            </TouchableOpacity>
          </View>

          {/* ── Name input ── */}
          <Input
            label="Your name"
            placeholder="e.g. Arjun Ravi"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* ── Username input ── */}
          <View style={styles.usernameWrap}>
            <Text style={styles.inputLabel}>Club username</Text>
            <View
              style={[
                styles.usernameField,
                {
                  borderColor:
                    usernameStatus === 'invalid'
                      ? colors.error
                      : usernameStatus === 'valid' && username.length > 0
                      ? colors.success
                      : colors.border,
                },
              ]}
            >
              <Text style={styles.atSign}>@</Text>
              <View style={styles.atDivider} />
              <Input
                placeholder="your_username"
                value={username}
                onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                containerStyle={styles.usernameInputContainer}
              />
            </View>
            {/* Validation feedback */}
            {username.length > 0 && usernameStatus === 'valid' && (
              <Text style={styles.usernameValid}>✓ Available · 3–20 letters, numbers or underscores</Text>
            )}
            {username.length > 0 && usernameStatus === 'invalid' && (
              <Text style={styles.usernameError}>3–20 letters, numbers or underscores only</Text>
            )}
          </View>

          {/* ── Avatar picker ── */}
          <View style={styles.avatarSection}>
            <Text style={styles.avatarTitle}>Or choose a club avatar</Text>
            <View style={styles.avatarRow}>
              {AVATAR_OPTIONS.map((opt) => {
                const selected = avatarId === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.avatarTile, selected && styles.avatarTileSelected]}
                    onPress={() => handleSelectAvatar(opt.id)}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons name={opt.icon} size={28} color={colors.violet} />
                    <Text style={styles.avatarLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {/* Helper: only show when a photo is selected */}
            {photoUri && (
              <Text style={styles.avatarHelper}>
                Your uploaded photo is selected. Choose an avatar to replace it.
              </Text>
            )}
          </View>

          {/* ── Saffron welcome card ── */}
          <View style={styles.saffronCard}>
            <View style={styles.saffronIcon}>
              <Ionicons name="logo-bitcoin" size={20} color={colors.saffron} />
            </View>
            <View style={styles.saffronText}>
              <Text style={styles.saffronTitle}>A little welcome from us</Text>
              <Text style={styles.saffronBody}>
                500 club coins to celebrate your first game.
              </Text>
            </View>
          </View>

          {/* ── CTA ── */}
          <Button
            label="Let's play"
            variant="primary"
            disabled={!canSubmit}
            loading={saving}
            onPress={handleSubmit}
            leftIcon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={canSubmit ? colors.white : colors.textMuted}
              />
            }
            style={styles.cta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
  sparkleWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Display title
  displayTitle: {
    fontSize: fontSize.xxl,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.textPrimary,
    lineHeight: 36,
  },

  // Photo
  photoSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  photoWrap: {
    position: 'relative',
  },
  photoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  photoInitials: {
    fontSize: fontSize.display,
    fontFamily: 'NunitoSans_800ExtraBold',
    fontWeight: fontWeight.extrabold,
    color: colors.violet,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  uploadLink: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },

  // Username
  usernameWrap: { gap: spacing.xs },
  inputLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  usernameField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    paddingLeft: spacing.md,
    overflow: 'hidden',
  },
  atSign: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  atDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  usernameInputContainer: {
    flex: 1,
    gap: 0,
  },
  usernameValid: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.success,
  },
  usernameError: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.error,
  },

  // Avatars
  avatarSection: { gap: spacing.sm },
  avatarTitle: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  avatarTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  avatarTileSelected: {
    borderColor: colors.violet,
    backgroundColor: colors.lavender,
  },
  avatarLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_600SemiBold',
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  avatarHelper: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    lineHeight: 18,
  },

  // Saffron card
  saffronCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.saffronSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.saffron,
  },
  saffronIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  saffronText: { flex: 1, gap: 2 },
  saffronTitle: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  saffronBody: {
    fontSize: fontSize.sm,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textSecondary,
  },

  // CTA
  cta: {},
});
