import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
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

// Route name -> URL. Navigation goes through expo-router, not the
// react-navigation `navigation` prop (which can be undefined in the custom bar).
const TAB_PATHS: Record<TabName, '/home' | '/games' | '/friends' | '/leaderboard' | '/profile'> = {
  home: '/home',
  games: '/games',
  friends: '/friends',
  leaderboard: '/leaderboard',
  profile: '/profile',
};

interface KhelTabBarProps {
  // Optional on purpose: the bar must still work if the navigator omits it.
  state?: { index: number; routes: { name: string }[] };
}

function KhelTabBar({ state }: KhelTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // 1) Prefer the navigator state when it is provided.
  const stateName = state?.routes?.[state.index]?.name;
  // 2) Otherwise fall back to the URL: "/games" -> "games".
  const pathName = pathname.split('/').filter(Boolean).pop();
  const activeName = stateName ?? pathName;

  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const focused = activeName === tab.name;

        const onPress = () => {
          if (!focused) {
            router.navigate(TAB_PATHS[tab.name]);
          }
        };

        return (
          <Pressable
            key={tab.name}
            style={styles.tabItem}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={22}
                color={focused ? colors.violet : colors.textMuted}
              />
            </View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {tab.label}
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
      tabBar={(props) => <KhelTabBar state={props?.state} />}
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

