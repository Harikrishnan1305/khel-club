import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight } from '../../theme/theme';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.center}>
        <Text style={s.title}>Profile</Text>
        <Text style={s.sub}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: fontSize.xxl, fontFamily: 'NunitoSans_800ExtraBold', fontWeight: fontWeight.extrabold, color: colors.ink },
  sub: { fontSize: fontSize.md, fontFamily: 'NunitoSans_400Regular', color: colors.textMuted },
});

