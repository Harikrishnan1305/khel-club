import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, fontWeight, spacing } from '../../theme/theme';
import { Button } from '../../components/Button';

export default function ChessGameScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.title}>Chess</Text>
        <Text style={s.sub}>Board & rules coming in Phase 3</Text>
        <Button label="Back to lobby" variant="outline" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.pageMargin },
  title: { fontSize: fontSize.display, fontFamily: 'NunitoSans_800ExtraBold', fontWeight: fontWeight.extrabold, color: colors.ink },
  sub: { fontSize: fontSize.md, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
});

