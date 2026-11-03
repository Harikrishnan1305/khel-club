import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../theme/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { OtpInput } from '../components/OtpInput';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { GameCard } from '../components/GameCard';
import { Avatar } from '../components/Avatar';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ children, gap = spacing.sm }: { children: React.ReactNode; gap?: number }) {
  return <View style={[styles.row, { gap }]}>{children}</View>;
}

export default function Showcase() {
  const [otp, setOtp] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [errorVal, setErrorVal] = useState('bad@input');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.appName}>Khel Club</Text>
        <Text style={styles.headerSub}>Component Showcase</Text>
      </View>

      <Section title="Button">
        <Button
          label="Play Now"
          variant="primary"
          leftIcon={<Ionicons name="game-controller" size={18} color={colors.white} />}
        />
        <Button label="Join Club" variant="soft" />
        <Button
          label="View Profile"
          variant="outline"
          leftIcon={<Ionicons name="person-outline" size={16} color={colors.violet} />}
        />
        <Button label="Dark Action" variant="dark" />
        <Button label="Disabled" variant="disabled" disabled />
        <Button label="Loading…" variant="primary" loading />
      </Section>

      <Section title="Input">
        <Input
          label="Phone number"
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
          value={inputVal}
          onChangeText={setInputVal}
          helper="We'll send an OTP to this number"
        />
        <Input label="Focused state" placeholder="Tap here…" autoFocus={false} />
        <Input
          label="Error state"
          placeholder="Enter value"
          value={errorVal}
          onChangeText={setErrorVal}
          error="This field has an error"
        />
      </Section>

      <Section title="OTP Input">
        <OtpInput value={otp} onChange={setOtp} />
        {otp.length > 0 && (
          <Text style={styles.otpPreview}>Entered: {otp}</Text>
        )}
      </Section>

      <Section title="Chip">
        <Row>
          <Chip variant="online" />
          <Chip variant="yourTurn" />
          <Chip variant="waiting" />
          <Chip variant="notConnected" />
        </Row>
      </Section>

      <Section title="Avatar">
        <Row gap={spacing.md}>
          <Avatar size="sm" initials="AK" />
          <Avatar size="md" initials="RK" online />
          <Avatar size="lg" initials="MV" online />
        </Row>
      </Section>

      <Section title="Card">
        <Card>
          <Text style={styles.cardText}>Paper background, radius 20, soft shadow.</Text>
          <View style={{ marginTop: spacing.md }}>
            <Chip variant="online" />
          </View>
        </Card>
      </Section>

      <Section title="GameCard">
        <GameCard title="Carrom" subtitle="2–4 players" playingCount={1240} onPlay={() => {}} />
        <GameCard title="Chess" subtitle="2 players • Rapid" playingCount={843} onPlay={() => {}} />
        <GameCard title="Snakes & Ladders" subtitle="2–4 players" playingCount={519} onPlay={() => {}} />
        <GameCard title="Ludo" subtitle="2–4 players" playingCount={2310} onPlay={() => {}} />
      </Section>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: spacing.md, paddingTop: spacing.xxl },
  header: { marginBottom: spacing.xl, alignItems: 'center' },
  appName: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.extrabold,
    fontFamily: 'NunitoSans_800ExtraBold',
    color: colors.violet,
  },
  headerSub: {
    fontSize: fontSize.md,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  section: { marginBottom: spacing.xl, gap: spacing.sm },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    fontFamily: 'NunitoSans_700Bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.violet,
    paddingLeft: spacing.sm,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  otpPreview: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: 'NunitoSans_400Regular',
    fontSize: fontSize.sm,
  },
  cardText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});

