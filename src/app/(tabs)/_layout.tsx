import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing, sizes, radius } from '../../theme/theme';

type TabName = 'home' | 'games' | 'friends' | 'leaderboard' | 'profile';

interface TabConfig {
  name: TabName;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconActive: React.ComponentProps<typeof Ionicons>['name'];
}

const TABS: TabConfig[] = [
  { name: 'home',        label: 'Home',        icon: 'home-outline',            iconActive: 'home'           },
  { name: 'games',       label: 'Games',       icon: 'game-controller-outline', iconActive: 'game-controller'},
  { name: 'friends',     label: 'Friends',     icon: 'people-outline',          iconActive: 'people'         },
  { name: 'leaderboard', label: 'Leaderboard', icon: 'trophy-outline',          iconActive: 'trophy'         },
  { name: 'profile',     label: 'Profile',     icon: 'person-outline',          iconActive: 'person'         },
];

function KhelTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.bar}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS[index];
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = tab?.label ?? route.name;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} style={styles.tabItem} onPress={onPress} accessibilityRole="button">
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons
                name={focused ? (tab?.iconActive ?? tab?.icon) : (tab?.icon ?? 'ellipse-outline')}
                size={22}
                color={focused ? colors.violet : colors.textMuted}
              />
            </View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <KhelTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="games" />
      <Tabs.Screen name="friends" />
      <Tabs.Screen name="leaderboard" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: sizes.tabBarHeight,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: sizes.minTouch,
  },
  iconWrap: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  iconWrapActive: {
    backgroundColor: colors.lavender,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'NunitoSans_400Regular',
    color: colors.textMuted,
  },
  tabLabelActive: {
    fontFamily: 'NunitoSans_700Bold',
    fontWeight: fontWeight.bold,
    color: colors.violet,
  },
});

